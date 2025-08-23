// Unit tests for news sites configuration
const NEWS_SITES_CONFIG = require('../../src/news-sites-config');

describe('NEWS_SITES_CONFIG', () => {
  describe('siteSelectors', () => {
    test('should have selectors for major news sites', () => {
      expect(NEWS_SITES_CONFIG.siteSelectors).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['bloomberg.com']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['reuters.com']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['bbc.com']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['cnn.com']).toBeDefined();
    });

    test('should have required selector fields for each site', () => {
      const sites = Object.keys(NEWS_SITES_CONFIG.siteSelectors);
      
      sites.forEach(site => {
        const selectors = NEWS_SITES_CONFIG.siteSelectors[site];
        expect(selectors.title).toBeDefined();
        expect(selectors.content).toBeDefined();
        expect(selectors.author).toBeDefined();
        expect(selectors.date).toBeDefined();
        
        // Check that selectors are non-empty strings
        expect(typeof selectors.title).toBe('string');
        expect(selectors.title.length).toBeGreaterThan(0);
        expect(typeof selectors.content).toBe('string');
        expect(selectors.content.length).toBeGreaterThan(0);
      });
    });

    test('should have international site coverage', () => {
      // Test key international sites
      expect(NEWS_SITES_CONFIG.siteSelectors['theguardian.com']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['lemonde.fr']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['spiegel.de']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['corriere.it']).toBeDefined();
      expect(NEWS_SITES_CONFIG.siteSelectors['elpais.com']).toBeDefined();
    });
  });

  describe('genericSelectors', () => {
    test('should provide fallback selectors', () => {
      expect(NEWS_SITES_CONFIG.genericSelectors).toBeDefined();
      expect(NEWS_SITES_CONFIG.genericSelectors.title).toBeDefined();
      expect(NEWS_SITES_CONFIG.genericSelectors.content).toBeDefined();
      expect(NEWS_SITES_CONFIG.genericSelectors.author).toBeDefined();
      expect(NEWS_SITES_CONFIG.genericSelectors.date).toBeDefined();
    });

    test('should have multiple selector options for each field', () => {
      // Generic selectors should have multiple options separated by commas
      expect(NEWS_SITES_CONFIG.genericSelectors.title).toContain(',');
      expect(NEWS_SITES_CONFIG.genericSelectors.content).toContain(',');
    });
  });

  describe('newsPatterns', () => {
    test('should contain valid regex patterns', () => {
      expect(Array.isArray(NEWS_SITES_CONFIG.newsPatterns)).toBe(true);
      expect(NEWS_SITES_CONFIG.newsPatterns.length).toBeGreaterThan(50);
      
      // Test that all patterns are RegExp objects
      NEWS_SITES_CONFIG.newsPatterns.forEach((pattern, index) => {
        expect(pattern).toBeInstanceOf(RegExp);
      });
    });

    test('should match expected news URLs', () => {
      const testUrls = [
        'https://www.bloomberg.com/news/articles/test-article',
        'https://www.reuters.com/world/article/test-story',
        'https://www.bbc.com/news/world-123456',
        'https://www.cnn.com/politics/article/test',
        'https://www.nytimes.com/business/article.html',
        'https://www.theguardian.com/world/2023/news-story',
        'https://www.lemonde.fr/politique/article/test',
        'https://www.spiegel.de/politik/article'
      ];

      testUrls.forEach(url => {
        const matches = NEWS_SITES_CONFIG.newsPatterns.some(pattern => 
          pattern.test(url)
        );
        expect(matches).toBe(true);
      });
    });

    test('should not match non-news URLs', () => {
      const nonNewsUrls = [
        'https://www.bloomberg.com/about-us',
        'https://www.reuters.com/contact',
        'https://www.bbc.com/weather',
        'https://www.google.com/search',
        'https://www.facebook.com/page'
      ];

      nonNewsUrls.forEach(url => {
        const matches = NEWS_SITES_CONFIG.newsPatterns.some(pattern => 
          pattern.test(url)
        );
        expect(matches).toBe(false);
      });
    });
  });

  describe('getHostPermissions', () => {
    test('should return array of host permission strings', () => {
      const permissions = NEWS_SITES_CONFIG.getHostPermissions();
      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(50);
      
      // Test format of permissions
      permissions.forEach(permission => {
        expect(typeof permission).toBe('string');
        expect(permission).toMatch(/^https:\/\/\*\./);
        expect(permission).toMatch(/\/\*$/);
      });
    });

    test('should include major news site domains', () => {
      const permissions = NEWS_SITES_CONFIG.getHostPermissions();
      
      expect(permissions).toContain('https://*.bloomberg.com/*');
      expect(permissions).toContain('https://*.reuters.com/*');
      expect(permissions).toContain('https://*.bbc.com/*');
      expect(permissions).toContain('https://*.nytimes.com/*');
      expect(permissions).toContain('https://*.theguardian.com/*');
    });
  });

  describe('getContentScriptMatches', () => {
    test('should return array matching host permissions', () => {
      const matches = NEWS_SITES_CONFIG.getContentScriptMatches();
      const permissions = NEWS_SITES_CONFIG.getHostPermissions();
      
      expect(matches).toEqual(permissions);
    });
  });
});