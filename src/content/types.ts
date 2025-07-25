import { RestEndpointMethodTypes } from "@octokit/rest";
import * as Yup from "yup";

export type Files =
  RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"];

export const fetchJiraIssueSchema = Yup.object({
  status: Yup.string().required(),
  priority: Yup.string().required(),
  assignee: Yup.string().required(),
});

export type FetchJiraIssue = Yup.InferType<typeof fetchJiraIssueSchema>;

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
  }).required(),
});

export type JiraResponse = Yup.InferType<typeof jiraResponseSchema>;

export enum Messages {
  FETCH_JIRA_ISSUE = "FETCH_JIRA_ISSUE",
}

export enum TemplateDescriptionParameters {
  JIRA_TICKET = "{{jiraTicket}}",
}
