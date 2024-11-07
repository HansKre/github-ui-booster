import { Text } from "@primer/react";
import React, { useState } from "react";
import { cns } from "ts-type-safe";
import styles from "./PrFiles.module.scss";

type Props = {
  prFiles: string[] | undefined;
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
      📄
      <div className={cns(styles.popup, open && styles.popup__hovered)}>
        {prFiles.map((fileName) => (
          <Text as="p" key={fileName} className={styles.file}>
            {fileName}
          </Text>
        ))}
      </div>
    </span>
  );
};
