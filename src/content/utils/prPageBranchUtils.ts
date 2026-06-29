export function extractPrPageBranches(): {
  base: string;
  head: string;
} | null {
  const baseEl = document.querySelector(
    "#partial-discussion-header span.commit-ref.base-ref",
  );
  const headEl = document.querySelector(
    "#partial-discussion-header span.commit-ref.head-ref",
  );

  const base = baseEl?.textContent?.trim();
  const head = headEl?.textContent?.trim();

  if (!base || !head) return null;
  return { base, head };
}

export function extractJiraIssueKeyFromPrPage(
  issueKeyRegex: string,
): string | null {
  const headEl = document.querySelector(
    "#partial-discussion-header span.commit-ref.head-ref",
  );
  let text = headEl?.textContent?.trim();
  if (!text) return null;

  // Fork PRs show "org:branch" format — use the branch portion
  if (text.includes(":")) {
    text = text.split(":").pop()!;
  }

  const match = text.match(new RegExp(issueKeyRegex));
  return match ? match[0] : null;
}
