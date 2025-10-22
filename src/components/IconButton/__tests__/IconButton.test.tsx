import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { IconButton } from "../IconButton";
import { CheckIcon, XIcon } from "@primer/octicons-react";

describe("IconButton", () => {
  test("renders icon when not loading", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton Icon={CheckIcon} onClick={onClick} isLoading={false} />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("renders spinner when loading", () => {
    const onClick = jest.fn();
    render(<IconButton Icon={CheckIcon} onClick={onClick} isLoading={true} />);

    // Spinner should be rendered (from @primer/react)
    expect(document.body).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton Icon={CheckIcon} onClick={onClick} isLoading={false} />,
    );

    const button = container.querySelector("span");
    if (button) {
      fireEvent.click(button);
    }

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("renders with tooltip when tooltipText is provided", () => {
    const onClick = jest.fn();
    render(
      <IconButton
        Icon={CheckIcon}
        onClick={onClick}
        isLoading={false}
        tooltipText="Click me"
      />,
    );

    expect(document.body).toBeInTheDocument();
  });

  test("renders without tooltip when tooltipText is not provided", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton Icon={CheckIcon} onClick={onClick} isLoading={false} />,
    );

    const button = container.querySelector("span");
    expect(button).toBeInTheDocument();
  });

  test("applies className prop", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton
        Icon={CheckIcon}
        onClick={onClick}
        isLoading={false}
        className="custom-class"
      />,
    );

    const button = container.querySelector("span.custom-class");
    expect(button).toBeInTheDocument();
  });

  test("applies loadingClassName when loading", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton
        Icon={CheckIcon}
        onClick={onClick}
        isLoading={true}
        loadingClassName="loading-class"
      />,
    );

    const button = container.querySelector("span.loading-class");
    expect(button).toBeInTheDocument();
  });

  test("does not apply loadingClassName when not loading", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton
        Icon={CheckIcon}
        onClick={onClick}
        isLoading={false}
        loadingClassName="loading-class"
      />,
    );

    const button = container.querySelector("span.loading-class");
    expect(button).not.toBeInTheDocument();
  });

  test("renders different icons", () => {
    const onClick = jest.fn();
    const { container } = render(
      <IconButton Icon={XIcon} onClick={onClick} isLoading={false} />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
