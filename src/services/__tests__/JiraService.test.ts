import { JiraService } from "../JiraService";
import { Messages } from "../../content/types";

describe("JiraService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches JIRA issue successfully", async () => {
    const mockData = {
      summary: "Test issue",
      description: "Test description",
      status: "In Progress",
      priority: "High",
      assignee: "John",
      comments: [],
    };

    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({ success: true, data: mockData });
      });

    const result = await JiraService.fetchJiraIssueFull("TEST-123");
    expect(result).toEqual(mockData);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: Messages.FETCH_JIRA_ISSUE_FULL,
        issueKey: "TEST-123",
      },
      expect.any(Function),
    );
  });

  test("rejects when chrome.runtime.lastError is set", async () => {
    const mockError = { message: "Runtime error" };
    (chrome.runtime as unknown as { lastError: typeof mockError }).lastError =
      mockError;
    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({});
      });

    await expect(JiraService.fetchJiraIssueFull("TEST-123")).rejects.toThrow(
      "Runtime error",
    );

    delete (chrome.runtime as unknown as { lastError?: typeof mockError })
      .lastError;
  });

  test("rejects when response indicates error with issueKey", async () => {
    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({
          error: { status: 404, message: "Not found" },
          issueKey: "TEST-404",
        });
      });

    await expect(JiraService.fetchJiraIssueFull("TEST-404")).rejects.toThrow(
      "Error fetching JIRA issue: TEST-404",
    );
  });

  test("rejects when response format is invalid", async () => {
    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({ invalid: "response" });
      });

    await expect(JiraService.fetchJiraIssueFull("TEST-123")).rejects.toThrow(
      "Error fetching JIRA issue (fetchJiraIssueFull)",
    );
  });

  test("rejects when response success is false", async () => {
    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({ success: false, data: null });
      });

    await expect(JiraService.fetchJiraIssueFull("TEST-123")).rejects.toThrow();
  });

  test("sends correct message type and issueKey", async () => {
    const mockData = {
      summary: "Test",
      description: null,
      status: "Done",
      priority: "Low",
      assignee: "Jane",
      comments: [],
    };

    (chrome.runtime.sendMessage as jest.Mock) = jest
      .fn()
      .mockImplementation((_, callback) => {
        callback({ success: true, data: mockData });
      });

    await JiraService.fetchJiraIssueFull("PROJ-456");

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: Messages.FETCH_JIRA_ISSUE_FULL,
        issueKey: "PROJ-456",
      },
      expect.any(Function),
    );
  });

  test("handles different issueKey formats", async () => {
    const issueKeys = [
      "TEST-1",
      "PROJ-12345",
      "ABC-999",
      "LONG-PROJECT-NAME-123",
    ];

    for (const issueKey of issueKeys) {
      const mockData = {
        summary: "Test",
        description: null,
        status: "Open",
        priority: "Medium",
        assignee: "Dev",
        comments: [],
      };

      (chrome.runtime.sendMessage as jest.Mock) = jest
        .fn()
        .mockImplementation((_, callback) => {
          callback({ success: true, data: mockData });
        });

      const result = await JiraService.fetchJiraIssueFull(issueKey);
      expect(result).toEqual(mockData);
    }
  });
});
