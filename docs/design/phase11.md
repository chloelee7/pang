# Phase 11 설계 — 메인 화면과 전체 흐름

## 게임 상태 확장

```ts
type GameState = 'MAIN' | 'PLAYING' | 'STAGE_CLEAR' | 'MISSION_CLEAR' | 'GAME_OVER';
```

## 메인 화면 구성

- 타이틀 "PANG"
- "1 PLAYER" 메뉴 (Enter로 시작)
- HI-SCORE 표시 (세션 내 최고점)

## HI-SCORE

- Game 인스턴스 내 `hiScore` 보관
- GAME_OVER / MISSION_CLEAR 시점에 score와 비교해 갱신
- MAIN 화면 복귀 시 표시

## 전체 흐름

MAIN → (Enter) → PLAYING → STAGE_CLEAR → ... → MISSION_CLEAR → (Enter) → MAIN
                                                → GAME_OVER → (Enter) → MAIN
