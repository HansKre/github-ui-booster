import { Text } from "@primer/react";
import React, { ReactNode } from "react";
import styles from "./SectionTitle.module.scss";

type Props = {
  children: ReactNode;
};

export const SectionTitle: React.FC<Props> = ({ children }) => {
  return (
    <Text as="h2" className={styles.sectionTitle}>
      {children}
    </Text>
  );
};
