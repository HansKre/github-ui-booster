import { hasOwnProperties } from "ts-type-safe";
import { Messages } from "./types";

// Uses the Chrome extension messaging API to fetch a JIRA issue by its key
export const JiraService = {
  async fetchJiraIssue(issueKey: string) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: Messages.FETCH_JIRA_ISSUE,
          issueKey,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (
            hasOwnProperties(response, ["success", "data"]) &&
            response.success
          ) {
            resolve(response.data);
          } else if (
            hasOwnProperties(response, ["error", "issueKey"]) &&
            typeof response.issueKey === "string"
          ) {
            reject(
              new Error(
                `Error fetching JIRA issue: ${response.issueKey} - ${JSON.stringify(response.error)}`,
              ),
            );
          } else {
            reject(
              new Error(
                `Error fetching JIRA issue (fetchJiraIssue)m ${JSON.stringify(response)}`,
              ),
            );
          }
        },
      );
    });
  },
};
