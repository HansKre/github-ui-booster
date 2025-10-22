import { getInstanceConfig } from "../getInstanceConfig";
import { Settings } from "../services/getSettings";

describe("getInstanceConfig", () => {
  const mockLocation = (href: string, pathname: string): Location =>
    ({ href, pathname }) as Location;

  const createMockSettings = (overrides: Partial<Settings> = {}): Settings => ({
    features: {
      addUpdateBranchButton: true,
      autoFilter: false,
      baseBranchLabels: true,
      changedFiles: true,
      descriptionTemplate: false,
      persistToUserProfile: false,
      prTitleFromJira: false,
      randomReviewer: false,
      reOrderPrs: true,
      totalLinesPr: true,
      totalLinesPrs: true,
    },
    fileBlacklist: "package-lock.json",
    instances: [
      {
        ghBaseUrl: "https://api.github.com",
        org: "test-org",
        repo: "test-repo",
        pat: "ghp_1234567890123456789012345678901234567890",
        randomReviewers: "",
      },
    ],
    ...overrides,
  });

  test("returns instance config when on matching URL", () => {
    const settings = createMockSettings();
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pull/123",
      "/test-org/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "test-org",
      repo: "test-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("returns undefined when no instances configured", () => {
    const settings = createMockSettings({ instances: [] });
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pull/123",
      "/test-org/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toBeUndefined();
  });

  test("returns undefined when URL doesn't match any instance", () => {
    const settings = createMockSettings();
    const location = mockLocation(
      "https://github.com/other-org/other-repo/pull/123",
      "/other-org/other-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toBeUndefined();
  });

  test("returns undefined when pathname has less than 2 segments", () => {
    const settings = createMockSettings();
    const location = mockLocation("https://github.com/test-org", "/test-org");

    const result = getInstanceConfig(settings, location);

    expect(result).toBeUndefined();
  });

  test("works with wildcard org", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "*",
          repo: "test-repo",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/any-org/test-repo/pull/123",
      "/any-org/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "any-org",
      repo: "test-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("works with wildcard repo", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "test-org",
          repo: "*",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/test-org/any-repo/pull/123",
      "/test-org/any-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "test-org",
      repo: "any-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("works with multiple orgs in config", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "org1, org2, test-org",
          repo: "test-repo",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/org2/test-repo/pull/123",
      "/org2/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "org2",
      repo: "test-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("works with multiple repos in config", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "test-org",
          repo: "repo1, repo2, test-repo",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/test-org/repo2/pull/123",
      "/test-org/repo2/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "test-org",
      repo: "repo2",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("works with GitHub Enterprise", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://github.company.com/api/v3",
          org: "test-org",
          repo: "test-repo",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.company.com/test-org/test-repo/pull/123",
      "/test-org/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://github.company.com/api/v3",
      org: "test-org",
      repo: "test-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("handles spaces in comma-separated values", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: " org1 , org2 , test-org ",
          repo: " repo1 , test-repo ",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/org2/test-repo/pull/123",
      "/org2/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toEqual({
      ghBaseUrl: "https://api.github.com",
      org: "org2",
      repo: "test-repo",
      pat: "ghp_1234567890123456789012345678901234567890",
      randomReviewers: "",
    });
  });

  test("returns undefined when org doesn't match", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "org1, org2",
          repo: "test-repo",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/wrong-org/test-repo/pull/123",
      "/wrong-org/test-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toBeUndefined();
  });

  test("returns undefined when repo doesn't match", () => {
    const settings = createMockSettings({
      instances: [
        {
          ghBaseUrl: "https://api.github.com",
          org: "test-org",
          repo: "repo1, repo2",
          pat: "ghp_1234567890123456789012345678901234567890",
          randomReviewers: "",
        },
      ],
    });
    const location = mockLocation(
      "https://github.com/test-org/wrong-repo/pull/123",
      "/test-org/wrong-repo/pull/123",
    );

    const result = getInstanceConfig(settings, location);

    expect(result).toBeUndefined();
  });
});
