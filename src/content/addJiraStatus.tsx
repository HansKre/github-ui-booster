import React from "react";
import { createRoot } from "react-dom/client";
import { JiraStatus } from "../components/JiraStatus";
import { JiraService, Settings } from "../services";
import { fetchJiraIssueFullSchema } from "./types";
import { getMetadataContainer, getPrRows } from "./utils/prListDom";

export async function addJiraStatus(settings: Settings) {
  if (!settings.jira) return;

  if (settings.jira?.pat && !settings.jira?.issueKeyRegex) {
    alert(
      "Jira issue key regex is not set. Please configure it in the settings.",
    );
    return;
  }
  const prRows = getPrRows();
  for (const prRow of prRows) {
    const titleLink = prRow.querySelector(
      'a[data-testid="listitem-title-link"], a[id^=issue_]',
    );
    if (!titleLink) continue;

    const match = titleLink.textContent?.match(
      new RegExp(settings.jira.issueKeyRegex),
    );
    if (!match) continue;

    const issueKey = match[0];

    let result;
    try {
      result = await JiraService.fetchJiraIssueFull(issueKey);
    } catch (error) {
      console.error(`Failed to fetch JIRA issue ${issueKey}:`, error);
      continue;
    }

    if (!result) continue;

    const prTotalLinesClass = "gh-ui-booster-jira-status";
    if (prRow.classList.contains(prTotalLinesClass)) continue;
    prRow.classList.add(prTotalLinesClass);

    const rootSpanEl = document.createElement("span");

    const parent = getMetadataContainer(prRow);
    parent?.insertBefore(rootSpanEl, parent.firstChild);

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <JiraStatus
          result={fetchJiraIssueFullSchema.validateSync(result)}
          issueKey={issueKey}
        />
      </React.StrictMode>,
    );
  }
}
