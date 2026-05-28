# 18 기술 스택 검증 — S1 언어 세션 + 마스터 부트스트랩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S1 언어 카테고리(Java 21·Python 3.12·Dart 3.x)에 대해 context7 공식 문서 검증 + `synapse-*` 실 코드 대조 + 보강(Deep Dive 부속 서브섹션)을 수행하고, 동시에 6 세션 전체를 추적할 마스터 INDEX를 부트스트랩한다.

**Architecture:** 마스터 스펙 `2026-05-28-tech-stack-doc-review-design.md`의 6 단계 파이프라인을 그대로 실행한다. Phase A에서 마스터 INDEX를 생성하고(이번 한 번만), Phase B에서 S1 6 단계를 실행해 보고서와 위키 패치를 산출한 뒤, Phase C에서 `documents` 측 PR과 INDEX 갱신으로 마무리한다. S2~S6은 본 플랜 완료 후 writing-plans 재호출로 별도 작성.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP · skill-recommender(`C:\workspace\dsd\.claude\skills\skill-recommender`) · skill-catalog(`C:\workspace\dsd\skill-catalog\catalog.json`)

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md` (이미 작성됨, 브랜치 `docs/stack-review-master-spec`)
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S1-languages.md`
- 본 플랜이 만들 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md`

**필수 메모리 사전 확인:** `data-sync-outbox-cqrs` · `deploy-mirror-standardization` · `git-pr-workflow`

---

## Phase A — 마스터 INDEX 부트스트랩

### Task A1: 마스터 INDEX 파일 생성

**Files:**
- Create: `C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md`

**Branch:** S1 작업 브랜치는 Task B1에서 만들고, INDEX는 그 브랜치 위에서 생성·커밋한다(마스터 스펙 PR과 별개 브랜치).

- [ ] **Step 1: 마스터 스펙의 §6.1 INDEX 템플릿을 그대로 옮긴 파일 생성**

`Write` 도구로 다음 내용을 파일에 작성:

```markdown
# 18 기술 스택 정의서 — 카테고리 검증 진행판

작성일: 2026-05-28
마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2 → v2.3 (예정)

## 세션 진척

| 세션 | 카테고리 | 상태 | 보고서 PR | 위키 커밋 | E1/E2/D/R/OK | P0/P1/P2 | 시작일 | 종료일 |
|------|---------|------|---------|---------|-------------|---------|--------|--------|
| S1 | 언어 | in_progress | - | - | - | - | 2026-05-28 | - |
| S2 | 프레임워크 | pending | - | - | - | - | - | - |
| S3 | 데이터 | pending | - | - | - | - | - | - |
| S4 | 이벤트 | pending | - | - | - | - | - | - |
| S5 | 운영 | pending | - | - | - | - | - | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 0 / 약 45
- E1: 0 · E2: 0 · D: 0 · R: 0 · OK: 0
- P0: 0 · P1: 0 · P2: 0
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 0

## 세션 간 발생한 교차 발견사항
- (없음)

## 후속 과제 큐 (Follow-ups)
- (없음)

## 메모리 갱신 후보
- (없음)
```

- [ ] **Step 2: 파일 존재·내용 검증**

PowerShell 실행:
```
Test-Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md'
(Get-Content 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md' | Measure-Object -Line).Lines
```
Expected: `True`, 줄 수는 약 25~30줄.

- [ ] **Step 3: 커밋은 Phase B1 이후로 보류**

INDEX는 S1 작업 브랜치에 들어간다. Phase B1에서 브랜치를 만들고, 그 후 한꺼번에 스테이징한다. 이 단계에서는 파일만 생성하고 git add는 하지 않는다.

---

## Phase B — S1 6 단계 파이프라인 실행

### Task B1: 작업 브랜치 + 동기화

**Files:**
- 대상 레포: `C:\workspace\team-project-final\documents` (main) · `C:\workspace\team-project-final\documents.wiki` (master)

- [ ] **Step 1: documents 레포 동기화 + S1 브랜치 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
git checkout main
git pull --rebase origin main
git checkout -b docs/stack-review-S1-languages
Pop-Location
```
Expected: `Switched to a new branch 'docs/stack-review-S1-languages'` (이미 docs/stack-review-master-spec 브랜치가 별도로 존재해도 무관).

- [ ] **Step 2: documents.wiki 동기화 (브랜치 없음, master 직접 작업)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
Pop-Location
```
Expected: `Already up to date.` 또는 새 커밋 합쳐짐.

- [ ] **Step 3: Phase A에서 만든 INDEX 파일을 S1 브랜치에 스테이징(아직 커밋 X)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
Pop-Location
```
Expected: `A  docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`

- [ ] **Step 4: 환경 검증 — 의존 도구가 동작하는지 확인**

```
gh --version
node --version
Test-Path 'C:\workspace\dsd\skill-catalog\catalog.json'
Test-Path 'C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs'
```
Expected: `gh version ...`, `v20+`, `True`, `True`.
하나라도 실패하면 **본 플랜 중단**하고 사용자에게 보고.

---

### Task B2: Step 1 — 카테고리 인벤토리 작성

**Files:**
- 읽기: `C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md` (절 4.1.1, 4.2.1, 2.2)
- 메모리: 작업용 인벤토리(Step 5에서 보고서 §2로 옮김)

- [ ] **Step 1: 4.1.1 Java 21 절 범위 확인**

`Grep` 도구로 절 경계 찾기:
```
pattern: "^### 4\\.1\\.[12] "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 두 줄의 `###` 헤더 라인 번호. 두 라인 사이가 Java 21 절.

- [ ] **Step 2: 4.1.1 Java 21 절 본문 읽기**

`Read` 도구로 offset=L1, limit=L2-L1+1 (Step 1에서 얻은 범위).

- [ ] **Step 3: 4.2.1 Python 3.12 절 본문 읽기**

같은 방식으로 4.2.1 ~ 4.2.2 사이 범위 읽기. Grep 패턴 `^### 4\.2\.[12] `.

- [ ] **Step 4: 2.2 Dart 3.x 절 본문 읽기**

Grep 패턴 `^### 2\.[23] ` 후 Read.

- [ ] **Step 5: 인벤토리 표 작성 (보고서 §2용 임시 메모)**

각 절에 대해 다음 정보를 표로 정리:

| 절 | 기술 | 명시 버전 | 본문 라인 수 | 코드 블록 수 | 1차 진단 |
|----|------|----------|-----------|-----------|---------|
| §4.1.1 | Java 21 LTS | 21 (LTS) | N | M | (스캔 결과) |
| §4.2.1 | Python 3.12 | 3.12 | N | M | (스캔 결과) |
| §2.2 | Dart 3.x | 3.x | N | M | (스캔 결과) |

이 표는 Task B8에서 보고서 §2에 그대로 들어간다. 메모리로만 유지(파일 저장 X).

---

### Task B3: Step 2 — skill-recommender 실행 (카테고리 단위)

**Files:**
- 실행: `C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs`
- 입력: `C:\workspace\dsd\skill-catalog\catalog.json`
- 메모리: 추천 결과(Step 5에서 보고서 §3으로 옮김)

- [ ] **Step 1: 카테고리 키워드 정의**

S1 카테고리 키워드:
```
java 21, jdk, openjdk, java lts, virtual threads, project loom, zgc, gc,
python 3.12, cpython, asyncio,
dart 3, null safety, pattern matching, records, isolate
```

- [ ] **Step 2: skill-recommender 스크립트 실행**

PowerShell:
```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "java 21,virtual threads,zgc,python 3.12,asyncio,dart 3,null safety,records" `
  --limit 30 `
  --type all 2>&1 | Tee-Object -FilePath C:\workspace\team-project-final\documents\docs\superpowers\specs\_S1-skill-recommender-raw.json
```
Expected: 30개 이하의 JSON 매칭 결과가 `_S1-skill-recommender-raw.json`에 저장됨. 콘솔에도 출력.

스크립트 실행이 실패하면 (예: `--keywords` 파서 오류) `node ... --help`로 인자 확인 후 재시도. 정 안 되면 카탈로그를 jq로 직접 필터:
```
Get-Content C:\workspace\dsd\skill-catalog\catalog.json | ConvertFrom-Json | ForEach-Object { $_.items } | Where-Object { $_.name -match "java|python|dart" -or $_.description -match "java|python|dart" } | Select-Object -First 30 | ConvertTo-Json -Depth 4
```

- [ ] **Step 3: 결과에서 채택 후보 선별**

다음 기준으로 5개 이내 선별 (보고서 §3에 들어갈 표):
- 공식 마켓플레이스 플러그인(`source: marketplace`) 우선
- 공식 MCP Registry(`source: mcp-official`) 차순위
- verified 플래그가 true인 항목
- 본 세션 사용 가능성이 명확한 도구만

선별 결과는 작업 메모리에 다음 표로 유지:

| # | 이름 | 유형 | 출처 | 본 세션 채택 사유 |
|---|------|------|------|----------------|

- [ ] **Step 4: 임시 raw 파일 삭제 (커밋에 들어가지 않게)**

```
Remove-Item C:\workspace\team-project-final\documents\docs\superpowers\specs\_S1-skill-recommender-raw.json -Force -ErrorAction SilentlyContinue
```
선별된 표만 메모리에 유지. 원본은 보고서에 다시 첨부할 필요 없음(노이즈 회피).

---

### Task B4: Step 3 — context7로 Java 21 공식 문서 패치

**Files:**
- 메모리: context7 결과(보고서 §4로 옮김)

- [ ] **Step 1: Java 21 라이브러리 ID 해석**

`mcp__plugin_context7_context7__resolve-library-id` 도구 호출:
```
libraryName: "java 21 jdk"
```
Expected: 라이브러리 ID(예: `/openjdk/jdk21-docs`). 매칭 안 되면 `java`, `openjdk` 등 키워드 변형.

- [ ] **Step 2: Java 21 핵심 주제 도큐먼트 패치**

`mcp__plugin_context7_context7__query-docs` 도구로 다음 토픽 패치:
- `topic: "virtual threads project loom"`
- `topic: "garbage collector ZGC G1"`
- `topic: "LTS lifecycle support timeline"`
- `topic: "pattern matching switch records"`
- `topic: "vector api"` (18 문서가 이 부분을 다루는지 확인 후 필요 시)

각 호출당 약 300~800줄 출력. 결과를 작업 메모리에 보관.

- [ ] **Step 3: 18 문서 §4.1.1 본문(이미 B2에서 읽음)과 대조**

각 주제에서 다음 항목 점검:
- 명시된 LTS 종료 일자가 공식 문서와 일치하는가?
- 명시된 GC 옵션(예: `-XX:+UseZGC`)이 21에서 정확한가?
- 명시된 Virtual Threads API(예: `Thread.ofVirtual()`)가 공식 시그니처와 일치하는가?
- 명시된 Records/Pattern Matching 예제가 컴파일 가능한가?

발견사항을 분류해서 메모:
- E1/E2/D/R/OK 클래스
- P0/P1/P2 심각도
- evidence_official(인용 URL/section)
- current_text(18 문서 발췌)
- proposed_text(대체/추가)
- patch_target(라인 범위)

- [ ] **Step 4: context7 실패 시 대안**

`resolve-library-id`가 매칭 0건이거나 query-docs가 빈 출력이면:
1. 18 문서 §4.1.1 "참고 자료"에 명시된 URL을 `WebFetch`로 직접 패치:
   - https://openjdk.org/projects/jdk/21/
   - https://docs.oracle.com/en/java/javase/21/
   - https://www.oracle.com/java/technologies/java-se-support-roadmap.html
2. 결과를 작업 메모리에 보관.
3. 보고서에 `evidence_official:` 출처를 WebFetch URL로 명시.

---

### Task B5: Step 3 — context7로 Python 3.12 공식 문서 패치

- [ ] **Step 1: Python 3.12 라이브러리 ID 해석**

`resolve-library-id` 호출:
```
libraryName: "python 3.12"
```
Expected: 라이브러리 ID(예: `/python/cpython` 또는 `/python/docs-3.12`).

- [ ] **Step 2: Python 3.12 핵심 주제 도큐먼트 패치**

`query-docs` 다음 토픽:
- `topic: "asyncio coroutines task group"`
- `topic: "typing generics PEP 695"` (3.12 신규)
- `topic: "f-string PEP 701"`
- `topic: "per-interpreter GIL PEP 684"`
- `topic: "release schedule EOL"`

- [ ] **Step 3: 18 문서 §4.2.1 본문과 대조**

다음 항목 점검:
- 3.12 신규 기능 명시가 공식과 일치하는가? (PEP 번호·문법)
- EoL 일자(2028-10)가 공식 PEP 602와 일치하는가?
- asyncio·TaskGroup 등 예제가 3.12 문법에 맞는가?
- 패키지 매니저(uv·pip·poetry) 권장이 현재(2026-05) 권장과 정합하는가?

발견사항을 같은 형식으로 메모.

- [ ] **Step 4: context7 실패 시 대안**

`WebFetch` 대상:
- https://docs.python.org/3.12/
- https://peps.python.org/pep-0602/ (EoL 정책)
- https://peps.python.org/pep-0695/ (Type Parameter Syntax)
- https://peps.python.org/pep-0701/ (f-string)

---

### Task B6: Step 3 — context7로 Dart 3.x 공식 문서 패치

- [ ] **Step 1: Dart 3 라이브러리 ID 해석**

`resolve-library-id` 호출:
```
libraryName: "dart"
```
Expected: 라이브러리 ID(예: `/dart-lang/dart-docs`).

- [ ] **Step 2: Dart 3.x 핵심 주제 도큐먼트 패치**

`query-docs` 다음 토픽:
- `topic: "records pattern matching"`
- `topic: "null safety sound"`
- `topic: "isolate concurrency"`
- `topic: "extension methods"`
- `topic: "const constructor"`
- `topic: "aot jit compilation"`

- [ ] **Step 3: 18 문서 §2.2 본문과 대조**

다음 항목 점검:
- 명시된 Dart 버전 범위(`'>=3.0.0 <4.0.0'`)가 18 문서 헤더의 "Flutter 3.41.x / Dart 3.8+"와 모순되지 않는가?
- Records 문법 예제(`(String id, int score)`)가 공식 문법과 일치하는가?
- Pattern Matching 예제가 3.0+ 문법인가?
- Isolate 모델 설명이 3.x 변경사항(예: `Isolate.run`)을 반영하는가?

발견사항 메모.

- [ ] **Step 4: context7 실패 시 대안**

`WebFetch` 대상:
- https://dart.dev/language
- https://dart.dev/null-safety
- https://dart.dev/language/records
- https://dart.dev/language/patterns

---

### Task B7: Step 4 — 실 코드 대조 (`synapse-*` 레포)

**Files:**
- 읽기: `C:\workspace\team-project-final\synapse-platform-svc\build.gradle*` (또는 pom.xml)
- 읽기: `C:\workspace\team-project-final\synapse-learning-svc\learning-card\build.gradle*`
- 읽기: `C:\workspace\team-project-final\synapse-learning-svc\learning-ai\pyproject.toml` 또는 `requirements.txt`
- 읽기: `C:\workspace\team-project-final\syn\pubspec.yaml`

- [ ] **Step 1: Java 21 실 사용 버전 추출**

`Grep` 도구 호출 1:
```yaml
path: C:\workspace\team-project-final\synapse-platform-svc
pattern: "sourceCompatibility|targetCompatibility|languageVersion|jvmTarget"
glob: "**/build.gradle*"
output_mode: content
-n: true
```
`Grep` 도구 호출 2 (모든 백엔드 레포 동시 스캔):
```yaml
path: C:\workspace\team-project-final
pattern: "java\\.toolchain|JavaVersion\\.VERSION_"
glob: "**/build.gradle*"
output_mode: content
-n: true
head_limit: 50
```
Expected: `21` 또는 `17` 등 사용 버전이 노출됨.

각 백엔드 레포(synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc/learning-card / synapse-gateway / synapse-shared)에서 Java 버전 수집.

- [ ] **Step 2: Python 3.12 실 사용 버전 추출**

`Grep` 도구 호출 1:
```yaml
path: C:\workspace\team-project-final\synapse-learning-svc
pattern: "python_requires|requires-python|^python\\s*="
glob: "**/pyproject.toml"
output_mode: content
-n: true
```
`Grep` 도구 호출 2:
```yaml
path: C:\workspace\team-project-final\synapse-learning-svc
pattern: "FROM python"
glob: "**/Dockerfile*"
output_mode: content
-n: true
```
Expected: `3.12` 또는 `3.11` 등.

- [ ] **Step 3: Dart 3.x 실 사용 버전 추출**

`Read` 도구로 `C:\workspace\team-project-final\syn\pubspec.yaml` 전체 읽고 `environment.sdk` 값 확인.

`Grep` 도구로도 교차 확인:
```yaml
path: C:\workspace\team-project-final\syn
pattern: "^\\s*sdk:|^\\s*dart:"
glob: "pubspec.yaml"
output_mode: content
-n: true
```

- [ ] **Step 4: 18 문서 "프로젝트 내 사용 위치" 경로 실재 확인**

§4.1.1 / §4.2.1 / §2.2 본문에 적힌 경로 목록을 추출(Read 결과에서 정리)한 뒤, 각 경로의 실재 여부를 `Glob`으로 확인:

예시:
```
Glob 'syn/lib/features/notes/**'
Glob 'syn/lib/core/models/**'
Glob 'synapse-learning-svc/learning-ai/**'
```
Expected: 매칭 1건 이상 = OK. 0건 = D(Drift) 후보.

- [ ] **Step 5: D 클래스 후보 매트릭스 작성**

| 항목 | 18 문서 명시 | synapse-* 실측 | 진실 결정 | 클래스 |
|------|-------------|---------------|---------|-------|
| Java 버전 | 21 | (실측) | (18 또는 코드) | E1/D/OK |
| Python 버전 | 3.12 | (실측) | (18 또는 코드) | E1/D/OK |
| Dart SDK 범위 | `>=3.0.0 <4.0.0` | (실측) | (18 또는 코드) | E1/D/OK |
| 사용 위치 경로 | (명시 목록) | (Glob 결과) | (반영) | D/OK |

진실 결정 규칙: 메모리 표준이 있으면 메모리, 없으면 더 최근 갱신(2026-05-28 v2.2 직후)이 보통 진실. 결정 근거는 보고서에 명시.

---

### Task B8: Step 5 — 보고서 §1 요약 + §2 인벤토리 작성

**Files:**
- Create: `C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md`

- [ ] **Step 1: 보고서 헤더 + §0 메타 작성**

`Write` 도구로 파일을 다음 헤더로 생성 (나머지 섹션은 후속 Step에서 Edit로 추가):

```markdown
# 18 기술 스택 정의서 검증 — S1 언어

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2
> 위키 패치 커밋: (Task B13에서 기입)

## 0. 요약 (Summary)

- 검증 기술 수: 3 (Java 21 / Python 3.12 / Dart 3.x)
- E1: __ · E2: __ · D: __ · R: __ · OK: __
- P0: __ · P1: __ · P2: __
- 문서 자체 결함: __건

## 1. 카테고리 인벤토리 (Step 1)

(Task B8 Step 2에서 채움)

## 2. skill-recommender 결과 (Step 2)

(Task B8 Step 3에서 채움)

## 3. 공식 문서 검증 결과 (Step 3)

(Task B9에서 채움)

## 4. 실 코드 대조 결과 (Step 4)

(Task B10에서 채움)

## 5. 발견사항 (Findings)

(Task B11에서 채움)

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

(Task B11에서 채움)

## 7. 위키 패치 diff 요약

(Task B12 적용 후 Task B14에서 채움)

## 8. 후속 과제 (Follow-ups)

(Task B11에서 채움)
```

- [ ] **Step 2: §1 카테고리 인벤토리 채우기**

Task B2 Step 5에서 만든 인벤토리 표를 `Edit`로 §1 자리에 삽입 (위 플레이스홀더 `(Task B8 Step 2에서 채움)`를 표로 교체).

- [ ] **Step 3: §2 skill-recommender 결과 채우기**

Task B3 Step 3에서 선별한 5개 이내 표 + 한 줄 요약(어떤 도구를 본 세션에 채택했는지)을 §2 자리에 삽입.

- [ ] **Step 4: 검증**

```
Test-Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md'
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^## \d' | Select-Object -ExpandProperty Line
```
Expected: True + `## 0` ~ `## 8` 모두 출력 (9개 섹션).

---

### Task B9: Step 5 — 보고서 §3 공식 문서 검증 결과

- [ ] **Step 1: §3 본문 채우기**

`Edit`로 §3 자리에 다음 형식으로 작성:

```markdown
## 3. 공식 문서 검증 결과 (Step 3)

### 3.1 Java 21

- **출처**: context7 `<library-id>` query-docs / WebFetch URL 목록
- **검증 토픽**: Virtual Threads, GC, LTS 라이프사이클, Pattern Matching, Records
- **18 문서와의 일치 여부**:
  - 명시 버전 21 LTS: (OK / E1 — 사유)
  - LTS 종료 일자: (OK / E1 — 공식 일자 vs 18 명시 일자)
  - Virtual Threads API: (OK / E2)
  - ZGC 옵션: (OK / E2)
  - Records 예제: (OK / E2)
- **인용 원문**: (핵심 부분 3~5줄)

### 3.2 Python 3.12

(같은 구조 — Task B5 결과 기반)

### 3.3 Dart 3.x

(같은 구조 — Task B6 결과 기반)
```

각 sub-section은 실제 Task B4/B5/B6에서 수집한 내용으로 채움. 인용은 공식 URL을 명시.

- [ ] **Step 2: 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^### 3\.\d ' | Select-Object -ExpandProperty Line
```
Expected: `### 3.1 Java 21`, `### 3.2 Python 3.12`, `### 3.3 Dart 3.x` 세 줄.

---

### Task B10: Step 5 — 보고서 §4 실 코드 대조 결과

- [ ] **Step 1: §4 본문 채우기**

`Edit`로 §4 자리에 Task B7 Step 5의 매트릭스 표 삽입:

```markdown
## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성·버전 비교

| 항목 | 18 문서 명시 | synapse-* 실측 | 출처(파일:라인) | 진실 | 클래스 |
|------|-------------|---------------|--------------|------|-------|
| Java toolchain | 21 | (실측) | synapse-platform-svc/build.gradle:LN | (선택) | E1/D/OK |
| Python | 3.12 | (실측) | learning-ai/pyproject.toml:LN | (선택) | E1/D/OK |
| Dart SDK | >=3.0.0 <4.0.0 | (실측) | syn/pubspec.yaml:LN | (선택) | E1/D/OK |

### 4.2 사용 위치 경로 실재 확인

| 18 문서 명시 경로 | Glob 결과 | 진단 |
|----------------|----------|------|

### 4.3 메모리 표준 정합성

- `data-sync-outbox-cqrs` (S4 영역이므로 본 세션 직접 영향 없음)
- `deploy-mirror-standardization` (S5 영역)
- `git-pr-workflow` (운영 표준 — 본 세션 워크플로 준수 확인)
```

- [ ] **Step 2: 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^### 4\.\d ' | Select-Object -ExpandProperty Line
```
Expected: `### 4.1`, `### 4.2`, `### 4.3` 세 줄.

---

### Task B11: Step 5 — 보고서 §5/§6/§7(템플릿)/§8 채우기

- [ ] **Step 1: §5 Findings — finding_id 블록을 클래스별로 누적**

발견된 각 항목을 다음 표준 필드 블록으로 §5에 추가:

```markdown
### S1-F01 · <짧은 제목> · <E1|E2|D|R|OK> / <P0|P1|P2>

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  (공식 인용 또는 URL)
  ```
- **evidence_repo**: (synapse-*/path:LN — 해당 시)
- **current_text**:
  ```
  (18 문서 현재 표현 발췌)
  ```
- **proposed_text**:
  ```
  (대체 또는 추가 텍스트)
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1581-L1685
- **deep_dive**: false
```

finding_id는 S1-F01부터 순번. 클래스·심각도가 정확히 명시되어야 함.

OK 항목도 한 줄 표 형식으로 §5 끝에 별도 표 정리:

```markdown
### OK 항목

| finding_id | section | 한 줄 사유 | 증거 |
|-----------|---------|----------|------|
| S1-F0N | §X.X.X | ... | ... |
```

- [ ] **Step 2: §6 Deep Dive 일람 — R 클래스 모음**

R 클래스로 분류된 finding마다 다음 일람 표에 한 줄씩:

```markdown
## 6. "더 깊이 / Deep Dive" 보강 항목 일람

| finding_id | 절 | Deep Dive 제목 | 핵심 요지(1줄) |
|-----------|-----|-------------|-------------|
| S1-F0N | §4.1.1 Java 21 | "Virtual Threads 운영 함정" | Pinning 회피·monitorenter 주의 |
```

각 항목은 마스터 스펙 §4.2가 정의한 형식("출처/검증 일자/주제 2~5줄/베스트프랙티스/운영 함정")으로 Task B12에서 위키에 실제 추가될 내용의 1줄 요약.

- [ ] **Step 3: §7 위키 패치 diff 요약 — 자리만 만들고 비워둠**

```markdown
## 7. 위키 패치 diff 요약

(Task B12 적용 후 Task B14에서 채움)
```

- [ ] **Step 4: §8 후속 과제 (Follow-ups)**

본 세션에서 발견했지만 본 세션 범위 밖인 항목을 정리. 예시:

```markdown
## 8. 후속 과제 (Follow-ups)

- (S2 위임) §2.4·§2.5 절 번호 충돌 — S2 첫 발견사항으로 인덱스에 이미 예약
- (S5 위임) 본 세션에서 발견한 §4.1.7 Testcontainers 관련 정보 → S5에서 다룸
- (별도 작업) 18 문서 §1.4 기술 스택 전체 목록 표에 Java/Python/Dart 버전 정렬 검토
```

- [ ] **Step 5: §0 요약 통계 갱신**

`Edit`로 §0 자리에 finding 클래스·심각도 카운트 채우기. Task B11 Step 1~4 결과 기반.

- [ ] **Step 6: 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^### S1-F\d\d' | Select-Object -ExpandProperty Line | Measure-Object | Select-Object Count
```
Expected: 최소 3개 이상 finding (Java/Python/Dart 각 1건 이상).

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
```
Expected: 9 (0~8까지 모든 섹션).

---

### Task B12: Step 6 — 위키 패치 적용

**Files:**
- Modify: `C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md`

- [ ] **Step 1: 사전 동기화 재확인 (B1 이후 시간 경과 가능성)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```
Expected: `Already up to date.` 또는 깨끗한 상태.

만약 변경이 들어왔으면(다른 작업자), 라인 번호가 어긋날 수 있으므로 §4.1.1·§4.2.1·§2.2 라인 범위를 다시 `Grep`으로 확인 후 patch_target 재계산.

- [ ] **Step 2: E1/E2/D 클래스 finding을 모두 제자리 교체 (Edit 도구)**

§5에서 정리한 각 finding의 `current_text` → `proposed_text`로 `Edit` 호출. `replace_all: false` 기본. 표 안의 값만 바뀌면 표 전체 재정렬 금지.

- [ ] **Step 3: R 클래스 Deep Dive 부속 서브섹션 삽입**

각 R finding의 대상 절(§4.1.1 / §4.2.1 / §2.2 등)에서 "참고 자료" 직전 위치를 `Grep`으로 찾기:
```
pattern: "^#### 참고 자료"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```

Edit로 "참고 자료" 헤더 직전에 다음 블록을 삽입:

```markdown
#### 더 깊이 / Deep Dive
> 출처: <공식 URL 또는 context7 query>  · 검증 일자: 2026-05-28

- **<주제 1>**: <2~5줄>
- **<주제 2>**: <2~5줄>
- **실전 베스트프랙티스**: ...
- **운영 함정**: ...

```

- [ ] **Step 4: §11 변경 이력 갱신**

위키 파일 §11 변경 이력 표 맨 아래에 새 행 추가:

```
| v2.3-S1 | 2026-05-28 | Synapse Team | S1 언어 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>) |
```

PR 번호는 Task C1에서 결정되므로 우선 `#<TBD>`로 두고, Task C2에서 다시 Edit로 교체.

- [ ] **Step 5: 패치 적용 후 lint-grade 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
Pop-Location
```
Expected: 라인 수가 적절히 증가 (제자리 교체는 ±, R 추가는 +). diff stat에 한 파일만 표시.

만약 18 외 다른 파일에 변경이 보이면 **즉시 중단** + 사용자 보고.

---

### Task B13: Step 6 — 위키 단일 커밋 + push

- [ ] **Step 1: 추적된 변경만 스테이징 (git-pr-workflow 메모리 준수)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git status --short
Pop-Location
```
Expected: `M  18_기술_스택_정의서.md` 한 줄만.

- [ ] **Step 2: 커밋 (heredoc로 멀티라인 메시지)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git commit -m @'
docs(stack): S1 언어 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
Pop-Location
```
숫자 a/b/c/d/e와 x/y/z는 Task B11 Step 5에서 산출된 값으로 치환.

Expected: `[master <sha>] docs(stack): S1 언어 ...` 출력 + `1 file changed, N insertions(+), M deletions(-)`.

- [ ] **Step 3: 푸시**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git push origin master
Pop-Location
```
Expected: `master -> master`.

push 실패 시(예: non-fast-forward) — 누군가 그 사이 푸시했음. `git pull --rebase origin master` 후 재시도. 재시도해도 충돌이면 **사용자 보고**.

- [ ] **Step 4: 커밋 SHA 캡처**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```
이 SHA를 다음 Task B14에서 보고서에 기입.

---

### Task B14: 보고서 헤더에 위키 SHA 기입 + §7 diff 요약 작성

- [ ] **Step 1: 보고서 헤더 갱신**

`Edit` 도구로 보고서 파일에서:
```
> 위키 패치 커밋: (Task B13에서 기입)
```
→
```
> 위키 패치 커밋: documents.wiki@<wikiSha>
```

`<wikiSha>`는 Task B13 Step 4의 값.

- [ ] **Step 2: §7 diff 요약 작성**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git show --stat HEAD
Pop-Location
```
출력에서 적용된 hunks의 라인 범위·종류(추가/변경) 요약을 §7에 표로 정리:

```markdown
## 7. 위키 패치 diff 요약

위키 커밋: `documents.wiki@<wikiSha>` (master)

| Finding | 클래스 | 위치(L) | 변경 유형 |
|---------|-------|--------|---------|
| S1-F01 | E1 | L1599-L1602 | 제자리 교체 |
| S1-F0N | R  | L1683 직전 | Deep Dive 삽입 |

커밋 메시지 본문(그대로):

\`\`\`
docs(stack): S1 언어 — context7·repo 검증 반영 + 보강
...
\`\`\`
```

- [ ] **Step 3: 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern 'documents.wiki@[0-9a-f]{7,}' | Select-Object -ExpandProperty Line
```
Expected: 최소 1줄(헤더 + §7 합쳐 2줄 가능).

---

## Phase C — 보고서 PR + INDEX 갱신

### Task C1: documents 측 커밋·푸시·PR 생성

- [ ] **Step 1: documents 작업 브랜치 상태 확인**

```
Push-Location 'C:\workspace\team-project-final\documents'
git branch --show-current
git status --short
Pop-Location
```
Expected:
- 현재 브랜치: `docs/stack-review-S1-languages`
- 스테이지 안 된 신규 파일 2개 (INDEX는 Task B1에서 이미 staged, 보고서는 still untracked) — 정확히 확인.

만약 INDEX의 `A`(staged) 상태가 유지되지 않았으면 다시 `git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`.

- [ ] **Step 2: 보고서 + INDEX 스테이징**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
Pop-Location
```
Expected: 정확히 두 파일만 `A` 또는 `M`. 다른 추적 변경/미추적 파일이 끼면 안 됨 (`.playwright-mcp/` 같은 무관 미추적 파일은 절대 add 금지 — git-pr-workflow 메모리).

- [ ] **Step 3: 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents'
git commit -m @'
docs(stack-review): S1 언어 보고서 + 마스터 INDEX 부트스트랩

위키 커밋: documents.wiki@<wikiSha>

- INDEX 신규 작성 (6 세션 진척 추적, 마스터 스펙 §6.1 템플릿)
- S1 언어 보고서 9 섹션 완성
  - Java 21 / Python 3.12 / Dart 3.x
  - E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- S2 위임: §2.4·§2.5 절 번호 충돌

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
Pop-Location
```
`<wikiSha>` 및 통계 수치는 실제 값으로 치환.

- [ ] **Step 4: 푸시**

```
Push-Location 'C:\workspace\team-project-final\documents'
git push -u origin docs/stack-review-S1-languages
Pop-Location
```
Expected: `Branch 'docs/stack-review-S1-languages' set up to track ...`.

- [ ] **Step 5: PR 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
gh pr create `
  --base main `
  --head docs/stack-review-S1-languages `
  --title "docs(stack-review): S1 언어 + 마스터 INDEX 부트스트랩" `
  --body @'
## 개요

18 기술 스택 정의서 카테고리 검증의 첫 번째 세션(S1 언어).
context7 공식 문서 + synapse-* 실 코드 대조 + Deep Dive 보강.

## 산출

- 보고서: docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md
- 마스터 INDEX: docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
- 위키 커밋: documents.wiki@<wikiSha>

## 통계

- E1:a · E2:b · D:c · R:d · OK:e
- P0:x · P1:y · P2:z

## 관련

- 마스터 스펙: docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md (PR 별도)
- 메모리: data-sync-outbox-cqrs, deploy-mirror-standardization, git-pr-workflow

## 후속

- S2 프레임워크 세션 (별도 플랜)
- §2.4·§2.5 절 번호 충돌 — S2에서 해결
'@
Pop-Location
```
Expected: PR URL 출력. PR 번호를 캡처:
```
$prNumber = (gh pr view --json number -q .number)
Write-Output "PR_NUMBER=$prNumber"
```

---

### Task C2: 위키 §11 변경 이력의 `#<TBD>`를 PR 번호로 교체

> **Dual-commit 예외 사유**: 마스터 스펙 §5.3은 "위키 세션당 단일 커밋"을 원칙으로 두지만, 본 단계에서 한 차례 추가 위키 커밋이 발생한다. PR 번호는 `gh pr create` 이후에만 결정되며, §4.2 변경 이력 행 템플릿(`보고서: documents PR #<num>`)이 PR 번호를 요구하기 때문이다. 닭과 달걀 — 의도된 예외로 본 플랜에서 명시 허용. 향후 세션 플랜에서도 동일 패턴 적용.

- [ ] **Step 1: 위키 §11 행 교체**

`Edit` 도구로 `documents.wiki/18_기술_스택_정의서.md`에서:
```
| v2.3-S1 | 2026-05-28 | Synapse Team | S1 언어 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>) |
```
→
```
| v2.3-S1 | 2026-05-28 | Synapse Team | S1 언어 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<prNumber>) |
```
숫자 a/b/c/d도 실제 값으로 (Task B12 Step 4 시점에는 임시일 수 있음).

- [ ] **Step 2: 위키 추가 커밋 (제목 짧게)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S1 변경 이력 행에 PR 번호 기입

Refs: documents PR #<prNumber>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
Pop-Location
```

이 커밋은 §5.3 "세션당 단일 커밋" 규칙의 예외다. PR 번호는 PR 생성 후에만 알 수 있으므로 어쩔 수 없는 후행 커밋. 보고서 §8에 이 예외를 1줄로 기록:
```
- 위키에 추가로 1 커밋(§11 PR 번호 기입). 운영 표준의 의도된 예외.
```

`Edit`로 보고서 §8 후속 과제 위에 위 한 줄 추가.

---

### Task C3: 마스터 INDEX 최종 갱신 + 커밋·푸시

- [ ] **Step 1: INDEX 세션 진척 행 갱신**

`Edit` 도구로 `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`에서:
```
| S1 | 언어 | in_progress | - | - | - | - | 2026-05-28 | - |
```
→
```
| S1 | 언어 | completed | #<prNumber> | documents.wiki@<wikiSha-short> | a/b/c/d/e | x/y/z | 2026-05-28 | 2026-05-28 |
```
`<wikiSha-short>`는 처음 7자.

- [ ] **Step 2: 누적 통계 갱신**

INDEX의 "## 누적 통계" 섹션:
```
- 검증한 기술 수: 0 / 약 45
- E1: 0 · E2: 0 · D: 0 · R: 0 · OK: 0
- P0: 0 · P1: 0 · P2: 0
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 0
```
→
```
- 검증한 기술 수: 3 / 약 45
- E1: a · E2: b · D: c · R: d · OK: e
- P0: x · P1: y · P2: z
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 1 (§2.4·§2.5 — S2 예약)
```

- [ ] **Step 3: 교차 발견사항·후속 과제 큐 채우기**

INDEX의 "## 세션 간 발생한 교차 발견사항":
```
- (없음)
```
→
```
- S1 → S2: §2.4 google_fonts·§2.5 CanvasKit 절 번호 충돌
```

INDEX의 "## 후속 과제 큐" 및 "## 메모리 갱신 후보"도 S1 보고서 §8 기반으로 채움.

- [ ] **Step 4: 보고서 헤더의 PR 링크 추가**

`Edit` 도구로 S1 보고서 헤더에서:
```
> 위키 패치 커밋: documents.wiki@<wikiSha>
```
바로 아래에 추가:
```
> 보고서 PR: documents#<prNumber>
```

- [ ] **Step 5: 추가 커밋·푸시 (INDEX + 보고서 헤더)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md
git status --short
git commit -m @'
docs(stack-review): S1 INDEX 갱신 + 보고서 PR 링크

- INDEX 세션 진척: S1 completed
- 누적 통계 갱신
- 보고서 헤더에 PR 링크 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin docs/stack-review-S1-languages
Pop-Location
```

이 커밋은 같은 PR에 추가로 들어간다(force-push 금지).

- [ ] **Step 6: 최종 검증 — Definition of Done 체크리스트**

(마스터 스펙 §6.3과 일치) — 다음 모두 충족 확인:

```
# 1. 보고서 9 섹션 충족
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9

# 2. 위키 SHA가 보고서 헤더에 기입됨
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S1-languages.md' -Pattern 'documents.wiki@[0-9a-f]{7,}'
# Expected: 출력 있음

# 3. PR 링크가 보고서·INDEX에 기입됨
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md' -Pattern '#\d+'
# Expected: 출력 있음

# 4. 모든 E1/E2/D 항목이 patch_target에 매핑됨 (수동 점검)
# 5. 모든 finding에 evidence_official OR evidence_repo 첨부 (수동 점검)
# 6. PR open 확인
Push-Location 'C:\workspace\team-project-final\documents'
gh pr view --json state -q .state
# Expected: OPEN
Pop-Location
```

- [ ] **Step 7: 사용자에게 머지 대기 보고**

(에이전트는 머지하지 않음 — git-pr-workflow 메모리)

다음 메시지를 사용자에게 출력:

```
S1 언어 세션 완료.

- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z

다음:
- PR 리뷰 후 사용자가 직접 머지
- S2 프레임워크 세션 플랜은 writing-plans 재호출로 작성
```

---

## 부록 — 비상 절차

### 위키 push 후 보고서 push 실패한 경우

위키만 master에 들어가고 보고서 PR이 없는 상태가 가장 위험. 발생 시:
1. 위키를 즉시 revert하지 말 것 — 변경 의도는 정상.
2. `documents` 측 충돌·인증 문제 해결 후 보고서·INDEX를 다시 푸시.
3. 그래도 안 되면 사용자에게 보고하고 수동 푸시 요청.

### 위키 patch가 잘못된 영역에 들어간 경우

`git diff HEAD~1 -- 18_기술_스택_정의서.md`로 hunks 확인. 잘못된 hunk만 revert:
```
git revert --no-commit HEAD
# 잘못된 hunk만 unstage하고 나머지는 다시 스테이지하는 방식으로 수정 (interactive)
```
복잡하면 그냥 `git revert HEAD`로 통째 revert + 새 패치로 재작업.

### context7/skill-recommender 둘 다 실패한 경우

`WebFetch`로 18 문서 명시 URL 직접 패치. 그래도 실패하면 발견사항의 `evidence_official`을 "검증 불가 — 출처 도구 모두 실패"로 표기하고, 클래스는 R(검증 보류)로 분류해 위키 패치는 하지 않고 보고서에만 남김. P 심각도는 P2.

---

## 추정 시간

- Phase A: 10분
- Phase B: 2~3시간 (Step 3 context7 호출 + Step 5 보고서 작성이 가장 김)
- Phase C: 30분

총: ~3시간 (체크포인트 포함)
