# SYNAPSE 개인 회고 문서 생성기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18개 git 레포에서 본인 커밋만 추출·요약하여 `What/Why/Problem/Solution/회고` 표를 레포별로 만들고, 단일 통합 마크다운 회고 문서로 저장한다.

**Architecture:** 레포별 병렬 서브에이전트 팬아웃. 각 에이전트가 자기 레포 1개의 git 로그(본인 커밋)와 문서를 읽어 표 1개를 markdown으로 반환하고, 오케스트레이터가 이를 단일 문서로 병합한다. 코드 산출물 없음 — 읽기 전용 분석 + 문서 1개 생성.

**Tech Stack:** git (bash), Agent 도구(병렬 dispatch), 마크다운.

**Spec:** `docs/superpowers/specs/2026-05-26-synapse-personal-retro-design.md`

---

## File Structure

- Create: `C:\workspace\team-project-final\SYNAPSE_개인회고_velka.md` — 최종 단일 통합 회고 문서 (유일한 산출물)
- 읽기 전용 입력: 18개 레포의 `.git` 히스토리 + 각 레포 README/CLAUDE.md/docs

## 확정 데이터 (검증 완료)

- **저자 필터**: `--perl-regexp --author='deepestdark@gmail\.com|Velkaressia'`
- **대상 레포 + 내 커밋 수 (내림차순)**:

| 레포 | 내 커밋 | 기간 |
| --- | ---: | --- |
| synapse-gitops | 243 | 2026-05-12 ~ 2026-05-26 |
| workflow-dashboard | 112 | 2026-05-12 ~ 2026-05-22 |
| synapse-prototype | 109 | 2026-05-09 ~ 2026-05-18 |
| documents | 100 | 2026-05-09 ~ 2026-05-20 |
| synapse-svc-template | 93 | 2026-05-19 |
| synapse-flow-simulator | 58 | 2026-05-20 ~ 2026-05-21 |
| synapse-shared | 36 | 2026-05-12 ~ 2026-05-22 |
| synapse-frontend | 27 | 2026-05-12 ~ 2026-05-21 |
| moking-data-guide | 27 | 2026-05-14 ~ 2026-05-20 |
| schedule-repo | 24 | 2026-05-11 ~ 2026-05-20 |
| documents.wiki | 18 | 2026-05-09 ~ 2026-05-18 |
| workflow-guide | 13 | 2026-05-13 ~ 2026-05-21 |
| synapse-learning-svc | 11 | 2026-05-12 ~ 2026-05-20 |
| synapse-engagement-svc | 9 | 2026-05-12 ~ 2026-05-20 |
| synapse-gateway | 9 | 2026-05-19 ~ 2026-05-20 |
| synapse-knowledge-svc | 9 | 2026-05-12 ~ 2026-05-20 |
| syn | 8 | 2026-05-12 ~ 2026-05-19 |
| synapse-platform-svc | 5 | 2026-05-12 ~ 2026-05-21 |

총 18개 레포, 약 911개 커밋. 0개 레포 없음 → 스킵 대상 없음.

---

### Task 1: 에이전트 프롬프트 템플릿 + 출력 스켈레톤 확정

**Files:**
- Create (임시 스켈레톤): `C:\workspace\team-project-final\SYNAPSE_개인회고_velka.md`

- [ ] **Step 1: 재사용 에이전트 프롬프트 템플릿을 확정한다**

각 레포에 대해 아래 프롬프트를 `<REPO>`만 바꿔 사용한다. (Agent 도구, subagent_type: `general-purpose`, 읽기 전용)

```
당신은 git 히스토리 분석가입니다. 레포 C:\workspace\team-project-final\<REPO> 에서
"본인(velka)" 커밋만 분석해 회고 표 1개를 한국어 마크다운으로 작성해 반환하세요.

본인 식별 필터(아래 4개 별칭 = 동일 인물):
  git -C C:\workspace\team-project-final\<REPO> log --all --perl-regexp \
    --author='deepestdark@gmail\.com|Velkaressia' --date=short --stat --pretty=fuller

수행:
1) 위 명령으로 본인 커밋의 날짜·제목·본문·변경파일(--stat)을 수집한다. (봇/타인 제외)
2) 레포 맥락 보강: README.md, CLAUDE.md, docs/ 일부를 읽어 "Why" 근거를 찾는다.
3) 본인 커밋을 2~5개 논리적 Step으로 묶는다 (날짜 클러스터 + conventional-commit
   scope feat/fix/chore + 기능 영역 기준).

아래 표 형식 그대로, 5개 행을 모두 채워 반환하라. 다른 설명/머리말 없이 표 블록만 반환:

### <REPO>
> 역할: <1줄 설명>  ·  내 커밋 N개  ·  기간 YYYY-MM-DD ~ YYYY-MM-DD

| 항목 | 내용 |
| --- | --- |
| **What** | - **Step 1: ...** 핵심 산출물 굵게 / - **Step 2: ...** (논리적 Step 2~5개) |
| **Why** | 커밋 본문·문서·아키텍처에서 추론한 근거 |
| **Problem** | fix/revert/refactor/반복재시도/FINDING 패턴에서 도출한 실제 문제 (없으면 "특이사항 없음") |
| **Solution** | 그 문제를 해결한 방식 (해결 커밋 기준) |
| **회고** | 잘된 점·배운 점·패턴 1~3문장 — 실제 커밋 증거 기반, 창작 금지 |

규칙: 한국어. Problem/회고에 "TBD/TODO" 등 placeholder 금지. 커밋에 근거 없는 내용 창작 금지.
```

- [ ] **Step 2: 출력 문서 스켈레톤을 작성한다**

`SYNAPSE_개인회고_velka.md`에 헤더/요약/목차 자리를 만든다 (레포 표는 Task 3에서 채움):

```markdown
# SYNAPSE 개인 회고 (velka)

- 생성일: 2026-05-26
- 저자(본인) 별칭: velka, Qahnaarin, Velkaressia, VelkaressiaBlutkrone
- 대상 레포: 18개 · 내 커밋 총계: 약 911개

## 전체 요약

(Task 3에서 종합 회고 1~2문단 작성)

## 목차

(Task 3에서 레포별 앵커 링크 작성)

---

(여기에 레포별 표 섹션, 내 커밋 수 내림차순)
```

- [ ] **Step 3: 스켈레톤 저장 확인** — 파일이 생성되었는지 확인하고 다음 Task로.

---

### Task 2: 레포별 병렬 에이전트 dispatch (18개)

**Files:** 없음 (에이전트가 텍스트 표를 반환)

- [ ] **Step 1: 1차 배치 dispatch (대형 레포 6개)**

Task 1 Step 1 템플릿으로, 아래 6개 레포 에이전트를 **한 메시지에서 병렬** dispatch:
`synapse-gitops`, `workflow-dashboard`, `synapse-prototype`, `documents`, `synapse-svc-template`, `synapse-flow-simulator`

- [ ] **Step 2: 2차 배치 dispatch (중형 레포 6개)**

병렬 dispatch: `synapse-shared`, `synapse-frontend`, `moking-data-guide`, `schedule-repo`, `documents.wiki`, `workflow-guide`

- [ ] **Step 3: 3차 배치 dispatch (소형 레포 6개)**

병렬 dispatch: `synapse-learning-svc`, `synapse-engagement-svc`, `synapse-gateway`, `synapse-knowledge-svc`, `syn`, `synapse-platform-svc`

- [ ] **Step 4: 반환 표 18개를 수집한다**

각 에이전트가 반환한 `### <REPO> … | 회고 | …` 표 블록 18개를 모은다.
누락/실패한 레포가 있으면 해당 레포만 재-dispatch한다.

검증: 표 블록 18개, 각 블록에 `What/Why/Problem/Solution/회고` 5행이 모두 존재.

---

### Task 3: 단일 문서로 병합 + 요약/목차 작성

**Files:**
- Modify: `C:\workspace\team-project-final\SYNAPSE_개인회고_velka.md`

- [ ] **Step 1: 레포 표를 내 커밋 수 내림차순으로 배치한다**

Task 2에서 모은 18개 표를 위 "확정 데이터" 표의 순서(243→5)대로 `---` 아래에 붙여넣는다.

- [ ] **Step 2: 목차를 작성한다**

각 레포 섹션으로 가는 앵커 링크 목록을 `## 목차` 아래에 작성:

```markdown
1. [synapse-gitops](#synapse-gitops) — 243
2. [workflow-dashboard](#workflow-dashboard) — 112
...
18. [synapse-platform-svc](#synapse-platform-svc) — 5
```

- [ ] **Step 3: 전체 요약(종합 회고)을 작성한다**

18개 레포의 표 내용을 종합해 1~2문단으로 작성. 포함: 전체 기간(2026-05-09~05-26),
주력 영역(인프라/GitOps, 대시보드, 프로토타입, 문서, 템플릿), 반복적으로 나타난
문제·해결 패턴, 전반적 배운 점. 실제 표 근거 기반, 창작 금지.

- [ ] **Step 4: 문서를 저장한다** — `SYNAPSE_개인회고_velka.md` 최종본 저장.

---

### Task 4: 검증

**Files:** 없음 (읽기 검증)

- [ ] **Step 1: 커버리지 확인**

문서에 `###` 섹션이 18개 있는지, "확정 데이터"의 18개 레포명이 모두 등장하는지 확인.
Run: `grep -c '^### ' SYNAPSE_개인회고_velka.md` → 기대값 18

- [ ] **Step 2: 표 완전성 확인**

placeholder 스캔. Run: `grep -nE 'TBD|TODO|작성 예정|\.\.\.$' SYNAPSE_개인회고_velka.md`
기대: 매칭 없음 (있으면 해당 행 수정).
각 섹션에 `**What**|**Why**|**Problem**|**Solution**|**회고**` 5행이 모두 있는지 확인.

- [ ] **Step 3: 근거 스팟 체크 (2~3개 레포)**

임의 레포 2~3개에서 표의 Problem/산출물이 실제 커밋에 근거하는지 git log로 대조.
예: `git -C synapse-flow-simulator log --all --perl-regexp --author='deepestdark@gmail\.com|Velkaressia' --oneline | grep -i FINDING`

- [ ] **Step 4: 사용자에게 최종 문서 경로와 요약을 보고한다**

---

## Self-Review (작성자 점검)

- **Spec 커버리지**: 저자필터(Task1·2) / 18레포 전수(Task2) / 표 5행 형식(Task1) /
  단일문서·요약·목차·내림차순(Task3) / 예외(0커밋 없음 확인됨) / 검증(Task4) — 모두 매핑됨.
- **Placeholder**: 출력 문서 내 placeholder는 Task4 Step2에서 grep으로 차단.
- **일관성**: 저자 필터 정규식, 레포 정렬 순서, 표 5행 명칭이 전 Task에서 동일.
