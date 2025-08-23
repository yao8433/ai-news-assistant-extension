# AI News Assistant - Testing Guide

## Testing Status ✅
- **Backend Server**: Running and processing requests from Bloomberg, Reuters, NYTimes
- **Configuration**: All 27 news sites, 139 URL patterns, 140 host permissions verified
- **Environment**: API credentials and endpoints properly configured
- **Dependencies**: All modules loading correctly

## Manual Chrome Extension Testing

### 1. Load Extension in Chrome
```bash
# From project root
cd /Users/ffy/ai-news-assistant-extension
```

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this project directory
5. Confirm extension appears with AI News Assistant icon

### 2. Test News Site Integration
Visit any supported news site:
- **Bloomberg**: https://www.bloomberg.com/news
- **Reuters**: https://www.reuters.com/world/
- **New York Times**: https://www.nytimes.com/section/world
- **BBC**: https://www.bbc.com/news
- **CNN**: https://www.cnn.com/world

**Expected Behavior**:
- Extension icon should be enabled/active on news sites
- Side panel should be available (right-click extension icon → "Open side panel")
- Article detection should trigger automatically on article pages

### 3. Test Article Summarization
1. Navigate to a full news article on any supported site
2. Wait for automatic detection (1 second delay)
3. Open side panel to view summary
4. Verify summary contains:
   - Article title
   - Main summary text
   - Key highlights (bullet points)
   - Additional insights
   - Metadata (length, focus, language)

### 4. Test API Configuration (New Feature!)
1. Right-click extension icon → "Options" OR click Settings in popup
2. Configure your own AI API:
   - **API URL**: Enter your OpenAI-compatible endpoint
   - **Bearer Token**: Your API key/token (masked for security)
   - **Default Model**: gpt-4, claude-3-sonnet, etc.
   - **Fallback Model**: Optional backup model
3. Click "Test API Connection" to verify setup
4. Save settings - they're stored securely in your browser
5. Test article summarization with your custom API

### 5. Test User Preferences
1. In Options page or side panel settings
2. Test different configurations:
   - **Summary Length**: Short (2-3 sentences), Medium (3-4), Detailed (5-7)
   - **Focus Area**: General, Economic, Political, Social, Technology
   - **Language**: English, Spanish, French, German, Italian
   - **Auto-Summarize**: Enable/disable automatic processing
   - **Debug Logs**: Enable for troubleshooting
3. Verify preferences persist across sessions

### 6. Backend Integration Testing
Monitor backend logs for real-time processing:
```bash
# Check backend is processing requests
curl http://localhost:3001/api/health

# View backend logs (if running in terminal)
# Should show requests from Chrome extension
```

## Troubleshooting Common Issues

### Extension Not Loading
- Check `manifest.json` for syntax errors
- Verify all referenced files exist
- Check Chrome extension developer console for errors

### No Article Detection
- Verify you're on a supported news site
- Check browser console for JavaScript errors
- Ensure content scripts are injected properly

### Backend Connection Failed
- Confirm backend server running on `localhost:3001`
- Check network requests in Chrome DevTools
- Verify CORS configuration allows extension origin

### API Errors
- **Using Default Backend**: Verify `.env` file contains valid `BEARER_TOKEN`
- **Using Custom API**: Check your API URL and Bearer Token in Options page
- Use "Test API Connection" button to verify configuration
- Check API endpoint URL is accessible and OpenAI-compatible
- Monitor backend logs for API call failures
- Ensure your API supports the models specified in settings

## Production Deployment Checklist
- [ ] Update `manifest.json` version number
- [ ] Configure production API URLs
- [ ] Test on multiple browsers/devices
- [ ] Verify permissions are minimal required
- [ ] Test error handling and fallbacks
- [ ] Performance testing on slow connections

## Performance Benchmarks
- **Article Detection**: < 1 second after page load
- **Summary Generation**: 5-15 seconds depending on article length
- **UI Response**: < 300ms for user interactions
- **Memory Usage**: < 50MB per tab

Ready for testing! 🚀