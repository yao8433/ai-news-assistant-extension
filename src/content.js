// Content script for extracting article content from news websites
(function() {
  'use strict';
  
  // Site-specific selectors for different news websites
  const siteSelectors = {
    // US Major Papers
    'bloomberg.com': {
      title: 'h1[data-module="ArticleHeader"], h1.headline, .headline__text, h1',
      content: '[data-module="ArticleBody"] .body-copy, .story-body, .body-content, .article-content, .story-content, p',
      author: '[data-module="ArticleHeader"] .author, .author, .byline, [class*="author"]',
      date: '[data-module="ArticleHeader"] time, time, .date, [class*="date"]'
    },
    'reuters.com': {
      title: 'h1[data-testid="Headline"], h1',
      content: '[data-testid="ArticleBody"] p, .ArticleBody-para, .StandardArticleBody_body p',
      author: '[data-testid="AuthorByLine"], .Author-byline',
      date: '[data-testid="ArticleTimestamp"], time'
    },
    'bbc.com': {
      title: 'h1[data-component="headline-block"], h1.story-headline, h1',
      content: '[data-component="text-block"] p, .story-body__inner p, .post__content p',
      author: '.ssrcss-68pt20-Text-TextContributorName, .byline__name',
      date: 'time, .date'
    },
    'cnn.com': {
      title: '.headline__text, h1.pg-headline, h1',
      content: '.zn-body__paragraph, .el__leafmedia--sourced-paragraph, p.paragraph',
      author: '.byline__name, .metadata__byline__author',
      date: '.timestamp, time'
    },
    'wsj.com': {
      title: 'h1.wsj-article-headline, h1.headline, h1',
      content: '.articleLead-container p, .wsj-snippet-body p, .article-content p',
      author: '[data-module="ArticleHeader"] .author-name, .byline-name',
      date: 'time, .timestamp'
    },
    'ft.com': {
      title: '.article-headline__text, h1.headline, h1',
      content: '.article__content-body p, .article-body p',
      author: '.n-content-tag--author, .byline',
      date: 'time.article-info__timestamp, time'
    },
    'nytimes.com': {
      title: 'h1[data-test-id="headline"], h1.headline, h1',
      content: '.StoryBodyCompanionColumn p, .ArticleBody-articleBody p, section[name="articleBody"] p',
      author: '.byline-author, [data-testid="byline-author"]',
      date: 'time, .timestamp'
    },
    'washingtonpost.com': {
      title: 'h1[data-qa="headline"], h1.headline, h1',
      content: '.article-body p, .paywall p',
      author: '.author-name, .by-author',
      date: 'time, .timestamp'
    },
    'usatoday.com': {
      title: 'h1.gnt_ar_hl, h1',
      content: '.gnt_ar_b p, .article-wrap p',
      author: '.gnt_ar_by, .byline',
      date: 'time, .asset-metabar-time'
    },
    // International - UK
    'theguardian.com': {
      title: 'h1[data-gu-name="headline"], h1',
      content: '.article-body-commercial-selector p, .content__article-body p',
      author: '.byline, .contributor-byline',
      date: 'time, .content__dateline-wpd'
    },
    'independent.co.uk': {
      title: 'h1.headline, h1',
      content: '.article-body p, .text p',
      author: '.author, .byline',
      date: 'time, .date'
    },
    'telegraph.co.uk': {
      title: 'h1.headline, h1',
      content: '.article-body-text p, .article-content p',
      author: '.author-name, .byline',
      date: 'time, .article-date'
    },
    'thetimes.co.uk': {
      title: 'h1.Headline, h1',
      content: '.Article-content p, .article-body p',
      author: '.Byline-author, .byline',
      date: 'time, .Article-date'
    },
    'economist.com': {
      title: 'h1.headline, h1',
      content: '.article__body-text p, .blog-post__text p',
      author: '.byline, .author',
      date: 'time, .article-info__dateline'
    },
    'dailymail.co.uk': {
      title: 'h1.headline, h1#articleTitle',
      content: '.article-text p, .articleText p',
      author: '.author, .article-header-byline',
      date: 'time, .article-timestamp'
    },
    // International - French
    'lemonde.fr': {
      title: 'h1.article__title, h1',
      content: '.article__content p, .article__paragraph',
      author: '.signature, .author__name',
      date: 'time, .meta__date'
    },
    'lefigaro.fr': {
      title: 'h1.fig-headline, h1',
      content: '.fig-content p, .article-body p',
      author: '.fig-author, .author',
      date: 'time, .fig-date'
    },
    'liberation.fr': {
      title: 'h1.article-title, h1',
      content: '.article-body p, .text p',
      author: '.author, .byline',
      date: 'time, .date'
    },
    // International - German  
    'spiegel.de': {
      title: 'h1.headline, h1 span.headline',
      content: '.article-section p, .RichText p',
      author: '.author-info, .byline',
      date: 'time, .timeformat'
    },
    'zeit.de': {
      title: 'h1.article-heading, h1',
      content: '.article-body p, .paragraph',
      author: '.byline, .author',
      date: 'time, .metadata-date'
    },
    'welt.de': {
      title: 'h1.headline, h1',
      content: '.article-body p, .text-element p',
      author: '.author, .byline',
      date: 'time, .date'
    },
    // International - Italian
    'corriere.it': {
      title: 'h1.title-art, h1',
      content: '.chapter-paragraph, .text p',
      author: '.author, .byline',
      date: 'time, .date'
    },
    'repubblica.it': {
      title: 'h1.entry-title, h1',
      content: '.entry-content p, .article p',
      author: '.author, .entry-author',
      date: 'time, .entry-date'
    },
    // International - Spanish
    'elpais.com': {
      title: 'h1.headline, h1',
      content: '.article-body p, .articulo-cuerpo p',
      author: '.author, .autor',
      date: 'time, .fecha'
    },
    'elmundo.es': {
      title: 'h1.titular, h1',
      content: '.article-body p, .ue-l-article__body p',
      author: '.author, .autor',
      date: 'time, .fecha'
    },
    // International - Dutch
    'telegraaf.nl': {
      title: 'h1.headline, h1',
      content: '.article-body p, .ArticleBodyBlocks p',
      author: '.author, .byline',
      date: 'time, .date'
    },
    'volkskrant.nl': {
      title: 'h1.headline, h1',
      content: '.article__body p, .artstyle__text p',
      author: '.author, .byline', 
      date: 'time, .article__date'
    }
  };
  
  // Generic fallback selectors
  const genericSelectors = {
    title: 'h1, .headline, .title, [class*="headline"], [class*="title"]',
    content: 'article p, .article p, .content p, .story p, [class*="article"] p, [class*="content"] p',
    author: '.author, .byline, [class*="author"], [class*="byline"]',
    date: 'time, .date, .timestamp, [class*="date"], [class*="time"]'
  };
  
  // Extract article content based on current site
  function extractArticleContent() {
    const hostname = window.location.hostname;
    const siteName = Object.keys(siteSelectors).find(site => hostname.includes(site));
    const selectors = siteName ? siteSelectors[siteName] : genericSelectors;
    
    // Extract title
    const titleElement = document.querySelector(selectors.title);
    const title = titleElement ? titleElement.textContent.trim() : document.title;
    
    // Extract content
    const contentElements = document.querySelectorAll(selectors.content);
    const content = Array.from(contentElements)
      .map(p => p.textContent.trim())
      .filter(text => text.length > 50) // Filter out short paragraphs
      .join('\n\n');
    
    // Extract author
    const authorElement = document.querySelector(selectors.author);
    const author = authorElement ? authorElement.textContent.trim() : '';
    
    // Extract date
    const dateElement = document.querySelector(selectors.date);
    const date = dateElement ? 
      (dateElement.getAttribute('datetime') || dateElement.textContent.trim()) : '';
    
    return {
      title,
      content,
      author,
      date,
      url: window.location.href,
      site: hostname
    };
  }
  
  // Check if current page is a news article
  function isNewsArticle() {
    const url = window.location.href;
    console.log('AI News Assistant: Checking URL:', url);
    
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
      /tampabay\.com\/(news|business|politics)/,
      /ajc\.com\/(news|business|politics)/,
      /baltimoresun\.com\/(news|business|politics)/,
      // US Regional & Local
      /oregonlive\.com\/(news|business|politics)/,
      /cleveland\.com\/(news|business|politics)/,
      /pennlive\.com\/(news|business|politics)/,
      /nj\.com\/(news|business|politics)/,
      /mlive\.com\/(news|business|politics)/,
      /al\.com\/(news|business|politics)/,
      /statesman\.com\/(news|business|politics)/,
      /freep\.com\/(news|business|politics)/,
      /indystar\.com\/(news|business|politics)/,
      /tennessean\.com\/(news|business|politics)/,
      /azcentral\.com\/(news|business|politics)/,
      /cincinnati\.com\/(news|business|politics)/,
      /dispatch\.com\/(news|business|politics)/,
      /courier-journal\.com\/(news|business|politics)/,
      /desmoinesregister\.com\/(news|business|politics)/,
      /detroitnews\.com\/(news|business|politics)/,
      /jacksonville\.com\/(news|business|politics)/,
      /news-press\.com\/(news|business|politics)/,
      /oklahoman\.com\/(news|business|politics)/,
      /northjersey\.com\/(news|business|politics)/,
      /houstonchronicle\.com\/(news|business|politics)/,
      /sfchronicle\.com\/(news|business|politics)/,
      /expressnews\.com\/(news|business|politics)/,
      /ctpost\.com\/(news|business|politics)/,
      /nhregister\.com\/(news|business|politics)/,
      /timesunion\.com\/(news|business|politics)/,
      /stltoday\.com\/(news|business|politics)/,
      /richmond\.com\/(news|business|politics)/,
      /buffalonews\.com\/(news|business|politics)/,
      /omaha\.com\/(news|business|politics)/,
      /journalstar\.com\/(news|business|politics)/,
      /tulsaworld\.com\/(news|business|politics)/,
      /madison\.com\/(news|business|politics)/,
      /journalnow\.com\/(news|business|politics)/,
      /miamiherald\.com\/(news|business|politics)/,
      /charlotteobserver\.com\/(news|business|politics)/,
      /kansascity\.com\/(news|business|politics)/,
      /newsobserver\.com\/(news|business|politics)/,
      /sacbee\.com\/(news|business|politics)/,
      /thestate\.com\/(news|business|politics)/,
      /kansas\.com\/(news|business|politics)/,
      /fresnobee\.com\/(news|business|politics)/,
      /star-telegram\.com\/(news|business|politics)/,
      /kentucky\.com\/(news|business|politics)/,
      /belleville\.com\/(news|business|politics)/,
      /elnuevoherald\.com\/(news|business|politics)/,
      /tri-cityherald\.com\/(news|business|politics)/,
      /denverpost\.com\/(news|business|politics)/,
      /mercurynews\.com\/(news|business|politics)/,
      /eastbaytimes\.com\/(news|business|politics)/,
      /ocregister\.com\/(news|business|politics)/,
      /sandiegouniontribune\.com\/(news|business|politics)/,
      /bostonherald\.com\/(news|business|politics)/,
      /twincities\.com\/(news|business|politics)/,
      /pe\.com\/(news|business|politics)/,
      /theadvocate\.com\/(news|business|politics)/,
      /nola\.com\/(news|business|politics)/,
      /theadvertiser\.com\/(news|business|politics)/,
      // International - Canada
      /globeandmail\.com\/(news|business|politics|world)/,
      // International - UK
      /theguardian\.com\/(news|business|politics|world|uk-news)/,
      /independent\.co\.uk\/(news|business|politics|world)/,
      /telegraph\.co\.uk\/(news|business|politics|world)/,
      /thetimes\.co\.uk\/(news|business|politics|world)/,
      /economist\.com\/(news|business|politics|world|finance)/,
      /spectator\.co\.uk\/(politics|world|business)/,
      /newstatesman\.com\/(politics|world|business)/,
      /dailymail\.co\.uk\/(news|business|politics|world)/,
      /standard\.co\.uk\/(news|business|politics|world)/,
      /inews\.co\.uk\/(news|business|politics|world)/,
      /irishtimes\.com\/(news|business|politics|world)/,
      /independent\.ie\/(news|business|politics|world)/,
      /irishexaminer\.com\/(news|business|politics|world)/,
      // International - French
      /lemonde\.fr\/(economie|politique|international|actualites)/,
      /lefigaro\.fr\/(economie|politique|international|actualites)/,
      /liberation\.fr\/(economie|politique|international|actualites)/,
      /leparisien\.fr\/(economie|politique|international|actualites)/,
      /lexpress\.fr\/(economie|politique|international|actualites)/,
      /lepoint\.fr\/(economie|politique|international|actualites)/,
      /lesechos\.fr\/(economie|politique|international|actualites)/,
      /challenges\.fr\/(economie|politique|international|actualites)/,
      /marianne\.net\/(economie|politique|international|actualites)/,
      /nouvelobs\.com\/(economie|politique|international|actualites)/,
      /ouest-france\.fr\/(economie|politique|international|actualites)/,
      /20minutes\.fr\/(economie|politique|international|actualites)/,
      // International - German
      /spiegel\.de\/(wirtschaft|politik|panorama|international)/,
      /zeit\.de\/(wirtschaft|politik|gesellschaft|international)/,
      /welt\.de\/(wirtschaft|politik|vermischtes|ausland)/,
      /faz\.net\/(wirtschaft|politik|gesellschaft|ausland)/,
      /sueddeutsche\.de\/(wirtschaft|politik|panorama|international)/,
      /handelsblatt\.com\/(politik|unternehmen|finanzen|technik)/,
      /bild\.de\/(politik|wirtschaft|news|ausland)/,
      /focus\.de\/(politik|finanzen|digital|panorama)/,
      /stern\.de\/(politik|wirtschaft|digital|panorama)/,
      /tagesspiegel\.de\/(politik|wirtschaft|gesellschaft|berlin)/,
      // International - Italian
      /corriere\.it\/(economia|politica|cronache|esteri)/,
      /repubblica\.it\/(economia|politica|cronaca|esteri)/,
      /gazzetta\.it\/(calcio|sport)/,
      /lastampa\.it\/(economia|politica|cronaca|esteri)/,
      /ilsole24ore\.com\/(economia|notizie|mondo|tecnologie)/,
      /ilpost\.it\/(mondo|italia|economia|tecnologia)/,
      /ansa\.it\/(economia|politica|cronaca|mondo)/,
      // International - Dutch/Belgian
      /telegraaf\.nl\/(nieuws|financieel|sport)/,
      /volkskrant\.nl\/(nieuws|economie|buitenland)/,
      /nrc\.nl\/(nieuws|economie|buitenland)/,
      /ad\.nl\/(nieuws|economie|buitenland)/,
      /parool\.nl\/(nieuws|economie|buitenland)/,
      /trouw\.nl\/(nieuws|economie|buitenland)/,
      /demorgen\.be\/(nieuws|economie|buitenland)/,
      /standaard\.be\/(nieuws|economie|buitenland)/,
      /lesoir\.be\/(actualite|economie|monde)/,
      /rtbf\.be\/(info|economie|monde)/,
      // International - Spanish
      /elpais\.com\/(economia|politica|internacional|espana)/,
      /elmundo\.es\/(economia|politica|internacional|espana)/,
      /abc\.es\/(economia|politica|internacional|espana)/,
      /lavanguardia\.com\/(economia|politica|internacional|espana)/,
      /elconfidencial\.com\/(economia|politica|mundo|espana)/,
      /eldiario\.es\/(economia|politica|internacional|espana)/,
      /publico\.es\/(economia|politica|internacional|espana)/,
      /expansion\.com\/(economia|empresas|mercados|tecnologia)/,
      /marca\.com\/(futbol|baloncesto|tenis|motor)/,
      /as\.com\/(futbol|baloncesto|tenis|motor)/
    ];
    
    const matchesPattern = newsPatterns.some(pattern => {
      const matches = pattern.test(url);
      console.log(`AI News Assistant: Pattern ${pattern} matches:`, matches);
      return matches;
    });
    
    const hasArticleElement = !!(document.querySelector('article, .article, [class*="article"]'));
    console.log('AI News Assistant: Has article element:', hasArticleElement);
    
    const isArticle = matchesPattern && hasArticleElement;
    console.log('AI News Assistant: Is news article:', isArticle);
    
    return isArticle;
  }
  
  // Main extraction function
  function processArticle() {
    console.log('AI News Assistant: processArticle() called');
    
    // Prevent multiple processing
    if (window.aiNewsProcessed) {
      console.log('AI News Assistant: Article already processed, skipping');
      return;
    }
    
    if (!isNewsArticle()) {
      console.log('AI News Assistant: Not a news article, skipping');
      return;
    }
    
    console.log('AI News Assistant: Extracting article content...');
    const articleData = extractArticleContent();
    console.log('AI News Assistant: Extracted data:', {
      title: articleData.title,
      contentLength: articleData.content.length,
      author: articleData.author,
      site: articleData.site
    });
    
    // Only proceed if we have substantial content
    if (articleData.content.length < 200) {
      console.log('AI News Assistant: Article content too short, skipping extraction. Length:', articleData.content.length);
      return;
    }
    
    console.log('AI News Assistant: Sending to background script...');
    
    // Check if extension context is valid before sending message
    if (!chrome.runtime?.id) {
      console.log('AI News Assistant: Extension context invalidated, skipping message');
      return;
    }
    
    // Send extracted content to background script
    chrome.runtime.sendMessage({
      action: 'extractedContent',
      data: articleData
    }).then(response => {
      console.log('AI News Assistant: Message sent successfully, response:', response);
    }).catch(error => {
      console.error('AI News Assistant: Error sending message:', error);
      // Don't throw error here as it's not critical for the main functionality
    });
    
    // Mark as processed
    window.aiNewsProcessed = true;
    
    // Add visual indicator that article was processed
    addProcessedIndicator();
    console.log('AI News Assistant: Article processed successfully');
  }
  
  // Add visual indicator
  function addProcessedIndicator() {
    if (document.getElementById('ai-news-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'ai-news-indicator';
    indicator.innerHTML = '🤖 AI Summary Available';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    // Click to show inline summary
    indicator.addEventListener('click', () => {
      console.log('AI News Assistant: Banner clicked, showing summary panel');
      showInlineSummary();
    });
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      indicator.style.opacity = '0.7';
      indicator.style.transform = 'scale(0.9)';
    }, 5000);
  }
  
  // Show Bloomberg-style right sidebar summary
  function showInlineSummary() {
    console.log('AI News Assistant: showInlineSummary() called');
    // Remove existing panel if any
    const existingPanel = document.getElementById('ai-summary-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Create Bloomberg-style right sidebar summary
    const summaryPanel = document.createElement('div');
    summaryPanel.id = 'ai-summary-panel';
    summaryPanel.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        width: 380px;
        max-height: calc(100vh - 100px);
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        font-family: 'BloombergSans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        z-index: 9999;
        overflow-y: auto;
      ">
        <!-- Header -->
        <div style="
          padding: 20px 24px;
          background: linear-gradient(135deg, #0073e6, #0056b3);
          color: white;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              width: 28px;
              height: 28px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            ">🤖</div>
            <h3 style="
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              letter-spacing: -0.01em;
            ">AI Summary</h3>
          </div>
          <button id="close-summary" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
        </div>
        
        <!-- Content -->
        <div id="summary-content" style="color: #333; line-height: 1.6;">
          <div style="
            padding: 40px 24px;
            text-align: center;
            background: #fafbfc;
          ">
            <div style="
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #0073e6, #0056b3);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              margin: 0 auto 16px auto;
              animation: pulse 2s infinite;
            ">🤖</div>
            <div style="color: #666; font-size: 15px; font-weight: 500;">Generating AI summary...</div>
          </div>
        </div>
        
        <!-- Bloomberg-style footer -->
        <div style="
          padding: 16px 24px;
          background: #f8f9fb;
          border-top: 1px solid #e8ecf0;
          border-radius: 0 0 8px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <div style="
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #0073e6, #0056b3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
          ">⚡</div>
          <span style="font-size: 12px; color: #666; font-weight: 500;">Powered by AI News Assistant</span>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        /* Smooth scroll behavior for summary panel */
        #ai-summary-panel {
          transition: all 0.3s ease-in-out;
        }
        
        /* Custom scrollbar for the summary panel */
        #ai-summary-panel::-webkit-scrollbar {
          width: 6px;
        }
        
        #ai-summary-panel::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        #ai-summary-panel::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        #ai-summary-panel::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      </style>
    `;
    
    // Add to page
    document.body.appendChild(summaryPanel);
    
    // Add close functionality
    document.getElementById('close-summary').addEventListener('click', () => {
      summaryPanel.remove();
    });
    
    // Add escape key to close
    const escapeHandler = (event) => {
      if (event.key === 'Escape') {
        summaryPanel.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Smooth entrance animation
    const panelContent = summaryPanel.querySelector('div');
    panelContent.style.transform = 'translateX(100%)';
    panelContent.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      panelContent.style.transform = 'translateX(0)';
    }, 10);
    
    // Generate summary
    generateSummary();
  }
  
  // Find the best insertion point in Bloomberg's layout
  function findBestInsertionPoint() {
    // Try multiple Bloomberg-specific selectors for where to insert the summary
    const possibleInsertionPoints = [
      // After article content
      'div[data-module="ArticleBody"]',
      '.story-body',
      'article .body-content',
      
      // After author/date info
      'div[data-module="ArticleHeader"]',
      '.article-header',
      
      // Before related content or ads
      '.story-package-module',
      '.ad-container',
      
      // Generic article end markers
      'article',
      '.article-content',
      'main .content'
    ];
    
    for (const selector of possibleInsertionPoints) {
      const element = document.querySelector(selector);
      if (element) {
        console.log('AI News Assistant: Found insertion point:', selector);
        return element;
      }
    }
    
    // Fallback: try to find any substantial text content
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length > 3) {
      return paragraphs[Math.floor(paragraphs.length * 0.7)]; // Insert after ~70% of content
    }
    
    return null;
  }
  
  // Generate and display summary
  async function generateSummary() {
    const contentElement = document.getElementById('summary-content');
    
    try {
      // Get article data from storage or extract fresh
      const articleData = extractArticleContent();
      
      // Check if extension context is valid
      if (!chrome.runtime?.id) {
        throw new Error('Extension context invalidated. Please reload the page.');
      }
      
      // Request summary from background script with proper error handling
      chrome.runtime.sendMessage({
        action: 'summarizeArticle',
        data: {
          title: articleData.title,
          content: articleData.content,
          author: articleData.author,
          date: articleData.date,
          url: articleData.url,
          preferences: {
            summaryLength: 'medium',
            focusArea: 'general',
            language: 'english'
          }
        }
      }).then((response) => {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }
        
        if (response && response.success) {
          displaySummary(response.summary);
        } else {
          displayError(response ? response.error : 'Failed to generate summary');
        }
      }).catch((error) => {
        console.error('AI News Assistant: Summary generation error:', error);
        
        let errorMessage = error.message;
        if (errorMessage.includes('Extension context invalidated') || 
            errorMessage.includes('message channel closed')) {
          errorMessage = 'Extension was reloaded. Please refresh the page and try again.';
        }
        
        displayError(errorMessage);
      });
      
    } catch (error) {
      console.error('AI News Assistant: Summary generation error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('Extension context invalidated') || 
          errorMessage.includes('message channel closed')) {
        errorMessage = 'Extension was reloaded. Please refresh the page and try again.';
      }
      
      displayError(errorMessage);
    }
  }
  
  // Display summary in Bloomberg-style layout
  function displaySummary(summary) {
    const contentElement = document.getElementById('summary-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
      <div style="
        background: white;
        border-radius: 6px;
        border: 1px solid #e8ecf0;
        overflow: hidden;
      ">
        <div style="
          padding: 20px 24px;
          border-bottom: 1px solid #f0f2f5;
        ">
          <div style="
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            line-height: 1.4;
            margin-bottom: 16px;
            letter-spacing: -0.01em;
          ">${summary.title || 'Article Summary'}</div>
          <div style="
            font-size: 16px;
            color: #404040;
            line-height: 1.7;
            text-align: justify;
          ">${summary.summary || 'No summary available'}</div>
        </div>
        
        ${summary.highlights && summary.highlights.length > 0 ? `
          <div style="padding: 20px 24px; border-bottom: 1px solid #f0f2f5; background: #fafbfc;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #0073e6;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            ">Key Highlights</div>
            <div style="display: grid; gap: 8px;">
              ${summary.highlights.map(highlight => `
                <div style="
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  font-size: 15px;
                  color: #404040;
                  line-height: 1.6;
                ">
                  <div style="
                    width: 6px;
                    height: 6px;
                    background: #0073e6;
                    border-radius: 50%;
                    margin-top: 8px;
                    flex-shrink: 0;
                  "></div>
                  <div>${highlight}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${summary.insights ? `
          <div style="padding: 20px 24px; background: #f8f9fb;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #0073e6;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            ">Market Insights</div>
            <div style="
              font-size: 15px;
              color: #404040;
              line-height: 1.7;
              font-style: italic;
              border-left: 3px solid #0073e6;
              padding-left: 16px;
            ">${summary.insights}</div>
          </div>
        ` : ''}
        
        <div style="
          padding: 16px 24px;
          background: #f0f2f5;
          border-top: 1px solid #e8ecf0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #0073e6, #0056b3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          ">🤖</div>
          <div style="
            font-size: 13px;
            color: #666;
            font-weight: 500;
          ">Generated by AI News Assistant</div>
        </div>
      </div>
    `;
  }
  
  // Display error in Bloomberg-style layout
  function displayError(errorMessage) {
    const contentElement = document.getElementById('summary-content');
    if (!contentElement) return;
    
    contentElement.innerHTML = `
      <div style="
        background: white;
        border-radius: 6px;
        border: 1px solid #e8ecf0;
        padding: 40px 24px;
        text-align: center;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: #dc3545;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          margin: 0 auto 16px auto;
        ">⚠️</div>
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: #dc3545;
          margin-bottom: 8px;
        ">Unable to Generate Summary</div>
        <div style="
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        ">${errorMessage}</div>
        <button onclick="generateSummary()" style="
          background: #0073e6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#0073e6'">Try Again</button>
      </div>
    `;
  }
  
  // Wait for page to load and then process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(processArticle, 1000); // Small delay to ensure content is rendered
    });
  } else {
    setTimeout(processArticle, 1000);
  }
  
  // Also listen for dynamic content changes (for single-page apps)
  const observer = new MutationObserver((mutations) => {
    if (window.aiNewsProcessed) return; // Skip if already processed
    
    const hasSignificantChange = mutations.some(mutation => {
      // Only trigger on major article content additions
      if (mutation.addedNodes.length > 0) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.matches('article, .article, [class*="article"]') ||
               node.querySelector && node.querySelector('article, .article, [class*="article"]'))) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (hasSignificantChange) {
      setTimeout(processArticle, 2000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: false // Only observe direct children to reduce noise
  });
  
})();