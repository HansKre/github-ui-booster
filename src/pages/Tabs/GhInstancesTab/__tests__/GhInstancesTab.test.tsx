import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { GhInstancesTab } from "../GhInstancesTab";
import { Settings } from "../../../../services";

describe("GhInstancesTab", () => {
  const mockSettings: Settings = {
    instances: [
      {
        pat: "ghp_test1234567890123456789012345678",
        org: "test-org",
        repo: "test-repo",
        ghBaseUrl: "https://api.github.com",
        randomReviewers: "user1,user2",
      },
    ],
    features: {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      autoFilter: false,
      prTitleFromJira: false,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    },
    fileBlacklist: "package-lock.json",
  };

  test("renders subtitle", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByText(/Configure GitHub instances/i)).toBeInTheDocument();
  });

  test("renders instance section title", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByText("GH Instance 1")).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByText("Personal Access Token")).toBeInTheDocument();
    expect(screen.getByText("Username or Organization")).toBeInTheDocument();
    expect(screen.getByText("Repository")).toBeInTheDocument();
    expect(screen.getByText("GitHub API Base URL")).toBeInTheDocument();
    expect(screen.getByText("Random Reviewers")).toBeInTheDocument();
  });

  test("renders add button", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  test("renders remove button", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  test("renders with multiple instances", () => {
    const multiInstanceSettings: Settings = {
      ...mockSettings,
      instances: [
        {
          pat: "ghp_test1_12345678901234567890123456",
          org: "org1",
          repo: "repo1",
          ghBaseUrl: "https://api.github.com",
          randomReviewers: "user1",
        },
        {
          pat: "ghp_test2_12345678901234567890123456",
          org: "org2",
          repo: "repo2",
          ghBaseUrl: "https://github.enterprise.com/api/v3",
          randomReviewers: "user2",
        },
      ],
    };

    render(
      <Formik initialValues={multiInstanceSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={multiInstanceSettings} isValid={true} />}
      </Formik>,
    );

    expect(screen.getByText("GH Instance 1")).toBeInTheDocument();
    expect(screen.getByText("GH Instance 2")).toBeInTheDocument();
  });

  test("renders with isValid false", () => {
    render(
      <Formik initialValues={mockSettings} onSubmit={jest.fn()}>
        {() => <GhInstancesTab values={mockSettings} isValid={false} />}
      </Formik>,
    );

    expect(screen.getByText("Personal Access Token")).toBeInTheDocument();
  });
});
