import { JiraService, Settings } from "../services";
import { TemplateDescriptionParameters } from "./types";

async function resolveJiraLink(settings: Settings): Promise<string> {
  const description = settings.templateDescription;
  const hasJiraTicket = description.includes("{{jiraTicket}}");
  if (!hasJiraTicket) return description;

  const details = document.getElementById("head-ref-selector");
  const span = details?.querySelector("span.css-truncate-target");
  const branchName = span?.textContent?.trim();
  if (!branchName) return description;

  if (!settings.jira?.issueKeyRegex) {
    alert(
      "Jira issue key regex is not set. Please configure it in the settings.",
    );
    return description;
  }

  const match = branchName.match(new RegExp(settings.jira.issueKeyRegex));
  if (!match) return description;

  const issueKey = match[0];
  const result = await JiraService.fetchJiraIssue(issueKey);
  if (!result) return description;

  return description.replace(
    new RegExp(TemplateDescriptionParameters.JIRA_TICKET, "g"),
    `${settings.jira.baseUrl}/browse/${issueKey}`,
  );
}

export async function addTemplateDescription(settings: Settings) {
  if (!settings.templateDescription) return;
  const textArea =
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  textArea.value = await resolveJiraLink(settings);
  textArea.dispatchEvent(new Event("input", { bubbles: true }));
}
