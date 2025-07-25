import { addPrTitleFromJira } from "./content/addPrTitleFromJira";
import { addTemplateDescription } from "./content/addTemplateDescription";
import { isOnComparePage } from "./content/utils/comparePageUtils";
import { getInstanceConfig } from "./getInstanceConfig";
import { getSettings, InstanceConfig, Settings } from "./services";

getSettings({
  onSuccess: handleContentChange,
});

async function handleContentChange(settings: Settings) {
  const instanceConfig = getInstanceConfig(settings);
  if (!instanceConfig) return;

  await executeScripts(instanceConfig, settings);
}

async function executeScripts(
  instanceConfig: InstanceConfig,
  settings: Settings,
) {
  if (!isOnComparePage(instanceConfig)) return;

  try {
    if (settings.features.templateDescription) {
      addTemplateDescription(settings);
    }
    if (settings.features.prTitleFromJira) {
      await addPrTitleFromJira(settings);
    }
  } catch (err) {
    alert(
      "Error in content_compare_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  }
}
