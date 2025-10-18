async function insertEmojiViaAPI(emoji) {
    try {
        const pageId = window.location.pathname.split('-').pop();
        if (!pageId) {
            console.error('Could not extract page ID from URL');
            return false;
        }

        const formattedPageId = pageId.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
        console.log('Page ID:', formattedPageId);

        const requestBody = {
            requestId: crypto.randomUUID(),
            transactions: [
                {
                    id: crypto.randomUUID(),
                    spaceId: null,
                    operations: [
                        {
                            id: formattedPageId,
                            table: 'block',
                            path: ['format', 'page_icon'],
                            command: 'set',
                            args: emoji
                        }
                    ]
                }
            ]
        };

        console.log('Sending API request:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://www.notion.so/api/v3/saveTransactionsMain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('API request failed:', response.status, await response.text());
            return false;
        }

        console.log('Successfully updated emoji via API');
        return true;
    } catch (error) {
        console.error('Error in insertEmojiViaAPI:', error);
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
chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    if (message.action === 'insertEmoji') {
        const success = await insertEmojiViaAPI(message.emoji);
        sendResponse({ success });
    }
    return true;
})

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    if (message.action === 'getPageTitle') {
        const pageTitle = getPageTitle();
        sendResponse({ pageTitle });
    }
});