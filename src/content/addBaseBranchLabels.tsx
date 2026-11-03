import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { BaseBranchLabel } from "../components";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";
import {
  getMetadataContainer,
  getPrNumber,
  getPrRows,
} from "./utils/prListDom";

type PullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

export async function addBaseBranchLabels(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
) {
  if (!isOnPrsPage(instanceConfig)) return;

  try {
    // Fetch PRs
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    if (prs.length === 0) return;

    const prRows = getPrRows();
    prRows.forEach((prRow) => {
      const prNumber = getPrNumber(prRow);
      const prData = prs.find((pr) => pr.number === parseInt(prNumber ?? ""));
      if (prData) {
        injectBaseBranchLabel(prs, prData, prRow);
      }
    });
  } catch (err) {
    console.error("Error fetching PR data:", err);
  }
}

function injectBaseBranchLabel(
  prs: PullRequest[],
  currentPr: PullRequest,
  prRow: Element,
) {
  const baseBranchLabelClass = "gh-ui-booster-base-branch-label";
  if (prRow.classList.contains(baseBranchLabelClass)) return;

  prRow.classList.add(baseBranchLabelClass);

  // Find the base PR if it exists
  const basePr = prs.find((pr) => pr.head.ref === currentPr.base.ref);

  const rootSpanEl = document.createElement("span");

  const parent = getMetadataContainer(prRow);
  parent?.insertBefore(rootSpanEl, parent.firstChild);

  const root = createRoot(rootSpanEl);

  root.render(
    <React.StrictMode>
      <BaseBranchLabel currentPr={currentPr} basePr={basePr} />
    </React.StrictMode>,
  );
}
