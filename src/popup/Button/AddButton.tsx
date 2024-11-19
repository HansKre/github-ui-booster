import React from "react";
import { Button } from "./Button";

export type Props = {
  disabled: boolean;
};

export const AddButton: React.FC<Props> = ({ disabled }) => {
  return (
    <Button
      type="button"
      variant="default"
      disabled={disabled}
      icon={() => (
        <span role="icon" aria-label="icon">
          ✚
        </span>
      )}>
      Add instance
    </Button>
  );
};
