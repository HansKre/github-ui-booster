import { addBaseBranchLabels } from "./content/addBaseBranchLabels";
import { addChangedFiles } from "./content/addChangedFiles";
import { addTotalLines } from "./content/addTotalLines";
import { handlePrFilter } from "./content/handlePrFilter";
import { Spinner } from "./content/spinner";
import { isOnPrsPage } from "./content/utils/isOnPrsPage";
import { urls } from "./content/utils/urls";
import { getSettings, Settings } from "./services";

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
  if (window.location.href.startsWith(urls(settings).urlUiBase)) {
    if (observer) return;

    if (isOnPrsPage(settings)) {
      try {
        Spinner.showSpinner(SPINNER_PARENT);

        await handlePrFilter(settings, settings.autoFilter);
        await addBaseBranchLabels(settings);
        await addChangedFiles(settings);
        await addTotalLines(settings);
      } catch (err) {
        alert(
          "Error in content_prs_page-script. Check console and report if the issue persists."
        );
        console.error(err);
      } finally {
        Spinner.hideSpinner();
      }
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          (mutation.type === "childList" || mutation.type === "attributes") &&
          isOnPrsPage(settings)
        ) {
          handlePrFilter(settings, settings.autoFilter);
          addBaseBranchLabels(settings);
          addChangedFiles(settings);
          addTotalLines(settings);
        }
      });
    });

    observeContentChanges(observer);
  }
}
