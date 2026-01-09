# ChiSu (尺素) Chrome 插件项目指南

## 概述
ChiSu (尺素) 是一款纯前端开发的专业级 Chrome 插件，专为前端开发者和设计师设计，提供高精度的像素测量、实时取色、盒子模型审查、网页资源采集及内容压力测试功能。

## 架构
- **构建工具**: Vite + @crxjs/vite-plugin
- **环境**: Chrome Extension (Manifest V3)
- **UI 隔离**: 采用 Shadow DOM 技术，确保插件 UI 与原网页样式完全隔离，零冲突。
- **渲染引擎**:
    - **Canvas 图层**: 用于高性能绘制刻度尺、动态网格、持久化标线、间距标注及盒子模型高亮层。
    - **位图采样**: 通过 `captureVisibleTab` 获取视口截图，支持在滚动后实时更新快照，确保取色精准度。

## 命名空间 (Namespaces)
- `overlay`: 全局状态管理、模式切换及可拖拽式菜单 UI。
- `ruler`: 像素标尺逻辑，支持触摸事件、智能边界避让及标线持久化。
- `picker`: 取色逻辑，支持 H5 长按交互、感知式滚动同步及多格式切换。
- `inspector`: 盒子模型审查，提供 Padding/Margin 高亮及详细属性复制卡片。
- `asset`: 静态资源扫描，自动提取配色、字体及图片。
- `stress`: 边界压力测试，支持 WYSIWYG 编辑及内容快速填充。

## 核心组件与交互
- **OverlayManager**: 核心控制器，负责模块挂载/卸载及灵动菜单（Mode Indicator）的渲染与拖拽。
- **Responsive UI**: 所有弹窗（审查卡片、资源面板）均支持 PC 浮窗与移动端居中卡片的自适应切换。
- **Touch Compatibility**: 深度适配触摸事件，解决了移动端 `changedTouches` 坐标定位及滚动冲突问题。
- **Smart Logic**: 标尺标签自动避让屏幕边缘；取色器在移动端自动偏移防止手指遮挡。

## 视觉设计与资源
- **主题色**: 靛蓝 (`#4F46E5`)、高饱和洋红 (`#FF00FF`)。
- **Logo**: 圆形集成设计，融合了直尺与吸色器元素。
- **资源路径**:
    - `public/icons/icon.svg`: 矢量源码。
    - `docs/chrome-store-assets.md`: 完整的应用商店上架文案（中英双语）。

## 开发规范
- **非阻塞式设计**: 插件开启时不禁用 `overflow: hidden`，允许用户边滚动边调试。
- **事件穿透**: 使用 `pointer-events: none` 结合点击定位逻辑，实现 UI 层与原网页的高效交互。
- **Passive Events**: 触摸监听器默认使用 `passive: true` 以优化滚动性能。
