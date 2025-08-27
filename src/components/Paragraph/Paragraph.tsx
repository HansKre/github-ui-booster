import { Text } from "@primer/react";
import React, { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  sx?: CSSProperties;
};

export const Paragraph: React.FC<Props> = ({ children, sx }) => {
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
