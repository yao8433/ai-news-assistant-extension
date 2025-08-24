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
        console.log('SidePanel: Displaying summary with data:', summary);
        
        // Check if this is a video analysis - comprehensive detection
        const isVideoAnalysis = summary.analysis_type === 'video' || 
                               summary.video_analysis || 
                               summary.content_type === 'video' ||
                               summary.type === 'video' ||
                               (typeof summary.summary === 'string' && (
                                   summary.summary.includes('Video Analysis') ||
                                   summary.summary.includes('## Video Analysis') ||
                                   summary.summary.includes('🎬') ||
                                   summary.summary.includes('video content') ||
                                   summary.summary.includes('Video content')
                               ));
        
        if (isVideoAnalysis) {
            this.displayVideoAnalysis(summary);
            return;
        }
        
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
    
    displayVideoAnalysis(summary) {
        console.log('SidePanel: Displaying video analysis');
        
        // Create video analysis container if it doesn't exist
        let videoContainer = document.getElementById('videoAnalysisContainer');
        if (!videoContainer) {
            videoContainer = this.createVideoAnalysisContainer();
        }
        
        // Parse the video analysis content - handle multiple formats
        let analysisContent = summary.summary || summary.content || summary.analysis || '';
        
        console.log('SidePanel: Video analysis content:', analysisContent.substring(0, 200) + '...');
        
        // Clear existing content
        videoContainer.innerHTML = '';
        
        // Add video analysis header
        const header = document.createElement('div');
        header.className = 'video-analysis-header';
        header.innerHTML = `
            <div class="video-icon">🎬</div>
            <h2>Video Analysis</h2>
            <div class="analysis-type">Comprehensive Analysis</div>
        `;
        videoContainer.appendChild(header);
        
        // Parse and display different sections
        const sections = this.parseVideoAnalysisSections(analysisContent);
        
        sections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'video-analysis-section';
            
            const titleEl = document.createElement('h3');
            titleEl.textContent = section.title;
            titleEl.className = 'section-title';
            sectionEl.appendChild(titleEl);
            
            const contentEl = document.createElement('div');
            contentEl.className = 'section-content';
            contentEl.innerHTML = this.formatSectionContent(section.content);
            sectionEl.appendChild(contentEl);
            
            videoContainer.appendChild(sectionEl);
        });
        
        // Show the video container
        videoContainer.style.display = 'block';
        
        // Hide standard summary sections since we're showing video analysis
        this.summaryText.style.display = 'none';
        this.highlightsList.parentElement.style.display = 'none';
        this.insightsSection.style.display = 'none';
    }
    
    createVideoAnalysisContainer() {
        const container = document.createElement('div');
        container.id = 'videoAnalysisContainer';
        container.className = 'video-analysis-container';
        
        // Insert after the summary controls
        const summaryControls = document.querySelector('.summary-controls');
        if (summaryControls) {
            summaryControls.parentNode.insertBefore(container, summaryControls.nextSibling);
        } else {
            // Fallback: append to summary state
            const summaryState = document.getElementById('summaryState');
            if (summaryState) {
                summaryState.appendChild(container);
            }
        }
        
        return container;
    }
    
    parseVideoAnalysisSections(content) {
        const sections = [];
        
        // Define section patterns to match the backend response
        const sectionPatterns = [
            { title: 'Video Analysis', pattern: /## Video Analysis[\s\S]*?(?=##|$)/ },
            { title: 'Key Topics', pattern: /## Key Topics[\s\S]*?(?=##|$)/ },
            { title: 'Comprehensive Analysis', pattern: /## Comprehensive Analysis[\s\S]*?(?=##|$)/ },
            { title: 'Executive Summary', pattern: /## Executive Summary[\s\S]*?(?=##|$)/ },
            { title: 'Key Insights', pattern: /## Key Insights[\s\S]*?(?=##|$)/ },
            { title: 'Market Impact Analysis', pattern: /## Market Impact Analysis[\s\S]*?(?=##|$)/ },
            { title: 'Regulatory and Policy Implications', pattern: /## Regulatory and Policy Implications[\s\S]*?(?=##|$)/ },
            { title: 'Investment Considerations', pattern: /## Investment Considerations[\s\S]*?(?=##|$)/ },
            { title: 'Timeline and Context', pattern: /## Timeline and Context[\s\S]*?(?=##|$)/ },
            { title: 'Long-term Implications', pattern: /## Long-term Implications[\s\S]*?(?=##|$)/ }
        ];
        
        sectionPatterns.forEach(({ title, pattern }) => {
            const match = content.match(pattern);
            if (match) {
                const sectionContent = match[0]
                    .replace(`## ${title}`, '')
                    .trim();
                
                if (sectionContent.length > 0) {
                    sections.push({
                        title: title,
                        content: sectionContent
                    });
                }
            }
        });
        
        // If no sections found, try alternative parsing or treat as single section
        if (sections.length === 0 && content.trim()) {
            // Try to parse different formats
            const lines = content.split('\n');
            let currentSection = null;
            let currentContent = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Check for potential section headers (various formats)
                if (trimmedLine.match(/^(Video Analysis|Key Topics|Comprehensive Analysis|Executive Summary|Key Insights|Market Impact|Investment|Timeline|Long-term)/i) ||
                    trimmedLine.match(/^\*\*(Video Analysis|Key Topics|Comprehensive Analysis|Executive Summary|Key Insights|Market Impact|Investment|Timeline|Long-term)/) ||
                    trimmedLine.match(/^#+ ?(Video Analysis|Key Topics|Comprehensive Analysis|Executive Summary|Key Insights|Market Impact|Investment|Timeline|Long-term)/)) {
                    
                    // Save previous section
                    if (currentSection && currentContent.length > 0) {
                        sections.push({
                            title: currentSection,
                            content: currentContent.join('\n').trim()
                        });
                    }
                    
                    // Start new section
                    currentSection = trimmedLine
                        .replace(/^#+\s*/, '')      // Remove markdown headers
                        .replace(/^\*\*/, '')       // Remove bold markers
                        .replace(/\*\*$/, '')       // Remove closing bold markers
                        .replace(/^-\s*/, '')       // Remove list markers
                        .trim();
                    currentContent = [];
                } else if (trimmedLine.length > 0) {
                    currentContent.push(line);
                }
            }
            
            // Add the last section
            if (currentSection && currentContent.length > 0) {
                sections.push({
                    title: currentSection,
                    content: currentContent.join('\n').trim()
                });
            }
            
            // If still no sections found, treat the entire content as a single section
            if (sections.length === 0) {
                sections.push({
                    title: 'Video Analysis',
                    content: content
                });
            }
        }
        
        console.log('SidePanel: Parsed sections:', sections.map(s => s.title));
        
        return sections;
    }
    
    formatSectionContent(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic text
            .replace(/^- (.*$)/gm, '<li>$1</li>')              // List items
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')          // Numbered list items
            .replace(/\n\n/g, '</p><p>')                       // Paragraphs
            .replace(/\n/g, '<br>');                           // Line breaks
        
        // Wrap list items in ul tags
        formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
        
        // Wrap in paragraphs if not already wrapped
        if (!formatted.includes('<p>') && !formatted.includes('<ul>')) {
            formatted = `<p>${formatted}</p>`;
        }
        
        return formatted;
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