module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'lark_mcp_server_example.js',
    'setup.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    '!jest.config.js',
    '!.eslintrc.js',
    '!.prettierrc.js',
    '!jest.setup.js',
    '!emergency_backup_*/**',
    '!android_*.js',
    '!chrome_*.js',
    '!gmail_*.js',
    '!ssh_*.js',
    '!surprise_*.js',
    '!youtube_*.js',
    '!gemini-*.js',
    '!test-setup.js',
    '!test_chrome.js',
    '!macos_*.py',
    '!organize_*.py'
  ],
  
  // Coverage thresholds (disabled for demo/example code)
  // coverageThreshold: {
  //   global: {
  //     branches: 20,
  //     functions: 20,
  //     lines: 20,
  //     statements: 20
  //   }
  // },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    'emergency_backup_*/'
  ]
}; 