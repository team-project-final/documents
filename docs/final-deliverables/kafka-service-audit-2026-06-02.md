# SYNAPSE Kafka 서비스 감사 — 진행 상태 · 설정 · CI

> **작성일**: 2026-06-02 · **작성자**: Claude (감사) · **상태**: 1차 감사
> **방법**: 각 서비스 레포 fetch+ff(모든 브랜치) → 라이브 브랜치 기준 `git grep`/`git show` 비파괴 조사 → `synapse-shared` 표준 대비 간극 분석
> **기준 문서**: `synapse-shared/docs/guides/EVENT_CONTRACT_STANDARD.md`, `EVENT_FLOW_MATRIX.md`, canonical Avro: `synapse-shared/src/main/avro/`

## 1. 범위 & 라이브 브랜치

| 서비스 | 라이브(통합) 브랜치 | 비고 |
|---|---|---|
| synapse-engagement-svc | `dev` | 워킹트리는 `chore/standardize-application-yml`(머지 후 원격 삭제됨) |
| synapse-knowledge-svc | `dev` | 추가로 `feature/KNOW-kafka-avro` 진행 중(Outbox, dev 미반영) |
| synapse-learning-svc | `dev` | 멀티모듈: `learning-card`(Java) + `learning-ai`(Python) |
| synapse-platform-svc | **`main`** | ⚠️ **원격 `dev` 삭제됨** — 타 서비스(dev)와 통합 브랜치 전략 불일치 |

> gateway는 사용자 요청에 따라 제외. shared/svc-template은 기준 비교용으로만 참조.

### Pull 결과 요약
- 4개 서비스 fetch+ff 완료. `dev`/`main` 최신화.
- learning-svc `dev`: 대규모 Kafka 작업 반영(learning-ai producer/consumer, learning-card KafkaConfig·퍼블리셔, Avro `learning/` 패키지 재구성).
- knowledge-svc: 원격 새 브랜치 `feature/KNOW-kafka-avro` 등장.
- platform-svc: 원격 `dev` 삭제, `main` 진전.
- 각 서비스의 `feat/*`·`chore/*` 다수 브랜치는 PR 머지 후 원격 삭제로 FF 불가 → 로컬 유지(미변경).

## 2. Kafka 도입 상태 — 설정 매트릭스

범례: ✅ 충족 · ⚠️ 부분/편차 · ❌ 없음 · N/A 해당없음

| 차원 | engagement (dev) | knowledge (dev) | learning (dev) | platform (main) |
|---|---|---|---|---|
| spring-kafka | ✅ | ✅ | ✅ (card) / aiokafka·confluent-kafka (ai) | ✅ |
| avro / kafka-avro-serializer | ⚠️ 1.11.3 / 7.5.0 | ⚠️ 1.11.3 / 7.5.0 | ✅ 1.12.0 / 7.7.0 | ✅ 1.12.0 / 7.7.0 |
| Avro 플러그인 1.9.1 | ✅ | ✅ | ✅ | ✅ |
| bootstrap-servers env | ⚠️ yml 미지정(코드 기본값) | ✅ `KAFKA_BOOTSTRAP_SERVERS` | ✅ `KAFKA_BOOTSTRAP_SERVERS` / prod `SPRING_KAFKA_*`⚠️ | ✅ `KAFKA_BOOTSTRAP_SERVERS` |
| schema.registry.url (기본 8086) | ✅ | ✅ | ✅ | ✅ |
| Producer (Avro, acks=all) | ✅ (feature-flag) | ✅ | ✅ | ✅ |
| Consumer (Avro deserializer) | ❌ **없음** | ⚠️ JSON(검색동기화 내부) | ✅ (ai: Avro) | ✅ |
| Consumer group-id 표준 `{svc}-svc-group` | N/A | ⚠️ `knowledge-search-indexer` | ✅ `learning-*-svc-group` | ✅ `platform-svc-group` |
| 멱등성(eventId 처리) | ❌ store 없음 | ✅ Redis 7일 TTL | ✅ (ai DLQ+dedup) | ✅ (Outbox) |
| **Outbox 패턴** | ❌ | ⚠️ feature 브랜치만 | ❌ (after-commit 직발행) | ✅ **완비** |
| DLQ / 에러핸들러 | ❌ | ✅ (검색: backoff+Slack) | ✅ (ai DLQ) | ✅ **DLT+backoff(최상)** |
| .avsc 벤더링 (ns `com.synapse.*`) | ✅ engagement | ✅ knowledge | ✅ learning | ✅ platform (+traceparent) |

### 발행/소비 토픽 vs 표준 카탈로그(EVENT_FLOW_MATRIX)

| 서비스 | 발행(표준) | 발행(실제) | 소비(표준) | 소비(실제) |
|---|---|---|---|---|
| engagement | — | level-up-v1, badge-earned-v1 *(추가발행)* | user-registered-v1, review-completed-v1 | ❌ **없음** |
| knowledge | note-created-v1, note-updated-v1 | ✅ 둘 다 (+내부 search-sync) | — | (내부 search-sync만) |
| learning-card | review-completed-v1, review-due-v1 | ✅ 둘 다 | (cards-generated→HTTP) | N/A(HTTP) |
| learning-ai | notification-send-v1 | ✅ | note-created-v1 | ✅ |
| platform | user-registered-v1 | ✅ (Outbox) | notification-send-v1 (+자체 audit) | ✅ |

> ⚠️ engagement는 표준상 `user-registered`(Chain A 프로필 생성)·`review-completed`(Chain C XP 적립)의 **소비자**지만 producer만 구현 → **Chain A·C 소비측 미구현(P0 후보)**. 단, level-up/badge-earned producer는 표준 카탈로그엔 engagement=Producer로 명시되어 있어 정합.

## 3. Kafka CI 설정 매트릭스

| 차원 | engagement | knowledge | learning | platform |
|---|---|---|---|---|
| 워크플로 파일 | `ci-java.yml` | `ci-java.yml` | ⚠️ `ci.yml` | `ci-java.yml` |
| docker-compose.ci.yml Kafka | ✅ ZK+Kafka | ✅ Kafka(KRaft) | ❌ (pg+redis만) | ❌ (pg+redis만) |
| **Schema Registry in CI** | ✅ **유일** (cp 7.7.0) | ❌ | ❌ | ❌ |
| Kafka broker 이미지 | confluentinc/cp-kafka:7.7.0 | apache/kafka:3.9.0 | (testcontainers) cp-kafka:7.6.0 | (EmbeddedKafka) |
| 테스트 방식 | EmbeddedKafka + dev-smoke(compose) | EmbeddedKafka + compose-smoke | EmbeddedKafka(card) + testcontainers(ai) | EmbeddedKafka |
| CI에서 실제 registry 계약검증 | ⚠️ smoke만 | ❌ mock | ❌ mock | ❌ mock |

## 4. 일관성 / 간극 분석

### A. 버전 드리프트 (Avro/serializer)
- **learning·platform = 1.12.0 / 7.7.0**(표준 문서 §3 준수), **engagement·knowledge = 1.11.3 / 7.5.0**.
- 근본 원인: **`synapse-shared` build 자체가 1.11.3 / 7.5.0** — 표준 문서가 prescribe한 1.12.0/7.7.0과 shared 실제 build가 불일치. engagement·knowledge는 shared와, learning·platform은 문서와 정렬됨.
- 영향: wire(Avro) 호환은 유지되나 serializer/registry 클라이언트 버전 혼재. **shared build와 표준 문서 중 하나로 단일화 필요.**

### B. CI Kafka 하니스 비표준화 (가장 큰 인프라 간극)
- 4개 서비스가 **서로 다른 4가지 방식**으로 Kafka를 테스트: cp-kafka 7.7.0+ZK+registry / apache-kafka 3.9.0(KRaft, registry無) / testcontainers cp 7.6.0 / EmbeddedKafka.
- **Schema Registry를 CI에서 띄우는 건 engagement뿐** → 나머지는 `mock://` 레지스트리. 즉 **CI에서 실제 BACKWARD 계약 검증이 일어나지 않음**(표준 핵심 요구사항인데).
- 권장: 공통 `docker-compose.ci.yml`(Kafka+Schema-Registry) 표준 템플릿을 shared/svc-template에 두고 4개 서비스가 동일 차용.

#### B-1. Docker Hub rate-limit로 인한 CI 불안정 (2026-06-02 실관측)
- 증상: GitHub Actions 공유 러너에서 compose 이미지 pull 중 네트워크 타임아웃. elasticsearch(717MB, **`docker.elastic.co`** — rate-limit 비대상)가 느리게 받아지는 동안 **Docker Hub 익명 pull 제한(100 pulls/6h, 공유 IP)** 에 걸린 다른 이미지들이 deadline 초과.
- Docker Hub 노출도: **engagement(postgres + Confluent cp-zookeeper/cp-kafka/cp-schema-registry = 4개 전부)**, **knowledge(pgvector·redis·apache-kafka 3개)** 가 가장 큼. learning·platform은 postgres·redis 2개로 경량.
- 단기: CI 재실행(rate-limit 리셋/일시 오류 회복).
- 장기(근본): compose up 스텝 앞에 `docker/login-action@v3` 추가(인증 시 pull 제한 대폭 상향). **compose를 띄우는 4개 서비스 전부** 적용 필요(engagement/knowledge/platform `ci-java.yml`, learning `ci.yml`). secret은 **org-level** `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` 권장.
- ⚠️ 팀 전체 CI 설정 변경 → **팀장 공유/승인 필요**.

### C. Outbox 패턴 채택 불일치
- platform=완비(main), knowledge=feature 브랜치(claim-lease, dev 미반영), engagement·learning=미적용(직발행/after-commit).
- 메모리 표준 방향([[data-sync-outbox-cqrs]], [[spring-modulith-outbox-coexistence]])은 Outbox. **knowledge feature 브랜치 dev 머지 + engagement/learning 정렬 검토 필요.**

### D. 컨슈머 group-id 명명
- 표준 `{서비스명}-svc-group`. platform/learning ✅. knowledge 검색컨슈머 `knowledge-search-indexer` ⚠️(내부용이라 허용 가능하나 명명 규칙 외).

### E. CI 워크플로 파일명
- learning만 `ci.yml`, 나머지 `ci-java.yml`. 멀티모듈(Java+Python) 사정상 분기했을 수 있으나 표준화 또는 명시적 사유 기록 권장.

### F. 통합 브랜치 전략
- platform은 `main`(원격 `dev` 삭제), 나머지는 `dev`. **CI/배포·E2E 기준 브랜치 불일치** → 팀 차원 확인 필요.

### G. 정합(양호) 사항
- 토픽 네이밍 `{service}.{domain}.{event}-vN`, 네임스페이스 `com.synapse.*`, 공통 메타(eventId/tenantId/occurredAt), key=tenantId, schema-registry 기본 포트 8086, .avsc 벤더링+플러그인 1.9.1 — **4개 서비스 모두 표준 정렬**.
- platform UserRegistered/NotificationSend는 선택 메타 `traceparent`까지 반영(가장 앞섬).

## 5. 권장 조치 (우선순위)

| 순위 | 항목 | 대상 | 근거 |
|---|---|---|---|
| P0 | engagement `user-registered`·`review-completed` **컨슈머 구현** | engagement | Chain A(프로필)·C(XP) 소비측 차단 |
| P0 | CI Schema Registry 표준 하니스 도입(공통 compose) | 전 서비스(shared 템플릿) | CI에서 BACKWARD 계약 미검증 |
| P1 | avro/serializer 버전 단일화(1.12.0/7.7.0 권장) + shared build 동기 | engagement, knowledge, shared | 버전 드리프트 |
| P1 | knowledge `feature/KNOW-kafka-avro`(Outbox) dev 머지 | knowledge | Outbox 표준 정렬 |
| P1 | CI에 `docker/login-action` 추가(org secret) | compose 띄우는 4서비스 | Docker Hub rate-limit CI 불안정(§B-1), 팀장 승인 필요 |
| P2 | Outbox 정렬 검토 | engagement, learning-card | 신뢰성 일관성 |
| P2 | platform 통합 브랜치(main vs dev) 정리 | platform/팀 | 브랜치 전략 불일치 |
| P3 | 컨슈머 group-id·CI 워크플로명 표준화 | knowledge, learning | 명명 일관성 |

## 6. 미해결 / 확인 필요
- engagement 소비측 미구현이 "W-단계 미도래"인지 "누락"인지 owner 확인(EVENT_FLOW_MATRIX는 소비자로 명시).
- platform `dev` 삭제가 의도된 전환인지 확인.
- 표준 문서(1.12.0/7.7.0) vs shared build(1.11.3/7.5.0) 중 정본 결정.
