# Phase 9 설계 — 무기 아이템

## 목표

풍선 파괴 시 무기 아이템이 드롭되고, 플레이어가 획득하면 발사 방식이 바뀐다.

## 무기 종류

| 무기 | 동작 |
|------|------|
| HARPOON (기본) | 단발, 천장 소멸 |
| DOUBLE_WIRE | 좌우 동시 2발 |
| POWER_WIRE | 천장에 2초간 고정 후 소멸 |
| VULCAN | Space 누르는 동안 0.15초 간격 연속 발사 |

## 아이템 엔티티 (WeaponItem)

- 풍선 파괴 위치에서 생성, 아래로 낙하 (100px/s)
- 8초 후 자동 소멸
- 플레이어와 겹치면 획득 (AABB 충돌)

## Harpoon 확장

- `sticky: boolean` — 파워 와이어 전용, 천장 고정
- `stickyTimer: number` — 고정 지속 시간 카운트다운

## Game 변경

- `harpoons: Harpoon[]` (배열로 전환, double wire 지원)
- `currentWeapon` 상태 관리
- 사망 시 weapon = HARPOON 리셋
- Vulcan: `vulcanTimer` 로 연속 발사 간격 제어
