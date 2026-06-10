# Phase 1 설계 — 게임 화면과 플레이어 이동

## 목표

브라우저에서 게임 화면이 열리고, 캐릭터를 방향키로 좌우로 이동할 수 있는 상태.

---

## 기술 결정

### React는 껍데기, 게임 로직은 순수 TypeScript

React의 상태 관리(useState, useEffect)는 60fps 게임 루프와 맞지 않는다.
매 프레임 setState를 호출하면 불필요한 리렌더링이 발생하고 성능이 저하된다.

**채택 방식**: React는 `<canvas>` DOM을 마운트하는 역할만 하고,
실제 게임 루프·렌더링·입력 처리는 순수 TypeScript 클래스로 구현한다.

```
React (App.tsx)
  └─ <GameCanvas /> — useRef로 canvas DOM 획득 후 Game 인스턴스 생성
        └─ Game.ts — requestAnimationFrame 루프, update/render 담당
```

---

## 파일 구조

```
src/
├── components/
│   └── GameCanvas.tsx     # canvas DOM 마운트 + Game 인스턴스 생명주기 관리
├── game/
│   ├── Game.ts            # 메인 루프 (requestAnimationFrame)
│   ├── constants.ts       # 화면 크기, 플레이어 속도 등 상수
│   ├── entities/
│   │   └── Player.ts      # 플레이어 상태 및 이동 로직
│   └── input/
│       └── InputManager.ts # 키보드 입력 상태 관리
└── App.tsx                # GameCanvas 렌더링
```

---

## 각 모듈 설계

### `constants.ts`

```ts
export const CANVAS_WIDTH  = 480;
export const CANVAS_HEIGHT = 640;
export const PLAYER_SPEED  = 240; // px/초
export const PLAYER_WIDTH  = 32;
export const PLAYER_HEIGHT = 40;
```

수치를 한 곳에 모아 이후 Phase에서 조정이 쉽도록 한다.

---

### `InputManager.ts`

키보드 상태를 **폴링(polling) 방식**으로 관리한다.
이벤트 기반(keydown마다 이동)은 키 반복 딜레이가 있어 게임에 부적합하다.

```ts
class InputManager {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', e => this.keys.add(e.code));
    window.addEventListener('keyup',   e => this.keys.delete(e.code));
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  destroy() {
    // 이벤트 리스너 해제 (컴포넌트 언마운트 시 호출)
  }
}
```

사용 키: `ArrowLeft`, `ArrowRight`

---

### `Player.ts`

```ts
class Player {
  x: number;
  y: number;
  readonly width  = PLAYER_WIDTH;
  readonly height = PLAYER_HEIGHT;

  update(dt: number, input: InputManager) {
    if (input.isDown('ArrowLeft'))  this.x -= PLAYER_SPEED * dt;
    if (input.isDown('ArrowRight')) this.x += PLAYER_SPEED * dt;

    // 화면 경계 클램핑
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

- 초기 위치: 화면 하단 중앙 `(CANVAS_WIDTH/2 - PLAYER_WIDTH/2, CANVAS_HEIGHT - PLAYER_HEIGHT - 8)`
- 렌더링은 이후 Phase에서 스프라이트로 교체 가능하도록 `render()` 메서드로 분리

---

### `Game.ts`

update → render 순서의 고정 루프. `deltaTime`으로 프레임레이트에 독립적인 이동을 보장한다.

```ts
class Game {
  private lastTime = 0;
  private rafId    = 0;

  constructor(
    private ctx:   CanvasRenderingContext2D,
    private input: InputManager,
    private player: Player,
  ) {}

  start() {
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }

  private loop = (timestamp: number) => {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // 최대 50ms 캡
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.player.update(dt, this.input);
  }

  private render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 배경
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.player.render(this.ctx);
  }
}
```

`dt` 최대값을 50ms로 캡핑하는 이유: 탭 전환 등으로 브라우저가 잠시 멈췄다가 재개될 때
deltaTime이 수 초가 되어 캐릭터가 순간이동하는 현상 방지.

---

### `GameCanvas.tsx`

```tsx
const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const input  = new InputManager();
    const player = new Player();
    const game   = new Game(ctx, input, player);

    game.start();

    return () => {
      game.stop();
      input.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', margin: '0 auto', background: '#111' }}
    />
  );
};
```

`useEffect` cleanup에서 `game.stop()` + `input.destroy()`를 호출해
React Strict Mode의 이중 마운트에서도 루프가 중복 실행되지 않도록 한다.

---

## 렌더링 결과 (Phase 1 완료 시)

```
┌─────────────────────────┐
│                         │
│     (어두운 배경)        │
│                         │
│                         │
│                         │
│         [플레이어]       │   ← 파란 사각형, 화면 하단 중앙
└─────────────────────────┘
```

비주얼 에셋 없이 색상 사각형으로만 구성. 스프라이트 교체는 Phase 11 폴리싱 단계에서 진행.

---

## 검토 포인트

- `PLAYER_SPEED = 240 (px/초)` 수치가 적절한지 — 너무 빠르거나 느리면 조정
- 화면 크기 `480×640`이 적당한지 — 세로형 아케이드 비율 기준
- `Game`, `Player`, `InputManager`를 클래스로 분리하는 구조가 이후 확장에 문제없는지
