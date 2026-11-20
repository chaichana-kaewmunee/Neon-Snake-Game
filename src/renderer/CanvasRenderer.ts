import type { GameState } from '../types';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;

    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;

    this.ctx.scale(dpr, dpr);
    this.cellSize = size / 20; // Assuming 20x20 grid
  }

  clear() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, 20 * this.cellSize);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(20 * this.cellSize, i * this.cellSize);
      this.ctx.stroke();
    }
  }

  drawSnake(snake: {x: number, y: number}[]) {
    this.ctx.fillStyle = '#39ff14'; // Neon Green
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#39ff14';

    snake.forEach((segment, index) => {
      // Head is slightly different
      if (index === 0) {
        this.ctx.fillStyle = '#bfff00';
      } else {
        this.ctx.fillStyle = '#39ff14';
      }

      this.ctx.fillRect(
        segment.x * this.cellSize + 1,
        segment.y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );
    });

    this.ctx.shadowBlur = 0;
  }

  drawFood(food: {x: number, y: number}) {
    this.ctx.fillStyle = '#ff3131'; // Neon Red
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#ff3131';

    this.ctx.beginPath();
    this.ctx.arc(
      (food.x + 0.5) * this.cellSize,
      (food.y + 0.5) * this.cellSize,
      this.cellSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  render(state: GameState) {
    this.clear();
    this.drawGrid();
    this.drawFood(state.food);
    this.drawSnake(state.snake);
  }
}
