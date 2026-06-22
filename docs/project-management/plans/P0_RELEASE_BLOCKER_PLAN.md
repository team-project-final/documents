# P0 릴리즈 차단 해소 실행 플랜

> 작성: 2026-06-22 KST
> 기준 문서: [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)
> 포함 큐: Frontend production route API 전환, Full staging demo evidence
> 목표: `synapse-frontend` production route의 mock/API 공백을 닫고, full staging demo path를 끝까지 통과시킨다.
> 운영 원칙: 이 문서는 실행 계획용이며 GFM task checkbox를 쓰지 않는다.

## 1. 왜 P0인가

`synapse-frontend`는 dashboard 기준 260 / 483, remaining 223으로 전체 릴리즈의 최대 병목이다. 백엔드 서비스 대부분은 구현보다 운영 증거가 부족한 상태지만, frontend는 production route API-backed 전환, 상태 처리, focused test, responsive evidence가 함께 남아 있다.

2026-06-22 P2 sync에서 FE-03/04/06/08/09/10/11 일부 API-backed 및 QA 증거가 dashboard에 반영됐다. 여전히 group/dashboard/OAuth consent 계약 공백, staging demo, screenshot/browser QA 증거가 P0/P1 closeout을 막고 있다.

또한 Phase E 완료 조건은 full staging demo evidence다. frontend route가 mock 또는 demo fixture에 기대고 있으면 staging demo가 실제 릴리즈 증거가 되지 못한다. 따라서 P0는 frontend API 전환과 full staging demo를 하나의 릴리즈 차단 해소 플랜으로 묶는다.

## 2. 성공 정의

| 구분 | 성공 조건 |
|---|---|
| Frontend API 전환 | production route가 mock 데이터나 인증 바이패스 없이 repository/provider를 통해 실제 API 계약을 사용한다. |
| 상태 처리 | 주요 route가 `AsyncValue`, loading, error, empty state를 같은 방식으로 노출한다. |
| 테스트 | `flutter analyze`, `flutter test`, `flutter build web --release` 통과 로그가 남는다. |
| Staging demo | signup -> note -> graph/search -> AI cards -> review -> gamification -> notification/admin path가 수동 DB 수정 없이 성공한다. |
| PM 반영 | 증거가 있는 항목만 TASK/WORKFLOW/HISTORY와 dashboard sync 후보가 된다. |

## 3. 실행 순서

### P0-0. Preflight

| 순서 | 작업 | 산출물 |
|---:|---|---|
| 1 | `synapse-frontend` 원천 `TASK_frontend.md`, `WORKFLOW_frontend_W1.md` ~ `WORKFLOW_frontend_W5.md`, `HISTORY_frontend.md`를 확인한다. | 이번 세션에서 닫을 FE ID 목록 |
| 2 | Phase B handoff의 이미 완료된 항목을 재작업 목록에서 제외한다. | password reset, MFA backup codes, billing, notification, admin summary 제외 기록 |
| 3 | API 계약이 없는 endpoint는 frontend에서 임의로 만들지 않는 원칙을 다시 확인한다. | 계약 미확인 항목의 blocker 표기 |
| 4 | demo-only header와 fixture가 `APP_ENV=demo` 뒤에만 있는지 확인한다. | production route 오염 여부 기록 |

### P0-1. Frontend API-backed slice 전환

| 순서 | Source ID | 범위 | 완료 산출물 | 주요 blocker |
|---:|---|---|---|---|
| 1 | FE-03, FE-11, FE-14 | Knowledge note CRUD, autosave, markdown preview, tag/search/graph repository/provider 전환 | repository/provider, focused API test, widget smoke test | search result > 0, ES sync lag, API contract mismatch |
| 2 | FE-04 | Learning card review API, duration/constraints 정리 | review provider, smoke test, error/empty 처리 | review-due notification live evidence |
| 3 | FE-05, FE-09 | Engagement community, shared decks/shared notes, copy action | 검색/필터/정렬 provider, copy action test | engagement moderation/shared API 소유권 |
| 4 | FE-06 | Gamification XP, badge, level display, level-up animation API 연동 | gamification provider, smoke test | Kafka/live producer evidence |
| 5 | FE-02, FE-08 | Dashboard/sidebar summary, admin report route API 전환 | dashboard/admin route evidence | admin report API 계약 미확인 |
| 6 | FE-01 | OAuth consent allow/deny 계약 확인과 연결 여부 결정 | 계약 확인 결과, 연결 또는 blocker 기록 | platform-svc consent endpoint 미확인 |

작업 규칙:

- `repository -> provider -> screen` 흐름을 유지한다.
- production route의 `_mock*` 상수는 제거하거나 test/demo fixture layer로 이동한다.
- API 계약이 없으면 임의 endpoint를 만들지 않고 blocker로 남긴다.
- 각 slice마다 loading, error, empty state를 동시에 닫는다.

### P0-2. Frontend verification gate

| Gate | 실행 기준 | 통과 산출물 |
|---|---|---|
| Analyze | API-backed slice가 하나 이상 닫힐 때마다 실행한다. | `flutter analyze` pass 로그 |
| Focused tests | repository/provider 또는 핵심 화면 변경 직후 실행한다. | focused API/widget test pass 로그 |
| Full tests | P0 route 묶음이 닫힌 뒤 실행한다. | `flutter test` pass 로그 |
| Release build | staging demo 전 실행한다. | `flutter build web --release` pass 로그 |
| Route audit | staging demo 직전 production route를 확인한다. | mock/auth bypass 없음 기록 |

### P0-3. Full staging demo evidence

| 순서 | Demo step | 필요한 증거 |
|---:|---|---|
| 1 | Signup/login as learner | JWT 발급, `platform.auth.user-registered-v1`, audit trace |
| 2 | Create notes | note 저장, `note-created-v1` outbox, tenant/user trace |
| 3 | Graph/search 확인 | graph node/edge 렌더, search result > 0, ES sync lag 기록 |
| 4 | AI cards 생성 | `note.created -> learning-ai -> learning-card` eventId/tenantId 연속 로그 |
| 5 | Review 실행 | card review result, `card.review.due` 또는 review-completed event trace |
| 6 | Gamification 확인 | level-up 또는 badge-earned event, profile UI 반영 |
| 7 | Notification/admin 확인 | notification inbox live log, admin/audit visibility |
| 8 | Dashboard sync 후보 확인 | source PM 문서 변경, dry-run, validate-data, diff 기록 |

Staging seed 원칙:

- shared local fixture의 string ID와 staging UUID contract를 섞지 않는다.
- staging에서는 API, migration, seed job 중 하나의 승인된 seed path를 사용한다.
- 수동 DB 수정으로만 성공한 demo는 P0 완료 증거로 쓰지 않는다.

## 4. 병렬화 기준

| 병렬 가능 | 조건 |
|---|---|
| Knowledge FE slice와 backend ES sync evidence | API contract가 안정되어 있고 search result > 0 blocker가 분리되어 있을 때 |
| Learning review UI와 review-due notification evidence | eventId/tenantId 추적 필드가 합의되어 있을 때 |
| Engagement gamification UI와 Kafka live producer evidence | ECR/GitOps deployment tag가 확인되어 있을 때 |
| Responsive/design QA | API-backed route가 최소 skeleton state 이상으로 동작할 때 |

## 5. P0 완료 후 넘길 것

P0가 닫히면 다음 항목을 P1/P2로 넘긴다.

| 넘길 항목 | 대상 플랜 |
|---|---|
| backend live tail evidence의 owner별 잔여 로그 | [P1 증거 하드닝 실행 플랜](./P1_EVIDENCE_HARDENING_PLAN.md) |
| GitOps cost/stability, 24h signoff, metrics gap | [P1 증거 하드닝 실행 플랜](./P1_EVIDENCE_HARDENING_PLAN.md) |
| PM dashboard sync, validate-data, diff 승인 | [P2 PM Sync Hygiene 실행 플랜](./P2_PM_SYNC_HYGIENE_PLAN.md) |

## 6. Evidence log template

| Evidence ID | Source ID | Repo | Command or route | Result | Artifact path | PM update target |
|---|---|---|---|---|---|---|
| P0-FE-YYYYMMDD-01 | FE-03 | `synapse-frontend` | `flutter test ...` | PASS/FAIL | path 또는 로그 링크 | TASK/WORKFLOW/HISTORY |
| P0-DEMO-YYYYMMDD-01 | Phase E demo | staging | signup -> note -> search -> AI -> review -> notification | PASS/FAIL | runbook evidence | Phase E report, dashboard sync 후보 |
