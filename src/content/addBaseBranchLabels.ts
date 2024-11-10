import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { Settings } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

export async function addBaseBranchLabels(settings: Settings) {
  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });
  if (!isOnPrsPage(settings)) return;

  try {
    // Fetch PRs
    const { data: prs } = await octokit.pulls.list({
      owner: settings.org,
      repo: settings.repo,
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
  const text = `${currentPr.base.ref} <-- ${currentPr.head.ref}`;

  const basePr = prs.find((pr) => pr.head.ref === currentPr.base.ref);

  const aOrSpanEl = document.createElement(basePr ? "a" : "span");

  aOrSpanEl.textContent = text;
  aOrSpanEl.classList.add(baseBranchLabelClass);

  aOrSpanEl.style.marginRight = "1rem";

  if (basePr && aOrSpanEl instanceof HTMLAnchorElement) {
    aOrSpanEl.target = "_blank";
    aOrSpanEl.rel = "noopener noreferrer";
    aOrSpanEl.href = basePr.html_url;
  } else {
    aOrSpanEl.style.color = "initial";
  }

  const parent = prRow.children[0].children[2].querySelector(
    "div.d-flex.mt-1.text-small.color-fg-muted"
  );

  // insert as the very first element
  parent?.insertBefore(aOrSpanEl, parent.firstChild);
}
