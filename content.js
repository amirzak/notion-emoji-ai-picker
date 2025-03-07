// Function to insert emoji into Notion
function insertEmoji(emoji) {
    console.log('Inserting emoji:', emoji);
    
    // Find the emoji search input in Notion's emoji picker
    const emojiInput = document.querySelector('.notion-record-icon.notranslate[role="button"]').querySelector('div > div > span');
    if (emojiInput) {
        // Set the emoji as the input value
        emojiInput.innerText = emoji;
        console.log('New emoji was setted!');
        return true;
    }
    
    console.log('Emoji input not found');
    return false;
}

// Function to find and attach listener to the emoji button
function findAndAttachToEmojiButton() {
    // Find all elements with role="button"
    const buttons = document.querySelectorAll('div[role="button"]');
    
    // Find the specific button that contains "Add icon" text
    let emojiButton = null;
    buttons.forEach(button => {
        if (button.textContent.includes('Add icon')) {
            emojiButton = button;
            console.log('Found "Add icon" button:', button.textContent);
        }
    });
    
    if (emojiButton) {
        // Add click event listener to the emoji button
        emojiButton.addEventListener('click', (e) => {
            // Let Notion's emoji picker open normally
            console.log('Emoji selector clicked!', new Date().toISOString());
            
            // Send message to background script to open popup
            chrome.runtime.sendMessage({
                action: 'openPopup'
            });
        });
        console.log('Attached listener to emoji button');
        return true;
    } else {
        return false;
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'insertEmoji') {
        const success = insertEmoji(message.emoji);
        sendResponse({ success });
    }
});

// Try immediately
if (!findAndAttachToEmojiButton()) {
    // If not found, set up a MutationObserver to watch for DOM changes
    console.log('Setting up observer to watch for button...');
    
    const observer = new MutationObserver((mutations) => {
        if (findAndAttachToEmojiButton()) {
            // If button is found, disconnect the observer
            observer.disconnect();
            console.log('Observer disconnected after finding button');
        }
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
} 