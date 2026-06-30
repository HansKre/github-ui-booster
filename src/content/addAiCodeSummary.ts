import { getFileBlacklist } from "../getFileBlacklist";
import { AiService, InstanceConfig, Settings } from "../services";
import { getOctoInstance } from "../services/getOctoInstance";
import { DescriptionTemplatePlaceholders } from "./types";

function createStatusElement(): HTMLElement {
  const el = document.createElement("div");
  el.id = "gh-ui-booster-ai-code-diff-status";
  el.style.cssText =
    "padding: 8px 12px; margin-top: 8px; border-radius: 6px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;";
  return el;
}

function showLoading(container: Element): HTMLElement {
  const el = createStatusElement();
  el.style.backgroundColor = "#ddf4ff";
  el.style.color = "#0969da";
  el.textContent = "⏳ Generating AI code diff summary...";
  container.insertAdjacentElement("afterend", el);
  return el;
}

function showError(statusEl: HTMLElement, message: string) {
  statusEl.style.backgroundColor = "#ffebe9";
  statusEl.style.color = "#cf222e";
  statusEl.textContent = `AI Code Diff Summary failed: ${message}`;
}

function showSuccess(statusEl: HTMLElement) {
  statusEl.style.backgroundColor = "#dafbe1";
  statusEl.style.color = "#1a7f37";
  statusEl.textContent = "✓ AI code diff summary added";
  setTimeout(() => statusEl.remove(), 5000);
}

function getBranchName(selectorId: string): string | null {
  const details = document.getElementById(selectorId);
  const span = details?.querySelector("span.css-truncate-target");
  return span?.textContent?.trim() || null;
}

type AiCodeSummaryOptions = {
  textArea?: HTMLTextAreaElement;
  baseBranch?: string;
  headBranch?: string;
};

export async function addAiCodeSummary(
  instanceConfig: InstanceConfig,
  settings: Settings,
  options?: AiCodeSummaryOptions,
) {
  const textArea =
    options?.textArea ??
    document.querySelector<HTMLTextAreaElement>("#pull_request_body");
  if (!textArea) return;

  const base = options?.baseBranch ?? getBranchName("base-ref-selector");
  const head = options?.headBranch ?? getBranchName("head-ref-selector");

  if (!base || !head) {
    console.warn("[AI Code Diff] Could not extract base/head branch names");
    return;
  }

  const existing = document.getElementById("gh-ui-booster-ai-code-diff-status");
  if (existing) existing.remove();

  const statusEl = showLoading(textArea);

  let summary: string;
  try {
    const octokit = getOctoInstance(instanceConfig);
    const { data } = await octokit.repos.compareCommits({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      base,
      head,
    });

    const blacklist = getFileBlacklist(settings);
    const files = (data.files ?? [])
      .filter((f) => !blacklist.some((name) => f.filename.includes(name)))
      .map((f) => ({
        filename: f.filename,
        status: f.status ?? "modified",
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      }));

    if (files.length === 0) {
      statusEl.remove();
      console.log("[AI Code Diff] No files to summarize after filtering");
      return;
    }

    summary = await AiService.summarizeCodeDiff({ files });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AI Code Diff] Failed:", error);
    showError(statusEl, msg);
    textArea.value = textArea.value.replace(
      DescriptionTemplatePlaceholders.AI_CODE_SUMMARY,
      "",
    );
    return;
  }

  if (
    textArea.value.includes(DescriptionTemplatePlaceholders.AI_CODE_SUMMARY)
  ) {
    textArea.value = textArea.value.replace(
      DescriptionTemplatePlaceholders.AI_CODE_SUMMARY,
      summary,
    );
  } else {
    const separator = textArea.value.trim() ? "\n\n" : "";
    textArea.value = `${textArea.value}${separator}## AI Code Diff Summary\n\n${summary}`;
  }

  textArea.dispatchEvent(new Event("input", { bubbles: true }));
  showSuccess(statusEl);
}
