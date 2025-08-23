// Popup JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const openSidePanelBtn = document.getElementById('openSidePanel');
    const openSettingsBtn = document.getElementById('openSettings');
    
    // Check current tab status
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url) {
            const newsPatterns = [
                /bloomberg\.com\/news/,
                /reuters\.com.*\/article/,
                /bbc\.com\/news/,
                /cnn\.com/,
                /wsj\.com\/articles/,
                /ft\.com\/content/
            ];
            
            const isNewsArticle = newsPatterns.some(pattern => pattern.test(tab.url));
            
            if (isNewsArticle) {
                statusDiv.className = 'status active';
                statusDiv.textContent = '✓ News article detected';
                openSidePanelBtn.disabled = false;
            } else {
                statusDiv.className = 'status inactive';
                statusDiv.textContent = 'Not on a supported news site';
                openSidePanelBtn.disabled = false; // Still allow opening
            }
        }
    } catch (error) {
        console.error('Error checking tab status:', error);
    }
    
    // Open side panel
    openSidePanelBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.sidePanel.open({ tabId: tab.id });
            window.close();
        } catch (error) {
            console.error('Error opening side panel:', error);
        }
    });
    
    // Open settings (could open side panel settings or options page)
    openSettingsBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.sidePanel.open({ tabId: tab.id });
            
            // Send message to show settings in side panel
            setTimeout(() => {
                chrome.runtime.sendMessage({ action: 'showSettings' });
            }, 500);
            
            window.close();
        } catch (error) {
            console.error('Error opening settings:', error);
        }
    });
});