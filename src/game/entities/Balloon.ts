import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  BALLOON_RADIUS,
  BALLOON_BOUNCE_SPEED,
  BALLOON_VX,
} from '../constants';
import type { GameImages } from '../assets/ImageLoader';

// bubble.png 기준 — 상단 도트 행 약 72px, 이후 대형 공 1행: 각 65×65
// 순서: 파랑(0) 빨강(1) 초록(2) 노랑초록(3) 노랑(4) ...
// 레벨별 색상: 3=빨강, 2=초록, 1=노랑, 0=파랑
const BUBBLE_SX = [0, 260, 130, 65] as const; // index = level
const BUBBLE_SY = 72;
const BUBBLE_SW = 65;
const BUBBLE_SH = 56;

// 레벨별 캔버스 폴백 색상
const FALLBACK_COLORS = ['#4488ff', '#ffdd00', '#44cc44', '#ff4444'] as const;

export class Balloon {
  readonly radius: number;
  vx: number;
  vy: number = 0;

  constructor(
    public x: number,
    public y: number,
    public level: number,
    vxSign: 1 | -1 = 1,
  ) {
    this.radius = BALLOON_RADIUS[level];
    this.vx     = BALLOON_VX[level] * vxSign;
  }

  update(dt: number) {
    this.vy += GRAVITY * dt;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;

    if (this.y + this.radius >= CANVAS_HEIGHT) {
      this.y  = CANVAS_HEIGHT - this.radius;
      this.vy = -BALLOON_BOUNCE_SPEED[this.level];
    }

    // 천장 반사
    if (this.y - this.radius <= 0) {
      this.y  = this.radius;
      this.vy = Math.abs(this.vy);
    }

    if (this.x - this.radius <= 0) {
      this.x  = this.radius;
      this.vx = Math.abs(this.vx);
    }
    if (this.x + this.radius >= CANVAS_WIDTH) {
      this.x  = CANVAS_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }
  }

  split(): Balloon[] {
    if (this.level === 0) return [];
    return [
      new Balloon(this.x, this.y, this.level - 1, -1),
      new Balloon(this.x, this.y, this.level - 1,  1),
    ];
  }

  render(ctx: CanvasRenderingContext2D, images?: GameImages) {
    const r = this.radius;
    const d = r * 2;

    if (images?.bubble) {
      const sx = BUBBLE_SX[this.level];
      // 원형 클리핑으로 스프라이트 셀 경계 아티팩트 제거
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        images.bubble,
        sx, BUBBLE_SY, BUBBLE_SW, BUBBLE_SH,
        this.x - r, this.y - r, d, d,
      );
      ctx.restore();
    } else {
      // 폴백: 광택 그라디언트
      const grad = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
        this.x, this.y, r,
      );
      const color = FALLBACK_COLORS[this.level];
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.45, color + 'cc');
      grad.addColorStop(1, color + '99');

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}
