import { addBaseBranchLabels } from "./content/addBaseBranchLabels";
import { addChangedFiles } from "./content/addChangedFiles";
import { addTotalLines } from "./content/addTotalLines";
import { handlePrFilter } from "./content/handlePrFilter";
import { reOrderPrs } from "./content/reOrderPrs";
import { Spinner } from "./content/spinner";
import { isFeaturesObject } from "./content/utils/isFeaturesObject";
import { isOnPrsPage } from "./content/utils/isOnPrsPage";
import { getInstanceConfig } from "./getInstanceConfig";
import { AutoFilter, getSettings, InstanceConfig, Settings } from "./services";
import { getOctoInstance } from "./services/getOctoInstance";

let observer: MutationObserver | null = null;

const observeContentChanges = (observer: MutationObserver) => {
  const tabNavigation = document.querySelector(".UnderlineNav");
  if (!tabNavigation) return;

  // tabNavigation-DOM changes when GH-page-content changes, hence the need to re-run our scripts
  observer.observe(tabNavigation, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

getSettings({
  onSuccess: handleContentChange,
  onError: () =>
    alert("Couldn't load your Settings from chrome storage (content_prs_page)"),
});

const SPINNER_PARENT =
  "#js-issues-toolbar > div.table-list-filters.flex-auto.d-flex.min-width-0 > div.flex-auto.d-none.d-lg-block.no-wrap > div";

/**
 * This method is automatically executed on initial page load, refreshes, and full navigations.
 *
 * For SPAs and dynamic content, additional strategies like Mutation Observer
 * are needed to ensure the content script is triggered when the page content
 * changes without a full reload.
 */
async function handleContentChange(settings: Settings) {
  if (observer) return;

  const instanceConfig = getInstanceConfig(settings);
  if (!instanceConfig) return;

  await executeScripts(instanceConfig, settings.autoFilter);

  observer = new MutationObserver((mutations) => {
    mutations.forEach(async (mutation) => {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        await executeScripts(instanceConfig, settings.autoFilter);
      }
    });
  });

  observeContentChanges(observer);
}

async function executeScripts(
  instanceConfig: InstanceConfig,
  autoFilter: AutoFilter
) {
  if (!isOnPrsPage(instanceConfig)) return;
  try {
    Spinner.showSpinner(SPINNER_PARENT);

    const { features } = await chrome.storage.local.get("features");
    if (!isFeaturesObject(features)) throw new Error("Invalid features object");

    if (features.autoFilter) {
      await handlePrFilter(instanceConfig, autoFilter);
    }

    const octokit = getOctoInstance(instanceConfig);

    if (features.baseBranchLabels) {
      await addBaseBranchLabels(octokit, instanceConfig);
    }

    if (features.changedFiles) {
      await addChangedFiles(octokit, instanceConfig);
    }

    if (features.totalLines) {
      await addTotalLines(octokit, instanceConfig);
    }

    if (features.reOrderPrs) {
      // should always be the last script to run
      await reOrderPrs(octokit, instanceConfig);
    }
  } catch (err) {
    alert(
      "Error in content_prs_page-script. Check console and report if the issue persists."
    );
    console.error(err);
  } finally {
    Spinner.hideSpinner();
  }
}
