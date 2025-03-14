function findChangeEmojiButton() {
    // Try to find "Change page icon" button first
    const pageIconButtons = document.querySelectorAll('div.notion-record-icon[role="button"]');
    for (const button of pageIconButtons) {
        if (button.getAttribute('aria-label')?.includes('Change page icon')) {
            console.log('Found "Change icon" button');
            return button;
        }
    }

    // If not found, try to find "Add icon" button
    const buttons = document.querySelectorAll('div[role="button"]');
    for (const button of buttons) {
        if (button.textContent.includes('Add icon')) {
            console.log('Found "Add icon" button:', button.textContent);
            return button;
        }
    }

    console.log('No emoji button found');
    return null;
}

function findEmojiFilterInput() {
    const filterInput = document.querySelector('input[placeholder="Filter…"]');
    
    if (filterInput) {
        console.log('Found emoji filter input');
        return filterInput;
    }
    
    console.log('Could not find emoji filter input');
    return null;
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

async function insertEmoji(emoji) {
    try {
        const changeEmojiButton = findChangeEmojiButton();
        if (!changeEmojiButton) {
            console.log('Could not find change emoji button');
            return false;
        }
        changeEmojiButton.click();

        // Wait for emoji picker container and hide it
        const emojiPickerContainer = await waitForElement("#notion-app > div > div.notion-overlay-container.notion-default-overlay-container > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div");
        emojiPickerContainer.style.opacity = '0';
        console.log('Changed opacity to zero');

        // Wait for filter input
        const filterInputButton = await waitForElement('input[placeholder="Filter…"]');
        filterInputButton.focus();

        const eventOptions = { bubbles: true, cancelable: true, key: emoji, emoji };
        filterInputButton.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
        filterInputButton.value += emoji;
        filterInputButton.dispatchEvent(new Event("input", { bubbles: true }));
        filterInputButton.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
        filterInputButton.dispatchEvent(new Event("change", { bubbles: true }));

        // Wait for emoji grid and click the first emoji
        const emojiGrid = await waitForElement('div[role="gridcell"]');
        const emojiSpan = emojiGrid.querySelector('span[role="img"]');
        if (!emojiSpan) {
            throw new Error('Could not find emoji span within grid cell');
        }
        emojiSpan.click();

        return true;
    } catch (error) {
        console.error('Error in insertEmoji:', error);
        return false;
    }
}

function getPageTitle() {
    console.log("getPageTitle called");
    const titleElement = document.querySelector('h1[placeholder="New page"], h1[placeholder="Untitled"]').textContent;
    console.log(`Notion page title: "${titleElement}"`)
    return titleElement;
}


// Listen for messages from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'insertEmoji') {
        const success = await insertEmoji(message.emoji);
        sendResponse({ success });
    }
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'getPageTitle') {
        const pageTitle = getPageTitle();
        sendResponse({ pageTitle });
    }
});