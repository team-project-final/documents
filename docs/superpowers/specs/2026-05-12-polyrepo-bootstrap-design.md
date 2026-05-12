# 폴리레포 부트스트랩 설계서 — team-project-final 실 GitHub 셋업

> **작성일**: 2026-05-12 (W1 시작일)
> **상태**: Completed (2026-05-12 부트스트랩 실행 완료, 8개 레포 동작 검증)
> **선행 결정**: `09_Git_규칙_정의서` v2.0 (4-서비스 폴리레포 + 미러 + GitOps + Schema Registry 확정)
> **목적**: 09 v2.0 §C1 Day 1 셋업 체크리스트를 실제 `team-project-final` org에 실행하는 부트스트랩 계획 정의

---

## 0. 이 문서의 위치

09 v2.0이 **"폴리레포는 어떻게 생겼고 어떤 규칙으로 운영되는가"** 를 정의했다. 본 문서는 그 정의를 받아 **"실제 `team-project-final` org에 무엇을 어떤 순서로 만들 것인가"** 를 정의한다. 부트스트랩이 끝난 시점에 09 §C1의 GitHub / 워크플로 / 첫 코드 세 그룹이 완료 상태가 되고, 인프라 그룹(AWS EKS / RDS / MSK 등)은 별도 작업으로 분리된다.

09 자체는 본 문서로 인해 갱신되지 않는다. 본 문서는 09를 실행하는 도구이고 본문 정정 사유가 없다.

---

## 1. 부트스트랩 목표와 3-Phase 흐름

### 1.1 종료 시 검증되는 3가지

1. 8개 레포가 09 §B1 인벤토리대로 존재하고 branch protection이 켜져 있다.
2. Tier 1 6개 서비스 중 어떤 레포에 push 하면 `synapse-mirror`에 자동 동기화된다.
3. Tier 1 5개 백엔드 서비스 push 시 `synapse-gitops`의 image tag bump step이 트리거된다 (실제 ECR push는 W2 이후, 부트스트랩 시점에는 `secrets.ECR_REGISTRY` 가드로 skip되는 게 정상).

### 1.2 3-Phase 흐름

```
Phase 1: 레포 + 보호 설정          Phase 2: 워크플로 + secrets         Phase 3: 코드 골격 + 검증
─────────────────────────          ──────────────────────────         ─────────────────────────
 8개 레포 생성                       PAT 환경변수 확인                  Spring Boot 4 골격 × 4
 visibility / license / topics      6 repos × 2 tokens secrets 등록    FastAPI 골격 × 1
 main branch protection             mirror.yml × 6 (Tier 1)             Flutter 골격 × 1
 CODEOWNERS commit                  ci.yml + deploy.yml × 5            Avro 첫 스키마 1개
 .gitignore + .editorconfig         schema-check.yml × 1 (shared)      Modulith 모듈 선언
 README + LICENSE                   SECRETS.md × 6                     첫 commit push
                                                                       mirror/gitops 첫 run 검증
       ▼ Gate 1                            ▼ Gate 2                            ▼ Gate 3
   gh repo list 8개 확인            gh secret list 12개 확인          Actions tab + mirror 디렉토리 확인
```

### 1.3 산출물

| 산출물 | 위치 |
|---|---|
| 8개 GitHub 레포 | `team-project-final/synapse-*` |
| 멱등 부트스트랩 스크립트 3개 | `syn/scripts/bootstrap/{phase1,phase2,phase3}.sh` |
| Phase별 실행 보고서 (markdown) | `syn/scripts/bootstrap/reports/{phase}-YYYY-MM-DD.md` |
| 본 설계 문서 | `syn/docs/superpowers/specs/2026-05-12-polyrepo-bootstrap-design.md` |

### 1.4 사전 조건

- `gh auth status` 정상 (계정 `VelkaressiaBlutkrone`)
- `team-project-final` org에 admin 권한 (확인 완료)
- 토큰 스코프: `repo`, `workflow`, `read:org` (Phase 1 branch protection 실패 시 `gh auth refresh -s admin:org` 1회로 보강)
- 본 부트스트랩 시점에 `team-project-final` org에는 `documents` 레포만 존재한다고 가정

---

## 2. 레포 카탈로그

### 2.1 레포 8개 명세

| # | 레포 | Tier | Visibility | 트랙 매핑 (W1 임시 단일 owner) | 첫 commit 산출물 |
|---|---|:---:|:---:|---|---|
| 1 | `synapse-platform-svc` | 1 | public | `@VelkaressiaBlutkrone` | Spring Boot 4 + Modulith 4 모듈 (auth/audit/billing/notification) |
| 2 | `synapse-engagement-svc` | 1 | public | `@VelkaressiaBlutkrone` | Spring Boot 4 + Modulith 2 모듈 (community/gamification) |
| 3 | `synapse-knowledge-svc` | 1 | public | `@VelkaressiaBlutkrone` | Spring Boot 4 + Modulith 3 모듈 (note/graph/chunking) |
| 4 | `synapse-learning-svc` | 1 | public | `@VelkaressiaBlutkrone` | Gradle multi-project (Java) + `learning-ai/` (Python/FastAPI) |
| 5 | `synapse-frontend` | 1 | public | `@VelkaressiaBlutkrone` | Flutter 3 + GoRouter + Riverpod 골격 |
| 6 | `synapse-shared` | 1 | public | `@VelkaressiaBlutkrone` | Avro 빌드 플러그인 + `UserRegistered.avsc` |
| 7 | `synapse-mirror` | 2 | private | `@VelkaressiaBlutkrone` (Action만 write) | README 큰 경고 + `services/.gitkeep` |
| 8 | `synapse-gitops` | 3 | private | `@VelkaressiaBlutkrone` | `apps/` 5개 서비스 base + dev/staging/prod overlay + `argocd/applicationset.yaml` + `RELEASE_NOTES.md` |

### 2.2 모든 레포 공통 설정

| 항목 | 값 |
|---|---|
| Default branch | `main` |
| License | MIT (Tier 1·shared·frontend), 없음 (mirror/gitops — private) |
| Topics | `synapse` + 도메인 키워드 (예: platform-svc → `synapse, auth, billing, spring-boot, java`) |
| Description | "Synapse — {도메인 한 줄 요약}" |
| Issues | 활성화 |
| Projects | 활성화 |
| Wiki | 비활성화 (위키는 `documents.wiki` 분리) |
| Merge button | Squash and merge만 허용 (Tier 1·shared), Merge commit 추가 허용 (gitops — hotfix용) |
| Auto-delete head branches | 활성화 |
| Allow force push to main | 차단 |
| Allow deletion of main | 차단 |

### 2.3 Branch protection — main

| 규칙 | Tier 1 + shared + frontend | mirror | gitops |
|---|:---:|:---:|:---:|
| Require pull request | ✓ | ✗ (Action push only) | ✓ |
| Require approvals | 1 (W1 임시, 팀 합류 후 09 §A3 정책대로 2로 상향) | — | 1 |
| Dismiss stale reviews | ✓ | — | ✓ |
| Require review from CODEOWNERS | ✓ | — | ✓ |
| Require status checks | ✓ (Phase 3 후 활성화) | ✗ | ✓ (`validate-manifests`) |
| Require branches up to date | ✓ | — | ✓ |
| Require linear history | ✓ | — | ✗ (hotfix merge commit 허용) |
| Block force push | ✓ | ✓ | ✓ |
| Restrict deletions | ✓ | ✓ | ✓ |
| Enforce for admins | ✗ (부트스트랩 동안 임시), Phase 3 종료 시 ✓ | ✗ | ✗ |

### 2.4 CODEOWNERS — 초기 (W1 임시)

8개 레포 모두 동일한 단일 라인:
```
*  @VelkaressiaBlutkrone
```

팀 합류 후 첫 PR(`feature/INFRA-002-codeowners-trackmap`)로 09 §A4 트랙별 매핑으로 갱신. 본 부트스트랩은 그 PR을 만들 수 있는 "쓸 수 있는 main"을 확보하는 게 목적.

### 2.5 `.gitignore` — 트랙별 차등

공통: `.idea/`, `.vscode/`, `.env*`, `*.key`, `*.pem`, `secrets/`, `.DS_Store`.

| 트랙 | 추가 항목 |
|---|---|
| Java (platform/engagement/knowledge/learning-card/shared) | `build/`, `.gradle/`, `target/`, `HELP.md`, `src/main/generated-sources/` |
| Python (learning-ai) | `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `.mypy_cache/` |
| Flutter (frontend) | `.dart_tool/`, `.flutter-plugins*`, `build/` |
| K8s/AWS (gitops) | `*.kubeconfig`, `*.sops.yaml` |

---

## 3. Phase 1 — 레포 + 보호 설정

### 3.1 산출물

`syn/scripts/bootstrap/phase1.sh` — 멱등 (기존 레포는 skip). 예상 소요: 5분 자동 + 2분 사용자 확인.

### 3.2 레포 생성 (8회 반복)

```bash
gh repo create team-project-final/synapse-platform-svc \
  --public \
  --description "Synapse — platform services (auth/audit/billing/notification)" \
  --license mit \
  --add-readme=false \
  --disable-wiki

gh repo edit team-project-final/synapse-platform-svc \
  --enable-issues=true \
  --enable-projects=true \
  --enable-wiki=false \
  --enable-merge-commit=false \
  --enable-squash-merge=true \
  --enable-rebase-merge=false \
  --delete-branch-on-merge=true \
  --add-topic synapse \
  --add-topic auth \
  --add-topic billing \
  --add-topic spring-boot \
  --add-topic java
```

멱등 가드: `gh repo view team-project-final/{name} >/dev/null 2>&1 && echo "exists, skip"`.

mirror/gitops는 `--private`, license 없음, topics 일부 차이.

### 3.3 초기 commit

```bash
gh repo clone team-project-final/synapse-platform-svc /tmp/bootstrap/platform-svc
cd /tmp/bootstrap/platform-svc

# README.md (간단한 한 페이지)
# .gitignore (트랙별 템플릿)
# .editorconfig (09 §A6 + Spring 컨벤션 §2.5)
# CODEOWNERS
mkdir -p .github
echo "*  @VelkaressiaBlutkrone" > .github/CODEOWNERS

git add .
git commit -m "chore(infra): initialize repo (PLAT-001)"
git push -u origin main
```

mirror 레포의 README는 다음과 같이 큰 경고를 둔다:

```markdown
# synapse-mirror

⚠️ **DO NOT COMMIT DIRECTLY** — This repo is auto-synced by GitHub Actions
from all Tier 1 service repos. Any direct commit will be **overwritten**
on the next sync.

Edit the source repo instead.
```

### 3.4 Branch protection 설정

```bash
gh api -X PUT repos/team-project-final/synapse-platform-svc/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
```

mirror는 PR 강제 ✗, force push 차단만. gitops는 PR 강제 ✓, linear history ✗.

`enforce_admins: false`는 부트스트랩 동안 본인이 main에 직접 push할 수 있게 하는 임시 설정. Phase 3 종료 시 `true`로 전환된다.

### 3.5 Gate 1 검증

```bash
gh repo list team-project-final --limit 20 --json name,visibility,isPrivate \
  --jq '.[] | select(.name | startswith("synapse-"))'

for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared \
            synapse-mirror synapse-gitops; do
  echo "=== $repo ==="
  gh api repos/team-project-final/$repo/branches/main/protection \
    --jq '.required_pull_request_reviews.required_approving_review_count // "n/a"'
done
```

기대 출력: 8개 레포가 visibility 정확히 나오고, 6개에 `1`, mirror에 `n/a`, gitops에 `1`.

---

## 4. Phase 2 — PAT + 워크플로 + secrets

### 4.1 산출물

`syn/scripts/bootstrap/phase2.sh` — 멱등 (기존 secrets는 overwrite). 예상 소요: 사용자 PAT 발급 10분 + 우리 셋업 5분 + Gate 2 확인 3분.

### 4.2 사용자 작업 — PAT 발급 (web)

09 §B6 정책을 그대로 따른다.

**MIRROR_TOKEN**:
1. https://github.com/settings/personal-access-tokens/new
2. Token name: `synapse-mirror-token-2026-05`
3. Resource owner: `team-project-final` (org)
4. Expiration: 90일 (2026-08-10)
5. Repository access: **Only select repositories** → `synapse-mirror` 1개
6. Repository permissions: Contents = **Read and write**, Metadata = Read (자동)
7. Generate token → 값 복사

**GITOPS_TOKEN**: 같은 절차, 다른 이름/대상:
- Token name: `synapse-gitops-token-2026-05`
- Repository access: `synapse-gitops` 1개

### 4.3 환경변수 export

PowerShell:
```powershell
$env:MIRROR_TOKEN = "github_pat_xxxxx"
$env:GITOPS_TOKEN = "github_pat_xxxxx"
```

bash:
```bash
export MIRROR_TOKEN=github_pat_xxxxx
export GITOPS_TOKEN=github_pat_xxxxx
```

우리는 토큰 값을 직접 출력하는 명령을 만들지 않는다. 환경변수 참조만 사용한다.

### 4.4 secrets 등록 (12건 = 6 repos × 2 tokens)

```bash
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  gh secret set MIRROR_TOKEN --repo team-project-final/$repo --body "$MIRROR_TOKEN"
  gh secret set GITOPS_TOKEN --repo team-project-final/$repo --body "$GITOPS_TOKEN"
done
```

mirror/gitops 자기 자신은 token 불필요 (push 받는 쪽).

### 4.5 워크플로 파일 commit

| 레포 | 워크플로 파일 |
|---|---|
| Tier 1 6개 | `.github/workflows/mirror.yml` (09 §B2 풀 YAML 그대로) |
| Tier 1 5개 (platform/engagement/knowledge/learning/shared — Java 빌드 + 컨테이너 산출물) | `.github/workflows/ci.yml` + `deploy.yml` |
| `learning-svc` | `paths-filter` 분기로 Java/Python sub-tree CI 분리 (09 §A3 신규 자동화) |
| `frontend` | `ci.yml` (Flutter build) |
| `shared` | `schema-check.yml` (Avro 호환성 검증, mock 모드 시작) |
| `gitops` | `validate-manifests.yml` (kustomize build + yaml lint + ApplicationSet 스키마) |

`deploy.yml`의 외부 인프라 가드 패턴:
```yaml
- name: Build and push image to ECR
  if: ${{ secrets.ECR_REGISTRY != '' }}
  run: |
    docker build -t $ECR_REGISTRY/$IMAGE_NAME:${{ github.sha }} .
    docker push $ECR_REGISTRY/$IMAGE_NAME:${{ github.sha }}

- name: Update GitOps repo
  if: ${{ secrets.ECR_REGISTRY != '' && secrets.GITOPS_TOKEN != '' }}
  # ... 09 §B3 풀 YAML
```

부트스트랩 시점엔 ECR_REGISTRY가 없어 이 step만 skip되고, mirror.yml은 정상 동작한다.

### 4.6 `SECRETS.md` 인벤토리 (Tier 1 6개에 동일 템플릿)

`docs/SECRETS.md` 예시 (platform-svc):

> **owner 컬럼 약속**: 09 §0.3 placeholder(`@team-lead` / `@platform-owner` 등)를 그대로 사용한다. W1 시점에는 모든 placeholder가 `@VelkaressiaBlutkrone` 1명으로 집약된 상태이며 (MIRROR/GITOPS 행에 명시), 트랙 owner가 합류하면 09 §0.3 매핑이 자연스럽게 활성화된다. 부트스트랩에서 실제 등록된 secret과 미래 등록 예정 secret을 `상태` 컬럼(`✅ 등록` vs `⏳ pending`)으로 구분한다.

```markdown
# Secrets Inventory — synapse-platform-svc

| Secret | 용도 | 발급처 | 담당 트랙 | 상태 | 만료 | 비고 |
|---|---|---|---|:---:|---|---|
| MIRROR_TOKEN | mirror.yml — synapse-mirror push | github fine-grained PAT | @VelkaressiaBlutkrone (09 §0.3 `@team-lead` placeholder, W1 임시) | ✅ 등록 | 2026-08-10 | 90일 갱신 |
| GITOPS_TOKEN | deploy.yml — synapse-gitops push | github fine-grained PAT | @VelkaressiaBlutkrone (09 §0.3 `@team-lead` placeholder, W1 임시) | ✅ 등록 | 2026-08-10 | 90일 갱신 |
| ECR_REGISTRY | deploy.yml — ECR push | AWS ECR | @VelkaressiaBlutkrone (W1 임시) | ⏳ pending | — | W2+ 인프라 셋업 |
| OAUTH_GOOGLE_CLIENT_ID | auth 모듈 | Google Cloud Console | @platform-owner | ⏳ pending | — | W1 PAT 발급 후 |
| OAUTH_GOOGLE_CLIENT_SECRET | auth 모듈 | Google Cloud Console | @platform-owner | ⏳ pending | — | W1 PAT 발급 후 |
| STRIPE_SECRET_KEY | billing 모듈 | Stripe Dashboard | @platform-owner | ⏳ pending | — | W2 |
| STRIPE_WEBHOOK_SECRET | billing 모듈 | Stripe Dashboard | @platform-owner | ⏳ pending | — | W2 |
| FCM_SERVER_KEY | notification 모듈 | Firebase Console | @platform-owner | ⏳ pending | — | W3 |
```

트랙별 인벤토리는 09 §B6 + 18 기술 스택의 트랙 매핑 + `10_환경_설정_템플릿.md` §2의 .env 표를 합쳐 작성한다.

### 4.7 commit 흐름

Phase 1에서 만든 임시 main 위에 워크플로 + SECRETS.md를 추가 → `enforce_admins: false` 상태이므로 main 직접 push:

```bash
git add .github/workflows/ docs/SECRETS.md
git commit -m "ci(infra): add mirror.yml + ci.yml + deploy.yml + secrets inventory (PLAT-002)"
git push origin main
```

이 시점에 mirror.yml이 첫 run으로 트리거되지만, `services/{name}/`이 거의 비어있어서 의미 있는 검증이 아니다. Phase 3 첫 commit 후 검증한다.

### 4.8 Gate 2 검증

```bash
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  echo "=== $repo ==="
  gh secret list --repo team-project-final/$repo
done
```

기대 출력: 6개 레포 각각 `MIRROR_TOKEN`, `GITOPS_TOKEN` 2개 이름 = 총 12개 (값 미노출).

---

## 5. Phase 3 — Hello World 골격 + 검증

### 5.1 산출물

`syn/scripts/bootstrap/phase3.sh` + 6개 레포의 첫 코드 commit. 예상 소요: 자동 20분 (스캐폴딩 + 6 repos push + Actions 대기) + 사용자 5분 (Gate 3 확인).

### 5.2 Spring Boot 4 백엔드 4개 (platform / engagement / knowledge / learning-card)

각 레포의 디렉토리 트리 (platform-svc 예시):

```
synapse-platform-svc/
├── build.gradle.kts          # Java 21, Spring Boot 4.0.0, Modulith 1.2.x
├── settings.gradle.kts       # rootProject.name = "platform-svc"
├── gradle/wrapper/           # gradle 8.10
├── src/main/java/com/synapse/platform/
│   ├── PlatformApplication.java                    # @SpringBootApplication
│   ├── auth/package-info.java                      # @ApplicationModule
│   ├── audit/package-info.java                     # @ApplicationModule
│   ├── billing/package-info.java                   # @ApplicationModule
│   ├── notification/package-info.java              # @ApplicationModule
│   └── shared/                                     # 공통 (BaseEntity placeholder, ApiResponse)
├── src/main/resources/application.yml              # server.port=8081
├── src/test/java/com/synapse/platform/
│   └── ModuleStructureTest.java                    # ApplicationModules.of(...).verify()
└── docs/SECRETS.md
```

`PlatformApplication.java`:
```java
package com.synapse.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

@SpringBootApplication
@Modulithic(systemName = "synapse-platform-svc")
public class PlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
```

`auth/package-info.java`:
```java
@ApplicationModule(
    displayName = "auth",
    allowedDependencies = {"shared"}
)
package com.synapse.platform.auth;
import org.springframework.modulith.ApplicationModule;
```

`ModuleStructureTest.java`:
```java
@Test
void verifiesModuleStructure() {
    ApplicationModules.of(PlatformApplication.class).verify();
}
```

`engagement-svc`(community/gamification), `knowledge-svc`(note/graph/chunking), `learning-card`도 동일 패턴.

스캐폴딩 자동 생성:
```bash
curl https://start.spring.io/starter.zip \
  -d type=gradle-project-kotlin \
  -d language=java \
  -d bootVersion=4.0.0 \
  -d javaVersion=21 \
  -d groupId=com.synapse \
  -d artifactId=platform-svc \
  -d name=PlatformApplication \
  -d packageName=com.synapse.platform \
  -d dependencies=web,actuator,validation \
  -o platform-svc.zip
unzip platform-svc.zip
```

Modulith 의존성 + 모듈 디렉토리 추가는 sed/heredoc로 패치.

### 5.3 FastAPI — `learning-svc/learning-ai/`

09 §A1·§B1의 "learning-svc는 모노레포 (Java + Python)" 패턴. 한 레포에 두 sub-tree:

```
synapse-learning-svc/
├── settings.gradle.kts                  # include("learning-card") only
├── learning-card/                       # Java 트랙
│   ├── build.gradle.kts
│   └── src/main/java/com/synapse/learning/
│       ├── LearningCardApplication.java
│       ├── card/package-info.java
│       └── srs/package-info.java
├── learning-ai/                         # Python 트랙
│   ├── pyproject.toml                   # FastAPI 0.115, uvicorn, anthropic, openai
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                      # FastAPI() + /health
│   │   └── ai/__init__.py
│   └── tests/test_health.py
└── .github/workflows/ci.yml             # paths-filter로 Java/Python 분기
```

`learning-ai/app/main.py`:
```python
from fastapi import FastAPI

app = FastAPI(title="synapse-learning-ai", version="0.0.1")

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

### 5.4 Flutter — `synapse-frontend`

```
synapse-frontend/
├── pubspec.yaml                         # Flutter 3.x, Riverpod 3.0, GoRouter 14, Dio 5
├── lib/
│   ├── main.dart                        # runApp(ProviderScope(child: SynapseApp()))
│   ├── app.dart                         # MaterialApp.router + ThemeData (DESIGN.md 토큰)
│   ├── core/constants/
│   │   ├── app_colors.dart              # Warm Amber #D97706 등 (DESIGN.md)
│   │   ├── app_spacing.dart
│   │   └── app_routes.dart
│   └── features/dashboard/presentation/
│       └── dashboard_screen.dart        # "Synapse" 한 줄
└── analysis_options.yaml                # flutter_lints + 컨벤션 §2.4 규칙
```

스캐폴딩: `flutter create --org com.synapse --project-name synapse_frontend --template app .`

### 5.5 Avro 첫 스키마 — `synapse-shared`

```
synapse-shared/
├── build.gradle.kts                     # avro plugin, Maven publish
├── src/main/avro/
│   ├── shared/
│   │   ├── TenantId.avsc                # type: string, logical type: uuid
│   │   ├── UserId.avsc
│   │   └── CloudEventEnvelope.avsc      # 표준 봉투
│   └── platform/
│       └── UserRegistered.avsc          # 첫 도메인 이벤트
└── docs/SCHEMA_EVOLUTION.md             # 09 §B4 호환성 정책 요약
```

`UserRegistered.avsc`:
```json
{
  "type": "record",
  "name": "UserRegistered",
  "namespace": "com.synapse.event.platform",
  "fields": [
    {"name": "userId", "type": "string"},
    {"name": "tenantId", "type": "string"},
    {"name": "email", "type": "string"},
    {"name": "displayName", "type": ["null", "string"], "default": null},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}}
  ]
}
```

`UserRegistered`를 첫 스키마로 선택한 이유: 18 위키 §2.2.1 인증/사용자 도메인의 첫 이벤트이고, 다른 모든 이벤트가 따를 envelope + Schema Registry 흐름의 대표 케이스가 된다.

### 5.6 GitOps — `synapse-gitops`

```
synapse-gitops/
├── apps/
│   ├── platform-svc/{base,overlays/{dev,staging,prod}}/
│   ├── engagement-svc/{base,overlays/...}/
│   ├── knowledge-svc/{base,overlays/...}/
│   ├── learning-card/{base,overlays/...}/
│   └── learning-ai/{base,overlays/...}/
├── infra/
│   ├── istio/.gitkeep
│   ├── monitoring/.gitkeep
│   ├── ingress/.gitkeep
│   └── external-secrets/.gitkeep
├── argocd/
│   ├── applicationset.yaml              # 5×3 matrix (09 §B3)
│   └── projects.yaml
└── RELEASE_NOTES.md                     # 빈 템플릿
```

각 서비스 base의 `deployment.yaml`은 09 §3.6의 K8s 리소스 표(CPU/Memory req + HPA 1~6) 그대로. overlay는 `images.newTag` placeholder(`PLACEHOLDER`)로 시작 → deploy.yml이 첫 실 ECR push 시 갱신. ArgoCD는 placeholder 상태에선 pull 실패 (정상 — W2+ ArgoCD 설치 시점에 자연스럽게 활성화).

### 5.7 Gate 3 검증

```bash
# 1. 모든 Tier 1 6개에 push 완료 후 Actions tab에서 첫 run 확인
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  echo "=== $repo ==="
  gh run list --repo team-project-final/$repo --limit 3 --json name,status,conclusion
done

# 2. mirror 레포에 services/ 디렉토리 6개 등장 확인
gh repo clone team-project-final/synapse-mirror /tmp/mirror-verify
ls /tmp/mirror-verify/services/

# 3. gitops 레포는 placeholder 그대로 — deploy.yml의 newTag bump step이 skip됐는지 확인
gh run list --repo team-project-final/synapse-platform-svc \
  --workflow=deploy.yml --json conclusion,jobs
```

### 5.8 후처리

```bash
# enforce_admins: false → true 전환 (8개 레포)
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared \
            synapse-mirror synapse-gitops; do
  gh api -X POST repos/team-project-final/$repo/branches/main/protection/enforce_admins
done

# 셋업 스크립트 syn 레포에 commit
cd D:/workspace/final-project-syn/syn
git add scripts/bootstrap/
git commit -m "chore(infra): polyrepo bootstrap scripts (INFRA-001)"
git push
```

---

## 6. 검증 게이트 통합 + 롤백

### 6.1 3-Gate 통합 표

| Gate | 위치 | 자동 검증 | 사용자 확인 |
|---|---|---|---|
| Gate 1 | `phase1.sh` 끝 | `gh repo list`로 8개 레포 + visibility + protection 출력 | 사용자가 [`https://github.com/orgs/team-project-final/repositories`] 방문 |
| Gate 2 | `phase2.sh` 끝 | `gh secret list`로 12개 secret 이름 확인 + `gh workflow list`로 워크플로 commit 확인 | 사용자가 Actions tab에서 첫 run 결과 (아직 fail 가능) 확인 |
| Gate 3 | `phase3.sh` 끝 | (a) Actions 첫 run 전부 success/conclusion 정상, (b) mirror 레포 `services/` 6개 디렉토리 출현, (c) Gradle/Flutter/pytest 로컬 빌드 1회 통과 | 사용자가 mirror 레포 클론해서 6개 서비스 코드 가시화 |

### 6.2 Gate 실패 분기

| Gate | 실패 원인 | 대응 |
|---|---|---|
| 1 | 레포 이름 중복 (org에 이미 존재) | `phase1.sh` 멱등 가드(`gh repo view ... && skip`) 자동 처리 |
| 1 | branch protection API 실패 (token scope 부족) | `gh auth refresh -s admin:org`로 권한 확장 후 재시도 |
| 2 | 워크플로 파일 syntax error | `actionlint`로 사전 검증하는 step을 `phase2.sh`에 추가 |
| 2 | secrets 등록 실패 (PAT 환경변수 미설정) | `phase2.sh` 첫 줄에서 `[ -z "$MIRROR_TOKEN" ] && exit 1` 가드 |
| 3 | mirror 첫 run 실패 (`MIRROR_TOKEN` 권한 잘못) | 토큰 재발급 → secrets 갱신 → `gh workflow run mirror.yml`로 수동 트리거 |
| 3 | ci 빌드 실패 (Spring Boot 4.0.0 미공개) | `phase3.sh` 내부 fallback: 4.0.0 → 4.0.0-M3 → 3.4.x |

### 6.3 전체 롤백 — 부트스트랩 무효화

```bash
# 8개 레포 일괄 삭제 — for loop 금지, 각 레포 명시 명령
gh repo delete team-project-final/synapse-platform-svc --yes
gh repo delete team-project-final/synapse-engagement-svc --yes
gh repo delete team-project-final/synapse-knowledge-svc --yes
gh repo delete team-project-final/synapse-learning-svc --yes
gh repo delete team-project-final/synapse-frontend --yes
gh repo delete team-project-final/synapse-shared --yes
gh repo delete team-project-final/synapse-mirror --yes
gh repo delete team-project-final/synapse-gitops --yes

# 발급한 PAT 2개 revoke (web)
# https://github.com/settings/personal-access-tokens

# 로컬 작업 폴더 정리
rm -rf /tmp/bootstrap/
```

09 §C2 트랩 정신과 일치: for loop으로 한 번에 8개 지우는 명령은 만들지 않는다.

### 6.4 부분 롤백

| 되돌릴 단위 | 명령 |
|---|---|
| Phase 3 commit 되돌리기 | `git reset --hard HEAD~1 && git push --force-with-lease` (`enforce_admins: false` 상태에서만) |
| Phase 2 워크플로 비활성화 | `gh workflow disable mirror.yml --repo team-project-final/...` (8회 명시) |
| Phase 1 branch protection 해제 | `gh api -X DELETE repos/.../branches/main/protection` |

### 6.5 검증 게이트 자동화 보고

각 phase 스크립트 끝에 markdown 표를 stdout으로 출력 + `syn/scripts/bootstrap/reports/{phase}-YYYY-MM-DD.md`로 저장:

```markdown
## Phase 1 Report — 2026-05-12 14:23 KST

| Check | Expected | Actual | Pass |
|---|---|:---:|:---:|
| Repos created | 8 | 8 | ✅ |
| Tier 1 visibility = public | 6 | 6 | ✅ |
| mirror/gitops visibility = private | 2 | 2 | ✅ |
| main branch exists | 8 | 8 | ✅ |
| branch protection enabled | 8 | 8 | ✅ |
| Require PR (Tier 1+shared+frontend+gitops) | 7 | 7 | ✅ |
| Force push blocked (all) | 8 | 8 | ✅ |
```

이 보고서는 git에 커밋해서 향후 합류자가 Day 1 셋업 결과를 그대로 볼 수 있게 한다 (09 §C1 체크리스트의 "실행 증거").

---

## 7. 위험 + 완화 + 일정

### 7.1 위험 매트릭스

| # | 위험 | 영향도 | 발생 확률 | 완화 |
|---|---|:---:|:---:|---|
| R1 | fine-grained PAT가 Phase 2에서 미발급 → secret 등록 실패 | 높음 | 중간 | Phase 2 첫 줄에서 환경변수 가드 + 발급 절차서 사전 안내 |
| R2 | start.spring.io에서 Spring Boot 4.0.0이 아직 미공개 | 중간 | 높음 | `phase3.sh` 스캐폴딩 fallback: 4.0.0 → 4.0.0-M3 → 3.4.x |
| R3 | mirror.yml 첫 run 실패 — `MIRROR_TOKEN`의 repo scope 잘못 발급 | 높음 | 낮음 | Phase 2 절차서에 "Only select repositories → synapse-mirror 1개" 명시 + Gate 3 실패 시 토큰 재발급 분기 |
| R4 | branch protection API가 admin:org scope 요구 | 중간 | 중간 | `gh auth refresh -s admin:org` 1회 |
| R5 | start.spring.io 응답 지연/다운 | 낮음 | 낮음 | 5분 retry + 실패 시 `gradle init` 기반 수동 스캐폴딩 fallback |
| R6 | Modulith `ApplicationModules.verify()`가 빈 모듈에서 실패 | 낮음 | 낮음 | 각 모듈에 dummy `@Component` 1개 추가해 그래프가 비어있지 않게 |
| R7 | Schema Registry secrets 없어 `schema-check.yml`이 mock 모드로만 동작 | 낮음 | 확실 | W2+ Schema Registry 인프라 셋업 후 활성화. 부트스트랩 단계 의도된 동작 |
| R8 | learning-svc paths-filter가 첫 push에 양쪽 모두 트리거 → CI 시간 2배 | 낮음 | 확실 | 첫 push만 그렇고, 이후엔 변경 path만 트리거. 무시 가능 |
| R9 | `flutter create`가 frontend 레포의 license/topics 설정 덮어쓰기 | 낮음 | 낮음 | `flutter create` 후 `gh repo edit` 재실행으로 보정 |
| R10 | 부트스트랩 중간에 사용자가 다른 작업 끼어들기 → mid-state로 남음 | 높음 | 중간 | 각 phase가 멱등 + `reports/`로 진행 상태가 git에 박혀 재실행 가능 |

### 7.2 시간 견적

| Phase | 자동 실행 | 사용자 손 작업 | 총 |
|---|---:|---:|---:|
| Phase 1 — 레포 + 보호 설정 | ~5분 | Gate 1 확인 ~2분 | ~7분 |
| 사용자 — PAT 발급 (web) | — | ~10분 | ~10분 |
| Phase 2 — 워크플로 + secrets | ~5분 | Gate 2 확인 ~3분 | ~8분 |
| Phase 3 — Hello World + 검증 | ~20분 | Gate 3 확인 ~5분 | ~25분 |
| **합계** | **~30분** | **~20분** | **~50분** |

부트스트랩 자체는 1시간 안에 끝난다. 09 §C1 Day 1 셋업 체크리스트 중 GitHub / 워크플로 / 첫 코드 세 그룹이 완료되고, 인프라 그룹(AWS EKS / RDS / MSK 등)은 별도 작업으로 분리된다.

### 7.3 결정 보존 — ADR 후보

부트스트랩 후 09 부록에 추가하면 좋은 ADR 2개:

- **ADR-006**: 부트스트랩 시점 CODEOWNERS 단일 임시 owner 선택 근거 + W1 첫 PR로 트랙 매핑 갱신 약속
- **ADR-007**: 외부 인프라 secrets는 부트스트랩 범위 외 — 트랙 owner별 W2~W3 PR로 추가, 워크플로의 `if: secrets.X != ''` 가드 패턴이 매끄럽게 연결

ADR 작성은 별도 PR(`feature/INFRA-003-adr-006-007`)로.

---

## 8. 비범위 (Out of Scope)

부트스트랩이 다루지 **않는** 항목:

1. AWS EKS / RDS / MSK / ElastiCache / OpenSearch / S3 / ECR 셋업 → W2+ 인프라 작업
2. Confluent Schema Registry / ArgoCD / Istio 설치 → W2+ 인프라 작업
3. Stripe / FCM / APNs / SES / OpenAI / Anthropic 계정 발급 및 secrets 등록 → 트랙 owner별 W2~W3 PR
4. 트랙 owner 합류 (현재 `@VelkaressiaBlutkrone` 단일) → 팀 합류 시점 첫 PR로 CODEOWNERS 갱신
5. 본격 비즈니스 로직 구현 → W1 첫 PR부터 시작 (예: `feature/PLAT-002-oauth-google`)
6. CHANGELOG 첫 entry → 각 트랙의 첫 feature PR에서 추가

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| v1.0 | 2026-05-12 | Synapse Team | 초안 작성. 09 v2.0 §C1 Day 1 체크리스트 중 GitHub/워크플로/첫 코드 그룹을 실행하는 부트스트랩 계획. 3-Phase 검증 게이트 + 멱등 스크립트 3개 + 자동 보고서 commit. |
| v1.0-completed | 2026-05-12 | Synapse Team | Phase 1/2/3 실행 완료. reports/phase{1,2,3}-2026-05-12.md 추가. private 레포(mirror/gitops) branch protection은 GitHub Free plan 제한으로 skip. enforce_admins는 public 6개에만 적용. mirror.yml 버그 수정 (git add -A before diff). |
