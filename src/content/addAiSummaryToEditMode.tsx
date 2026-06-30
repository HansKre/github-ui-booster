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
    injectButtonsIntoEditContainers(instanceConfig, settings);
  });

  editModeObserver.observe(discussionContainer, {
    childList: true,
    subtree: true,
  });

  injectButtonsIntoEditContainers(instanceConfig, settings);
}

function injectButtonsIntoEditContainers(
  instanceConfig: InstanceConfig,
  settings: Settings,
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
      const branches = extractPrPageBranches();
      const issueKeyRegex = settings.jira?.issueKeyRegex;

      console.log(LOG_PREFIX, "Button clicked. Branches:", branches);
      console.log(LOG_PREFIX, "Issue key regex:", issueKeyRegex);

      if (settings.features.aiSummary && issueKeyRegex) {
        const issueKey = extractJiraIssueKeyFromPrPage(issueKeyRegex);
        console.log(LOG_PREFIX, "Extracted issue key:", issueKey);
        if (issueKey) {
          const jiraData: FetchJiraIssueFull =
            await JiraService.fetchJiraIssueFull(issueKey);
          await addAiSummary(issueKey, jiraData, textArea);
        }
      }

      if (settings.features.aiCodeSummary && branches) {
        await addAiCodeSummary(instanceConfig, settings, {
          textArea,
          baseBranch: branches.base,
          headBranch: branches.head,
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
