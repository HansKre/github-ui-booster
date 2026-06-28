import { useFormikContext } from "formik";
import React, { useState } from "react";
import { hasOwnProperties } from "ts-type-safe";
import { Messages } from "../../content/types";
import { Settings } from "../../services";
import { Button } from "./Button";

type Props = {
  disabled: boolean;
  onTestResult?: (success: boolean) => void;
};

export const TestAiButton: React.FC<Props> = ({ disabled, onTestResult }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { values } = useFormikContext<Settings>();

  const handleTest = () => {
    const aiConfig = values.ai;
    if (!aiConfig?.apiUrl || !aiConfig?.apiKey || !aiConfig?.model) {
      setResult("Fill in API URL, API Key, and Model first.");
      onTestResult?.(false);
      return;
    }

    setLoading(true);
    setResult("");

    chrome.runtime.sendMessage(
      { type: Messages.TEST_AI_CONNECTION, aiConfig },
      (response) => {
        setLoading(false);

        if (chrome.runtime.lastError) {
          setResult(`Error: ${chrome.runtime.lastError.message}`);
          onTestResult?.(false);
          return;
        }

        if (
          hasOwnProperties(response, ["success", "data"]) &&
          response.success &&
          hasOwnProperties(response.data, ["reply"]) &&
          typeof response.data.reply === "string"
        ) {
          setResult(`Success: "${response.data.reply.slice(0, 100)}"`);
          onTestResult?.(true);
        } else if (
          hasOwnProperties(response, ["error"]) &&
          typeof response.error === "string"
        ) {
          setResult(`Failed: ${response.error}`);
          onTestResult?.(false);
        } else {
          setResult(`Failed: ${JSON.stringify(response)}`);
          onTestResult?.(false);
        }
      },
    );
  };

  return (
    <div data-testid="TestAiButton">
      <Button
        onClick={handleTest}
        disabled={disabled || loading}
        loading={loading}
        result={result}
      >
        Test Connection
      </Button>
    </div>
  );
};
