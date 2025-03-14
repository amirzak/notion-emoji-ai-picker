// When the popup loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    const loadingContainer = document.querySelector('.loading-container');
    const errorContainer = document.querySelector('.error-container');
    const emojiGrid = document.querySelector('.emoji-grid');
    
    try {
        // Get the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if we're on a Notion page
        if (!tab.url.includes('notion.so')) {
            loadingContainer.classList.remove('visible');
            errorContainer.classList.add('visible');
            return;
        }

        try {
            // Get page title first
            console.log('Requesting page title...');
            const titleResponse = await chrome.tabs.sendMessage(tab.id, {
                action: 'getPageTitle'
            });
            console.log('Received page title:', titleResponse.pageTitle);
            
            // Get emoji suggestions from backend
            console.log('Getting emoji suggestions for title:', titleResponse.pageTitle);
            const response = await fetch('https://notionemoji.com/api/getEmojiSuggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: titleResponse.pageTitle
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get emoji suggestions');
            }

            const data = await response.json();
            const suggestions = data.emojis;
            console.log('Received emoji suggestions:', suggestions);
            
            // Hide loading, show emoji grid
            loadingContainer.classList.remove('visible');
            emojiGrid.classList.add('visible');
            
            // Create emoji buttons
            suggestions.forEach(emoji => {
                console.log('Creating button for emoji:', emoji);
                const button = document.createElement('button');
                button.className = 'emoji-button';
                button.textContent = emoji.trim();
                
                button.addEventListener('click', () => {
                    console.log('Emoji button clicked:', emoji);
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'insertEmoji',
                        emoji: emoji.trim()
                    });
                    console.log('Sent emoji to content script');
                    window.close();
                });
                
                emojiGrid.appendChild(button);
            });
        } catch (error) {
            console.error('Error in popup:', error);
            loadingContainer.classList.remove('visible');
            errorContainer.classList.add('visible');
            errorContainer.querySelector('.error-title').textContent = 'Unable to Load Suggestions';
            errorContainer.querySelector('.error-message').innerHTML = 'Please make sure you\'re on a Notion page<br>and try again.';
        }
    } catch (error) {
        console.error('Error checking tab:', error);
        loadingContainer.classList.remove('visible');
        errorContainer.classList.add('visible');
    }
});