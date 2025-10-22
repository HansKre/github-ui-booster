import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Options } from "../Options";
import * as getSettingsModule from "../../services/getSettings";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
} as any;

// Mock chrome.storage
const mockChromeStorage = {
  local: {
    get: jest.fn((_, callback) => {
      callback?.({});
      return Promise.resolve({});
    }),
    set: jest.fn((_, callback) => {
      callback?.();
      return Promise.resolve();
    }),
  },
  sync: {
    get: jest.fn((_, callback) => {
      callback?.({});
      return Promise.resolve({});
    }),
  },
};

global.chrome = {
  storage: mockChromeStorage,
  runtime: {
    lastError: undefined,
  },
} as any;

describe("Options", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getSettings
    jest
      .spyOn(getSettingsModule, "getSettings")
      .mockImplementation(({ onSuccess }) => {
        void onSuccess?.(getSettingsModule.INITIAL_VALUES);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders options page", async () => {
    render(<Options />);

    // Just verify it renders without crashing
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  test("loads settings on mount", async () => {
    const getSettingsSpy = jest.spyOn(getSettingsModule, "getSettings");

    render(<Options />);

    await waitFor(() => {
      expect(getSettingsSpy).toHaveBeenCalled();
    });
  });

  test("renders tab navigation", async () => {
    render(<Options />);

    // Check for Feature Toggles tab text
    await waitFor(() => {
      expect(screen.getByText("Feature Toggles")).toBeInTheDocument();
    });
  });

  test("renders page content", async () => {
    const { container } = render(<Options />);

    // Verify the page renders
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
