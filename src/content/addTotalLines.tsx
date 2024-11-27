import { Octokit } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { TotalLines } from "../components";
import { BLACKLIST } from "../config";
import { InstanceConfig } from "../services";
import { processPrFiles } from "./processPrFiles";

export async function addTotalLines(
  octokit: Octokit,
  instanceConfig: InstanceConfig
) {
  const prRows = document.querySelectorAll("div[id^=issue_]");
  for await (const prRow of prRows) {
    const [, prNumber] = prRow.id.split("_");
    if (!prNumber) continue;

    let totalLinesAdded = 0;
    let totalLinesRemoved = 0;

    await processPrFiles(
      octokit,
      instanceConfig,
      parseInt(prNumber),
      (files) => {
        files.forEach((file) => {
          if (BLACKLIST.some((name) => file.filename.includes(name))) return;
          totalLinesAdded += file.additions;
          totalLinesRemoved += file.deletions;
        });
      }
    );

    const prTotalLinesClass = "gh-ui-booster-total-lines";
    if (prRow.classList.contains(prTotalLinesClass)) continue;
    prRow.classList.add(prTotalLinesClass);

    const rootSpanEl = document.createElement("span");
    rootSpanEl.classList.add("diffstat");

    /* Insert before the div-element
       this way, it will always be the last element in the line
       since the div has a display: flex and hence displays as a block-element
       in an own line
    */
    prRow.children[0].children[2]?.insertBefore(
      rootSpanEl,
      prRow.children[0].children[2].querySelector(
        "div.d-flex.mt-1.text-small.color-fg-muted"
      )
    );

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <TotalLines
          totalLinesAdded={totalLinesAdded}
          totalLinesRemoved={totalLinesRemoved}
        />
      </React.StrictMode>
    );
  }
}
