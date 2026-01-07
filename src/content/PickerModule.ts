// src/content/PickerModule.ts
export class PickerModule {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private screenSnapshot: HTMLImageElement | null = null;
  private isActive: boolean = false;
  private zoom: number = 10;
  private loupeSize: number = 150;
  private colorFormat: 'hex' | 'rgb' | 'hsl' = 'hex';
  private lastMouseX: number = -1000;
  private lastMouseY: number = -1000;

  constructor(private container: ShadowRoot) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.cursor = 'none';
    this.ctx = this.canvas.getContext('2d')!;
    
    this.setupListeners();
  }

  public async mount() {
    this.isActive = true;
    this.container.appendChild(this.canvas);
    this.resize();
    await this.takeSnapshot();
    this.render();
  }

  public unmount() {
    this.isActive = false;
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    const formatEl = this.container.getElementById('format-indicator');
    if (formatEl) formatEl.remove();
    
    this.screenSnapshot = null;
  }

  private setupListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handlePick(e));
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  private async takeSnapshot() {
    return new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_SCREEN' }, (response) => {
        const img = new Image();
        img.onload = () => {
          this.screenSnapshot = img;
          resolve();
        };
        img.src = response.dataUrl;
      });
    });
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isActive) return;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.render(e.clientX, e.clientY);
  }

  private handlePick(e: MouseEvent) {
    if (!this.screenSnapshot) return;
    const color = this.getPixelColor(e.clientX, e.clientY);
    const formattedColor = this.formatColor(color.r, color.g, color.b);
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedColor).then(() => {
      this.showToast(`已复制颜色: ${formattedColor}`);
    });
  }

  private render(mouseX: number = -1000, mouseY: number = -1000) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.ctx.clearRect(0, 0, width, height);

    if (!this.screenSnapshot) return;

    // Draw the Loupe
    this.ctx.save();
    
    // Draw outer circle
    this.ctx.beginPath();
    this.ctx.arc(mouseX, mouseY, this.loupeSize / 2, 0, Math.PI * 2);
    this.ctx.clip();

    // Draw zoomed image
    const sourceSize = this.loupeSize / this.zoom;
    this.ctx.drawImage(
      this.screenSnapshot,
      mouseX - sourceSize / 2, mouseY - sourceSize / 2, sourceSize, sourceSize,
      mouseX - this.loupeSize / 2, mouseY - this.loupeSize / 2, this.loupeSize, this.loupeSize
    );

    // Draw crosshair
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(mouseX - this.loupeSize / 2, mouseY);
    this.ctx.lineTo(mouseX + this.loupeSize / 2, mouseY);
    this.ctx.moveTo(mouseX, mouseY - this.loupeSize / 2);
    this.ctx.lineTo(mouseX, mouseY + this.loupeSize / 2);
    this.ctx.stroke();

    // Draw center pixel border
    this.ctx.strokeStyle = '#fff';
    this.ctx.strokeRect(mouseX - this.zoom / 2, mouseY - this.zoom / 2, this.zoom, this.zoom);

    this.ctx.restore();

    // Draw Loupe Border
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(mouseX, mouseY, this.loupeSize / 2, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw color label
    const color = this.getPixelColor(mouseX, mouseY);
    const formattedColor = this.formatColor(color.r, color.g, color.b);
    
    this.ctx.font = 'bold 12px sans-serif';
    const textMetrics = this.ctx.measureText(formattedColor);
    const paddingX = 10;
    const boxWidth = textMetrics.width + paddingX * 2;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(mouseX - boxWidth / 2, mouseY + this.loupeSize / 2 + 5, boxWidth, 25);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(formattedColor, mouseX, mouseY + this.loupeSize / 2 + 22);
    
    // Updated: Mode indicator integration
    this.updateFormatIndicator();
  }

  public toggleFormat() {
    const formats: ('hex' | 'rgb' | 'hsl')[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(this.colorFormat);
    this.colorFormat = formats[(currentIndex + 1) % formats.length];
    this.render(this.lastMouseX, this.lastMouseY);
  }

  private updateFormatIndicator() {
    let formatEl = this.container.getElementById('format-indicator');
    if (!formatEl) {
      formatEl = document.createElement('div');
      formatEl.id = 'format-indicator';
      formatEl.style.cssText = `
        position: absolute;
        top: 75px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 11px;
        font-family: sans-serif;
        letter-spacing: 0.5px;
        pointer-events: none;
        z-index: 2147483647;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      this.container.appendChild(formatEl);
    }
    formatEl.innerText = `按 [F] 切换颜色格式: ${this.colorFormat.toUpperCase()}`;
  }

  private getPixelColor(x: number, y: number) {
    if (!this.screenSnapshot) return { r: 0, g: 0, b: 0 };
    
    // Create a temporary canvas to get pixel data
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(this.screenSnapshot, x, y, 1, 1, 0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }

  private formatColor(r: number, g: number, b: number) {
    if (this.colorFormat === 'hex') {
      return this.rgbToHex(r, g, b);
    } else if (this.colorFormat === 'rgb') {
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const { h, s, l } = this.rgbToHsl(r, g, b);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }

  private rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private rgbToHex(r: number, g: number, b: number) {
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
