import { addBaseBranchLabels } from "./content/addBaseBranchLabels";
import { addChangedFiles } from "./content/addChangedFiles";
import { addJiraStatus } from "./content/addJiraStatus";
import { addTotalLines } from "./content/addTotalLines";
import { addUpdateBranchButton } from "./content/addUpdateBranchButton";
import { handlePrFilter } from "./content/handlePrFilter";
import { reOrderPrs } from "./content/reOrderPrs";
import { Spinner } from "./content/spinner";
import {
  getOrCreateHeadingControls,
  getPrRows,
} from "./content/utils/prListDom";
import { isOnPrsPage } from "./content/utils/isOnPrsPage";
import { getInstanceConfig } from "./getInstanceConfig";
import { getSettings, Settings } from "./services";
import { getOctoInstance } from "./services/getOctoInstance";

let observer: MutationObserver | null = null;
let executeScriptsTimer: ReturnType<typeof setTimeout> | null = null;

const SPINNER_PARENT =
  ".gh-ui-booster-heading-controls, #js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div";

const observeContentChanges = (
  observer: MutationObserver,
  settings: Settings,
) => {
  const scheduleExecute = () => {
    if (executeScriptsTimer) clearTimeout(executeScriptsTimer);
    executeScriptsTimer = setTimeout(() => void executeScripts(settings), 150);
  };

  // Observe repo nav tabs so the observer fires on route/tab changes
  const tabNavigation =
    document.querySelector('nav[aria-label="Repository"]') ??
    document.querySelector(".UnderlineNav");
  if (tabNavigation) {
    observer.observe(tabNavigation, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  // On new GH UI, PR rows are loaded into a Turbo Frame after the initial
  // content-script run. Observing the frame catches that deferred population.
  const turboFrame = document.getElementById("repo-content-turbo-frame");
  if (turboFrame) {
    const turboObserver = new MutationObserver(scheduleExecute);
    turboObserver.observe(turboFrame, { childList: true, subtree: false });
  }
};

getSettings({
  onSuccess: handleContentChange,
});

async function handleContentChange(settings: Settings) {
  if (observer) return;

  const instanceConfig = getInstanceConfig(settings);
  if (!instanceConfig || !isOnPrsPage(instanceConfig)) return;

  // Show spinner as early as possible — before any async work starts
  getOrCreateHeadingControls();
  Spinner.showSpinner(SPINNER_PARENT);

  // Set up observer BEFORE executeScripts so that turbo-frame mutations that
  // occur during the initial run (e.g. rows loading while an API call awaits)
  // are captured and trigger a follow-up pass.
  observer = new MutationObserver((mutations) => {
    const relevant = mutations.some(
      (m) => m.type === "childList" || m.type === "attributes",
    );
    if (!relevant) return;
    if (executeScriptsTimer) clearTimeout(executeScriptsTimer);
    executeScriptsTimer = setTimeout(() => void executeScripts(settings), 150);
  });

  observeContentChanges(observer, settings);

  await executeScripts(settings);
}

async function executeScripts(settings: Settings) {
  const instanceConfig = getInstanceConfig(settings);
  if (!instanceConfig) return;

  const { autoFilter, features } = settings;

  if (!isOnPrsPage(instanceConfig)) return;
  try {
    getOrCreateHeadingControls();
    Spinner.showSpinner(SPINNER_PARENT);

    const promises: Promise<void>[] = [];

    if (features.autoFilter) {
      handlePrFilter(instanceConfig, autoFilter);
    }

    const octokit = getOctoInstance(instanceConfig);

    if (features.baseBranchLabels) {
      promises.push(addBaseBranchLabels(octokit, instanceConfig));
    }

    if (features.changedFiles) {
      promises.push(addChangedFiles(octokit, instanceConfig));
    }

    if (features.totalLinesPrs) {
      promises.push(addTotalLines(octokit, instanceConfig, settings));
    }

    promises.push(addJiraStatus(settings));

    if (features.addUpdateBranchButton) {
      promises.push(addUpdateBranchButton(octokit, instanceConfig));
    }

    if (features.reOrderPrs) {
      promises.push(reOrderPrs(octokit, instanceConfig));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  } finally {
    // Keep spinner visible while unprocessed rows still exist (turbo-frame
    // observer will trigger another executeScripts pass once rows appear).
    const rows = getPrRows();
    const processedCount = document.querySelectorAll(
      ".gh-ui-booster-total-lines",
    ).length;
    if (rows.length === 0 || processedCount >= rows.length) {
      Spinner.hideSpinner();
    }
  }
}
