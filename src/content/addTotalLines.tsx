import { Octokit } from "@octokit/rest";
import React from "react";
import { createRoot } from "react-dom/client";
import { TotalLines } from "../components";
import { getFileBlacklist } from "../getFileBlacklist";
import { InstanceConfig, Settings } from "../services";
import { processPrFiles } from "./processPrFiles";
import {
  getPrNumber,
  getPrRows,
  insertBeforeMetadata,
} from "./utils/prListDom";

export async function addTotalLines(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
  settings: Settings,
) {
  const prRows = getPrRows();
  for (const prRow of prRows) {
    const prNumber = getPrNumber(prRow);
    if (!prNumber) continue;

    let totalLinesAdded = 0;
    let totalLinesRemoved = 0;
    const blacklist = getFileBlacklist(settings);

    await processPrFiles(
      octokit,
      instanceConfig,
      parseInt(prNumber),
      (files) => {
        files.forEach((file) => {
          if (blacklist.some((name) => file.filename.includes(name))) return;
          totalLinesAdded += file.additions;
          totalLinesRemoved += file.deletions;
        });
      },
    );

    const prTotalLinesClass = "gh-ui-booster-total-lines";
    if (prRow.classList.contains(prTotalLinesClass)) continue;
    prRow.classList.add(prTotalLinesClass);

    const rootSpanEl = document.createElement("span");
    rootSpanEl.classList.add("diffstat");

    insertBeforeMetadata(prRow, rootSpanEl);

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <TotalLines
          totalLinesAdded={totalLinesAdded}
          totalLinesRemoved={totalLinesRemoved}
        />
      </React.StrictMode>,
    );
  }
}
