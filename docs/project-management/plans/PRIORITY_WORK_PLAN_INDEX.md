# Synapse 우선순위별 실행 플랜 인덱스

> 작성: 2026-06-22 KST
> 기준 문서: [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)
> 목적: 통합 남은 작업 관리판의 P0/P1/P2 큐를 실행 가능한 별도 플랜으로 나눈다.
> 운영 원칙: PM dashboard parser 오염을 막기 위해 이 문서와 하위 플랜은 GFM task checkbox를 쓰지 않는다.

## 1. 플랜 맵

| Priority | 실행 플랜 | 포함 큐 | 목표 |
|---|---|---|---|
| P0 | [P0 릴리즈 차단 해소 실행 플랜](./P0_RELEASE_BLOCKER_PLAN.md) | Frontend production route API 전환, Full staging demo evidence | frontend 병목과 통합 demo gate를 먼저 닫아 릴리즈 차단을 제거한다. |
| P1 | [P1 증거 하드닝 실행 플랜](./P1_EVIDENCE_HARDENING_PLAN.md) | Backend live tail evidence, GitOps cost/stability live gate, Design/responsive QA | 이미 구현된 영역의 live/staging/UX 증거를 모아 완료 처리 가능한 상태로 만든다. |
| P2 | [P2 PM Sync Hygiene 실행 플랜](./P2_PM_SYNC_HYGIENE_PLAN.md) | PM sync hygiene | 원천 PM 문서와 workflow-dashboard 간 count drift와 false completion을 막는다. |

## 2. 실행 선택 규칙

1. P0가 열려 있으면 새 구현 세션은 P0에서 고른다.
2. P0 작업 중 backend, GitOps, design 증거 수집이 막히지 않는 경우 P1을 병렬 진행한다.
3. P2는 완료 반영 직전마다 반드시 실행한다. P2는 마지막 정리 작업이 아니라 모든 완료 처리의 guardrail이다.
4. 어떤 항목도 원천 repo PM 문서, 중앙 documents 사본, workflow-dashboard dry-run/validation 증거 없이 완료 처리하지 않는다.

## 3. 공통 완료 증거

| 증거 범주 | 인정되는 증거 |
|---|---|
| Code/Test | unit, integration, widget, E2E, build, analyze 로그 |
| Runtime | staging/live 로그, eventId, tenantId, Kafka topic, pod/app 상태 |
| UX | mobile/tablet/desktop screenshot 또는 QA note |
| PM Sync | TASK/WORKFLOW/HISTORY 갱신, dashboard dry-run/validation/diff 결과 |

## 4. 문서 업데이트 순서

완료 처리는 항상 아래 순서로 한다.

1. 원천 repo의 `docs/project-management` 문서를 업데이트한다.
2. `documents/docs/project-management` 중앙 사본과 관련 보고서를 업데이트한다.
3. `workflow-dashboard`에서 repo별 dry-run을 실행한다.
4. `validate-data`가 0 warning인지 확인한다.
5. diff가 의도한 `done/total/history/changelog/updatedAt` 변경만 포함하는지 확인한다.
6. 필요한 경우에만 live sync를 실행한다.
7. [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)와 이 플랜 인덱스를 갱신한다.

## 5. 관련 기준 문서

| 문서 | 용도 |
|---|---|
| [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md) | 통합 잔여 작업 원천 관리판 |
| [FINAL_REFACTOR_COMPLETION_PLAN.md](../FINAL_REFACTOR_COMPLETION_PLAN.md) | Phase A-F 전체 마감 전략 |
| [Phase B Platform Frontend Handoff](../reports/phase-b-platform-frontend-handoff-2026-06-21.md) | frontend API 전환 인수 기준 |
| [Phase C Backend Verification Report](../reports/phase-c-backend-verification-2026-06-21.md) | backend 검증 증거와 live tail gate |
| [Phase D GitOps Release Hardening Report](../reports/phase-d-gitops-release-hardening-2026-06-21.md) | GitOps live gate 기준 |
| [Phase E QA Docs Closeout Report](../reports/phase-e-qa-docs-closeout-2026-06-21.md) | staging demo, evidence map, owner/date/blocker 기준 |
| [Phase E Staging Demo Runbook](../reports/phase-e-staging-demo-runbook-2026-06-21.md) | full staging demo 실행 절차 |
| [Phase F PM Dashboard Sync Report](../reports/phase-f-pm-dashboard-doc-sync-2026-06-21.md) | PM dashboard sync gate |
| [Phase F Dashboard Drift Audit](../reports/phase-f-dashboard-drift-audit-2026-06-21.md) | count drift 원인과 재발 방지 기준 |
| [P2 PM Sync Hygiene Report](../reports/p2-pm-sync-hygiene-2026-06-22.md) | 2026-06-22 frontend sync 실행 증거와 no-op repo 판정 |
