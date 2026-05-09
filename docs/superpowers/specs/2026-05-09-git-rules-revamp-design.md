# 09_Git_규칙_정의서 v2.0 — 전면 개편 설계서

> **상태**: Spec (브레인스토밍 산출물)
> **작성일**: 2026-05-09
> **대상 문서**: `syn.wiki/09_Git_규칙_정의서.md`
> **개편 방향**: 모노레포 가정 → 4-서비스 폴리레포 + 미러 + GitOps 전제로 풀 재작성
> **근거 문서**:
>  - `syn/docs/SYNAPSE_Service_Consolidation.md` (10→4 서비스 통합, 1+1+2+2 트랙)
>  - `syn/docs/SYNAPSE_Git_Rules_Polyrepo_Supplement.md` (폴리레포·미러·GitOps·Schema Registry 보강)

---

## 1. 개요

### 1.1 목적
현재 `09_Git_규칙_정의서.md` v1.1은 **모노레포 가정** 하에 작성되어 단일 `main`, 도메인 약어 기반 브랜치 prefix(AUTH/NOTE/CARD/...), 단일 SemVer 태그, `* @synapse-team` 식의 단일 CODEOWNERS를 규정한다. 이는 두 source 문서가 결정한 **4-서비스 폴리레포 + 미러 + GitOps + Schema Registry** 구조와 정면으로 어긋난다. 본 개편은 09 문서를 v2.0으로 전면 재작성하여 source 문서의 결정과 디테일을 본문에 흡수한다.

### 1.2 작업 범위
- `syn.wiki/09_Git_규칙_정의서.md`를 **in-place 전면 재작성** (v1.1 → v2.0)
- 두 source 문서(SYNAPSE_Git_Rules_Polyrepo_Supplement.md / SYNAPSE_Service_Consolidation.md)의 결정 사항·표·체크리스트·트랩·FAQ·ADR을 09 본문에 통합
- 문서 상단에 03/14/17/18/10 후속 갱신 안내 주의문 추가
- 변경 이력에 v2.0 추가 + v1.x → v2.0 절 매핑 표 부록

### 1.3 비범위 (out-of-scope)
- `03_프로젝트_아키텍처_정의서.md` 갱신 (10→4 서비스 그림 재작성) — **후속 작업**
- `17_스케줄.md` 갱신 (4주 일정 vs Phase 1~4 정합성) — **후속 작업**
- `18_기술_스택_정의서.md` 갱신 (Schema Registry / Spring Modulith 추가) — **후속 작업**
- `14_배포_가이드.md` 갱신 (GitOps + ArgoCD + ApplicationSet) — **후속 작업**
- `10_환경_설정_템플릿.md` 갱신 (4-서비스 docker-compose) — **후속 작업**
- 실제 GitHub 레포·CODEOWNERS·workflow 파일 생성 — 본 spec 범위 밖
- ADR 채택 거버넌스 (팀 합의 회의 기록) — 본 spec은 채택 결과를 가정

---

## 2. 결정 사항 (브레인스토밍 결과)

| # | 결정 항목 | 채택 옵션 | 핵심 |
|---|---|---|---|
| Q1 | 개편 깊이 | **A. 풀 재작성** | source 두 문서를 본문에 통째 흡수, 모노레포 흔적 제거 |
| Q2 | 위키 정합성 처리 | **a. 명시적 주의문 + 후속 작업** | 09 상단에 03/14/17/18/10 후속 갱신 안내 |
| Q3 | 분량/디테일 | **나. 정책 풀 흡수 + YAML 핵심만 인라인** | 미러링 워크플로 1개·GitOps deploy 단계는 인라인, ApplicationSet/schema-check 풀 코드는 source 참조 |
| Q4 | ADR 상태 | **3. Accepted + 채택일 명시** | ADR-001/002 채택일 = 2026-05-09 |
| Q5 | 트랙 멤버 표기 | **ㄴ. role-based 영문 placeholder** | `@team-lead`, `@platform-owner`, `@knowledge-owner-1` 등 |
| Q6 | Phase 정보 위치 | **iii. 1단락 요지 + source 참조** | 09는 Git 규칙 문서. Phase 1~4 상세는 source §5에 위임 |
| 구조 | 목차 구조 | **Z. 3-파트 (한 레포 안 / 레포 간 / 운영) + 부록** | source §0의 정신 구조와 일치 |

---

## 3. v2.0 메타데이터 / 상단 주의문

문서 최상단(제목 직후)에 다음 블록을 배치한다.

```markdown
# 9. Git 규칙 정의서

> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
> **버전**: v2.0
> **작성일**: 2026-05-07
> **수정일**: 2026-05-09
> **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

> ⚠️ **v2.0 전면 개편 안내**
>
> 본 문서는 v1.x의 모노레포 가정에서 **4-서비스 폴리레포(+ 미러 + GitOps + Schema Registry)** 전제로 전면 재작성되었다. 근거: ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 (Appendix A·B).
>
> 본 개편의 전제와 일시적으로 어긋나는 위키 문서:
>  - `03_프로젝트_아키텍처_정의서` (여전히 10개 서비스 그림)
>  - `17_스케줄` (4주 일정 / 트랙 분배가 Q5 매핑과 다름)
>  - `18_기술_스택_정의서` (Schema Registry / Spring Modulith 미반영)
>  - `14_배포_가이드` (GitOps / ArgoCD ApplicationSet 미반영)
>  - `10_환경_설정_템플릿` (10-서비스 docker-compose 가정)
>
> 위 문서들은 본 09 v2.0 채택 직후 후속 작업으로 갱신된다. 신규 팀원은 충돌 시 09 v2.0을 우선한다.
```

---

## 4. 본문 구조 (Z — 3-파트)

```
0. 전제
   0.1 ADR 요지
   0.2 Phase 요지 (1단락)
   0.3 트랙↔레포↔Owner 매핑표
   0.4 이 문서의 위치 안내 (Part A/B/C 역할)

Part A — 한 레포 안의 규칙
   A1. 브랜치 전략 (서비스별 GitHub Flow)
   A2. 커밋 메시지 (Conventional Commits, 4-서비스 Scope 매트릭스)
   A3. Pull Request (템플릿·승인 정책·자동화)
   A4. CODEOWNERS (8개 레포)
   A5. 릴리즈/태깅 (서비스별 SemVer)
   A6. .gitignore / Git Hooks

Part B — 레포 간의 규칙
   B1. 레포 구조 3-Tier
   B2. 미러링 자동화 (synapse-mirror)
   B3. GitOps 갱신 (synapse-gitops)
   B4. Schema Registry (synapse-shared)
   B5. 통합 배포 태그 (synapse-gitops/v{날짜})
   B6. PAT 정책

Part C — 운영
   C1. Day 1 셋업 체크리스트
   C2. 흔한 트랩 10가지
   C3. FAQ
   C4. 시리즈·위키 문서 매핑

부록
   Appendix A. ADR-001 (10→4 통합) — 전문 인용
   Appendix B. ADR-002 (AI Service 통합) — 전문 인용
   Appendix C. v1.x → v2.0 절 매핑표

변경 이력
```

---

## 5. 트랙↔레포↔Owner 매핑표 (0.3 — 한 번만 정의, 본문 전반에서 참조)

본 매핑표는 09 v2.0 §0.3에 1회 명시되며, 이후 본문 모든 절의 CODEOWNERS·승인 규칙·자동화·체크리스트는 이 영문 handle을 그대로 사용한다. 실제 GitHub handle은 Day 1 셋업 시 본 표만 갱신하면 본문 전반이 일괄 적용된다.

| 트랙 | 인원 | 담당 서비스 | 통합 원본 도메인 | 영문 handle (placeholder) |
|---|:---:|---|---|---|
| 팀장 | 1 | (전 영역 cross-review + 인프라/공통) | — | `@team-lead` |
| 트랙 A | 1 | synapse-platform-svc | Auth + Audit + Billing + Notification | `@platform-owner` |
| 트랙 B | 1 | synapse-engagement-svc | Community + Gamification | `@engagement-owner` |
| 트랙 C | 2 | synapse-knowledge-svc | Note + Graph + Chunking | `@knowledge-owner-1`, `@knowledge-owner-2` |
| 트랙 D | 2 | synapse-learning-svc (Java + Python) | Card + SRS + AI | `@learning-card-owner` (Java), `@learning-ai-owner` (Python) |
| 협업 | 전체 | synapse-frontend (Flutter) | UI | `@team-lead` + 모든 owner |
| 단독 관리 | 팀장 | synapse-shared, synapse-gitops, synapse-mirror | Avro / K8s manifest / 미러 | `@team-lead` |

> Day 1 운영 전환 시 위 placeholder를 실제 GitHub handle 또는 GitHub Team mention(`@team-project-final/<team-name>`)으로 일괄 치환한다.

---

## 6. 절별 작성 명세 (작성자가 그대로 따를 수 있는 수준)

각 항목은 **흡수(원본 09에서 그대로) / 갱신(폴리레포 전제로 수정) / 신규(source에서 새로 추가) / 이동(다른 절로) / 제거(폐기)** 4종 액션으로 표시한다.

### 0. 전제

| 항목 | 액션 | 출처 / 내용 |
|---|---|---|
| 0.1 ADR 요지 | 신규 | source Service_Consolidation §1·§2 — "10→4 통합 + 1+1+2+2 트랙" 한 단락 요약. 상세는 Appendix A/B 안내 |
| 0.2 Phase 요지 | 신규 | source Service_Consolidation §5 — "Phase 1 MVP → Phase 2 핵심 기능 → Phase 3 고도화 → Phase 4 분리 검토" 한 단락. 상세 일정·범위는 source §5 / 위키 17 참조 |
| 0.3 매핑표 | 신규 | 본 spec §5 표를 그대로 사용 |
| 0.4 위치 안내 | 신규 | "Part A는 한 레포 안의 규칙 / Part B는 레포 간의 규칙 / Part C는 운영 / 부록은 ADR 전문" 한 단락 |

### A1. 브랜치 전략

| 항목 | 액션 | 내용 |
|---|---|---|
| 단일 main → 서비스별 main | 갱신 | "각 Tier 1 레포가 독립적으로 GitHub Flow를 따른다." 도식 — synapse-platform-svc / synapse-knowledge-svc / synapse-learning-svc 각각 main + feature 브랜치 예시 |
| 브랜치 prefix 표 | 갱신 | 8종 prefix로 재정의: `feature/PLAT-NNN-`, `feature/ENG-NNN-`, `feature/KNOW-NNN-`, `feature/LEARN-CARD-NNN-`, `feature/LEARN-AI-NNN-`, `feature/SHARED-NNN-`, `feature/FE-NNN-`, `feature/INFRA-NNN-`. fix/hotfix/docs/chore/refactor/test도 동일 prefix 규칙 적용 |
| 브랜치 수명·보호·삭제 | 흡수 그대로 | 5일 / main 보호 / force push 금지 / 머지 후 자동 삭제 |
| Mermaid gitGraph | 갱신 | 단일 서비스(예: synapse-knowledge-svc) 하나에 한정한 그래프로 재작성. 도메인 prefix를 `KNOW-NNN`으로 |

### A2. 커밋 메시지

| 항목 | 액션 | 내용 |
|---|---|---|
| Conventional Commits 형식 | 흡수 그대로 | `<type>(<scope>): <subject>` + body + footer |
| Type 표 (feat/fix/docs/style/refactor/test/chore/perf/ci/revert) | 흡수 그대로 | 10종 type 정의 + SemVer 영향 |
| Scope 표 | 갱신 (전면 재정의) | 4-서비스 × 내부 모듈 매트릭스로 재작성: <br>**platform-svc**: `auth`, `audit`, `billing`, `notification` <br>**engagement-svc**: `community`, `gamification` <br>**knowledge-svc**: `note`, `graph`, `chunking` <br>**learning-svc**: `card`, `srs`, `ai` <br>**cross**: `shared`, `infra`, `ui`, `api` |
| 도메인별 커밋 예시 | 흡수 + 갱신 | 기존 community/gamification/notification 예시는 유효. wikilink/SM-2/OAuth 예시도 흡수 |
| 커밋 규칙 (제목 50자 / 본문 72자 / Breaking Change `!` / Issue 키워드) | 흡수 그대로 | 변경 없음 |

### A3. Pull Request 규칙

| 항목 | 액션 | 내용 |
|---|---|---|
| PR 제목 형식 | 흡수 그대로 | `<type>(<scope>): <설명> (#이슈)` |
| PR 본문 템플릿 | 갱신 (4개 항목 추가) | 기존 6개 항목(변경 사항·변경 유형·관련 이슈·테스트 방법·스크린샷·체크리스트) 유지 + source §4.2 신규 4개 추가: <br>① 영향 받는 다른 서비스 (platform/engagement/knowledge/learning(card/ai)/shared/frontend/없음) <br>② 이벤트·스키마 변경 (새 토픽 / 기존 스키마 변경 + 호환성 모드 / 새 Internal REST / 변경 없음) <br>③ 호환성 검증 (Schema Registry BACKWARD 통과 / 해당 없음) <br>④ 미러링·GitOps 영향 (자동 미러링 정상 / GitOps image tag 자동 갱신 정상 / 해당 없음) |
| PR 승인 정책 | 갱신 (전면 재정의) | 기존 "최소 1명 Approve" → 변경 종류별 7행 표: <br>일반 feature/fix → `@team-lead` + 트랙 owner 1명 <br>Auth/보안 → `@team-lead` + `@platform-owner` (이중 승인) <br>Shared 라이브러리 → `@team-lead` 단독 <br>Avro 스키마 → `@team-lead` + 영향받는 트랙 <br>GitOps → `@team-lead` 단독 <br>Hotfix → `@team-lead` 단독 <br>Frontend (UI) → `@team-lead` + 트랙 owner |
| 머지 방식·크기·리뷰 SLA·라벨 | 흡수 그대로 | Squash and Merge (feature) / Merge Commit (hotfix) / 400줄 / 24시간 / size 라벨 |
| CI 자동화 | 갱신 (4종 추가) | 기존 7종(Lint·단위·통합·빌드·커버리지·SonarQube·Snyk) + 신규 4종: <br>① **ArchUnit + Spring Modulith** 모듈 경계 위반 차단 <br>② **Schema Registry 호환성** 검증 (BACKWARD) <br>③ **미러링** push (`mirror.yml`) <br>④ **GitOps 갱신** (image tag bump in `synapse-gitops`) |

### A4. CODEOWNERS

| 항목 | 액션 | 내용 |
|---|---|---|
| 8개 레포 CODEOWNERS 코드블록 | 신규 (한국어→영문 치환) | source §3.1의 8개 코드블록(synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc / synapse-shared / synapse-gitops / synapse-mirror / synapse-frontend)을 본 spec §5의 영문 handle로 치환하여 인용. synapse-frontend는 "전 트랙 협업"(`@team-lead` + 모든 owner) 형태 |
| 핵심 변경 안내 박스 | 흡수 | source §3.2 — "원안 `* @synapse-team` → 명시적 owner + `@team-lead` cross-review" 4줄 박스 |
| Day 1 치환 안내 | 신규 | "Day 1 시 영문 placeholder를 실제 GitHub handle 또는 Team mention으로 치환" 1줄 |

### A5. 릴리즈 / 태깅 (서비스별 SemVer)

| 항목 | 액션 | 내용 |
|---|---|---|
| SemVer 형식 | 흡수 그대로 | `v{MAJOR}.{MINOR}.{PATCH}[-{pre-release}]` |
| MAJOR/MINOR/PATCH 정의 표 | 흡수 그대로 | 4행 표 |
| 단일 v1.0.0 → 서비스별 SemVer | 갱신 | "각 Tier 1 레포는 독립적으로 SemVer 태그를 단다" 예시 5종 (platform v1.2.3 / engagement v0.8.1 / knowledge v2.1.0 / learning v1.5.7 / shared v0.4.2) |
| 릴리즈 프로세스 | 갱신 (전면 재작성) | 기존 6단계 → 5단계 재작성: <br>① 각 서비스 main에서 릴리즈 준비 (CHANGELOG.md 갱신) <br>② 서비스 SemVer 태그 (예: `git tag v1.2.3`) <br>③ CI가 ECR 이미지 빌드·푸시 <br>④ CI가 synapse-gitops의 dev overlay `kustomization.yaml` newTag bump <br>⑤ ArgoCD가 dev 자동 동기화 / staging·prod는 수동 승인 |
| CHANGELOG | 갱신 | "각 Tier 1 레포에 CHANGELOG.md 분리 + 통합 RELEASE_NOTES는 synapse-gitops에 (Part B5 참조)" |
| 통합 배포 태그 | 이동 (Part B5로) | A5에서는 한 줄 안내만 — "여러 서비스를 묶은 운영 시점 식별은 B5 참조" |

### A6. .gitignore / Git Hooks

| 항목 | 액션 | 내용 |
|---|---|---|
| 기존 .gitignore | 흡수 그대로 | IDE / Build / Environment / OS / Dependencies 5개 카테고리 |
| .gitignore 추가 항목 | 갱신 (추가) | source §10 흡수: <br>**Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `.pytest_cache/`, `.mypy_cache/` <br>**Avro**: `src/main/generated-sources/`, `build/generated-main-avro-java/` <br>**K8s secrets**: `*.kubeconfig`, `secrets/`, `*.sops.yaml`(미암호화) <br>**Spring Boot**: `HELP.md` <br>**IDE 추가**: `.cursor/`, `.claude/`, `.idea/sonarlint/` <br>**AWS**: `.aws/credentials`, `*.pem` |
| Git Hooks (Husky / pre-commit) | 흡수 그대로 | 3종 훅 (pre-commit lint-staged / commit-msg Conventional Commits 검증 / pre-push 단위 테스트) |

### B1. 레포 구조 3-Tier

| 항목 | 액션 | 내용 |
|---|---|---|
| 전체 레포 인벤토리 | 신규 | source §1.1 흡수 — Tier 1 (6개) / Tier 2 미러 (1개) / Tier 3 GitOps (1개) / 기존 documents (1개) 박스 다이어그램. 모든 레포 owner는 GitHub org `team-project-final`을 가정 |
| 레포 책임 표 | 신규 | source §1.2 — 4행 (Tier 1 / Tier 2 / Tier 3 / documents)에 권한·직접 commit 가능 여부·자동 동기화 출처 |
| 레포 명명 규칙 | 신규 | source §1.3 — `synapse-{도메인}-svc` / `synapse-{용도}` / `synapse-{이름}` |
| 트랙↔레포 매핑 | 신규 (참조) | "본 매핑은 §0.3에 정의됨 — 본 절에서는 레포 측 책임만 다룸" 1줄 |

### B2. 미러링 자동화 (synapse-mirror)

| 항목 | 액션 | 내용 |
|---|---|---|
| 미러 레포 목적 | 신규 | AI 도구 전체 코드 스캔 / 사일로 방지 / 백업 / 전체 검색 (4가지) |
| `mirror.yml` 워크플로 | 신규 (인라인 풀 코드) | source §5.2 YAML을 09에 그대로 인라인. 각 Tier 1 서비스 레포에 동일 적용 |
| rsync exclude 항목 | 신규 | `.git`, `node_modules`, `build`, `target`, `.gradle`, `__pycache__`, `.venv`, `.env*`, `*.key`, `*.pem` |
| 미러 직접 commit 금지 | 신규 | "synapse-mirror에는 사람이 직접 commit 금지 — Action만 write 권한. README에 큰 경고 + branch protection" |

### B3. GitOps 갱신 (synapse-gitops)

| 항목 | 액션 | 내용 |
|---|---|---|
| GitOps 레포 디렉토리 구조 | 신규 (트리 인라인) | source §9.1 트리 — `apps/{svc}/base + overlays/{dev,staging,prod}` / `infra/` / `argocd/` / `RELEASE_NOTES.md` |
| `deploy.yml`의 GitOps 갱신 단계 | 신규 (인라인 핵심 부분) | source §5.3의 "Build and push image to ECR" + "Update GitOps repo" + "Bump image tag" 3단계 YAML 인라인 |
| ApplicationSet 정책 요약 | 신규 (요약만) | dev autoSync=true / staging·prod autoSync=false (수동 승인). **풀 YAML은 source §9.3 참조** |
| dev/staging/prod overlay 분기 | 신규 (요약만) | "각 환경 overlay에서 image newTag·리소스 한도·환경 변수 분기. 풀 예시는 source §9.2" |

### B4. Schema Registry (synapse-shared)

| 항목 | 액션 | 내용 |
|---|---|---|
| Avro 스키마 위치 트리 | 신규 (인라인) | source §8.1 트리 — `src/main/avro/{platform,knowledge,learning,engagement,shared}/*.avsc` 17개 파일 인벤토리 |
| 호환성 모드 정책 | 신규 | 글로벌 **BACKWARD** 강제 / `Knowledge.events-value` 등 핵심 도메인은 **BACKWARD_TRANSITIVE** override (YAML 5줄 인라인) |
| 스키마 변경 PR 절차 | 신규 | source §8.3 6단계 그대로 |
| ⚠️ 절대 금지 5종 | 신규 | source §8.4: NONE 모드 / 필드 이름 변경(aliases 사용 의무) / default 없는 필드 추가 / enum 값 제거 / 필수 필드 삭제 |
| `schema-check.yml` 워크플로 | 참조만 | "풀 YAML은 source §5.4 참조" |

### B5. 통합 배포 태그 (synapse-gitops/v{날짜})

| 항목 | 액션 | 내용 |
|---|---|---|
| 2-축 태그 모델 | 신규 | "각 서비스의 SemVer는 그 서비스의 변경 추적 / 통합 배포 태그는 운영 시점 식별. 두 축은 독립적이며 서로 대체하지 않는다" |
| 통합 태그 형식 | 신규 | `synapse-gitops/v{YYYY}.{MM}.{DD}` 예시 + 묶이는 정보(서비스별 SemVer + commit sha 5종) |
| 롤백 절차 | 신규 | 통합 태그로 GitOps 레포 checkout → ArgoCD 동기화로 이전 시점 복원 |
| RELEASE_NOTES.md | 신규 | synapse-gitops에 위치, 통합 태그별 변경 묶음 기록 |

### B6. PAT 정책

| 항목 | 액션 | 내용 |
|---|---|---|
| 토큰 인벤토리 표 | 신규 | source §6.1 4행 (MIRROR_TOKEN / GITOPS_TOKEN / ECR_PUSH(OIDC) / SCHEMA_REGISTRY_*) |
| 보안 규칙 | 신규 | source §6.2: fine-grained PAT 강제(Classic 금지) / 최소 권한(Contents: write만, Repository 한정) / 90일 만료 / 만료 7일 전 자동 알림 / `@team-lead`만 발급 권한 / Personal account 토큰 → org secrets 저장 금지. GitHub App 도입을 미래 옵션으로 명시 |
| 토큰 갱신 절차 | 신규 | source §6.3 5단계 |

### C1. Day 1 셋업 체크리스트

| 항목 | 액션 | 내용 |
|---|---|---|
| GitHub 셋업 | 신규 | source §12.1 — 레포 6+2개 생성 / CODEOWNERS / Branch protection / PAT 발급·등록 |
| 인프라 셋업 | 신규 | source §12.2 — EKS 3환경 / ECR 6개 / RDS pgvector / MSK / Schema Registry / Redis / OpenSearch / External Secrets / ArgoCD / Istio |
| 워크플로 셋업 | 신규 | source §12.3 — mirror.yml / ci.yml / deploy.yml / schema-check.yml / ApplicationSet |
| 첫 코드 작성 | 신규 | source §12.4 — UserRegistered.avsc / Hello World / 첫 미러링·GitOps 검증 |

### C2. 흔한 트랩 10가지

| 항목 | 액션 | 내용 |
|---|---|---|
| 트랩 1~10 | 신규 | source §13 그대로 흡수 — PAT 권한 / 미러 직접 commit / Submodule 시도 / Schema Registry 없이 시작 / 1인 1서비스 부활 / GitOps에 secret 평문 / 너무 많은 레포 / 빌드 산출물 미러링 / 호환성 NONE / 통합 배포 태그 누락 |

### C3. FAQ

| 항목 | 액션 | 내용 |
|---|---|---|
| Q1~Q5 | 신규 | source §15 그대로 흡수 — 왜 Submodule 안 쓰나 / 미러 정말 필요한가 / 모든 서비스 같은 SemVer? / Frontend 별도 레포? / shared 안전한가? |

### C4. 시리즈·위키 문서 매핑

| 항목 | 액션 | 내용 |
|---|---|---|
| 시리즈 매핑 표 | 신규 | source §14 — 시리즈 #1·#3·#5·#11·#12 매핑 |
| 위키 문서 매핑 표 | 신규 (확장) | source §11 흡수 + 후속 갱신 항목 명시: 03 / 10 / 14 / 17 / 18 갱신 사항 |

### Appendix A. ADR-001 (10→4 통합)

source Service_Consolidation §8.1을 전문 인용. 단 다음 1줄 변경:
- 원본: `**상태**: Proposed (팀 합의 후 Accepted로 변경)`
- v2.0: `**상태**: Accepted (채택일 2026-05-09)`

### Appendix B. ADR-002 (AI Service 통합)

source Service_Consolidation §8.2를 전문 인용. 동일하게 상태를 Accepted로 변경:
- 원본: `**상태**: Proposed (논쟁 있음)`
- v2.0: `**상태**: Accepted (채택일 2026-05-09) — 논쟁 사항은 §8.2 위험·완화 절 참조`

### Appendix C. v1.x → v2.0 절 매핑표

```
v1.x 절                  → v2.0 위치
1.1 브랜치 구조           → A1 브랜치 전략 (서비스별 main으로 갱신)
1.2 브랜치 명명           → A1 브랜치 전략 (8종 prefix로 재정의)
1.3 브랜치 규칙           → A1 브랜치 전략
1.4 Mermaid Git Graph    → A1 브랜치 전략 (단일 서비스 예시로 재작성)
2.1~2.6 커밋 메시지       → A2 커밋 메시지 (Scope 4-서비스 매트릭스로 재정의)
3.1 PR 제목              → A3 PR
3.2 PR 본문 템플릿        → A3 PR (4개 항목 추가)
3.3 PR 규칙              → A3 PR (승인 정책 7행 표로 재정의)
3.4 자동화 (CI)           → A3 PR (4종 추가)
4.1 SemVer 형식          → A5 릴리즈/태깅
4.2 릴리즈 프로세스       → A5 릴리즈/태깅 (5단계로 재작성)
4.3 CHANGELOG            → A5 릴리즈/태깅 (레포별 분리 + 통합 RELEASE_NOTES는 B5)
5.1 .gitignore           → A6 (.venv·Avro·K8s·AWS 등 추가)
5.2 Git Hooks            → A6 (그대로)
5.3 CODEOWNERS           → A4 (8개 레포 명시 + 영문 handle)
6. 변경 이력              → 변경 이력 (v2.0 추가)

v2.0 신규 절             → 출처
0.1 ADR 요지             → SYNAPSE_Service_Consolidation §1·§2
0.2 Phase 요지           → SYNAPSE_Service_Consolidation §5
0.3 매핑표               → SYNAPSE_Service_Consolidation §3 + Polyrepo §1.1
B1 레포 구조 3-Tier      → SYNAPSE_Git_Rules_Polyrepo_Supplement §1
B2 미러링 자동화         → Polyrepo §5.2
B3 GitOps 갱신           → Polyrepo §5.3·§9
B4 Schema Registry      → Polyrepo §8
B5 통합 배포 태그        → Polyrepo §7.2
B6 PAT 정책              → Polyrepo §6
C1 Day 1 체크리스트      → Polyrepo §12
C2 트랩 10가지           → Polyrepo §13
C3 FAQ                   → Polyrepo §15
C4 시리즈·위키 매핑      → Polyrepo §14·§11
Appendix A·B            → SYNAPSE_Service_Consolidation §8 (Accepted로 상태 갱신)
```

---

## 7. 변경 이력 (문서 하단)

```markdown
| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v1.0 | 2026-05-07 | Synapse Team | 초안 작성 (모노레포 가정) |
| v1.1 | 2026-05-08 | Synapse Team | Community/Gamification/Notification 브랜치 예시 + 도메인 Scope 추가 |
| v2.0 | 2026-05-09 | Synapse Team | 전면 개편 — 4-서비스 폴리레포 + 미러 + GitOps + Schema Registry 전제로 재작성. ADR-001/002 채택(2026-05-09). 두 source 문서(SYNAPSE_Git_Rules_Polyrepo_Supplement.md / SYNAPSE_Service_Consolidation.md) 본문 흡수. 부록으로 ADR 전문(A·B) 및 v1.x→v2.0 절 매핑표(C) 추가. 03/14/17/18/10 후속 갱신 안내 주의문 상단에 추가. |
```

---

## 8. 검증 / 완료 기준

본 spec 기반 09 v2.0 작성이 끝난 뒤 다음 체크가 모두 통과하면 완료로 본다.

### 8.1 구조 / 일관성
- [ ] 본문에 "AUTH-001", "NOTE-002" 같은 v1.x prefix 잔재가 없다 (단, Appendix C 매핑 표 안에서의 인용은 허용)
- [ ] `* @synapse-team` 같은 v1.x CODEOWNERS 표기가 본문(A4 외)에 없다
- [ ] 단일 `v1.0.0` 가정 표현이 본문(Appendix C 매핑 표 외)에 없다
- [ ] 4-서비스 이름(synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc)이 본문에 일관되게 사용된다 (`auth-service` 등 옛 이름 잔재 없음)

### 8.2 매핑 / 참조 무결성
- [ ] §0.3 매핑표가 1회만 정의되고, 본문 다른 절은 영문 handle만 사용한다
- [ ] 본문 어느 절도 한국어 placeholder(`@팀장` 등)를 그대로 사용하지 않는다
- [ ] Appendix A·B의 ADR 상태가 모두 "Accepted (채택일 2026-05-09)"로 표기된다
- [ ] Appendix C의 v1.x → v2.0 매핑이 v1.1 본문의 모든 절을 빠짐없이 다룬다 (1.1~1.4, 2.1~2.6, 3.1~3.4, 4.1~4.3, 5.1~5.3, 6)

### 8.3 정합성 안내
- [ ] 상단 ⚠️ 주의문에 03/14/17/18/10 후속 갱신 안내가 모두 포함된다
- [ ] §C4 위키 매핑 표에 후속 갱신 항목이 명시된다

### 8.4 콘텐츠 흡수 완전성
- [ ] Polyrepo Supplement의 §1~§15 핵심 결정·표·체크리스트가 09 v2.0 어딘가에 위치한다 (소실 없음 — Appendix C 매핑이 출처를 보증)
- [ ] Service_Consolidation의 §8 ADR 전문이 부록으로 보존된다
- [ ] 미러링 워크플로와 GitOps deploy 단계의 핵심 YAML 1개씩이 인라인된다 (Q3 결정 — "정책 풀 흡수 + 운영 코드 핵심만 인라인")
- [ ] ApplicationSet / schema-check 풀 YAML은 본문에 없고 source 참조로 위임된다

### 8.5 분량
- [ ] 본문 분량은 약 600~800줄 수준 (Q3 결정 — "나" 옵션의 추정)을 크게 벗어나지 않는다 (±20%)

---

## 9. 결과물 / 산출 위치

| 산출 | 경로 |
|---|---|
| 본 설계서 (이 파일) | `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-git-rules-revamp-design.md` |
| 09 v2.0 본문 | `D:\workspace\final-project-syn\syn.wiki\09_Git_규칙_정의서.md` (in-place 갱신) |

> `syn.wiki`는 git 레포가 아니므로 본 spec과 09 v2.0 본문은 같은 git 추적 단위에 들어가지 않는다. 본 spec은 `syn` 레포에 commit, 09 v2.0은 위키 별도 관리 정책에 따라 push.

---

## 10. 후속 작업 (out-of-scope)

본 09 v2.0이 채택된 직후 다음을 별도 spec → plan → 구현 사이클로 처리한다.

| 문서 | 갱신 사항 |
|---|---|
| 03_프로젝트_아키텍처_정의서 | 10개 서비스 그림 → 4개 서비스로 재구성. K8s 리소스 표 갱신 (source Consolidation §6.3) |
| 17_스케줄 | 4주 단기 일정과 Phase 1~4의 정합성 정리. 트랙 분배를 본 spec §5 매핑과 일치시킴 |
| 18_기술_스택_정의서 | Schema Registry / Spring Modulith / ArgoCD ApplicationSet 추가 |
| 14_배포_가이드 | GitOps + ArgoCD + ApplicationSet 흐름 명시 |
| 10_환경_설정_템플릿 | 4-서비스 docker-compose로 재작성 |

---

*end of design spec*
