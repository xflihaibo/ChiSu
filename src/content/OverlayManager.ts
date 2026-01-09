// src/content/OverlayManager.ts
import { RulerModule } from './RulerModule';
import { PickerModule } from './PickerModule';
import { InspectorModule } from './InspectorModule';
import { AssetModule } from './AssetModule';
import { StressTestModule } from './StressTestModule';

export class OverlayManager {
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private isActive: boolean = false;
  private rulerModule: RulerModule | null = null;
  private pickerModule: PickerModule | null = null;
  private inspectorModule: InspectorModule | null = null;
  private assetModule: AssetModule | null = null;
  private stressModule: StressTestModule | null = null;
  private currentMode: 'ruler' | 'picker' | 'inspector' | 'asset' | 'stress' = 'ruler';
  private isMobile: boolean = false;
  private indicatorPos: { top: number; left: number } | null = null;
  private isDraggingIndicator: boolean = false;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.checkMobile();
    this.initContainer();
    window.addEventListener('resize', () => {
      this.checkMobile();
      if (this.isActive) {
        this.updateIndicator();
      }
    });
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 500;
  }

  private initContainer() {
    this.container = document.createElement('div');
    this.container.id = 'devlens-root';
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '0';
    this.container.style.height = '0';
    this.container.style.zIndex = '2147483647';
    this.container.style.pointerEvents = 'none';

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    document.documentElement.appendChild(this.container);
    
    this.rulerModule = new RulerModule(this.shadowRoot);
    this.pickerModule = new PickerModule(this.shadowRoot);
    this.inspectorModule = new InspectorModule(this.shadowRoot);
    this.assetModule = new AssetModule(this.shadowRoot);
    this.stressModule = new StressTestModule(this.shadowRoot);
  }

  public toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.enable();
    } else {
      this.disable();
    }
  }

  private async enable() {
    if (!this.container || !this.shadowRoot) return;
    
    // 移除强制锁定滚动，允许用户在插件开启时滚动页面查看不同区域
    // document.body.style.overflow = 'hidden'; 
    
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    // 改为 none，让底层页面可以接收到滚动事件（如滚轮）
    this.container.style.pointerEvents = 'none'; 
    
    await this.switchMode(this.currentMode);
    this.updateIndicator();

    window.addEventListener('keydown', this.handleKeydown);
  }

  private async switchMode(mode: 'ruler' | 'picker' | 'inspector' | 'asset' | 'stress') {
    this.currentMode = mode;
    this.rulerModule?.unmount();
    this.pickerModule?.unmount();
    this.inspectorModule?.unmount();
    this.assetModule?.unmount();
    this.stressModule?.unmount();

    if (mode === 'ruler') {
      this.rulerModule?.mount();
    } else if (mode === 'picker') {
      await this.pickerModule?.mount();
    } else if (mode === 'inspector') {
      this.inspectorModule?.mount();
    } else if (mode === 'asset') {
      this.assetModule?.mount();
    } else if (mode === 'stress') {
      this.stressModule?.mount();
    }
    this.updateIndicator();
  }

  private updateIndicator() {
    if (!this.shadowRoot || !this.isActive) return;
    let indicator = this.shadowRoot.getElementById('mode-indicator') as HTMLDivElement;
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'mode-indicator';
      this.shadowRoot.appendChild(indicator);
      
      // 使用事件委托，避免重复绑定监听器
      indicator.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.mode-btn');
        if (btn) {
          const mode = btn.getAttribute('data-mode') as any;
          if (mode) this.switchMode(mode);
        }
      });

      // 绑定拖拽事件
      this.bindIndicatorDrag(indicator);
    }

    const baseStyle = `
        position: fixed;
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        font-family: -apple-system, system-ui, sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        pointer-events: auto;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        user-select: none;
        transition: ${this.isDraggingIndicator ? 'none' : 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'};
        cursor: move;
    `;

    const desktopStyle = `
        top: ${this.indicatorPos ? this.indicatorPos.top + 'px' : '15px'};
        left: ${this.indicatorPos ? this.indicatorPos.left + 'px' : '50%'};
        transform: ${this.indicatorPos ? 'none' : 'translateX(-50%)'};
        border-radius: 8px;
        padding: 2px;
        height: 30px;
        gap: 2px;
    `;

    const mobileStyle = `
        top: ${this.indicatorPos ? this.indicatorPos.top + 'px' : '10px'};
        left: ${this.indicatorPos ? this.indicatorPos.left + 'px' : '50%'};
        transform: ${this.indicatorPos ? 'none' : 'translateX(-50%)'};
        width: auto;
        min-width: 220px;
        max-width: 280px;
        border-radius: 8px;
        padding: 2px;
        height: 34px;
        gap: 2px;
        justify-content: center;
    `;

    indicator.style.cssText = baseStyle + (this.isMobile ? mobileStyle : desktopStyle);
    
    const modes = [
      { id: 'ruler', name: '测量', key: '1', icon: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M3 12h12M3 18h18"/></svg>' },
      { id: 'picker', name: '取色', key: '2', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3 3-9 9-3-3z"/><path d="M18 12l3 3-9 9-3-3z" opacity="0.5"/></svg>' },
      { id: 'inspector', name: '审查', key: '3', icon: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>' },
      { id: 'asset', name: '资源', key: '4', icon: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><polyline points="16 5 21 5 21 10"/><line x1="12" y1="12" x2="21" y2="3"/></svg>' },
      { id: 'stress', name: '边界', key: '5', icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>' }
    ];

    const dragHandle = `
      <div class="drag-handle" style="
        position: absolute;
        top: -6px;
        right: -6px;
        width: 14px;
        height: 14px;
        background: #3f51b5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: move;
        opacity: 0.6;
        transition: opacity 0.2s;
        z-index: 10;
      ">
        <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="5 9 2 12 5 15"></polyline>
          <polyline points="9 5 12 2 15 5"></polyline>
          <polyline points="15 19 12 22 9 19"></polyline>
          <polyline points="19 9 22 12 19 15"></polyline>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="12" y1="2" x2="12" y2="22"></line>
        </svg>
      </div>
    `;

    indicator.innerHTML = dragHandle + modes.map(m => `
      <div class="mode-btn ${this.currentMode === m.id ? 'active' : ''}" 
           data-mode="${m.id}"
           title="${m.name} (快捷键 ${m.key})"
           style="
            height: ${this.isMobile ? '30px' : '26px'};
            padding: 0 ${this.isMobile ? '8px' : '10px'};
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: ${this.currentMode === m.id ? '#fff' : '#888'};
            background: ${this.currentMode === m.id ? 'rgba(255,255,255,0.1)' : 'transparent'};
            border: 1px solid ${this.currentMode === m.id ? 'rgba(255,255,255,0.1)' : 'transparent'};
           ">
        ${m.icon}
        <span style="font-size: ${this.isMobile ? '9px' : '10px'}; font-weight: 700; display: ${this.isMobile && this.currentMode !== m.id ? 'none' : 'block'};">${m.name}</span>
      </div>
    `).join('') + `
      <style>
        .drag-handle:hover { opacity: 1 !important; }
      </style>
    `;
  }

  private bindIndicatorDrag(el: HTMLDivElement) {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      // 如果点击的是按钮，不触发拖拽
      if ((e.target as HTMLElement).closest('.mode-btn')) return;

      this.isDraggingIndicator = true;
      const rect = el.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      this.dragOffset = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };

      el.style.transition = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDraggingIndicator) return;
      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      let left = clientX - this.dragOffset.x;
      let top = clientY - this.dragOffset.y;

      // 边界限制
      const rect = el.getBoundingClientRect();
      left = Math.max(10, Math.min(left, window.innerWidth - rect.width - 10));
      top = Math.max(10, Math.min(top, window.innerHeight - rect.height - 10));

      this.indicatorPos = { top, left };
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.transform = 'none';
    };

    const handleEnd = () => {
      this.isDraggingIndicator = false;
      el.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    el.addEventListener('mousedown', handleStart);
    el.addEventListener('touchstart', handleStart, { passive: false });
  }

  private disable() {
    if (!this.container || !this.shadowRoot) return;
    
    // 还原页面滚动
    document.body.style.overflow = '';
    
    this.container.style.width = '0';
    this.container.style.height = '0';
    this.container.style.pointerEvents = 'none';
    
    this.rulerModule?.unmount();
    this.pickerModule?.unmount();
    this.shadowRoot.innerHTML = '';
    
    window.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.toggle();
    } else if (e.key === '1') {
      this.switchMode('ruler');
    } else if (e.key === '2') {
      this.switchMode('picker');
    } else if (e.key === '3') {
      this.switchMode('inspector');
    } else if (e.key === '4') {
      this.switchMode('asset');
    } else if (e.key === '5') {
      this.switchMode('stress');
    } else if (e.key.toLowerCase() === 'f' && this.currentMode === 'picker') {
      this.pickerModule?.toggleFormat();
    }
  }
}
