// Centralized News Sites Configuration
// This module contains all news site patterns, selectors, and permissions
// to avoid duplication across manifest.json, background.js, and content.js

const NEWS_SITES_CONFIG = {
  // Site-specific DOM selectors for content extraction
  siteSelectors: {
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
  },

  // Generic fallback selectors for unsupported sites
  genericSelectors: {
    title: 'h1, .headline, .title, [class*="headline"], [class*="title"]',
    content: 'article p, .article p, .content p, .story p, [class*="article"] p, [class*="content"] p',
    author: '.author, .byline, [class*="author"], [class*="byline"]',
    date: 'time, .date, .timestamp, [class*="date"], [class*="time"]'
  },

  // URL patterns for news article detection
  newsPatterns: [
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
  ],

  // Host permissions for manifest.json
  getHostPermissions() {
    return [
      "https://*.bloomberg.com/*",
      "https://*.reuters.com/*",
      "https://*.bbc.com/*",
      "https://*.cnn.com/*",
      "https://*.wsj.com/*",
      "https://*.ft.com/*",
      "https://*.nytimes.com/*",
      "https://*.washingtonpost.com/*",
      "https://*.usatoday.com/*",
      "https://*.latimes.com/*",
      "https://*.chicagotribune.com/*",
      "https://*.bostonglobe.com/*",
      "https://*.seattletimes.com/*",
      "https://*.dallasnews.com/*",
      "https://*.thehill.com/*",
      "https://*.sfgate.com/*",
      "https://*.tampabay.com/*",
      "https://*.ajc.com/*",
      "https://*.baltimoresun.com/*",
      "https://*.oregonlive.com/*",
      "https://*.cleveland.com/*",
      "https://*.pennlive.com/*",
      "https://*.nj.com/*",
      "https://*.mlive.com/*",
      "https://*.al.com/*",
      "https://*.statesman.com/*",
      "https://*.freep.com/*",
      "https://*.indystar.com/*",
      "https://*.tennessean.com/*",
      "https://*.azcentral.com/*",
      "https://*.cincinnati.com/*",
      "https://*.dispatch.com/*",
      "https://*.courier-journal.com/*",
      "https://*.desmoinesregister.com/*",
      "https://*.detroitnews.com/*",
      "https://*.jacksonville.com/*",
      "https://*.news-press.com/*",
      "https://*.oklahoman.com/*",
      "https://*.northjersey.com/*",
      "https://*.houstonchronicle.com/*",
      "https://*.sfchronicle.com/*",
      "https://*.expressnews.com/*",
      "https://*.ctpost.com/*",
      "https://*.nhregister.com/*",
      "https://*.timesunion.com/*",
      "https://*.stltoday.com/*",
      "https://*.richmond.com/*",
      "https://*.buffalonews.com/*",
      "https://*.omaha.com/*",
      "https://*.journalstar.com/*",
      "https://*.tulsaworld.com/*",
      "https://*.madison.com/*",
      "https://*.journalnow.com/*",
      "https://*.miamiherald.com/*",
      "https://*.charlotteobserver.com/*",
      "https://*.kansascity.com/*",
      "https://*.newsobserver.com/*",
      "https://*.sacbee.com/*",
      "https://*.thestate.com/*",
      "https://*.kansas.com/*",
      "https://*.fresnobee.com/*",
      "https://*.star-telegram.com/*",
      "https://*.kentucky.com/*",
      "https://*.belleville.com/*",
      "https://*.elnuevoherald.com/*",
      "https://*.tri-cityherald.com/*",
      "https://*.denverpost.com/*",
      "https://*.mercurynews.com/*",
      "https://*.eastbaytimes.com/*",
      "https://*.ocregister.com/*",
      "https://*.sandiegouniontribune.com/*",
      "https://*.bostonherald.com/*",
      "https://*.twincities.com/*",
      "https://*.pe.com/*",
      "https://*.theadvocate.com/*",
      "https://*.nola.com/*",
      "https://*.theadvertiser.com/*",
      "https://*.globeandmail.com/*",
      "https://*.theguardian.com/*",
      "https://*.independent.co.uk/*",
      "https://*.telegraph.co.uk/*",
      "https://*.thetimes.co.uk/*",
      "https://*.economist.com/*",
      "https://*.spectator.co.uk/*",
      "https://*.newstatesman.com/*",
      "https://*.dailymail.co.uk/*",
      "https://*.standard.co.uk/*",
      "https://*.inews.co.uk/*",
      "https://*.irishtimes.com/*",
      "https://*.independent.ie/*",
      "https://*.irishexaminer.com/*",
      "https://*.lemonde.fr/*",
      "https://*.lefigaro.fr/*",
      "https://*.liberation.fr/*",
      "https://*.leparisien.fr/*",
      "https://*.lexpress.fr/*",
      "https://*.lepoint.fr/*",
      "https://*.lesechos.fr/*",
      "https://*.challenges.fr/*",
      "https://*.marianne.net/*",
      "https://*.nouvelobs.com/*",
      "https://*.ouest-france.fr/*",
      "https://*.20minutes.fr/*",
      "https://*.spiegel.de/*",
      "https://*.zeit.de/*",
      "https://*.welt.de/*",
      "https://*.faz.net/*",
      "https://*.sueddeutsche.de/*",
      "https://*.handelsblatt.com/*",
      "https://*.bild.de/*",
      "https://*.focus.de/*",
      "https://*.stern.de/*",
      "https://*.tagesspiegel.de/*",
      "https://*.corriere.it/*",
      "https://*.repubblica.it/*",
      "https://*.gazzetta.it/*",
      "https://*.lastampa.it/*",
      "https://*.ilsole24ore.com/*",
      "https://*.ilpost.it/*",
      "https://*.ansa.it/*",
      "https://*.telegraaf.nl/*",
      "https://*.volkskrant.nl/*",
      "https://*.nrc.nl/*",
      "https://*.ad.nl/*",
      "https://*.parool.nl/*",
      "https://*.trouw.nl/*",
      "https://*.demorgen.be/*",
      "https://*.standaard.be/*",
      "https://*.lesoir.be/*",
      "https://*.rtbf.be/*",
      "https://*.elpais.com/*",
      "https://*.elmundo.es/*",
      "https://*.abc.es/*",
      "https://*.lavanguardia.com/*",
      "https://*.elconfidencial.com/*",
      "https://*.eldiario.es/*",
      "https://*.publico.es/*",
      "https://*.expansion.com/*",
      "https://*.marca.com/*",
      "https://*.as.com/*"
    ];
  },

  // Content script matches for manifest.json
  getContentScriptMatches() {
    return this.getHostPermissions(); // Same patterns for now
  }
};

// Export for both CommonJS and ES6 module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NEWS_SITES_CONFIG;
} else if (typeof window !== 'undefined') {
  window.NEWS_SITES_CONFIG = NEWS_SITES_CONFIG;
}