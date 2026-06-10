import { HARPOON_SPEED, HARPOON_WIDTH, POWER_WIRE_HOLD } from '../constants';

export class Harpoon {
  readonly width = HARPOON_WIDTH;
  active = true;
  private sticky      = false;
  private stickyTimer = 0;
  readonly baseY: number; // 발사 지점(하단 고정)

  // y = 와이어 끝(위쪽) — 아래서 위로 이동
  // height = baseY - y (동적 계산)
  get height() { return this.baseY - this.y; }

  constructor(
    public x: number,
    public y: number, // 발사 시 플레이어 상단 Y
    sticky = false,
  ) {
    this.baseY  = y;
    this.sticky = sticky;
  }

  update(dt: number) {
    if (this.sticky && this.stickyTimer > 0) {
      this.stickyTimer -= dt;
      if (this.stickyTimer <= 0) this.active = false;
      return;
    }

    this.y -= HARPOON_SPEED * dt;

    if (this.y <= 0) {
      if (this.sticky) {
        this.y = 0;
        this.stickyTimer = POWER_WIRE_HOLD;
      } else {
        this.active = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const color = this.sticky && this.stickyTimer > 0 ? '#ffaa00' : '#ffffff';
    // 끝(위) → 발사 지점(아래) 전체를 채우는 와이어
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 와이어 끝 포인트 강조
    ctx.fillStyle = color === '#ffffff' ? '#aaddff' : '#ffdd88';
    ctx.fillRect(this.x - 1, this.y, this.width + 2, 4);
  }
}
