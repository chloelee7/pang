# Phase 4 설계 — 충돌 감지

## 목표

하푼이 풍선에 닿으면 둘 다 사라지고, 플레이어가 풍선에 닿으면 캐릭터가 깜빡인다.
이 Phase에서는 사망 처리 없이 시각적 반응(깜빡임)만 구현한다.

---

## 충돌 형태

| 충돌 쌍 | 형태 A | 형태 B | 알고리즘 |
|---------|--------|--------|----------|
| 하푼 ↔ 풍선 | 사각형 | 원 | 원-사각형 |
| 플레이어 ↔ 풍선 | 사각형 | 원 | 원-사각형 |

---

## 신규 모듈

### `utils/collision.ts`

원-사각형 충돌 판정 유틸리티. Phase 5(분열), Phase 6(생명) 등에서 재사용한다.

```ts
// 원의 중심(cx, cy)과 반지름(r)이 사각형(rx, ry, rw, rh)과 겹치는지 판정
export function circleRect(
  cx: number, cy: number, r: number,
  rx: number, ry: number, rw: number, rh: number,
): boolean {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
}
```

사각형에서 원의 중심과 가장 가까운 점을 구한 뒤, 그 거리가 반지름보다 작으면 충돌.

---

## 변경 모듈

### `entities/Player.ts` — 깜빡임 추가

피격 시 일정 시간 동안 캐릭터를 깜빡여 무적 상태를 시각적으로 표현한다.

```ts
class Player {
  private hitTimer = 0;
  private readonly HIT_DURATION    = 2.0;  // 깜빡임 지속 시간 (초)
  private readonly BLINK_INTERVAL  = 0.1;  // 깜빡임 간격 (초)

  update(dt: number, input: InputManager) {
    // ... 기존 이동 로직 ...
    if (this.hitTimer > 0) this.hitTimer -= dt;
  }

  hit() {
    this.hitTimer = this.HIT_DURATION;
  }

  isInvincible(): boolean {
    return this.hitTimer > 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    // 깜빡임: hitTimer가 남아 있을 때 BLINK_INTERVAL마다 보였다 안 보였다
    if (this.hitTimer > 0) {
      const visible = Math.floor(this.hitTimer / this.BLINK_INTERVAL) % 2 === 0;
      if (!visible) return;
    }
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

- `hit()` 호출 시 `hitTimer` 재설정 → 피격 중 재피격도 타이머가 갱신됨
- `isInvincible()` 이 true인 동안은 Game이 플레이어-풍선 충돌을 무시

---

### `Game.ts` — 충돌 처리 추가

update 흐름에 충돌 검사 단계를 추가한다.

```ts
private update(dt: number) {
  this.player.update(dt, this.input);
  // 하푼 발사 ...
  if (this.harpoon) this.harpoon.update(dt);
  this.balloons.forEach(b => b.update(dt));

  this.resolveCollisions(); // ← 신규

  this.input.update();
}

private resolveCollisions() {
  // 1. 하푼 ↔ 풍선
  if (this.harpoon) {
    const h = this.harpoon;
    const hit = this.balloons.findIndex(b =>
      circleRect(b.x, b.y, b.radius, h.x, h.y, h.width, h.height)
    );
    if (hit !== -1) {
      this.harpoon.active = false;
      this.harpoon = null;
      this.balloons.splice(hit, 1); // Phase 5에서 분열 로직으로 교체
    }
  }

  // 2. 플레이어 ↔ 풍선 (무적 중 무시)
  if (!this.player.isInvincible()) {
    const p = this.player;
    const hit = this.balloons.some(b =>
      circleRect(b.x, b.y, b.radius, p.x, p.y, p.width, p.height)
    );
    if (hit) this.player.hit();
  }
}
```

---

## 처리 순서 (update 내)

```
1. player.update()       — 이동
2. harpoon.update()      — 하푼 이동
3. balloons.update()     — 풍선 이동
4. resolveCollisions()   — 충돌 판정 (이동 완료 후)
5. input.update()        — 키 스냅샷
```

이동이 모두 끝난 뒤 충돌을 판정해야 같은 프레임 내 위치 기반 판정이 정확하다.

---

## 검토 포인트

- 깜빡임 지속 시간 2초, 간격 0.1초가 시각적으로 적당한지
- 하푼-풍선 충돌 시 이 Phase에서는 풍선을 단순 제거(Phase 5에서 분열로 교체 예정)하는 것이 괜찮은지
