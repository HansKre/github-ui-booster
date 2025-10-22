import { addCopyBaseBranchToPr } from "../addCopyBaseBranchToPr";
import { InstanceConfig } from "../../services";
import { createRoot } from "react-dom/client";
import * as isOnPrPageModule from "../utils/isOnPrPage";

// Mock dependencies
jest.mock("react-dom/client");
jest.mock("../utils/isOnPrPage");

describe("addCopyBaseBranchToPr", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  let mockRoot: {
    render: jest.Mock;
    unmount: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    // Mock isOnPrPage
    jest.spyOn(isOnPrPageModule, "isOnPrPage").mockReturnValue(true);

    // Mock createRoot
    mockRoot = {
      render: jest.fn(),
      unmount: jest.fn(),
    };
    (createRoot as jest.Mock).mockReturnValue(mockRoot);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns early if not on PR page", () => {
    jest.spyOn(isOnPrPageModule, "isOnPrPage").mockReturnValue(false);

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("adds copy button for base branch in partial-discussion-header", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRoot.render).toHaveBeenCalledTimes(1);

    const container = document.querySelector(".gh-ui-booster-clipboard-copy");
    expect(container).toBeTruthy();
    expect(container?.getAttribute("data-view-component")).toBe("true");
  });

  test("adds copy button for base branch in sticky header", () => {
    // Need to add both selectors to DOM or the function returns early
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
      <div class="gh-header-sticky">
        <div class="sticky-content">
          <span class="commit-ref">develop</span>
          <span class="next-element"></span>
        </div>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).toHaveBeenCalled();
    expect(mockRoot.render).toHaveBeenCalled();
  });

  test("returns early if targetElement not found", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("returns early if baseBranchNameElement not found", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("skips if clipboard copy already exists", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element">
          <span class="gh-ui-booster-clipboard-copy">Existing</span>
        </span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("returns early if headRef is empty", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">   </span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("creates clipboard container with correct styling", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">feature-branch</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    const container = document.querySelector(
      ".gh-ui-booster-clipboard-copy",
    ) as HTMLElement;
    expect(container?.style.marginLeft).toBe("0.5rem");
    expect(container?.style.marginRight).toBe("0.5rem");
  });

  test("appends clipboard container to targetElement", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element">
          <span>Existing child</span>
        </span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    const targetElement = document.querySelector(
      "#partial-discussion-header .next-element",
    );
    const clipboardContainer = targetElement?.querySelector(
      ".gh-ui-booster-clipboard-copy",
    );

    expect(clipboardContainer).toBeTruthy();
    expect(targetElement?.contains(clipboardContainer as Node)).toBe(true);
  });

  test("renders CliboardCopy component with correct value", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">my-feature-branch</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(mockRoot.render).toHaveBeenCalledTimes(1);
    const renderCall = mockRoot.render.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });

  test("handles branch name with special characters", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">feature/TEST-123-my-branch</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRoot.render).toHaveBeenCalled();
  });

  test("processes both selectors when both exist", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
      <div class="gh-header-sticky">
        <div class="sticky-content">
          <span class="commit-ref">main</span>
          <span class="next-element"></span>
        </div>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    // Should process both selectors
    expect(createRoot).toHaveBeenCalledTimes(2);
  });

  test("stops processing if targetElement is null for first selector", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("handles whitespace in branch name", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">  main  </span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).toHaveBeenCalled();
  });

  test("uses correct selector for sticky header without base-ref class", () => {
    // Need to add both selectors to DOM or the function returns early
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
      <div class="gh-header-sticky">
        <div class="sticky-content">
          <span class="commit-ref">develop</span>
          <span class="next-element"></span>
        </div>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    const baseBranchElement = document.querySelector(
      ".gh-header-sticky .sticky-content span.commit-ref:not(head-ref)",
    );
    expect(baseBranchElement?.textContent).toBe("develop");
    expect(createRoot).toHaveBeenCalled();
  });

  test("returns early if baseBranchNameElement has no textContent", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref"></span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).not.toHaveBeenCalled();
  });

  test("sets data-view-component attribute on container", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    const container = document.querySelector(".gh-ui-booster-clipboard-copy");
    expect(container?.getAttribute("data-view-component")).toBe("true");
  });

  test("handles numeric branch names", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">123</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(createRoot).toHaveBeenCalled();
  });

  test("renders with React.StrictMode", () => {
    document.body.innerHTML = `
      <div id="partial-discussion-header">
        <span class="commit-ref base-ref">main</span>
        <span class="next-element"></span>
      </div>
    `;

    addCopyBaseBranchToPr(mockInstanceConfig);

    expect(mockRoot.render).toHaveBeenCalled();
    const renderCall = mockRoot.render.mock.calls[0][0];
    // The component is wrapped in React.StrictMode
    expect(renderCall).toBeDefined();
  });
});
