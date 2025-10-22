import React from "react";
import { render, screen } from "@testing-library/react";
import { ImportExportTab } from "../ImportExportTab";

// Mock chrome.storage
global.chrome = {
  storage: {
    local: {
      get: jest.fn((_, callback) => {
        callback?.({});
        return Promise.resolve({});
      }),
    },
  },
} as any;

describe("ImportExportTab", () => {
  const mockProps = {
    onError: jest.fn(),
    onSuccess: jest.fn(),
    onReset: jest.fn(),
    onLoadSettings: jest.fn(),
  };

  test("renders subtitle with warning about access tokens", () => {
    render(<ImportExportTab {...mockProps} />);

    expect(
      screen.getByText(/You can export your current settings as a JSON file/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your settings contain access tokens/i),
    ).toBeInTheDocument();
  });

  test("renders export button", () => {
    render(<ImportExportTab {...mockProps} />);

    expect(
      screen.getByRole("button", { name: /export settings/i }),
    ).toBeInTheDocument();
  });

  test("renders import button", () => {
    render(<ImportExportTab {...mockProps} />);

    expect(
      screen.getByRole("button", { name: /import settings/i }),
    ).toBeInTheDocument();
  });

  test("renders both buttons in a grid layout", () => {
    render(<ImportExportTab {...mockProps} />);

    const exportButton = screen.getByRole("button", {
      name: /export settings/i,
    });
    const importButton = screen.getByRole("button", {
      name: /import settings/i,
    });

    expect(exportButton).toBeInTheDocument();
    expect(importButton).toBeInTheDocument();
  });
});
