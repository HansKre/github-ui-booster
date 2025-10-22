import { isOnPrsPage } from "../isOnPrsPage";
import { InstanceConfig } from "../../../services";

describe("isOnPrsPage", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  const mockLocation = (href: string): Location => ({ href }) as Location;

  test("returns true when on PRs listing page", () => {
    expect(
      isOnPrsPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pulls"),
      ),
    ).toBe(true);
  });

  test("returns true when on PRs page with query parameters", () => {
    expect(
      isOnPrsPage(
        mockInstanceConfig,
        mockLocation(
          "https://github.com/test-org/test-repo/pulls?q=is%3Aopen+is%3Apr",
        ),
      ),
    ).toBe(true);
  });

  test("returns false when on individual PR page", () => {
    expect(
      isOnPrsPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pull/123"),
      ),
    ).toBe(false);
  });

  test("returns false when on issues page", () => {
    expect(
      isOnPrsPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/issues"),
      ),
    ).toBe(false);
  });

  test("returns false when on repository home", () => {
    expect(
      isOnPrsPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo"),
      ),
    ).toBe(false);
  });

  test("works with GitHub Enterprise URLs", () => {
    const enterpriseConfig: InstanceConfig = {
      ...mockInstanceConfig,
      ghBaseUrl: "https://github.company.com/api/v3",
    };

    expect(
      isOnPrsPage(
        enterpriseConfig,
        mockLocation("https://github.company.com/test-org/test-repo/pulls"),
      ),
    ).toBe(true);
  });
});
