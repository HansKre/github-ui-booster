import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { BaseBranchLabel } from "../components";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

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

    const prRows = document.querySelectorAll("div[id^=issue_]");
    prRows.forEach((prRow) => {
      // Add labels indicating the base-ref to every PR row
      const [, prNumber] = prRow.id.split("_");
      const prData = prs.find((pr) => pr.number === parseInt(prNumber));
      if (prData) {
        injectBaseBranchLabel(prs, prData, prRow);
      }
    });
  } catch (err) {
    alert("Error fetching PR data. Check console");
    console.error(err);
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

  const parent = prRow.children[0].children[2]?.querySelector(
    "div.d-flex.mt-1.text-small.color-fg-muted",
  );

  // Insert as the very first element
  parent?.insertBefore(rootSpanEl, parent.firstChild);

  const root = createRoot(rootSpanEl);

  root.render(
    <React.StrictMode>
      <BaseBranchLabel currentPr={currentPr} basePr={basePr} />
    </React.StrictMode>,
  );
}
