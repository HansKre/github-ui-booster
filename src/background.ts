import axios from "axios";
import { jiraResponseSchema, Messages } from "./content/types";
import { hasOwnProperty, isEnumValue } from "ts-type-safe";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

// fetchJiraIssue must happen in a service-worker because of missing CORS-headers on the Jira-API
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (
    hasOwnProperty(message, "type") &&
    isEnumValue(Messages, message.type) &&
    message.type === Messages.FETCH_JIRA_ISSUE
  ) {
    if (
      !hasOwnProperty(message, "issueKey") ||
      !(typeof message.issueKey === "string")
    )
      return;
    const issueKey = message.issueKey;

    fetchJiraIssue(issueKey)
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error: unknown) => {
        console.log("Error fetching JIRA issue:", error);
        sendResponse({
          success: false,
          error,
          issueKey,
        });
      });

    // Indicate that the response will be sent asynchronously
    return true;
  }
});

/**
- jira instance properties:
  - Jira-PAT
  - Jira-API-BASE-URL
  - Jira-issueKey-Regex
 */
const TOKEN = "";
const JIRA_BASE_URL = "";
export async function fetchJiraIssue(issueKey: string) {
  const token = TOKEN;
  const jiraBaseUrl = JIRA_BASE_URL;

  try {
    const response = await axios.get(
      `${jiraBaseUrl}/rest/api/2/issue/${issueKey}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    try {
      const { fields } = jiraResponseSchema.validateSync(response.data);
      const result = {
        assignee: fields.assignee?.displayName ?? "Unassigned",
        priority: fields.priority.name,
        status: fields.status.name,
      };
      return result;
    } catch (err) {
      console.log("Error validating JIRA response:", issueKey, err);
    }
  } catch (error) {
    console.error("Error fetching JIRA issue:", error);
    throw error;
  }
}
