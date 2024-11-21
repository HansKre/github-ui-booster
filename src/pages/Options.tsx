import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  PageLayout,
  Text,
  ToggleSwitch,
  Flash,
} from "@primer/react";
import { Features } from "../services/getSettings";
import styles from "./Options.module.scss";
import { isFeaturesObject } from "../content/utils/isFeaturesObject";

export const Options = () => {
  const [features, setFeatures] = useState<Features>({
    baseBranchLabels: true,
    changedFiles: true,
    totalLines: true,
    autoFilter: false,
  });
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    try {
      chrome.storage.local.get("features", (data) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          return;
        }
        if (data.features && isFeaturesObject(data.features)) {
          setFeatures(data.features);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

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
      setError(err instanceof Error ? err.message : "An error occurred");
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
            {error && (
              <Flash variant="danger" sx={{ mb: 3 }}>
                {error}
              </Flash>
            )}

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
              <Box className={styles.featureItem}>
                <Box className={styles.featureText}>
                  <FormControl.Label sx={[styles.featureLabel]}>
                    Base Branch Labels
                  </FormControl.Label>
                  <FormControl.Caption>
                    Show base branch information for each pull request
                  </FormControl.Caption>
                </Box>
                <ToggleSwitch
                  size="small"
                  checked={features.baseBranchLabels}
                  onClick={() => handleToggle("baseBranchLabels")}
                  aria-label="Toggle base branch labels"
                />
              </Box>

              <Box className={styles.featureItem}>
                <Box className={styles.featureText}>
                  <FormControl.Label sx={[styles.featureLabel]}>
                    Changed Files
                  </FormControl.Label>
                  <FormControl.Caption>
                    Display changed files information and enable file search
                    functionality
                  </FormControl.Caption>
                </Box>
                <ToggleSwitch
                  size="small"
                  checked={features.changedFiles}
                  onClick={() => handleToggle("changedFiles")}
                  aria-label="Toggle changed files display"
                />
              </Box>

              <Box className={styles.featureItem}>
                <Box className={styles.featureText}>
                  <FormControl.Label sx={[styles.featureLabel]}>
                    Total Lines Counter
                  </FormControl.Label>
                  <FormControl.Caption>
                    Show total lines added and removed in pull requests
                  </FormControl.Caption>
                </Box>
                <ToggleSwitch
                  size="small"
                  checked={features.totalLines}
                  onClick={() => handleToggle("totalLines")}
                  aria-label="Toggle total lines counter"
                />
              </Box>

              <Box className={styles.featureItem}>
                <Box className={styles.featureText}>
                  <FormControl.Label sx={[styles.featureLabel]}>
                    Auto Filter
                  </FormControl.Label>
                  <FormControl.Caption>
                    Automatically apply filters to pull requests list
                  </FormControl.Caption>
                </Box>
                <ToggleSwitch
                  size="small"
                  checked={features.autoFilter}
                  onClick={() => handleToggle("autoFilter")}
                  aria-label="Toggle auto filter"
                />
              </Box>
            </Box>
          </Box>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  );
};
