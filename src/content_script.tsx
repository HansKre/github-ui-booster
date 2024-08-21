import { handlePr, handlePrs } from "./content";
import { autoFilter } from "./content/autoFilter";
import { Settings, getSettings } from "./services";

let observer: MutationObserver | null = null;

const observe = (observer: MutationObserver) => {
  const tabNavigation = document.querySelector(".UnderlineNav");
  const filterInput = document.getElementById("js-issues-search");

  // tabNavigation-DOM changes when GH-page-content changes, hence the need to re-run our scripts
  if (tabNavigation) {
    observer.observe(tabNavigation, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  // warum?
  if (filterInput) {
    observer.observe(filterInput, {
      attributes: true,
    });
  }
};

getSettings({
  onSuccess: handleContent,
  onError: () => alert("Couldn't load from chrome storage"),
});

/**
 * This method of content_scripts is automatically executed on initial page load, refreshes, and full navigations.
 *
 * For SPAs and dynamic content, additional strategies like Mutation Observer
 * are needed to ensure the content script is triggered when the page content
 * changes without a full reload.
 */
function handleContent(settings: Settings) {
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
    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          autoFilter(settings.autoFilter);
        }
      });
    });

    observe(observer);
  }
}
