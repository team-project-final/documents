# 18 기술 스택 정의서 검증 — S3 데이터스토어

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S2b 후 v2.3-S2b 상태)
> 위키 패치 커밋: documents.wiki@f54fd1ff3d476f1d2eaad3015fea292c999d04ec (+ §11 PR# 후행 커밋 documents.wiki@ed5ed04)
> 보고서 PR: [documents#9](https://github.com/team-project-final/documents/pull/9)

## 0. 요약 (Summary)

- 검증 기술 수: 5 (PostgreSQL 16 / pgvector / Redis 7 / Elasticsearch 8+nori / AWS S3)
- **E1: 2 · E2: 0 · D: 4 · R: 7 · OK: 4** (총 17 findings)
- **P0: 3 · P1: 2 · P2: 8** (R 1건 P0·1건 P1, 나머지 P2)
- Deep Dive 3건 (Outbox 4테이블 의무화 / Redis Cluster→standalone 시정 / ES↔OpenSearch 혼재)
- 메모리 `data-sync-outbox-cqrs` 정합 검증 — `processed_events`만 실 코드 구현 완료, `outbox_event`·`user_ref`·`event_publication` 3종은 02_ERD/메모리 표준만 있고 코드 미구현

**가장 영향 큰 발견 (P0)**:
- **S3-F01**: §5.1.1 PostgreSQL 본문에 Outbox/CQRS/Modulith Registry/멱등 4종 테이블 단 한 줄도 없음 → 메모리·02_ERD 표준 정합 실패. 핵심 테이블 카탈로그 표 신설 (R, Deep Dive)
- **S3-F07**: §5.2 "Redis 7 Cluster"로 단정·6노드 토폴로지 예제 → 실제는 모든 synapse-* application*.yml이 standalone 단일 host/port (E1, Deep Dive)
- **S3-F08**: §5.3 "Elasticsearch 8" 단독 명시 → 실 인프라(synapse-gitops/local-k8s, docker-compose 등)는 OpenSearch 2.11.0. 클라이언트는 ES 8 Java Client. 양쪽 호환되나 위키-인프라 표기 충돌 (E1, Deep Dive)

## 1. 카테고리 인벤토리 (Step 1)

| 절 | 기술 | 라인 범위 | 1차 진단 |
|----|------|----------|---------|
| §5.1.1 | PostgreSQL 16 | L3040-L3177 (138줄) | Outbox 표준 미반영, gen_random_uuid 주석 오기, pg_stat_io 미활용 |
| §5.1.2 | pgvector | L3178-L3313 (136줄) | 버전 미명시, HNSW partial index 누락, embedding NULL 정책 cross-svc 불일치 |
| §5.2 | Redis 7 Cluster | L3314-L3480 (167줄) | 실제는 standalone 단일 노드 — 위키 "Cluster" 단정 시정 필요 |
| §5.3.1 | Elasticsearch 8 + nori | L3483-L3648 (166줄) | 실 인프라는 OpenSearch 2.11. analyzer/index 이름 실 코드와 불일치 |
| §5.7 | AWS S3 | L3984-L4201 (218줄) | 코드 실제로 미구현 (AttachmentService 부재). SSE-S3 자동 적용 미반영 |

**cross-section**: §5.x 인용은 §5.4 Kafka 인근에 집중 (S4 영역). 본 세션 영역에 외부 인용 영향 없음.

## 2. skill-recommender 결과 (Step 2)

- 카탈로그: 361건 매칭 (S3 키워드가 풍부 — postgresql/redis/elasticsearch/s3 모두 인기)
- 상위 5건 점수순: MemoryForge AI (55.0), Neon (52.0, verified=true), PostgreSQL (50.0), PostgreSQL Database Management Server (50.0), PostgreSQL Database Query Server (50.0)
- **verified=true**: **Neon** 1건 — PostgreSQL 호스팅 MCP. 검증 도구로 본 세션 활용도는 낮지만(Synapse는 RDS 사용), Postgres 16 사실 검증의 보조 자원으로 인지.

**채택 결과**: 0건 활용 (Neon은 본 세션 범위 외). S1~S2와 동일하게 **context7 MCP** 1차 도구.

## 3. 공식 문서 검증 결과 (Step 3)

- **출처**: context7 (`/websites/postgresql_16`, `/pgvector/pgvector`, `/redis/docs`, `/websites/elastic_co_guide_en_elasticsearch_reference_8_19`) + WebFetch (elastic.co ES 8.0 security default, docs.aws.amazon.com SSE-KMS)
- **핵심 인용**:
  - PostgreSQL 16: `gen_random_uuid()`는 **v4 random** (Postgres 공식 문서). v7은 별도 함수·Hibernate `@UuidGenerator(TIME)` 필요. `pg_stat_io` 시스템 뷰 신설(16) — S3-F02·F03
  - pgvector 0.8.x 신기능: `halfvec(4000)`, `bit/sparsevec`, `hnsw.iterative_scan` 지원. HNSW partial index `WHERE` 절 지원 (S3-F04·F06)
  - Redis: Cluster vs Sentinel vs Standalone 별도 구성 (S3-F07)
  - Elasticsearch 8.0+: `xpack.security.enabled=true` 기본값 (S3-F10)
  - AWS S3: 2023-01-05부터 SSE-S3 자동 적용. SSE-KMS는 `kms:GenerateDataKey` 권한 필요 (S3-F12)

## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성·버전·테이블 비교

| 항목 | 18 문서 명시 | synapse-* 실측 | 출처 | 진실 | 클래스 |
|------|-------------|---------------|------|------|-------|
| PostgreSQL 버전 | 16 | 16 | docker-compose, RDS 설정 | 일치 | OK |
| pgvector 버전 | (헤더 명시 없음) | `pgvector/pgvector:pg16` (0.8.x 추정) | docker-compose.ci.yml, conftest.py | 보강 필요 | R (S3-F04) |
| `outbox_event` 테이블 | (본문 없음) | 마이그레이션 0건 (02_ERD §2.3.A에만 정의) | Grep | 코드 미구현 + 위키 누락 | R (S3-F01) |
| `user_ref` 테이블 | (본문 없음) | 마이그레이션 0건 | Grep | 동상 | R (S3-F01) |
| `event_publication` 테이블 | (본문 없음) | 마이그레이션 0건 (Spring Modulith 2.0.x 자동 생성) | Grep | 동상 | R (S3-F01) |
| `processed_events` 테이블 | (본문 없음) | `synapse-platform-svc/.../V26__create_processed_events.sql` 존재 ✅ | 마이그레이션 | 위키 누락만 정정 | R (S3-F01) |
| `gen_random_uuid()` 주석 | "UUID v7 생성 함수" | 실제 v4 (pgcrypto) | postgresql.org/docs/16 | 공식 | D (S3-F02) |
| embedding 컬럼 NULL | NOT NULL | knowledge-svc nullable / learning-ai NOT NULL | Flyway V3 + alembic | cross-svc 불일치 | D (S3-F05) |
| HNSW partial index | 무조건 인덱스 | learning-ai는 `WHERE tenant_id IS NOT NULL` | alembic 96f1bb4b65ed | 코드 (보강) | R (S3-F06) |
| Redis 토폴로지 | Cluster (6노드) | **모든 application*.yml이 단일 host/port** (standalone) | 7개 yml 검증 | 코드 (standalone) | **E1 (S3-F07)** |
| Elasticsearch vs OpenSearch | ES 8.x 단독 | OpenSearch 2.11.0 (인프라) + ES 8 Java Client | gitops/docker-compose × 4 | 양립 | **E1 (S3-F08)** |
| ES index 이름 | `synapse-notes` | `notes-v1` | ElasticsearchNoteSearchRepository.java:35 | 코드 | D (S3-F09) |
| ES analyzer | `korean_analyzer` + `korean_search_analyzer` | `korean_nori` (단일) | Java 클라이언트 코드 :179-205 | 코드 | D (S3-F09) |
| ES `xpack.security` | (미언급) | testcontainer만 `enabled=false` 명시 | SearchElasticsearchIntegrationTest.java:51 | 보강 필요 | R (S3-F10) |
| AWS S3 SDK | AttachmentService 풀세트 | `S3Client` import 0건, 의존성 부재 | Grep | 코드 미구현 | R (S3-F11) |
| S3 SSE-S3 명시 | "AES256 SSE-S3 암호화" | (코드 미구현) | docs.aws.amazon.com | 공식 (자동 적용 1년+) | D (S3-F12) |

### 4.2 메모리 표준 정합성

- **`data-sync-outbox-cqrs`** ↔ §5.1.1:
  - ✅ Modulith Event Publication Registry 분리 정책 (§4.1.8 박스에서 이미 보강됨 — S2a 결과)
  - ❌ `outbox_event`·`user_ref`·`event_publication` 4종 테이블 카탈로그 §5.1.1 본문에 부재 → S3-F01 패치로 추가
  - ✅ 와이어 포맷 Avro·payload JSONB — §5.4 Kafka 절은 v2.2에서 이미 정합화 (S4 영역, 본 세션 건드리지 않음)
- **`git-pr-workflow`**: 본 세션도 별도 브랜치 → PR → 머지 대기 ✓

## 5. 발견사항 (Findings)

### §5.1.1 PostgreSQL 16

### S3-F01 · Outbox/CQRS/Modulith Registry/멱등 4종 테이블이 §5.1.1 본문에 단 한 줄도 없음 · R / P0 · Deep Dive

- **section**: §5.1.1 PostgreSQL 16
- **evidence_official**:
  ```
  메모리 data-sync-outbox-cqrs:
  - "outbox_event(발행) + user_ref(소비 복제본) 테이블 정의" (02_ERD §2.3.A)
  - "정합성의 진짜 보증은 소비측 version 가드 + processed_events 멱등"
  documents.wiki/02_ERD_문서.md:803,854 — 발행/소비 테이블 정의
  documents.wiki/18_기술_스택_정의서.md:2414 (S2a §4.1.8) — Modulith event_publication ↔ outbox_event 분리
  ```
- **evidence_repo**: `synapse-platform-svc/src/main/resources/db/migration/V26__create_processed_events.sql` (실 구현). `outbox_event`/`user_ref`/`event_publication`은 마이그레이션 0건
- **proposed_text**: §5.1.1 "기술적 이점" 위에 **#### 핵심 테이블 카탈로그 (도메인 + 통신 표준)** 표 신설:
  ```markdown
  | 카테고리 | 테이블 | 정의 위치 | 용도 |
  |---------|--------|-----------|------|
  | 도메인 | `users`, `tenants`, `notes`, `note_chunks`, `card_reviews`, … | 02_ERD §2.1~§2.2 | 비즈니스 영속 |
  | **발행 측 Outbox** | `outbox_event` | 02_ERD §2.3.A, 03-A §A.10 | 도메인 트랜잭션과 동일 트랜잭션으로 이벤트 적재. Polling Relay(@Scheduled + ShedLock 7.7.x) — `FOR UPDATE SKIP LOCKED` → Kafka 발행(§5.4·§5.5 Avro). 파티션 키 `{tenant_id}:{aggregate_id}` |
  | **CQRS 읽기모델** | `{aggregate}_ref` (예: `user_ref`) | 02_ERD §2.3.A | 다른 서비스 소유 데이터의 읽기 전용 복제본. `UPSERT … WHERE EXCLUDED.version > target.version` |
  | **Modulith Event Publication Registry** | `event_publication` (spring-modulith-events-jpa 자동 생성) | 18 §4.1.8 | **서비스 내부** 모듈 간 listener 재시도/감사. 서비스 경계는 별도 outbox 사용 |
  | **소비 측 멱등** | `processed_events(event_id PK, ...)` | synapse-platform-svc V26 (구현 완료) | at-least-once 중복 SKIP |

  > 🎓 **신입자 안내**: 통신 표준 4테이블의 *왜·언제·어떻게*는 신입 온보딩 포털 `flow/05b-data-sync-outbox-cqrs` 또는 `Outbox-데이터동기화-신입가이드.html`. 본 §5.1.1은 *어디에 어떤 컬럼/인덱스로 저장되는지*의 기술 스택 기준이다.
  ```
- **patch_target**: L3060-L3075 (기술적 이점 위)
- **deep_dive**: true

### S3-F02 · `gen_random_uuid()` v4 random인데 주석은 "UUID v7" — 오기 · D / P2

- **section**: §5.1.1 PostgreSQL 16
- **evidence_official**: postgresql.org/docs/16/functions-uuid.html — "gen_random_uuid() Generates a version 4 (random) UUID"
- **current_text**: L3093-L3144 코드 예제 + L3125 주석 "UUID v7 생성 함수 (시간 순서 보장)"
- **proposed_text**: 주석 정정 + Hibernate `@UuidGenerator(TIME)` 옵션 명시
- **patch_target**: L3093-L3144

### S3-F03 · PG16 신규 기능 `pg_stat_io` 미활용 · R / P2

- **section**: §5.1.1 PostgreSQL 16
- **evidence_official**: PostgreSQL 16 신규 시스템 뷰 — backend/object별 I/O 통계
- **proposed_text**: 트러블슈팅 표 끝에 행 추가 — `SELECT * FROM pg_stat_io WHERE backend_type='client backend' ORDER BY reads DESC;`
- **patch_target**: L3168 (트러블슈팅 표 끝)

### §5.1.2 pgvector

### S3-F04 · pgvector 버전 미명시 + 0.7~0.8 신규 기능 누락 · R / P2

- **section**: §5.1.2 pgvector
- **evidence_official**: context7 /pgvector — 0.8.0부터 halfvec/bit/sparsevec/iterative_scan 지원
- **evidence_repo**: `pgvector/pgvector:pg16` Docker 이미지 사용 (버전 단서)
- **proposed_text**: 헤더를 "### 5.1.2 pgvector 0.8.x"로 변경 + "기술적 이점"에 halfvec/iterative_scan 1줄 추가
- **patch_target**: L3178 (헤더) + L3199-L3205

### S3-F05 · note_chunks embedding NULL 정책 cross-svc 불일치 · D / P2

- **section**: §5.1.2 pgvector
- **evidence_repo**:
  ```
  synapse-knowledge-svc/.../V3:9 — embedding vector(1536), (nullable)
  synapse-learning-svc/learning-ai/alembic/.../96f1bb4b65ed:34 — Vector(1536), nullable=False
  ```
- **proposed_text**: "프로젝트 내 사용 위치" 직후 NOTE 박스 추가 — 비동기 백필 정책 명시
- **patch_target**: L3217

### S3-F06 · partial HNSW 인덱스 누락 · R / P2

- **section**: §5.1.2 pgvector
- **evidence_repo**: `learning-ai/alembic/.../96f1bb4b65ed:53-58` — `WHERE tenant_id IS NOT NULL` partial index
- **proposed_text**: L3239 직후 partial 인덱스 예제 추가
- **patch_target**: L3239 직후

### §5.2 Redis 7

### S3-F07 · 위키 "Redis 7 Cluster" 단정 ↔ 실제 모든 서비스 standalone · E1 / P0 · Deep Dive

- **section**: §5.2 Redis 7 Cluster
- **evidence_official**: context7 /redis/docs — Cluster vs Standalone vs Sentinel 별도 구성
- **evidence_repo**:
  ```
  synapse-platform-svc/application-{dev,prod}.yml L11-L15 — 단일 host/port
  synapse-gateway/application.yml L7-L12 — 단일 host/port
  synapse-learning-svc/learning-card/application-dev.yml L11-L15 — 단일 host/port
  synapse-platform-svc/docker-compose.yml:20 — image: redis:7 (단일)
  synapse-gitops/local-k8s/infra/redis.yaml:12 — image: redis:7-alpine (단일 Deployment)
  Grep `cluster.nodes|cluster:\s*$|Sentinel|sentinel` → 0건
  ```
- **current_text**: §5.2 헤더 "Redis 7 Cluster" + L3345 "Cluster 모드: 자동 샤딩 + HA (3 마스터 + 3 레플리카)" + L3363-L3386 클러스터 application.yml 예제
- **proposed_text**: 
  - 헤더 → "### 5.2 Redis 7 (개발: standalone · 운영 목표: Cluster)"
  - "선택 이유" 끝에 **현재 배포 상태(2026-05-28)** 박스 추가
  - 클러스터 예제 직전에 standalone 예제 추가 (실 코드 기반 host/port/lettuce.pool), 기존 cluster 예제는 "운영 확장 시 — Cluster 전환 템플릿" 부제로 보존
- **patch_target**: L3314 (헤더) + L3327 (선택 이유) + L3361-L3386 (설정 가이드)
- **deep_dive**: true

### §5.3.1 Elasticsearch 8 + nori

### S3-F08 · 위키 "Elasticsearch 8" 단독 ↔ 실 인프라 OpenSearch 2.11 + ES 8 Java Client · E1 / P0 · Deep Dive

- **section**: §5.3.1 Elasticsearch 8
- **evidence_repo**:
  ```
  synapse-knowledge-svc/docker-compose.ci.yml:15 — opensearchproject/opensearch:2.11.0
  synapse-gitops/local-k8s/infra/opensearch.yaml:12 — 동일
  synapse-gitops-s6/local-k8s/infra/opensearch.yaml:12 — 동일
  synapse-shared/docker-compose.yml:134 — 동일
  documents.wiki/10_환경_설정_템플릿.md:313 — 동일
  반면 synapse-knowledge-svc/src/test/.../SearchElasticsearchIntegrationTest.java:47 — testcontainer는 ES 8.19.6
  build.gradle.kts: spring-boot-starter-data-elasticsearch (ES Java Client)
  ```
- **proposed_text**:
  - §5.3 헤더 → "### 5.3 Elasticsearch 8 / OpenSearch 2.x + nori Analyzer (현재 인프라: OpenSearch 2.11)"
  - §5.3.1 본문 첫 단락 끝에 **현재 배포 상태(2026-05-28)** 박스 추가
  - 대안 비교 OpenSearch 행 → "✅ 현재 배포 / ES Java Client와 호환"
  - 참고 자료에 OpenSearch 공식 추가
- **patch_target**: L3481 (헤더 §5.3) + L3483-L3502 + L3642-L3645 (참고 자료)
- **deep_dive**: true

### S3-F09 · ES index 이름·analyzer 이름 실 코드와 불일치 · D / P1

- **section**: §5.3.1 Elasticsearch 8
- **evidence_repo**:
  ```
  ElasticsearchNoteSearchRepository.java:35 — INDEX_NAME = "notes-v1"
  :179-205 — tokenizer "korean_nori_tokenizer" + filter "korean_nori_pos_filter" + analyzer "korean_nori" (단일)
  ```
- **current_text**: 위키 예제 `PUT /synapse-notes`, `korean_analyzer`/`korean_search_analyzer` 분리
- **proposed_text**: JSON 매핑 전체와 NoteSearchService 예제를 실 코드 기준으로 갱신 (`notes-v1`, `korean_nori` 단일)
- **patch_target**: L3519-L3630

### S3-F10 · ES 8.0+ `xpack.security.enabled=true` 기본값 미언급 · R / P2

- **section**: §5.3.1 Elasticsearch 8
- **evidence_official**: elastic.co 8.0 릴리스 노트 — `xpack.security.enabled` 모든 라이선스에서 기본 true
- **proposed_text**: 설정 가이드 앞에 보안 박스 + 트러블슈팅 "인증 실패 401" 행 추가
- **patch_target**: L3523 + L3640

### §5.7 AWS S3

### S3-F11 · AttachmentService 실 코드 0건 — "계획 상태" 명시 · R / P1

- **section**: §5.7 AWS S3
- **evidence_repo**:
  ```
  Grep S3Client|S3Presigner|AttachmentService|generatePresignedUrl → 0건
  synapse-knowledge-svc/build.gradle.kts: software.amazon.awssdk 의존성 부재
  ```
- **proposed_text**: "프로젝트 내 사용 위치"에 **계획 상태(2026-05-28)** 박스 — "W4 이후 구현 예정, 본 §5.7 예제는 *목표 구현 형태* 표준 참조"
- **patch_target**: L4021-L4025

### S3-F12 · SSE-S3 명시는 1년+ 의미 무효 + SSE-KMS 옵션 누락 · D / P2

- **section**: §5.7 AWS S3
- **evidence_official**: docs.aws.amazon.com — 2023-01-05부터 SSE-S3 자동 적용
- **current_text**: L4076 `.serverSideEncryption(ServerSideEncryption.AES256)` 주석 "SSE-S3 암호화"
- **proposed_text**: 주석 갱신 + "기술적 이점"에 KMS/SSE-KMS 옵션 추가 + 트러블슈팅에 "KMS Decrypt 실패" 행 추가
- **patch_target**: L4005-L4012 + L4076 + L4192

### S3-F13 · S3 Event Notifications / Object Lock / Transfer Acceleration 미언급 · R / P2

- **section**: §5.7 AWS S3
- **evidence_official**: docs.aws.amazon.com — Event Notifications (SNS/SQS/EventBridge), Object Lock(WORM), Transfer Acceleration 별도 가이드
- **proposed_text**: "기술적 이점" 끝에 3행 추가 — 이벤트 알림·Object Lock·Transfer Acceleration
- **patch_target**: L4011 직후

### OK 항목 통합 표

| finding_id | section | 한 줄 사유 | 증거 |
|-----------|---------|----------|------|
| S3-F14 | §5.2 Redis | 운영 가이드만 다루고 fakeredis 테스트 정책은 11_테스트_전략서로 분리 — cross-link 1줄만 추가하면 충분 (선택) | moking-data-guide/00-mocking-strategy.md |
| S3-F15 | §5.1.2 pgvector | 거리 연산자(`<=>`/`<->`/`<#>`)·HNSW 파라미터(m=16, ef_construction=64) 공식·실 코드 일치 | pgvector README + learning-ai alembic |
| S3-F16 | §5.3.1 nori | `decompound_mode: mixed` + stoptag 리스트(E,IC,J…VSV) 공식·실 코드 일치 | Java client `NoriDecompoundMode.Mixed` |
| S3-F17 | §4.1.8 Modulith Outbox (S2a 보강) | Modulith vs Outbox 분리 정책이 메모리 표준과 일치, Modulith 2.0.6 BOM 실 코드 확인 | synapse-knowledge-svc/build.gradle.kts:61 |

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

| finding_id | 절 | Deep Dive 제목 | 핵심 요지(1줄) |
|-----------|-----|-------------|-------------|
| S3-F01 | §5.1.1 PostgreSQL 16 | Outbox·CQRS·Modulith Registry·멱등 4테이블 의무화 근거 | 메모리·02_ERD 표준이 정의됐으나 §5.1.1 본문에 단 한 줄도 없어 dual-write 안티패턴 위험 |
| S3-F07 | §5.2 Redis 7 | Redis 토폴로지 시정 근거 | 위키 단정 vs 실코드 standalone — 현실(현재) + 미래(Cluster) 박스 병기 |
| S3-F08 | §5.3.1 ES 8 | ES/OpenSearch 혼재 시정 근거 | OpenSearch 2.11(Apache 2.0) ↔ ES 8(Elastic Lic v2) 라이선스 차이, 결정 ADR 필요. 현 시점은 공존 명시로 표기 통일 |

## 7. 위키 패치 diff 요약

위키 커밋: `documents.wiki@f54fd1f` (master)
파일: `18_기술_스택_정의서.md` (+91 / -58)

| Finding | 클래스 | 위치 | 변경 유형 |
|---------|-------|--------|---------|
| S3-F01 | R, P0 (Deep Dive) | §5.1.1 대안비교와 기술적이점 사이 | "핵심 테이블 카탈로그" 표 신설 (Outbox/CQRS/Modulith Registry/멱등 4종) + 신입자 안내 박스 |
| S3-F02 | D, P2 | §5.1.1 UUID v7 함수 위 | gen_random_uuid v4 명시 + Hibernate `@UuidGenerator(TIME)` 옵션 주석 |
| S3-F03 | R, P2 | §5.1.1 트러블슈팅 표 끝 | `pg_stat_io` 행 추가 (PG16 신규) |
| S3-F04 | R, P2 | §5.1.2 헤더 + 기술적 이점 끝 | "pgvector 0.8.x" 명시 + halfvec/iterative_scan 1행 |
| S3-F05 | D, P2 | §5.1.2 사용 위치 직후 | NOT NULL 정책 NOTE 박스 + Direct SDK 패턴 명시 |
| S3-F06 | R, P2 | §5.1.2 HNSW 인덱스 예제 직후 | partial index (`WHERE tenant_id IS NOT NULL`) 예제 추가 |
| S3-F07 | E1, P0 (Deep Dive) | §5.2 헤더·선택 이유·설정 가이드 | "Redis 7 Cluster" → "개발 standalone·운영 목표 Cluster" + 현재 배포 박스 + standalone yaml 추가 |
| S3-F08 | E1, P0 (Deep Dive) | §5.3 헤더·§5.3.1 개요·대안 비교·참고 자료 | ES 8 / OpenSearch 2.x 공존 표기 + 현재 배포 박스 + OpenSearch 2.11 행 갱신 |
| S3-F09 | D, P1 | §5.3.1 JSON 매핑 + Java 예제 | `synapse-notes` → `notes-v1`, `korean_analyzer`/`korean_search_analyzer` → `korean_nori` 단일 |
| S3-F10 | R, P2 | §5.3.1 설정 가이드 시작 + 트러블슈팅 | ES 8.0 보안 기본값 박스 + 인증 실패 401 트러블슈팅 |
| S3-F11 | R, P1 | §5.7 프로젝트 내 사용 위치 | "계획 상태(2026-05-28)" 박스 — W4 이후 구현 명시 |
| S3-F12 | D, P2 | §5.7 기술적 이점 + 코드 주석 + 트러블슈팅 | SSE-S3 자동 적용 명시 + SSE-KMS 옵션 추가 + KMS Decrypt 행 추가 |
| S3-F13 | R, P2 | §5.7 기술적 이점 | Event Notifications / Object Lock / Transfer Acceleration 3행 추가 |
| §11 변경 이력 | - | 표 마지막 직전 | v2.3-S3 행 신규 추가 (상세 변경 요약) |

커밋 메시지 본문:
```
docs(stack): S3 데이터스토어 — context7·repo 검증 반영 + 보강
E1:2 · E2:0 · D:4 · R:7 · OK:4 / P0:3 · P1:2 · P2:8
§5.1.1 PostgreSQL 16 / §5.1.2 pgvector / §5.2 Redis 7 / §5.3.1 ES 8+nori / §5.7 AWS S3
메모리 data-sync-outbox-cqrs 정합 확인 (PostgreSQL 4테이블 카탈로그 신설).
Refs: documents PR #<TBD>
```

## 8. 후속 과제 (Follow-ups)

### 본 세션 처리 완료

- ✅ `data-sync-outbox-cqrs` 메모리 정합 — §5.1.1에 4테이블 카탈로그 추가 (S3-F01)
- ✅ Redis Cluster ↔ standalone 갭 시정 — 현재/미래 박스 병기 (S3-F07)
- ✅ ES ↔ OpenSearch 혼재 표기 — 공존 박스 (S3-F08)

### S4 위임 (이벤트 세션)

- **§5.4 Apache Kafka 3.x**: v2.2에서 이미 정합화되었으나 S4에서 추가 검증 (KafkaAvroSerializer, Outbox·Polling Relay 운영 패턴, ShedLock 7.7.x)
- **§5.5 Confluent Schema Registry 7.x**: 스키마 진화 정책
- **§5.6 Apache Avro 1.11.x**: SpecificRecord·CloudEvents 헤더
- **§3.2 Resilience4j**, **§3.3 Redis Token Bucket**: Gateway 영역, S4 또는 S5에서 처리

### S5 위임 (운영 세션)

- Redis Cluster 운영 정책 ADR (전환 트리거 RPS/메모리 임계치)
- ES vs OpenSearch 결정 ADR (라이선스·AWS Managed Service·기능 fast-follow 평가)
- S3 운영(KMS 키 정책·Object Lock·Lifecycle·이벤트 알림 라우팅)

### 별도 코드 PR (위키 정정과 분리, 실 코드 수정 필요)

- **(P1)** `outbox_event`·`user_ref`·`event_publication` 마이그레이션 작성 (각 서비스별) — Outbox/CQRS 패턴 본격 도입
- **(P1)** AWS S3 AttachmentService 구현 (synapse-knowledge-svc) — `software.amazon.awssdk:s3:2.28.x` 의존성 추가 + 클래스
- **(P2)** note_chunks embedding NOT NULL 통일 (knowledge-svc 비동기 백필 후 ALTER COLUMN)
- **(P2)** HNSW partial index `WHERE tenant_id IS NOT NULL` 추가 (knowledge-svc)
- **(P2)** ES vs OpenSearch 결정 후 인프라 통일

### 별도 작업 (v2.3 통합 정리, 6 세션 종료 후)

- **§10.1 요약표** S1+S2+S3 변경 반영
- **§12.4 인프라 버전 요구사항** 표 갱신 (Redis 7.4 LTS, ES vs OpenSearch 표기, pgvector 0.8.x 명시)
- **§1.4 기술 스택 전체 목록 표** S3 발견사항 반영

### 운영 표준 예외 기록

- 위키에 추가로 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 dual-commit 예외 동일.

### 메모리 갱신 후보

- **`s3-implementation-status`** (검토): §5.7이 "계획 상태"임을 정착시키는 메모리 — W4 이후 코드 PR 시 폐기
- **`redis-topology-decision`** (검토): standalone → Cluster 전환 트리거를 별도 메모리화. S5 운영 세션 결정 후 검토
