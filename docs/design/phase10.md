# Phase 10 설계 — 파워업 아이템

## 아이템 종류

| 아이템 | 효과 |
|--------|------|
| BARRIER | 피격 1회 방어, 방어 후 소멸 |
| CLOCK | 풍선 3초 정지 (타이머 계속) |
| HOURGLASS | 풍선 속도 절반 5초 |
| DYNAMITE | 전체 풍선 즉시 레벨 0으로 분열 |
| ONE_UP | 잔기 +1 |
| FOOD | 점수 +3000 |

## 구현 방식

- WeaponItem과 별도 `PowerItem` 엔티티 (같은 낙하 방식)
- `hasBarrier`, `frozenTimer`, `slowTimer` 를 Game에서 관리
- Balloon.update()에 `speedMult` 인자 추가 (slow 적용)
- 배리어 보유 중 피격 → 배리어 소멸, 생명 유지
