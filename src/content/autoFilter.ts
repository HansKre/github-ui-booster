import { AutoFilter } from "../services";

let intercepted = false;

/**
 * Replace current PR-Filter by the filter from Settings by simulating an Input-Event, i.e. as if user had typed in the new filter himself and then triggering GitHub's built-in Handling of a new filter through form-Submit.
 */
export function autoFilter(
  { filter, active }: AutoFilter,
  filterIntercepted?: string
) {
  if (!active || intercepted || !window.location.href.includes("/pulls"))
    return;
  const replaceFilter = () => {
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
    if (!form) return;
    const formSubmitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    form.dispatchEvent(formSubmitEvent);
  };

  // Intercept GH PR quickfilters (Open, Closed)
  // The quick filter is so smart that it just appends to the set current filter,
  // so we can just replace the filter stored by the user without losing it
  document.addEventListener("click", function (event) {
    if (!(event.target instanceof HTMLElement)) return;
    intercepted = false;
    const quickFilter = event.target.closest("a.btn-link");

    if (quickFilter && quickFilter instanceof HTMLAnchorElement) {
      const targetUrl = new URL(quickFilter.href);
      const params = new URLSearchParams(targetUrl.search);

      if (targetUrl.href.includes("/issues")) {
        event.preventDefault();
        filter = decodeQueryString(params.toString());
        autoFilter({ filter, active: true }, filter);
        intercepted = true;
      }
    }
  });

  replaceFilter();
}

function decodeQueryString(encodedQuery: string) {
  let decodedString = decodeURIComponent(encodedQuery);

  decodedString = decodedString.replace(/\+/g, " ");

  if (decodedString.startsWith("q=")) {
    decodedString = decodedString.substring(2);
  }

  return decodedString;
}
