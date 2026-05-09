# Synapse Git 규칙 보강 — 폴리레포 + 미러 + GitOps 구성

> **위치**: 기존 `09_Git_규칙_정의서`를 **보강**하는 부록 (Appendix)
> **이유**: 원안은 모노레포 가정. 4-서비스 폴리레포 + 미러 + GitOps 구성에 맞춰 추가 규칙 필요.
> **선행 결정**: SYNAPSE_Service_Consolidation.md (10개 → 4개 통합)
> **MSA 시리즈 참조**: #1 SCS, #11 Schema Registry, #12 Hybrid Repo Strategy

---

## 0. 이 문서의 위치

기존 09 문서의 모든 규칙은 **각 서비스 레포 안에서** 그대로 적용된다. 이 보강 문서는 **레포 간**의 규칙을 추가한다.

```
[09_Git_규칙_정의서] (기존)
   ─ 한 레포 안의 브랜치/커밋/PR 규칙
   ─ 단일 main, GitHub Flow, Conventional Commits

[이 문서: Polyrepo Supplement] (보강)
   ─ 여러 레포의 구조와 동기화
   ─ 미러링, GitOps, Schema Registry, PAT 정책
   ─ 서비스별 SemVer + 통합 배포 태그
```

---

## 1. 레포 구조 (Tier 1 + Tier 2 + Tier 3 대안)

### 1.1 전체 레포 인벤토리

```
[Tier 1: 서비스 레포 — 6개]
  team-project-final/synapse-platform-svc      (1명 owner — 트랙 A)
  team-project-final/synapse-engagement-svc    (1명 owner — 트랙 B)
  team-project-final/synapse-knowledge-svc     (2명 owner — 트랙 C)
  team-project-final/synapse-learning-svc      (2명 owner — 트랙 D, Java+Python)
  team-project-final/synapse-frontend          (Flutter, 트랙 협업)
  team-project-final/synapse-shared            (Avro 스키마, 공통 타입, 팀장 단독 관리)

[Tier 2: 미러 레포 — 1개]
  team-project-final/synapse-mirror            (자동 동기화, 검색·AI·백업)

[Tier 3 대안: GitOps 레포 — 1개]
  team-project-final/synapse-gitops            (K8s manifest, ArgoCD ApplicationSet)

[기존 유지]
  team-project-final/documents                 (위키, 18개 설계 문서)
```

### 1.2 각 레포 책임 명시

| 레포 | 권한 | 직접 commit | 자동 동기화 |
|---|---|:---:|:---:|
| Tier 1 (각 서비스) | 트랙 + 팀장 | ✅ | — |
| Tier 2 미러 | 팀장 read, Action만 write | ❌ | 모든 Tier 1로부터 |
| Tier 3 GitOps | 팀장 + DevOps | ✅ (image tag) | 각 서비스 CI 자동 업데이트 |
| documents | 팀장 + 위키 작성자 | ✅ | — |

### 1.3 레포 명명 규칙

```
Tier 1: synapse-{도메인}-svc
   ✅ synapse-platform-svc
   ✅ synapse-knowledge-svc
   
Tier 2: synapse-{용도}
   ✅ synapse-mirror
   
Tier 3: synapse-{용도}
   ✅ synapse-gitops
   
공유: synapse-{이름}
   ✅ synapse-shared
   ✅ synapse-frontend
```

---

## 2. 브랜치 전략 변경 (서비스별 GitHub Flow)

### 2.1 기존 (모노레포 가정) → 변경 (서비스별)

**기존 09 문서 1.1**:
```
main (production-ready)
├── feature/AUTH-001-oauth-login
├── feature/NOTE-002-wikilink
└── ...
```
→ 모든 도메인 브랜치가 한 그래프에 표시됨 (모노레포 가정)

**변경 (각 서비스 레포 안에서 독립)**:
```
synapse-platform-svc:
  main
  ├── feature/PLAT-001-oauth-google
  ├── feature/PLAT-002-stripe-webhook
  └── fix/PLAT-003-jwt-expiry

synapse-knowledge-svc:
  main
  ├── feature/KNOW-001-wikilink-parser
  ├── feature/KNOW-002-pagerank
  └── ...

synapse-learning-svc:
  main
  ├── feature/LEARN-CARD-001-srs        (Java)
  ├── feature/LEARN-AI-001-rag          (Python)
  └── ...
```

### 2.2 브랜치 prefix 갱신 (기존 09 문서 1.2 대체)

| 접두사 | 의미 | 예시 |
|---|---|---|
| `feature/PLAT-NNN-` | Platform 서비스 | `feature/PLAT-001-oauth-google` |
| `feature/ENG-NNN-` | Engagement 서비스 | `feature/ENG-001-xp-system` |
| `feature/KNOW-NNN-` | Knowledge 서비스 | `feature/KNOW-001-wikilink` |
| `feature/LEARN-CARD-NNN-` | Learning Card (Java) | `feature/LEARN-CARD-001-srs` |
| `feature/LEARN-AI-NNN-` | Learning AI (Python) | `feature/LEARN-AI-001-rag` |
| `feature/SHARED-NNN-` | Shared 라이브러리 | `feature/SHARED-001-avro-schema` |
| `feature/FE-NNN-` | Frontend (Flutter) | `feature/FE-001-note-editor` |
| `feature/INFRA-NNN-` | GitOps/인프라 | `feature/INFRA-001-argocd-app` |

`fix/`, `hotfix/`, `docs/`, `chore/`, `refactor/`, `test/` 접두사도 동일 prefix 사용.

### 2.3 브랜치 수명 규칙 (기존 09 문서 1.3 그대로)

- 최대 5일 (초과 시 분할 권장)
- main 브랜치 보호 + force push 금지
- 머지 후 원격 브랜치 자동 삭제

---

## 3. CODEOWNERS 재정의 (서비스별)

### 3.1 각 서비스 레포의 CODEOWNERS

```
# synapse-platform-svc/.github/CODEOWNERS
*                  @팀장 @트랙A-멤버
/auth/             @팀장 @트랙A-멤버   ← 보안 도메인은 팀장 cross-review 필수
/billing/          @트랙A-멤버 @팀장
/audit/            @트랙A-멤버
/notification/     @트랙A-멤버


# synapse-engagement-svc/.github/CODEOWNERS
*                  @팀장 @트랙B-멤버
/community/        @트랙B-멤버
/gamification/     @트랙B-멤버


# synapse-knowledge-svc/.github/CODEOWNERS
*                  @팀장 @트랙C-멤버1 @트랙C-멤버2
/note/             @트랙C-멤버1 @트랙C-멤버2
/graph/            @트랙C-멤버2 @트랙C-멤버1
/chunking/         @트랙C-멤버2 @팀장


# synapse-learning-svc/.github/CODEOWNERS
*                  @팀장 @트랙D-멤버1 @트랙D-멤버2
/learning-card/    @트랙D-멤버1 @트랙D-멤버2  ← Java
/learning-ai/      @트랙D-멤버2 @트랙D-멤버1  ← Python


# synapse-shared/.github/CODEOWNERS
*                  @팀장             ← shared는 팀장 단독 승인 (안정성)


# synapse-gitops/.github/CODEOWNERS
*                  @팀장             ← 운영 직결 (단독 승인)
/apps/platform/    @팀장 @트랙A-멤버
/apps/engagement/  @팀장 @트랙B-멤버
/apps/knowledge/   @팀장 @트랙C-멤버1 @트랙C-멤버2
/apps/learning/    @팀장 @트랙D-멤버1 @트랙D-멤버2


# synapse-mirror/.github/CODEOWNERS
*                  @팀장             ← 직접 commit 금지 (Action만 write)


# synapse-frontend/.github/CODEOWNERS
*                  @팀장 @모든-트랙-멤버  ← 전 트랙 협업
```

### 3.2 ⚠️ 핵심 변경

```
원안: * @synapse-team
변경: 각 서비스에 명시적 owner + 팀장 cross-review

이유:
- 7명 풀스택이 도메인 사일로화 방지
- 모든 PR을 팀장이 검토 (아키텍처 일관성)
- 보안 민감 영역(Auth)은 이중 승인 강제
- 서비스 간 결합도 변경(shared) 시 팀장만 승인
```

---

## 4. PR 규칙 보강

### 4.1 PR 승인 정책 강화

기존 09 문서 3.3은 "최소 1명 Approve"였음. 변경:

| 변경 종류 | 최소 승인 | 비고 |
|---|:---:|---|
| 일반 feature/fix | 팀장 + 트랙 owner 1명 | 기존 1명 → 2명 |
| Auth/보안 변경 | 팀장 + 트랙 A 멤버 | 보안 이중 승인 |
| Shared 라이브러리 | 팀장 단독 | 영향 범위 큼 |
| Avro 스키마 변경 | 팀장 + 변경 영향 받는 트랙 | 호환성 검증 필수 |
| GitOps 변경 | 팀장 단독 | 운영 직결 |
| Hotfix | 팀장 단독 | 긴급성 |
| Frontend (UI) | 팀장 + 트랙 owner | 평소대로 |

### 4.2 PR 본문 템플릿 추가 항목

기존 템플릿(09 문서 3.2)에 다음 추가:

```markdown
## 영향 받는 다른 서비스
<!-- 이 변경이 다른 서비스에 영향이 있나? -->
- [ ] platform-svc
- [ ] engagement-svc
- [ ] knowledge-svc
- [ ] learning-svc (card / ai)
- [ ] shared
- [ ] frontend
- [ ] (영향 없음)

## 이벤트/스키마 변경 여부
- [ ] 새 Kafka 토픽 추가
- [ ] 기존 토픽 스키마 변경 (호환성 모드 명시: BACKWARD/FORWARD/FULL)
- [ ] 새 Internal REST API 추가
- [ ] (변경 없음)

## 호환성 검증
- [ ] Schema Registry 호환성 검증 통과 (BACKWARD)
- [ ] (해당 없음)

## 미러링/GitOps 영향
- [ ] 자동 미러링 정상 (services/{name}/ 갱신 확인)
- [ ] GitOps image tag 자동 업데이트 정상
- [ ] (해당 없음)
```

---

## 5. 자동화 워크플로 추가

### 5.1 기존 자동화 + 신규 추가

기존(09 문서 3.4):
- Lint, 단위 테스트, 통합 테스트, 빌드, 커버리지, SonarQube, Snyk

**추가 필수**:
- **미러링**: push 시 synapse-mirror로 자동 동기화
- **GitOps 갱신**: image build 후 synapse-gitops의 image tag 자동 update
- **Schema Registry 호환성**: Avro 스키마 변경 PR 시 검증
- **ArchUnit + Spring Modulith 검증**: 모듈 경계 위반 차단

### 5.2 미러링 워크플로 (각 서비스 레포)

`.github/workflows/mirror.yml`:
```yaml
name: Mirror to synapse-mirror

on:
  push:
    branches: [main]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Checkout mirror repo
        uses: actions/checkout@v4
        with:
          repository: team-project-final/synapse-mirror
          token: ${{ secrets.MIRROR_TOKEN }}
          path: mirror

      - name: Sync
        run: |
          SERVICE_NAME="${{ github.event.repository.name }}"
          rm -rf mirror/services/$SERVICE_NAME
          mkdir -p mirror/services/$SERVICE_NAME
          rsync -av \
            --exclude='.git' \
            --exclude='mirror' \
            --exclude='node_modules' \
            --exclude='build' \
            --exclude='target' \
            --exclude='.gradle' \
            --exclude='__pycache__' \
            --exclude='.venv' \
            --exclude='.env*' \
            --exclude='*.key' \
            --exclude='*.pem' \
            ./ mirror/services/$SERVICE_NAME/

      - name: Commit
        run: |
          cd mirror
          git config user.email "actions@github.com"
          git config user.name "GitHub Actions"
          git add services/
          if git diff --staged --quiet; then
            echo "No changes"
          else
            git commit -m "🔄 Sync ${{ github.event.repository.name }} from ${{ github.sha }}"
            git push
          fi
```

### 5.3 GitOps 갱신 워크플로

`.github/workflows/deploy.yml` (CI 파이프라인 마지막 단계):
```yaml
- name: Build and push image to ECR
  run: |
    docker build -t $ECR_REGISTRY/$IMAGE_NAME:${{ github.sha }} .
    docker push $ECR_REGISTRY/$IMAGE_NAME:${{ github.sha }}

- name: Update GitOps repo
  uses: actions/checkout@v4
  with:
    repository: team-project-final/synapse-gitops
    token: ${{ secrets.GITOPS_TOKEN }}
    path: gitops

- name: Bump image tag (dev environment)
  run: |
    cd gitops/apps/${{ github.event.repository.name }}/overlays/dev
    yq -i '.images[0].newTag = "${{ github.sha }}"' kustomization.yaml
    git config user.email "actions@github.com"
    git config user.name "GitHub Actions"
    git add . && git commit -m "Bump ${{ github.event.repository.name }} to ${{ github.sha }}"
    git push
```

→ ArgoCD가 GitOps 레포 변경 감지 → EKS dev 환경 자동 배포
→ staging/prod는 수동 승인 또는 별도 워크플로

### 5.4 Schema Registry 호환성 검증 워크플로

`.github/workflows/schema-check.yml` (synapse-shared 레포):
```yaml
name: Schema Compatibility Check

on:
  pull_request:
    paths:
      - 'src/main/avro/**/*.avsc'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'

      - name: Check schema compatibility
        run: ./gradlew testSchemasTask
        env:
          SCHEMA_REGISTRY_URL: ${{ secrets.SCHEMA_REGISTRY_URL }}
          SCHEMA_REGISTRY_USER: ${{ secrets.SCHEMA_REGISTRY_USER }}
          SCHEMA_REGISTRY_PASS: ${{ secrets.SCHEMA_REGISTRY_PASS }}
```

---

## 6. PAT (Personal Access Token) 정책

### 6.1 토큰 인벤토리

| 토큰 이름 | 권한 | 대상 레포 | 보관 위치 |
|---|---|---|---|
| MIRROR_TOKEN | Contents: write | synapse-mirror | 각 서비스 레포 secrets |
| GITOPS_TOKEN | Contents: write | synapse-gitops | 각 서비스 레포 secrets |
| ECR_PUSH | AWS ECR push | (AWS 권한) | GitHub Actions OIDC |
| SCHEMA_REGISTRY_* | Schema Registry 인증 | (외부 인프라) | synapse-shared secrets |

### 6.2 ⚠️ 보안 규칙

```
✅ 무조건 fine-grained PAT (Classic 금지)
✅ 최소 권한 (Contents: write만, Repository 한정)
✅ 만료일 90일 이내 (3개월 1회 갱신)
✅ 갱신 알림 자동화 (만료 7일 전)
✅ 팀장만 발급 권한
❌ Personal account의 토큰을 organization secrets에 저장 X
   → 가능하면 GitHub App 도입 검토
```

### 6.3 토큰 갱신 절차

```
1. 만료 7일 전 알림 (GitHub 자동)
2. 팀장이 새 토큰 발급 (fine-grained, 동일 권한)
3. 각 서비스 레포 secrets 업데이트
4. 미러링/GitOps 워크플로 1회 수동 트리거 (검증)
5. 옛 토큰 revoke
```

---

## 7. 릴리즈 / 태깅 (서비스별 SemVer)

### 7.1 변경 사항

**기존 (09 문서 4)**: 단일 `v1.0.0` 태그
**변경 (서비스별)**: 각 서비스 독립 SemVer

```
synapse-platform-svc:    v1.2.3
synapse-engagement-svc:  v0.8.1
synapse-knowledge-svc:   v2.1.0
synapse-learning-svc:    v1.5.7
synapse-shared:          v0.4.2
```

### 7.2 GitOps 레포 통합 릴리즈 태그

서비스별 SemVer와 별도로, **운영 배포 시점**을 식별하기 위한 통합 태그:

```
synapse-gitops/v2026.05.10
   ↓ 이 시점의 모든 서비스 image tag 묶음:
   - platform-svc: v1.2.3 (sha: abc123)
   - engagement-svc: v0.8.1 (sha: def456)
   - knowledge-svc: v2.1.0 (sha: ghi789)
   - learning-svc: v1.5.7 (sha: jkl012)

→ "어느 시점에 무엇이 배포됐나" 추적
→ 롤백 시 이 태그로 복원
```

### 7.3 릴리즈 프로세스 변경

```
원안 (모노레포 가정):
  1. main에서 릴리즈 준비
  2. 단일 v1.1.0 태그
  3. Docker 이미지 빌드

변경 (서비스별):
  1. 각 서비스 레포의 main에서 릴리즈 준비
  2. 서비스별 SemVer 태그 (예: v1.2.3)
  3. CI가 자동으로 ECR + GitOps 갱신
  4. 통합 배포 시점에 GitOps 레포에 통합 태그 (v2026.05.10)
  5. ArgoCD가 자동 동기화 (dev) / 수동 승인 (prod)
```

### 7.4 CHANGELOG 분리

```
원안: 단일 CHANGELOG.md
변경: 각 서비스 레포마다 CHANGELOG.md
   + 통합 RELEASE_NOTES.md (synapse-gitops에)
```

---

## 8. Schema Registry 정책 (필수 추가)

원안에 빠진 부분. **MSA + 이벤트 기반에서 필수**.

### 8.1 스키마 위치

```
synapse-shared/
└── src/main/avro/
    ├── platform/
    │   ├── UserRegistered.avsc
    │   └── BillingSubscriptionChanged.avsc
    ├── knowledge/
    │   ├── NoteCreated.avsc
    │   ├── NoteUpdated.avsc
    │   ├── NoteDeleted.avsc
    │   └── GraphNotesLinked.avsc
    ├── learning/
    │   ├── CardReviewed.avsc
    │   └── CardReviewDue.avsc
    ├── engagement/
    │   ├── CommunityDeckShared.avsc
    │   ├── CommunityNoteShared.avsc
    │   ├── CommunityGroupCreated.avsc
    │   ├── CommunityGroupJoined.avsc
    │   ├── CommunityReportCreated.avsc
    │   ├── GamificationXpEarned.avsc
    │   ├── GamificationBadgeEarned.avsc
    │   ├── GamificationLevelUp.avsc
    │   └── NotificationSend.avsc
    └── shared/
        ├── TenantId.avsc
        ├── UserId.avsc
        └── CloudEventEnvelope.avsc
```

### 8.2 호환성 모드

```yaml
# Schema Registry 글로벌 설정
default_compatibility: BACKWARD

# Subject별 override (필요 시 보다 엄격하게)
subjects:
  Knowledge.events-value:
    compatibility: BACKWARD_TRANSITIVE  ← 더 엄격 (Note는 핵심 도메인)
```

### 8.3 스키마 변경 PR 절차

```
1. synapse-shared에 PR 생성 (변경 .avsc)
2. CI가 Schema Registry와 호환성 검증
3. 영향 받는 서비스 트랙 owner 모두 approve
4. 팀장 최종 승인
5. 머지 시 Schema Registry 자동 등록 (CI/CD)
6. 영향 받는 서비스 PR도 동시 또는 직후 머지
```

### 8.4 ⚠️ 절대 금지

```
❌ 호환성 모드 NONE 사용
❌ 필드 이름 변경 (aliases 사용)
❌ default 값 없는 필드 추가
❌ enum 값 제거
❌ 필수 필드 삭제
```

---

## 9. 환경별 분기 (GitOps Kustomize)

### 9.1 GitOps 레포 구조

```
synapse-gitops/
├── apps/
│   ├── platform-svc/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── istio-virtualservice.yaml
│   │   │   └── kustomization.yaml
│   │   └── overlays/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   ├── engagement-svc/
│   ├── knowledge-svc/
│   ├── learning-card/    ← learning-svc 내 두 컨테이너 분리
│   └── learning-ai/
├── infra/
│   ├── istio/
│   ├── monitoring/        (Prometheus, Grafana, Loki, Jaeger)
│   ├── ingress/           (ALB Ingress)
│   └── external-secrets/  (External Secrets Operator)
├── argocd/
│   ├── applicationset.yaml   ← 모든 서비스를 한 번에 정의
│   └── projects.yaml
└── RELEASE_NOTES.md
```

### 9.2 환경별 분기 예시

`apps/platform-svc/overlays/dev/kustomization.yaml`:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: synapse-dev

resources:
  - ../../base

images:
  - name: platform-svc
    newName: 1234567890.dkr.ecr.ap-northeast-2.amazonaws.com/synapse-platform-svc
    newTag: abc1234  ← CI가 자동 업데이트

patches:
  - path: deployment-patch.yaml  ← dev 환경 리소스 축소
```

### 9.3 ArgoCD ApplicationSet

`argocd/applicationset.yaml`:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: synapse-services
spec:
  generators:
    - matrix:
        generators:
          - list:
              elements:
                - service: platform-svc
                - service: engagement-svc
                - service: knowledge-svc
                - service: learning-card
                - service: learning-ai
          - list:
              elements:
                - env: dev
                  autoSync: true
                - env: staging
                  autoSync: false
                - env: prod
                  autoSync: false
  template:
    metadata:
      name: 'synapse-{{service}}-{{env}}'
    spec:
      project: synapse
      source:
        repoURL: https://github.com/team-project-final/synapse-gitops.git
        targetRevision: main
        path: 'apps/{{service}}/overlays/{{env}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: 'synapse-{{env}}'
      syncPolicy:
        automated: '{{autoSync}}'
```

---

## 10. .gitignore 추가 항목

원안(09 문서 5.1)에 추가:

```gitignore
# Python (learning-ai)
__pycache__/
*.pyc
.venv/
venv/
.pytest_cache/
.mypy_cache/

# Avro generated
src/main/generated-sources/
build/generated-main-avro-java/

# K8s secrets (절대 commit X)
*.kubeconfig
secrets/
*.sops.yaml      ← SOPS 암호화 안 한 것

# Spring Boot
HELP.md

# IDE 추가
.cursor/
.claude/
.idea/sonarlint/

# AWS
.aws/credentials
*.pem
```

---

## 11. 위키 문서 업데이트 필요 사항

기존 18개 위키 문서 중 다음을 갱신:

| 문서 | 갱신 사항 |
|---|---|
| 03_프로젝트_아키텍처_정의서 | 10개 서비스 → 4개 서비스로 재구성. K8s 리소스 표 갱신 |
| 09_Git_규칙_정의서 | 이 문서를 "Appendix A: 폴리레포 보강" 형태로 통합 |
| 10_환경_설정_템플릿 | docker-compose 4개 서비스로 재작성 |
| 14_배포_가이드 | GitOps + ArgoCD 흐름 명시. ApplicationSet 추가 |
| 17_스케줄 | Phase 1~4 일정으로 재작성 |
| 18_기술_스택_정의서 | Schema Registry, Spring Modulith 추가 |

---

## 12. Day 1 셋업 체크리스트

### 12.1 GitHub 셋업

- [ ] 6개 Tier 1 레포 생성
  - [ ] synapse-platform-svc
  - [ ] synapse-engagement-svc
  - [ ] synapse-knowledge-svc
  - [ ] synapse-learning-svc (모노레포 — Java + Python)
  - [ ] synapse-frontend (Flutter)
  - [ ] synapse-shared
- [ ] synapse-mirror 레포 생성 (private)
- [ ] synapse-gitops 레포 생성 (private)
- [ ] 각 레포에 CODEOWNERS 추가
- [ ] Branch protection (main: PR 필수, 2 approval)
- [ ] PAT 발급 (MIRROR_TOKEN, GITOPS_TOKEN)
- [ ] 각 서비스 레포 secrets에 PAT 등록

### 12.2 인프라 셋업

- [ ] AWS EKS 클러스터 (synapse-prod, synapse-staging, synapse-dev)
- [ ] ECR 레포지토리 (서비스별 6개)
- [ ] RDS PostgreSQL (Multi-AZ + pgvector)
- [ ] MSK (Kafka) 또는 Confluent Cloud
- [ ] Confluent Schema Registry
- [ ] ElastiCache Redis Cluster
- [ ] Elasticsearch (OpenSearch on AWS)
- [ ] AWS Secrets Manager + External Secrets Operator
- [ ] ArgoCD 설치 + GitOps 레포 연동
- [ ] Istio 설치 (mTLS)

### 12.3 워크플로 셋업

- [ ] 각 서비스 레포에 mirror.yml 추가
- [ ] 각 서비스 레포에 ci.yml + deploy.yml (GitOps 갱신)
- [ ] synapse-shared에 schema-check.yml 추가
- [ ] synapse-gitops에 ApplicationSet 정의

### 12.4 첫 코드 작성

- [ ] synapse-shared: 첫 Avro 스키마 (UserRegistered.avsc)
- [ ] 각 서비스 레포: Spring Boot/FastAPI 골격 + Hello World
- [ ] 첫 미러링 동작 확인
- [ ] 첫 GitOps 자동 갱신 동작 확인

---

## 13. 트랩 모음

### 트랩 1: PAT 권한 너무 넓음
- 증상: classic PAT를 secrets에 저장
- 결과: 토큰 유출 시 전 시스템 위험
- 해법: fine-grained PAT, 대상 레포만, Contents: write만

### 트랩 2: 미러 레포에 직접 commit
- 증상: "여기서도 수정 가능" 하고 직접 변경
- 결과: 다음 미러링 시 덮어씌워짐
- 해법: README에 큰 경고 + branch protection (Action만 write)

### 트랩 3: Submodule 시도
- 증상: Tier 3에 Submodule 도입 (시리즈 #12 참조)
- 결과: K8s 환경에서 시대착오. 학습 부담만 큼
- 해법: 무조건 GitOps 패턴 (Kustomize image tag)

### 트랩 4: Schema Registry 없이 Kafka 시작
- 증상: JSON 메시지로 시작, 나중에 Avro로 전환 시도
- 결과: 진화 호환성 깨짐, 운영 사고
- 해법: 처음부터 Schema Registry + Avro

### 트랩 5: 1인 1서비스 안티패턴 부활
- 증상: "트랙 X 멤버가 X 서비스 PR 다 봐도 OK"
- 결과: 사일로화. 휴가 시 마비
- 해법: 팀장 cross-review 강제 (CODEOWNERS)

### 트랩 6: GitOps 레포에 secret 커밋
- 증상: K8s Secret yaml에 평문 비밀번호
- 결과: 보안 사고
- 해법: External Secrets Operator + AWS Secrets Manager. 또는 SOPS 암호화

### 트랩 7: 너무 많은 레포
- 증상: shared 라이브러리를 5개로 분리
- 결과: 의존성 관리 폭발
- 해법: synapse-shared 1개로 통일. 정말 필요할 때만 분리

### 트랩 8: 빌드 산출물 미러링
- 증상: target/, build/, node_modules/ 가 mirror에
- 결과: 미러 레포 거대화
- 해법: rsync exclude 명시

### 트랩 9: 호환성 모드 NONE 사용
- 증상: "검증 귀찮으니 NONE"
- 결과: 한 달 후 Consumer 폭발
- 해법: 무조건 BACKWARD 이상

### 트랩 10: 통합 배포 태그 누락
- 증상: 각 서비스 SemVer만 관리, GitOps 태그 없음
- 결과: "어느 시점에 무엇이 배포됐나" 모름. 롤백 어려움
- 해법: synapse-gitops에 v{날짜} 태그 강제

---

## 14. 시리즈 다른 문서와의 매핑

| 시리즈 문서 | 이 보강 문서에서의 적용 |
|---|---|
| #1 SCS | 4개 서비스 = 4개 SCS 폴리레포 |
| #3 Outbox | 각 서비스의 Kafka 발행에 적용 |
| #5 Inbox | 각 서비스의 Kafka 소비에 적용 |
| #11 Schema Registry | synapse-shared에 Avro + 호환성 검증 |
| #12 Hybrid Repo Strategy | 3-Tier 하이브리드의 K8s 변형 |

---

## 15. FAQ

### Q1. 왜 Submodule 안 쓰나?
> K8s + ArgoCD 환경에선 GitOps가 정석. Submodule은 다음 단점:
> - K8s manifest 관리에 부적합
> - 학습 곡선 높음 (`git clone --recursive` 필수)
> - 7명 팀에 운영 부담
>
> 대신 GitOps 레포에 Kustomize image tag로 버전 핀.

### Q2. 미러 레포가 정말 필요한가?
> 7명 팀 + 6개 서비스 레포 = 흩어진 코드. 미러는:
> - Claude Code 등 AI 도구가 전체 코드를 한 번에 봄
> - 7명이 다른 트랙 코드를 학습 (사일로 방지)
> - GitHub 사고 시 백업
> - ripgrep, grep으로 전체 검색
>
> 자동 동기화라 운영 부담 0. 매우 권장.

### Q3. 모든 서비스가 같은 SemVer를 가져야 하나?
> 아니. 서비스별 독립 SemVer. 운영 배포 시점만 GitOps 통합 태그로 식별.

### Q4. Frontend는 왜 별도 레포?
> Flutter 빌드 환경이 다름. 또한 모든 트랙이 협업하는 영역이라 별도 레포가 깔끔.

### Q5. shared 레포는 안전한가?
> Avro 스키마 변경은 호환성 검증으로 안전. 단, **팀장 단독 승인** + Schema Registry **BACKWARD** 강제.

---

*작성: Synapse 프로젝트 Git 규칙 보강*
*상태: Proposed (팀 합의 후 09 문서의 Appendix A로 통합)*
*기반 문서: 09_Git_규칙_정의서 (기존)*
*동반 문서: SYNAPSE_Service_Consolidation.md*
*시리즈 참조: MSA_Hybrid_Repo_Strategy.md (#12)*
