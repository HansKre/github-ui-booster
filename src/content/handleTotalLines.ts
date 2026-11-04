import { Octokit } from "@octokit/rest";
import { getFileBlacklist } from "../getFileBlacklist";
import { InstanceConfig, Settings } from "../services";
import { getPrFromLocation } from "./getPrFromLocation";
import { processPrFiles } from "./processPrFiles";
import { isOnPrPage } from "./utils/isOnPrPage";

export async function handleTotalLines(
  octokit: Octokit,
  instanceConfig: InstanceConfig,
  settings: Settings,
) {
  const urlUiPr = isOnPrPage(instanceConfig);
  if (!urlUiPr) return;

  const prNumber = getPrFromLocation();
  if (!prNumber) return;

  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;
  const blacklist = getFileBlacklist(settings);

  await processPrFiles(octokit, instanceConfig, prNumber, (files) => {
    files.forEach((file) => {
      if (blacklist.some((name) => file.filename.includes(name))) return;
      totalLinesAdded += file.additions;
      totalLinesRemoved += file.deletions;
    });
  });

  updateUi(totalLinesAdded, totalLinesRemoved);
}

function updateUi(totalLinesAdded: number, totalLinesRemoved: number) {
  // New GitHub UI (2024+): stats live in the PR tab header
  const addedSpanNew = document.querySelector<HTMLElement>(
    'span.f6.fgColor-success.text-bold[aria-hidden="true"]',
  );
  const removedSpanNew = document.querySelector<HTMLElement>(
    'span.f6.fgColor-danger.text-bold[aria-hidden="true"]',
  );

  if (addedSpanNew) {
    // Guard against running twice
    if (addedSpanNew.classList.contains("gh-ui-booster-pr-lines")) return;

    const addedClone = addedSpanNew.cloneNode(true) as HTMLElement;
    addedClone.textContent = `+ ${totalLinesAdded.toLocaleString()}`;
    addedClone.classList.add("gh-ui-booster-pr-lines");
    addedClone.style.setProperty("font-size", "12px", "important");
    addedSpanNew.parentNode?.insertBefore(addedClone, addedSpanNew);

    if (removedSpanNew) {
      const removedClone = removedSpanNew.cloneNode(true) as HTMLElement;
      removedClone.textContent = `- ${totalLinesRemoved.toLocaleString()}`;
      removedClone.classList.add("gh-ui-booster-pr-lines");
      removedClone.style.setProperty("font-size", "12px", "important");
      removedSpanNew.parentNode?.insertBefore(removedClone, removedSpanNew);
    }

    // Remove the diffstat squares (they reflect raw count, not filtered)
    addedSpanNew.parentElement
      ?.querySelector<HTMLElement>("div.d-flex")
      ?.remove();

    reduceFont(addedSpanNew, removedSpanNew);
    return;
  }

  // Old GitHub UI
  const diffStats = document.querySelector(
    "#diffstat > span > span[class^=diffstat-block]",
  )?.parentElement;

  if (!diffStats) return;

  diffStats.remove();

  const linesAddedEl = document.querySelector<HTMLElement>(
    "#diffstat > span.color-fg-success",
  );
  const addedClone = linesAddedEl?.cloneNode(true);
  if (!addedClone) return;
  addedClone.textContent = `+ ${totalLinesAdded.toLocaleString()}`;
  linesAddedEl?.parentNode?.insertBefore(addedClone, linesAddedEl);

  const linesRemovedEl = document.querySelector<HTMLElement>(
    "#diffstat > span.color-fg-danger",
  );
  const removedClone = linesRemovedEl?.cloneNode(true);
  if (!removedClone) return;
  removedClone.textContent = `- ${totalLinesRemoved.toLocaleString()}`;
  linesRemovedEl?.parentNode?.insertBefore(removedClone, linesRemovedEl);

  reduceFont(linesAddedEl, linesRemovedEl);
}

function reduceFont(...els: Array<HTMLElement | null>) {
  els.forEach((el) => {
    if (!el) return;
    el.style.setProperty("font-size", "8px", "important");
    el.style.setProperty("align-self", "end", "important");
  });
}
