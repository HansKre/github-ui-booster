import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddButton } from "../AddButton";
import { DEFAULT_INSTANCE } from "../../../services";

describe("AddButton", () => {
  test("renders with correct text", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    expect(screen.getByText("Add instance")).toBeInTheDocument();
  });

  test("calls push with DEFAULT_INSTANCE when clicked", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    fireEvent.click(button);

    expect(push).toHaveBeenCalledWith(DEFAULT_INSTANCE);
    expect(push).toHaveBeenCalledTimes(1);
  });

  test("is disabled when disabled prop is true", () => {
    const push = jest.fn();
    render(<AddButton disabled={true} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    expect(button).toBeDisabled();
  });

  test("is enabled when disabled prop is false", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    expect(button).not.toBeDisabled();
  });

  test("does not call push when disabled and clicked", () => {
    const push = jest.fn();
    render(<AddButton disabled={true} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    fireEvent.click(button);

    expect(push).not.toHaveBeenCalled();
  });

  test("has button type", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    expect(button).toHaveAttribute("type", "button");
  });

  test("renders as a button element", () => {
    const push = jest.fn();
    const { container } = render(<AddButton disabled={false} push={push} />);

    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  test("renders with PlusIcon", () => {
    const push = jest.fn();
    const { container } = render(<AddButton disabled={false} push={push} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("calls push multiple times when clicked multiple times", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(push).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenCalledWith(DEFAULT_INSTANCE);
  });

  test("maintains correct disabled state after multiple renders", () => {
    const push = jest.fn();
    const { rerender } = render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    expect(button).not.toBeDisabled();

    rerender(<AddButton disabled={true} push={push} />);
    expect(button).toBeDisabled();

    rerender(<AddButton disabled={false} push={push} />);
    expect(button).not.toBeDisabled();
  });

  test("always passes same DEFAULT_INSTANCE object", () => {
    const push = jest.fn();
    render(<AddButton disabled={false} push={push} />);

    const button = screen.getByRole("button", { name: /add instance/i });
    fireEvent.click(button);
    fireEvent.click(button);

    const firstCall = push.mock.calls[0][0];
    const secondCall = push.mock.calls[1][0];

    expect(firstCall).toBe(DEFAULT_INSTANCE);
    expect(secondCall).toBe(DEFAULT_INSTANCE);
  });
});
