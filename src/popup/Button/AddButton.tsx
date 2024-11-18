import React from "react";
import { Button } from "./Button";

export type Props = {
  disabled: boolean;
};

export const AddButton: React.FC<Props> = ({ disabled }) => {
  return <Button disabled={disabled}>✚ Add instance</Button>;
};
