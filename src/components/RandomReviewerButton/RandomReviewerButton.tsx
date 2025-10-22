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

  const handleClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    void assignRandomReviewer(octokit, instanceConfig, isLoadingSet);
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

const getRandomReviewer = (instanceConfig: InstanceConfig) => {
  const reviewers = instanceConfig.randomReviewers
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  return reviewers[Math.floor(Math.random() * reviewers.length)];
};

const getCurrentReviewers = async (
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  prNumber: number,
) => {
  const { data } = await octokit.pulls.listRequestedReviewers({
    owner: instanceConfig.org,
    repo: instanceConfig.repo,
    pull_number: prNumber,
  });

  // Clear the cache to be able to re-fetch the reviewers in case the list changes
  octokit.clearCache();
  return data.users.map((user) => user.login);
};

const removeCurrentReviewers = async (
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  prNumber: number,
  reviewers: string[],
) => {
  if (reviewers.length === 0) return;
  await octokit.pulls.removeRequestedReviewers({
    owner: instanceConfig.org,
    repo: instanceConfig.repo,
    pull_number: prNumber,
    reviewers: reviewers,
  });
};

const requestReview = async (
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  prNumber: number,
  currentReviewers: string[],
) => {
  let randomReviewer = getRandomReviewer(instanceConfig);
  // Get a new random reviewer as long as they're in the current reviewers list
  while (
    instanceConfig.randomReviewers.length > 1 &&
    currentReviewers.includes(randomReviewer)
  ) {
    randomReviewer = getRandomReviewer(instanceConfig);
  }

  try {
    await octokit.pulls.requestReviewers({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      pull_number: prNumber,
      reviewers: [randomReviewer],
    });
  } catch (error) {
    console.error("Error requesting review:", error);
    if (
      error instanceof Error &&
      error.message.includes(
        "Review cannot be requested from pull request author.",
      )
    ) {
      await requestReview(octokit, instanceConfig, prNumber, currentReviewers);
    }
  }
};

const assignRandomReviewer = async (
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

  try {
    const currentReviewers = await getCurrentReviewers(
      octokit,
      instanceConfig,
      prNumber,
    );
    await removeCurrentReviewers(
      octokit,
      instanceConfig,
      prNumber,
      currentReviewers,
    );

    await requestReview(octokit, instanceConfig, prNumber, currentReviewers);
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    alert("Error assigning reviewer. Check console for details.");
  } finally {
    isLoadingSet(false);
  }
};
