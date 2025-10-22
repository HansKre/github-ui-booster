import { persistSettings } from "../persistSettings";
import { Settings } from "../getSettings";

describe("persistSettings", () => {
  const mockSettings: Settings = {
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
    fileBlacklist: "package-lock.json",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (chrome.storage.local.set as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (chrome.storage.sync.set as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (chrome.storage.sync.clear as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
  });

  test("saves to local storage when persistToUserProfile is false", async () => {
    const onSuccess = jest.fn();
    const onSettled = jest.fn();

    persistSettings({
      values: mockSettings,
      onSuccess,
      onSettled,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(chrome.storage.sync.clear).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalled();
  });

  test("saves to sync storage when persistToUserProfile is true", async () => {
    const syncSettings: Settings = {
      ...mockSettings,
      features: {
        ...mockSettings.features,
        persistToUserProfile: true,
      },
    };

    const onSuccess = jest.fn();
    const onSettled = jest.fn();

    persistSettings({
      values: syncSettings,
      onSuccess,
      onSettled,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(chrome.storage.sync.set).toHaveBeenCalled();
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalled();
  });

  test("keeps local backup when using sync storage", async () => {
    const syncSettings: Settings = {
      ...mockSettings,
      features: {
        ...mockSettings.features,
        persistToUserProfile: true,
      },
    };

    persistSettings({
      values: syncSettings,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(chrome.storage.local.set).toHaveBeenCalled();
  });

  test("clears sync storage when switching to local", async () => {
    persistSettings({
      values: mockSettings,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(chrome.storage.sync.clear).toHaveBeenCalled();
  });

  test("calls onError when storage fails", async () => {
    const error = new Error("Storage error");
    (chrome.storage.local.set as jest.Mock) = jest
      .fn()
      .mockRejectedValue(error);

    const onError = jest.fn();
    const onSettled = jest.fn();

    persistSettings({
      values: mockSettings,
      onError,
      onSettled,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onError).toHaveBeenCalledWith("Couldn't save");
    expect(onSettled).toHaveBeenCalled();
  });

  test("calls onSettled even when onSuccess/onError not provided", async () => {
    const onSettled = jest.fn();

    persistSettings({
      values: mockSettings,
      onSettled,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSettled).toHaveBeenCalled();
  });

  test("persists all settings entries", async () => {
    const settingsWithInstances: Settings = {
      ...mockSettings,
      instances: [
        {
          pat: "ghp_1234567890123456789012345678901234567890",
          org: "test-org",
          repo: "test-repo",
          ghBaseUrl: "https://api.github.com",
          randomReviewers: "",
        },
      ],
      autoFilter: "is:open",
      descriptionTemplate: "## Description\n\nChanges made...",
    };

    persistSettings({
      values: settingsWithInstances,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const localSetCalls = (chrome.storage.local.set as jest.Mock).mock.calls;
    expect(localSetCalls.length).toBeGreaterThan(0);
  });
});
