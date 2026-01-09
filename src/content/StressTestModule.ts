// src/content/StressTestModule.ts
export class StressTestModule {
  private shadowRoot: ShadowRoot;
  private activeElement: HTMLElement | null = null;
  private toolbar: HTMLDivElement | null = null;
  private hint: HTMLDivElement | null = null;
  // 存储元素的原始内容
  private originalContents: Map<HTMLElement, string> = new Map();

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
  }

  public mount() {
    // 开启全局设计模式
    document.designMode = 'on';
    document.addEventListener('mousedown', this.handleMouseDown, true);
    document.addEventListener('touchstart', this.handleMouseDown, { passive: true, capture: true });
    // 拦截点击事件，防止跳转
    document.addEventListener('click', this.handleGlobalClick, true);
    this.showHint();
  }

  public unmount() {
    document.designMode = 'off';
    document.removeEventListener('mousedown', this.handleMouseDown, true);
    document.removeEventListener('touchstart', this.handleMouseDown, true);
    document.removeEventListener('click', this.handleGlobalClick, true);
    this.removeToolbar();
    this.removeHint();
  }

  private handleGlobalClick = (e: MouseEvent) => {
    const path = e.composedPath();
    const isPluginUI = path.some(el => {
      const id = (el as HTMLElement).id;
      return id === 'mode-indicator' || id === 'stress-toolbar' || id === 'format-indicator' || id === 'asset-panel' || id === 'devlens-inspector-card';
    });

    // 如果不是插件 UI，拦截点击以防止链接跳转
    if (!isPluginUI) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private handleMouseDown = (e: MouseEvent | TouchEvent) => {
    const path = e.composedPath();
    const host = this.shadowRoot.host as HTMLElement;

    // 更加严谨的插件 UI 排除逻辑，防止切换模式或点击工具条时触发底层的编辑
    const isPluginUI = path.some(el => {
      const id = (el as HTMLElement).id;
      return id === 'mode-indicator' || id === 'stress-toolbar' || id === 'format-indicator' || id === 'asset-panel' || id === 'devlens-inspector-card';
    });

    if (isPluginUI) return;

    // 只有在非触摸事件，或者确定不是在滚动的触摸开始时才拦截
    // 注意：如果是 touchstart，不要立即 e.preventDefault()，否则会禁用移动端滚动
    if (!('touches' in e)) {
      e.preventDefault();
    }

    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // 穿透 Shadow DOM 容器获取底层的真实元素
    const originalPointerEvents = host.style.pointerEvents;
    host.style.pointerEvents = 'none';
    const realTarget = document.elementFromPoint(clientX, clientY) as HTMLElement;
    host.style.pointerEvents = originalPointerEvents;

    if (!realTarget || realTarget === document.documentElement || realTarget === document.body) {
      this.removeToolbar();
      return;
    }

    this.activeElement = realTarget;
    
    // 如果是第一次点这个元素，记录它的原始内容用于还原
    if (!this.originalContents.has(this.activeElement)) {
      this.originalContents.set(this.activeElement, this.activeElement.innerText || this.activeElement.textContent || '');
    }
    
    // 确保元素可编辑并获取焦点
    this.activeElement.contentEditable = 'true';
    this.activeElement.focus();
    
    // 渲染工具条
    this.renderToolbar(clientX, clientY);
  };

  private renderToolbar(x: number, y: number) {
    this.removeToolbar();

    this.toolbar = document.createElement('div');
    this.toolbar.id = 'stress-toolbar';
    
    const isMobile = window.innerWidth <= 500;
    
    // 智能定位：如果是移动端，工具条悬浮在元素上方一点，避免手指遮挡
    const top = isMobile ? Math.max(20, y - 60) : y + 15;
    const left = Math.min(Math.max(10, x - 80), window.innerWidth - (isMobile ? 220 : 260));

    this.toolbar.style.cssText = `
      position: fixed;
      top: ${top}px;
      left: ${left}px;
      background: linear-gradient(165deg, rgba(35, 35, 35, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 2147483647;
      box-shadow: 
        0 10px 40px rgba(0,0,0,0.5),
        inset 0 0 0 1px rgba(255,255,255,0.03);
      pointer-events: auto;
      animation: pop-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    `;

    // 添加右上角关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.id = 'close-stress-toolbar';
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.style.cssText = `
      position: absolute;
      top: -6px;
      right: -6px;
      width: 16px;
      height: 16px;
      background: #444;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1);
      opacity: 0.8;
      transition: all 0.2s;
    `;
    closeBtn.onmouseenter = () => { closeBtn.style.opacity = '1'; closeBtn.style.background = '#ff4444'; };
    closeBtn.onmouseleave = () => { closeBtn.style.opacity = '0.8'; closeBtn.style.background = '#444'; };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.removeToolbar();
    };
    this.toolbar.appendChild(closeBtn);

    const actions = [
      { label: '×2', title: '内容翻倍', color: '#eee', bg: 'rgba(255,255,255,0.06)', action: () => this.multiplyText(2) },
      { label: '×5', title: '暴力填充', color: '#eee', bg: 'rgba(255,255,255,0.06)', action: () => this.multiplyText(5) },
      { 
        label: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>', 
        title: '清空内容', color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', action: () => this.clearText() 
      },
      { label: '还原', title: '恢复初始内容', color: '#fff', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', action: () => this.resetElement() }
    ];

    actions.forEach(item => {
      const btn = document.createElement('button');
      btn.innerHTML = item.label;
      btn.title = item.title;
      btn.style.cssText = `
        background: ${item.bg};
        border: none;
        color: ${item.color};
        padding: ${isMobile ? '6px 12px' : '8px 14px'};
        font-size: ${isMobile ? '11px' : '12px'};
        font-weight: 600;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: ${item.label.includes('svg') ? '34px' : '48px'};
        box-shadow: ${item.bg.startsWith('linear') ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'};
      `;
      
      btn.onmouseenter = () => {
        btn.style.filter = 'brightness(1.3)';
        btn.style.transform = 'translateY(-1px)';
      };
      btn.onmouseleave = () => {
        btn.style.filter = 'brightness(1)';
        btn.style.transform = 'translateY(0)';
      };
      btn.onclick = (e) => {
        e.stopPropagation();
        item.action();
      };
      this.toolbar!.appendChild(btn);
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pop-in {
        from { transform: scale(0.9) translateY(10px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
      }
    `;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.toolbar);
  }

  private multiplyText(times: number) {
    if (!this.activeElement) return;
    const text = this.activeElement.innerText || this.activeElement.textContent || '';
    if (!text.trim()) return;
    // 使用更现代的方式插入文本
    const newText = new Array(times).fill(text).join(' ');
    this.activeElement.innerText = newText;
    this.activeElement.focus();
  }

  private clearText() {
    if (this.activeElement) {
      this.activeElement.innerText = '';
      this.activeElement.focus();
    }
  }

  private resetElement() {
    if (this.activeElement && this.originalContents.has(this.activeElement)) {
      this.activeElement.innerText = this.originalContents.get(this.activeElement)!;
      this.activeElement.focus();
    }
  }

  private removeToolbar() {
    this.toolbar?.remove();
    this.toolbar = null;
  }

  private showHint() {
    this.hint = document.createElement('div');
    const isMobile = window.innerWidth <= 500;
    
    // 采用更具“ChiSu 品牌感”的深紫渐变边框提示条
    this.hint.style.cssText = `
      position: fixed;
      top: ${isMobile ? '65px' : '75px'};
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(180deg, rgba(30, 30, 30, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      color: #fff;
      padding: ${isMobile ? '6px 14px' : '10px 20px'};
      border-radius: 6px;
      font-size: ${isMobile ? '11px' : '12px'};
      font-weight: 600;
      z-index: 2147483647;
      box-shadow: 
        0 10px 40px rgba(0,0,0,0.5),
        inset 0 0 0 1px rgba(255,255,255,0.05);
      pointer-events: none;
      white-space: nowrap;
      border: 1px solid rgba(99, 102, 241, 0.3); /* 品牌紫色半透边框 */
      display: flex;
      align-items: center;
      gap: 10px;
      animation: hint-pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    `;

    const style = document.createElement('style');
    style.id = 'stress-hint-style';
    style.textContent = `
      @keyframes hint-pop {
        from { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
    `;
    this.shadowRoot.appendChild(style);
    
    this.hint.innerHTML = `
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 12px #6366f1;"></div>
      <span>${isMobile ? '边界模式：点击文字修改' : '已进入边界模式：点击文字直接修改或批量翻倍'}</span>
    `;
    this.shadowRoot.appendChild(this.hint);
  }

  private removeHint() {
    this.hint?.remove();
    this.hint = null;
    this.shadowRoot.getElementById('stress-hint-style')?.remove();
  }
}
