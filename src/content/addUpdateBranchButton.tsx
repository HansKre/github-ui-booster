import { Octokit } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { UpdateBranchButton } from "../components";
import { ConflictsHint } from "../components/ConflictsHint";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

export async function addUpdateBranchButton(
  octokit: Octokit,
  instanceConfig: InstanceConfig
) {
  if (!isOnPrsPage(instanceConfig)) return;

  try {
    // List all open pull requests
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    for (const pr of prs) {
      // Fetch PR details
      const { data: prDetails } = await octokit.pulls.get({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        pull_number: pr.number,
      });

      if (prDetails.mergeable_state === "dirty") {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;

        const prDescriptionContainer = prRow.children[0];
        if (!prDescriptionContainer) continue;

        const conflictsHintClass = "gh-ui-booster-conflicts-hint";
        if (prDescriptionContainer.classList.contains(conflictsHintClass))
          continue;
        prDescriptionContainer.classList.add(conflictsHintClass);

        const rootSpanEl = document.createElement("span");
        rootSpanEl.classList.add("flex-shrink-0", "pt-2", "pl-2");
        prDescriptionContainer.insertBefore(
          rootSpanEl,
          prDescriptionContainer.children[2]
        );
        const root = createRoot(rootSpanEl);

        root.render(
          <React.StrictMode>
            <ConflictsHint />
          </React.StrictMode>
        );
        continue;
      }

      // Compare the branch with its base to check if it's behind
      const { data: comparison } = await octokit.repos.compareCommits({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        base: pr.base.ref,
        head: pr.head.ref,
      });

      if (comparison.behind_by > 0) {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;

        const prDescriptionContainer = prRow.children[0];
        if (!prDescriptionContainer) continue;

        const updateBtnClass = "gh-ui-booster-update-branch-btn";
        if (prDescriptionContainer.classList.contains(updateBtnClass)) continue;
        prDescriptionContainer.classList.add(updateBtnClass);

        const rootSpanEl = document.createElement("span");
        rootSpanEl.classList.add("flex-shrink-0", "pt-2", "pl-2");
        prDescriptionContainer.insertBefore(
          rootSpanEl,
          prDescriptionContainer.children[2]
        );
        const root = createRoot(rootSpanEl);

        root.render(
          <React.StrictMode>
            <UpdateBranchButton
              octokit={octokit}
              instanceConfig={instanceConfig}
              prNumber={pr.number}
            />
          </React.StrictMode>
        );
      }
    }
  } catch (error) {
    console.error("Error processing pull requests:", error);
  }
}
