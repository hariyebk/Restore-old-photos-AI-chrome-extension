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
        // Make the new window 50% of the screen size
        chrome.system.display.getInfo((displays) => {
            const primaryDisplay = displays[0];
            const width = Math.floor(primaryDisplay.bounds.width * 0.6);
            const height = Math.floor(primaryDisplay.bounds.height * 0.75);

            // Create the new window with 50% of the screen size
            chrome.windows.create({
                url: chrome.runtime.getURL('newPopup.html'),
                type: 'popup',
                width: width,
                height: height
            });
        });
    }
});