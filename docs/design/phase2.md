# Phase 2 설계 — 하푼 발사

## 목표

Space 또는 Z 키를 누르면 하푼이 위로 날아가고, 천장에 닿으면 사라진다.
화면에 하푼이 존재하는 동안은 재발사가 불가능하다.

---

## 새로 추가되는 상수 (`constants.ts`)

```ts
export const HARPOON_SPEED  = 480; // px/초 (플레이어 속도의 2배)
export const HARPOON_WIDTH  = 4;
export const HARPOON_HEIGHT = 20;
```

---

## 변경·추가 모듈

### `InputManager.ts` — justPressed 기능 추가

현재 `isDown()`은 키가 눌린 동안 매 프레임 true를 반환한다.
하푼 발사에 이를 그대로 쓰면 하푼이 사라지는 순간 Space를 누르고 있으면
즉시 다음 하푼이 자동 발사된다. 원작처럼 한 번 눌러서 한 번만 발사하려면
"이번 프레임에 새로 눌렸는가"를 판별하는 `justPressed()`가 필요하다.

```ts
class InputManager {
  private keys     = new Set<string>();
  private prevKeys = new Set<string>();

  // 매 프레임 끝에 Game이 호출 — 모든 입력 처리 후 스냅샷을 찍어야 justPressed가 정확히 동작함
  update() {
    this.prevKeys = new Set(this.keys);
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  // 이번 프레임에 새로 눌린 키인지 판별
  justPressed(code: string): boolean {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }
}
```

Game의 루프에서 `update(dt)` 가장 마지막 줄에 `this.input.update()`를 호출한다.

---

### `entities/Harpoon.ts` — 신규

```ts
class Harpoon {
  readonly width  = HARPOON_WIDTH;
  readonly height = HARPOON_HEIGHT;
  active = true;

  constructor(
    public x: number, // 발사 위치 (플레이어 중앙)
    public y: number, // 발사 위치 (플레이어 상단)
  ) {}

  update(dt: number) {
    this.y -= HARPOON_SPEED * dt;

    // 천장 도달 시 소멸
    if (this.y + this.height <= 0) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

- 발사 x 좌표: `player.x + player.width / 2 - HARPOON_WIDTH / 2` (플레이어 수평 중앙)
- 발사 y 좌표: `player.y` (플레이어 상단)
- `active = false`가 되면 Game이 해당 프레임 이후 참조를 버림

---

### `Game.ts` — 하푼 관리 추가

단발 제한이므로 `harpoon: Harpoon | null`로 관리한다.

```ts
class Game {
  private harpoon: Harpoon | null = null;

  private update(dt: number) {
    this.input.update(); // ← justPressed 스냅샷 (매 프레임 첫 번째)

    this.player.update(dt, this.input);

    // 발사 조건: 하푼 없음 + Space 또는 Z 키 새로 눌림
    if (
      this.harpoon === null &&
      (this.input.justPressed('Space') || this.input.justPressed('KeyZ'))
    ) {
      this.harpoon = new Harpoon(
        this.player.x + this.player.width  / 2 - HARPOON_WIDTH  / 2,
        this.player.y,
      );
    }

    // 하푼 업데이트 및 소멸 처리
    if (this.harpoon) {
      this.harpoon.update(dt);
      if (!this.harpoon.active) this.harpoon = null;
    }
  }

  private render() {
    // ... 배경, 플레이어 렌더링 ...
    this.harpoon?.render(this.ctx);
  }
}
```

---

## 렌더링 결과 (Phase 2 완료 시)

```
┌─────────────────────────┐
│                         │
│          |              │  ← 하푼 (흰색 직선, 위로 이동)
│          |              │
│                         │
│                         │
│         [플레이어]       │
└─────────────────────────┘
```

---

## 검토 포인트

- `HARPOON_SPEED = 480 (px/초)` 수치가 적절한지
- 단발 제한이 조작 시 답답하게 느껴지지 않는지 (빠른 연사보다 전략적 발사가 게임 재미에 맞는지)
- `justPressed` 도입으로 InputManager의 책임이 늘어나는 것에 대한 구조적 이견 여부
