# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택

- **React 18** + **TypeScript 5.6** — UI 프레임워크 및 타입 시스템
- **Vite 5** — 빌드 도구 및 개발 서버 (Node.js v18 이상 필요, 단 create-vite 최신 버전은 v20+ 필요)
- **ESLint 9** — 린터 (`typescript-eslint` + `react-hooks` + `react-refresh` 플러그인)
- TypeScript strict 모드 활성화 (`noUnusedLocals`, `noUnusedParameters` 포함)

## 주요 명령어

```bash
npm run dev       # 개발 서버 실행 (기본 포트 5173)
npm run build     # TypeScript 타입 체크 후 프로덕션 빌드 (dist/)
npm run lint      # ESLint 실행
npm run preview   # 빌드 결과물 로컬 미리보기
```

## 테스트 방법

현재 테스트 프레임워크(Vitest, Jest 등)가 설정되어 있지 않습니다. 테스트가 필요하다면 Vitest 도입을 권장합니다(Vite와 통합이 자연스럽습니다).

```bash
# Vitest 도입 시 예시
npm install -D vitest @testing-library/react @testing-library/jest-dom
# 단일 테스트 실행: npx vitest run src/App.test.tsx
```

## 코드 구조

- `src/main.tsx` — 앱 진입점. `<App />`을 `#root`에 마운트
- `src/App.tsx` — 루트 컴포넌트
- `index.html` — Vite의 HTML 템플릿, `<div id="root">` 포함
- `vite.config.ts` — `@vitejs/plugin-react` 사용 (Babel 기반 Fast Refresh)
- `tsconfig.json` — `tsconfig.app.json`(src 대상)과 `tsconfig.node.json`(vite 설정 대상)을 참조하는 복합 프로젝트 구조

## 게임 아키텍처 원칙

Phase별 상세 설계는 `docs/design/phaseN.md` 패턴으로 관리한다.
새 Phase 작업 전 해당 파일을 먼저 읽는다.
전체 목록은 [`docs/design/README.md`](docs/design/README.md)에서 확인한다.
