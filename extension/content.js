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

function waitForEmojiPickerDialog(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const findEmojiPicker = () => {
            const dialogs = document.querySelectorAll('[role="dialog"]');
            for (const dialog of dialogs) {
                if (dialog.querySelector('[role="tab"]') && dialog.querySelector('[role="gridcell"]')) {
                    return dialog;
                }
            }
            return null;
        };

        const existingPicker = findEmojiPicker();
        if (existingPicker) {
            return resolve(existingPicker);
        }

        const observer = new MutationObserver(() => {
            const picker = findEmojiPicker();
            if (picker) {
                observer.disconnect();
                resolve(picker);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error('Timeout waiting for emoji picker dialog'));
        }, timeout);
    });
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

        const emojiPickerDialog = await waitForEmojiPickerDialog();
        console.log('Found emoji picker dialog');
        console.log('Current opacity:', emojiPickerDialog.style.opacity);
        emojiPickerDialog.style.opacity = '0';
        console.log('Changed opacity to zero');

        const emojiTab = emojiPickerDialog.querySelector('div[role="tab"][tabindex="0"]');
        if (emojiTab && emojiTab.textContent === 'Emoji') {
            emojiTab.click();
            console.log('Clicked emoji tab button');
        }

        const filterInputButton = emojiPickerDialog.querySelector('[role="combobox"]');
        if (!filterInputButton) {
            throw new Error('Could not find filter input');
        }
        filterInputButton.focus();

        const eventOptions = { bubbles: true, cancelable: true, key: emoji, emoji };
        filterInputButton.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
        filterInputButton.value += emoji;
        filterInputButton.dispatchEvent(new Event("input", { bubbles: true }));
        filterInputButton.dispatchEvent(new KeyboardEvent("keyup", eventOptions));
        filterInputButton.dispatchEvent(new Event("change", { bubbles: true }));
        console.log('Typed in emoji in the filter tab');

        // Wait for emoji grid and click the first emoji
        const emojiGrid = await waitForElement('div[role="gridcell"]');
        const emojiSpan = emojiGrid.querySelector('span[role="img"], img[class="notion-emoji"], span');
        if (!emojiSpan) {
            throw new Error('Could not find emoji span within grid cell');
        }

        emojiSpan.click();
        console.log('Clicked emoji');  

        await new Promise(resolve => setTimeout(resolve, 300));
        
        const stillOpenDialog = Array.from(document.querySelectorAll('[role="dialog"]')).find(d => 
            d.querySelector('[role="tab"]') && d.querySelector('[role="gridcell"]')
        );
        
        if (stillOpenDialog) {
            console.log('Emoji picker still open, closing it');
            const overlayContainer = document.querySelector('.notion-overlay-container');
            if (overlayContainer) {
                const clickableArea = overlayContainer.querySelector('div[style*="position"]');
                if (clickableArea) {
                    clickableArea.click();
                    console.log('Clicked background to close');
                }
            }
        }
 

        return true;
    } catch (error) {
        console.error('Error in insertEmoji:', error);
        return false;
    }
}

function getPageTitle() {
    console.log("getPageTitle called");
    let titleElement = document.title;
    titleElement = titleElement.replace(/^\(\d+\)\s*/, '');
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