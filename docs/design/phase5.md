# Phase 5 설계 — 풍선 분열 시스템

## 목표

하푼이 풍선에 맞으면 2개의 작은 풍선으로 분열되고, 최소 크기(레벨 0)는 완전히 사라진다.

## 분열 규칙

- level > 0 → 자식 풍선 2개 생성 (level - 1), 좌우 반대 방향으로 퍼짐
- level === 0 → 완전 제거

## Balloon.split()

```ts
split(): Balloon[] {
  if (this.level === 0) return [];
  return [
    new Balloon(this.x, this.y, this.level - 1, -1), // 왼쪽
    new Balloon(this.x, this.y, this.level - 1,  1), // 오른쪽
  ];
}
```

## Game.resolveCollisions() 변경

```ts
// splice(idx, 1) → 분열 결과로 교체
const children = this.balloons[idx].split();
this.balloons.splice(idx, 1, ...children);
```
