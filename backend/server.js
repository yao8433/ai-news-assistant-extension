// Express server for AI News Assistant Chrome Extension
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const AINewsClient = require('./ai-client');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow chrome extension connections
    crossOriginEmbedderPolicy: false
}));

// CORS configuration for Chrome extension security
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['chrome-extension://', 'moz-extension://'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin starts with allowed extension protocols
        const isAllowed = allowedOrigins.some(allowedOrigin => 
            origin.startsWith(allowedOrigin)
        );
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Rate limiting with configurable settings
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize AI client
let aiClient = new AINewsClient();

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Update AI client configuration
app.post('/api/config/ai', async (req, res) => {
    try {
        const { apiUrl, bearerToken, defaultModel, fallbackModel } = req.body;
        
        if (!apiUrl || !bearerToken) {
            return res.status(400).json({
                error: 'API URL and Bearer Token are required'
            });
        }
        
        // Create new AI client with updated configuration
        aiClient = new AINewsClient(apiUrl, bearerToken, defaultModel, fallbackModel);
        
        res.json({
            message: 'AI client configuration updated successfully',
            config: {
                apiUrl: apiUrl.replace(/\/[^/]*$/, '/***'), // Mask URL for security
                defaultModel: defaultModel || 'gpt-4',
                fallbackModel: fallbackModel || ''
            }
        });
        
    } catch (error) {
        console.error('Configuration update error:', error);
        res.status(500).json({
            error: 'Failed to update AI client configuration',
            details: error.message
        });
    }
});

// Main summarization endpoint
app.post('/api/summarize', async (req, res) => {
    try {
        let { title, content, author, date, url, preferences, apiConfig } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                error: 'Missing required fields: title and content are required'
            });
        }

        // Validate content length
        if (content.length < 100) {
            return res.status(400).json({
                error: 'Article content too short for meaningful summarization'
            });
        }

        if (content.length > 50000) {
            // Truncate very long content
            content = content.substring(0, 50000) + '...';
            console.log(`Content truncated to 50000 characters for processing`);
        }

        // Default preferences
        const defaultPreferences = {
            summaryLength: 'medium',
            focusArea: 'general',
            language: 'english'
        };

        const finalPreferences = { ...defaultPreferences, ...preferences };
        
        // If API config is provided, create a temporary client
        let clientToUse = aiClient;
        if (apiConfig && apiConfig.apiUrl && apiConfig.bearerToken) {
            console.log('Using custom API configuration for this request');
            clientToUse = new AINewsClient(apiConfig.apiUrl, apiConfig.bearerToken, apiConfig.defaultModel, apiConfig.fallbackModel);
        }

        console.log(`Summarizing article: "${title}" (${content.length} chars) with preferences:`, finalPreferences);

        // Article data object
        const articleData = {
            title,
            content,
            author: author || '',
            date: date || '',
            url: url || ''
        };

        // Generate summary using AI client
        const startTime = Date.now();
        const summary = await clientToUse.summarizeArticle(articleData, finalPreferences);
        const duration = Date.now() - startTime;

        console.log(`Summary generated in ${duration}ms`);

        // Add timing metadata
        summary.metadata = {
            ...summary.metadata,
            processingTime: duration,
            timestamp: new Date().toISOString(),
            originalLength: content.length
        };

        res.json(summary);

    } catch (error) {
        console.error('Summarization API error:', error);
        
        // Determine error type and status code
        let statusCode = 500;
        let errorMessage = 'Internal server error during summarization';

        if (error.message.includes('Bearer token')) {
            statusCode = 401;
            errorMessage = 'API authentication failed';
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
            statusCode = 429;
            errorMessage = 'API rate limit exceeded, please try again later';
        } else if (error.message.includes('timeout')) {
            statusCode = 504;
            errorMessage = 'Request timeout, please try again';
        }

        res.status(statusCode).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test endpoint for development
app.post('/api/test', async (req, res) => {
    try {
        const testData = {
            title: 'Test Article: Market Update',
            content: 'This is a test article about market conditions. The stock market has seen significant changes today with major indices showing mixed results. Technology stocks led the decline while energy sectors showed gains. Analysts are watching for upcoming economic indicators that could influence future market direction.',
            author: 'Test Author',
            date: new Date().toISOString(),
            url: 'https://example.com/test'
        };

        const preferences = req.body.preferences || {
            summaryLength: 'medium',
            focusArea: 'economic',
            language: 'english'
        };

        const summary = await aiClient.summarizeArticle(testData, preferences);
        
        res.json({
            message: 'Test successful',
            testData,
            preferences,
            summary
        });

    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            error: 'Test failed',
            details: error.message
        });
    }
});

// Get supported languages and focus areas
app.get('/api/config', (req, res) => {
    res.json({
        supportedLanguages: [
            { value: 'english', label: 'English' },
            { value: 'spanish', label: 'Spanish' },
            { value: 'french', label: 'French' },
            { value: 'german', label: 'German' },
            { value: 'chinese', label: 'Chinese' }
        ],
        focusAreas: [
            { value: 'general', label: 'General' },
            { value: 'economic', label: 'Economic' },
            { value: 'political', label: 'Political' },
            { value: 'social', label: 'Social' },
            { value: 'technology', label: 'Technology' }
        ],
        summaryLengths: [
            { value: 'short', label: 'Short (2-3 sentences)' },
            { value: 'medium', label: 'Medium (3-4 sentences)' },
            { value: 'detailed', label: 'Detailed (5-7 sentences)' }
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Express error:', error);
    res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AI News Assistant Backend Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoint: http://localhost:${PORT}/api/summarize`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app;