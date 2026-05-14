# 목킹 인터페이스 정의서 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synapse 전 서비스/모듈의 종합 목킹 전략 + 인터페이스 정의 + 전체 fixture를 8개 파일로 작성하여 `documents/docs/mocking/`에 저장

**Architecture:** 서비스별 Bottom-Up 분리 구조. 공통 전략(00) → Kafka/외부 API(06, 07) → 서비스별(01-04) → 프론트엔드(05) 순서로 작성. 각 문서는 독립적으로 참조 가능하되, 06/07의 fixture를 서비스별 문서에서 참조.

**Tech Stack:** WireMock 3.x, EmbeddedKafka, Testcontainers, Spring Cloud Contract, pytest/httpx/respx, Dart Mockito + dio mock adapter

---

## Task 1: 디렉토리 생성 + `00-mocking-strategy.md` 작성

**Files:**
- Create: `documents/docs/mocking/00-mocking-strategy.md`

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p documents/docs/mocking
```

- [ ] **Step 2: 전략 총론 문서 작성**

`00-mocking-strategy.md` 내용:

1. 목킹 원칙 — 테스트 피라미드 내 위치도, 격리 기준 (unit=mock, integration=testcontainers, e2e=실제)
2. 도구 스택 매트릭스 (7개 도구 × 용도 × 설정 방법)
3. 공통 규약:
   - fixture 네이밍: `{service}_{module}_{operation}_{scenario}.json`
   - 시드 ID 체계: tenant/user/note/deck/card/group UUID 템플릿
   - 시간 고정: `2026-01-15T10:00:00Z`
   - 응답 래퍼: `{"success": true, "data": {...}, "meta": {...}}`
4. 환경별 적용 가이드:
   - 로컬: docker-compose mock 프로필 + WireMock standalone
   - CI: Testcontainers + EmbeddedKafka (GitHub Actions 설정)
   - 통합 테스트: Spring Cloud Contract stub runner
5. Gradle/pyproject 의존성 snippet

- [ ] **Step 3: 커밋**

```bash
git add documents/docs/mocking/00-mocking-strategy.md
git commit -m "docs: add mocking strategy overview (00)"
```

---

## Task 2: `06-kafka-event-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/06-kafka-event-mocking.md`

- [ ] **Step 1: Kafka 이벤트 목킹 문서 작성**

포함 내용:

1. CloudEvents 기본 래퍼 템플릿 (specversion, id, source, type, subject, time, tenantid, datacontenttype, data)
2. 전체 18개 토픽 fixture (각 토픽별):
   - 토픽명, 발행 서비스, 소비 서비스
   - Avro 스키마 참조 경로 (`synapse-shared/src/main/avro/`)
   - 완전한 JSON fixture (success case)
   - edge case fixture (빈 필드, 최대값 등)
3. 토픽별 fixture 목록:
   - `note.created` — noteId, userId, title, contentLength
   - `note.updated` — noteId, userId, title, contentLength, version
   - `note.deleted` — noteId, userId
   - `card.reviewed` — userId, cardId, deckId, rating, timeSpentMs, newInterval, newEF
   - `user.registered` — userId, email, displayName, tenantId
   - `billing.subscription.changed` — tenantId, oldPlan, newPlan, effectiveDate
   - `audit.event` — action, userId, resourceType, resourceId, ipAddress
   - `community.deck.shared` — deckId, sharedDeckId, sharedByUserId, shareType, targetGroupId, deckTitle
   - `community.note.shared` — noteId, sharedNoteId, sharedByUserId, shareType, targetGroupId, noteTitle
   - `community.group.created` — groupId, groupName, ownerUserId
   - `community.group.joined` — groupId, userId, role
   - `community.report.created` — reportId, reporterUserId, targetType, targetId, reason
   - `gamification.xp.earned` — userId, eventType, xpAmount, sourceId, sourceType, newTotalXp, newLevel
   - `gamification.badge.earned` — userId, badgeCode, badgeName, xpReward
   - `gamification.level.up` — userId, oldLevel, newLevel, title
   - `notification.send` — userId, templateCode, category, channel, dataJson
   - `card.review.due` — userId, dueCount, topDeckName
   - `graph.notes.linked` — userId, noteId, linkedNoteId, totalLinks
4. Spring EmbeddedKafka 설정 템플릿 (`@EmbeddedKafka` + `application-test.yml`)
5. Python confluent-kafka mock 설정 (conftest.py 패턴)
6. Consumer 테스트 헬퍼 유틸:
   - `KafkaTestHelper.java` — 이벤트 발행 + 소비 대기 + 검증
   - `kafka_test_helper.py` — Python 등가

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/06-kafka-event-mocking.md
git commit -m "docs: add kafka event mocking specification (06)"
```

---

## Task 3: `07-external-api-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/07-external-api-mocking.md`

- [ ] **Step 1: 외부 API 목킹 문서 작성**

포함 내용:

1. WireMock 공통 설정 (standalone jar 실행, Spring Boot 연동, port 매핑)
2. **OAuth Providers** (4개 × 4 시나리오 = 16 매핑):
   - Google: token exchange POST, userinfo GET, error 401, error 403
   - GitHub: token exchange POST, userinfo GET, error 401, error 403
   - Apple: token exchange POST, id_token validation, error 401, error 403
   - Microsoft: token exchange POST, userinfo GET, error 401, error 403
   - 각각 WireMock JSON 매핑 + 응답 fixture 전문
3. **Stripe API** (6 매핑):
   - POST /v1/checkout/sessions (create) → success response
   - POST /v1/billing_portal/sessions → success response
   - GET /v1/invoices → list response
   - Webhook: checkout.session.completed
   - Webhook: invoice.payment_failed
   - Webhook: customer.subscription.updated
   - Webhook signature 검증 설정 (signing secret mock)
4. **FCM** (3 매핑):
   - POST /v1/projects/{id}/messages:send → success
   - POST batch send → partial success
   - Error 401 (invalid token)
5. **AWS SES** (3 매핑):
   - POST SendEmail → success (MessageId)
   - POST SendEmail → bounce
   - SNS Bounce Notification
6. **OpenAI** (4 매핑):
   - POST /v1/embeddings → success (1536-dim vector)
   - POST /v1/chat/completions → success
   - 429 Rate Limit response
   - 500 Server Error
7. **Anthropic Claude** (3 매핑):
   - POST /v1/messages → success
   - 429 Rate Limit (with retry-after)
   - 529 Overloaded
8. Spring `application-test.yml` 설정 (base URL override to WireMock port)
9. Python respx mock 설정 패턴

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/07-external-api-mocking.md
git commit -m "docs: add external API mocking specification (07)"
```

---

## Task 4: `01-platform-svc-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/01-platform-svc-mocking.md`

- [ ] **Step 1: Platform 서비스 목킹 문서 작성**

포함 내용:

1. 서비스 의존성 맵 (Mermaid 다이어그램)
2. **auth 모듈**:
   - OAuth Provider mock (→ 07 참조 + 서비스 특화 설정)
   - Redis Testcontainers 설정 (refresh token 저장/조회/삭제)
   - JWT 생성 테스트 유틸 (`JwtTestFactory.java`)
   - MFA TOTP mock (고정 시간 기반 코드 생성)
   - 테스트 시나리오: signup, login, oauth callback, refresh, logout, mfa setup/verify
3. **audit 모듈**:
   - Kafka Consumer 테스트 (7개 토픽 소비 → audit_logs INSERT 검증)
   - PostgreSQL Testcontainers (audit_logs, processed_events 테이블)
   - Idempotency 검증 fixture (동일 이벤트 중복 소비)
4. **billing 모듈**:
   - Stripe API mock (→ 07 참조 + billing 특화 시나리오)
   - Webhook 처리 테스트 (signature 검증 포함)
   - usage_counters 테스트 데이터 (Free/Pro/Team 플랜별 제한)
   - PostgreSQL fixture (subscriptions, usage_counters)
5. **notification 모듈**:
   - Kafka Consumer 테스트 (8개 토픽 소비)
   - FCM/APNs mock (→ 07 참조)
   - AWS SES mock (→ 07 참조)
   - notification_preferences fixture
   - device_tokens fixture
   - Redis mock (미읽음 카운트)
   - quiet_hours 시나리오 (알림 억제 테스트)
6. Testcontainers 공통 설정 (`AbstractIntegrationTest.java` 베이스 클래스)
7. `application-test.yml` 전체 설정

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/01-platform-svc-mocking.md
git commit -m "docs: add platform-svc mocking specification (01)"
```

---

## Task 5: `02-engagement-svc-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/02-engagement-svc-mocking.md`

- [ ] **Step 1: Engagement 서비스 목킹 문서 작성**

포함 내용:

1. 서비스 의존성 맵 (Mermaid 다이어그램)
2. **community 모듈**:
   - Internal API mock: `POST /internal/decks/copy` WireMock 매핑 (success + failure)
   - Kafka Producer 테스트 (5개 토픽: deck.shared, note.shared, group.created, group.joined, report.created)
   - PostgreSQL fixture (study_groups, group_members, shared_decks, shared_notes, reports)
   - 시나리오: 그룹 생성/가입/초대, 덱 공유/복사, 신고 접수
3. **gamification 모듈**:
   - Kafka Consumer 테스트 (card.reviewed, note.created, community.* 5개 = 7개 토픽)
   - Kafka Producer 테스트 (xp.earned, badge.earned, level.up, notification.send = 4개)
   - Redis Testcontainers (리더보드 Sorted Set)
   - PostgreSQL fixture (xp_events, level_definitions, badge_definitions, user_badges, leaderboards)
   - SM-2 기반 XP 시나리오 데이터
   - 스트릭 리셋 Cron Job 테스트 fixture
4. Spring Cloud Contract:
   - Consumer contract for `/internal/decks/copy` (learning-svc가 Provider)
5. `application-test.yml` 전체 설정

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/02-engagement-svc-mocking.md
git commit -m "docs: add engagement-svc mocking specification (02)"
```

---

## Task 6: `03-knowledge-svc-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/03-knowledge-svc-mocking.md`

- [ ] **Step 1: Knowledge 서비스 목킹 문서 작성**

포함 내용:

1. 서비스 의존성 맵 (Mermaid 다이어그램)
2. **note 모듈**:
   - Elasticsearch Testcontainers 설정 (인덱스 매핑 + nori analyzer)
   - AWS S3 mock (Presigned URL 생성 — WireMock 또는 LocalStack)
   - Kafka Producer 테스트 (note.created, note.updated, note.deleted)
   - PostgreSQL fixture (notes, note_versions, note_links, note_tags)
   - 위키링크 파싱 테스트 데이터 (`[[Target Note]]` 변환)
   - 검색 시나리오: keyword search, tag filter, sort
3. **graph 모듈**:
   - PostgreSQL fixture (nodes + edges 그래프 데이터)
   - Kafka Producer 테스트 (`graph.notes.linked`)
   - D3 시각화 데이터 응답 fixture (nodes, edges, pageRank)
   - N-hop 이웃 조회 테스트 데이터
4. **chunking 모듈**:
   - learning-ai 임베딩 API mock (WireMock — `POST /internal/embeddings`)
   - pgvector Testcontainers 설정 (vector extension 활성화)
   - 비동기 청크 분할 테스트 (긴 문서 → 청크 배열)
   - 벡터 저장/검색 fixture (1536-dim 벡터 샘플)
5. Kafka Consumer 테스트 (`user.deleted` → 노트 정리)
6. `application-test.yml` 전체 설정

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/03-knowledge-svc-mocking.md
git commit -m "docs: add knowledge-svc mocking specification (03)"
```

---

## Task 7: `04-learning-svc-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/04-learning-svc-mocking.md`

- [ ] **Step 1: Learning 서비스 목킹 문서 작성**

포함 내용:

**Part A — learning-card (Java/Spring Boot):**

1. 서비스 의존성 맵
2. **card 모듈**:
   - PostgreSQL fixture (decks, cards, card_schedules)
   - 카드 CRUD 테스트 데이터 (basic, cloze 타입)
   - batch 생성 fixture
3. **srs 모듈**:
   - SM-2 알고리즘 검증 fixture (rating별 expected interval/EF)
   - review_sessions fixture (시작/진행/완료)
   - Redis Testcontainers (세션 캐시)
   - Kafka Producer 테스트 (`card.reviewed`, `card.review.due`)
   - due_date 조회 테스트 (오늘/과거/미래)
4. Spring Cloud Contract:
   - Provider stub for `/internal/decks/copy` (engagement-svc가 Consumer)
5. `application-test.yml`

**Part B — learning-ai (Python/FastAPI):**

1. 서비스 의존성 맵
2. **ai 모듈**:
   - OpenAI Embeddings mock (respx — 1536-dim vector response)
   - Anthropic Claude mock (respx — card generation response)
   - PostgreSQL + pgvector fixture (chunks 테이블 + 벡터 데이터)
   - Elasticsearch mock (BM25 검색 결과)
   - Redis mock (시맨틱 캐시 — fakeredis)
   - Kafka Consumer mock (`note.created`, `note.updated`)
3. 테스트 시나리오:
   - 카드 자동 생성 (note text → LLM → cards)
   - 시맨틱 검색 (query → embedding → pgvector cosine)
   - 하이브리드 검색 (semantic + BM25 → RRF merge)
   - RAG Q&A (question → chunk retrieval → LLM answer)
   - 시맨틱 캐시 히트 (cosine > 0.95)
4. `conftest.py` + `pytest.ini` 설정
5. Docker Compose 테스트 프로필

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/04-learning-svc-mocking.md
git commit -m "docs: add learning-svc mocking specification (04)"
```

---

## Task 8: `05-frontend-mocking.md` 작성

**Files:**
- Create: `documents/docs/mocking/05-frontend-mocking.md`

- [ ] **Step 1: Frontend 목킹 문서 작성**

포함 내용:

1. 아키텍처 개요 (Flutter Repository 패턴 → mock layer 위치)
2. **dio MockInterceptor 설정**:
   - `MockHttpClientAdapter` 구현 패턴
   - 환경별 전환 (dev=mock, staging=real)
   - 응답 지연 시뮬레이션 (네트워크 latency mock)
3. **platform 서비스 mock responses** (12개):
   - auth: signup(201), login(200), refresh(200), logout(204), oauth redirect(200), mfa setup(200)
   - billing: plans list(200), checkout url(200), subscription(200), portal url(200)
   - tenant: context(200), usage(200)
4. **engagement 서비스 mock responses** (15개):
   - community: groups list, group detail, group create(201), group join(200), group members, shared decks list, share deck(201), share note(201), report create(201)
   - gamification: xp summary, badges list, my badges, leaderboard, level info, streak
5. **knowledge 서비스 mock responses** (10개):
   - notes: list, detail, create(201), update(200), delete(204), search, backlinks, versions
   - graph: data(nodes+edges), neighbors
6. **learning 서비스 mock responses** (12개):
   - cards: deck list, deck create(201), cards list, card create(201), batch create(201)
   - srs: review queue, session start(201), submit rating(200), session complete(200)
   - ai: generate cards(200), semantic search(200), qa stream(200)
7. **에러 응답 mock** (공통):
   - 400 validation error, 401 unauthorized, 403 forbidden, 404 not found, 429 rate limit, 500 server error
8. **Dart Mockito 패턴**:
   - Repository mock 클래스 생성 패턴
   - Provider (Riverpod) mock 설정
   - Widget 테스트에서 mock 주입
9. **Golden test 데이터셋**:
   - 고정 시드 데이터 (user profile, sample notes, sample decks)
   - Freezed model factory helpers

- [ ] **Step 2: 커밋**

```bash
git add documents/docs/mocking/05-frontend-mocking.md
git commit -m "docs: add frontend mocking specification (05)"
```

---

## Task 9: 최종 검증 + 인덱스 커밋

- [ ] **Step 1: 전체 파일 존재 확인**

```bash
ls -la documents/docs/mocking/
# 8개 파일 확인: 00 ~ 07
```

- [ ] **Step 2: 문서 간 상호 참조 링크 검증**

서비스별 문서(01-05)에서 06, 07 참조 링크가 올바른지 확인

- [ ] **Step 3: 전체 커밋**

```bash
git add documents/docs/mocking/
git commit -m "docs: complete mocking interface specification (8 files)"
```
