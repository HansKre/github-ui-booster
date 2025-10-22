export function getPrFromLocation(
  location: Location = globalThis.window.location,
): number | undefined {
  const [, prNumber] = location.pathname.match(/\/pull\/([0-9]+?)(\/|$)/) ?? [];
  return prNumber ? Number(prNumber) : undefined;
}
