import { Octokit } from "@octokit/rest";
import { Settings } from "../services";
import { injectFiles } from "./injectPrFiles";
import { injectPrFilesSearch } from "./injectPrFilesSearch";
import { processPrFiles } from "./processPrFiles";
import { Files } from "./types";

export async function addChangedFiles(settings: Settings) {
  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });
  // Fetch PRs
  const { data: prs } = await octokit.pulls.list({
    owner: settings.org,
    repo: settings.repo,
    state: "open",
    per_page: 100,
    page: 1,
  });

  // Fetch PR files
  const prFilesMap = new Map<number, Files>();
  for await (const pr of prs) {
    await processPrFiles(settings, pr.number, (files) => {
      prFilesMap.set(pr.number, files);
    });
  }

  injectPrFilesSearch(prs, prFilesMap);
  injectFiles(prFilesMap);
}
