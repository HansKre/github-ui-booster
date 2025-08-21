import { PersonAddIcon } from "@primer/octicons-react";
import React, { useState } from "react";
import { getPrFromLocation } from "../../content/getPrFromLocation";
import { InstanceConfig } from "../../services";
import { OctokitWithCache } from "../../services/getOctoInstance";
import { IconButton } from "../IconButton";
import styles from "./RandomReviewerButton.module.scss";

type Props = {
  octokit: OctokitWithCache;
  instanceConfig: InstanceConfig;
};

export const RandomReviewerButton = ({ octokit, instanceConfig }: Props) => {
  const [isLoading, isLoadingSet] = useState(false);

  const handleClick = () => {
    assignRandomReviewer(octokit, instanceConfig, isLoadingSet);
  };

  return (
    <IconButton
      Icon={PersonAddIcon}
      onClick={handleClick}
      isLoading={isLoading}
      tooltipText="Assign a random reviewer from the configured list"
      className={styles.icon}
    />
  );
};

const assignRandomReviewer = (
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  isLoadingSet: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const prNumber = getPrFromLocation();
  if (!prNumber) return;
  if (!instanceConfig.randomReviewers) {
    alert(
      "No random reviewers configured. Please set them in the extension settings.",
    );
    return;
  }

  isLoadingSet(true);

  const reviewers = instanceConfig.randomReviewers
    .split(",")
    .map((r) => r.trim());
  const randomReviewer =
    reviewers[Math.floor(Math.random() * reviewers.length)];

  octokit.pulls
    .requestReviewers({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      pull_number: prNumber,
      reviewers: [randomReviewer],
    })
    .catch((error) => {
      console.error("Error assigning reviewer:", error);
      alert("Error assigning reviewer. Check console for details.");
    })
    .finally(() => isLoadingSet(false));
};
