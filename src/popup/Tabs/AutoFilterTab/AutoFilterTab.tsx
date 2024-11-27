import React from "react";
import { FormField } from "../../FormField";

type Props = {
  disabled: boolean;
};

export const AutoFilterTab: React.FC<Props> = ({ disabled }) => {
  return (
    <FormField
      label="Filter"
      name="autoFilter.filter"
      disabled={disabled}
      description="The filter to use for pull requests."
    />
  );
};
