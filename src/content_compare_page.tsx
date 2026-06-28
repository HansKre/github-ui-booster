import { handleRandomReviewer } from "./content";
import { addPrTitleFromJira } from "./content/addPrTitleFromJira";
import { addDescriptionTemplate } from "./content/addDescriptionTemplate";
import { isOnComparePage } from "./content/utils/comparePageUtils";
import { getInstanceConfig } from "./getInstanceConfig";
import { getSettings, InstanceConfig, Settings } from "./services";
import { getOctoInstance } from "./services/getOctoInstance";

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
    const octokit = getOctoInstance(instanceConfig);

    if (settings.features.descriptionTemplate) {
      addDescriptionTemplate(settings);
    }
    if (settings.features.prTitleFromJira) {
      await addPrTitleFromJira(settings);
    }
    if (instanceConfig.randomReviewers) {
      handleRandomReviewer(octokit, instanceConfig);
    }
  } catch (err) {
    alert(
      "Error in content_compare_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  }
}
