# 코드 Rule북 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synapse 프로젝트의 코드 Rule북 19개 파일을 `docs/rules/`에 작성하고 6개 서비스 레포에 배포한다.

**Architecture:** 참조 레포(`VelkaressiaBlutkrone/spring-react-flutter-sns-mng` doc/rules)의 각 챕터를 `gh api`로 읽어서 Synapse 스택에 맞게 재작성. 완성 후 서비스 레포별 해당 파일 배포.

**Tech Stack:** Markdown, gh CLI (참조 데이터 fetch + 레포 배포)

**Spec reference:** [`docs/superpowers/specs/2026-05-12-code-rulebook-design.md`](../specs/2026-05-12-code-rulebook-design.md)

---

## File Structure

```
docs/rules/
├── 01-security.md
├── 02-function.md
├── 03-technical.md
├── 04-quality.md
├── 05-operation.md
├── 06-auth-token.md
├── 07-platform.md
├── 07-platform-spring.md
├── 07-platform-flutter.md
├── 08-kafka-event.md
├── 09-observability.md
├── 10-container-k8s.md
├── 11-data-sovereignty.md
├── 12-working-log.md
├── 13-python-llm.md
├── 14-task-structure.md
├── appendix-a-asvs.md
├── appendix-b-owasp.md
└── appendix-c-checklist.md
```

---

## Task Dependency Graph

```
T1 (참조 데이터 수집) ──┬─→ T2 (01-security + 06-auth-token)
                        ├─→ T3 (02-function + 03-technical)
                        ├─→ T4 (04-quality + 12-working-log + 14-task-structure)
                        ├─→ T5 (07-platform + 07-platform-spring)
                        ├─→ T6 (07-platform-flutter)
                        ├─→ T7 (08-kafka-event) ★ NEW
                        ├─→ T8 (13-python-llm)
                        ├─→ T9 (05-operation + 09-observability + 10-container-k8s + 11-data-sovereignty)
                        └─→ T10 (appendix-a + appendix-b + appendix-c)
                                                    │
                                                    ▼
                                        T11 (commit + push documents)
                                                    │
                                                    ▼
                                        T12 (6개 서비스 레포 배포)
```

T2~T10은 병렬 실행 가능.

---

## Task 1: 참조 데이터 수집 + 디렉토리 생성

**Files:**
- Create: `docs/rules/` (디렉토리)

- [ ] **Step 1: docs/rules 디렉토리 생성**

```bash
mkdir -p docs/rules
```

- [ ] **Step 2: 참조 레포 전체 파일 다운로드**

각 참조 파일을 `/tmp/ref-rules/`에 저장한다. 이후 Task에서 참조 데이터로 사용.

```bash
mkdir -p /tmp/ref-rules
for f in 01-security 02-function 03-technical 04-quality 05-operation 06-auth-token \
         07-platform 07-platform-spring 07-platform-flutter 09-observability \
         10-container-k8s 11-data-sovereignty 12-working-log 13-python-llm \
         14-task-structure appendix-a-asvs appendix-b-owasp appendix-c-checklist; do
  gh api "repos/VelkaressiaBlutkrone/spring-react-flutter-sns-mng/contents/doc/rules/${f}.md" \
    --jq '.content' | base64 -d > "/tmp/ref-rules/${f}.md"
  echo "Downloaded: ${f}.md"
done
```

Expected: 18개 파일 다운로드 완료.

---

## Task 2: 01-security.md + 06-auth-token.md 작성

**Files:**
- Create: `docs/rules/01-security.md`
- Create: `docs/rules/06-auth-token.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/01-security.md`와 `/tmp/ref-rules/06-auth-token.md`를 읽어 구조를 파악한다.

- [ ] **Step 2: 01-security.md 작성**

Synapse 맥락으로 재작성. 반말 캐주얼체. 핵심 내용:
- 1.1 Secrets 관리 `[MUST]`: `.env` 커밋 금지, fine-grained PAT만, MIRROR_TOKEN/GITOPS_TOKEN 90일 로테이션
- 1.1.1 Secrets Rotation: DB 30~90일, API 키 90일, JWT 서명키 90~180일, Grace Period
- 1.2 접근 제어 `[MUST]`: IDOR 방지 (userId==currentUser), 401 vs 403 구분
- 1.3 CORS `[MUST]`: whitelist, `*` 금지
- 1.4 입력 검증 `[SHOULD]`: XSS, SQL Injection, Avro 검증
- 1.5 OWASP 2025 매핑: A01, A06, A10

참조 레포의 포맷(Good/Bad 예시, 이유 블록)을 따르되 Synapse 코드 예시 사용.

- [ ] **Step 3: 06-auth-token.md 작성**

- 6.1 JWT `[MUST]`: Access 15분, Refresh 7일, RSA-256, kid 헤더
- 6.2 OAuth `[MUST]`: Google + GitHub, PKCE `[SHOULD]`
- 6.3 MFA `[SHOULD]`: TOTP 6자리 30초, 복구 코드 10개
- 6.4 세션/블랙리스트 `[MUST]`: Redis, 로그아웃 즉시 무효화

- [ ] **Step 4: Commit**

```bash
git add docs/rules/01-security.md docs/rules/06-auth-token.md
git commit -m "docs(rules): 01-security + 06-auth-token 작성

OWASP 2025 매핑 + Secrets Rotation + JWT/OAuth/MFA 규칙.
MUST/SHOULD/MAY 3단계 준수 레벨.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 02-function.md + 03-technical.md 작성

**Files:**
- Create: `docs/rules/02-function.md`
- Create: `docs/rules/03-technical.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/02-function.md`와 `/tmp/ref-rules/03-technical.md`를 읽는다.

- [ ] **Step 2: 02-function.md 작성**

- 2.1 API 설계 `[MUST]`: RESTful, kebab-case, 3~4단계, /api/v1/
- 2.2 페이지네이션 `[SHOULD]`: 커서 기반 기본
- 2.3 에러 응답 `[MUST]`: RFC 7807, 서비스별 코드 (PLAT-001 등)
- 2.4 Soft Delete `[MUST]`: 사용자 데이터 soft delete
- 2.5 DIP·OCP `[MUST]`: 인터페이스 의존

Spring 코드 예시 포함 (URI 패턴 Good/Bad, 에러 응답 JSON 예시).

- [ ] **Step 3: 03-technical.md 작성**

- 3.1 메서드 크기 `[SHOULD]`: 30~40줄
- 3.2 N+1 방지 `[MUST]`: fetchJoin/EntityGraph 코드 예시
- 3.3 트랜잭션 `[MUST]`: readOnly, 전파 레벨
- 3.4 AOP `[MUST]`: cross-cutting만, 비즈니스 로직 금지
- 3.5 Modulith 경계 `[MUST]`: allowedDependencies, shared만 허용
- 3.6 예외 처리 `[SHOULD]`: 커스텀 예외 계층

N+1 코드 예시(Bad: 그냥 findAll → Good: fetchJoin), AOP Bad/Good 예시 포함.

- [ ] **Step 4: Commit**

```bash
git add docs/rules/02-function.md docs/rules/03-technical.md
git commit -m "docs(rules): 02-function + 03-technical 작성

API 설계/에러 응답/Soft Delete + N+1/트랜잭션/AOP/Modulith 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 04-quality.md + 12-working-log.md + 14-task-structure.md 작성

**Files:**
- Create: `docs/rules/04-quality.md`
- Create: `docs/rules/12-working-log.md`
- Create: `docs/rules/14-task-structure.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/04-quality.md`, `/tmp/ref-rules/12-working-log.md`, `/tmp/ref-rules/14-task-structure.md` 읽기.

- [ ] **Step 2: 04-quality.md 작성**

- 4.1 테스트 구조 `[MUST]`: Given-When-Then, BDD 네이밍 예시
- 4.2 커버리지: line 70% `[SHOULD]`, branch 60% `[MAY]`
- 4.3 코드 리뷰 `[SHOULD]`: 400줄, 24h
- 4.4 정적 분석 `[MUST]`: Checkstyle/SpotBugs/flutter analyze/ruff+mypy
- 4.5 테스트 종류: Unit/Integration/E2E 예시

테스트 네이밍 Good/Bad 예시, JUnit5 + Given-When-Then 코드 블록 포함.

- [ ] **Step 3: 12-working-log.md 작성**

- 12.1 커밋 `[MUST]`: Conventional Commits + "왜" `[SHOULD]`
- 12.2 PR `[MUST]`: 변경 사항 + 테스트 결과, 400줄 `[SHOULD]`
- 12.3 HISTORY `[MUST]`: 매일 퇴근 전, 3줄 형식

커밋 메시지 Good/Bad 예시, PR 템플릿 마크다운 포함.

- [ ] **Step 4: 14-task-structure.md 작성**

기존 `docs/project-management/README.md` §6~§7 내용을 Rule 형식으로 재구성:
- 10필드 강제 `[MUST]`
- Step Goal 측정 가능 문장 `[MUST]`: 형식 + Good/Bad 예시
- Done When 배치 `[MUST]`
- 10단계 개발 워크플로 `[SHOULD]`

- [ ] **Step 5: Commit**

```bash
git add docs/rules/04-quality.md docs/rules/12-working-log.md docs/rules/14-task-structure.md
git commit -m "docs(rules): 04-quality + 12-working-log + 14-task-structure 작성

테스트/커버리지/리뷰 + 커밋/PR/HISTORY + Task 10필드 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 07-platform.md + 07-platform-spring.md 작성

**Files:**
- Create: `docs/rules/07-platform.md`
- Create: `docs/rules/07-platform-spring.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/07-platform.md`와 `/tmp/ref-rules/07-platform-spring.md` 읽기.

- [ ] **Step 2: 07-platform.md 작성**

- 7.0.1 의존 방향 `[MUST]`: shared ← 도메인. 역방향 금지
- 7.0.2 환경 설정 `[MUST]`: application-{profile}.yml 분리
- 7.0.3 같은 레포 공유 `[MUST]`: C-1/C-2, D-1/D-2 모듈 경계 침범 금지

의존 방향 다이어그램(텍스트), allowedDependencies 예시 코드 포함.

- [ ] **Step 3: 07-platform-spring.md 작성**

- 7.1.1 Modulith `[MUST]`: @ApplicationModule, verify() CI
- 7.1.2 DTO `[SHOULD]`: Java Record
- 7.1.3 Entity `[MUST]`: @Getter만, @Setter 금지
- 7.1.4 예외 핸들러 `[MUST]`: @RestControllerAdvice 단일
- 7.1.5 Gradle `[SHOULD]`: 30초 이내

package-info.java, Record DTO, Entity, ControllerAdvice 코드 예시 모두 포함.
참조 레포 24KB 분량을 Synapse(Spring Boot 4 + Modulith) 맥락으로 재작성.

- [ ] **Step 4: Commit**

```bash
git add docs/rules/07-platform.md docs/rules/07-platform-spring.md
git commit -m "docs(rules): 07-platform + 07-platform-spring 작성

플랫폼 공통 의존 규칙 + Spring Boot 4 Modulith/DTO/Entity/예외 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 07-platform-flutter.md 작성

**Files:**
- Create: `docs/rules/07-platform-flutter.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/07-platform-flutter.md` 읽기 (22KB, 상세 내용 많음).

- [ ] **Step 2: 07-platform-flutter.md 작성**

- 7.3.1 상태 관리 `[MUST]`: Riverpod 3 + codegen, setState 금지
- 7.3.2 라우팅 `[SHOULD]`: GoRouter 14, 딥링크
- 7.3.3 디렉토리 `[MUST]`: Feature-first lib/features/{name}/presentation/
- 7.3.4 디자인 토큰 `[MUST]`: AppColors/AppSpacing 사용, 하드코딩 금지
- 7.3.5 분석 `[MUST]`: flutter analyze 경고 0건

Riverpod provider 예시, GoRouter 설정 예시, Feature-first 디렉토리 트리,
AppColors 사용 Good/Bad 예시 포함. DESIGN.md 색상 토큰과 연계.

- [ ] **Step 3: Commit**

```bash
git add docs/rules/07-platform-flutter.md
git commit -m "docs(rules): 07-platform-flutter 작성

Riverpod 3/GoRouter/Feature-first/디자인 토큰/분석 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: 08-kafka-event.md 작성 (NEW)

**Files:**
- Create: `docs/rules/08-kafka-event.md`

- [ ] **Step 1: Synapse 이벤트 컨텍스트 수집**

기존 Avro 스키마와 SCHEMA_EVOLUTION.md 참조:
- `synapse-shared` 레포의 `src/main/avro/` 구조
- `docs/SCHEMA_EVOLUTION.md` 정책

- [ ] **Step 2: 08-kafka-event.md 작성**

- 8.1 토픽 네이밍 `[MUST]`: `{서비스}.{도메인}.{이벤트}-v{N}`
  - 예: `platform.auth.user-registered-v1`, `knowledge.note.note-created-v1`
- 8.2 CloudEvents 1.0 `[MUST]`: specversion, id, source, type, time, tenantid, datacontenttype, traceparent
  - CloudEventEnvelope.avsc 예시 포함
- 8.3 Avro 스키마 `[MUST]`: namespace `com.synapse.event.{도메인}`, default 값 필수
  - 새 스키마 추가 가이드: namespace 패턴, tenantId 필수, timestamp-millis
- 8.4 호환성 `[MUST]`: BACKWARD 기본, knowledge = BACKWARD_TRANSITIVE
- 8.5 금지 사항 `[MUST]`: NONE 모드, 필드 이름 변경, default 없는 필드 추가, enum 제거, 필수 필드 삭제
- 8.6 Consumer `[MUST]`: 멱등 처리, 최소 1회 전달
- 8.7 DLQ `[SHOULD]`: 3회 재시도 후 DLQ

Good/Bad Avro 스키마 예시, Consumer 멱등 처리 패턴 코드 예시 포함.

- [ ] **Step 3: Commit**

```bash
git add docs/rules/08-kafka-event.md
git commit -m "docs(rules): 08-kafka-event 작성 (NEW)

Kafka 토픽 네이밍/CloudEvents/Avro 호환성/Consumer 멱등 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: 13-python-llm.md 작성

**Files:**
- Create: `docs/rules/13-python-llm.md`

- [ ] **Step 1: 참조 파일 읽기**

`/tmp/ref-rules/13-python-llm.md` 읽기.

- [ ] **Step 2: 13-python-llm.md 작성**

- 13.1 FastAPI `[MUST]`: Pydantic v2, async, 타입 힌트 100%
- 13.2 LLM 호출 `[MUST]`: timeout 30초, retry 3회 + exponential backoff
  - Anthropic SDK 호출 예시 (with timeout/retry)
- 13.3 프롬프트 `[SHOULD]`: system/user 분리, 파��� 기반 (`prompts/` 디렉토리)
- 13.4 비용 제어 `[MUST]`/`[SHOULD]`: 토큰 로깅 `[MUST]`, 일일 한도 `[SHOULD]`
  - 로깅 미들웨어 코드 예시
- 13.5 테스트 `[MUST]`: mock 응답, CI에서 실제 API 호출 금지
  - pytest fixture mock 예시

- [ ] **Step 3: Commit**

```bash
git add docs/rules/13-python-llm.md
git commit -m "docs(rules): 13-python-llm 작성

FastAPI/LLM 호출/프롬프트 관리/비용 제어/테스트 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: 05-operation.md + 09-observability.md + 10-container-k8s.md + 11-data-sovereignty.md 작성

**Files:**
- Create: `docs/rules/05-operation.md`
- Create: `docs/rules/09-observability.md`
- Create: `docs/rules/10-container-k8s.md`
- Create: `docs/rules/11-data-sovereignty.md`

- [ ] **Step 1: 참조 파일 읽기**

4개 참조 파일 읽기 (모두 작은 파일 1~3KB).

- [ ] **Step 2: 05-operation.md 작성**

- 5.1 배포 `[MUST]`: GitOps 단일 경로, dev auto/staging·prod 수동
- 5.2 롤백 `[MUST]`: 이전 태그 복원, 60초 판단
- 5.3 Health Check `[MUST]`: Spring actuator + FastAPI health
- 5.4 장애 대응 `[SHOULD]`: 공유 → 격리 → 롤백/핫픽스

- [ ] **Step 3: 09-observability.md 작성**

- 9.1 로깅 `[SHOULD]`: 구조화 JSON, traceId/spanId
- 9.2 메트릭 `[SHOULD]`: Actuator + Micrometer, 비즈니스 메트릭
- 9.3 트레이싱 `[SHOULD]`: OpenTelemetry, Kafka 체인 전파

- [ ] **Step 4: 10-container-k8s.md 작성**

- 10.1 Dockerfile `[MUST]`: multi-stage, non-root, .dockerignore
- 10.2 이미지 태그 `[MUST]`: git SHA, latest 금지
- 10.3 Kustomize `[MUST]`: base/overlay 분리
- 10.4 ArgoCD `[MUST]`: dev auto, staging/prod 수동
- 10.5 리소스 `[MUST]`: requests/limits 명시

Dockerfile 예시 (Spring Boot multi-stage), kustomization.yaml 예시 포함.

- [ ] **Step 5: 11-data-sovereignty.md 작성**

- 11.1 개인정보: bcrypt `[MUST]`, AES-256 `[SHOULD]`
- 11.2 데이터 보존 `[SHOULD]`: 90일 후 익명화
- 11.3 로그 마스킹 `[MUST]`: 개인정보 필드 자동 마스킹

- [ ] **Step 6: Commit**

```bash
git add docs/rules/05-operation.md docs/rules/09-observability.md \
        docs/rules/10-container-k8s.md docs/rules/11-data-sovereignty.md
git commit -m "docs(rules): 05-operation + 09-observability + 10-container-k8s + 11-data-sovereignty 작성

배포/롤백/Health + 로깅/메트릭/트레이싱 + Docker/K8s/ArgoCD + 개인정보 규칙.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: 부록 (appendix-a/b/c) 작성

**Files:**
- Create: `docs/rules/appendix-a-asvs.md`
- Create: `docs/rules/appendix-b-owasp.md`
- Create: `docs/rules/appendix-c-checklist.md`

- [ ] **Step 1: 참조 파일 읽기**

3개 부록 참조 파일 읽기.

- [ ] **Step 2: appendix-a-asvs.md 작성**

ASVS 4.0 항목 중 Synapse에 해당하는 것만 매핑 테이블로:
- V2 Authentication
- V3 Session Management
- V4 Access Control
- V5 Validation
- V8 Data Protection
- V13 API

각 항목에 Synapse Rule 참조 (예: "V2.1 → 06-auth-token.md §6.1")

- [ ] **Step 3: appendix-b-owasp.md 작성**

OWASP Top 10 2025 요약 테이블:

| # | 항목 | Synapse 대응 | Rule 참조 |
의 형식으로 10개 항목 매핑.

- [ ] **Step 4: appendix-c-checklist.md 작성**

전체 `[MUST]` 규칙을 체크박스로 나열. PR 셀프체크 용도.
챕터별 그룹핑:

```markdown
## Security
- [ ] `.env`/시크릿 파일 커밋 없음 (01 §1.1)
- [ ] IDOR 체크: userId == currentUser (01 §1.2)
...

## Function
- [ ] RESTful URI kebab-case (02 §2.1)
...
```

모든 `[MUST]` 규칙을 누락 없이 포함.

- [ ] **Step 5: Commit**

```bash
git add docs/rules/appendix-a-asvs.md docs/rules/appendix-b-owasp.md docs/rules/appendix-c-checklist.md
git commit -m "docs(rules): appendix-a/b/c 부록 작성

ASVS 매핑 + OWASP 2025 매핑 + MUST 규칙 체크리스트.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: 통합 검증 + Push

**Files:**
- Verify: `docs/rules/*.md` (19개)

- [ ] **Step 1: 파일 수 검증**

```bash
ls docs/rules/*.md | wc -l
```
Expected: 19

- [ ] **Step 2: MUST 규칙 수 집계**

```bash
grep -r "\[MUST\]" docs/rules/ | wc -l
```
Expected: 30개 이상 (스펙 기준)

- [ ] **Step 3: 형식 일관성 체크**

```bash
# 모든 파일이 '# N.' 헤딩으로 시작하는지
for f in docs/rules/[0-9]*.md; do head -1 "$f"; done
# 부록은 '# 부록' 또는 '# Appendix'
for f in docs/rules/appendix-*.md; do head -1 "$f"; done
```

- [ ] **Step 4: Push to origin**

```bash
git push origin main
```

---

## Task 12: 6개 서비스 레포 배포

**Files:**
- Deploy to: synapse-platform-svc, synapse-engagement-svc, synapse-knowledge-svc, synapse-learning-svc, synapse-frontend, synapse-shared

- [ ] **Step 1: 배포 매핑 확인**

스펙 §3에 따른 배포:

공통 (모든 레포):
```
01-security.md, 02-function.md, 03-technical.md, 04-quality.md,
05-operation.md, 06-auth-token.md, 07-platform.md, 09-observability.md,
11-data-sovereignty.md, 12-working-log.md, 14-task-structure.md,
appendix-a-asvs.md, appendix-b-owasp.md, appendix-c-checklist.md
```

트랙별 추가:
- platform/engagement/knowledge-svc: + 07-platform-spring.md, 08-kafka-event.md, 10-container-k8s.md
- learning-svc: + 07-platform-spring.md, 07-platform-flutter.md, 08-kafka-event.md, 10-container-k8s.md, 13-python-llm.md
- frontend: + 07-platform-flutter.md
- shared: + 08-kafka-event.md

- [ ] **Step 2: 각 레포에 docs/rules/ 생성 + 파일 복사 + commit + push**

각 레포의 `/tmp/bootstrap/{name}` 클론에서:
```bash
cd /tmp/bootstrap/{repo}
git pull --rebase origin main
mkdir -p docs/rules
cp {공통 파일들} docs/rules/
cp {트랙별 추가 파일들} docs/rules/
git add docs/rules/
git commit -m "docs(rules): 코드 Rule북 배포 (MUST/SHOULD/MAY 3단계)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

6개 레포 모두 반복.

- [ ] **Step 3: 배포 검증**

```bash
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  echo "=== $repo ==="
  gh api "repos/team-project-final/$repo/contents/docs/rules" --jq '.[].name' | wc -l
done
```

Expected:
- platform/engagement/knowledge: 17개
- learning: 19개
- frontend: 15개
- shared: 15개

---

## Self-Review

### 1. Spec coverage

| 스펙 섹션 | Task 매핑 | 커버 |
|-----------|----------|:----:|
| §2 파일 구조 (19개) | T1 디렉토리 + T2~T10 각 파일 | ✅ |
| §3 서비스 레포 배포 | T12 | ✅ |
| §4.1 01-security | T2 | ✅ |
| §4.2 02-function | T3 | ✅ |
| §4.3 03-technical | T3 | ✅ |
| §4.4 04-quality | T4 | ✅ |
| §4.5 05-operation | T9 | ✅ |
| §4.6 06-auth-token | T2 | ✅ |
| §4.7 07-platform | T5 | ✅ |
| §4.8 07-platform-spring | T5 | ✅ |
| §4.9 07-platform-flutter | T6 | ✅ |
| §4.10 08-kafka-event | T7 | ✅ |
| §4.11 09-observability | T9 | ✅ |
| §4.12 10-container-k8s | T9 | ✅ |
| §4.13 11-data-sovereignty | T9 | ✅ |
| §4.14 12-working-log | T4 | ✅ |
| §4.15 13-python-llm | T8 | ✅ |
| §4.16 14-task-structure | T4 | ✅ |
| §4.17 부록 3개 | T10 | ✅ |
| §5 공통 포맷 | 모든 Task에서 참조 | ✅ |

미커버 항목: 없음.

### 2. Placeholder scan

TBD/TODO 없음. 모든 Task Step에 구체적 내용(규칙 목록 + 코드 예시 지시) 포함.

### 3. 일관성

- 파일 이름: 스펙 §2와 모든 Task의 Create 경로 일치 ✓
- 배포 매핑: 스펙 §3 테이블과 T12 Step 1 일치 ✓
- 준수 레벨: 모든 Task에서 `[MUST]`/`[SHOULD]`/`[MAY]` 일관 사용 ✓
