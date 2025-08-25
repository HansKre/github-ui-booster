import { Text } from "@primer/react";
import React, { ReactNode } from "react";
import styles from "./Subtitle.module.scss";

type Props = {
  children: ReactNode;
};

export const Subtitle: React.FC<Props> = ({ children }) => {
  return (
    <Text as="p" className={styles.subtitle}>
      {children}
    </Text>
  );
};
