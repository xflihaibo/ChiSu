// src/content/InspectorModule.ts
export class InspectorModule {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isActive: boolean = false;
  private hoveredElement: HTMLElement | null = null;
  private lockedCard: HTMLDivElement | null = null;

  constructor(private container: ShadowRoot) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // Canvas doesn't block pointer for DOM interaction
    this.ctx = this.canvas.getContext('2d')!;
    
    this.setupListeners();
  }

  public mount() {
    this.isActive = true;
    this.container.appendChild(this.canvas);
    this.resize();
    this.render();
    
    // Enable pointer events on the container to detect elements below
    (this.container.host as HTMLElement).style.pointerEvents = 'auto';
    
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
  }

  public unmount() {
    this.isActive = false;
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.lockedCard) {
      this.lockedCard.remove();
      this.lockedCard = null;
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);
    this.hoveredElement = null;
  }

  private setupListeners() {
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isActive) return;

    // Temporarily disable overlay to get element under mouse
    const host = this.container.host as HTMLElement;
    host.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    host.style.pointerEvents = 'auto';

    if (el && el !== this.hoveredElement && el !== document.documentElement && el !== document.body) {
      this.hoveredElement = el;
      this.render();
    }
  }

  private handleClick = (e: MouseEvent) => {
    if (!this.isActive || !this.hoveredElement) return;

    // Check if the click is actually on a UI element inside Shadow DOM
    const path = e.composedPath();
    const host = this.container.host as HTMLElement;
    
    // If the first element in the path is NOT the host, 
    // it means we clicked on a UI component inside the shadow root.
    if (path[0] !== host) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this.showInspectorCard(this.hoveredElement, e.clientX, e.clientY);
  }

  private render() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.ctx.clearRect(0, 0, width, height);

    if (!this.hoveredElement) return;

    const rect = this.hoveredElement.getBoundingClientRect();
    const style = window.getComputedStyle(this.hoveredElement);

    const parse = (val: string) => parseFloat(val) || 0;

    const mt = parse(style.marginTop);
    const mb = parse(style.marginBottom);
    const ml = parse(style.marginLeft);
    const mr = parse(style.marginRight);

    const pt = parse(style.paddingTop);
    const pb = parse(style.paddingBottom);
    const pl = parse(style.paddingLeft);
    const pr = parse(style.paddingRight);

    // Draw Margin (Orange)
    this.ctx.fillStyle = 'rgba(246, 178, 107, 0.66)';
    // Top
    this.ctx.fillRect(rect.left, rect.top - mt, rect.width, mt);
    // Bottom
    this.ctx.fillRect(rect.left, rect.bottom, rect.width, mb);
    // Left
    this.ctx.fillRect(rect.left - ml, rect.top - mt, ml, rect.height + mt + mb);
    // Right
    this.ctx.fillRect(rect.right, rect.top - mt, mr, rect.height + mt + mb);

    // Draw Padding (Green)
    this.ctx.fillStyle = 'rgba(147, 196, 125, 0.55)';
    // Top
    this.ctx.fillRect(rect.left, rect.top, rect.width, pt);
    // Bottom
    this.ctx.fillRect(rect.left, rect.bottom - pb, rect.width, pb);
    // Left
    this.ctx.fillRect(rect.left, rect.top + pt, pl, rect.height - pt - pb);
    // Right
    this.ctx.fillRect(rect.right - pr, rect.top + pt, pr, rect.height - pt - pb);

    // Draw Content (Blue highlight)
    this.ctx.strokeStyle = '#38761d';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
  }

  private showInspectorCard(el: HTMLElement, x: number, y: number) {
    if (this.lockedCard) this.lockedCard.remove();

    const style = window.getComputedStyle(el);
    const card = document.createElement('div');
    card.id = 'devlens-inspector-card';
    card.style.cssText = `
      position: fixed;
      top: ${Math.min(y + 24, window.innerHeight - 340)}px;
      left: ${Math.min(x + 24, window.innerWidth - 300)}px;
      width: 260px;
      background: #1a1a1a;
      color: #fff;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
      z-index: 10000;
      pointer-events: auto;
      overflow: hidden;
      animation: card-appear 0.2s ease-out;
    `;

    const colorHex = this.rgbToHex(style.color);

    const mt = style.marginTop;
    const mb = style.marginBottom;
    const ml = style.marginLeft;
    const mr = style.marginRight;

    const pt = style.paddingTop;
    const pb = style.paddingBottom;
    const pl = style.paddingLeft;
    const pr = style.paddingRight;

    card.innerHTML = `
      <style>
        @keyframes card-appear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .card-header {
          background: #222;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 11px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .card-body { padding: 16px; }
        .prop-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 12px;
          align-items: baseline;
        }
        .prop-label { color: #666; font-size: 12px; }
        .prop-value { color: #ddd; font-weight: 500; text-align: right; }
        .copyable { 
          background: #2a2a2a;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .copyable:hover { background: #333; color: #fff; }
        .color-preview {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.1);
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
        }
        .box-model-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #333;
        }
        .box-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .box-label { font-size: 9px; color: #555; text-transform: uppercase; }
        .box-value { font-size: 11px; color: #999; }
      </style>
      <div class="card-header">
        <span>Properties</span>
        <span style="cursor: pointer; font-size: 14px;" id="close-card">×</span>
      </div>
      <div class="card-body">
        <div class="prop-row">
          <span class="prop-label">Font</span>
          <span class="prop-value copyable" data-val="${style.fontFamily}" style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${style.fontFamily.split(',')[0].replace(/['"]/g, '')}
          </span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Size</span>
          <span class="prop-value copyable" data-val="${style.fontSize}">${style.fontSize}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Weight</span>
          <span class="prop-value copyable" data-val="${style.fontWeight}">${style.fontWeight}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Line Height</span>
          <span class="prop-value copyable" data-val="${style.lineHeight}">${style.lineHeight}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Color</span>
          <span class="prop-value copyable" data-val="${colorHex}">
            <span class="color-preview" style="background: ${style.color}"></span>${colorHex}
          </span>
        </div>
        
        <div class="box-model-grid">
          <div class="box-item">
            <span class="box-label" style="color: #f6b26b;">Margin</span>
            <span class="box-value copyable" data-val="margin: ${mt} ${mr} ${mb} ${ml}">${mt} ${mr} ${mb} ${ml}</span>
          </div>
          <div class="box-item">
            <span class="box-label" style="color: #93c47d;">Padding</span>
            <span class="box-value copyable" data-val="padding: ${pt} ${pr} ${pb} ${pl}">${pt} ${pr} ${pb} ${pl}</span>
          </div>
        </div>
      </div>
    `;

    card.querySelector('#close-card')?.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止点击关闭按钮时触发下方的 window.click 事件再次打开卡片
      card.remove();
      this.lockedCard = null;
    });
    
    card.querySelectorAll('.copyable').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const val = target.dataset.val;
        if (val) {
          navigator.clipboard.writeText(val);
          const originalBg = target.style.background;
          target.style.background = '#444';
          this.showToast(`已复制: ${val}`);
          setTimeout(() => { target.style.background = originalBg; }, 300);
        }
      });
    });

    this.lockedCard = card;
    this.container.appendChild(card);

    // 防止点击卡片内部时触发 window 的 click 事件导致重新生成卡片
    card.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  private rgbToHex(rgb: string) {
    const match = rgb.match(/\d+/g);
    if (!match) return rgb;
    const [r, g, b] = match.map(Number);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  private showToast(msg: string) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #222;
      color: #fff;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.3px;
      border: 1px solid #333;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10000;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: toast-in-out 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    `;
    
    toast.innerHTML = `
      <style>
        @keyframes toast-in-out {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
      </style>
      <span style="color: #4CAF50;">✓</span>
      <span>${msg}</span>
    `;
    
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}
