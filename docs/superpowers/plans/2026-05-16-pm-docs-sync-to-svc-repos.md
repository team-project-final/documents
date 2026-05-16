# PM 문서 동기화 구현 계획 — documents → -svc 레포

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5개 서비스 레포의 `docs/project-management/{prd,task,workflow,scope}/`를 `team-project-final/documents` 레포 기준으로 동기화하여 옛 wiki 잔재 문서로 인한 팀원 혼란을 해소한다.

**Architecture:** 각 레포를 `D:\workspace\final-project-syn\` 하위에 클론하고, 베이스 브런치(`dev`, 없으면 main에서 신규 생성)에서 작업 브런치 `chore/sync-pm-docs-from-documents-20260516`를 분기한다. 각 4개 폴더를 비우고 documents 레포에서 자기 서비스 관련 파일만 복사한 뒤, 검증을 거쳐 단일 커밋으로 묶어 push, gh CLI로 PR을 생성한다. 파일럿(`engagement-svc`)을 먼저 완수하여 사용자 승인을 받은 뒤 나머지 4개 레포에 동일 절차를 일괄 적용한다.

**Tech Stack:** git CLI, gh CLI (GitHub CLI), bash (Git Bash on Windows), Windows 11

**관련 설계서:** `D:\workspace\final-project-syn\documents\docs\superpowers\specs\2026-05-16-pm-docs-sync-to-svc-repos-design.md` (commit `5518c86`)

**소스 SHA:** `team-project-final/documents` @ `b80635b` (PM 문서 최종판; spec 커밋 `5518c86`은 PM 폴더 외부)

---

## 공통 변수 (모든 Task에서 사용)

```bash
DOCS_REPO=/d/workspace/final-project-syn/documents
DOCS_PM="$DOCS_REPO/docs/project-management"
WORK_BRANCH=chore/sync-pm-docs-from-documents-20260516
PARENT_DIR=/d/workspace/final-project-syn
SOURCE_SHA=b80635b
```

## 레포별 변수 매핑

| 레포 | SERVICE_NAME | BASE_BRANCH | NEED_NEW_DEV | SCOPE_INCLUDED | KEEP_TASK | KEEP_WORKFLOW (prefix) | KEEP_SCOPE |
|---|---|---|---|---|---|---|---|
| synapse-engagement-svc | engagement | dev | false | true | TASK_engagement.md | WORKFLOW_engagement_W{1..5} | SCOPE_engagement.md |
| synapse-knowledge-svc | knowledge | dev | false | true | TASK_knowledge-1.md, TASK_knowledge-2.md | WORKFLOW_knowledge-1_W{1..5}, WORKFLOW_knowledge-2_W{1..5} | SCOPE_knowledge-1.md, SCOPE_knowledge-2.md |
| synapse-learning-svc | learning | dev | false | true | TASK_learning-card.md, TASK_learning-ai.md | WORKFLOW_learning-card_W{1..5}, WORKFLOW_learning-ai_W{1..5} | SCOPE_learning-card.md, SCOPE_learning-ai.md |
| synapse-platform-svc | platform | dev | **true** (main에서 생성) | true | TASK_platform.md | WORKFLOW_platform_W{1..5} | SCOPE_platform.md |
| synapse-frontend | frontend | dev | **true** (main에서 생성) | **false** (scope 폴더 손대지 않음) | TASK_frontend.md | WORKFLOW_frontend_W{1..5} | — |

PRD는 모든 레포 공통: `PRD_W1.md` ~ `PRD_W5.md` (5개).

---

## File Structure

본 계획은 5개 외부 GitHub 레포에 동기화 작업을 수행한다. 본 계획 자체는 새 파일을 만들지 않고, 외부 레포 안의 다음 폴더에만 변경을 가한다:

- `docs/project-management/prd/` — documents 기준 PRD_W1~W5.md 5개만
- `docs/project-management/task/` — 자기 서비스 TASK 파일만
- `docs/project-management/workflow/` — 자기 서비스 WORKFLOW 파일만
- `docs/project-management/scope/` — 자기 서비스 SCOPE 파일만 (frontend 제외)

각 4개 폴더는 본 작업 시점에 완전히 비워졌다가 KEEP 리스트의 파일로만 다시 채워진다.

손대지 않는 영역:
- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- frontend의 `docs/project-management/scope/`
- 코드, CI 설정

---

## Task 1: 사전 점검

**목적:** 5개 레포 클론 전에 환경/인증/디렉토리 충돌을 확인한다.

**Files:**
- 점검만, 변경 없음

- [ ] **Step 1-1: gh 인증 상태 확인**

Run:
```bash
gh auth status
```
Expected: `Logged in to github.com as <username>` 표시. 실패 시 `gh auth login` 후 재시도.

- [ ] **Step 1-2: documents 레포 main이 최신인지 확인**

Run:
```bash
git -C /d/workspace/final-project-syn/documents fetch origin
git -C /d/workspace/final-project-syn/documents log --oneline origin/main -3
```
Expected: 최상위 커밋이 spec 추가 커밋(`5518c86`) 이상이어야 함. SOURCE_SHA `b80635b`는 PRD/TASK/WORKFLOW/SCOPE의 마지막 변경 SHA로 사용된다.

- [ ] **Step 1-3: 클론 대상 디렉토리 충돌 점검**

Run:
```bash
for r in synapse-engagement-svc synapse-knowledge-svc synapse-learning-svc synapse-platform-svc synapse-frontend; do
  if [ -e "/d/workspace/final-project-syn/$r" ]; then
    echo "CONFLICT: $r already exists"
  else
    echo "OK: $r"
  fi
done
```
Expected: 모두 `OK: <repo>`. `CONFLICT`가 보이면 **즉시 작업을 중단**하고 사용자에게 보고. (사용자의 작업 중인 디렉토리일 수 있음.)

- [ ] **Step 1-4: 원격에 작업 브런치명 충돌 점검**

Run:
```bash
for r in synapse-engagement-svc synapse-knowledge-svc synapse-learning-svc synapse-platform-svc synapse-frontend; do
  echo "=== $r ==="
  gh api "repos/team-project-final/$r/branches" --jq '.[].name' | grep -F "chore/sync-pm-docs-from-documents-20260516" || echo "  (no conflict)"
done
```
Expected: 5개 모두 `(no conflict)`. 충돌 발견 시 사용자 확인.

- [ ] **Step 1-5: 원격에 platform/frontend의 dev 부재 재확인**

Run:
```bash
for r in synapse-platform-svc synapse-frontend; do
  echo "=== $r ==="
  gh api "repos/team-project-final/$r/branches" --jq '.[].name' | grep -F "dev" || echo "  (dev absent — will create)"
done
```
Expected: 두 레포 모두 `(dev absent — will create)`. 만약 누군가 그 사이 dev를 만들었다면 그것을 그대로 사용 (NEED_NEW_DEV → false 전환).

- [ ] **Step 1-6: 사전 점검 결과 보고**

사용자에게 5개 점검 항목 결과를 요약 보고. 1개라도 실패 시 진행 금지.

---

## Task 2: 파일럿 — synapse-engagement-svc 클론 & dev 브런치 진입

**Files:**
- Create directory: `D:\workspace\final-project-syn\synapse-engagement-svc\`

- [ ] **Step 2-1: 클론**

Run:
```bash
cd /d/workspace/final-project-syn
gh repo clone team-project-final/synapse-engagement-svc
```
Expected: `Cloning into 'synapse-engagement-svc'...` 후 완료. `.git` 폴더 생성.

- [ ] **Step 2-2: dev 브런치로 체크아웃 & 최신화**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git fetch origin
git checkout dev
git pull --ff-only origin dev
```
Expected: `Already up to date.` 또는 fast-forward.

- [ ] **Step 2-3: 작업 브런치 생성**

Run:
```bash
git checkout -b chore/sync-pm-docs-from-documents-20260516
```
Expected: `Switched to a new branch 'chore/sync-pm-docs-from-documents-20260516'`.

---

## Task 3: 파일럿 — synapse-engagement-svc 동기화 실행

**Files:**
- Modify (replace contents): `docs/project-management/prd/`, `docs/project-management/task/`, `docs/project-management/workflow/`, `docs/project-management/scope/`

**전략:** 각 폴더를 비우고 KEEP 파일만 documents에서 다시 채운다. `git rm` 사용으로 삭제 추적, 그 후 `cp`로 채움.

- [ ] **Step 3-1: 현재 4개 폴더 파일 목록 기록 (감사용)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
echo "=== BEFORE (prd) ==="; ls docs/project-management/prd/ 2>/dev/null
echo "=== BEFORE (task) ==="; ls docs/project-management/task/ 2>/dev/null
echo "=== BEFORE (workflow) ==="; ls docs/project-management/workflow/ 2>/dev/null
echo "=== BEFORE (scope) ==="; ls docs/project-management/scope/ 2>/dev/null
```

- [ ] **Step 3-2: 4개 폴더의 모든 파일 삭제 (git rm)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
for d in prd task workflow scope; do
  if [ -d "docs/project-management/$d" ]; then
    git rm -rf "docs/project-management/$d"/*.md 2>/dev/null
    # 폴더에 .md 외 파일이 있으면 보고만, 자동 삭제 안 함
    leftover=$(find "docs/project-management/$d" -mindepth 1 -maxdepth 1 -not -name '*.md' 2>/dev/null)
    if [ -n "$leftover" ]; then
      echo "WARNING: non-md files in $d: $leftover"
    fi
  fi
done
mkdir -p docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```
Expected: 각 `.md` 파일이 staged for deletion. 비-md 파일 경고 발생 시 사용자에게 보고 후 결정.

- [ ] **Step 3-3: documents에서 engagement 관련 파일 복사**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

# PRD (공통, 5개)
for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/prd/PRD_$w.md" "docs/project-management/prd/PRD_$w.md"
done

# TASK
cp "$DOCS_PM/task/TASK_engagement.md" "docs/project-management/task/TASK_engagement.md"

# WORKFLOW
for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/workflow/WORKFLOW_engagement_$w.md" "docs/project-management/workflow/WORKFLOW_engagement_$w.md"
done

# SCOPE
cp "$DOCS_PM/scope/SCOPE_engagement.md" "docs/project-management/scope/SCOPE_engagement.md"

# Stage
git add docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```
Expected: 12개 파일이 staged (또는 일부는 modified, 일부는 added — 기존과 동일한 경우 modified가 빈 차이일 수 있음).

- [ ] **Step 3-4: 결과 폴더 목록 확인**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
echo "=== AFTER (prd) ==="; ls docs/project-management/prd/
echo "=== AFTER (task) ==="; ls docs/project-management/task/
echo "=== AFTER (workflow) ==="; ls docs/project-management/workflow/
echo "=== AFTER (scope) ==="; ls docs/project-management/scope/
```
Expected:
- prd: `PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md`
- task: `TASK_engagement.md`
- workflow: `WORKFLOW_engagement_W1.md ... WORKFLOW_engagement_W5.md`
- scope: `SCOPE_engagement.md`

---

## Task 4: 파일럿 — 검증

설계서 섹션 7 체크리스트.

- [ ] **Step 4-1: 동기화 정확성 — 파일 목록 일치**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
expected_prd="PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md"
expected_task="TASK_engagement.md"
expected_workflow="WORKFLOW_engagement_W1.md WORKFLOW_engagement_W2.md WORKFLOW_engagement_W3.md WORKFLOW_engagement_W4.md WORKFLOW_engagement_W5.md"
expected_scope="SCOPE_engagement.md"

actual_prd=$(cd docs/project-management/prd && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')
actual_task=$(cd docs/project-management/task && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')
actual_workflow=$(cd docs/project-management/workflow && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')
actual_scope=$(cd docs/project-management/scope && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')

[ "$actual_prd" = "$expected_prd" ] && echo "OK prd" || echo "FAIL prd: $actual_prd"
[ "$actual_task" = "$expected_task" ] && echo "OK task" || echo "FAIL task: $actual_task"
[ "$actual_workflow" = "$expected_workflow" ] && echo "OK workflow" || echo "FAIL workflow: $actual_workflow"
[ "$actual_scope" = "$expected_scope" ] && echo "OK scope" || echo "FAIL scope: $actual_scope"
```
Expected: `OK prd`, `OK task`, `OK workflow`, `OK scope`. 하나라도 FAIL이면 Step 3-3 재실행.

- [ ] **Step 4-2: 동기화 정확성 — byte 동일성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management
fail=0
for f in prd/PRD_W1.md prd/PRD_W2.md prd/PRD_W3.md prd/PRD_W4.md prd/PRD_W5.md \
         task/TASK_engagement.md \
         workflow/WORKFLOW_engagement_W1.md workflow/WORKFLOW_engagement_W2.md workflow/WORKFLOW_engagement_W3.md workflow/WORKFLOW_engagement_W4.md workflow/WORKFLOW_engagement_W5.md \
         scope/SCOPE_engagement.md; do
  s1=$(sha256sum "$DOCS_PM/$f" | awk '{print $1}')
  s2=$(sha256sum "docs/project-management/$f" | awk '{print $1}')
  if [ "$s1" != "$s2" ]; then echo "FAIL hash mismatch: $f"; fail=1; fi
done
[ $fail -eq 0 ] && echo "OK all 12 hashes match"
```
Expected: `OK all 12 hashes match`.

- [ ] **Step 4-3: 비변경 영역 무결성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git diff --cached --name-only | grep -vE '^docs/project-management/(prd|task|workflow|scope)/' || echo "OK no out-of-scope changes"
```
Expected: `OK no out-of-scope changes`. 만약 다른 경로 변경이 있다면 즉시 unstage.

- [ ] **Step 4-4: KICKOFF/README/history 무변경 확인**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git diff --cached -- docs/project-management/KICKOFF.md docs/project-management/README.md docs/project-management/history/ | wc -l
```
Expected: `0` (변경 없음).

- [ ] **Step 4-5: staged 변경 요약**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git diff --cached --stat
```
Expected: 4개 폴더 내 파일만 변경 (added/modified/deleted). 사용자에게 변경 요약 보고용.

---

## Task 5: 파일럿 — 커밋 & push & PR 생성

- [ ] **Step 5-1: 단일 커밋 작성 (한글 메시지)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git commit -m "$(cat <<'EOF'
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow/scope
4개 폴더 내용을 재정렬합니다.

- 동기화 범위: docs/project-management/{prd,task,workflow,scope}
- 적용 정책: 본 서비스(engagement) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/ 등은 미변경

소스: team-project-final/documents @ b80635b

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: `[chore/sync-pm-docs-from-documents-20260516 <SHA>] chore(docs): ...`. 커밋 1개.

- [ ] **Step 5-2: 커밋 검증 — 1개 커밋만 dev 대비 추가됨**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git log --oneline origin/dev..HEAD
```
Expected: 정확히 1줄.

- [ ] **Step 5-3: 작업 브런치 push**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
git push --set-upstream origin chore/sync-pm-docs-from-documents-20260516
```
Expected: `Branch 'chore/sync-pm-docs-from-documents-20260516' set up to track 'origin/chore/sync-pm-docs-from-documents-20260516'`.

- [ ] **Step 5-4: PR 생성 (한글 본문)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-engagement-svc
gh pr create \
  --base dev \
  --head chore/sync-pm-docs-from-documents-20260516 \
  --title "chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow/scope)" \
  --body "$(cat <<'EOF'
## 배경

기존 -svc 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 4개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`, `scope/`
- 적용 정책: 본 서비스(`engagement`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

**prd/** (5)
- PRD_W1.md, PRD_W2.md, PRD_W3.md, PRD_W4.md, PRD_W5.md

**task/** (1)
- TASK_engagement.md

**workflow/** (5)
- WORKFLOW_engagement_W1.md ~ WORKFLOW_engagement_W5.md

**scope/** (1)
- SCOPE_engagement.md

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
EOF
)"
```
Expected: PR URL 출력 (예: `https://github.com/team-project-final/synapse-engagement-svc/pull/N`).

- [ ] **Step 5-5: PR URL 사용자 보고**

PR URL을 사용자에게 보고하고 검토 요청.

---

## Task 6: 사용자 승인 게이트 ⚠️

**STOP. 사용자가 파일럿 PR을 검토하고 명시적으로 "진행" 또는 "OK" 또는 동등한 승인을 줄 때까지 다음 Task로 넘어가지 않는다.**

- [ ] **Step 6-1: 승인 대기**

사용자 응답 대기. 다음 중 하나 발생:
- (A) 승인 → Task 7부터 계속
- (B) 수정 요청 → 요청 반영하여 파일럿 재작업 (PR 업데이트), Step 6-1로 복귀
- (C) 중단 → 작업 종료, 결과 보고

---

## Task 7: 일괄 — synapse-knowledge-svc

**Files:**
- Create directory: `D:\workspace\final-project-syn\synapse-knowledge-svc\`
- Modify: `docs/project-management/{prd,task,workflow,scope}/` 안의 파일들

- [ ] **Step 7-1: 클론 & dev 진입 & 작업 브런치 생성**

Run:
```bash
cd /d/workspace/final-project-syn
gh repo clone team-project-final/synapse-knowledge-svc
cd synapse-knowledge-svc
git fetch origin
git checkout dev
git pull --ff-only origin dev
git checkout -b chore/sync-pm-docs-from-documents-20260516
```
Expected: 새 작업 브런치 진입.

- [ ] **Step 7-2: 4개 폴더 비우기**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-knowledge-svc
for d in prd task workflow scope; do
  if [ -d "docs/project-management/$d" ]; then
    git rm -rf "docs/project-management/$d"/*.md 2>/dev/null
    leftover=$(find "docs/project-management/$d" -mindepth 1 -maxdepth 1 -not -name '*.md' 2>/dev/null)
    if [ -n "$leftover" ]; then echo "WARNING: non-md files in $d: $leftover"; fi
  fi
done
mkdir -p docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 7-3: knowledge 관련 파일 복사**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-knowledge-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

# PRD
for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/prd/PRD_$w.md" "docs/project-management/prd/PRD_$w.md"
done

# TASK (2개)
cp "$DOCS_PM/task/TASK_knowledge-1.md" "docs/project-management/task/TASK_knowledge-1.md"
cp "$DOCS_PM/task/TASK_knowledge-2.md" "docs/project-management/task/TASK_knowledge-2.md"

# WORKFLOW (10개)
for sub in knowledge-1 knowledge-2; do
  for w in W1 W2 W3 W4 W5; do
    cp "$DOCS_PM/workflow/WORKFLOW_${sub}_$w.md" "docs/project-management/workflow/WORKFLOW_${sub}_$w.md"
  done
done

# SCOPE (2개)
cp "$DOCS_PM/scope/SCOPE_knowledge-1.md" "docs/project-management/scope/SCOPE_knowledge-1.md"
cp "$DOCS_PM/scope/SCOPE_knowledge-2.md" "docs/project-management/scope/SCOPE_knowledge-2.md"

git add docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 7-4: 검증 — 파일 목록 & 해시 & 비변경 영역**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-knowledge-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

# 파일 목록 일치
expected_prd="PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md"
expected_task="TASK_knowledge-1.md TASK_knowledge-2.md"
expected_workflow="WORKFLOW_knowledge-1_W1.md WORKFLOW_knowledge-1_W2.md WORKFLOW_knowledge-1_W3.md WORKFLOW_knowledge-1_W4.md WORKFLOW_knowledge-1_W5.md WORKFLOW_knowledge-2_W1.md WORKFLOW_knowledge-2_W2.md WORKFLOW_knowledge-2_W3.md WORKFLOW_knowledge-2_W4.md WORKFLOW_knowledge-2_W5.md"
expected_scope="SCOPE_knowledge-1.md SCOPE_knowledge-2.md"
[ "$(cd docs/project-management/prd && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_prd" ] && echo "OK prd" || echo "FAIL prd"
[ "$(cd docs/project-management/task && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_task" ] && echo "OK task" || echo "FAIL task"
[ "$(cd docs/project-management/workflow && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_workflow" ] && echo "OK workflow" || echo "FAIL workflow"
[ "$(cd docs/project-management/scope && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_scope" ] && echo "OK scope" || echo "FAIL scope"

# 해시
fail=0
for f in prd/PRD_W1.md prd/PRD_W2.md prd/PRD_W3.md prd/PRD_W4.md prd/PRD_W5.md \
         task/TASK_knowledge-1.md task/TASK_knowledge-2.md \
         workflow/WORKFLOW_knowledge-1_W1.md workflow/WORKFLOW_knowledge-1_W2.md workflow/WORKFLOW_knowledge-1_W3.md workflow/WORKFLOW_knowledge-1_W4.md workflow/WORKFLOW_knowledge-1_W5.md \
         workflow/WORKFLOW_knowledge-2_W1.md workflow/WORKFLOW_knowledge-2_W2.md workflow/WORKFLOW_knowledge-2_W3.md workflow/WORKFLOW_knowledge-2_W4.md workflow/WORKFLOW_knowledge-2_W5.md \
         scope/SCOPE_knowledge-1.md scope/SCOPE_knowledge-2.md; do
  s1=$(sha256sum "$DOCS_PM/$f" | awk '{print $1}')
  s2=$(sha256sum "docs/project-management/$f" | awk '{print $1}')
  if [ "$s1" != "$s2" ]; then echo "FAIL hash: $f"; fail=1; fi
done
[ $fail -eq 0 ] && echo "OK all 19 hashes match"

# 비변경 영역
git diff --cached --name-only | grep -vE '^docs/project-management/(prd|task|workflow|scope)/' || echo "OK no out-of-scope changes"
git diff --cached -- docs/project-management/KICKOFF.md docs/project-management/README.md docs/project-management/history/ | wc -l
```
Expected: `OK prd`, `OK task`, `OK workflow`, `OK scope`, `OK all 19 hashes match`, `OK no out-of-scope changes`, `0`.

- [ ] **Step 7-5: 커밋 (한글)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-knowledge-svc
git commit -m "$(cat <<'EOF'
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow/scope
4개 폴더 내용을 재정렬합니다.

- 동기화 범위: docs/project-management/{prd,task,workflow,scope}
- 적용 정책: 본 서비스(knowledge) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/ 등은 미변경

소스: team-project-final/documents @ b80635b

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git log --oneline origin/dev..HEAD
```
Expected: 1개 커밋.

- [ ] **Step 7-6: push & PR 생성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-knowledge-svc
git push --set-upstream origin chore/sync-pm-docs-from-documents-20260516
gh pr create \
  --base dev \
  --head chore/sync-pm-docs-from-documents-20260516 \
  --title "chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow/scope)" \
  --body "$(cat <<'EOF'
## 배경

기존 -svc 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 4개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`, `scope/`
- 적용 정책: 본 서비스(`knowledge`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

**prd/** (5)
- PRD_W1.md, PRD_W2.md, PRD_W3.md, PRD_W4.md, PRD_W5.md

**task/** (2)
- TASK_knowledge-1.md, TASK_knowledge-2.md

**workflow/** (10)
- WORKFLOW_knowledge-1_W1.md ~ WORKFLOW_knowledge-1_W5.md
- WORKFLOW_knowledge-2_W1.md ~ WORKFLOW_knowledge-2_W5.md

**scope/** (2)
- SCOPE_knowledge-1.md, SCOPE_knowledge-2.md

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
EOF
)"
```
Expected: PR URL 출력.

---

## Task 8: 일괄 — synapse-learning-svc

- [ ] **Step 8-1: 클론 & dev 진입 & 작업 브런치 생성**

Run:
```bash
cd /d/workspace/final-project-syn
gh repo clone team-project-final/synapse-learning-svc
cd synapse-learning-svc
git fetch origin
git checkout dev
git pull --ff-only origin dev
git checkout -b chore/sync-pm-docs-from-documents-20260516
```

- [ ] **Step 8-2: 4개 폴더 비우기**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-learning-svc
for d in prd task workflow scope; do
  if [ -d "docs/project-management/$d" ]; then
    git rm -rf "docs/project-management/$d"/*.md 2>/dev/null
    leftover=$(find "docs/project-management/$d" -mindepth 1 -maxdepth 1 -not -name '*.md' 2>/dev/null)
    if [ -n "$leftover" ]; then echo "WARNING: non-md files in $d: $leftover"; fi
  fi
done
mkdir -p docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 8-3: learning 관련 파일 복사 (learning-card + learning-ai)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-learning-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/prd/PRD_$w.md" "docs/project-management/prd/PRD_$w.md"
done

cp "$DOCS_PM/task/TASK_learning-card.md" "docs/project-management/task/TASK_learning-card.md"
cp "$DOCS_PM/task/TASK_learning-ai.md" "docs/project-management/task/TASK_learning-ai.md"

for sub in learning-card learning-ai; do
  for w in W1 W2 W3 W4 W5; do
    cp "$DOCS_PM/workflow/WORKFLOW_${sub}_$w.md" "docs/project-management/workflow/WORKFLOW_${sub}_$w.md"
  done
done

cp "$DOCS_PM/scope/SCOPE_learning-card.md" "docs/project-management/scope/SCOPE_learning-card.md"
cp "$DOCS_PM/scope/SCOPE_learning-ai.md" "docs/project-management/scope/SCOPE_learning-ai.md"

git add docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 8-4: 검증**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-learning-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

expected_prd="PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md"
expected_task="TASK_learning-ai.md TASK_learning-card.md"
expected_workflow="WORKFLOW_learning-ai_W1.md WORKFLOW_learning-ai_W2.md WORKFLOW_learning-ai_W3.md WORKFLOW_learning-ai_W4.md WORKFLOW_learning-ai_W5.md WORKFLOW_learning-card_W1.md WORKFLOW_learning-card_W2.md WORKFLOW_learning-card_W3.md WORKFLOW_learning-card_W4.md WORKFLOW_learning-card_W5.md"
expected_scope="SCOPE_learning-ai.md SCOPE_learning-card.md"
[ "$(cd docs/project-management/prd && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_prd" ] && echo "OK prd" || echo "FAIL prd"
[ "$(cd docs/project-management/task && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_task" ] && echo "OK task" || echo "FAIL task"
[ "$(cd docs/project-management/workflow && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_workflow" ] && echo "OK workflow" || echo "FAIL workflow"
[ "$(cd docs/project-management/scope && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_scope" ] && echo "OK scope" || echo "FAIL scope"

fail=0
for f in prd/PRD_W1.md prd/PRD_W2.md prd/PRD_W3.md prd/PRD_W4.md prd/PRD_W5.md \
         task/TASK_learning-card.md task/TASK_learning-ai.md \
         workflow/WORKFLOW_learning-card_W1.md workflow/WORKFLOW_learning-card_W2.md workflow/WORKFLOW_learning-card_W3.md workflow/WORKFLOW_learning-card_W4.md workflow/WORKFLOW_learning-card_W5.md \
         workflow/WORKFLOW_learning-ai_W1.md workflow/WORKFLOW_learning-ai_W2.md workflow/WORKFLOW_learning-ai_W3.md workflow/WORKFLOW_learning-ai_W4.md workflow/WORKFLOW_learning-ai_W5.md \
         scope/SCOPE_learning-card.md scope/SCOPE_learning-ai.md; do
  s1=$(sha256sum "$DOCS_PM/$f" | awk '{print $1}')
  s2=$(sha256sum "docs/project-management/$f" | awk '{print $1}')
  if [ "$s1" != "$s2" ]; then echo "FAIL hash: $f"; fail=1; fi
done
[ $fail -eq 0 ] && echo "OK all 19 hashes match"

git diff --cached --name-only | grep -vE '^docs/project-management/(prd|task|workflow|scope)/' || echo "OK no out-of-scope changes"
git diff --cached -- docs/project-management/KICKOFF.md docs/project-management/README.md docs/project-management/history/ | wc -l
```
Expected: `OK prd`, `OK task`, `OK workflow`, `OK scope`, `OK all 19 hashes match`, `OK no out-of-scope changes`, `0`.

- [ ] **Step 8-5: 커밋 (한글, SERVICE_NAME=learning)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-learning-svc
git commit -m "$(cat <<'EOF'
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow/scope
4개 폴더 내용을 재정렬합니다.

- 동기화 범위: docs/project-management/{prd,task,workflow,scope}
- 적용 정책: 본 서비스(learning) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/ 등은 미변경

소스: team-project-final/documents @ b80635b

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git log --oneline origin/dev..HEAD
```

- [ ] **Step 8-6: push & PR 생성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-learning-svc
git push --set-upstream origin chore/sync-pm-docs-from-documents-20260516
gh pr create \
  --base dev \
  --head chore/sync-pm-docs-from-documents-20260516 \
  --title "chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow/scope)" \
  --body "$(cat <<'EOF'
## 배경

기존 -svc 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 4개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`, `scope/`
- 적용 정책: 본 서비스(`learning`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

**prd/** (5)
- PRD_W1.md, PRD_W2.md, PRD_W3.md, PRD_W4.md, PRD_W5.md

**task/** (2)
- TASK_learning-card.md, TASK_learning-ai.md

**workflow/** (10)
- WORKFLOW_learning-card_W1.md ~ WORKFLOW_learning-card_W5.md
- WORKFLOW_learning-ai_W1.md ~ WORKFLOW_learning-ai_W5.md

**scope/** (2)
- SCOPE_learning-card.md, SCOPE_learning-ai.md

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
EOF
)"
```

---

## Task 9: 일괄 — synapse-platform-svc (dev 신규 생성 필요)

- [ ] **Step 9-1: 클론 & main 진입**

Run:
```bash
cd /d/workspace/final-project-syn
gh repo clone team-project-final/synapse-platform-svc
cd synapse-platform-svc
git fetch origin
git checkout main
git pull --ff-only origin main
```

- [ ] **Step 9-2: dev 브런치 신규 생성 & push**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
# 원격에 dev 없음을 재확인 (Task 1-5에서 한 번 확인했지만 그 사이 생성됐을 수 있음)
git ls-remote --heads origin dev | head -1
# 없으면 main에서 dev 생성하고 push
git checkout -b dev
git push --set-upstream origin dev
```
Expected: `dev` 신규 생성 후 원격 push 성공. (만약 ls-remote 결과가 있으면 작업 중단, 사용자 확인.)

- [ ] **Step 9-3: 작업 브런치 생성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
git checkout -b chore/sync-pm-docs-from-documents-20260516
```

- [ ] **Step 9-4: 4개 폴더 비우기**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
for d in prd task workflow scope; do
  if [ -d "docs/project-management/$d" ]; then
    git rm -rf "docs/project-management/$d"/*.md 2>/dev/null
    leftover=$(find "docs/project-management/$d" -mindepth 1 -maxdepth 1 -not -name '*.md' 2>/dev/null)
    if [ -n "$leftover" ]; then echo "WARNING: non-md files in $d: $leftover"; fi
  fi
done
mkdir -p docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 9-5: platform 관련 파일 복사**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/prd/PRD_$w.md" "docs/project-management/prd/PRD_$w.md"
done

cp "$DOCS_PM/task/TASK_platform.md" "docs/project-management/task/TASK_platform.md"

for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/workflow/WORKFLOW_platform_$w.md" "docs/project-management/workflow/WORKFLOW_platform_$w.md"
done

cp "$DOCS_PM/scope/SCOPE_platform.md" "docs/project-management/scope/SCOPE_platform.md"

git add docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
```

- [ ] **Step 9-6: 검증**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

expected_prd="PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md"
expected_task="TASK_platform.md"
expected_workflow="WORKFLOW_platform_W1.md WORKFLOW_platform_W2.md WORKFLOW_platform_W3.md WORKFLOW_platform_W4.md WORKFLOW_platform_W5.md"
expected_scope="SCOPE_platform.md"
[ "$(cd docs/project-management/prd && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_prd" ] && echo "OK prd" || echo "FAIL prd"
[ "$(cd docs/project-management/task && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_task" ] && echo "OK task" || echo "FAIL task"
[ "$(cd docs/project-management/workflow && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_workflow" ] && echo "OK workflow" || echo "FAIL workflow"
[ "$(cd docs/project-management/scope && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_scope" ] && echo "OK scope" || echo "FAIL scope"

fail=0
for f in prd/PRD_W1.md prd/PRD_W2.md prd/PRD_W3.md prd/PRD_W4.md prd/PRD_W5.md \
         task/TASK_platform.md \
         workflow/WORKFLOW_platform_W1.md workflow/WORKFLOW_platform_W2.md workflow/WORKFLOW_platform_W3.md workflow/WORKFLOW_platform_W4.md workflow/WORKFLOW_platform_W5.md \
         scope/SCOPE_platform.md; do
  s1=$(sha256sum "$DOCS_PM/$f" | awk '{print $1}')
  s2=$(sha256sum "docs/project-management/$f" | awk '{print $1}')
  if [ "$s1" != "$s2" ]; then echo "FAIL hash: $f"; fail=1; fi
done
[ $fail -eq 0 ] && echo "OK all 12 hashes match"

git diff --cached --name-only | grep -vE '^docs/project-management/(prd|task|workflow|scope)/' || echo "OK no out-of-scope changes"
git diff --cached -- docs/project-management/KICKOFF.md docs/project-management/README.md docs/project-management/history/ | wc -l
```
Expected: `OK prd`, `OK task`, `OK workflow`, `OK scope`, `OK all 12 hashes match`, `OK no out-of-scope changes`, `0`.

- [ ] **Step 9-7: 커밋 & push & PR**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-platform-svc
git commit -m "$(cat <<'EOF'
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow/scope
4개 폴더 내용을 재정렬합니다.

- 동기화 범위: docs/project-management/{prd,task,workflow,scope}
- 적용 정책: 본 서비스(platform) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/ 등은 미변경

소스: team-project-final/documents @ b80635b

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push --set-upstream origin chore/sync-pm-docs-from-documents-20260516
gh pr create \
  --base dev \
  --head chore/sync-pm-docs-from-documents-20260516 \
  --title "chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow/scope)" \
  --body "$(cat <<'EOF'
## 배경

기존 -svc 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 4개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`, `scope/`
- 적용 정책: 본 서비스(`platform`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

**prd/** (5)
- PRD_W1.md, PRD_W2.md, PRD_W3.md, PRD_W4.md, PRD_W5.md

**task/** (1)
- TASK_platform.md

**workflow/** (5)
- WORKFLOW_platform_W1.md ~ WORKFLOW_platform_W5.md

**scope/** (1)
- SCOPE_platform.md

## 참고

본 레포는 사전에 `dev` 브런치가 존재하지 않아 본 동기화 작업 직전 `main`에서
`dev` 브런치를 새로 분기·푸쉬했습니다. 본 PR은 신규 생성된 `dev` 브런치를
베이스로 삼습니다.

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
EOF
)"
```
Expected: PR URL 출력.

---

## Task 10: 일괄 — synapse-frontend (dev 신규 생성 필요, scope 미동기화)

- [ ] **Step 10-1: 클론 & main 진입**

Run:
```bash
cd /d/workspace/final-project-syn
gh repo clone team-project-final/synapse-frontend
cd synapse-frontend
git fetch origin
git checkout main
git pull --ff-only origin main
```

- [ ] **Step 10-2: dev 브런치 신규 생성 & push**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
git ls-remote --heads origin dev | head -1
# 없으면
git checkout -b dev
git push --set-upstream origin dev
```
Expected: 신규 생성 push 성공. (이미 존재 시 사용자 확인.)

- [ ] **Step 10-3: 작업 브런치 생성**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
git checkout -b chore/sync-pm-docs-from-documents-20260516
```

- [ ] **Step 10-4: prd/task/workflow 3개 폴더만 비우기 (scope는 손대지 않음)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
for d in prd task workflow; do
  if [ -d "docs/project-management/$d" ]; then
    git rm -rf "docs/project-management/$d"/*.md 2>/dev/null
    leftover=$(find "docs/project-management/$d" -mindepth 1 -maxdepth 1 -not -name '*.md' 2>/dev/null)
    if [ -n "$leftover" ]; then echo "WARNING: non-md files in $d: $leftover"; fi
  fi
done
mkdir -p docs/project-management/prd docs/project-management/task docs/project-management/workflow
```

- [ ] **Step 10-5: frontend 관련 파일 복사 (scope 제외)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/prd/PRD_$w.md" "docs/project-management/prd/PRD_$w.md"
done

cp "$DOCS_PM/task/TASK_frontend.md" "docs/project-management/task/TASK_frontend.md"

for w in W1 W2 W3 W4 W5; do
  cp "$DOCS_PM/workflow/WORKFLOW_frontend_$w.md" "docs/project-management/workflow/WORKFLOW_frontend_$w.md"
done

git add docs/project-management/prd docs/project-management/task docs/project-management/workflow
```

- [ ] **Step 10-6: 검증 (scope는 변경 없음 확인 포함)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
DOCS_PM=/d/workspace/final-project-syn/documents/docs/project-management

expected_prd="PRD_W1.md PRD_W2.md PRD_W3.md PRD_W4.md PRD_W5.md"
expected_task="TASK_frontend.md"
expected_workflow="WORKFLOW_frontend_W1.md WORKFLOW_frontend_W2.md WORKFLOW_frontend_W3.md WORKFLOW_frontend_W4.md WORKFLOW_frontend_W5.md"
[ "$(cd docs/project-management/prd && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_prd" ] && echo "OK prd" || echo "FAIL prd"
[ "$(cd docs/project-management/task && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_task" ] && echo "OK task" || echo "FAIL task"
[ "$(cd docs/project-management/workflow && ls *.md | sort | tr '\n' ' ' | sed 's/ $//')" = "$expected_workflow" ] && echo "OK workflow" || echo "FAIL workflow"

fail=0
for f in prd/PRD_W1.md prd/PRD_W2.md prd/PRD_W3.md prd/PRD_W4.md prd/PRD_W5.md \
         task/TASK_frontend.md \
         workflow/WORKFLOW_frontend_W1.md workflow/WORKFLOW_frontend_W2.md workflow/WORKFLOW_frontend_W3.md workflow/WORKFLOW_frontend_W4.md workflow/WORKFLOW_frontend_W5.md; do
  s1=$(sha256sum "$DOCS_PM/$f" | awk '{print $1}')
  s2=$(sha256sum "docs/project-management/$f" | awk '{print $1}')
  if [ "$s1" != "$s2" ]; then echo "FAIL hash: $f"; fail=1; fi
done
[ $fail -eq 0 ] && echo "OK all 11 hashes match"

# scope/ 변경 없음
git diff --cached -- docs/project-management/scope/ | wc -l

# 비변경 영역 — scope도 포함하여 비변경이어야 함
git diff --cached --name-only | grep -vE '^docs/project-management/(prd|task|workflow)/' || echo "OK no out-of-scope changes"
git diff --cached -- docs/project-management/KICKOFF.md docs/project-management/README.md docs/project-management/history/ | wc -l
```
Expected: `OK prd`, `OK task`, `OK workflow`, `OK all 11 hashes match`, `0` (scope diff), `OK no out-of-scope changes`, `0` (KICKOFF/README/history diff).

- [ ] **Step 10-7: 커밋 & push & PR (SERVICE_NAME=frontend, scope 미동기화 명시)**

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
git commit -m "$(cat <<'EOF'
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow
3개 폴더 내용을 재정렬합니다. (scope는 documents에 frontend 항목이 없어 미동기화)

- 동기화 범위: docs/project-management/{prd,task,workflow}
- 적용 정책: 본 서비스(frontend) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/, scope/ 등은 미변경

소스: team-project-final/documents @ b80635b

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push --set-upstream origin chore/sync-pm-docs-from-documents-20260516
gh pr create \
  --base dev \
  --head chore/sync-pm-docs-from-documents-20260516 \
  --title "chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow)" \
  --body "$(cat <<'EOF'
## 배경

기존 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 3개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`
- 적용 정책: 본 서비스(`frontend`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/scope/` — documents 레포에 `SCOPE_frontend.md`가 없어 이번 동기화 제외
- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

**prd/** (5)
- PRD_W1.md, PRD_W2.md, PRD_W3.md, PRD_W4.md, PRD_W5.md

**task/** (1)
- TASK_frontend.md

**workflow/** (5)
- WORKFLOW_frontend_W1.md ~ WORKFLOW_frontend_W5.md

## 참고

본 레포는 사전에 `dev` 브런치가 존재하지 않아 본 동기화 작업 직전 `main`에서
`dev` 브런치를 새로 분기·푸쉬했습니다. 본 PR은 신규 생성된 `dev` 브런치를
베이스로 삼습니다.

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
EOF
)"
```

---

## Task 11: 최종 보고

- [ ] **Step 11-1: 5개 PR URL을 표로 정리**

Run:
```bash
for r in synapse-engagement-svc synapse-knowledge-svc synapse-learning-svc synapse-platform-svc synapse-frontend; do
  echo "=== $r ==="
  gh pr list --repo "team-project-final/$r" --head chore/sync-pm-docs-from-documents-20260516 --json url,number,title,baseRefName
done
```
Expected: 각 레포에 1건씩, 5개 PR 정보.

- [ ] **Step 11-2: 사용자에게 마무리 보고**

마크다운 표 형식으로 사용자에게 보고:

```
| 레포 | PR URL | 베이스 | 변경 파일 수 |
|---|---|---|---|
| synapse-engagement-svc | ... | dev | 12 |
| synapse-knowledge-svc | ... | dev | 19 |
| synapse-learning-svc | ... | dev | 19 |
| synapse-platform-svc | ... | dev (신규) | 12 |
| synapse-frontend | ... | dev (신규) | 11 |
```

머지는 각 레포 담당자/팀 리드 책임 (본 작업 범위 밖).

---

## 위험 대응 빠른 참조

| 발생 시점 | 증상 | 대응 |
|---|---|---|
| Step 1-3 | 클론 디렉토리 이미 존재 | 작업 중단, 사용자에게 보고 (작업 중인 디렉토리일 수 있음) |
| Step 1-4 | 작업 브런치명 원격 충돌 | 작업 중단, 사용자에게 보고 |
| Step 9-2 / 10-2 | platform/frontend 원격에 이미 dev 존재 | 새로 만들지 말고 기존 dev pull 후 사용. 사용자에게 알림 |
| 모든 검증 단계 (4-x, 7-4, 8-4, 9-6, 10-6) | OK 미출력 / FAIL | push 금지, 로컬 수정 후 재검증 |
| Step 5-3 / 7-6 / 8-6 / 9-7 / 10-7 | push 실패 (권한, 충돌 등) | 사용자에게 보고, 수동 처리 안내 |
| gh pr create 실패 | API 오류, 권한 등 | push까지만 두고 PR 수동 생성 안내 |
| `git rm` 시 비-md 파일 경고 | 폴더에 .md 외 파일 존재 | 작업 중단, 사용자에게 보고하여 처리 방침 결정 |
