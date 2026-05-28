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
| S4 | 이벤트 | pending | - | - | - | - | - | - |
| S5 | 운영 | pending | - | - | - | - | - | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 27 / 약 45
  - S1 (언어 3): Java 21, Python 3.12, Dart 3.x
  - S2a (백엔드 12): SCG 5, Boot 4, Security 7, JPA+Hibernate 7, Flyway 11, WebFlux, Testcontainers, Modulith 2.0, FastAPI, uvicorn, LangChain→Direct SDK, httpx
  - S2b (프론트 7): Flutter 3.x, Riverpod, GoRouter, Sliver, google_fonts, CanvasKit, D3.js→CustomPainter, flutter_test
  - S3 (데이터 5): PostgreSQL 16, pgvector, Redis 7, Elasticsearch 8 / OpenSearch 2.x + nori, AWS S3
- E1: 30 · E2: 24 · D: 13 · R: 17 · OK: 24
- P0: 14 · P1: 24 · P2: 50
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

### S2a → S5 위임 (유지)
- **§3.1 Gateway JWT 미구현 + CircuitBreaker 미설정**

### S3 → S4 위임 (이벤트 영역, 본 세션에서 건드리지 않음)
- **§5.4 Apache Kafka 3.x**: KafkaAvroSerializer 정합 확인, Outbox·Polling Relay 운영 패턴
- **§5.5 Confluent Schema Registry 7.x**: 스키마 진화 정책
- **§5.6 Apache Avro 1.11.x**: SpecificRecord·CloudEvents 헤더
- **§3.2 Resilience4j**, **§3.3 Redis Token Bucket**

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
- **(P1)** `outbox_event` / `user_ref` / `event_publication` 마이그레이션 작성 (S3 발견) — Outbox/CQRS 패턴 본격 도입
- **(P1)** AWS S3 AttachmentService 구현 (synapse-knowledge-svc, S3 발견) — `software.amazon.awssdk:s3:2.28.x` 의존성 추가
- **(P2)** Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0)
- **(P2)** Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
- **(P2)** note_chunks embedding NOT NULL 통일 (S3-F05, 비동기 백필 후)
- **(P2)** HNSW partial index 추가 (knowledge-svc, S3-F06)
- **(P2)** ES vs OpenSearch 결정 후 인프라 통일
- **(별도 결정)** 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부

### 별도 작업 (v2.3 통합 정리, 6 세션 종료 후)
- **§10.1 요약표** S1+S2+S3 변경 반영
- **§12.2 Flutter 생태계 버전 매핑**: go_router 14→17, google_fonts 6→8, freezed/build_runner 제거
- **§12.4 인프라 버전 요구사항**: Redis 7.4 LTS, ES vs OpenSearch 표기, pgvector 0.8.x
- **§4.2.4·§2.8 재작성**이 §1.4 본문·§10.1 매트릭스와 일관 여부 재확인
- **§1.4 기술 스택 전체 목록 표** S3 발견사항 반영

### 별도 결정 사항
- **5주 단축 일정 트레이드오프 ADR화 검토** (§2.8 Deep Dive 정착 사실)
- **integration_test 실제 작성** (Phase D 이후, §2.9 명시)

### 운영 표준 예외 기록
- S1·S2a·S2b·S3 각각 위키에 추가 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 dual-commit 의도된 예외. S4·S5·S6도 동일 패턴.

## 메모리 갱신 후보
- ✅ **`python-ai-stack-direct-sdk`** — S1 종료 시 생성. S2a §4.2.4·§12.3/§12.5 정정에 활용.
- (검토) **`spring-modulith-outbox-coexistence`** — S2a §4.1.8 Deep Dive로 정착. S4 검증 후 메모리화 검토.
- (검토) **`flutter-frontend-policy`** — S2b 정착 정책: Riverpod manual / CustomPainter / integration_test Phase D 이후.
- (검토) **`redis-topology-decision`** — S3 발견 standalone→Cluster 전환. S5 운영 세션 결정 후 메모리화.
- (검토) **`s3-implementation-status`** — S3-F11 "AWS S3 계획 상태" 정착. W4 구현 PR 시 폐기 또는 갱신.
