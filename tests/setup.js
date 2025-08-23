// Jest test setup file
// Global test configuration and mocks

// Mock Chrome extension APIs for tests
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    sendMessage: jest.fn().mockResolvedValue({}),
    onMessage: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    }
  },
  storage: {
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({})
    },
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({})
    }
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    },
    query: jest.fn().mockResolvedValue([])
  },
  sidePanel: {
    setOptions: jest.fn().mockResolvedValue({}),
    open: jest.fn().mockResolvedValue({})
  },
  action: {
    enable: jest.fn()
  }
};

// Mock fetch for Node.js environment
if (!global.fetch) {
  global.fetch = jest.fn();
  global.AbortSignal = {
    timeout: jest.fn().mockReturnValue({ addEventListener: jest.fn() })
  };
}

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

// Setup DOM environment for extension tests
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://example.com',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
}));

// Mock IntersectionObserver  
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Test utilities
global.testUtils = {
  // Create mock article data
  createMockArticle: (overrides = {}) => ({
    title: 'Test Article Title',
    content: 'This is test content for an article that is long enough to pass validation checks.',
    author: 'Test Author',
    date: '2024-01-01',
    url: 'https://example.com/test-article',
    ...overrides
  }),

  // Create mock preferences
  createMockPreferences: (overrides = {}) => ({
    summaryLength: 'medium',
    focusArea: 'general',
    language: 'english',
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  
  // Clear DOM
  document.body.innerHTML = '';
  
  // Reset window location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'https://example.com',
      hostname: 'example.com'
    },
    writable: true
  });
});

// Global test timeout
jest.setTimeout(10000);