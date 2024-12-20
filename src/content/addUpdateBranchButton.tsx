import React from "react";
import { createRoot, Root } from "react-dom/client";
import { UpdateBranchButton } from "../components";
import { ConflictsHint } from "../components/ConflictsHint";
import { InstanceConfig } from "../services";
import { OctokitWithCache } from "../services/getOctoInstance";
import { Spinner } from "./spinner";
import { isOnPrsPage } from "./utils/isOnPrsPage";

const UPDATE_BRANCH_BUTTON_CLASS = "gh-ui-booster-update-branch-btn";
const SPINNER_PARENT =
  "#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div";

let abortController: AbortController | null = null;

export async function addUpdateBranchButton(
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  if (!isOnPrsPage(instanceConfig)) return;

  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();
  const { signal } = abortController;

  try {
    // List all open pull requests
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
      request: { signal },
    });

    for (const pr of prs) {
      if (signal.aborted) return;

      // Fetch PR details
      const { data: prDetails } = await octokit.pulls.get({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        pull_number: pr.number,
        request: { signal },
      });

      if (signal.aborted) return;

      if (prDetails.mergeable_state === "dirty") {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;

        const { root } =
          createReactRoot(prRow, "gh-ui-booster-conflicts-hint") || {};
        if (!root) continue;

        root.render(
          <React.StrictMode>
            <ConflictsHint />
          </React.StrictMode>,
        );
        continue;
      }

      // Compare the branch with its base to check if it's behind
      const { data: comparison } = await octokit.repos.compareCommits({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        base: pr.base.ref,
        head: pr.head.ref,
        request: { signal },
      });

      if (signal.aborted) return;

      if (comparison.behind_by > 0) {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;

        const { root, rootSpanEl } =
          createReactRoot(prRow, UPDATE_BRANCH_BUTTON_CLASS) || {};
        if (!root) continue;

        const lastDeviatingSha = comparison.merge_base_commit.sha;

        root.render(
          <React.StrictMode>
            <UpdateBranchButton
              octokit={octokit}
              instanceConfig={instanceConfig}
              pr={pr}
              lastDeviatingSha={lastDeviatingSha}
              onSuccess={() =>
                void removeAndReaddUpdateBranchButton(
                  root,
                  rootSpanEl,
                  prRow,
                  octokit,
                  instanceConfig,
                )
              }
            />
          </React.StrictMode>,
        );
      }
    }
  } catch (error) {
    if (signal.aborted) {
      console.log("Execution aborted.");
    } else {
      console.error("Error processing pull requests:", error);
    }
  } finally {
    abortController = null;
  }
}

function createReactRoot(prRow: Element, className: string) {
  const prDescriptionContainer = prRow.children[0];
  if (!prDescriptionContainer) return null;

  if (prDescriptionContainer.classList.contains(className)) return null;

  prDescriptionContainer.classList.add(className);

  const rootSpanEl = document.createElement("span");
  rootSpanEl.classList.add("flex-shrink-0", "pt-2", "pl-2");
  prDescriptionContainer.insertBefore(
    rootSpanEl,
    prDescriptionContainer.children[2],
  );

  return { root: createRoot(rootSpanEl), rootSpanEl };
}

export async function removeAndReaddUpdateBranchButton(
  root: Root,
  rootSpanEl: HTMLSpanElement | undefined,
  prRow: Element,
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  // Unmount and remove the React component
  root.unmount();
  rootSpanEl?.remove();

  // Remove the marker class
  const prDescriptionContainer = prRow.children[0];
  if (!prDescriptionContainer) return null;
  prDescriptionContainer.classList.remove(UPDATE_BRANCH_BUTTON_CLASS);

  // Re-add the update branch button
  try {
    Spinner.showSpinner(SPINNER_PARENT);
    await addUpdateBranchButton(octokit, instanceConfig);
  } catch (err) {
    alert(
      "Error in content_prs_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  } finally {
    Spinner.hideSpinner();
  }
}
