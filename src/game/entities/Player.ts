import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants';
import { InputManager } from '../input/InputManager';
import type { GameImages } from '../assets/ImageLoader';

const HIT_DURATION   = 2.0;
const BLINK_INTERVAL = 0.1;

// 플레이어 타일시트: 720×330, 8열×3행, 각 프레임 90×110
const FRAME_W = 90;
const FRAME_H = 110;
// 행0: 0=대기, 1=걷기1, 2=걷기2, 3=걷기3
const WALK_FRAMES = [0, 1, 2, 3];
const ANIM_SPEED  = 0.12; // 프레임 간격 (초)

// 스프라이트 여백을 제외한 실제 충돌 영역
const HIT_SHRINK_X = 9; // 좌우 각 9px 제거 → 42 → 24px
const HIT_SHRINK_Y = 5; // 위 5px 제거 → 52 → 47px (발끝 포함)

export class Player {
  x: number;
  y: number;
  readonly width  = PLAYER_WIDTH;
  readonly height = PLAYER_HEIGHT;

  get hitX()      { return this.x + HIT_SHRINK_X; }
  get hitY()      { return this.y + HIT_SHRINK_Y; }
  get hitWidth()  { return this.width  - HIT_SHRINK_X * 2; }
  get hitHeight() { return this.height - HIT_SHRINK_Y; }
  private hitTimer   = 0;
  hasBarrier         = false;
  private facing: 'left' | 'right' = 'right';
  private animFrame  = 0; // WALK_FRAMES 인덱스
  private animTimer  = 0;

  constructor() {
    this.x = CANVAS_WIDTH  / 2 - PLAYER_WIDTH  / 2;
    this.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 8;
  }

  respawn() {
    this.x          = CANVAS_WIDTH  / 2 - PLAYER_WIDTH  / 2;
    this.y          = CANVAS_HEIGHT - PLAYER_HEIGHT - 8;
    this.hasBarrier = false;
    this.animFrame  = 0;
    this.animTimer  = 0;
  }

  hit() {
    this.hitTimer = HIT_DURATION;
  }

  isInvincible(): boolean {
    return this.hitTimer > 0;
  }

  update(dt: number, input: InputManager) {
    const goLeft  = input.isDown('ArrowLeft');
    const goRight = input.isDown('ArrowRight');

    if (goLeft)  { this.x -= PLAYER_SPEED * dt; this.facing = 'left'; }
    if (goRight) { this.x += PLAYER_SPEED * dt; this.facing = 'right'; }
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

    if (this.hitTimer > 0) this.hitTimer -= dt;

    // 걷기 애니메이션
    if (goLeft || goRight) {
      this.animTimer += dt;
      if (this.animTimer >= ANIM_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % WALK_FRAMES.length;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, images?: GameImages) {
    if (this.hitTimer > 0) {
      const visible = Math.floor(this.hitTimer / BLINK_INTERVAL) % 2 === 0;
      if (!visible) return;
    }

    const col = WALK_FRAMES[this.animFrame];
    const sx  = col * FRAME_W;
    const sy  = 0;

    ctx.save();
    // 왼쪽을 볼 때 수평 반전
    const cx = this.x + this.width / 2;
    ctx.translate(cx, 0);
    if (this.facing === 'left') ctx.scale(-1, 1);

    if (images?.player) {
      ctx.drawImage(
        images.player,
        sx, sy, FRAME_W, FRAME_H,
        -this.width / 2, this.y, this.width, this.height,
      );
    } else {
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(-this.width / 2, this.y, this.width, this.height);
    }

    ctx.restore();

    if (this.hasBarrier) {
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width * 0.9,
        0, Math.PI * 2,
      );
      ctx.stroke();
    }
  }
}
