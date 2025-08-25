import { UnderlineNav } from "@primer/react";
import { UnderlineNavItem } from "@primer/react/lib-esm/UnderlineNav/UnderlineNavItem";
import React from "react";

export type Tab = "GH Instances" | "Auto filter" | "Jira";

type Props<T = Tab> = {
  tabs: T[];
  activeTab: T;
  onTabClick: (tab: T) => void;
};

export const TabNavigation = <T extends string = Tab>({
  tabs,
  activeTab,
  onTabClick,
}: Props<T>) => {
  return (
    <UnderlineNav aria-label="Tabs">
      {tabs.map((tab) => (
        <UnderlineNavItem
          key={tab}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabClick(tab);
          }}
          aria-current={tab === activeTab ? "page" : undefined}
          as="button"
        >
          {tab}
        </UnderlineNavItem>
      ))}
    </UnderlineNav>
  );
};
