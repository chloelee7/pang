# AGENTS.md

AI 에이전트(Claude Code 등)가 이 저장소에서 작업할 때 참고하는 문서 맵이다.

---

## 프로젝트 문서 구조

### 기획 문서

| 파일 | 설명 |
|------|------|
| [`docs/PRD.md`](docs/PRD.md) | 팡 게임 전체 개요, 핵심 메커니즘, 구현 범위 체크리스트 |
| [`docs/PLAN.md`](docs/PLAN.md) | Phase별 구현 목표 및 단계 계획 |
| [`docs/FEATURES/main.md`](docs/FEATURES/main.md) | 메인 화면 UI 구성, 메뉴 항목, 화면 전환 흐름 |
| [`docs/FEATURES/game_rule.md`](docs/FEATURES/game_rule.md) | 게임 전체 룰 — 풍선 동작, 무기 시스템, 파워업, 점수, 생명 시스템 |
| [`docs/FEATURES/mission1.md`](docs/FEATURES/mission1.md) | Mission 1 (후지산) 스테이지 구성, 난이도 기준, 진행 규칙 |

### Phase 설계 문서

Phase별 기술 설계 (모듈 구조, 클래스 설계, 수치 기준 등). Phase 구현 전 반드시 읽는다.
파일명 규칙: `docs/design/phaseN.md`. 전체 목록 → [`docs/design/README.md`](docs/design/README.md)

### 개발 가이드

| 파일 | 설명 |
|------|------|
| [`CLAUDE.md`](CLAUDE.md) | 기술 스택, 주요 명령어, 아키텍처 원칙 및 설계 문서 링크 |

---

## 작업 시 우선 읽어야 할 문서

1. **새 Phase 구현 전**: `docs/PLAN.md` → `docs/design/phaseN.md`
2. **새 기능 구현 전**: `docs/PRD.md` → 해당 `docs/FEATURES/*.md`
3. **게임 로직 수정 전**: `docs/FEATURES/game_rule.md`
4. **미션 관련 작업**: `docs/FEATURES/mission1.md`
5. **UI/화면 관련 작업**: `docs/FEATURES/main.md`
