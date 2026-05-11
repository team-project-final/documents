# 00 — 공통 합류 가이드 (Day 0 + Day 1)

> **대상**: 모든 합류자 (트랙 무관)
> **소요**: Day 0 ~1시간 + Day 1 공통 ~1.5시간

이 문서를 다 마치면 자기 트랙 가이드(01~05)로 넘어가서 트랙별 Day 1 작업을 진행합니다.

---

## Day 0 — 합류 전날 준비 (필수)

### 0.1 계정 + 권한

- [ ] **GitHub 계정** 생성 또는 기존 계정 사용
  - 2FA 활성화 (TOTP 또는 hardware key)
  - SSH 키 등록 (`ssh-keygen -t ed25519` → GitHub Settings → SSH keys)
- [ ] **`team-project-final` org 합류 초대 수락**
  - `@team-lead` (현재 `@VelkaressiaBlutkrone`)가 초대 발송
  - https://github.com/team-project-final 방문해서 8개 레포가 보이는지 확인
- [ ] **자기 트랙 mention 확인**
  - 트랙 A → `@platform-owner` placeholder를 본인 handle로 치환할 예정 (CODEOWNERS 첫 PR `feature/INFRA-002-codeowners-trackmap`)
  - 트랙 B/C/D/협업도 동일 패턴

### 0.2 로컬 도구 설치

OS 무관 공통:
```
□ git 2.40+         (git --version)
□ gh CLI 2.40+      (gh --version)
□ Docker Desktop    (docker --version, docker compose version)
□ VS Code 또는 IntelliJ IDEA
```

트랙별 추가 (Day 1에 자기 트랙 가이드에서 다시 확인):
```
□ Java 21 (Temurin 권장)     — platform / engagement / knowledge / learning-card / shared 트랙
□ Python 3.11+               — learning-ai 트랙
□ Flutter 3.x stable         — frontend 협업
□ Node.js 20 LTS             — gitops 도구 일부, frontend 보조
```

### 0.3 gh CLI 인증

```bash
gh auth login
# > GitHub.com → HTTPS → Login with a web browser → 화면 안내 따라 인증
gh auth status
# > Logged in to github.com account <YOUR_HANDLE>
gh api user/memberships/orgs/team-project-final --jq '.role'
# > member (또는 admin)
```

### 0.4 syn(documents) 레포 클론 + 위키 정독

```bash
# Windows
mkdir D:/workspace/synapse && cd D:/workspace/synapse

# macOS/Linux
mkdir -p ~/workspace/synapse && cd ~/workspace/synapse

gh repo clone team-project-final/documents
gh repo clone team-project-final/documents.wiki
```

> **참고**: `syn` 폴더는 사실 `documents` 레포의 별칭입니다 (`16ea6b6 docs(notes): 가이드 v1.1 보정 — syn 폴더 = documents 레포 자체임 반영`). 별도 `syn` 레포는 없습니다.

위키 정독 순서 (Day 0 ~45분):

1. **18 기술 스택 정의서** — 전체 스택 한눈에
2. **03 아키텍처 정의서 v2.0** — 4-서비스 통합 구조 + 자기 서비스 찾기
3. **09 Git 규칙 정의서 v2.0** — Part A (한 레포 안의 규칙)만 정독, Part B/C는 트랙별 가이드에서
4. **09a Git 워크플로우 가이드** — 시나리오 A/B/C 6개 워크스루
5. **17 스케줄 v3.0** — 자기 트랙의 W1~W5 일정만 확인

나머지 13개 위키 문서(01·02·04~08·10~16)는 트랙별 가이드에서 필요 시점에 안내합니다.

### 0.5 DESIGN.md 정독

```bash
cd D:/workspace/synapse/documents
cat DESIGN.md   # 또는 IDE에서 열기
```

UI 변경이 없는 트랙(platform/engagement/knowledge/learning) 멤버도 한 번은 봐야 합니다:
- Warm Amber 색상이 어디서 쓰이는지
- 게이미피케이션 UI 가이드 (XP/배지/리더보드 표시 절제 원칙)
- 다른 형제 프로젝트(StockPilot/DevPath/StudyMate)와의 의도적 차별화

### 0.6 Slack/Discord/Notion 합류

- `@team-lead`로부터 다음 채널 초대를 받음:
  - `#synapse-dev` — 일반
  - `#architecture` — 아키텍처 토론
  - `#devops` — 빌드/배포
  - `#incident` — 운영 장애
  - 그 외 `#security`, `#docs` 등

본인 자기소개 1줄(트랙 + 합류일)을 `#synapse-dev`에 올리는 게 첫 인사로 적절합니다.

---

## Day 1 — 첫 출근일 공통 작업

### 1.1 환경 점검 (재확인, ~10분)

```bash
gh auth status                # 정상
gh api user --jq '.login'     # 본인 handle 출력

git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 1.2 부트스트랩 결과 확인 (~10분)

자기 트랙 작업 전에 부트스트랩이 어떤 상태에서 끝났는지 확인합니다:

```bash
# 8개 레포 모두 살아있는지
gh repo list team-project-final --limit 20 --json name,visibility \
  --jq '.[] | select(.name | startswith("synapse-")) | "\(.name) — \(.visibility)"'
```
기대 출력:
```
synapse-platform-svc — PUBLIC
synapse-engagement-svc — PUBLIC
synapse-knowledge-svc — PUBLIC
synapse-learning-svc — PUBLIC
synapse-frontend — PUBLIC
synapse-shared — PUBLIC
synapse-mirror — PRIVATE
synapse-gitops — PRIVATE
```

```bash
# 자기 레포의 첫 Actions run이 성공적으로 끝났는지
# (자기 트랙 레포로 치환)
gh run list --repo team-project-final/synapse-platform-svc --limit 3
```

부트스트랩 보고서 확인 (트랙 무관 전체 결과):
```bash
cd D:/workspace/synapse/documents
cat scripts/bootstrap/reports/phase3-2026-05-12.md
```

### 1.3 09 Git 규칙 v2.0 §0.3 매핑 확인

```bash
grep -A 12 "0.3 트랙 ↔ 레포 ↔ Owner 매핑" \
  D:/workspace/synapse/documents.wiki/09_Git_규칙_정의서.md
```

자기 트랙이 표에 있는지, mention(`@platform-owner` 등)이 본인 handle과 어떻게 매핑될지 확인합니다.

### 1.4 (공통) CODEOWNERS 갱신 PR 참여

W1 첫주의 가장 중요한 공통 작업은 8개 레포의 CODEOWNERS를 현재 임시 단일 owner(`@VelkaressiaBlutkrone`)에서 09 §A4 트랙별 매핑으로 갱신하는 것입니다.

이 PR은 `@team-lead`가 만들고(`feature/INFRA-002-codeowners-trackmap`), 합류자는 자기 mention이 맞는지 review 댓글로 확인합니다.

각 레포 `.github/CODEOWNERS`가 다음처럼 바뀝니다 (synapse-platform-svc 예시):

```diff
- *  @VelkaressiaBlutkrone
+ *                  @VelkaressiaBlutkrone @platform-owner-실제-handle
+ /auth/             @VelkaressiaBlutkrone @platform-owner-실제-handle
+ /billing/          @platform-owner-실제-handle @VelkaressiaBlutkrone
+ /audit/            @platform-owner-실제-handle
+ /notification/     @platform-owner-실제-handle
```

본인의 mention이 자기 트랙의 디렉토리에 매핑되어 있는지 확인하고 `LGTM` 댓글 또는 review approve 합니다.

### 1.5 트랙별 가이드로 넘어가기

이제 자기 트랙에 맞는 가이드로 가서 Day 1 트랙별 작업(~3시간)을 진행하세요:

- 트랙 A → [01-platform-track.md](./01-platform-track.md)
- 트랙 B → [02-engagement-track.md](./02-engagement-track.md)
- 트랙 C → [03-knowledge-track.md](./03-knowledge-track.md)
- 트랙 D → [04-learning-track.md](./04-learning-track.md)
- frontend 협업 → [05-frontend.md](./05-frontend.md)

---

## FAQ

**Q1. 부트스트랩이 뭐고 내가 알아야 하나?**
> 2026-05-12에 `@team-lead`가 8개 레포 + 워크플로 + Hello World 골격을 한 번에 셋업한 작업입니다. 합류자는 그 위에 비즈니스 로직을 쌓아 올리면 됩니다. 자세한 내용은 [부트스트랩 스펙](../superpowers/specs/2026-05-12-polyrepo-bootstrap-design.md)을 보세요.

**Q2. `@team-lead` cross-review가 필수라는데, 팀장이 휴가면 PR이 막히나?**
> 09 §A4의 CODEOWNERS 정책은 트랙 owner + `@team-lead` 둘 다 approve. 팀장 부재 시 대리(`@team-lead-backup`) 지정 또는 enforce_admins 임시 우회 정책이 09 §C2 트랩 5에 안내되어 있습니다.

**Q3. 8개 레포를 다 클론해야 하나?**
> 본인 트랙 레포 + `synapse-shared` (Avro 스키마 참조) + `documents` (위키 + DESIGN.md) 3개면 충분합니다. mirror/gitops는 보통 클론할 일 없고, 다른 트랙 레포는 cross-repo 변경(시나리오 B/C — 09a 가이드 §3) 시에만 클론.

**Q4. mirror 레포는 뭔가?**
> 모든 Tier 1 레포의 코드를 한곳에 모은 자동 동기화 사본입니다. AI 도구 사용/팀 cross-search/백업 목적. **절대 직접 commit 안 됨** (Action만 write). 09 §B2 참조.

**Q5. 발급해야 할 secrets가 많은데, 내가 다 발급하나?**
> 자기 트랙의 외부 SaaS만 발급합니다. 예: platform → Google OAuth + Stripe + FCM; learning-ai → Anthropic + OpenAI. 트랙별 SECRETS.md에 인벤토리가 있고, 본인 트랙 가이드에서 자세한 발급 절차 안내.

**Q6. 본격 코딩은 언제 시작하나?**
> Day 1 마지막에 첫 비즈니스 PR(`feature/<PREFIX>-002-...`)을 만들면서 시작합니다. 부트스트랩이 Hello World + Modulith placeholder까지 깔아뒀으니 빈 placeholder를 실제 기능으로 채우는 게 첫 PR.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — 부트스트랩 완료 시점 기준 합류 가이드 |
