# 목킹 및 목킹 인터페이스 정의서 — 설계 스펙

> **작성일**: 2026-05-14
> **범위**: Synapse 전 서비스/모듈의 종합 목킹 전략 + 인터페이스 정의 + 전체 커버리지 fixture

---

## 1. 목적

Synapse 프로젝트의 각 서비스(platform, engagement, knowledge, learning) + 프론트엔드(Flutter)가 독립적으로 개발/테스트할 수 있도록 모든 외부 의존성과 서비스 간 통신 지점에 대한 목킹 인터페이스를 정의한다.

### 대상 독자
- 각 서비스 Owner (로컬 개발 시 참조)
- 팀 리드 (통합 테스트 환경 구성)
- 프론트엔드 개발자 (백엔드 API Mock 사용)

### 문서가 답하는 질문
- "내 서비스에서 다른 서비스/외부 API를 어떻게 목킹하지?"
- "아직 구현되지 않은 서비스와의 통합을 어떻게 테스트하지?"
- "프론트엔드에서 백엔드 없이 어떻게 개발하지?"

---

## 2. 도구 스택

| 영역 | 도구 | 버전 | 용도 |
|------|------|------|------|
| Spring 서비스 간 REST | WireMock | 3.x | Internal API 목킹, Contract 검증 |
| Kafka 이벤트 | EmbeddedKafka + Testcontainers | - | 이벤트 발행/소비 목킹 |
| 외부 API (Stripe, OAuth, FCM, OpenAI) | WireMock | 3.x | 외부 의존성 격리 |
| DB/Redis/ES | Testcontainers | 1.19+ | 실제 인프라 경량 인스턴스 |
| FastAPI (learning-ai) | pytest + httpx.AsyncClient + unittest.mock | - | Python 서비스 목킹 |
| Flutter 프론트엔드 | Mockito (Dart) + dio mock adapter | - | API 호출 목킹 |
| 계약 테스트 | Spring Cloud Contract | 4.x | Producer-Consumer 계약 검증 |

---

## 3. 문서 산출물 구조

```
documents/docs/mocking/
├── 00-mocking-strategy.md
├── 01-platform-svc-mocking.md
├── 02-engagement-svc-mocking.md
├── 03-knowledge-svc-mocking.md
├── 04-learning-svc-mocking.md
├── 05-frontend-mocking.md
├── 06-kafka-event-mocking.md
└── 07-external-api-mocking.md
```

---

## 4. 각 문서 상세 구성

### 4.1 `00-mocking-strategy.md` — 전략 총론

**포함 내용:**
- 목킹 원칙: 테스트 피라미드 내 위치, 격리 vs 통합 판단 기준
- 도구 스택 매트릭스 (위 표 확장)
- 공통 규약:
  - fixture 네이밍 컨벤션: `{service}_{module}_{operation}_{scenario}.json`
  - 테넌트 시드값: `tenant-00000000-0000-0000-0000-000000000001`
  - 사용자 시드값: `user-00000000-0000-0000-0000-00000000000{N}`
  - 시간 고정 전략: `2026-01-15T10:00:00Z` (테스트 기준 시각)
- 환경별 적용:
  - 로컬 개발: WireMock standalone + docker-compose mock 프로필
  - CI (GitHub Actions): Testcontainers + EmbeddedKafka
  - 통합 테스트: Spring Cloud Contract stub runner

### 4.2 `01-platform-svc-mocking.md`

**서비스 의존성 맵:**
- 외부: Google/GitHub/Apple/Microsoft OAuth, Stripe API, FCM/APNs, AWS SES, AWS Secrets Manager
- 인프라: PostgreSQL, Redis, Kafka
- 소비 이벤트: `audit.event`, `notification.send`, `card.review.due`, `community.*`, `gamification.*`

**모듈별 인터페이스:**

| 모듈 | 목킹 대상 | 도구 | fixture 수 |
|------|-----------|------|-----------|
| auth | OAuth Provider 4종 (token exchange, userinfo) | WireMock | 8개 (4 provider × success/failure) |
| auth | Redis (refresh token) | Testcontainers | 설정 1개 |
| audit | Kafka Consumer (7개 토픽) | EmbeddedKafka | 7개 이벤트 fixture |
| billing | Stripe API (checkout, webhook, portal, invoice) | WireMock | 10개 |
| notification | FCM/APNs API | WireMock | 4개 |
| notification | AWS SES | WireMock | 3개 |
| notification | Kafka Consumer (8개 토픽) | EmbeddedKafka | 8개 이벤트 fixture |

**각 인터페이스 정의 형식:**
```
### [모듈명] — [목킹 대상명]

**통신 방식**: REST / Kafka / Redis
**방향**: Outbound (호출) / Inbound (소비)
**WireMock 매핑**: JSON 전문
**요청 fixture**: JSON 전문
**응답 fixture**: JSON 전문 (success + error variants)
**Spring 설정**: application-test.yml snippet
```

### 4.3 `02-engagement-svc-mocking.md`

**서비스 의존성 맵:**
- Internal API 호출: `POST /internal/decks/copy` (→ learning-svc)
- 인프라: PostgreSQL, Redis, Kafka
- 소비 이벤트: `card.reviewed`, `note.created`, `community.*`
- 발행 이벤트: `community.*` (5개), `gamification.*` (3개), `notification.send`

**모듈별 인터페이스:**

| 모듈 | 목킹 대상 | 도구 | fixture 수 |
|------|-----------|------|-----------|
| community | `/internal/decks/copy` (learning-svc) | WireMock | 2개 (success/failure) |
| community | Kafka Producer (5개 토픽) | EmbeddedKafka | 5개 |
| gamification | Kafka Consumer (`card.reviewed`, `note.created`, `community.*`) | EmbeddedKafka | 7개 |
| gamification | Kafka Producer (3개 + `notification.send`) | EmbeddedKafka | 4개 |
| gamification | Redis (리더보드 Sorted Set) | Testcontainers | 설정 1개 |

### 4.4 `03-knowledge-svc-mocking.md`

**서비스 의존성 맵:**
- 인프라: PostgreSQL, Elasticsearch, AWS S3, Kafka
- 소비 이벤트: `user.deleted`
- 발행 이벤트: `note.created/updated/deleted`, `graph.notes.linked`

**모듈별 인터페이스:**

| 모듈 | 목킹 대상 | 도구 | fixture 수 |
|------|-----------|------|-----------|
| note | Elasticsearch (인덱싱) | Testcontainers | 설정 + 매핑 1개 |
| note | AWS S3 (Presigned URL) | WireMock or LocalStack | 3개 |
| note | Kafka Producer (3개 토픽) | EmbeddedKafka | 3개 |
| graph | PostgreSQL (graph 쿼리) | Testcontainers | 시드 데이터 1세트 |
| graph | Kafka Producer (`graph.notes.linked`) | EmbeddedKafka | 1개 |
| chunking | learning-ai 호출 (임베딩 API) | WireMock | 2개 |
| chunking | pgvector (벡터 저장) | Testcontainers + pgvector ext | 설정 1개 |

### 4.5 `04-learning-svc-mocking.md`

**learning-card (Java/Spring Boot):**

| 모듈 | 목킹 대상 | 도구 | fixture 수 |
|------|-----------|------|-----------|
| card/srs | PostgreSQL | Testcontainers | 시드 데이터 1세트 |
| card/srs | Redis (세션 캐시) | Testcontainers | 설정 1개 |
| card/srs | Kafka Producer (`card.reviewed`, `card.review.due`) | EmbeddedKafka | 2개 |
| card | `/internal/decks/copy` 제공 (Provider) | Spring Cloud Contract | stub 1개 |

**learning-ai (Python/FastAPI):**

| 모듈 | 목킹 대상 | 도구 | fixture 수 |
|------|-----------|------|-----------|
| ai | OpenAI Embeddings API | httpx mock / respx | 3개 (embed, chat, error) |
| ai | Anthropic Claude API | httpx mock / respx | 3개 |
| ai | PostgreSQL + pgvector | pytest-postgresql or testcontainers-python | 설정 1개 |
| ai | Elasticsearch (시맨틱 검색) | testcontainers-python | 설정 1개 |
| ai | Redis (시맨틱 캐시) | fakeredis or testcontainers-python | 설정 1개 |
| ai | Kafka Consumer (`note.created/updated`) | confluent-kafka mock | 2개 |

### 4.6 `05-frontend-mocking.md`

**구조:**
- `lib/services/` 하위 4개 서비스 디렉토리별 Mock 정의
- dio MockAdapter 기반 HTTP interceptor 패턴
- 각 API 엔드포인트별 mock response factory

**커버리지:**

| 서비스 | 주요 API 그룹 | mock response 수 |
|--------|--------------|-----------------|
| platform | auth (signup/login/refresh/logout), billing (plans/checkout) | 12개 |
| engagement | community (groups/members/share), gamification (xp/badges/leaderboard) | 15개 |
| knowledge | notes (CRUD/search), graph (visualization data) | 10개 |
| learning | cards (CRUD/review), ai (generate/search/qa) | 12개 |

**포함 항목:**
- Dart Mockito 기반 Repository mock 클래스
- dio MockInterceptor 설정
- 테스트용 fake data factory (Freezed model generators)
- Golden test용 고정 데이터셋

### 4.7 `06-kafka-event-mocking.md`

**전체 18개 토픽 fixture:**

| # | 토픽 | Producer | Consumer(s) | Avro fixture |
|---|------|----------|-------------|-------------|
| 1 | `note.created` | knowledge/note | learning-ai, knowledge/note(ES) | 전문 |
| 2 | `note.updated` | knowledge/note | learning-ai, knowledge/note(ES) | 전문 |
| 3 | `note.deleted` | knowledge/note | knowledge/note(ES) | 전문 |
| 4 | `card.reviewed` | learning-card | engagement/gamification | 전문 |
| 5 | `user.registered` | platform/auth | platform/audit | 전문 |
| 6 | `billing.subscription.changed` | platform/billing | platform/audit | 전문 |
| 7 | `audit.event` | (cross-service) | platform/audit | 전문 |
| 8 | `community.deck.shared` | engagement/community | engagement/gamification, platform/notification | 전문 |
| 9 | `community.note.shared` | engagement/community | engagement/gamification, platform/notification | 전문 |
| 10 | `community.group.created` | engagement/community | engagement/gamification, platform/notification | 전문 |
| 11 | `community.group.joined` | engagement/community | engagement/gamification, platform/notification | 전문 |
| 12 | `community.report.created` | engagement/community | (admin) | 전문 |
| 13 | `gamification.xp.earned` | engagement/gamification | platform/notification | 전문 |
| 14 | `gamification.badge.earned` | engagement/gamification | platform/notification | 전문 |
| 15 | `gamification.level.up` | engagement/gamification | platform/notification | 전문 |
| 16 | `notification.send` | engagement/gamification | platform/notification | 전문 |
| 17 | `card.review.due` | learning-card (batch) | platform/notification | 전문 |
| 18 | `graph.notes.linked` | knowledge/graph | (없음/미래) | 전문 |

**포함 항목:**
- CloudEvents 래퍼 포맷 기본 템플릿
- 각 토픽별 Avro 스키마 참조 (→ synapse-shared 레포)
- EmbeddedKafka 테스트 설정 (Spring)
- confluent-kafka-python mock 설정
- Consumer 테스트 헬퍼 유틸

### 4.8 `07-external-api-mocking.md`

| 외부 API | 목킹 시나리오 | WireMock 매핑 수 |
|----------|-------------|-----------------|
| Google OAuth | authorize, token exchange, userinfo, error | 4개 |
| GitHub OAuth | authorize, token exchange, userinfo, error | 4개 |
| Apple OAuth | authorize, token exchange, id_token decode, error | 4개 |
| Microsoft OAuth | authorize, token exchange, userinfo, error | 4개 |
| Stripe Checkout | create session, webhook (success/failure/subscription change), customer portal, invoice list | 6개 |
| FCM | send notification (success/failure), batch send | 3개 |
| AWS SES | send email (success/failure), bounce notification | 3개 |
| OpenAI | embeddings (success/rate-limit/error), chat completion | 4개 |
| Anthropic Claude | messages (success/rate-limit/error) | 3개 |

**포함 항목:**
- 각 API별 WireMock JSON 매핑 파일 전문
- 응답 fixture (success + error variants)
- Webhook 시뮬레이션 설정 (Stripe webhook signing)
- Rate limit / retry 시나리오

---

## 5. 공통 fixture 규약

### 시드 ID 체계
```
tenant:  tenant-00000000-0000-0000-0000-000000000001
user:    user-00000000-0000-0000-0000-00000000000{1-9}
note:    note-00000000-0000-0000-0000-00000000000{1-9}
deck:    deck-00000000-0000-0000-0000-00000000000{1-9}
card:    card-00000000-0000-0000-0000-00000000000{1-9}
group:   group-00000000-0000-0000-0000-00000000000{1-9}
```

### 시간 고정
- 기준 시각: `2026-01-15T10:00:00Z`
- due_date 테스트: `2026-01-15` (오늘) / `2026-01-16` (내일) / `2026-01-14` (어제)

### 네이밍 컨벤션
- WireMock 매핑: `{service}_{module}_{operation}_{scenario}_mapping.json`
- 응답 fixture: `{service}_{module}_{operation}_{scenario}_response.json`
- Kafka fixture: `{topic_name}_{scenario}.avro.json`
- Dart mock: `mock_{service}_{module}_responses.dart`

---

## 6. 예상 산출물 규모

| 문서 | 예상 분량 |
|------|----------|
| 00-mocking-strategy.md | ~3,000자 |
| 01-platform-svc-mocking.md | ~15,000자 |
| 02-engagement-svc-mocking.md | ~10,000자 |
| 03-knowledge-svc-mocking.md | ~10,000자 |
| 04-learning-svc-mocking.md | ~12,000자 |
| 05-frontend-mocking.md | ~10,000자 |
| 06-kafka-event-mocking.md | ~12,000자 |
| 07-external-api-mocking.md | ~15,000자 |
| **합계** | **~87,000자 (8개 파일)** |

---

## 7. 구현 순서

1. `00-mocking-strategy.md` (공통 기반)
2. `06-kafka-event-mocking.md` (다른 문서에서 참조)
3. `07-external-api-mocking.md` (platform에서 참조)
4. `01-platform-svc-mocking.md`
5. `02-engagement-svc-mocking.md`
6. `03-knowledge-svc-mocking.md`
7. `04-learning-svc-mocking.md`
8. `05-frontend-mocking.md`
