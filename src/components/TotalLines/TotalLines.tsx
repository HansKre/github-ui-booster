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
        {` ${totalLinesAdded} `}
      </span>
      <DiffRemovedIcon className="color-fg-danger" size="small" />
      <span className={cns("color-fg-danger", styles.label)}>
        {` ${totalLinesRemoved} `}
      </span>
      <DiffStat
        totalLinesAdded={totalLinesAdded}
        totalLinesRemoved={totalLinesRemoved}
      />
    </>
  );
};

const BLOCKS = 5;

const DiffStat: React.FC<Props> = ({ totalLinesAdded, totalLinesRemoved }) => {
  const totalLines = totalLinesAdded + totalLinesRemoved;
  const positiveBlocksCount = Math.round(
    (totalLinesAdded / totalLines) * BLOCKS
  );

  const blocks = Array.from({ length: BLOCKS }, (_, index) => {
    return (
      <span
        key={index}
        className={
          index < positiveBlocksCount
            ? "diffstat-block-added"
            : "diffstat-block-neutral"
        }
      />
    );
  });

  return <span>{blocks}</span>;
};
