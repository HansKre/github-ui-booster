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
  onClick?: () => void;
};

export const Button: React.FC<Props> = ({
  children,
  disabled,
  type,
  result,
  variant,
  loading,
  icon,
  onClick,
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
        onClick={onClick}
        block>
        {children}
      </PrimerButton>
      {result && <p className={styles.result}>{result}</p>}
    </>
  );
};
