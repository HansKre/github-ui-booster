import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  PageLayout,
  Text,
  ToggleSwitch,
  Flash,
} from "@primer/react";

type FeatureState = {
  baseBranchLabels: boolean;
  changedFiles: boolean;
  totalLines: boolean;
  autoFilter: boolean;
};

export const Options = () => {
  const [features, setFeatures] = useState<FeatureState>({
    baseBranchLabels: true,
    changedFiles: true,
    totalLines: true,
    autoFilter: false,
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      chrome.storage.sync.get("features", (data) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? "");
          return;
        }
        if (data.features) {
          setFeatures(data.features);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, []);

  const handleToggle = (key: keyof FeatureState) => {
    try {
      const updatedFeatures = {
        ...features,
        [key]: !features[key],
      };
      setFeatures(updatedFeatures);
      chrome.storage.sync.set({ features: updatedFeatures }, () => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? "");
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <PageLayout>
      <PageLayout.Content>
        <Box sx={{ maxWidth: 800, mx: "auto", py: 4, px: 3 }}>
          {error && (
            <Flash variant="danger" sx={{ mb: 3 }}>
              {error}
            </Flash>
          )}

          <Text as="h1" sx={{ fontSize: 24, fontWeight: "bold", mb: 4 }}>
            Features
          </Text>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl>
              <FormControl.Label>Base Branch Labels</FormControl.Label>
              <ToggleSwitch
                size="small"
                checked={features.baseBranchLabels}
                onClick={() => handleToggle("baseBranchLabels")}
                aria-label="Toggle base branch labels"
              />
              <FormControl.Caption>
                Show base branch information for each pull request
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <FormControl.Label>Changed Files</FormControl.Label>
              <ToggleSwitch
                size="small"
                checked={features.changedFiles}
                onClick={() => handleToggle("changedFiles")}
                aria-label="Toggle changed files display"
              />
              <FormControl.Caption>
                Display changed files information and enable file search
                functionality
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <FormControl.Label>Total Lines Counter</FormControl.Label>
              <ToggleSwitch
                size="small"
                checked={features.totalLines}
                onClick={() => handleToggle("totalLines")}
                aria-label="Toggle total lines counter"
              />
              <FormControl.Caption>
                Show total lines added and removed in pull requests
              </FormControl.Caption>
            </FormControl>

            <FormControl>
              <FormControl.Label>Auto Filter</FormControl.Label>
              <ToggleSwitch
                size="small"
                checked={features.autoFilter}
                onClick={() => handleToggle("autoFilter")}
                aria-label="Toggle auto filter"
              />
              <FormControl.Caption>
                Automatically apply filters to pull requests list
              </FormControl.Caption>
            </FormControl>
          </Box>
        </Box>
      </PageLayout.Content>
    </PageLayout>
  );
};
