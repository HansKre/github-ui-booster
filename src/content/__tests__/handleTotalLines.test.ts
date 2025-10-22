import { handleTotalLines } from "../handleTotalLines";
import { Octokit } from "@octokit/rest";
import { InstanceConfig, Settings } from "../../services";
import * as isOnPrPageModule from "../utils/isOnPrPage";
import * as getPrFromLocationModule from "../getPrFromLocation";
import * as processPrFilesModule from "../processPrFiles";
import * as getFileBlacklistModule from "../../getFileBlacklist";

// Mock dependencies
jest.mock("../utils/isOnPrPage");
jest.mock("../getPrFromLocation");
jest.mock("../processPrFiles");
jest.mock("../../getFileBlacklist");

describe("handleTotalLines", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  const mockSettings: Settings = {
    instances: [mockInstanceConfig],
    features: {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      autoFilter: false,
      prTitleFromJira: false,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    },
    fileBlacklist: "package-lock.json",
  };

  const mockFiles = [
    { filename: "file1.ts", additions: 10, deletions: 5 },
    { filename: "file2.ts", additions: 20, deletions: 10 },
    { filename: "package-lock.json", additions: 1000, deletions: 500 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    jest.spyOn(isOnPrPageModule, "isOnPrPage").mockReturnValue(true);
    jest
      .spyOn(getPrFromLocationModule, "getPrFromLocation")
      .mockReturnValue(123);
    jest
      .spyOn(getFileBlacklistModule, "getFileBlacklist")
      .mockReturnValue(["package-lock.json"]);
    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(mockFiles as any);
        return Promise.resolve();
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns early if not on PR page", async () => {
    jest.spyOn(isOnPrPageModule, "isOnPrPage").mockReturnValue(false);

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(getPrFromLocationModule.getPrFromLocation).not.toHaveBeenCalled();
  });

  test("returns early if PR number not found", async () => {
    jest
      .spyOn(getPrFromLocationModule, "getPrFromLocation")
      .mockReturnValue(undefined);

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).not.toHaveBeenCalled();
  });

  test("fetches PR files and updates UI", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalledWith(
      mockOctokit,
      mockInstanceConfig,
      123,
      expect.any(Function),
    );
  });

  test("excludes blacklisted files from totals", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(getFileBlacklistModule.getFileBlacklist).toHaveBeenCalledWith(
      mockSettings,
    );

    // Check that UI was updated
    const addedElement = document.querySelector(
      "#diffstat > span.color-fg-success",
    );
    expect(addedElement).toBeTruthy();
  });

  test("removes diffstat blocks from DOM", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const diffStatBlocks = document.querySelector(
      "#diffstat > span > span[class^=diffstat-block]",
    );
    expect(diffStatBlocks).toBeNull();
  });

  test("clones and updates added lines element", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    expect(addedElements.length).toBe(2); // Original + Clone
  });

  test("clones and updates removed lines element", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    expect(removedElements.length).toBe(2); // Original + Clone
  });

  test("sets correct text content for added lines", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+999</span>
        <span class="color-fg-danger">-999</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const newAddedElement = addedElements[0] as HTMLElement;
    expect(newAddedElement.textContent).toBe("+ 30"); // 10 + 20, excluding package-lock.json
  });

  test("sets correct text content for removed lines", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+999</span>
        <span class="color-fg-danger">-999</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    const newRemovedElement = removedElements[0] as HTMLElement;
    expect(newRemovedElement.textContent).toBe("- 15"); // 5 + 10, excluding package-lock.json
  });

  test("reduces font size of original elements", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const originalAdded = addedElements[1] as HTMLElement;
    expect(originalAdded.style.fontSize).toBe("8px");
    expect(originalAdded.style.verticalAlign).toBe("sub");

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    const originalRemoved = removedElements[1] as HTMLElement;
    expect(originalRemoved.style.fontSize).toBe("8px");
    expect(originalRemoved.style.verticalAlign).toBe("sub");
  });

  test("returns early if diffStats element not found", async () => {
    document.body.innerHTML = `<div id="diffstat"></div>`;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    // Should process files but not update UI
    expect(processPrFilesModule.processPrFiles).toHaveBeenCalled();
  });

  test("returns early if linesAddedEl not found", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalled();
  });

  test("returns early if linesRemovedEl not found", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalled();
  });

  test("handles zero additions", async () => {
    const filesWithZeroAdditions = [
      { filename: "file1.ts", additions: 0, deletions: 10 },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(filesWithZeroAdditions as any);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const newAddedElement = addedElements[0] as HTMLElement;
    expect(newAddedElement.textContent).toBe("+ 0");
  });

  test("handles zero deletions", async () => {
    const filesWithZeroDeletions = [
      { filename: "file1.ts", additions: 10, deletions: 0 },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(filesWithZeroDeletions as any);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    const newRemovedElement = removedElements[0] as HTMLElement;
    expect(newRemovedElement.textContent).toBe("- 0");
  });

  test("accumulates totals correctly from multiple files", async () => {
    const multipleFiles = [
      { filename: "file1.ts", additions: 15, deletions: 7 },
      { filename: "file2.ts", additions: 25, deletions: 13 },
      { filename: "file3.ts", additions: 5, deletions: 3 },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(multipleFiles as any);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const newAddedElement = addedElements[0] as HTMLElement;
    expect(newAddedElement.textContent).toBe("+ 45"); // 15 + 25 + 5

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    const newRemovedElement = removedElements[0] as HTMLElement;
    expect(newRemovedElement.textContent).toBe("- 23"); // 7 + 13 + 3
  });

  test("handles empty files array", async () => {
    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback([]);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const newAddedElement = addedElements[0] as HTMLElement;
    expect(newAddedElement.textContent).toBe("+ 0");

    const removedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-danger",
    );
    const newRemovedElement = removedElements[0] as HTMLElement;
    expect(newRemovedElement.textContent).toBe("- 0");
  });

  test("handles files with filename containing blacklist string", async () => {
    const filesWithBlacklist = [
      {
        filename: "src/package-lock.json.backup",
        additions: 100,
        deletions: 50,
      },
      { filename: "file.ts", additions: 10, deletions: 5 },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(filesWithBlacklist as any);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const addedElements = document.querySelectorAll(
      "#diffstat > span.color-fg-success",
    );
    const newAddedElement = addedElements[0] as HTMLElement;
    expect(newAddedElement.textContent).toBe("+ 10");
  });

  test("handles null elements in reduceFont", async () => {
    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    // Should not throw even if elements are null
    await handleTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalled();
  });

  test("uses correct instance config", async () => {
    const customConfig: InstanceConfig = {
      ghBaseUrl: "https://github.enterprise.com/api/v3",
      org: "custom-org",
      repo: "custom-repo",
      pat: "ghp_customtoken123456789012345678901234567890",
      randomReviewers: "",
    };

    document.body.innerHTML = `
      <div id="diffstat">
        <span>
          <span class="diffstat-block-added"></span>
        </span>
        <span class="color-fg-success">+100</span>
        <span class="color-fg-danger">-50</span>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await handleTotalLines(mockOctokit, customConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalledWith(
      mockOctokit,
      customConfig,
      123,
      expect.any(Function),
    );
  });
});
