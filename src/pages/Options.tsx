import { Box, PageLayout, Text } from "@primer/react";
import { Banner } from "@primer/react/drafts";
import React, { useCallback, useEffect, useState } from "react";
import { FeatureInput, FeatureItem, TabNavigation } from "../components";
import { TemplateDescriptionParameters } from "../content";
import { Features, getSettings, INITIAL_VALUES } from "../services/getSettings";
import { ExportButton } from "./ExportButton";
import { ImportButton } from "./ImportButton";
import { SettingsTab } from "./SettingsTab";
import styles from "./Options.module.scss";

export type OptionsTab = "Settings" | "Feature Toggles";

const tabs: Array<OptionsTab> = ["Settings", "Feature Toggles"];

export const Options = () => {
  const [activeTab, setActiveTab] = useState<OptionsTab>("Settings");
  const [features, setFeatures] = useState<Features>(INITIAL_VALUES.features);
  const [error, errorSet] = useState<string | undefined>();
  const [success, successSet] = useState<string | undefined>();

  const loadSettings = useCallback(
    () =>
      getSettings({
        onSuccess: (settings) => {
          setFeatures(settings.features);
        },
      }),
    []
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = (key: keyof Features) => {
    try {
      const updatedFeatures = {
        ...features,
        [key]: !features[key],
      };
      setFeatures(updatedFeatures);
      chrome.storage.local.set({ features: updatedFeatures }, () => {
        if (chrome.runtime.lastError) {
          showError(chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving your settings"
      );
    }
  };

  const resetBanners = () => {
    errorSet(undefined);
    successSet(undefined);
  };

  const showError = (message?: string) => {
    resetBanners();
    errorSet(message);
  };

  const showSuccess = (message: string) => {
    resetBanners();
    successSet(message);
  };

  const renderFeatureTogglesTab = () => (
    <>
      <Box className={styles.featuresList}>
        <FeatureItem
          label="Base Branch Labels"
          caption="Show base branch information for each pull request"
          checked={features.baseBranchLabels}
          onClick={() => handleToggle("baseBranchLabels")}
          ariaLabel="Toggle base branch labels"
        />

        <FeatureItem
          label="Changed Files"
          caption="Display changed files information and enable file search functionality"
          checked={features.changedFiles}
          onClick={() => handleToggle("changedFiles")}
          ariaLabel="Toggle changed files"
        />

        <FeatureItem
          label="Total Lines Counter"
          caption="Show total lines added and removed in pull requests"
          checked={features.totalLines}
          onClick={() => handleToggle("totalLines")}
          ariaLabel="Toggle total lines counter"
        />

        <FeatureItem
          label="Reorder Pull Requests"
          caption="Automatically organize pull requests by base branch,
              visually nesting child pull requests under their parent for
              clearer hierarchy"
          checked={features.reOrderPrs}
          onClick={() => handleToggle("reOrderPrs")}
          ariaLabel="Toggle reorder pull requests"
        />

        <FeatureItem
          label="Add Update Branch Button"
          caption="If a pull request is behind the base branch, this feature adds a button to update the branch of a pull request to include changes from the base branch"
          checked={features.addUpdateBranchButton}
          onClick={() => handleToggle("addUpdateBranchButton")}
          ariaLabel="Toggle add update branch button"
        />

        <FeatureItem
          label="Auto Filter"
          caption="Automatically apply filters to pull requests list"
          checked={features.autoFilter}
          onClick={() => handleToggle("autoFilter")}
          ariaLabel="Toggle auto filter"
        />

        <FeatureItem
          label="Jira Integration"
          caption="Enable Jira integration to enhance pull request management with Jira issue keys"
          checked={features.jira}
          onClick={() => handleToggle("jira")}
          ariaLabel="Toggle Jira integration"
        />

        <FeatureItem
          label="Assign random reviewer"
          caption="Automatically assign a random reviewer to pull requests."
          checked={features.randomReviewer}
          onClick={() => handleToggle("randomReviewer")}
          ariaLabel="Toggle assign random reviewer"
        />

        <FeatureItem
          label="Add PR Title from Jira"
          caption="Automatically set the pull request title based on the Jira issue key found in the branch name"
          checked={features.prTitleFromJira}
          onClick={() => handleToggle("prTitleFromJira")}
          ariaLabel="Toggle add PR title from Jira"
        />

        <FeatureItem
          label="Template Description"
          caption={`Add a template description to pull requests. You can use Markdown syntax for formatting.
          Add ${TemplateDescriptionParameters.JIRA_TICKET} to automatically insert the link to the Jira ticket based on the branch name.`}
          checked={features.templateDescription}
          onClick={() => handleToggle("templateDescription")}
          ariaLabel="Toggle template description"
        />
        {features.templateDescription && (
          <FeatureInput
            storageKey="templateDescription"
            placeholder="Enter a template description"
            ariaLabel="Template Description"
            onError={showError}
          />
        )}
      </Box>

      <Text as="h2" className={styles.sectionTitle}>
        Export & Import Settings
      </Text>

      <Text as="p" className={styles.subtitle}>
        You can export your current settings as a JSON file. Your settings
        contain access tokens. Be careful and make sure to remove your tokens
        before sharing.
      </Text>

      <Box display="grid" gridTemplateColumns="1fr 1fr" sx={{ gap: 4 }}>
        <ExportButton
          onError={showError}
          onSuccess={() => showSuccess("Exported settings successfully")}
          onClick={resetBanners}
        />
        <ImportButton
          onError={showError}
          onSuccess={() => {
            loadSettings();
            showSuccess("Imported settings successfully");
          }}
          onClick={resetBanners}
        />
      </Box>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Settings":
        return (
          <SettingsTab
            features={features}
            onError={showError}
            onSuccess={showSuccess}
            onReset={resetBanners}
          />
        );
      case "Feature Toggles":
        return renderFeatureTogglesTab();
    }
  };

  return (
    <Box
      className={styles.container}
      sx={{ backgroundColor: "canvas.default" }}
    >
      <PageLayout padding="none" containerWidth="full">
        <PageLayout.Content>
          <Box className={styles.content}>
            {error && <Banner variant="critical">{error}</Banner>}
            {success && <Banner variant="success">{success}</Banner>}

            <Box className={styles.header}>
              <img
                src="/icon128.png"
                alt="GitHub UI Booster Logo"
                className={styles.logo}
              />
              <Box>
                <Text as="h1" className={styles.title}>
                  GitHub UI Booster Options
                </Text>
                <Text as="p" className={styles.subtitle}>
                  Making your GitHub experience smoother than a freshly polished
                  commit 🚀
                </Text>
              </Box>
            </Box>

            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
            />

            {renderTabContent()}
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
};
