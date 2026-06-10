# Phase 3 설계 — 풍선 물리 운동

## 목표

대형 풍선 1개가 중력의 영향을 받아 포물선을 그리며 바닥을 튀고, 좌우 벽에 부딪혀 방향을 바꾸며 돌아다니는 상태.

---

## 물리 모델

### 중력 + 바닥 반사

원작 팡의 풍선은 튀어오를 때마다 **동일한 높이**를 유지한다.
에너지 손실 없이 일정하게 튀려면, 바닥 충돌 시 vy를 반사(부호 반전)하는 대신
**크기별로 고정된 바운스 속도**로 재설정해야 한다.

```
매 프레임:
  vy += GRAVITY * dt        // 중력 적용 (아래 방향)
  x  += vx * dt
  y  += vy * dt

바닥 충돌 (y + diameter >= CANVAS_HEIGHT):
  y  = CANVAS_HEIGHT - diameter   // 위치 보정
  vy = -BOUNCE_SPEED              // 고정 바운스 속도 (위 방향)

벽 충돌 (x <= 0 or x + diameter >= CANVAS_WIDTH):
  vx = -vx                        // 수평 속도 반전
```

### 크기별 수치

Phase 5(분열)를 고려해 크기를 숫자 레벨(3=대, 2=중, 1=소, 0=극소)로 정의한다.
Phase 3에서는 레벨 3(대형)만 사용한다.

| 레벨 | 이름 | 반지름 | 바운스 속도 | 수평 속도 |
|------|------|--------|-------------|-----------|
| 3 | 대 | 40px | 520 px/s | 80 px/s |
| 2 | 중 | 26px | 430 px/s | 110 px/s |
| 1 | 소 | 16px | 340 px/s | 150 px/s |
| 0 | 극소 | 10px | 260 px/s | 195 px/s |

> 크기가 작을수록 빠르게 움직이고 낮게 튀는 원작 특성을 반영.

---

## 새로 추가되는 상수 (`constants.ts`)

```ts
export const GRAVITY = 800; // px/s²

export const BALLOON_RADIUS       = [10, 16, 26, 40]; // 인덱스 = 레벨
export const BALLOON_BOUNCE_SPEED = [260, 340, 430, 520];
export const BALLOON_VX           = [195, 150, 110, 80];
```

배열 인덱스를 레벨로 사용해 `BALLOON_RADIUS[level]` 형태로 접근한다.

---

## 신규 모듈

### `entities/Balloon.ts`

```ts
class Balloon {
  readonly radius: number;
  vx: number;
  vy: number = 0; // 초기 vy는 0, 첫 프레임부터 중력을 받아 아래로 떨어진 뒤 바닥에서 튀어오름

  constructor(
    public x: number,   // 중심 x
    public y: number,   // 중심 y
    public level: number, // 3=대, 2=중, 1=소, 0=극소
    vxSign: 1 | -1 = 1,  // 초기 수평 방향
  ) {
    this.radius = BALLOON_RADIUS[level];
    this.vx     = BALLOON_VX[level] * vxSign;
  }

  get diameter() { return this.radius * 2; }

  update(dt: number) {
    this.vy += GRAVITY * dt;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;

    // 바닥 반사
    if (this.y + this.radius >= CANVAS_HEIGHT) {
      this.y  = CANVAS_HEIGHT - this.radius;
      this.vy = -BALLOON_BOUNCE_SPEED[this.level];
    }

    // 좌우 벽 반사
    if (this.x - this.radius <= 0) {
      this.x  = this.radius;
      this.vx = Math.abs(this.vx);
    }
    if (this.x + this.radius >= CANVAS_WIDTH) {
      this.x  = CANVAS_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
    ctx.strokeStyle = '#ff8888';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
```

- 초기 `vy = 0`: 첫 프레임부터 중력을 받아 자연스럽게 떨어진 뒤 바닥에서 첫 바운스
- `x`, `y`는 원의 **중심** 좌표 (충돌 계산 시 일관성 유지)
- Phase 4(충돌)에서 원-사각형 충돌 계산에 `radius`를 바로 사용

### `Game.ts` 변경

```ts
class Game {
  private balloons: Balloon[] = [];

  // 초기화 시 대형 풍선 1개 배치 (화면 중앙 상단)
  constructor(...) {
    this.balloons = [new Balloon(CANVAS_WIDTH / 2, 100, 3, 1)];
  }

  private update(dt: number) {
    // ... 기존 player, harpoon 로직 ...
    this.balloons.forEach(b => b.update(dt));
  }

  private render() {
    // ... 기존 렌더링 ...
    this.balloons.forEach(b => b.render(this.ctx));
  }
}
```

---

## 렌더링 결과 (Phase 3 완료 시)

```
┌─────────────────────────┐
│                         │
│      ●                  │  ← 대형 빨간 원, 포물선 운동
│                         │
│                         │
│         [플레이어]  |   │  ← 플레이어 + 하푼
└─────────────────────────┘
```

---

## 검토 포인트

- 초기 위치 `y = 100` 에서 떨어지기 시작하는 방식이 자연스러운지 (또는 화면 위 밖에서 등장 여부)
- 대형 풍선 바운스 높이 (BOUNCE_SPEED=520)가 원작과 유사하게 느껴지는지
- 수평 속도 80 px/s가 적절한지
