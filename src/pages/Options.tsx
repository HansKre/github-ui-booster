import {
  Box,
  FormControl,
  PageLayout,
  Text,
  ToggleSwitch,
} from "@primer/react";
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
          setError(chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving your settings"
      );
    }
  };

  return (
    <Box
      className={styles.container}
      sx={{ backgroundColor: "canvas.default" }}>
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

              <Box className={styles.featureItem}>
                <Box className={styles.featureText}>
                  <FormControl.Label sx={[styles.featureLabel]}>
                    Reorder Pull Requests
                  </FormControl.Label>
                  <FormControl.Caption>
                    Automatically organize pull requests by base branch,
                    visually nesting child pull requests under their parent for
                    clearer hierarchy
                  </FormControl.Caption>
                </Box>
                <ToggleSwitch
                  size="small"
                  checked={features.reOrderPrs}
                  onClick={() => handleToggle("reOrderPrs")}
                  aria-label="Toggle reorder pull requests"
                />
              </Box>

              <FeatureItem
                label="Auto Filter"
                caption="Automatically apply filters to pull requests list"
                checked={features.autoFilter}
                onClick={() => handleToggle("autoFilter")}
                ariaLabel="Toggle auto filter"
              />
            </Box>
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
};
