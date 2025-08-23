// Unit tests for extension configuration
const EXTENSION_CONFIG = require('../../src/config');

describe('EXTENSION_CONFIG', () => {
  beforeEach(() => {
    // Reset config to default state
    EXTENSION_CONFIG.api.baseUrl = 'http://localhost:3001';
    EXTENSION_CONFIG.dev.enableDebugLogs = true;
  });

  describe('api configuration', () => {
    test('should have default API configuration', () => {
      expect(EXTENSION_CONFIG.api.baseUrl).toBe('http://localhost:3001');
      expect(EXTENSION_CONFIG.api.timeout).toBe(30000);
      expect(EXTENSION_CONFIG.api.retries).toBe(2);
    });

    test('should have all required endpoints', () => {
      expect(EXTENSION_CONFIG.api.endpoints.summarize).toBe('/api/summarize');
      expect(EXTENSION_CONFIG.api.endpoints.health).toBe('/api/health');
      expect(EXTENSION_CONFIG.api.endpoints.config).toBe('/api/config');
      expect(EXTENSION_CONFIG.api.endpoints.test).toBe('/api/test');
    });
  });

  describe('extension settings', () => {
    test('should have default preferences', () => {
      const defaults = EXTENSION_CONFIG.extension.defaultPreferences;
      expect(defaults.summaryLength).toBe('medium');
      expect(defaults.focusArea).toBe('general');
      expect(defaults.language).toBe('english');
      expect(defaults.autoSummarize).toBe(true);
    });

    test('should have UI settings', () => {
      const ui = EXTENSION_CONFIG.extension.ui;
      expect(ui.bannerDisplayTime).toBe(5000);
      expect(ui.animationDuration).toBe(300);
      expect(ui.sidebarWidth).toBe(380);
      expect(ui.sidebarTop).toBe(80);
    });

    test('should have content processing settings', () => {
      const content = EXTENSION_CONFIG.extension.content;
      expect(content.minArticleLength).toBe(200);
      expect(content.maxArticleLength).toBe(50000);
      expect(content.processingDelay).toBe(1000);
    });
  });

  describe('getApiUrl method', () => {
    test('should construct correct API URLs', () => {
      expect(EXTENSION_CONFIG.getApiUrl('summarize'))
        .toBe('http://localhost:3001/api/summarize');
      expect(EXTENSION_CONFIG.getApiUrl('health'))
        .toBe('http://localhost:3001/api/health');
      expect(EXTENSION_CONFIG.getApiUrl('config'))
        .toBe('http://localhost:3001/api/config');
    });

    test('should work with custom base URL', () => {
      EXTENSION_CONFIG.api.baseUrl = 'https://api.example.com';
      expect(EXTENSION_CONFIG.getApiUrl('summarize'))
        .toBe('https://api.example.com/api/summarize');
    });

    test('should handle undefined endpoint gracefully', () => {
      expect(EXTENSION_CONFIG.getApiUrl('nonexistent'))
        .toBe('http://localhost:3001undefined');
    });
  });

  describe('development settings', () => {
    test('should have debug configuration', () => {
      expect(EXTENSION_CONFIG.dev.enableDebugLogs).toBe(true);
      expect(EXTENSION_CONFIG.dev.logPrefix).toBe('AI News Assistant:');
      expect(EXTENSION_CONFIG.dev.enablePerformanceTracking).toBe(true);
    });
  });

  describe('configuration validation', () => {
    test('should have required structure', () => {
      expect(EXTENSION_CONFIG.api).toBeDefined();
      expect(EXTENSION_CONFIG.extension).toBeDefined();
      expect(EXTENSION_CONFIG.dev).toBeDefined();
      expect(typeof EXTENSION_CONFIG.getApiUrl).toBe('function');
    });

    test('should have numeric values for timeouts and sizes', () => {
      expect(typeof EXTENSION_CONFIG.api.timeout).toBe('number');
      expect(typeof EXTENSION_CONFIG.api.retries).toBe('number');
      expect(typeof EXTENSION_CONFIG.extension.ui.sidebarWidth).toBe('number');
      expect(typeof EXTENSION_CONFIG.extension.content.minArticleLength).toBe('number');
    });

    test('should have reasonable default values', () => {
      expect(EXTENSION_CONFIG.api.timeout).toBeGreaterThan(0);
      expect(EXTENSION_CONFIG.extension.content.minArticleLength).toBeGreaterThan(0);
      expect(EXTENSION_CONFIG.extension.content.maxArticleLength)
        .toBeGreaterThan(EXTENSION_CONFIG.extension.content.minArticleLength);
    });
  });
});