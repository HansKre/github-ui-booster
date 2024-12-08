import { Text } from "@primer/react";
import React, { CSSProperties } from "react";

type Props = {
  sx?: CSSProperties;
  children: React.ReactNode;
};
export const Paragraph: React.FC<Props> = ({ sx, children }) => {
  return (
    <Text
      as="p"
      sx={{
        color: "fg.muted",
        mb: "0.75rem",
        ...sx,
      }}
    >
      {children}
    </Text>
  );
};
