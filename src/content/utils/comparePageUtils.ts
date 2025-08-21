import { InstanceConfig, Settings } from "../../services";
import { urls } from "./urls";

export function isOnComparePage(instanceConfig: InstanceConfig): boolean {
  return window.location.href.includes(urls(instanceConfig).urlUiCompare);
}

export const extractJiraIssueKeyFromBranch = (settings: Settings) => {
  const isJiraEnabled = settings.features?.jira;
  const issueKeyRegex = settings.jira?.issueKeyRegex;
  if (!isJiraEnabled || !issueKeyRegex) {
    alert(
      "Jira integration or Jira issue key regex is not set. Please configure it in the settings.",
    );
    return null;
  }

  const details = document.getElementById("head-ref-selector");
  const span = details?.querySelector("span.css-truncate-target");
  if (!span || !span.textContent) return null;
  const text = span.textContent.trim();

  const match = text.match(new RegExp(issueKeyRegex));
  return match ? match[0] : null;
};
