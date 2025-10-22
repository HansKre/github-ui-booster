import { isOnPrPage } from "../isOnPrPage";
import { InstanceConfig } from "../../../services";

describe("isOnPrPage", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  const mockLocation = (href: string): Location => ({ href }) as Location;

  test("returns true when on PR page", () => {
    expect(
      isOnPrPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pull/123"),
      ),
    ).toBe(true);
  });

  test("returns true when on PR files page", () => {
    expect(
      isOnPrPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pull/123/files"),
      ),
    ).toBe(true);
  });

  test("returns true when on PR commits page", () => {
    expect(
      isOnPrPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pull/456/commits"),
      ),
    ).toBe(true);
  });

  test("returns false when on PRs listing page", () => {
    expect(
      isOnPrPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pulls"),
      ),
    ).toBe(false);
  });

  test("returns false when on issues page", () => {
    expect(
      isOnPrPage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/issues"),
      ),
    ).toBe(false);
  });

  test("returns false when on repository home", () => {
    expect(
      isOnPrPage(
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
      isOnPrPage(
        enterpriseConfig,
        mockLocation("https://github.company.com/test-org/test-repo/pull/789"),
      ),
    ).toBe(true);
  });
});
