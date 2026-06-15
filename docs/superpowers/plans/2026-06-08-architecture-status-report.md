# SYNAPSE 전체 아키텍처 현황 보고서 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SYNAPSE 멀티레포 시스템의 전체 구성을 2026-06-08 origin 기준으로 점검한 팀 공유용 현황 보고서 `docs/synapse-architecture-status-2026-06-08.md` 1개 파일을 작성한다.

**Architecture:** 읽기 전용 감사 파이프라인 — (0) 전 레포 `git fetch origin`으로 신선도 확보 → (1) 기존 감사 문서·메모리를 베이스라인으로 로드 → (2) Explore 에이전트 4개 병렬 탐색(서비스/인프라/CI·CD/간극 재검증) → (3) 메인 컨텍스트에서 교차 대조 후 보고서 작성 → (4) 완료 기준 검증. 코드·설정 수정 없음.

**Tech Stack:** PowerShell(git fetch 루프), Agent 도구(Explore 타입, 읽기 전용), Markdown + mermaid.

**스펙:** `docs/superpowers/specs/2026-06-08-architecture-status-report-design.md`

**커밋 없음:** 워크스페이스 루트(`C:\workspace\team-project-final`)와 `docs/`는 git 레포가 아니므로 커밋 단계가 없다. 산출물은 보고서 파일 1개뿐이며 각 Task의 검증 단계가 커밋을 대신한다.

---

## File Structure

| 파일 | 역할 |
|---|---|
| `docs/synapse-architecture-status-2026-06-08.md` | **생성** — 최종 보고서 (유일한 산출물) |
| `docs/superpowers/specs/2026-06-08-architecture-status-report-design.md` | 읽기 — 승인된 스펙 (보고서 구조·완료 기준의 단일 출처) |
| `docs/kafka-service-audit-2026-06-02.md` | 읽기 — Kafka 감사 베이스라인 |
| `C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\*.md` | 읽기 — 간극 베이스라인 (Task 2에 목록 명시) |

---

### Task 1: 신선도 확보 — 전 레포 origin fetch

**Files:**
- 수정 없음 (git fetch만 수행)

- [ ] **Step 1: git 클론 전체에 fetch 실행**

```powershell
$repos = Get-ChildItem C:\workspace\team-project-final -Directory | Where-Object { Test-Path "$($_.FullName)\.git" }
$results = foreach ($r in $repos) {
  git -C $r.FullName fetch origin --prune 2>&1 | Out-Null
  [pscustomobject]@{ Repo = $r.Name; Ok = $? }
}
$results | Format-Table
```

Expected: 19개 레포(documents, documents.wiki, moking-data-guide, schedule-repo, syn, synapse-engagement-svc, synapse-flow-simulator, synapse-frontend, synapse-gateway, synapse-gitops, synapse-knowledge-svc, synapse-learning-svc, synapse-onboarding, synapse-platform-svc, synapse-prototype, synapse-shared, synapse-svc-template, workflow-dashboard, workflow-guide) 각각 `Ok = True/False` 표.

- [ ] **Step 2: 실패 레포 기록**

`Ok = False`인 레포 이름을 메모해 둔다 → Task 5의 부록 "미확인 영역"에 그대로 기재한다.
`synapse-gitops-s6`은 git 클론이 아님(`.git` 없음) → fetch 대상에서 빠지며, 부록에 "로컬 사본, origin 검증 불가"로 기재한다.

- [ ] **Step 3: 기준 브랜치 존재 확인**

```powershell
$core = 'synapse-platform-svc','synapse-knowledge-svc','synapse-learning-svc','synapse-engagement-svc','synapse-gateway','synapse-shared','synapse-frontend','synapse-gitops','synapse-onboarding'
foreach ($r in $core) {
  $b = git -C "C:\workspace\team-project-final\$r" branch -r --list 'origin/main','origin/dev' | ForEach-Object Trim
  "{0}: {1}" -f $r, ($b -join ', ')
}
```

Expected: 핵심 레포 9개 각각에 `origin/main`(전부)과 `origin/dev`(있는 레포만) 출력. dev가 없는 레포는 main 기준으로 판단한다고 메모.

---

### Task 2: 베이스라인 로드 — 간극 체크리스트 확정

**Files:**
- 읽기: `docs/kafka-service-audit-2026-06-02.md`
- 읽기: `C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\` 아래 다음 8개 — `kafka-service-audit-state.md`, `kafka-tls-msk-app-readiness-gap.md`, `s3-implementation-status.md`, `knowledge-search-opensearch-es-mismatch.md`, `flyway-migration-standard.md`, `main-direct-pr-cleanup.md`, `deploy-mirror-standardization.md`, `redis-topology-decision.md`

- [ ] **Step 1: 베이스라인 문서 읽기**

위 9개 파일을 Read 도구로 읽는다 (병렬 가능).

- [ ] **Step 2: 간극 체크리스트 확정**

읽은 내용으로 아래 표의 "베이스라인 주장" 칸을 채워 확정한다. 이 표가 Task 3의 간극 재검증 에이전트 입력이 된다.

| # | 간극 항목 | 베이스라인 주장 (최종 확인일) | 재검증 위치 |
|---|---|---|---|
| G1 | Kafka TLS MSK 앱 배선 | 커스텀 KafkaConfig가 security.protocol 미배선, 앱 PR 선행 필요 (06-04) | 각 svc의 KafkaConfig·application*.yml |
| G2 | S3 AttachmentService | 미구현, W4 이후 예정 (06-02) | knowledge-svc attachment 관련 코드 |
| G3 | engagement Kafka 소비측 | 컨슈머 미구현 (06-02) | engagement-svc consumer/listener 코드 |
| G4 | Kafka CI registry·버전 드리프트 | CI registry 미표준화, 클라이언트 버전 드리프트 (06-02) | 각 svc build.gradle·workflows |
| G5 | Flyway 표준 롤아웃 | shared#22 가드 도입, platform V28 해소, 서비스 롤아웃 이슈 진행 (06-05) | 각 svc migration 디렉터리·CI 가드 |
| G6 | knowledge ES 정합성 | 06-05 해소 — 인클러스터 ES 9.2.1 + ELASTICSEARCH_URIS 정합 (D-003/#114) | gitops ES 매니페스트·knowledge 설정 |
| G7 | main↔dev 발산·PR 재타겟 후속 | PR 4건 dev 재타겟, engagement#31·learning#59 충돌 위임 (06-08) | 각 레포 origin/main↔origin/dev diff |
| G8 | Deploy/Mirror 표준화 | reusable workflow PR 세트 머지 대기 + 인프라 선행조건 차단 | 각 레포 workflows·shared의 reusable wf |

Expected: 8행 전부 베이스라인 주장이 문서 근거로 채워짐. 문서와 메모리가 다르면 더 최신 날짜를 채택하고 메모.

---

### Task 3: 도메인별 병렬 탐색 — Explore 에이전트 4개

**Files:**
- 수정 없음 (에이전트는 전부 읽기 전용 Explore 타입)

- [ ] **Step 1: 에이전트 4개를 한 메시지에서 병렬 디스패치**

Agent 도구, `subagent_type: "Explore"`, 4개 호출을 단일 메시지로. 각 프롬프트는 아래 전문을 그대로 사용한다 (공통 머리말 포함).

**공통 머리말 (각 프롬프트 앞에 붙임):**

```text
SYNAPSE 멀티레포 워크스페이스(C:\workspace\team-project-final) 현황 감사의 일부다.
규칙: (1) 판단은 반드시 origin/main 또는 origin/dev 기준 — 로컬 워킹트리가 아닌
`git -C <repo> show origin/<branch>:<path>` 또는 `git -C <repo> log origin/<branch>`로 확인.
(2) 모든 주장에 근거 경로를 `레포:파일경로` 형식으로 붙일 것.
(3) 확인 불가하면 추측하지 말고 "미확인: <이유>"로 보고할 것.
(4) 파일 수정 금지 — 읽기 전용.
최종 텍스트가 그대로 데이터로 쓰이므로 마크다운 표/목록의 구조화된 결과만 반환할 것.
```

**에이전트 1 — 서비스 (search breadth: very thorough):**

```text
대상 레포: synapse-platform-svc, synapse-knowledge-svc, synapse-learning-svc,
synapse-engagement-svc, synapse-gateway, synapse-shared, synapse-frontend, synapse-onboarding.
각 레포에 대해 보고:
(a) 역할 한 줄 (README 또는 코드 구조 기준)
(b) 기술스택·핵심 버전 — build.gradle/pom.xml/pubspec.yaml/package.json의
    프레임워크·언어·주요 라이브러리(Spring Boot, Kafka client, Flutter 등) 버전
(c) 노출 API 표면 — 컨트롤러/라우트 최상위 경로 목록
(d) 발행/구독 Kafka 이벤트 — 토픽명과 발행자/구독자 구분
(e) 2026-06-02 이후 origin 기준 주요 변경 — `git log --oneline --since=2026-06-02 origin/main`
    (origin/dev 있으면 dev도) 결과 요약
출력: 레포별 섹션, 위 (a)~(e) 구조.
```

**에이전트 2 — 인프라/gitops (search breadth: very thorough):**

```text
대상: synapse-gitops (origin 기준), synapse-gitops-s6 (git 클론 아님 — 로컬 파일 기준,
보고 시 "로컬 사본 기준" 명시).
보고할 것:
(a) 배포 토폴로지 — 환경(dev/prod 등) 디렉터리 구조, ArgoCD/Kustomize/Helm 등 사용 도구,
    배포되는 앱 목록
(b) 미들웨어 구성 — Kafka(MSK 여부·TLS 설정), Redis(standalone/cluster), Elasticsearch(버전·
    인클러스터 여부), DB(엔진·인스턴스 구조) 각각의 매니페스트 위치와 핵심 설정값
(c) 서비스별 주입 환경변수 중 통신 관련 항목 (KAFKA_*, ELASTICSEARCH_*, REDIS_*, DB 연결)
(d) gitops와 gitops-s6의 관계 — 무엇이 다른지
출력: (a)~(d) 구조, 설정값은 파일 경로와 함께.
```

**에이전트 3 — CI/CD (search breadth: very thorough):**

```text
대상: 워크스페이스의 synapse-* 전체 레포 + workflow-dashboard.
각 레포의 .github/workflows/ 를 origin 기준으로 확인해 보고:
(a) 레포별 워크플로우 파일 목록과 각각의 트리거·하는 일 한 줄
(b) reusable workflow(workflow_call) 사용 여부 — deploy/mirror 표준화 적용 상태
(c) 컨테이너 이미지 빌드·푸시 대상 registry — 레포 간 일치 여부
(d) Flyway/마이그레이션 CI 가드 존재 여부 (synapse-shared의 가드 포함)
(e) 머지 대기 중으로 보이는 워크플로우 관련 브랜치 — `git branch -r` 에서
    origin/main·dev에 없는 워크플로우 변경 브랜치
출력: 레포 × 워크플로우 표 + (b)~(e) 요약.
```

**에이전트 4 — 간극 재검증 (search breadth: very thorough):**

```text
다음 8개 간극의 현재 상태를 origin 기준 코드 근거로 판정하라.
각 항목: 상태(해소/진행/미해결) + 근거 파일 경로 + 판정 이유 1-2줄.
G1 Kafka TLS: 각 svc(platform/knowledge/learning/engagement)의 KafkaConfig 또는
   application*.yml이 security.protocol(SSL) 을 환경변수로 배선하는지.
G2 S3: knowledge-svc에 AttachmentService(또는 S3 클라이언트 사용 코드)가 구현됐는지.
G3 engagement 소비측: engagement-svc에 @KafkaListener/컨슈머 구현이 있는지.
G4 Kafka 버전 드리프트: 4개 svc의 Kafka 클라이언트(spring-kafka 등) 버전이 일치하는지,
   CI의 이미지 registry가 표준화됐는지.
G5 Flyway: 각 svc migration 파일명이 타임스탬프 버전 표준을 따르는지, CI 가드가
   각 svc에 적용됐는지 (synapse-shared#22 가드의 롤아웃 상태).
G6 ES 정합성: gitops에 인클러스터 ES 9.2.1 매니페스트가 있고 knowledge-svc가
   ELASTICSEARCH_URIS로 연결하는지 (해소 확인).
G7 main↔dev 발산: 핵심 레포 9개(platform/knowledge/learning/engagement/gateway/
   shared/frontend/gitops/onboarding)의 `git rev-list --left-right --count
   origin/main...origin/dev` 결과. dev 없는 레포는 "dev 없음".
G8 Deploy/Mirror: reusable workflow가 origin/main 또는 dev에 머지됐는지, 아니면
   아직 브랜치/PR 상태인지.
출력: G1~G8 표 (항목/상태/근거/이유).
```

- [ ] **Step 2: 결과 수신 확인**

Expected: 에이전트 4개 각각 구조화된 마크다운 반환. null(중단) 반환 에이전트가 있으면 동일 프롬프트로 1회 재디스패치. 재시도도 실패하면 해당 도메인은 부록 "미확인"에 기재하고 진행.

---

### Task 4: 교차 대조

**Files:**
- 수정 없음

- [ ] **Step 1: 상충 검출**

다음 3개 축으로 에이전트 결과를 대조하고, 상충 항목을 목록으로 만든다:
1. 에이전트1(서비스의 발행/구독 이벤트) ↔ 에이전트2(인프라 Kafka 구성) — 토픽·연결 정합
2. 에이전트1(기술스택 버전) ↔ 에이전트4(G4 버전 드리프트) — 버전 수치 일치
3. 에이전트2(인프라 ES/Kafka 설정) ↔ 에이전트4(G1/G6 판정) — 설정값 일치

- [ ] **Step 2: 상충 항목 직접 재확인**

상충 항목마다 메인 컨텍스트에서 직접 확인한다. 예시 (G4 버전 상충 시):

```powershell
git -C C:\workspace\team-project-final\synapse-platform-svc show origin/main:build.gradle | Select-String -Pattern 'kafka'
```

Expected: 상충 목록의 모든 항목이 "직접 확인값"으로 확정됨. 에이전트 보고는 직접 확인값으로 덮어쓴다.

- [ ] **Step 3: 베이스라인 대비 변화 정리**

Task 2의 간극 표(베이스라인 주장)와 에이전트4 판정을 비교해 §6용 최종 표를 만든다 — 칸: 항목 / 상태(해소·진행·미해결) / 근거(`레포:경로`) / 추적 이슈 / 베이스라인 대비 변화.

---

### Task 5: 보고서 작성

**Files:**
- 생성: `docs/synapse-architecture-status-2026-06-08.md`

- [ ] **Step 1: 보고서 골격 작성**

아래 골격을 그대로 사용하고, Task 3·4 결과로 본문을 채운다:

```markdown
# SYNAPSE 아키텍처 현황 보고서

- 기준일: 2026-06-08
- 기준 소스: 각 레포 origin/main · origin/dev (로컬 워킹트리 미사용)
- 작성 방법: §7 부록 참조

## 1. 개요
(시스템 한 줄 요약 + 이 보고서가 답하는 질문 3줄)

## 2. 시스템 맵
(서비스 목록 표 + mermaid flowchart 1개 — REST/Kafka 통신, 인프라 의존.
 보조 레포(prototype, flow-simulator, moking-data-guide, svc-template 등)는 한 줄씩만)

## 3. 애플리케이션 서비스 현황
(레포별 소절: 역할 / 기술스택·버전 / API 표면 / 발행·구독 이벤트 / 6-02 이후 변경 —
 platform, knowledge, learning, engagement, gateway, shared, frontend, onboarding)

## 4. 인프라/gitops 현황
(배포 토폴로지 / Kafka / Redis / ES / DB 표 — 매니페스트 경로 인용.
 gitops-s6는 "로컬 사본 기준" 명시)

## 5. CI/CD 현황
(레포 × 워크플로우 표 / deploy·mirror 표준화 상태 / Flyway 가드 롤아웃 / registry 일치 여부)

## 6. 간극 및 리스크
(G1~G8 표: 항목 / 상태 / 근거 / 추적 이슈 / 베이스라인 대비 변화)

## 7. 부록 — 검증 방법·미확인 영역
(검증 방법 요약: fetch → 베이스라인 → 병렬 탐색 → 교차 대조.
 미확인 영역 전체 목록: fetch 실패 레포, gitops-s6 로컬 사본, 에이전트 미확인 항목)
```

- [ ] **Step 2: mermaid ↔ §3 모순 검사**

다이어그램의 노드·화살표를 §3의 서비스 목록·이벤트 표와 1:1 대조한다.
Expected: §3에 있는 발행/구독 관계가 다이어그램에 전부 있고, 다이어그램에만 있는 관계가 없음. 불일치 시 §3 쪽(코드 근거 있는 쪽)을 기준으로 다이어그램 수정.

---

### Task 6: 완료 기준 검증

**Files:**
- 수정: `docs/synapse-architecture-status-2026-06-08.md` (검증 중 발견된 결함만)

- [ ] **Step 1: 스펙 §4 완료 기준 4개 항목 점검**

보고서를 처음부터 다시 읽으며 체크:
1. §3~§5 모든 표 항목에 `레포:경로` 근거가 있는가 — 없는 행을 목록화
2. §6 G1~G8 전부 2026-06-08 origin 기준 재판정인가 — "최종 확인일"만 있는 항목 확인
3. 미확인 항목이 부록에 전부 있는가 — Task 1~3에서 메모한 미확인 목록과 대조
4. mermaid가 §3과 모순 없는가 — Task 5 Step 2 재확인

- [ ] **Step 2: 결함 수정**

Step 1에서 발견된 결함을 보고서에 인라인 수정. 근거를 찾을 수 없는 주장은 삭제하거나 "미확인"으로 강등.

- [ ] **Step 3: 사용자에게 보고**

보고서 경로와 핵심 결과(간극 8개 중 해소/진행/미해결 개수, 새로 발견된 사항)를 요약해 전달.

Expected: 사용자가 보고서 파일을 열어 검토할 수 있는 상태.
