// Chrome Extension Options Page
// Handles user API configuration and preferences

class OptionsManager {
    constructor() {
        this.defaultSettings = {
            // API Configuration
            apiUrl: '',
            bearerToken: '',
            defaultModel: 'gpt-4',
            fallbackModel: '',
            
            // Extension Preferences  
            summaryLength: 'medium',
            focusArea: 'general',
            language: 'english',
            autoSummarize: true,
            enableDebugLogs: false,
            autoHighlightKeyPoints: true,
            customSources: '',
            highlightStyle: 'default',
            highlightDelay: '300'
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.showStatus('Settings loaded', 'success');
    }

    setupEventListeners() {
        // Save settings button
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings button
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Test connection button
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testApiConnection();
        });

        // Toggle token visibility
        document.getElementById('toggleToken').addEventListener('click', () => {
            this.toggleTokenVisibility();
        });

        // Auto-save on input changes (debounced)
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', this.debounce(() => {
                this.autoSave();
            }, 1000));
        });

        // Validate API URL on input
        document.getElementById('apiUrl').addEventListener('input', (e) => {
            this.validateApiUrl(e.target);
        });

        // Validate required fields
        document.getElementById('bearerToken').addEventListener('input', (e) => {
            this.validateRequired(e.target);
        });
    }

    async loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(Object.keys(this.defaultSettings));
            
            // Merge with defaults
            const settings = { ...this.defaultSettings, ...stored };
            
            // Populate form fields
            document.getElementById('apiUrl').value = settings.apiUrl || '';
            document.getElementById('bearerToken').value = settings.bearerToken || '';
            document.getElementById('defaultModel').value = settings.defaultModel || 'gpt-4';
            document.getElementById('fallbackModel').value = settings.fallbackModel || '';
            
            document.getElementById('summaryLength').value = settings.summaryLength || 'medium';
            document.getElementById('focusArea').value = settings.focusArea || 'general';
            document.getElementById('language').value = settings.language || 'english';
            document.getElementById('autoSummarize').checked = settings.autoSummarize !== false;
            document.getElementById('enableDebugLogs').checked = settings.enableDebugLogs === true;
            document.getElementById('autoHighlightKeyPoints').checked = settings.autoHighlightKeyPoints !== false;
            document.getElementById('customSources').value = settings.customSources || '';
            document.getElementById('highlightStyle').value = settings.highlightStyle || 'default';
            document.getElementById('highlightDelay').value = settings.highlightDelay || '300';
            
            console.log('Settings loaded:', settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showStatus('Failed to load settings', 'error');
        }
    }

    async saveSettings() {
        try {
            const settings = this.collectFormData();
            
            // Validate required fields
            if (!settings.apiUrl) {
                this.showStatus('API URL is required', 'error');
                document.getElementById('apiUrl').focus();
                return;
            }
            
            if (!settings.bearerToken) {
                this.showStatus('Bearer Token is required', 'error');
                document.getElementById('bearerToken').focus();
                return;
            }
            
            // Save to Chrome storage
            await chrome.storage.sync.set(settings);
            
            // Also save to local storage as backup
            await chrome.storage.local.set(settings);
            
            this.showStatus('✅ Settings saved successfully!', 'success');
            
            // Notify background script of settings update
            try {
                await chrome.runtime.sendMessage({
                    action: 'settingsUpdated',
                    settings: settings
                });
            } catch (error) {
                console.log('Background script not available, settings saved locally');
            }
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showStatus('❌ Failed to save settings', 'error');
        }
    }

    async autoSave() {
        try {
            const settings = this.collectFormData();
            
            // Only auto-save if required fields are filled
            if (settings.apiUrl && settings.bearerToken) {
                await chrome.storage.sync.set(settings);
                this.showStatus('💾 Auto-saved', 'success', 2000);
            }
        } catch (error) {
            console.log('Auto-save failed:', error);
        }
    }

    collectFormData() {
        return {
            apiUrl: document.getElementById('apiUrl').value.trim(),
            bearerToken: document.getElementById('bearerToken').value.trim(),
            defaultModel: document.getElementById('defaultModel').value.trim(),
            fallbackModel: document.getElementById('fallbackModel').value.trim(),
            
            summaryLength: document.getElementById('summaryLength').value,
            focusArea: document.getElementById('focusArea').value,
            language: document.getElementById('language').value,
            autoSummarize: document.getElementById('autoSummarize').checked,
            enableDebugLogs: document.getElementById('enableDebugLogs').checked,
            autoHighlightKeyPoints: document.getElementById('autoHighlightKeyPoints').checked,
            customSources: document.getElementById('customSources').value.trim(),
            highlightStyle: document.getElementById('highlightStyle').value,
            highlightDelay: document.getElementById('highlightDelay').value
        };
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                // Clear stored settings
                await chrome.storage.sync.clear();
                await chrome.storage.local.clear();
                
                // Reset form to defaults
                Object.entries(this.defaultSettings).forEach(([key, value]) => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                    }
                });
                
                this.showStatus('🔄 Settings reset to defaults', 'success');
                
            } catch (error) {
                console.error('Failed to reset settings:', error);
                this.showStatus('❌ Failed to reset settings', 'error');
            }
        }
    }

    async testApiConnection() {
        const testButton = document.getElementById('testConnection');
        const testResult = document.getElementById('testResult');
        
        testButton.disabled = true;
        testButton.textContent = '🧪 Testing...';
        testResult.className = 'test-result loading';
        testResult.textContent = '⏳ Testing API connection...';
        
        try {
            const settings = this.collectFormData();
            
            if (!settings.apiUrl || !settings.bearerToken) {
                throw new Error('API URL and Bearer Token are required for testing');
            }
            
            // Test with a simple API call
            const response = await fetch(settings.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${settings.bearerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: settings.defaultModel || 'gpt-4',
                    messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
                    max_tokens: 10
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                testResult.className = 'test-result success';
                testResult.textContent = `✅ Connection successful! Model: ${settings.defaultModel}`;
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
            }
            
        } catch (error) {
            console.error('API test failed:', error);
            testResult.className = 'test-result error';
            testResult.textContent = `❌ Connection failed: ${error.message}`;
        } finally {
            testButton.disabled = false;
            testButton.textContent = '🧪 Test API Connection';
            
            // Clear test result after 10 seconds
            setTimeout(() => {
                testResult.textContent = '';
                testResult.className = 'test-result';
            }, 10000);
        }
    }

    toggleTokenVisibility() {
        const tokenInput = document.getElementById('bearerToken');
        const toggleButton = document.getElementById('toggleToken');
        
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            toggleButton.textContent = '🙈 Hide';
        } else {
            tokenInput.type = 'password';
            toggleButton.textContent = '👁️ Show';
        }
    }

    validateApiUrl(input) {
        const url = input.value.trim();
        
        if (url && !this.isValidUrl(url)) {
            input.setCustomValidity('Please enter a valid URL');
        } else {
            input.setCustomValidity('');
        }
    }

    validateRequired(input) {
        if (!input.value.trim()) {
            input.setCustomValidity('This field is required');
        } else {
            input.setCustomValidity('');
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return string.startsWith('http://') || string.startsWith('https://');
        } catch (_) {
            return false;
        }
    }

    showStatus(message, type, duration = 5000) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        if (duration > 0) {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-message';
            }, duration);
        }
    }

    // Utility: Debounce function to limit rapid function calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize options manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});

// Handle extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Listen for messages from other extension parts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getSettings') {
            chrome.storage.sync.get(null, (settings) => {
                sendResponse(settings);
            });
            return true; // Keep message channel open for async response
        }
    });
}