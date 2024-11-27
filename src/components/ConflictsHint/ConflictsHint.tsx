import { Tooltip } from "@primer/react/next";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./ConflictsHint.module.scss";

export const ConflictsHint: React.FC = () => {
  return (
    <Tooltip text="This branch has conflicts that must be resolved">
      <span className={cns("color-fg-muted", styles.icon)}>☣️</span>
    </Tooltip>
  );
};
