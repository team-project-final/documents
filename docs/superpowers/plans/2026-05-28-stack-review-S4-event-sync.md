# 18 기술 스택 검증 — S4 이벤트/동기화 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S4 이벤트/동기화 카테고리(Apache Kafka 3.x, Confluent Schema Registry 7.x, Apache Avro 1.11.x, Resilience4j, Redis Token Bucket = 5개 명시 + ShedLock 7.7.x 독립 절·Outbox/Polling Relay 운영 패턴 절 신설 검토 = 7개)에 대해 context7 공식 문서 검증 + `synapse-*` 실 코드 대조 + 보강을 수행한다. 메모리 `data-sync-outbox-cqrs`(파티션 키 `{tenant_id}:{aggregate_id}`·KafkaAvroSerializer·Avro+CloudEvents·OutboxMessageFactory·Polling Relay+ShedLock·version 가드·`processed_events` 멱등) + `spring-modulith-outbox-coexistence`(events-kafka 금지·event_publication ↔ outbox_event 채널 분리·3-INSERT 패턴)의 위키 정합 검증이 본 세션 핵심.

**Architecture:** 마스터 스펙 §1 6단계 파이프라인. 7개 항목은 모두 "도메인 이벤트 외부 발행" 단일 에코시스템(브로커 + 직렬화 + 스키마 + 회복 + 처리율 제어 + 분산 락 + Relay 패턴)이므로 **1개 subagent**로 통합 검증(S2b·S3 패턴). 보고서 9 섹션 + 위키 일괄 패치 + PR/INDEX 갱신은 S1·S2a·S2b·S3와 동일. v2.2(2026-05-28) Kafka 정합화 직후 시점이므로 그 패치(KafkaAvroSerializer·OutboxRecorder 예제)를 무너뜨리지 않으면서 보강·신설하는 게 작업의 형태.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S3 종료 후 S1·S2a·S2b·S3 completed 상태)
- 마스터 HANDOFF: `documents/docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md` (v1.0 — 4세션 완료/3세션 남음)
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S4-event-sync.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md`
- 실 코드 검증 대상:
  - `synapse-*/build.gradle.kts` — Spring Kafka·Avro·Resilience4j·ShedLock 의존성
  - `synapse-*/src/main/resources/application*.yml` — Kafka producer/consumer, Resilience4j, Schema Registry URL
  - `synapse-platform-svc` (Outbox·Relay·`processed_events` V26 존재)
  - `synapse-*-svc/src/main/resources/db/migration/V*.sql` — `outbox_event`·`processed_events`·ShedLock 마이그레이션
  - `synapse-*/src/main/java/**/outbox/`, `**/relay/`, `**/event/`, `**/messaging/`
  - `synapse-gateway` — §3.2 Resilience4j(Circuit Breaker)·§3.3 Redis Token Bucket(Rate Limit) 적용 위치

**필수 메모리 (S4 핵심):**
- `data-sync-outbox-cqrs` — **핵심**: `outbox_event`/`user_ref`/`processed_events` 테이블, OutboxMessageFactory(JSONB→Avro+CloudEvents), Polling Relay+ShedLock 단일 활성, 파티션 키 `{tenant_id}:{aggregate_id}` 표준, Avro 와이어 포맷(JSON 시작 안티패턴). 18 §5.4/§5.5/§5.6 검증의 진실 원천.
- `spring-modulith-outbox-coexistence` — **핵심**: `spring-modulith-events-kafka` 사용 금지, Modulith Event Publication Registry(`event_publication`) ↔ Outbox(`outbox_event`) 채널 분리, 3-INSERT 트랜잭션 패턴. 18 §5.4 Kafka 예제 검증에 직접 영향.
- `git-pr-workflow` — 운영 표준.
- `s3-implementation-status` — 참조: S3 이벤트 알림(SNS/SQS/EventBridge)이 §5.7에서 언급되지만 본 세션에서는 건드리지 않음(S6 위임).

**S4 검증 대상 (5개 명시 + 2개 신설 검토 = 7개):**
- §5.4 Apache Kafka 3.x
- §5.5 Confluent Schema Registry 7.x
- §5.6 Apache Avro 1.11.x
- §3.2 Resilience4j
- §3.3 Redis Token Bucket (게이트웨이 Rate Limit)
- **신설 검토 1**: ShedLock 7.7.x 독립 절 (현재 §1.4 표에만 있음, 메모리에 표준 정착)
- **신설 검토 2**: Outbox/Polling Relay 운영 패턴 절 (§5.4에 예제만 존재, 운영 패턴 절 부재)

**S1+S2+S3 위임 잔여:**
- (S3 → S4) §5.4 Kafka: KafkaAvroSerializer 정합 확인, Outbox·Polling Relay 운영 패턴
- (S3 → S4) §5.5 Schema Registry 7.x: 스키마 진화 정책
- (S3 → S4) §5.6 Apache Avro 1.11.x: SpecificRecord·CloudEvents 헤더
- (S3 → S4) §3.2 Resilience4j·§3.3 Redis Token Bucket
- (S2a → S5) §3.1 Gateway JWT 미구현·CircuitBreaker 미설정 — **본 세션 비대상**(§3.1은 S5). 단, §3.2 Resilience4j Circuit Breaker 자체는 S4가 처리. Gateway에 CB가 미설정이라는 사실은 §3.2 검증에서 자연스럽게 확인되며 S5 ADR 항목으로 그대로 위임됨.

**S4 검증 초점:**
- **§5.4 Apache Kafka 3.x**:
  - 위키 v2.2 정합화 결과(KafkaAvroSerializer + OutboxRecorder 패턴)가 메모리 표준과 일치하는지
  - Spring Kafka 4 (Spring Boot 4 BOM 위임) 호환 매트릭스 — `spring-kafka:4.0.x` ↔ `kafka-clients:3.x`
  - 파티션 키 `{tenant_id}:{aggregate_id}` 표준이 본문에 명시되는지
  - Idempotent producer(`enable.idempotence=true`)·`acks=all`·`max.in.flight.requests.per.connection<=5` 기본값 검증
  - Consumer Group 격리·`isolation.level=read_committed`(트랜잭션 활성 시)
  - **events-kafka 금지** 정책이 §4.1.8(S2a 처리) 외 §5.4 본문에서도 명확한지
- **§5.5 Confluent Schema Registry 7.x**:
  - `schema.registry.url`·`auto.register.schemas=false`(운영) 표준
  - Subject naming(TopicNameStrategy vs RecordNameStrategy vs TopicRecordNameStrategy) — Outbox 표준은 어느 것?
  - 호환성 정책(BACKWARD/FORWARD/FULL/NONE) — 메모리 표준 명시 여부
  - 7.x ↔ confluent-kafka-avro-serializer 호환
- **§5.6 Apache Avro 1.11.x**:
  - SpecificRecord vs GenericRecord — 메모리에 SpecificRecord 표준 명시(`specific.avro.reader=true`)
  - CloudEvents v1.0 헤더 매핑(`ce_id`, `ce_type`, `ce_source`, `ce_time`, `ce_specversion`)
  - 스키마 진화 규칙(default 필수·removal 금지·rename 금지) 베스트프랙티스
  - avro-tools/maven-avro-plugin 빌드 통합
- **§3.2 Resilience4j**:
  - Spring Boot 4 BOM 위임 버전(`spring-cloud-starter-circuitbreaker-resilience4j` 또는 `resilience4j-spring-boot3` 4.x)
  - Circuit Breaker / Retry / Bulkhead / Time Limiter / Rate Limiter 5개 모듈 중 사용 범위
  - Polling Relay에서 Kafka 발행 실패 시 Retry 정책(메모리 — exponential backoff)
  - Gateway 적용 여부(S2a 위임: CB 미설정 사실 그대로 S5 ADR로)
- **§3.3 Redis Token Bucket**:
  - Spring Cloud Gateway의 `RedisRateLimiter`(공식) vs `spring-cloud-gateway-mvc`의 자체 구현
  - replenishRate / burstCapacity / requestedTokens 의미
  - Lua 스크립트 원자성(공식 Redis 권장)
  - 키 네이밍 = `{tenant_id}:{user_id}` 일관성(02_ERD 멀티테넌시)
- **ShedLock 7.7.x 신설 검토**:
  - 의존성 좌표: `net.javacrumbs.shedlock:shedlock-spring:7.7.x` + `shedlock-provider-jdbc-template:7.7.x`
  - `@SchedulerLock(name = "outbox-relay", lockAtMostFor = "PT60S")` 표준
  - `shedlock` 테이블 마이그레이션 표준
  - JdbcTemplateLockProvider vs RedisLockProvider 선택 기준 (메모리: 기본=JDBC)
- **Outbox/Polling Relay 운영 패턴 신설 검토**:
  - 폴링 주기·batch size·`SKIP LOCKED`(메모리: 사용)·DLQ 정책
  - 단일 활성 + 해시샤딩 확장 트리거
  - 백프레셔(Kafka 실패 시 produce 차단·exponential backoff)
  - 백로그 모니터링(`outbox_event_pending_total` 지표)
  - 운영 함정(클럭 드리프트·트랜잭션 외 발행 금지·payload 압축 정책)

---

## Phase A — 작업 브랜치 + 동기화

### Task A1: 브랜치 + 동기화 + INDEX·HANDOFF 가져오기

- [ ] **Step 1: documents S4 브랜치 생성 (S3 머지 결과 main 기반)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout main
git pull --rebase origin main
git log --oneline -5
git checkout -b docs/stack-review-S4-event-sync
Pop-Location
```
Expected: 최근 커밋에 S3 보고서 PR #9 머지 포함. `Switched to a new branch 'docs/stack-review-S4-event-sync'`.

- [ ] **Step 2: documents.wiki 동기화**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
git log --oneline -5
Pop-Location
```
Expected: 최근 커밋이 S3 PR# 기입(`ed5ed04`)인지 확인. `git log`에서 `v2.3-S3` 변경 이력 행 직전 SHA 보임.

- [ ] **Step 3: INDEX/HANDOFF가 main에 이미 반영됐는지 확인**

S3 머지로 INDEX·HANDOFF 둘 다 이미 main에 있어야 함. 확인:
```
Push-Location 'C:\workspace\team-project-final\documents'
Get-Item docs\superpowers\specs\2026-05-28-stack-review-INDEX.md | Select-Object Length, LastWriteTime
Get-Item docs\superpowers\specs\2026-05-28-stack-review-HANDOFF.md | Select-Object Length, LastWriteTime
Pop-Location
```
Expected: 두 파일 모두 존재.

- [ ] **Step 4: INDEX S4 상태가 `pending`인지 확인**

`Grep`:
```yaml
pattern: "^\\| S4 \\|.*pending"
path: C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md
output_mode: content
-n: true
```
Expected: 매치 1줄.

---

## Phase B — S4 6 단계 파이프라인

### Task B1: Step 1 — 7개 항목 인벤토리 + 라인 범위 계산

- [ ] **Step 1: §5.4/§5.5/§5.6/§3.2/§3.3 절 헤더 위치 확인**

`Grep`:
```yaml
pattern: "^### (3\\.[123]|5\\.[4-7])(\\.[1-9])? "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §3.1·§3.2·§3.3·§5.4·§5.5·§5.6·§5.7 등 헤더 라인 번호 확보.

- [ ] **Step 2: 검증 대상 5개 절의 라인 범위 계산**

다음 절 시작 직전까지(S3 패치로 §5.x 라인이 이동했을 수 있음):
- §3.2 Resilience4j → §3.3 시작 직전
- §3.3 Redis Token Bucket → §3.4 또는 §4.x 시작 직전
- §5.4 Apache Kafka 3.x → §5.5 시작 직전
- §5.5 Confluent Schema Registry 7.x → §5.6 시작 직전
- §5.6 Apache Avro 1.11.x → §5.7 시작 직전

각 라인 범위를 Task B3 subagent 프롬프트에 임베드.

- [ ] **Step 3: ShedLock 및 Outbox/Relay 현재 언급 위치 스캔**

`Grep`:
```yaml
pattern: "ShedLock|@SchedulerLock|shedlock"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
```yaml
pattern: "outbox_event|OutboxRecorder|Polling Relay|PollingRelay|@Scheduled"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: ShedLock은 §1.4 표에만 1~2회. Outbox/Relay는 §5.4 v2.2 정합화 예제 + §5.1.1 S3 카탈로그 + §4.1.8 S2a Deep Dive 등 다수.

- [ ] **Step 4: cross-section 인용 + §10.1 요약표·§12 매트릭스 영향 확인**

`Grep`:
```yaml
pattern: "§(3\\.[23]|5\\.[456])|3\\.[23] 절|5\\.[456] 절"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §10.1 요약표·§12 호환 매트릭스에서 §3.2·§3.3·§5.4·§5.5·§5.6 인용 확인. v2.3 통합 정리 작업으로 위임될 가능성 식별.

---

### Task B2: Step 2 — skill-recommender (S4 키워드)

- [ ] **Step 1: 키워드 정의 + 실행**

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "kafka,apache kafka,confluent,schema registry,avro,cloudevents,resilience4j,circuit breaker,rate limit,redis,shedlock,outbox,debezium" `
  --limit 30 `
  --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S4-skill-rec.json
$data = Get-Content C:\Temp\_S4-skill-rec.json -Raw | ConvertFrom-Json
Write-Output "TOTAL=$($data.totalMatches)"
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 5 | ForEach-Object { "{0,-50} | {1,-12} | src={2,-25} | v={3}" -f $_.name, $_.type, $_.source, $_.verified }
Remove-Item C:\Temp\_S4-skill-rec.json -Force -ErrorAction SilentlyContinue
```
Expected: 0~2건 verified. Kafka MCP·Confluent CLI 후보 가능. 0건이면 context7 + WebFetch만 사용(S1·S2·S3 패턴).

- [ ] **Step 2: 채택 후보 5개 이내 선별**

S1·S2·S3 동일 기준. 결과 표는 보고서 §2에 그대로.

---

### Task B3: Step 3+4 — 7개 항목 통합 검증 (단일 subagent)

- [ ] **Step 1: subagent dispatch**

`Agent` 도구 (subagent_type=general-purpose) 호출. prompt:

```
You are verifying 7 event/sync wiki items of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-* code. Part of S4 Event/Sync session (after S1·S2a·S2b·S3 completed and all merged to main).

## Working directory
C:\workspace\team-project-final

## Sections to verify (Read each in C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md)

- §3.2 Resilience4j — L<from>-L<to>
- §3.3 Redis Token Bucket — L<from>-L<to>
- §5.4 Apache Kafka 3.x — L<from>-L<to>
- §5.5 Confluent Schema Registry 7.x — L<from>-L<to>
- §5.6 Apache Avro 1.11.x — L<from>-L<to>

(라인 범위는 controller가 Task B1에서 계산해 전달)

## NEW SECTION CANDIDATES (검토 후 신설 권고 결정)

- ShedLock 7.7.x 독립 절 — 현재 §1.4 표에만 존재. 메모리 표준 정착됨.
- Outbox/Polling Relay 운영 패턴 절 — §5.4에 예제만 존재, 운영 패턴 절 부재.

두 항목 각각에 대해:
- (a) 신설 필요 여부 판단 + 근거 (E1/E2/D/R 어디에 속하나)
- (b) 신설 권고 시 절 번호 제안 (§3.4·§5.4.1 등) + 본문 초안 제공

## CRITICAL: 메모리 정합성 검증 (S4 핵심)

먼저 Read:
- C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\data-sync-outbox-cqrs.md
- C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\spring-modulith-outbox-coexistence.md

핵심 표준(이 표준이 위키와 일치하는지가 본 세션 진실 기준):

[data-sync-outbox-cqrs]
- `outbox_event`·`user_ref`·`processed_events` 테이블 (02_ERD §2.3.A)
- OutboxMessageFactory: JSONB payload → Avro + CloudEvents 헤더 (event_type별 매퍼 레지스트리, 자동 역직렬화 지양)
- Polling Relay = @Scheduled + ShedLock 7.7.x 단일 활성, 확장 시 해시샤딩/advisory lock
- 파티션 키 = `{tenant_id}:{aggregate_id}` (테넌트 단독 키 폐기 — 핫파티션 회피)
- 와이어 포맷 Avro (JSON 시작은 안티패턴). outbox payload만 JSONB(가독성)
- 정합성 보증 = 소비측 version 가드(`WHERE EXCLUDED.version > 현재`) + `processed_events` 멱등
- Kafka는 서비스 경계 넘을 때만 (서비스 내부는 DB 트랜잭션/Modulith)

[spring-modulith-outbox-coexistence]
- `spring-modulith-events-kafka` 사용 금지 (모든 도메인 이벤트가 자동 Kafka 발행되어 Outbox 표준과 충돌)
- Modulith Event Publication Registry(`event_publication` 자동) ↔ Outbox(`outbox_event` 직접) 채널 분리
- 외부 발행은 명시적 `outbox_event` INSERT
- 3-INSERT 패턴: Note 저장 + publishEvent(Modulith 내부) + outboxRecorder.record(외부) — 한 트랜잭션

검증 시:
- §5.4 Kafka 본문/예제가 위 표준을 따르는지 — v2.2 정합화(2026-05-28)에서 KafkaAvroSerializer + OutboxRecorder 패턴으로 갱신됐으므로 다시 검증
- §5.5 Schema Registry 본문에 subject naming·compatibility 정책 명시 여부
- §5.6 Avro 본문에 SpecificRecord + CloudEvents 헤더 매핑 명시 여부
- 어디든 `spring-modulith-events-kafka` 언급되면 즉시 E1 (P0 가능)

## S2a 위임 잔여 확인 (§3.1 → S5, §3.2는 본 세션)

- §3.2 Resilience4j 검증에서 Gateway 적용 위치(synapse-gateway) 확인
- Gateway에 CB 미설정이면 그 사실 그대로 S5 ADR 위임 항목으로 보고 (코드 수정 권고만, 본 세션에서 위키 정정은 §3.2 Resilience4j 자체 정합으로 한정)

## Step A — context7 / WebFetch

각 기술마다 `mcp__plugin_context7_context7__resolve-library-id` → `query-docs`:

- "apache kafka" → topics: producer idempotence (enable.idempotence default in 3.0+), acks=all, max.in.flight.requests.per.connection, transactional producer, isolation.level=read_committed, partition assignment strategies (CooperativeStickyAssignor)
- "spring kafka" → topics: KafkaTemplate, @KafkaListener, container properties, error handlers (DefaultErrorHandler + DLT), 4.0.x compatibility with Boot 4
- "confluent schema registry" → topics: subject naming strategies (TopicNameStrategy / RecordNameStrategy / TopicRecordNameStrategy), compatibility (BACKWARD/FORWARD/FULL/NONE/_TRANSITIVE), auto.register.schemas (운영=false 표준), 7.x version
- "apache avro" → topics: SpecificRecord generation, schema evolution rules (default required for new fields, no rename, no remove), CloudEvents v1.0 binary mode mapping
- "resilience4j" → topics: CircuitBreaker / Retry / Bulkhead / TimeLimiter / RateLimiter, Spring Boot 3 starter (resilience4j-spring-boot3), reactive support, Micrometer integration
- "spring cloud gateway" → topics: RedisRateLimiter (replenishRate, burstCapacity, requestedTokens), KeyResolver, Lua script 원자성
- "shedlock" → topics: @SchedulerLock, LockProvider implementations (JdbcTemplate, Redis), lockAtMostFor / lockAtLeastFor, 7.x version (Java 21+), shedlock 테이블 마이그레이션 DDL
- "cloudevents" → topics: v1.0 spec, Kafka protocol binding (binary vs structured), required attributes (id, source, type, specversion)

Fallback WebFetch (context7 매핑 실패 시):
- kafka.apache.org/documentation/
- docs.confluent.io/platform/current/schema-registry/
- avro.apache.org/docs/1.11.1/
- resilience4j.readme.io/docs/
- docs.spring.io/spring-cloud-gateway/reference/
- github.com/lukas-krecan/ShedLock
- github.com/cloudevents/spec

## Step B — 실 코드 대조 (synapse-*)

Read·Grep:

(1) build.gradle.kts 모음:
```
Grep pattern: "kafka|avro|confluent|resilience4j|shedlock|cloudevents"
glob: "synapse-*/build.gradle.kts"
glob: "synapse-*/*/build.gradle.kts"
output_mode: content
```

(2) application*.yml 모음:
```
Grep pattern: "spring\\.kafka|schema\\.registry|resilience4j|spring\\.cloud\\.gateway|redis-rate-limiter|RedisRateLimiter|shedlock"
glob: "synapse-*/src/main/resources/application*.yml"
glob: "synapse-*/*/src/main/resources/application*.yml"
output_mode: content
```

(3) Outbox/Relay 구현:
```
Grep pattern: "OutboxRecorder|OutboxMessageFactory|@Scheduled|@SchedulerLock|outboxRelay|PollingRelay"
glob: "synapse-*/src/main/java/**/*.java"
output_mode: files_with_matches
```

(4) Kafka producer 설정 (Avro Serializer·idempotence):
```
Grep pattern: "KafkaAvroSerializer|enable\\.idempotence|acks|isolation\\.level|specific\\.avro\\.reader|TopicNameStrategy"
output_mode: content
```

(5) Resilience4j 적용 위치:
```
Grep pattern: "@CircuitBreaker|@Retry|@Bulkhead|@TimeLimiter|RateLimiter|resilience4j\\."
output_mode: content
```

(6) Gateway Rate Limit:
```
Grep pattern: "RedisRateLimiter|replenishRate|burstCapacity|requestedTokens|KeyResolver"
glob: "synapse-gateway/**/*"
output_mode: content
```

(7) ShedLock 마이그레이션 + 설정:
```
Grep pattern: "CREATE TABLE.*shedlock|LockProvider|JdbcTemplateLockProvider|@EnableSchedulerLock"
output_mode: content
```

(8) Modulith events-kafka 금지 확인 (이 의존성이 어디든 보이면 P0):
```
Grep pattern: "spring-modulith-events-kafka"
glob: "synapse-*/**/*"
output_mode: content
```

(9) outbox_event/user_ref/processed_events 마이그레이션 실재 여부:
```
Grep pattern: "CREATE TABLE.*(outbox_event|user_ref|processed_events|shedlock|event_publication)"
glob: "synapse-*/src/main/resources/db/migration/V*.sql"
output_mode: content
```

Cross-check 위키 명시 버전 vs 실제:
- Kafka clients 위키: 3.x → 실제 (Spring Boot 4 BOM 위임 가능)
- Schema Registry 위키: 7.x → 실제 (kafka-avro-serializer 버전)
- Avro 위키: 1.11.x → 실제
- Resilience4j 위키: 2.x 가정 → 실제
- ShedLock 위키 §1.4: 7.7.x → 실제

## Step C — 분류 / Step D — YAML 출력 (finding_id = ES-F##)

```yaml
finding_id: ES-F01
section: "§5.4 Apache Kafka 3.x"
class: E1            # E1 | E2 | D | R | OK
severity: P1         # P0 | P1 | P2
title: "<짧은 한국어 제목>"
evidence_official: |
  <context7 인용 또는 공식 URL>
evidence_repo: |
  <synapse-*/path:LN — 해당될 때>
current_text: |
  <18 문서 현재 표현 발췌, 줄바꿈 유지>
proposed_text: |
  <대체 또는 추가 markdown, 즉시 Edit 가능한 형태>
patch_target: "documents.wiki/18_기술_스택_정의서.md L<from>-L<to>"
deep_dive: false     # R 클래스일 때 true
```

R 클래스는 deep_dive: true + Deep Dive 부속 서브섹션 본문 포함.
OK 항목은 짧은 형식(section + class:OK + 한 줄 근거 + evidence_official 1~2 링크).

신설 절 후보(ShedLock·Outbox 운영 패턴)는 별도 finding으로:
```yaml
finding_id: ES-F##
section: "(신설 후보) §3.4 ShedLock 7.7.x" 또는 "(신설 후보) §5.4.1 Outbox/Polling Relay 운영 패턴"
class: R             # 신설 권고는 R 클래스
severity: P1
title: "..."
evidence_official: |
  ...
evidence_repo: |
  ...
proposed_text: |
  <신설할 절 본문 markdown — heading 포함 즉시 삽입 가능>
patch_target: "documents.wiki/18_기술_스택_정의서.md (신설: L<insert_after> 직후 삽입)"
deep_dive: true
```

## Step E — 자기 점검

- [ ] context7 또는 WebFetch 사용 (7개 항목 모두)
- [ ] 모든 finding에 evidence_official 또는 evidence_repo
- [ ] 5개 명시 절 각각 최소 1개 finding
- [ ] 신설 검토 2개 항목 각각 결정(신설 권고 or 보류) + 근거
- [ ] OK 항목 최소 3개
- [ ] 메모리 data-sync-outbox-cqrs 정합성 검증 결과 명시
- [ ] 메모리 spring-modulith-outbox-coexistence 정합성 검증 결과 명시 (events-kafka 의존성 부재 확인)
- [ ] §3.2 Resilience4j 검증에 Gateway CB 적용 여부 확인 결과 포함 (S5 ADR 위임 사실 기록)
- [ ] proposed_text가 즉시 Edit 가능한 형태

## Report Format

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Findings (ES-F##): <count> total — E1:_ E2:_ D:_ R:_ OK:_
Severity: P0:_ P1:_ P2:_
New section recommendations:
  - ShedLock 7.7.x: <RECOMMEND_NEW_SECTION | KEEP_IN_TABLE_ONLY> + 근거
  - Outbox/Polling Relay 운영 패턴: <RECOMMEND_NEW_SECTION | EXPAND_§5.4_ONLY> + 근거
<YAML findings>
Memory consistency:
  - data-sync-outbox-cqrs: <CONSISTENT | DRIFT | UNDOCUMENTED_IN_WIKI>
  - spring-modulith-outbox-coexistence: <CONSISTENT | DRIFT> + events-kafka 의존성 발견 여부
Self-review:
Concerns:
```

## 주의

- 파일 수정·git 작업 절대 금지 (controller가 수행)
- 한국어 사용자 → 한국어 출력
- 추정 X — 공식 또는 실 코드 인용. 매핑 실패 시 D/R로 분류(E1 단정 회피)
- §5.7 AWS S3는 S3 세션에서 완료 — 건드리지 말 것
- §3.1 Gateway는 S5 위임 — 본 세션 비대상. 단 §3.2 Resilience4j 검증 중 Gateway CB 사실은 그대로 기록
- §6 RAG 절은 S2a/S2b → S6 위임 — 건드리지 말 것
- 작업 디렉토리: C:\workspace\team-project-final
```

- [ ] **Step 2: subagent 결과 수신**

ES-F## 형식. controller가 S4-F##로 통합 번호 변환(S1 = S1-F##, S2a = F##, S2b = SB-F## 또는 F##, S3 = S3-F## 패턴 따라).

신설 검토 2개 항목의 결정(RECOMMEND_NEW_SECTION vs KEEP_IN_TABLE_ONLY)을 controller가 보고서 §6 Deep Dive 일람에 표시.

---

### Task B4: Step 5 — 보고서 9 섹션 작성

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤 생성**

`Write` 도구로 `documents/docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md` 생성:

```markdown
# 18 기술 스택 정의서 검증 — S4 이벤트/동기화

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S3 후 v2.3-S3 상태)
> 위키 패치 커밋: (Task B6에서 기입)
> 메모리 정합: data-sync-outbox-cqrs · spring-modulith-outbox-coexistence

## 0. 요약 (Summary)
## 1. 카테고리 인벤토리 (Step 1)
## 2. skill-recommender 결과 (Step 2)
## 3. 공식 문서 검증 결과 (Step 3)
## 4. 실 코드 대조 결과 (Step 4)
## 5. 발견사항 (Findings)
## 6. "더 깊이 / Deep Dive" 보강 항목 일람
## 7. 위키 패치 diff 요약
## 8. 후속 과제 (Follow-ups)
```

- [ ] **Step 2: §1~§6 채우기**

S1·S2·S3 패턴 동일. ES-F## → S4-F## 통합 번호.

§6에 신설 절 결정 표시:
- ShedLock 7.7.x: 신설 권고 시 §3.4 (또는 subagent 제안 위치) 본문 초안 그대로
- Outbox/Polling Relay 운영 패턴: 신설 권고 시 §5.4.1 본문 초안 그대로

§8에 추가할 항목:
- 본 세션 처리: 메모리 data-sync-outbox-cqrs + spring-modulith-outbox-coexistence 정합 확인 결과
- 본 세션에서 발견된 코드 PR 후보 (P0/P1):
  - outbox_event/user_ref/processed_events 마이그레이션 미구현(이미 INDEX 후속 큐) — 정합 재확인
  - Polling Relay 실 구현 여부 / ShedLock 의존성 추가 필요 여부
  - Gateway CircuitBreaker 미설정 (S2a 발견 재확인, S5 ADR 위임)
- S5 위임 (그대로): §3.1 Gateway 운영 정책 ADR (JWT·CB)
- S6 위임 (그대로): §6 RAG 절 LangChain 잔존
- 별도 작업: §10.1 / §12.4 매트릭스에 ShedLock/Resilience4j/Avro 버전 정합 반영(v2.3 통합 시)

- [ ] **Step 3: §0 요약 통계 + 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S4-event-sync.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S4-event-sync.md' -Pattern '^### S4-F\d' | Measure-Object | Select-Object Count
# Expected: 최소 7개 (명시 5 + 신설 2)
```

---

### Task B5: Step 6 — 위키 패치 적용

- [ ] **Step 1: 사전 동기화 재확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```

- [ ] **Step 2: E1/E2/D 클래스 finding 제자리 교체**

§5에서 정리한 각 finding의 `current_text` → `proposed_text`로 `Edit` 호출. S4 영역 §3.2·§3.3·§5.4·§5.5·§5.6.

특히 주의:
- §5.4 Kafka v2.2 정합화(KafkaAvroSerializer + OutboxRecorder 예제)는 유지·강화. 무너뜨리는 패치 금지.
- §4.1.8 Modulith(S2a 처리)·§5.1.1 PostgreSQL 4테이블 카탈로그(S3 처리)는 건드리지 말 것 (cross-reference만 추가 가능).
- `spring-modulith-events-kafka` 의존성 언급이 어디든 보이면 즉시 E1·P0로 정정.

- [ ] **Step 3: R 클래스 Deep Dive 부속 서브섹션 삽입**

S1·S2·S3 동일 형식:
```markdown
#### 더 깊이 / Deep Dive
> 출처: <공식 URL 또는 context7 query>  · 검증 일자: 2026-05-28

- **<주제 1>**: ...
- **<주제 2>**: ...
- **실전 베스트프랙티스**: ...
- **운영 함정**: ...
```
"참고 자료" 직전.

- [ ] **Step 4: 신설 절 삽입 (subagent가 RECOMMEND_NEW_SECTION으로 결정한 경우만)**

- ShedLock 7.7.x 독립 절 — §3.3과 §3.4 사이(또는 subagent 제안 위치)에 신설
- Outbox/Polling Relay 운영 패턴 — §5.4 내부 `####` 서브섹션으로 추가하거나 §5.4.1로 신설(subagent 제안 따름)

신설 절은 §11 변경 이력에 "신설"로 명시.

- [ ] **Step 5: §11 변경 이력 갱신**

```
| v2.3-S4 | 2026-05-28 | Synapse Team | S4 이벤트/동기화 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>). §3.2 Resilience4j / §3.3 Redis Token Bucket / §5.4 Apache Kafka 3.x / §5.5 Confluent Schema Registry 7.x / §5.6 Apache Avro 1.11.x. (신설 여부에 따라) ShedLock 7.7.x 독립 절 / Outbox·Polling Relay 운영 패턴 절 신설. 메모리 data-sync-outbox-cqrs + spring-modulith-outbox-coexistence 정합 확인. (구체 변경: subagent 결과 기반 controller가 작성) |
```

S3 행 다음에 추가.

- [ ] **Step 6: 패치 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
Pop-Location
```
Expected: 단일 파일 변경. 라인 수 증가량은 신설 절 여부에 따라 가변.

---

### Task B6: Step 6 — 위키 단일 커밋 + 푸시 + 보고서 헤더 SHA 기입

- [ ] **Step 1: 커밋 + 푸시 + SHA 캡처**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S4 이벤트/동기화 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

§3.2 Resilience4j / §3.3 Redis Token Bucket / §5.4 Apache Kafka 3.x / §5.5 Confluent Schema Registry 7.x / §5.6 Apache Avro 1.11.x
(신설 여부에 따라) + ShedLock 7.7.x 독립 절 / Outbox·Polling Relay 운영 패턴 절

메모리 정합 확인:
- data-sync-outbox-cqrs (Outbox/Relay/파티션 키/version 가드)
- spring-modulith-outbox-coexistence (events-kafka 금지·event_publication ↔ outbox_event 분리)

주요 정정:
- (controller가 §5/§7 기반으로 채움)

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```

- [ ] **Step 2: 보고서 헤더 위키 SHA 기입 + §7 diff 요약**

`Edit`로 헤더 "위키 패치 커밋:" 라인을 `documents.wiki@$wikiSha`로 교체.
§7에 `git show --stat $wikiSha` 기반 diff 요약 표 (S1·S2·S3 형식).

---

## Phase C — 보고서 PR + INDEX/HANDOFF 갱신

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: 보고서 + INDEX + HANDOFF 스테이징 + 커밋**

INDEX 갱신:
- S4 행: `pending` → `completed`, 보고서 PR(추후 #), 위키 SHA, E1/E2/D/R/OK, P0/P1/P2, 시작/종료일
- 누적 통계: 5세션 합산
- "세션 간 발생한 교차 발견사항": S4 처리 사항 + S5/S6 위임 추가
- 후속 과제 큐: 본 세션 발견 추가

HANDOFF 갱신 (v1.1):
- §1 한 줄 요약: "5 세션 완료 / 2 세션 남음(S5·S6)"
- §2 완료 표에 S4 행 추가
- §2 메모리 표에서 S4가 사용한 메모리 표시 정리
- §3 "선택지 A"를 삭제 또는 "(완료)"로, "선택지 B/C"를 새로운 권장 다음으로 재정렬
- §5 후속 코드 PR 큐: S4에서 발견된 항목 추가(있다면)
- §8 변경 이력: v1.1 추가

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md
git status --short
git commit -m @'
docs(stack-review): S4 이벤트/동기화 보고서

위키 커밋: documents.wiki@<wikiSha>

- S4 보고서 9 섹션 완성
  - Apache Kafka / Schema Registry / Avro / Resilience4j / Redis Token Bucket (5개)
  - (신설 여부에 따라) ShedLock 7.7.x / Outbox·Polling Relay 운영 패턴
  - <N> findings — E1:a · E2:b · D:c · R:d · OK:e
  - P0:x · P1:y · P2:z
- 메모리 정합 확인:
  - data-sync-outbox-cqrs (Outbox/Relay/파티션 키)
  - spring-modulith-outbox-coexistence (events-kafka 금지)
- INDEX: S4 completed + 누적 통계 갱신
- HANDOFF: v1.1 — 5세션 완료/2세션 남음(S5·S6)
- S5 위임: §3.1 Gateway 운영 ADR (JWT·CB)
- S6 위임: §6 RAG 절 LangChain 잔존

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push -u origin docs/stack-review-S4-event-sync
Pop-Location
```

- [ ] **Step 2: PR 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
gh pr create `
  --base main `
  --head docs/stack-review-S4-event-sync `
  --title "docs(stack-review): S4 이벤트/동기화" `
  --body @'
## 개요

18 기술 스택 정의서 카테고리 검증의 다섯 번째 세션(S4 이벤트/동기화).
Apache Kafka 3.x / Confluent Schema Registry 7.x / Apache Avro 1.11.x / Resilience4j / Redis Token Bucket 5개 명시 + ShedLock 7.7.x 독립 절·Outbox/Polling Relay 운영 패턴 절 신설 검토.

## 산출

- 보고서: docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md
- 위키 커밋: documents.wiki@<wikiSha>
- INDEX: S4 completed + 누적 통계
- HANDOFF: v1.1 — 5세션 완료/2세션 남음(S5·S6)

## 통계

- E1:a · E2:b · D:c · R:d · OK:e
- P0:x · P1:y · P2:z

## 메모리 정합 확인

본 세션의 진실 원천 2건:
- `data-sync-outbox-cqrs`: §5.4 Kafka 본문/예제 ↔ Outbox/Relay/파티션 키 `{tenant_id}:{aggregate_id}`/version 가드 표준 일관
- `spring-modulith-outbox-coexistence`: `spring-modulith-events-kafka` 의존성 부재 확인, event_publication ↔ outbox_event 채널 분리 명시 여부 검증

(controller가 결과 기반으로 채움)

## 주요 정정

(controller가 §5/§7 결과 기반으로 P0/P1 항목 3~5건 bullet 정리)

## 신설 절 결정

- ShedLock 7.7.x 독립 절: <RECOMMEND_NEW_SECTION | KEEP_IN_TABLE_ONLY> + 근거
- Outbox/Polling Relay 운영 패턴: <RECOMMEND_NEW_SECTION | EXPAND_§5.4_ONLY> + 근거

## S5/S6 위임

- S5: §3.1 Gateway 운영 ADR (JWT 미구현·CircuitBreaker 미설정, S2a부터 위임된 항목 재확인)
- S6: §6 RAG 절 LangChain 잔존 (S2a §4.2.4 Direct SDK 패턴과 일관성)

## 관련

- 마스터 스펙: docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md (PR #5, MERGED)
- S1: PR #6 / S2a: PR #7 / S2b: PR #8 / S3: PR #9 (모두 MERGED) / 본 PR (S4)
- 플랜: docs/superpowers/plans/2026-05-28-stack-review-S4-event-sync.md
- 메모리: data-sync-outbox-cqrs, spring-modulith-outbox-coexistence, git-pr-workflow

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
$prNumber = (gh pr view --json number -q .number)
Write-Output "PR_NUMBER=$prNumber"
Pop-Location
```

---

### Task C2: 위키 §11 PR# 교체

> S1·S2·S3 dual-commit 예외 동일 (마스터 스펙 §5.3 의도된 예외).

- [ ] **Step 1: §11 행 교체 + 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
# Edit로 v2.3-S4 행의 #<TBD> → #<prNumber> 교체
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S4 변경 이력 행에 PR 번호 기입

Refs: documents PR #<prNumber>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
Pop-Location
```

---

### Task C3: INDEX/HANDOFF 최종 갱신 + DoD 검증

- [ ] **Step 1: INDEX S4 행에 PR 번호 추가 + 누적 통계 재확정**

S4 행 보고서 PR 컬럼을 `[#<prNumber>](https://github.com/team-project-final/documents/pull/<prNumber>)` 형식으로 갱신.

- [ ] **Step 2: HANDOFF v1.1 보고서 PR 링크 추가**

§2 완료 표의 S4 행에 PR# 링크 기입.

- [ ] **Step 3: 보고서 헤더에 PR 링크 추가**

S1·S2·S3 패턴 동일: `> 보고서 PR: documents#<prNumber>`

- [ ] **Step 4: 추가 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md
git add docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md
git commit -m @'
docs(stack-review): S4 INDEX/HANDOFF 갱신 + 보고서 PR 링크

- INDEX: S4 PR# 기입
- HANDOFF v1.1: 5세션 완료 표에 S4 PR# 기입
- 보고서 헤더: PR 링크 추가
- S5/S6 위임 항목 재정렬

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin docs/stack-review-S4-event-sync
Pop-Location
```

- [ ] **Step 5: DoD 검증 (마스터 스펙 §6.3)**

다음 모두 충족 확인:
```
# 1. 보고서 9 섹션 모두 채워짐
Select-String -Path '...S4-event-sync.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9

# 2. 모든 finding에 evidence_official OR evidence_repo (subagent 자기 점검에서 확인됨)

# 3. 모든 E1/E2/D 항목이 patch_target에 매핑

# 4. 위키 커밋 SHA 헤더 기입 확인
Select-String -Path '...S4-event-sync.md' -Pattern 'documents.wiki@[0-9a-f]{7,40}' | Measure-Object | Select-Object Count
# Expected: 1 이상

# 5. PR OPEN 확인
Push-Location 'C:\workspace\team-project-final\documents'
gh pr view --json state,number,url
Pop-Location

# 6. INDEX·HANDOFF 갱신·푸시 완료
# 7. 위임 항목 INDEX/HANDOFF에 기록
# 8. 후속 과제 INDEX/HANDOFF에 추가
# 9. 메모리 갱신 후보 식별
```

- [ ] **Step 6: 사용자 보고**

```
S4 이벤트/동기화 세션 완료.

- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- 메모리 정합:
  - data-sync-outbox-cqrs ↔ §5.4/§5.5/§5.6 (일관/표류 결과)
  - spring-modulith-outbox-coexistence ↔ events-kafka 의존성 부재 확인
- 신설 절 결정: ShedLock 7.7.x = <yes/no> / Outbox·Polling Relay 운영 패턴 = <yes/no>
- 누적: 32~34/45 기술 검증 (S4까지 5 세션 완료)

다음: S5 운영/관측성 또는 S6 외부·AI (별도 writing-plans)
- HANDOFF v1.1 §3에 두 선택지 재정렬됨
```

---

## 부록 — 비상 절차

S1·S2·S3 동일.

- **위키 push 후 보고서 push 누락**: 마스터 스펙 §5.4. INDEX `in_progress` 표시 후 즉시 보고서 push 재시도.
- **subagent 분량 초과 → BLOCKED**: 보고서 §8 후속 과제로 일부 위임, 신설 절 결정 보류 가능. 분할 가능하면 controller가 §5.4 단독 재dispatch.
- **context7 매핑 실패**: WebFetch로 18 명시 URL 직접 패치. 그래도 실패 시 evidence_official 부재 표시 + finding은 D/R로 분류(E1 단정 회피).
- **`spring-modulith-events-kafka` 의존성 발견 시**: 즉시 P0 finding, 코드 PR 후속 큐에 즉시 처리 권고 추가, 위키 §4.1.8 Deep Dive 보강.
- **롤백**: 위키 `git revert <sha>` + 보고서 PR close 또는 revert 커밋. INDEX에 `reverted` + 사유.

---

## 추정 시간

- Phase A: 10분
- Phase B: 2.5~3시간 (7개 항목, S2a 분량보다 작고 S3보다 큼. 신설 절 본문 작성 시간 포함)
- Phase C: 30분

총: ~3시간

---

## 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | S4 이벤트/동기화 세션 플랜 초안 — 5개 명시 + 2개 신설 검토, 단일 subagent, 메모리 2건 정합 검증 핵심 |
