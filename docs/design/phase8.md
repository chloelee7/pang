# Phase 8 설계 — 스테이지 클리어와 진행

## 목표

모든 풍선 제거 시 클리어, Stage 1→2→3 진행, Stage 3 클리어 후 Mission 완료.

## 게임 상태 확장

```ts
type GameState = 'PLAYING' | 'STAGE_CLEAR' | 'MISSION_CLEAR' | 'GAME_OVER';
```

## 스테이지 구성 (Mission 1)

```ts
const STAGES: BalloonConfig[][] = [
  // Stage 1: 대형 1개
  [{ level: 3, x: 0.5, vxSign: 1 }],
  // Stage 2: 대형 2개 (좌우)
  [{ level: 3, x: 0.3, vxSign: 1 }, { level: 3, x: 0.7, vxSign: -1 }],
  // Stage 3: 대형 2개 + 중형 1개
  [{ level: 3, x: 0.25, vxSign: 1 }, { level: 3, x: 0.75, vxSign: -1 }, { level: 2, x: 0.5, vxSign: 1 }],
];
// x는 CANVAS_WIDTH 비율
```

## 전환 흐름

- 모든 풍선 제거 → state = 'STAGE_CLEAR', clearTimer = 2초
- clearTimer 종료 → stageIdx < 2: 다음 스테이지 / stageIdx === 2: state = 'MISSION_CLEAR'
- MISSION_CLEAR: "MISSION CLEAR" 표시, Enter → 처음부터(stageIdx=0) 재시작
