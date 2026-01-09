// src/content/OverlayManager.ts
import { RulerModule } from './RulerModule';
import { PickerModule } from './PickerModule';
import { InspectorModule } from './InspectorModule';

export class OverlayManager {
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private isActive: boolean = false;
  private rulerModule: RulerModule | null = null;
  private pickerModule: PickerModule | null = null;
  private inspectorModule: InspectorModule | null = null;
  private currentMode: 'ruler' | 'picker' | 'inspector' = 'ruler';

  constructor() {
    this.initContainer();
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
    
    // 锁定页面滚动
    document.body.style.overflow = 'hidden';
    
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.pointerEvents = 'auto';
    
    await this.switchMode(this.currentMode);
    this.updateIndicator();

    window.addEventListener('keydown', this.handleKeydown);
  }

  private async switchMode(mode: 'ruler' | 'picker' | 'inspector') {
    this.currentMode = mode;
    this.rulerModule?.unmount();
    this.pickerModule?.unmount();
    this.inspectorModule?.unmount();

    if (mode === 'ruler') {
      this.rulerModule?.mount();
    } else if (mode === 'picker') {
      await this.pickerModule?.mount();
    } else if (mode === 'inspector') {
      this.inspectorModule?.mount();
    }
    this.updateIndicator();
  }

  private updateIndicator() {
    if (!this.shadowRoot) return;
    let indicator = this.shadowRoot.getElementById('mode-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'mode-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(18, 18, 18, 0.9);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        padding: 4px;
        border-radius: 12px;
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        pointer-events: auto;
        z-index: 2147483647;
        display: flex;
        gap: 4px;
        user-select: none;
      `;
      this.shadowRoot.appendChild(indicator);
    }
    
    const modes = [
      { id: 'ruler', name: 'RULER', key: '1' },
      { id: 'picker', name: 'PICKER', key: '2' },
      { id: 'inspector', name: 'INSPECT', key: '3' }
    ];

    indicator.innerHTML = modes.map(m => `
      <div class="mode-btn ${this.currentMode === m.id ? 'active' : ''}" 
           style="
            padding: 8px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${this.currentMode === m.id ? '#fff' : '#999'};
            background: ${this.currentMode === m.id ? '#333' : 'transparent'};
            box-shadow: ${this.currentMode === m.id ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'};
            border: 1px solid ${this.currentMode === m.id ? '#444' : 'transparent'};
           ">
        <span style="opacity: ${this.currentMode === m.id ? '0.8' : '0.4'}; font-size: 9px; font-weight: 800;">${m.key}</span>
        ${m.name}
      </div>
    `).join('');

    // Add event listeners for mode buttons
    indicator.querySelectorAll('.mode-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const modeMap: ('ruler' | 'picker' | 'inspector')[] = ['ruler', 'picker', 'inspector'];
        this.switchMode(modeMap[idx]);
      });
    });
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
    } else if (e.key.toLowerCase() === 'f' && this.currentMode === 'picker') {
      this.pickerModule?.toggleFormat();
    }
  }
}
