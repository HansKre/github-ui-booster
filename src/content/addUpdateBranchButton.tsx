import React from "react";
import { createRoot, Root } from "react-dom/client";
import { BatchUpdateButton } from "../components/BatchUpdateButton";
import { UpdateBranchButton } from "../components";
import { ConflictsHint } from "../components/ConflictsHint";
import { InstanceConfig } from "../services";
import { OctokitWithCache } from "../services/getOctoInstance";
import { Spinner } from "./spinner";
import {
  analyzePrBranchStatus,
  PrBranchAnalysis,
} from "./utils/analyzePrBranchStatus";
import { isOnPrsPage } from "./utils/isOnPrsPage";

const LOG_PREFIX = "[BatchUpdate]";

const UPDATE_BRANCH_BUTTON_CLASS = "gh-ui-booster-update-branch-btn";
const BATCH_UPDATE_BUTTON_CLASS = "gh-ui-booster-batch-update-btn";
const SPINNER_PARENT =
  "#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div";

const MAX_WAVES = 10;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000;

let abortController: AbortController | null = null;

export async function addUpdateBranchButton(
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  if (!isOnPrsPage(instanceConfig)) return;

  if (abortController) {
    console.log(`${LOG_PREFIX} Aborting previous run`);
    abortController.abort();
  }

  abortController = new AbortController();
  const { signal } = abortController;

  try {
    console.log(`${LOG_PREFIX} Starting PR branch analysis...`);
    const analyses = await analyzePrBranchStatus(
      octokit,
      instanceConfig,
      signal,
    );

    if (signal.aborted) {
      console.log(`${LOG_PREFIX} Aborted after analysis`);
      return;
    }

    console.log(`${LOG_PREFIX} Rendering per-PR buttons and batch button...`);
    renderPerPrButtons(analyses, octokit, instanceConfig);
    renderBatchButton(analyses, octokit, instanceConfig);
  } catch (error) {
    if (signal.aborted) {
      console.log(`${LOG_PREFIX} Execution aborted.`);
    } else {
      console.error(`${LOG_PREFIX} Error processing pull requests:`, error);
    }
  } finally {
    abortController = null;
  }
}

function renderPerPrButtons(
  analyses: PrBranchAnalysis[],
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  for (const analysis of analyses) {
    const prRow = document.querySelector(`div[id=issue_${analysis.pr.number}]`);
    if (!prRow) continue;

    if (analysis.status === "dirty") {
      const { root } =
        createReactRoot(prRow, "gh-ui-booster-conflicts-hint") || {};
      if (!root) continue;

      root.render(
        <React.StrictMode>
          <ConflictsHint />
        </React.StrictMode>,
      );
    } else if (analysis.status === "behind" && analysis.mergeBaseSha) {
      const { root, rootSpanEl } =
        createReactRoot(prRow, UPDATE_BRANCH_BUTTON_CLASS) || {};
      if (!root) continue;

      root.render(
        <React.StrictMode>
          <UpdateBranchButton
            octokit={octokit}
            instanceConfig={instanceConfig}
            pr={analysis.pr}
            lastDeviatingSha={analysis.mergeBaseSha}
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
}

function renderBatchButton(
  analyses: PrBranchAnalysis[],
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  const behindPrs = analyses.filter((a) => a.status === "behind");
  if (behindPrs.length === 0) {
    console.log(`${LOG_PREFIX} No behind PRs — batch button not rendered`);
    removeBatchButton();
    return;
  }

  console.log(
    `${LOG_PREFIX} Rendering batch button for ${behindPrs.length} behind PRs: ${behindPrs.map((a) => `#${a.pr.number}`).join(", ")}`,
  );

  const toolbarEl = document.querySelector(SPINNER_PARENT);
  if (!toolbarEl) {
    console.warn(`${LOG_PREFIX} Toolbar element not found: ${SPINNER_PARENT}`);
    return;
  }

  let containerEl = toolbarEl.querySelector(`.${BATCH_UPDATE_BUTTON_CLASS}`);
  if (!containerEl) {
    containerEl = document.createElement("span");
    containerEl.classList.add(BATCH_UPDATE_BUTTON_CLASS);
    toolbarEl.appendChild(containerEl);
  }

  const root = createRoot(containerEl);

  const handleClick = () => {
    console.log(`${LOG_PREFIX} "Update All" clicked`);
    void executeBatchUpdate(
      octokit,
      instanceConfig,
      behindPrs,
      root,
      containerEl as HTMLElement,
    );
  };

  root.render(
    <React.StrictMode>
      <BatchUpdateButton
        totalBehind={behindPrs.length}
        isUpdating={false}
        progress={null}
        onClick={handleClick}
      />
    </React.StrictMode>,
  );
}

function removeBatchButton() {
  const existing = document.querySelector(`.${BATCH_UPDATE_BUTTON_CLASS}`);
  if (existing) existing.remove();
}

async function executeBatchUpdate(
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  initialBehindPrs: PrBranchAnalysis[],
  root: Root,
  containerEl: HTMLElement,
) {
  let completedTotal = 0;
  let grandTotal = initialBehindPrs.length;
  let currentBehindPrs = initialBehindPrs;

  console.log(`${LOG_PREFIX} ========== BATCH UPDATE STARTED ==========`);
  console.log(
    `${LOG_PREFIX} Initial queue: ${grandTotal} PRs — ${initialBehindPrs.map((a) => `#${a.pr.number} (${a.pr.head.ref} → ${a.pr.base.ref}, behind ${a.behindBy})`).join(", ")}`,
  );

  const updateProgress = (current: number, total: number) => {
    root.render(
      <React.StrictMode>
        <BatchUpdateButton
          totalBehind={0}
          isUpdating={true}
          progress={{ current, total }}
          onClick={() => {}}
        />
      </React.StrictMode>,
    );
  };

  updateProgress(completedTotal, grandTotal);

  for (let wave = 0; wave < MAX_WAVES; wave++) {
    if (currentBehindPrs.length === 0) {
      console.log(
        `${LOG_PREFIX} Wave ${wave + 1}: no behind PRs remaining — done`,
      );
      break;
    }

    console.log(
      `${LOG_PREFIX} ---- Wave ${wave + 1}/${MAX_WAVES}: ${currentBehindPrs.length} PRs to update ----`,
    );

    for (const analysis of currentBehindPrs) {
      console.log(
        `${LOG_PREFIX} Updating PR #${analysis.pr.number} "${analysis.pr.title}" (${analysis.pr.head.ref} → ${analysis.pr.base.ref}, behind ${analysis.behindBy}, merge_base=${analysis.mergeBaseSha?.slice(0, 7)})`,
      );

      try {
        const updateStart = Date.now();
        await octokit.pulls.updateBranch({
          owner: instanceConfig.org,
          repo: instanceConfig.repo,
          pull_number: analysis.pr.number,
        });
        console.log(
          `${LOG_PREFIX} PR #${analysis.pr.number}: updateBranch API call succeeded (${Date.now() - updateStart}ms), polling for propagation...`,
        );

        const pollStart = Date.now();
        await pollUntilUpdated(
          analysis.mergeBaseSha!,
          analysis.pr.base.ref,
          analysis.pr.head.ref,
          octokit,
          instanceConfig,
        );
        console.log(
          `${LOG_PREFIX} PR #${analysis.pr.number}: update confirmed after ${Date.now() - pollStart}ms`,
        );
      } catch (error) {
        console.warn(
          `${LOG_PREFIX} PR #${analysis.pr.number}: FAILED — skipping`,
          error,
        );
        if (isRateLimitError(error)) {
          console.error(`${LOG_PREFIX} Rate limit hit! Stopping batch.`);
          renderBatchError(root, "Rate limited. Try again later.");
          return;
        }
      }

      completedTotal++;
      console.log(
        `${LOG_PREFIX} Progress: ${completedTotal}/${grandTotal} completed`,
      );
      updateProgress(completedTotal, grandTotal);
    }

    console.log(
      `${LOG_PREFIX} Wave ${wave + 1} complete. Clearing cache and re-analyzing for dependency chains...`,
    );
    octokit.clearCache();

    const batchAbort = new AbortController();
    const reAnalysis = await analyzePrBranchStatus(
      octokit,
      instanceConfig,
      batchAbort.signal,
    );

    currentBehindPrs = reAnalysis.filter((a) => a.status === "behind");

    if (currentBehindPrs.length > 0) {
      console.log(
        `${LOG_PREFIX} Chain discovery: ${currentBehindPrs.length} new PRs now behind — ${currentBehindPrs.map((a) => `#${a.pr.number}`).join(", ")}`,
      );
      grandTotal += currentBehindPrs.length;
      updateProgress(completedTotal, grandTotal);
    } else {
      console.log(
        `${LOG_PREFIX} No new behind PRs found — chain resolution complete`,
      );
    }
  }

  if (currentBehindPrs.length > 0) {
    console.warn(
      `${LOG_PREFIX} Max waves (${MAX_WAVES}) reached with ${currentBehindPrs.length} PRs still behind`,
    );
  }

  console.log(
    `${LOG_PREFIX} ========== BATCH UPDATE FINISHED: ${completedTotal}/${grandTotal} updated ==========`,
  );

  root.unmount();
  containerEl.remove();

  try {
    Spinner.showSpinner(SPINNER_PARENT);
    await addUpdateBranchButton(octokit, instanceConfig);
  } catch (err) {
    console.error(`${LOG_PREFIX} Error refreshing update branch buttons:`, err);
  } finally {
    Spinner.hideSpinner();
  }
}

function renderBatchError(root: Root, message: string) {
  root.render(
    <React.StrictMode>
      <span
        data-testid="batch-update-error"
        style={{ color: "var(--fgColor-danger, #d1242f)", fontSize: "12px" }}
      >
        {message}
      </span>
    </React.StrictMode>,
  );
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 403 || status === 429;
  }
  return false;
}

async function pollUntilUpdated(
  lastDeviatingSha: string,
  base: string,
  head: string,
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
) {
  const startTime = Date.now();
  let pollCount = 0;

  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    octokit.clearCache();
    pollCount++;
    const { data: newComparison } = await octokit.repos.compareCommits({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      base,
      head,
    });

    const newSha = newComparison.merge_base_commit.sha;
    if (newSha !== lastDeviatingSha) {
      console.log(
        `${LOG_PREFIX} Poll #${pollCount}: merge_base changed ${lastDeviatingSha.slice(0, 7)} → ${newSha.slice(0, 7)} — update propagated`,
      );
      return;
    }

    console.log(
      `${LOG_PREFIX} Poll #${pollCount}: merge_base still ${newSha.slice(0, 7)}, waiting ${POLL_INTERVAL_MS}ms...`,
    );
    await delay(POLL_INTERVAL_MS);
  }

  console.warn(
    `${LOG_PREFIX} TIMEOUT after ${POLL_TIMEOUT_MS}ms (${pollCount} polls) waiting for update to propagate (base: ${base}, head: ${head})`,
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  root.unmount();
  rootSpanEl?.remove();

  const prDescriptionContainer = prRow.children[0];
  if (!prDescriptionContainer) return null;
  prDescriptionContainer.classList.remove(UPDATE_BRANCH_BUTTON_CLASS);

  try {
    Spinner.showSpinner(SPINNER_PARENT);
    await addUpdateBranchButton(octokit, instanceConfig);
  } catch (err) {
    console.error("Error in content_prs_page-script:", err);
  } finally {
    Spinner.hideSpinner();
  }
}
