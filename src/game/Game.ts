import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  HARPOON_WIDTH,
  BALLOON_SCORE,
  STAGE_TIME,
  ITEM_SIZE,
  VULCAN_INTERVAL,
  CLOCK_DURATION,
  HOURGLASS_DURATION,
  FOOD_SCORE,
} from './constants';
import { InputManager } from './input/InputManager';
import { Player } from './entities/Player';
import { Harpoon } from './entities/Harpoon';
import { Balloon } from './entities/Balloon';
import { WeaponItem, WeaponType } from './entities/WeaponItem';
import { PowerItem, PowerType } from './entities/PowerItem';
import { circleRect } from './utils/collision';
import type { GameImages } from './assets/ImageLoader';

type GameState = 'MAIN' | 'PLAYING' | 'STAGE_CLEAR' | 'MISSION_CLEAR' | 'GAME_OVER';

interface BalloonConfig {
  level: number;
  x: number;
  vxSign: 1 | -1;
}

const STAGES: BalloonConfig[][] = [
  [{ level: 3, x: 0.5, vxSign: 1 }],
  [{ level: 3, x: 0.3, vxSign: 1 }, { level: 3, x: 0.7, vxSign: -1 }],
  [{ level: 3, x: 0.25, vxSign: 1 }, { level: 3, x: 0.75, vxSign: -1 }, { level: 2, x: 0.5, vxSign: 1 }],
];

const WEAPON_DROP: WeaponType[] = ['DOUBLE_WIRE', 'POWER_WIRE', 'VULCAN'];
const POWER_DROP: PowerType[]   = ['BARRIER', 'CLOCK', 'HOURGLASS', 'DYNAMITE', 'ONE_UP', 'FOOD'];
const DROP_CHANCE        = 0.3;
const POWER_DROP_CHANCE  = 0.2;

export class Game {
  private lastTime   = 0;
  private rafId      = 0;
  private harpoons: Harpoon[]     = [];
  private balloons: Balloon[]     = [];
  private weaponItems: WeaponItem[] = [];
  private powerItems: PowerItem[]   = [];
  private frozenTimer   = 0;
  private slowTimer     = 0;
  private lives         = 3;
  private score         = 0;
  private hiScore       = 0;
  private stageTimer    = STAGE_TIME;
  private stageIdx      = 0;
  private clearTimer    = 0;
  private currentWeapon: WeaponType = 'HARPOON';
  private vulcanTimer   = 0;
  private state: GameState = 'MAIN';

  constructor(
    private ctx:    CanvasRenderingContext2D,
    private input:  InputManager,
    private player: Player,
    private images?: GameImages,
  ) {}

  start() { this.rafId = requestAnimationFrame(this.loop); }
  stop()  { cancelAnimationFrame(this.rafId); }

  private loadStage(idx: number) {
    this.stageIdx    = idx;
    this.harpoons    = [];
    this.weaponItems = [];
    this.powerItems  = [];
    this.stageTimer  = STAGE_TIME;
    this.frozenTimer = 0;
    this.slowTimer   = 0;
    this.balloons    = STAGES[idx].map(
      cfg => new Balloon(CANVAS_WIDTH * cfg.x, 100, cfg.level, cfg.vxSign)
    );
  }

  private loseLife() {
    this.lives--;
    this.currentWeapon = 'HARPOON';
    this.vulcanTimer   = 0;
    if (this.lives <= 0) {
      this.state = 'GAME_OVER';
    } else {
      this.loadStage(this.stageIdx);
      this.player.respawn();
      this.player.hit();
    }
  }

  private goToMain() {
    this.hiScore = Math.max(this.hiScore, this.score);
    this.state   = 'MAIN';
  }

  private startGame() {
    this.lives         = 3;
    this.score         = 0;
    this.currentWeapon = 'HARPOON';
    this.vulcanTimer   = 0;
    this.state         = 'PLAYING';
    this.loadStage(0);
    this.player.respawn();
  }

  private loop = (timestamp: number) => {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private fireHarpoon() {
    const cx = this.player.x + this.player.width / 2;
    const py = this.player.y;

    if (this.currentWeapon === 'DOUBLE_WIRE') {
      // 두 와이어가 동시에 올라가야 하므로 없을 때만 발사
      if (this.harpoons.length === 0) {
        this.harpoons.push(new Harpoon(cx - HARPOON_WIDTH * 3, py));
        this.harpoons.push(new Harpoon(cx + HARPOON_WIDTH * 2, py));
      }
    } else if (this.currentWeapon === 'POWER_WIRE') {
      if (this.harpoons.length === 0) {
        this.harpoons.push(new Harpoon(cx - HARPOON_WIDTH / 2, py, true));
      }
    } else if (this.currentWeapon === 'VULCAN') {
      this.harpoons.push(new Harpoon(cx - HARPOON_WIDTH / 2, py));
    } else {
      // 기본 하푼: 기존 와이어를 즉시 교체해 딜레이 없이 재발사
      this.harpoons = [];
      this.harpoons.push(new Harpoon(cx - HARPOON_WIDTH / 2, py));
    }
  }

  private update(dt: number) {
    if (this.state === 'MAIN') {
      if (this.input.justPressed('Enter')) this.startGame();
      this.input.update();
      return;
    }

    if (this.state === 'GAME_OVER') {
      if (this.input.justPressed('Enter')) this.goToMain();
      this.input.update();
      return;
    }

    if (this.state === 'STAGE_CLEAR') {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        if (this.stageIdx < STAGES.length - 1) {
          this.loadStage(this.stageIdx + 1);
          this.player.respawn();
          this.state = 'PLAYING';
        } else {
          this.state = 'MISSION_CLEAR';
        }
      }
      this.input.update();
      return;
    }

    if (this.state === 'MISSION_CLEAR') {
      if (this.input.justPressed('Enter')) this.goToMain();
      this.input.update();
      return;
    }

    this.stageTimer -= dt;
    if (this.stageTimer <= 0) {
      this.stageTimer = 0;
      this.loseLife();
      this.input.update();
      return;
    }

    this.player.update(dt, this.input);

    // 발사
    const firePressed = this.input.justPressed('Space') || this.input.justPressed('KeyZ');
    const fireHeld    = this.input.isDown('Space') || this.input.isDown('KeyZ');

    if (this.currentWeapon === 'VULCAN') {
      this.vulcanTimer -= dt;
      if (fireHeld && this.vulcanTimer <= 0) {
        this.fireHarpoon();
        this.vulcanTimer = VULCAN_INTERVAL;
      }
    } else if (firePressed) {
      this.fireHarpoon();
    }

    this.harpoons = this.harpoons.filter(h => {
      h.update(dt);
      return h.active;
    });

    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
    } else {
      const speedMult = this.slowTimer > 0 ? 0.5 : 1.0;
      if (this.slowTimer > 0) this.slowTimer -= dt;
      this.balloons.forEach(b => b.update(dt * speedMult));
    }

    this.weaponItems = this.weaponItems.filter(item => {
      item.update(dt);
      return item.active;
    });

    this.powerItems = this.powerItems.filter(item => {
      item.update(dt);
      return item.active;
    });

    this.resolveCollisions();

    if (this.balloons.length === 0) {
      this.state      = 'STAGE_CLEAR';
      this.clearTimer = 2.0;
    }

    this.input.update();
  }

  private resolveCollisions() {
    // 하푼 ↔ 풍선
    for (const h of [...this.harpoons]) {
      const idx = this.balloons.findIndex(b =>
        circleRect(b.x, b.y, b.radius, h.x, h.y, h.width, h.height)
      );
      if (idx !== -1) {
        this.score += BALLOON_SCORE[this.balloons[idx].level];
        h.active = false;

        // 아이템 드롭
        const bx = this.balloons[idx].x;
        const by = this.balloons[idx].y;
        const roll = Math.random();
        if (roll < DROP_CHANCE) {
          const type = WEAPON_DROP[Math.floor(Math.random() * WEAPON_DROP.length)];
          this.weaponItems.push(new WeaponItem(bx - ITEM_SIZE / 2, by, type));
        } else if (roll < DROP_CHANCE + POWER_DROP_CHANCE) {
          const type = POWER_DROP[Math.floor(Math.random() * POWER_DROP.length)];
          this.powerItems.push(new PowerItem(bx - ITEM_SIZE / 2, by, type));
        }

        const children = this.balloons[idx].split();
        this.balloons.splice(idx, 1, ...children);
      }
    }
    this.harpoons = this.harpoons.filter(h => h.active);

    // 플레이어 ↔ 무기 아이템
    const p = this.player;
    this.weaponItems = this.weaponItems.filter(item => {
      const picked =
        p.x < item.x + item.width  &&
        p.x + p.width  > item.x    &&
        p.y < item.y + item.height &&
        p.y + p.height > item.y;
      if (picked) {
        this.currentWeapon = item.weaponType;
        this.vulcanTimer   = 0;
      }
      return !picked;
    });

    // 플레이어 ↔ 파워업 아이템
    this.powerItems = this.powerItems.filter(item => {
      const picked =
        p.x < item.x + item.width  &&
        p.x + p.width  > item.x    &&
        p.y < item.y + item.height &&
        p.y + p.height > item.y;
      if (picked) this.applyPower(item.powerType);
      return !picked;
    });

    // 플레이어 ↔ 풍선 (스프라이트 여백 제외한 히트박스 사용)
    if (!this.player.isInvincible()) {
      const hit = this.balloons.some(b =>
        circleRect(b.x, b.y, b.radius, p.hitX, p.hitY, p.hitWidth, p.hitHeight)
      );
      if (hit) {
        if (this.player.hasBarrier) {
          this.player.hasBarrier = false;
          this.player.hit();
        } else {
          this.loseLife();
        }
      }
    }
  }

  private applyPower(type: PowerType) {
    switch (type) {
      case 'BARRIER':
        this.player.hasBarrier = true;
        break;
      case 'CLOCK':
        this.frozenTimer = CLOCK_DURATION;
        break;
      case 'HOURGLASS':
        this.slowTimer = HOURGLASS_DURATION;
        break;
      case 'DYNAMITE':
        this.balloons = this.balloons.flatMap(b => {
          let children: Balloon[] = [b];
          while (children.some(c => c.level > 0)) {
            children = children.flatMap(c => c.level > 0 ? c.split() : [c]);
          }
          return children;
        });
        break;
      case 'ONE_UP':
        this.lives++;
        break;
      case 'FOOD':
        this.score += FOOD_SCORE;
        break;
    }
  }

  private render() {
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.state === 'MAIN')          { this.renderMain();         return; }
    if (this.state === 'GAME_OVER')    { this.renderGameOver();    return; }
    if (this.state === 'MISSION_CLEAR') { this.renderMissionClear(); return; }

    this.balloons.forEach(b => b.render(this.ctx, this.images));
    this.weaponItems.forEach(i => i.render(this.ctx));
    this.powerItems.forEach(i => i.render(this.ctx));
    this.player.render(this.ctx, this.images);
    this.harpoons.forEach(h => h.render(this.ctx));
    this.renderHUD();

    if (this.state === 'STAGE_CLEAR') this.renderStageClear();
  }

  private renderHUD() {
    const ctx = this.ctx;
    ctx.font = '18px monospace';
    ctx.fillStyle = '#ffffff';

    ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${String(this.score).padStart(6, '0')}`, 12, 24);

    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${this.stageIdx + 1}`, CANVAS_WIDTH / 2, 24);

    ctx.textAlign = 'right';
    ctx.fillText(`TIME  ${Math.ceil(this.stageTimer).toString().padStart(2, '0')}`, CANVAS_WIDTH - 12, 24);

    ctx.textAlign = 'left';
    ctx.fillText('♥ '.repeat(this.lives).trim(), 12, 46);

    if (this.currentWeapon !== 'HARPOON') {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffdd00';
      ctx.fillText(this.currentWeapon.replace('_', ' '), CANVAS_WIDTH - 12, 46);
    }
    ctx.textAlign = 'left';
  }

  private renderMain() {
    const ctx = this.ctx;
    const cx  = CANVAS_WIDTH / 2;

    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PANG', cx, CANVAS_HEIGHT / 2 - 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText('1 PLAYER', cx, CANVAS_HEIGHT / 2 + 20);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('PRESS ENTER TO START', cx, CANVAS_HEIGHT / 2 + 60);

    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`HI-SCORE  ${String(this.hiScore).padStart(6, '0')}`, cx, CANVAS_HEIGHT / 2 + 110);

    ctx.textAlign = 'left';
  }

  private renderStageClear() {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STAGE CLEAR!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.textAlign = 'left';
  }

  private renderMissionClear() {
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('MISSION CLEAR!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24);
    this.ctx.font = '20px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`SCORE  ${String(this.score).padStart(6, '0')}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
    this.ctx.fillText('PRESS ENTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 56);
    this.ctx.textAlign = 'left';
  }

  private renderGameOver() {
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24);
    this.ctx.font = '20px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('PRESS ENTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
    this.ctx.textAlign = 'left';
  }
}
