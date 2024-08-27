import { Octokit } from "@octokit/rest";
import { Settings } from "../services";
import { getPrFromLocation } from "./getPrFromLocation";
import { Spinner } from "./spinner";
import { isOnPrPage } from "./utils/isOnPrPage";

const BLACKLIST = ["package-lock.json"];

export async function handlePrPage(settings: Settings) {
  if (!isOnPrPage(settings)) return;

  const prNumber = getPrFromLocation();

  if (!prNumber) return;

  const octokit = new Octokit({
    auth: settings.pat,
    baseUrl: settings.ghBaseUrl,
  });

  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;
  const per_page = 100;
  let page = 1;
  let hasNextPage = true;

  try {
    Spinner.showSpinner(
      "#repo-content-pjax-container > div > div.clearfix.js-issues-results > div.px-3.px-md-0.ml-n3.mr-n3.mx-md-0.tabnav > nav",
      "ghuibooster__spinner__large"
    );
    while (hasNextPage) {
      const { data: files } = await octokit.pulls.listFiles({
        owner: settings.org,
        repo: settings.repo,
        pull_number: prNumber,
        per_page,
        page,
      });

      files.forEach((file) => {
        if (BLACKLIST.some((name) => file.filename.includes(name))) return;
        totalLinesAdded += file.additions;
        totalLinesRemoved += file.deletions;
      });

      if (files.length < per_page) {
        hasNextPage = false;
      } else {
        page++;
      }
    }

    updateUi(totalLinesAdded, totalLinesRemoved);
  } catch (error) {
    console.error("Error fetching pull request files:", error);
  } finally {
    Spinner.hideSpinner();
  }
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
