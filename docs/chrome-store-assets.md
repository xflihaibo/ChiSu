# ChiSu (尺素) - Chrome Web Store 提交资料清单

此文档整理了将 ChiSu (尺素) 上传至 Chrome Web Store 所需的所有文案和素材建议。

---

## 1. 基础信息 (Basic Information)

*   **扩展名称 (Name)**: ChiSu (尺素) - 开发者像素助手
*   **简称 (Short Name)**: ChiSu
*   **版本号 (Version)**: 0.1.0
*   **一句话简介 (Summary/Short Description)**:
    *   **中文**: 专业级前端助手：集成高精度取色器(Color Picker)、多模式像素标尺(Ruler)与深度CSS审查(Inspector)。
    *   **English**: Pro DevTools: Pixel-perfect Color Picker, Multi-mode Ruler & Deep CSS Inspector for developers.

---

## 2. 详细描述 (Detailed Description)

### 中文版 (Chinese)
**ChiSu (尺素)：让前端调试更有“深度”**

ChiSu (尺素) 是一款专为网页开发者和 UI 设计师打造的沉浸式辅助工具。它通过无损的 Shadow DOM 技术注入，确保在任何复杂网页上都能稳定运行，且不产生样式冲突。

**主要功能：**
- 📏 **测量模式 (测量)**:
  - 顶部与左侧像素刻度尺（移动端自动缩放）。
  - 支持从刻度尺拖拽出无限量的参考线，拖回即可删除。
  - 智能标签避让：标注自动躲避屏幕边缘，确保测量数值永不遮挡。
- 🎨 **取色模式 (取色)**:
  - 10倍实时放大镜，针对 H5 优化“按住滑动取色，松开即复制”的高效交互。
  - 感知式快照刷新：滚动页面后秒速同步视图，告别取色偏差。
  - 支持 HEX、RGB、HSL 格式一键切换 (快捷键 F)。
- 🔍 **审查模式 (审查)**:
  - 盒子模型可视化：高亮 Margin (橙色) 与 Padding (绿色)。
  - 移动端浮层优化：大圆角精致卡片，展示 Font、Color 及详细 Box Model 间距。
  - 一键复制：卡片内所有 CSS 属性点击即得。
- 📦 **资源采集 (资源)**:
  - 自动提取全页色彩方案、字体清单及所有图片/SVG。
  - 提供 4 列瀑布流视图，支持图片链接一键复制。
- 🎯 **边界模式 (边界)**:
  - WYSIWYG 编辑：直接修改页面文字，测试极端排版表现。
  - 压力测试工具箱：支持内容翻倍、暴力填充及局部还原。

**为什么选择 ChiSu？**
- **全平台适配**: 完美支持 PC 与移动端 H5 调试。
- **灵动菜单**: 模式选择器支持自由拖拽，随心放置，不挡视野。
- **沉浸式体验**: 按下 Esc 键开启，不禁用页面滚动，边走边调。
- **零冲突**: 采用 Shadow DOM 隔离，不污染原网页样式。

---

### 英文版 (English)
**ChiSu: Bring Depth to Your Frontend Workflow**

ChiSu is an immersive browser extension designed for web developers and UI designers. Powered by Shadow DOM technology, it provides high-precision tools directly on any webpage without style leakage or conflicts.

**Key Features:**
- 📏 **Ruler Mode**:
  - Auto-scaling pixel rulers for both Desktop and Mobile.
  - Drag and drop unlimited guidelines; drag back to ruler to delete.
  - Smart Boundary Avoidance: Labels automatically shift to stay visible near screen edges.
- 🎨 **Picker Mode**:
  - 10x real-time loupe with advanced mobile interaction (Press-to-sample, Release-to-copy).
  - Perceptive Snapshot Sync: Automatically refreshes content after scrolling for perfect accuracy.
  - Quick format switching (HEX/RGB/HSL) with the 'F' key.
- 🔍 **Inspector Mode**:
  - Visual Box Model: Real-time highlights for Margin (Orange) and Padding (Green).
  - Responsive Property Card: View and copy Font, Color, and detailed Box Model values.
- 📦 **Asset Collector**:
  - Automatically extract color palettes, fonts, and all images/SVGs from the page.
  - 4-column thumbnail grid with one-click image URL copying.
- 🎯 **Boundary Mode (Stress Test)**:
  - WYSIWYG Editing: Modify any text directly to test layout resilience.
  - Content Stress Tools: Multiply text, fill with placeholders, or reset instantly.

**Why ChiSu?**
- **Mobile Optimized**: Full touch support and responsive UI for H5 debugging.
- **Draggable Menu**: Move the mode indicator anywhere to stay out of your way.
- **Immersive & Non-blocking**: Toggle with Esc without disabling native page scrolling.
- **Pure Performance**: Isolated with Shadow DOM and rendered via High-performance Canvas.

---

## 3. 视觉素材建议 (Visual Assets)

### 图标 (Icons)
*   **128x128**: 已生成 `public/icons/icon.png` (请确保使用最新版圆形 Logo 转换)。

### 屏幕截图 (Screenshots)
*   **建议数量**: 至少 3 张。
*   **规格**: 1280x800 或 640x400。
*   **内容建议**:
    1.  **展示测量模式**: 截取带有多条紫色参考线和像素标注的网页。
    2.  **展示取色模式**: 展示放大镜正在取色，且下方有色彩格式提示。
    3.  **展示审查模式**: 选中一个复杂元素，展示橙/绿高亮及右侧的专业属性卡片。

### 宣传图 (Promotional Tiles)
*   **Small Tile (440x280)**: 放置 Logo 和大字标题。
*   **Large Tile (920x680)**: 展示插件在精美网页上运行的实拍图。
*   **Marquee (1400x560)**: 品牌背景图，突出“Pro-grade DevTools”字样。

---

## 4. 其他配置 (Other Configs)

*   **类别 (Category)**: 开发人员工具 (Developer Tools)
*   **语言 (Language)**: 中文 (简体), English
*   **隐私权披露 (Privacy)**:
    *   本插件不收集任何个人数据。
    *   仅需要 `activeTab` 权限以获取当前页面的视觉信息进行取色。
