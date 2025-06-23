import React from "react";
import { createRoot } from "react-dom/client";
import { JiraStatus } from "../components/JiraStatus";
import { Settings } from "../services";
import { JiraService } from "./JiraService";
import { fetchJiraIssueSchema } from "./types";

export async function addJiraStatus(settings: Settings) {
  if (!settings.jira?.issueKeyRegex) {
    alert(
      "Jira issue key regex is not set. Please configure it in the settings.",
    );
    return;
  }
  const prRows = document.querySelectorAll("div[id^=issue_]");
  for (const prRow of prRows) {
    const issueLink = prRow.querySelector("a[id^=issue_]");
    if (!issueLink) continue;

    const match = issueLink.textContent?.match(
      new RegExp(settings.jira.issueKeyRegex),
    );
    if (!match) continue;

    const issueKey = match[0];

    const result = await JiraService.fetchJiraIssue(issueKey);

    const prTotalLinesClass = "gh-ui-booster-jira-status";
    if (prRow.classList.contains(prTotalLinesClass)) continue;
    prRow.classList.add(prTotalLinesClass);

    const rootSpanEl = document.createElement("span");

    const parent = prRow.children[0].children[2];
    parent.insertBefore(rootSpanEl, parent.firstChild);

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <JiraStatus
          result={fetchJiraIssueSchema.validateSync(result)}
          issueKey={issueKey}
        />
      </React.StrictMode>,
    );
  }
}
