import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { FilesWithDiff } from "../FilesWithDiff";
import { Files } from "../types";
import styles from "./PrFiles.module.scss";

type Props = {
  prFiles: Files | undefined;
};

export const PrFiles: React.FC<Props> = ({ prFiles }) => {
  const [open, openSet] = useState(false);

  if (!prFiles) return;

  return (
    <span
      className={styles.fileTooltip}
      onMouseEnter={() => openSet(true)}
      onMouseLeave={() => setTimeout(() => openSet(false), 100)}
    >
      🗂️
      <div className={cns(styles.popup, open && styles.popup__hovered)}>
        <ul>
          <FilesWithDiff files={prFiles} />
        </ul>
      </div>
    </span>
  );
};
