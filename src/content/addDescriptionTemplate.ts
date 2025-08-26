import { Settings } from "../services";
import { DescriptionTemplatePlaceholders } from "./types";
import { extractJiraIssueKeyFromBranch } from "./utils/comparePageUtils";

function resolveJiraLink(settings: Settings): string {
  const description = settings.descriptionTemplate;
  const hasJiraTicket = description.includes(
    DescriptionTemplatePlaceholders.JIRA_TICKET,
  );
  if (!hasJiraTicket) return description;

  const issueKey = extractJiraIssueKeyFromBranch(settings);
  if (!issueKey) return description;

  return description.replace(
    new RegExp(DescriptionTemplatePlaceholders.JIRA_TICKET, "g"),
    `${settings.jira?.baseUrl}/browse/${issueKey}`,
  );
}

export function addDescriptionTemplate(settings: Settings) {
  if (!settings.descriptionTemplate) return;
  const textArea =
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  textArea.value = resolveJiraLink(settings);
}
