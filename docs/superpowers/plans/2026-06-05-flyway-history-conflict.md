# Flyway History 충돌 진단·예방·해소 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flyway 마이그레이션 버전 충돌(특히 platform-svc V28 중복)을 해소하고, 타임스탬프 버전 컨벤션 + CI 차단 가드로 재발을 구조적으로 막는다.

**Architecture:** 중앙 repo `synapse-shared`에 (1) 충돌을 검사하는 Python 가드 스크립트와 단위 테스트, (2) 이를 실행하는 재사용 가능 GitHub Actions workflow(`on: workflow_call`), (3) 표준 문서를 둔다. 4개 서비스 repo는 직접 수정하지 않고, 각자 caller workflow 추가 + Flyway 설정 표준화 + (platform 한정) V28 rename을 **GitHub 이슈**로 요청한다. 모든 synapse-shared 코드 작업은 전용 브랜치 → 커밋 → 푸쉬 → **PR(base: main)** → 머지 대기 구조를 따른다.

**Tech Stack:** Python 3.12(표준 라이브러리만), GitHub Actions reusable workflow, Spring Boot Flyway, `gh` CLI.

**기준 사실(검증됨):**
- platform-svc: `V28__allow_multiple_refresh_tokens.sql`(tracked, PR #33) + `V28__rename_oauth_provider_id_column.sql`(**untracked**) → 동일 V28 2개.
- knowledge(V1–8 정상, main에 flyway 블록 없음=기본값), learning(V8–17, `baseline-on-migrate: true`), engagement(V1–6, 5개 location 전역 namespace 공유).
- 중앙 repo `synapse-shared`, org `team-project-final`, 재사용 workflow 패턴: `uses: team-project-final/synapse-shared/.github/workflows/<x>.yml@main`.
- synapse-shared 기본 브랜치 = `main`(dev 브랜치 없음).

**참고 메모리:** [[git-pr-workflow]], [[repo-edit-scope-policy]], [[deploy-mirror-standardization]], [[verify-merge-state-via-origin]].

---

## File Structure

`synapse-shared` repo 내에서 (모두 직접 수정 허용):

| 경로 | 책임 |
|---|---|
| `scripts/flyway_guard.py` | 충돌 검사 로직(순수 함수 + CLI main). 중복 버전·신규 파일 타임스탬프 형식·기머지 파일 불변성 검사. |
| `scripts/test_flyway_guard.py` | 위 스크립트의 pytest 단위/통합 테스트. |
| `.github/workflows/flyway-guard.yml` | 재사용 workflow(`on: workflow_call`). caller repo와 synapse-shared를 체크아웃해 가드 실행. |
| `docs/rules/12-flyway-migration.md` | 마이그레이션 버전 컨벤션 표준 문서(rules 디렉터리 번호 규칙 계승). |
| `docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md` | 4개 서비스 롤아웃 요청서(이슈 본문 원본). platform 섹션에 V28 rename 포함. |

서비스 repo 변경(이슈로만 요청, 본 plan에서 직접 편집하지 않음):
- 각 서비스 `.github/workflows/flyway-guard.yml` (caller, 4개)
- 각 서비스 `src/main/resources/application.yml` 의 `spring.flyway` 블록 표준화
- platform-svc `src/main/resources/db/migration/V28__rename_oauth_provider_id_column.sql` → 타임스탬프 rename

---

## Task 0: 작업 브랜치 생성 (synapse-shared)

**Files:** 없음(git 브랜치만)

- [ ] **Step 1: 최신 main에서 브랜치 분기**

```bash
cd synapse-shared
git fetch origin
git switch -c feat/flyway-guard origin/main
```

- [ ] **Step 2: 브랜치 확인**

Run: `git branch --show-current`
Expected: `feat/flyway-guard`

---

## Task 1: `parse_version` — 파일명에서 버전 토큰 추출 (TDD)

**Files:**
- Create: `synapse-shared/scripts/flyway_guard.py`
- Test: `synapse-shared/scripts/test_flyway_guard.py`

- [ ] **Step 1: 실패하는 테스트 작성**

`synapse-shared/scripts/test_flyway_guard.py`:

```python
import flyway_guard as fg


def test_parse_version_integer():
    assert fg.parse_version("V28__allow_multiple_refresh_tokens.sql") == "28"


def test_parse_version_with_path():
    assert fg.parse_version("a/b/V20260605120000__rename.sql") == "20260605120000"


def test_parse_version_repeatable_is_none():
    assert fg.parse_version("R__refresh_view.sql") is None


def test_parse_version_non_migration_is_none():
    assert fg.parse_version("notes.sql") is None
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: FAIL — `ModuleNotFoundError: No module named 'flyway_guard'`

- [ ] **Step 3: 최소 구현**

`synapse-shared/scripts/flyway_guard.py`:

```python
#!/usr/bin/env python3
"""Flyway migration guard.

검사 항목:
  1) 동일 버전 토큰을 쓰는 마이그레이션 파일이 2개 이상이면 실패(중복 버전).
  2) (base-ref 제공 시) 이번 변경에서 '추가'된 마이그레이션은 14자리 타임스탬프 버전이어야 함.
  3) (base-ref 제공 시) 이미 머지된 마이그레이션 파일의 수정/삭제는 실패(불변성).
"""
import os
import re

VERSION_RE = re.compile(r"^V(.+?)__.*\.sql$")


def parse_version(filename):
    """Flyway versioned 마이그레이션 파일명에서 버전 토큰을 반환. 아니면 None."""
    base = os.path.basename(filename)
    m = VERSION_RE.match(base)
    if not m:
        return None
    return m.group(1)
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: PASS (4 passed)

- [ ] **Step 5: 커밋**

```bash
cd synapse-shared
git add scripts/flyway_guard.py scripts/test_flyway_guard.py
git commit -m "feat(flyway-guard): parse_version 파일명→버전 토큰 추출"
```

---

## Task 2: `find_duplicates` — 중복 버전 탐지 (TDD)

**Files:**
- Modify: `synapse-shared/scripts/flyway_guard.py`
- Test: `synapse-shared/scripts/test_flyway_guard.py`

- [ ] **Step 1: 실패하는 테스트 추가**

`test_flyway_guard.py` 끝에 추가:

```python
def test_find_duplicates_flags_repeated_version():
    paths = ["a/V28__x.sql", "b/V28__y.sql", "c/V29__z.sql"]
    assert fg.find_duplicates(paths) == {"28": ["a/V28__x.sql", "b/V28__y.sql"]}


def test_find_duplicates_empty_when_unique():
    paths = ["a/V1__x.sql", "b/V2__y.sql"]
    assert fg.find_duplicates(paths) == {}


def test_find_duplicates_ignores_non_migrations():
    paths = ["a/V1__x.sql", "b/README.md", "c/R__view.sql"]
    assert fg.find_duplicates(paths) == {}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: FAIL — `AttributeError: module 'flyway_guard' has no attribute 'find_duplicates'`

- [ ] **Step 3: 구현 추가**

`flyway_guard.py`에 추가:

```python
def find_duplicates(paths):
    """version 토큰 -> 정렬된 경로 리스트. 2회 이상 쓰인 버전만 포함."""
    by_version = {}
    for p in paths:
        v = parse_version(p)
        if v is None:
            continue
        by_version.setdefault(v, []).append(p)
    return {v: sorted(ps) for v, ps in by_version.items() if len(ps) > 1}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: PASS (7 passed)

- [ ] **Step 5: 커밋**

```bash
cd synapse-shared
git add scripts/flyway_guard.py scripts/test_flyway_guard.py
git commit -m "feat(flyway-guard): find_duplicates 중복 버전 탐지"
```

---

## Task 3: `is_timestamp_version` — 14자리 타임스탬프 판별 (TDD)

**Files:**
- Modify: `synapse-shared/scripts/flyway_guard.py`
- Test: `synapse-shared/scripts/test_flyway_guard.py`

- [ ] **Step 1: 실패하는 테스트 추가**

```python
def test_is_timestamp_version_true_for_14_digits():
    assert fg.is_timestamp_version("20260605120000") is True


def test_is_timestamp_version_false_for_integer():
    assert fg.is_timestamp_version("28") is False


def test_is_timestamp_version_false_for_wrong_length():
    assert fg.is_timestamp_version("202606051200") is False  # 12자리


def test_is_timestamp_version_false_for_non_digits():
    assert fg.is_timestamp_version("2026060512000X") is False
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: FAIL — `AttributeError: ... 'is_timestamp_version'`

- [ ] **Step 3: 구현 추가**

`flyway_guard.py`에 추가:

```python
TIMESTAMP_LEN = 14


def is_timestamp_version(token):
    """14자리 숫자(yyyyMMddHHmmss)면 True."""
    return token.isdigit() and len(token) == TIMESTAMP_LEN
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: PASS (11 passed)

- [ ] **Step 5: 커밋**

```bash
cd synapse-shared
git add scripts/flyway_guard.py scripts/test_flyway_guard.py
git commit -m "feat(flyway-guard): is_timestamp_version 14자리 판별"
```

---

## Task 4: `main` — 파일시스템 스캔 + 중복 검사 + 종료코드 (TDD)

**Files:**
- Modify: `synapse-shared/scripts/flyway_guard.py`
- Test: `synapse-shared/scripts/test_flyway_guard.py`

`build/`, `node_modules/` 등 빌드 산출물은 스캔에서 제외한다(src와 동일 버전 파일이 복제되어 거짓 중복을 만들기 때문).

- [ ] **Step 1: 실패하는 테스트 추가**

```python
def _make_migration(root, rel, content="-- sql\n"):
    import os
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)


def test_main_passes_on_unique(tmp_path):
    _make_migration(str(tmp_path), "src/main/resources/db/migration/V1__a.sql")
    _make_migration(str(tmp_path), "src/main/resources/db/migration/V2__b.sql")
    assert fg.main(["--root", str(tmp_path)]) == 0


def test_main_fails_on_duplicate(tmp_path):
    _make_migration(str(tmp_path), "src/main/resources/db/migration/V28__a.sql")
    _make_migration(str(tmp_path), "src/main/resources/db/migration/V28__b.sql")
    assert fg.main(["--root", str(tmp_path)]) == 1


def test_main_ignores_build_dir(tmp_path):
    _make_migration(str(tmp_path), "src/main/resources/db/migration/V1__a.sql")
    _make_migration(str(tmp_path), "build/resources/main/db/migration/V1__a.sql")
    assert fg.main(["--root", str(tmp_path)]) == 0
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: FAIL — `AttributeError: ... 'main'`

- [ ] **Step 3: 구현 추가**

`flyway_guard.py`에 추가(상단 import에 `argparse`, `sys` 보강):

```python
import argparse
import sys

EXCLUDE_DIRS = {".git", "build", "out", "target", "node_modules", "_mirror", ".gradle"}


def is_migration_path(path):
    return "db/migration" in path.replace(os.sep, "/")


def scan_migrations(root):
    """root 아래 db/migration 경로의 V*.sql 마이그레이션 상대경로 목록(빌드 산출물 제외)."""
    found = []
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.startswith("V") and f.endswith(".sql"):
                rel = os.path.relpath(os.path.join(dirpath, f), root)
                if is_migration_path(rel):
                    found.append(rel.replace(os.sep, "/"))
    return found


def main(argv=None):
    ap = argparse.ArgumentParser(description="Flyway migration guard")
    ap.add_argument("--root", default=".")
    ap.add_argument("--base-ref", default=None)
    args = ap.parse_args(argv)

    errors = []
    migrations = scan_migrations(args.root)
    for version, paths in sorted(find_duplicates(migrations).items()):
        errors.append(
            "[duplicate-version] version {} used by: {}".format(version, ", ".join(paths))
        )

    if errors:
        print("Flyway guard FAILED:")
        for e in errors:
            print("  - " + e)
        return 1
    print("Flyway guard OK ({} migrations, no violations).".format(len(migrations)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: PASS (14 passed)

- [ ] **Step 5: 실제 platform-svc 트리에 수동 검증(충돌 재현)**

Run: `cd synapse-shared/scripts && python flyway_guard.py --root ../../synapse-platform-svc`
Expected: 종료코드 1, 출력에 `[duplicate-version] version 28 used by: ...V28__allow_multiple_refresh_tokens.sql, ...V28__rename_oauth_provider_id_column.sql`

- [ ] **Step 6: 커밋**

```bash
cd synapse-shared
git add scripts/flyway_guard.py scripts/test_flyway_guard.py
git commit -m "feat(flyway-guard): main 스캔+중복검사+종료코드(빌드 디렉터리 제외)"
```

---

## Task 5: `main` — base-ref 기반 신규 타임스탬프 강제 + 기머지 불변성 (TDD)

**Files:**
- Modify: `synapse-shared/scripts/flyway_guard.py`
- Test: `synapse-shared/scripts/test_flyway_guard.py`

`--base-ref` 가 주어지면 `git diff --name-status <base> HEAD` 로 변경을 분류한다.
추가(A)된 마이그레이션은 14자리 타임스탬프여야 하고, 기존(머지된) 마이그레이션의 수정(M)·삭제(D)는 위반.

- [ ] **Step 1: 실패하는 테스트 추가**

```python
import subprocess


def _git(root, *args):
    subprocess.run(
        ["git", "-c", "user.email=t@t", "-c", "user.name=t", "-C", root, *args],
        check=True, capture_output=True,
    )


def _init_repo_with_base(tmp_path):
    root = str(tmp_path)
    _git(root, "init", "-q")
    _make_migration(root, "src/main/resources/db/migration/V1__base.sql")
    _git(root, "add", "-A")
    _git(root, "commit", "-q", "-m", "base")
    base = subprocess.run(
        ["git", "-C", root, "rev-parse", "HEAD"], capture_output=True, text=True
    ).stdout.strip()
    return root, base


def test_main_fails_when_new_migration_not_timestamp(tmp_path):
    root, base = _init_repo_with_base(tmp_path)
    _make_migration(root, "src/main/resources/db/migration/V2__bad.sql")
    _git(root, "add", "-A")
    _git(root, "commit", "-q", "-m", "add bad")
    assert fg.main(["--root", root, "--base-ref", base]) == 1


def test_main_passes_when_new_migration_is_timestamp(tmp_path):
    root, base = _init_repo_with_base(tmp_path)
    _make_migration(root, "src/main/resources/db/migration/V20260605120000__ok.sql")
    _git(root, "add", "-A")
    _git(root, "commit", "-q", "-m", "add ok")
    assert fg.main(["--root", root, "--base-ref", base]) == 0


def test_main_fails_when_merged_migration_modified(tmp_path):
    root, base = _init_repo_with_base(tmp_path)
    _make_migration(root, "src/main/resources/db/migration/V1__base.sql", content="-- changed\n")
    _git(root, "add", "-A")
    _git(root, "commit", "-q", "-m", "mutate base")
    assert fg.main(["--root", root, "--base-ref", base]) == 1
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: FAIL — base-ref 분기가 없어 `test_main_fails_when_new_migration_not_timestamp` 등이 0을 반환

- [ ] **Step 3: 구현 추가**

`flyway_guard.py` 상단 import에 `subprocess` 추가하고 함수 추가:

```python
import subprocess


def changed_migrations(root, base_ref):
    """(status, path) 리스트. db/migration 경로의 V*.sql 변경만."""
    out = subprocess.check_output(
        ["git", "-C", root, "diff", "--name-status", base_ref, "HEAD"],
        text=True,
    )
    result = []
    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) < 2:
            continue
        status, path = parts[0], parts[-1]
        base = os.path.basename(path)
        if base.startswith("V") and base.endswith(".sql") and is_migration_path(path):
            result.append((status, path))
    return result
```

그리고 `main()` 의 중복 검사 직후, `if errors:` 블록 **앞**에 추가:

```python
    if args.base_ref:
        for status, path in changed_migrations(args.root, args.base_ref):
            version = parse_version(path)
            if status.startswith("A"):
                if version is not None and not is_timestamp_version(version):
                    errors.append(
                        "[non-timestamp-new] 추가된 마이그레이션은 14자리 타임스탬프 버전이어야 함: "
                        "{} (got V{})".format(path, version)
                    )
            elif status.startswith("M") or status.startswith("D"):
                errors.append(
                    "[mutated-migration] 이미 머지된 마이그레이션 변경({}): {}".format(status, path)
                )
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd synapse-shared/scripts && python -m pytest test_flyway_guard.py -q`
Expected: PASS (17 passed)

- [ ] **Step 5: 커밋**

```bash
cd synapse-shared
git add scripts/flyway_guard.py scripts/test_flyway_guard.py
git commit -m "feat(flyway-guard): base-ref 기반 신규 타임스탬프 강제+기머지 불변성 검사"
```

---

## Task 6: 재사용 workflow `flyway-guard.yml` (synapse-shared)

**Files:**
- Create: `synapse-shared/.github/workflows/flyway-guard.yml`

- [ ] **Step 1: workflow 작성**

`synapse-shared/.github/workflows/flyway-guard.yml`:

```yaml
name: Flyway Guard (reusable)

on:
  workflow_call: {}

permissions:
  contents: read

jobs:
  flyway-guard:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout caller repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Checkout synapse-shared (guard script)
        uses: actions/checkout@v4
        with:
          repository: team-project-final/synapse-shared
          ref: main
          path: _shared

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Determine base ref
        id: base
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            git fetch origin "${{ github.base_ref }}"
            echo "ref=origin/${{ github.base_ref }}" >> "$GITHUB_OUTPUT"
          else
            echo "ref=" >> "$GITHUB_OUTPUT"
          fi

      - name: Run Flyway guard
        run: |
          if [ -n "${{ steps.base.outputs.ref }}" ]; then
            python _shared/scripts/flyway_guard.py --root . --base-ref "${{ steps.base.outputs.ref }}"
          else
            python _shared/scripts/flyway_guard.py --root .
          fi
```

- [ ] **Step 2: YAML 문법 검증**

Run: `cd synapse-shared && python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/flyway-guard.yml',encoding='utf-8')); print('yaml ok')"`
Expected: `yaml ok`

- [ ] **Step 3: 커밋**

```bash
cd synapse-shared
git add .github/workflows/flyway-guard.yml
git commit -m "ci(flyway-guard): 재사용 workflow 추가(workflow_call)"
```

> 참고: `_shared` 경로 체크아웃은 caller repo 트리(`.`)와 분리되어 가드 스크립트만 가져온다. caller 트리의 `db/migration`이 검사 대상이다.

---

## Task 7: 표준 문서 `docs/rules/12-flyway-migration.md` (synapse-shared)

**Files:**
- Create: `synapse-shared/docs/rules/12-flyway-migration.md`

- [ ] **Step 1: 표준 문서 작성**

`synapse-shared/docs/rules/12-flyway-migration.md`:

```markdown
# 12. Flyway 마이그레이션 버전 규칙

> 적용일(cutover): 2026-06-05 · 적용 대상: 모든 Java 서비스(platform/knowledge/learning/engagement)

## 규칙

1. **신규 마이그레이션 버전 = 14자리 타임스탬프**
   - 형식: `V<yyyyMMddHHmmss>__<설명>.sql` (예: `V20260605120000__add_user_status.sql`)
   - 버전 토큰은 **순수 14자리 숫자**. 문자(`T` 등)·구분기호 금지(Flyway 버전 파서 호환).
   - 타임스탬프는 기존 정수(max 32)보다 항상 크므로 Flyway가 자연히 뒤로 정렬 → 기존 파일 재번호 불필요.

2. **기존 정수 `Vn` 파일은 변경·재번호·삭제 금지** (checksum 안정성).

3. **Flyway 설정 표준(application.yml `spring.flyway`)**
   - `out-of-order: true` (늦게 머지된 더 이른 타임스탬프 적용 허용)
   - `baseline-on-migrate`: 서비스 현실대로 **명시**(learning=true, 그 외=false)
   - `locations`: 서비스 현행 유지(engagement 멀티 location 허용 — 타임스탬프로 충돌 자동 방지)

4. **CI 가드(차단)**: 모든 PR에서 `Flyway Guard` 가 실행되어 아래를 위반하면 **fail**:
   - 동일 버전 토큰 2개 이상(중복 버전)
   - 추가된 마이그레이션이 14자리 타임스탬프가 아님
   - 이미 머지된 마이그레이션 파일의 수정/삭제

## 새 마이그레이션 만들 때

타임스탬프는 생성 시각으로 직접 기입한다. 예시 생성 명령:

\`\`\`bash
echo "V$(date +%Y%m%d%H%M%S)__describe_change.sql"
\`\`\`
```

- [ ] **Step 2: 커밋**

```bash
cd synapse-shared
git add docs/rules/12-flyway-migration.md
git commit -m "docs(rules): 12-flyway-migration 버전 표준 추가"
```

---

## Task 8: 롤아웃 요청서(이슈 본문) 작성 (synapse-shared)

각 서비스 repo에 등록할 GitHub 이슈의 본문 원본을 docs에 둔다. platform 섹션에 V28 rename 포함.

**Files:**
- Create: `synapse-shared/docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md`

- [ ] **Step 1: 롤아웃 요청서 작성**

`synapse-shared/docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md`:

````markdown
# 수정 요청: Flyway 마이그레이션 버전 표준 적용

> 작성일: 2026-06-05 · 우선순위: platform-svc High(충돌 존재), 그 외 Medium
> 표준 문서: synapse-shared `docs/rules/12-flyway-migration.md`
> 모든 작업은 **전용 브랜치 → 커밋 → 푸쉬 → PR** 로 진행할 것.

## 공통 작업(4개 서비스 전부)

### 1) caller workflow 추가
`.github/workflows/flyway-guard.yml`:

```yaml
name: Flyway Guard
on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]
jobs:
  guard:
    uses: team-project-final/synapse-shared/.github/workflows/flyway-guard.yml@main
```

### 2) `src/main/resources/application.yml` 의 `spring.flyway` 표준화
`out-of-order: true` 추가, `baseline-on-migrate` 명시. 서비스별 목표 블록은 아래 각 섹션 참조.

---

## platform-svc (우선순위 High)

**(a) V28 중복 해소** — `src/main/resources/db/migration/` 에 동일 V28이 2개 존재:
- `V28__allow_multiple_refresh_tokens.sql` (이미 머지됨, 변경 금지)
- `V28__rename_oauth_provider_id_column.sql` (**untracked, 미머지**) → **타임스탬프로 rename**

```bash
cd src/main/resources/db/migration
git mv V28__rename_oauth_provider_id_column.sql "V$(date +%Y%m%d%H%M%S)__rename_oauth_provider_id_column.sql"
# 예: V20260605120000__rename_oauth_provider_id_column.sql
```

**(b) flyway 블록** (현재 `enabled: true` 만 있음) →

```yaml
  flyway:
    enabled: true
    out-of-order: true
    baseline-on-migrate: false
```

---

## knowledge-svc

현재 main `application.yml` 에 flyway 블록 없음(기본값 사용) → `spring:` 하위에 추가:

```yaml
  flyway:
    enabled: true
    out-of-order: true
    baseline-on-migrate: false
```

---

## learning-svc (learning-card)

기존 블록에 `out-of-order: true` 만 추가(나머지 유지):

```yaml
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    out-of-order: true
```

---

## engagement-svc

기존 멀티 location 유지하고 `out-of-order`·`baseline-on-migrate` 추가:

```yaml
  flyway:
    out-of-order: true
    baseline-on-migrate: false
    locations:
      - classpath:db/migration/community/group
      - classpath:db/migration/community/group/member
      - classpath:db/migration/community/report
      - classpath:db/migration/community/share
      - classpath:db/migration/gamification/xp
```

## 검증
PR 생성 시 `Flyway Guard` 체크가 green 이어야 머지 가능.
````

- [ ] **Step 2: 커밋**

```bash
cd synapse-shared
git add docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md
git commit -m "docs(fix-requests): Flyway 표준 롤아웃 요청서(4서비스, platform V28 rename 포함)"
```

---

## Task 9: synapse-shared 푸쉬 + PR 생성

**Files:** 없음(git/PR)

- [ ] **Step 1: 푸쉬**

```bash
cd synapse-shared
git push -u origin feat/flyway-guard
```

- [ ] **Step 2: PR 생성 (base: main)**

```bash
cd synapse-shared
gh pr create --base main --head feat/flyway-guard \
  --title "feat: Flyway 마이그레이션 충돌 가드(스크립트+재사용 workflow+표준)" \
  --body "docs/superpowers/specs/2026-06-05-flyway-history-conflict-design.md 기반.
- scripts/flyway_guard.py + tests (중복 버전/신규 타임스탬프/기머지 불변성)
- .github/workflows/flyway-guard.yml (reusable)
- docs/rules/12-flyway-migration.md
- docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md (4서비스 롤아웃, platform V28 rename)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: PR URL 확인 후 머지 대기**

Run: `gh pr view --json url,state -q '.url + " " + .state'`
Expected: PR URL + `OPEN` (머지는 리뷰 후 별도 진행)

---

## Task 10: 서비스 repo GitHub 이슈 등록 (outward-facing — 사용자 승인 후)

> [[repo-edit-scope-policy]]: 서비스 repo는 직접 수정하지 않고 이슈로 요청. 이슈 본문은 Task 8 문서를 사용한다.
> 외부로 나가는 작업이므로 **실행 전 사용자에게 확인**한다.

- [ ] **Step 1: platform-svc 이슈(High, V28 rename 포함)**

```bash
gh issue create --repo team-project-final/synapse-platform-svc \
  --title "[Flyway] V28 중복 해소 + 버전 표준 적용" \
  --body "synapse-shared docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md 의 'platform-svc' 섹션 + '공통 작업' 수행 요청.
핵심: untracked V28__rename_oauth_provider_id_column.sql 를 타임스탬프로 rename, caller workflow 추가, flyway out-of-order:true. 브랜치→PR 로 진행."
```

- [ ] **Step 2: 나머지 3개 서비스 이슈(롤아웃만)**

```bash
for repo in synapse-knowledge-svc synapse-learning-svc synapse-engagement-svc; do
  gh issue create --repo "team-project-final/$repo" \
    --title "[Flyway] 마이그레이션 버전 표준 적용" \
    --body "synapse-shared docs/fix-requests/FLYWAY-STANDARD_ROLLOUT.md 의 해당 서비스 섹션 + '공통 작업' 수행 요청(caller workflow + flyway out-of-order). 브랜치→PR 로 진행."
done
```

- [ ] **Step 3: 등록된 이슈 확인**

Run: `gh issue list --repo team-project-final/synapse-platform-svc --search "Flyway"`
Expected: 방금 생성한 이슈가 목록에 표시됨

---

## Self-Review (작성자 체크리스트 결과)

- **Spec 커버리지:** A(진단)=Task 4 Step5에서 실제 충돌 재현 + 표준 문서 §원인. B(표준)=Task 5(타임스탬프/불변성)+Task 6(CI 차단)+Task 7(문서). C(해소/롤아웃)=Task 8(롤아웃·V28 rename)+Task 10(이슈). 누락 없음.
- **Placeholder:** 모든 코드/YAML/이슈 본문 실제 내용 기재. `HHmmss`/`yyyyMMddHHmmss`는 의도된 형식 토큰(생성 시 `date +%Y%m%d%H%M%S`로 산출).
- **타입/이름 일관성:** `parse_version`/`find_duplicates`/`is_timestamp_version`/`is_migration_path`/`scan_migrations`/`changed_migrations`/`main` 시그니처가 정의 Task와 사용 Task에서 일치. 모듈명 `flyway_guard`, 테스트 import 동일.
- **브랜치/PR 구조:** Task 0(브랜치)→커밋(Task1~8)→푸쉬+PR(Task9)→서비스 이슈(Task10). synapse-shared PR base=main(dev 없음). 서비스는 직접수정 없이 이슈.
```
