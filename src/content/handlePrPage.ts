import { Settings } from "../services";
import { getPrFromLocation } from "./getPrFromLocation";
import { isOnPrPage } from "./utils/isOnPrPage";
import { processPrFiles } from "./processPrFiles";

const BLACKLIST = ["package-lock.json"];

export async function handlePrPage(settings: Settings) {
  if (!isOnPrPage(settings)) return;

  const prNumber = getPrFromLocation();

  if (!prNumber) return;

  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;

  await processPrFiles(settings, prNumber, (files) => {
    files.forEach((file) => {
      if (BLACKLIST.some((name) => file.filename.includes(name))) return;
      totalLinesAdded += file.additions;
      totalLinesRemoved += file.deletions;
    });
  });

  updateUi(totalLinesAdded, totalLinesRemoved);
}

function updateUi(totalLinesAdded: number, totalLinesRemoved: number) {
  const diffStats = document.querySelector(
    "#diffstat > span > span[class^=diffstat-block]"
  )?.parentElement;

  // if undefined, assume that this script already ran
  if (!diffStats) return;

  diffStats.remove();

  const linesAddedEl = document.querySelector<HTMLElement>(
    "#diffstat > span.color-fg-success"
  );
  const addedClone = linesAddedEl?.cloneNode(true);
  if (!addedClone) return;
  addedClone.textContent = `+ ${totalLinesAdded}`;
  linesAddedEl?.parentNode?.insertBefore(addedClone, linesAddedEl);

  const linesRemovedEl = document.querySelector<HTMLElement>(
    "#diffstat > span.color-fg-danger"
  );
  const removedClone = linesRemovedEl?.cloneNode(true);
  if (!removedClone) return;
  removedClone.textContent = `- ${totalLinesRemoved}`;
  linesRemovedEl?.parentNode?.insertBefore(removedClone, linesRemovedEl);

  reduceFont(linesAddedEl, linesRemovedEl);
}

function reduceFont(...els: Array<HTMLElement | null>) {
  els.forEach((el) => {
    if (!el) return;
    el.style["fontSize"] = "8px";
    el.style["verticalAlign"] = "sub";
  });
}
