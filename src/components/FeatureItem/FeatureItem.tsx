import { Box, FormControl, ToggleSwitch } from "@primer/react";
import React from "react";
import styles from "./FeatureItem.module.scss";

type Props = {
  label: string;
  caption: string;
  checked: boolean;
  onClick: () => void;
  ariaLabel: string;
};

export const FeatureItem = ({
  label,
  caption,
  checked,
  onClick,
  ariaLabel,
}: Props) => {
  return (
    <Box className={styles.featureItem}>
      <Box className={styles.featureText}>
        <FormControl.Label sx={[styles.featureLabel]}>
          {label}
        </FormControl.Label>
        <FormControl.Caption>{caption}</FormControl.Caption>
      </Box>
      <ToggleSwitch
        size="small"
        checked={checked}
        onClick={onClick}
        aria-label={ariaLabel}
      />
    </Box>
  );
};
