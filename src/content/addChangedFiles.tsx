import { Octokit } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { Settings } from "../services";
import { injectPrFilesSearch } from "./injectPrFilesSearch";
import { PrFiles } from "./PrFiles";
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

  // Add Files-Icon to PRs
  const prRows = document.querySelectorAll("div[id^=issue_]");
  for await (const prRow of prRows) {
    // Add labels indicating the base-ref to every PR row
    const [, prNumber] = prRow.id.split("_");
    //  Add popover for the files
    const prFiles = prFilesMap.get(parseInt(prNumber));
    // addPopover(prFiles, prRow);
    const prFilesClass = "gh-ui-booster-pr-files";
    if (prRow.classList.contains(prFilesClass)) return;
    prRow.classList.add(prFilesClass);

    const rootSpanEl = document.createElement("span");
    // Insert between the first and second child
    prRow.children[0].children[2].insertBefore(
      rootSpanEl,
      prRow.children[0].children[2].children[1]
    );

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <PrFiles prFiles={prFiles} />
      </React.StrictMode>
    );
  }
}
