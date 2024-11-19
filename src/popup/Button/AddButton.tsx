import React from "react";
import { INITIAL_VALUES } from "../../services";
import { Button } from "./Button";

export type Props = {
  disabled: boolean;
  push: (obj: unknown) => void;
};

export const AddButton: React.FC<Props> = ({ disabled, push }) => {
  return (
    <Button
      type="button"
      variant="default"
      disabled={disabled}
      icon={() => (
        <span role="icon" aria-label="icon">
          ✚
        </span>
      )}
      onClick={() => push(INITIAL_VALUES.instances[0])}>
      Add instance
    </Button>
  );
};
