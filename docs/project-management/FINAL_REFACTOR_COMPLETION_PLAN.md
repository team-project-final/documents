# Synapse 최종 리팩토링 및 완료 계획

> 작성일: 2026-06-21 KST
> 대상: Synapse 최상위 서비스 레포, 중앙 프로젝트 관리 문서, workflow-dashboard 데이터, 디자인 문서
> 기준: 하위 레포 전체 pull 완료 후 확인. `workflow-dashboard/data/synapse-*.json` 기준 최신 frontend sync는 2026-06-22 P2 PM sync hygiene 실행 결과다.

## 1. 현재 판단

프로젝트는 모든 레포가 같은 수준으로 남아 있는 상태가 아니다. 백엔드 서비스들은 대부분 구현이 끝났고, 남은 일은 E2E 검증, 배포 검증, 문서 마감에 가깝다. 반면 `synapse-frontend`는 화면과 위젯 테스트는 많이 들어와 있지만, mock-first 화면과 feature별 API 연동 공백이 여전히 가장 크다. 초기 감사에서 README가 "디자인 프로토타입, mock 데이터, 개발용 인증 바이패스" 상태라고 명시하던 문제는 2026-06-21 문서 정정으로 해소했다.

즉 최종 완료의 핵심 병목은 프론트엔드다. 백엔드는 새 기능 개발보다 증거 기반 검증과 운영 마감이 중요하고, 프론트엔드는 mock 기반 화면을 실제 API/상태/검증 경로로 바꾸는 것이 중요하다.

| 레포 | 완료 / 전체 | 남은 항목 | 핵심 갭 |
|---|---:|---:|---|
| `synapse-frontend` | 260 / 483 | 223 | remaining group/dashboard/OAuth 계약 공백, staging demo, 반응형/에러/디자인 토큰 검증 |
| `synapse-platform-svc` | 366 / 377 | 11 | 인증/결제 live E2E, 알림 SLA/회귀 검증 |
| `synapse-knowledge-svc` | 611 / 621 | 10 | ES 동기화 안정화, 노트/그래프 E2E 마감, 문서 최신화 |
| `synapse-shared` | 281 / 291 | 10 | cross-service E2E 시드 데이터, SLA, staging/docs handoff |
| `synapse-gitops` | 205 / 211 | 6 | 비용 태그, image updater/writeback, 최종 handoff |
| `synapse-engagement-svc` | 415 / 419 | 4 | Kafka ACL/live path, ECR/GitOps 배포 검증 |
| `synapse-learning-svc` | 693 / 695 | 2 | `note.created -> AI cards`, `card.review.due -> notification` E2E 증거 |

확인된 주요 신호:

- `synapse-frontend`는 Dart 파일 173개, 테스트 파일 31개가 있지만 `TODO`/mock 신호가 여전히 많이 남아 있다.
- `synapse-frontend/lib/core/theme`는 현재 보라/핑크 "AI Tutor" 팔레트, 20px radius, orb 중심 표현, 음수 letter spacing을 사용한다.
- 제품 앱의 디자인 정본은 `documents/DESIGN.md`다. 방향은 Warm Amber, warm stone neutral, Fraunces display, Plus Jakarta Sans body, 8px spacing, 절제된 gamification이다.
- `synapse-gitops/DESIGN.md`는 local-k8s/developer guide용 별도 다크 개발자 도구 디자인 시스템이다. 제품 앱에 섞으면 안 된다.
- `synapse-platform-svc` README/API 계약은 성숙하다.
- `synapse-knowledge-svc`, `synapse-engagement-svc` README는 아직 bootstrap 수준이라 최종 인수 문서 보강이 필요하다.

## 2. 범위에서 제외할 것

- 백엔드 서비스 재작성 또는 서비스 분리.
- W1-W5 문서에 없는 신규 제품 기능 추가.
- Flutter, Riverpod, GoRouter, Spring Modulith, Kafka, Avro, ArgoCD, Terraform 교체.
- 브랜드 재디자인. 이번 작업은 기존 `documents/DESIGN.md`의 Synapse 제품 디자인 정본에 구현을 맞추는 작업이다.
- 코드 안에서 production secret 변경. secret은 기존 GitOps/External Secrets 경로를 유지한다.

## 3. 완료 전략

이번 마감은 "새 기능 스프린트"가 아니라 "릴리즈 하드닝"으로 다룬다.

1. 기준 문서를 고정한다.
   - 진행률 기준: `workflow-dashboard/data/synapse-*.json`
   - 제품 UI 디자인 기준: `documents/DESIGN.md`
   - 개발자 문서 디자인 기준: `synapse-gitops/DESIGN.md`

2. 프론트엔드를 먼저 살린다.
   - mock-first 화면을 API-backed feature slice로 전환한다.
   - demo fixture는 demo mode 또는 test fixture layer 뒤로 격리한다.
   - 최종 수락 전 개발용 로그인 바이패스를 제거한다.

3. 백엔드 잔여 작업은 병렬로 닫는다.
   - 백엔드는 새 구현보다 검증 증거가 중요하다.
   - 로컬 단위 테스트 추가보다 cross-service E2E와 배포 검증을 우선한다.

4. 마지막은 하나의 통합 staging 데모 경로로 검증한다.
   - 회원가입/로그인
   - 노트 생성
   - 검색/그래프 확인
   - AI 카드 생성
   - 카드 복습
   - gamification 업데이트
   - notification/admin/audit 가시성 확인

## 4. 목표 아키텍처

```text
Flutter frontend
  |-- platform API: auth, users, billing, notifications, admin
  |-- knowledge API: notes, tags, graph, search
  |-- learning-card API: decks, cards, review, stats
  |-- learning-ai API: AI card generation, Q&A
  `-- engagement API: community, shared content, gamification

Kafka / Avro
  knowledge.note.note-created-v1
      -> learning-ai
      -> learning-card card creation
      -> platform.notification.notification-send-v1

  learning.card.review-completed-v1
      -> engagement gamification
      -> platform audit

GitOps
  ECR image tags -> ArgoCD Image Updater -> dev/staging/prod overlays -> EKS
```

## 5. 작업 계획

### Phase A. 프론트엔드 디자인 시스템 정렬

담당 lane: frontend/design

작업:

- 현재 보라/핑크 `AppColors`를 `documents/DESIGN.md`의 Warm Amber + warm stone 팔레트로 교체한다.
- radius token을 문서 기준인 4, 8, 12, 16 계열로 되돌린다.
- compact UI의 음수 letter spacing을 제거한다.
- 장식적인 orb 중심 표면을 절제된 학습 제품 UI 컴포넌트로 바꾼다.
- 폰트 구현 방식을 결정한다.
  - 우선안: `google_fonts`로 Fraunces(display), Plus Jakarta Sans(body)를 적용한다.
  - 대안: Pretendard 번들을 유지하려면 `documents/DESIGN.md`에 그 결정을 명시적으로 반영한다.
- 공통 상태 컴포넌트를 표준화한다.
  - `AppLoadingWidget`
  - `AppErrorWidget`
  - empty state widget
  - responsive page frame
  - form field / validation style
  - toast / dialog pattern

수락 기준:

- 제품 색상은 theme/token 파일 외 화면에서 직접 hardcoding하지 않는다.
- 주요 페이지가 mobile/tablet/desktop 폭에서 일관되게 렌더링된다.
- gamification UI가 별도 게임 제품처럼 보이지 않고 Synapse의 Warm Intellectual 톤 안에 들어온다.

### Phase B. 프론트엔드 API 연동 및 상태 리팩토링

담당 lane: frontend/API

작업:

- 기존 경계 구조인 `lib/services/<platform|knowledge|learning|engagement>`를 유지한다.
- 각 feature에 `domain`, `data`, `providers`, 화면 상태 wiring을 완성한다.
- API-backed 경로는 아래 순서로 우선 처리한다.
  1. Auth/login/signup/OAuth callback, 로그인 버튼 바이패스 제거
  2. Platform billing, notification inbox/settings, admin summary/report
  3. Knowledge note CRUD, tag management, graph, search
  4. Learning decks/cards/review/AI card generation
  5. Engagement community/shared decks/shared notes/gamification
- 화면 내부 `_mock*` 상수는 repository 또는 명시적인 test/demo fixture로 이동한다.
- Riverpod async state를 기준으로 loading/error/empty 상태를 통일한다.
- 각 통합 repository에 focused test를 추가하고, 핵심 화면마다 widget smoke test 1개 이상을 둔다.

수락 기준:

- `flutter analyze` 통과.
- `flutter test` 통과.
- `flutter build web --release` 통과.
- production route가 mock 데이터나 인증 바이패스에 의존하지 않는다.

### Phase C. 백엔드 검증 잔여 작업 마감

담당 lane: backend services

레포별 작업:

- `synapse-platform-svc`
  - `AuthBillingE2ETest` 실행 및 실패 수정.
  - Stripe test data, notification retry/latency metrics, notification inbox path 검증.
  - OpenAPI, admin role, manual grant 문서 최신화.

- `synapse-knowledge-svc`
  - ES sync 안정화 검증 완료.
  - note/graph E2E 증거 확보.
  - README/API/runbook 보강. 현재 README는 최종 handoff 용도로 부족하다.

- `synapse-learning-svc`
  - `note.created -> learning-ai -> learning-card` 흐름을 end-to-end로 증명.
  - `card.review.due -> platform.notification` 이벤트 경로 증명.
  - AI provider 실패가 card service에 전파되어 전체 장애가 되지 않도록 격리 상태 확인.

- `synapse-engagement-svc`
  - gamification event의 Kafka ACL/live producer path 검증.
  - semver ECR image와 GitOps tag update path 검증.
  - README/API/runbook 보강. 현재 README는 bootstrap 수준이다.

- `synapse-shared`
  - Avro schema compatibility와 generated code 검증.
  - E2E seed data와 event correlation ID 고정.
  - cross-service event contract와 topic name 기록.

수락 기준:

- Java 서비스는 Windows 기준 `.\gradlew.bat clean build`, Unix 기준 `./gradlew clean build` 통과.
- `learning-ai`는 `pytest` 통과.
- Schema Registry 사용 가능 환경에서는 schema compatibility check 통과.

### Phase D. GitOps 및 릴리즈 하드닝

담당 lane: infra/release

작업:

- frontend, platform, engagement, knowledge, learning-card, learning-ai image tag 계약 검증.
- ArgoCD Image Updater writeback과 semver tag 동작 검증.
- 비용 태그와 untagged resource 정리.
- W5 runbook 기준 HPA/PDB 기대 상태 검증.
- 사용 가능한 환경 기준 dev/staging/prod 앱이 Synced + Healthy인지 확인.
- 제품 앱 디자인 작업과 local-k8s/developer guide 디자인 작업을 분리 유지.

수락 기준:

- 모든 overlay의 `kustomize build` 성공.
- 도구가 설치된 환경에서는 `yamllint`, `kubeconform` 통과.
- 최종 runbook/handoff checklist 완료.

### Phase E. 통합 QA 및 문서 마감

담당 lane: QA/docs

진행 기록:

- 2026-06-21: Phase E 기준 `workflow-dashboard/data/synapse-*.json`를 재집계하고, 통합 demo seed contract, staging demo path, evidence map, owner/date/blocker 잔여 레지스터를 [Phase E 통합 QA 및 문서 마감 실행 리포트](./reports/phase-e-qa-docs-closeout-2026-06-21.md)에 고정했다. 중앙 PM README와 각 서비스 local PM README도 이 리포트를 기준점으로 동기화했다. 증거 없는 PRD/TASK/WORKFLOW 완료 처리는 하지 않았다.

작업:

- demo user, tenant, notes, decks, review cards, gamification state, notifications를 하나의 시나리오로 정의한다.
- staging demo path를 반복 실행한다.
- 코드/테스트 증거가 있는 항목만 PRD/TASK/WORKFLOW/HISTORY에 완료 반영한다.
- 중앙 `documents/docs/project-management`와 각 서비스의 local PM 문서를 동기화한다.
- 부족한 README와 최종 handoff 문서를 보강한다.

수락 기준:

- workflow dashboard가 100%이거나, 미완료 항목마다 owner/date/blocker가 명시되어 있다.
- P0 bug 0건.
- P1 bug는 모두 수정되었거나 최종 handoff에서 명시적으로 수락되어 있다.
- demo path가 수동 DB 수정 없이 성공한다.

### Phase F. PM dashboard / 문서 동기화

담당 lane: PM/dashboard/docs

진행 기록:

- 2026-06-21: A~E 완료 여부를 재검토하고 [Phase F PM Dashboard / 문서 동기화 실행 리포트](./reports/phase-f-pm-dashboard-doc-sync-2026-06-21.md)를 작성했다.
- `workflow-dashboard` `validate-data`는 0 warning으로 통과했다.
- repo별 `DOCS_DIR` dry-run 결과 frontend/shared/gitops에서 현재 JSON과 PM 문서 count drift가 확인되어 live sync는 보류했다.
- 2026-06-21: [Phase F Dashboard / PM 문서 Count Drift 원인 감사](./reports/phase-f-dashboard-drift-audit-2026-06-21.md)를 작성해 frontend/shared/gitops drift 원인을 레포별로 분리했다.
- dashboard JSON 수동 수정, PRD/TASK/WORKFLOW checkbox 강제 완료 처리는 하지 않았다.

작업:

- `workflow-dashboard/data/*.json` 현재 상태와 PM 문서 parser dry-run 결과를 비교한다.
- count drift가 있는 레포는 live sync 전에 원인을 기록한다.
- 중앙 PM README, team-lead history, 서비스별 local PM README에 기준 리포트를 연결한다.
- live sync는 dry-run, data validation, diff 확인 순서가 모두 통과할 때만 실행한다.

수락 기준:

- `workflow-dashboard` 데이터 계약 검증이 통과한다.
- live sync 후보 레포는 dry-run과 current JSON의 차이를 설명할 수 있다.
- dashboard 완료율은 문서/테스트/운영 증거 없이 올라가지 않는다.
- F 리포트가 다음 sync gate의 단일 기준점이 된다.

## 6. 병렬 작업 lane

아래 lane은 병렬 진행하되, 마지막에는 반드시 하나의 demo path로 합쳐 검증한다.

| Lane | 초점 | 대상 레포 |
|---|---|---|
| A | 제품 디자인 시스템 정렬 및 responsive shell | `synapse-frontend`, `documents` |
| B | 프론트 API 연동 및 mock 제거 | `synapse-frontend`, 각 서비스 API 계약 |
| C | 백엔드 E2E 잔여 작업 및 서비스 문서 | `synapse-platform-svc`, `synapse-knowledge-svc`, `synapse-learning-svc`, `synapse-engagement-svc` |
| D | shared contract, seed data, event correlation | `synapse-shared`, 서비스 레포 |
| E | GitOps image/deploy/staging health | `synapse-gitops`, 서비스 Dockerfile/workflow |
| F | PM dashboard/doc sync | `workflow-dashboard`, `documents`, 서비스별 PM 문서 |

## 7. 권장 실행 순서

### Day 1

- 디자인 정본을 고정한다.
- 프론트 theme drift를 수정한다.
- 프론트의 모든 mock/TODO를 하나의 tracker로 만든다.
- `flutter analyze/test`, Java/Python build baseline을 실행한다.

### Day 2-3

- auth, platform notifications/billing/admin, knowledge note/search를 우선 연동한다.
- platform/knowledge 백엔드 잔여 항목을 닫는다.
- shared Avro schema와 seed data를 검증한다.

### Day 4

- learning 및 engagement 프론트 경로를 연동한다.
- note -> AI cards -> review -> gamification -> notification 흐름을 검증한다.
- ECR tag와 ArgoCD image update path를 확인한다.

### Day 5

- staging 전체 demo rehearsal을 진행한다.
- desktop/tablet/mobile 기준 responsive/design QA를 한다.
- PM 문서와 최종 handoff를 업데이트한다.

## 8. Phase별 남은 작업

이 섹션은 [Phase F PM Dashboard / 문서 동기화 실행 리포트](./reports/phase-f-pm-dashboard-doc-sync-2026-06-21.md) 기준으로, 아직 완료 처리하면 안 되는 작업을 phase별로 분리한 추적 목록이다.

### Phase A. 프론트엔드 디자인 시스템 정렬

현재 상태: 부분 완료. `AppColors`는 Warm Amber/Stone 계열로 정렬됐고, `AppRadius`도 4/8/12/16 계열로 정렬됐다. `AppLoadingWidget`, `AppErrorWidget`, `AppEmptyState`, `ResponsivePageFrame`도 존재한다. 음수 `letterSpacing`은 0건이다.

남은 작업:

- `SynapseOrb`/orb 기반 장식 흔적 43건을 검토한다.
- 제품 UI에서 장식 orb가 필요 없는 위치는 제거하고, 필요한 경우 기능적 아이콘/상태 표현으로 바꾼다.
- `documents/DESIGN.md` 기준으로 auth, dashboard, notes, cards, community, search, notification, admin 화면을 desktop/tablet/mobile에서 확인한다.
- `Color(...)`, `Colors.*` 사용처를 훑어 theme/token 파일 외 product color hardcoding인지 구분한다.
- Fraunces + Plus Jakarta Sans 적용 여부를 결정한다. Pretendard 유지 시 `documents/DESIGN.md`에 결정 사유를 반영한다.
- W4/W5의 responsive, error/loading, DESIGN token 관련 dashboard check에 대응하는 QA 증거를 남긴다.

완료 조건:

- mobile/tablet/desktop QA 기록이 있다.
- 주요 화면의 색상, radius, spacing, gamification 표현이 `documents/DESIGN.md`와 충돌하지 않는다.
- 디자인 관련 dashboard check를 완료 처리할 수 있는 화면 증거가 있다.

### Phase B. 프론트엔드 API 연동 및 상태 리팩토링

현재 상태: 미완료. `synapse-frontend` README의 mock/auth-bypass 설명은 2026-06-21에 실제 구현 상태에 맞게 정정했다. `core/network/dio_client.dart`의 `X-User-Id` demo header는 `APP_ENV=demo`에만 붙고, login/signup/OAuth callback은 platform API-backed repository와 token store를 경유한다. 2026-06-22 P2 sync 기준 dashboard는 `synapse-frontend` 260/483, 223 checks remaining이다. knowledge note/search/graph, learning review, engagement shared content/gamification/admin report의 API-backed slice는 반영됐지만, group/dashboard/OAuth 계약 공백과 staging/UX 증거는 아직 남아 있다.

완료/검증된 항목:

- `core/network/dio_client.dart`의 mock user header 경로는 production route가 아니라 `AppEnvironment.demo` 뒤로 격리되어 있다.
- 로그인 버튼만으로 진입하는 개발용 인증 바이패스는 현재 router/auth flow에 남아 있지 않다.
- Auth login/signup/OAuth callback은 platform API 기준으로 연결되어 있고 관련 repository/widget 테스트가 존재한다.
- Password reset request/verify/confirm 화면은 platform API 3단계 계약에 연결됐고, API/widget focused test와 `flutter analyze`를 통과했다.
- MFA setup/verify와 backup code 발급/검증은 platform API 계약에 연결됐고, settings/auth 화면 focused test와 `flutter analyze`를 통과했다.
- Platform billing은 subscription/checkout/usage/payment history/receipt API 계약에 연결됐고, billing focused test와 `flutter analyze`를 통과했다.
- Platform notification inbox/preferences/device registration은 API/provider 기반으로 구현되어 있고, notification focused test를 통과했다.
- Platform admin dashboard summary는 `/api/v1/admin/analytics/summary` 계약에 연결됐고, admin focused test와 `flutter analyze`를 통과했다.
- Knowledge note CRUD, tag/version, search, graph 화면은 `KnowledgeApi`와 Riverpod provider 기반으로 전환됐고 focused API/widget tests, full `flutter test`, release build를 통과했다.
- Learning-card review deck/session/queue/rating/complete 화면은 `LearningReviewApi` 기반으로 전환됐고 focused review tests를 통과했다.
- Engagement shared decks/shared notes search/detail/fork/report와 gamification profile/badges/leaderboard/xp history는 engagement API 기반으로 전환됐다.
- Engagement admin report list/moderate route는 moderation API 기반으로 전환됐고 focused admin/engagement tests를 통과했다.

남은 작업:

- Auth 주변 기능인 OAuth consent allow/deny는 platform-svc 계약 확인 후 연결한다. 현재 platform-svc에서 `/oauth/consent/allow|deny` 엔드포인트는 확인되지 않았다.
- Dashboard study-board/calendar/planner summary와 group list/detail은 backend 계약 확인 후 연결한다.
- Learning decks/cards 일부와 AI card generation 화면을 learning-card/learning-ai API와 끝까지 연결한다.
- Engagement group list/detail과 level-up live animation/event evidence를 닫는다.
- Riverpod `AsyncValue` 기반 loading/error/empty 처리를 남은 production route에 적용한다.
- staging seed path와 browser/screenshot QA로 live/UX 증거를 남긴다.

완료 조건:

- `flutter analyze` 통과 로그가 있다.
- `flutter test` 통과 로그가 있다.
- `flutter build web --release` 통과 로그가 있다.
- production route에서 mock 데이터와 인증 바이패스 없이 demo path가 동작한다.
- frontend dashboard 잔여 check가 API-backed 증거에 맞춰 감소한다.

### Phase C. 백엔드 검증 잔여 작업

현재 상태: 로컬 검증 증거 보강 완료, live/staging/ECR/GitOps 게이트 잔여. 2026-06-21 Phase C 실행에서 Java 서비스 `clean build`, `learning-ai` `pytest`, knowledge 검색 E2E, shared Schema Registry BACKWARD 전수 검증을 재확인했다. 상세 로그와 잔여 게이트는 [Phase C Backend Verification Report](./reports/phase-c-backend-verification-2026-06-21.md)에 고정한다.

남은 작업:

| Repo | 남은 작업 | 완료 조건 |
|---|---|---|
| `synapse-platform-svc` | Auth/Billing E2E, Stripe test data, notification inbox path, notification metrics/admin-role follow-up | `AuthBillingE2ETest` 및 관련 notification 안정화 증거 |
| `synapse-knowledge-svc` | ES sync 안정화, note/graph E2E, search result>0, README/API/runbook 최신화 | ES sync와 note/graph/search staging 또는 동등한 실행 로그 |
| `synapse-learning-svc` | `note.created -> learning-ai -> learning-card`, `card.review.due -> platform.notification` live evidence | AI card chain과 review-due notification 경로 로그 |
| `synapse-engagement-svc` | gamification Kafka/live producer, ECR/GitOps image proof | level-up/badge-earned event와 배포 tag 증거 |
| `synapse-shared` | cross-service E2E seed data, SLA/staging closeout, event correlation ID 기록 | E2E/SLA/staging signoff 문서와 schema 검증 |

완료 조건:

- Java 서비스별 `.\gradlew.bat clean build` 또는 동등한 CI 로그가 있다.
- `learning-ai` `pytest` 또는 동등한 CI 로그가 있다.
- cross-service event path가 topic, eventId, tenantId 기준으로 추적된다.
- dashboard의 backend 잔여 check가 증거 기반으로만 감소한다.

2026-06-21 로컬 실행 증거:

- `synapse-platform-svc`: `AuthBillingE2ETest` 및 `clean build` PASS.
- `synapse-knowledge-svc`: `clean build` 및 Docker compose 기반 `searchE2eTest` PASS.
- `synapse-learning-svc`: `learning-card clean build` PASS, `learning-ai pytest` 32 passed.
- `synapse-engagement-svc`: `clean build` PASS, gamification Kafka/notification contract 테스트 포함.
- `synapse-shared`: `clean build` PASS, Schema Registry BACKWARD 9/9 PASS.

아직 완료 처리하지 않는 외부 게이트:

- Stripe 실 test data, notification inbox live path, admin-role 운영 경로.
- staging Kafka/MSK ACL, DLQ 0, search result>0 운영 로그.
- 배포 환경의 `note.created -> learning-ai -> learning-card -> platform.notification` end-to-end 로그.
- engagement semver ECR image, GitOps tag update, EKS/MSK live producer 로그.
- cross-service seed, SLA/staging signoff, event correlation dashboard 반영.

### Phase D. GitOps 및 릴리즈 하드닝

현재 상태: 부분 완료. `synapse-gitops` PR #211로 GitOps 코드/문서 하드닝은 머지됐고, `workflow-dashboard` track alias와 partial checkbox parser를 보강한 뒤 `synapse-gitops` live sync를 205/211로 반영했다. AWS/EKS/ArgoCD live 증거는 아직 필요하다.

진행 기록:

- 2026-06-21: [Phase D GitOps 및 릴리즈 하드닝 실행 리포트](./reports/phase-d-gitops-release-hardening-2026-06-21.md)를 작성했다.
- 2026-06-21: `synapse-gitops` PR #211을 머지해 dev semver image tag 계약, prod PDB `minAvailable: 2`, standalone ECR 비용 태그, Phase D 검증 스크립트/runbook을 반영했다.
- 2026-06-21: `.\scripts\verify-phase-d-release-hardening.ps1 -RunKustomize`가 통과했다.
- 2026-06-21: `workflow-dashboard` gitops dry-run은 211 checks / 205 done으로 재확인했지만, live sync 후보는 `synapse-gitops.json: missing track "team-lead"` warning 때문에 보류했다.
- 2026-06-21: `workflow-dashboard`에 `trackAliases`를 추가해 `synapse-gitops`의 `gitops -> team-lead` 정규화를 적용했고, `PDB 정의` 완료 증거를 dashboard JSON에 205/211로 live sync했다.

남은 작업:

- cost optimization + stability step의 남은 check를 실제 live 증거와 매핑한다.
- Cost Explorer tag / untagged resource 확인 결과를 남긴다.
- HPA/PDB 기대 상태를 W5 runbook 기준으로 live 재검증한다.
- ArgoCD Image Updater writeback과 semver tag path가 실제 ECR tag push에서도 유효한지 확인한다.
- metrics gap, 24h signoff, destroy decision을 handoff 문서에 명시한다.
- `yamllint`/`kubeconform` 가능 환경의 검증 결과를 기록한다.
- dashboard에 반영된 PDB check 외 남은 6개 check는 live AWS/EKS/ArgoCD 증거가 붙을 때만 완료 처리한다.

완료 조건:

- GitOps 7개 잔여 check가 각 증거 파일 또는 실행 로그와 연결된다.
- ArgoCD 앱 상태, image tag, stability/cost signoff가 handoff에 남는다.
- dashboard live sync 전 dry-run 증가분 1개가 증거 기반인지 확인된다.

### Phase E. 통합 QA 및 문서 마감

현재 상태: 부분 완료. Phase E 리포트, 중앙 PM README, 서비스별 PM README 동기화는 완료됐다. 2026-06-21에 [Phase E Staging Demo Runbook](./reports/phase-e-staging-demo-runbook-2026-06-21.md)을 추가해 seed contract 분리, preflight, demo path checklist, evidence log template, P0/P1 closeout register를 고정했다. 다만 full staging demo와 frontend QA pass 증거는 아직 남아 있다.

남은 작업:

- signup/login -> note -> graph/search -> AI cards -> review -> gamification -> notification/admin staging run log를 남긴다.
- demo user, tenant, notes, deck, cards, notification seed가 수동 DB 수정 없이 재현되는지 확인한다. 현재 shared local fixture의 string ID와 staging UUID contract가 달라, staging에서는 단일 seed path(API/migration/seed job)를 먼저 확정해야 한다.
- frontend desktop/tablet/mobile QA screenshot 또는 체크 로그를 남긴다.
- `flutter analyze`는 2026-06-21 로컬 시도에서 120초 timeout이므로 pass 증거가 아니다. 더 긴 timeout 또는 개발자 shell에서 재실행 로그가 필요하다.
- P0 0건과 P1 수락/해결 상태를 최종 handoff에 명시한다.
- 증거가 있는 항목만 PRD/TASK/WORKFLOW/HISTORY에 완료 반영한다.
- 서비스 README와 runbook이 실제 배포/실행 상태와 일치하는지 확인한다.

완료 조건:

- full staging demo path가 한 번 이상 끝까지 성공한다.
- 미완료 dashboard item마다 owner/date/blocker가 세분화되어 있다.
- Phase E 리포트의 partial 항목이 pass 또는 accepted risk로 전환된다.

### Phase F. PM dashboard / 문서 동기화

현재 상태: 기준점 기록, dry-run 검증, drift 원인 감사, parser 보강, `synapse-gitops` live sync, `synapse-frontend` W1/W2/W3/W5 workflow 정합화, 2026-06-22 frontend API-backed slice live sync 완료. `validate-data`는 0 warning으로 통과했다. 상세 원인과 후속 조치는 [Phase F Dashboard / PM 문서 Count Drift 원인 감사](./reports/phase-f-dashboard-drift-audit-2026-06-21.md)와 [P2 PM Sync Hygiene 실행 리포트](./reports/p2-pm-sync-hygiene-2026-06-22.md)에 고정한다.

남은 작업:

- `synapse-frontend`: W5 `컨테이너 이미지 파이프라인 (이슈 #52)` step 복구와 W1/W2/W3 raw checkbox 정합화는 완료됐다.
- `synapse-frontend`: 2026-06-22 source/central PM 사본 일치, dry-run 260/483, validation 0 warning, diff review 통과 후 live sync를 실행했다.
- `synapse-shared`: `[~]` partial checkbox parser 지원은 완료됐다. dry-run은 281/291, changelog 0으로 current JSON과 일치한다. live sync는 불필요한 `updatedAt` 변경을 피하기 위해 보류한다.
- `synapse-gitops`: `gitops -> team-lead` track alias와 partial metadata diff 보정은 완료됐다. `PDB 정의` check는 Phase D 증거 기반으로 205/211 live sync까지 반영했다.
- 추가 live sync는 repo별 dry-run, validate-data, diff 확인 순서가 모두 통과할 때만 실행한다.

완료 조건:

- frontend/shared/gitops drift가 모두 설명된다.
- live sync 후보 레포는 dry-run과 current JSON 차이를 사전에 승인할 수 있다.
- `workflow-dashboard/data/*.json`은 수동 수정 없이 parser 또는 CI 경로로만 갱신된다.
- sync 후 `node scripts/validate-data.mjs`가 0 warning으로 통과한다.

## 9. 주요 실패 모드

- mock UI가 production route에 남아 있는데 화면이 있다는 이유로 완료 처리되는 경우.
- 제품 앱 디자인이 `documents/DESIGN.md`에서 벗어나 화면별로 다른 제품처럼 보이는 경우.
- Kafka topic prefix, Avro subject name, Schema Registry availability가 local과 staging에서 다른 경우.
- ECR image tag는 존재하지만 ArgoCD Image Updater가 기대한 overlay 변경을 writeback하지 못하는 경우.
- PM 문서와 dashboard가 서로 달라 false completion이 생기는 경우.
- 백엔드 E2E가 local mock dependency에서는 통과하지만 staging에서 secret, CORS, JWT, port assumption 때문에 실패하는 경우.

## 10. 검증 명령

### Frontend

```powershell
cd synapse-frontend
flutter analyze
flutter test
flutter build web --release
```

### Spring services

```powershell
cd synapse-platform-svc
.\gradlew.bat clean build

cd ..\synapse-knowledge-svc
.\gradlew.bat clean build

cd ..\synapse-engagement-svc
.\gradlew.bat clean build

cd ..\synapse-learning-svc\learning-card
.\gradlew.bat clean build
```

### Learning AI

```powershell
cd synapse-learning-svc\learning-ai
pip install -e ".[dev]"
pytest
```

### Shared contracts

```powershell
cd synapse-shared
.\gradlew.bat clean build

# Schema Registry 실행 환경에서:
.\gradlew.bat testSchemasTask
```

### GitOps

```powershell
cd synapse-gitops

# CONTRIBUTING.md / CI 기준 검증을 우선 사용한다.
# 최소 수동 확인:
kustomize build apps\frontend\overlays\dev
kustomize build apps\platform-svc\overlays\dev
```

## 11. 최종 완료 정의

- dashboard의 모든 행이 완료되었거나, 미완료 항목마다 owner/date/reason이 명시되어 있다.
- production frontend route에서 mock 데이터와 인증 바이패스를 사용하지 않는다.
- 제품 앱이 Warm Intellectual 디자인 시스템과 일치한다.
- 모든 서비스 build/test suite가 통과한다.
- cross-service E2E demo path가 staging에서 성공한다.
- ArgoCD에서 기대 앱들이 Synced + Healthy 상태다.
- README, PM 문서, runbook, handoff 문서가 실제 배포/동작 상태와 일치한다.
