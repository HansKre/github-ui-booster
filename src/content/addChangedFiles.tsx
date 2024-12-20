import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../services";
import { injectFiles } from "./injectPrFiles";
import { injectPrFilesSearch } from "./injectPrFilesSearch";
import { processPrFiles } from "./processPrFiles";
import { Files } from "./types";

export async function addChangedFiles(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
) {
  // Fetch PRs
  const { data: prs } = await octokit.pulls.list({
    owner: instanceConfig.org,
    repo: instanceConfig.repo,
    state: "open",
    per_page: 100,
    page: 1,
  });

  // Fetch PR files
  const prFilesMap = new Map<number, Files>();
  for (const pr of prs) {
    await processPrFiles(octokit, instanceConfig, pr.number, (files) => {
      prFilesMap.set(pr.number, files);
    });
  }

  injectPrFilesSearch(prs, prFilesMap);
  injectFiles(prFilesMap);
}
