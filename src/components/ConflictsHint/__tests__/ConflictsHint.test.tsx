import React from "react";
import { render } from "@testing-library/react";
import { ConflictsHint } from "../ConflictsHint";

describe("ConflictsHint", () => {
  test("renders the alert icon", () => {
    const { container } = render(<ConflictsHint />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("renders the wrapper span", () => {
    const { container } = render(<ConflictsHint />);

    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });

  test("applies the correct CSS class to icon", () => {
    const { container } = render(<ConflictsHint />);

    const icon = container.querySelector("svg.completeness-indicator-problem");
    expect(icon).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    expect(() => render(<ConflictsHint />)).not.toThrow();
  });
});
