import { hasOwnProperties } from "ts-type-safe";
import { FetchJiraIssueFull, Messages } from "../content/types";

export const JiraService = {
  async fetchJiraIssueFull(issueKey: string): Promise<FetchJiraIssueFull> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: Messages.FETCH_JIRA_ISSUE_FULL,
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
            resolve(response.data as FetchJiraIssueFull);
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
                `Error fetching JIRA issue (fetchJiraIssueFull): ${JSON.stringify(response)}`,
              ),
            );
          }
        },
      );
    });
  },
};
