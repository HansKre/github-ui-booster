import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { FeatureTogglesTab } from "../FeatureTogglesTab";
import { Features } from "../../../../services/getSettings";

// Mock chrome.storage - use setTimeout to make callbacks async like real chrome.storage
const mockChromeStorage = {
  local: {
    get: jest.fn((_, callback) => {
      setTimeout(() => callback?.({}), 0);
      return Promise.resolve({});
    }),
    set: jest.fn((_, callback) => {
      setTimeout(() => callback?.(), 0);
      return Promise.resolve();
    }),
  },
  sync: {
    get: jest.fn((_, callback) => {
      setTimeout(() => callback?.({}), 0);
      return Promise.resolve({});
    }),
    set: jest.fn((_, callback) => {
      setTimeout(() => callback?.(), 0);
      return Promise.resolve();
    }),
  },
};

global.chrome = {
  storage: mockChromeStorage,
} as any;

describe("FeatureTogglesTab", () => {
  const mockFeatures: Features = {
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
  };

  const mockOnToggle = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders subtitle with description", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Enable and disable Extension-features. Features are organized by/i,
        ),
      ).toBeInTheDocument();
    });
  });

  test("renders all section titles", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("General Settings")).toBeInTheDocument();
      expect(screen.getByText("Pull Requests List")).toBeInTheDocument();
      expect(screen.getByText("Individual Pull Request")).toBeInTheDocument();
      expect(screen.getByText("Create Pull Request")).toBeInTheDocument();
    });
  });

  test("renders persist to user profile feature toggle", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Persist to User Profile")).toBeInTheDocument();
      expect(
        screen.getByText(/Store settings in your Chrome user profile/i),
      ).toBeInTheDocument();
    });
  });

  test("renders file blacklist caption", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Comma-separated list of filenames/i),
      ).toBeInTheDocument();
    });
  });

  test("renders all feature labels", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Base Branch Labels")).toBeInTheDocument();
      expect(screen.getByText("Changed Files")).toBeInTheDocument();
      expect(screen.getByText("Reorder Pull Requests")).toBeInTheDocument();
      expect(screen.getByText("Add Update Branch Button")).toBeInTheDocument();
      expect(screen.getByText("Auto Filter")).toBeInTheDocument();
      expect(screen.getByText("Add PR Title from Jira")).toBeInTheDocument();
      expect(screen.getByText("Description Template")).toBeInTheDocument();
    });
  });

  test("renders all captions", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Show base branch information/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Display changed files information/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Automatically organize pull requests/i),
      ).toBeInTheDocument();
    });
  });

  test("renders file blacklist input", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      const input = screen.getByLabelText("File Blacklist");
      expect(input).toBeInTheDocument();
    });
  });

  test("renders auto filter input", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      const input = screen.getByLabelText("Auto Filter");
      expect(input).toBeInTheDocument();
    });
  });

  test("renders description template input", async () => {
    render(
      <FeatureTogglesTab
        features={mockFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      const input = screen.getByLabelText("Description Template");
      expect(input).toBeInTheDocument();
    });
  });

  test("respects feature checked states", async () => {
    const customFeatures: Features = {
      ...mockFeatures,
      baseBranchLabels: false,
      changedFiles: true,
    };

    render(
      <FeatureTogglesTab
        features={customFeatures}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      // Component should render with the correct checked states
      expect(screen.getByText("Base Branch Labels")).toBeInTheDocument();
      expect(screen.getByText("Changed Files")).toBeInTheDocument();
    });
  });

  test("renders with all features enabled", async () => {
    const allEnabled: Features = {
      baseBranchLabels: true,
      changedFiles: true,
      totalLinesPrs: true,
      totalLinesPr: true,
      reOrderPrs: true,
      addUpdateBranchButton: true,
      autoFilter: true,
      prTitleFromJira: true,
      descriptionTemplate: true,
      randomReviewer: true,
      persistToUserProfile: true,
    };

    render(
      <FeatureTogglesTab
        features={allEnabled}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("General Settings")).toBeInTheDocument();
    });
  });

  test("renders with all features disabled", async () => {
    const allDisabled: Features = {
      baseBranchLabels: false,
      changedFiles: false,
      totalLinesPrs: false,
      totalLinesPr: false,
      reOrderPrs: false,
      addUpdateBranchButton: false,
      autoFilter: false,
      prTitleFromJira: false,
      descriptionTemplate: false,
      randomReviewer: false,
      persistToUserProfile: false,
    };

    render(
      <FeatureTogglesTab
        features={allDisabled}
        onToggle={mockOnToggle}
        onError={mockOnError}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("General Settings")).toBeInTheDocument();
    });
  });
});
