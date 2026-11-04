function queryBranchText(
  oldSelector: string,
  newGhUiIndex: number,
): string | null {
  const oldEl = document.querySelector(oldSelector);
  if (oldEl?.textContent?.trim()) return oldEl.textContent.trim();

  // New GH UI: uses a[data-component="BranchName"]; index 0 = base, 1 = head
  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[data-component="BranchName"]',
  );
  return links[newGhUiIndex]?.textContent?.trim() ?? null;
}

export function extractPrPageBranches(): {
  base: string;
  head: string;
} | null {
  const base = queryBranchText(
    "#partial-discussion-header span.commit-ref.base-ref",
    0,
  );
  const head = queryBranchText(
    "#partial-discussion-header span.commit-ref.head-ref",
    1,
  );

  if (!base || !head) return null;
  return { base, head };
}

export function extractJiraIssueKeyFromPrPage(
  issueKeyRegex: string,
): string | null {
  let text = queryBranchText(
    "#partial-discussion-header span.commit-ref.head-ref",
    1,
  );
  if (!text) return null;

  // Fork PRs show "org:branch" format — use the branch portion
  if (text.includes(":")) {
    text = text.split(":").pop()!;
  }

  const match = text.match(new RegExp(issueKeyRegex));
  return match ? match[0] : null;
}
