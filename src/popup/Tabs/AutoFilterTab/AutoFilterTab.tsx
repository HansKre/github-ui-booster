import React from "react";
import { FormField } from "../../FormField";
import { ToggleField } from "../../ToggleField";

type Props = {
  disabled: boolean;
};

export const AutoFilterTab: React.FC<Props> = ({ disabled }) => {
  return (
    <>
      <ToggleField
        label="Enabled"
        name="autoFilter.active"
        description="This setting will automatically replace the filter for pull requests by the filter you enter here."
      />
      <FormField
        label="Filter"
        name="autoFilter.filter"
        disabled={disabled}
        description="The filter to use for pull requests."
      />
    </>
  );
};
