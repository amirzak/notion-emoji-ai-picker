// Function to find and attach listener to the emoji button
function findAndAttachToEmojiButton() {
    // Find all elements with role="button"
    const buttons = document.querySelectorAll('div[role="button"]');
    
    // Find the specific button that contains "Add icon" text
    let emojiButton = null;
    buttons.forEach(button => {
        if (button.textContent.includes('Add icon')) {
            emojiButton = button;
            console.log('Found "Add icon" button');
        }
    });
    
    if (emojiButton) {
        // Add click event listener to the emoji button
        emojiButton.addEventListener('click', () => {
            console.log('Emoji selector clicked!', new Date().toISOString());
        });
        console.log('Attached listener to emoji button');
        return true;
    } else {
        console.log('Emoji button not found. Available buttons:', buttons.length);
        return false;
    }
}

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