import React from "react";
import { render } from "@testing-library/react";
import { FeatureItem } from "../FeatureItem";

describe("FeatureItem", () => {
  test("renders label and caption", () => {
    const { getByText } = render(
      <FeatureItem label="Test Feature" caption="Test caption" />,
    );

    expect(getByText("Test Feature")).toBeInTheDocument();
    expect(getByText("Test caption")).toBeInTheDocument();
  });

  test("renders with onClick and checked props", () => {
    const mockOnClick = jest.fn();
    const { getByText } = render(
      <FeatureItem
        label="Toggle Feature"
        caption="Feature description"
        checked={true}
        onClick={mockOnClick}
      />,
    );

    expect(getByText("Toggle Feature")).toBeInTheDocument();
    expect(getByText("Feature description")).toBeInTheDocument();
  });

  test("renders without onClick (read-only mode)", () => {
    const { getByText } = render(
      <FeatureItem label="Read Only" caption="No toggle here" />,
    );

    expect(getByText("Read Only")).toBeInTheDocument();
    expect(getByText("No toggle here")).toBeInTheDocument();
  });

  test("renders with checked false", () => {
    const mockOnClick = jest.fn();
    const { getByText } = render(
      <FeatureItem
        label="Unchecked Feature"
        caption="This is unchecked"
        checked={false}
        onClick={mockOnClick}
      />,
    );

    expect(getByText("Unchecked Feature")).toBeInTheDocument();
  });

  test("renders with aria-label", () => {
    const mockOnClick = jest.fn();
    const { getByText } = render(
      <FeatureItem
        label="Feature"
        caption="Caption"
        checked={true}
        onClick={mockOnClick}
        ariaLabel="Custom aria label"
      />,
    );

    expect(getByText("Feature")).toBeInTheDocument();
  });

  test("renders with different label and caption combinations", () => {
    const { getByText } = render(
      <FeatureItem
        label="Complex Feature Name"
        caption="This is a very detailed caption explaining the feature"
      />,
    );

    expect(getByText("Complex Feature Name")).toBeInTheDocument();
    expect(
      getByText("This is a very detailed caption explaining the feature"),
    ).toBeInTheDocument();
  });
});
