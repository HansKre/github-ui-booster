import React from "react";
import { Text } from "@primer/react";

type Props = {
  children: React.ReactNode;
};
export const Paragraph: React.FC<Props> = ({ children }) => {
  return (
    <Text
      as="p"
      sx={{
        color: "fg.default",
        pb: 2,
      }}
    >
      {children}
    </Text>
  );
};
