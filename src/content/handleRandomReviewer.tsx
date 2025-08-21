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

  const topRightSection = document.getElementsByClassName("tabnav-extra")[0];
  if (!topRightSection) return;

  createRandomReviewerButton(topRightSection, octokit, instanceConfig);
};

const createRandomReviewerButton = (
  parent: Element,
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) => {
  if (parent.querySelector(`.${RANDOM_REVIEWER_BUTTON_CLASS}`)) return;

  // make parent a flex container to align all children in it
  if (parent instanceof HTMLElement)
    parent.style.setProperty("display", "flex", "important");

  const spanContainer = document.createElement("span");
  spanContainer.classList.add(RANDOM_REVIEWER_BUTTON_CLASS);
  parent.insertBefore(spanContainer, parent.firstChild);

  const root = createRoot(spanContainer);
  root.render(
    <React.StrictMode>
      <RandomReviewerButton octokit={octokit} instanceConfig={instanceConfig} />
    </React.StrictMode>,
  );
};
