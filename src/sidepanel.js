// Side panel JavaScript
class SidePanelApp {
    constructor() {
        this.currentArticle = null;
        this.currentSummary = null;
        this.preferences = {};
        
        this.initializeElements();
        this.loadPreferences();
        this.setupEventListeners();
        this.checkForArticle();
    }
    
    initializeElements() {
        // State elements
        this.loadingState = document.getElementById('loadingState');
        this.noArticleState = document.getElementById('noArticleState');
        this.summaryState = document.getElementById('summaryState');
        this.errorState = document.getElementById('errorState');
        this.settingsPanel = document.getElementById('settingsPanel');
        
        // Content elements
        this.articleTitle = document.getElementById('articleTitle');
        this.articleAuthor = document.getElementById('articleAuthor');
        this.articleDate = document.getElementById('articleDate');
        this.articleSource = document.getElementById('articleSource');
        this.summaryText = document.getElementById('summaryText');
        this.highlightsList = document.getElementById('highlightsList');
        this.insightsText = document.getElementById('insightsText');
        this.insightsSection = document.getElementById('insightsSection');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Control elements
        this.summaryLength = document.getElementById('summaryLength');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.thumbsUp = document.getElementById('thumbsUp');
        this.thumbsDown = document.getElementById('thumbsDown');
        
        // Settings elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettings = document.getElementById('closeSettings');
        this.focusArea = document.getElementById('focusArea');
        this.language = document.getElementById('language');
        this.autoSummarize = document.getElementById('autoSummarize');
        this.saveSettings = document.getElementById('saveSettings');
    }
    
    async loadPreferences() {
        try {
            const result = await chrome.storage.sync.get([
                'summaryLength', 'focusArea', 'language', 'autoSummarize'
            ]);
            
            this.preferences = {
                summaryLength: result.summaryLength || 'medium',
                focusArea: result.focusArea || 'general',
                language: result.language || 'english',
                autoSummarize: result.autoSummarize !== false
            };
            
            this.updatePreferencesUI();
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }
    
    updatePreferencesUI() {
        this.summaryLength.value = this.preferences.summaryLength;
        this.focusArea.value = this.preferences.focusArea;
        this.language.value = this.preferences.language;
        this.autoSummarize.checked = this.preferences.autoSummarize;
    }
    
    setupEventListeners() {
        // Settings
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettings.addEventListener('click', () => this.hideSettings());
        this.saveSettings.addEventListener('click', () => this.savePreferences());
        
        // Summary controls
        this.summaryLength.addEventListener('change', () => this.regenerateSummary());
        this.regenerateBtn.addEventListener('click', () => this.regenerateSummary());
        this.retryBtn.addEventListener('click', () => this.summarizeArticle());
        
        // Feedback
        this.thumbsUp.addEventListener('click', () => this.provideFeedback('positive'));
        this.thumbsDown.addEventListener('click', () => this.provideFeedback('negative'));
        
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'contentReady') {
                this.handleContentReady(message.data);
            }
        });
    }
    
    async checkForArticle() {
        try {
            console.log('SidePanel: Checking for article...');
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('SidePanel: Current tab:', tab);
            if (!tab) return;
            
            // Check if there's stored article data for this tab
            const result = await chrome.storage.local.get([`article_${tab.id}`]);
            const articleData = result[`article_${tab.id}`];
            console.log('SidePanel: Article data for tab', tab.id, ':', articleData);
            
            if (articleData && articleData.content) {
                console.log('SidePanel: Found article data, processing...');
                this.handleContentReady(articleData);
            } else {
                console.log('SidePanel: No article data found, showing no article state');
                this.showNoArticleState();
            }
        } catch (error) {
            console.error('SidePanel: Error checking for article:', error);
            this.showNoArticleState();
        }
    }
    
    handleContentReady(articleData) {
        console.log('SidePanel: handleContentReady called with:', articleData);
        this.currentArticle = articleData;
        
        // Display article info
        this.articleTitle.textContent = articleData.title || 'No title';
        this.articleAuthor.textContent = articleData.author || '';
        this.articleDate.textContent = this.formatDate(articleData.date);
        this.articleSource.textContent = articleData.site || 'Unknown source';
        
        console.log('SidePanel: Auto-summarize preference:', this.preferences.autoSummarize);
        
        if (this.preferences.autoSummarize) {
            console.log('SidePanel: Auto-summarizing...');
            this.summarizeArticle();
        } else {
            console.log('SidePanel: Showing summary state without auto-summarize');
            this.showSummaryState();
        }
    }
    
    async summarizeArticle() {
        if (!this.currentArticle) return;
        
        this.showLoadingState();
        
        try {
            const summaryRequest = {
                title: this.currentArticle.title,
                content: this.currentArticle.content,
                author: this.currentArticle.author,
                date: this.currentArticle.date,
                url: this.currentArticle.url,
                preferences: {
                    summaryLength: this.summaryLength.value,
                    focusArea: this.preferences.focusArea,
                    language: this.preferences.language
                }
            };
            
            const response = await chrome.runtime.sendMessage({
                action: 'summarizeArticle',
                data: summaryRequest
            });
            
            if (response.success) {
                this.currentSummary = response.summary;
                this.displaySummary(response.summary);
                this.showSummaryState();
            } else {
                throw new Error(response.error || 'Failed to generate summary');
            }
        } catch (error) {
            console.error('Summarization error:', error);
            this.showErrorState(error.message);
        }
    }
    
    displaySummary(summary) {
        // Display main summary
        this.summaryText.textContent = summary.summary || summary.main_summary;
        
        // Display highlights
        this.highlightsList.innerHTML = '';
        if (summary.highlights && Array.isArray(summary.highlights)) {
            summary.highlights.forEach(highlight => {
                const li = document.createElement('li');
                li.textContent = highlight;
                this.highlightsList.appendChild(li);
            });
        }
        
        // Display insights if available
        if (summary.insights) {
            this.insightsText.textContent = summary.insights;
            this.insightsSection.style.display = 'block';
        } else {
            this.insightsSection.style.display = 'none';
        }
    }
    
    async regenerateSummary() {
        await this.summarizeArticle();
    }
    
    async savePreferences() {
        this.preferences = {
            summaryLength: this.summaryLength.value,
            focusArea: this.focusArea.value,
            language: this.language.value,
            autoSummarize: this.autoSummarize.checked
        };
        
        try {
            await chrome.storage.sync.set(this.preferences);
            this.hideSettings();
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }
    
    provideFeedback(type) {
        // Reset button states
        this.thumbsUp.classList.remove('active');
        this.thumbsDown.classList.remove('active');
        
        // Activate clicked button
        if (type === 'positive') {
            this.thumbsUp.classList.add('active');
        } else {
            this.thumbsDown.classList.add('active');
        }
        
        // Store feedback (could be sent to analytics)
        if (this.currentSummary && this.currentArticle) {
            chrome.storage.local.set({
                [`feedback_${Date.now()}`]: {
                    type,
                    article: this.currentArticle.url,
                    summary: this.currentSummary,
                    timestamp: Date.now()
                }
            });
        }
    }
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    }
    
    // State management methods
    showLoadingState() {
        this.hideAllStates();
        this.loadingState.style.display = 'flex';
    }
    
    showNoArticleState() {
        this.hideAllStates();
        this.noArticleState.style.display = 'block';
    }
    
    showSummaryState() {
        this.hideAllStates();
        this.summaryState.style.display = 'block';
    }
    
    showErrorState(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.style.display = 'block';
    }
    
    hideAllStates() {
        this.loadingState.style.display = 'none';
        this.noArticleState.style.display = 'none';
        this.summaryState.style.display = 'none';
        this.errorState.style.display = 'none';
    }
    
    showSettings() {
        this.settingsPanel.style.display = 'block';
    }
    
    hideSettings() {
        this.settingsPanel.style.display = 'none';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidePanelApp();
});