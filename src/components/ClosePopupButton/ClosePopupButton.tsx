import React from "react";

import { cns } from "ts-type-safe";
import styles from "./ClosePopupButton.module.scss";

type Props = {
  onClick?: () => void;
};

export function ClosePopupButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cns("Button--secondary Button--iconOnly", styles.button)}
    >
      ❌
    </button>
  );
}
