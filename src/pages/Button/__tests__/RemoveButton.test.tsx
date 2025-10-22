import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RemoveButton } from "../RemoveButton";

describe("RemoveButton", () => {
  test("renders with correct text", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={true} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  test("is disabled when disabled prop is true", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={true} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    expect(button).toBeDisabled();
  });

  test("is enabled when disabled prop is false", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    expect(button).not.toBeDisabled();
  });

  test("renders as a button element", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    expect(button).toBeInTheDocument();
  });

  test("renders with NoEntryIcon", () => {
    const onClick = jest.fn();
    const { container } = render(
      <RemoveButton disabled={false} onClick={onClick} />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("calls onClick multiple times when clicked multiple times", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("maintains correct disabled state after multiple renders", () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <RemoveButton disabled={false} onClick={onClick} />,
    );

    const button = screen.getByRole("button", { name: /remove/i });
    expect(button).not.toBeDisabled();

    rerender(<RemoveButton disabled={true} onClick={onClick} />);
    expect(button).toBeDisabled();

    rerender(<RemoveButton disabled={false} onClick={onClick} />);
    expect(button).not.toBeDisabled();
  });

  test("handles rapid clicks when enabled", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });

    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }

    expect(onClick).toHaveBeenCalledTimes(10);
  });

  test("onClick is called when button is clicked", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  test("updates onClick handler when prop changes", () => {
    const onClick1 = jest.fn();
    const onClick2 = jest.fn();

    const { rerender } = render(
      <RemoveButton disabled={false} onClick={onClick1} />,
    );

    const button = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(button);
    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).not.toHaveBeenCalled();

    rerender(<RemoveButton disabled={false} onClick={onClick2} />);
    fireEvent.click(button);
    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).toHaveBeenCalledTimes(1);
  });

  test("maintains visual state when toggling disabled", () => {
    const onClick = jest.fn();
    const { rerender, container } = render(
      <RemoveButton disabled={false} onClick={onClick} />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();

    rerender(<RemoveButton disabled={true} onClick={onClick} />);

    const iconAfter = container.querySelector("svg");
    expect(iconAfter).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  test("has button type by default", () => {
    const onClick = jest.fn();
    render(<RemoveButton disabled={false} onClick={onClick} />);

    const button = screen.getByRole("button", { name: /remove/i });
    expect(button).toHaveAttribute("type", "button");
  });
});
