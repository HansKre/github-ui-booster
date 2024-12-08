import React from "react";
import { createRoot } from "react-dom/client";
import { PrFilesSearch } from "./PrFilesSearch";
import { Props } from "./PrFilesSearch/PrFilesSearch";

export function injectPrFilesSearch(
  prs: Props["prs"],
  prFilesMap: Props["prFilesMap"],
) {
  const contentEl =
    document.querySelector(".repository-content") ||
    document.getElementById("repo-content-turbo-frame");
  if (!contentEl) return;

  const prFilesSearchClass = "gh-ui-booster-pr-files-search";
  if (contentEl.querySelector(`.${prFilesSearchClass}`)) return;

  const rootDivEl = document.createElement("div");
  rootDivEl.classList.add(prFilesSearchClass);

  contentEl.children[0].children[2]?.insertBefore(
    rootDivEl,
    contentEl.children[0].children[2].children[1],
  );
  const newRoot = createRoot(rootDivEl);
  newRoot.render(
    <React.StrictMode>
      <PrFilesSearch prs={prs} prFilesMap={prFilesMap} />
    </React.StrictMode>,
  );
}
