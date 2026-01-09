// src/content/AssetModule.ts
export class AssetModule {
  private container: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot;
  private assets: {
    images: string[];
    svgs: string[];
    fonts: Set<string>;
    colors: string[];
  } = {
    images: [],
    svgs: [],
    fonts: new Set(),
    colors: []
  };

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
  }

  public mount() {
    this.scanAssets();
    this.render();
  }

  public unmount() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  private scanAssets() {
    this.assets = { images: [], svgs: [], fonts: new Set(), colors: [] };
    const colorCounts: Record<string, number> = {};

    // 1. 扫描所有元素
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);

      // 提取颜色
      ['color', 'backgroundColor'].forEach(prop => {
        const color = style.getPropertyValue(prop);
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }
      });

      // 提取字体
      const fontFamily = style.fontFamily;
      if (fontFamily) {
        fontFamily.split(',').forEach(f => this.assets.fonts.add(f.trim().replace(/['"]/g, '')));
      }

      // 提取背景图
      const bgImg = style.backgroundImage;
      if (bgImg && bgImg !== 'none' && bgImg.includes('url(')) {
        const url = bgImg.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
        if (url) this.assets.images.push(url);
      }
    });

    // 2. 扫描 <img> 标签
    document.querySelectorAll('img').forEach(img => {
      if (img.src) this.assets.images.push(img.src);
    });

    // 3. 扫描 SVG
    document.querySelectorAll('svg').forEach(svg => {
      this.assets.svgs.push(svg.outerHTML);
    });

    // 4. 排序常用色 (取前 8 个)
    this.assets.colors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color]) => color);

    // 去重图片
    this.assets.images = [...new Set(this.assets.images)].filter(url => url.startsWith('http') || url.startsWith('data:'));
  }

  private render() {
    this.container = document.createElement('div');
    this.container.id = 'asset-panel';
    const isMobile = window.innerWidth <= 500;

    const desktopStyle = `
      top: 80px;
      right: 40px;
      width: 320px;
      max-height: calc(100vh - 120px);
      border-radius: 20px;
    `;

    const mobileStyle = `
      bottom: 20px;
      left: 20px;
      right: 20px;
      width: calc(100% - 80px);
      height: 75vh;
      border-radius: 16px;
    `;

    this.container.style.cssText = `
      position: fixed;
      ${isMobile ? mobileStyle : desktopStyle}
      background: rgba(18, 18, 18, 0.95);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
      overflow-y: auto;
      z-index: 2147483647;
      pointer-events: auto;
      padding: 12px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    `;

    const copyIcon = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const closeIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    this.container.innerHTML = `
      ${isMobile ? `
        <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: -10px auto 12px auto;"></div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center; padding-right: 30px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #888 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">资源采集</h3>
      </div>

      <div>
        <h4 style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 700;">配色方案</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${this.assets.colors.map(c => `
            <div class="copy-color" data-color="${c}" 
                 style="width: 32px; height: 32px; border-radius: 10px; background: ${c}; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: transform 0.2s;" 
                 title="点击复制: ${c}"></div>
          `).join('')}
        </div>
      </div>

      <div>
        <h4 style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 700;">字体系列</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${Array.from(this.assets.fonts).slice(0, 6).map(f => `
            <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px; font-size: 12px; color: #ccc;">${f}</span>
          `).join('')}
        </div>
      </div>

      <div>
        <h4 style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 700;">图片与图标 (${this.assets.images.length})</h4>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          ${this.assets.images.map(img => `
            <div class="asset-img-container" style="position: relative; aspect-ratio: 1; background: rgba(255,255,255,0.03); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
              <div class="copy-img-url" data-url="${img}" title="复制链接">
                ${copyIcon}
              </div>
              <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 8px; cursor: zoom-in;" loading="lazy">
            </div>
          `).join('')}
        </div>
      </div>

      <div style="position: absolute; top: 18px; right: 18px; z-index: 10;">
        <div id="close-asset" style="cursor: pointer; opacity: 0.5; transition: all 0.2s; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          ${closeIcon}
        </div>
      </div>
      <style>
        #close-asset:hover { opacity: 1; background: rgba(255,255,255,0.1); transform: rotate(90deg); }
        .copy-img-url {
          position: absolute;
          top: 4px;
          right: 4px;
          padding: 6px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          border-radius: 6px;
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.2s;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .copy-img-url:hover { opacity: 1; background: #3f51b5; transform: scale(1.1); }
        .copy-img-url:active { transform: scale(0.9); }
      </style>
    `;

    this.shadowRoot.appendChild(this.container);

    // 事件监听
    this.container.querySelector('#close-asset')?.addEventListener('click', () => this.unmount());
    
    this.container.querySelectorAll('.copy-color').forEach(el => {
      el.addEventListener('click', (e) => {
        const color = (e.currentTarget as HTMLElement).getAttribute('data-color');
        if (color) {
          navigator.clipboard.writeText(color);
          this.showToast(`已复制: ${color}`);
        }
      });
      el.addEventListener('mouseenter', (e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)');
      el.addEventListener('mouseleave', (e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)');
    });

    this.container.querySelectorAll('.asset-img-container').forEach(el => {
      const copyBtn = el.querySelector('.copy-img-url') as HTMLElement;
      const img = el.querySelector('img') as HTMLImageElement;

      el.addEventListener('mouseenter', () => {
        (el as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
        copyBtn.style.opacity = '1';
      });
      el.addEventListener('mouseleave', () => {
        (el as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
        copyBtn.style.opacity = isMobile ? '0.9' : '0';
      });

      if (isMobile) {
        copyBtn.style.opacity = '0.9';
      }

      img.addEventListener('click', () => {
        window.open(img.src, '_blank');
      });

      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = copyBtn.getAttribute('data-url');
        if (url) {
          navigator.clipboard.writeText(url);
          this.showToast('图片链接已复制');
        }
      });
    });
  }

  private showToast(msg: string) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #000;
      color: #fff;
      padding: 10px 24px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      z-index: 2147483647;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      animation: toast-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    `;
    toast.textContent = msg;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes toast-in {
        from { transform: translate(-50%, -20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => { toast.remove(); style.remove(); }, 300);
    }, 2000);
  }
}
