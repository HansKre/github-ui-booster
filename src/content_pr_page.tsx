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
    if (!isOnPrPage(settings)) return;

    if (observer) return;

    Spinner.showSpinner(
      "#repo-content-pjax-container > div > div.clearfix.js-issues-results > div.px-3.px-md-0.ml-n3.mr-n3.mx-md-0.tabnav > nav"
    );

    await handlePrPage(settings);

    Spinner.hideSpinner();

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          handlePrPage(settings);
        }
      });
    });

    observeContentChanges(observer);
  }
}
