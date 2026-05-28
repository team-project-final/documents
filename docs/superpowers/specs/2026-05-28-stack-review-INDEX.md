# 18 기술 스택 정의서 — 카테고리 검증 진행판

작성일: 2026-05-28
마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2 → v2.3 (예정)

## 세션 진척

| 세션 | 카테고리 | 상태 | 보고서 PR | 위키 커밋 | E1/E2/D/R/OK | P0/P1/P2 | 시작일 | 종료일 |
|------|---------|------|---------|---------|-------------|---------|--------|--------|
| S1 | 언어 | completed | [#6](https://github.com/team-project-final/documents/pull/6) | documents.wiki@6f042fc | 9/10/4/3/4 | 6/11/13 | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 (S2a 백엔드) | completed | [#7](https://github.com/team-project-final/documents/pull/7) | documents.wiki@493a7ba | 8/8/5/6/10 | 5/6/16 | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 (S2b 프론트) | completed | [#8](https://github.com/team-project-final/documents/pull/8) | documents.wiki@463c43d | 11/6/0/1/6 | 0/5/13 | 2026-05-28 | 2026-05-28 |
| S3 | 데이터 | completed | [#9](https://github.com/team-project-final/documents/pull/9) | documents.wiki@f54fd1f | 2/0/4/7/4 | 3/2/8 | 2026-05-28 | 2026-05-28 |
| S4 | 이벤트 | completed | [#11](https://github.com/team-project-final/documents/pull/11) | documents.wiki@0a7e5a2 | 3/4/1/2/4 | 0/7/7 | 2026-05-28 | 2026-05-28 |
| S5 | 운영 | in_progress | [#12](https://github.com/team-project-final/documents/pull/12) (진척 핸드오프) | - | - | - | 2026-05-28 | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 34 / 약 45
  - S1 (언어 3): Java 21, Python 3.12, Dart 3.x
  - S2a (백엔드 12): SCG 5, Boot 4, Security 7, JPA+Hibernate 7, Flyway 11, WebFlux, Testcontainers, Modulith 2.0, FastAPI, uvicorn, LangChain→Direct SDK, httpx
  - S2b (프론트 7): Flutter 3.x, Riverpod, GoRouter, Sliver, google_fonts, CanvasKit, D3.js→CustomPainter, flutter_test
  - S3 (데이터 5): PostgreSQL 16, pgvector, Redis 7, Elasticsearch 8 / OpenSearch 2.x + nori, AWS S3
  - S4 (이벤트 7): Apache Kafka 3.x, Confluent Schema Registry 7.x, Apache Avro 1.11.x, Resilience4j, Redis Token Bucket + **신설**: ShedLock 7.7.x, Outbox/Polling Relay 운영 패턴
- E1: 33 · E2: 28 · D: 14 · R: 19 · OK: 28
- P0: 14 · P1: 31 · P2: 57
- 문서 자체 결함 누계: 2건 (§2.4·§2.5 절 번호 충돌 — S2b에서 해소 완료)

## 세션 간 발생한 교차 발견사항

### S1 → S2a/S2b 처리 완료
- ✅ **§4.1.2 Spring Boot 4 "Virtual Threads 자동 활성화" 오기** — S2a-F01/F02로 정정
- ✅ **§1.4 표 LangChain 행** — S2a-F28로 정정
- ✅ **§12.3 Python AI 버전 매핑·§12.5 충돌 표** — S2a 정정 완료
- ✅ **§2.4·§2.5 절 번호 충돌** — S2b에서 §2.5/§2.6/§2.7/§2.8/§2.9 재번호 부여로 해소
- ✅ **§2.1 Flutter SDK 제약 정정** — S2b-F01
- ✅ **§2.x `syn/` 경로 잔존** — S2b에서 5개 절 일괄 정리

### S3 처리 완료
- ✅ **메모리 `data-sync-outbox-cqrs` 정합 검증** — §5.1.1에 핵심 테이블 카탈로그 신설 (Outbox/CQRS/Modulith Registry/멱등 4종)
- ✅ **§5.2 Redis "Cluster" 단정 → standalone 시정** — 현재/미래 박스 병기
- ✅ **§5.3 "ES 8" 단독 → ES/OpenSearch 공존 표기** — 라이선스·결정 ADR S5로 위임

### S4 처리 완료
- ✅ **메모리 `data-sync-outbox-cqrs` 정합 검증** — §5.4 본문/예제 + §5.4.1 신설로 진실의 단일 출처 정착 (CONSISTENT)
- ✅ **메모리 `spring-modulith-outbox-coexistence` 정합 검증** — `spring-modulith-events-kafka` 의존성 부재 재확인 (CONSISTENT)
- ✅ **§4.1.9 ShedLock 7.7.x 독립 절 신설** — 어노테이션·LockProvider.usingDbTime·DDL·learning-card 실 구현·트러블슈팅·운영 임계값 표준
- ✅ **§5.4.1 Outbox/Polling Relay 운영 패턴 절 신설** — 폴링 2-5초·batch 50-200·SKIP LOCKED·DLQ·해시샤딩·CloudEvents 매핑·Prometheus 알람 임계값
- ✅ **§3.2 Resilience4j / §3.3 RedisRateLimiter** — `api-gateway/`→`synapse-gateway/` 경로 정정 + 현재 미적용 사실 명시(S5 ADR 위임)
- ✅ **§3.3 per-minute → per-second 단위 정정** — Spring Cloud Gateway 표준 단위 정합
- ✅ **§3.2 Aspect Order 트러블슈팅 추가** — Spring Boot 3 CB priority=1 / Retry priority=2
- ✅ **§5.4 max.in.flight 4.0.0+ 주석** — fallback 제거 사실 추가
- ✅ **§5.5 auto.register 운영=false + Subject Naming Strategy 보강**
- ✅ **§5.6 Avro 1.11.3 vs 1.12.0 분기 메모** — learning-card 1.11.3 정렬 권장

### S2a → S5 위임 (유지)
- **§3.1 Gateway JWT 미구현 + CircuitBreaker 미설정**

### S4 → S5 위임
- **§3.2 Resilience4j Gateway 도입 결정** (S4-F01·F14 사실 기록 → S5 ADR화)
- **§3.3 RedisRateLimiter 플랜별 분기 결정** (S4-F03·F04 사실 기록 → S5 ADR화)

### S5 진척 중단 (2026-05-28, in_progress)

- 작업 브랜치: `docs/stack-review-S5-operations`
- **완료**: Phase A(브랜치/동기화 — S4 머지로 cherry-pick 불필요) · Phase B1(인벤토리, 12개 라인 범위 확정) · Phase B2(skill-recommender, 8건 verified MCP 발견 — 본 검증 비사용)
- **중단**: Phase B3 두 subagent 병렬 dispatch 첫 시도 시 API 529 Overloaded × 2회 + 사용자 인터럽트
- **다음 세션이 이어받기**: 동일 브랜치 checkout → Phase B3부터. 라인 범위·메모리 정합 대상은 HANDOFF v1.2 §"S5 이어받기" 절 참조

### S3 → S5 위임 (운영 세션)
- **Redis Cluster 운영 정책 ADR** (전환 트리거 RPS/메모리 임계치)
- **ES vs OpenSearch 결정 ADR** (라이선스·AWS Managed Service·기능 fast-follow 평가)
- **S3 운영** (KMS 키 정책·Object Lock·Lifecycle·이벤트 알림 라우팅)

### S2a/S2b → S6 위임 (유지)
- **§6 RAG 절들의 LangChain 잔존 언급**

## 후속 과제 큐 (Follow-ups)

### 별도 코드 PR (위키 정정과 분리, 실 코드 수정 필요)
- **(P0)** `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 수정 (S2a 발견)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:81` Spring Modulith `1.3.0` → `2.0.6` (S2a 발견)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:L55` Avro `1.12.0` → `1.11.3` 정렬 (S4-F10)
- **(P1)** `synapse-learning-svc/learning-card/src/main/resources/application.yml` Kafka producer에 `properties.auto.register.schemas: false` 운영 프로필 추가 (S4-F08)
- **(P1)** Outbox 패턴 도입 시 platform-svc/knowledge-svc/engagement-svc에 ShedLock 7.7.x 도입 + `shedlock` 마이그레이션 (S4-F12·F13 신설 절이 표준)
- **(P1)** `outbox_event` / `user_ref` / `event_publication` 마이그레이션 작성 (S3 발견) — Outbox/CQRS 패턴 본격 도입
- **(P1)** AWS S3 AttachmentService 구현 (synapse-knowledge-svc, S3 발견) — `software.amazon.awssdk:s3:2.28.x` 의존성 추가
- **(P2)** Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0)
- **(P2)** Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
- **(P2)** note_chunks embedding NOT NULL 통일 (S3-F05, 비동기 백필 후)
- **(P2)** HNSW partial index 추가 (knowledge-svc, S3-F06)
- **(P2)** ES vs OpenSearch 결정 후 인프라 통일
- **(별도 결정)** 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부

### 별도 작업 (v2.3 통합 정리, 6 세션 종료 후)
- **§10.1 요약표** S1+S2+S3+S4 변경 반영 (ShedLock §4.1.9 / Outbox §5.4.1 행 추가)
- **§12.2 Flutter 생태계 버전 매핑**: go_router 14→17, google_fonts 6→8, freezed/build_runner 제거
- **§12.4 인프라 버전 요구사항**: Redis 7.4 LTS, ES vs OpenSearch 표기, pgvector 0.8.x, ShedLock 7.7.x, Avro 1.11.3 단일화
- **§4.2.4·§2.8 재작성**이 §1.4 본문·§10.1 매트릭스와 일관 여부 재확인
- **§1.4 기술 스택 전체 목록 표** S3+S4 발견사항 반영 (신설 절 §4.1.9·§5.4.1)

### 별도 결정 사항
- **5주 단축 일정 트레이드오프 ADR화 검토** (§2.8 Deep Dive 정착 사실)
- **integration_test 실제 작성** (Phase D 이후, §2.9 명시)

### 운영 표준 예외 기록
- S1·S2a·S2b·S3·S4 각각 위키에 추가 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 dual-commit 의도된 예외. S5·S6도 동일 패턴.

## 메모리 갱신 후보
- ✅ **`python-ai-stack-direct-sdk`** — S1 종료 시 생성. S2a §4.2.4·§12.3/§12.5 정정에 활용.
- ✅ **`spring-modulith-outbox-coexistence`** — S2a §4.1.8 Deep Dive로 정착. S4에서 events-kafka 부재 재확인 (CONSISTENT).
- ✅ **`flutter-frontend-policy`** — S2b 정착 정책: Riverpod manual / CustomPainter / integration_test Phase D 이후.
- ✅ **`data-sync-outbox-cqrs`** — S4에서 §5.4 본문/§5.4.1 신설로 위키 정합 재확인 (CONSISTENT).
- (검토) **`outbox-polling-relay-operations`** — §5.4.1 신설 본문이 메모리화할 만한 운영 표준 5개 항목(폴링 2-5초, batch 50-200, SKIP LOCKED, DLQ attempts>=10, 해시샤딩 트리거 1000건/5분). S5 운영 ADR 결정 후 정착 시점에 메모리화 검토.
- (검토) **`redis-topology-decision`** — S3 발견 standalone→Cluster 전환. S5 운영 세션 결정 후 메모리화.
- (검토) **`s3-implementation-status`** — S3-F11 "AWS S3 계획 상태" 정착. W4 구현 PR 시 폐기 또는 갱신.
