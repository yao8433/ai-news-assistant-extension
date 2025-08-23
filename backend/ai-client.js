// AI client module adapted from your Python utility
const cloudscraper = require('cloudscraper');

class AINewsClient {
    constructor() {
        this.API_URL = 'https://enjoyed-boss-grouse.ngrok-free.app/v1/chat/completions';
        this.BEARER_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSJdLCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsImNsaWVudF9pZCI6ImFwcF9YOHpZNnZXMnBROXRSM2RFN25LMWpMNWdIIiwiZXhwIjoxNzU2NDMwODEwLCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1keUdxajI0OW9ualNUNUZTVkJUeUN4WHkiLCJ1c2VyX2lkIjoidXNlci1QOU5acWdCMEtmSXFscmE4NEh6eG9BWnEifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9wcm9maWxlIjp7ImVtYWlsIjoieGlhbmd6aGUueWFvQHVjb25uLmVkdSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaWF0IjoxNzU1NTY2ODA5LCJpc3MiOiJodHRwczovL2F1dGgub3BlbmFpLmNvbSIsImp0aSI6ImUwNjNjOWU0LTc1MjktNDIwMC1hZTViLWRjMWFjMDRiYTQyMSIsIm5iZiI6MTc1NTU2NjgwOSwicHdkX2F1dGhfdGltZSI6MTc0NDI3MjgzNjg1MCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBwaG9uZSBlbWFpbF9jb2RlX3ZlcmlmaWNhdGlvbiIsInNjcCI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJvZmZsaW5lX2FjY2VzcyIsIm1vZGVsLnJlcXVlc3QiLCJtb2RlbC5yZWFkIiwib3JnYW5pemF0aW9uLnJlYWQiLCJvcmdhbml6YXRpb24ud3JpdGUiXSwic2Vzc2lvbl9pZCI6ImF1dGhzZXNzX3Y0d0lRM2hGTkhqbnJLbWU5aTVnVnF5cCIsInN1YiI6ImF1dGgwfDYzZGI4ZWQ4NzRmOTRhYzUyYmJlY2U0ZiJ9.6C05m0T6Xqm5XTm2QGWuCZ-XS8HaeAdbp-fi42OGAw1mpZ2znktdGjQlq5HY4UYURYMUqMFYpm42fXxYLxVSpiZovfr9MgSP-ssDGfWl9CBPNj1OL7iIBsUY7Z5lDiHgvI4V7IT4qe3lunpuTmr9yM7Csw5WCR-qr7o4X5VAVSQ6mddwnyE5GoBRKWUcbB-65NBeMtP_m7Iu08zb2dpJFg6Exed4g-XobguTWZxCDYp2iU-_EFEEiGB7TVxE4AR90BzgVB4jjxRQgYux9Tqqf6KJsHj2MUzr4CdF6uVDZuk7YevwX5NeQcepHz4vqJNVTKfvkUn7Z-J8f_vfxK9nQNXd-bdQjCQZ92mHQ-tUEZiUspY-G17y1XUfVXFg2_8JIQQitnwB6L4jPARfqmygeqqOX4KM10jQrAkkFRLMsQEx5Kqij2j4v2PZ6HvPpYRdEje7Gc6FMBdvfHuiTg6yAZlr2hm_WGCkuReaQqV6yuUKFQYENcKfJs7NrhEw8M-5LUhNMkk1RQ_RWAmipoy6aTLDiWAo5ZW77U2LjucRdw50dYL1P-y_QRYIuPN_pS_n-P_ZkOPjl-d29OuIcLBmzlZMesAtwa0DNXjrq_XN0DPrrSUOsqq9WhC1i6d-4g1Jy3xMHcLYzJUzojk-mDpMc4An_v5iAMCXrbjVlv0n_EY';
        this.scraper = cloudscraper.defaults({
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AINewsAssistant/1.0)'
            }
        });
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

    async getChatCompletion(messageContent, model = 'o3') {
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
            model: model,
            messages: [{ role: 'user', content: messageContent }],
            stream: false
        };

        try {
            const startTime = Date.now();
            console.log(`Starting AI request with model: ${model}`);
            
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