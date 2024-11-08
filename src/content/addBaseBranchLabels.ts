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
      addLabel(prData, prRow);
    });
  } catch (err) {
    alert("Error fetching PR data. Check console");
    console.error(err);
  }
}

function addLabel(
  prData:
    | RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number]
    | undefined,
  prRow: Element
) {
  if (!prData) return;
  if (prRow.querySelector(".ghUiBooster.IssueLabel.hx_IssueLabel")) return;
  const text = `${prData.base.ref} <-- ${prData.head.ref}`;
  const spanEl = document.createElement("span");
  spanEl.textContent = text;
  spanEl.classList.add("ghUiBooster");
  spanEl.classList.add("IssueLabel");
  spanEl.classList.add("hx_IssueLabel");
  prRow.children[0].children[2].appendChild(spanEl);
}
