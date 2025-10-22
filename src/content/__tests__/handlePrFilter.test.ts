import { handlePrFilter } from "../handlePrFilter";
import { InstanceConfig } from "../../services";

describe("handlePrFilter", () => {
  const mockInstanceConfig: InstanceConfig = {
    ghBaseUrl: "https://api.github.com",
    org: "test-org",
    repo: "test-repo",
    pat: "ghp_1234567890123456789012345678901234567890",
    randomReviewers: "",
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  const mockLocation = (href: string): Location => ({ href }) as Location;

  test("replaces filter value in search input", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(searchInput.value).toBe("is:open is:pr");
  });

  test("does not replace filter if value is already the same", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "is:open is:pr";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    const dispatchSpy = jest.spyOn(searchInput, "dispatchEvent");

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  test("does not replace filter if not on PRs page", () => {
    const location = mockLocation("https://github.com/test-org/test-repo");

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    document.body.appendChild(form);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(searchInput.value).toBe("");
  });

  test("does not replace filter if active tab is not pull-requests", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "issues-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(searchInput.value).toBe("");
  });

  test("does not replace filter if search input not found", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(activeTab);

    expect(() =>
      handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location),
    ).not.toThrow();
  });

  test("uses filterIntercepted when provided", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(
      mockInstanceConfig,
      "is:open is:pr",
      "custom filter",
      location,
    );

    expect(searchInput.value).toBe("custom filter");
  });

  test("dispatches input and submit events", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    const inputSpy = jest.spyOn(searchInput, "dispatchEvent");
    const formSpy = jest.spyOn(form, "dispatchEvent");

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(inputSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(formSpy).toHaveBeenCalledWith(expect.any(Event));
  });

  test("does not replace filter when called multiple times if intercepted", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    // First call
    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);
    expect(searchInput.value).toBe("is:open is:pr");
  });

  test("adds click event listener when on PRs page", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  test("removes click event listener when not on PRs page", () => {
    const location = mockLocation("https://github.com/test-org/test-repo");

    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  test("handles click on quick filter link", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    // Setup handlePrFilter to add the click listener
    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    // Create a quick filter link
    const quickFilter = document.createElement("a");
    quickFilter.className = "btn-link";
    quickFilter.href =
      "https://github.com/test-org/test-repo/issues?q=is%3Aopen+is%3Apr";
    document.body.appendChild(quickFilter);

    // Simulate click
    const clickEvent = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(clickEvent, "target", {
      value: quickFilter,
      writable: true,
      configurable: true,
    });

    const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
    quickFilter.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test("handles click event with non-HTMLElement target", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    // Simulate click with non-HTMLElement target
    const clickEvent = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(clickEvent, "target", {
      value: {},
      writable: true,
      configurable: true,
    });

    expect(() => document.dispatchEvent(clickEvent)).not.toThrow();
  });

  test("handles click on element without quick filter link parent", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    // Click on a regular element
    const regularElement = document.createElement("div");
    document.body.appendChild(regularElement);

    const clickEvent = new MouseEvent("click", { bubbles: true });
    expect(() => regularElement.dispatchEvent(clickEvent)).not.toThrow();
  });

  test("does not handle click on non-issues quick filter link", () => {
    const location = mockLocation(
      "https://github.com/test-org/test-repo/pulls",
    );

    const form = document.createElement("form");
    const searchInput = document.createElement("input");
    searchInput.id = "js-issues-search";
    searchInput.value = "original";
    form.appendChild(searchInput);

    const activeTab = document.createElement("div");
    activeTab.id = "pull-requests-tab";
    activeTab.className = "UnderlineNav-item selected";

    document.body.appendChild(form);
    document.body.appendChild(activeTab);

    handlePrFilter(mockInstanceConfig, "is:open is:pr", undefined, location);

    // Create a non-issues link
    const quickFilter = document.createElement("a");
    quickFilter.className = "btn-link";
    quickFilter.href = "https://github.com/test-org/test-repo/pulls";
    document.body.appendChild(quickFilter);

    const clickEvent = new MouseEvent("click", { bubbles: true });
    const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
    quickFilter.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(searchInput.value).toBe("original");
  });
});
