import React from "react";
import { render } from "@testing-library/react";
import { SectionTitle } from "../SectionTitle";

describe("SectionTitle", () => {
  test("renders children correctly", () => {
    const { getByText } = render(<SectionTitle>Test Title</SectionTitle>);
    expect(getByText("Test Title")).toBeInTheDocument();
  });

  test("renders as h2 element", () => {
    const { container } = render(<SectionTitle>Heading</SectionTitle>);
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
  });

  test("renders with correct text content", () => {
    const titleText = "Section Heading";
    const { getByText } = render(<SectionTitle>{titleText}</SectionTitle>);
    expect(getByText(titleText)).toBeInTheDocument();
  });

  test("renders complex children", () => {
    const { container } = render(
      <SectionTitle>
        <span>Complex</span> Title
      </SectionTitle>,
    );
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});
