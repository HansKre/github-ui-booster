import { urls, getUrlUiBase } from "../urls";
import { InstanceConfig } from "../../../services";

describe("getUrlUiBase", () => {
  test("removes /api/v3 from GitHub Enterprise URL", () => {
    expect(getUrlUiBase("https://github.company.com/api/v3")).toBe(
      "https://github.company.com",
    );
  });

  test("removes api. subdomain from GitHub Enterprise URL", () => {
    expect(getUrlUiBase("https://api.github.company.com")).toBe(
      "https://github.company.com",
    );
  });

  test("handles both /api/v3 and api. subdomain", () => {
    expect(getUrlUiBase("https://api.github.company.com/api/v3")).toBe(
      "https://github.company.com",
    );
  });

  test("converts GitHub.com API URL to UI URL", () => {
    expect(getUrlUiBase("https://api.github.com")).toBe("https://github.com");
  });

  test("handles URL without trailing slash", () => {
    expect(getUrlUiBase("https://github.company.com/api/v3")).toBe(
      "https://github.company.com",
    );
  });
});

describe("urls", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  test("generates correct base URL", () => {
    const result = urls(mockInstanceConfig);
    expect(result.urlUiBase).toBe("https://github.com/test-org/test-repo");
  });

  test("generates correct PRs URL", () => {
    const result = urls(mockInstanceConfig);
    expect(result.urlUiPrs).toBe("https://github.com/test-org/test-repo/pulls");
  });

  test("generates correct PR URL", () => {
    const result = urls(mockInstanceConfig);
    expect(result.urlUiPr).toBe("https://github.com/test-org/test-repo/pull/");
  });

  test("generates correct compare URL", () => {
    const result = urls(mockInstanceConfig);
    expect(result.urlUiCompare).toBe(
      "https://github.com/test-org/test-repo/compare",
    );
  });

  test("works with GitHub Enterprise URLs", () => {
    const enterpriseConfig: InstanceConfig = {
      ...mockInstanceConfig,
      ghBaseUrl: "https://github.company.com/api/v3",
      org: "enterprise-org",
      repo: "enterprise-repo",
    };

    const result = urls(enterpriseConfig);
    expect(result.urlUiBase).toBe(
      "https://github.company.com/enterprise-org/enterprise-repo",
    );
    expect(result.urlUiPrs).toBe(
      "https://github.company.com/enterprise-org/enterprise-repo/pulls",
    );
  });
});
