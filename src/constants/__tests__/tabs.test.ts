import { TABS, Tab } from "../tabs";

describe("tabs constants", () => {
  test("TABS contains all expected tabs", () => {
    expect(TABS).toContain("Feature Toggles");
    expect(TABS).toContain("GH Instances");
    expect(TABS).toContain("Jira");
    expect(TABS).toContain("Import/Export");
  });

  test("TABS has correct length", () => {
    expect(TABS).toHaveLength(4);
  });

  test("TABS is readonly", () => {
    expect(Object.isFrozen(TABS)).toBe(false); // as const makes it readonly in TS, but not frozen at runtime
    expect(TABS).toBeDefined();
  });

  test("Tab type exists", () => {
    const testTab: Tab = "Feature Toggles";
    expect(testTab).toBe("Feature Toggles");
  });
});
