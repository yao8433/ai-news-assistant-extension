// Utility functions for AI News Assistant
class NewsUtils {
    static formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    }
    
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    static extractDomain(url) {
        if (!url) return '';
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return '';
        }
    }
    
    static getReadingTime(content) {
        if (!content) return 0;
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
    
    static sanitizeContent(content) {
        if (!content) return '';
        
        // Remove excessive whitespace
        content = content.replace(/\s+/g, ' ').trim();
        
        // Remove common navigation elements that might have been scraped
        const unwantedPhrases = [
            'Subscribe to our newsletter',
            'Sign up for our newsletter',
            'Follow us on',
            'Share this article',
            'Advertisement',
            'Cookie Policy',
            'Privacy Policy',
            'Terms of Service'
        ];
        
        unwantedPhrases.forEach(phrase => {
            const regex = new RegExp(phrase, 'gi');
            content = content.replace(regex, '');
        });
        
        return content.trim();
    }
    
    static isValidArticle(articleData) {
        const { title, content } = articleData;
        
        // Check minimum requirements
        if (!title || title.length < 10) return false;
        if (!content || content.length < 200) return false;
        
        // Check if content seems to be actual article content
        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount < 50) return false;
        
        // Check if title and content have reasonable relationship
        const titleWords = title.toLowerCase().split(/\s+/);
        const contentLower = content.toLowerCase();
        const titleWordsInContent = titleWords.filter(word => 
            word.length > 3 && contentLower.includes(word)
        ).length;
        
        // At least some title words should appear in content
        return titleWordsInContent >= Math.min(2, Math.floor(titleWords.length * 0.3));
    }
    
    static detectLanguage(text) {
        if (!text) return 'english';
        
        // Simple language detection based on common words
        const languagePatterns = {
            spanish: /\b(el|la|de|que|y|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|una|del|al|ya|está|muy|todo|pero|más|hace|sí|puede|ir|si|bien|año|años|cada|donde|cuando|hasta|sin|sobre|también|después|vida|parte|mundo|gran|otros|mismo|mejor|puede|estar|ejemplo|entre|casi|algunos|tanto|menos|durante|embargo|manera|aquí|sido)\b/gi,
            french: /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|par|grand|quand|elle|si|deux|comment|mais|autre|bien|où|sans|peut|sous|aller|temps|très|savoir|falloir|après|moins|donner|car|entre|pendant|avant|selon|contre|jusqu'|depuis|alors|tant)\b/gi,
            german: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|noch|wie|einem|um|am|sind|jedoch|einen|war|ja|bis|zur|haben|seiner|über|mehr|diese|so|zum|können|durch|man|oder|vom|gegen|seit|ohne|zwischen)\b/gi,
            chinese: /[\u4e00-\u9fff]/g
        };
        
        let maxMatches = 0;
        let detectedLanguage = 'english';
        
        for (const [lang, pattern] of Object.entries(languagePatterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLanguage = lang;
            }
        }
        
        // If we have significant matches (more than 5), use detected language
        return maxMatches > 5 ? detectedLanguage : 'english';
    }
    
    static generateFallbackSummary(articleData) {
        const { title, content } = articleData;
        
        // Extract first few sentences as summary
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const summary = sentences.slice(0, 3).join('. ') + '.';
        
        // Generate simple highlights
        const highlights = [];
        
        // Look for numbers/statistics
        const numbers = content.match(/\d{1,3}(,\d{3})*(\.\d+)?(%|billion|million|thousand|percent)/gi);
        if (numbers) {
            highlights.push(`Key figures: ${numbers.slice(0, 2).join(', ')}`);
        }
        
        // Look for quoted text
        const quotes = content.match(/"[^"]{20,100}"/g);
        if (quotes) {
            highlights.push(quotes[0].replace(/"/g, ''));
        }
        
        // Add generic highlight if we don't have enough
        if (highlights.length === 0) {
            highlights.push('Detailed analysis available in full article');
        }
        
        return {
            title,
            summary: summary || 'Summary generation in progress...',
            highlights: highlights.slice(0, 3),
            insights: 'AI-powered insights will be available once processing completes.',
            metadata: {
                type: 'fallback',
                timestamp: new Date().toISOString()
            }
        };
    }
    
    static debounce(func, wait) {
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
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    static logEvent(event, data = {}) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const logEntry = {
                event,
                data,
                timestamp: Date.now(),
                url: window.location?.href || 'unknown'
            };
            
            chrome.storage.local.get(['analytics_logs'], (result) => {
                const logs = result.analytics_logs || [];
                logs.push(logEntry);
                
                // Keep only last 100 entries
                if (logs.length > 100) {
                    logs.splice(0, logs.length - 100);
                }
                
                chrome.storage.local.set({ analytics_logs: logs });
            });
        }
    }
}

// Storage utilities
class StorageUtils {
    static async get(key, defaultValue = null) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key] !== undefined ? result[key] : defaultValue);
            });
        });
    }
    
    static async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    
    static async getLocal(key, defaultValue = null) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] !== undefined ? result[key] : defaultValue);
            });
        });
    }
    
    static async setLocal(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    
    static async clearExpired(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (items) => {
                const now = Date.now();
                const keysToRemove = [];
                
                Object.keys(items).forEach(key => {
                    if (key.startsWith('article_') && items[key].timestamp) {
                        if (now - items[key].timestamp > maxAge) {
                            keysToRemove.push(key);
                        }
                    }
                });
                
                if (keysToRemove.length > 0) {
                    chrome.storage.local.remove(keysToRemove, () => {
                        console.log(`Cleaned up ${keysToRemove.length} expired articles`);
                        resolve(keysToRemove.length);
                    });
                } else {
                    resolve(0);
                }
            });
        });
    }
}

// Make utilities available globally
if (typeof window !== 'undefined') {
    window.NewsUtils = NewsUtils;
    window.StorageUtils = StorageUtils;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsUtils, StorageUtils };
}