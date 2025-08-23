// Background service worker for AI News Assistant
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI News Assistant installed');
  
  // Set default preferences
  chrome.storage.sync.set({
    summaryLength: 'medium',
    focusArea: 'general',
    language: 'english',
    autoSummarize: true
  });
});

// Listen for tab updates to check if we're on a news site
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const newsPatterns = [
      // US Major News Sites
      /bloomberg\.com\/(news|opinion|technology|markets|businessweek)/,
      /reuters\.com.*(\/article|\/world|\/business|\/technology|\/politics)/,
      /bbc\.com\/(news|sport|business|technology)/,
      /cnn\.com.*\/(politics|business|tech|world|us)/,
      /wsj\.com\/(articles|business|politics|tech|markets)/,
      /ft\.com\/(content|news|markets|business)/,
      /nytimes\.com.*\/(business|technology|politics|world|us)/,
      /washingtonpost\.com.*\/(business|technology|politics|world|national)/,
      /usatoday\.com\/(news|money|tech|politics)/,
      /latimes\.com.*(business|world|politics|california)/,
      /chicagotribune\.com\/(news|business|politics)/,
      /bostonglobe\.com\/(news|business|metro|opinion)/,
      /seattletimes\.com\/(business|nation-world|seattle-news|politics)/,
      /dallasnews\.com\/(business|news|politics)/,
      /thehill\.com\/(policy|business|technology|news)/,
      // US Regional Sites (selected major ones)
      /oregonlive\.com\/(news|business|politics)/,
      /cleveland\.com\/(news|business|politics)/,
      /miamiherald\.com\/(news|business|politics)/,
      /charlotteobserver\.com\/(news|business|politics)/,
      /denverpost\.com\/(news|business|politics)/,
      /mercurynews\.com\/(news|business|politics)/,
      /houstonchronicle\.com\/(news|business|politics)/,
      /sfchronicle\.com\/(news|business|politics)/,
      // International - UK
      /theguardian\.com\/(news|business|politics|world|uk-news)/,
      /independent\.co\.uk\/(news|business|politics|world)/,
      /telegraph\.co\.uk\/(news|business|politics|world)/,
      /thetimes\.co\.uk\/(news|business|politics|world)/,
      /economist\.com\/(news|business|politics|world|finance)/,
      /dailymail\.co\.uk\/(news|business|politics|world)/,
      // International - French
      /lemonde\.fr\/(economie|politique|international|actualites)/,
      /lefigaro\.fr\/(economie|politique|international|actualites)/,
      /liberation\.fr\/(economie|politique|international|actualites)/,
      // International - German
      /spiegel\.de\/(wirtschaft|politik|panorama|international)/,
      /zeit\.de\/(wirtschaft|politik|gesellschaft|international)/,
      /welt\.de\/(wirtschaft|politik|vermischtes|ausland)/,
      /sueddeutsche\.de\/(wirtschaft|politik|panorama|international)/,
      // International - Italian
      /corriere\.it\/(economia|politica|cronache|esteri)/,
      /repubblica\.it\/(economia|politica|cronaca|esteri)/,
      // International - Spanish
      /elpais\.com\/(economia|politica|internacional|espana)/,
      /elmundo\.es\/(economia|politica|internacional|espana)/,
      // International - Dutch
      /telegraaf\.nl\/(nieuws|financieel|sport)/,
      /volkskrant\.nl\/(nieuws|economie|buitenland)/
    ];
    
    const isNewsArticle = newsPatterns.some(pattern => pattern.test(tab.url));
    
    if (isNewsArticle) {
      // Enable side panel for this tab
      chrome.sidePanel.setOptions({
        tabId,
        path: 'src/sidepanel.html',
        enabled: true
      });
      
      // Show page action
      chrome.action.enable(tabId);
    }
  }
});

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: Received message:', request.action, sender);
  
  if (request.action === 'extractedContent') {
    console.log('Background: Processing extracted content for tab:', sender.tab.id);
    console.log('Background: Article data:', {
      title: request.data.title,
      contentLength: request.data.content.length,
      author: request.data.author,
      url: request.data.url
    });
    
    // Store extracted content for side panel access
    chrome.storage.local.set({
      [`article_${sender.tab.id}`]: {
        title: request.data.title,
        content: request.data.content,
        author: request.data.author,
        date: request.data.date,
        url: request.data.url,
        timestamp: Date.now()
      }
    }).then(() => {
      console.log('Background: Article stored successfully');
    }).catch(error => {
      console.error('Background: Error storing article:', error);
    });
    
    // Notify side panel that content is ready
    chrome.runtime.sendMessage({
      action: 'contentReady',
      tabId: sender.tab.id,
      data: request.data
    }).catch(error => {
      console.log('Background: No side panel listening (this is normal)');
    });
  }
  
  if (request.action === 'summarizeArticle') {
    // Forward to backend API
    summarizeWithAI(request.data)
      .then(summary => sendResponse({ success: true, summary }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'openSidePanel') {
    // Open side panel for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  }
  
  // Always return true to keep message channel open
  return true;
});

// Function to call backend API for summarization with configurable URL
async function summarizeWithAI(articleData) {
  try {
    // Load configuration to get the correct API URL
    const config = await loadExtensionConfig();
    const apiUrl = config.getApiUrl('summarize');
    
    console.log('Making API request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
      // Add timeout support
      signal: AbortSignal.timeout(config.api.timeout)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    // Enhanced error handling with specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    } else if (error.message.includes('fetch')) {
      throw new Error('Network error - unable to connect to backend service');
    } else {
      throw error;
    }
  }
}

// Load extension configuration
async function loadExtensionConfig() {
  // Import config dynamically to avoid circular dependencies
  if (typeof EXTENSION_CONFIG === 'undefined') {
    // For service workers, we'll define a minimal config inline
    const config = {
      api: {
        baseUrl: 'http://localhost:3001',
        timeout: 30000,
        endpoints: {
          summarize: '/api/summarize',
          health: '/api/health'
        }
      },
      getApiUrl(endpoint) {
        return `${this.api.baseUrl}${this.api.endpoints[endpoint]}`;
      }
    };
    
    // Try to load from storage
    try {
      const stored = await chrome.storage.sync.get(['apiBaseUrl']);
      if (stored.apiBaseUrl) {
        config.api.baseUrl = stored.apiBaseUrl;
      }
    } catch (error) {
      console.warn('Could not load API URL from storage:', error);
    }
    
    return config;
  }
  
  return await EXTENSION_CONFIG.loadConfig();
}