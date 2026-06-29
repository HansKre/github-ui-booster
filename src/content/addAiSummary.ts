import { AiService } from "../services";
import { DescriptionTemplatePlaceholders, FetchJiraIssueFull } from "./types";

function createStatusElement(): HTMLElement {
  const el = document.createElement("div");
  el.id = "gh-ui-booster-ai-status";
  el.style.cssText =
    "padding: 8px 12px; margin-top: 8px; border-radius: 6px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;";
  return el;
}

function showLoading(container: Element): HTMLElement {
  const el = createStatusElement();
  el.style.backgroundColor = "#ddf4ff";
  el.style.color = "#0969da";
  el.textContent = "⏳ Generating AI summary from JIRA ticket...";
  container.insertAdjacentElement("afterend", el);
  return el;
}

function showError(statusEl: HTMLElement, message: string) {
  statusEl.style.backgroundColor = "#ffebe9";
  statusEl.style.color = "#cf222e";
  statusEl.textContent = `AI Summary failed: ${message}`;
}

function showSuccess(statusEl: HTMLElement) {
  statusEl.style.backgroundColor = "#dafbe1";
  statusEl.style.color = "#1a7f37";
  statusEl.textContent = "✓ AI summary added";
  setTimeout(() => statusEl.remove(), 5000);
}

export async function addAiSummary(
  issueKey: string,
  jiraData: FetchJiraIssueFull,
  targetTextArea?: HTMLTextAreaElement,
) {
  const textArea =
    targetTextArea ??
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  const existing = document.getElementById("gh-ui-booster-ai-status");
  if (existing) existing.remove();

  const statusEl = showLoading(textArea);

  let summary: string;
  try {
    summary = await AiService.summarizeWithAi({
      issueKey,
      summary: jiraData.summary,
      description: jiraData.description,
      comments: jiraData.comments,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AI Summary] Failed to generate summary:", error);
    showError(statusEl, msg);
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
    textArea.value = `${textArea.value}${separator}## AI Jira Summary\n\n${summary}`;
  }

  textArea.dispatchEvent(new Event("input", { bubbles: true }));
  showSuccess(statusEl);
}
