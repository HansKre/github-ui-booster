import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";
import { getPrNumber, getPrRows } from "./utils/prListDom";

export async function reOrderPrs(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
) {
  if (!isOnPrsPage(instanceConfig)) return;

  try {
    // fetch PRs
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    // If there are no PRs, return early
    if (prs.length === 0) return;

    // get the repo's default branch
    const { default_branch } = prs[0].head.repo;

    const prRowNodes = [...getPrRows()];

    prs.forEach((currentPr) => {
      if (currentPr.base.ref === default_branch) return;

      const rowCurrentPr = prRowNodes.find(
        (row) => getPrNumber(row) === currentPr.number.toString(),
      );
      if (!rowCurrentPr || !(rowCurrentPr instanceof HTMLElement)) return;

      const basePr = prs.find((pr) => pr.head.ref === currentPr.base.ref);
      if (!basePr) return;

      const rowBasePr = prRowNodes.find(
        (row) => getPrNumber(row) === basePr.number.toString(),
      );
      if (!rowBasePr) return;

      rowCurrentPr.style.borderLeft =
        "1.5rem solid var(--bgColor-muted, var(--color-canvas-subtle))";
      rowCurrentPr.style.borderBottomLeftRadius = "0";

      // New UI: li rows have display:grid — appending inside breaks layout.
      // Insert as next sibling in the ul instead.
      if (rowCurrentPr.tagName === "LI") {
        rowBasePr.parentElement?.insertBefore(
          rowCurrentPr,
          rowBasePr.nextSibling,
        );
      } else {
        rowBasePr.append(rowCurrentPr);
      }
    });
  } catch (err) {
    console.error("Error fetching PR data:", err);
  }
}
