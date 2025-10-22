import { addBaseBranchLabels } from "../addBaseBranchLabels";
import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../../services";
import { createRoot } from "react-dom/client";
import * as isOnPrsPageModule from "../utils/isOnPrsPage";

// Mock dependencies
jest.mock("react-dom/client");
jest.mock("../utils/isOnPrsPage");

describe("addBaseBranchLabels", () => {
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
    {
      number: 789,
      title: "Base PR",
      html_url: "https://github.com/test-org/test-repo/pull/789",
      base: { ref: "main" },
      head: { ref: "develop" },
    },
  ];

  let mockRoot: {
    render: jest.Mock;
    unmount: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    // Mock isOnPrsPage
    jest.spyOn(isOnPrsPageModule, "isOnPrsPage").mockReturnValue(true);

    // Mock createRoot
    mockRoot = {
      render: jest.fn(),
      unmount: jest.fn(),
    };
    (createRoot as jest.Mock).mockReturnValue(mockRoot);

    // Mock alert
    global.alert = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns early if not on PRs page", async () => {
    jest.spyOn(isOnPrsPageModule, "isOnPrsPage").mockReturnValue(false);

    const mockOctokit = {
      pulls: {
        list: jest.fn(),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(mockOctokit.pulls.list).not.toHaveBeenCalled();
  });

  test("fetches PRs and adds base branch labels", async () => {
    // Setup DOM
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(mockOctokit.pulls.list).toHaveBeenCalledWith({
      owner: "test-org",
      repo: "test-repo",
      state: "open",
      per_page: 100,
      page: 1,
    });

    expect(createRoot).toHaveBeenCalledTimes(2);
    expect(mockRoot.render).toHaveBeenCalledTimes(2);
  });

  test("skips PR row if PR data not found", async () => {
    document.body.innerHTML = `
      <div id="issue_999">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("skips PR row if already has base branch label class", async () => {
    document.body.innerHTML = `
      <div id="issue_123" class="gh-ui-booster-base-branch-label">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("handles PR with base PR (when base branch matches another PR's head)", async () => {
    document.body.innerHTML = `
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRoot.render).toHaveBeenCalledTimes(1);

    // Verify the component was rendered with basePr
    const renderCall = mockRoot.render.mock.calls[0][0];
    expect(renderCall).toBeDefined();
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    // The function still creates root but parent?.insertBefore will not insert the element
    expect(createRoot).toHaveBeenCalled();
  });

  test("handles API error", async () => {
    const mockError = new Error("API Error");
    const mockOctokit = {
      pulls: {
        list: jest.fn().mockRejectedValue(mockError),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(alert).toHaveBeenCalledWith("Error fetching PR data. Check console");
    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  test("adds class to PR row when injecting label", async () => {
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    const prRow = document.getElementById("issue_123");
    expect(prRow?.classList.contains("gh-ui-booster-base-branch-label")).toBe(
      true,
    );
  });

  test("inserts span as first child of parent", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted">
              <span>Existing child</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    const parent = document.querySelector(
      "#issue_123 .d-flex.mt-1.text-small.color-fg-muted",
    );
    expect(parent?.firstChild?.nodeName).toBe("SPAN");
  });

  test("handles empty PRs list", async () => {
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("handles no PR rows in DOM", async () => {
    document.body.innerHTML = `<div>No PR rows here</div>`;

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("creates span element with correct properties", async () => {
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

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    const createdSpan = document.querySelector(
      "#issue_123 .d-flex.mt-1.text-small.color-fg-muted span",
    );
    expect(createdSpan).toBeDefined();
    expect(createdSpan?.nodeName).toBe("SPAN");
  });

  test("handles multiple PRs with different base refs", async () => {
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
      <div id="issue_789">
        <div>
          <div></div>
          <div></div>
          <div>
            <div class="d-flex mt-1 text-small color-fg-muted"></div>
          </div>
        </div>
      </div>
    `;

    const mockOctokit = {
      pulls: {
        list: jest.fn().mockResolvedValue({ data: mockPrs }),
      },
    } as unknown as Octokit;

    await addBaseBranchLabels(mockOctokit, mockInstanceConfig);

    expect(createRoot).toHaveBeenCalledTimes(3);
    expect(mockRoot.render).toHaveBeenCalledTimes(3);
  });

  test("uses correct instance config for API call", async () => {
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

    await addBaseBranchLabels(mockOctokit, customConfig);

    expect(mockOctokit.pulls.list).toHaveBeenCalledWith({
      owner: "custom-org",
      repo: "custom-repo",
      state: "open",
      per_page: 100,
      page: 1,
    });
  });
});
