# P1 증거 하드닝 실행 플랜

> 작성: 2026-06-22 KST
> 기준 문서: [REMAINING_WORK_MASTER.md](../REMAINING_WORK_MASTER.md)
> 포함 큐: Backend live tail evidence, GitOps cost/stability live gate, Design/responsive QA
> 목표: 구현은 거의 끝났지만 완료 처리하지 못한 backend, GitOps, frontend QA 항목을 증거 기반으로 닫는다.
> 운영 원칙: 이 문서는 실행 계획용이며 GFM task checkbox를 쓰지 않는다.

## 1. 왜 P1인가

P1 항목은 대부분 구현량보다 증거와 운영 확인이 부족하다. `synapse-platform-svc`, `synapse-knowledge-svc`, `synapse-learning-svc`, `synapse-engagement-svc`, `synapse-shared`, `synapse-gitops`는 dashboard 기준 96% 이상이지만 live/staging, event chain, ArgoCD/EKS, responsive/design evidence가 모자라 완료 처리할 수 없다.

P1은 P0처럼 release blocker의 첫 관문은 아니지만, 최종 handoff에서 "작동한다"를 증명하는 핵심 증거다.

## 2. 성공 정의

| 구분 | 성공 조건 |
|---|---|
| Backend live tail | platform/knowledge/learning/engagement/shared 잔여 항목이 staging/live 또는 동등 실행 로그와 연결된다. |
| GitOps live gate | cost tag, HPA/PDB, Image Updater writeback, metrics gap, 24h signoff가 evidence artifact와 연결된다. |
| Design/responsive QA | auth, dashboard, notes, cards, community, search, notification, admin 화면이 mobile/tablet/desktop에서 확인된다. |
| Handoff | 미완료 항목은 owner/date/blocker 또는 accepted risk로 남는다. |

## 3. Workstream A: Backend live tail evidence

| Repo | Source ID | 남은 작업 | 필요한 증거 | 완료 처리 대상 |
|---|---|---|---|---|
| `synapse-platform-svc` | PLAT-01 | Auth/Billing E2E, Stripe test data | signup -> login -> JWT refresh -> MFA -> logout, subscription/payment history/receipt trace | platform TASK/WORKFLOW/HISTORY, Phase C/E reports |
| `synapse-platform-svc` | PLAT-02 | notification/admin 안정화 | `card.review.due`, `community.*`, FCM/SES path, inbox live log, admin role/metrics follow-up | platform PM docs, dashboard sync 후보 |
| `synapse-knowledge-svc` | KNOW-01 ~ KNOW-06 | note version, tag, note/graph E2E, ES sync | slice test, coverage 80% 이상, search result > 0, DLQ 0, graph demo note set | knowledge PM docs, README/API/runbook |
| `synapse-learning-svc` | LEARN-AI-01 | AI card chain | `note.created -> learning-ai -> learning-card API` eventId/tenantId 연속 로그 | learning-ai/card PM docs |
| `synapse-learning-svc` | LEARN-CARD-01 | review due notification | review due event -> platform notification live evidence | learning-card/platform PM docs |
| `synapse-engagement-svc` | ENG-01 | Kafka gamification ACL | topic ACL, producer 권한, publish log | engagement PM docs |
| `synapse-engagement-svc` | ENG-02 | gamification E2E deploy proof | ECR semver image, GitOps `newTag`, EKS pod Kafka/MSK init, level/badge producer log | engagement/gitops PM docs |
| `synapse-shared` | SHARED-01 ~ SHARED-05 | E2E, SLA, staging closeout, event correlation | seed run, SLA capture, 24h signoff, Kafka full-hop consumer -> DB eventId correlation | shared PM docs, Phase E handoff |

Execution notes:

- event evidence는 eventId와 tenantId를 반드시 포함한다.
- backend local build pass만으로 live tail을 닫지 않는다.
- blocker가 외부 환경이면 owner/date/blocker를 남기고 P0 staging demo와 연결한다.

## 4. Workstream B: GitOps cost/stability live gate

| Gate | 필요한 작업 | 필요한 증거 |
|---|---|---|
| Cost Explorer tag | cost tag policy와 untagged resource 상태 확인 | tag report, 비용 분포 capture |
| HPA/PDB live | W5 runbook 기준 기대 상태 재검증 | `kubectl` 또는 ArgoCD/EKS 상태 로그 |
| Image Updater writeback | semver tag push -> image-updater branch/PR -> dev sync 확인 | ECR tag, Image Updater log, GitOps diff |
| Metrics gap | missing metric 또는 dashboard gap 정리 | monitoring capture, follow-up owner |
| 24h signoff | dev/staging 안정성 확인 | 24h 운영 기록, incident 0 또는 accepted risk |
| Destroy decision | 비용/데모 후 환경 유지 여부 결정 | handoff decision record |

완료 처리 원칙:

- `synapse-gitops` 남은 6개 check는 live AWS/EKS/ArgoCD 증거가 붙을 때만 닫는다.
- dashboard sync는 P2 절차를 통과하기 전까지 실행하지 않는다.
- `yamllint`/`kubeconform`은 가능한 환경에서만 gate로 삼고, 도구 부재는 blocker가 아니라 environment note로 남긴다.

## 5. Workstream C: Design/responsive QA

| 화면군 | 확인할 것 | 증거 |
|---|---|---|
| Auth | login/signup/OAuth/password/MFA 상태, validation, error/empty | 3 viewport screenshot 또는 QA note |
| Dashboard | sidebar, summary cards, API-backed state, empty/error | 3 viewport screenshot 또는 QA note |
| Notes/Search/Graph | editor, autosave, markdown preview, graph/search state | 3 viewport screenshot 또는 QA note |
| Cards/Review/AI | deck/card/review/AI card generation state | 3 viewport screenshot 또는 QA note |
| Community/Shared | group list/detail, search/filter/sort, copy action | 3 viewport screenshot 또는 QA note |
| Gamification | XP, level, badge, level-up 표현이 절제된 제품 톤 안에 있는지 | design QA note |
| Notification/Admin | inbox/preferences/device, admin dashboard/report | 3 viewport screenshot 또는 QA note |

Design 기준:

- 제품 앱은 `documents/DESIGN.md`를 기준으로 한다.
- `synapse-gitops/DESIGN.md`는 local-k8s/developer guide용이므로 제품 앱에 섞지 않는다.
- hardcoded `Color(...)`, `Colors.*`는 token/theme 파일 외 product color인지 구분해 기록한다.
- `SynapseOrb`/orb 흔적은 기능적 표현인지 장식인지 분리해 판단한다.

## 6. 권장 실행 순서

| 순서 | 작업 |
|---:|---|
| 1 | P0 route가 바뀌는 영역과 겹치지 않는 backend live evidence부터 수집한다. |
| 2 | knowledge search, learning AI chain, engagement gamification처럼 P0 demo path에 필요한 evidence를 먼저 닫는다. |
| 3 | GitOps Image Updater/ECR/ArgoCD 증거를 staging demo 전후로 확보한다. |
| 4 | API-backed route가 안정된 화면부터 responsive/design QA를 수행한다. |
| 5 | owner/date/blocker 또는 accepted risk를 Phase E final handoff에 반영한다. |

## 7. Evidence register template

| Evidence ID | Priority | Repo | Gate | Owner | Result | Artifact path | Follow-up |
|---|---|---|---|---|---|---|---|
| P1-BE-YYYYMMDD-01 | P1 | `synapse-knowledge-svc` | ES sync/search | @knowledge-owner-2 | PASS/FAIL | path 또는 로그 링크 | blocker 또는 sync 후보 |
| P1-GITOPS-YYYYMMDD-01 | P1 | `synapse-gitops` | Image Updater | @team-lead | PASS/FAIL | path 또는 로그 링크 | dashboard sync 후보 |
| P1-QA-YYYYMMDD-01 | P1 | `synapse-frontend` | responsive QA | 전체 협업 | PASS/FAIL | screenshot 또는 QA note | FE PM update |
