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
| S5 | 운영 | completed | [#12](https://github.com/team-project-final/documents/pull/12) | documents.wiki@dc5b0bd | 9/9/6/2/5 | 0/19/12 | 2026-05-28 | 2026-05-28 |
| S6 | 외부/AI | completed | [#13](https://github.com/team-project-final/documents/pull/13) | documents.wiki@bac72d3 | 8/8/6/2/5 | 2/13/14 | 2026-05-28 | 2026-05-28 |

## 누적 통계
- 검증한 기술 수: 55 / 약 45 (**6 세션 전부 완료 — 검증 단계 종료**)
  - S1 (언어 3): Java 21, Python 3.12, Dart 3.x
  - S2a (백엔드 12): SCG 5, Boot 4, Security 7, JPA+Hibernate 7, Flyway 11, WebFlux, Testcontainers, Modulith 2.0, FastAPI, uvicorn, LangChain→Direct SDK, httpx
  - S2b (프론트 7): Flutter 3.x, Riverpod, GoRouter, Sliver, google_fonts, CanvasKit, D3.js→CustomPainter, flutter_test
  - S3 (데이터 5): PostgreSQL 16, pgvector, Redis 7, Elasticsearch 8 / OpenSearch 2.x + nori, AWS S3
  - S4 (이벤트 7): Apache Kafka 3.x, Confluent Schema Registry 7.x, Apache Avro 1.11.x, Resilience4j, Redis Token Bucket + **신설**: ShedLock 7.7.x, Outbox/Polling Relay 운영 패턴
  - S5 (운영 12): Docker+Compose, AWS EKS, ArgoCD, GitHub Actions, Cloudflare, Istio, AWS ECR, Prometheus+Grafana, Promtail+Loki(←Fluent Bit), OpenTelemetry+Jaeger, Sentry, AlertManager + **신설**: §8.6 운영 ADR 5건
  - S6 (외부/AI 9): Anthropic Claude, OpenAI Embeddings, RAG, Semantic Cache, Stripe, OAuth(Google/GitHub/Apple), FCM/APNs, AWS SES, AWS Secrets Manager(ESO)
- E1: 50 · E2: 45 · D: 26 · R: 23 · OK: 38 (누계 182)
- P0: 16 · P1: 63 · P2: 83
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

### S5 처리 완료 (2026-05-28) — 위임 ADR 5건 청산

- 작업 브랜치: `docs/stack-review-S5-operations` (이어받기 성공: Phase B3 두 subagent 병렬 정상 완료, 529 재발 없음)
- ✅ **§8.6 운영 ADR 절 신설** — S2a/S4/S3 위임 ADR 5건 모두 결정:
  - **ADR-S5-1** (S2a 위임) §3.1 Gateway JWT 서명/만료 검증(공통) + 서비스 세분 인가, CB는 ADR-S5-2 통합 — W4 구현 목표
  - **ADR-S5-2** (S4 위임) §3.2 Resilience4j Gateway 도입 확정 (gateway 모듈 한정 timeout+CB)
  - **ADR-S5-3** (S4 위임) §3.3 RedisRateLimiter 플랜별 분기 (KeyResolver userId+plan, free/pro/enterprise)
  - **ADR-S5-4** (S3 위임) §5.2 Redis standalone 유지, Cluster 전환 트리거 = 지속 RPS·메모리 70%·HA 요구
  - **ADR-S5-5** (S3 위임) §5.3 **OpenSearch 채택** (Apache 2.0·AWS Managed·nori, 인프라 기 프로비저닝)
- ✅ **메모리 정합 CONSISTENT**: `deploy-mirror-standardization`(§7.4·§7.7 — reusable workflow latent·AWS_ROLE_ARN 부재·`synapse/gateway` ECR 명칭 불일치 모두 일치), `redis-topology-decision`(§7.1·§5.2 standalone)
- ✅ **§8 "적용 현황(목표 vs 실재)" 박스 통일** — Prometheus 404·OTel/Jaeger·Sentry 미구현 + Cloudflare/Istio 미배포 (`s3-implementation-status` 패턴)
- ✅ 잔여 S3 운영(KMS·Object Lock·Lifecycle·이벤트 알림 라우팅)은 별도 코드 PR 후속으로 이관(아래 큐)

### S2a/S2b → S6 위임 ✅ 청산 완료
- ✅ **§6 RAG LangChain 잔존 언급** — S6 검증 결과 §6.3 본문에 LangChain "사용" 잔존 **0건**(대안 비교표 "미선택" 행만, 정상). 코드 전수 grep langchain 0건. [[python-ai-stack-direct-sdk]] CONSISTENT. 정정 불필요로 청산.

### S6 처리 완료 (2026-05-28) — 검증 프로젝트 6/6 세션 종료
- ✅ AI/ML 4 + 외부서비스 5 = 9 항목, 29 findings(E1:8·E2:8·D:6·R:2·OK:5 / P0:2·P1:13·P2:14)
- ✅ **P0 2건**(아키텍처 드리프트): §6.3 RAG(ES+RRF 하이브리드 픽션 → pgvector cosine 단일 실재), §6.4 Semantic Cache(pgvector 캐시 테이블 픽션 → Redis numpy in-memory 실재). 둘 다 "적용 현황(목표 vs 실재)" 박스로 reconcile.
- ✅ 미구현 외부연동 "목표 vs 실재" 박스(s3-implementation-status 패턴): §9.1 Customer Portal/Proration, §9.3 FCM/APNs 발송, §9.4 SES 전면, §9.2 Microsoft OAuth(계획), §6.1 프롬프트 캐싱
- ✅ 메모리 정합: python-ai-stack-direct-sdk CONSISTENT, deploy-mirror-standardization §9.5 DRIFT 정정(ESO v1·5m·per-service 경로), redis-topology-decision §6.4 standalone
- ✅ **다음 = v2.3 통합 정리**(마스터 스펙 §6.4, 별도 작업) — 검증 세션 자체는 전부 종료

## 후속 과제 큐 (Follow-ups)

### 별도 코드 PR (위키 정정과 분리, 실 코드 수정 필요)
- **(P0)** `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 수정 (S2a 발견)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:81` Spring Modulith `1.3.0` → `2.0.6` (S2a 발견)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:L55` Avro `1.12.0` → `1.11.3` 정렬 (S4-F10)
- **(P1)** `synapse-learning-svc/learning-card/src/main/resources/application.yml` Kafka producer에 `properties.auto.register.schemas: false` 운영 프로필 추가 (S4-F08)
- **(P1)** Outbox 패턴 도입 시 platform-svc/knowledge-svc/engagement-svc에 ShedLock 7.7.x 도입 + `shedlock` 마이그레이션 (S4-F12·F13 신설 절이 표준)
- **(P1)** `outbox_event` / `user_ref` / `event_publication` 마이그레이션 작성 (S3 발견) — Outbox/CQRS 패턴 본격 도입
- **(P1)** AWS S3 AttachmentService 구현 (synapse-knowledge-svc, S3 발견) — `software.amazon.awssdk:s3:2.28.x` 의존성 추가
- **(P1)** `synapse-shared` reusable workflow(deploy-service.yml/mirror-service.yml) PR #8 머지 + 나머지 서비스 caller 전환 (S5 INFRA-F14, deploy-mirror-standardization Phase 4)
- **(P1)** `AWS_ROLE_ARN`(OIDC deploy role) 생성 → gateway deploy.yml 정적 키 → OIDC 전환 (S5 INFRA-F12)
- **(P1)** ECR `synapse/gateway` 리포 신규 생성 + `ECR_REGISTRY` 시크릿 등록 + 명칭 통일(synapse-gateway↔synapse/gateway) (S5 INFRA-F18)
- **(P1)** 5 Spring 런타임 `micrometer-registry-prometheus` 의존성 + exposure에 prometheus 추가 → /actuator/prometheus 노출(현재 404) (S5 OBS-F01)
- **(P1)** §8.1 PrometheusRule(Outbox 4 알람) 매니페스트 추가 — §5.4.1 임계값 기반 (S5 OBS-F02)
- **(P2)** 분산추적(OTel) W4+ 도입, Sentry SDK W4+ 통합 (S5 OBS-F08·F09)
- **(P2)** AlertManager 채널 3분리(#alert-critical/warning/info) + PagerDuty 에스컬레이션, 채널명 단일 출처 통일(위키↔runbook↔실 values) (S5 OBS-F11)
- **(P2)** Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0)
- **(P2)** Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
- **(P2)** note_chunks embedding NOT NULL 통일 (S3-F05, 비동기 백필 후)
- **(P2)** HNSW partial index 추가 (knowledge-svc, S3-F06)
- **(P2)** ES vs OpenSearch 결정 후 인프라 통일
- **(P1)** RAG 하이브리드 검색(pgvector + Elasticsearch BM25 + RRF) 구현 — 현재 pgvector cosine 단일 (S6-F10, learning-ai)
- **(P1)** 시맨틱 캐시 영속화 검토 — 현재 Redis JSON + numpy in-memory 스캔(최대 100 FIFO). 트래픽 증가 시 pgvector/Redis vector index 전환 (S6-F13)
- **(P1)** Stripe `invoice.payment_failed` 핸들러 + Customer Portal(billing_portal/sessions) + Proration + Checkout Idempotency-Key (S6-F17·F18·F19, platform-svc billing)
- **(P1)** FCM/APNs 실제 발송 구현(firebase-admin/pushy 의존성·PushNotificationService) + 410 Gone 토큰 자동 삭제 (S6-F25, platform-svc)
- **(P1)** AWS SES 연동(software.amazon.awssdk ses v2·sns) + DKIM/샌드박스 해제 + email_suppression_list (S6-F27, S3 AttachmentService와 동일 미구현 트랙)
- **(P2)** Microsoft(Azure AD) OAuth Provider 활성화 (S6-F22, 현재 application.yml TODO 주석)
- **(P2)** Claude 프롬프트 캐싱(cache_control: ephemeral) 적용 → 반복 시스템 프롬프트 비용 절감 (S6-F02, learning-ai)
- **(별도 결정)** 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부

### 별도 작업 (v2.3 통합 정리) — ▶ 6 세션 전부 종료, **이제 진행 가능** (마스터 스펙 §6.4)
- **§10.1 요약표** S1~S6 변경 반영 (ShedLock §4.1.9 / Outbox §5.4.1 / §8.6 운영 ADR / §6.3 RAG 실재·목표 / §9 외부연동 실재 행)
- **§11 v2.3 통합 행** 추가 (v2.3-S1 ~ v2.3-S6 합본 CHANGELOG)
- **§12.2 Flutter 생태계 버전 매핑**: go_router 14→17, google_fonts 6→8, freezed/build_runner 제거
- **§12.3 Python AI 버전 매핑**: anthropic≥0.40 / openai≥1.50 Direct SDK, claude-3-5-sonnet-20240620, text-embedding-3-small 1536 (S6 정합)
- **§12.4 인프라 버전 요구사항**: Redis 7.4 LTS standalone, ES vs OpenSearch→OpenSearch(ADR-S5-5), pgvector 0.8.x HNSW, ShedLock 7.7.x, Avro 1.11.3, ESO v1
- **§4.2.4·§2.8 재작성**이 §1.4 본문·§10.1 매트릭스와 일관 여부 재확인
- **§1.4 기술 스택 전체 목록 표** S3~S6 발견사항 반영 (신설 절 §4.1.9·§5.4.1·§8.6)
- **마스터 INDEX 최종본 잠금** (CHANGELOG 성격 보존)

### 별도 결정 사항
- **5주 단축 일정 트레이드오프 ADR화 검토** (§2.8 Deep Dive 정착 사실)
- **integration_test 실제 작성** (Phase D 이후, §2.9 명시)

### 운영 표준 예외 기록
- S1·S2a·S2b·S3·S4·S5·S6 각각 위키에 추가 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 dual-commit 의도된 예외. 6 세션 전부 동일 패턴 적용 완료.

## 메모리 갱신 후보
- ✅ **`python-ai-stack-direct-sdk`** — S1 생성, S2a §4.2.4 활용. **S6에서 §6.1/§6.2/§6.3 코드 전수 재검증 CONSISTENT(langchain 0건)**. 갱신 불필요.
- (검토) **`semantic-cache-redis-numpy`** (신규 후보) — S6-F13: learning-ai 시맨틱 캐시 실재 = Redis JSON + numpy 코사인 in-memory 스캔(키 rag_cache:{tenant}, 최대100 FIFO, TTL3600, 임계값0.95), pgvector 캐시 테이블 아님. 위키 §6.4가 목표/실재로 분리됨. 코드에 명확하나 위키-코드 괴리 재발 방지용으로 메모리화 검토.
- ✅ **`spring-modulith-outbox-coexistence`** — S2a §4.1.8 Deep Dive로 정착. S4에서 events-kafka 부재 재확인 (CONSISTENT).
- ✅ **`flutter-frontend-policy`** — S2b 정착 정책: Riverpod manual / CustomPainter / integration_test Phase D 이후.
- ✅ **`data-sync-outbox-cqrs`** — S4에서 §5.4 본문/§5.4.1 신설로 위키 정합 재확인 (CONSISTENT).
- (검토) **`outbox-polling-relay-operations`** — §5.4.1 신설 본문이 메모리화할 만한 운영 표준 5개 항목(폴링 2-5초, batch 50-200, SKIP LOCKED, DLQ attempts>=10, 해시샤딩 트리거 1000건/5분). S5 운영 ADR 결정 후 정착 시점에 메모리화 검토.
- ✅ **`redis-topology-decision`** — S5 ADR-S5-4로 결정 정착(standalone 유지, 전환 트리거=지속 RPS·메모리 70%·HA). 메모리 내용과 CONSISTENT, 갱신 불필요.
- (검토) **`s3-implementation-status`** — S3-F11 "AWS S3 계획 상태" 정착. S5에서 §8 "적용 현황(목표 vs 실재)" 박스 패턴의 근거로 재사용. W4 구현 PR 시 폐기 또는 갱신.
- (검토) **`deploy-mirror-standardization`** — S5 §7.4·§7.7 검증으로 latent 상태(shared reusable 미머지·AWS_ROLE_ARN 부재·`synapse/gateway` 명칭 불일치) 재확인 CONSISTENT. Phase 4 완료 시 갱신.
