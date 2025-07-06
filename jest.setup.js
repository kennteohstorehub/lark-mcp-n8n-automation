// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging noise in tests
process.env.MCP_AUTH_ENABLED = 'false'; // Disable auth for testing
process.env.RATE_LIMIT_ENABLED = 'false'; // Disable rate limiting for tests

// Global test timeout
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};

// Global test utilities
global.testUtils = {
  // Helper function to create mock requests
  createMockRequest: (options = {}) => ({
    body: {},
    headers: {},
    query: {},
    params: {},
    ...options
  }),
  
  // Helper function to create mock responses
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.header = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Helper function to wait for async operations
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Suppress specific warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  
  // Suppress known warnings that are safe to ignore in tests
  if (
    typeof message === 'string' &&
    (message.includes('ExperimentalWarning') ||
     message.includes('DeprecationWarning'))
  ) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
}; 