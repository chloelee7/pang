import { ITEM_FALL_SPEED, ITEM_LIFETIME, ITEM_SIZE, CANVAS_HEIGHT } from '../constants';

export type PowerType = 'BARRIER' | 'CLOCK' | 'HOURGLASS' | 'DYNAMITE' | 'ONE_UP' | 'FOOD';

const POWER_COLORS: Record<PowerType, string> = {
  BARRIER:   '#00ff88',
  CLOCK:     '#88aaff',
  HOURGLASS: '#ffcc44',
  DYNAMITE:  '#ff3300',
  ONE_UP:    '#ff88cc',
  FOOD:      '#ffdd00',
};

const POWER_LABELS: Record<PowerType, string> = {
  BARRIER:   'B',
  CLOCK:     'C',
  HOURGLASS: 'S',
  DYNAMITE:  '!',
  ONE_UP:    '+',
  FOOD:      'F',
};

export class PowerItem {
  active = true;
  private timer = ITEM_LIFETIME;
  readonly width  = ITEM_SIZE;
  readonly height = ITEM_SIZE;

  constructor(
    public x: number,
    public y: number,
    public powerType: PowerType,
  ) {}

  update(dt: number) {
    this.y     += ITEM_FALL_SPEED * dt;
    this.timer -= dt;
    if (this.timer <= 0 || this.y > CANVAS_HEIGHT) this.active = false;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = POWER_COLORS[this.powerType];
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(POWER_LABELS[this.powerType], this.x + this.width / 2, this.y + this.height - 6);
    ctx.textAlign = 'left';
  }
}
