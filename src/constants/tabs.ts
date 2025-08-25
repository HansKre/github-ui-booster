export const TABS = [
  "Feature Toggles",
  "GH Instances",
  "Auto filter",
  "Jira",
  "Import/Export",
] as const;

export type Tab = (typeof TABS)[number];

export const isValidTab = (tab: string): tab is Tab => {
  return TABS.includes(tab as Tab);
};
