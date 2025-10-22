import React from "react";
import { render } from "@testing-library/react";
import { RandomReviewerButton } from "../RandomReviewerButton";

const mockOctokit = {
  pulls: {
    listRequestedReviewers: jest.fn(),
    requestReviewers: jest.fn(),
  },
} as any;

const mockInstanceConfig = {
  pat: "ghp_test1234567890123456789012345678",
  org: "test-org",
  repo: "test-repo",
  ghBaseUrl: "https://api.github.com",
  randomReviewers: "user1,user2,user3",
};

describe("RandomReviewerButton", () => {
  test("renders component", () => {
    const { container } = render(
      <RandomReviewerButton
        octokit={mockOctokit}
        instanceConfig={mockInstanceConfig}
      />,
    );

    // IconButton renders as a span, not a button
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(
      <RandomReviewerButton
        octokit={mockOctokit}
        instanceConfig={mockInstanceConfig}
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
