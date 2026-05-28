# 18 기술 스택 검증 — 세션 이관 핸드오프 (2026-05-28)

> **이 문서가 다음 세션의 진입점입니다.** 새 대화 시작 시 INDEX → 본 문서 → 마스터 스펙 순으로 읽으면 컨텍스트 복원이 완료됩니다.

---

## 1. 한 줄 요약

`documents.wiki/18_기술_스택_정의서.md` v2.2 → v2.3 카테고리 검증 프로젝트. 6 세션 중 **4 세션 완료(27/45 기술, 108 findings, 모두 main 머지됨)**, **3 세션 남음**(S4 이벤트/S5 운영/S6 외부·AI).

---

## 2. 어디까지 왔나

### 완료된 4 세션 (모두 main 머지됨)

| 세션 | 카테고리 | 기술 수 | findings | PR# | 위키 커밋 (마지막) |
|------|---------|---------|----------|-----|---------------------|
| S1 | 언어 (Java 21·Python 3.12·Dart 3.x) | 3 | 30 | [#6](https://github.com/team-project-final/documents/pull/6) | `documents.wiki@6ae5155` |
| S2a | 백엔드 프레임워크 (Spring·FastAPI·Gateway) | 12 | 37 | [#7](https://github.com/team-project-final/documents/pull/7) | `documents.wiki@7f091cd` |
| S2b | 프론트엔드 프레임워크 (Flutter 스택) | 7 | 24 | [#8](https://github.com/team-project-final/documents/pull/8) | `documents.wiki@4eca299` |
| S3 | 데이터스토어 (PG·pgvector·Redis·ES/OpenSearch·S3) | 5 | 17 | [#9](https://github.com/team-project-final/documents/pull/9) | `documents.wiki@ed5ed04` |
| **합계** | | **27** | **108** | | |

누적 클래스: E1:30 · E2:24 · D:13 · R:17 · OK:24
누적 심각도: P0:14 · P1:24 · P2:50

마스터 스펙(PR #5)·S1 플랜·S2a 플랜·S2b 플랜·S3 플랜도 모두 main에 있음.

### 핸드오프 시점 정착된 결정 (이전 세션 결과의 메모리화)

| 메모리 | 내용 | 다음 세션 영향 |
|--------|------|---------------|
| [[python-ai-stack-direct-sdk]] | LangChain 미사용, OpenAI/Anthropic SDK 직접 | S6 (AI/ML) **필수** |
| [[flutter-frontend-policy]] | Riverpod manual · CustomPainter · integration_test Phase D 이후 | S6 (RAG·시맨틱 캐시는 backend 영역이지만 wiki §6 정합 검증 시 참조) |
| [[spring-modulith-outbox-coexistence]] | Modulith Event Registry vs Outbox 분리, events-kafka 금지 | S4 (이벤트) **필수** |
| [[redis-topology-decision]] | 현재 standalone, Cluster는 S5 ADR | S5 (운영) **필수** |
| [[s3-implementation-status]] | AWS S3 W4 이후 구현, 위키 §5.7은 목표 형태 | S5/S6 (S3 운영·이벤트 알림 라우팅) |
| [[data-sync-outbox-cqrs]] | Outbox/Relay/복제/순서보장 전체 표준 (기존) | S4 **핵심** |
| [[deploy-mirror-standardization]] | 배포 PR 세트 (기존) | S5 **핵심** |
| [[git-pr-workflow]] | 브랜치→커밋→푸쉬→PR→대기 (기존) | 전 세션 |

---

## 3. 다음에 무엇을 해야 하나

### 선택지 A — S4 이벤트/동기화 세션 (권장 다음)

**대상 (7개 + 검토 2개)**:
- §5.4 Apache Kafka 3.x — **v2.2에서 정합화됨, 추가 검증 필요**
- §5.5 Confluent Schema Registry 7.x
- §5.6 Apache Avro 1.11.x
- §3.2 Resilience4j
- §3.3 Redis Token Bucket
- (검토) ShedLock 7.7.x 독립 절 신설 — 마스터 스펙 §2에서 사전 발견
- (검토) Outbox/Polling Relay 운영 패턴 절 신설 — 마스터 스펙 §2에서 사전 발견

**핵심 메모리**: [[data-sync-outbox-cqrs]], [[spring-modulith-outbox-coexistence]]

**검증 초점**:
- Boot 4 + Spring Kafka 4 + Avro 1.11 + Schema Registry 7 호환 매트릭스
- `outbox_event`·`processed_events` 테이블·인덱스·파티션 키 표준 정합
- KafkaAvroSerializer + CloudEvents 헤더 패턴

### 선택지 B — S5 운영/관측성 세션

**대상 (12개)**: §7.1 Docker, §7.2 EKS, §7.3 ArgoCD, §7.4 GitHub Actions, §7.5 Cloudflare, §7.6 Istio, §7.7 ECR, §8.1 Prometheus+Grafana, §8.2 Fluent Bit, §8.3 OTel+Jaeger, §8.4 Sentry, §8.5 AlertManager (+ Testcontainers·pytest 이관 후보)

**핵심 메모리**: [[deploy-mirror-standardization]], [[redis-topology-decision]], [[s3-implementation-status]]

**위임 받은 결정 ADR**:
- §3.1 Gateway JWT 미구현·CircuitBreaker 미설정 (S2a 위임)
- Redis Cluster 전환 트리거 (S3 위임)
- ES vs OpenSearch 결정 (S3 위임)

### 선택지 C — S6 외부 API + AI/ML 세션

**대상 (9개)**: §6.1 Claude, §6.2 OpenAI Embeddings, §6.3 RAG, §6.4 Semantic Cache, §9.1 Stripe, §9.2 OAuth, §9.3 FCM/APNs, §9.4 SES, §9.5 Secrets Manager

**핵심 메모리**: [[python-ai-stack-direct-sdk]] **필수**

**위임 받은 정정**:
- §6 RAG 절들의 LangChain 잔존 언급 일괄 정정 (S2a §4.2.4 Direct SDK 패턴과 일관성)

---

## 4. 다음 세션 컨텍스트 복원 5단계 (마스터 스펙 §6.2)

```
1. INDEX 읽기:
   documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
   → 누적 통계·세션 진척·위임 항목 한눈에 확인

2. 본 핸드오프 문서 읽기 (이 파일):
   documents/docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md
   → "다음에 무엇을 해야 하나" 섹션에서 선택지 결정

3. 마스터 스펙 읽기:
   documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md
   → 6단계 파이프라인·분류 체계·산출물 구조·운영 워크플로

4. 메모리 확인 (선택한 세션에 따라):
   - S4 → [[data-sync-outbox-cqrs]], [[spring-modulith-outbox-coexistence]]
   - S5 → [[deploy-mirror-standardization]], [[redis-topology-decision]], [[s3-implementation-status]]
   - S6 → [[python-ai-stack-direct-sdk]]
   - 모든 세션 → [[git-pr-workflow]]

5. writing-plans 스킬 호출로 선택한 세션의 플랜 작성 → subagent-driven으로 실행
   (S2b·S3와 동일 패턴, 마스터 스펙 §1 6단계)
```

---

## 5. 후속 코드 PR 누적 큐 (위키 정정과 분리)

위키 검증으로 드러난 실 코드 수정 후보. 본 검증 프로젝트 범위 외이지만 추적.

### P0 (즉시 처리 권장)
1. `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 수정 → `org.testcontainers:junit-jupiter:1.21.4` / `:postgresql:1.21.4` (S2a 발견 — 빌드 실패 위험)
2. `outbox_event` / `user_ref` / `event_publication` 마이그레이션 작성 (S3 발견 — 메모리 표준 정의됐으나 실 코드 0건)
3. AWS S3 AttachmentService 구현 (synapse-knowledge-svc, S3 발견)

### P1
4. `synapse-learning-svc/learning-card/build.gradle.kts:81` Spring Modulith `1.3.0` → `2.0.6` (S2a 발견)

### P2
5. Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0)
6. Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
7. note_chunks embedding NOT NULL 통일 (S3-F05, 비동기 백필 후)
8. HNSW partial index 추가 (knowledge-svc, S3-F06)
9. ES vs OpenSearch 결정 후 인프라 통일

### 별도 결정 사항
- 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부 (S1·S2a 위임)
- 5주 단축 일정 트레이드오프 ADR화 검토 (§2.8 Deep Dive 정착)
- integration_test 실제 작성 (Phase D 이후)

---

## 6. v2.3 통합 정리 작업 (6 세션 종료 후 별도)

마스터 스펙 §6.4 — 모든 세션 완료 후 처리.

- 18 §11 변경 이력에 `v2.3` 통합 행 추가 (v2.3-S1 ~ v2.3-S6 합본)
- **§10.1 요약표** S1+S2+S3+S4+S5+S6 변경 반영
- **§12.2 Flutter 생태계 버전 매핑** 갱신 (go_router 14→17, google_fonts 6→8, freezed/build_runner 제거)
- **§12.3 Python AI 버전 매핑** 갱신 (S2a에서 부분 처리됨 — LangChain → OpenAI/Anthropic SDK)
- **§12.4 인프라 버전 요구사항** 갱신 (Redis 7.4 LTS, ES vs OpenSearch 표기, pgvector 0.8.x 명시)
- **§1.4 기술 스택 전체 목록 표** 누적 변경 반영
- 마스터 INDEX 최종본 잠금 (CHANGELOG 성격 보존)

---

## 7. 운영 표준 예외 기록

마스터 스펙 §5.3 "위키 세션당 단일 커밋" 원칙의 의도된 예외 — S1·S2a·S2b·S3 모두 §11 변경 이력에 PR# 기입을 위한 후행 커밋 발생. S4·S5·S6도 동일 패턴 예상.

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | S3 완료 시점 핸드오프 초안 — 4 세션 완료 / 3 세션 남음 (S4·S5·S6) |
