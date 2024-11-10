import { DiffAddedIcon, DiffRemovedIcon } from "@primer/octicons-react";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./TotalLines.module.scss";

type Props = {
  totalLinesAdded: number;
  totalLinesRemoved: number;
};

export const TotalLines: React.FC<Props> = ({
  totalLinesAdded,
  totalLinesRemoved,
}) => {
  return (
    <>
      <DiffAddedIcon
        className={cns("color-fg-success", styles.spacing)}
        size="small"
      />
      <span className={cns("color-fg-success", styles.label)}>
        {totalLinesAdded}
      </span>
      <DiffRemovedIcon
        className={cns("color-fg-danger", styles.spacing)}
        size="small"
      />
      <span className={cns("color-fg-danger", styles.label)}>
        {totalLinesRemoved}
      </span>
    </>
  );
};
