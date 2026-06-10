# Phase 설계 문서 인덱스

새 Phase 설계 문서(`phaseN.md`)를 추가할 때 이 파일에만 행을 추가한다.
CLAUDE.md와 AGENTS.md는 수정하지 않아도 된다.

## 네이밍 규칙

- 파일명: `phase{N}.md` (예: `phase1.md`, `phase2.md`)
- 위치: `docs/design/`

## 문서 목록

| Phase | 파일 | 핵심 내용 |
|-------|------|-----------|
| Phase 1 | [phase1.md](phase1.md) | 게임 화면·플레이어 이동 — Canvas 구조, 게임 루프, 입력 처리 |
| Phase 2 | [phase2.md](phase2.md) | 하푼 발사 — Harpoon 엔티티, 단발 제한, justPressed 설계 |
| Phase 3 | [phase3.md](phase3.md) | 풍선 물리 운동 — 중력, 바운스, 벽 반사, 크기별 수치 |
| Phase 4  | [phase4.md](phase4.md)   | 충돌 감지 — 원-사각형 판정, 하푼↔풍선, 플레이어 깜빡임 |
| Phase 5  | [phase5.md](phase5.md)   | 풍선 분열 — split() 메서드, 레벨별 자식 생성 |
| Phase 6  | [phase6.md](phase6.md)   | 생명 시스템 — loseLife, 게임 오버, 스테이지 재시작 |
| Phase 7  | [phase7.md](phase7.md)   | HUD/타이머 — 점수 체계, 60초 카운트다운, 잔기 표시 |
| Phase 8  | [phase8.md](phase8.md)   | 스테이지 진행 — STAGE_CLEAR/MISSION_CLEAR, 3스테이지 구성 |
| Phase 9  | [phase9.md](phase9.md)   | 무기 아이템 — DOUBLE_WIRE/POWER_WIRE/VULCAN 드롭·획득 |
| Phase 10 | [phase10.md](phase10.md) | 파워업 아이템 — BARRIER/CLOCK/HOURGLASS/DYNAMITE/1UP/FOOD |
| Phase 11 | [phase11.md](phase11.md) | 메인 화면 — MAIN 상태, HI-SCORE, 전체 화면 전환 흐름 |
