import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { InstanceConfig } from "../services";

export async function processPrFiles(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
  prNumber: number,
  cb: (
    files: RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"]
  ) => void
) {
  const per_page = 100;
  let page = 1;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const { data: files } = await octokit.pulls.listFiles({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        pull_number: prNumber,
        per_page,
        page,
      });

      cb(files);

      if (files.length < per_page) {
        hasNextPage = false;
      } else {
        page++;
      }
    }
  } catch (error) {
    console.error("Error fetching pull request files:", error);
  }
}
