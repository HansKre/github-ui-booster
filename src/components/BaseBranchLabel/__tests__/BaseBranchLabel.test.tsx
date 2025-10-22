import React from "react";
import { render, screen } from "@testing-library/react";
import { BaseBranchLabel } from "../BaseBranchLabel";
import { RestEndpointMethodTypes } from "@octokit/rest";

type PullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

describe("BaseBranchLabel", () => {
  const mockCurrentPr: PullRequest = {
    base: {
      ref: "main",
      sha: "abc123",
      label: "org:main",
      repo: {} as PullRequest["base"]["repo"],
      user: {} as PullRequest["base"]["user"],
    },
    head: {
      ref: "feature-branch",
      sha: "def456",
      label: "org:feature-branch",
      repo: {} as PullRequest["head"]["repo"],
      user: {} as PullRequest["head"]["user"],
    },
    html_url: "https://github.com/org/repo/pull/1",
  } as PullRequest;

  const mockBasePr: PullRequest = {
    ...mockCurrentPr,
    html_url: "https://github.com/org/repo/pull/2",
  } as PullRequest;

  test("renders base branch and feature branch names", () => {
    render(<BaseBranchLabel currentPr={mockCurrentPr} />);

    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("feature-branch")).toBeInTheDocument();
  });

  test("renders arrow between branches", () => {
    render(<BaseBranchLabel currentPr={mockCurrentPr} />);

    expect(screen.getByText("←")).toBeInTheDocument();
  });

  test("renders base branch as link when basePr is provided", () => {
    render(<BaseBranchLabel currentPr={mockCurrentPr} basePr={mockBasePr} />);

    const link = screen.getByRole("link", { name: "main" });
    expect(link).toHaveAttribute("href", mockBasePr.html_url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders base branch as plain text when basePr is not provided", () => {
    render(<BaseBranchLabel currentPr={mockCurrentPr} />);

    const baseBranch = screen.getByText("main");
    expect(baseBranch.tagName).toBe("SPAN");
  });

  test("renders feature branch as plain text", () => {
    render(<BaseBranchLabel currentPr={mockCurrentPr} />);

    const featureBranch = screen.getByText("feature-branch");
    expect(featureBranch.tagName).toBe("SPAN");
  });
});
