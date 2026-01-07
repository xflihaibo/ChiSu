---
title: '[Implementation] DevLens Picker Mode & Magnifier'
type: note
permalink: devlens/implementation/implementation-dev-lens-picker-mode-magnifier
---

# [Implementation] DevLens Picker Mode & Magnifier

## Summary
Implemented the Picker Mode with a high-precision magnifying glass (Loupe) for DevLens.

## Key Features Added
- **Screen Capturing**: Background script now supports `CAPTURE_SCREEN` message using `chrome.tabs.captureVisibleTab` to provide viewport snapshots.
- **Magnifying Glass (Loupe)**: 
    - Real-time circular magnifier centered on the mouse.
    - 10x zoom level.
    - Crosshair and center-pixel highlight.
    - Floating HEX color label attached to the Loupe.
- **Color Picking**:
    - Pixel-level sampling from the captured snapshot.
    - Automatic color conversion (RGB to HEX).
    - **Click-to-Copy**: Copies the HEX code to the clipboard and shows a visual toast notification.
- **Mode Switching**:
    - Implemented a state machine in `OverlayManager` to switch between modes using keys `1` (Ruler) and `2` (Picker).
    - Updated the HUD indicator to reflect the current mode and instructions.

## Files Modified/Created
- `src/background/index.ts`: Added screen capture message handler.
- `src/content/PickerModule.ts`: New module for color picking logic and Loupe rendering.
- `src/content/OverlayManager.ts`: Added mode switching and picker module integration.
