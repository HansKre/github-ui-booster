export const TABS = [
  "Feature Toggles",
  "GH Instances",
  "Jira",
  "Import/Export",
] as const;

export type Tab = (typeof TABS)[number];
