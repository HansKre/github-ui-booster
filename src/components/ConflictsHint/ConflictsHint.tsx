import { AlertIcon } from "@primer/octicons-react";
import { Tooltip } from "@primer/react/next";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./ConflictsHint.module.scss";

export const ConflictsHint: React.FC = () => {
  return (
    <Tooltip text="This branch has conflicts that must be resolved">
      {/* Tooltip is not getting triggered without the wrapping span */}
      <span>
        <AlertIcon
          size={16}
          className={cns(styles.icon, "completeness-indicator-problem")}
        />
      </span>
    </Tooltip>
  );
};
