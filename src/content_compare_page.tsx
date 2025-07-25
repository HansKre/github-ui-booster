import { addTemplateDescription } from "./content/addTemplateDescription";
import { isOnComparePage } from "./content/utils/isOnComparePage";
import { getInstanceConfig } from "./getInstanceConfig";
import { getSettings, InstanceConfig, Settings } from "./services";

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
  if (!isOnComparePage(instanceConfig)) return;

  try {
    if (settings.features.templateDescription) {
      await addTemplateDescription(settings);
    }
  } catch (err) {
    alert(
      "Error in content_compare_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  }
}
