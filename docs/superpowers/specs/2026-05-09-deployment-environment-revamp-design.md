# 14 배포 가이드 + 10 환경 설정 템플릿 v2.0 — 갱신 설계서 (그룹 2)

> **상태**: Spec (브레인스토밍 산출물)
> **작성일**: 2026-05-09
> **대상 문서**:
>  - `documents.wiki/14_배포_가이드.md` (v1.0 → v2.0)
>  - `documents.wiki/10_환경_설정_템플릿.md` (v1.0 → v2.0)
> **상위 결정**: 09_Git_규칙_정의서 v2.0 채택(2026-05-09) / ADR-001 / ADR-002
> **본 사이클 = 그룹 2**: 그룹 1(03+18)은 채택 완료. 그룹 3(17)은 다음 사이클.

---

## 1. 개요

### 1.1 목적

09 v2.0 채택의 후속 갱신 5문서 중 **그룹 2** — `14_배포_가이드`와 `10_환경_설정_템플릿`을 동일 사이클에서 v2.0으로 전면 재작성한다. 두 문서는 "**배포 흐름 ↔ 로컬·환경 설정**"의 자연스러운 짝이며, 같은 4-서비스 통합과 ArgoCD ApplicationSet / Schema Registry 신규 인프라를 동시 반영한다.

### 1.2 작업 범위

- `documents.wiki/14_배포_가이드.md`를 in-place v2.0 갱신
- `documents.wiki/10_환경_설정_템플릿.md`를 in-place v2.0 갱신
- 그룹 1과 동일한 결정 패턴 적용 (Q2=1 v2.0 전면 / Q3=c 절충 cross-reference / 구조=X 절 보존)
- 09 v2.0의 운영 디테일은 09 절번호로 cross-reference (§B2 미러링 / §B3 GitOps / §B4 Schema Registry / §B6 PAT 등)
- 변경 이력에 v2.0 추가 + 채택일 2026-05-09 명기
- 작업 완료 후 wiki repo commit + push

### 1.3 비범위 (out-of-scope)

- `17_스케줄` 갱신 — **그룹 3** 별도 사이클
- 14 v1.0의 직교 절(§3 사전 요구사항 / §4 Blue·Green Canary / §5 Flyway / §8 Secrets 관리 / §9 배포 체크리스트 / §11 Hotfix 본문) — 보존만
- 10 v1.0의 직교 절(§1 환경 매트릭스 / §4 초기화 SQL / §5 IDE 설정 / §7 데모 시드) — 보존만
- 14 §10의 v1.0 sub-section(10.1 Community / 10.2 Gamification / 10.3 Notification 별도 서비스 배포 절차)는 §10 전체를 "신규 모듈 추가 절차 (4-서비스 통합 후)"로 재구성하면서 폐기 (Q2=b 결정). FCM/APNs 인증서 관리(10.4)는 §10 안 sub-section으로 보존.
- 10 v1.0의 모듈별 환경 변수(`GAMIFICATION_STREAK_XP_CAP=100` 등)는 모듈이 어느 서비스 안에 있든 그대로 작동 — 보존.

---

## 2. 결정 사항 (브레인스토밍 결과)

| # | 결정 항목 | 채택 옵션 | 핵심 |
|---|---|---|---|
| Q1 | 그룹 1 결정 패턴 적용 | **A. 그대로 적용** | Q2=1 v2.0 전면 / Q3=c 절충 cross-reference / 구조=X 절 보존 그대로 그룹 2에 적용 |
| Q2 | 14 §10 처리 | **b. 재구성 — "신규 모듈 추가 절차"** | v1.0 10.1 Community / 10.2 Gamification / 10.3 Notification 별도 서비스 배포 절차 → 4-서비스 모듈 추가 절차로 통합. 10.4 FCM/APNs 인증서는 §10 안 sub-section으로 보존 |

---

## 3. 메타데이터 / 상단 주의문 (양 문서 공통 패턴)

```markdown
> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
> **버전**: v2.0
> **작성일**: 2026-05-07
> **수정일**: 2026-05-09
> **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

> ⚠️ **v2.0 전면 개편 안내**
>
> 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §B1 레포 구조 / §B3 GitOps + ApplicationSet / §B4 Schema Registry / Appendix A·B ADR 전문) 참조.
>
> 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
>  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
>  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 채택 완료)
>  - `18_기술_스택_정의서` v2.0 (그룹 1 — 채택 완료)
>  - `14_배포_가이드` v2.0 (그룹 2 — 본 사이클)
>  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 본 사이클)
>  - `17_스케줄` v2.0 (그룹 3 — 다음 사이클)
```

---

## 4. 14 v2.0 — 변경 매트릭스 (12개 절)

각 항목은 **흡수 / 갱신 / 신규 / 제거** 4종 액션으로 분류.

### 4.1 절별 명세

| 절 | 액션 | 작성 명세 |
|---|---|---|
| 메타데이터 | **갱신** | v1.0 → v2.0, 수정일 2026-05-09 추가 |
| 메타데이터 직후 | **신규** | §3 ⚠️ 주의문 블록 그대로 |
| §1 CI/CD 파이프라인 개요 — Mermaid | **갱신** | ArgoCD 단계의 노드 라벨 갱신: `I[Update Helm Values]` → `I[Update Kustomize newTag<br/>via ApplicationSet matrix]`. ApplicationSet matrix generator로 5×3 환경 정의됨을 명시. 풀 YAML은 09 §B3 참조 |
| §2.1 환경별 사양 표 | **흡수 + 미세 갱신** | EKS 노드 사양 표 그대로. v1.0 본문에 도메인 서비스명이 있으면 4-서비스 host로 재매핑 |
| §2.2 Local 환경 (Docker Compose) — 서비스 목록 | **갱신** | 8개 서비스 목록 → 6개 + Schema Registry 1개로 재작성: <br>`# - api-gateway (8080)` <br>`# - synapse-platform-svc (8081 — auth + audit + billing + notification)` <br>`# - synapse-engagement-svc (8082 — community + gamification)` <br>`# - synapse-knowledge-svc (8083 — note + graph + chunking)` <br>`# - synapse-learning-card (8084 — card + srs, Java)` <br>`# - synapse-learning-ai (8090 — ai, Python/FastAPI)` <br>`# - postgresql (5432)` <br>`# - redis (6379)` <br>`# - elasticsearch (9200)` <br>`# - kafka + zookeeper (9092)` <br>`# - schema-registry (8081)` ← 신규. Docker Compose 풀 정의는 10 §3 참조 |
| §3 사전 요구사항 (도구 / 권한) | **흡수 + 도구 1행 추가** | 도구 표에 `yq │ 4.x │ kustomization newTag bump (deploy.yml)` 행 추가. 권한 표 그대로 |
| §4.1 Blue/Green + Canary 흐름 | **흡수** | 변경 없음. 4-서비스 통합과 직교 |
| §4.2 Canary 판정 기준 | **흡수** | 그대로 |
| §4.3 Rollback 절차 | **흡수 + 1단락 추가** | 본문 그대로 + 끝에 1단락: "통합 배포 시점을 식별하는 `synapse-gitops/v{날짜}` 태그로의 롤백은 09 §B5 참조." |
| §5 DB 마이그레이션 (Flyway) | **흡수** | 변경 없음 |
| §6.1 Health 엔드포인트 표 | **갱신** | 도메인 서비스 host(`auth-service` 등)가 있으면 4-서비스 host로 재기재. 5행 표: <br>`synapse-platform-svc /actuator/health /actuator/health/readiness /actuator/health/liveness` <br>`synapse-engagement-svc 동일 패턴` <br>`synapse-knowledge-svc 동일` <br>`synapse-learning-card (Java) 동일` <br>`synapse-learning-ai (FastAPI) /health /health/ready /health/live` <br>v1.0의 표 형식·셀 수에 맞춰 재기재 |
| §6.2 Kubernetes Probe 설정 | **흡수** | YAML 패턴 그대로 |
| §7.1 Smoke Test | **갱신** | 도메인 서비스 endpoint(`note-service`, `card-service`, `auth-service`, `community-service`, `gamification-service`, `notification-service` 등)가 본문에 등장하면 4-서비스 host(`platform-svc`, `engagement-svc`, `knowledge-svc`, `learning-card`, `learning-ai`)로 재매핑. Smoke test 시나리오 자체는 보존 |
| §7.2 Canary 모니터링 대시보드 | **흡수** | Prometheus 쿼리·Grafana 대시보드 본문 그대로 |
| §8 Secrets 관리 (8.1 / 8.2 / 8.3) | **흡수** | AWS Secrets Manager / SOPS / External Secrets / Secret 교체 절차 모두 보존 |
| §9 배포 체크리스트 (Production 전 / 후) | **흡수** | 그대로 |
| **§10 신규 모듈 추가 절차 (4-서비스 통합 후)** | **갱신 (전면 재작성)** | v1.0의 10.1 Community / 10.2 Gamification / 10.3 Notification 별도 서비스 배포 sub-section을 모두 폐기하고 다음 단일 본문으로 교체: <br>`### 10. 신규 모듈 추가 절차 (4-서비스 통합 후)` <br>`v2.0 (4-서비스 통합) 패턴: 신규 도메인이 추가되면 별도 서비스 생성이 아닌 기존 서비스 안 모듈로 추가한다.` <br>`**1. 트랙 owner와 합의** — 어느 서비스(platform / engagement / knowledge / learning-card / learning-ai) 안의 모듈로 들어갈지 결정 (도메인 응집도 + 트랙 부하 기준). 09 §0.3 매핑 참조` <br>`**2. 모듈 선언** — 해당 서비스 레포에 신규 패키지 + \`package-info.java\`로 모듈 선언:` (Java 코드 예시 5~10줄 — `@ApplicationModule(displayName = "...", allowedDependencies = {...})`) <br>`**3. ArchUnit 검증** — \`ApplicationModules.of(Application.class).verify()\` 통과 확인 (CI 자동) — 18 §4.1.8 참조` <br>`**4. Avro 스키마 (선택)** — Kafka 이벤트 발행이 있다면 \`synapse-shared\`에 .avsc PR. Schema Registry BACKWARD 호환성 검증 — 09 §B4 참조` <br>`**5. 통합 테스트** — 모듈 단위 테스트 + 영향 받는 다른 모듈과의 통합 테스트` <br>`**6. 배포** — 기존 서비스 image 재배포 (서비스 자체 분리 없음, 새 모듈 포함된 새 image). deploy.yml의 GitOps 흐름 그대로 — 09 §B3 참조` <br>`**7. ApplicationSet 그대로** — 별도 ArgoCD Application 추가 없음. 5×3 매트릭스가 그대로 새 image를 가져감` <br><br>`### 10.x FCM/APNs 인증서 관리 절차` (v1.0 10.4를 §10 안 sub-section으로 보존, 절번호는 10.1 또는 그대로 10.4) — FCM 서버 키 / APNs P8 키의 발급·갱신 절차 본문 그대로. 단 owner를 platform-svc / notification 모듈 owner(`@platform-owner` + `@team-lead`)로 명시 |
| §11 긴급 배포 (Hotfix) | **흡수 + 1줄 추가** | 본문 그대로 + 끝에 1줄: "Hotfix가 한 모듈만 영향 시 해당 서비스 단위로 진행 (서비스 전체 재배포가 아닌 모듈만 패치된 새 image)." |
| §12 변경 이력 | **갱신** | v2.0 row 추가 (§6 형식) |

### 4.2 14 검증 기준 (spec-side)

- [ ] v1.0 도메인 서비스명(`Auth Service|Note Service|Card Service|Graph Service|AI Service|Billing Service|Audit Service|Community Service|Gamification Service|Notification Service`) 본문 잔재 0 (단 모듈 라벨 `auth 모듈` 등은 허용)
- [ ] 4-서비스명 본문에 일관 등장 — `synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-card / synapse-learning-ai` 모두 등장
- [ ] §1 Mermaid에 ApplicationSet 또는 matrix generator 라벨 등장
- [ ] §2.2 Local 서비스 목록에 4-서비스 + Schema Registry 5+ 행
- [ ] §6.1 Health 엔드포인트 표에 5 서비스 행
- [ ] §10 헤딩 = "신규 모듈 추가 절차 (4-서비스 통합 후)" 또는 유사
- [ ] §10 v1.0 sub-section 헤딩(`^### 10\.1 Community Service|^### 10\.2 Gamification Service|^### 10\.3 Notification Service`) 잔재 0
- [ ] §10 안 FCM/APNs 인증서 관리 sub-section 보존 (절번호는 10.1 / 10.x 무관)
- [ ] §10 신규 7단계 절차 모두 등장 (`1\. 트랙 owner와 합의|2\. 모듈 선언|3\. ArchUnit 검증|4\. Avro 스키마|5\. 통합 테스트|6\. 배포|7\. ApplicationSet 그대로`) ≥6 matches
- [ ] §12 변경 이력 v2.0 row 등장
- [ ] 09 cross-reference (`§B2 / §B3 / §B4 / §B5 / §0.3` 등 ≥3개)

---

## 5. 10 v2.0 — 변경 매트릭스 (8개 절)

### 5.1 절별 명세

| 절 | 액션 | 작성 명세 |
|---|---|---|
| 메타데이터 | **갱신** | v1.0 → v2.0 |
| 메타데이터 직후 | **신규** | §3 ⚠️ 주의문 블록 그대로 |
| §1 환경 매트릭스 (Local/Dev/Staging/Prod) | **흡수** | EKS 노드 사양·도메인·TLS·로그·모니터링 표 그대로. 4-서비스 통합과 직교 |
| §2 환경 변수 템플릿 (.env) | **갱신 (블록 단위 재구성)** | 다음 v1.0 블록 폐기: <br>`# ----- Community Service -----` (`COMMUNITY_SERVICE_PORT=8084`, `COMMUNITY_SERVICE_URL=http://community-service:8084`) <br>`# ----- Gamification Service -----` (`GAMIFICATION_SERVICE_PORT=8085`, `GAMIFICATION_SERVICE_URL=http://gamification-service:8085`) <br>`# ----- Notification Service -----` (`NOTIFICATION_SERVICE_PORT=8086`, `NOTIFICATION_SERVICE_URL=http://notification-service:8086`) <br>v1.0의 `# ----- Internal API -----` 안 `CARD_SERVICE_INTERNAL_URL=http://card-service:8082/internal`도 갱신 대상 <br><br>**신규 블록 추가**: <br>`# ----- synapse-platform-svc (auth + audit + billing + notification 모듈) -----` <br>`PLATFORM_SERVICE_PORT=8081` <br>`PLATFORM_SERVICE_URL=http://synapse-platform-svc:8081` <br>`# ----- synapse-engagement-svc (community + gamification 모듈) -----` <br>`ENGAGEMENT_SERVICE_PORT=8082` <br>`ENGAGEMENT_SERVICE_URL=http://synapse-engagement-svc:8082` <br>`# ----- synapse-knowledge-svc (note + graph + chunking 모듈) -----` <br>`KNOWLEDGE_SERVICE_PORT=8083` <br>`KNOWLEDGE_SERVICE_URL=http://synapse-knowledge-svc:8083` <br>`# ----- synapse-learning-card (card + srs 모듈, Java) -----` <br>`LEARNING_CARD_PORT=8084` <br>`LEARNING_CARD_URL=http://synapse-learning-card:8084` <br>`# ----- synapse-learning-ai (ai 모듈, Python/FastAPI) -----` <br>`LEARNING_AI_PORT=8090` <br>`LEARNING_AI_URL=http://synapse-learning-ai:8090` <br><br>**Internal API 블록 갱신**: <br>`LEARNING_CARD_INTERNAL_URL=http://synapse-learning-card:8084/internal` (v1.0 `CARD_SERVICE_INTERNAL_URL` 대체) <br><br>**Schema Registry 블록 신규**: <br>`# ----- Schema Registry (Confluent) -----` <br>`SCHEMA_REGISTRY_URL=http://schema-registry:8081` <br>`SCHEMA_REGISTRY_USER=` <br>`SCHEMA_REGISTRY_PASS=` <br><br>**보존**: 모듈별 환경 변수(`GAMIFICATION_STREAK_XP_CAP=100`, `GAMIFICATION_LEADERBOARD_CRON`, `GAMIFICATION_STREAK_RESET_CRON`, FCM_*, APNS_*, AWS_SES_*, JWT_*, OAUTH_*, STRIPE_*, ANTHROPIC_*, EMBEDDING_* 등)는 모듈이 어느 서비스 안에 있든 그대로 작동 — 변경 없음 |
| §3 Docker Compose | **전면 갱신** | v1.0의 services 정의에서 도메인 서비스(`note-service`, `card-service`, `auth-service`, `community-service`, `gamification-service`, `notification-service` 등) 폐기하고 4-서비스 + Schema Registry로 재작성: <br>`services:` <br>`  postgres: pgvector/pgvector:pg16` ← 보존 <br>`  redis: redis:7-alpine` ← 보존 <br>`  elasticsearch: ...` ← 보존 <br>`  kafka + zookeeper: ...` ← 보존 <br>`  schema-registry: confluentinc/cp-schema-registry:7.x` ← **신규** (depends_on: kafka, zookeeper / port 8081 또는 외부 포트 매핑) <br>`  api-gateway: ...` ← 보존 <br>`  synapse-platform-svc: build: ./platform-svc / ports: 8081 / depends_on: postgres redis kafka schema-registry` <br>`  synapse-engagement-svc: build: ./engagement-svc / ports: 8082 / depends_on: postgres redis kafka schema-registry` <br>`  synapse-knowledge-svc: build: ./knowledge-svc / ports: 8083 / depends_on: postgres elasticsearch kafka schema-registry` <br>`  synapse-learning-card: build: ./learning-svc/learning-card / ports: 8084 / depends_on: postgres redis kafka schema-registry` <br>`  synapse-learning-ai: build: ./learning-svc/learning-ai / ports: 8090 / depends_on: postgres redis elasticsearch kafka` <br>각 서비스의 `environment` 항목은 §2 .env 변수를 참조 (`POSTGRES_*`, `REDIS_*`, `KAFKA_*`, `SCHEMA_REGISTRY_URL`, `JWT_SECRET`, `OAUTH_*` 등). volumes / networks / depends_on은 4-서비스 기준으로 재정렬 |
| §4 초기화 SQL (PostgreSQL) | **흡수** | 변경 없음 — DB 스키마는 4-서비스 통합과 직교 |
| §5.1 .editorconfig | **흡수** | 변경 없음 |
| §5.2 권장 VS Code 확장 | **흡수** | 변경 없음 |
| §5.3 권장 IntelliJ 설정 | **흡수** | 변경 없음 |
| §6 환경별 시작 명령어 | **흡수 + 미세 갱신** | 명령어가 도메인 서비스 컨테이너 이름 참조하면 4-서비스로 재매핑. 큰 패턴(docker compose / kubectl 등)은 그대로 |
| §7 데모 데이터 시드 | **흡수** | 그대로 |
| §8 변경 이력 | **갱신** | v2.0 row 추가 |

### 5.2 10 검증 기준 (spec-side)

- [ ] §2 .env에 4-서비스 PORT 블록 등장 (`PLATFORM_SERVICE_PORT|ENGAGEMENT_SERVICE_PORT|KNOWLEDGE_SERVICE_PORT|LEARNING_CARD_PORT|LEARNING_AI_PORT`) 5종 모두
- [ ] §2 v1.0 도메인 서비스 PORT(`COMMUNITY_SERVICE_PORT|GAMIFICATION_SERVICE_PORT|NOTIFICATION_SERVICE_PORT`) 잔재 0
- [ ] §2 `SCHEMA_REGISTRY_URL` 등장
- [ ] §3 Docker Compose에 `synapse-platform-svc|synapse-engagement-svc|synapse-knowledge-svc|synapse-learning-card|synapse-learning-ai` 5 services 정의
- [ ] §3 v1.0 도메인 서비스(`note-service|card-service|auth-service|community-service|gamification-service|notification-service`) 정의 잔재 0
- [ ] §3 `schema-registry:` service 추가
- [ ] §8 변경 이력 v2.0 row 등장
- [ ] 09 cross-reference (§B4 등 ≥1)

---

## 6. 변경 이력 row (양 문서 공통 형식)

```markdown
| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. {문서별 핵심 변경 — 14는 "§1 ApplicationSet 추가 / §2.2 Local 서비스 목록 4-서비스 재작성 / §6.1 Health 엔드포인트 표 5행 / §7.1 Smoke Test host 재매핑 / §10 신규 모듈 추가 절차로 전면 재구성 (10.4 FCM/APNs는 보존) / §11 모듈 단위 hotfix 안내" / 10이라면 "§2 .env 4-서비스 PORT 블록 + Schema Registry 추가 / §3 Docker Compose 4-서비스 + Schema Registry 전면 재작성"}. 직교 절 보존. |
```

---

## 7. 결과물 / 산출 위치

| 산출 | 경로 | git |
|---|---|---|
| 본 spec | `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-deployment-environment-revamp-design.md` | syn 레포 |
| 본 plan (writing-plans 단계) | `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-deployment-environment-revamp.md` | syn 레포 |
| 14 v2.0 본문 | `D:\workspace\final-project-syn\documents.wiki\14_배포_가이드.md` | wiki repo (in-place + commit + push) |
| 10 v2.0 본문 | `D:\workspace\final-project-syn\documents.wiki\10_환경_설정_템플릿.md` | wiki repo (in-place + commit + push) |

---

## 8. 검증 / 완료 기준 (5영역)

### 8.1 구조 / 일관성
- [ ] 14·10 본문에 v1.0 도메인 서비스명(`*-service`, `Service` 헤딩) 잔재 0 (단 모듈 라벨 허용)
- [ ] 4-서비스명 양 문서에 일관 등장
- [ ] 14 분량 약 470~560줄 범위 (v1.0 498줄 ±10%)
- [ ] 10 분량 약 530~620줄 범위 (v1.0 528줄 + Docker Compose 추가)

### 8.2 매핑 / 참조 무결성
- [ ] 14·10 모두 09 cross-reference 등장 (`§B2 / §B3 / §B4 / §B5 / §0.3` 중 각 문서 ≥3개 / ≥1개)
- [ ] 변경 이력 v2.0 row 양 문서 등장

### 8.3 정합성 안내
- [ ] 양 문서 상단 ⚠️ 주의문에 채택일 2026-05-09 + 09 v2.0 + 5문서 후속 갱신 안내(09/03/18 채택 완료, 14/10 본 사이클, 17 다음 사이클) 등장

### 8.4 콘텐츠 보존 완전성
- [ ] 14 v1.0의 직교 절(§3·§4·§5·§8·§9·§11 핵심 본문) 보존
- [ ] 10 v1.0의 직교 절(§1·§4·§5·§7) 보존
- [ ] 14 §10 안 FCM/APNs 인증서 관리 절차 보존

### 8.5 분량
- [ ] 14: 470~560줄 (±10%)
- [ ] 10: 530~620줄

---

## 9. 후속 작업 (out-of-scope)

| 그룹 | 문서 | 다음 사이클 |
|---|---|---|
| 3 | `17_스케줄` | 그룹 2 채택 직후 별도 spec → plan → 구현 |

---

## 10. 작업 흐름 요약

1. 본 spec syn 레포 commit
2. writing-plans 호출 → 단계별 task plan 작성 (예상 task: 14 갱신 6~9개 + 10 갱신 4~6개 + 검증 + commit/push, 총 14~18 task)
3. plan 기반 task 단위 fresh subagent 실행 (subagent-driven-development)
4. 매 task 검증 통과 후 다음 task
5. 모든 task 완료 후 documents.wiki에서 14 / 10 commit + push (1회)
6. syn 레포에 plan 진척 commit + push

---

*end of design spec*
