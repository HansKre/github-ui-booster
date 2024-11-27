import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

export async function addBaseBranchLabels(
  octokit: Octokit,
  instanceConfig: InstanceConfig
) {
  if (!isOnPrsPage(instanceConfig)) return;

  try {
    // Fetch PRs
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    const prRows = document.querySelectorAll("div[id^=issue_]");
    prRows.forEach((prRow) => {
      // Add labels indicating the base-ref to every PR row
      const [, prNumber] = prRow.id.split("_");
      const prData = prs.find((pr) => pr.number === parseInt(prNumber));
      addLabel(prs, prData, prRow);
    });
  } catch (err) {
    alert("Error fetching PR data. Check console");
    console.error(err);
  }
}

function addLabel(
  prs: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"],
  currentPr:
    | RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number]
    | undefined,
  prRow: Element
) {
  if (!currentPr) return;

  const baseBranchLabelClass = "gh-ui-booster-base-branch-label";
  if (prRow.querySelector(`.${baseBranchLabelClass}`)) return;
  const baseBranchText = currentPr.base.ref;
  const featureBranchText = ` ← ${currentPr.head.ref}`;

  const basePr = prs.find((pr) => pr.head.ref === currentPr.base.ref);

  const baseBranchContainer = document.createElement("div");
  baseBranchContainer.style.color = "initial";
  baseBranchContainer.style.marginRight = "1rem";

  // Create a link to the base PR if it exists
  const aOrSpanEl = document.createElement(basePr ? "a" : "span");
  aOrSpanEl.textContent = baseBranchText;
  aOrSpanEl.classList.add(baseBranchLabelClass);
  baseBranchContainer.appendChild(aOrSpanEl);

  // Append the feature branch text
  const featureBranchEl = document.createElement("span");
  featureBranchEl.textContent = featureBranchText;
  featureBranchEl.classList.add(baseBranchLabelClass);
  baseBranchContainer.appendChild(featureBranchEl);

  if (basePr && aOrSpanEl instanceof HTMLAnchorElement) {
    aOrSpanEl.target = "_blank";
    aOrSpanEl.rel = "noopener noreferrer";
    aOrSpanEl.href = basePr.html_url;
  }

  const parent = prRow.children[0].children[2].querySelector(
    "div.d-flex.mt-1.text-small.color-fg-muted"
  );

  // Insert as the very first element
  parent?.insertBefore(baseBranchContainer, parent.firstChild);
}
