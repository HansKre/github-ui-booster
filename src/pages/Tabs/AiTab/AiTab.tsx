import { Field, useFormikContext } from "formik";
import React, { useState } from "react";
import {
  FeatureItem,
  Paragraph,
  SectionTitle,
  Subtitle,
} from "../../../components";
import { DescriptionTemplatePlaceholders } from "../../../content";
import { Settings } from "../../../services";
import { Features } from "../../../services/getSettings";
import { FormField } from "../../FormField";
import { TestAiButton } from "../../Button";
import { AiDebugHints } from "./AiDebugHints";
import styles from "../../FormField/FormField.module.scss";

type Props = {
  disabled: boolean;
  features: Features;
  onToggle: (key: keyof Features) => void;
};

export const AiTab: React.FC<Props> = ({ disabled, features, onToggle }) => {
  const { values } = useFormikContext<Settings>();
  const isAzure = values.ai?.apiType === "azure";
  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <div
      data-testid="AiTab"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <Subtitle>
        Configure AI integration for automatic summarization in PR descriptions.
      </Subtitle>

      <SectionTitle>AI Features</SectionTitle>

      <FeatureItem
        label="AI JIRA Summary"
        caption={`Automatically generate an AI summary from the JIRA ticket description and comments, and insert it into the PR description. Use ${DescriptionTemplatePlaceholders.AI_SUMMARY} in your template to control placement.`}
        checked={features.aiSummary}
        onClick={() => onToggle("aiSummary")}
        ariaLabel="Toggle AI JIRA summary"
      />

      <FeatureItem
        label="AI Code Diff Summary"
        caption={`Automatically generate an AI summary of the code changes (diff) between branches, and insert it into the PR description. Use ${DescriptionTemplatePlaceholders.AI_CODE_SUMMARY} in your template to control placement.`}
        checked={features.aiCodeSummary}
        onClick={() => onToggle("aiCodeSummary")}
        ariaLabel="Toggle AI Code Diff summary"
      />

      <SectionTitle>Configuration</SectionTitle>

      <div className={styles.fieldWrapper}>
        <label className={styles.label} htmlFor="ai.apiType">
          Provider Type
        </label>
        <Paragraph>Select the API format your AI endpoint uses.</Paragraph>
        <div className={styles.selectWrap}>
          <Field
            as="select"
            id="ai.apiType"
            name="ai.apiType"
            className={styles.selectField}
            disabled={disabled}
          >
            <option value="openai">OpenAI-compatible</option>
            <option value="azure">Azure OpenAI</option>
          </Field>
        </div>
      </div>

      <FormField
        label="API URL"
        name="ai.apiUrl"
        disabled={disabled}
        description={
          isAzure
            ? "Base URL of the Azure OpenAI resource (e.g. https://my-resource.openai.azure.com)."
            : "Base URL of the OpenAI-compatible API (e.g. https://api.openai.com/v1). The /chat/completions path is appended automatically."
        }
      />
      <FormField
        label="API Key"
        name="ai.apiKey"
        disabled={disabled}
        description={
          isAzure
            ? "Azure API key. Sent as 'api-key' header."
            : "API key. Sent as 'Authorization: Bearer' header."
        }
      />
      <FormField
        label="Model"
        name="ai.model"
        disabled={disabled}
        description={
          isAzure
            ? "Azure deployment name (e.g. gpt-5.5). Used in the URL path."
            : "Model name sent in the request body (e.g. gpt-4o, claude-sonnet-4-20250514)."
        }
      />

      {isAzure && (
        <FormField
          label="API Version"
          name="ai.apiVersion"
          disabled={disabled}
          description="Azure OpenAI API version (e.g. 2024-10-21)."
        />
      )}

      <TestAiButton
        disabled={disabled}
        onTestResult={(success) => {
          if (!success) setDebugOpen(true);
        }}
      />

      <AiDebugHints open={debugOpen} />
    </div>
  );
};
