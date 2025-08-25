import { UnderlineNav } from "@primer/react";
import { UnderlineNavItem } from "@primer/react/lib-esm/UnderlineNav/UnderlineNavItem";
import React from "react";
import { Tab } from "../../constants";

type Props = {
  tabs: readonly Tab[];
  activeTab: Tab;
  onTabClick: (tab: Tab) => void;
};

export const TabNavigation = ({ tabs, activeTab, onTabClick }: Props) => {
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
