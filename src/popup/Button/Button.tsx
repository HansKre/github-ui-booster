import { Button as PrimerButton } from "@primer/react";
import { VariantType } from "@primer/react/lib-esm/Button/types";
import React from "react";
import styles from "./Button.module.scss";

type Props = {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  children?: React.ReactNode;
  result?: string;
  variant?: VariantType;
  loading?: boolean;
  icon?: React.ElementType;
};

export const Button: React.FC<Props> = ({
  children,
  disabled,
  type,
  result,
  variant,
  loading,
  icon,
}) => {
  return (
    <>
      <PrimerButton
        type={type}
        disabled={disabled}
        className={styles.button}
        variant={variant}
        leadingVisual={icon}
        loading={loading}
        block>
        {children}
      </PrimerButton>
      {result && <p className={styles.result}>{result}</p>}
    </>
  );
};
