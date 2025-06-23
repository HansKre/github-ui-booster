import { Box, PageLayout, Text } from "@primer/react";
import { Banner } from "@primer/react/drafts";
import React, { useCallback, useEffect, useState } from "react";
import { FeatureItem } from "../components";
import { Features, getSettings, INITIAL_VALUES } from "../services/getSettings";
import styles from "./Options.module.scss";

export const Options = () => {
  const [features, setFeatures] = useState<Features>(INITIAL_VALUES.features);
  const [error, setError] = useState<string | undefined>();

  const loadSettings = useCallback(
    () =>
      getSettings({
        onSuccess: (settings) => {
          setFeatures(settings.features);
        },
        onError: () => alert("Couldn't load your settings from chrome storage"),
      }),
    [],
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
          setError(chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving your settings",
      );
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

            <Text as="h2" className={styles.sectionTitle}>
              Features
            </Text>

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
            </Box>
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
};
