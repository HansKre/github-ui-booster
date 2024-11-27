import { RestEndpointMethodTypes } from "@octokit/rest";
import { SyncIcon } from "@primer/octicons-react";
import { Spinner } from "@primer/react";
import { Tooltip } from "@primer/react/next";
import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { InstanceConfig } from "../../services";
import styles from "./UpdateBranchButton.module.scss";
import { OctokitWithCache } from "../../services/getOctoInstance";

type Props = {
  octokit: OctokitWithCache;
  instanceConfig: InstanceConfig;
  pr: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];
  lastDeviatingSha: string;
  onSuccess: () => void;
};

export const UpdateBranchButton: React.FC<Props> = ({
  octokit,
  instanceConfig,
  pr,
  lastDeviatingSha,
  onSuccess,
}) => {
  const [isLoading, isLoadingSet] = useState(false);

  // Update the branch to include changes from the base branch
  const handleClick = async () => {
    await updateBranchAndPoll(
      octokit,
      instanceConfig,
      pr,
      lastDeviatingSha,
      onSuccess,
      isLoadingSet
    );
  };

  return (
    <Tooltip text="Update the branch of this PR to include changes from the base branch">
      {/* IconButton and Button from @primer are not working, hence the span */}
      <span
        className={cns(
          "color-fg-muted",
          styles.icon,
          isLoading && styles.icon__loading
        )}
        onClick={handleClick}
      >
        {isLoading ? <Spinner size="small" /> : <SyncIcon size="small" />}
      </span>
    </Tooltip>
  );
};

async function updateBranchAndPoll(
  octokit: OctokitWithCache,
  instanceConfig: { pat: string; org: string; repo: string; ghBaseUrl: string },
  pr: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number],
  lastDeviatingSha: string,
  onSuccess: () => void,
  isLoadingSet: React.Dispatch<React.SetStateAction<boolean>>
) {
  isLoadingSet(true);
  try {
    await octokit.pulls.updateBranch({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      pull_number: pr.number,
    });
    try {
      await pollUntilUpdated(
        lastDeviatingSha,
        pr.base.ref,
        pr.head.ref,
        octokit,
        instanceConfig
      );
    } catch (error) {
      handleError(error, "Error while waiting for the update to propagate");
    }
    onSuccess();
  } catch (error) {
    handleError(error, "Error updating branch");
  } finally {
    isLoadingSet(false);
  }
}

function handleError(error: unknown, msg: string) {
  if (error instanceof Error) {
    alert(`${msg}: ${error.message}`);
  } else {
    alert(`${msg}. Check console for details.`);
  }
  console.error(`${msg}:`, error);
}

async function pollUntilUpdated(
  lastDeviatingSha: string,
  base: string,
  head: string,
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig
) {
  // Poll until the `merge_base_commit.sha` changes
  const timeoutMs = 90000; // Timeout after 90 seconds
  const pollingInterval = 3000; // Check every 3 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    octokit.clearCache();
    try {
      const { data: newComparison } = await octokit.repos.compareCommits({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        base,
        head,
      });
      if (newComparison.merge_base_commit.sha !== lastDeviatingSha) {
        break;
      }
    } catch (err) {
      handleError(err, "Error polling comparison data");
    }

    await delay(pollingInterval);
  }

  // If the timeout is reached, log a warning
  if (Date.now() - startTime >= timeoutMs) {
    console.warn(
      "Timed out waiting for GitHub to propagate the update-branch change."
    );
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
