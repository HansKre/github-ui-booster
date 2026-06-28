import axios from "axios";
import { hasOwnProperty, isEnumValue } from "ts-type-safe";
import {
  jiraCommentsResponseSchema,
  jiraResponseSchema,
  Messages,
} from "./content/types";
import { getSettings } from "./services";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (!hasOwnProperty(message, "type") || !isEnumValue(Messages, message.type))
    return;

  if (message.type === Messages.FETCH_JIRA_ISSUE_FULL) {
    if (
      !hasOwnProperty(message, "issueKey") ||
      !(typeof message.issueKey === "string") ||
      !message.issueKey
    )
      return;
    const { issueKey } = message;

    getSettings({
      onSuccess: (settings) => {
        const { baseUrl: jiraBaseUrl, pat: token } = settings.jira || {};

        if (!jiraBaseUrl || !token) {
          alert("JIRA settings are not configured properly.");
          return;
        }

        fetchJiraIssueFull(jiraBaseUrl, token, issueKey)
          .then((data) => {
            sendResponse({ success: true, data });
          })
          .catch((error: unknown) => {
            console.error("[JIRA] Error fetching issue:", issueKey, error);
            sendResponse({ success: false, error, issueKey });
          });
      },
    });

    return true;
  }

  if (message.type === Messages.SUMMARIZE_WITH_AI) {
    if (
      !hasOwnProperty(message, "payload") ||
      typeof message.payload !== "object" ||
      !message.payload
    )
      return;
    const { payload } = message;

    getSettings({
      onSuccess: (settings) => {
        const aiConfig = settings.ai;
        if (!aiConfig?.apiUrl || !aiConfig?.apiKey || !aiConfig?.model) {
          console.warn(
            "[AI Summary] AI settings are not configured. Skipping.",
          );
          sendResponse({ success: false, error: "AI settings not configured" });
          return;
        }

        callAiEndpoint(
          aiConfig,
          buildSummarizationMessages(payload as AiPayload),
        )
          .then((content) => {
            sendResponse({ success: true, data: { summary: content } });
          })
          .catch((error: unknown) => {
            sendResponse({ success: false, error: String(error) });
          });
      },
    });

    return true;
  }

  if (message.type === Messages.TEST_AI_CONNECTION) {
    if (
      !hasOwnProperty(message, "aiConfig") ||
      typeof message.aiConfig !== "object" ||
      !message.aiConfig
    )
      return;

    const aiConfig = message.aiConfig as AiConfig;
    if (!aiConfig.apiUrl || !aiConfig.apiKey || !aiConfig.model) {
      sendResponse({
        success: false,
        error: "AI settings are incomplete. Fill in all fields first.",
      });
      return true;
    }

    const testMessages: ChatMessage[] = [
      { role: "user", content: "Reply with: Connection successful." },
    ];

    callAiEndpoint(aiConfig, testMessages)
      .then((content) => {
        sendResponse({ success: true, data: { reply: content } });
      })
      .catch((error: unknown) => {
        sendResponse({ success: false, error: String(error) });
      });

    return true;
  }
});

async function fetchJiraIssueFull(
  jiraBaseUrl: string,
  token: string,
  issueKey: string,
) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const [issueResponse, commentsResponse] = await Promise.all([
    axios.get(`${jiraBaseUrl}/rest/api/2/issue/${issueKey}`, { headers }),
    axios.get(`${jiraBaseUrl}/rest/api/2/issue/${issueKey}/comment`, {
      headers,
    }),
  ]);

  const { fields } = jiraResponseSchema.validateSync(issueResponse.data);
  const { comments: rawComments } = jiraCommentsResponseSchema.validateSync(
    commentsResponse.data,
  );

  return {
    assignee: fields.assignee?.displayName ?? "Unassigned",
    priority: fields.priority.name,
    status: fields.status.name,
    summary: fields.summary,
    description: fields.description ?? null,
    comments: rawComments.map((c) => ({
      body: c.body,
      author: c.author.displayName,
    })),
  };
}

type AiPayload = {
  issueKey: string;
  summary: string;
  description: string | null;
  comments: Array<{ body: string; author: string }>;
};

type AiConfig = {
  apiType: string;
  apiUrl: string;
  apiKey: string;
  model: string;
  apiVersion?: string;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function buildRequestUrl(config: AiConfig): string {
  const baseUrl = config.apiUrl.replace(/\/$/, "");

  if (config.apiType === "azure") {
    const version = config.apiVersion || "2024-10-21";
    return `${baseUrl}/openai/deployments/${config.model}/chat/completions?api-version=${version}`;
  }

  return `${baseUrl}/chat/completions`;
}

function buildRequestHeaders(config: AiConfig): Record<string, string> {
  if (config.apiType === "azure") {
    return {
      "api-key": config.apiKey,
      "Content-Type": "application/json",
    };
  }

  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
}

function buildRequestBody(
  config: AiConfig,
  messages: ChatMessage[],
): Record<string, unknown> {
  if (config.apiType === "azure") {
    return { messages };
  }

  return { model: config.model, messages };
}

async function callAiEndpoint(
  config: AiConfig,
  messages: ChatMessage[],
): Promise<string> {
  const url = buildRequestUrl(config);
  const reqHeaders = buildRequestHeaders(config);
  const requestBody = buildRequestBody(config, messages);

  console.log("[AI] Request URL:", url);
  console.log("[AI] API type:", config.apiType);
  console.log("[AI] Model:", config.model);
  console.log("[AI] API key (masked):", maskApiKey(config.apiKey));
  console.log("[AI] Messages count:", messages.length);
  console.log(
    "[AI] Total prompt length:",
    messages.reduce((sum, m) => sum + m.content.length, 0),
    "chars",
  );

  type AiResponse = {
    choices?: Array<{ message?: { content?: string } }>;
  };

  let response;
  try {
    response = await axios.post<AiResponse>(url, requestBody, {
      headers: reqHeaders,
    });
  } catch (error: unknown) {
    console.error("[AI] ERROR at stage: request");
    console.error("[AI] Error details:", error);
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object"
    ) {
      const errResponse = error.response as {
        status?: number;
        data?: unknown;
      };
      console.error("[AI] Response status:", errResponse.status);
      console.error(
        "[AI] Response body:",
        JSON.stringify(errResponse.data).slice(0, 1000),
      );
    }
    throw error;
  }

  console.log("[AI] Response status:", response.status);
  const resHeaders = response.headers as Record<string, string | undefined>;
  console.log(
    "[AI] Response headers:",
    JSON.stringify({
      "content-type": resHeaders["content-type"],
      "x-request-id": resHeaders["x-request-id"],
    }),
  );

  const rawBody = JSON.stringify(response.data);
  console.log("[AI] Response body (first 500 chars):", rawBody.slice(0, 500));

  let content: string;
  try {
    const raw = response.data?.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw) {
      throw new Error(
        `Unexpected response shape. choices[0].message.content is: ${typeof raw}`,
      );
    }
    content = raw;
  } catch (error: unknown) {
    console.error("[AI] ERROR at stage: response-parse");
    console.error("[AI] Error details:", error);
    console.error("[AI] Full response body:", rawBody.slice(0, 2000));
    throw error;
  }

  console.log("[AI] SUCCESS: Response received (" + content.length + " chars)");
  return content;
}

function buildSummarizationMessages(payload: AiPayload): ChatMessage[] {
  const systemPrompt = `You are a technical writer helping developers create pull request descriptions. Given a JIRA ticket description and its comments, create a concise summary suitable for a PR description. Focus on:
- What the ticket is about (the problem or feature)
- Key decisions made in comments
- Acceptance criteria if mentioned

Keep it concise (3-5 bullet points). Use markdown formatting. Do not include any preamble or meta-commentary, just output the summary directly.`;

  const parts: string[] = [];
  parts.push(`## Ticket: ${payload.issueKey}`);
  parts.push(`### Summary\n${payload.summary}`);

  if (payload.description) {
    parts.push(`### Description\n${payload.description}`);
  } else {
    parts.push(`### Description\n(no description provided)`);
  }

  if (payload.comments.length > 0) {
    const commentLines = payload.comments
      .map((c) => `**${c.author}:** ${c.body}`)
      .join("\n\n");
    parts.push(`### Comments\n${commentLines}`);
  } else {
    parts.push(`### Comments\n(no comments)`);
  }

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: parts.join("\n\n") },
  ];
}
