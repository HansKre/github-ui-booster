import React from "react";
import { Subtitle } from "../../../components";
import { FormField } from "../../FormField";

type Props = {
  disabled: boolean;
};

export const JiraTab: React.FC<Props> = ({ disabled }) => {
  return (
    <>
      <Subtitle>
        Configure Jira integration for automatic issue linking and PR titles.
      </Subtitle>
      <FormField
        label="Jira Base URL"
        name="jira.baseUrl"
        disabled={disabled}
        description="The base URL for your Jira instance."
      />
      <FormField
        label="Jira Personal Access Token"
        name="jira.pat"
        disabled={disabled}
        description="Create new token in Jira > Profile > Personal Access Tokens > create token."
      />
      <FormField
        label="Jira Issue Key Regex"
        name="jira.issueKeyRegex"
        disabled={disabled}
        description="Regex to match Jira issue keys (e.g. PC-\d{4}) in your Pull Request titles."
      />
    </>
  );
};
