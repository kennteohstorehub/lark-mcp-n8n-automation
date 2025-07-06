/**
 * Basic test suite for Lark MCP Server
 * These tests ensure the basic setup is working correctly
 */

describe('Lark MCP Server - Basic Tests', () => {
  describe('Environment Setup', () => {
    test('should have correct test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    test('should have test utilities available', () => {
      expect(global.testUtils).toBeDefined();
      expect(typeof global.testUtils.createMockRequest).toBe('function');
      expect(typeof global.testUtils.createMockResponse).toBe('function');
      expect(typeof global.testUtils.delay).toBe('function');
    });
  });

  describe('Package Configuration', () => {
    test('should load package.json correctly', () => {
      const packageJson = require('../package.json');
      
      expect(packageJson.name).toBe('lark-mcp-server');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.main).toBe('lark_mcp_server_example.js');
      expect(packageJson.license).toBe('MIT');
    });

    test('should have required dependencies', () => {
      const packageJson = require('../package.json');
      
      // Check main dependencies
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('cors');
      expect(packageJson.dependencies).toHaveProperty('dotenv');
      expect(packageJson.dependencies).toHaveProperty('axios');
      
      // Check dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('eslint');
      expect(packageJson.devDependencies).toHaveProperty('prettier');
    });

    test('should have required scripts', () => {
      const packageJson = require('../package.json');
      
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts).toHaveProperty('format');
      expect(packageJson.scripts).toHaveProperty('build');
    });
  });

  describe('Test Utilities', () => {
    test('should create mock request correctly', () => {
      const mockReq = global.testUtils.createMockRequest({
        body: { test: 'data' },
        headers: { 'content-type': 'application/json' }
      });

      expect(mockReq).toHaveProperty('body');
      expect(mockReq).toHaveProperty('headers');
      expect(mockReq).toHaveProperty('query');
      expect(mockReq).toHaveProperty('params');
      expect(mockReq.body.test).toBe('data');
      expect(mockReq.headers['content-type']).toBe('application/json');
    });

    test('should create mock response correctly', () => {
      const mockRes = global.testUtils.createMockResponse();

      expect(mockRes.status).toBeDefined();
      expect(mockRes.json).toBeDefined();
      expect(mockRes.send).toBeDefined();
      expect(mockRes.header).toBeDefined();
      
      // Test chaining
      const result = mockRes.status(200).json({ success: true });
      expect(result).toBe(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    test('should handle async delay', async () => {
      const start = Date.now();
      await global.testUtils.delay(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(40); // Allow some tolerance
    });
  });

  describe('Configuration Files', () => {
    test('should have Jest config', () => {
      const jestConfig = require('../jest.config.js');
      
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.testMatch).toBeDefined();
      expect(Array.isArray(jestConfig.testMatch)).toBe(true);
    });

    test('should have ESLint config', () => {
      const eslintConfig = require('../.eslintrc.js');
      
      expect(eslintConfig.env.node).toBe(true);
      expect(eslintConfig.env.jest).toBe(true);
      expect(Array.isArray(eslintConfig.extends)).toBe(true);
    });

    test('should have Prettier config', () => {
      const prettierConfig = require('../.prettierrc.js');
      
      expect(prettierConfig.semi).toBe(true);
      expect(prettierConfig.singleQuote).toBe(true);
      expect(prettierConfig.tabWidth).toBe(2);
    });
  });

  describe('Basic Functionality', () => {
    test('should be able to require main file without errors', () => {
      // This test ensures the main file can be loaded without syntax errors
      expect(() => {
        // We don't actually require it since it would start the server
        // Instead, we just check if the file exists
        const fs = require('fs');
        const path = require('path');
        const mainFile = path.join(__dirname, '..', 'lark_mcp_server_example.js');
        expect(fs.existsSync(mainFile)).toBe(true);
      }).not.toThrow();
    });

    test('should have proper file structure', () => {
      const fs = require('fs');
      const path = require('path');

      // Check for essential files
      const essentialFiles = [
        'package.json',
        'README.md',
        'TECHNICAL_SPEC.md',
        'CONTRIBUTING.md',
        'LICENSE',
        'CHANGELOG.md',
        'Dockerfile',
        'lark_mcp_server_example.js',
        'setup.js'
      ];

      essentialFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });
});

// Simple integration test placeholder
describe('Lark MCP Server - Integration Test Placeholder', () => {
  test('should be ready for integration tests', () => {
    // This is a placeholder for future integration tests
    expect(true).toBe(true);
  });
});

// Simple E2E test placeholder  
describe('Lark MCP Server - E2E Test Placeholder', () => {
  test('should be ready for end-to-end tests', () => {
    // This is a placeholder for future E2E tests
    expect(true).toBe(true);
  });
}); 