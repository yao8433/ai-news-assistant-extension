// Unit tests for backend server functionality
const request = require('supertest');
const express = require('express');

// Mock the AI client to avoid real API calls in tests
jest.mock('../../backend/ai-client');

describe('Backend Server', () => {
  let app;
  let server;

  beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.BEARER_TOKEN = 'test-token-123';
    process.env.API_URL = 'https://test-api.example.com/v1/chat/completions';
    
    // Import server after setting environment variables
    app = require('../../backend/server');
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Health Endpoints', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });

    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Configuration Endpoint', () => {
    test('GET /api/config should return supported options', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect(200);

      expect(response.body.supportedLanguages).toBeDefined();
      expect(response.body.focusAreas).toBeDefined();
      expect(response.body.summaryLengths).toBeDefined();

      // Check structure of language options
      expect(Array.isArray(response.body.supportedLanguages)).toBe(true);
      expect(response.body.supportedLanguages[0]).toHaveProperty('value');
      expect(response.body.supportedLanguages[0]).toHaveProperty('label');

      // Check for required options
      const languages = response.body.supportedLanguages.map(l => l.value);
      expect(languages).toContain('english');
      expect(languages).toContain('spanish');
      expect(languages).toContain('french');

      const focusAreas = response.body.focusAreas.map(f => f.value);
      expect(focusAreas).toContain('general');
      expect(focusAreas).toContain('economic');
      expect(focusAreas).toContain('political');

      const summaryLengths = response.body.summaryLengths.map(s => s.value);
      expect(summaryLengths).toContain('short');
      expect(summaryLengths).toContain('medium');
      expect(summaryLengths).toContain('detailed');
    });
  });

  describe('Summarization Endpoint', () => {
    const mockArticleData = {
      title: 'Test Article Title',
      content: 'This is a test article with sufficient length to pass validation. It contains multiple sentences and provides enough content for meaningful summarization. The article discusses various topics and provides detailed information about the subject matter.',
      author: 'Test Author',
      date: '2024-01-01',
      url: 'https://example.com/test-article',
      preferences: {
        summaryLength: 'medium',
        focusArea: 'general',
        language: 'english'
      }
    };

    test('POST /api/summarize should validate required fields', async () => {
      // Test missing title
      const response1 = await request(app)
        .post('/api/summarize')
        .send({ content: 'test content' })
        .expect(400);

      expect(response1.body.error).toContain('Missing required fields');

      // Test missing content
      const response2 = await request(app)
        .post('/api/summarize')
        .send({ title: 'Test Title' })
        .expect(400);

      expect(response2.body.error).toContain('Missing required fields');
    });

    test('POST /api/summarize should validate content length', async () => {
      // Test content too short
      const response = await request(app)
        .post('/api/summarize')
        .send({
          title: 'Test Title',
          content: 'Short content'
        })
        .expect(400);

      expect(response.body.error).toContain('too short');
    });

    test('POST /api/summarize should handle content truncation', async () => {
      const longContent = 'A'.repeat(60000); // Exceed 50000 char limit
      
      // Mock the AI client for this test
      const AINewsClient = require('../../backend/ai-client');
      const mockSummarize = jest.fn().mockResolvedValue({
        title: 'Test Article',
        summary: 'Test summary',
        highlights: ['Point 1', 'Point 2'],
        insights: 'Test insights',
        metadata: { length: 'medium' }
      });
      AINewsClient.mockImplementation(() => ({
        summarizeArticle: mockSummarize
      }));

      await request(app)
        .post('/api/summarize')
        .send({
          title: 'Test Title',
          content: longContent,
          preferences: { summaryLength: 'medium' }
        })
        .expect(200);

      // Verify that the content was truncated in the AI client call
      expect(mockSummarize).toHaveBeenCalled();
      const callArgs = mockSummarize.mock.calls[0][0];
      expect(callArgs.content.length).toBeLessThanOrEqual(50003); // 50000 + '...'
    });

    test('POST /api/summarize should use default preferences', async () => {
      // Mock the AI client
      const AINewsClient = require('../../backend/ai-client');
      const mockSummarize = jest.fn().mockResolvedValue({
        title: 'Test Article',
        summary: 'Test summary',
        highlights: ['Point 1'],
        insights: 'Test insights',
        metadata: { length: 'medium' }
      });
      AINewsClient.mockImplementation(() => ({
        summarizeArticle: mockSummarize
      }));

      await request(app)
        .post('/api/summarize')
        .send({
          title: 'Test Title',
          content: mockArticleData.content
        })
        .expect(200);

      // Check that default preferences were applied
      expect(mockSummarize).toHaveBeenCalled();
      const preferences = mockSummarize.mock.calls[0][1];
      expect(preferences.summaryLength).toBe('medium');
      expect(preferences.focusArea).toBe('general');
      expect(preferences.language).toBe('english');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.path).toBe('/unknown-endpoint');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/summarize')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for helmet security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Rate limit headers should be present
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });
});