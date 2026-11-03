import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cns } from "ts-type-safe";
import { ClosePopupButton } from "../../components";
import { FilesWithDiff } from "../FilesWithDiff";
import { Files } from "../types";
import styles from "./PrFiles.module.scss";

export type Props = {
  prFiles: Files | undefined;
};

export const PrFiles: React.FC<Props> = ({ prFiles }) => {
  const [isOpen, isOpenSet] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const closePopup = useCallback(() => {
    setTimeout(() => isOpenSet(false));
  }, []);

  const openPopup = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.left });
    }
    isOpenSet(true);
  }, []);

  if (!prFiles) return;

  return (
    <span
      ref={triggerRef}
      className={styles.fileTooltipIcon}
      onClick={openPopup}
    >
      🗂️
      {isOpen &&
        createPortal(
          <div
            className={cns(
              styles.popupContainer,
              styles.popupContainer__hovered,
            )}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 100000,
            }}
          >
            <div className={styles.popupContent}>
              <ClosePopupButton onClick={closePopup} />
              <ul className={styles.list}>
                <FilesWithDiff files={prFiles} />
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
};
