import { handlePrPage } from "./content";
import { Spinner } from "./content/spinner";
import { isOnPrPage } from "./content/utils/isOnPrPage";
import { urls } from "./content/utils/urls";
import { Settings, getSettings } from "./services";

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
    alert("Couldn't load your Settings from chrome storage (content_pr_page)"),
});

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

    async function executeScripts() {
      if (!isOnPrPage(settings)) return;

      try {
        Spinner.showSpinner(
          "#repo-content-pjax-container > div > div.clearfix.js-issues-results > div.px-3.px-md-0.ml-n3.mr-n3.mx-md-0.tabnav > nav",
          "ghuibooster__spinner__large"
        );
        await handlePrPage(settings);
      } catch (err) {
        alert(
          "Error in content_prs_page-script. Check console and report if the issue persists."
        );
        console.error(err);
      } finally {
        Spinner.hideSpinner();
      }
    }

    await executeScripts();

    observer = new MutationObserver((mutations) => {
      mutations.forEach(async (mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          await executeScripts();
        }
      });
    });

    observeContentChanges(observer);
  }
}
