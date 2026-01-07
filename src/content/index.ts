// src/content/index.ts
import { OverlayManager } from './OverlayManager';

const overlayManager = new OverlayManager();

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_OVERLAY') {
    overlayManager.toggle();
  }
});

console.log('DevLens content script loaded.');
