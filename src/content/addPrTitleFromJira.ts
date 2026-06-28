import { FetchJiraIssueFull } from "./types";

export function addPrTitleFromJira(
  issueKey: string,
  jiraData: FetchJiraIssueFull,
) {
  const prTitleInput = document.querySelector<HTMLInputElement>(
    "#pull_request_title",
  );
  if (!prTitleInput) return;

  prTitleInput.value = `${issueKey}: ${jiraData.summary}`;
}
