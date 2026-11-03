import React from "react";
import { createRoot } from "react-dom/client";
import { injectPrFilesSearch } from "../injectPrFilesSearch";
import { Files } from "../types";

jest.mock("react-dom/client");
jest.mock("../PrFilesSearch", () => ({
  PrFilesSearch: () => <div data-testid="PrFilesSearch" />,
}));

describe("injectPrFilesSearch", () => {
  let mockRoot: {
    render: jest.Mock;
    unmount: jest.Mock;
  };

  const mockPrs = [
    {
      number: 1,
      title: "PR 1",
      html_url: "https://github.com/org/repo/pull/1",
      labels: [],
    },
  ] as any;

  const mockPrFilesMap = new Map<number, Files>();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    mockRoot = {
      render: jest.fn(),
      unmount: jest.fn(),
    };
    (createRoot as jest.Mock).mockReturnValue(mockRoot);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("New GitHub UI", () => {
    test("creates heading controls div and injects search bar as first child", () => {
      document.body.innerHTML = `
        <div class="d-flex gap-2 flex-items-center">
          <h1 class="h3 hide-sm">All pull requests</h1>
          <div class="spacer"></div>
          <div><button>New pull request</button></div>
        </div>
      `;

      injectPrFilesSearch(mockPrs, mockPrFilesMap);

      const controls = document.querySelector(
        ".gh-ui-booster-heading-controls",
      ) as HTMLElement;
      const injectedEl = document.querySelector(
        ".gh-ui-booster-pr-files-search",
      ) as HTMLElement;

      expect(controls).toBeInTheDocument();
      expect(injectedEl).toBeInTheDocument();
      expect(controls.firstElementChild).toBe(injectedEl);
      expect(injectedEl.style.width).toBe("320px");

      expect(createRoot).toHaveBeenCalledWith(injectedEl);
      expect(mockRoot.render).toHaveBeenCalledTimes(1);
    });

    test("reuses existing heading controls div when heading is nested", () => {
      document.body.innerHTML = `
        <div class="d-flex flex-items-top gap-2">
          <div class="hide-lg"></div>
          <h1 class="h3">All pull requests</h1>
        </div>
      `;

      injectPrFilesSearch(mockPrs, mockPrFilesMap);

      const controls = document.querySelector(
        ".gh-ui-booster-heading-controls",
      ) as HTMLElement;
      const injectedEl = document.querySelector(
        ".gh-ui-booster-pr-files-search",
      ) as HTMLElement;

      expect(controls).toBeInTheDocument();
      expect(injectedEl).toBeInTheDocument();
      expect(controls.firstElementChild).toBe(injectedEl);
    });
  });

  describe("Fallback UI", () => {
    test("injects before list-view-container if heading row is not present", () => {
      document.body.innerHTML = `
        <div class="repo-main">
          <div id="repo-list-view-container"></div>
        </div>
      `;

      injectPrFilesSearch(mockPrs, mockPrFilesMap);

      const injectedEl = document.querySelector(
        ".gh-ui-booster-pr-files-search",
      );
      expect(injectedEl).toBeInTheDocument();
      const listContainer = document.getElementById(
        "repo-list-view-container",
      )!;
      expect(injectedEl?.nextElementSibling).toBe(listContainer);
    });

    test("injects into old repository-content structure if list-view-container is absent", () => {
      document.body.innerHTML = `
        <div class="repository-content">
          <div>
            <div></div>
            <div></div>
            <div>
              <div class="filter-box"></div>
              <div class="actions"></div>
            </div>
          </div>
        </div>
      `;

      injectPrFilesSearch(mockPrs, mockPrFilesMap);

      const injectedEl = document.querySelector(
        ".gh-ui-booster-pr-files-search",
      );
      expect(injectedEl).toBeInTheDocument();
    });
  });

  describe("Idempotency", () => {
    test("does not inject twice if already present", () => {
      document.body.innerHTML = `
        <div class="d-flex gap-2 flex-items-center">
          <h1 class="h3 hide-sm">All pull requests</h1>
        </div>
      `;

      injectPrFilesSearch(mockPrs, mockPrFilesMap);
      expect(
        document.querySelectorAll(".gh-ui-booster-pr-files-search").length,
      ).toBe(1);

      injectPrFilesSearch(mockPrs, mockPrFilesMap);
      expect(
        document.querySelectorAll(".gh-ui-booster-pr-files-search").length,
      ).toBe(1);
      expect(createRoot).toHaveBeenCalledTimes(1);
    });
  });
});
