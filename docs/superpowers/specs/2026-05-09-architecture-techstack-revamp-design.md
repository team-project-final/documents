# 03 아키텍처 + 18 기술 스택 v2.0 — 갱신 설계서 (그룹 1)

> **상태**: Spec (브레인스토밍 산출물)
> **작성일**: 2026-05-09
> **대상 문서**:
>  - `documents.wiki/03_프로젝트_아키텍처_정의서.md` (v1.0 → v2.0)
>  - `documents.wiki/18_기술_스택_정의서.md` (v1.0 → v2.0)
> **상위 결정**: 09_Git_규칙_정의서 v2.0 채택(2026-05-09) / ADR-001 / ADR-002
> **본 사이클 = 그룹 1**: 다른 후속 갱신은 그룹 2(14+10), 그룹 3(17)에서 별도 사이클로 처리

---

## 1. 개요

### 1.1 목적

09_Git_규칙_정의서 v2.0이 채택한 ADR-001(10→4 서비스 통합) / ADR-002(AI Service 통합)는 위키 다른 문서에 일시적 모순을 만들었다. 본 spec은 그 후속 갱신을 5개 문서로 분리해 다루는 작업의 **그룹 1** — `03_프로젝트_아키텍처_정의서`와 `18_기술_스택_정의서`를 동일한 사이클에서 v2.0으로 전면 재작성하기 위한 설계서다. 두 문서는 "**아키텍처 그림 ↔ 기술 스택 백과사전**"의 자연스러운 짝이며, 같은 4-서비스 통합과 신규 기술(Spring Modulith / Schema Registry / ArgoCD ApplicationSet) 도입을 동시에 반영한다.

### 1.2 작업 범위

- `documents.wiki/03_프로젝트_아키텍처_정의서.md`를 in-place v2.0 갱신
- `documents.wiki/18_기술_스택_정의서.md`를 in-place v2.0 갱신
- 두 문서 모두 09 v2.0의 결정 사항을 본문에 반영. 단 09의 운영 디테일(레포·CODEOWNERS·PAT·Schema Registry 호환성 모드 등)은 인용하지 않고 09 절번호로 cross-reference (Q3 `c` 결정 — 핵심 1단락 요지 + 상세는 09 참조)
- 절 번호·구조는 보존, 영향 받는 절 본문만 4-서비스로 갱신 (구조 접근 X 결정)
- 변경 이력에 v2.0 추가 + 채택일 2026-05-09 명기
- 작업 완료 후 wiki repo commit + push

### 1.3 비범위 (out-of-scope)

- `14_배포_가이드` 갱신 — **그룹 2** 별도 사이클
- `10_환경_설정_템플릿` 갱신 — **그룹 2** 별도 사이클
- `17_스케줄` 갱신 — **그룹 3** 별도 사이클
- 18 v1.0의 절 번호 순서 이상(11/12 거꾸로 — `12. 버전 호환성`이 `11. 변경 이력` 앞) — 본 v2.0에서 정렬 정정하지 않음. 정렬 자체가 4-서비스 통합과 무관하고 외부 참조 link 위험.
- 03 v1.0이 갖고 있는 직교 콘텐츠(멀티테넌시 3단계 격리 / 보안 아키텍처 / 모니터링) 갱신 — 4-서비스와 무관해 보존만.
- 18 v1.0의 모든 백과사전 항목(Flutter / Dart / Riverpod / PostgreSQL / pgvector / Redis / Elasticsearch / Kafka 본문 / AI/LLM / Stripe / OAuth / SES / Secrets Manager 등) — 보존만, 변경 없음.

---

## 2. 결정 사항 (브레인스토밍 결과)

| # | 결정 항목 | 채택 옵션 | 핵심 |
|---|---|---|---|
| Q1 | Scope 분할 | **B. 그룹화 (3개 사이클)** | 그룹 1 = 03 + 18 / 그룹 2 = 14 + 10 / 그룹 3 = 17 |
| Q2 | 03·18 갱신 깊이 | **1. v2.0 전면 재작성** | 09와 동일 패턴 — 메타 v2.0 + ⚠️ 주의문 + 채택일 명기 |
| Q3 | 09와의 관계 | **c. 절충 — 핵심 1단락 요지 + 상세는 09 참조** | 4-서비스 결정 사실만 자기 문서에 1단락, 운영 디테일은 09 절번호 cross-reference |
| 구조 | 본문 구조 | **X. 절 구조 보존 + 4-서비스 본문 갱신** | 절 번호 그대로 두고 영향 절만 갱신. 직교 콘텐츠 보존 |

---

## 3. 메타데이터 / 상단 주의문 (양 문서 공통 패턴)

03·18 모두 제목 직후 다음 블록을 배치한다 (문서별로 자기 위치만 "(이미 갱신 중)" 표기).

```markdown
> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
> **버전**: v2.0
> **작성일**: 2026-05-07
> **수정일**: 2026-05-09
> **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

> ⚠️ **v2.0 전면 개편 안내**
>
> 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §B1 레포 구조 / §B4 Schema Registry / Appendix A·B ADR 전문) 참조.
>
> 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
>  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
>  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 본 사이클)
>  - `18_기술_스택_정의서` v2.0 (그룹 1 — 본 사이클)
>  - `14_배포_가이드` v2.0 (그룹 2 — 다음 사이클)
>  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 다음 사이클)
>  - `17_스케줄` v2.0 (그룹 3 — 다음 사이클)
```

---

## 4. 03 v2.0 — 변경 매트릭스 (8개 절)

각 항목은 **흡수 / 갱신 / 신규 / 제거** 4종 액션으로 분류.

### 4.1 절별 명세

| 절 | 액션 | 작성 명세 |
|---|---|---|
| 3.1 시스템 아키텍처 개요 — 전체 다이어그램 | **갱신** | Mermaid 다이어그램의 `Core Services` subgraph를 10 노드(AUTH/NOTE/CARD/GRAPH/AI/BILL/AUDIT/COMM/GAME/NOTIF) → **4 노드**로 재작성: `PLATFORM[synapse-platform-svc<br/>auth · audit · billing · notification]` / `ENGAGEMENT[synapse-engagement-svc<br/>community · gamification]` / `KNOWLEDGE[synapse-knowledge-svc<br/>note · graph · chunking]` / `LEARNING_CARD[synapse-learning-svc / learning-card<br/>card · srs (Java)]` + `LEARNING_AI[synapse-learning-svc / learning-ai<br/>ai (Python)]`. Gateway → 4 노드 화살표 / 4 노드 → Data Layer 화살표 재연결. External은 그대로 |
| 3.2.1 Edge Layer (Cloudflare) | **흡수** | 변경 없음 — 4-서비스 통합과 직교 |
| 3.2.2 Client Layer (Flutter 3.x) | **흡수** | 변경 없음 |
| 3.2.3 Gateway Layer (Spring Cloud Gateway 5) | **흡수** | 필터 체인 / Rate Limit 정책 그대로. 라우팅 표가 도메인별로 작성되어 있다면 4개 서비스 라우팅 패턴(`/api/v1/auth/**` → platform-svc 등)으로 재기재 (있을 경우만) |
| 3.2.4 Core Services — 10개 책임 표 | **전면 갱신** | 10개 서비스 책임 표 → **4개 서비스 + 내부 모듈 매트릭스**로 재구성. 각 서비스는 v1.0 본문의 책임 표 셀(상세 책임)을 모듈 단위로 그대로 옮김. 재구성 형식: <br>**#### synapse-platform-svc** (1명 owner — 트랙 A) <br>- auth 모듈: OAuth 2.0 / JWT / MFA / 세션 관리 / 테넌트 생성 (v1.0의 Auth Service 책임 그대로) <br>- audit 모듈: 감사 로그 수집 / 이벤트 중복 방지 / 보존 정책 90일 (v1.0의 Audit Service) <br>- billing 모듈: 플랜 관리 / Stripe 연동 / Webhook / 사용량 제한 (v1.0의 Billing) <br>- notification 모듈: FCM/APNs/SES 발송 / 사용자 설정 / 복습 리마인더 / 기기 토큰 (v1.0의 Notification) <br>**#### synapse-engagement-svc** (1명 owner — 트랙 B) <br>- community 모듈: 스터디 그룹 / 덱·노트 공유 / 신고 (v1.0의 Community) <br>- gamification 모듈: XP / 레벨 / 배지 / 리더보드 / 스트릭 (v1.0의 Gamification) <br>**#### synapse-knowledge-svc** (2명 owner — 트랙 C) <br>- note 모듈: Markdown CRUD / 위키링크 파싱 / 버전 관리 / 첨부파일 (v1.0의 Note) <br>- graph 모듈: 백링크 / PageRank / 클러스터링 / D3.js 데이터 (v1.0의 Graph) <br>- chunking 모듈: 청킹 / 임베딩 비동기 (v1.0 Note 책임 중 청킹/임베딩 부분) <br>**#### synapse-learning-svc** (2명 owner — 트랙 D, Java + Python 멀티 컨테이너) <br>- learning-card 컨테이너 / card·srs 모듈: 카드/덱 CRUD / SM-2 알고리즘 / 복습 큐 / 세션 (v1.0의 Card) <br>- learning-ai 컨테이너 / ai 모듈: 카드 자동 생성 / 시맨틱 검색 / 하이브리드 검색 / Q&A / 시맨틱 캐시 / 사용량 추적 (v1.0의 AI Service) <br>각 서비스 직후에 1줄: "owner / 모듈 경계 / 9 §A4 CODEOWNERS 참조" |
| 3.3 멀티테넌시 모델 — 3단계 격리 (L1 Gateway / L2 Application / L3 RLS) | **흡수** | 본문 그대로 보존. 4-서비스 통합과 직교. `TenantConnectionInterceptor` / `TenantContextFilter` 코드 예시도 그대로 |
| 3.4 이벤트 기반 통합 — Kafka 토픽 18개 다이어그램 | **갱신** | Mermaid Producer subgraph의 노드 라벨을 4-서비스로 재작성: <br>- `NS[Note Service]` → `KNOW_NS[knowledge-svc / note 모듈]` <br>- `CS[Card Service]` → `LEARN_CS[learning-svc / card 모듈]` <br>- `AS[Auth Service]` → `PLAT_AS[platform-svc / auth 모듈]` <br>- `BS[Billing Service]` → `PLAT_BS[platform-svc / billing 모듈]` <br>- `COMM[Community Service]` → `ENG_COMM[engagement-svc / community 모듈]` <br>- `GAME[Gamification Service]` → `ENG_GAME[engagement-svc / gamification 모듈]` <br>- `GS[Graph Service]` → `KNOW_GS[knowledge-svc / graph 모듈]` <br>Consumer subgraph 노드도 동일하게 재라벨. 토픽 인벤토리(18개)는 보존. 매핑 상세는 09 §B (또는 source `SYNAPSE_Service_Consolidation.md` §4) 참조 |
| 3.4 이벤트 스키마 (CloudEvents 호환) | **흡수 + 신규 1단락** | CloudEvents 본문 그대로 + 절 끝에 **신규 1단락**: "스키마는 `synapse-shared` 안 Avro로 정식 관리된다. Schema Registry는 BACKWARD 호환성 모드를 글로벌로 강제하며 Knowledge.events-value는 BACKWARD_TRANSITIVE로 더 엄격하다. 변경 절차·금지 사항 등 상세는 09 §B4 참조." |
| 3.4 신규 토픽 페이로드 스키마 | **갱신** | 페이로드 예시 스키마 그대로 보존, "발행 서비스" 라벨이 있다면 4개 서비스 이름으로 변경 |
| 3.4 내부 API (서비스 간 통신) | **갱신** | Internal endpoint 표를 4개 서비스 기준으로 재기재 (예: `learning-svc/learning-card:/internal/decks/copy`). v1.0의 endpoint 자체는 보존, 호스트만 재매핑 |
| 3.5 데이터 흐름 아키텍처 — 노트 작성 → 검색 가능까지 | **갱신** | 시퀀스 다이어그램의 서비스 라벨을 4개 서비스명 + 내부 모듈로 변경. 흐름 자체(Note 작성 → Kafka 발행 → ES 인덱싱 → 청킹 → 임베딩)는 보존 |
| 3.6 AWS EKS + ArgoCD GitOps | **갱신** | 본문 그대로 + **ApplicationSet 1~2단락 추가**: "ArgoCD ApplicationSet matrix generator로 5개 서비스(platform-svc / engagement-svc / knowledge-svc / learning-card / learning-ai) × 3개 환경(dev / staging / prod) 매트릭스를 정의한다. dev는 autoSync=true, staging/prod는 수동 승인. 풀 YAML과 deploy.yml의 GitOps 갱신 단계는 09 §B3 참조." |
| 3.6 K8s 리소스 구성 표 (10개 서비스 리소스) | **전면 갱신** | 10행 표 → **5행 표**로 재계산 (source `SYNAPSE_Service_Consolidation.md` §6.3): <br>`platform-svc 500m / 1Gi (HPA 1-3)` <br>`engagement-svc 500m / 1Gi (HPA 1-3)` <br>`knowledge-svc 1000m / 2Gi (HPA 2-6)` <br>`learning-card 500m / 1Gi (HPA 2-4)` <br>`learning-ai 1000m / 2Gi (HPA 2-8)` <br>합계 약 3500m / 7Gi — 원안(10개 서비스 ~5000m / 10Gi) 대비 30% 절감 표기 |
| 3.7 보안 아키텍처 — 인증/인가 흐름·보안 설계 원칙 | **흡수** | 변경 없음. 4-서비스 통합과 직교 |
| 3.8 모니터링 및 관측성 | **흡수** | 변경 없음 |

### 4.2 신규 추가

| 위치 | 액션 | 내용 |
|---|---|---|
| 메타데이터 직후 | **신규** | §3 메타데이터 / ⚠️ 주의문 (위 §3 블록 그대로) |
| 메타데이터·⚠️ 주의문 직후, 3.1 시스템 아키텍처 개요 직전 | **신규 sub-section (절번호 없음)** | 헤딩 `## 4-서비스 통합 결정 (ADR-001 / ADR-002)` (H2, 절번호 없음 — 기존 3.1~3.8 절 번호 보존). 내용: 4-서비스 통합 사실 1단락 + 트랙↔레포↔Owner 매핑표(09 §0.3와 동일 7행 표) + 09 §0.1 / Appendix A·B cross-reference. 약 30~40줄. 위치 근거: 시스템 아키텍처 개요(3.1)의 다이어그램이 "왜 4 서비스인가"를 시각적으로 보여주므로 그 직전에 결정 사실을 두는 흐름이 자연스러움 |
| 변경 이력 | **갱신** | v2.0 row 추가 (아래 §6 참조) |

### 4.3 03 검증 기준 (spec-side 8개)

- [ ] v1.0의 10개 `XXX Service` 표현이 본문에 잔재하지 않음 (`Auth Service|Note Service|Card Service|Graph Service|AI Service|Billing Service|Audit Service|Community Service|Gamification Service|Notification Service`). 단, "auth 모듈" / "note 모듈" 등 모듈 라벨은 허용
- [ ] 4-서비스명 본문에 일관 사용 — `synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc` 모두 등장
- [ ] 3.2.4 Core Services가 4-서비스 + 내부 모듈 매트릭스로 재구성됨 (네 개의 서비스 헤딩 등장)
- [ ] 3.4 Kafka 토픽 다이어그램의 producer/consumer 노드 라벨이 4-서비스로 재매핑됨
- [ ] 3.6 K8s 리소스 표가 5행(platform / engagement / knowledge / learning-card / learning-ai)으로 재작성됨
- [ ] 멀티테넌시(3.3) / 보안(3.7) / 모니터링(3.8) 본문이 v1.0 그대로 보존됨
- [ ] 상단 ⚠️ 주의문 + 변경 이력 v2.0 row 등장
- [ ] 09 cross-reference 본문에 등장 (`§0.1 / §B1 / §B3 / §B4 / Appendix A·B` 중 ≥3개)

---

## 5. 18 v2.0 — 변경 매트릭스 (35+개 절)

### 5.1 절별 명세 (영향 받는 절만 — 직교 절은 모두 흡수)

| 절 | 액션 | 작성 명세 |
|---|---|---|
| 상단 메타데이터 | **갱신** | 버전 v1.0 → v2.0, 수정일 2026-05-09 추가 |
| 상단 ⚠️ 주의문 | **신규** | §3 블록 그대로 |
| 1.1 문서 목적 | **흡수** | 변경 없음 |
| 1.2 전체 시스템 아키텍처 — ASCII 7-Layer 다이어그램 | **갱신** | "Layer 4: Backend Services"의 10 서비스 라벨 → 4 서비스로 재작성: <br>` Auth │ Note │ Card │ Graph │ AI │Billing│Audit │ Comm` 라인 + `Gamification│Notification` 라인 → <br>`platform-svc │ engagement-svc │ knowledge-svc │ learning-svc` 라인 + 각 서비스 안 모듈 라인. learning-svc는 `learning-card (Java)` + `learning-ai (Python)` 두 컨테이너 표기. 다이어그램 박스 글자 수 맞추기 |
| 1.3 기술 선택 기준 (성숙도/커뮤니티/성능 등 6 가중치) | **흡수** | 변경 없음 |
| 1.4 기술 스택 전체 목록 표 | **갱신** | 표에 4행 추가: <br>`Backend │ Spring Modulith │ 1.x │ 모듈 경계 강제 + ArchUnit 통합` <br>`Data │ Confluent Schema Registry │ 7.x │ Avro 스키마 진화 호환성 검증` <br>`Backend │ Apache Avro │ 1.11.x │ 이벤트 직렬화 / 스키마 정의` <br>`Infra │ ArgoCD ApplicationSet │ 2.x │ 매트릭스 제너레이터 (5×3 환경)` <br>기존 ArgoCD 행이 있다면 그대로 둠 (ApplicationSet은 ArgoCD의 기능 분류이지만 별도 행으로 가시성 확보) |
| 2. Client Layer 전체 (Flutter 3.x / Dart 3.x / Riverpod / GoRouter / Sliver / google_fonts / CanvasKit / D3.js / flutter_test) | **흡수** | 모든 sub-section 그대로. 4-서비스 통합과 직교 |
| 3. Gateway Layer (Spring Cloud Gateway 5 / Resilience4j / Redis Token Bucket) | **흡수** | 변경 없음 |
| 4.1 Java/Spring Ecosystem (4.1.1 Java 21 / 4.1.2 Spring Boot 4 / 4.1.3 Spring Security 7 / 4.1.4 JPA / 4.1.5 Flyway / 4.1.6 WebFlux / 4.1.7 Testcontainers) | **흡수** | 모두 그대로 |
| **4.1.8 Spring Modulith 1.x** | **신규** | 18 형식 그대로 새 sub-section. 약 100~120줄 분량. 포함 항목: <br>- 개요 <br>- 역할 (synapse-platform-svc·engagement-svc·knowledge-svc·learning-card 안 모듈 경계 강제) <br>- 선택 이유 (4-서비스 통합 후 모듈 분리 옵션 보존을 위한 핵심 도구) <br>- 대안 비교 (수동 패키지 분리 / Maven multi-module / Gradle subproject) <br>- 기술적 이점 (`@ApplicationModule` 선언 / `Modulithic` 검증 / ArchUnit 자동 통합) <br>- 핵심 기능 (모듈 의존성 그래프 자동 검증 / 이벤트 기반 통신 강제 / 모듈 문서 생성) <br>- 프로젝트 내 사용 위치 (각 서비스 src/main/java/.../module-info 또는 `package-info.java`) <br>- 설정 가이드 (`spring-modulith-starter` Gradle 의존성 + ArchUnit 검증 테스트 코드 5~10줄) <br>- 트러블슈팅 (모듈 경계 위반 진단 / 순환 의존성 해결) |
| 4.2 Python/FastAPI Ecosystem (Python 3.12 / FastAPI / uvicorn / LangChain / httpx / pytest) | **흡수** | 변경 없음 |
| 5.1 PostgreSQL 16 + pgvector | **흡수** | 변경 없음 |
| 5.2 Redis 7 Cluster | **흡수** | 변경 없음 |
| 5.3 Elasticsearch 8 + nori | **흡수** | 변경 없음 |
| 5.4 Apache Kafka 3.x | **흡수 + 미세 추가** | 본문 그대로 + 절 끝에 1단락: "메시지 직렬화는 Apache Avro로, 스키마 진화 호환성은 Confluent Schema Registry로 관리 — 5.5 / 5.6 참조." |
| **5.5 Confluent Schema Registry 7.x** | **신규** | 18 형식 그대로. 약 80~100줄. 포함 항목: 개요·역할 (Avro 스키마 진화 호환성 강제) · 선택 이유 (이벤트 기반 4-서비스에서 필수) · 대안 비교 (Apicurio / AWS Glue Schema Registry) · 호환성 모드 정의 (BACKWARD/FORWARD/FULL/NONE) · Synapse 정책 (글로벌 BACKWARD, Knowledge.events-value BACKWARD_TRANSITIVE — 09 §B4 참조) · 절대 금지 5종 (NONE 모드/필드 이름 변경/default 없는 필드 추가/enum 값 제거/필수 필드 삭제) · 설정 가이드 · 트러블슈팅 |
| **5.6 Apache Avro 1.11.x** | **신규** | 18 형식 그대로. 약 60~80줄. 포함: 개요·역할 (synapse-shared 안 .avsc 정의) · 선택 이유 (JSON 대비 진화 호환성·바이너리 효율) · 대안 비교 (Protobuf / JSON Schema) · 핵심 기능 (스키마 정의 / 직렬화 / Generic + Specific Record) · 프로젝트 내 사용 위치 (synapse-shared/src/main/avro 트리 — 09 §B4) · 설정 가이드 (Gradle avro plugin + 코드 생성) · 트러블슈팅 |
| 5.5/5.6 신규 삽입 후 절 번호 정정 | **갱신** | 기존 5.5 AWS S3 → **5.7 AWS S3** (한 번만 절번호 변경, 본문 cross-reference 영향 없음 — 본문 안에 "5.5 AWS S3" 같은 절번호 직접 인용은 v1.0 본문에서 발견되지 않음. 검증 step에서 grep으로 재확인) |
| 6. AI/ML 레이어 (Anthropic Claude / OpenAI Embeddings / RAG / 시맨틱 캐시) | **흡수** | 변경 없음 |
| 7.1 Docker + Docker Compose | **흡수** | 변경 없음 |
| 7.2 AWS EKS | **흡수 + 미세 갱신** | K8s 리소스 한도 표(있다면) 4-서비스 기준으로 갱신 (source Consolidation §6.3) |
| 7.3 ArgoCD | **갱신** | 본문 그대로 + **ApplicationSet sub-section 신규** (50~80줄): 매트릭스 제너레이터 / 5×3 환경 매트릭스 / dev autoSync · staging/prod 수동 승인 / 09 §B3 cross-reference. 풀 YAML은 09 § B3 참조 (본 18에 인라인하지 않음 — 18은 백과사전이지 운영 매뉴얼이 아님) |
| 7.4 GitHub Actions | **흡수 + 1단락 추가** | 본문 그대로 + 1단락: "Synapse는 폴리레포 구성으로 각 서비스 레포에 `mirror.yml`(synapse-mirror 동기화) / `deploy.yml`(ECR 빌드 + GitOps 갱신) / `synapse-shared`에는 `schema-check.yml`(Avro BACKWARD 검증)을 둔다. 풀 YAML과 정책은 09 §B2/§B3/§B4 참조." |
| 7.5 Cloudflare / 7.6 Istio / 7.7 ECR | **흡수** | 변경 없음 |
| 8. 모니터링 & 관측성 (Prometheus / Fluent Bit / OpenTelemetry / Sentry / AlertManager) | **흡수** | 변경 없음 |
| 9. 외부 서비스 (Stripe / OAuth / FCM·APNs / SES / Secrets Manager) | **흡수** | 변경 없음 |
| 10.1 전체 기술 스택 요약표 | **갱신** | 표에 신규 4행 추가 (Spring Modulith / Confluent Schema Registry / Apache Avro / ArgoCD ApplicationSet) |
| 10.2 기술 의존성 다이어그램 | **갱신** | Schema Registry 노드 추가 (Kafka 옆) / Modulith 노드 추가 (Spring Boot 안). 의존 화살표 갱신 |
| 10.3 버전 관리 정책 | **흡수** | 변경 없음 |
| 12.1 Spring Boot 4 생태계 버전 매핑 | **갱신** | 표 행 추가 — `Spring Modulith │ 1.x │ Spring Boot 4.x 호환` |
| 12.2 Flutter 생태계 / 12.3 Python AI 생태계 | **흡수** | 변경 없음 |
| 12.4 인프라 버전 요구사항 | **갱신** | 표 행 추가 — `Confluent Schema Registry │ 7.x` / `Apache Avro │ 1.11.x` / `ArgoCD ApplicationSet (matrix gen)` |
| 12.5 주요 충돌 및 대안 | **흡수 + 가능 시 추가** | 신규 충돌 사항 발견 시 추가 (없다면 그대로) |
| 11. 변경 이력 | **갱신** | v2.0 row 추가 (§6 참조) |

### 5.2 18 검증 기준 (spec-side 9개)

- [ ] 1.2 시스템 아키텍처 ASCII 다이어그램의 Layer 4가 4 서비스 + 내부 모듈로 표현됨
- [ ] 1.4 기술 스택 표에 Spring Modulith / Schema Registry / Avro / ArgoCD ApplicationSet 4행 등장
- [ ] 4.1.8 Spring Modulith 신규 항목 등장 + 9개 sub-block(개요/역할/선택 이유/대안 비교/기술적 이점/핵심 기능/프로젝트 내 사용 위치/설정 가이드/트러블슈팅) 모두 등장
- [ ] 5.5 Confluent Schema Registry / 5.6 Apache Avro 두 신규 항목 등장
- [ ] 5.7 AWS S3 (기존 5.5)로 절번호 밀림 + v1.0 본문에서 "5.5 AWS S3" 직접 인용 없음 (grep)
- [ ] 7.3 ArgoCD에 ApplicationSet sub-section 등장
- [ ] 10.1 / 10.2 / 12.1 / 12.4 매트릭스에 신규 항목 등장
- [ ] 11 변경 이력 v2.0 row 등장
- [ ] Client / Data 코어(Flutter / Dart / Riverpod / PG / pgvector / Redis / ES / AI / Stripe / SES) 절은 v1.0 라인 수와 거의 동일 (변경 없음 보장)

---

## 6. 변경 이력 row (양 문서 공통 형식, 본문에 맞게 적용)

```markdown
| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영하여 갱신. 09_Git_규칙_정의서 v2.0 채택을 전제. {문서별 핵심 변경 요약 — 03이라면 "3.1 시스템 다이어그램 / 3.2.4 Core Services 4-서비스 매트릭스 / 3.4 Kafka 토픽 재매핑 / 3.6 K8s 리소스 재계산 / 신규 ⚠️ 주의문" / 18이라면 "1.2 시스템 다이어그램 / 1.4 기술 스택 표 / 신규 4.1.8 Spring Modulith·5.5 Confluent Schema Registry·5.6 Apache Avro / 7.3 ArgoCD ApplicationSet 추가 / 10·12 매트릭스 갱신 / 신규 ⚠️ 주의문"}. |
```

---

## 7. 결과물 / 산출 위치

| 산출 | 경로 | git |
|---|---|---|
| 본 spec (이 파일) | `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-architecture-techstack-revamp-design.md` | syn 레포 |
| 본 plan (writing-plans 단계) | `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-architecture-techstack-revamp.md` | syn 레포 |
| 03 v2.0 본문 | `D:\workspace\final-project-syn\documents.wiki\03_프로젝트_아키텍처_정의서.md` | wiki repo (in-place 갱신 → commit + push) |
| 18 v2.0 본문 | `D:\workspace\final-project-syn\documents.wiki\18_기술_스택_정의서.md` | wiki repo (in-place 갱신 → commit + push) |

> `documents.wiki`는 git repo이므로 09 v2.0 push 사이클과 동일하게 add/commit/push 가능. 임시 클론 불필요.

---

## 8. 검증 / 완료 기준 (5영역)

### 8.1 구조 / 일관성
- [ ] 03·18 본문에 v1.0의 10개 서비스명(`Auth Service|Note Service|Card Service|Graph Service|AI Service|Billing Service|Audit Service|Community Service|Gamification Service|Notification Service`) 잔재 없음 — 단 "auth 모듈" 식 모듈 라벨은 허용
- [ ] 4-서비스명(`synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc`)이 양 문서에 일관 등장
- [ ] 03 본문 길이 약 750~850줄 (v1.0 603줄 대비 +25~40%)
- [ ] 18 본문 길이 약 6,600~6,800줄 (v1.0 6,290줄 대비 +5~8%)

### 8.2 매핑 / 참조 무결성
- [ ] 03/18 모두 09 cross-reference 등장 (`§0.1 / §B1 / §B3 / §B4 / Appendix A·B` 중 각 문서 ≥3개)
- [ ] 18 신규 절(4.1.8 / 5.5 / 5.6)의 각 sub-block(개요/역할/선택 이유/대안 비교/...)이 18 v1.0의 다른 항목과 동일한 형식 유지
- [ ] 변경 이력 v2.0 row 양 문서 등장

### 8.3 정합성 안내
- [ ] 양 문서 상단 ⚠️ 주의문에 채택일 2026-05-09 + 09 v2.0 + 5개 후속 갱신 위키 안내 모두 등장

### 8.4 콘텐츠 보존 완전성
- [ ] 03 v1.0의 직교 절(3.3 멀티테넌시 / 3.7 보안 / 3.8 모니터링) 본문이 v2.0에서 손대지 않음 (라인 수 비교)
- [ ] 18 v1.0의 직교 백과사전 항목(2.x Client / 4.2 Python / 6 AI/ML / 8 모니터링 / 9 외부 서비스)이 v2.0에서 손대지 않음 (라인 수 비교)
- [ ] 18에서 "5.5 AWS S3" 직접 인용 0건 (절번호 밀림 안전 검증)

### 8.5 분량
- [ ] 03 분량 600 ~ 1000줄 범위 (전면 재작성 + 4-서비스 매트릭스로 자연스럽게 1.2~1.5배)
- [ ] 18 분량 6,200 ~ 7,000줄 범위 (대부분 보존 + 신규 ~400줄)

---

## 9. 후속 작업 (out-of-scope)

| 그룹 | 문서 | 다음 사이클 |
|---|---|---|
| 2 | `14_배포_가이드` + `10_환경_설정_템플릿` | 그룹 1 채택 직후 별도 spec → plan → 구현 |
| 3 | `17_스케줄` | 그룹 2 채택 직후 별도 사이클 |

---

## 10. 작업 흐름 요약

1. 본 spec을 syn 레포에 commit
2. writing-plans 스킬 호출 → 단계별 task plan 작성 (예상 task: 03 갱신 6~8개 + 18 갱신 8~10개 + 검증 + commit/push, 총 18~22 task)
3. plan 기반 task 단위 fresh subagent 실행 (subagent-driven-development)
4. 매 task 검증 통과 후 다음 task
5. 모든 task 완료 후 documents.wiki에서 03 / 18 commit + push (1회)
6. syn 레포에 plan 진척 commit + push

---

*end of design spec*
