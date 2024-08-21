import React from "react";
import { FormField } from "../../FormField";
import { Paragraph } from "../../Typography";

export const AutoFilterTab = () => {
  return (
    <>
      <Paragraph>
        This setting will automatically replace the filter for pull requests by
        the filter you enter here.
      </Paragraph>
      <FormField label="Filter" name="autoFilter.filter" />
    </>
  );
};
