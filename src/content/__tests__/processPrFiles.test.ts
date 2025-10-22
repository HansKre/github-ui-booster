import { processPrFiles } from "../processPrFiles";
import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../../services";

describe("processPrFiles", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches single page of files", async () => {
    const mockFiles = [
      { filename: "file1.ts", additions: 10, deletions: 5 },
      { filename: "file2.ts", additions: 20, deletions: 10 },
    ];

    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockResolvedValue({ data: mockFiles }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 123, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith({
      owner: "test-org",
      repo: "test-repo",
      pull_number: 123,
      per_page: 100,
      page: 1,
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockFiles);
  });

  test("fetches multiple pages of files", async () => {
    const page1Files = Array.from({ length: 100 }, (_, i) => ({
      filename: `file${i}.ts`,
      additions: 10,
      deletions: 5,
    }));

    const page2Files = Array.from({ length: 50 }, (_, i) => ({
      filename: `file${i + 100}.ts`,
      additions: 10,
      deletions: 5,
    }));

    const mockOctokit = {
      pulls: {
        listFiles: jest
          .fn()
          .mockResolvedValueOnce({ data: page1Files })
          .mockResolvedValueOnce({ data: page2Files }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 456, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledTimes(2);
    expect(mockOctokit.pulls.listFiles).toHaveBeenNthCalledWith(1, {
      owner: "test-org",
      repo: "test-repo",
      pull_number: 456,
      per_page: 100,
      page: 1,
    });
    expect(mockOctokit.pulls.listFiles).toHaveBeenNthCalledWith(2, {
      owner: "test-org",
      repo: "test-repo",
      pull_number: 456,
      per_page: 100,
      page: 2,
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, page1Files);
    expect(callback).toHaveBeenNthCalledWith(2, page2Files);
  });

  test("stops fetching when page has fewer than 100 files", async () => {
    const mockFiles = Array.from({ length: 50 }, (_, i) => ({
      filename: `file${i}.ts`,
      additions: 10,
      deletions: 5,
    }));

    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockResolvedValue({ data: mockFiles }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 789, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("handles empty response", async () => {
    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 999, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([]);
  });

  test("handles API errors gracefully", async () => {
    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockRejectedValue(new Error("API error")),
      },
    } as unknown as Octokit;

    const callback = jest.fn();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await processPrFiles(mockOctokit, mockInstanceConfig, 111, callback);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching pull request files:",
      expect.any(Error),
    );
    expect(callback).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("fetches exactly 100 files per page", async () => {
    const page1Files = Array.from({ length: 100 }, (_, i) => ({
      filename: `file${i}.ts`,
    }));
    const page2Files = Array.from({ length: 100 }, (_, i) => ({
      filename: `file${i + 100}.ts`,
    }));
    const page3Files = Array.from({ length: 10 }, (_, i) => ({
      filename: `file${i + 200}.ts`,
    }));

    const mockOctokit = {
      pulls: {
        listFiles: jest
          .fn()
          .mockResolvedValueOnce({ data: page1Files })
          .mockResolvedValueOnce({ data: page2Files })
          .mockResolvedValueOnce({ data: page3Files }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 222, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("uses correct owner and repo from instance config", async () => {
    const customConfig: InstanceConfig = {
      ...mockInstanceConfig,
      org: "custom-org",
      repo: "custom-repo",
    };

    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, customConfig, 333, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith({
      owner: "custom-org",
      repo: "custom-repo",
      pull_number: 333,
      per_page: 100,
      page: 1,
    });
  });

  test("handles different PR numbers", async () => {
    const mockOctokit = {
      pulls: {
        listFiles: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    const callback = jest.fn();

    await processPrFiles(mockOctokit, mockInstanceConfig, 1, callback);
    await processPrFiles(mockOctokit, mockInstanceConfig, 9999, callback);

    expect(mockOctokit.pulls.listFiles).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ pull_number: 1 }),
    );
    expect(mockOctokit.pulls.listFiles).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ pull_number: 9999 }),
    );
  });
});
