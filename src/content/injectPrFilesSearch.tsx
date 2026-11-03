import React from "react";
import { createRoot } from "react-dom/client";
import { PrFilesSearch } from "./PrFilesSearch";
import { Props } from "./PrFilesSearch/PrFilesSearch";

export function injectPrFilesSearch(
  prs: Props["prs"],
  prFilesMap: Props["prFilesMap"],
) {
  const prFilesSearchClass = "gh-ui-booster-pr-files-search";
  if (document.querySelector(`.${prFilesSearchClass}`)) return;

  const rootDivEl = document.createElement("div");
  rootDivEl.classList.add(prFilesSearchClass);

  // New GitHub UI: inject before the PR list container
  const listContainer = document.querySelector('[id*="-list-view-container"]');
  if (listContainer?.parentElement) {
    listContainer.parentElement.insertBefore(rootDivEl, listContainer);
  } else {
    // Old UI fallback
    const contentEl =
      document.querySelector(".repository-content") ||
      document.getElementById("repo-content-turbo-frame");
    if (!contentEl) return;
    contentEl.children[0].children[2]?.insertBefore(
      rootDivEl,
      contentEl.children[0].children[2].children[1],
    );
  }

  const newRoot = createRoot(rootDivEl);
  newRoot.render(
    <React.StrictMode>
      <PrFilesSearch prs={prs} prFilesMap={prFilesMap} />
    </React.StrictMode>,
  );
}
