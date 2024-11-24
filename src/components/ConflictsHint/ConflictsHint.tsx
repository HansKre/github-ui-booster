import { Tooltip } from "@primer/react/next";
import React from "react";
import { cns } from "ts-type-safe";

export const ConflictsHint: React.FC = () => {
  return (
    <Tooltip text="The base branch contains changes which need manual conflict resolution">
      <span className={cns("color-fg-muted")}>☣️</span>
    </Tooltip>
  );
};
