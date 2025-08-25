import { Box, PageLayout, Text } from "@primer/react";
import { Banner } from "@primer/react/drafts";
import React, { useCallback, useEffect, useState } from "react";
import { TabNavigation, Subtitle } from "../components";
import { Features, getSettings, INITIAL_VALUES } from "../services/getSettings";
import { FeatureToggles } from "./FeatureToggles";
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
          showError(chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving your settings",
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
        return (
          <FeatureToggles
            features={features}
            onToggle={handleToggle}
            onError={showError}
            onSuccess={showSuccess}
            onReset={resetBanners}
            onLoadSettings={loadSettings}
          />
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
                <Subtitle>
                  Making your GitHub experience smoother than a freshly polished
                  commit 🚀
                </Subtitle>
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
