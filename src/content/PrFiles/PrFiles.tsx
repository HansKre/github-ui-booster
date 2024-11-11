import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { FilesWithDiff } from "../FilesWithDiff";
import { Files } from "../types";
import styles from "./PrFiles.module.scss";

export type Props = {
  prFiles: Files | undefined;
};

export const PrFiles: React.FC<Props> = ({ prFiles }) => {
  const [open, openSet] = useState(false);

  if (!prFiles) return;

  return (
    <span
      className={styles.fileTooltip}
      onMouseEnter={() => openSet(true)}
      onMouseLeave={() => setTimeout(() => openSet(false), 500)}
    >
      🗂️
      <div
        className={cns(
          styles.popupContainer,
          open && styles.popupContainer__hovered
        )}
      >
        <div className={styles.popupContent}>
          <ul>
            <FilesWithDiff files={prFiles} />
          </ul>
        </div>
      </div>
    </span>
  );
};
