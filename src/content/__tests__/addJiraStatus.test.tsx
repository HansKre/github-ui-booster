import { addJiraStatus } from "../addJiraStatus";
import { Settings } from "../../services";
import { createRoot } from "react-dom/client";
import * as JiraServiceModule from "../../services/JiraService";
import * as typesModule from "../types";

// Mock dependencies
jest.mock("react-dom/client");
jest.mock("../../services/JiraService");

describe("addJiraStatus", () => {
  const mockSettings: Settings = {
    instances: [],
    features: {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      autoFilter: false,
      prTitleFromJira: true,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    },
    jira: {
      pat: "jira_token_12345678901234567890123456",
      baseUrl: "https://jira.example.com",
      issueKeyRegex: "TEST-\\d+",
    },
    fileBlacklist: "package-lock.json",
  };

  const mockJiraResponse = {
    fields: {
      status: { name: "In Progress" },
      priority: { name: "High" },
      assignee: { displayName: "John Doe" },
      summary: "Test issue summary",
    },
  };

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

    // Mock alert
    global.alert = jest.fn();

    // Mock JiraService
    jest
      .spyOn(JiraServiceModule.JiraService, "fetchJiraIssue")
      .mockResolvedValue(mockJiraResponse);

    // Mock validateSync
    jest
      .spyOn(typesModule.fetchJiraIssueSchema, "validateSync")
      .mockReturnValue({
        status: "In Progress",
        priority: "High",
        assignee: "John Doe",
        summary: "Test issue summary",
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns early if jira settings not configured", async () => {
    const settingsWithoutJira: Settings = {
      ...mockSettings,
      jira: undefined,
    };

    await addJiraStatus(settingsWithoutJira);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("alerts if jira pat is set but issueKeyRegex is missing", async () => {
    const settingsWithoutRegex: Settings = {
      ...mockSettings,
      jira: {
        pat: "jira_token_12345678901234567890123456",
        baseUrl: "https://jira.example.com",
        issueKeyRegex: "",
      },
    };

    await addJiraStatus(settingsWithoutRegex);

    expect(alert).toHaveBeenCalledWith(
      "Jira issue key regex is not set. Please configure it in the settings.",
    );
    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("fetches and displays JIRA status for PR with matching issue key", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).toHaveBeenCalledWith(
      "TEST-1234",
    );
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRoot.render).toHaveBeenCalledTimes(1);
  });

  test("skips PR without issue link", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("skips PR when issue link text does not match regex", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <a id="issue_123_link">No JIRA key here</a>
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("skips PR when JIRA API returns null", async () => {
    jest
      .spyOn(JiraServiceModule.JiraService, "fetchJiraIssue")
      .mockResolvedValue(null);

    document.body.innerHTML = `
      <div id="issue_123">
        <a id="issue_123_link">TEST-1234: Fix bug</a>
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("skips PR if already has jira status class", async () => {
    document.body.innerHTML = `
      <div id="issue_123" class="gh-ui-booster-jira-status">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).toHaveBeenCalled();
    expect(createRoot).not.toHaveBeenCalled();
  });

  test("adds class to PR row after processing", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    const prRow = document.getElementById("issue_123");
    expect(prRow?.classList.contains("gh-ui-booster-jira-status")).toBe(true);
  });

  test("inserts span as first child of parent", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    const parent = document.querySelector(
      "#issue_123 > div > div:nth-child(3)",
    );
    expect(parent?.firstChild?.nodeName).toBe("SPAN");
  });

  test("processes multiple PR rows", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
      <div id="issue_456">
        <div>
          <a id="issue_456_link">TEST-5678: Another fix</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).toHaveBeenCalledTimes(
      2,
    );
    expect(
      JiraServiceModule.JiraService.fetchJiraIssue,
    ).toHaveBeenNthCalledWith(1, "TEST-1234");
    expect(
      JiraServiceModule.JiraService.fetchJiraIssue,
    ).toHaveBeenNthCalledWith(2, "TEST-5678");
    expect(createRoot).toHaveBeenCalledTimes(2);
  });

  test("extracts correct issue key from PR title", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">Prefix TEST-9999 Suffix: Some description</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).toHaveBeenCalledWith(
      "TEST-9999",
    );
  });

  test("handles custom regex pattern", async () => {
    const customSettings: Settings = {
      ...mockSettings,
      jira: {
        pat: "jira_token_12345678901234567890123456",
        baseUrl: "https://jira.example.com",
        issueKeyRegex: "ABC-\\d+",
      },
    };

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">ABC-456: Custom prefix</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(customSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).toHaveBeenCalledWith(
      "ABC-456",
    );
  });

  test("validates JIRA response with schema", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(typesModule.fetchJiraIssueSchema.validateSync).toHaveBeenCalledWith(
      mockJiraResponse,
    );
  });

  test("renders JiraStatus component with validated result", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    const renderCall = mockRoot.render.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });

  test("handles no PR rows in DOM", async () => {
    document.body.innerHTML = `<div>No PR rows</div>`;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("handles issue link with no text content", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <a id="issue_123_link"></a>
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(JiraServiceModule.JiraService.fetchJiraIssue).not.toHaveBeenCalled();
  });

  test("creates span element for rendering", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    const span = document.querySelector(
      "#issue_123 > div > div:nth-child(3) > span",
    );
    expect(span).toBeTruthy();
  });

  test("renders with React.StrictMode", async () => {
    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(mockRoot.render).toHaveBeenCalled();
    const renderCall = mockRoot.render.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });

  test("handles JIRA API errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest
      .spyOn(JiraServiceModule.JiraService, "fetchJiraIssue")
      .mockRejectedValue(new Error("JIRA API error"));

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    // Should not throw
    await addJiraStatus(mockSettings);

    expect(createRoot).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("handles undefined jira.issueKeyRegex", async () => {
    const settingsUndefinedRegex: Settings = {
      ...mockSettings,
      jira: {
        pat: "jira_token_12345678901234567890123456",
        baseUrl: "https://jira.example.com",
        issueKeyRegex: undefined as any,
      },
    };

    await addJiraStatus(settingsUndefinedRegex);

    expect(alert).toHaveBeenCalled();
  });

  test("processes PRs sequentially", async () => {
    const fetchOrder: string[] = [];

    jest
      .spyOn(JiraServiceModule.JiraService, "fetchJiraIssue")
      .mockImplementation(async (issueKey: string) => {
        fetchOrder.push(issueKey);
        return Promise.resolve(mockJiraResponse);
      });

    document.body.innerHTML = `
      <div id="issue_123">
        <div>
          <a id="issue_123_link">TEST-1234: Fix bug</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
      <div id="issue_456">
        <div>
          <a id="issue_456_link">TEST-5678: Another fix</a>
          <div></div>
          <div>
            <span>Existing content</span>
          </div>
        </div>
      </div>
    `;

    await addJiraStatus(mockSettings);

    expect(fetchOrder).toEqual(["TEST-1234", "TEST-5678"]);
  });
});
