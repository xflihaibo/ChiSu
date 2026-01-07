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
- 📏 **测量模式 (Ruler Mode)**:
  - 顶部与左侧像素刻度尺。
  - 支持从刻度尺拖拽出无限量的水平/垂直参考线。
  - 自动测量平行参考线间的像素距离。
  - 标线支持再次拖拽调整。

- 🎨 **取色模式 (Picker Mode)**:
  - 10倍实时放大镜，像素级准确定位。
  - 支持 HEX、RGB、HSL 格式一键切换 (快捷键 F)。
  - 自动复制到剪贴板，并提供实时 Toast 提示。

- 🔍 **审查模式 (Inspector Mode)**:
  - 盒子模型可视化：高亮 Margin (橙色) 与 Padding (绿色)。
  - 详尽属性卡片：一键查看并复制 Font, Size, Weight, Line Height, Color。
  - 穿透点击：锁定元素详情，对比更方便。

**为什么选择 ChiSu？**
- **沉浸式体验**: 按下 Esc 键开启，全屏覆盖，专注调试。
- **极致性能**: 基于 Canvas 渲染，即使在长网页上也丝滑顺畅。
- **零冲突**: 采用 Shadow DOM 隔离，不污染原网页样式。
- **纯前端**: 无需服务器，保护隐私。

---

### 英文版 (English)
**ChiSu: Bring Depth to Your Frontend Workflow**

ChiSu is an immersive browser extension designed for web developers and UI designers. Powered by Shadow DOM technology, it provides high-precision tools directly on any webpage without style leakage or conflicts.

**Key Features:**
- 📏 **Ruler Mode**:
  - Horizontal and vertical pixel rulers.
  - Drag and drop unlimited guidelines from rulers.
  - Automatic distance measurement between parallel guides.
  - Re-draggable guidelines for easy adjustment.

- 🎨 **Picker Mode**:
  - 10x real-time loupe for pixel-perfect sampling.
  - Switch between HEX, RGB, and HSL formats (Shortcut: F).
  - One-click copy with instant visual feedback.

- 🔍 **Inspector Mode**:
  - Visual Box Model: Highlights Margin (Orange) and Padding (Green).
  - Detailed Property Card: View and copy Font, Size, Weight, Line Height, and Color.
  - Stay focused: Lock element details for easy comparison.

**Why ChiSu?**
- **Immersive Mode**: Toggle with Esc for a dedicated workspace.
- **High Performance**: Canvas-based rendering for 60fps performance on any page.
- **Isolated UI**: Built with Shadow DOM to prevent CSS conflicts.
- **Privacy First**: Runs entirely in your browser. No data leaves your machine.

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
