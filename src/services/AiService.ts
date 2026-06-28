import { hasOwnProperties } from "ts-type-safe";
import { Messages } from "../content/types";

type AiPayload = {
  issueKey: string;
  summary: string;
  description: string | null;
  comments: Array<{ body: string; author: string }>;
};

export type CodeDiffPayload = {
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
};

export const AiService = {
  async summarizeWithAi(payload: AiPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: Messages.SUMMARIZE_WITH_AI,
          payload,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (
            hasOwnProperties(response, ["success", "data"]) &&
            response.success &&
            hasOwnProperties(response.data, ["summary"]) &&
            typeof response.data.summary === "string"
          ) {
            resolve(response.data.summary);
          } else {
            const errorMsg =
              hasOwnProperties(response, ["error"]) &&
              typeof response.error === "string"
                ? response.error
                : JSON.stringify(response);
            reject(new Error(`AI summarization failed: ${errorMsg}`));
          }
        },
      );
    });
  },

  async summarizeCodeDiff(payload: CodeDiffPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: Messages.SUMMARIZE_CODE_DIFF,
          payload,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (
            hasOwnProperties(response, ["success", "data"]) &&
            response.success &&
            hasOwnProperties(response.data, ["summary"]) &&
            typeof response.data.summary === "string"
          ) {
            resolve(response.data.summary);
          } else {
            const errorMsg =
              hasOwnProperties(response, ["error"]) &&
              typeof response.error === "string"
                ? response.error
                : JSON.stringify(response);
            reject(new Error(`AI code diff summarization failed: ${errorMsg}`));
          }
        },
      );
    });
  },
};
