import { PlusIcon } from "@primer/octicons-react";
import React from "react";
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
      icon={PlusIcon}
      onClick={() => push({})}
    >
      Add instance
    </Button>
  );
};
