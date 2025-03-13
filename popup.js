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
            
            // Get emoji suggestions from AI using the page title
            console.log('Getting emoji suggestions for title:', titleResponse.pageTitle);
            const suggestions = await getEmojiSuggestion(titleResponse.pageTitle);
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

const OPENAI_API_KEY = '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';

const emojiSuggestionLlm = `You are a top-notch Notion expert specialized in selecting emojis for Notion pages based on their titles. Your task is to provide 3 emoji suggestions for a given Notion page title.

# Instructions

1. The user will supply a title of a Notion page.
2. Based on the provided title, suggest three emojis that best fit the theme or tone of the title.
3. Provide only the emoji suggestions as outputs.
4. Each emoji suggestion must be on a separate line.
5. Do not include any additional text other than the emoji suggestions themselves.

# Output Format

- The output should consist solely of three emojis, each on its own line. Do not include any extra words or explanations alongside the emojis.

Please ensure your responses adhere strictly to these guidelines.
`

async function getEmojiSuggestion(title) {
    console.log('Making OpenAI API request for title:', title);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'developer',
                content: emojiSuggestionLlm,
            },
            {
                role: 'user',
                content: title
            }
            ],
        })
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);
    const emojis = data.choices[0].message.content.split('\n');
    console.log('Parsed emojis:', emojis);
    return emojis;
}