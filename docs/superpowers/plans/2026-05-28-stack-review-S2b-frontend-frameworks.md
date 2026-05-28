# 18 기술 스택 검증 — S2b 프론트엔드 프레임워크 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S2b 프론트엔드 프레임워크 카테고리(Flutter 7개 기술)에 대해 context7 공식 문서 검증 + `synapse-frontend/` 실 코드 대조 + 보강을 수행한다. 마스터 스펙 §2에서 사전 발견된 §2.4·§2.5 절 번호 충돌(2건)을 본 세션에서 재번호 부여로 해결한다.

**Architecture:** 마스터 스펙 §1 6단계 파이프라인을 그대로 실행한다. 7개 기술은 단일 Flutter 에코시스템이므로 **1개 subagent**로 묶어 검증 (S2a의 3-subagent 분할 대비 효율적). 위키 패치 단계에서 §2.4·§2.5 절 번호 충돌을 §2.4~§2.9로 재번호 부여 — 이 변경은 본 세션의 가장 큰 구조적 영향.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S2a 종료 후 S2a completed / S2b pending 상태)
- S1·S2a 보고서 (참조용): 동일 specs 디렉토리
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S2b-frontend-frameworks.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S2b-frontend-frameworks.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md`
- 실 Flutter 레포: `C:\workspace\team-project-final\synapse-frontend\`

**필수 메모리 사전 확인:** `git-pr-workflow`

**S2b 검증 대상 (7개)**:
- §2.1 Flutter 3.x
- §2.3 Riverpod (flutter_riverpod)
- §2.4 GoRouter (go_router) — 첫 번째 §2.4
- §2.4 google_fonts — 두 번째 §2.4 ⚠ 절 번호 충돌
- §2.5 Sliver 기반 리스트 아키텍처 — 첫 번째 §2.5
- §2.5 CanvasKit (Flutter Web Renderer) — 두 번째 §2.5 ⚠ 절 번호 충돌
- §2.6 D3.js / force_directed
- §2.7 flutter_test + integration_test

**절 번호 재번호 부여 정책 (본 세션 결정)**:

기존 (충돌 상태) → 신규:
- §2.1 Flutter 3.x → §2.1 (유지)
- §2.2 Dart 3.8+ → §2.2 (유지, S1 결과)
- §2.3 Riverpod → §2.3 (유지)
- §2.4 GoRouter → §2.4 (유지, 등장 순서 우선)
- §2.4 google_fonts → **§2.5 (재번호)**
- §2.5 Sliver → **§2.6 (재번호)**
- §2.5 CanvasKit → **§2.7 (재번호)**
- §2.6 D3.js → **§2.8 (재번호)**
- §2.7 flutter_test → **§2.9 (재번호)**

이 정책은 마스터 스펙 §2의 S1·S2a에서 사전 표시된 결함을 해소한다. 외부 문서(§3·§4 등)에서 §2.x를 인용하는 곳이 있는지 본 세션에서 grep으로 확인하고, 있으면 동시 정정.

**S1·S2a 위임 항목 (S2b에서 처리)**:
- ✅ 절 번호 충돌 §2.4·§2.5 → 위 재번호 부여로 해결
- ✅ §2.1 Flutter pubspec 환경 제약 `>=3.0.0 <4.0.0` → 실 SDK `>=3.11.0 <4.0.0`으로 정정
- ✅ §2.3 Riverpod·기타 §2.x 절에서 `syn/` 경로 표기 잔존 확인·정정 (S1에서 §2.2 Dart는 이미 정정됨)

---

## Phase A — 작업 브랜치 + 동기화 + 환경 검증

### Task A1: 브랜치 + 동기화

- [ ] **Step 1: documents 동기화 + S2b 브랜치 생성 (master-spec 기반)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout docs/stack-review-master-spec
git pull --rebase origin docs/stack-review-master-spec
git checkout -b docs/stack-review-S2b-frontend-frameworks
Pop-Location
```
Expected: `Switched to a new branch 'docs/stack-review-S2b-frontend-frameworks'`.

- [ ] **Step 2: documents.wiki 동기화**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
git log --oneline -3
Pop-Location
```
Expected: 최근 커밋이 S2a v2.3-S2a PR# 기입(`7f091cd`)인지 확인.

- [ ] **Step 3: INDEX 파일을 S2a 브랜치에서 가져오기 (S2a 종료 상태 반영)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git checkout docs/stack-review-S2a-backend-frameworks -- docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
Pop-Location
```
Expected: `A  docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S2a completed 상태 포함).

- [ ] **Step 4: INDEX의 S2b 상태가 `pending`인지 확인**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md' -Pattern '^\| S2 \| .*프론트.*\| pending'
```
Expected: 매치 1줄.

---

## Phase B — S2b 6 단계 파이프라인

### Task B1: Step 1 — 7개 절 인벤토리 작성

- [ ] **Step 1: 7개 절 + 충돌 상태 확인**

`Grep`:
```yaml
pattern: "^### 2\\.[1-9] "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 9개 헤더 (§2.1, §2.2, §2.3, §2.4×2, §2.5×2, §2.6, §2.7). §2.4와 §2.5 각 2건 = 충돌 확인.

- [ ] **Step 2: 각 절의 라인 범위 계산**

위 9개 헤더의 라인 번호로 본 세션 7개 대상 절의 범위를 계산:
- §2.1 Flutter: L1번째 §2.1 ~ L§2.2 시작 직전
- §2.3 Riverpod: L§2.3 ~ L§2.4(첫 번째) 시작 직전
- §2.4 GoRouter (첫): L§2.4 (첫) ~ L§2.4 (둘째) 시작 직전
- §2.4 google_fonts (둘): L§2.4 (둘) ~ L§2.5 (첫) 시작 직전
- §2.5 Sliver (첫): L§2.5 (첫) ~ L§2.5 (둘) 시작 직전
- §2.5 CanvasKit (둘): L§2.5 (둘) ~ L§2.6 시작 직전
- §2.6 D3.js: L§2.6 ~ L§2.7 시작 직전
- §2.7 flutter_test: L§2.7 ~ L§3.1 시작 직전 (또는 L---)

이 라인 범위를 작업 메모리에 보관 — Task B3 subagent에 전달.

- [ ] **Step 3: §2.x 외 인용 확인 (cross-section 영향)**

`Grep`으로 위키에서 §2.4·§2.5 인용 위치 검색:
```yaml
pattern: "§2\\.[4-7]|2\\.[4-7] 절|2\\.[4-7]에서"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 0~수건. 있으면 재번호 부여 시 일괄 정정 필요. 라인 번호와 인용 텍스트를 작업 메모리에 보관.

---

### Task B2: Step 2 — skill-recommender

- [ ] **Step 1: 키워드 정의 + 실행**

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "flutter,riverpod,go_router,google_fonts,sliver,canvaskit,d3js,flutter_test,integration_test" `
  --limit 30 `
  --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S2b-skill-rec.json
$data = Get-Content C:\Temp\_S2b-skill-rec.json -Raw | ConvertFrom-Json
Write-Output "TOTAL=$($data.totalMatches)"
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 5 | ForEach-Object { "{0,-50} | {1,-12} | src={2,-25} | v={3}" -f $_.name, $_.type, $_.source, $_.verified }
```

- [ ] **Step 2: 채택 후보 선별**

S1·S2a 패턴 따라 verified·marketplace 항목만 0~5건 선별. 예상: 0건 (FastAPI MCP나 Spring MCP처럼 Flutter MCP도 verified 없음 가능성 큼). 본 세션 1차 도구는 **context7 MCP**.

- [ ] **Step 3: 임시 파일 정리**

```
Remove-Item C:\Temp\_S2b-skill-rec.json -Force -ErrorAction SilentlyContinue
```

---

### Task B3: Step 3+4 — 7개 Flutter 기술 통합 검증 (단일 subagent)

- [ ] **Step 1: 단일 subagent dispatch**

`Agent` 도구(general-purpose) 호출. prompt 구성:

```
You are verifying 7 Flutter wiki sections of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-frontend code. Part of S2b Frontend Frameworks session.

## Sections to verify (Read each in C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md):

- §2.1 Flutter 3.x — L<from>-L<to>
- §2.3 Riverpod (flutter_riverpod) — L<from>-L<to>
- §2.4 GoRouter (첫 번째, go_router) — L<from>-L<to>
- §2.4 google_fonts (두 번째 — 절 번호 충돌) — L<from>-L<to>
- §2.5 Sliver 기반 리스트 (첫 번째) — L<from>-L<to>
- §2.5 CanvasKit (두 번째 — 절 번호 충돌) — L<from>-L<to>
- §2.6 D3.js / force_directed — L<from>-L<to>
- §2.7 flutter_test + integration_test — L<from>-L<to>

(라인 범위는 controller가 Task B1에서 계산해 전달)

## CRITICAL S1+S2a delegation

1. **§2.1 SDK 제약 정정**: §2.1 본문 또는 pubspec 예제에 `environment.sdk: '>=3.0.0 <4.0.0'`이 있으면 → 실 SDK `>=3.11.0 <4.0.0` (synapse-frontend/pubspec.yaml L6-L7) 또는 헤더 §12.2의 "Dart 3.8+"와 일관되게 정정.

2. **`syn/` 경로 잔존 확인**: §2.1·§2.3·§2.4(2)·§2.5(2)·§2.6·§2.7 본문에서 `syn/lib/`·`syn/pubspec.yaml` 등 표기 검색. S1에서 §2.2는 이미 정정됨. 잔존하면 `synapse-frontend/`로 정정.

3. **절 번호 충돌 재번호 부여 (Phase B5 위키 패치에서 적용)**:
   - §2.4 google_fonts → §2.5
   - §2.5 Sliver → §2.6
   - §2.5 CanvasKit → §2.7
   - §2.6 D3.js → §2.8
   - §2.7 flutter_test → §2.9
   본 검증 단계에서는 현재 번호로 finding 작성하되, `patch_target`에는 재번호 부여 영향을 메모.

## Step A — context7 / WebFetch

Try `resolve-library-id` for:
- "flutter" → topics: widget tree, isolates, web renderer, performance overlay
- "flutter_riverpod" (Riverpod 3.x) → topics: Notifier providers, AsyncValue, family providers, AsyncNotifier 패턴
- "go_router" → topics: declarative routes, redirects, ShellRoute, type-safe routes
- "google_fonts" → topics: dynamic loading, asset bundling, fallback fonts, license
- "sliver" / "flutter slivers" → topics: SliverList, SliverGrid, CustomScrollView, performance
- "canvaskit" / "flutter web" → topics: renderer selection, WASM 32-bit/64-bit, performance, bundle size
- "d3" / "d3-js" / "d3-force" → topics: force simulation, force-directed graphs, drag interactions

Fallback WebFetch:
- docs.flutter.dev/
- riverpod.dev/
- pub.dev/packages/go_router (또는 docs.page/csells/go_router_pure_dart)
- pub.dev/packages/google_fonts
- api.flutter.dev/flutter/widgets/Sliver-class.html
- docs.flutter.dev/platform-integration/web/renderers
- d3js.org/d3-force

## Step B — 실 코드 대조 (synapse-frontend)

Read:
- `C:\workspace\team-project-final\synapse-frontend\pubspec.yaml` (SDK 제약, 모든 의존성 버전)
- `C:\workspace\team-project-final\synapse-frontend\analysis_options.yaml` (S1에서 이미 검증됨, 참조용)
- `C:\workspace\team-project-final\synapse-frontend\CLAUDE.md` (S1에서 Riverpod manual providers 확인됨)
- `C:\workspace\team-project-final\synapse-frontend\lib\main.dart` 또는 `lib\app.dart` (라우터 설정 확인)
- `C:\workspace\team-project-final\synapse-frontend\web\index.html` (CanvasKit 렌더러 설정)

Grep:
- `flutter_riverpod|provider|Notifier` in lib/ → 실 Riverpod 사용 패턴
- `go_router|GoRouter|ShellRoute|GoRoute` in lib/ → 실 라우트 정의
- `google_fonts|GoogleFonts\.` in lib/ → 실 폰트 사용
- `SliverList|SliverGrid|CustomScrollView|SliverAppBar` in lib/ → 실 Sliver 사용
- `d3|force_directed|graphview` in lib/ → 실 그래프 시각화 라이브러리
- `flutter_test|testWidgets|integration_test` in test/ → 실 테스트 패턴

특히 확인:
- Flutter 버전: `pubspec.yaml`의 `environment.flutter` (실 사용 버전)
- Riverpod 버전: `flutter_riverpod: ^3.x.x` 정확한 minor 버전
- go_router 버전: 위키는 `^14.0.0` → 실은?
- google_fonts: 위키 `^6.1.0` → 실은?
- 지식 그래프: 위키는 D3.js + HtmlElementView 명시 → 실 코드가 다른 라이브러리(예: `graphview`, `flutter_force_directed_graph`) 사용 가능성

## Step C — 분류 / Step D — YAML 출력 (finding_id = FL-F##)

```yaml
finding_id: FL-F01
section: "§2.1 Flutter 3.x"
class: E1
severity: P1
title: "<짧은 한국어 제목>"
evidence_official: |
  <공식 인용 또는 URL>
evidence_repo: |
  <synapse-frontend/path:LN — 해당 시>
current_text: |
  <18 문서 현재 표현 발췌>
proposed_text: |
  <대체 또는 추가 markdown — 즉시 Edit 적용 가능>
patch_target: "documents.wiki/18_기술_스택_정의서.md L<from>-L<to> (§2.X — 재번호 부여 후 §2.Y)"
deep_dive: false
```

R class with Deep Dive subsection. OK class short.

### Step E — 자기 점검

- [ ] context7 또는 WebFetch 사용
- [ ] 모든 finding에 evidence
- [ ] 최소 7개 actionable finding (7개 기술 × 1+)
- [ ] OK 항목 최소 5개
- [ ] §2.1 SDK 제약 정정 finding 포함
- [ ] §2.x 절 `syn/` 경로 잔존 검사 결과 명시 (있든 없든)
- [ ] proposed_text의 patch_target에 재번호 부여 영향 메모

## Report Format

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Findings (FL-F##): <count> total — E1:_ E2:_ D:_ R:_ OK:_
<YAMLs>
Self-review:
Concerns:
```

## 주의

- 파일 수정·git 작업 절대 금지
- 한국어 사용자 → 한국어 출력
- 추정 X — 공식 또는 실 코드 인용
- 작업 디렉토리: C:\workspace\team-project-final
```

- [ ] **Step 2: subagent 결과 수신**

FL-F## 형식. controller가 S2b-F##로 통합 번호 변환 (예상 7~12개 finding).

---

### Task B4: Step 5 — 보고서 9 섹션 작성

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤 생성**

`Write` 도구로 `documents/docs/superpowers/specs/2026-05-28-stack-review-S2b-frontend-frameworks.md` 생성. S2a 보고서 헤더와 동일한 형식:

```markdown
# 18 기술 스택 정의서 검증 — S2b 프론트엔드 프레임워크

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S1+S2a 후 v2.3-S2a 상태)
> 위키 패치 커밋: (Task B6에서 기입)

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

- §1: Task B1 인벤토리 표 + 절 번호 충돌 명시 + 재번호 부여 정책
- §2: skill-recommender 결과 (예상: 0건)
- §3: subagent의 Step A 결과 (기술별 공식 인용·검증 토픽)
- §4: subagent의 Step B 결과 (synapse-frontend 의존성·버전·실 사용 패턴 표)
- §5: FL-F## → S2b-F## 통합 번호로 finding 블록 작성
- §6: R 클래스 finding의 Deep Dive 일람표

- [ ] **Step 3: §7 placeholder + §8 후속 과제**

§8에 다음 항목 명시:
- S1+S2a 위임 처리 결과 (절 번호 충돌·SDK 제약·syn/ 경로 — 처리 완료 표시)
- S2b에서 발견한 다른 세션 영역 항목 → S3/S4/S5/S6 위임
- v2.3 통합 정리 시 §10.1 요약표·§12.2 호환성 표 갱신 후보

- [ ] **Step 4: §0 요약 통계 갱신 + 검증**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S2b-frontend-frameworks.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-S2b-frontend-frameworks.md' -Pattern '^### S2b-F\d' | Measure-Object | Select-Object Count
# Expected: 최소 7개
```

---

### Task B5: Step 6 — 위키 패치 적용

본 세션의 가장 큰 구조 변경: 절 번호 재부여.

- [ ] **Step 1: 사전 동기화 재확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```
Expected: `Already up to date.` 또는 깨끗한 상태.

- [ ] **Step 2: 절 번호 재부여 (5 Edit)**

`Edit` 도구로 다음 5개 헤더를 순서대로(주의: 매칭 충돌 피하기 위해 충분한 컨텍스트 포함) 교체:

1. `### 2.4 google_fonts` → `### 2.5 google_fonts`
2. `### 2.5 Sliver 기반 리스트 아키텍처` → `### 2.6 Sliver 기반 리스트 아키텍처`
3. `### 2.5 CanvasKit (Flutter Web Renderer)` → `### 2.7 CanvasKit (Flutter Web Renderer)`
4. `### 2.6 D3.js / force_directed (지식 그래프 시각화)` → `### 2.8 D3.js / force_directed (지식 그래프 시각화)`
5. `### 2.7 flutter_test + integration_test` → `### 2.9 flutter_test + integration_test`

> **주의**: §2.4 GoRouter와 §2.5 Sliver 자체 라인 번호는 변경하지 않음. 헤더 텍스트만 바꿈.

각 Edit 후 다음 `Grep`으로 충돌 해소 확인:
```yaml
pattern: "^### 2\\.[4-9] "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 정확히 6줄 — §2.4 GoRouter, §2.5 google_fonts, §2.6 Sliver, §2.7 CanvasKit, §2.8 D3.js, §2.9 flutter_test (중복 없음).

- [ ] **Step 3: §2.x 인용 cross-section 정정 (Task B1 Step 3 결과)**

Task B1 Step 3에서 발견된 §2.4·§2.5·§2.6·§2.7 인용 위치를 새 번호로 정정. 매치가 0건이면 본 Step skip.

- [ ] **Step 4: E1/E2/D 클래스 finding 제자리 교체**

§5 각 finding의 `current_text` → `proposed_text`로 `Edit` 호출. §2.1 SDK 제약·`syn/` → `synapse-frontend/` 경로 등.

- [ ] **Step 5: R 클래스 Deep Dive 부속 서브섹션 삽입**

각 R finding의 대상 절에서 "참고 자료" 직전에 `Edit`로 삽입. 형식은 S1·S2a와 동일.

- [ ] **Step 6: §11 변경 이력 갱신**

```
| v2.3-S2b | 2026-05-28 | Synapse Team | S2b 프론트엔드 프레임워크 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>). §2.4·§2.5 절 번호 충돌 해소(§2.5 google_fonts/§2.6 Sliver/§2.7 CanvasKit/§2.8 D3.js/§2.9 flutter_test로 재번호 부여). §2.1 Flutter SDK 제약 정정. §2.x `syn/` 경로 잔존 정리. (구체 변경: subagent 결과 기반 작성) |
```

- [ ] **Step 7: 패치 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
git diff --shortstat
Pop-Location
```
Expected: 단일 파일 변경. 다른 파일 변경 시 즉시 중단.

---

### Task B6: Step 6 — 위키 단일 커밋 + 푸시 + 보고서 헤더 SHA 기입

- [ ] **Step 1: 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S2b 프론트엔드 프레임워크 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

§2.x Flutter 스택 7개 기술

구조 변경:
- §2.4·§2.5 절 번호 충돌 해소 → §2.5 google_fonts / §2.6 Sliver /
  §2.7 CanvasKit / §2.8 D3.js / §2.9 flutter_test 재번호 부여

S1+S2a 위임 처리:
- §2.1 Flutter SDK 제약 정정 (>=3.0.0 → >=3.11.0)
- §2.x `syn/` 경로 잔존 정리 (synapse-frontend/로 통일)

주요 정정:
- (controller가 §5/§7 결과 기반으로 채움 — P0/P1 항목 3~5건 1줄 요약)

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```

- [ ] **Step 2: 보고서 헤더 위키 SHA 기입 + §7 diff 요약**

`Edit`로 보고서 헤더의 `(Task B6에서 기입)` → `documents.wiki@<wikiSha>` 교체.

§7에 git show --stat 결과 기반 diff 요약 표 작성 (S2a와 동일 형식).

---

## Phase C — 보고서 PR + INDEX 갱신

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: 보고서 + INDEX 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S2b-frontend-frameworks.md
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
git commit -m @'
docs(stack-review): S2b 프론트엔드 프레임워크 보고서

위키 커밋: documents.wiki@<wikiSha>

- S2b 보고서 9 섹션 완성
  - Flutter 7개 기술 (§2.1 Flutter, §2.3 Riverpod, §2.4 GoRouter,
    §2.5 google_fonts, §2.6 Sliver, §2.7 CanvasKit, §2.8 D3.js, §2.9 flutter_test)
  - <N> findings — E1:a · E2:b · D:c · R:d · OK:e
  - P0:x · P1:y · P2:z
- 절 번호 충돌 §2.4·§2.5 → §2.4~§2.9 재번호 부여로 해소
- S1+S2a 위임 처리: SDK 제약, syn/ 경로 잔존, 절 번호 충돌

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push -u origin docs/stack-review-S2b-frontend-frameworks
Pop-Location
```

- [ ] **Step 2: PR 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
gh pr create `
  --base main `
  --head docs/stack-review-S2b-frontend-frameworks `
  --title "docs(stack-review): S2b 프론트엔드 프레임워크" `
  --body @'
## 개요

S2 전체(19개)의 후반부 — Flutter 스택 7개 기술 검증.
S1 → S2a → S2b 순서. S2 분할 완료.

## 산출

- 보고서: docs/superpowers/specs/2026-05-28-stack-review-S2b-frontend-frameworks.md
- 위키 커밋: documents.wiki@<wikiSha>

## 통계

- E1:a · E2:b · D:c · R:d · OK:e
- P0:x · P1:y · P2:z

## 구조 변경 (S2b 핵심)

§2.4·§2.5 절 번호 충돌(마스터 스펙 §2 사전 발견) 해소:
- §2.5 google_fonts (이전 §2.4 둘째)
- §2.6 Sliver (이전 §2.5 첫째)
- §2.7 CanvasKit (이전 §2.5 둘째)
- §2.8 D3.js (이전 §2.6)
- §2.9 flutter_test (이전 §2.7)

## S1+S2a 위임 처리 완료

- ✅ §2.4·§2.5 절 번호 충돌 → 재번호 부여
- ✅ §2.1 Flutter SDK 제약 정정
- ✅ §2.x `syn/` 경로 잔존 정리

## 관련

- 마스터 스펙: docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md (PR #5)
- S1: PR #6 / S2a: PR #7
- 플랜: docs/superpowers/plans/2026-05-28-stack-review-S2b-frontend-frameworks.md
- 메모리: git-pr-workflow

## 후속

- S3 데이터스토어 세션 (별도 플랜)
- S2 완료 → S3로 진행

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
$prNumber = (gh pr view --json number -q .number)
Write-Output "PR_NUMBER=$prNumber"
Pop-Location
```

---

### Task C2: 위키 §11 PR# 교체 추가 커밋

> 마스터 스펙 §5.3 dual-commit 예외 (S1·S2a 동일 패턴).

- [ ] **Step 1: §11 행 교체**

`Edit`로 위키의 `v2.3-S2b ... #<TBD>` 부분을 `#<prNumber>`로 교체.

- [ ] **Step 2: 위키 추가 커밋 + 푸시**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S2b 변경 이력 행에 PR 번호 기입

Refs: documents PR #<prNumber>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
Pop-Location
```

---

### Task C3: INDEX 최종 갱신 + 추가 커밋·푸시 + DoD 검증

- [ ] **Step 1: INDEX S2b 행 갱신**

`Edit`로 INDEX의 `| S2 | 프레임워크 (S2b 프론트) | pending | - |` → `| S2 | 프레임워크 (S2b 프론트) | completed | #<prNumber> | documents.wiki@<wikiSha-short> | a/b/c/d/e | x/y/z | 2026-05-28 | 2026-05-28 |`

- [ ] **Step 2: 누적 통계 갱신**

S1+S2a 합산(15기술/67 findings)에 S2b 추가:
- 검증한 기술 수: 15 → 22 / 약 45
- E1/E2/D/R/OK + P0/P1/P2 합산

- [ ] **Step 3: 교차 발견사항·후속 과제 갱신**

S1+S2a 위임 항목 처리 완료 표시 (✅). S2b에서 새로 발생한 위임 항목(S3/S4/S5/S6) 추가.

- [ ] **Step 4: 보고서 헤더에 PR 링크 추가**

`Edit`로 보고서 헤더에 `> 보고서 PR: [documents#<prNumber>](...)` 추가.

- [ ] **Step 5: 추가 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-S2b-frontend-frameworks.md
git commit -m @'
docs(stack-review): S2b INDEX 갱신 + 보고서 PR 링크

- INDEX: S2b completed (S2 분할 완료)
- 누적 통계: 22기술/N findings
- S1+S2a 위임 항목 처리 완료 ✅
- 보고서 헤더에 PR 링크 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin docs/stack-review-S2b-frontend-frameworks
Pop-Location
```

- [ ] **Step 6: DoD 검증**

S1·S2a와 동일 체크:
```
# 보고서 9 섹션, 위키 SHA, PR 링크, finding 최소 7개, PR OPEN
```

- [ ] **Step 7: 사용자 보고**

```
S2b 프론트엔드 프레임워크 세션 완료.

- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- 구조 변경: §2.4·§2.5 절 번호 충돌 해소 → §2.5~§2.9 재번호 부여
- S2 분할 완료 (S2a + S2b = S2 전체 19개 기술)

다음: S3 데이터스토어 세션 (별도 writing-plans 재호출)
```

---

## 부록 — 비상 절차

S1·S2a 동일:
- 위키 push 후 보고서 push 실패 → 즉시 재시도
- 위키 patch 잘못된 영역 → `git revert HEAD`
- 절 번호 재부여 중 매칭 충돌 → 더 긴 컨텍스트로 재시도

---

## 추정 시간

- Phase A: 10분
- Phase B: 2~2.5시간 (7개 기술, 단일 subagent로 효율 — S2a 분량의 절반 이하 + 절 번호 재부여 30분)
- Phase C: 30분

총: ~3시간
