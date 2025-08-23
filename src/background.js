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
      
      // Send success response
      sendResponse({ success: true, message: 'Content processed successfully' });
    }).catch(error => {
      console.error('Background: Error storing article:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Notify side panel that content is ready
    chrome.runtime.sendMessage({
      action: 'contentReady',
      tabId: sender.tab.id,
      data: request.data
    }).catch(error => {
      console.log('Background: No side panel listening (this is normal)');
    });
    
    return true; // Keep message channel open for async response
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
        chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'settingsUpdated') {
    console.log('Background: Settings updated', request.settings);
    // Optional: Update backend API configuration
    if (request.settings.apiUrl && request.settings.bearerToken) {
      updateBackendApiConfig(request.settings).then(() => {
        sendResponse({ success: true, message: 'Settings updated successfully' });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep message channel open for async response
    } else {
      sendResponse({ success: true, message: 'Settings saved locally' });
    }
  }
  
  if (request.action === 'askFollowUp') {
    console.log('Background: Processing follow-up question:', request.data.question);
    handleFollowUpQuestion(request.data)
      .then(answer => sendResponse({ success: true, answer }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'submitFeedback') {
    console.log('Background: Received user feedback:', request.data);
    storeFeedback(request.data)
      .then(() => sendResponse({ success: true, message: 'Feedback submitted successfully' }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  // Always return true to keep message channel open
  return true;
});

// Function to call backend API for summarization with configurable URL
async function summarizeWithAI(articleData) {
  try {
    // Load extension configuration and user settings
    const config = await loadExtensionConfig();
    const apiUrl = config.getApiUrl('summarize');
    
    // Load user's API configuration
    const userSettings = await chrome.storage.sync.get(['apiUrl', 'bearerToken', 'defaultModel', 'fallbackModel']);
    
    // Prepare request data with optional API config
    const requestData = { ...articleData };
    if (userSettings.apiUrl && userSettings.bearerToken) {
      requestData.apiConfig = {
        apiUrl: userSettings.apiUrl,
        bearerToken: userSettings.bearerToken,
        defaultModel: userSettings.defaultModel,
        fallbackModel: userSettings.fallbackModel
      };
    }
    
    console.log('Making API request to:', apiUrl);
    console.log('Using custom API config:', !!userSettings.apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
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

// Update backend API configuration
async function updateBackendApiConfig(settings) {
  const config = await loadExtensionConfig();
  const configUrl = `${config.api.baseUrl}/api/config/ai`;
  
  const response = await fetch(configUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiUrl: settings.apiUrl,
      bearerToken: settings.bearerToken,
      defaultModel: settings.defaultModel,
      fallbackModel: settings.fallbackModel
    })
  });
  
  if (response.ok) {
    console.log('Background: Backend API configuration updated successfully');
    return { success: true };
  } else {
    console.warn('Background: Failed to update backend API configuration:', response.status);
    throw new Error(`Backend configuration update failed: ${response.status}`);
  }
}

// Handle follow-up questions
async function handleFollowUpQuestion(data) {
  const config = await loadExtensionConfig();
  const apiUrl = config.getApiUrl('summarize');
  
  // Load user's API configuration
  const userSettings = await chrome.storage.sync.get(['apiUrl', 'bearerToken', 'defaultModel', 'fallbackModel']);
  
  // Create optimized follow-up prompt
  const followUpPrompt = createFollowUpPrompt(data.question, data.context);
  
  // Prepare request data with optional API config
  const requestData = {
    title: `Follow-up: ${data.context.title}`,
    content: followUpPrompt,
    preferences: {
      summaryLength: 'medium',
      focusArea: 'general', 
      language: 'english'
    }
  };
  
  if (userSettings.apiUrl && userSettings.bearerToken) {
    requestData.apiConfig = {
      apiUrl: userSettings.apiUrl,
      bearerToken: userSettings.bearerToken,
      defaultModel: userSettings.defaultModel,
      fallbackModel: userSettings.fallbackModel
    };
  }
  
  console.log('Background: Sending follow-up question to backend');
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
    signal: AbortSignal.timeout(config.api.timeout)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Follow-up API error ${response.status}: ${errorText}`);
  }
  
  const result = await response.json();
  return result.summary || result.answer || 'I apologize, but I couldn\'t generate a proper response to that question.';
}

// Create optimized prompt for follow-up questions
function createFollowUpPrompt(question, context) {
  return `You are an AI assistant helping users understand news articles in more depth. 

CONTEXT:
Article Title: ${context.title}
Original Summary: ${context.summary}
Key Highlights: ${context.highlights ? context.highlights.join('; ') : 'None provided'}
Article URL: ${context.url}

USER QUESTION: ${question}

Please provide a clear, concise, and informative answer to the user's question based on the article context. Focus on:
1. Directly answering the specific question asked
2. Providing relevant details from the article context
3. Offering insights that help the user understand the broader implications
4. Keeping the response conversational and accessible

If the question cannot be fully answered from the provided context, acknowledge this and provide what relevant information you can, then suggest what additional information might be needed.

Response (in plain text, conversational tone):`;
}

// Store user feedback for analysis
async function storeFeedback(feedbackData) {
  try {
    // Store in Chrome storage for extension analytics
    const existingFeedback = await chrome.storage.local.get(['userFeedback']);
    const feedbackList = existingFeedback.userFeedback || [];
    
    feedbackList.push({
      ...feedbackData,
      id: Date.now() + Math.random().toString(36).substring(7),
      version: '2.2.0'
    });
    
    // Keep only last 200 feedback entries
    const recentFeedback = feedbackList.slice(-200);
    
    await chrome.storage.local.set({ userFeedback: recentFeedback });
    
    // Optionally send to backend for aggregated analysis
    try {
      const config = await loadExtensionConfig();
      const backendUrl = `${config.api.baseUrl}/api/feedback`;
      
      await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackData,
          timestamp: new Date().toISOString(),
          extensionVersion: '2.2.0'
        })
      });
    } catch (backendError) {
      console.log('Background: Could not send feedback to backend:', backendError);
      // Don't fail the whole operation if backend is unavailable
    }
    
    console.log('Background: Feedback stored successfully');
    return true;
    
  } catch (error) {
    console.error('Background: Error storing feedback:', error);
    throw error;
  }
}