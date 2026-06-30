import { addAiCodeSummary } from "./content/addAiCodeSummary";
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
    console.log("[Compare Page] Features:", JSON.stringify(settings.features));

    if (settings.features.descriptionTemplate) {
      addDescriptionTemplate(settings);
    }

    const issueKey = extractJiraIssueKeyFromBranch(settings);
    console.log("[Compare Page] Issue key:", issueKey);

    let jiraData: FetchJiraIssueFull | null = null;

    if (
      issueKey &&
      (settings.features.prTitleFromJira || settings.features.aiSummary)
    ) {
      try {
        jiraData = await JiraService.fetchJiraIssueFull(issueKey);
        console.log("[Compare Page] JIRA data fetched:", !!jiraData);
      } catch (error) {
        console.error("[Compare Page] JIRA fetch failed:", error);
      }
    }

    if (settings.features.prTitleFromJira && issueKey && jiraData) {
      addPrTitleFromJira(issueKey, jiraData);
    }

    if (settings.features.aiSummary) {
      console.log("[Compare Page] AI Summary enabled, calling addAiSummary");
      if (!issueKey) {
        console.warn("[AI Summary] Skipped: no JIRA issue key found in branch");
      } else if (!jiraData) {
        console.warn("[AI Summary] Skipped: JIRA data fetch failed");
      } else {
        await addAiSummary(issueKey, jiraData);
      }
    } else {
      console.log("[Compare Page] AI Summary feature disabled");
    }

    if (settings.features.aiCodeSummary) {
      console.log("[Compare Page] AI Code Diff Summary enabled");
      await addAiCodeSummary(instanceConfig, settings);
    }
  } catch (err) {
    alert(
      "Error in content_compare_page-script. Check console and report if the issue persists.",
    );
    console.error(err);
  }
}
