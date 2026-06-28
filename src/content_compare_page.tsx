import { addAiSummary } from "./content/addAiSummary";
import { addPrTitleFromJira } from "./content/addPrTitleFromJira";
import { addDescriptionTemplate } from "./content/addDescriptionTemplate";
import { FetchJiraIssueFull } from "./content/types";
import {
  extractJiraIssueKeyFromBranch,
  isOnComparePage,
} from "./content/utils/comparePageUtils";
import { getInstanceConfig } from "./getInstanceConfig";
import { getSettings, InstanceConfig, JiraService, Settings } from "./services";

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
    if (settings.features.descriptionTemplate) {
      addDescriptionTemplate(settings);
    }

    const issueKey = extractJiraIssueKeyFromBranch(settings);
    let jiraData: FetchJiraIssueFull | null = null;

    if (
      issueKey &&
      (settings.features.prTitleFromJira || settings.features.aiSummary)
    ) {
      try {
        jiraData = await JiraService.fetchJiraIssueFull(issueKey);
      } catch (error) {
        console.error("[JIRA] Failed to fetch issue data:", error);
      }
    }

    if (settings.features.prTitleFromJira && issueKey && jiraData) {
      addPrTitleFromJira(issueKey, jiraData);
    }

    if (settings.features.aiSummary && issueKey && jiraData) {
      await addAiSummary(issueKey, jiraData);
    }
  } catch (err) {
    alert(
      "Error in content_compare_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  }
}
