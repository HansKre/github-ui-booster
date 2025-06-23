import { UnderlineNav } from "@primer/react";
import { UnderlineNavItem } from "@primer/react/lib-esm/UnderlineNav/UnderlineNavItem";
import React from "react";

export type Tab = "GH Instances" | "Auto filter";

type Props = {
  tabs: Tab[];
  activeTab: Tab;
  onTabClick: (tab: Tab) => void;
};

export const TabNavigation: React.FC<Props> = ({
  tabs,
  activeTab,
  onTabClick,
}) => {
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
