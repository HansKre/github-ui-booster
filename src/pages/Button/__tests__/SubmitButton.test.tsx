import React from "react";
import { render, screen } from "@testing-library/react";
import { SubmitButton } from "../SubmitButton";

describe("SubmitButton", () => {
  test("renders with correct text", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  test("is enabled when isValid and dirty are true and not submitting", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).not.toBeDisabled();
  });

  test("is disabled when isValid is false", () => {
    render(
      <SubmitButton
        isValid={false}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("is disabled when dirty is false", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={false}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("is disabled when isSubmitting is true", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("is disabled when all conditions are false", () => {
    render(
      <SubmitButton
        isValid={false}
        dirty={false}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("is disabled when isValid is false and isSubmitting is true", () => {
    render(
      <SubmitButton
        isValid={false}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("displays result when provided and not submitting", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result="Settings saved successfully!"
      />,
    );

    expect(
      screen.getByText("Settings saved successfully!"),
    ).toBeInTheDocument();
  });

  test("does not display result when isSubmitting is true", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result="Settings saved successfully!"
      />,
    );

    expect(
      screen.queryByText("Settings saved successfully!"),
    ).not.toBeInTheDocument();
  });

  test("does not display result when result is undefined", () => {
    const { container } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const resultParagraph = container.querySelector("p");
    expect(resultParagraph).not.toBeInTheDocument();
  });

  test("renders when isSubmitting is true", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeInTheDocument();
  });

  test("renders when isSubmitting is false", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeInTheDocument();
  });

  test("has submit type", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  test("renders as a button element", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeInTheDocument();
  });

  test("renders with FileSubmoduleIcon", () => {
    const { container } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("maintains icon when submitting", () => {
    const { container } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("transitions from enabled to submitting state", () => {
    const { rerender } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).not.toBeDisabled();

    rerender(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    expect(button).toBeDisabled();
  });

  test("transitions from submitting to showing result", () => {
    const { rerender } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );

    expect(screen.queryByText("Success")).not.toBeInTheDocument();

    rerender(
      <SubmitButton
        isValid={true}
        dirty={false}
        isSubmitting={false}
        result="Success"
      />,
    );

    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  test("clears result when starting new submission", () => {
    const { rerender } = render(
      <SubmitButton
        isValid={true}
        dirty={false}
        isSubmitting={false}
        result="Previous success"
      />,
    );

    expect(screen.getByText("Previous success")).toBeInTheDocument();

    rerender(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result="Previous success"
      />,
    );

    expect(screen.queryByText("Previous success")).not.toBeInTheDocument();
  });

  test("handles edge case: dirty but invalid", () => {
    render(
      <SubmitButton
        isValid={false}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("handles edge case: valid but not dirty", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={false}
        isSubmitting={false}
        result={undefined}
      />,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
  });

  test("displays error result message", () => {
    render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result="Error: Failed to save"
      />,
    );

    expect(screen.getByText("Error: Failed to save")).toBeInTheDocument();
  });

  test("updates result text when prop changes", () => {
    const { rerender } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result="First message"
      />,
    );

    expect(screen.getByText("First message")).toBeInTheDocument();

    rerender(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result="Second message"
      />,
    );

    expect(screen.getByText("Second message")).toBeInTheDocument();
    expect(screen.queryByText("First message")).not.toBeInTheDocument();
  });

  test("complete form submission lifecycle", () => {
    const { rerender } = render(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result={undefined}
      />,
    );

    // Initial state: enabled and ready
    const button = screen.getByRole("button", { name: /save/i });
    expect(button).not.toBeDisabled();

    // Submitting: disabled
    rerender(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={true}
        result={undefined}
      />,
    );
    expect(button).toBeDisabled();

    // Success: show result, disabled (not dirty anymore)
    rerender(
      <SubmitButton
        isValid={true}
        dirty={false}
        isSubmitting={false}
        result="Saved!"
      />,
    );
    expect(button).toBeDisabled();
    expect(screen.getByText("Saved!")).toBeInTheDocument();

    // Make changes: enabled again
    rerender(
      <SubmitButton
        isValid={true}
        dirty={true}
        isSubmitting={false}
        result="Saved!"
      />,
    );
    expect(button).not.toBeDisabled();
  });
});
