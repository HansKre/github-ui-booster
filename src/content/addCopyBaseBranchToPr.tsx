import React from "react";
import { createRoot } from "react-dom/client";
import { CliboardCopy } from "../components/CliboardCopy/CliboardCopy";
import { InstanceConfig } from "../services";
import { isOnPrPage } from "./utils/isOnPrPage";

export function addCopyBaseBranchToPr(instanceConfig: InstanceConfig) {
  if (!isOnPrPage(instanceConfig)) return;

  const baseBranchNameSelectors = [
    "#partial-discussion-header span.commit-ref.base-ref",
    // in sticky-header, which is displayed after scrolling
    // does not have .base-ref-class
    ".gh-header-sticky .sticky-content span.commit-ref:not(head-ref)",
  ];

  for (const baseBranchNameSelector of baseBranchNameSelectors) {
    const baseBranchNameElement = document.querySelector(
      baseBranchNameSelector,
    );
    const targetElement = baseBranchNameElement?.nextElementSibling;

    if (!targetElement) return;

    const existingCopy = targetElement.querySelector(
      ".gh-ui-booster-clipboard-copy",
    );
    if (existingCopy) return;

    const headRef = baseBranchNameElement.textContent?.trim();
    if (!headRef) return;

    const clipboardContainer = document.createElement("span");
    clipboardContainer.setAttribute("data-view-component", "true");
    clipboardContainer.className = "gh-ui-booster-clipboard-copy";

    const margin = "0.5rem";
    clipboardContainer.style.marginLeft = margin;
    clipboardContainer.style.marginRight = margin;

    targetElement.appendChild(clipboardContainer);

    const root = createRoot(clipboardContainer);

    root.render(
      <React.StrictMode>
        <CliboardCopy value={headRef} />
      </React.StrictMode>,
    );
  }
}
