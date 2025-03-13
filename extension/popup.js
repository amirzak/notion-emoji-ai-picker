// When the popup loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    const emojiGrid = document.querySelector('.emoji-grid');
    
    // First, show loading state
    emojiGrid.innerHTML = `
        <div style="grid-column: span 5; text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #f3f3f3; 
                 border-top: 3px solid #2196f3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="margin-top: 12px;">Finding perfect emojis...</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // Get the page title from content script
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        console.log('Got active tab:', tabs[0].id);
        try {
            // Get page title first
            console.log('Requesting page title...');
            const titleResponse = await chrome.tabs.sendMessage(tabs[0].id, {
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
            
            // Clear loading state and create emoji buttons
            emojiGrid.innerHTML = '';
            suggestions.forEach(emoji => {
                console.log('Creating button for emoji:', emoji);
                const button = document.createElement('button');
                button.className = 'emoji-button';
                button.textContent = emoji.trim();
                
                button.addEventListener('click', () => {
                    console.log('Emoji button clicked:', emoji);
                    // Send the emoji to the content script
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'insertEmoji',
                        emoji: emoji.trim()
                    });
                    console.log('Sent emoji to content script');
                    
                    // Close the popup
                    window.close();
                });
                
                emojiGrid.appendChild(button);
            });
        } catch (error) {
            console.error('Error in popup:', error);
            emojiGrid.innerHTML = `
                <div style="grid-column: span 5; text-align: center; padding: 20px;">
                    <div style="color: #e53935; font-size: 24px; margin-bottom: 8px;">⚠️</div>
                    <div style="color: #e53935; font-weight: 500; margin-bottom: 8px;">Unable to load suggestions</div>
                    <div style="font-size: 13px; color: #666;">Please make sure you're on a Notion page</div>
                </div>
            `;
        }
    });
});