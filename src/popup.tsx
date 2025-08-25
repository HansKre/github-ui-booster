// Immediately open options page and close popup
void chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
window.close();
