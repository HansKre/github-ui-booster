export const HEADING_CONTROLS_CLASS = "gh-ui-booster-heading-controls";

/**
 * Returns (or creates) the shared inline-flex controls row immediately to the
 * right of the "All pull requests" heading. Used as a common parent for the
 * search bar, loading spinner, and batch-update button.
 */
export function getOrCreateHeadingControls(): HTMLElement | null {
  const existing = document.querySelector<HTMLElement>(
    `.${HEADING_CONTROLS_CLASS}`,
  );
  if (existing) return existing;
  const heading = document.querySelector<HTMLElement>("h1.h3.hide-sm, h1.h3");
  const headingContainer = heading?.parentElement;
  if (!headingContainer) return null;
  const controls = document.createElement("div");
  controls.classList.add(HEADING_CONTROLS_CLASS);
  controls.style.display = "inline-flex";
  controls.style.alignItems = "center";
  controls.style.gap = "8px";
  headingContainer.appendChild(controls);
  return controls;
}

/** Returns all PR row elements — works with both old and new GitHub UI */
export function getPrRows(): NodeListOf<Element> {
  const newRows = document.querySelectorAll('li[id*="-list-view-node-"]');
  if (newRows.length > 0) return newRows;
  return document.querySelectorAll("div[id^=issue_]");
}

/** Finds the PR row element for a given PR number — works with both UIs */
export function getPrRowByNumber(prNumber: number): Element | null {
  for (const row of getPrRows()) {
    if (getPrNumber(row) === prNumber.toString()) return row;
  }
  return null;
}

/** Extracts PR number from a PR row element — works with both old and new GitHub UI */
export function getPrNumber(prRow: Element): string | undefined {
  // New UI: extract from title link href
  const link = prRow.querySelector<HTMLAnchorElement>(
    '[data-testid="listitem-title-link"]',
  );
  if (link) return link.href.match(/\/pull\/(\d+)/)?.[1];
  // Old UI: extract from element id (issue_123)
  return prRow.id.split("_")[1];
}

/** Returns the inline metadata div for a PR row (where branch labels, stats, etc. are injected) */
export function getMetadataContainer(prRow: Element): Element | null {
  // New UI: parent of timestamp-container is the description/metadata div
  const newContainer =
    prRow.querySelector('[data-testid="timestamp-container"]')?.parentElement ??
    null;
  if (newContainer) return newContainer;
  // Old UI: the d-flex.mt-1 div
  return (
    prRow.querySelector("div.d-flex.mt-1.text-small.color-fg-muted") ?? null
  );
}

/**
 * Inserts el as a sibling BEFORE the metadata container (renders it on a separate
 * line above the author/timestamp row). Used by addTotalLines and addChangedFiles.
 */
export function insertBeforeMetadata(prRow: Element, el: HTMLElement): void {
  // New UI: insert before the description div inside its .inner wrapper
  const container = prRow.querySelector(
    '[data-testid="timestamp-container"]',
  )?.parentElement;
  if (container?.parentElement) {
    container.parentElement.insertBefore(el, container);
    return;
  }
  // Old UI: insert before the d-flex div inside prRow.children[0].children[2]
  const area = prRow.children[0]?.children[2];
  const metadata = area?.querySelector(
    "div.d-flex.mt-1.text-small.color-fg-muted",
  );
  if (area && metadata) area.insertBefore(el, metadata);
}
