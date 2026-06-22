# Synapse 통합 남은 작업 관리 문서

> 작성: 2026-06-21 KST
> 목적: 각 레포의 `TASK`, `WORKFLOW`, `HISTORY`, phase report에 흩어진 잔여 작업을 하나의 실행 관리판으로 통합한다.
> 원칙: 이 문서는 PM dashboard parser 오염을 막기 위해 GFM task checkbox를 쓰지 않는다. 실제 완료 처리는 원천 `TASK`/`WORKFLOW`/`HISTORY`와 dashboard sync 증거가 있을 때만 한다.

## 1. 운영 규칙

1. 다음 작업은 이 문서에서 고른다.
2. 구현 또는 검증 전에는 반드시 원천 레포의 `docs/project-management` 문서를 확인한다.
3. 완료 증거는 테스트 로그, staging/live 로그, screenshot, runbook 결과 중 하나로 남긴다.
4. 완료 반영 순서는 `원천 repo PM 문서 -> documents 중앙 사본 -> workflow-dashboard parser sync -> 이 문서 갱신`이다.
5. `workflow-dashboard/data/*.json`은 수동 편집하지 않는다. dry-run, validation, diff 확인 후 sync한다.

주요 원천:

| 구분 | 문서 |
|---|---|
| 전체 계획 | `documents/docs/project-management/FINAL_REFACTOR_COMPLETION_PLAN.md` |
| Phase B handoff | `documents/docs/project-management/reports/phase-b-platform-frontend-handoff-2026-06-21.md` |
| Phase C backend | `documents/docs/project-management/reports/phase-c-backend-verification-2026-06-21.md` |
| Phase D GitOps | `documents/docs/project-management/reports/phase-d-gitops-release-hardening-2026-06-21.md` |
| Phase E QA/docs | `documents/docs/project-management/reports/phase-e-qa-docs-closeout-2026-06-21.md` |
| Phase E runbook | `documents/docs/project-management/reports/phase-e-staging-demo-runbook-2026-06-21.md` |
| Phase F sync | `documents/docs/project-management/reports/phase-f-pm-dashboard-doc-sync-2026-06-21.md` |
| Phase F drift audit | `documents/docs/project-management/reports/phase-f-dashboard-drift-audit-2026-06-21.md` |
| P1 evidence hardening | `documents/docs/project-management/reports/p1-evidence-hardening-2026-06-22.md` |
| P2 sync hygiene | `documents/docs/project-management/reports/p2-pm-sync-hygiene-2026-06-22.md` |

## 2. Dashboard 기준 현황

기준: `workflow-dashboard/data/synapse-*.json` history 최신값, 2026-06-22 KST 재확인.

| Repo | Done / Total | Remaining | Percent | 현재 판단 |
|---|---:|---:|---:|---|
| `synapse-frontend` | 276 / 485 | 209 | 56.9% | 최대 병목은 유지. 2026-06-22 group list/detail/member API 전환 증거와 dashboard live sync 반영. dashboard/OAuth/staging/UX 및 group-specific content/pagination 증거 필요 |
| `synapse-platform-svc` | 366 / 377 | 11 | 97.1% | backend tail. live notification/admin/Stripe 증거 필요 |
| `synapse-knowledge-svc` | 611 / 621 | 10 | 98.4% | ES sync, note/graph/search 운영 증거 필요 |
| `synapse-learning-svc` | 693 / 695 | 2 | 99.7% | cross-service event proof 2개 필요 |
| `synapse-engagement-svc` | 415 / 419 | 4 | 99.0% | Kafka ACL/live producer, ECR/GitOps 증거 필요 |
| `synapse-shared` | 281 / 291 | 10 | 96.6% | E2E/SLA/staging closeout 증거 필요 |
| `synapse-gitops` | 205 / 211 | 6 | 97.2% | cost/stability/live ArgoCD 증거 필요 |

참고: `documents` 레포에는 각 서비스 PM 문서 사본이 함께 있으므로 raw unchecked count가 크게 나온다. 진행률 판단은 위 dashboard JSON과 원천 레포 문서를 기준으로 한다.

## 3. Phase별 남은 작업

| Phase | 상태 | 남은 작업 | 완료 조건 |
|---|---|---|---|
| A. 프론트 디자인 시스템 정렬 | Partial | `SynapseOrb`/orb 흔적 검토, hardcoded color 구분, desktop/tablet/mobile 화면 QA | DESIGN.md와 충돌 없는 화면 증거, responsive/design dashboard check 감소 |
| B. 프론트 API 연동 및 상태 리팩토링 | Partial | OAuth consent contract, dashboard group/board API contract, staging/live evidence, remaining production mocks | `flutter analyze`, `flutter test`, `flutter build web --release`, production route mock 제거 |
| C. 백엔드 검증 잔여 작업 | Partial | platform 11, knowledge 10, learning 2, engagement 4, shared 10 tail gate | staging/live 또는 동등한 실행 로그와 eventId/tenantId 추적 |
| D. GitOps 및 릴리즈 하드닝 | Partial | cost/stability 6개, ECR tag, ArgoCD Image Updater writeback, metrics gap, 24h signoff | AWS/EKS/ArgoCD live 증거와 handoff 기록 |
| E. 통합 QA 및 문서 마감 | Partial | full staging demo, frontend QA, search/AI blocker, owner/date/blocker 세분화 | demo path end-to-end pass, P0 0건, P1 해결 또는 accepted risk |
| F. PM dashboard / 문서 동기화 | Partial | 추가 sync는 dry-run/validate/diff 통과 시에만 실행 | sync 후 `validate-data` 0 warning, 수동 JSON 수정 없음 |

## 4. 우선순위 큐

| Priority | 묶음 | 이유 | 다음 액션 |
|---|---|---|---|
| P0 | Frontend production route API 전환 | frontend remaining 209로 전체 릴리즈 병목 | dashboard/OAuth consent contracts, group-specific shared content, pagination UX 증거 확인 후 API-backed 전환 |
| P0 | Full staging demo evidence | Phase E 완료 조건의 핵심 gate | staging seed path 확정 후 signup -> note -> graph/search -> AI cards -> review -> gamification -> notification/admin 실행 |
| P1 | Backend live tail evidence | 백엔드 구현은 대부분 끝났고 운영 증거가 부족 | 2026-06-22 local/equivalent tests PASS 일부 확보. Docker/EKS/live event chain은 owner별 live 로그 수집 필요 |
| P1 | GitOps cost/stability live gate | GitOps는 6개만 남았지만 live AWS/EKS 증거가 필요 | 2026-06-22 semver drift 수정 + local verify PASS, Cost Explorer partial. HPA/PDB, ArgoCD, 24h signoff 잔여 |
| P1 | Design/responsive QA | API 전환 후 화면 품질 완료 처리에 필요 | 2026-06-22 render suite PASS. screenshot/browser QA와 token cleanup 잔여 |
| P2 | PM sync hygiene | count drift 재발 방지 | repo별 dry-run, validation, diff 확인 후만 dashboard sync |

### 실행 플랜 문서

| Priority | 문서 | 적용 범위 |
|---|---|---|
| P0 | [P0 릴리즈 차단 해소 실행 플랜](./plans/P0_RELEASE_BLOCKER_PLAN.md) | frontend production route API 전환, full staging demo evidence |
| P1 | [P1 증거 하드닝 실행 플랜](./plans/P1_EVIDENCE_HARDENING_PLAN.md) | backend live tail evidence, GitOps cost/stability live gate, design/responsive QA |
| P2 | [P2 PM Sync Hygiene 실행 플랜](./plans/P2_PM_SYNC_HYGIENE_PLAN.md) | PM source 문서, 중앙 사본, workflow-dashboard sync 위생 |
| 전체 | [우선순위별 실행 플랜 인덱스](./plans/PRIORITY_WORK_PLAN_INDEX.md) | P0/P1/P2 선택 규칙, 공통 증거 기준, 관련 기준 문서 |

## 5. Repo별 남은 작업

### synapse-frontend

원천 문서:

| 종류 | 경로 |
|---|---|
| TASK | `synapse-frontend/docs/project-management/task/TASK_frontend.md` |
| WORKFLOW | `synapse-frontend/docs/project-management/workflow/WORKFLOW_frontend_W1.md` ~ `WORKFLOW_frontend_W5.md` |
| HISTORY | `synapse-frontend/docs/project-management/history/HISTORY_frontend.md` |
| 중앙 handoff | `documents/docs/project-management/reports/phase-b-platform-frontend-handoff-2026-06-21.md` |

관리 기준: backend 계약 없는 endpoint를 frontend에서 임의로 만들지 않는다. demo-only header는 `APP_ENV=demo`에만 남기고 production route는 API-backed repository/provider로 닫는다.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| FE-01 | W1 로그인/회원가입 화면 및 OAuth 인증 | 6 | OAuth consent allow/deny backend endpoint 미확인. Frontend fake approval 제거 완료, platform-svc 계약 필요 |
| FE-02 | W1 대시보드 및 사이드바 네비게이션 | 35 | admin dashboard summary API-backed 완료. dashboard study-board/calendar/planner summary API contract 및 QA 증거 필요 |
| FE-03 | W2 노트 에디터 화면 | 15 | API-backed note CRUD/autosave/render 증거 반영. live staging note smoke, 일부 service/state/doc checks 잔여 |
| FE-04 | W2 SRS 복습 화면 | 7 | learning-card review API-backed 증거 반영. review-due notification live evidence와 staging smoke 잔여 |
| FE-05 | W2 커뮤니티 그룹 목록/상세 화면 | 37 | shared decks/notes search/detail/fork/report API-backed 완료. 그룹 목록/상세/멤버/join API-backed 완료. 그룹별 공유 콘텐츠 계약, 페이지네이션 UX, staging smoke 증거 잔여 |
| FE-06 | W3 게이미피케이션 UI | 23 | profile/badge/leaderboard/xp history API-backed 완료. level-up live animation/event evidence 잔여 |
| FE-07 | W3 알림 센터 | 6 | 이미 API 검증된 inbox/preferences/device 경로의 남은 PM 문서 정합화 |
| FE-08 | W3 관리자 신고 화면 | 21 | engagement moderation API list/moderate 전환 완료. admin role live evidence 잔여 |
| FE-09 | W3 공유 덱 탐색/상세 | 22 | shared decks/shared notes search/detail/fork/report API-backed 완료. 그룹 API와 staging copy evidence 잔여 |
| FE-10 | W4 전체 화면 반응형 검증 | 11 | 일부 render test 증거 반영. tablet/시나리오/화면 증거 잔여 |
| FE-11 | W4 에러/로딩 상태 일관성 | 10 | knowledge/learning route partial loading/error 증거 반영. 전수 확인과 coverage 잔여 |
| FE-12 | W4 DESIGN.md 토큰 일관성 | 13 | hardcoded color/spacing 검토, token alignment 증거 |
| FE-13 | W5 반응형 검증 | 6 | 인증/노트/카드/커뮤니티/검색/알림 화면 3뷰포트 확인 |
| FE-14 | W5 에러/로딩 상태 통일 | 6 | production route별 loading/error/empty 적용 확인 |
| FE-15 | W5 컨테이너 이미지 파이프라인 | 5 | ECR image 생성, 주요 화면 3뷰포트 pass, smoke evidence |

최근 완료로 별도 재작업하지 않는 항목: password reset, MFA backup codes, billing usage/history/receipt, notification inbox/preferences/device registration, admin dashboard summary.

### synapse-platform-svc

원천 문서: `TASK_platform.md`, `WORKFLOW_platform_W1.md` ~ `WORKFLOW_platform_W5.md`, `HISTORY_platform.md`.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| PLAT-01 | W5 인증/결제 E2E | 4 | live E2E용 테스트 계정/Stripe data, signup -> login -> JWT refresh -> MFA -> logout, 구독 변경/결제 이력/영수증 검증 |
| PLAT-02 | W5 알림 안정화 | 7 | `card.review.due`, `community.*` notification path, FCM/SES 경로, inbox live log, admin role/metrics follow-up |

완료 조건: `AuthBillingE2ETest` 또는 staging/live 동등 로그, notification inbox live path, Stripe test data trace.

### synapse-knowledge-svc

원천 문서: `TASK_knowledge-1.md`, `TASK_knowledge-2.md`, `WORKFLOW_knowledge-*`, knowledge reports.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| KNOW-01 | W3 note 버전 이력 | 1 | slice test evidence |
| KNOW-02 | W3 태그 관리 고도화 | 1 | slice test evidence |
| KNOW-03 | W4 노트/그래프 E2E 테스트 | 1 | coverage 80% 이상 확인 |
| KNOW-04 | W4 버그 수정 + ES 동기화 안정화 | 1 | coverage 80% 이상 확인 |
| KNOW-05 | W5 노트/그래프 E2E | 1 | P0 bug fix regression |
| KNOW-06 | W5 ES 동기화 안정화 | 5 | 검색 반영 지연, graph demo note set, staging search result > 0, DLQ 0 |

완료 조건: ES sync와 note/graph/search staging 또는 동등한 실행 로그, README/API/runbook 최신화.

### synapse-learning-svc

원천 문서: `TASK_learning-ai.md`, `TASK_learning-card.md`, `WORKFLOW_learning-ai_*`, `WORKFLOW_learning-card_*`.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| LEARN-AI-01 | W3 AI 카드 자동 생성 | 1 | Docker Compose 또는 staging에서 `note.created -> learning-ai -> learning-card API` 확인 |
| LEARN-CARD-01 | W3 `card.review.due` 발행 | 1 | review due event -> platform notification live evidence |

완료 조건: eventId/tenantId 기준으로 AI card chain과 review-due notification 경로가 이어진 로그.

### synapse-engagement-svc

원천 문서: `TASK_engagement.md`, `WORKFLOW_engagement_W1.md` ~ `WORKFLOW_engagement_W5.md`, engagement history.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| ENG-01 | W3 Kafka gamification events | 1 | Kafka topic ACL, engagement-svc publish 권한 |
| ENG-02 | W5 게이미피케이션 E2E | 3 | ECR semver image, image-updater dev `newTag`, GitOps/EKS live producer proof |

완료 조건: level-up/badge-earned event, ECR tag, GitOps newTag, EKS pod Kafka/MSK init log.

### synapse-shared

원천 문서: `TASK_team-lead.md`, `WORKFLOW_team-lead_W1.md` ~ `WORKFLOW_team-lead_W5.md`, shared handoff/report 문서.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| SHARED-01 | W4 전체 E2E 시나리오 정의 + 테스트 실행 조율 | 2 | 레벨업 경계 사용자/신고 report seed gap, coverage 80% 확인 |
| SHARED-02 | W4 성능 SLA 검증 | 3 | 부하 테스트 데이터, 검색 응답 검증, SLA 증거 정리 |
| SHARED-03 | W4 Staging 배포 + 모니터링 대시보드 | 2 | coverage 확인, 24h 안정성/운영가이드 문서 |
| SHARED-04 | W5 전체 E2E 서비스 단위 실행 | 2 | AI 생성 leg, 검색 leg blocker 해소, P0 regression과 API docs/history 갱신 |
| SHARED-05 | W5 성능 SLA 검증 | 1 | Kafka full-hop consumer -> DB eventId correlation 측정 |

완료 조건: cross-service seed run, SLA/staging signoff, event correlation dashboard capture.

### synapse-gitops

원천 문서: `TASK_gitops.md`, `WORKFLOW_gitops_W1.md` ~ `WORKFLOW_gitops_W5.md`, GitOps Phase D report.

| ID | Open step | Open count | 남은 내용 |
|---|---|---:|---|
| GITOPS-01 | W5 Cost 최적화 + 안정화 | 6 | Cost Explorer tag policy, 비용 분포, HPA/PDB live 재검증, Image Updater writeback, metrics gap, 24h signoff, destroy decision |

완료 조건: GitOps 잔여 check가 live AWS/EKS/ArgoCD 증거 파일 또는 실행 로그와 연결되고 dashboard sync가 validation 0 warning으로 통과.

### workflow-dashboard

원천 문서: `workflow-dashboard` scripts, `workflow-dashboard/data/*.json`, Phase F reports.

| ID | Open area | 상태 | 남은 내용 |
|---|---|---|---|
| DASH-01 | Parser/sync hygiene | Ongoing | 신규 PM 문서 변경마다 repo별 dry-run, validate, diff 확인 |
| DASH-02 | Data sync | Evidence needed | 완료 증거 있는 repo만 live sync. JSON 수동 편집 금지 |
| DASH-03 | Drift prevention | Ongoing | frontend/shared/gitops drift 원인 재발 방지, source doc 삭제/rename 감시 |

완료 조건: `node scripts/validate-data.mjs` 0 warning, sync diff가 intended `done/total/history/changelog/updatedAt` 변경만 포함.

### documents

원천 문서: 이 문서, `FINAL_REFACTOR_COMPLETION_PLAN.md`, phase reports, 중앙 PM 사본.

| ID | Open area | 상태 | 남은 내용 |
|---|---|---|---|
| DOCS-01 | 중앙 관리판 유지 | Active | 각 phase/repo 작업 완료 후 이 문서의 status와 source 링크 갱신 |
| DOCS-02 | 최종 handoff | Evidence needed | P0 0건, P1 해결/수락, staging demo pass, dashboard 100% 또는 owner/date/blocker 완료 |
| DOCS-03 | 문서 사본 동기화 | Ongoing | 원천 repo PM 문서 변경 후 중앙 `documents/docs/project-management` 사본과 충돌 확인 |

## 6. 다음 실행 순서

1. `synapse-frontend` remaining production route audit을 계속해 dashboard/OAuth consent 계약 공백과 group-specific shared content/pagination 증거 공백을 닫는다.
2. API-backed route를 staging seed path와 연결하고 Phase E runbook의 demo path를 끝까지 실행한다.
3. mobile/tablet/desktop screenshot 또는 browser QA note로 frontend UX 증거를 보강한다.
4. Docker Desktop/daemon을 켠 뒤 platform `AuthBillingE2ETest`와 knowledge Docker/ES search E2E를 재실행한다.
5. EKS kubeconfig와 ArgoCD login을 준비한 뒤 HPA/PDB, Synced/Healthy, Image Updater writeback, 24h signoff를 캡처한다.
6. 모든 완료 반영 전 `workflow-dashboard` dry-run과 validation을 통과시킨다.

## 7. 완료 처리 체크 기준

어떤 항목도 아래 4개가 없으면 완료 처리하지 않는다.

| 기준 | 필요 증거 |
|---|---|
| Code/Test | unit/integration/widget/E2E/build/analyze 로그 |
| Runtime | staging/live 로그, eventId, tenantId, topic, pod/app 상태 |
| UX | mobile/tablet/desktop screenshot 또는 QA note |
| PM Sync | TASK/WORKFLOW/HISTORY 갱신, dashboard dry-run/validation 결과 |
