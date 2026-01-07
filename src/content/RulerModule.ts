// src/content/RulerModule.ts
export class RulerModule {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private guides: { type: 'h' | 'v'; pos: number }[] = [];
  private isDragging: boolean = false;
  private dragType: 'h' | 'v' | null = null;
  private draggedGuideIndex: number | null = null;
  private currentMouseX: number = 0;
  private currentMouseY: number = 0;

  constructor(private container: ShadowRoot) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'auto';
    this.ctx = this.canvas.getContext('2d')!;
    
    this.setupListeners();
    this.resize();
  }

  public mount() {
    this.container.appendChild(this.canvas);
    this.render();
  }

  public unmount() {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  private setupListeners() {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
  }

  private resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.render();
  }

  private handleMouseDown(e: MouseEvent) {
    const { clientX, clientY } = e;
    const rulerSize = 30;
    const hitTolerance = 5;

    // Check if clicking on an existing guide to drag it again
    for (let i = 0; i < this.guides.length; i++) {
      const guide = this.guides[i];
      if (guide.type === 'v' && Math.abs(clientX - guide.pos) < hitTolerance) {
        this.isDragging = true;
        this.dragType = 'v';
        this.draggedGuideIndex = i;
        return;
      } else if (guide.type === 'h' && Math.abs(clientY - guide.pos) < hitTolerance) {
        this.isDragging = true;
        this.dragType = 'h';
        this.draggedGuideIndex = i;
        return;
      }
    }

    if (clientX < rulerSize) {
      this.isDragging = true;
      this.dragType = 'v';
      this.draggedGuideIndex = null;
    } else if (clientY < rulerSize) {
      this.isDragging = true;
      this.dragType = 'h';
      this.draggedGuideIndex = null;
    }
  }

  private handleMouseMove(e: MouseEvent) {
    this.currentMouseX = e.clientX;
    this.currentMouseY = e.clientY;
    if (this.isDragging && this.dragType) {
      this.render(this.currentMouseX, this.currentMouseY);
    } else {
      this.render();
    }
  }

  private handleMouseUp() {
    if (this.isDragging && this.dragType) {
      if (this.draggedGuideIndex !== null) {
        // Update existing guide
        this.guides[this.draggedGuideIndex].pos = this.dragType === 'v' ? this.currentMouseX : this.currentMouseY;
      } else {
        // Add new permanent guide
        this.guides.push({
          type: this.dragType,
          pos: this.dragType === 'v' ? this.currentMouseX : this.currentMouseY
        });
      }
    }
    this.isDragging = false;
    this.dragType = null;
    this.draggedGuideIndex = null;
    this.render();
  }

  private render(mouseX?: number, mouseY?: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    
    // Draw saved guides
    this.ctx.strokeStyle = '#FF00FF'; // 更换为高饱和度的洋红色 (Magenta)，视觉冲击力更强
    this.ctx.setLineDash([5, 5]);
    this.guides.forEach((guide, index) => {
      if (this.isDragging && this.draggedGuideIndex === index) return;

      this.ctx.beginPath();
      if (guide.type === 'v') {
        this.ctx.moveTo(guide.pos, 0);
        this.ctx.lineTo(guide.pos, this.height);
        this.drawLabel(guide.pos, 60, `${guide.pos}px`, false);
      } else {
        this.ctx.moveTo(0, guide.pos);
        this.ctx.lineTo(this.width, guide.pos);
        this.drawLabel(60, guide.pos, `${guide.pos}px`, false);
      }
      this.ctx.stroke();
    });
    this.ctx.setLineDash([]);

    this.drawRulers();
    
    // Draw current drag line
    if (this.isDragging && this.dragType) {
      this.ctx.strokeStyle = '#FF00FF'; // 保持色彩统一
      this.ctx.lineWidth = 1.5; // 稍微加粗线宽，增强视觉感
      this.ctx.beginPath();
      if (this.dragType === 'v' && mouseX !== undefined) {
        this.ctx.moveTo(mouseX, 0);
        this.ctx.lineTo(mouseX, this.height);
        this.drawLabel(mouseX, 40, `${mouseX}px`, true);
      } else if (this.dragType === 'h' && mouseY !== undefined) {
        this.ctx.moveTo(0, mouseY);
        this.ctx.lineTo(this.width, mouseY);
        this.drawLabel(40, mouseY, `${mouseY}px`, true);
      }
      this.ctx.stroke();
    }
  }

  private drawGrid() {
    const step = 50; // Increased step for better visibility
    this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.15)'; // More visible gray
    this.ctx.lineWidth = 0.5;

    this.ctx.beginPath();
    for (let x = 0; x <= this.width; x += step) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += step) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    // Minor grid lines
    this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.05)';
    for (let x = 0; x <= this.width; x += 10) {
      if (x % step === 0) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += 10) {
      if (y % step === 0) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawRulers() {
    const size = 30;
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(0, 0, this.width, size); // Top ruler
    this.ctx.fillRect(0, 0, size, this.height); // Left ruler

    this.ctx.strokeStyle = '#555';
    this.ctx.fillStyle = '#888';
    this.ctx.font = '10px sans-serif';

    // Top ruler ticks
    for (let x = 0; x <= this.width; x += 10) {
      const h = x % 100 === 0 ? 15 : (x % 50 === 0 ? 10 : 5);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
      if (x % 50 === 0 && x !== 0) {
        this.ctx.fillText(x.toString(), x + 2, 25);
      }
    }

    // Left ruler ticks
    for (let y = 0; y <= this.height; y += 10) {
      const w = y % 100 === 0 ? 15 : (y % 50 === 0 ? 10 : 5);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
      if (y % 50 === 0 && y !== 0) {
        this.ctx.save();
        this.ctx.translate(25, y);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(y.toString(), 2, 0);
        this.ctx.restore();
      }
    }
  }

  private drawLabel(x: number, y: number, text: string, active: boolean) {
    this.ctx.fillStyle = active ? '#FF00FF' : '#FF00FF'; // 统一使用高饱和洋红
    this.ctx.globalAlpha = active ? 1.0 : 0.9;
    this.ctx.fillRect(x + 5, y - 20, 45, 15); // 稍微加宽一点标签背景
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#fff'; // 黑色背景配白色文字更清晰
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.fillText(text, x + 8, y - 8);
  }
}
