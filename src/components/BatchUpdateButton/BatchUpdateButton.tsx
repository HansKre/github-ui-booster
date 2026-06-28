import { SyncIcon } from "@primer/octicons-react";
import { Spinner } from "@primer/react";
import { Tooltip } from "@primer/react/next";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./BatchUpdateButton.module.scss";

type Props = {
  totalBehind: number;
  isUpdating: boolean;
  progress: { current: number; total: number } | null;
  onClick: () => void;
};

export const BatchUpdateButton: React.FC<Props> = ({
  totalBehind,
  isUpdating,
  progress,
  onClick,
}) => {
  if (totalBehind === 0 && !isUpdating) return null;

  const label =
    isUpdating && progress
      ? `Updating ${progress.current}/${progress.total}...`
      : `Update All (${totalBehind})`;

  const button = (
    <span
      data-testid="batch-update-button"
      className={cns(
        styles.batchButton,
        isUpdating && styles.batchButton__updating,
      )}
      onClick={isUpdating ? undefined : onClick}
    >
      {isUpdating ? <Spinner size="small" /> : <SyncIcon size={14} />}
      <span className={styles.label}>{label}</span>
    </span>
  );

  return (
    <Tooltip
      text={
        isUpdating
          ? "Updating branches..."
          : "Update all branches that are behind their base"
      }
    >
      {button}
    </Tooltip>
  );
};
