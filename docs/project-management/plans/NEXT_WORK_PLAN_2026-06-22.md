# Synapse 다음 작업 계획 - 2026-06-22

> 작성: 2026-06-22 KST
> 기준 문서: [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)
> 연결 플랜: [P0 릴리즈 차단 해소 실행 플랜](./P0_RELEASE_BLOCKER_PLAN.md), [P1 증거 하드닝 실행 플랜](./P1_EVIDENCE_HARDENING_PLAN.md), [P2 PM Sync Hygiene 실행 플랜](./P2_PM_SYNC_HYGIENE_PLAN.md)
> 목적: 다음 세션에서 바로 시작할 작업을 P0/P1/P2 순서로 고정한다.
> 운영 원칙: PM dashboard parser 오염을 막기 위해 이 문서는 GFM task checkbox를 쓰지 않는다.

## 1. 결론

다음 작업은 **P0 frontend 병목 해소**로 시작한다. `REMAINING_WORK_MASTER.md` 기준 `synapse-frontend`는 276 / 485, remaining 209로 여전히 전체 릴리즈의 가장 큰 blocker다. FE-05 group list/detail/member/join API-backed 전환 증거와 dashboard live sync는 반영됐지만, dashboard/OAuth/staging/UX와 group-specific content/pagination 증거가 남아 있다.

이번 세션의 추천 목표는 `frontend production route audit`을 계속해 dashboard 또는 OAuth consent 계약 공백을 닫고, 이미 전환된 group route는 group-specific shared content contract와 pagination/staging evidence로 이어가는 것이다.

## 2. 우선 실행 목표

| 순서 | 목표 | 대상 | 산출물 |
|---:|---|---|---|
| 1 | Frontend remaining production route audit | `synapse-frontend` | dashboard/OAuth/group-specific content 계약 있음 / 없음 / blocker 표 |
| 2 | 계약 확인 route 1개 API-backed 전환 | dashboard summary 또는 OAuth consent 중 계약이 확인된 영역 | repository/provider/screen wiring, focused test |
| 3 | FE-05 후속 증거 보강 | community group route | group-specific shared content contract, pagination UX, staging smoke evidence |
| 4 | 검증 로그 확보 | `synapse-frontend` | `flutter analyze`, focused test, 가능한 경우 `flutter test` |
| 5 | P2 sync gate 통과 | `workflow-dashboard`, `documents` | dry-run, validate-data, diff verdict |

## 3. P0 실행 계획

### 3.1 Frontend remaining production route audit

| Audit target | 확인할 내용 | 판정 |
|---|---|---|
| OAuth consent allow/deny | platform-svc에 allow/deny endpoint 또는 대체 계약이 있는지 확인 | 계약 있음 / 계약 없음 / blocker |
| Dashboard study-board summary | backend API 또는 existing summary endpoint로 대체 가능한지 확인 | 계약 있음 / 계약 없음 / blocker |
| Dashboard calendar/planner summary | frontend route가 production mock에 기대는지 확인 | 계약 있음 / 계약 없음 / blocker |
| Community group-specific content | group detail 안의 shared content contract와 pagination UX가 있는지 확인 | 계약 있음 / 계약 없음 / blocker |
| Remaining production mocks | `_mock*`, fake fixture, demo-only 경로가 production route에 남아 있는지 확인 | 제거 / demo 격리 / blocker |

Audit 원칙:

- backend 계약 없는 endpoint를 frontend에서 임의로 만들지 않는다.
- demo-only header와 fixture는 `APP_ENV=demo` 뒤에만 둔다.
- 계약이 없으면 구현 완료로 처리하지 않고 blocker로 남긴다.
- blocker는 owner/date/source evidence와 함께 `REMAINING_WORK_MASTER.md` 또는 phase report에 반영한다.

### 3.2 API-backed 전환 우선순위

| 우선순위 | 범위 | 이유 | 완료 산출물 |
|---:|---|---|---|
| 1 | Dashboard/sidebar group/board summary | FE-02 open count가 크고 demo path의 첫 화면 신뢰도를 좌우한다. | repository/provider 전환, loading/error/empty, smoke test |
| 2 | OAuth consent | platform-svc 계약 확인이 선행되어야 하며, 계약 미확인 시 blocker 처리한다. | allow/deny 연결 또는 contract blocker record |
| 3 | Community group-specific shared content | group list/detail/member는 전환됐으므로 group 내부 콘텐츠 계약과 pagination UX를 닫는다. | contract record, pagination UX evidence, staging smoke |
| 4 | Remaining loading/error/empty state | API-backed route 완료 처리를 위해 UX 상태 증거가 필요하다. | `AppLoadingWidget`, `AppErrorWidget`, empty state 적용 증거 |

## 4. 검증 계획

| Gate | 실행 시점 | 산출물 |
|---|---|---|
| Focused repository/provider test | API-backed route 전환 직후 | pass/fail 로그 |
| Widget smoke test | 핵심 화면 wiring 후 | route render, loading/error/empty state 증거 |
| `flutter analyze` | route 1개 이상 변경 후 | pass 로그 |
| `flutter test` | P0 route 묶음 또는 provider 변경이 누적된 뒤 | pass 로그 또는 blocker |
| Route audit | PM 완료 반영 전 | mock/auth bypass 없음 기록 |

검증 판정:

- code/test 증거 없이 PM checkbox를 완료 처리하지 않는다.
- analyze/test 실패는 완료 증거가 아니라 blocker evidence로 기록한다.
- production route가 demo fixture에 기대면 P0 완료로 보지 않는다.

## 5. Staging demo 준비

| 단계 | 작업 | 필요한 증거 |
|---:|---|---|
| 1 | seed path 확정 | API / migration / seed job 중 승인된 단일 경로 |
| 2 | signup/login 실행 | JWT, audit, user/tenant trace |
| 3 | note 생성 | note save, `note-created-v1`, tenant/user trace |
| 4 | graph/search 확인 | graph node/edge, search result > 0, ES sync lag |
| 5 | AI cards 생성 | `note.created -> learning-ai -> learning-card` eventId/tenantId 연속 로그 |
| 6 | review 실행 | review result, review-due 또는 review-completed event |
| 7 | gamification 확인 | level-up 또는 badge-earned event, frontend UI 반영 |
| 8 | notification/admin 확인 | notification inbox live log, admin/audit visibility |

Seed 원칙:

- shared local fixture의 string ID와 staging UUID contract를 섞지 않는다.
- 수동 DB 수정으로만 성공한 demo는 P0 완료 증거로 쓰지 않는다.
- demo path evidence는 Phase E runbook과 frontend PM history에 함께 연결한다.

## 6. P1 병렬 작업

| 병렬 작업 | 조건 | 산출물 |
|---|---|---|
| Platform `AuthBillingE2ETest` 재실행 | Docker daemon 또는 동등 환경 준비 | auth/billing live 또는 equivalent evidence |
| Knowledge Docker/ES search E2E | Docker daemon, ES test path 준비 | search result > 0, DLQ 0 또는 blocker |
| Frontend 3 viewport QA | API-backed route가 최소 skeleton state 이상 동작 | mobile/tablet/desktop screenshot 또는 QA note |
| GitOps live evidence | EKS kubeconfig와 ArgoCD login 준비 | HPA/PDB, Synced/Healthy, Image Updater, 24h signoff |

병렬화 기준:

- P0 route 개발을 막지 않는 증거 수집은 P1로 병렬 진행한다.
- P1 evidence가 P0 staging demo path에 필요한 경우 우선순위를 올린다.
- 외부 환경 blocker는 owner/date/blocker 형식으로 남긴다.

## 7. P2 sync gate

완료 반영은 항상 아래 순서로 한다.

1. 원천 repo PM 문서 업데이트
2. 중앙 `documents/docs/project-management` 사본 업데이트
3. `workflow-dashboard` repo별 dry-run
4. `node scripts/validate-data.mjs` 0 warning 확인
5. dashboard JSON diff 확인
6. 필요한 경우에만 live sync
7. `REMAINING_WORK_MASTER.md`와 관련 plan/report 갱신

P2 금지 규칙:

- `workflow-dashboard/data/*.json`을 수동 편집하지 않는다.
- dry-run 없이 live sync하지 않는다.
- validation warning이 있으면 완료 선언하지 않는다.
- 증거 없는 checkbox 완료 처리는 하지 않는다.

## 8. 세션 종료 기준

| 기준 | 최소 종료 조건 |
|---|---|
| P0 audit | dashboard/OAuth/group-specific content 중 최소 1개 범위의 계약 판정 완료 |
| API-backed 전환 | 계약 확인 route 1개 이상 repository/provider/screen 연결 |
| 검증 | focused test와 `flutter analyze` 결과 확보 |
| PM evidence | 원천 PM 문서 변경 후보와 중앙 문서 반영 지점 기록 |
| Sync | dry-run/validation/diff 또는 sync blocker 기록 |

## 9. 다음 세션 첫 명령 후보

```powershell
cd D:\workspace\final-project-syn\synapse-frontend
rg -n "_mock|fake|fixture|TODO|consent|dashboard|planner|calendar|pagination|shared content" lib test
```

```powershell
cd D:\workspace\final-project-syn\synapse-platform-svc
rg -n "consent|oauth|allow|deny|authorize" src test docs
```

```powershell
cd D:\workspace\final-project-syn\synapse-engagement-svc
rg -n "group|moderation|shared|deck|report" src test docs
```
