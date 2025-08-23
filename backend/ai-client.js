// AI client module adapted from your Python utility
const cloudscraper = require('cloudscraper');

class AINewsClient {
    constructor() {
        // Load configuration from environment variables with fallback defaults
        this.API_URL = process.env.API_URL || 'https://enjoyed-boss-grouse.ngrok-free.app/v1/chat/completions';
        this.BEARER_TOKEN = process.env.BEARER_TOKEN;
        this.DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'o3';
        this.FALLBACK_MODEL = process.env.FALLBACK_MODEL || 'o1-high';
        
        // Validate required credentials
        if (!this.BEARER_TOKEN) {
            throw new Error('BEARER_TOKEN environment variable is required. Please check your .env file.');
        }
        
        this.scraper = cloudscraper.defaults({
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AINewsAssistant/1.0)'
            }
        });
        
        console.log('AI Client initialized with API URL:', this.API_URL.replace(/\/[^/]*$/, '/***'));
    }

    generateSummaryPrompt(articleData, preferences) {
        const { title, content, author, date } = articleData;
        const { summaryLength, focusArea, language } = preferences;

        // Build the prompt based on the design specification
        let prompt = `You are an AI-powered news summarizer for a Chrome extension. The user is reading an article from a news website, and your task is to summarize it based on the content provided.

**Summary Guidelines**:
1. **Title**: Extract the title of the article.
2. **Main Summary**: 
   - Provide a concise summary of the article's core points.
   - Focus on the most important facts, key insights, or developments.
   - Use the first 1-2 paragraphs to identify the main issue or subject of the article.
3. **Highlights**: 
   - Include specific data points, key statistics, or notable quotes if available.
   - For economic articles, include important financial figures (e.g., price changes, growth rates, or market impacts).
4. **Optional Insights**: 
   - Provide an extra line or two explaining the context or potential implications of the article.
5. **Length of Summary**: `;

        // Add length-specific instructions
        switch (summaryLength) {
            case 'short':
                prompt += `
   - Provide a SHORT summary: only focus on the main topic and one key fact or outcome (2-3 sentences max).`;
                break;
            case 'detailed':
                prompt += `
   - Provide a DETAILED summary: include a broader overview, more statistics, key insights, and implications (5-7 sentences).`;
                break;
            default: // medium
                prompt += `
   - Provide a MEDIUM summary: balance between brevity and detail (3-4 sentences).`;
        }

        // Add focus area instructions
        switch (focusArea) {
            case 'economic':
                prompt += `
6. **Focus Area**: ECONOMIC - emphasize financial trends, market changes, inflation data, and economic outlook.`;
                break;
            case 'political':
                prompt += `
6. **Focus Area**: POLITICAL - highlight relevant government actions, policy shifts, or international relations.`;
                break;
            case 'social':
                prompt += `
6. **Focus Area**: SOCIAL - focus on societal impacts, public reactions, and community effects.`;
                break;
            case 'technology':
                prompt += `
6. **Focus Area**: TECHNOLOGY - emphasize technological developments, innovation, and digital trends.`;
                break;
            default:
                prompt += `
6. **Focus Area**: GENERAL - provide a balanced overview covering all important aspects.`;
        }

        // Add language instruction
        prompt += `
7. **Language**: Provide the summary in ${language.charAt(0).toUpperCase() + language.slice(1)}.

---

**Article to Summarize**:
**Title**: ${title}
**Author**: ${author || 'Not specified'}
**Date**: ${date || 'Not specified'}

**Content**:
${content}

---

**Required Output Format** (return as valid JSON):
{
    "title": "${title}",
    "summary": "Main summary text here...",
    "highlights": [
        "First key highlight",
        "Second key highlight", 
        "Third key highlight"
    ],
    "insights": "Additional context or implications...",
    "metadata": {
        "length": "${summaryLength}",
        "focus": "${focusArea}",
        "language": "${language}"
    }
}

Please ensure the response is valid JSON that can be parsed.`;

        return prompt;
    }

    async getChatCompletion(messageContent, model = null) {
        // Use provided model or default from environment
        const selectedModel = model || this.DEFAULT_MODEL;
        if (!this.BEARER_TOKEN) {
            throw new Error('Bearer token not found');
        }

        const headers = {
            'Authorization': `Bearer ${this.BEARER_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; AINewsAssistant/1.0)'
        };

        const data = {
            model: selectedModel,
            messages: [{ role: 'user', content: messageContent }],
            stream: false
        };

        try {
            const startTime = Date.now();
            console.log(`Starting AI request with model: ${selectedModel}`);
            
            const response = await this.scraper({
                method: 'POST',
                url: this.API_URL,
                headers: headers,
                body: JSON.stringify(data)
            });

            const duration = Date.now() - startTime;
            console.log(`AI request completed in ${duration}ms`);

            const responseData = JSON.parse(response);
            const assistantReply = responseData.choices[0].message.content;

            return assistantReply;

        } catch (error) {
            console.error('AI API Error:', error);
            if (error.response) {
                console.error('Response content:', error.response);
            }
            throw error;
        }
    }

    async summarizeArticle(articleData, preferences) {
        try {
            const prompt = this.generateSummaryPrompt(articleData, preferences);
            const rawResponse = await this.getChatCompletion(prompt);
            
            // Try to parse as JSON first
            try {
                const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const summary = JSON.parse(jsonMatch[0]);
                    return summary;
                }
            } catch (parseError) {
                console.log('JSON parsing failed, using fallback parsing');
            }
            
            // Fallback parsing if JSON parsing fails
            return this.parseNonJsonResponse(rawResponse, articleData, preferences);
            
        } catch (error) {
            console.error('Summarization error:', error);
            throw new Error(`Failed to summarize article: ${error.message}`);
        }
    }

    parseNonJsonResponse(response, articleData, preferences) {
        // Fallback parser for non-JSON responses
        const lines = response.split('\n').filter(line => line.trim());
        
        let summary = '';
        let highlights = [];
        let insights = '';
        
        // Simple heuristic parsing
        const summaryStart = response.indexOf('Summary') || response.indexOf('summary') || 0;
        const highlightsStart = response.indexOf('Highlights') || response.indexOf('highlights') || response.indexOf('Key');
        const insightsStart = response.indexOf('Insights') || response.indexOf('insights') || response.indexOf('Context');
        
        if (summaryStart >= 0 && highlightsStart > summaryStart) {
            summary = response.substring(summaryStart, highlightsStart).replace(/Summary:?/i, '').trim();
        } else if (summaryStart >= 0) {
            summary = response.substring(summaryStart, Math.min(response.length, summaryStart + 500)).replace(/Summary:?/i, '').trim();
        } else {
            // Use first few sentences as summary
            const sentences = response.split('.').slice(0, 3);
            summary = sentences.join('.') + '.';
        }
        
        // Extract bullet points as highlights
        const bulletPoints = response.match(/[-•*]\s+([^\n]+)/g);
        if (bulletPoints) {
            highlights = bulletPoints.map(point => point.replace(/[-•*]\s+/, '').trim()).slice(0, 5);
        }
        
        // Basic insights extraction
        if (insightsStart > 0) {
            insights = response.substring(insightsStart).replace(/Insights:?/i, '').trim().split('.').slice(0, 2).join('.') + '.';
        }
        
        return {
            title: articleData.title,
            summary: summary || response.substring(0, 300) + '...',
            highlights: highlights.length > 0 ? highlights : ['Key information extracted from the article'],
            insights: insights || 'Additional context available in the full article.',
            metadata: {
                length: preferences.summaryLength,
                focus: preferences.focusArea,
                language: preferences.language
            }
        };
    }
}

module.exports = AINewsClient;