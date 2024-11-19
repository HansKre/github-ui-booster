import { AutoFilter, InstanceConfig } from "../services";
import { isOnPrsPage } from "./utils/isOnPrsPage";

let intercepted = false;
let theInstanceConfig: InstanceConfig | undefined;
/**
 * Replace current PR-Filter by the filter from InstanceConfig by simulating an Input-Event, i.e. as if user had typed in the new filter himself and then triggering GitHub's built-in Handling of a new filter through form-Submit.
 */
export function handlePrFilter(
  instanceConfig: InstanceConfig,
  { filter, active }: AutoFilter,
  filterIntercepted?: string
) {
  theInstanceConfig = instanceConfig;
  if (!active || intercepted) return;

  if (!isOnPrsPage(instanceConfig)) {
    document.removeEventListener("click", onQuickFilterClick);
    return;
  }

  document.addEventListener("click", onQuickFilterClick);
  replaceFilter(filter, filterIntercepted);
}

function replaceFilter(filter: string | undefined, filterIntercepted?: string) {
  const searchInput = document.getElementById("js-issues-search");
  const activeTab = document.querySelector(".UnderlineNav-item.selected");

  if (
    !(searchInput instanceof HTMLInputElement) ||
    !searchInput ||
    !filter ||
    activeTab?.id !== "pull-requests-tab"
  )
    return;

  // trim() is necessary, since GitHub adds a space after the actual filter text
  if (searchInput.value.trim() === filter.trim()) return;

  searchInput.value = filterIntercepted ?? filter;

  const inputEvent = new Event("input", { bubbles: true });
  searchInput.dispatchEvent(inputEvent);

  const form = searchInput.closest("form");
  if (form)
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
}

// Intercept GH PR quickfilters (Open, Closed)
// The quick filter is so smart that it just appends itself to the current filter,
// so we can just replace the filter stored by the user without actually losing it
function onQuickFilterClick(event: MouseEvent) {
  if (!theInstanceConfig) return;
  if (!(event.target instanceof HTMLElement)) return;
  intercepted = false;
  const quickFilter = event.target.closest("a.btn-link");

  if (quickFilter && quickFilter instanceof HTMLAnchorElement) {
    const targetUrl = new URL(quickFilter.href);
    const params = new URLSearchParams(targetUrl.search);

    if (targetUrl.href.includes("/issues")) {
      event.preventDefault();
      const decodedFilter = decodeQueryString(params.toString());
      handlePrFilter(
        theInstanceConfig,
        { filter: decodedFilter, active: true },
        decodedFilter
      );
      intercepted = true;
    }
  }
}

function decodeQueryString(encodedQuery: string) {
  return decodeURIComponent(encodedQuery.replace(/\+/g, " ")).replace(
    /^q=/,
    ""
  );
}
