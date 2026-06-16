# CI/CD 실패 수정 설계 — 전체 -svc 레포

> 대상: `team-project-final` org의 모든 -svc 레포
> 각 레포 수정 → fix 브랜치 → dev PR

## 배경

PR #6 (synapse-learning-svc, dev → main) 실패 3건을 기점으로 전체 -svc 레포를 감사한 결과:

| 레포 | 상태 | 문제 |
|------|------|------|
| synapse-learning-svc | **실패 3건** | gradlew 경로 문제 (exit 127), 워크플로우 중복, ruff 린트 위반 |
| synapse-engagement-svc | **실패** | gradlew 실행 권한 `100644` (exit 126) |
| synapse-knowledge-svc | **잠재 위험** | gradlew `100644` — setup-gradle@v4가 우연히 권한 부여해서 통과 중 |
| synapse-platform-svc | **정상** | gradlew `100755`, CI 전부 통과 |

## 결정 사항

- 문제 있는 3개 레포 수정, platform-svc는 건너뜀
- 각 레포에 `fix/ci-workflow` 브랜치 생성 → dev로 PR
- synapse-learning-svc는 접근법 B (통합 + 수정) 적용

## 레포별 변경 범위

### 1. synapse-learning-svc (가장 큰 변경)

**1-1. 워크플로우 통합 — ci-java.yml 삭제 + ci.yml 강화**

ci-java.yml 삭제:
- ci.yml의 build-java job과 완전 중복 (같은 트리거, 같은 브랜치)
- ci.yml이 paths-filter로 더 스마트하게 동작하므로 상위호환

ci.yml의 build-java job 수정:
- `defaults.run.working-directory: learning-card` 추가
- `chmod +x gradlew` 스텝 추가
- ci-java.yml에서 Modulith verify 스텝 병합

수정 후 build-java job:
```yaml
build-java:
  needs: detect-changes
  if: needs.detect-changes.outputs.java == 'true'
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: learning-card
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        distribution: temurin
        java-version: '21'
    - uses: gradle/actions/setup-gradle@v4
    - name: Grant execute permission
      run: chmod +x gradlew
    - name: Build & Test
      run: ./gradlew build --no-daemon
    - name: Modulith verify
      run: ./gradlew test --tests '*ModuleStructureTest' --no-daemon
```

**1-2. Python ruff 린트 위반 수정**

- `ruff check .` → 위반 목록 확인
- `ruff check --fix .` → 자동 수정 (import 정렬, 불필요 import 등)
- 자동 수정 불가 항목은 수동 수정
- B, SIM 규칙의 --fix 결과는 diff 확인 후 적용
- ruff 수정 후 `mypy app`도 통과 확인

build-python job 구조는 변경 없음 (working-directory 이미 올바름).

**1-3. paths-filter 범위 보정**

현재 detect-changes의 java 필터에 루트 레벨 dead filter 제거:
```yaml
# before
java:
  - 'learning-card/**'
  - 'build.gradle.kts'      # 루트에 없음
  - 'settings.gradle.kts'   # 루트에 없음
  - 'gradle/**'             # 루트에 없음

# after
java:
  - 'learning-card/**'
```

### 2. synapse-engagement-svc

**2-1. gradlew 실행 권한 수정**

ci-java.yml에 `chmod +x gradlew` 스텝 추가:
```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
  - name: Setup Java 21
    uses: actions/setup-java@v4
    with:
      distribution: temurin
      java-version: '21'
      cache: gradle
  - name: Grant execute permission
    run: chmod +x gradlew
  - name: Build
    run: ./gradlew clean build --no-daemon
  - name: Modulith verify
    run: ./gradlew test --tests '*ModuleStructureTest' --no-daemon
```

또한 git에서 gradlew 파일 권한을 `100755`로 영구 수정:
```bash
git update-index --chmod=+x gradlew
```

### 3. synapse-knowledge-svc

**3-1. gradlew 실행 권한 예방 수정**

현재 CI가 통과하고 있지만 gradlew가 `100644`로 되어 있어 불안정.

동일하게 두 가지 수정:
- ci-java.yml에 `chmod +x gradlew` 스텝 추가
- `git update-index --chmod=+x gradlew`로 권한 영구 수정

## 변경하지 않는 것

- synapse-platform-svc — 정상, 수정 불필요
- Node.js 20 deprecation — 2026-06-02까지 여유, 별도 작업
- deploy.yml, mirror.yml, parse-workflow.yml — 이번 범위 밖
- 다른 레포(synapse-shared, synapse-gitops 등) — 이번 범위 밖

## 파일 변경 요약

| 레포 | 파일 | 변경 |
|------|------|------|
| learning-svc | `.github/workflows/ci-java.yml` | 삭제 |
| learning-svc | `.github/workflows/ci.yml` | build-java에 working-directory + chmod + Modulith verify 추가, paths-filter 정리 |
| learning-svc | `learning-ai/**/*.py` | ruff 위반 수정 |
| engagement-svc | `.github/workflows/ci-java.yml` | chmod +x gradlew 스텝 추가 |
| engagement-svc | `gradlew` | git 파일 모드 100644 → 100755 |
| knowledge-svc | `.github/workflows/ci-java.yml` | chmod +x gradlew 스텝 추가 |
| knowledge-svc | `gradlew` | git 파일 모드 100644 → 100755 |

## 브랜치 / PR 전략

각 레포에서:
1. dev 브랜치에서 `fix/ci-workflow` 브랜치 생성
2. 수정 커밋
3. dev로 PR 생성

## 검증 방법

1. **learning-svc**: 로컬에서 `ruff check .` + `mypy app` 통과 확인 후 PR의 GitHub Actions 전체 check 통과 확인
2. **engagement-svc**: PR에서 "CI — Java (Gradle)" 워크플로우 통과 확인
3. **knowledge-svc**: PR에서 기존 통과 상태 유지 확인
4. 각 레포에서 ci-java.yml 변경/삭제 후 의도대로 트리거되는지 확인
