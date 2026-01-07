# ChiSu (尺素) 设计规范

**日期**: 2026-01-07
**状态**: 已验证
**项目类型**: 纯前端 Chrome 插件 (Manifest V3)
**构建工具**: Vite

## 1. 概述
ChiSu (尺素) 是一款为开发者打造的沉浸式专业级插件。它允许开发者在不干扰网页原始交互的情况下，进行高精度的颜色提取、距离测量和元素排版/盒子模型审查。项目完全基于前端技术实现，无服务器依赖。

## 2. 架构与设计原则
- **沉浸式图层 (Immersive Overlay)**：使用 `Shadow DOM` 注入全屏 `Canvas` 图层，冻结页面交互，确保插件 UI 与原网页样式完全隔离。
- **纯前端驱动**：所有计算（像素采样、几何计算、DOM 分析）均在浏览器端完成。
- **模式隔离**：提供三种独立模式，通过快捷键切换，避免功能冲突和视觉混乱。
- **现代化构建**：使用 **Vite** 进行模块化开发和快速打包。

## 3. 核心功能模块

### 3.1 模式 1：测量模式 (Ruler Mode)
- **视觉呈现**：
    - 屏幕顶部和左侧显示像素刻度尺。
    - 背景提供可选的 8px/10px 参考网格。
- **交互逻辑**：
    - 从刻度尺向内拖拽可生成水平或垂直标线。
    - 平行标线之间自动标注像素距离 (`px`)。
    - 标线支持靠近 DOM 元素边界时自动吸附。

### 3.2 模式 2：取色模式 (Picker Mode)
- **视觉呈现**：
    - 高倍（10x）圆形放大镜，带精准十字准星。
- **交互逻辑**：
    - 基于视口快照进行实时像素采样。
    - 支持多种格式：HEX, RGB, HSL, OKLCH。
    - 点击即复制颜色代码到剪贴板。

### 3.3 模式 3：审查模式 (Inspector Mode)
- **视觉呈现**：
    - 悬停时自动高亮元素的 Padding（绿色）和 Margin（橙色）区域。
    - 选中元素后显示浮动的属性详情卡片。
    - 采用 Chrome DevTools 标准配色。
- **交互逻辑**：
    - 点击元素“锁定”详情卡片，可同时对比多个元素。
    - 提取关键排版参数：font-family, font-size, line-height, weight。

## 4. 技术实现细节
- **Vite 配置**：利用 `vite-plugin-chrome-extension` 或手动配置多入口编译 `content_scripts` 和 `background`。
- **Shadow DOM**：确保插件 UI 样式不溢出，也不受原网页 `!important` 样式影响。
- **Canvas API**：用于绘制刻度尺、标线、网格和盒子模型高亮。
- **captureVisibleTab**：获取视口快照，用于高性能的像素采样。
- **状态管理**：使用轻量级的响应式状态管理模式切换和测量数据。

## 5. 文件结构 (Vite 模式)
```text
/devlens
  ├── manifest.json
  ├── package.json
  ├── vite.config.ts
  ├── src
  │   ├── background
  │   │   └── index.ts      (处理命令与快照截图)
  │   ├── content
  │   │   ├── index.ts      (Shadow DOM 注入入口)
  │   │   ├── Overlay.ts    (Canvas 渲染核心)
  │   │   ├── Ruler.ts      (标线与网格逻辑)
  │   │   ├── Picker.ts     (取色放大镜逻辑)
  │   │   └── Inspector.ts  (元素审查逻辑)
  │   └── ui
  │       ├── components    (Vue/React 或 Vanilla UI 组件)
  │       └── styles.css
  └── docs
      └── plans
```

## 6. 验收标准
- 测量与取色的像素级精度。
- 在复杂/长网页上的渲染性能流畅（保持 60fps）。
- 插件 UI 与各种网页样式的完美兼容（不冲突）。
