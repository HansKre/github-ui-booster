import { Field, useFormikContext } from "formik";
import React from "react";
import { Paragraph, Subtitle } from "../../../components";
import { Settings } from "../../../services";
import { FormField } from "../../FormField";
import { TestAiButton } from "../../Button";
import styles from "../../FormField/FormField.module.scss";

type Props = {
  disabled: boolean;
};

export const AiTab: React.FC<Props> = ({ disabled }) => {
  const { values } = useFormikContext<Settings>();
  const isAzure = values.ai?.apiType === "azure";

  return (
    <div data-testid="AiTab">
      <Subtitle>
        Configure AI integration for automatic JIRA ticket summarization in PR
        descriptions.
      </Subtitle>

      <div className={styles.fieldWrapper}>
        <label className={styles.label} htmlFor="ai.apiType">
          Provider Type
        </label>
        <Paragraph>Select the API format your AI endpoint uses.</Paragraph>
        <Field
          as="select"
          id="ai.apiType"
          name="ai.apiType"
          className={styles.field}
          disabled={disabled}
        >
          <option value="openai">OpenAI-compatible</option>
          <option value="azure">Azure OpenAI</option>
        </Field>
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

      <TestAiButton disabled={disabled} />
    </div>
  );
};
