import {
  isOnComparePage,
  extractJiraIssueKeyFromBranch,
} from "../comparePageUtils";
import { InstanceConfig, Settings } from "../../../services";

describe("isOnComparePage", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  const mockLocation = (href: string): Location => ({ href }) as Location;

  test("returns true when on compare page", () => {
    expect(
      isOnComparePage(
        mockInstanceConfig,
        mockLocation(
          "https://github.com/test-org/test-repo/compare/main...feature-branch",
        ),
      ),
    ).toBe(true);
  });

  test("returns false when on PR page", () => {
    expect(
      isOnComparePage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pull/123"),
      ),
    ).toBe(false);
  });

  test("returns false when on PRs listing page", () => {
    expect(
      isOnComparePage(
        mockInstanceConfig,
        mockLocation("https://github.com/test-org/test-repo/pulls"),
      ),
    ).toBe(false);
  });

  test("works with GitHub Enterprise URLs", () => {
    const enterpriseConfig: InstanceConfig = {
      ...mockInstanceConfig,
      ghBaseUrl: "https://github.company.com/api/v3",
    };

    expect(
      isOnComparePage(
        enterpriseConfig,
        mockLocation(
          "https://github.company.com/test-org/test-repo/compare/main...feature",
        ),
      ),
    ).toBe(true);
  });
});

describe("extractJiraIssueKeyFromBranch", () => {
  const createMockSettings = (issueKeyRegex?: string): Settings => ({
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
    jira: issueKeyRegex
      ? {
          pat: "jira_pat_123456789012345678901234567890",
          baseUrl: "https://jira.company.com",
          issueKeyRegex,
        }
      : undefined,
  });

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("returns null when no JIRA regex is configured", () => {
    const settings = createMockSettings();
    expect(extractJiraIssueKeyFromBranch(settings)).toBeNull();
  });

  test("returns null when head-ref-selector element not found", () => {
    const settings = createMockSettings("TEST-\\d+");
    expect(extractJiraIssueKeyFromBranch(settings)).toBeNull();
  });

  test("returns null when span element not found", () => {
    const settings = createMockSettings("TEST-\\d+");
    document.body.innerHTML = '<details id="head-ref-selector"></details>';
    expect(extractJiraIssueKeyFromBranch(settings)).toBeNull();
  });

  test("returns null when span has no text content", () => {
    const settings = createMockSettings("TEST-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target"></span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBeNull();
  });

  test("extracts JIRA issue key from branch name", () => {
    const settings = createMockSettings("TEST-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target">feature/TEST-123-new-feature</span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBe("TEST-123");
  });

  test("returns null when branch name doesn't match pattern", () => {
    const settings = createMockSettings("TEST-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target">feature/no-jira-key</span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBeNull();
  });

  test("extracts first match when multiple patterns exist", () => {
    const settings = createMockSettings("PROJ-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target">PROJ-456-and-PROJ-789</span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBe("PROJ-456");
  });

  test("trims whitespace from branch name", () => {
    const settings = createMockSettings("KEY-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target">  KEY-999-branch  </span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBe("KEY-999");
  });

  test("works with complex JIRA key patterns", () => {
    const settings = createMockSettings("[A-Z]+-\\d+");
    document.body.innerHTML = `
      <details id="head-ref-selector">
        <span class="css-truncate-target">feature/ABC-12345-description</span>
      </details>
    `;
    expect(extractJiraIssueKeyFromBranch(settings)).toBe("ABC-12345");
  });
});
