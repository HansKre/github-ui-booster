import axios from "axios";
import { jiraResponseSchema, Messages } from "./content/types";
import { hasOwnProperty, isEnumValue } from "ts-type-safe";
import { getSettings } from "./services";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

// fetchJiraIssue must happen in a service-worker because of missing CORS-headers on the Jira-API
// sendResponse is used to send the response back to the content script
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (
    hasOwnProperty(message, "type") &&
    isEnumValue(Messages, message.type) &&
    message.type === Messages.FETCH_JIRA_ISSUE
  ) {
    if (
      !hasOwnProperty(message, "issueKey") ||
      !(typeof message.issueKey === "string") ||
      !message.issueKey
    )
      return;
    const { issueKey } = message;

    getSettings({
      onSuccess: (settings) => {
        const { baseUrl: jiraBaseUrl, pat: token } = settings.jira || {};

        if (!jiraBaseUrl || !token) {
          alert("JIRA settings are not configured properly.");
          return;
        }

        fetchJiraIssue(jiraBaseUrl, token, issueKey)
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
      },
    });

    // Indicate that the response will be sent asynchronously
    return true;
  }
});

async function fetchJiraIssue(
  jiraBaseUrl: string,
  token: string,
  issueKey: string,
) {
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
