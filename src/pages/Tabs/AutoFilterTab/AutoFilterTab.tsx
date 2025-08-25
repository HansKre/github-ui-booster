import React from "react";
import { Subtitle } from "../../../components";
import { FormField } from "../../FormField";

type Props = {
  disabled: boolean;
};

export const AutoFilterTab: React.FC<Props> = ({ disabled }) => {
  return (
    <>
      <Subtitle>Set up automatic filters for pull requests.</Subtitle>
      <FormField
        label="Filter"
        name="autoFilter.filter"
        disabled={disabled}
        description="The filter to use for pull requests."
      />
    </>
  );
};
