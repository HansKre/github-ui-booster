import React from "react";
import { FeatureItem, SectionTitle, Subtitle } from "../../../components";
import { Features } from "../../../services/getSettings";
import { FormField } from "../../FormField";

type Props = {
  disabled: boolean;
  features: Features;
  onToggle: (key: keyof Features) => void;
};

export const JiraTab: React.FC<Props> = ({ disabled, features, onToggle }) => {
  return (
    <div
      data-testid="JiraTab"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <Subtitle>
        Configure Jira integration for automatic issue linking and PR titles.
      </Subtitle>

      <SectionTitle>Jira Features</SectionTitle>

      <FeatureItem
        label="Add PR Title from Jira"
        caption="Automatically set the pull request title based on the Jira issue key found in the branch name"
        checked={features.prTitleFromJira}
        onClick={() => onToggle("prTitleFromJira")}
        ariaLabel="Toggle add PR title from Jira"
      />

      <SectionTitle>Configuration</SectionTitle>

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
    </div>
  );
};
