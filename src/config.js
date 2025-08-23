// Extension Configuration
// Centralized configuration for the Chrome extension

const EXTENSION_CONFIG = {
  // Backend API configuration
  api: {
    // Default backend URL - can be overridden via environment or storage
    baseUrl: 'http://localhost:3001',
    
    // API endpoints
    endpoints: {
      summarize: '/api/summarize',
      health: '/api/health',
      config: '/api/config',
      test: '/api/test'
    },
    
    // Request settings
    timeout: 30000, // 30 seconds
    retries: 2
  },
  
  // Extension settings
  extension: {
    // Default user preferences
    defaultPreferences: {
      summaryLength: 'medium',
      focusArea: 'general',  
      language: 'english',
      autoSummarize: true
    },
    
    // UI settings
    ui: {
      bannerDisplayTime: 5000, // 5 seconds
      animationDuration: 300, // 300ms
      sidebarWidth: 380, // pixels
      sidebarTop: 80 // pixels from top
    },
    
    // Content processing settings
    content: {
      minArticleLength: 200, // minimum characters
      maxArticleLength: 50000, // maximum characters before truncation
      processingDelay: 1000 // delay before processing article (ms)
    }
  },
  
  // Development settings
  dev: {
    enableDebugLogs: true,
    logPrefix: 'AI News Assistant:',
    enablePerformanceTracking: true
  },

  // Get full API URL for an endpoint
  getApiUrl(endpoint) {
    return `${this.api.baseUrl}${this.api.endpoints[endpoint]}`;
  },

  // Load configuration from storage (for production deployments)
  async loadConfig() {
    try {
      const stored = await chrome.storage.sync.get(['apiBaseUrl', 'debugMode']);
      
      if (stored.apiBaseUrl) {
        this.api.baseUrl = stored.apiBaseUrl;
        console.log('Using configured API URL:', this.api.baseUrl);
      }
      
      if (stored.debugMode !== undefined) {
        this.dev.enableDebugLogs = stored.debugMode;
      }
      
      return this;
    } catch (error) {
      console.warn('Could not load stored config:', error);
      return this;
    }
  },

  // Save configuration to storage
  async saveConfig(updates) {
    try {
      const configToStore = {};
      
      if (updates.apiBaseUrl) {
        configToStore.apiBaseUrl = updates.apiBaseUrl;
        this.api.baseUrl = updates.apiBaseUrl;
      }
      
      if (updates.debugMode !== undefined) {
        configToStore.debugMode = updates.debugMode;
        this.dev.enableDebugLogs = updates.debugMode;
      }
      
      await chrome.storage.sync.set(configToStore);
      console.log('Configuration saved:', configToStore);
      
      return this;
    } catch (error) {
      console.error('Could not save config:', error);
      throw error;
    }
  }
};

// Export for both CommonJS and ES6 module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXTENSION_CONFIG;
} else if (typeof window !== 'undefined') {
  window.EXTENSION_CONFIG = EXTENSION_CONFIG;
}