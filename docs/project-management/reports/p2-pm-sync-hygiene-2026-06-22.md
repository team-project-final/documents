# P2 PM Sync Hygiene 실행 리포트

> 작성: 2026-06-22 KST
> 기준 계획: [P2 PM Sync Hygiene 실행 플랜](../plans/P2_PM_SYNC_HYGIENE_PLAN.md)
> 실행 범위: repo별 dry-run, 중앙 PM 사본 확인, frontend dashboard live sync, post-sync validation
> 원칙: `workflow-dashboard/data/*.json` 수동 편집 없이 parser sync만 사용했다.

## 1. 결론

`synapse-frontend`만 live sync를 실행했다.

frontend source PM 문서는 2026-06-22 API-backed slice와 focused test/build 증거를 포함했고, 중앙 `documents/docs/project-management` frontend 사본을 source와 일치시킨 뒤 dry-run, validation, diff review를 통과했다. 그 결과 dashboard는 `168 / 481`에서 `260 / 483`으로 갱신됐다.

나머지 six repo는 dry-run 결과가 current JSON과 count 기준으로 일치했고 changelog가 0개라 live sync를 실행하지 않았다.

## 2. Sync Evidence Register

| Sync ID | Repo | Source evidence | Dry-run result | Validation result | Diff verdict | Live sync |
|---|---|---|---|---|---|---|
| P2-SYNC-20260622-01 | `synapse-frontend` | `synapse-frontend` commits `70c4591`, `faede91`; `HISTORY_frontend.md` 2026-06-22 analyze/focused/full test/build PASS 기록 | 483 checks, 260 done, changelog 1 | pre/post 0 warning | approved: +92 done, +2 total; repo/track/owner unchanged; checkbox text/status/history/changelog/updatedAt 중심 | yes |
| P2-SYNC-20260622-02 | `synapse-platform-svc` | no new source completion evidence in this run | 377 checks, 366 done, changelog 0 | 0 warning | no-op count; live sync would only refresh timestamp | no |
| P2-SYNC-20260622-03 | `synapse-knowledge-svc` | no new staging/live closeout evidence in this run | 621 checks, 611 done, changelog 0 | 0 warning | no-op count; live sync not needed | no |
| P2-SYNC-20260622-04 | `synapse-learning-svc` | live AI-card/review-due chain still open | 695 checks, 693 done, changelog 0 | 0 warning | no-op count; live sync not needed | no |
| P2-SYNC-20260622-05 | `synapse-engagement-svc` | live producer/EKS evidence still open | 419 checks, 415 done, changelog 0 | 0 warning | no-op count; live sync not needed | no |
| P2-SYNC-20260622-06 | `synapse-shared` | staging/SLA closeout still open | 291 checks, 281 done, changelog 0 | 0 warning | no-op count; live sync not needed | no |
| P2-SYNC-20260622-07 | `synapse-gitops` | live AWS/EKS/ArgoCD evidence still open | 211 checks, 205 done, changelog 0 | 0 warning | no-op count; live sync not needed | no |

## 3. Frontend Diff Review

frontend sync changed these dashboard step totals:

| Area | Before | After | Done delta | Total delta |
|---|---:|---:|---:|---:|
| W2 Notes editor | 9 / 45 | 30 / 45 | +21 | 0 |
| W2 SRS review | 30 / 43 | 36 / 43 | +6 | 0 |
| W3 Gamification UI | 0 / 44 | 22 / 45 | +22 | +1 |
| W3 Admin reports | 5 / 42 | 21 / 42 | +16 | 0 |
| W3 Shared decks/notes | 0 / 42 | 21 / 43 | +21 | +1 |
| W4 Responsive verification | 0 / 14 | 3 / 14 | +3 | 0 |
| W4 Error/loading consistency | 0 / 13 | 3 / 13 | +3 | 0 |

Diff approval note:

| Check | Result |
|---|---|
| `repo`, track name, owner | unchanged |
| `validate-data` before live sync | 0 warning |
| `validate-data` after live sync | 0 warning |
| `workflow-dashboard/data/*.json` manual edit | none |
| Data files changed | only `workflow-dashboard/data/synapse-frontend.json` |
| Changelog | one new `WORKFLOW_*` entry with seven `check_done` changes |

The large textual diff is expected because parser output stores checkbox text. The changed text mirrors source PM evidence notes for API-backed route conversion and focused verification.

## 4. Central Copy Check

Before live sync, these frontend source PM files were copied to the central `documents/docs/project-management` mirror and hash-checked:

| File | Result |
|---|---|
| `task/TASK_frontend.md` | source and central match |
| `history/HISTORY_frontend.md` | source and central match |
| `workflow/WORKFLOW_frontend_W1.md` | source and central match |
| `workflow/WORKFLOW_frontend_W2.md` | source and central match |
| `workflow/WORKFLOW_frontend_W3.md` | source and central match |
| `workflow/WORKFLOW_frontend_W4.md` | source and central match |
| `workflow/WORKFLOW_frontend_W5.md` | source and central match |

## 5. Current Dashboard Snapshot

| Repo | Current |
|---|---:|
| `synapse-frontend` | 260 / 483 |
| `synapse-platform-svc` | 366 / 377 |
| `synapse-knowledge-svc` | 611 / 621 |
| `synapse-learning-svc` | 693 / 695 |
| `synapse-engagement-svc` | 415 / 419 |
| `synapse-shared` | 281 / 291 |
| `synapse-gitops` | 205 / 211 |

## 6. Remaining Guardrails

frontend is still not complete. The remaining release blockers are group/dashboard/OAuth consent API contract gaps, staging demo evidence, and UX screenshot/browser QA evidence.

For the other repos, keep the no-live-sync decision until their missing live/staging evidence is attached to source PM docs and a fresh dry-run produces an explainable diff.
