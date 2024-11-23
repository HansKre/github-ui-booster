import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

export async function reOrderPrs(instanceConfig: InstanceConfig) {
  const octokit = new Octokit({
    auth: instanceConfig.pat,
    baseUrl: instanceConfig.ghBaseUrl,
  });
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

    // get the repo's default branch
    const { default_branch } = prs[0].head.repo;

    // get all PR rows
    const prRowNodes = document.querySelectorAll("div[id^=issue_]");

    // reorder PRs, if they are depending on each other
    prs.forEach((currentPr) => {
      // filter out PRs that are already on the default branch
      if (currentPr.base.ref === default_branch) return;

      const prRows = [...prRowNodes];

      // find the UI-row for this PR
      const rowCurrentPr = prRows.find((row) => {
        const [, prNumber] = row.id.split("_");
        return prNumber === currentPr.number.toString();
      });

      if (!rowCurrentPr || !(rowCurrentPr instanceof HTMLElement)) return;

      // find the PR that this PR depends on
      const basePr = prs.find((pr) => pr.head.ref === currentPr.base.ref);
      if (!basePr) return;

      // find the UI-row of the PR that this PR depends on
      const rowBasePr = prRows.find((row) => {
        const [, prNumber] = row.id.split("_");
        return prNumber === basePr.number.toString();
      });

      if (!rowBasePr) return;

      // add left-spacing to indicate nesting
      rowCurrentPr.style.borderLeft =
        "1.5rem solid var(--bgColor-muted, var(--color-canvas-subtle))";
      rowCurrentPr.style.borderBottomLeftRadius = "0";

      // free up space on the right
      const lastColumn = rowCurrentPr.children[0].querySelector(
        ":scope > div:last-of-type"
      );
      if (!lastColumn) return;

      // remove this element, as it is always empty and takes up space
      const firstChild = lastColumn.querySelector("span");
      if (firstChild) {
        lastColumn.removeChild(firstChild);
      }

      lastColumn.classList.remove("col-4", "col-md-3");
      lastColumn.classList.add("col-2");

      // append the rowCurrentPr as a child of rowBasePr
      // this moves rowCurrentPr away from it's current position
      rowBasePr.append(rowCurrentPr);
    });
  } catch (err) {
    alert("Error fetching PR data. Check console");
    console.error(err);
  }
}
