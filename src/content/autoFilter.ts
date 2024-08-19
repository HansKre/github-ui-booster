import { AutoFilter } from "../services";

export async function autoFilter(filter: AutoFilter) {
  const updateFilter = () => {
    const searchInput = document.getElementById("js-issues-search");
    const activeTab = document.querySelector(".UnderlineNav-item.selected");

    if (
      searchInput instanceof HTMLInputElement &&
      searchInput &&
      filter.filter &&
      activeTab?.id === "pull-requests-tab"
    ) {
      // trim() is necessary, since GitHub adds a space after the actual filter text
      if (searchInput.value.trim() !== filter.filter.trim()) {
        searchInput.value = filter.filter;

        const inputEvent = new Event("input", { bubbles: true });
        searchInput.dispatchEvent(inputEvent);

        const form = searchInput.closest("form");
        if (form) {
          const formSubmitEvent = new Event("submit", {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(formSubmitEvent);
        }
      }
    }
  };

  updateFilter();
}
