import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
} as any;

// Note: window.location mocking is handled in individual test files
// because jsdom doesn't allow redefining location at the global level

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock CSS.supports for Primer React components
if (typeof CSS === "undefined") {
  (global as any).CSS = {
    supports: jest.fn().mockReturnValue(false),
  };
} else {
  CSS.supports = jest.fn().mockReturnValue(false);
}

// Mock Primer React Tooltip to avoid interactive content validation
jest.mock("@primer/react/next", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const actual = jest.requireActual("@primer/react/next");
  return {
    ...actual,
    Tooltip: ({ children, text }: any) =>
      React.createElement("div", { "data-tooltip": text }, children),
  };
});

// Define custom element for clipboard-copy (GitHub's custom element)
if (!customElements.get("clipboard-copy")) {
  class ClipboardCopy extends HTMLElement {
    connectedCallback() {
      // Preserve all attributes including className
    }
  }
  customElements.define("clipboard-copy", ClipboardCopy);
}

// Mock ResizeObserver for Primer React components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
