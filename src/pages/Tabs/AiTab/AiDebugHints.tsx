import { useFormikContext } from "formik";
import React, { useState } from "react";
import { Paragraph } from "../../../components";
import { Settings } from "../../../services";

function buildEndpointUrl(ai: Settings["ai"]): string {
  if (!ai?.apiUrl) return "(configure API URL above)";
  const baseUrl = ai.apiUrl.replace(/\/$/, "");

  if (ai.apiType === "azure") {
    const version = ai.apiVersion || "2024-10-21";
    const model = ai.model || "{deployment}";
    return `${baseUrl}/openai/deployments/${model}/chat/completions?api-version=${version}`;
  }

  return `${baseUrl}/chat/completions`;
}

function buildCurlCommand(ai: Settings["ai"]): string {
  if (!ai?.apiUrl) return "# Fill in API URL, Key, and Model above first";

  const url = buildEndpointUrl(ai);
  const key = ai.apiKey || "{your-api-key}";
  const model = ai.model || "{model}";

  if (ai.apiType === "azure") {
    return [
      `curl -X POST "${url}" \\`,
      `  -H "api-key: ${key}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '{"messages":[{"role":"user","content":"Hello"}]}'`,
    ].join("\n");
  }

  return [
    `curl -X POST "${url}" \\`,
    `  -H "Authorization: Bearer ${key}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"model":"${model}","messages":[{"role":"user","content":"Hello"}]}'`,
  ].join("\n");
}

type Props = {
  open: boolean;
};

export const AiDebugHints: React.FC<Props> = ({ open }) => {
  const { values } = useFormikContext<Settings>();
  const [copied, setCopied] = useState(false);

  const endpoint = buildEndpointUrl(values.ai);
  const curl = buildCurlCommand(values.ai);

  const handleCopy = () => {
    void navigator.clipboard.writeText(curl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <details
      data-testid="AiDebugHints"
      open={open}
      style={{ marginTop: "-40px" }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
          color: "rgb(230, 237, 243)",
          padding: "8px 0",
        }}
      >
        API Debugging
      </summary>

      <Paragraph>Resolved endpoint:</Paragraph>
      <pre
        style={{
          backgroundColor: "rgb(13, 17, 23)",
          border: "0.8px solid rgb(48, 54, 61)",
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "12px",
          fontFamily: "monospace",
          color: "rgb(230, 237, 243)",
          overflowX: "auto",
          marginBottom: "12px",
        }}
      >
        {endpoint}
      </pre>

      <Paragraph>Test with curl:</Paragraph>
      <div style={{ position: "relative" }}>
        <pre
          style={{
            backgroundColor: "rgb(13, 17, 23)",
            border: "0.8px solid rgb(48, 54, 61)",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "rgb(230, 237, 243)",
            overflowX: "auto",
            marginBottom: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {curl}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            backgroundColor: "rgb(33, 38, 45)",
            border: "1px solid rgb(48, 54, 61)",
            borderRadius: "4px",
            color: "rgb(230, 237, 243)",
            padding: "4px 8px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <Paragraph>Troubleshooting:</Paragraph>
      <ul
        style={{
          fontSize: "13px",
          color: "rgb(139, 148, 158)",
          paddingLeft: "20px",
          margin: "4px 0 0 0",
        }}
      >
        <li>
          <strong>401 Unauthorized</strong> — Check your API key is correct and
          active
        </li>
        <li>
          <strong>404 Not Found</strong> — Verify the API URL and
          model/deployment name
        </li>
        <li>
          <strong>429 Too Many Requests</strong> — Rate limited; wait and retry
        </li>
        <li>
          <strong>Logs</strong> — Open chrome://extensions → find this extension
          → &quot;Inspect views: service worker&quot; for detailed request logs
        </li>
      </ul>
    </details>
  );
};
