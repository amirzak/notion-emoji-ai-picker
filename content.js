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

async function insertEmoji(emoji) {
    const changeEmojiButton = findChangeEmojiButton();
    if (!changeEmojiButton) {
        console.log('Could not find change emoji button');
        return false;
    }
    changeEmojiButton.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    const filterInputButton = findEmojiFilterInput();
    if (!filterInputButton) {
        console.log('Could not find filter input');
        return false;
    }

    filterInputButton.focus();

    const eventOptions = { bubbles: true, cancelable: true, key: emoji, emoji };
    filterInputButton.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
    filterInputButton.value += emoji;
    filterInputButton.dispatchEvent(new Event("input", { bubbles: true }));
    filterInputButton.dispatchEvent(new KeyboardEvent("keyup", eventOptions));

    await new Promise(resolve => setTimeout(resolve, 100));

    filterInputButton.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 100));

    const emojiGrid = document.querySelector('div[role="gridcell"]');
    const emojiSpan = emojiGrid.querySelector('span[role="img"]');
    emojiSpan.click();

    return true;
}

function getPageTitle() {
    console.log("getPageTitle called");
    const titleElement = document.querySelector('h1[placeholder="New page"]').textContent;
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