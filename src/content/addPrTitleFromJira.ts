import { JiraService, Settings } from "../services";
import { fetchJiraIssueSchema } from "./types";
import { extractJiraIssueKeyFromBranch } from "./utils/comparePageUtils";

export async function addPrTitleFromJira(settings: Settings) {
  const prTitleInput = document.querySelector<HTMLInputElement>(
    "#pull_request_title",
  );
  if (!prTitleInput) return;

  const issueKey = extractJiraIssueKeyFromBranch(settings);
  if (!issueKey) return;

  const result = await JiraService.fetchJiraIssue(issueKey);
  if (!result) return;

  const validatedResult = fetchJiraIssueSchema.validateSync(result);

  prTitleInput.value = `${issueKey}: ${validatedResult.summary}`;
}
