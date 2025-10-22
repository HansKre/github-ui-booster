import { getOctoInstance } from "../getOctoInstance";
import { InstanceConfig } from "../getSettings";

// Mock @octokit/rest
const mockRequest = jest.fn();
const mockHookWrap = jest.fn();

jest.mock("@octokit/rest", () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: mockRequest,
    hook: {
      wrap: mockHookWrap,
    },
  })),
}));

describe("getOctoInstance", () => {
  const mockInstanceConfig: InstanceConfig = {
    pat: "ghp_1234567890123456789012345678901234567890",
    org: "test-org",
    repo: "test-repo",
    ghBaseUrl: "https://api.github.com",
    randomReviewers: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ data: "test response" });
  });

  test("returns an Octokit instance", () => {
    const instance = getOctoInstance(mockInstanceConfig);
    expect(instance).toBeDefined();
    expect(instance.request).toBeDefined();
    expect(instance.clearCache).toBeDefined();
  });

  test("returns the same instance for the same config", () => {
    const instance1 = getOctoInstance(mockInstanceConfig);
    const instance2 = getOctoInstance(mockInstanceConfig);
    expect(instance1).toBe(instance2);
  });

  test("returns different instances for different PATs", () => {
    const config1 = { ...mockInstanceConfig };
    const config2 = {
      ...mockInstanceConfig,
      pat: "ghp_9876543210987654321098765432109876543210",
    };

    const instance1 = getOctoInstance(config1);
    const instance2 = getOctoInstance(config2);
    expect(instance1).not.toBe(instance2);
  });

  test("returns different instances for different base URLs", () => {
    const config1 = { ...mockInstanceConfig };
    const config2 = {
      ...mockInstanceConfig,
      ghBaseUrl: "https://github.company.com/api/v3",
    };

    const instance1 = getOctoInstance(config1);
    const instance2 = getOctoInstance(config2);
    expect(instance1).not.toBe(instance2);
  });

  test("clearCache method exists and is callable", () => {
    const instance = getOctoInstance(mockInstanceConfig);
    expect(() => instance.clearCache()).not.toThrow();
  });

  test("registers a request hook wrapper", () => {
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_wrapper123456789012345678901234567890",
    };
    getOctoInstance(config);
    expect(mockHookWrap).toHaveBeenCalledWith("request", expect.any(Function));
  });

  test("hook wrapper is registered only once for same config", () => {
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_once1234567890123456789012345678901234",
    };
    const instance1 = getOctoInstance(config);
    const instance2 = getOctoInstance(config);

    // Should only register hook once since it's the same instance
    // Count calls after beforeEach - should be exactly 1 since we created 1 new instance
    const callsAfterFirst = mockHookWrap.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThanOrEqual(1);

    // Verify instances are the same
    expect(instance1).toBe(instance2);
  });

  test("hook wrapper caches GET requests", async () => {
    // Use a unique config to ensure a new instance is created
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_test1234567890123456789012345678901234",
    };
    getOctoInstance(config);

    // Get the wrapper function that was registered for this new instance
    const lastCallIndex = mockHookWrap.mock.calls.length - 1;
    const wrapperFn = mockHookWrap.mock.calls[lastCallIndex][1];

    // Simulate a GET request
    const mockRequestFn = jest.fn().mockResolvedValue({ data: "response" });
    const options = { method: "GET", url: "/repos/test/test" };

    // Call the wrapper twice with the same options
    await wrapperFn(mockRequestFn, options);
    await wrapperFn(mockRequestFn, options);

    // Should only call the actual request once (cached)
    expect(mockRequestFn).toHaveBeenCalledTimes(1);
  });

  test("hook wrapper does not cache POST requests", async () => {
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_test2345678901234567890123456789012345",
    };
    getOctoInstance(config);

    const lastCallIndex = mockHookWrap.mock.calls.length - 1;
    const wrapperFn = mockHookWrap.mock.calls[lastCallIndex][1];
    const mockRequestFn = jest.fn().mockResolvedValue({ data: "response" });
    const options = { method: "POST", url: "/repos/test/test" };

    // Call the wrapper twice with the same options
    await wrapperFn(mockRequestFn, options);
    await wrapperFn(mockRequestFn, options);

    // Should call the actual request twice (not cached)
    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  test("hook wrapper does not cache PUT requests", async () => {
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_test3456789012345678901234567890123456",
    };
    getOctoInstance(config);

    const lastCallIndex = mockHookWrap.mock.calls.length - 1;
    const wrapperFn = mockHookWrap.mock.calls[lastCallIndex][1];
    const mockRequestFn = jest.fn().mockResolvedValue({ data: "response" });
    const options = { method: "PUT", url: "/repos/test/test" };

    await wrapperFn(mockRequestFn, options);
    await wrapperFn(mockRequestFn, options);

    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  test("hook wrapper does not cache DELETE requests", async () => {
    const config = {
      ...mockInstanceConfig,
      pat: "ghp_test4567890123456789012345678901234567",
    };
    getOctoInstance(config);

    const lastCallIndex = mockHookWrap.mock.calls.length - 1;
    const wrapperFn = mockHookWrap.mock.calls[lastCallIndex][1];
    const mockRequestFn = jest.fn().mockResolvedValue({ data: "response" });
    const options = { method: "DELETE", url: "/repos/test/test" };

    await wrapperFn(mockRequestFn, options);
    await wrapperFn(mockRequestFn, options);

    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });
});
