import { Box } from "@primer/react";
import React from "react";
import {
  FeatureInput,
  FeatureItem,
  SectionTitle,
  Subtitle,
} from "../../../components";
import { TemplateDescriptionParameters } from "../../../content";
import { Features } from "../../../services/getSettings";
import styles from "./FeatureTogglesTab.module.scss";

type Props = {
  features: Features;
  onToggle: (key: keyof Features) => void;
  onError: (message?: string) => void;
};

export const FeatureTogglesTab: React.FC<Props> = ({
  features,
  onToggle,
  onError,
}) => {
  return (
    <>
      <Box className={styles.featuresList}>
        <Subtitle>
          Enable and disable Extension-features. Features are organized by
          GitHub-page.
        </Subtitle>

        <SectionTitle>Pull Requests List</SectionTitle>

        <FeatureItem
          label="Base Branch Labels"
          caption="Show base branch information for each pull request"
          checked={features.baseBranchLabels}
          onClick={() => onToggle("baseBranchLabels")}
          ariaLabel="Toggle base branch labels"
        />

        <FeatureItem
          label="Changed Files"
          caption="Display changed files information and enable file search functionality"
          checked={features.changedFiles}
          onClick={() => onToggle("changedFiles")}
          ariaLabel="Toggle changed files"
        />

        <FeatureItem
          label="Total Lines Counter"
          caption="Show total lines added and removed in pull requests"
          checked={features.totalLines}
          onClick={() => onToggle("totalLines")}
          ariaLabel="Toggle total lines counter"
        />

        <FeatureItem
          label="Reorder Pull Requests"
          caption="Automatically organize pull requests by base branch,
              visually nesting child pull requests under their parent for
              clearer hierarchy"
          checked={features.reOrderPrs}
          onClick={() => onToggle("reOrderPrs")}
          ariaLabel="Toggle reorder pull requests"
        />

        <FeatureItem
          label="Add Update Branch Button"
          caption="If a pull request is behind the base branch, this feature adds a button to update the branch of a pull request to include changes from the base branch"
          checked={features.addUpdateBranchButton}
          onClick={() => onToggle("addUpdateBranchButton")}
          ariaLabel="Toggle add update branch button"
        />

        <FeatureItem
          label="Auto Filter"
          caption="Automatically apply filters to pull requests list"
          checked={features.autoFilter}
          onClick={() => onToggle("autoFilter")}
          ariaLabel="Toggle auto filter"
        />

        <SectionTitle>Individual Pull Request</SectionTitle>

        <FeatureItem
          label="Assign random reviewer"
          caption="Automatically assign a random reviewer to pull requests."
          checked={features.randomReviewer}
          onClick={() => onToggle("randomReviewer")}
          ariaLabel="Toggle assign random reviewer"
        />

        <SectionTitle>Create Pull Request</SectionTitle>

        <FeatureItem
          label="Jira Integration"
          caption="Enable Jira integration to enhance pull request management with Jira issue keys"
          checked={features.jira}
          onClick={() => onToggle("jira")}
          ariaLabel="Toggle Jira integration"
        />

        <FeatureItem
          label="Add PR Title from Jira"
          caption="Automatically set the pull request title based on the Jira issue key found in the branch name"
          checked={features.prTitleFromJira}
          onClick={() => onToggle("prTitleFromJira")}
          ariaLabel="Toggle add PR title from Jira"
        />

        <FeatureItem
          label="Template Description"
          caption={`Add a template description to pull requests. You can use Markdown syntax for formatting.
          Add ${TemplateDescriptionParameters.JIRA_TICKET} to automatically insert the link to the Jira ticket based on the branch name.`}
          checked={features.templateDescription}
          onClick={() => onToggle("templateDescription")}
          ariaLabel="Toggle template description"
        />
        {features.templateDescription && (
          <FeatureInput
            storageKey="templateDescription"
            placeholder="Enter a template description"
            ariaLabel="Template Description"
            onError={onError}
          />
        )}
      </Box>
    </>
  );
};
