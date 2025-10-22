import { getPrFromLocation } from "../getPrFromLocation";

describe("getPrFromLocation", () => {
  const mockLocation = (pathname: string): Location =>
    ({ pathname }) as Location;

  test("extracts PR number from standard PR URL", () => {
    expect(getPrFromLocation(mockLocation("/owner/repo/pull/123"))).toBe(123);
  });

  test("extracts PR number from PR URL with trailing slash", () => {
    expect(getPrFromLocation(mockLocation("/owner/repo/pull/456/"))).toBe(456);
  });

  test("extracts PR number from PR URL with sub-path", () => {
    expect(getPrFromLocation(mockLocation("/owner/repo/pull/789/files"))).toBe(
      789,
    );
  });

  test("extracts PR number from PR URL with commits path", () => {
    expect(
      getPrFromLocation(mockLocation("/owner/repo/pull/999/commits")),
    ).toBe(999);
  });

  test("returns undefined for non-PR URL", () => {
    expect(
      getPrFromLocation(mockLocation("/owner/repo/pulls")),
    ).toBeUndefined();
  });

  test("returns undefined for issues URL", () => {
    expect(
      getPrFromLocation(mockLocation("/owner/repo/issues/123")),
    ).toBeUndefined();
  });

  test("returns undefined for repository home", () => {
    expect(getPrFromLocation(mockLocation("/owner/repo"))).toBeUndefined();
  });

  test("returns undefined for empty pathname", () => {
    expect(getPrFromLocation(mockLocation(""))).toBeUndefined();
  });

  test("handles large PR numbers", () => {
    expect(getPrFromLocation(mockLocation("/owner/repo/pull/123456789"))).toBe(
      123456789,
    );
  });

  test("extracts first PR number if multiple numbers in path", () => {
    expect(
      getPrFromLocation(mockLocation("/owner/repo/pull/123/commits/456")),
    ).toBe(123);
  });
});
