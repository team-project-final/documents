# Phase E 통합 QA 및 문서 마감 실행 리포트

> 작성: 2026-06-21 KST
> 기준 계획: `documents/docs/project-management/FINAL_REFACTOR_COMPLETION_PLAN.md` Phase E
> 기준 데이터: `workflow-dashboard/data/synapse-*.json` (`updatedAt` 2026-06-20 11:49 UTC 전후)
> 기준 증거: `synapse-shared/docs/project-management/HANDOFF_W5_DAY4_CLOSEOUT.md`, `synapse-shared/docs/reports/STAGING_BRINGUP_W5_DAY4.md`, `synapse-shared/docs/reports/SLA_VERIFICATION_W5.md`
> 후속 실행: [Phase E Staging Demo Runbook](./phase-e-staging-demo-runbook-2026-06-21.md)

## 1. 실행 원칙

Phase E는 완료율을 강제로 올리는 단계가 아니다. 이 리포트는 코드/테스트/운영 증거가 있는 항목만 완료 근거로 연결하고, 증거가 부족한 항목은 owner/date/blocker가 있는 잔여 레지스터로 남긴다.

이번 동기화에서 PRD/TASK/WORKFLOW 체크박스는 직접 완료 처리하지 않았다. `workflow-dashboard`가 아직 100%가 아니며, 특히 frontend는 production route의 API-backed 증거와 responsive/error/design QA 증거가 부족하다.

## 2. Dashboard 기준 현황

| Repo | Done / Total | Remaining | Percent | Phase E 판단 |
|---|---:|---:|---:|---|
| `synapse-frontend` | 168 / 481 | 313 | 34.9% | 릴리즈 병목. mock/API/responsive/error/design QA 증거 필요 |
| `synapse-platform-svc` | 366 / 377 | 11 | 97.1% | Auth/Billing E2E와 notification 안정화 잔여 |
| `synapse-knowledge-svc` | 611 / 621 | 10 | 98.4% | ES sync, note/graph E2E, 검색 기능 결과 잔여 |
| `synapse-learning-svc` | 693 / 695 | 2 | 99.7% | AI card chain, review due notification 증거 잔여 |
| `synapse-engagement-svc` | 415 / 419 | 4 | 99.0% | gamification Kafka/live path 증거 잔여 |
| `synapse-shared` | 281 / 291 | 10 | 96.6% | 전체 E2E 조율, SLA/staging 문서 잔여 |
| `synapse-gitops` | 204 / 211 | 7 | 96.7% | cost/stability, 24h signoff, metrics gap 잔여 |

## 3. 통합 Demo Seed Contract

아래 값은 수동 DB 수정 없이 demo path를 반복하기 위한 seed contract다. 이미 존재하는 seed와 충돌하면 같은 의미의 tenant/user로 매핑하되, demo 문서와 로그에는 같은 식별자를 사용한다.

| 영역 | 값 |
|---|---|
| Tenant | `22222222-2222-2222-2222-222222222222` / `Synapse Demo Tenant` |
| Learner | `11111111-1111-1111-1111-111111111111` / `demo.learner@synapse.local` |
| Admin | `33333333-3333-3333-3333-333333333333` / `demo.admin@synapse.local` |
| Notes | `Graph Learning Basics`, `Spaced Repetition Notes`, `Korean Search Nori Memo` |
| Deck | `Graph Memory Deck` |
| Review Cards | 10 cards, each 10 XP path, expected level transition 1 -> 2 |
| Gamification | total XP 0 at start, 100 after 10 reviews, level-up event expected |
| Notifications | Level-up notification and AI card ready notification candidates |

2026-06-21 follow-up: existing shared local seed SQL uses `e2e-user-01` / `tenant-e2e-001` string IDs, while W5 live evidence uses UUID user/tenant IDs. Treat shared seed SQL as local fixture only until staging seed is executed through a single approved API, migration, or seed job path. The split is captured in the staging demo runbook.

## 4. Staging Demo Path

Current access decision: Day4 handoff says external ALB/ingress is not fixed yet. Until that is resolved, the repeatable staging demo uses in-cluster access or port-forward as the default path.

| Step | Scenario | Expected result | Current evidence |
|---:|---|---|---|
| 1 | Signup/login as learner | `platform.auth.user-registered-v1` emitted, JWT issued | Day4 P0 regression signup 201 and UserRegistered consumed without poison |
| 2 | Tenant/user profile visible | tenant/user APIs return current principal | platform README API surface and W5 frontend integration backlog |
| 3 | Create notes with links/tags | note saved, outbox emits `note-created-v1` | knowledge local build/runbook evidence; staging ES sync still open |
| 4 | Graph/search visible | graph returns linked notes; search returns indexed results | graph path covered locally; P3 search latency PASS but result>0 blocked by indexer |
| 5 | AI cards generated from note | learning-ai calls card API and emits notification | P6 blocked by deckId/note body/model ID/provider quota issues |
| 6 | Review cards | ReviewCompleted, XP, LevelUp, audit, notification path succeeds | SLA report W1 full-chain PASS, P4/P5 1.31s |
| 7 | Gamification state visible | profile shows level 2 and XP 100 | W1 chain evidence; frontend gamification production route still incomplete |
| 8 | Notification/admin visibility | notification inbox/audit/admin report visible | P7 FCM 100% PASS; F8/admin role operational path still owner follow-up |

## 5. Evidence Map

| Evidence | Result | Use in Phase E |
|---|---|---|
| `STAGING_BRINGUP_W5_DAY4.md` | ArgoCD 16/16 Synced/Healthy, dev 9 + staging 7, ES green, Observability running | staging health evidence |
| `STAGING_BRINGUP_W5_DAY4.md` §9 | P0 regression PASS, signup -> engagement profile -> audit, poison error 0 | FR-ALL-302 cross-service P0 evidence |
| `SLA_VERIFICATION_W5.md` | P1/P2/P4/P5/P7 PASS, P3 latency partial, P6 blocked | SLA and demo path evidence |
| `HANDOFF_W5_DAY4_CLOSEOUT.md` | Day5 entry, 24h signoff pending, metrics gaps listed | final handoff baseline |
| `workflow-dashboard/data/*.json` | dashboard incomplete, frontend 34.9% | do not mark completion beyond evidence |
| knowledge/engagement README | service surface, verification, runbook sections present | README handoff coverage improved |

## 6. Open Items With Owner / Date / Blocker

| Area | Owner | Date | Blocker |
|---|---|---|---|
| Frontend API-backed production route | 전체 frontend | 2026-06-21 recorded | 313 dashboard checks remain; auth/dashboard/notes/community/admin/gamification still lack full production evidence |
| Frontend responsive/error/design QA | 전체 frontend/design | 2026-06-21 recorded | W4/W5 responsive, error/loading, DESIGN token checks are not started in dashboard |
| Platform auth/billing E2E | @platform-owner | 2026-06-21 recorded | `AuthBillingE2ETest`, Stripe test data, live notification inbox path need final evidence |
| Platform metrics/admin role | @platform-owner | 2026-06-21 recorded | `/actuator/prometheus` 500 and admin role grant path remain owner follow-ups |
| Knowledge ES sync/search result | @knowledge-owner-2 | 2026-06-21 recorded | P3 latency passes, but result>0 blocked by indexer and pgvector follow-ups |
| Knowledge note/graph E2E | @knowledge-owner-1 | 2026-06-21 recorded | dashboard still has note/graph E2E and ES stabilization checks open |
| Learning AI card chain | @learning-ai-owner | 2026-06-21 recorded | P6 blocked by deckId, note body contract, Anthropic model ID, provider quota |
| Learning review due notification | @learning-card-owner | 2026-06-21 recorded | review-due -> notification live evidence remains 1 dashboard check open |
| Engagement gamification live path | @engagement-owner | 2026-06-21 recorded | gamification Kafka/live producer and ECR/GitOps proof still has 4 checks open |
| Shared E2E/SLA/staging closeout | @team-lead | 2026-06-21 recorded | dashboard has 10 checks open; 24h signoff and metrics gap need final evidence |
| GitOps cost/stability | @team-lead/gitops | 2026-06-21 recorded | Cost optimization + stability step 10/17; metrics gap and destroy decision pending |

## 7. PM Document Sync Actions

Completed in this pass:

- Created this central Phase E report under `documents/docs/project-management/reports/`.
- Created [Phase E Staging Demo Runbook](./phase-e-staging-demo-runbook-2026-06-21.md) with preflight checks, demo path checklist, seed contract split, evidence log template, and P0/P1 closeout register.
- Added a central README entry so the Phase E report becomes the QA/docs closeout entry point.
- Added local PM README sync notes in frontend, platform, knowledge, learning, engagement, shared, and gitops folders.

Not completed intentionally:

- No dashboard JSON was edited by hand.
- No PRD/TASK/WORKFLOW checkbox was marked done without new test or staging evidence.
- No staging command was executed from this sandbox because the current access path depends on AWS/SSM/kubectl credentials and the Day4 handoff says ingress/ALB access is still undecided.
- `flutter analyze` and `flutter analyze --no-pub` were attempted from `synapse-frontend`, but both timed out after 120s without completed analyzer output; this is recorded as blocker evidence, not as a pass.

## 8. Acceptance Status

| Phase E acceptance | Status | Reason |
|---|---|---|
| Dashboard 100% or every incomplete item has owner/date/blocker | Partial | Dashboard is not 100%; this report adds owner/date/blocker at area level |
| P0 bug 0 | Pass for cross-service regression | Day4 P0 regression PASS; no new P0 found in this doc pass |
| P1 bugs fixed or accepted in handoff | Partial | metrics/admin/search/P6/frontend gaps remain listed |
| Demo path succeeds without manual DB modification | Partial | W1 full-chain succeeds by evidence; full product demo still blocked by frontend/P3/P6/access gaps |

## 9. Next Closeout Gate

The next Phase E gate should only mark additional completion when these artifacts exist:

1. frontend `flutter analyze`, `flutter test`, and `flutter build web --release` logs.
2. screenshots or QA notes for mobile/tablet/desktop on auth, notes, cards, community, search, notifications, admin.
3. staging demo run log covering signup -> note -> graph/search -> AI cards -> review -> gamification -> notification/admin, using the runbook evidence template.
4. updated service README/runbook entries only where the run was actually executed.
5. regenerated workflow-dashboard data from PM docs, not manual JSON edits.
