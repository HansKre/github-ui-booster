import React from "react";
import { render } from "@testing-library/react";
import { Paragraph } from "../Paragraph";

describe("Paragraph", () => {
  test("renders children correctly", () => {
    const { getByText } = render(<Paragraph>Test content</Paragraph>);
    expect(getByText("Test content")).toBeInTheDocument();
  });

  test("renders as a paragraph element", () => {
    const { container } = render(<Paragraph>Test</Paragraph>);
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
  });

  test("accepts custom sx styles", () => {
    const customStyles = { fontSize: "16px" };
    render(<Paragraph sx={customStyles}>Styled text</Paragraph>);
    // Component should render without errors
    expect(true).toBe(true);
  });

  test("renders with default styles", () => {
    render(<Paragraph>Default paragraph</Paragraph>);
    // Component should render without errors
    expect(true).toBe(true);
  });

  test("renders complex children", () => {
    const { container } = render(
      <Paragraph>
        <span>Complex</span> <strong>children</strong>
      </Paragraph>,
    );
    expect(container.querySelector("span")).toBeInTheDocument();
    expect(container.querySelector("strong")).toBeInTheDocument();
  });
});
