import React from "react";
import { render } from "@testing-library/react";
import { CliboardCopy } from "../CliboardCopy";

describe("CliboardCopy", () => {
  beforeEach(() => {
    // Clear any injected styles between tests
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  test("renders clipboard-copy element with correct value", () => {
    const { container } = render(<CliboardCopy value="test-value" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toBeInTheDocument();
    expect(clipboardCopy).toHaveAttribute("value", "test-value");
  });

  test("renders with correct aria-label", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toHaveAttribute("aria-label", "Copy");
  });

  test("renders with correct data-copy-feedback", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toHaveAttribute("data-copy-feedback", "Copied!");
  });

  test("renders with role button", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toHaveAttribute("role", "button");
  });

  test("renders with tabIndex 0", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toHaveAttribute("tabIndex", "0");
  });

  test("renders copy icon svg", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const copyIcon = container.querySelector(".octicon-copy");
    expect(copyIcon).toBeInTheDocument();
    expect(copyIcon).toHaveAttribute("height", "16");
    expect(copyIcon).toHaveAttribute("width", "16");
  });

  test("renders check icon svg", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const checkIcon = container.querySelector(".octicon-check");
    expect(checkIcon).toBeInTheDocument();
    expect(checkIcon).toHaveStyle({ display: "none" });
  });

  test("injects global styles on mount", () => {
    render(<CliboardCopy value="test" />);

    const styleElement = document.getElementById("gh-ui-booster-global-styles");
    expect(styleElement).toBeInTheDocument();
    expect(styleElement?.textContent).toContain("clipboard-copy:hover");
  });

  test("does not inject global styles twice", () => {
    render(<CliboardCopy value="test1" />);
    render(<CliboardCopy value="test2" />);

    const styleElements = document.querySelectorAll(
      "#gh-ui-booster-global-styles",
    );
    expect(styleElements.length).toBe(1);
  });

  test("removes global styles on unmount", () => {
    const { unmount } = render(<CliboardCopy value="test" />);

    expect(
      document.getElementById("gh-ui-booster-global-styles"),
    ).toBeInTheDocument();

    unmount();

    expect(
      document.getElementById("gh-ui-booster-global-styles"),
    ).not.toBeInTheDocument();
  });

  test("renders with correct CSS classes", () => {
    const { container } = render(<CliboardCopy value="test" />);

    const clipboardCopy = container.querySelector("clipboard-copy");
    expect(clipboardCopy).toBeInTheDocument();

    // React sets className as "class" for custom elements in older versions
    const className =
      clipboardCopy?.className ||
      clipboardCopy?.getAttribute("class") ||
      clipboardCopy?.getAttribute("className") ||
      "";

    // If className is still empty, check if classes exist via classList
    if (className === "" && clipboardCopy?.classList) {
      expect(Array.from(clipboardCopy.classList)).toContain("Link--onHover");
      expect(Array.from(clipboardCopy.classList)).toContain("js-copy-branch");
    } else {
      expect(className).toContain("Link--onHover");
      expect(className).toContain("js-copy-branch");
      expect(className).toContain("color-fg-muted");
      expect(className).toContain("d-inline-block");
      expect(className).toContain("ml-1");
    }
  });

  test("renders different values", () => {
    const { container: container1 } = render(
      <CliboardCopy value="value-one" />,
    );
    const { container: container2 } = render(
      <CliboardCopy value="value-two" />,
    );

    expect(container1.querySelector("clipboard-copy")).toHaveAttribute(
      "value",
      "value-one",
    );
    expect(container2.querySelector("clipboard-copy")).toHaveAttribute(
      "value",
      "value-two",
    );
  });
});
