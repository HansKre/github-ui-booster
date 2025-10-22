import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";
import { PlusIcon } from "@primer/octicons-react";

describe("Button", () => {
  test("renders with children text", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("renders without children", () => {
    const { container } = render(<Button />);

    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toBe("");
  });

  test("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button disabled={true} onClick={onClick}>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  test("is disabled when disabled prop is true", () => {
    render(<Button disabled={true}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
  });

  test("is enabled by default", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).not.toBeDisabled();
  });

  test("has correct type attribute when specified", () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  test("renders as a button when type not specified", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("displays result text when provided", () => {
    render(<Button result="Success!">Click me</Button>);

    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  test("does not display result when not provided", () => {
    render(<Button>Click me</Button>);

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  test("does not display result when result is undefined", () => {
    render(<Button result={undefined}>Click me</Button>);

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  test("does not display result when result is empty string", () => {
    render(<Button result="">Click me</Button>);

    // Empty string is falsy, so result paragraph should not render
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  test("renders with primary variant", () => {
    render(<Button variant="primary">Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("renders with danger variant", () => {
    render(<Button variant="danger">Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("renders when loading prop is true", () => {
    render(<Button loading={true}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("renders without loading state by default", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("renders with icon when provided", () => {
    const { container } = render(<Button icon={PlusIcon}>Add</Button>);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("renders without icon when not provided", () => {
    const { container } = render(<Button>Click me</Button>);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeInTheDocument();
  });

  test("handles multiple clicks", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("works without onClick handler", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  test("updates result text when prop changes", () => {
    const { rerender } = render(<Button result="First">Click me</Button>);

    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(<Button result="Second">Click me</Button>);
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });

  test("removes result text when result becomes undefined", () => {
    const { rerender } = render(<Button result="Success">Click me</Button>);

    expect(screen.getByText("Success")).toBeInTheDocument();

    rerender(<Button result={undefined}>Click me</Button>);
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
  });

  test("renders children with multiple elements", () => {
    render(
      <Button>
        <span>Part 1</span>
        <span>Part 2</span>
      </Button>,
    );

    expect(screen.getByText("Part 1")).toBeInTheDocument();
    expect(screen.getByText("Part 2")).toBeInTheDocument();
  });

  test("is disabled when both disabled and loading are true", () => {
    render(
      <Button disabled={true} loading={true}>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
  });

  test("renders as block element", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("combines multiple props correctly", () => {
    const onClick = jest.fn();
    const { container } = render(
      <Button
        type="submit"
        disabled={false}
        variant="primary"
        loading={false}
        icon={PlusIcon}
        onClick={onClick}
        result="Done"
      >
        Submit Form
      </Button>,
    );

    const button = screen.getByRole("button", { name: /submit form/i });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).not.toBeDisabled();
    expect(screen.getByText("Done")).toBeInTheDocument();

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
