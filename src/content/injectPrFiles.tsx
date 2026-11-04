import React from "react";
import { createRoot } from "react-dom/client";
import { PrFiles } from "./PrFiles";
import { Files } from "./types";
import {
  getMetadataContainer,
  getPrNumber,
  getPrRows,
} from "./utils/prListDom";

export function injectFiles(prFilesMap: Map<number, Files>) {
  const prRows = getPrRows();
  for (const prRow of prRows) {
    const prNumber = getPrNumber(prRow);
    const prFiles = prFilesMap.get(parseInt(prNumber ?? ""));
    const prFilesClass = "gh-ui-booster-pr-files";
    if (prRow.classList.contains(prFilesClass)) continue;
    prRow.classList.add(prFilesClass);

    const rootSpanEl = document.createElement("span");
    const container = getMetadataContainer(prRow);
    container?.appendChild(rootSpanEl);

    const root = createRoot(rootSpanEl);

    root.render(
      <React.StrictMode>
        <PrFiles prFiles={prFiles} />
      </React.StrictMode>,
    );
  }
}
