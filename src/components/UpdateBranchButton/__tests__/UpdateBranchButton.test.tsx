import React from "react";
import { render } from "@testing-library/react";
import { UpdateBranchButton } from "../UpdateBranchButton";

const mockOctokit = {
  pulls: {
    updateBranch: jest.fn(),
    get: jest.fn(),
  },
} as any;

const mockInstanceConfig = {
  pat: "ghp_test1234567890123456789012345678",
  org: "test-org",
  repo: "test-repo",
  ghBaseUrl: "https://api.github.com",
  randomReviewers: "user1,user2",
};

const mockPr = {
  number: 123,
  head: {
    ref: "feature-branch",
    sha: "abc123",
  },
  base: {
    ref: "main",
  },
} as any;

describe("UpdateBranchButton", () => {
  test("renders component", () => {
    const { container } = render(
      <UpdateBranchButton
        octokit={mockOctokit}
        instanceConfig={mockInstanceConfig}
        pr={mockPr}
        lastDeviatingSha="xyz789"
        onSuccess={jest.fn()}
      />,
    );

    // IconButton renders as a span, not a button
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(
      <UpdateBranchButton
        octokit={mockOctokit}
        instanceConfig={mockInstanceConfig}
        pr={mockPr}
        lastDeviatingSha="xyz789"
        onSuccess={jest.fn()}
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
