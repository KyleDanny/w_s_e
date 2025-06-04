import { afterEach } from "@jest/globals";

// Global test setup
process.env.NODE_ENV = "test";
process.env.AWS_REGION = "us-east-1";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence logs during testing
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
