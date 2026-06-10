# Phase 6 설계 — 생명 시스템과 게임 오버

## 목표

풍선에 닿으면 즉사·잔기 감소·스테이지 재시작, 잔기 0 시 게임 오버 화면.

## 게임 상태

```ts
type GameState = 'PLAYING' | 'GAME_OVER';
```

## 흐름

플레이어 피격 (isInvincible=false)
  → loseLife()
    → lives--
    → lives === 0 → state = 'GAME_OVER'
    → lives > 0  → resetStage() + player.respawn() + player.hit() (무적 시작)

게임 오버 화면: "GAME OVER" 텍스트 + "PRESS ENTER" 안내
Enter 입력 → lives = 3 + resetStage() + state = 'PLAYING'

## 변경점

- Game에 `lives = 3`, `state: GameState = 'PLAYING'` 추가
- resolveCollisions: player 피격 시 player.hit() 대신 this.loseLife() 호출
- update: state가 GAME_OVER이면 입력만 확인(Enter → 재시작), 나머지 로직 스킵
- render: state별 화면 분기
- resetStage(): 풍선 초기 배치 복원 + harpoon = null
