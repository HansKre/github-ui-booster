import { Octokit } from "@octokit/rest";
import { InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

export async function addUpdateBranchButton(
  octokit: Octokit,
  instanceConfig: InstanceConfig
) {
  if (!isOnPrsPage(instanceConfig)) return;

  try {
    // List all open pull requests
    const { data: prs } = await octokit.pulls.list({
      owner: instanceConfig.org,
      repo: instanceConfig.repo,
      state: "open",
      per_page: 100,
      page: 1,
    });

    for (const pr of prs) {
      // Fetch PR details
      const { data: prDetails } = await octokit.pulls.get({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        pull_number: pr.number,
      });

      if (prDetails.mergeable_state === "dirty") {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;
        const spanEl = document.createElement("span");
        spanEl.textContent = "☣️";
        spanEl.style.padding = "0 1rem";
        prRow.children[0].children[2].insertBefore(
          spanEl,
          prRow.children[0].children[2].children[0]
        );
        continue;
      }

      // Compare the branch with its base to check if it's behind
      const { data: comparison } = await octokit.repos.compareCommits({
        owner: instanceConfig.org,
        repo: instanceConfig.repo,
        base: pr.base.ref,
        head: pr.head.ref,
      });

      if (comparison.behind_by > 0) {
        const prRow = document.querySelector(`div[id=issue_${pr.number}]`);
        if (!prRow) continue;

        const prDescriptionContainer = prRow.children[0].children[2];
        if (!prDescriptionContainer) continue;

        const updateBtnClass = "gh-ui-booster-update-branch-btn";
        if (prDescriptionContainer.classList.contains(updateBtnClass)) continue;
        prDescriptionContainer.classList.add(updateBtnClass);

        const spanEl = document.createElement("span");
        spanEl.textContent = "⬆";
        spanEl.style.padding = "0 1rem";
        spanEl.style.cursor = "pointer";

        // Update the branch to include changes from the base branch
        const handleClick = () => {
          octokit.pulls
            .updateBranch({
              owner: instanceConfig.org,
              repo: instanceConfig.repo,
              pull_number: pr.number,
            })
            .then(() => {
              // prompt user if to refresh page and refresh only if user agrees
              if (
                window.confirm(
                  "Branch updated successfully. Refresh the page to see the changes?"
                )
              ) {
                window.location.reload();
              }
            })
            .catch((error) => {
              if (error.message) {
                alert(`Error updating branch: ${error.message}`);
              } else {
                alert("Error updating branch. Check console for details.");
              }
              console.error("Error updating branch:", error);
            });
        };
        spanEl.addEventListener("click", handleClick);
        // TODO: cleanup event listener

        prDescriptionContainer.insertBefore(
          spanEl,
          prDescriptionContainer.children[0]
        );
      }
    }
  } catch (error) {
    console.error("Error processing pull requests:", error);
  }
}
