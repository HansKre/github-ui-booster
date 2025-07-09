import React, { useCallback, useState } from "react";
import { cns } from "ts-type-safe";
import { FilesWithDiff } from "../FilesWithDiff";
import { Files } from "../types";
import styles from "./PrFiles.module.scss";

export type Props = {
  prFiles: Files | undefined;
};

export const PrFiles: React.FC<Props> = ({ prFiles }) => {
  const [isOpen, isOpenSet] = useState(false);

  const closePopup = useCallback(() => {
    setTimeout(() => {
      isOpenSet(false);
    });
  }, []);

  const openPopup = useCallback(() => {
    isOpenSet(true);
  }, []);

  if (!prFiles) return;

  return (
    <span className={styles.fileTooltipIcon} onClick={openPopup}>
      🗂️
      <div
        className={cns(
          styles.popupContainer,
          isOpen && styles.popupContainer__hovered,
        )}
      >
        <div className={styles.popupContent}>
          <button
            onClick={closePopup}
            className={cns(
              "Button--secondary Button--iconOnly",
              styles.closeButton,
            )}
          >
            ❌
          </button>
          <ul>
            <FilesWithDiff files={prFiles} />
          </ul>
        </div>
      </div>
    </span>
  );
};
