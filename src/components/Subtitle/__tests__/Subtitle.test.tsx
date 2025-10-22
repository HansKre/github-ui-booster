import React from "react";
import { render } from "@testing-library/react";
import { Subtitle } from "../Subtitle";

describe("Subtitle", () => {
  test("renders children correctly", () => {
    const { getByText } = render(<Subtitle>Test subtitle</Subtitle>);
    expect(getByText("Test subtitle")).toBeInTheDocument();
  });

  test("renders as paragraph element", () => {
    const { container } = render(<Subtitle>Subtitle text</Subtitle>);
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
  });

  test("renders with correct text content", () => {
    const subtitleText = "This is a subtitle";
    const { getByText } = render(<Subtitle>{subtitleText}</Subtitle>);
    expect(getByText(subtitleText)).toBeInTheDocument();
  });

  test("renders complex children", () => {
    const { container } = render(
      <Subtitle>
        <em>Emphasized</em> subtitle
      </Subtitle>,
    );
    expect(container.querySelector("em")).toBeInTheDocument();
  });
});
