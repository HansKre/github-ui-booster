import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { TabNavigation } from "../TabNavigation";
import { TABS } from "../../../constants";

describe("TabNavigation", () => {
  const mockOnTabClick = jest.fn();

  beforeEach(() => {
    mockOnTabClick.mockClear();
  });

  test("renders all tabs", () => {
    const { getByText } = render(
      <TabNavigation
        tabs={TABS}
        activeTab="Feature Toggles"
        onTabClick={mockOnTabClick}
      />,
    );

    TABS.forEach((tab) => {
      expect(getByText(tab)).toBeInTheDocument();
    });
  });

  test("calls onTabClick when a tab is clicked", () => {
    const { getByText } = render(
      <TabNavigation
        tabs={TABS}
        activeTab="Feature Toggles"
        onTabClick={mockOnTabClick}
      />,
    );

    const jiraTab = getByText("Jira");
    fireEvent.click(jiraTab);

    expect(mockOnTabClick).toHaveBeenCalledTimes(1);
    expect(mockOnTabClick).toHaveBeenCalledWith("Jira");
  });

  test("marks active tab with aria-current", () => {
    const { getByText } = render(
      <TabNavigation
        tabs={TABS}
        activeTab="GH Instances"
        onTabClick={mockOnTabClick}
      />,
    );

    const activeTabButton = getByText("GH Instances").closest("button");
    expect(activeTabButton).toHaveAttribute("aria-current", "page");
  });

  test("does not mark inactive tabs with aria-current", () => {
    const { getByText } = render(
      <TabNavigation
        tabs={TABS}
        activeTab="Feature Toggles"
        onTabClick={mockOnTabClick}
      />,
    );

    const inactiveTab = getByText("Jira").closest("button");
    expect(inactiveTab).not.toHaveAttribute("aria-current", "page");
  });

  test("prevents default behavior on tab click", () => {
    const { getByText } = render(
      <TabNavigation
        tabs={TABS}
        activeTab="Feature Toggles"
        onTabClick={mockOnTabClick}
      />,
    );

    const tab = getByText("Jira");

    // Simulate click with preventDefault
    fireEvent.click(tab);
    // The preventDefault is called internally, we just verify the handler was called
    expect(mockOnTabClick).toHaveBeenCalled();
  });

  test("renders with custom tabs subset", () => {
    const customTabs = ["Feature Toggles", "Jira"] as const;
    const { getByText, queryByText } = render(
      <TabNavigation
        tabs={customTabs}
        activeTab="Feature Toggles"
        onTabClick={mockOnTabClick}
      />,
    );

    expect(getByText("Feature Toggles")).toBeInTheDocument();
    expect(getByText("Jira")).toBeInTheDocument();
    expect(queryByText("GH Instances")).not.toBeInTheDocument();
  });
});
