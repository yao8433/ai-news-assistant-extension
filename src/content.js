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
    try {
      chrome.runtime.sendMessage({
        action: 'extractedContent',
        data: articleData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('AI News Assistant: Background script not ready (this is normal):', chrome.runtime.lastError.message);
        } else {
          console.log('AI News Assistant: Message sent successfully, response:', response);
        }
      });
    } catch (error) {
      console.log('AI News Assistant: Error sending message (extension may be reloading):', error.message);
    }
    
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
        
        @keyframes aiPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
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
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('AI News Assistant: Runtime error:', chrome.runtime.lastError.message);
          displayError('Extension communication error. Please refresh the page and try again.');
          return;
        }
        
        if (response && response.success) {
          displaySummary(response.summary);
        } else {
          const errorMessage = response ? response.error : 'Failed to generate summary';
          console.error('AI News Assistant: Summary generation failed:', errorMessage);
          displayError(errorMessage);
        }
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
  
  // Display enhanced interactive summary
  function displaySummary(summary) {
    const contentElement = document.getElementById('summary-content');
    if (!contentElement) return;
    
    // Initialize interactive features FIRST so functions are available for onclick handlers
    initializeInteractiveFeatures(summary);
    
    // Debug: Verify functions are available
    console.log('AI News Assistant: Functions available:', {
      askFollowUp: typeof window.askFollowUp,
      askCustomFollowUp: typeof window.askCustomFollowUp,
      toggleSection: typeof window.toggleSection
    });
    
    // Additional debug: Test function directly
    setTimeout(() => {
      console.log('AI News Assistant: Testing window.askFollowUp directly...');
      if (typeof window.askFollowUp === 'function') {
        console.log('AI News Assistant: window.askFollowUp is available as function');
      } else {
        console.error('AI News Assistant: window.askFollowUp is not available!', typeof window.askFollowUp);
      }
    }, 1000);
    
    // Detect article type for optimized display
    const articleType = detectArticleType(summary);
    
    contentElement.innerHTML = `
      <div style="
        background: white;
        border-radius: 6px;
        border: 1px solid #e8ecf0;
        overflow: hidden;
      ">
        <!-- Title and Main Summary -->
        <div style="
          padding: 20px 24px;
          border-bottom: 1px solid #f0f2f5;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              line-height: 1.4;
              letter-spacing: -0.01em;
              flex: 1;
            ">${summary.title || 'Article Summary'}</div>
            <div style="
              background: ${getTypeColor(articleType)};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">${articleType}</div>
          </div>
          <div style="
            font-size: 16px;
            color: #404040;
            line-height: 1.7;
            text-align: justify;
          ">${summary.summary || 'No summary available'}</div>
        </div>
        
        <!-- Interactive Collapsible Sections -->
        ${createCollapsibleSection('key-highlights', '🎯 Key Highlights', summary.highlights, 'highlights')}
        ${createCollapsibleSection('market-insights', '📊 Market Insights', summary.insights, 'insights')}
        ${createCollapsibleSection('ai-followup', '💬 Ask AI Follow-up Questions', null, 'followup')}
        
        <!-- User Feedback Section -->
        <div style="
          padding: 20px 24px;
          background: #f8f9fb;
          border-top: 1px solid #e8ecf0;
        ">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #0073e6;
            margin-bottom: 12px;
          ">Rate this summary:</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
            ${[1, 2, 3, 4, 5].map(rating => `
              <button onclick="rateSummary(${rating})" style="
                background: none;
                border: none;
                font-size: 24px;
                color: #ddd;
                cursor: pointer;
                transition: color 0.2s;
                padding: 4px;
              " onmouseover="highlightStars(${rating})" onmouseout="resetStars()" data-rating="${rating}">⭐</button>
            `).join('')}
            <span id="rating-text" style="margin-left: 12px; font-size: 13px; color: #666;"></span>
          </div>
          <textarea id="feedback-text" placeholder="Optional: Share your thoughts on this summary..." style="
            width: 100%;
            min-height: 60px;
            padding: 12px;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            resize: vertical;
            box-sizing: border-box;
          "></textarea>
          <button onclick="submitFeedback()" style="
            background: #0073e6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
            transition: background-color 0.2s;
          " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#0073e6'">Submit Feedback</button>
        </div>
        
        <!-- Footer with Actions -->
        <div style="
          padding: 16px 24px;
          background: #f0f2f5;
          border-top: 1px solid #e8ecf0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
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
            ">AI News Assistant</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="highlightKeyPointsInArticle()" style="
              background: #28a745;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">Highlight in Article</button>
            <button onclick="shareOrExportSummary()" style="
              background: #17a2b8;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
            ">Share Summary</button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners to follow-up buttons as backup to onclick handlers
    setTimeout(() => {
      console.log('AI News Assistant: Adding event listeners to follow-up buttons');
      const followUpButtons = contentElement.querySelectorAll('button[onclick^="askFollowUp"]');
      console.log('AI News Assistant: Found follow-up buttons:', followUpButtons.length);
      
      followUpButtons.forEach((button, index) => {
        const questions = [
          'What are the key implications?',
          'How does this affect the market?', 
          'What should investors watch for?'
        ];
        const question = questions[index];
        if (question) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('AI News Assistant: Button clicked via event listener:', question);
            if (typeof window.askFollowUp === 'function') {
              window.askFollowUp(question);
            } else {
              console.error('AI News Assistant: window.askFollowUp not available during click');
            }
          });
          console.log(`AI News Assistant: Added event listener to button ${index}: ${question}`);
        }
      });
      
      // Also add listener to custom question button
      const customButton = contentElement.querySelector('button[onclick="askCustomFollowUp()"]');
      if (customButton) {
        customButton.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('AI News Assistant: Custom question button clicked via event listener');
          if (typeof window.askCustomFollowUp === 'function') {
            window.askCustomFollowUp();
          }
        });
        console.log('AI News Assistant: Added event listener to custom question button');
      }
    }, 100);
  }
  
  // Create collapsible section
  function createCollapsibleSection(id, title, content, type) {
    const isExpanded = localStorage.getItem(`section-${id}`) !== 'collapsed';
    
    if (type === 'highlights' && (!content || content.length === 0)) return '';
    if (type === 'insights' && !content) return '';
    
    return `
      <div style="border-bottom: 1px solid #f0f2f5;">
        <div onclick="toggleSection('${id}')" style="
          padding: 16px 24px;
          background: #fafbfc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#f5f6f7'" onmouseout="this.style.background='#fafbfc'">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #0073e6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">${title}</div>
          <div id="${id}-arrow" style="
            font-size: 18px;
            color: #0073e6;
            transition: transform 0.3s ease;
            transform: rotate(${isExpanded ? '90' : '0'}deg);
          ">▶</div>
        </div>
        <div id="${id}-content" style="
          max-height: ${isExpanded ? 'none' : '0'};
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          ${isExpanded ? 'padding: 20px 24px;' : 'padding: 0 24px;'}
        ">
          ${getContentForSection(type, content)}
        </div>
      </div>
    `;
  }
  
  // Get content for different section types
  function getContentForSection(type, content) {
    switch (type) {
      case 'highlights':
        return `
          <div style="display: grid; gap: 8px;">
            ${content.map((highlight, index) => `
              <div style="
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 15px;
                color: #404040;
                line-height: 1.6;
                padding: 8px 0;
              ">
                <div style="
                  width: 6px;
                  height: 6px;
                  background: #0073e6;
                  border-radius: 50%;
                  margin-top: 8px;
                  flex-shrink: 0;
                "></div>
                <div onclick="highlightSpecificPoint(${index})" style="
                  cursor: pointer;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#0073e6'" onmouseout="this.style.color='#404040'">${highlight}</div>
              </div>
            `).join('')}
          </div>
        `;
        
      case 'insights':
        return `
          <div style="
            font-size: 15px;
            color: #404040;
            line-height: 1.7;
            font-style: italic;
            border-left: 3px solid #0073e6;
            padding-left: 16px;
          ">${content}</div>
        `;
        
      case 'followup':
        return `
          <div style="margin-bottom: 16px;">
            <div style="
              font-size: 14px;
              color: #666;
              margin-bottom: 12px;
              line-height: 1.5;
            ">Ask the AI follow-up questions about this article:</div>
            <div style="display: grid; gap: 8px; margin-bottom: 16px;">
              <button onclick="askFollowUp('What are the key implications?')" style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                text-align: left;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">💡 What are the key implications?</button>
              <button onclick="askFollowUp('How does this affect the market?')" style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                text-align: left;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">📈 How does this affect the market?</button>
              <button onclick="askFollowUp('What should investors watch for?')" style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                text-align: left;
                transition: background-color 0.2s;
              " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">👀 What should investors watch for?</button>
            </div>
            <div style="display: flex; gap: 8px;">
              <input id="custom-question" placeholder="Ask your own question..." style="
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #e1e1e1;
                border-radius: 4px;
                font-size: 14px;
              " onkeypress="if(event.key==='Enter') askCustomFollowUp()">
              <button onclick="askCustomFollowUp()" style="
                background: #0073e6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
              ">Ask</button>
            </div>
          </div>
          <div id="followup-answer" style="
            background: #f8f9fb;
            border-radius: 4px;
            padding: 12px;
            margin-top: 12px;
            font-size: 14px;
            line-height: 1.6;
            display: none;
          "></div>
        `;
        
      default:
        return '';
    }
  }
  
  // Detect article type for optimized processing
  function detectArticleType(summary) {
    const text = (summary.summary + ' ' + (summary.highlights || []).join(' ')).toLowerCase();
    
    if (text.includes('fed') || text.includes('rate') || text.includes('inflation') || text.includes('market') || text.includes('stock') || text.includes('economic')) {
      return 'Economic';
    } else if (text.includes('election') || text.includes('government') || text.includes('policy') || text.includes('political') || text.includes('senate') || text.includes('congress')) {
      return 'Political';
    } else if (text.includes('tech') || text.includes('ai') || text.includes('software') || text.includes('digital') || text.includes('innovation')) {
      return 'Technology';
    } else if (text.includes('climate') || text.includes('environment') || text.includes('social') || text.includes('community')) {
      return 'Social';
    } else {
      return 'General';
    }
  }
  
  // Get color for article type
  function getTypeColor(type) {
    const colors = {
      'Economic': '#28a745',
      'Political': '#dc3545', 
      'Technology': '#6f42c1',
      'Social': '#fd7e14',
      'General': '#6c757d'
    };
    return colors[type] || colors['General'];
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
  
  // Global variables for interactive features
  let currentSummary = null;
  let userRating = 0;
  let highlightedElements = [];
  
  // Initialize interactive features
  function initializeInteractiveFeatures(summary) {
    currentSummary = summary;
    
    // Make functions globally available
    window.toggleSection = toggleSection;
    window.rateSummary = rateSummary;
    window.highlightStars = highlightStars;
    window.resetStars = resetStars;
    window.submitFeedback = submitFeedback;
    window.askFollowUp = askFollowUp;
    window.askCustomFollowUp = askCustomFollowUp;
    window.highlightSpecificPoint = highlightSpecificPoint;
    window.highlightKeyPointsInArticle = highlightKeyPointsInArticle;
    window.shareOrExportSummary = shareOrExportSummary;
  }
  
  // Toggle collapsible sections
  function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const arrow = document.getElementById(`${sectionId}-arrow`);
    
    if (!content || !arrow) return;
    
    const isCollapsed = content.style.maxHeight === '0px' || content.style.maxHeight === '';
    
    if (isCollapsed) {
      content.style.maxHeight = 'none';
      content.style.padding = '20px 24px';
      arrow.style.transform = 'rotate(90deg)';
      localStorage.setItem(`section-${sectionId}`, 'expanded');
    } else {
      content.style.maxHeight = '0';
      content.style.padding = '0 24px';
      arrow.style.transform = 'rotate(0deg)';
      localStorage.setItem(`section-${sectionId}`, 'collapsed');
    }
  }
  
  // Rating system functions
  function highlightStars(rating) {
    const stars = document.querySelectorAll('[data-rating]');
    stars.forEach((star, index) => {
      star.style.color = index < rating ? '#ffd700' : '#ddd';
    });
  }
  
  function resetStars() {
    const stars = document.querySelectorAll('[data-rating]');
    stars.forEach((star, index) => {
      star.style.color = index < userRating ? '#ffd700' : '#ddd';
    });
  }
  
  function rateSummary(rating) {
    userRating = rating;
    highlightStars(rating);
    
    const ratingText = document.getElementById('rating-text');
    if (ratingText) {
      const messages = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
      ratingText.textContent = messages[rating - 1];
    }
    
    // Store rating locally
    const ratingData = {
      url: window.location.href,
      title: currentSummary?.title || 'Unknown',
      rating: rating,
      timestamp: Date.now()
    };
    
    const existingRatings = JSON.parse(localStorage.getItem('summaryRatings') || '[]');
    existingRatings.push(ratingData);
    localStorage.setItem('summaryRatings', JSON.stringify(existingRatings.slice(-100))); // Keep last 100 ratings
  }
  
  function submitFeedback() {
    const feedbackText = document.getElementById('feedback-text')?.value;
    const feedbackData = {
      url: window.location.href,
      title: currentSummary?.title || 'Unknown',
      rating: userRating,
      feedback: feedbackText,
      timestamp: Date.now(),
      summary: currentSummary?.summary?.substring(0, 200) // First 200 chars for context
    };
    
    // Store feedback locally
    const existingFeedback = JSON.parse(localStorage.getItem('summaryFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('summaryFeedback', JSON.stringify(existingFeedback.slice(-50))); // Keep last 50 feedback
    
    // Show confirmation
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓ Thanks for your feedback!';
    button.style.background = '#28a745';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#0073e6';
    }, 2000);
    
    // Send to backend for analysis (optional)
    sendFeedbackToBackend(feedbackData);
  }
  
  // Follow-up Q&A functions
  function askFollowUp(question) {
    console.log('AI News Assistant: askFollowUp called with question:', question);
    const answerDiv = document.getElementById('followup-answer');
    if (!answerDiv) {
      console.error('AI News Assistant: followup-answer div not found');
      return;
    }
    
    answerDiv.style.display = 'block';
    answerDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 20px;
          height: 20px;
          background: #0073e6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          animation: aiPulse 1.5s infinite;
        ">🤔</div>
        <div style="font-weight: 600; color: #0073e6;">AI is thinking...</div>
      </div>
      <div style="color: #666; font-style: italic;">Question: ${question}</div>
    `;
    
    // Send follow-up question to AI
    sendFollowUpQuestion(question, answerDiv);
  }
  
  function askCustomFollowUp() {
    const questionInput = document.getElementById('custom-question');
    const question = questionInput?.value?.trim();
    
    if (!question) return;
    
    askFollowUp(question);
    questionInput.value = '';
  }
  
  function sendFollowUpQuestion(question, answerDiv) {
    try {
      chrome.runtime.sendMessage({
        action: 'askFollowUp',
        data: {
          question: question,
          context: {
            title: currentSummary?.title,
            summary: currentSummary?.summary,
            highlights: currentSummary?.highlights,
            url: window.location.href
          }
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('AI Follow-up: Runtime error:', chrome.runtime.lastError.message);
          answerDiv.innerHTML = `
            <div style="color: #dc3545; font-size: 13px;">
              ❌ Extension communication error. Please refresh the page and try again.
            </div>
          `;
          return;
        }
        
        if (response && response.success) {
          answerDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
              <div style="
                width: 20px;
                height: 20px;
                background: #28a745;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                flex-shrink: 0;
                margin-top: 2px;
              ">🤖</div>
              <div>
                <div style="font-weight: 600; color: #28a745; margin-bottom: 4px;">AI Assistant:</div>
                <div style="color: #666; font-style: italic; font-size: 13px; margin-bottom: 8px;">Question: ${question}</div>
                <div style="line-height: 1.6;">${response.answer}</div>
              </div>
            </div>
          `;
        } else {
          const errorMessage = response?.error || 'Failed to get AI response';
          console.error('AI Follow-up: API error:', errorMessage);
          answerDiv.innerHTML = `
            <div style="color: #dc3545; font-size: 13px;">
              ❌ ${errorMessage}
            </div>
          `;
        }
      });
    } catch (error) {
      console.error('AI Follow-up: Error sending question:', error);
      answerDiv.innerHTML = `
        <div style="color: #dc3545; font-size: 13px;">
          ❌ Sorry, I couldn't process that question right now. Please try again later.
        </div>
      `;
    }
  }
  
  // Highlight specific points in article
  function highlightSpecificPoint(index) {
    if (!currentSummary?.highlights || index >= currentSummary.highlights.length) return;
    
    const highlight = currentSummary.highlights[index];
    highlightTextInArticle(highlight, `highlight-${index}`);
  }
  
  // Highlight key points throughout the article
  function highlightKeyPointsInArticle() {
    if (!currentSummary?.highlights) return;
    
    // Clear existing highlights
    clearHighlights();
    
    // Highlight each key point
    currentSummary.highlights.forEach((highlight, index) => {
      setTimeout(() => {
        highlightTextInArticle(highlight, `highlight-${index}`);
      }, index * 200); // Stagger highlights for visual effect
    });
    
    // Show confirmation
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✨ Highlighted!';
    button.style.background = '#ffc107';
    button.style.color = '#000';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#28a745';
      button.style.color = 'white';
    }, 2000);
  }
  
  function highlightTextInArticle(searchText, className) {
    const articleContent = document.querySelector('article, .article-content, .story-body, .content');
    if (!articleContent) return;
    
    const walker = document.createTreeWalker(
      articleContent,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // Find and highlight matching text
    const searchWords = searchText.toLowerCase().split(' ').filter(word => word.length > 3);
    
    textNodes.forEach(textNode => {
      const text = textNode.textContent.toLowerCase();
      const hasMatch = searchWords.some(word => text.includes(word));
      
      if (hasMatch && textNode.parentElement) {
        const parent = textNode.parentElement;
        if (!parent.classList.contains(`ai-${className}`)) {
          parent.style.background = 'linear-gradient(120deg, #fff3cd 0%, #ffeaa7 100%)';
          parent.style.borderLeft = '3px solid #ffc107';
          parent.style.paddingLeft = '8px';
          parent.style.margin = '4px 0';
          parent.style.borderRadius = '3px';
          parent.style.transition = 'all 0.3s ease';
          parent.classList.add(`ai-${className}`);
          highlightedElements.push(parent);
        }
      }
    });
  }
  
  function clearHighlights() {
    highlightedElements.forEach(element => {
      element.style.background = '';
      element.style.borderLeft = '';
      element.style.paddingLeft = '';
      element.style.margin = '';
      element.style.borderRadius = '';
      element.classList.remove(...Array.from(element.classList).filter(cls => cls.startsWith('ai-highlight')));
    });
    highlightedElements = [];
  }
  
  // Share and export functions
  function shareOrExportSummary() {
    const summaryText = formatSummaryForSharing();
    
    if (navigator.share) {
      navigator.share({
        title: currentSummary?.title || 'News Summary',
        text: summaryText,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(summaryText).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#28a745';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '#17a2b8';
        }, 2000);
      });
    }
  }
  
  function formatSummaryForSharing() {
    if (!currentSummary) return '';
    
    let text = `📰 ${currentSummary.title}\n\n`;
    text += `📝 Summary:\n${currentSummary.summary}\n\n`;
    
    if (currentSummary.highlights && currentSummary.highlights.length > 0) {
      text += `🎯 Key Points:\n`;
      currentSummary.highlights.forEach(highlight => {
        text += `• ${highlight}\n`;
      });
      text += `\n`;
    }
    
    if (currentSummary.insights) {
      text += `💡 Insights:\n${currentSummary.insights}\n\n`;
    }
    
    text += `🔗 Source: ${window.location.href}\n`;
    text += `🤖 Summarized by AI News Assistant`;
    
    return text;
  }
  
  // Send feedback to backend
  async function sendFeedbackToBackend(feedbackData) {
    try {
      await chrome.runtime.sendMessage({
        action: 'submitFeedback',
        data: feedbackData
      });
    } catch (error) {
      console.log('Could not send feedback to backend:', error);
    }
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