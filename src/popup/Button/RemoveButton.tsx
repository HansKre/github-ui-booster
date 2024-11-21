import { NoEntryIcon } from "@primer/octicons-react";
import { Button } from "@primer/react";
import React from "react";

export type Props = {
  disabled: boolean;
  onClick: () => void;
};

export const RemoveButton: React.FC<Props> = ({ disabled, onClick }) => {
  return (
    <Button
      disabled={disabled}
      variant="danger"
      size="small"
      leadingVisual={NoEntryIcon}
      onClick={onClick}
    >
      Remove
    </Button>
  );
};
