import { handlePr, handlePrs } from "./content";
import { handlePrFilter } from "./content/handlePrFilter";
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
  onError: () => alert("Couldn't load your Settings from chrome storage"),
});

/**
 * This method of content_scripts is automatically executed on initial page load, refreshes, and full navigations.
 *
 * For SPAs and dynamic content, additional strategies like Mutation Observer
 * are needed to ensure the content script is triggered when the page content
 * changes without a full reload.
 */
function handleContentChange(settings: Settings) {
  const baseUiUrl = `${settings.ghBaseUrl.replace("/api/v3", "")}/${
    settings.org
  }/${settings.repo}`;
  const prsUiUrl = `${baseUiUrl}/pulls`;
  const prUiUrl = `${baseUiUrl}/pull`;

  if (window.location.href.startsWith(prsUiUrl)) {
    handlePrs(settings);
  }
  if (window.location.href.startsWith(prUiUrl)) handlePr(settings);

  if (window.location.href.startsWith(baseUiUrl)) {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          handlePrFilter(settings.autoFilter);
        }
      });
    });

    observeContentChanges(observer);
  }
}
