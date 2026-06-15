# SYNAPSE 개인 회고 문서 생성기 — 설계 (Spec)

- **작성일**: 2026-05-26
- **작성자**: velka (deepestdark@gmail.com)
- **상태**: 승인됨 (구현 대기)

## 1. 목적

`C:\workspace\team-project-final` 하위 18개 git 레포의 전체 히스토리에서 **본인 커밋만** 추출하고,
각 레포의 작업 내용을 요약하여 `What / Why / Problem / Solution / 회고` 5행 표 형식으로 정리한
**단일 통합 마크다운 회고 문서**를 생성한다.

표 형식은 아래 참조 이미지와 동일하다.

| 항목 | 내용 |
| --- | --- |
| **What** | 무엇을 했는가 — 논리적 Step 단위로 정리 |
| **Why** | 왜 그렇게 했는가 — 근거/배경 |
| **Problem** | 진행 중 겪은 문제 (없으면 "특이사항 없음") |
| **Solution** | 문제를 어떻게 해결했는가 |
| **회고** | 잘된 점·배운 점·패턴 (실제 커밋 증거 기반) |

## 2. 범위

### 2.1 저자(본인) 식별
다음 4개 별칭을 **모두 동일 인물(본인)**로 간주한다.

| 별칭 | 식별자 |
| --- | --- |
| velka | deepestdark@gmail.com |
| Qahnaarin | deepestdark@gmail.com |
| Velkaressia | 77432570+VelkaressiaBlutkrone@users.noreply.github.com |
| VelkaressiaBlutkrone | VelkaressiaBlutkrone@users.noreply.github.com |

- git 필터: `git log --perl-regexp --author='deepestdark@gmail\.com|Velkaressia'`
  - `deepestdark@gmail\.com` → velka, Qahnaarin 포착
  - `Velkaressia` → Velkaressia, VelkaressiaBlutkrone 포착 (이름 prefix)
- bot 계정(`bootstrap[bot]`, `github-actions[bot]`, `*-deploy[bot]`) 및 타인 커밋은 제외된다.

### 2.2 대상 레포
내 커밋이 1개 이상 있는 모든 레포(현재 18개). 필터 후 0개면 스킵하고 요약에 명시.

```
documents, documents.wiki, moking-data-guide, schedule-repo, syn,
synapse-engagement-svc, synapse-flow-simulator, synapse-frontend, synapse-gateway,
synapse-gitops, synapse-knowledge-svc, synapse-learning-svc, synapse-platform-svc,
synapse-prototype, synapse-shared, synapse-svc-template, workflow-dashboard, workflow-guide
```
(`synapse-gitops-bringup`는 .git 없음 → 제외, `_backup_*`/`.playwright-mcp`도 제외)

### 2.3 비범위 (YAGNI)
- 타인/봇 커밋 정리, 통계 차트, HTML 변환, 다국어 출력은 하지 않는다.
- 코드 변경/리팩토링은 하지 않는다 (읽기 전용 + 문서 1개 생성).

## 3. 아키텍처 — 병렬 팬아웃

```
오케스트레이터(메인 세션)
 1) 레포 목록 + 저자 필터 확정
 2) 레포별 서브에이전트 N개 병렬 dispatch
       각 에이전트: 자기 레포 1개만 분석 → 표 1개(markdown 조각) 반환
 3) 반환된 표 조각 병합 → 전체 요약/목차 작성 → 단일 md 저장
```

- 한 에이전트 = 한 레포. 레포 하나에만 집중하여 요약 깊이를 확보한다.
- 에이전트는 **읽기 전용**(git log, 파일 읽기)만 수행하고 마크다운 텍스트만 반환한다.

## 4. 각 에이전트의 작업 (레포 1개)

### 4.1 데이터 수집
- `git log --perl-regexp --author='deepestdark@gmail\.com|Velkaressia' --pretty=...` 으로
  본인 커밋의 날짜 · 제목 · 본문 수집
- `--stat`으로 변경 파일/라인 규모 파악
- README / CLAUDE.md / docs 일부를 읽어 Why 근거 보강

### 4.2 표 생성 규칙
- **What**: 본인 커밋을 2~5개 **논리적 Step**으로 묶음 (날짜 클러스터 + conventional-commit
  scope `feat/fix/chore/...` + 기능 영역 기준). 이미지처럼 "Step N: …" 형태, 핵심 산출물 굵게.
- **Why**: 커밋 본문·레포 문서·아키텍처 맥락에서 근거 추론.
- **Problem**: `fix`/`revert`/`refactor`/`hotfix`, 반복 재시도, `FINDING-xxx` 패턴에서
  실제로 겪은 문제 도출. 근거 없으면 "특이사항 없음".
- **Solution**: 해당 문제를 해결한 커밋 기준으로 해결 방식 기술.
- **회고**: 잘된 점·배운 점·패턴 1~3문장. **반드시 실제 커밋 증거 기반, 창작 금지.**
- 출력 언어: **한국어**.

### 4.3 반환 형식 (에이전트 → 오케스트레이터)
```
### <레포명>
> 역할: <1줄 설명>  ·  내 커밋 N개  ·  기간 YYYY-MM-DD ~ YYYY-MM-DD

| 항목 | 내용 |
| --- | --- |
| **What** | ... |
| **Why** | ... |
| **Problem** | ... |
| **Solution** | ... |
| **회고** | ... |
```

## 5. 출력 문서 구조 (단일 md)

1. 제목 + 메타 (생성일 2026-05-26 / 저자 별칭 목록 / 대상 레포 수)
2. **전체 요약**: 총 레포 수 · 총 내 커밋 수 · 전체 기간 · 1~2문단 종합 회고
3. **목차** (레포 → 섹션 앵커 링크)
4. 레포별 섹션 — **내 커밋 수 내림차순** 정렬, 각 섹션 = §4.3 반환 형식
- **저장 경로**: `C:\workspace\team-project-final\SYNAPSE_개인회고_velka.md`

## 6. 예외 처리

| 상황 | 처리 |
| --- | --- |
| 필터 후 내 커밋 0개 | 섹션 스킵, 전체 요약에 "기여 없음"으로 명시 |
| 기여 적은 레포 | 포함하되 표 내용 간결하게 |
| 동일 인물 다중 이름 | 자동 병합 (커밋 수·기간 합산) |
| 문제 신호 부족 | Problem = "특이사항 없음", 회고도 사실 위주로 짧게 |

## 7. 검증

- 생성된 문서가 18개(또는 기여 있는 모든) 레포를 빠짐없이 다루는지 확인.
- 각 표의 5개 행이 모두 채워져 있는지 (Problem/회고에 placeholder 없는지) 확인.
- 표에 등장한 산출물/문제가 실제 커밋에 근거하는지 스팟 체크.
