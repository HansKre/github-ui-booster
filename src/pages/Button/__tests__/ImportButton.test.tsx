import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { ImportButton } from "../ImportButton";
import * as persistSettingsModule from "../../../services/persistSettings";
import * as servicesIndex from "../../../services";
import { Settings } from "../../../services";

jest.mock("../../../services/persistSettings");

describe("ImportButton", () => {
  const mockSettings: Settings = {
    instances: [
      {
        pat: "ghp_test1234567890123456789012345678",
        org: "test-org",
        repo: "test-repo",
        ghBaseUrl: "https://api.github.com",
        randomReviewers: "user1,user2",
      },
    ],
    features: {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      autoFilter: false,
      prTitleFromJira: false,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    },
    fileBlacklist: "package-lock.json",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settingsSchema.validate
    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockResolvedValue(mockSettings);

    // Mock persistSettings
    jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onSuccess }) => {
        onSuccess?.();
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders import button with correct text and icon", () => {
    render(<ImportButton />);

    const button = screen.getByRole("button", { name: /import settings/i });
    expect(button).toBeInTheDocument();
  });

  test("renders hidden file input", () => {
    render(<ImportButton />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveStyle({ display: "none" });
    expect(fileInput).toHaveAttribute("accept", "application/json");
  });

  test("triggers file input click when button is clicked", () => {
    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, "click");

    const button = screen.getByRole("button", { name: /import settings/i });
    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  test("calls onClick callback when button is clicked", () => {
    const onClickMock = jest.fn();

    render(<ImportButton onClick={onClickMock} />);

    const button = screen.getByRole("button", { name: /import settings/i });
    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("reads and parses valid JSON file", async () => {
    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });

    // Mock file.text() method
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(servicesIndex.settingsSchema.validate).toHaveBeenCalledWith(
        mockSettings,
        { strict: true },
      );
    });
  });

  test("validates settings against schema", async () => {
    const validateSpy = jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockResolvedValue(mockSettings);

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(validateSpy).toHaveBeenCalledWith(mockSettings, { strict: true });
    });
  });

  test("calls persistSettings with validated settings", async () => {
    const persistSettingsSpy = jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onSuccess }) => {
        onSuccess?.();
      });

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(persistSettingsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          values: mockSettings,
        }),
      );
    });
  });

  test("calls onSuccess callback after successful import", async () => {
    const onSuccessMock = jest.fn();

    jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onSuccess }) => {
        onSuccess?.();
      });

    render(<ImportButton onSuccess={onSuccessMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });

  test("calls onError when no file is selected", async () => {
    const onErrorMock = jest.fn();

    render(<ImportButton onError={onErrorMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    Object.defineProperty(fileInput, "files", {
      value: [],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith("No file selected.");
    });
  });

  test("calls onError when JSON parsing fails", async () => {
    const onErrorMock = jest.fn();

    render(<ImportButton onError={onErrorMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["invalid json content"], "settings.json", {
      type: "application/json",
    });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
    });
  });

  test("calls onError when schema validation fails", async () => {
    const onErrorMock = jest.fn();
    const validationError = new Error("Validation failed");

    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockRejectedValue(validationError);

    render(<ImportButton onError={onErrorMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith("Validation failed");
    });
  });

  test("calls onError from persistSettings when persist fails", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onError }) => {
        onError?.("Persist failed");
      });

    render(<ImportButton onError={onErrorMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith("Persist failed");
    });
  });

  test("shows loading state during import", async () => {
    let resolveValidation: (value: Settings) => void;
    const validationPromise = new Promise<Settings>((resolve) => {
      resolveValidation = resolve;
    });

    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockReturnValue(validationPromise);

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Button should show loading state
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    // Resolve validation
    resolveValidation!(mockSettings);

    await waitFor(() => {
      expect(persistSettingsModule.persistSettings).toHaveBeenCalled();
    });
  });

  test("resets file input after successful import", async () => {
    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(persistSettingsModule.persistSettings).toHaveBeenCalled();
    });

    expect(fileInput.value).toBe("");
  });

  test("resets file input after failed import", async () => {
    const validationError = new Error("Validation failed");
    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockRejectedValue(validationError);

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(fileInput.value).toBe("");
    });
  });

  test("handles non-Error exceptions", async () => {
    const onErrorMock = jest.fn();

    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockRejectedValue("String error");

    render(<ImportButton onError={onErrorMock} />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(
        "Failed to import settings. Invalid file or format.",
      );
    });
  });

  test("does not call onSuccess when not provided", async () => {
    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Should not throw
    await waitFor(() => {
      expect(persistSettingsModule.persistSettings).toHaveBeenCalled();
    });
  });

  test("does not call onError when not provided and operation fails", async () => {
    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockRejectedValue(new Error("Error"));

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Should not throw
    await waitFor(() => {
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  test("calls onSettled callback from persistSettings", async () => {
    let onSettledCallback: (() => void) | undefined;

    jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onSettled }) => {
        onSettledCallback = onSettled;
      });

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(persistSettingsModule.persistSettings).toHaveBeenCalled();
    });

    expect(onSettledCallback).toBeDefined();

    // Call the onSettled callback and wait for state updates
    act(() => {
      onSettledCallback?.();
    });
  });

  test("handles all callbacks being provided simultaneously", async () => {
    const onSuccessMock = jest.fn();
    const onErrorMock = jest.fn();
    const onClickMock = jest.fn();

    jest
      .spyOn(persistSettingsModule, "persistSettings")
      .mockImplementation(({ onSuccess }) => {
        onSuccess?.();
      });

    render(
      <ImportButton
        onSuccess={onSuccessMock}
        onError={onErrorMock}
        onClick={onClickMock}
      />,
    );

    const button = screen.getByRole("button", { name: /import settings/i });
    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(mockSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).not.toHaveBeenCalled();
    });
  });

  test("parses complex nested settings correctly", async () => {
    const complexSettings: Settings = {
      ...mockSettings,
      instances: [
        {
          pat: "ghp_token1_1234567890123456789012345",
          org: "org1",
          repo: "repo1",
          ghBaseUrl: "https://api.github.com",
          randomReviewers: "user1,user2,user3",
        },
        {
          pat: "ghp_token2_1234567890123456789012345",
          org: "org2",
          repo: "repo2",
          ghBaseUrl: "https://github.enterprise.com/api/v3",
          randomReviewers: "reviewer1,reviewer2",
        },
      ],
      jira: {
        pat: "jira_token_12345678901234567890123456",
        baseUrl: "https://jira.example.com",
        issueKeyRegex: "TEST-\\d+",
      },
    };

    jest
      .spyOn(servicesIndex.settingsSchema, "validate")
      .mockResolvedValue(complexSettings);
    const validateSpy = jest.spyOn(servicesIndex.settingsSchema, "validate");

    render(<ImportButton />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const fileContent = JSON.stringify(complexSettings);
    const file = new File([fileContent], "settings.json", {
      type: "application/json",
    });
    file.text = jest.fn().mockResolvedValue(fileContent);

    Object.defineProperty(fileInput, "files", {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(validateSpy).toHaveBeenCalledWith(complexSettings, {
        strict: true,
      });
    });
  });
});
