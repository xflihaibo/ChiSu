---
title: '[Project Info] DevLens - Project Overview'
type: note
permalink: devlens/project-info-dev-lens-project-overview
---

# [Project Info] DevLens - Project Overview

## Purpose
A Chrome extension for developers to pick colors, measure distances with multiple guidelines, and inspect element typography/box models in an immersive, serverless environment.

## Key Features
1. **Ruler Mode**: Drag multiple guidelines with automatic distance marking.
2. **Picker Mode**: High-magnification loupe with multi-format color support (HEX, RGB, HSL, OKLCH).
3. **Inspector Mode**: Click-to-lock font details and automatic padding/margin highlighting.
4. **Immersive Overlay**: Full-screen mode switching to avoid interference from original web interactions.

## Technical Decisions
- Use **Shadow DOM** for UI isolation.
- Use **Canvas** for drawing all measurement and inspection graphics.
- **Pure Frontend**: No external server dependencies.
- **EyeDropper API** and **captureVisibleTab** for color sampling.
- **State-based Tool Switching**: Explicit modes (1, 2, 3) to prevent feature conflict.
