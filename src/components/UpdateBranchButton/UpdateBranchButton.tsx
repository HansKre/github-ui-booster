import { Octokit } from "@octokit/rest";
import { SyncIcon } from "@primer/octicons-react";
import { Spinner } from "@primer/react";
import { Tooltip } from "@primer/react/next";
import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { InstanceConfig } from "../../services";
import styles from "./UpdateBranchButton.module.scss";

type Props = {
  octokit: Octokit;
  instanceConfig: InstanceConfig;
  prNumber: number;
  onSuccess: () => void;
};

export const UpdateBranchButton: React.FC<Props> = ({
  octokit,
  instanceConfig,
  prNumber,
  onSuccess,
}) => {
  const [isLoading, isLoadingSet] = useState(false);

  // Update the branch to include changes from the base branch
  const handleClick = (
    octokit: Octokit,
    instanceConfig: InstanceConfig,
    prNumber: number
  ) => {
    isLoadingSet(true);
    octokit.pulls
      .updateBranch({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        pull_number: prNumber,
      })
      .then(() => {
        onSuccess();
      })
      .catch((error) => {
        if (error.message) {
          alert(`Error updating branch: ${error.message}`);
        } else {
          alert("Error updating branch. Check console for details.");
        }
        console.error("Error updating branch:", error);
      })
      .finally(() => {
        isLoadingSet(false);
      });
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
        onClick={() => handleClick(octokit, instanceConfig, prNumber)}
      >
        {isLoading ? <Spinner size="small" /> : <SyncIcon size="small" />}
      </span>
    </Tooltip>
  );
};
