import { handleRandomReviewer, handleTotalLines } from "./content";
import { addCopyBaseBranchToPr } from "./content/addCopyBaseBranchToPr";
import { Spinner } from "./content/spinner";
import { isOnPrPage } from "./content/utils/isOnPrPage";
import { getInstanceConfig } from "./getInstanceConfig";
import { InstanceConfig, Settings, getSettings } from "./services";
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
});

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

  await executeScripts(instanceConfig, settings);

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        void executeScripts(instanceConfig, settings);
      }
    });
  });

  observeContentChanges(observer);
}

async function executeScripts(
  instanceConfig: InstanceConfig,
  settings: Settings,
) {
  if (!isOnPrPage(instanceConfig)) return;

  try {
    Spinner.showSpinner(
      "#repo-content-pjax-container > div > div.clearfix.js-issues-results > div.px-3.px-md-0.ml-n3.mr-n3.mx-md-0.tabnav > nav",
      "ghuibooster__spinner__large",
    );

    const octokit = getOctoInstance(instanceConfig);

    if (settings.features.totalLinesPr) {
      await handleTotalLines(octokit, instanceConfig, settings);
    }

    if (instanceConfig.randomReviewers) {
      handleRandomReviewer(octokit, instanceConfig);
    }

    addCopyBaseBranchToPr(instanceConfig);
  } catch (err) {
    alert(
      "Error in content_prs_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  } finally {
    Spinner.hideSpinner();
  }
}
