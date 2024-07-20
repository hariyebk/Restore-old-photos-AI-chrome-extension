// we are listening for an event that when the user first installs this extension, we will open a new tab to display our welcome page
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // https://www.youtube.com/watch?v=FN3r-k_EMgg
        chrome.tabs.create({ url: 'https://www.youtube.com/watch?v=FN3r-k_EMgg' });
    }
});

// Listening for expand action to open the extension in a new window
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'expand') {
        chrome.windows.create({
            url: chrome.runtime.getURL('popup.html'),
            type: 'popup',
            width: 800,
            height: 600
        });
    }
});