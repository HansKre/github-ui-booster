import React from "react";
import { render, screen } from "@testing-library/react";
import { TotalLines } from "../TotalLines";

describe("TotalLines", () => {
  test("renders added and removed line counts", () => {
    render(<TotalLines totalLinesAdded={50} totalLinesRemoved={30} />);

    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  test("renders with zero additions", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={0} totalLinesRemoved={10} />,
    );

    const text = container.textContent;
    expect(text).toContain("0");
    expect(text).toContain("10");
  });

  test("renders with zero removals", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={25} totalLinesRemoved={0} />,
    );

    const text = container.textContent;
    expect(text).toContain("25");
    expect(text).toContain("0");
  });

  test("renders with both values as zero", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={0} totalLinesRemoved={0} />,
    );

    const text = container.textContent;
    expect(text).toContain("0");
  });

  test("renders diff stat blocks", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={100} totalLinesRemoved={50} />,
    );

    const blocks = container.querySelectorAll(
      ".diffstat-block-added, .diffstat-block-neutral",
    );
    expect(blocks.length).toBe(5);
  });

  test("renders all positive blocks when only additions", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={100} totalLinesRemoved={0} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    const neutralBlocks = container.querySelectorAll(".diffstat-block-neutral");

    expect(positiveBlocks.length).toBe(5);
    expect(neutralBlocks.length).toBe(0);
  });

  test("renders all neutral blocks when only removals", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={0} totalLinesRemoved={100} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    const neutralBlocks = container.querySelectorAll(".diffstat-block-neutral");

    expect(positiveBlocks.length).toBe(0);
    expect(neutralBlocks.length).toBe(5);
  });

  test("renders correct proportion of positive blocks", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={75} totalLinesRemoved={25} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    expect(positiveBlocks.length).toBe(4);
  });

  test("renders correct proportion for 50/50 split", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={50} totalLinesRemoved={50} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    const neutralBlocks = container.querySelectorAll(".diffstat-block-neutral");

    expect(positiveBlocks.length).toBe(3);
    expect(neutralBlocks.length).toBe(2);
  });

  test("handles large numbers", () => {
    render(<TotalLines totalLinesAdded={10000} totalLinesRemoved={5000} />);

    expect(screen.getByText(/10000/)).toBeInTheDocument();
    expect(screen.getByText(/5000/)).toBeInTheDocument();
  });

  test("renders icons for additions and removals", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={50} totalLinesRemoved={30} />,
    );

    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });

  test("applies success color class to additions", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={50} totalLinesRemoved={30} />,
    );

    const successElements = container.querySelectorAll(".color-fg-success");
    expect(successElements.length).toBeGreaterThanOrEqual(2);
  });

  test("applies danger color class to removals", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={50} totalLinesRemoved={30} />,
    );

    const dangerElements = container.querySelectorAll(".color-fg-danger");
    expect(dangerElements.length).toBeGreaterThanOrEqual(2);
  });

  test("handles single digit values", () => {
    render(<TotalLines totalLinesAdded={5} totalLinesRemoved={3} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  test("renders correct block distribution for 80/20 split", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={80} totalLinesRemoved={20} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    expect(positiveBlocks.length).toBe(4);
  });

  test("renders correct block distribution for 20/80 split", () => {
    const { container } = render(
      <TotalLines totalLinesAdded={20} totalLinesRemoved={80} />,
    );

    const positiveBlocks = container.querySelectorAll(".diffstat-block-added");
    expect(positiveBlocks.length).toBe(1);
  });
});
