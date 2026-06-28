export const TABS = [
  "Feature Toggles",
  "GH Instances",
  "Jira",
  "AI",
  "Import/Export",
] as const;

export type Tab = (typeof TABS)[number];
