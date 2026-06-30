import { RestEndpointMethodTypes } from "@octokit/rest";
import * as Yup from "yup";

export type Files =
  RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"];

export const fetchJiraIssueFullSchema = Yup.object({
  status: Yup.string().required(),
  priority: Yup.string().required(),
  assignee: Yup.string().required(),
  summary: Yup.string().required(),
  description: Yup.string().nullable().defined(),
  comments: Yup.array(
    Yup.object({
      body: Yup.string().required(),
      author: Yup.string().required(),
    }),
  )
    .required()
    .defined(),
});

export type FetchJiraIssueFull = Yup.InferType<typeof fetchJiraIssueFullSchema>;

export const jiraResponseSchema = Yup.object({
  fields: Yup.object({
    assignee: Yup.object({
      displayName: Yup.string().required().min(3),
    })
      .optional()
      .nullable(),
    priority: Yup.object({
      name: Yup.string().required().min(3),
    }).required(),
    status: Yup.object({
      name: Yup.string().required().min(2),
    }).required(),
    summary: Yup.string().required().min(3),
    description: Yup.string().nullable().optional(),
  }).required(),
});

export type JiraResponse = Yup.InferType<typeof jiraResponseSchema>;

export const jiraCommentsResponseSchema = Yup.object({
  comments: Yup.array(
    Yup.object({
      body: Yup.string().required(),
      author: Yup.object({
        displayName: Yup.string().required(),
      }).required(),
    }),
  ).required(),
});

export type JiraCommentsResponse = Yup.InferType<
  typeof jiraCommentsResponseSchema
>;

export enum Messages {
  FETCH_JIRA_ISSUE_FULL = "FETCH_JIRA_ISSUE_FULL",
  SUMMARIZE_CODE_DIFF = "SUMMARIZE_CODE_DIFF",
  SUMMARIZE_WITH_AI = "SUMMARIZE_WITH_AI",
  TEST_AI_CONNECTION = "TEST_AI_CONNECTION",
}

export enum DescriptionTemplatePlaceholders {
  JIRA_TICKET = "{{jiraTicket}}",
  AI_SUMMARY = "{{aiSummary}}",
  AI_CODE_SUMMARY = "{{aiCodeSummary}}",
}
