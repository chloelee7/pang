import { ITEM_FALL_SPEED, ITEM_LIFETIME, ITEM_SIZE, CANVAS_HEIGHT } from '../constants';

export type WeaponType = 'HARPOON' | 'DOUBLE_WIRE' | 'POWER_WIRE' | 'VULCAN';

const WEAPON_COLORS: Record<WeaponType, string> = {
  HARPOON:     '#888888',
  DOUBLE_WIRE: '#00ddff',
  POWER_WIRE:  '#ffaa00',
  VULCAN:      '#ff6600',
};

const WEAPON_LABELS: Record<WeaponType, string> = {
  HARPOON:     'H',
  DOUBLE_WIRE: 'D',
  POWER_WIRE:  'P',
  VULCAN:      'V',
};

export class WeaponItem {
  active  = true;
  private timer = ITEM_LIFETIME;
  readonly width  = ITEM_SIZE;
  readonly height = ITEM_SIZE;

  constructor(
    public x: number,
    public y: number,
    public weaponType: WeaponType,
  ) {}

  update(dt: number) {
    this.y     += ITEM_FALL_SPEED * dt;
    this.timer -= dt;
    if (this.timer <= 0 || this.y > CANVAS_HEIGHT) this.active = false;
  }

  render(ctx: CanvasRenderingContext2D) {
    const color = WEAPON_COLORS[this.weaponType];
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(WEAPON_LABELS[this.weaponType], this.x + this.width / 2, this.y + this.height - 6);
    ctx.textAlign = 'left';
  }
}
