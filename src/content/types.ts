import { RestEndpointMethodTypes } from "@octokit/rest";

export type Files =
  RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"];
