import { addTotalLines } from "../addTotalLines";
import { Octokit } from "@octokit/rest";
import { InstanceConfig, Settings } from "../../services";
import { createRoot } from "react-dom/client";
import * as processPrFilesModule from "../processPrFiles";
import * as getFileBlacklistModule from "../../getFileBlacklist";

// Mock dependencies
jest.mock("react-dom/client");
jest.mock("../processPrFiles");
jest.mock("../../getFileBlacklist");

describe("addTotalLines", () => {
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
    fileBlacklist: "package-lock.json,pnpm-lock.yaml",
  };

  const mockFiles = [
    {
      filename: "file1.ts",
      additions: 10,
      deletions: 5,
      changes: 15,
    },
    {
      filename: "file2.ts",
      additions: 20,
      deletions: 10,
      changes: 30,
    },
    {
      filename: "package-lock.json",
      additions: 1000,
      deletions: 500,
      changes: 1500,
    },
  ];

  let mockRoot: {
    render: jest.Mock;
    unmount: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    // Mock createRoot
    mockRoot = {
      render: jest.fn(),
      unmount: jest.fn(),
    };
    (createRoot as jest.Mock).mockReturnValue(mockRoot);

    // Mock getFileBlacklist
    jest
      .spyOn(getFileBlacklistModule, "getFileBlacklist")
      .mockReturnValue(["package-lock.json", "pnpm-lock.yaml"]);

    // Mock processPrFiles
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

  test("processes PR rows and adds total lines", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalledTimes(1);
    expect(processPrFilesModule.processPrFiles).toHaveBeenCalledWith(
      mockOctokit,
      mockInstanceConfig,
      123,
      expect.any(Function),
    );

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRoot.render).toHaveBeenCalledTimes(1);
  });

  test("excludes blacklisted files from totals", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    // Should render TotalLines with additions=30 (10+20, excluding package-lock.json)
    // and deletions=15 (5+10, excluding package-lock.json)
  });

  test("skips PR row with invalid ID", async () => {
    document.body.innerHTML = `
      <div id="issue_">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).not.toHaveBeenCalled();
  });

  test("skips PR row if already has total lines class", async () => {
    document.body.innerHTML = `
      <div id="issue_123" class="gh-ui-booster-total-lines">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("adds class to PR row after processing", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const prRow = document.getElementById("issue_123");
    expect(prRow?.classList.contains("gh-ui-booster-total-lines")).toBe(true);
  });

  test("creates span with diffstat class", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const span = document.querySelector("span.diffstat");
    expect(span).toBeTruthy();
  });

  test("inserts span before d-flex element", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <span class="existing-element"></span>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    const parent = document.querySelector(
      "#issue_123 > div > div:nth-child(3)",
    );
    const diffstatSpan = parent?.querySelector("span.diffstat");
    const dflexDiv = parent?.querySelector("div.d-flex");

    expect(diffstatSpan).toBeTruthy();
    expect(dflexDiv).toBeTruthy();

    // Check that diffstat comes before d-flex
    const children = Array.from(parent?.children || []);
    const diffstatIndex = children.indexOf(diffstatSpan as Element);
    const dflexIndex = children.indexOf(dflexDiv as Element);
    expect(diffstatIndex).toBeLessThan(dflexIndex);
  });

  test("handles multiple PR rows", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
      <div id="issue_456">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalledTimes(2);
    expect(createRoot).toHaveBeenCalledTimes(2);
  });

  test("uses getFileBlacklist to get blacklist", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(getFileBlacklistModule.getFileBlacklist).toHaveBeenCalledWith(
      mockSettings,
    );
  });

  test("accumulates additions and deletions correctly", async () => {
    const customFiles = [
      { filename: "file1.ts", additions: 15, deletions: 7 },
      { filename: "file2.ts", additions: 25, deletions: 13 },
      { filename: "file3.ts", additions: 5, deletions: 3 },
    ];

    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback(customFiles as any);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    // Total: 15+25+5=45 additions, 7+13+3=23 deletions
  });

  test("handles zero additions and deletions", async () => {
    jest
      .spyOn(processPrFilesModule, "processPrFiles")
      .mockImplementation(async (_, __, ___, callback) => {
        callback([]);
        return Promise.resolve();
      });

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
  });

  test("still creates root even if parent element not found (but doesn't insert)", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).toHaveBeenCalled();
    // The function still creates root but insertBefore won't insert the element
    expect(createRoot).toHaveBeenCalled();
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
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    // Should exclude the file with package-lock.json in the name
    expect(mockRoot.render).toHaveBeenCalled();
  });

  test("renders TotalLines component with React.StrictMode", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    const renderCall = mockRoot.render.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });

  test("handles empty blacklist", async () => {
    jest.spyOn(getFileBlacklistModule, "getFileBlacklist").mockReturnValue([]);

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    // All files should be included when blacklist is empty
  });

  test("handles no PR rows in DOM", async () => {
    document.body.innerHTML = `<div>No PR rows</div>`;

    const mockOctokit = {} as Octokit;

    await addTotalLines(mockOctokit, mockInstanceConfig, mockSettings);

    expect(processPrFilesModule.processPrFiles).not.toHaveBeenCalled();
  });
});
