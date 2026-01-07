# ChiSu (尺素) Chrome 插件项目指南

## 概述
ChiSu (尺素) 是一款纯前端开发的 Chrome 插件，专为开发者设计，提供高精度的设计稿比对、取色和间距测量功能。

## 架构
- **构建工具**: Vite
- **环境**: Chrome Extension (Manifest V3)
- **UI 隔离**: 使用 Shadow DOM 防止样式冲突。
- **渲染引擎**:
    - **Canvas 图层**: 用于绘制刻度尺、标线、距离标注和盒子模型高亮。
    - **快照采样**: 使用 `captureVisibleTab` 获取视口位图进行精准取色。

## 命名空间 (Namespaces)
- `overlay`: 全屏 Canvas 绘制与交互事件管理。
- `tools`: 取色器、尺子、审查器的逻辑实现。
- `storage`: 用户偏好和历史记录的本地持久化。

## 核心组件
- `ModeController`: 顶部模式切换条（测量/取色/审查）。
- `Loupe`: 取色放大镜 UI。
- `GuideManager`: 管理多条标线的创建、拖拽和间距计算。
- `InspectorCard`: 悬浮显示的文字排版属性详情。
- `BoxModelOverlay`: 在 Canvas 上绘制 Padding (绿) 和 Margin (橙)。

## 视觉设计与资源
- **主题色**: 靛蓝 (`#4F46E5`)、洋红 (`#FF00FF`)。
- **Logo 设计**: 圆形结构，融合了放大镜与尺子手柄。
- **图标资源**: `public/icons/icon.svg`。
- **商店资料**: `docs/chrome-store-assets.md` 包含完整的上架文案和素材建议。