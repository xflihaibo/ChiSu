// src/background/index.ts
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SCREEN') {
    chrome.tabs.captureVisibleTab(
      (sender.tab?.windowId as number),
      { format: 'png' },
      (dataUrl) => {
        sendResponse({ dataUrl });
      }
    );
    return true; // Keep message channel open for async response
  }
});

console.log('DevLens background script loaded.');
