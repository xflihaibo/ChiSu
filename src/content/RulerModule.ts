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
    this.canvas.style.zIndex = '100'; // 确保在 Shadow DOM 内层级正确
    this.ctx = this.canvas.getContext('2d')!;
    
    this.setupListeners();
    this.resize();
  }

  public mount() {
    this.container.appendChild(this.canvas);
    // 强制立即计算并重绘
    this.resize();
    requestAnimationFrame(() => {
      this.render();
    });
  }

  public unmount() {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  private setupListeners() {
    window.addEventListener('resize', () => this.resize());
    
    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    // Touch Events (Mobile Support)
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      // 检查是否点击了标尺或现有标线
      const handled = this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      
      // 如果点击的是工具热区，则拦截滚动；否则允许页面滚动
      if (handled) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }, { passive: false });

    window.addEventListener('touchend', () => this.handleMouseUp(), { passive: false });
  }

  private resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.render();
  }

  private handleMouseDown(e: MouseEvent): boolean {
    const { clientX, clientY } = e;
    // 立即同步当前坐标，防止点击即松开导致的数值错误
    this.currentMouseX = clientX;
    this.currentMouseY = clientY;
    
    const isMobile = window.innerWidth <= 500;
    const rulerSize = isMobile ? 20 : 30;
    const hitTolerance = isMobile ? 10 : 5; 

    // Check if clicking on an existing guide to drag it again
    for (let i = 0; i < this.guides.length; i++) {
      const guide = this.guides[i];
      if (guide.type === 'v' && Math.abs(clientX - guide.pos) < hitTolerance) {
        this.isDragging = true;
        this.dragType = 'v';
        this.draggedGuideIndex = i;
        return true;
      } else if (guide.type === 'h' && Math.abs(clientY - guide.pos) < hitTolerance) {
        this.isDragging = true;
        this.dragType = 'h';
        this.draggedGuideIndex = i;
        return true;
      }
    }

    if (clientX < rulerSize) {
      this.isDragging = true;
      this.dragType = 'v';
      this.draggedGuideIndex = null;
      return true;
    } else if (clientY < rulerSize) {
      this.isDragging = true;
      this.dragType = 'h';
      this.draggedGuideIndex = null;
      return true;
    }

    return false;
  }

  private handleMouseMove(e: MouseEvent) {
    this.currentMouseX = e.clientX;
    this.currentMouseY = e.clientY;
    
    // 只有在激活状态或拖拽状态下才重绘
    if (this.isDragging) {
      this.render(this.currentMouseX, this.currentMouseY);
    } else {
      // 这里的 render 可以根据需要优化，避免非拖拽状态下的频繁重绘
      // this.render(); 
    }
  }

  private handleMouseUp() {
    if (this.isDragging && this.dragType) {
      const isMobile = window.innerWidth <= 500;
      const rulerSize = isMobile ? 20 : 30;
      const finalPos = this.dragType === 'v' ? this.currentMouseX : this.currentMouseY;

      // 删除逻辑：如果拖回标尺区域，则移除该标线
      if (finalPos < rulerSize) {
        if (this.draggedGuideIndex !== null) {
          this.guides.splice(this.draggedGuideIndex, 1);
        }
      } else {
        if (this.draggedGuideIndex !== null) {
          // Update existing guide
          this.guides[this.draggedGuideIndex].pos = finalPos;
        } else {
          // Add new permanent guide
          this.guides.push({
            type: this.dragType,
            pos: finalPos
          });
        }
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
    
    const isMobile = window.innerWidth <= 500;
    const labelSafeMargin = isMobile ? 55 : 65; // 避开顶部菜单的安全距离

    // Draw saved guides
    this.ctx.strokeStyle = '#FF00FF'; 
    this.ctx.setLineDash([5, 5]);
    this.guides.forEach((guide, index) => {
      if (this.isDragging && this.draggedGuideIndex === index) return;

      this.ctx.beginPath();
      if (guide.type === 'v') {
        this.ctx.moveTo(guide.pos, 0);
        this.ctx.lineTo(guide.pos, this.height);
        this.drawLabel(guide.pos, labelSafeMargin, `${guide.pos}px`, false);
      } else {
        this.ctx.moveTo(0, guide.pos);
        this.ctx.lineTo(this.width, guide.pos);
        this.drawLabel(labelSafeMargin, guide.pos, `${guide.pos}px`, false);
      }
      this.ctx.stroke();
    });
    this.ctx.setLineDash([]);

    this.drawRulers();
    
    // Draw current drag line
    if (this.isDragging && this.dragType) {
      this.ctx.strokeStyle = '#FF00FF'; 
      this.ctx.lineWidth = 1.5; 
      this.ctx.beginPath();
      if (this.dragType === 'v' && mouseX !== undefined) {
        this.ctx.moveTo(mouseX, 0);
        this.ctx.lineTo(mouseX, this.height);
        this.drawLabel(mouseX, labelSafeMargin - 15, `${mouseX}px`, true);
      } else if (this.dragType === 'h' && mouseY !== undefined) {
        this.ctx.moveTo(0, mouseY);
        this.ctx.lineTo(this.width, mouseY);
        this.drawLabel(labelSafeMargin - 15, mouseY, `${mouseY}px`, true);
      }
      this.ctx.stroke();
    }
  }

  private drawGrid() {
    const isMobile = window.innerWidth <= 500;
    const step = isMobile ? 25 : 50; 
    // 移动端显著增强网格能见度
    this.ctx.strokeStyle = isMobile ? 'rgba(128, 128, 128, 0.3)' : 'rgba(128, 128, 128, 0.15)'; 
    this.ctx.lineWidth = isMobile ? 0.8 : 0.5;

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
    this.ctx.strokeStyle = isMobile ? 'rgba(128, 128, 128, 0.15)' : 'rgba(128, 128, 128, 0.05)';
    const minorStep = 10;
    for (let x = 0; x <= this.width; x += minorStep) {
      if (x % step === 0) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += minorStep) {
      if (y % step === 0) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawRulers() {
    const isMobile = window.innerWidth <= 500;
    const size = isMobile ? 18 : 30; // 移动端缩窄到 18px
    const fontSize = isMobile ? '8px' : '10px';
    
    this.ctx.fillStyle = '#1e1e1e'; 
    this.ctx.fillRect(0, 0, this.width, size); 
    this.ctx.fillRect(0, 0, size, this.height); 

    // 标尺边缘亮线
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, size);
    this.ctx.lineTo(this.width, size);
    this.ctx.moveTo(size, 0);
    this.ctx.lineTo(size, this.height);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#666';
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = `${fontSize} sans-serif`;

    // Top ruler ticks
    for (let x = 0; x <= this.width; x += 10) {
      const isMajor = x % 100 === 0;
      const isMid = x % 50 === 0;
      const h = isMajor ? (isMobile ? 10 : 15) : (isMid ? (isMobile ? 7 : 10) : (isMobile ? 4 : 5));
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
      
      if (isMid && x !== 0) {
        this.ctx.fillText(x.toString(), x + 2, isMobile ? 14 : 25);
      }
    }

    // Left ruler ticks
    for (let y = 0; y <= this.height; y += 10) {
      const isMajor = y % 100 === 0;
      const isMid = y % 50 === 0;
      const w = isMajor ? (isMobile ? 10 : 15) : (isMid ? (isMobile ? 7 : 10) : (isMobile ? 4 : 5));
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
      
      if (isMid && y !== 0) {
        this.ctx.save();
        this.ctx.translate(isMobile ? 14 : 25, y);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(y.toString(), 2, 0);
        this.ctx.restore();
      }
    }
  }

  private drawLabel(x: number, y: number, text: string, active: boolean) {
    const isMobile = window.innerWidth <= 500;
    this.ctx.fillStyle = '#FF00FF'; 
    this.ctx.globalAlpha = active ? 1.0 : 0.9;
    
    const labelWidth = isMobile ? 35 : 45;
    const labelHeight = isMobile ? 12 : 15;
    
    // 智能边缘检测：防止标签超出屏幕右侧或底部
    let labelX = x + 5;
    let labelY = y - (isMobile ? 15 : 20);

    if (labelX + labelWidth > this.width - 5) {
      labelX = x - labelWidth - 5; // 靠右时，将标签移到线左侧
    }
    
    if (labelY < 5) {
      labelY = y + 5; // 靠顶时，将标签移到线下方
    }

    this.ctx.fillRect(labelX, labelY, labelWidth, labelHeight); 
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#fff'; 
    this.ctx.font = `bold ${isMobile ? '8px' : '10px'} sans-serif`;
    this.ctx.fillText(text, labelX + 3, labelY + (isMobile ? 9 : 11));
  }
}
