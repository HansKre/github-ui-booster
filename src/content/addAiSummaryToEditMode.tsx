import React from "react";
import { createRoot } from "react-dom/client";
import { AiSummaryButton } from "../components/AiSummaryButton";
import { InstanceConfig, JiraService, Settings } from "../services";
import { addAiCodeSummary } from "./addAiCodeSummary";
import { addAiSummary } from "./addAiSummary";
import { FetchJiraIssueFull } from "./types";
import {
  extractJiraIssueKeyFromPrPage,
  extractPrPageBranches,
} from "./utils/prPageBranchUtils";

const MARKER_CLASS = "gh-ui-booster-ai-summary-edit-btn";
const LOG_PREFIX = "[AI Summary Edit]";

let editModeObserver: MutationObserver | null = null;

export function observeEditModeForAiSummary(
  instanceConfig: InstanceConfig,
  settings: Settings,
) {
  if (editModeObserver) return;

  const issueKeyRegex = settings.jira?.issueKeyRegex;

  // Mutable cache: populated at startup and refreshed on every mutation until non-null.
  // The new GH UI renders branch links asynchronously, so they may not be present yet
  // at content-script startup time.
  let cachedBranches = extractPrPageBranches();
  let cachedIssueKey = issueKeyRegex
    ? extractJiraIssueKeyFromPrPage(issueKeyRegex)
    : null;

  console.log(LOG_PREFIX, "Cached branches at startup:", cachedBranches);
  console.log(LOG_PREFIX, "Cached issue key at startup:", cachedIssueKey);

  const refreshCacheIfNeeded = () => {
    if (!cachedBranches) cachedBranches = extractPrPageBranches();
    if (!cachedIssueKey && issueKeyRegex)
      cachedIssueKey = extractJiraIssueKeyFromPrPage(issueKeyRegex);
  };

  const discussionContainer =
    document.querySelector("#discussion_bucket") ??
    document.querySelector(".js-discussion") ??
    document.body;

  console.log(
    LOG_PREFIX,
    "Setting up observer on:",
    discussionContainer.tagName,
    discussionContainer.id || discussionContainer.className,
  );

  editModeObserver = new MutationObserver(() => {
    refreshCacheIfNeeded();
    injectButtonsIntoEditContainers(
      instanceConfig,
      settings,
      cachedBranches,
      cachedIssueKey,
    );
  });

  editModeObserver.observe(discussionContainer, {
    childList: true,
    subtree: true,
  });

  injectButtonsIntoEditContainers(
    instanceConfig,
    settings,
    cachedBranches,
    cachedIssueKey,
  );
}

function injectButtonsIntoEditContainers(
  instanceConfig: InstanceConfig,
  settings: Settings,
  cachedBranches: ReturnType<typeof extractPrPageBranches>,
  cachedIssueKey: string | null,
) {
  const cancelButtons = document.querySelectorAll(
    "button.js-comment-cancel-button",
  );

  console.log(LOG_PREFIX, "Found cancel buttons:", cancelButtons.length);

  for (const cancelButton of cancelButtons) {
    const actionDiv = cancelButton.parentElement;
    if (!actionDiv) {
      console.log(LOG_PREFIX, "No parent element for cancel button");
      continue;
    }

    if (actionDiv.querySelector(`.${MARKER_CLASS}`)) continue;

    const formContainer = cancelButton.closest(".js-previewable-comment-form");
    if (!formContainer) {
      console.log(LOG_PREFIX, "No .js-previewable-comment-form ancestor found");
      continue;
    }

    // Skip the combined title+body edit form (three-dots > Edit).
    // That form contains a title <input>; the description-only edit form does not.
    const titleInput = formContainer.querySelector(
      'input[name="issue[title]"], #issue_title, input.js-issue-title',
    );
    if (titleInput) {
      console.log(LOG_PREFIX, "Skipping title edit form");
      continue;
    }

    const textArea =
      formContainer.querySelector<HTMLTextAreaElement>("textarea");
    if (!textArea) {
      console.log(LOG_PREFIX, "No textarea found in form container");
      continue;
    }

    console.log(
      LOG_PREFIX,
      "Injecting button. Textarea id:",
      textArea.id,
      "ActionDiv classes:",
      actionDiv.className,
    );

    const container = document.createElement("span");
    container.className = MARKER_CLASS;

    actionDiv.insertBefore(container, actionDiv.firstChild);

    const root = createRoot(container);

    const handleClick = async () => {
      console.log(LOG_PREFIX, "Button clicked. Branches:", cachedBranches);
      console.log(LOG_PREFIX, "Issue key:", cachedIssueKey);

      if (cachedIssueKey && settings.jira?.baseUrl) {
        const jiraUrl = `${settings.jira.baseUrl}/browse/${cachedIssueKey}`;
        if (!textArea.value.includes(jiraUrl)) {
          const link = `[${cachedIssueKey}](${jiraUrl})`;
          const separator = textArea.value.trim() ? "\n\n" : "";
          textArea.value = `${textArea.value}${separator}${link}`;
          textArea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      if (settings.features.aiSummary && cachedIssueKey) {
        const jiraData: FetchJiraIssueFull =
          await JiraService.fetchJiraIssueFull(cachedIssueKey);
        await addAiSummary(cachedIssueKey, jiraData, textArea);
      }

      if (settings.features.aiCodeSummary && cachedBranches) {
        await addAiCodeSummary(instanceConfig, settings, {
          textArea,
          baseBranch: cachedBranches.base,
          headBranch: cachedBranches.head,
        });
      }
    };

    root.render(
      <React.StrictMode>
        <AiSummaryButton onClick={handleClick} />
      </React.StrictMode>,
    );
  }
}
