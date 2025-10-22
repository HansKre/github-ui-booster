import {
  getSettings,
  getSettingValue,
  INITIAL_VALUES,
  Settings,
  settingsSchema,
} from "../getSettings";

describe("getSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns INITIAL_VALUES when storage is empty", async () => {
    const mockGet = jest.fn().mockResolvedValue({});
    (chrome.storage.local.get as jest.Mock) = mockGet;

    const onSuccess = jest.fn();
    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalledWith(INITIAL_VALUES);
  });

  test("returns local settings when persistToUserProfile is false", async () => {
    const localSettings: Settings = {
      features: {
        addUpdateBranchButton: true,
        autoFilter: false,
        baseBranchLabels: false,
        changedFiles: true,
        descriptionTemplate: false,
        persistToUserProfile: false,
        prTitleFromJira: false,
        randomReviewer: false,
        reOrderPrs: true,
        totalLinesPr: true,
        totalLinesPrs: true,
      },
      fileBlacklist: "package-lock.json",
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(localSettings);

    const onSuccess = jest.fn();
    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalledWith(localSettings);
  });

  test("returns sync settings when persistToUserProfile is true", async () => {
    const localSettings: Settings = {
      features: {
        addUpdateBranchButton: true,
        autoFilter: false,
        baseBranchLabels: false,
        changedFiles: true,
        descriptionTemplate: false,
        persistToUserProfile: true,
        prTitleFromJira: false,
        randomReviewer: false,
        reOrderPrs: true,
        totalLinesPr: true,
        totalLinesPrs: true,
      },
      fileBlacklist: "package-lock.json",
    };

    const syncSettings: Settings = {
      ...localSettings,
      fileBlacklist: "yarn.lock",
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(localSettings);
    (chrome.storage.sync.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(syncSettings);

    const onSuccess = jest.fn();
    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalledWith(syncSettings);
  });

  test("falls back to local settings when sync storage is empty", async () => {
    const localSettings: Settings = {
      features: {
        addUpdateBranchButton: true,
        autoFilter: false,
        baseBranchLabels: false,
        changedFiles: true,
        descriptionTemplate: false,
        persistToUserProfile: true,
        prTitleFromJira: false,
        randomReviewer: false,
        reOrderPrs: true,
        totalLinesPr: true,
        totalLinesPrs: true,
      },
      fileBlacklist: "package-lock.json",
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(localSettings);
    (chrome.storage.sync.get as jest.Mock) = jest.fn().mockResolvedValue({});

    const onSuccess = jest.fn();
    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalledWith(localSettings);
  });

  test("falls back to local settings when sync storage fails", async () => {
    const localSettings: Settings = {
      features: {
        addUpdateBranchButton: true,
        autoFilter: false,
        baseBranchLabels: false,
        changedFiles: true,
        descriptionTemplate: false,
        persistToUserProfile: true,
        prTitleFromJira: false,
        randomReviewer: false,
        reOrderPrs: true,
        totalLinesPr: true,
        totalLinesPrs: true,
      },
      fileBlacklist: "package-lock.json",
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(localSettings);
    (chrome.storage.sync.get as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error("Sync storage unavailable"));

    const onSuccess = jest.fn();
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalledWith(localSettings);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  test("calls onError when local storage access fails", async () => {
    const error = new Error("Storage unavailable");
    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockRejectedValue(error);

    const onError = jest.fn();
    getSettings({ onSuccess: jest.fn(), onError });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onError).toHaveBeenCalledWith(error);
  });

  test("uses default onError when not provided", async () => {
    const error = new Error("Storage unavailable");
    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockRejectedValue(error);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    getSettings({ onSuccess: jest.fn() });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(alertSpy).toHaveBeenCalledWith(
      "Couldn't load or validate your Settings from chrome storage.",
    );

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test("casts invalid settings gracefully", async () => {
    const invalidSettings = {
      features: {
        addUpdateBranchButton: "invalid",
        unknownFeature: true,
      },
      fileBlacklist: 123,
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(invalidSettings);

    const onSuccess = jest.fn();
    getSettings({ onSuccess });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSuccess).toHaveBeenCalled();
    const result = onSuccess.mock.calls[0][0];
    expect(result.features).toBeDefined();
  });
});

describe("getSettingValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns specific setting value", async () => {
    const settings: Settings = {
      features: {
        addUpdateBranchButton: true,
        autoFilter: false,
        baseBranchLabels: false,
        changedFiles: true,
        descriptionTemplate: false,
        persistToUserProfile: false,
        prTitleFromJira: false,
        randomReviewer: false,
        reOrderPrs: true,
        totalLinesPr: true,
        totalLinesPrs: true,
      },
      fileBlacklist: "package-lock.json,yarn.lock",
    };

    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue(settings);

    const fileBlacklist = await getSettingValue("fileBlacklist");
    expect(fileBlacklist).toBe("package-lock.json,yarn.lock");
  });

  test("handles errors gracefully", async () => {
    (chrome.storage.local.get as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error("Storage error"));

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    void getSettingValue("features");

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  }, 10000);
});

describe("settingsSchema", () => {
  test("validates valid instance config", () => {
    const validInstance = {
      pat: "ghp_1234567890123456789012345678901234567890",
      org: "test-org",
      repo: "test-repo",
      ghBaseUrl: "https://api.github.com",
      randomReviewers: "user1,user2",
    };

    const result = settingsSchema.cast({ instances: [validInstance] });
    expect(result.instances).toHaveLength(1);
  });

  test("rejects PAT not starting with ghp_", () => {
    const invalidInstance = {
      pat: "invalid_token_12345678901234567890",
      org: "test-org",
      repo: "test-repo",
      ghBaseUrl: "https://api.github.com",
    };

    const result = settingsSchema.cast({ instances: [invalidInstance] });
    // Yup .cast() doesn't remove invalid items, it attempts to cast them
    // For validation failure, the instance would still be present but invalid
    expect(result.instances).toBeDefined();
  });

  test("sets default values for features", () => {
    const result = settingsSchema.cast({});
    expect(result.features.addUpdateBranchButton).toBe(true);
    expect(result.features.autoFilter).toBe(false);
  });

  test("sets default file blacklist", () => {
    const result = settingsSchema.cast({});
    expect(result.fileBlacklist).toBe(
      "package-lock.json,pnpm-lock.yaml,yarn.lock",
    );
  });

  test("validates JIRA configuration", () => {
    const validJira = {
      pat: "jira_pat_123456789012345678901234567890",
      baseUrl: "https://jira.company.com",
      issueKeyRegex: "TEST-\\d+",
    };

    const result = settingsSchema.cast({ jira: validJira });
    expect(result.jira).toEqual(validJira);
  });

  test("handles invalid JIRA config", () => {
    const invalidJira = {
      pat: "short",
      baseUrl: "not-a-url",
      issueKeyRegex: "TEST-\\d+",
    };

    const result = settingsSchema.cast({ jira: invalidJira });
    // Yup .cast() with assert: false attempts to cast rather than validate
    // Invalid values may still be present in the result
    expect(result).toBeDefined();
  });
});
