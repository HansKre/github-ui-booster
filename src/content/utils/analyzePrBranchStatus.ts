import { RestEndpointMethodTypes } from "@octokit/rest";
import { InstanceConfig } from "../../services";
import { OctokitWithCache } from "../../services/getOctoInstance";

const LOG_PREFIX = "[BatchUpdate:analyze]";

type PullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

export type PrBranchAnalysis = {
  pr: PullRequest;
  status: "behind" | "dirty" | "up-to-date";
  behindBy: number;
  mergeBaseSha: string | null;
};

export async function analyzePrBranchStatus(
  octokit: OctokitWithCache,
  instanceConfig: InstanceConfig,
  signal: AbortSignal,
): Promise<PrBranchAnalysis[]> {
  console.log(
    `${LOG_PREFIX} Starting analysis for ${instanceConfig.org}/${instanceConfig.repo}`,
  );

  const { data: prs } = await octokit.pulls.list({
    owner: instanceConfig.org,
    repo: instanceConfig.repo,
    state: "open",
    per_page: 100,
    page: 1,
    request: { signal },
  });

  console.log(`${LOG_PREFIX} Found ${prs.length} open PRs`);

  const results: PrBranchAnalysis[] = [];

  for (const pr of prs) {
    if (signal.aborted) {
      console.log(`${LOG_PREFIX} Aborted during analysis`);
      return results;
    }

    console.log(
      `${LOG_PREFIX} PR #${pr.number} "${pr.title}" (${pr.head.ref} → ${pr.base.ref}): fetching details...`,
    );

    const { data: prDetails } = await octokit.pulls.get({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      pull_number: pr.number,
      request: { signal },
    });

    if (signal.aborted) {
      console.log(`${LOG_PREFIX} Aborted during analysis`);
      return results;
    }

    console.log(
      `${LOG_PREFIX} PR #${pr.number}: mergeable_state="${prDetails.mergeable_state}"`,
    );

    if (prDetails.mergeable_state === "dirty") {
      console.log(`${LOG_PREFIX} PR #${pr.number}: DIRTY (has conflicts)`);
      results.push({ pr, status: "dirty", behindBy: 0, mergeBaseSha: null });
      continue;
    }

    const { data: comparison } = await octokit.repos.compareCommits({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      base: pr.base.ref,
      head: pr.head.ref,
      request: { signal },
    });

    if (signal.aborted) {
      console.log(`${LOG_PREFIX} Aborted during analysis`);
      return results;
    }

    if (comparison.behind_by > 0) {
      console.log(
        `${LOG_PREFIX} PR #${pr.number}: BEHIND by ${comparison.behind_by} commits (merge_base=${comparison.merge_base_commit.sha.slice(0, 7)})`,
      );
      results.push({
        pr,
        status: "behind",
        behindBy: comparison.behind_by,
        mergeBaseSha: comparison.merge_base_commit.sha,
      });
    } else {
      console.log(`${LOG_PREFIX} PR #${pr.number}: UP-TO-DATE`);
      results.push({
        pr,
        status: "up-to-date",
        behindBy: 0,
        mergeBaseSha: comparison.merge_base_commit.sha,
      });
    }
  }

  const behind = results.filter((r) => r.status === "behind").length;
  const dirty = results.filter((r) => r.status === "dirty").length;
  const upToDate = results.filter((r) => r.status === "up-to-date").length;
  console.log(
    `${LOG_PREFIX} Analysis complete: ${behind} behind, ${dirty} dirty, ${upToDate} up-to-date`,
  );

  return results;
}
