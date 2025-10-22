import React from "react";
import { render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { JiraTab } from "../JiraTab";

const renderWithFormik = (component: React.ReactElement) => {
  return render(
    <Formik initialValues={{ jira: {} }} onSubmit={jest.fn()}>
      {() => component}
    </Formik>,
  );
};

describe("JiraTab", () => {
  test("renders subtitle", () => {
    renderWithFormik(<JiraTab disabled={false} />);

    expect(screen.getByText(/Configure Jira integration/i)).toBeInTheDocument();
  });

  test("renders Jira Base URL field", () => {
    renderWithFormik(<JiraTab disabled={false} />);

    expect(screen.getByText("Jira Base URL")).toBeInTheDocument();
    expect(
      screen.getByText(/The base URL for your Jira instance/i),
    ).toBeInTheDocument();
  });

  test("renders Jira PAT field", () => {
    renderWithFormik(<JiraTab disabled={false} />);

    expect(screen.getByText("Jira Personal Access Token")).toBeInTheDocument();
    expect(screen.getByText(/Create new token in Jira/i)).toBeInTheDocument();
  });

  test("renders Jira Issue Key Regex field", () => {
    renderWithFormik(<JiraTab disabled={false} />);

    expect(screen.getByText("Jira Issue Key Regex")).toBeInTheDocument();
    expect(
      screen.getByText(/Regex to match Jira issue keys/i),
    ).toBeInTheDocument();
  });

  test("renders with disabled prop false", () => {
    renderWithFormik(<JiraTab disabled={false} />);

    expect(screen.getByText("Jira Base URL")).toBeInTheDocument();
  });

  test("renders with disabled prop true", () => {
    renderWithFormik(<JiraTab disabled={true} />);

    expect(screen.getByText("Jira Base URL")).toBeInTheDocument();
  });
});
