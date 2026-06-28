import { AiService } from "../services";
import { DescriptionTemplatePlaceholders, FetchJiraIssueFull } from "./types";

export async function addAiSummary(
  issueKey: string,
  jiraData: FetchJiraIssueFull,
) {
  const textArea =
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  let summary: string;
  try {
    summary = await AiService.summarizeWithAi({
      issueKey,
      summary: jiraData.summary,
      description: jiraData.description,
      comments: jiraData.comments,
    });
  } catch (error) {
    console.error("[AI Summary] Failed to generate summary:", error);
    textArea.value = textArea.value.replace(
      DescriptionTemplatePlaceholders.AI_SUMMARY,
      "",
    );
    return;
  }

  if (textArea.value.includes(DescriptionTemplatePlaceholders.AI_SUMMARY)) {
    textArea.value = textArea.value.replace(
      DescriptionTemplatePlaceholders.AI_SUMMARY,
      summary,
    );
  } else {
    const separator = textArea.value.trim() ? "\n\n" : "";
    textArea.value = `${textArea.value}${separator}## Summary\n\n${summary}`;
  }
}
