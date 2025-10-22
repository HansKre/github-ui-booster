import React from "react";
import { createRoot } from "react-dom/client";
import { RandomReviewerButton } from "../components";
import { InstanceConfig } from "../services";
import { OctokitWithCache } from "../services/getOctoInstance";
import { isOnPrPage } from "./utils/isOnPrPage";

const RANDOM_REVIEWER_BUTTON_CLASS = "gh-ui-booster-random-reviewer-btn";

export const handleRandomReviewer = (
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) => {
  const urlUiPr = isOnPrPage(instanceConfig);
  if (!urlUiPr) return;

  const detailsEl = document.getElementById("reviewers-select-menu");
  createRandomReviewerButton(detailsEl, octokit, instanceConfig);
};

const createRandomReviewerButton = (
  detailsEl: Element | null,
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) => {
  if (!detailsEl || !detailsEl.parentNode) return;

  if (detailsEl.parentNode?.querySelector(`.${RANDOM_REVIEWER_BUTTON_CLASS}`))
    return;

  const wrapperDiv = document.createElement("div");
  wrapperDiv.style.cssText = `
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
  `;

  // move detailsEl inside the wrapperDiv
  detailsEl.parentNode?.insertBefore(wrapperDiv, detailsEl);
  wrapperDiv.appendChild(detailsEl);

  const spanEl = document.createElement("span");
  spanEl.classList.add(RANDOM_REVIEWER_BUTTON_CLASS);
  wrapperDiv.appendChild(spanEl);

  const root = createRoot(spanEl);
  root.render(
    <React.StrictMode>
      <RandomReviewerButton octokit={octokit} instanceConfig={instanceConfig} />
    </React.StrictMode>,
  );
};
