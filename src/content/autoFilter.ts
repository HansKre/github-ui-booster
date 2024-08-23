import { AutoFilter } from "../services";

/**
 * Replace current PR-Filter by the filter from Settings by simulating an Input-Event, i.e. as if user had typed in the new filter himself and then triggering GitHub's built-in Handling of a new filter through form-Submit.
 */
export function autoFilter({ filter, active }: AutoFilter) {
  if (!active) return;
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

    searchInput.value = filter;

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

  replaceFilter();
}
