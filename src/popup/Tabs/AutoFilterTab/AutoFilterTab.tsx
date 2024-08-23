import React from "react";
import { FormField } from "../../FormField";
import { Paragraph } from "../../Typography";

import { ToggleField } from "../../ToggleField";

type Props = {
  disabled: boolean;
};

export const AutoFilterTab: React.FC<Props> = ({ disabled }) => {
  return (
    <>
      <Paragraph>
        This setting will automatically replace the filter for pull requests by
        the filter you enter here.
      </Paragraph>
      <ToggleField label="Enabled" name="autoFilter.active" />
      <FormField label="Filter" name="autoFilter.filter" disabled={disabled} />
    </>
  );
};
