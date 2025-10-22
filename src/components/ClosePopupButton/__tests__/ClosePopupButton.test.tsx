import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ClosePopupButton } from "../ClosePopupButton";

describe("ClosePopupButton", () => {
  test("renders button element", () => {
    const { container } = render(<ClosePopupButton />);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  test("renders close icon SVG", () => {
    const { container } = render(<ClosePopupButton />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  test("calls onClick when button is clicked", () => {
    const mockOnClick = jest.fn();
    const { container } = render(<ClosePopupButton onClick={mockOnClick} />);

    const button = container.querySelector("button");
    if (button) {
      fireEvent.click(button);
    }

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("does not throw error when onClick is not provided", () => {
    const { container } = render(<ClosePopupButton />);
    const button = container.querySelector("button");

    expect(() => {
      if (button) {
        fireEvent.click(button);
      }
    }).not.toThrow();
  });

  test("button has tabIndex -1", () => {
    const { container } = render(<ClosePopupButton />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("tabIndex", "-1");
  });

  test("SVG has correct octicon classes", () => {
    const { container } = render(<ClosePopupButton />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("octicon");
    expect(svg).toHaveClass("octicon-x");
  });

  test("SVG has correct accessibility attributes", () => {
    const { container } = render(<ClosePopupButton />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("role", "img");
  });
});
