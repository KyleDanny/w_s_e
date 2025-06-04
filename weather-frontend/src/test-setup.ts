import "@testing-library/jest-dom";

// Mock ResizeObserver for recharts
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
