# P2 PM Sync Hygiene 실행 플랜

> 작성: 2026-06-22 KST
> 기준 문서: [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)
> 포함 큐: PM sync hygiene
> 목표: PM 문서와 workflow-dashboard 사이의 count drift, 수동 JSON 수정, 증거 없는 완료 처리를 방지한다.
> 운영 원칙: 이 문서는 실행 계획용이며 GFM task checkbox를 쓰지 않는다.

## 1. 왜 P2인가

P2는 낮은 우선순위의 "나중 정리"가 아니라 완료 처리의 안전장치다. P0/P1에서 증거를 만들더라도 sync 절차가 흔들리면 dashboard가 실제 상태보다 앞서가거나, 원천 PM 문서와 중앙 사본이 서로 어긋난다.

Phase F 기준으로 `frontend`, `shared`, `gitops`는 count drift 원인이 이미 한 번 분리되었다. 이후 sync는 dry-run, validation, diff 확인을 통과한 경우에만 진행한다.

## 2. 금지 규칙

| 금지 사항 | 이유 |
|---|---|
| `workflow-dashboard/data/*.json` 수동 편집 | parser/source-of-truth 계약을 깨고 false completion을 만든다. |
| 증거 없는 PRD/TASK/WORKFLOW checkbox 완료 처리 | dashboard 완료율만 올라가고 실제 release confidence가 생기지 않는다. |
| repo별 dry-run 없이 live sync 실행 | count drift 원인을 설명할 수 없다. |
| `validate-data` warning이 있는 상태에서 sync 완료 선언 | dashboard 소비자가 깨진 데이터를 읽을 수 있다. |
| 중앙 documents 사본만 수정하고 원천 repo PM 문서를 건너뛰기 | 다음 sync에서 변경이 되돌아가거나 drift가 재발한다. |

## 3. Sync 실행 순서

| 순서 | 단계 | 실행 내용 | 산출물 |
|---:|---|---|---|
| 1 | Source update | 원천 repo `TASK`/`WORKFLOW`/`HISTORY`를 증거 기준으로 업데이트한다. | 원천 PM diff |
| 2 | Central copy update | `documents/docs/project-management` 사본과 관련 report/master를 맞춘다. | 중앙 PM diff |
| 3 | Repo dry-run | `workflow-dashboard`에서 대상 repo만 dry-run한다. | dry-run done/total/history/changelog |
| 4 | Validate | dashboard data validation을 실행한다. | 0 warning 로그 |
| 5 | Diff review | current JSON 대비 intended diff만 있는지 확인한다. | diff approval note |
| 6 | Live sync | 필요한 repo만 live sync한다. | updated dashboard JSON |
| 7 | Post-sync validate | live sync 후 다시 validation한다. | 0 warning 로그 |
| 8 | Master update | [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)와 priority plan 상태를 갱신한다. | 중앙 관리판 최신화 |

## 4. 권장 명령

아래 명령은 `workflow-dashboard` 루트에서 실행한다.

```powershell
node scripts/sync.mjs <repo> --dry-run
node scripts/validate-data.mjs
git diff -- data
node scripts/sync.mjs <repo>
node scripts/validate-data.mjs
git diff -- data
```

주의:

- `<repo>`는 `synapse-frontend`, `synapse-platform-svc`, `synapse-knowledge-svc`, `synapse-learning-svc`, `synapse-engagement-svc`, `synapse-shared`, `synapse-gitops` 중 하나로 제한한다.
- live sync 전에 dry-run 결과가 current JSON과 왜 다른지 설명할 수 있어야 한다.
- live sync 후 diff는 intended `done/total/history/changelog/updatedAt` 변경 중심이어야 한다.

## 5. Repo별 sync 판정 기준

| Repo | Sync 전 확인 | Live sync 후보 조건 |
|---|---|---|
| `synapse-frontend` | W1/W2/W3/W5 raw parser 결과가 current JSON과 맞는지 확인 | P0 API-backed 증거와 focused test가 있는 FE 항목만 |
| `synapse-platform-svc` | Auth/Billing, notification/admin live evidence 확인 | `AuthBillingE2ETest`, Stripe/inbox/admin evidence가 연결된 경우 |
| `synapse-knowledge-svc` | ES sync, note/graph/search evidence 확인 | search result > 0, DLQ 0, coverage 또는 slice test evidence가 있는 경우 |
| `synapse-learning-svc` | AI card chain, review-due notification evidence 확인 | eventId/tenantId 연속 로그가 있는 경우 |
| `synapse-engagement-svc` | Kafka ACL/live producer, ECR/GitOps evidence 확인 | level/badge producer log와 deploy tag 증거가 있는 경우 |
| `synapse-shared` | partial checkbox parser 결과와 current JSON 일치 여부 확인 | 불필요한 `updatedAt`만 바뀌는 sync는 보류 |
| `synapse-gitops` | `gitops -> team-lead` alias, partial metadata diff 보정 확인 | live AWS/EKS/ArgoCD evidence가 있는 check만 |

## 6. Diff review policy

| Diff 유형 | 판정 |
|---|---|
| `done`, `total`, `history`, `changelog`, `updatedAt`만 바뀜 | intended change일 수 있다. dry-run 설명과 증거를 붙인다. |
| `track`, `owner`, `repo`, `source`가 바뀜 | drift 또는 parser 계약 변경 가능성이 있으므로 보류하고 원인 기록이 필요하다. |
| 대량 삭제 또는 changelog 급증 | live sync 금지. source doc rename/delete 또는 parser regression을 먼저 확인한다. |
| `updatedAt`만 바뀜 | 완료율 변화가 없으면 live sync를 보류할 수 있다. |
| validation warning 발생 | sync 완료 선언 금지. warning 0으로 만든 뒤 재검증한다. |

## 7. 완료 처리 기준

어떤 항목도 아래 네 가지가 없으면 완료 처리하지 않는다.

| 기준 | 필요 증거 |
|---|---|
| Code/Test | unit/integration/widget/E2E/build/analyze 로그 |
| Runtime | staging/live 로그, eventId, tenantId, topic, pod/app 상태 |
| UX | mobile/tablet/desktop screenshot 또는 QA note |
| PM Sync | TASK/WORKFLOW/HISTORY 갱신, dashboard dry-run/validation 결과 |

## 8. Sync evidence template

| Sync ID | Repo | Source evidence | Dry-run result | Validation result | Diff verdict | Live sync |
|---|---|---|---|---|---|---|
| P2-SYNC-YYYYMMDD-01 | `synapse-frontend` | FE evidence ID | done/total summary | 0 warning 또는 blocker | approved/blocked | yes/no |
