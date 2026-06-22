# Phase E Staging Demo Runbook

> 작성: 2026-06-21 KST
> 기준: `FINAL_REFACTOR_COMPLETION_PLAN.md` §8 Phase E
> 목적: signup/login -> note -> graph/search -> AI cards -> review -> gamification -> notification/admin demo path를 수동 DB 수정 없이 반복 실행하기 위한 체크리스트와 증거 템플릿을 고정한다.

## 1. 현재 결론

Phase E full staging demo는 아직 pass로 전환하면 안 된다.

이유:

- 외부 ingress/ALB 접근 경로가 확정되지 않아 staging 실행 경로는 in-cluster 또는 port-forward 전제다.
- frontend production route는 mock/auth-bypass 제거와 responsive/error/design QA 증거가 부족하다.
- search는 P3 latency는 PASS지만 result>0이 knowledge indexer/pgvector follow-up에 막혀 있다.
- AI card chain(P6)은 deckId, note body contract, Anthropic model ID, provider quota blocker가 있다.
- shared local seed SQL은 `e2e-user-01`/`tenant-e2e-001` 문자열 ID이고, W5 live evidence는 UUID user/tenant를 쓴다. 두 contract를 섞으면 demo 재현성이 깨진다.

## 2. Seed Contract 분리

### Staging canonical contract

Staging과 handoff 로그에는 W5 live chain에서 이미 검증된 UUID contract를 우선 사용한다.

| Field | Value |
|---|---|
| Tenant ID | `22222222-2222-2222-2222-222222222222` |
| Learner ID | `11111111-1111-1111-1111-111111111111` |
| Admin ID | `33333333-3333-3333-3333-333333333333` |
| Learner email | `demo.learner@synapse.local` |
| Admin email | `demo.admin@synapse.local` |
| Deck | `Graph Memory Deck` |
| Review target | 10 cards x 10 XP, level 1 -> 2 |

### Local fixture contract

The existing shared test seed uses non-UUID string IDs. Keep it local/test-only until service schemas and cross-service identity expectations are confirmed.

| Source | Contract |
|---|---|
| `synapse-shared/src/test/resources/seed/V001__test_users.sql` | `e2e-user-01`, `e2e-user-02`, `e2e-user-03`; tenants `tenant-e2e-001`, `tenant-e2e-002` |
| `V002__test_notes.sql` | `e2e-note-01`, `e2e-note-02` |
| `V003__test_cards.sql` | `e2e-card-01` to `e2e-card-03` |
| `V004__test_engagement_profiles.sql` | local XP/profile rows |
| `V005__test_learning_ai.sql` | local AI generation history rows |

Decision: Do not mark "manual DB modification free demo" as complete until staging uses one consistent seed path through public APIs, migration seed, or an approved seed job. Manual ad hoc SQL edits are not accepted evidence.

## 3. Preflight Checklist

| Check | Owner | Evidence |
|---|---|---|
| Access mode chosen: in-cluster, port-forward, or ingress/ALB | @team-lead/gitops | command transcript or URL |
| ArgoCD apps Synced/Healthy | @team-lead/gitops | app list screenshot/log |
| platform, knowledge, learning-card, learning-ai, engagement, gateway health | each owner | `/actuator/health` or service health log |
| Metrics gap state accepted or fixed | @team-lead + owners | Alertmanager firing list and accepted-risk note |
| Demo seed method selected | @team-lead + owners | API seed log, migration seed log, or seed job log |
| Frontend route mode selected | frontend | production API-backed route, not mock/auth-bypass |

## 4. Demo Path Checklist

| Step | Action | Expected | Evidence to capture | Owner | Current blocker |
|---:|---|---|---|---|---|
| 1 | Signup/login learner | JWT issued; `UserRegistered` emitted | request/response id, topic offset, audit row | @platform-owner | frontend production auth route not yet proven |
| 2 | Confirm tenant/user profile | profile and tenant match canonical IDs | `/users/me`, `/tenants/me` response | @platform-owner | none if platform route is reachable |
| 3 | Create notes with wikilinks/tags | notes persisted; `note-created-v1` emitted | note IDs, eventId, tenantId, outbox/topic log | @knowledge-owner-1 | staging note/graph E2E evidence open |
| 4 | Verify graph | graph includes created notes/links | graph API response or frontend screenshot | @knowledge-owner-1 | frontend graph production route open |
| 5 | Verify search | query returns result>0 under 2s | query, latency, hit count | @knowledge-owner-2 | indexer/pgvector follow-ups block result>0 |
| 6 | Generate AI cards | cards created in deck; notification candidate emitted | AI request id, generated card IDs, card API result | @learning-ai-owner | P6 deckId/note body/model/provider blockers |
| 7 | Review cards | 10 reviews complete; SM-2 state updated | review-completed event IDs, stats response | @learning-card-owner | review-due notification live evidence still open |
| 8 | Verify gamification | XP=100, level 2, level-up event | profile response, `LevelUp` event, audit row | @engagement-owner | W1 chain pass exists; frontend route still open |
| 9 | Verify notification/admin/audit | notification visible; audit/admin can inspect path | inbox response, admin/audit response | @platform-owner | admin role grant path and frontend admin route open |

## 5. Evidence Log Template

Use this block for each run. A failed run is acceptable evidence if the blocker is concrete.

```markdown
## Staging Demo Run - YYYY-MM-DD HH:mm KST

- Runner:
- Access mode:
- Git refs / image tags:
- Seed mode:
- Frontend mode:

| Step | Status | Evidence | Blocker / bug |
|---:|---|---|---|
| 1 signup/login |  |  |  |
| 2 tenant/user |  |  |  |
| 3 note create |  |  |  |
| 4 graph |  |  |  |
| 5 search |  |  |  |
| 6 AI cards |  |  |  |
| 7 review |  |  |  |
| 8 gamification |  |  |  |
| 9 notification/admin/audit |  |  |  |

P0 count:
P1 count:
Accepted risks:
Dashboard items updated:
```

## 6. Frontend Validation Evidence

Frontend validation was attempted from `synapse-frontend` on 2026-06-21 KST:

| Command | Result |
|---|---|
| `flutter analyze` | timed out after 120s with no completed analyzer output |
| `flutter analyze --no-pub` | timed out after 120s with no completed analyzer output |

2026-06-22 KST rerun after P0 frontend API-backed slices:

| Command | Result |
|---|---|
| `flutter analyze` | PASS |
| `flutter test test/services/engagement/engagement_api_test.dart test/services/engagement/gamification_screens_render_test.dart test/services/engagement/community_screens_render_test.dart test/services/platform/admin_screens_render_test.dart` | PASS, 45 tests |
| `flutter test` | PASS, 210 tests, 1 skipped |
| `flutter build web --release` | PASS, built `build/web`; existing CupertinoIcons font warning remains non-blocking |

Frontend interpretation:

- FE-05/09 shared decks/shared notes search/detail/fork/report routes are API-backed against engagement-svc `/api/v1/community`.
- FE-06 profile/badges/leaderboard/xp history routes are API-backed against `/api/v1/gamification`.
- FE-08 admin report list/moderate route is API-backed against engagement moderation endpoints.
- FE-01 OAuth consent no longer performs fake allow success; platform-svc allow/deny endpoint is still missing.
- FE-02 dashboard shell/admin summary is partially API-backed, but study-board/calendar/planner summary contracts remain unconfirmed.
- Phase E still cannot claim full staging demo pass until §4 is executed against staging with one approved seed path and captured service/event evidence.

## 7. P0/P1 Closeout Register

| Severity | Item | Status | Required closeout |
|---|---|---|---|
| P0 | Avro poison-message regression | PASS by Day4 evidence | Keep `STAGING_BRINGUP_W5_DAY4.md` §9 as evidence |
| P0 | Full demo path | OPEN | One complete run through §4 |
| P0 | Frontend production route | PARTIAL | 2026-06-22 analyze/test/build PASS and major API-backed slices recorded; remaining group/dashboard/OAuth consent contract blockers must be resolved or accepted before closeout |
| P1 | Metrics gap | OPEN or accepted risk | Link owner fixes or handoff accepted-risk note |
| P1 | Admin role operational path | OPEN or accepted risk | Manual grant runbook evidence or accepted-risk note |
| P1 | Search result>0 | OPEN or accepted risk | knowledge indexer/pgvector evidence or accepted-risk note |
| P1 | AI card chain | OPEN or accepted risk | P6 run evidence or accepted-risk note |

## 8. Next Action

The next Phase E worker should not edit dashboard JSON directly. Run the demo, paste the evidence log into a new dated report, then update PRD/TASK/WORKFLOW/HISTORY only for steps backed by that evidence.
