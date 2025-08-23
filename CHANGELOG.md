# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-08-23

### 🚀 Major Features Added

#### User-Configurable API Settings
- **New Options Page**: Beautiful, full-featured settings interface (`src/options.html`, `src/options.css`, `src/options.js`)
- **Custom API Configuration**: Users can now configure their own AI API endpoints
  - API URL input with validation
  - Bearer Token management (securely masked)
  - Model selection (default + fallback models)
  - Real-time API connection testing
- **Secure Storage**: Settings stored in Chrome's encrypted sync storage
- **Auto-Save**: Settings automatically saved as users type (debounced)

#### Enhanced Backend Flexibility
- **Runtime API Configuration**: Backend now accepts per-request API settings
- **New Endpoint**: `/api/config/ai` for updating AI client configuration
- **Dynamic Client Creation**: AI client can be instantiated with custom parameters
- **Environment Variable Fallback**: Maintains backward compatibility with existing setups

### 🛠️ Improvements

#### Extension Integration
- **Options Page Access**: Right-click extension icon → "Options" OR popup → "Settings"
- **Settings Synchronization**: Automatic sync between extension and backend
- **Connection Validation**: Built-in API testing before saving settings
- **User Experience**: Professional UI with loading states, error handling, and success feedback

#### Messaging System Fixes
- **Robust Communication**: Fixed Chrome extension messaging errors
- **Callback-Based Approach**: Replaced Promise-based messaging with callbacks for better reliability
- **Error Handling**: Improved error messages and graceful failure recovery
- **Extension Context Validation**: Better handling of extension reloads and context invalidation

#### Backend Enhancements
- **Per-Request Configuration**: Support for custom API settings on individual requests
- **Better Response Handling**: Proper `sendResponse()` calls for all message handlers
- **Async Operation Support**: Improved handling of asynchronous operations
- **Configuration Persistence**: Backend remembers user settings between requests

### 🔧 Technical Improvements

#### Code Quality
- **Better Error Handling**: Comprehensive error catching and user-friendly messages
- **Type Safety**: Improved parameter validation throughout the codebase
- **Security**: API tokens masked in UI, secure storage implementation
- **Performance**: Debounced auto-save, optimized message passing

#### Testing & Documentation
- **Enhanced Testing Guide**: Updated `TESTING_GUIDE.md` with API configuration instructions
- **Comprehensive Setup**: Step-by-step guide for configuring custom APIs
- **Troubleshooting**: Detailed troubleshooting section for common issues
- **Production Ready**: Full documentation for deployment

### 📱 User Experience

#### New Capabilities
- **API Freedom**: Use any OpenAI-compatible API (OpenAI, Anthropic, local models, etc.)
- **Cost Control**: Users manage their own API keys and usage
- **Privacy Options**: Direct API calls to preferred providers
- **Professional Use**: Support for enterprise API endpoints
- **Multi-Provider**: Easy switching between different AI providers

#### Interface Improvements
- **Modern UI**: Beautiful gradient design with animations
- **Responsive Design**: Works on all screen sizes
- **Status Indicators**: Clear success/error states throughout the interface
- **Accessibility**: Proper keyboard navigation and screen reader support

### 🐛 Bug Fixes
- **Messaging Errors**: Fixed "message channel closed" errors in content scripts
- **Extension Context**: Better handling of extension reloads and updates
- **Background Script**: Improved stability of background service worker
- **Storage Conflicts**: Resolved issues with settings synchronization

### ⚠️ Breaking Changes
- **None**: All changes are backward compatible
- **Migration**: Existing users continue to work with environment variables
- **Optional**: New API configuration features are optional

### 🔄 Migration Guide

#### For Existing Users
1. **No Action Required**: Extension continues working with existing backend setup
2. **Optional Upgrade**: Configure custom API in Options page for enhanced features
3. **Backward Compatible**: Environment variables still work as before

#### For New Users
1. **Load Extension**: Install in Chrome (`chrome://extensions/`)
2. **Configure API**: Right-click extension → "Options"
3. **Set Credentials**: Enter API URL, Bearer Token, and Model preferences
4. **Test Connection**: Use built-in connection test
5. **Save Settings**: Settings sync across devices

### 📊 Performance
- **API Calls**: ~6 seconds for Bloomberg articles (13K+ characters)
- **Extension Load**: <1 second startup time
- **Memory Usage**: <50MB per tab
- **Storage**: ~10KB for settings data

### 🌐 Compatibility
- **Chrome**: 88+ (Manifest V3)
- **Node.js**: 16.0.0+
- **APIs**: All OpenAI-compatible endpoints
- **News Sites**: 27 international sites supported

---

## [2.0.0] - Previous Release

### Features
- Bloomberg-style right sidebar interface
- 27 international news sites support
- Automatic article detection and processing
- AI-powered summarization with key highlights
- Multilingual content support
- Professional UI with animations
- Chrome extension with side panel
- Express.js backend with security middleware

---

## Installation & Setup

### Quick Start
```bash
# Clone repository
git clone https://github.com/yao8433/ai-news-assistant-extension.git
cd ai-news-assistant-extension

# Install dependencies
npm run install-all

# Start backend
npm run backend

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select project folder
```

### API Configuration
1. Right-click extension icon → "Options"
2. Enter API URL: `https://api.openai.com/v1/chat/completions`
3. Enter Bearer Token: Your API key
4. Test connection and save

### Supported APIs
- OpenAI (GPT-3.5, GPT-4)
- Anthropic Claude
- Local LLM servers
- Any OpenAI-compatible endpoint

---

## Contributing

We welcome contributions! Please see our contributing guidelines and feel free to submit issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details.