import { getFileBlacklist } from "../getFileBlacklist";
import { Settings } from "../services/getSettings";

describe("getFileBlacklist", () => {
  const createMockSettings = (fileBlacklist?: string): Settings => ({
    features: {
      addUpdateBranchButton: true,
      autoFilter: false,
      baseBranchLabels: true,
      changedFiles: true,
      descriptionTemplate: false,
      persistToUserProfile: false,
      prTitleFromJira: false,
      randomReviewer: false,
      reOrderPrs: true,
      totalLinesPr: true,
      totalLinesPrs: true,
    },
    fileBlacklist: fileBlacklist || "",
  });

  test("returns empty array when fileBlacklist is undefined", () => {
    const settings = createMockSettings(undefined);
    expect(getFileBlacklist(settings)).toEqual([]);
  });

  test("returns empty array when fileBlacklist is empty string", () => {
    const settings = createMockSettings("");
    expect(getFileBlacklist(settings)).toEqual([]);
  });

  test("parses single file correctly", () => {
    const settings = createMockSettings("package-lock.json");
    expect(getFileBlacklist(settings)).toEqual(["package-lock.json"]);
  });

  test("parses multiple comma-separated files", () => {
    const settings = createMockSettings(
      "package-lock.json,pnpm-lock.yaml,yarn.lock",
    );
    expect(getFileBlacklist(settings)).toEqual([
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ]);
  });

  test("trims whitespace from filenames", () => {
    const settings = createMockSettings(
      " package-lock.json , pnpm-lock.yaml , yarn.lock ",
    );
    expect(getFileBlacklist(settings)).toEqual([
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ]);
  });

  test("filters out empty strings from result", () => {
    const settings = createMockSettings("package-lock.json,,yarn.lock,");
    expect(getFileBlacklist(settings)).toEqual([
      "package-lock.json",
      "yarn.lock",
    ]);
  });

  test("handles mixed whitespace and empty values", () => {
    const settings = createMockSettings(
      "package-lock.json,  , yarn.lock,   ,test.txt",
    );
    expect(getFileBlacklist(settings)).toEqual([
      "package-lock.json",
      "yarn.lock",
      "test.txt",
    ]);
  });
});
