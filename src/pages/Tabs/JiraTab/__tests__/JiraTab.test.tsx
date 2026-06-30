import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { JiraTab } from "../JiraTab";
import { Features } from "../../../../services/getSettings";

const mockFeatures: Features = {
  addUpdateBranchButton: true,
  aiCodeSummary: true,
  aiSummary: true,
  autoFilter: false,
  baseBranchLabels: true,
  changedFiles: true,
  descriptionTemplate: true,
  persistToUserProfile: false,
  prTitleFromJira: true,
  randomReviewer: true,
  reOrderPrs: true,
  totalLinesPr: true,
  totalLinesPrs: true,
};

const mockOnToggle = jest.fn();

const renderWithFormik = (component: React.ReactElement) => {
  return render(
    <Formik initialValues={{ jira: {} }} onSubmit={jest.fn()}>
      {() => component}
    </Formik>,
  );
};

describe("JiraTab", () => {
  test("renders subtitle", () => {
    renderWithFormik(
      <JiraTab
        disabled={false}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText(/Configure Jira integration/i)).toBeInTheDocument();
  });

  test("renders Jira Base URL field", () => {
    renderWithFormik(
      <JiraTab
        disabled={false}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Jira Base URL")).toBeInTheDocument();
    expect(
      screen.getByText(/The base URL for your Jira instance/i),
    ).toBeInTheDocument();
  });

  test("renders Jira PAT field", () => {
    renderWithFormik(
      <JiraTab
        disabled={false}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Jira Personal Access Token")).toBeInTheDocument();
    expect(screen.getByText(/Create new token in Jira/i)).toBeInTheDocument();
  });

  test("renders Jira Issue Key Regex field", () => {
    renderWithFormik(
      <JiraTab
        disabled={false}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Jira Issue Key Regex")).toBeInTheDocument();
    expect(
      screen.getByText(/Regex to match Jira issue keys/i),
    ).toBeInTheDocument();
  });

  test("renders PR title from Jira toggle", () => {
    renderWithFormik(
      <JiraTab
        disabled={false}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Add PR Title from Jira")).toBeInTheDocument();
  });

  test("renders with disabled prop true", () => {
    renderWithFormik(
      <JiraTab
        disabled={true}
        features={mockFeatures}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Jira Base URL")).toBeInTheDocument();
  });
});
