import { addChangedFiles } from "../addChangedFiles";
import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../../services";
import * as processPrFilesModule from "../processPrFiles";
import * as injectFilesModule from "../injectPrFiles";
import * as injectPrFilesSearchModule from "../injectPrFilesSearch";

// Mock dependencies
jest.mock("../processPrFiles");
jest.mock("../injectPrFiles");
jest.mock("../injectPrFilesSearch");

describe("addChangedFiles", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  const mockPrs = [
    {
      number: 123,
      title: "Test PR 1",
      html_url: "https://github.com/test-org/test-repo/pull/123",
      base: { ref: "main" },
      head: { ref: "feature-branch-1" },
    },
    {
      number: 456,
      title: "Test PR 2",
      html_url: "https://github.com/test-org/test-repo/pull/456",
      base: { ref: "develop" },
      head: { ref: "feature-branch-2" },
    },
  ];

  const mockFiles = [
    {
      sha: "abc123",
      filename: "file1.ts",
      additions: 10,
      deletions: 5,
      changes: 15,
      status: "modified" as const,
      patch: "patch content",
      blob_url: "https://example.com/blob",
      raw_url: "https://example.com/raw",
      contents_url: "https://example.com/contents",
    },
    {
      sha: "def456",
      filename: "file2.ts",
      additions: 20,
      deletions: 10,
      changes: 30,
      status: "added" as const,
      patch: "patch content",
      blob_url: "https://example.com/blob",
      raw_url: "https://example.com/raw",
      contents_url: "https://example.com/contents",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches PRs and processes files for each PR", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    const processPrFilesMock = jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles);
        return Promise.resolve();
      });

    const injectFilesMock = jest.spyOn(injectFilesModule, "injectFiles");
    const injectPrFilesSearchMock = jest.spyOn(
      injectPrFilesSearchModule,
      "injectPrFilesSearch",
    );

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(mockOctokit.pulls.list).toHaveBeenCalledWith({
      owner: "test-org",
      repo: "test-repo",
      state: "open",
      per_page: 100,
      page: 1,
    });

    expect(processPrFilesMock).toHaveBeenCalledTimes(2);
    expect(processPrFilesMock).toHaveBeenNthCalledWith(
      1,
      mockOctokit,
      mockInstanceConfig,
      123,
      expect.any(Function),
    );
    expect(processPrFilesMock).toHaveBeenNthCalledWith(
      2,
      mockOctokit,
      mockInstanceConfig,
      456,
      expect.any(Function),
    );

    expect(injectPrFilesSearchMock).toHaveBeenCalledTimes(1);
    expect(injectFilesMock).toHaveBeenCalledTimes(1);
  });

  test("builds prFilesMap correctly", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    const mockFiles1 = [
      {
        sha: "abc123",
        filename: "file1.ts",
        additions: 10,
        deletions: 5,
        changes: 15,
        status: "modified" as const,
        blob_url: "https://example.com/blob",
        raw_url: "https://example.com/raw",
        contents_url: "https://example.com/contents",
      },
    ];

    const mockFiles2 = [
      {
        sha: "def456",
        filename: "file2.ts",
        additions: 20,
        deletions: 10,
        changes: 30,
        status: "modified" as const,
        blob_url: "https://example.com/blob",
        raw_url: "https://example.com/raw",
        contents_url: "https://example.com/contents",
      },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, prNumber, callback) => {
        if (prNumber === 123) {
          callback(mockFiles1 as any);
        } else if (prNumber === 456) {
          callback(mockFiles2 as any);
        }
        return Promise.resolve();
      });

    const injectFilesMock = jest.spyOn(injectFilesModule, "injectFiles");
    const injectPrFilesSearchMock = jest.spyOn(
      injectPrFilesSearchModule,
      "injectPrFilesSearch",
    );

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    const prFilesMapArg = injectFilesMock.mock.calls[0][0];
    expect(prFilesMapArg.get(123)).toEqual(mockFiles1);
    expect(prFilesMapArg.get(456)).toEqual(mockFiles2);

    const searchPrFilesMapArg = injectPrFilesSearchMock.mock.calls[0][1];
    expect(searchPrFilesMapArg.get(123)).toEqual(mockFiles1);
    expect(searchPrFilesMapArg.get(456)).toEqual(mockFiles2);
  });

  test("injects files search with PRs and files map", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });

    const injectPrFilesSearchMock = jest.spyOn(
      injectPrFilesSearchModule,
      "injectPrFilesSearch",
    );

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(injectPrFilesSearchMock).toHaveBeenCalledWith(
      mockPrs,
      expect.any(Map),
    );

    const prsArg = injectPrFilesSearchMock.mock.calls[0][0];
    expect(prsArg).toEqual(mockPrs);
  });

  test("handles empty PRs list", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    const processPrFilesMock = jest.spyOn(
      processPrFilesModule,
      "processPrFiles",
    );
    const injectFilesMock = jest.spyOn(injectFilesModule, "injectFiles");
    const injectPrFilesSearchMock = jest.spyOn(
      injectPrFilesSearchModule,
      "injectPrFilesSearch",
    );

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(processPrFilesMock).not.toHaveBeenCalled();
    expect(injectPrFilesSearchMock).toHaveBeenCalledWith([], expect.any(Map));
    expect(injectFilesMock).toHaveBeenCalledWith(expect.any(Map));
  });

  test("handles API error when fetching PRs", async () => {
    const mockError = new Error("API Error");
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockRejectedValue(mockError),
      },
    } as unknown as Octokit;

    await expect(
      addChangedFiles(mockOctokit, mockInstanceConfig),
    ).rejects.toThrow("API Error");
  });

  test("processes PRs sequentially", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    const processingOrder: number[] = [];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, prNumber, callback) => {
        processingOrder.push(prNumber);
        callback(mockFiles as any);
        return Promise.resolve();
      });

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(processingOrder).toEqual([123, 456]);
  });

  test("uses custom instance config", async () => {
    const customConfig: InstanceConfig = {
      ghBaseUrl: "https://github.enterprise.com/api/v3",
      org: "custom-org",
      repo: "custom-repo",
      pat: "ghp_customtoken123456789012345678901234567890",
      randomReviewers: "",
    };

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    await addChangedFiles(mockOctokit, customConfig);

    expect(mockOctokit.pulls.list).toHaveBeenCalledWith({
      owner: "custom-org",
      repo: "custom-repo",
      state: "open",
      per_page: 100,
      page: 1,
    });
  });

  test("calls injectFiles with all collected files", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });

    const injectFilesMock = jest.spyOn(injectFilesModule, "injectFiles");

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(injectFilesMock).toHaveBeenCalledTimes(1);
    const filesMapArg = injectFilesMock.mock.calls[0][0];
    expect(filesMapArg.size).toBe(2);
  });

  test("handles single PR", async () => {
    const singlePr = [mockPrs[0]];

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: singlePr }),
      },
    } as unknown as Octokit;

    const processPrFilesMock = jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(processPrFilesMock).toHaveBeenCalledTimes(1);
    expect(processPrFilesMock).toHaveBeenCalledWith(
      mockOctokit,
      mockInstanceConfig,
      123,
      expect.any(Function),
    );
  });

  test("handles large number of PRs", async () => {
    const manyPrs = Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      title: `Test PR ${i + 1}`,
      html_url: `https://github.com/test-org/test-repo/pull/${i + 1}`,
      base: { ref: "main" },
      head: { ref: `feature-branch-${i + 1}` },
    }));

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: manyPrs }),
      },
    } as unknown as Octokit;

    const processPrFilesMock = jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    expect(processPrFilesMock).toHaveBeenCalledTimes(10);
  });

  test("creates new Map for prFilesMap", async () => {
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation((_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });

    const injectFilesMock = jest.spyOn(injectFilesModule, "injectFiles");

    await addChangedFiles(mockOctokit, mockInstanceConfig);

    const filesMapArg = injectFilesMock.mock.calls[0][0];
    expect(filesMapArg).toBeInstanceOf(Map);
  });
});
