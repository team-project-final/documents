# 18 기술 스택 정의서 검증 — S4 이벤트/동기화

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S3 후 v2.3-S3 상태, 베이스 SHA `ed5ed04`)
> 위키 패치 커밋: [documents.wiki@0a7e5a2](https://github.com/team-project-final/documents.wiki/commit/0a7e5a2d2bf4d5e9ebe03ca191df12ede62349a5)
> 보고서 PR: (Task C1에서 기입)
> 메모리 정합: `data-sync-outbox-cqrs` · `spring-modulith-outbox-coexistence`
> 플랜: `documents/docs/superpowers/plans/2026-05-28-stack-review-S4-event-sync.md`

---

## 0. 요약 (Summary)

### 0.1 검증 대상

마스터 스펙 §2 매핑 기준 S4 카테고리 7개 항목(5 명시 + 2 신설 검토):
- §3.2 Resilience4j
- §3.3 Redis Token Bucket (Rate Limiting)
- §5.4 Apache Kafka 3.x
- §5.5 Confluent Schema Registry 7.x
- §5.6 Apache Avro 1.11.x
- (신설 검토 1) ShedLock 7.7.x 독립 절
- (신설 검토 2) Outbox / Polling Relay 운영 패턴 절

### 0.2 클래스·심각도 통계

| 클래스 | 건수 | 비고 |
|--------|------|------|
| E1 (사실 오류) | **3** | F01·F03·F04 — Gateway 경로·단위·미적용 |
| E2 (설정/코드 오류) | **4** | F02·F06·F07·F08 — Aspect Order·in-flight·Producer CB·auto.register |
| D (표류/불일치) | **1** | F10 — Avro 1.11.3 vs 1.12.0 |
| R (보강 권장) | **2** | F12·F13 — ShedLock §4.1.9 / Outbox §5.4.1 신설 |
| OK (검증 통과) | **4** | F05·F09·F11·F14 |
| **합계** | **14** | |

| 심각도 | 건수 | finding |
|--------|------|---------|
| P0 | **0** | — |
| P1 | **7** | F01·F03·F04·F08·F10·F12·F13 |
| P2 | **7** | F02·F05·F06·F07·F09·F11·F14 |

### 0.3 신설 절 결정

| 후보 | 결정 | 위치 | 근거 요약 |
|------|------|------|----------|
| ShedLock 7.7.x 독립 절 | **RECOMMEND** | §4.1.9 (Spring 생태계 내부) | 어노테이션·LockProvider·DDL·@Scheduled 의존이 Spring Boot 서비스 내부에서 동작. §3.x(Gateway 인접)보다 §4.1.x가 자연스러움 |
| Outbox / Polling Relay 운영 패턴 | **RECOMMEND** | §5.4.1 (§5.4 끝 직후) | §5.4 본문은 Kafka 기술 자체 · 폴링 주기·batch·SKIP LOCKED·DLQ·해시샤딩 같은 운영 임계값을 한 곳에 모아 진실의 단일 출처 형성 |

### 0.4 메모리 정합 결과

| 메모리 | 결과 | 상세 |
|--------|------|------|
| `data-sync-outbox-cqrs` | **CONSISTENT** (코드 미구현은 별개) | §5.4 본문/예제(파티션 키 `{tenant_id}:{aggregate_id}`·Avro·OutboxRecorder·`processed_events` 멱등)가 메모리 표준과 일치. 단 `outbox_event`/`user_ref`/`event_publication` 마이그레이션은 미구현(메모리 [[s3-implementation-status]] 패턴과 동일하게 목표 형태). `processed_events`는 platform-svc V26에 실재 확인 |
| `spring-modulith-outbox-coexistence` | **CONSISTENT** | `spring-modulith-events-kafka` 의존성 어느 build.gradle.kts에도 부재(L2409 주석 처리 + L2456 운영 함정 명시 정합). Modulith BOM 분포: platform/knowledge=2.0.6, engagement=2.0.5, learning-card=1.3.0 — §4.1.8(S2a)에서 이미 "즉시 2.0.x" 명시되어 정합 |

### 0.5 한 줄 결론

S4는 **사실 오류는 Gateway 영역(F01·F03·F04)에 집중**되어 있고, 이는 코드가 가상 경로(`api-gateway/...`)와 단위(분당/초당)를 어긋나게 표기한 결과로 **S5 ADR(Gateway 회로차단/RateLimit 정책)에서 본문 재작성 예정**이라 §3.2/§3.3은 "현재 미적용 + S5 위임" 메모로 정합화한다. **이벤트 핵심부(§5.4/§5.5/§5.6)는 메모리 표준과 정합**하며 운영 규칙·Aspect Order·Subject Naming·Schema Registry 운영 설정 같은 *공식 권고 누락*을 보강하고, **§4.1.9 ShedLock·§5.4.1 Outbox/Polling Relay 두 절을 신설**해 메모리에 정착한 표준을 위키의 진실의 단일 출처로 통합한다.

---

## 1. 카테고리 인벤토리 (Step 1)

| 절 번호 | 기술 | 명시 버전 | 라인 범위 | 코드 블록 수 | 1차 진단 |
|---------|------|----------|-----------|--------------|----------|
| §3.2 | Resilience4j | (BOM 위임) | L1290–L1415 (126줄) | YAML 2 + Java 1 + 표 2 | 사용 위치 표기 가상 경로 `api-gateway/...` 의심 |
| §3.3 | Redis Token Bucket | — | L1416–L1533 (118줄) | Java 2 + YAML 1 + 키 패턴 1 | "per minute" 주석 ↔ Spring Cloud Gateway 초당 단위 충돌 가능성 |
| §5.4 | Apache Kafka | 3.x | L3676–L3843 (168줄) | YAML 1 + Java 1(Outbox 예제) + 표 2 | v2.2(2026-05-28) KafkaAvroSerializer + OutboxRecorder 정합 직후 — 재검증 |
| §5.5 | Confluent Schema Registry | 7.x | L3844–L3932 (89줄) | YAML 1 + JSON Schema 1 + 표 1 | 호환성/Subject naming/auto.register 운영 표준 누락 가능성 |
| §5.6 | Apache Avro | 1.11.x | L3933–L4010 (78줄) | Avro 1 + 표 1 | 1.11.3 vs 1.12.0 분기(synapse-shared vs learning-card) 의심 |

### 1.1 사전 인벤토리 — ShedLock/Outbox 위키 분산 위치

| 항목 | 현재 위키 위치 | 부재한 형태 |
|------|----------------|-------------|
| ShedLock 7.7.x | §1.4 표 L139 · §5.1.1 카탈로그 L3066 · §12 표 L6519/L6650 | 독립 `###` 절 부재 |
| Outbox / Polling Relay 운영 | §4.1.8 Deep Dive L2414-L2457 · §5.1.1 카탈로그 L3066-L3068 · §5.4 예제 L3765-L3773 | 운영 패턴(폴링 주기·batch·DLQ·확장 트리거·모니터링 지표) 정리 절 부재 |
| `spring-modulith-events-kafka` | L2409 주석 처리 · L2456 운영 함정 명시 | 정합 — 신규 위험 없음 |

### 1.2 cross-section 인용

§10.1 요약표 / §12.4 인프라 버전 매트릭스에서 §3.2·§3.3·§5.4·§5.5·§5.6을 다중 인용. **본 세션 처리 후 v2.3 통합 정리(6세션 종료 후) 시 ShedLock 7.7.x·Avro 1.11.3 정합 반영 필요** — INDEX 별도 작업 큐로 위임.

---

## 2. skill-recommender 결과 (Step 2)

```
keywords: kafka,apache kafka,confluent,schema registry,avro,cloudevents,resilience4j,
          circuit breaker,rate limit,redis,shedlock,outbox,debezium
limit: 30
type: all
totalMatches: 189
verified/marketplace/mcp-official-registry: 0건
```

**채택 결과:** S1·S2·S3와 동일하게 **context7 + WebFetch만 사용**. S4 키워드 영역에 공식 마켓플레이스 플러그인·MCP·verified 스킬 없음.

---

## 3. 공식 문서 검증 결과 (Step 3)

각 기술별 context7 query 우선, 매핑 실패 시 WebFetch 폴백.

| 기술 | context7 query | 주요 발견 |
|------|----------------|-----------|
| Apache Kafka 3.x → 4.0 이행 | `/apache/kafka` | `enable.idempotence` 기본 true(3.0+), 4.0.0에서 `max.in.flight.requests.per.connection > 5` 시 자동 fallback 제거, `linger.ms` 기본 0→5 |
| Spring Kafka 4.x | `/spring-projects/spring-kafka` | KafkaTemplate + `DefaultErrorHandler + DLT`, Boot 4 호환 |
| Confluent Schema Registry | `/confluentinc/schema-registry` | BACKWARD/FORWARD/FULL/NONE + `_TRANSITIVE`, `auto.register.schemas` 운영=false 표준, Subject Naming 3종(TopicName/RecordName/TopicRecordName) |
| Apache Avro 1.11.x | `/apache/avro` | SpecificRecord generation, schema evolution 규칙(default 필수·rename 금지·remove 금지), CloudEvents v1.0 binary mode 매핑 |
| Resilience4j | `/resilience4j/resilience4j` | `resilience4j-spring-boot3` 2.0.1+(Spring Boot 3), Aspect Order 표준(CB priority 낮을수록 바깥) — `circuitBreakerAspectOrder=1` + `retryAspectOrder=2` |
| Spring Cloud Gateway RedisRateLimiter | `/spring-cloud/spring-cloud-gateway` | `replenishRate`/`burstCapacity`/`requestedTokens` 모두 **초당 단위** — 분당 정책은 `requestedTokens=60` 트릭 필요 |
| ShedLock 7.7.x | `/lukas-krecan/shedlock` | `shedlock-spring:7.7.0`, `@EnableSchedulerLock` + `@SchedulerLock(name, lockAtMostFor, lockAtLeastFor)`, `JdbcTemplateLockProvider.usingDbTime()` 필수, Java 21+ |
| CloudEvents Kafka binding | WebFetch `cloudevents/spec` | binary mode: value=원본 페이로드 + Kafka headers `ce_id`/`ce_type`/`ce_source`/`ce_time`/`ce_specversion` |

---

## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성 매트릭스(`synapse-*/build.gradle.kts`)

| 서비스 | spring-kafka | avro | kafka-avro-serializer | resilience4j | shedlock-spring | shedlock-provider-jdbc-template |
|--------|--------------|------|-----------------------|--------------|-----------------|------------------------------------|
| synapse-shared | (BOM) | **1.11.3** | **7.5.0** | — | — | — |
| synapse-platform-svc | (BOM 위임) | — | — | — | ❌ 부재 | ❌ 부재 |
| synapse-knowledge-svc | (BOM 위임) | — | — | — | ❌ 부재 | ❌ 부재 |
| synapse-engagement-svc | (BOM 위임) | — | — | — | ❌ 부재 | ❌ 부재 |
| synapse-learning-svc/learning-card | (BOM 위임) | **1.12.0** ⚠ | **7.7.0** | — | **7.7.0** ✅ | **7.7.0** ✅ |
| synapse-gateway | — | — | — | ❌ **부재** | — | — |

⚠ Avro 분기(1.11.3 vs 1.12.0) — ES-F10
✅ learning-card만 ShedLock 도입 — 신설 §4.1.9의 "Synapse 적용 현황" 표 근거

### 4.2 application*.yml — Kafka producer

`synapse-learning-svc/learning-card/src/main/resources/application.yml`:
- L20: `spring.kafka.bootstrap-servers: ...`
- L23-L24: `properties.schema.registry.url` 명시
- `properties.specific.avro.reader: true` (SpecificRecord 강제) ✅ 메모리 정합
- `value.serializer: io.confluent.kafka.serializers.KafkaAvroSerializer` ✅
- `enable.idempotence: true` (KafkaConfig.java L34) ✅
- **`auto.register.schemas`**: 미설정(= 기본 true) — ES-F08 (운영 false 권장)

### 4.3 Outbox/Relay 구현 실재 여부

```
Grep "OutboxRecorder|OutboxMessageFactory|PollingRelay" synapse-*/**/*.java
→ 0건 (예제/주석 외 실 코드 부재)

Grep "CREATE TABLE.*(outbox_event|user_ref|processed_events|shedlock|event_publication)"
     synapse-*/src/main/resources/db/migration/V*.sql
→ processed_events: synapse-platform-svc V26 (실재 ✅)
→ shedlock: synapse-learning-svc/learning-card V16 (실재 ✅)
→ outbox_event / user_ref / event_publication: 0건 (부재 ❌)
```

→ 메모리 [[s3-implementation-status]] 패턴 동일 — 위키 §5.4는 **목표 형태(target state)** 문서.

### 4.4 Gateway Resilience4j / RateLimit

`synapse-gateway/build.gradle.kts:L28-L33`:
```
implementation("org.springframework.cloud:spring-cloud-starter-gateway-server-webflux")
implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")
implementation("org.springframework.boot:spring-boot-starter-actuator")
testImplementation("org.springframework.boot:spring-boot-starter-test")
```
- Resilience4j 부재 ❌ → ES-F01
- `Resilience4jConfig.java` 부재 → ES-F01

`synapse-gateway/src/main/java/com/synapse/gateway/config/RoutesConfig.java:L28`:
```java
return new RedisRateLimiter(1, 60, 1);  // 1 token/sec, 60 burst, 1 req/token
```
- 단일 RateLimiter 빈, 플랜 분기 없음 — ES-F03·F04
- KeyResolver는 `RateLimiterConfig.java`에서 IP 기반(JWT plan claim 미사용)

### 4.5 events-kafka 의존성 부재 확인

```
Grep "spring-modulith-events-kafka" synapse-*/**/*
→ 18 위키 L2409(주석)·L2456(운영 함정) 외 0건
```
메모리 [[spring-modulith-outbox-coexistence]] 정합 확인 ✅

---

## 5. 발견사항 (Findings)

> 표기 규칙: subagent가 반환한 `ES-F##`를 본 보고서에서 그대로 사용.

### S4-F01 / ES-F01

```yaml
finding_id: S4-F01
section: "§3.2 Resilience4j (L1290-L1415)"
class: E1
severity: P1
title: "Resilience4j 의존성·코드 파일이 synapse-gateway에 부재 — 위키 §3.2가 가상 경로 'api-gateway/...'를 가리킴"
evidence_official: |
  resilience4j-spring-boot3 모듈은 Spring Boot 3 이후만 동작.
  context7 /resilience4j/resilience4j: "Version 2.0.1 introduced support for Spring Boot 3
  with new modules resilience4j-spring-boot3 and resilience4j-spring6".
  Aspect Order 표준은 CircuitBreaker(낮은 priority 값) → Retry 순서 강제.
evidence_repo: |
  synapse-gateway/build.gradle.kts:L28-L33 — 의존성 4개에 resilience4j 부재.
  synapse-gateway/src/main/java/com/synapse/gateway/config/ — RoutesConfig.java,
  RateLimiterConfig.java, CorsConfig.java 3개뿐. Resilience4jConfig.java 부재.
  Grep "@CircuitBreaker|@Retry|@Bulkhead|@TimeLimiter|resilience4j\." synapse-* 결과 0건.
current_text: |
  #### 프로젝트 내 사용 위치
  - `api-gateway/src/main/resources/application.yml` — 서킷 브레이커 설정
  - `api-gateway/src/main/java/config/Resilience4jConfig.java` — 프로그래매틱 설정
  - AI Service 호출: Bulkhead로 동시 OpenAI 호출 수 제한
proposed_text: |
  #### 프로젝트 내 사용 위치
  - **현재(2026-05-28) 미적용** — synapse-gateway는 Resilience4j 의존성을 추가하지 않았고
    `Resilience4jConfig`도 부재. Gateway 회로차단·재시도·Bulkhead 도입 여부는
    **S5 ADR(Gateway 회로차단/RateLimit 정책)**에서 결정 예정.
  - 도입 시 권장 경로: `synapse-gateway/build.gradle.kts`에
    `io.github.resilience4j:resilience4j-spring-boot3` 추가 →
    `synapse-gateway/src/main/java/com/synapse/gateway/config/Resilience4jConfig.java` 신설 →
    `application.yml`에 `resilience4j.*` 트리 추가.
  - AI Service(Python `learning-ai`) 호출은 Spring 측 Gateway가 아닌 호출 서비스
    (`knowledge-svc` 등)에서 `@CircuitBreaker` + `@Bulkhead`로 보호. 03-A §A 어댑터 표준 참조.
patch_target: "documents.wiki/18_기술_스택_정의서.md L1324-L1328"
deep_dive: false
```

### S4-F02 / ES-F02

```yaml
finding_id: S4-F02
section: "§3.2 Resilience4j (L1407 트러블슈팅 표)"
class: E2
severity: P2
title: "Spring Boot 3 Aspect Order 트러블슈팅 누락"
evidence_official: |
  context7 /resilience4j/resilience4j: "In Spring Boot 3, the default Aspect Order
  might cause @Retry to execute before @CircuitBreaker. This can lead to multiple
  failures being recorded by the CircuitBreaker for a single logical operation,
  potentially opening the circuit prematurely."
  해법: resilience4j.circuitbreaker.circuitBreakerAspectOrder=1 +
       resilience4j.retry.retryAspectOrder=2.
evidence_repo: |
  N/A (트러블슈팅 표 L1401-L1407에 해당 항목 부재)
current_text: |
  | Retry 무한 루프 | 모든 예외에 재시도 설정 | `ignore-exceptions`로 비재시도 예외 명시 |
  | Micrometer 메트릭 미노출 | actuator 설정 누락 | `management.endpoints.web.exposure.include=health,metrics,circuitbreakers` |
proposed_text: |
  | Retry 무한 루프 | 모든 예외에 재시도 설정 | `ignore-exceptions`로 비재시도 예외 명시 |
  | Micrometer 메트릭 미노출 | actuator 설정 누락 | `management.endpoints.web.exposure.include=health,metrics,circuitbreakers` |
  | `@Retry`가 `@CircuitBreaker`보다 먼저 적용돼 CB가 조기 OPEN | Spring Boot 3 기본 Aspect Order에서 Retry < CircuitBreaker (Retry가 안쪽) | `resilience4j.circuitbreaker.circuitBreakerAspectOrder=1` + `resilience4j.retry.retryAspectOrder=2` 명시 (CB가 Retry를 감싸도록) |
patch_target: "documents.wiki/18_기술_스택_정의서.md L1407 직후 표 행 추가"
deep_dive: false
```

### S4-F03 / ES-F03

```yaml
finding_id: S4-F03
section: "§3.3 Redis Token Bucket (L1460-L1465, L1508-L1513)"
class: E1
severity: P1
title: "redis-rate-limiter는 초당(per-second) 단위 — 위키의 'per minute' 라벨은 알고리즘과 불일치"
evidence_official: |
  context7 /spring-cloud/spring-cloud-gateway: "redis-rate-limiter.replenishRate
  property defines how many requests per second are allowed... redis-rate-limiter.burstCapacity
  property is the maximum number of requests allowed in a single second."
  분당 1회 같은 1초 미만 레이트는 "replenishRate=1, requestedTokens=60, burstCapacity=60"
  으로 표현(60초당 1요청).
evidence_repo: |
  synapse-gateway/src/main/java/com/synapse/gateway/config/RoutesConfig.java:L28 —
  `return new RedisRateLimiter(1, 60, 1);` (1 token/sec replenish, 60 burst, 1 token per request).
current_text: |
  ```java
      private static final Map<String, int[]> PLAN_LIMITS = Map.of(
          "FREE",  new int[]{100,  200},   // replenishRate, burstCapacity (per minute)
          "PRO",   new int[]{1000, 2000},
          "TEAM",  new int[]{3000, 5000}
      );
  ```
  ...
  # rate_limit:{userId}:FREE    → 100 req/min
proposed_text: |
  ```java
      // 플랜별 Rate Limit 설정 — replenishRate/burstCapacity 단위는 **초당**(per-second).
      // 분당 정책을 만들려면 replenishRate를 60으로 나누거나, requestedTokens=60 트릭을 쓴다(공식 패턴).
      private static final Map<String, int[]> PLAN_LIMITS = Map.of(
          //  replenishRate(/sec), burstCapacity(/sec)
          "FREE",  new int[]{2,   20}, // ≈ 120 req/min steady, 1초 버스트 20
          "PRO",   new int[]{17,  100},// ≈ 1,020 req/min steady, 1초 버스트 100
          "TEAM",  new int[]{50,  300} // ≈ 3,000 req/min steady, 1초 버스트 300
      );
  ```
  - **분당 단위 표기 주의**: Spring Cloud Gateway RedisRateLimiter는 *초당* 토큰 보충/버스트가 기본 단위다.
    "분당 100회"를 정확히 구현하려면 `replenishRate=1, requestedTokens=60, burstCapacity=60` 패턴(공식 문서, 1요청=60토큰)을 쓰거나 위처럼 초당으로 환산한다.
    **현재 synapse-gateway는 모든 라우트에 공통 `RedisRateLimiter(1, 60, 1)`(1req/sec, 60 버스트)만 적용 — 플랜별 분기는 S5 ADR에서 결정 예정.**
patch_target: "documents.wiki/18_기술_스택_정의서.md L1460-L1465 + L1508-L1513"
deep_dive: false
```

### S4-F04 / ES-F04

```yaml
finding_id: S4-F04
section: "§3.3 Redis Token Bucket (L1448-L1451)"
class: E1
severity: P1
title: "프로젝트 내 사용 위치 경로가 'api-gateway/...'로 잘못 표기"
evidence_official: |
  N/A
evidence_repo: |
  - 실제: synapse-gateway/src/main/java/com/synapse/gateway/config/RateLimiterConfig.java (IP KeyResolver 1개 빈)
  - 실제: synapse-gateway/src/main/java/com/synapse/gateway/config/RoutesConfig.java (RedisRateLimiter 빈 + RouteLocator)
  - 실제: synapse-gateway/src/main/resources/application.yml (rate limiter args 없음 — 프로그래매틱)
current_text: |
  #### 프로젝트 내 사용 위치
  - `api-gateway/src/main/java/config/RateLimiterConfig.java`
  - `api-gateway/src/main/resources/application.yml`
  - Redis: `rate_limit:{userId}:{planTier}` 키 패턴
proposed_text: |
  #### 프로젝트 내 사용 위치 (현재 구현)
  - `synapse-gateway/src/main/java/com/synapse/gateway/config/RoutesConfig.java` — `RedisRateLimiter(1, 60, 1)` 빈 + `RouteLocator` 4개 라우트 (platform/engagement/knowledge/learning)에 공통 적용
  - `synapse-gateway/src/main/java/com/synapse/gateway/config/RateLimiterConfig.java` — **IP 기반** `KeyResolver` 빈 (JWT plan 추출 미구현)
  - Redis: 기본 키 패턴 `request_rate_limiter.{key-resolver-value}.timestamp` / `.tokens` (Spring Cloud Gateway 내장)
  - 플랜별(`rate_limit:{userId}:{planTier}`) 키 패턴 + JWT 기반 KeyResolver는 **S5 ADR(Gateway RateLimit 정책)에서 결정 예정** — 본 §3.3은 도입 후의 표준 형태.
patch_target: "documents.wiki/18_기술_스택_정의서.md L1448-L1451"
deep_dive: false
```

### S4-F05 / ES-F05

```yaml
finding_id: S4-F05
section: "§5.4 Apache Kafka 3.x — Outbox 예제 정합"
class: OK
severity: P2
title: "Outbox 예제 코드·KafkaAvroSerializer·CloudEvents binary 헤더 표준 정합"
evidence_official: |
  context7 /apache/kafka: "since 0.11.0.0, producers can send messages atomically to
  multiple partitions using transactions" + "enable.idempotence defaults to true" (Streams EOS).
evidence_repo: |
  synapse-learning-svc/learning-card/.../KafkaConfig.java L34/L58/L63 —
  KafkaAvroSerializer + ENABLE_IDEMPOTENCE_CONFIG=true + Schema Registry URL.
  application.yml L20-L24도 동일.
  build/test-results/.../*.xml: `enable.idempotence = true`,
  `value.serializer = io.confluent.kafka.serializers.KafkaAvroSerializer`,
  `value.subject.name.strategy = TopicNameStrategy` 실제 적용 확인.
```

### S4-F06 / ES-F06

```yaml
finding_id: S4-F06
section: "§5.4 Apache Kafka 3.x (L3744-L3748 producer 설정 예제)"
class: E2
severity: P2
title: "max.in.flight.requests.per.connection 5는 Kafka 3.x 권장 — 4.0.0 변경 참고 누락"
evidence_official: |
  context7 /apache/kafka: "Notable changes in 4.0.0 > Producer: Producer behavior has
  changed in Apache Kafka 4.0.0. The enable.idempotence configuration will no longer
  automatically fall back if max.in.flight.requests.per.connection exceeds 5.
  The default linger.ms has also changed from 0 to 5."
evidence_repo: |
  synapse-learning-svc/learning-card/.../KafkaConfig.java — max.in.flight 명시 없음(기본 5).
  application.yml L17 max.in.flight.requests.per.connection 명시 없음.
  위키 §5.4 L3747은 명시.
current_text: |
        enable.idempotence: true           # 멱등성 Producer
        acks: all                          # 모든 복제본 확인 후 승인
        retries: 3
        max.in.flight.requests.per.connection: 5
        compression.type: lz4             # LZ4 압축
proposed_text: |
        enable.idempotence: true           # 멱등성 Producer (Kafka 3.0+ 기본 true)
        acks: all                          # 모든 복제본 확인 후 승인
        retries: 3
        max.in.flight.requests.per.connection: 5  # 멱등 Producer + 순서 보장의 균형값 (Kafka 3.x). 4.0.0+에서는 5 초과 시 idempotence가 자동 비활성화되지 않으므로 반드시 5 이하로 유지.
        compression.type: lz4             # LZ4 압축
patch_target: "documents.wiki/18_기술_스택_정의서.md L3744-L3748"
deep_dive: false
```

### S4-F07 / ES-F07

```yaml
finding_id: S4-F07
section: "§5.4 Apache Kafka 3.x (L3829 트러블슈팅 표)"
class: E2
severity: P2
title: "Producer 측 Circuit Breaker는 Outbox/Relay 분리 후엔 비표준 — 트러블슈팅 정정"
evidence_official: |
  메모리 [[data-sync-outbox-cqrs]] "Kafka는 서비스 경계 넘을 때만. 서비스 내부는 DB 트랜잭션/Modulith"
evidence_repo: |
  §5.4 본문 L3763-L3773 자체가 Outbox 패턴 의무화("Kafka 직접 호출 금지")로 수정됨.
  Producer 호출은 Relay 단일 지점 → 비즈니스 코드에 Circuit Breaker 적용 대상 아님.
current_text: |
  | Producer 전송 실패 | 브로커 연결 불가 | `retries`, `retry.backoff.ms` 설정 및 Circuit Breaker |
proposed_text: |
  | Producer 전송 실패 | 브로커 연결 불가 | `retries`, `retry.backoff.ms` 증가 — **Relay 측에서만 처리**. 실패 시 outbox_event는 미커밋 유지되어 다음 폴링에서 재시도. 비즈니스 코드는 Kafka를 직접 호출하지 않으므로 별도 Circuit Breaker 불필요(03-A §A.10 / 18 §5.4.1) |
patch_target: "documents.wiki/18_기술_스택_정의서.md L3829"
deep_dive: false
```

### S4-F08 / ES-F08

```yaml
finding_id: S4-F08
section: "§5.5 Confluent Schema Registry 7.x"
class: E2
severity: P1
title: "운영 환경 auto.register.schemas=false / Subject Naming Strategy 권고 누락"
evidence_official: |
  context7 /confluentinc/schema-registry: BACKWARD/FORWARD/FULL/NONE + TRANSITIVE.
  운영 표준은 PR/CI에서 명시 등록 → producer 측 auto.register.schemas=false(Confluent 공식 운영 가이드).
evidence_repo: |
  synapse-learning-svc/learning-card/build/test-results/.../*.xml L2094:
  `auto.register.schemas = true` (테스트 컨테이너 기본값).
  application.yml L23-L24: schema.registry.url만 명시, auto.register.schemas 설정 부재(= 기본 true).
current_text: |
  - **자동 등록**: `producer.send()` 시 스키마가 자동 등록 (또는 CI가 명시 등록)
proposed_text: |
  - **자동 등록 vs CI 명시 등록**: `producer.send()` 시 스키마가 자동 등록되는 동작은 **개발 편의용**이며 운영에서는 위험(잘못된 스키마가 자동 등록되어 호환성 검증 우회). 표준은 다음과 같다.
    - **개발/CI**: `auto.register.schemas=true` 허용 — 빠른 반복.
    - **운영(prod profile)**: `properties.auto.register.schemas: false` + `use.latest.version: true` 명시. 스키마 등록은 `synapse-shared/.github/workflows/schema-check.yml`(PR 시 호환성 검증)와 별도의 "register on merge" 단계만 수행.
  - **Subject Naming Strategy**: Synapse는 **TopicNameStrategy**(기본값)을 사용 → 한 토픽 = 단일 record 유형. 멀티 유형 토픽이 필요해지면 `RecordNameStrategy`/`TopicRecordNameStrategy`로 분기하되, 호환성 모드는 그대로 BACKWARD 글로벌 유지.
patch_target: "documents.wiki/18_기술_스택_정의서.md §5.5 자동 등록 bullet 직후 보강"
deep_dive: false
```

### S4-F09 / ES-F09

```yaml
finding_id: S4-F09
section: "§5.5 Confluent Schema Registry 7.x — 정합"
class: OK
severity: P2
title: "BACKWARD 글로벌 / BACKWARD_TRANSITIVE Knowledge 분리 + Avro/Confluent 7.x 표준 정합"
evidence_official: |
  context7 /confluentinc/schema-registry: BACKWARD, BACKWARD_TRANSITIVE, FULL, NONE 정확 매핑.
evidence_repo: |
  synapse-shared/build.gradle.kts L28: io.confluent:kafka-avro-serializer:7.5.0
  learning-card/build.gradle.kts L56: 7.7.0 — 두 버전 혼재(7.5.0 vs 7.7.0)지만 호환 범위 안.
```

### S4-F10 / ES-F10

```yaml
finding_id: S4-F10
section: "§5.6 Apache Avro 1.11.x"
class: D
severity: P1
title: "synapse-shared(1.11.3) vs learning-card(1.12.0) 버전 분기 — 위키는 1.11.x 단일"
evidence_official: |
  context7 /apache/avro: 1.11.1/1.11.2/1.11.3 spec 모두 default value·aliases 동일 의미.
  1.12.0은 신규 라인.
evidence_repo: |
  synapse-shared/build.gradle.kts:L27 → org.apache.avro:avro:1.11.3
  synapse-learning-svc/learning-card/build.gradle.kts:L55 → org.apache.avro:avro:1.12.0
current_text: |
  ### 5.6 Apache Avro 1.11.x
proposed_text: |
  ### 5.6 Apache Avro 1.11.x

  > **버전 정합 메모(2026-05-28)**: synapse-shared `1.11.3`이 정합 기준. synapse-learning-svc/learning-card는 현재 `1.12.0`을 끌어다 쓰는데, 1.11→1.12는 logical type 처리·UUID Generic Record 동작에 미세한 차이가 있어 **소비측 reader schema 호환 검증 후 1.11.3으로 정렬 권장**(별도 PR로 처리, 본 표는 1.11.x 표준 표기 유지).
patch_target: "documents.wiki/18_기술_스택_정의서.md L3933 직후"
deep_dive: false
```

### S4-F11 / ES-F11

```yaml
finding_id: S4-F11
section: "§5.6 Apache Avro 1.11.x — 정합"
class: OK
severity: P2
title: "필드 추가 시 default 필수·aliases·null union·logical type 표준 정합"
evidence_official: |
  context7 /apache/avro 1.11.2/1.11.3 spec: "default: A default value for this field,
  only used when reading instances that lack the field for schema evolution purposes."
  + aliases array.
evidence_repo: |
  synapse-shared/src/main/avro/knowledge/NoteCreated.avsc (위키 L3987-L3999 예제와 정합).
```

### S4-F12 / ES-F12 — 신설 §4.1.9 ShedLock 7.7.x

```yaml
finding_id: S4-F12
section: "(신설) §4.1.9 ShedLock 7.7.x"
class: R
severity: P1
title: "ShedLock 7.7.x 운영 표준을 §4.1.9 독립 절로 신설 — Spring 생태계 내부"
evidence_official: |
  context7 /lukas-krecan/shedlock: "shedlock-spring 7.7.0" 명시. @EnableSchedulerLock +
  JdbcTemplateLockProvider.Configuration.builder().usingDbTime() + @SchedulerLock 표준 패턴.
evidence_repo: |
  synapse-learning-svc/learning-card/.../SchedulerConfig.java — @EnableSchedulerLock(defaultLockAtMostFor="30m") +
  JdbcTemplateLockProvider.usingDbTime().
  ReviewDueScheduler.java L29-L30 — @Scheduled(cron="0 0 8 * * *", zone="Asia/Seoul")
  + @SchedulerLock(name="ReviewDueScheduler_publishDueEvents", lockAtLeastFor="1m", lockAtMostFor="30m").
  V16__init_shedlock.sql — CREATE TABLE IF NOT EXISTS shedlock(name PK, lock_until, locked_at, locked_by).
  build.gradle.kts L59-L60 — shedlock-spring:7.7.0 + shedlock-provider-jdbc-template:7.7.0.
proposed_text: |
  (§6 Deep Dive 일람에 전체 본문 포함 — 신설 텍스트 약 80줄)
patch_target: "documents.wiki/18_기술_스택_정의서.md L2461 §4.1.8 끝 직후 §4.1.9 신설 삽입"
deep_dive: true
recommend_new_section: true
new_section_location: "L2461 직후"
```

### S4-F13 / ES-F13 — 신설 §5.4.1 Outbox / Polling Relay 운영 패턴

```yaml
finding_id: S4-F13
section: "(신설) §5.4.1 Outbox / Polling Relay 운영 패턴"
class: R
severity: P1
title: "Outbox·Relay 운영 표준(폴링 주기·batch·SKIP LOCKED·DLQ·해시샤딩 트리거)을 §5.4.1 독립 절로 신설"
evidence_official: |
  - Microsoft Architecture: Transactional Outbox Pattern (https://learn.microsoft.com/azure/architecture/best-practices/transactional-outbox)
  - Debezium Outbox Event Router(참조 구현): https://debezium.io/documentation/reference/transformations/outbox-event-router.html
  - CloudEvents binary mode mapping (Kafka): https://github.com/cloudevents/spec/blob/main/cloudevents/bindings/kafka-protocol-binding.md
  - context7 /apache/kafka: Producer idempotence + 트랜잭션 + 멱등 처리.
evidence_repo: |
  - synapse-platform-svc/.../V26__create_processed_events.sql — 소비측 멱등 테이블만 구현됨
  - outbox_event/user_ref/event_publication 마이그레이션은 모든 synapse-* 레포에 미존재 (Grep 0건)
  - 03-A §A.10~A.11에 OutboxMessageFactory·CloudEvents 헤더 매핑 표준 이미 정의 —
    §5.4.1은 이를 18 기술 스택 관점에서 정리.
  - 메모리 [[data-sync-outbox-cqrs]]: Polling Relay = @Scheduled + ShedLock 7.7.x 단일 활성,
    확장 시 해시샤딩/advisory lock, 파티션 키 = {tenant_id}:{aggregate_id},
    소비측 version 가드 + processed_events 멱등
proposed_text: |
  (§6 Deep Dive 일람에 전체 본문 포함 — 신설 텍스트 약 110줄)
patch_target: "documents.wiki/18_기술_스택_정의서.md L3842(§5.4 끝 직후) §5.4.1 신설 삽입"
deep_dive: true
recommend_new_section: true
new_section_location: "L3842 직후(§5.4 끝)"
```

### S4-F14 / ES-F14

```yaml
finding_id: S4-F14
section: "§3.2 Resilience4j — Gateway CB 적용 여부 확인"
class: OK
severity: P2
title: "synapse-gateway에 Resilience4j 미적용 — S5 ADR(Gateway 회로차단/RateLimit) 위임 사실 기록"
evidence_official: |
  N/A (사실 기록)
evidence_repo: |
  synapse-gateway/build.gradle.kts 의존성 4개 모두에 resilience4j 없음(L28-L33).
  config 디렉토리에 Resilience4jConfig 부재.
  Grep `@CircuitBreaker` synapse-gateway 결과 0건.
  → §3.2 본문은 *목표 형태/일반 가이드*로 인정. "현재 미적용 + S5에서 결정" 메모는 ES-F01(§3.2 사용 위치 절)에서 처리.
  ADR-level 결정은 S5에 위임.
```

---

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

본 세션은 *통상 Deep Dive 부속 서브섹션*이 아니라 **두 개의 신설 절** 형태로 보강한다. 이유: ShedLock·Outbox 운영 표준은 §1.4 표·§5.1.1 카탈로그·§4.1.8 Modulith Deep Dive 등에 산발 인용되어 있어 *한 절에 모아 진실의 단일 출처를 만드는 게* "더 깊이"의 형태로 더 효과적.

### 6.1 신설 §4.1.9 ShedLock 7.7.x — 본문

```markdown
### 4.1.9 ShedLock 7.7.x

#### 개요
분산 환경에서 `@Scheduled` 메소드의 **중복 실행을 한 노드에서만** 보장하는 경량 라이브러리. JDBC·Redis·MongoDB·DynamoDB 등 다양한 LockProvider를 지원하며 Synapse는 `shedlock-provider-jdbc-template`로 PostgreSQL을 사용한다. Quartz Cluster 같은 대형 솔루션 없이 어노테이션 2개(`@EnableSchedulerLock` + `@SchedulerLock`)와 마이그레이션 한 장(`shedlock` 테이블)으로 끝나는 게 핵심 가치.

#### 역할
Synapse의 **모든 다중 인스턴스 @Scheduled**(Outbox Polling Relay, 일배치 리마인더, 통계 집계 등)에서 중복 실행을 방지한다. Outbox Relay의 동시 실행은 `outbox_event`를 두 노드가 함께 SELECT … FOR UPDATE SKIP LOCKED 하더라도 폴링 자체가 동시에 일어나면 잠금 경합 비용이 커지므로, ShedLock으로 폴링 자체를 단일화한다(§5.4.1).

#### 선택 이유
- **Java 21 + Spring Boot 4 호환**: 7.x는 Java 21 빌드, Spring Boot 3+ 안정 지원.
- **운영 단순성**: 추가 서버 없이 PostgreSQL `shedlock` 테이블 한 장만 추가.
- **확장 경로 명확**: 단일 활성→해시샤딩→advisory lock으로 단계적 확장 가능(메모리 [[data-sync-outbox-cqrs]]).
- **대안**: Quartz Cluster(복잡·DB 부담), Redisson Scheduler(Redis 단일 장애점), 자체 advisory lock(보일러플레이트). ShedLock이 가장 단순·견고.

#### 핵심 어노테이션 / 빈

```java
// synapse-learning-svc/learning-card/.../SchedulerConfig.java (현재 구현 발췌)
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "30m")  // 안전망: 노드 다운 시 30분 후 잠금 해제
public class SchedulerConfig {
    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
            JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(new JdbcTemplate(dataSource))
                .usingDbTime()        // 클럭 스큐 회피 — DB 시계 사용 (필수)
                .build()
        );
    }
}
```

```java
// @SchedulerLock 적용 예 — ReviewDueScheduler (실제 구현)
@Scheduled(cron = "0 0 8 * * *", zone = "Asia/Seoul")
@SchedulerLock(
    name           = "ReviewDueScheduler_publishDueEvents",  // 잠금 키(고유)
    lockAtLeastFor = "1m",   // 빠른 클럭 노드의 같은 윈도우 재실행 방지
    lockAtMostFor  = "30m"   // 잠금 자동 해제 안전망(노드 크래시 대비)
)
public void publishDueEvents() { ... }
```

#### shedlock 테이블 DDL (필수 마이그레이션)

```sql
-- V__init_shedlock.sql (각 서비스 db/migration 폴더)
CREATE TABLE IF NOT EXISTS shedlock (
    name       VARCHAR(64)  NOT NULL,
    lock_until TIMESTAMP    NOT NULL,
    locked_at  TIMESTAMP    NOT NULL,
    locked_by  VARCHAR(255) NOT NULL,
    CONSTRAINT pk_shedlock PRIMARY KEY (name)
);
```

#### Synapse 적용 현황(2026-05-28)

| 서비스 | 의존성 | LockProvider | 마이그레이션 | 적용 위치 |
|--------|--------|--------------|--------------|-----------|
| learning-card | `shedlock-spring:7.7.0` + `shedlock-provider-jdbc-template:7.7.0` | JdbcTemplateLockProvider(`.usingDbTime()`) | `V16__init_shedlock.sql` | `ReviewDueScheduler` |
| platform-svc | ❌ 미적용 | — | — | Outbox Relay 도입 시 필수 |
| knowledge-svc | ❌ 미적용 | — | — | Outbox Relay 도입 시 필수 |
| engagement-svc | ❌ 미적용 | — | — | Outbox Relay 도입 시 필수 |

#### 트러블슈팅

| 증상 | 원인 | 해결책 |
|------|------|--------|
| `@SchedulerLock`이 잠그지 않음 | `@EnableScheduling`만 있고 `@EnableSchedulerLock`이 없음 / `LockProvider` 빈 부재 | `SchedulerConfig`에 둘 다 추가 |
| 두 노드가 동시 실행됨 | 노드 간 클럭 스큐(WallClock 사용) | `JdbcTemplateLockProvider.Configuration.builder().usingDbTime()` 필수 |
| 잠금이 풀리지 않음 | 노드 크래시 + `lockAtMostFor` 너무 큼 | 작업 최대 실행 시간 × 2~3 정도로 설정 (예: 1분 작업이면 5m) |
| 빠른 클럭 노드가 같은 윈도우 재실행 | `lockAtLeastFor` 미설정 | 스케줄 간격과 같은 값으로 설정 (15분 cron → `14m` 등) |
| `LockAssert.assertLocked()` 가 `IllegalStateException` | AOP 미작동(같은 클래스 self-invocation 등) | 외부 빈에서 호출하도록 분리, `@Scheduled` 메소드 public 유지 |

#### 운영 임계값 표준 (Synapse 표준)
- **Outbox Relay**: `lockAtMostFor=PT60S`, `lockAtLeastFor=PT0S`, 폴링 주기 2-5초 (§5.4.1)
- **일배치(Daily reminder)**: `lockAtMostFor=30m`, `lockAtLeastFor=1m` (현재 ReviewDueScheduler)
- **시간 단위 집계**: `lockAtMostFor=15m`, `lockAtLeastFor=PT0S`

#### 공식 문서
- https://github.com/lukas-krecan/ShedLock
- 7.x 릴리스 노트(Java 21+ 권장): https://github.com/lukas-krecan/ShedLock/releases
```

### 6.2 신설 §5.4.1 Outbox / Polling Relay 운영 패턴 — 본문

```markdown
### 5.4.1 Outbox / Polling Relay 운영 패턴

> 본 절은 §5.4 Kafka 위에서 Synapse가 운영하는 **Transactional Outbox + Polling Relay** 표준의 *기술 스택 관점 정리*다. 도메인/테이블 스키마는 02_ERD §2.3.A, 통신 운영 절차(매퍼 레지스트리·CloudEvents 헤더 매핑·재시도/DLQ)는 03-A §A.10~A.11이 정식 기준이다. §4.1.8(Modulith 이중 채널)·§4.1.9(ShedLock)·§5.1.1(테이블 카탈로그)을 함께 본다.

#### 왜 Outbox + Polling Relay인가
- **dual-write 회피**: 도메인 트랜잭션 안에서 Kafka로 직접 발행하면 DB 커밋과 브로커 ack 사이에 비원자 구간이 생긴다. 같은 트랜잭션에서 `outbox_event`에만 INSERT → Relay가 별도로 Kafka 발행 → DB 트랜잭션 일관성만으로 외부 발행 신뢰성 확보.
- **Modulith Event Publication Registry와의 분리**: 내부 모듈 간 이벤트는 `event_publication`(자동), 외부(서비스 경계)는 `outbox_event`(명시) — §4.1.8 표준. `spring-modulith-events-kafka` 사용 금지(메모리 [[spring-modulith-outbox-coexistence]]).

#### Polling Relay 운영 임계값 (Synapse 표준)

| 항목 | 권장 값 | 근거 |
|------|---------|------|
| 폴링 주기(@Scheduled fixedDelay) | **2-5초** | 발행 지연 SLA + DB 부하 균형. 짧을수록 SLA 좋아지나 빈 폴링 비용 증가 |
| Batch size(LIMIT) | **50-200** | 한 번 폴링당 발행할 outbox_event 수. 1트랜잭션에 묶이는 Kafka send count |
| SELECT 잠금 | **`FOR UPDATE SKIP LOCKED`** | 다중 Relay 도입 시 잠금 경합 회피. PostgreSQL 9.5+ |
| 처리 상태 | `status` 컬럼 `PENDING/SENT/FAILED` + `attempts` int | At-least-once. 실패는 attempts 증가, MAX_ATTEMPTS 초과 시 `FAILED`(DLQ) |
| DLQ 정책 | `attempts >= 10` → status `FAILED` → 알림 + 수동 재처리 | 03-A §A.11.4 |
| ShedLock | `@SchedulerLock(name="outbox-relay-{service}", lockAtMostFor="PT60S")` | 다중 인스턴스 단일 활성. §4.1.9 |

#### 확장 트리거(언제 단일 Relay에서 벗어나야 하나)

| 신호 | 임계값 | 대응 |
|------|--------|------|
| Outbox 백로그 | 5분 평균 > 1,000건 또는 P99 발행 지연 > 5s | **해시샤딩**: `WHERE hashtext(aggregate_id) % N = K` 로 N개 Relay 분할 |
| Relay CPU/메모리 | 단일 노드 P95 > 70% | 해시샤딩 N=2 부터 단계적 증설 |
| Kafka producer 실패율 | 1분 평균 > 1% | Relay에서 backoff 증가 + 알림. **비즈니스 코드에는 영향 없음** |
| 단일 토픽 핫파티션 | 한 파티션이 전체 lag의 50% 초과 | 파티션 키 `{tenant_id}:{aggregate_id}` 적용 확인(테넌트 단독 키 폐기 — 메모리 표준) |

#### CloudEvents 헤더 (Kafka binary mode)
Synapse Kafka 메시지는 **Avro body + CloudEvents v1.0 binary headers** 표준을 따른다(value=Avro, 메타데이터=Kafka headers). 매핑은 03-A §A.10.3 OutboxMessageFactory가 단일 출처.

| CloudEvents 속성 | Kafka 헤더 키 | Synapse 매핑 |
|---|---|---|
| id | `ce_id` | `outbox_event.event_id` (UUIDv7) |
| type | `ce_type` | `outbox_event.event_type` (예: `note.created`) |
| source | `ce_source` | `/{service}/{aggregate_type}` (예: `/knowledge-svc/note`) |
| time | `ce_time` | `outbox_event.created_at` (ISO-8601) |
| specversion | `ce_specversion` | `"1.0"` |
| tenantid (확장) | `ce_tenantid` | `outbox_event.tenant_id` |

소비측은 멱등 키로 `ce_id`를 `processed_events.event_id`(platform-svc V26)에 `INSERT … ON CONFLICT DO NOTHING` → 이미 있으면 스킵.

#### 운영 함정 모음

1. **JSON으로 시작했다가 Avro로 마이그레이션** — 호환성 모드 깨짐. **처음부터 Avro**.
2. **자동 역직렬화 페이로드 매퍼** — `outbox_event.payload` JSONB → Avro 변환은 **event_type별 명시적 매퍼 레지스트리**(03-A §A.10.3). 자동 리플렉션 금지.
3. **테넌트 단독 파티션 키** — 핫파티션 발생. **표준: `{tenant_id}:{aggregate_id}`** (메모리).
4. **버전 가드 누락** — 소비측 UPSERT 시 `WHERE EXCLUDED.version > target.version` 없이 덮어쓰면 역전 위험.
5. **Modulith events-kafka 활성화** — 자동 Kafka 발행이 Outbox 표준과 충돌. **의존성 추가 금지**(§4.1.8).
6. **lockAtMostFor 너무 짧음** — Relay 작업이 임계값보다 길어지면 두 노드가 동시 실행. **작업 최대 시간 × 3** 이상.

#### 모니터링 지표 (Prometheus)

| 메트릭 | 알람 임계값 |
|--------|-------------|
| `outbox_backlog_count{service}` | > 1,000 5분 평균 |
| `outbox_publish_latency_seconds{quantile="0.99"}` | > 5s |
| `outbox_failed_total{service}` | 1분당 > 10 |
| `kafka_producer_record_error_total{client_id=~"outbox-relay-.*"}` | 1분당 > 5 |

#### Synapse 적용 현황(2026-05-28)
- **processed_events**(소비측 멱등): synapse-platform-svc `V26__create_processed_events.sql` 실재 ✅
- **outbox_event / user_ref / event_publication 마이그레이션**: 모든 synapse-* 서비스 **미구현** ❌ — Outbox 패턴은 위키 표준(목표 형태)이며 실제 코드 도입은 W4 이후 PR로 진행 예정. 메모리 [[spring-modulith-outbox-coexistence]] 정합.

#### 참조
- 02_ERD §2.3.A — `outbox_event`, `user_ref`, `processed_events` 스키마·인덱스
- 03-A §A.10~A.11 — Polling Relay·OutboxMessageFactory·CloudEvents 매핑·순서 보장
- 18 §4.1.8 — Modulith Event Publication Registry vs Outbox 분리
- 18 §4.1.9 — ShedLock 7.7.x (Relay 단일 활성)
- 메모리 [[data-sync-outbox-cqrs]], [[spring-modulith-outbox-coexistence]]
```

---

## 7. 위키 패치 diff 요약

**커밋**: `documents.wiki@0a7e5a2` (master, 2026-05-28)
**변경 통계**: 단일 파일 `18_기술_스택_정의서.md` — **+190 / -21** (총 5716줄)

### 7.1 finding ↔ 위키 패치 위치 매핑

| finding_id | class | 위키 패치 위치 | 변경 형태 |
|------------|-------|----------------|-----------|
| S4-F01 | E1 | §3.2 프로젝트 내 사용 위치(이전 L1324-L1327) | 본문 4줄 → 4줄 교체 (가상 경로 → 미적용 사실 + S5 위임) |
| S4-F02 | E2 | §3.2 트러블슈팅 표 끝 | 표 행 1개 추가 (Aspect Order) |
| S4-F03 | E1 | §3.3 PLAN_LIMITS 주석 + Redis 키 패턴 주석 | 두 곳 단위 정정 (per-minute → per-second + 환산) |
| S4-F04 | E1 | §3.3 프로젝트 내 사용 위치 | 본문 3줄 → 4줄 교체 (synapse-gateway/ 실제 경로) |
| S4-F05 | OK | §5.4 — | 변경 없음 (Outbox 예제 정합 — 기록만) |
| S4-F06 | E2 | §5.4 producer 설정 주석 | max.in.flight=5 주석에 Kafka 4.0.0+ 변경 사실 추가 |
| S4-F07 | E2 | §5.4 트러블슈팅 표 | Producer 전송 실패 행 정정 (CB 제거 → Relay retries) |
| S4-F08 | E2 | §5.5 자동 등록 bullet | bullet 1개 → 다중 bullet (auto.register 운영=false + Subject Naming) |
| S4-F09 | OK | §5.5 — | 변경 없음 (Confluent 7.x 표준 정합) |
| S4-F10 | D | §5.6 헤더 직후 | 버전 정합 메모 박스 신설 |
| S4-F11 | OK | §5.6 — | 변경 없음 (Avro 스키마 진화 표준 정합) |
| S4-F12 | R | (신설) §4.1.9 ShedLock 7.7.x | **신설 절** (§4.1.8 끝 직후, ~80줄) |
| S4-F13 | R | (신설) §5.4.1 Outbox/Polling Relay 운영 패턴 | **신설 절** (§5.4 끝 직후, ~110줄) |
| S4-F14 | OK | §3.2 (사실 기록) | 변경 없음 (Gateway CB 미적용 → S5 ADR 위임) |
| §11 변경 이력 | — | §11 표 | v2.3-S4 행 1개 추가 |

### 7.2 라인 변동

- §4.1.9 ShedLock 신설로 §4.2 이하 라인이 +85 정도 이동
- §5.4.1 Outbox 신설로 §5.5 이하 라인이 +85 정도 이동
- §11 변경 이력 +1 행 추가
- 정정 패치 합계 +20/-21 (대부분 본문 교체)
- **순 증분 +190 / -21**, 신설 절 2개가 대부분 차지

---

## 8. 후속 과제 (Follow-ups)

### 8.1 본 세션 처리 완료
- §3.2/§3.3 가상 경로·단위 정정(E1 3건)
- §3.2/§5.4/§5.5 운영 규칙·Aspect Order·auto.register·Subject Naming 보강(E2 4건)
- §5.6 Avro 1.11.3 vs 1.12.0 분기 메모 추가(D 1건)
- §4.1.9 ShedLock 7.7.x / §5.4.1 Outbox/Polling Relay 운영 패턴 신설(R 2건)
- §3.2 Gateway CB 미적용 사실 기록(OK 1건)
- 메모리 [[data-sync-outbox-cqrs]] + [[spring-modulith-outbox-coexistence]] 정합 확인

### 8.2 S5 운영/관측성 세션으로 위임 (그대로 유지)
- **§3.1 Gateway 운영 ADR** (JWT 미구현·CircuitBreaker 미설정 — S2a부터 위임된 항목)
- **§3.2 Resilience4j Gateway 도입 결정** (S4-F01·F14 사실 기록 → S5에서 ADR화)
- **§3.3 RedisRateLimiter 플랜별 분기 결정** (S4-F03·F04 사실 기록 → S5에서 ADR화)
- (S3 위임 유지) Redis Cluster 전환 트리거 ADR / ES vs OpenSearch 결정 ADR
- (S3 위임 유지) S3 운영(KMS·Object Lock·Lifecycle·이벤트 알림 라우팅)

### 8.3 S6 외부/AI 세션으로 위임 (그대로 유지)
- §6 RAG 절 LangChain 잔존 언급 일괄 정정 (S2a §4.2.4 Direct SDK 패턴과 일관성)

### 8.4 별도 코드 PR 후속 (INDEX 후속 큐 갱신)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:L55` Avro `1.12.0` → `1.11.3` 정렬 (S4-F10 발견)
- **(P1)** `synapse-learning-svc/learning-card/src/main/resources/application.yml` Kafka producer에 `properties.auto.register.schemas: false` 운영 프로필 추가 (S4-F08)
- **(P1)** Outbox 패턴 도입 시 platform-svc/knowledge-svc/engagement-svc에 ShedLock 7.7.x 도입 + `shedlock` 마이그레이션 (S4-F12·F13 신설 절이 표준)
- (P1 유지) `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 (S2a)
- (P1 유지) `synapse-learning-svc/learning-card/build.gradle.kts:81` Modulith `1.3.0` → `2.0.6` (S2a)
- (P1 유지) `outbox_event`/`user_ref`/`event_publication` 마이그레이션 작성 (S3)
- (P1 유지) AWS S3 AttachmentService 구현 (S3)

### 8.5 별도 결정 사항
- (유지) 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부
- (유지) 5주 단축 일정 트레이드오프 ADR화 검토
- (유지) integration_test 실제 작성 (Phase D 이후)

### 8.6 v2.3 통합 정리 작업 (6 세션 종료 후)
- §10.1 요약표 S1+S2+S3+S4 변경 반영 (ShedLock §4.1.9 / §5.4.1 행 추가)
- §12.4 인프라 버전 요구사항: ShedLock 7.7.x · Avro 1.11.3 단일화 명시
- §12.2 Flutter 매핑 (S2b 권고 그대로) / §12.3 Python AI (S2a 처리)
- §1.4 기술 스택 전체 목록 표 S4 신설 절 반영

### 8.7 메모리 갱신 후보
- ✅ `data-sync-outbox-cqrs` — 본 세션 정합 확인. 추가 갱신 불필요.
- ✅ `spring-modulith-outbox-coexistence` — 본 세션 정합 확인 + events-kafka 부재 재확인. 추가 갱신 불필요.
- **(신규 검토)** `outbox-polling-relay-operations` — §5.4.1 신설 본문이 메모리화할 만한 운영 표준 5개 항목 포함(폴링 2-5초, batch 50-200, FOR UPDATE SKIP LOCKED, DLQ attempts>=10, 해시샤딩 트리거 1000건/5분). S5 운영 ADR 결정 후 정착 시점에 메모리화 검토.
