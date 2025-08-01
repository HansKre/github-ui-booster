import { Icon } from "@primer/octicons-react";
import { Spinner } from "@primer/react";
import { Tooltip } from "@primer/react/next";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./IconButton.module.scss";

type Props = {
  Icon: Icon;
  onClick: () => void;
  isLoading: boolean;
  tooltipText?: string;
  className?: string;
  loadingClassName?: string;
};

export const IconButton: React.FC<Props> = ({
  Icon,
  onClick,
  isLoading,
  tooltipText,
  className,
  loadingClassName,
}) => {
  // IconButton and Button from @primer are not working, hence the span
  const button = (
    <span
      className={cns(
        "color-fg-muted",
        styles.icon,
        isLoading && styles.icon__loading,
        isLoading && loadingClassName,
        className,
      )}
      onClick={onClick}
    >
      {isLoading ? <Spinner size="small" /> : <Icon />}
    </span>
  );

  return (
    (tooltipText && <Tooltip text={tooltipText}>{button}</Tooltip>) || button
  );
};
