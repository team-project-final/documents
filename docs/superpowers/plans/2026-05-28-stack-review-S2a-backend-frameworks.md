# 18 기술 스택 검증 — S2a 백엔드 프레임워크 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S2a 백엔드 프레임워크 카테고리(Spring 7개 + Python 4개 + Gateway 1개 = 12개 기술)에 대해 context7 공식 문서 검증 + `synapse-*` 실 코드 대조 + 보강(Deep Dive)을 수행한다. S2 전체(19개)는 분할 트리거를 초과해 S2a/S2b로 분할되었으며, 본 플랜은 백엔드 측을 담당한다.

**Architecture:** 마스터 스펙 §1의 6단계 파이프라인을 그대로 실행한다. 12개 기술은 에코시스템 3개 그룹(Spring 스택 / Python 스택 / Gateway)으로 묶어 **3개 subagent 병렬 검증**으로 효율 확보. 보고서 9 섹션 + 위키 일괄 패치 + PR/INDEX 갱신은 S1 플랜과 동일.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`
- S1 보고서(참조용): `documents/docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md`
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S2a-backend-frameworks.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S2a-backend-frameworks.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md`

**필수 메모리 사전 확인:**
- `data-sync-outbox-cqrs` — Spring Modulith·Spring Kafka 연결 검증
- `python-ai-stack-direct-sdk` — §4.2.4 LangChain 절 재작성 시 필수 (S1에서 실 코드 미사용 확정)
- `deploy-mirror-standardization` — 백엔드 빌드/Dockerfile 패턴 검증
- `git-pr-workflow` — 운영 표준

**S2a 검증 대상 (12개)**:
- §3.1 Spring Cloud Gateway 5
- §4.1.2 Spring Boot 4 (※ S1 위임 — Virtual Threads 자동 활성화 오기 확인 우선순위)
- §4.1.3 Spring Security 7
- §4.1.4 Spring Data JPA + Hibernate 7
- §4.1.5 Flyway 10.x
- §4.1.6 Spring WebFlux
- §4.1.7 Testcontainers (마스터 스펙 §2는 S5 이관 후보로 표시 — 본 세션 함께 검증)
- §4.1.8 Spring Modulith 2.0.x
- §4.2.2 FastAPI
- §4.2.3 uvicorn
- §4.2.4 LangChain (※ S1 위임 — 실 코드 미사용 확정. 절 통째 재작성 가능성)
- §4.2.5 httpx

---

## Phase A — 작업 브랜치 + 동기화 + 환경 검증

### Task A1: 브랜치 + 동기화

**Files:**
- 대상 레포: `C:\workspace\team-project-final\documents` (main) · `C:\workspace\team-project-final\documents.wiki` (master)

- [ ] **Step 1: documents 동기화 + S2a 브랜치 생성 (master-spec 기반 — PR #5 미머지 우회)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout docs/stack-review-master-spec
git pull --rebase origin docs/stack-review-master-spec
git checkout -b docs/stack-review-S2a-backend-frameworks
Pop-Location
```
Expected: `Switched to a new branch 'docs/stack-review-S2a-backend-frameworks'`.

- [ ] **Step 2: documents.wiki 동기화**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
Pop-Location
```
Expected: `Already up to date.` 또는 S1 후속 커밋(`6ae5155`)이 들어와 있음.

- [ ] **Step 3: INDEX 상태 확인**

S1 종료 시 INDEX는 `completed` 상태로 갱신됨. S2 행이 `pending`인지 확인:

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md' -Pattern '\| S2 \| 프레임워크' | Select-Object -ExpandProperty Line
```
Expected: `| S2 | 프레임워크 | pending | ... |`

- [ ] **Step 4: 환경 검증**

```
gh --version
node --version
```
Expected: `gh version 2.89+`, `v24+`. (skill-recommender는 S1에서 0건 채택 — S2a도 동일 카테고리 부재 예상되나 재검증 위해 Task B2에서 다시 실행)

---

## Phase B — S2a 6 단계 파이프라인

### Task B1: Step 1 — 카테고리 인벤토리 (12개 절 읽기)

**Files:**
- 읽기: `C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md`

- [ ] **Step 1: 12개 절 시작 라인 추출**

`Grep`:
```yaml
pattern: "^### (3\\.1 |4\\.1\\.[2-8] |4\\.2\\.[2-5] )"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 12줄의 헤더. S1 검증 후 라인 번호가 약간 이동했을 수 있으므로 신선한 값 사용.

- [ ] **Step 2: 각 절 본문 읽기**

각 절을 `Read` 도구로 읽는다. 다음 절 시작 직전까지의 범위:
- §3.1 Spring Cloud Gateway 5 → §3.2 Resilience4j 시작 직전까지
- §4.1.2 Spring Boot 4 → §4.1.3 시작 직전까지
- §4.1.3 ~ §4.1.8 각각 다음 절 직전까지
- §4.2.2 FastAPI → §4.2.3 직전까지
- §4.2.3 ~ §4.2.5 각각 다음 절 직전까지

- [ ] **Step 3: 인벤토리 표 작성 (보고서 §1용 임시 메모)**

| 절 | 기술 | 명시 버전 | 본문 라인 수 | 코드 블록 수 | 1차 진단 |
|----|------|----------|-----------|-----------|---------|
| §3.1 | Spring Cloud Gateway | 5.x | N | M | (스캔 결과) |
| §4.1.2 | Spring Boot | 4.x | N | M | (스캔 결과 — S1 위임 표현 우선 확인) |
| (... 10행 더 ...) | | | | | |

S1 위임 항목 사전 마킹:
- §4.1.2에서 "Virtual Threads 자동 활성화" 류 표현 검색 (S1-F03 동일 패턴)
- §4.2.4 LangChain 절 전체 내용 — 실 코드 미사용이 확정됨에 따라 위키가 어떻게 기술하는지가 재작성 범위 결정의 핵심

---

### Task B2: Step 2 — skill-recommender 카테고리 단위 실행

- [ ] **Step 1: 키워드 정의**

```
spring boot 4, spring security, spring data jpa, hibernate 7, flyway, spring webflux,
testcontainers, spring modulith, spring cloud gateway, fastapi, uvicorn, langchain, httpx
```

- [ ] **Step 2: 스크립트 실행**

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "spring boot,spring security,jpa hibernate,flyway,webflux,testcontainers,modulith,spring cloud gateway,fastapi,uvicorn,langchain,httpx" `
  --limit 30 `
  --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S2a-skill-rec.json
```
Expected: 카탈로그 매칭 결과 30개 이내.

- [ ] **Step 3: 결과 선별**

마스터 마켓플레이스·MCP 공식·verified 항목만 표로 정리. 0건이면 명시적으로 "0건" 기록 (S1과 동일하게 카탈로그가 백엔드 프레임워크 검증용 도구 부재할 가능성 큼).

```
$data = Get-Content C:\Temp\_S2a-skill-rec.json -Raw | ConvertFrom-Json
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 5 | ForEach-Object { "$($_.name) | $($_.type) | $($_.source) | v=$($_.verified)" }
```

- [ ] **Step 4: 임시 raw 파일 삭제**

```
Remove-Item C:\Temp\_S2a-skill-rec.json -Force -ErrorAction SilentlyContinue
```

---

### Task B3: Step 3+4 (Spring 스택) — 7개 기술 병렬 subagent

**Group A: Spring 스택 — §4.1.2 / §4.1.3 / §4.1.4 / §4.1.5 / §4.1.6 / §4.1.7 / §4.1.8**

- [ ] **Step 1: Spring 스택 검증 subagent dispatch**

`Agent` 도구(general-purpose) 호출. prompt 구성 (S1 J-F##과 동일한 형식, finding_id를 `SP-F##`로 매김):

```
You are verifying 7 Spring stack wiki sections against official documentation and synapse-* code.

## Wiki sections (paste full text after Task B1 Step 2 read):
§4.1.2 Spring Boot 4
§4.1.3 Spring Security 7
§4.1.4 Spring Data JPA + Hibernate 7
§4.1.5 Flyway 10.x
§4.1.6 Spring WebFlux
§4.1.7 Testcontainers
§4.1.8 Spring Modulith 2.0.x

## Verification per technology:

Step A (context7):
- mcp__plugin_context7_context7__resolve-library-id then query-docs
- Library IDs to try: /spring-projects/spring-boot, /spring-projects/spring-security,
  /spring-projects/spring-data-jpa, /hibernate/hibernate-orm, /flyway/flyway-db,
  /testcontainers/testcontainers-java, /spring-projects/spring-modulith
- Topics per tech (see S1 plan B4-B6 for examples — adapt to Spring concepts)

Step B (실 코드 대조):
- C:\workspace\team-project-final\synapse-{platform,engagement,knowledge,gateway,shared}-svc\build.gradle.kts
- C:\workspace\team-project-final\synapse-learning-svc\learning-card\build.gradle.kts
- Grep "spring-boot|spring-security|spring-data|hibernate|flyway|testcontainers|spring-modulith" in build.gradle.kts files
- application.yml/application.properties at synapse-*/src/main/resources/
- 메모리 data-sync-outbox-cqrs 참조: Spring Modulith 2.0.x · ShedLock 7.7.x · Spring Kafka 4 호환 검증

S1 위임 우선순위: §4.1.2 Spring Boot 4의 "Virtual Threads 자동 활성화" 표현이 있는지 우선 확인. 있으면 S1-F03과 동일한 정정 패치 작성 (Boot 4도 opt-in 필요, 공식 docs.spring.io 인용).

Step C (분류 + YAML 출력):
finding_id: SP-F01, SP-F02, ... (Spring 7개 기술 묶음)
Classes: E1/E2/D/R/OK + P0/P1/P2
Format identical to S1 (see plan B4 prompt).

Concerns:
- Spring Boot 4 + Spring Cloud Oakwood 2025.1.x 호환성 (18 §12.1 매트릭스 검증 — Boot 4가 정말 Cloud 2025.1.x를 요구하는지)
- Spring Modulith 1.x → 2.0.x 갱신 정합성 (S1 메모리 data-sync-outbox-cqrs 참조)
- Testcontainers 2.x (마스터 스펙은 S5 이관 후보로 표시 — 본 세션 검증 OK이지만 위치 결정은 별도)

Self-review checklist:
- [ ] context7/WebFetch 사용
- [ ] 모든 finding에 evidence 첨부
- [ ] 최소 5개 actionable finding
- [ ] OK 항목 최소 5개 (7개 기술 중 최소 5개에서 일부 OK 항목 도출)
- [ ] proposed_text 즉시 Edit 적용 가능

## Report Format
Status, Findings count, YAMLs, Self-review, Concerns
```

- [ ] **Step 2: subagent 결과 수신 + finding_id 캡처**

subagent 보고서를 작업 메모리에 보관. SP-F## 형식 그대로. controller가 나중에 S2a-F##로 통합 번호 변환.

---

### Task B4: Step 3+4 (Python 스택) — 4개 기술 병렬 subagent

**Group B: Python 스택 — §4.2.2 / §4.2.3 / §4.2.4 / §4.2.5**

- [ ] **Step 1: Python 스택 검증 subagent dispatch**

`Agent` 도구 호출:

```
You are verifying 4 Python framework wiki sections against official documentation and synapse-learning-svc/learning-ai code.

## Wiki sections (paste full text):
§4.2.2 FastAPI
§4.2.3 uvicorn
§4.2.4 LangChain   ← CRITICAL: memory python-ai-stack-direct-sdk says LangChain is NOT used in actual code. Verify what §4.2.4 says, propose full rewrite if needed.
§4.2.5 httpx

## Verification per technology:

Step A (context7):
- Library IDs: /tiangolo/fastapi, /encode/uvicorn, /langchain-ai/langchain, /encode/httpx
- Topics: FastAPI lifespan/dependency injection/Pydantic 2/OpenAPI, uvicorn workers/multiprocessing/UDS,
  LangChain (if 실 코드 미사용이면 검증 의미가 낮음 — 절 통째 재작성 또는 삭제 권장 가능),
  httpx async client/timeout/retry

Step B (실 코드 대조):
- C:\workspace\team-project-final\synapse-learning-svc\learning-ai\pyproject.toml
- C:\workspace\team-project-final\synapse-learning-svc\learning-ai\app\main.py
- C:\workspace\team-project-final\synapse-learning-svc\learning-ai\app\services\
- Grep "from fastapi|import uvicorn|from langchain|import httpx" recursively

§4.2.4 LangChain 특별 처리:
1. 18 §4.2.4가 실제로 무엇을 기술하는지 본문 발췌
2. 실 코드는 LangChain 미사용 (memory python-ai-stack-direct-sdk 확정)
3. 판단:
   (a) 18 §4.2.4가 일반적 LangChain 설명만이면 → 절 삭제 또는 "AI Service 통합 패턴(LangChain 비채택)"로 재작성 권장
   (b) 18 §4.2.4가 구체적 LangChain 사용 코드 예시까지 포함하면 → 더 강한 재작성(direct SDK 패턴으로 교체) 권장
4. 둘 다 본 finding의 proposed_text로 작성. 최종 결정은 controller가 보고서 §8에 명시.

Step C (분류 + YAML 출력):
finding_id: PY-F01, PY-F02, ... (Python 4개 묶음)
Classes/Severities 동일.

Concerns:
- FastAPI 0.115 vs 0.130 (S1에서 실 코드 0.115 확인됨 — §4.2.2가 다른 버전을 명시하면 D)
- uvicorn 0.30 vs 0.46
- httpx 0.27 vs 0.28
- 18 §4.2.4 LangChain 절을 통째 재작성 시 §1.4·§10.1 매트릭스 표도 함께 갱신 필요(범위 외 후속 과제)

Self-review checklist:
- [ ] context7 사용
- [ ] 모든 finding에 evidence
- [ ] 최소 3개 actionable finding
- [ ] OK 항목 최소 2개
- [ ] §4.2.4 LangChain 재작성 방향(절 삭제/재작성/유지) 명확 권고

## Report Format
Status, Findings count, YAMLs, Self-review, Concerns
```

- [ ] **Step 2: subagent 결과 수신**

PY-F## 형식. controller가 S2a-F##로 통합 번호 변환.

---

### Task B5: Step 3+4 (Gateway) — 1개 기술 subagent

**Group C: Gateway — §3.1 Spring Cloud Gateway 5**

- [ ] **Step 1: Gateway 검증 subagent dispatch**

`Agent` 도구 호출:

```
You are verifying 1 Spring Cloud Gateway 5 wiki section against official documentation and synapse-gateway code.

## Wiki section (paste full text):
§3.1 Spring Cloud Gateway 5

## Verification:

Step A (context7):
- Library ID: /spring-projects/spring-cloud-gateway
- Topics: reactive vs servlet stack(Boot 4에서 Gateway 5의 servlet/MVC 옵션 도입 여부),
  Route/Predicate/Filter DSL Java config 예시,
  Resilience4j 통합,
  Spring Cloud Oakwood 2025.1.x 호환 매트릭스

Step B (실 코드 대조):
- C:\workspace\team-project-final\synapse-gateway\build.gradle.kts (실제 SCG 버전)
- C:\workspace\team-project-final\synapse-gateway\src\main\resources\application.yml (route 정의)
- C:\workspace\team-project-final\synapse-gateway\src\main\java\com\synapse\gateway\config\ (Java config)
- Grep "@Bean|RouteLocator|RouteLocatorBuilder|GlobalFilter" in synapse-gateway

Step C (분류 + YAML 출력):
finding_id: GW-F01, GW-F02, ... (Gateway 단일 기술)
Classes/Severities 동일.

Self-review checklist:
- [ ] context7 사용
- [ ] 모든 finding에 evidence
- [ ] 최소 2개 actionable finding
- [ ] OK 항목 최소 1개

## Report Format
Status, Findings count, YAMLs, Self-review, Concerns
```

- [ ] **Step 2: subagent 결과 수신**

GW-F## 형식.

---

### Task B6: Step 5 — 보고서 9 섹션 작성

3개 subagent 결과를 통합. finding_id 통합 번호 매핑:
- SP-F01~F## (Spring 스택) → S2a-F01~F##
- PY-F01~F## (Python 스택) → S2a-F##+1~F##+M
- GW-F01~F## (Gateway) → S2a-F##+N~F##+L

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤 생성**

`Write` 도구로 `documents/docs/superpowers/specs/2026-05-28-stack-review-S2a-backend-frameworks.md` 생성:

```markdown
# 18 기술 스택 정의서 검증 — S2a 백엔드 프레임워크

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S1 후 v2.3-S1)
> 위키 패치 커밋: (Task B8에서 기입)

## 0. 요약 (Summary)
- 검증 기술 수: 12 (Spring 7 + Python 4 + Gateway 1)
- E1: __ · E2: __ · D: __ · R: __ · OK: __ (총 __ findings)
- P0: __ · P1: __ · P2: __

## 1. 카테고리 인벤토리 (Step 1)
(Task B1 결과)

## 2. skill-recommender 결과 (Step 2)
(Task B2 결과)

## 3. 공식 문서 검증 결과 (Step 3)
### 3.1 Spring 스택
### 3.2 Python 스택
### 3.3 Gateway

## 4. 실 코드 대조 결과 (Step 4)
### 4.1 의존성·버전 비교 (12개 통합 표)
### 4.2 사용 위치 경로 실재 확인
### 4.3 메모리 표준 정합성

## 5. 발견사항 (Findings)
(SP-F## → S2a-F##, PY-F## → S2a-F##+, GW-F## → S2a-F##++로 번호 매핑)

## 6. "더 깊이 / Deep Dive" 보강 항목 일람 (R 클래스)

## 7. 위키 패치 diff 요약
(Task B7 적용 후 Task B8에서 채움)

## 8. 후속 과제 (Follow-ups)
```

- [ ] **Step 2: §1 인벤토리 표 + §2 skill-recommender 결과 채우기**

`Edit`로 §1, §2 자리에 Task B1/B2 결과 삽입.

- [ ] **Step 3: §3 공식 문서 검증 + §4 실 코드 대조 채우기**

각 그룹 subagent의 Step A·B 결과를 §3.1/3.2/3.3과 §4.1로 통합 정리.

- [ ] **Step 4: §5 Findings 통합**

S2a-F## 통합 번호로 각 finding 블록 작성. 결합 패치(여러 finding이 같은 위치를 패치)는 명시.

- [ ] **Step 5: §6 Deep Dive 일람, §7 placeholder, §8 후속 과제**

§8에 다음 항목 명시:
- S1에서 위임받은 항목 처리 결과 (§4.1.2 Virtual Threads 오기 등)
- S2a에서 새로 발견된 다른 세션 영역 항목 → S2b/S3/S4/S5/S6 위임
- §1.4·§10.1 매트릭스 표 갱신 → 6 세션 후 v2.3 통합 작업으로
- §4.2.4 LangChain 절 처리 결정(삭제/재작성/유지)

- [ ] **Step 6: §0 요약 통계 갱신 + 검증**

`Edit`로 §0 갱신 후 검증:
```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S2a-backend-frameworks.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9

Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S2a-backend-frameworks.md' -Pattern '^### S2a-F\d+' | Measure-Object | Select-Object Count
# Expected: 최소 12개 (12개 기술 × 1+ finding)
```

---

### Task B7: Step 6 — 위키 패치 적용

- [ ] **Step 1: 위키 동기화 재확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```
Expected: `Already up to date.`

- [ ] **Step 2: E1/E2/D 클래스 finding 제자리 교체**

§5 각 finding의 `current_text` → `proposed_text`로 `Edit` 호출. 결합 패치(예: 동일 코드 블록 안의 여러 finding)는 단일 Edit으로 처리.

특히 주의 사항:
- §4.1.2 Spring Boot 4의 Virtual Threads 표현 (S1 위임 항목) — S1 §4.1.1 패치와 어조 일관성 유지
- §4.2.4 LangChain 절 처리 — §8 결정에 따라 다음 중 하나:
  - (a) 절 삭제: 절 자체를 통째로 제거 (§4.2.5 절 번호 영향 없음)
  - (b) 절 재작성: 제목·내용을 "AI Service 통합 패턴(direct SDK)"로 교체
  - (c) 절 유지 + 주의 박스 추가: "본 절은 LangChain 일반 설명이며, 본 프로젝트는 미채택 (memory python-ai-stack-direct-sdk 참조)"
  - 본 플랜은 (b)를 기본 권고 (S1 §4.2.1 정정과 일관성 유지). controller가 §8에서 최종 결정 명시.

- [ ] **Step 3: R 클래스 Deep Dive 부속 서브섹션 삽입**

각 R finding의 대상 절에서 "참고 자료" 직전 위치 찾기 (`Grep` + 충분한 컨텍스트로 unique match):
```
pattern: "^#### 참고 자료"
```
그러나 §4.1.2~§4.1.8 / §4.2.2~§4.2.5 / §3.1 각 절마다 "참고 자료"가 있으므로, **직전 행의 트러블슈팅 표 마지막 행과 함께 매칭**해서 unique 보장.

S1과 동일한 Deep Dive 형식:
```markdown
#### 더 깊이 / Deep Dive — <주제>
> 출처: <URL>  · 검증 일자: 2026-05-28

- **<주제 1>**: <2~5줄>
- **<주제 2>**: <2~5줄>
- **실전 베스트프랙티스**: ...
- **운영 함정**: ...
```

- [ ] **Step 4: §11 변경 이력 갱신**

위키 §11 변경 이력 표 맨 아래(v2.3-S1 행 다음)에 새 행 추가:
```
| v2.3-S2a | 2026-05-28 | Synapse Team | S2a 백엔드 프레임워크 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>). §3.1·§4.1.2~§4.1.8·§4.2.2~§4.2.5 정정. §4.2.4 LangChain 절 <처리 방식> 결정. |
```

- [ ] **Step 5: 패치 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
git diff --shortstat
Pop-Location
```
Expected: 단일 파일 변경. 다른 파일에 변경 보이면 즉시 중단 + 사용자 보고.

---

### Task B8: Step 6 — 위키 단일 커밋 + 푸시 + 보고서 헤더 SHA 기입

- [ ] **Step 1: 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S2a 백엔드 프레임워크 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

§3.1 Spring Cloud Gateway 5 / §4.1.2~§4.1.8 Spring 스택 / §4.2.2~§4.2.5 Python 스택

주요 정정:
- (controller가 §5/§7 결과 기반으로 채움 — S1 §4.1.1 Virtual Threads 오기 같은 핵심 패치 1~3건 1줄 요약)

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```

- [ ] **Step 2: 보고서 헤더 위키 SHA 기입**

`Edit`로 보고서에서 `> 위키 패치 커밋: (Task B8에서 기입)` → `> 위키 패치 커밋: documents.wiki@<wikiSha>`로 교체.

- [ ] **Step 3: §7 diff 요약 작성**

`git show --stat HEAD` 출력을 §7에 표로 정리 (S1 보고서 §7과 동일 형식).

---

## Phase C — 보고서 PR + INDEX 갱신

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: 보고서 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S2a-backend-frameworks.md
git status --short
git commit -m @'
docs(stack-review): S2a 백엔드 프레임워크 보고서

위키 커밋: documents.wiki@<wikiSha>

- S2a 보고서 9 섹션 완성
  - Spring 7개 + Python 4개 + Gateway 1개 = 12개 기술
  - <N> findings — E1:a · E2:b · D:c · R:d · OK:e
  - P0:x · P1:y · P2:z
- S1 위임 처리: §4.1.2 Virtual Threads 오기 동일 정정
- §4.2.4 LangChain 절 <처리 방식> (memory python-ai-stack-direct-sdk 근거)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push -u origin docs/stack-review-S2a-backend-frameworks
Pop-Location
```

- [ ] **Step 2: PR 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
gh pr create `
  --base main `
  --head docs/stack-review-S2a-backend-frameworks `
  --title "docs(stack-review): S2a 백엔드 프레임워크" `
  --body @'
## 개요

18 기술 스택 정의서 카테고리 검증의 두 번째 세션(S2a 백엔드 프레임워크).
S2 전체(19개)는 마스터 스펙 §2 분할 트리거로 S2a(12개)/S2b(7개)로 분할.

## 산출

- 보고서: docs/superpowers/specs/2026-05-28-stack-review-S2a-backend-frameworks.md
- 위키 커밋: documents.wiki@<wikiSha>

## 통계

- E1:a · E2:b · D:c · R:d · OK:e
- P0:x · P1:y · P2:z

## 주요 패치

(controller가 §5/§7 기반으로 P0·P1 항목 3~5건 bullet 정리)

## S1 위임 처리

- §4.1.2 Spring Boot 4 Virtual Threads 자동 활성화 오기 → 정정 완료
- (기타 S1 §8 위임 항목 처리 결과)

## §4.2.4 LangChain 절 처리

memory python-ai-stack-direct-sdk 근거. <삭제/재작성/유지 + 주의 박스 중 선택> 결정.

## 관련

- 마스터 스펙: docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md (PR #5)
- S1 보고서: docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md (PR #6)
- 플랜: docs/superpowers/plans/2026-05-28-stack-review-S2a-backend-frameworks.md
- 메모리: data-sync-outbox-cqrs, python-ai-stack-direct-sdk, deploy-mirror-standardization, git-pr-workflow

## 후속

- S2b Flutter 프레임워크 세션 (별도 플랜)
- (기타 §8 위임 항목)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
$prNumber = (gh pr view --json number -q .number)
Write-Output "PR_NUMBER=$prNumber"
Pop-Location
```

---

### Task C2: 위키 §11 PR# 교체 추가 커밋 (의도된 dual-commit 예외)

> 마스터 스펙 §5.3 "위키 세션당 단일 커밋" 원칙의 의도된 예외. S1과 동일 패턴.

- [ ] **Step 1: 위키 §11 행 교체**

`Edit`:
```
| v2.3-S2a | 2026-05-28 | Synapse Team | S2a 백엔드 프레임워크 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>).
```
→
```
| v2.3-S2a | 2026-05-28 | Synapse Team | S2a 백엔드 프레임워크 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<prNumber>).
```

- [ ] **Step 2: 위키 추가 커밋 + 푸시**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S2a 변경 이력 행에 PR 번호 기입

Refs: documents PR #<prNumber>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
Pop-Location
```

---

### Task C3: INDEX 최종 갱신 + 추가 커밋·푸시 + DoD 검증

- [ ] **Step 1: INDEX S2 행 갱신**

`Edit`:
```
| S2 | 프레임워크 | pending | - | - | - | - | - | - |
```
→
```
| S2 | 프레임워크 (S2a) | completed | #<prNumber> | documents.wiki@<wikiSha-short> | a/b/c/d/e | x/y/z | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 (S2b) | pending | - | - | - | - | - | - |
```
(S2 행이 2줄로 분할됨을 명시 — S2b는 별도 플랜 + PR로 분리 진행)

- [ ] **Step 2: 누적 통계 갱신**

기존 (S1 완료 후) 통계에 S2a 통계를 합산:
```
- 검증한 기술 수: 3 → 15 / 약 45
- E1: 9 → 9+a · E2: 10 → 10+b · D: 4 → 4+c · R: 3 → 3+d · OK: 4 → 4+e
- P0: 6 → 6+x · P1: 11 → 11+y · P2: 13 → 13+z
- 문서 자체 결함 발견 누계: 0 → (S2b 영역으로 위임된 §2.4·§2.5 충돌은 S2b에서 카운트)
```

- [ ] **Step 3: 교차 발견사항·후속 과제·메모리 갱신 후보 채우기**

S1 항목 처리 완료 표시 + S2a에서 새로 발생한 위임 항목 추가.

- [ ] **Step 4: 보고서 헤더에 PR 링크 추가**

`Edit`:
```
> 위키 패치 커밋: documents.wiki@<wikiSha>
```
바로 아래에 추가:
```
> 보고서 PR: [documents#<prNumber>](https://github.com/team-project-final/documents/pull/<prNumber>)
```

- [ ] **Step 5: 추가 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-S2a-backend-frameworks.md
git commit -m @'
docs(stack-review): S2a INDEX 갱신 + 보고서 PR 링크

- INDEX: S2 행을 S2a(completed) / S2b(pending) 2줄로 분할
- 누적 통계 갱신
- 교차 발견사항: S2a → S2b/S3/S4/S5/S6 위임 항목 명시

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin docs/stack-review-S2a-backend-frameworks
Pop-Location
```

- [ ] **Step 6: DoD 검증**

S1 Task C3 Step 6와 동일 검증:
```
# 1. 보고서 9 섹션
Select-String -Path '...S2a-backend-frameworks.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9

# 2. 위키 SHA가 보고서 헤더에 기입됨
Select-String -Path '...S2a-backend-frameworks.md' -Pattern 'documents.wiki@[0-9a-f]{7,}'
# Expected: 출력 있음

# 3. PR 링크가 보고서·INDEX에 기입됨
Select-String -Path '...stack-review-INDEX.md' -Pattern 'S2a.*#\d+'
# Expected: 출력 있음

# 4. finding 최소 12개 (12개 기술 × 1+)
Select-String -Path '...S2a-backend-frameworks.md' -Pattern '^### S2a-F\d+' | Measure-Object | Select-Object Count

# 5. PR open 확인
Push-Location 'C:\workspace\team-project-final\documents'
gh pr view --json state -q .state
# Expected: OPEN
Pop-Location
```

- [ ] **Step 7: 사용자 보고**

```
S2a 백엔드 프레임워크 세션 완료.

- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- §4.2.4 LangChain 절 처리: <삭제/재작성/유지+주의>
- S1 위임 처리: §4.1.2 Virtual Threads 동일 오기 정정 완료

다음:
- S2b Flutter 프레임워크 세션 플랜은 writing-plans 재호출로 작성
- (또는 S3/S4/S5/S6 순서대로 진행)
```

---

## 부록 — 비상 절차

S1 플랜과 동일:
- 위키 push 후 보고서 push 실패 → 즉시 보고서 push 재시도
- 위키 patch 잘못된 영역 → `git revert HEAD`
- context7/skill-recommender 둘 다 실패 → WebFetch 우회

---

## 추정 시간

- Phase A: 10분
- Phase B: 3~4시간 (12개 기술 검증 + 보고서 작성 + 위키 패치 — S1의 1.5배 분량)
- Phase C: 30분

총: ~4시간 (체크포인트 포함)
