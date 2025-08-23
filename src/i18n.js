// Internationalization module for AI News Assistant
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // UI Labels
                appName: 'AI News Assistant',
                loading: 'Analyzing article...',
                noArticle: 'No Article Detected',
                noArticleDescription: 'Navigate to a news article to get an AI-powered summary.',
                supportedSites: 'Supported Sites:',
                settings: 'Preferences',
                
                // Summary Controls
                summaryLength: 'Summary Length:',
                short: 'Short',
                medium: 'Medium',
                detailed: 'Detailed',
                regenerate: 'Regenerate',
                
                // Summary Sections
                summary: 'Summary',
                keyHighlights: 'Key Highlights',
                insights: 'Insights',
                
                // Settings
                focusArea: 'Focus Area:',
                language: 'Language:',
                autoSummarize: 'Auto-summarize articles',
                savePreferences: 'Save Preferences',
                
                // Focus Areas
                general: 'General',
                economic: 'Economic',
                political: 'Political',
                social: 'Social',
                technology: 'Technology',
                
                // Languages
                english: 'English',
                spanish: 'Spanish',
                french: 'French',
                german: 'German',
                chinese: 'Chinese',
                
                // Feedback
                feedbackQuestion: 'Was this summary helpful?',
                
                // Error States
                errorTitle: 'Unable to Generate Summary',
                tryAgain: 'Try Again',
                
                // Status Messages
                articleDetected: 'News article detected',
                notSupportedSite: 'Not on a supported news site',
                summaryAvailable: 'AI Summary Available',
                
                // Popup
                openSidePanel: 'Open Side Panel'
            },
            
            es: {
                appName: 'Asistente de Noticias IA',
                loading: 'Analizando artículo...',
                noArticle: 'Ningún Artículo Detectado',
                noArticleDescription: 'Navega a un artículo de noticias para obtener un resumen impulsado por IA.',
                supportedSites: 'Sitios Compatibles:',
                settings: 'Preferencias',
                
                summaryLength: 'Longitud del Resumen:',
                short: 'Corto',
                medium: 'Medio',
                detailed: 'Detallado',
                regenerate: 'Regenerar',
                
                summary: 'Resumen',
                keyHighlights: 'Puntos Clave',
                insights: 'Análisis',
                
                focusArea: 'Área de Enfoque:',
                language: 'Idioma:',
                autoSummarize: 'Auto-resumir artículos',
                savePreferences: 'Guardar Preferencias',
                
                general: 'General',
                economic: 'Económico',
                political: 'Político',
                social: 'Social',
                technology: 'Tecnología',
                
                english: 'Inglés',
                spanish: 'Español',
                french: 'Francés',
                german: 'Alemán',
                chinese: 'Chino',
                
                feedbackQuestion: '¿Fue útil este resumen?',
                
                errorTitle: 'No Se Pudo Generar el Resumen',
                tryAgain: 'Intentar de Nuevo',
                
                articleDetected: 'Artículo de noticias detectado',
                notSupportedSite: 'No está en un sitio compatible',
                summaryAvailable: 'Resumen IA Disponible',
                
                openSidePanel: 'Abrir Panel Lateral'
            },
            
            fr: {
                appName: 'Assistant Actualités IA',
                loading: 'Analyse de l\'article...',
                noArticle: 'Aucun Article Détecté',
                noArticleDescription: 'Naviguez vers un article de presse pour obtenir un résumé alimenté par l\'IA.',
                supportedSites: 'Sites Compatibles:',
                settings: 'Préférences',
                
                summaryLength: 'Longueur du Résumé:',
                short: 'Court',
                medium: 'Moyen',
                detailed: 'Détaillé',
                regenerate: 'Régénérer',
                
                summary: 'Résumé',
                keyHighlights: 'Points Clés',
                insights: 'Analyses',
                
                focusArea: 'Domaine de Focus:',
                language: 'Langue:',
                autoSummarize: 'Résumer automatiquement les articles',
                savePreferences: 'Sauvegarder les Préférences',
                
                general: 'Général',
                economic: 'Économique',
                political: 'Politique',
                social: 'Social',
                technology: 'Technologie',
                
                english: 'Anglais',
                spanish: 'Espagnol',
                french: 'Français',
                german: 'Allemand',
                chinese: 'Chinois',
                
                feedbackQuestion: 'Ce résumé était-il utile?',
                
                errorTitle: 'Impossible de Générer le Résumé',
                tryAgain: 'Réessayer',
                
                articleDetected: 'Article de presse détecté',
                notSupportedSite: 'Pas sur un site compatible',
                summaryAvailable: 'Résumé IA Disponible',
                
                openSidePanel: 'Ouvrir le Panneau Latéral'
            },
            
            de: {
                appName: 'KI-Nachrichten-Assistent',
                loading: 'Artikel wird analysiert...',
                noArticle: 'Kein Artikel Erkannt',
                noArticleDescription: 'Navigieren Sie zu einem Nachrichtenartikel, um eine KI-gestützte Zusammenfassung zu erhalten.',
                supportedSites: 'Unterstützte Websites:',
                settings: 'Einstellungen',
                
                summaryLength: 'Zusammenfassungslänge:',
                short: 'Kurz',
                medium: 'Mittel',
                detailed: 'Ausführlich',
                regenerate: 'Regenerieren',
                
                summary: 'Zusammenfassung',
                keyHighlights: 'Wichtige Punkte',
                insights: 'Einblicke',
                
                focusArea: 'Fokusbereich:',
                language: 'Sprache:',
                autoSummarize: 'Artikel automatisch zusammenfassen',
                savePreferences: 'Einstellungen Speichern',
                
                general: 'Allgemein',
                economic: 'Wirtschaftlich',
                political: 'Politisch',
                social: 'Sozial',
                technology: 'Technologie',
                
                english: 'Englisch',
                spanish: 'Spanisch',
                french: 'Französisch',
                german: 'Deutsch',
                chinese: 'Chinesisch',
                
                feedbackQuestion: 'War diese Zusammenfassung hilfreich?',
                
                errorTitle: 'Zusammenfassung Konnte Nicht Erstellt Werden',
                tryAgain: 'Erneut Versuchen',
                
                articleDetected: 'Nachrichtenartikel erkannt',
                notSupportedSite: 'Nicht auf einer unterstützten Website',
                summaryAvailable: 'KI-Zusammenfassung Verfügbar',
                
                openSidePanel: 'Seitenpanel Öffnen'
            },
            
            zh: {
                appName: 'AI 新闻助手',
                loading: '正在分析文章...',
                noArticle: '未检测到文章',
                noArticleDescription: '导航到新闻文章以获得AI驱动的摘要。',
                supportedSites: '支持的网站：',
                settings: '偏好设置',
                
                summaryLength: '摘要长度：',
                short: '简短',
                medium: '中等',
                detailed: '详细',
                regenerate: '重新生成',
                
                summary: '摘要',
                keyHighlights: '关键要点',
                insights: '见解',
                
                focusArea: '关注领域：',
                language: '语言：',
                autoSummarize: '自动总结文章',
                savePreferences: '保存偏好设置',
                
                general: '通用',
                economic: '经济',
                political: '政治',
                social: '社会',
                technology: '技术',
                
                english: '英语',
                spanish: '西班牙语',
                french: '法语',
                german: '德语',
                chinese: '中文',
                
                feedbackQuestion: '这个摘要有帮助吗？',
                
                errorTitle: '无法生成摘要',
                tryAgain: '重试',
                
                articleDetected: '检测到新闻文章',
                notSupportedSite: '不在支持的网站上',
                summaryAvailable: 'AI 摘要可用',
                
                openSidePanel: '打开侧面板'
            }
        };
    }
    
    setLanguage(language) {
        const langMap = {
            'english': 'en',
            'spanish': 'es', 
            'french': 'fr',
            'german': 'de',
            'chinese': 'zh'
        };
        
        this.currentLanguage = langMap[language] || language || 'en';
    }
    
    t(key, defaultValue = '') {
        const translation = this.translations[this.currentLanguage];
        return translation?.[key] || this.translations.en[key] || defaultValue || key;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return Object.keys(this.translations);
    }
}

// Create global instance
const i18n = new I18nManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
} else {
    window.i18n = i18n;
}