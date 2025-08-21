import { Settings } from "../services";
import { TemplateDescriptionParameters } from "./types";
import { extractJiraIssueKeyFromBranch } from "./utils/comparePageUtils";

function resolveJiraLink(settings: Settings): string {
  const description = settings.templateDescription;
  const hasJiraTicket = description.includes(
    TemplateDescriptionParameters.JIRA_TICKET,
  );
  if (!hasJiraTicket) return description;

  const issueKey = extractJiraIssueKeyFromBranch(settings);
  if (!issueKey) return description;

  return description.replace(
    new RegExp(TemplateDescriptionParameters.JIRA_TICKET, "g"),
    `${settings.jira?.baseUrl}/browse/${issueKey}`,
  );
}

export function addTemplateDescription(settings: Settings) {
  if (!settings.templateDescription) return;
  const textArea =
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  textArea.value = resolveJiraLink(settings);
}
