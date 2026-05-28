# 18 기술 스택 검증 — 세션 이관 핸드오프 (2026-05-28)

> **이 문서가 다음 세션의 진입점입니다.** 새 대화 시작 시 INDEX → 본 문서 → 마스터 스펙 순으로 읽으면 컨텍스트 복원이 완료됩니다.

---

## 1. 한 줄 요약

`documents.wiki/18_기술_스택_정의서.md` v2.2 → v2.3 카테고리 검증 프로젝트. 6 세션 중 **5 세션 완료(S1·S2a·S2b·S3·S4 모두 main 머지)** + **S5 진척 중단 (Phase B1·B2 완료, B3 미시작 — 다음 세션 이어받기)**, **S6 미시작**. 본 핸드오프(v1.2)는 S5 이어받기 가이드를 §"3.A S5 이어받기" 절에 명시.

---

## 2. 어디까지 왔나

### 완료된 5 세션

| 세션 | 카테고리 | 기술 수 | findings | PR# | 위키 커밋 (마지막) |
|------|---------|---------|----------|-----|---------------------|
| S1 | 언어 (Java 21·Python 3.12·Dart 3.x) | 3 | 30 | [#6](https://github.com/team-project-final/documents/pull/6) | `documents.wiki@6ae5155` |
| S2a | 백엔드 프레임워크 (Spring·FastAPI·Gateway) | 12 | 37 | [#7](https://github.com/team-project-final/documents/pull/7) | `documents.wiki@7f091cd` |
| S2b | 프론트엔드 프레임워크 (Flutter 스택) | 7 | 24 | [#8](https://github.com/team-project-final/documents/pull/8) | `documents.wiki@4eca299` |
| S3 | 데이터스토어 (PG·pgvector·Redis·ES/OpenSearch·S3) | 5 | 17 | [#9](https://github.com/team-project-final/documents/pull/9) | `documents.wiki@ed5ed04` |
| S4 | 이벤트/동기화 (Kafka·SR·Avro·Resilience4j·RateLimit + 신설 ShedLock·Outbox) | 7 | 14 | [#11](https://github.com/team-project-final/documents/pull/11) | `documents.wiki@0a7e5a2` |
| **합계** | | **34** | **122** | | |

누적 클래스: E1:33 · E2:28 · D:14 · R:19 · OK:28
누적 심각도: P0:14 · P1:31 · P2:57

마스터 스펙(PR #5)·S1·S2a·S2b·S3·S4 플랜도 모두 main에 있음(S4 플랜은 본 PR로 함께 머지 예정).

### S4 신설 절 결정 (5세션 시점 정착)

| 신설 | 위치 | 본문 핵심 |
|------|------|----------|
| §4.1.9 ShedLock 7.7.x | §4.1.8 끝 직후 | 어노테이션·LockProvider.usingDbTime·DDL·learning-card 실 구현 표·트러블슈팅 5건·운영 임계값 표준 3종 |
| §5.4.1 Outbox/Polling Relay 운영 패턴 | §5.4 끝 직후 | 폴링 2-5초·batch 50-200·SKIP LOCKED·DLQ attempts≥10·해시샤딩 트리거(백로그 1000건/5분)·CloudEvents binary 매핑·Prometheus 알람 4종·운영 함정 6건 |

### 핸드오프 시점 정착된 결정 (이전 세션 결과의 메모리화)

| 메모리 | 내용 | 다음 세션 영향 |
|--------|------|---------------|
| [[python-ai-stack-direct-sdk]] | LangChain 미사용, OpenAI/Anthropic SDK 직접 | S6 (AI/ML) **필수** |
| [[flutter-frontend-policy]] | Riverpod manual · CustomPainter · integration_test Phase D 이후 | S6 (wiki §6 정합 검증 시 참조) |
| [[spring-modulith-outbox-coexistence]] | Modulith Event Registry vs Outbox 분리, events-kafka 금지 | ✅ S4 정합 확인 완료 (CONSISTENT) |
| [[redis-topology-decision]] | 현재 standalone, Cluster는 S5 ADR | S5 (운영) **필수** |
| [[s3-implementation-status]] | AWS S3 W4 이후 구현, 위키 §5.7은 목표 형태 | S5/S6 (S3 운영·이벤트 알림 라우팅) |
| [[data-sync-outbox-cqrs]] | Outbox/Relay/복제/순서보장 전체 표준 (기존) | ✅ S4 정합 확인 완료 (CONSISTENT) — §5.4.1 신설로 위키에도 단일 출처 정착 |
| [[deploy-mirror-standardization]] | 배포 PR 세트 (기존) | S5 **핵심** |
| [[git-pr-workflow]] | 브랜치→커밋→푸쉬→PR→대기 (기존) | 전 세션 |

---

## 3. 다음에 무엇을 해야 하나

> ✅ ~~선택지 A — S4 이벤트/동기화 세션~~ **완료** (PR #11 머지).
> ⏸ **S5 운영/관측성 — 진척 중단 (Phase B1·B2 완료, B3 미시작)**. 본 §3.A에서 이어받기 가이드 제공.
> 다음 세션 결정: **(권장) S5 이어받기** 또는 **S6 외부/AI 별도 시작**.

### 3.A — S5 이어받기 가이드 (권장 다음)

**현재 상태 (2026-05-28 중단 시점):**
- 작업 브랜치: `docs/stack-review-S5-operations` (origin에 푸시됨)
- 진척 핸드오프 PR: [documents#12](https://github.com/team-project-final/documents/pull/12) (머지 대기)
- 플랜: `documents/docs/superpowers/plans/2026-05-28-stack-review-S5-operations.md` (본 PR #12 포함)
- 위키 master: `8785252` (S4 dual-commit 후, 변경 없음)
- INDEX: S5 = `in_progress` (#12 진척 핸드오프 링크)

**이어받기 절차:**

```
# 1. 본 PR 머지 후 또는 본 브랜치 위에서 직접 시작
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout docs/stack-review-S5-operations
git pull --rebase origin docs/stack-review-S5-operations
Pop-Location

Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
Pop-Location
```

**Phase B3부터 시작** — 이미 확정된 컨텍스트:

(a) **라인 범위 (Phase B1 결과, 다시 grep 불필요)**:
- §7.1 Docker + Docker Compose — **L4889-L5005**
- §7.2 AWS EKS — **L5006-L5148**
- §7.3 ArgoCD — **L5149-L5246**
- §7.4 GitHub Actions — **L5247-L5372**
- §7.5 Cloudflare — **L5373-L5460**
- §7.6 Istio — **L5461-L5562**
- §7.7 AWS ECR — **L5563-L5639**
- §8.1 Prometheus + Grafana — **L5640-L5740**
- §8.2 Fluent Bit + CloudWatch/Loki — **L5741-L5827**
- §8.3 OpenTelemetry + Jaeger — **L5828-L5922**
- §8.4 Sentry — **L5923-L6022**
- §8.5 AlertManager + Slack — **L6023-L6135** (§9.1 Stripe L6140 직전)

(b) **skill-recommender 결과 (Phase B2 완료)**: 8건 verified MCP 발견(Sentry / Cloudflare 4종 / Supabase / FireCrawl 등). **본 검증에는 비사용** — context7 + WebFetch만 사용(S1·S2·S3·S4와 동일). MCP들은 실시간 데이터 액세스 용도라 18 위키 검증의 진실 원천이 될 수 없음. 보고서 §2에 "채택 가능 도구로 기록만"으로 처리.

(c) **Phase B3 두 subagent 병렬 dispatch** — 본 플랜 §B3 Step 1·Step 2 그대로:
- subagent A: §7.1-§7.7 인프라 7개 (`INFRA-F##` finding) — 핵심 메모리 [[deploy-mirror-standardization]]
- subagent B: §8.1-§8.5 관측성 5개 (`OBS-F##` finding) — §5.4.1 Outbox 모니터링 지표 정합 검증 필수

⚠ 첫 시도 시 API 529 Overloaded × 2회. 재시도 시 즉시 또는 단일 subagent로 fallback(12개 묶음 — S2a 패턴) 검토.

(d) **ADR 5건 위임 누적** — controller가 Phase B4 §6 Deep Dive에서 처리:
1. (S2a 위임) §3.1 Gateway JWT 미구현 + CircuitBreaker 미설정
2. (S4 위임) §3.2 Resilience4j Gateway 도입 결정
3. (S4 위임) §3.3 RedisRateLimiter 플랜별 분기
4. (S3 위임) Redis Cluster 전환 트리거 ADR
5. (S3 위임) ES vs OpenSearch 결정 ADR

(e) **메모리 정합 검증 대상**:
- [[deploy-mirror-standardization]] — §7.4·§7.7 검증의 진실 원천(W3 reusable workflow + AWS_ROLE_ARN 차단)
- [[redis-topology-decision]] — §6 Deep Dive ADR-S5-4 결정 컨텍스트
- [[s3-implementation-status]] — §7.5(Cloudflare CDN)·§8.2(Fluent Bit) 검증 시 참조만

**Phase B3 이후는 본 플랜 §B4·§B5·§B6·§C1·§C2·§C3 그대로**.

### 3.B — S6 외부 API + AI/ML 세션 (S5 완료 후, 또는 병렬 진행 시)

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
   - **S5 이어받기 (권장)** → [[deploy-mirror-standardization]], [[redis-topology-decision]], [[s3-implementation-status]] + 본 핸드오프 §3.A 가이드
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
5. `synapse-learning-svc/learning-card/build.gradle.kts:L55` Avro `1.12.0` → `1.11.3` 정렬 (S4-F10)
6. `synapse-learning-svc/learning-card/src/main/resources/application.yml` Kafka producer에 `properties.auto.register.schemas: false` 운영 프로필 추가 (S4-F08)
7. Outbox 패턴 도입 시 platform-svc/knowledge-svc/engagement-svc에 ShedLock 7.7.x 도입 + `shedlock` 마이그레이션 (S4-F12·F13 신설 §4.1.9·§5.4.1이 표준)

### P2
8. Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0)
9. Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
10. note_chunks embedding NOT NULL 통일 (S3-F05, 비동기 백필 후)
11. HNSW partial index 추가 (knowledge-svc, S3-F06)
12. ES vs OpenSearch 결정 후 인프라 통일

### 별도 결정 사항
- 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부 (S1·S2a 위임)
- 5주 단축 일정 트레이드오프 ADR화 검토 (§2.8 Deep Dive 정착)
- integration_test 실제 작성 (Phase D 이후)
- §3.2 Resilience4j Gateway 도입 / §3.3 RedisRateLimiter 플랜별 분기 (S4 위임, S5 ADR)

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

마스터 스펙 §5.3 "위키 세션당 단일 커밋" 원칙의 의도된 예외 — S1·S2a·S2b·S3·S4 모두 §11 변경 이력에 PR# 기입을 위한 후행 커밋 발생. S5·S6도 동일 패턴 예상.

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | S3 완료 시점 핸드오프 초안 — 4 세션 완료 / 3 세션 남음 (S4·S5·S6) |
| v1.1 | 2026-05-28 | S4 완료 반영 — 5 세션 완료 / 2 세션 남음 (S5·S6). §4.1.9 ShedLock / §5.4.1 Outbox 운영 패턴 신설 절 정착. data-sync-outbox-cqrs·spring-modulith-outbox-coexistence 메모리 정합 CONSISTENT 확인. S5 위임 ADR 큐에 §3.2/§3.3 Gateway 도입 결정 2건 추가. |
| v1.2 | 2026-05-28 | S5 진척 중단 반영 — Phase B1(인벤토리, 12개 라인 범위 확정) + Phase B2(skill-recommender, 8건 verified MCP 발견·본 검증 비사용) 완료, Phase B3 두 subagent dispatch 시 API 529 Overloaded × 2회로 중단. §"3.A S5 이어받기" 절 신설 — 라인 범위·skill-recommender 결과·ADR 5건 위임 누적·메모리 정합 검증 대상 명시. INDEX S5 행 `in_progress` 표시. 다음 세션은 본 브랜치(`docs/stack-review-S5-operations`)에서 Phase B3부터 이어받음. |
