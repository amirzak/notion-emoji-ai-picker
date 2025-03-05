// When the popup loads
document.addEventListener('DOMContentLoaded', () => {
    // Get all emoji buttons
    const buttons = document.querySelectorAll('.emoji-button');
    
    // Add click handlers to each button
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const emoji = button.textContent;
            
            // Send the emoji to the content script
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'insertEmoji',
                    emoji: emoji
                });
                
                // Close the popup
                window.close();
            });
        });
    });
}); 