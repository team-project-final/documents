# 킥오프 발표 문서 설계서

> **작성일**: 2026-05-12  
> **상태**: Approved  
> **목적**: W1 첫날 킥오프에서 팀장(김민구)이 팀원 6명에게 프로젝트 전체를 안내하는 단일 문서 설계

---

## 1. 문서 개요

### 1.1 대상

- **발표자**: 김민구 (팀장)
- **청중**: 팀원 6명 (김해준, 한승완, 김현지, 박은서, 김나경, 조유지)
- **상황**: W1 첫날 킥오프 — 팀원이 프로젝트를 처음 접하는 자리

### 1.2 형태

- **시간순 플로우형**: 위에서 아래로 읽으면 발표가 됨
- **이중 역할**: 발표 때 핵심 요약 (볼드/테이블) + 발표 후 레퍼런스 (상세 본문)
- **분량**: ~15분 발표, 참조용으로는 제한 없음
- **톤**: 반말 캐주얼체
- **파일 위치**: `docs/project-management/KICKOFF.md`

### 1.3 산출물

단일 마크다운 파일. 별도 슬라이드 없이 마크다운 자체를 화면에 띄우며 발표.

---

## 2. 섹션 구조 (9개)

```
§1  프로젝트 한눈에 보기        (30초)
§2  팀 구성 + 담당 배치         (2분)
§3  기술 스택                  (1분)
§4  GitHub 레포 + CI/CD        (2분)
§5  5주 로드맵                 (2분)
§6  문서 체계 + 10단계 워크플로   (3분)
§7  Git 워크플로               (2분)
§8  소통 규칙                  (1분)
§9  Day 0 / Day 1 체크리스트    (2분)
```

---

## 3. 섹션별 상세 설계

### §1. 프로젝트 한눈에 보기

- 한 줄 정의: "노트 → 플래시카드 자동 생성 → 간격 반복 → AI 학습 보조" PKM+SRS+AI SaaS
- 핵심 차별점: "노트가 카드가 되고, 복습이 노트를 다시 살린다"
- 대상 사용자: 개발자, 대학원생, 자격증 준비생
- 3줄 엘리베이터 피치

### §2. 팀 구성 + 담당 배치

실명 + 트랙 + 서비스 + 모듈 + GitHub 레포를 한 테이블로 구성:

| 이름 | 트랙 | 서비스 | 모듈 | 레포 |
|------|------|--------|------|------|
| 김민구 | 팀장 | Gateway / 인프라 | CI/CD, ArgoCD, Schema Registry | syn, shared, mirror, gitops |
| 김해준 | A | platform-svc | auth, billing, notification, audit | synapse-platform-svc |
| 한승완 | B | engagement-svc | community, gamification | synapse-engagement-svc |
| 김현지 | C-1 | knowledge-svc | note, graph | synapse-knowledge-svc |
| 박은서 | C-2 | knowledge-svc | chunking, 검색, Modulith | synapse-knowledge-svc |
| 김나경 | D-1 | learning-svc | card, srs (Java) | synapse-learning-svc |
| 조유지 | D-2 | learning-svc | ai (Python/FastAPI) | synapse-learning-svc |
| 전원 | — | frontend | Flutter UI | synapse-frontend |

- C-1/C-2, D-1/D-2는 같은 레포를 공유하므로 모듈 경계 강조
- Frontend는 전원 협업임을 명시

### §3. 기술 스택

카테고리별 테이블:

| 카테고리 | 스택 |
|----------|------|
| Backend | Spring Boot 4 + Modulith, Java 21, Gradle |
| AI | FastAPI, Python 3.11, Anthropic/OpenAI SDK |
| Frontend | Flutter 3, Riverpod 3, GoRouter 14, Dio |
| DB | PostgreSQL 16, Redis 7, OpenSearch 8 |
| 메시징 | Kafka (MSK) + Avro + Confluent Schema Registry |
| Infra | AWS EKS, Docker, Kustomize |
| DevOps | GitHub Actions, ArgoCD |
| 디자인 | Material 3, Warm Intellectual 테마 (DESIGN.md) |

### §4. GitHub 레포지토리 + CI/CD

**레포 카탈로그 (10개)**:

| 레포 | 가시성 | 용도 | 담당 |
|------|:------:|------|------|
| synapse-platform-svc | public | auth, audit, billing, notification | 김해준 |
| synapse-engagement-svc | public | community, gamification | 한승완 |
| synapse-knowledge-svc | public | note, graph, chunking | 김현지, 박은서 |
| synapse-learning-svc | public | card/srs (Java) + ai (Python) | 김나경, 조유지 |
| synapse-frontend | public | Flutter web/mobile | 전원 |
| synapse-shared | public | Avro 스키마 + 공통 라이브러리 | 김민구 |
| synapse-mirror | private | Tier 1 자동 미러 (읽기 전용) | 자동 |
| synapse-gitops | private | K8s manifest + ArgoCD ApplicationSet | 김민구 |
| syn | public | 부트스트랩 스크립트 + 스펙 | 김민구 |
| documents | public | 프로젝트 관리 문서 (본 레포) | 전원 |

**CI/CD 파이프라인 다이어그램** (텍스트):

```
코드 push (main)
  ├─→ CI (빌드 + 테스트)
  ├─→ mirror.yml (synapse-mirror에 자동 동기화)
  └─→ deploy.yml (ECR push → GitOps 태그 갱신 → ArgoCD dev 동기화)
```

**워크플로 종류별 설명**:
- `ci.yml`: PR/push 시 빌드+테스트 (Java: gradlew build, Flutter: flutter analyze+build)
- `mirror.yml`: main push 시 synapse-mirror에 자동 rsync
- `deploy.yml`: main push 시 Docker 이미지 → ECR → GitOps 태그 업데이트
- `schema-check.yml`: Avro 스키마 변경 PR 시 호환성 검증 (shared 전용)
- `validate-manifests.yml`: K8s manifest PR 시 yamllint+kustomize build (gitops 전용)

### §5. 5주 로드맵

| 주차 | 기간 | 핵심 목표 | 위험 시그널 |
|------|------|-----------|-----------|
| W1 | 05-12~16 | 인프라 + 서비스 골격 + 기본 CRUD | 금요일까지 gradlew build 실패 |
| W2 | 05-19~23 | SRS 복습, AI 골격, Graph+ES, Schema Registry | 핵심 API 3개 미만 동작 |
| W3 | 05-26~29 (4일) | Kafka 이벤트 발행 + 검색 RRF + AI 카드 생성 | producer 토픽 미발행 |
| W4 | 06-01~05 (4일) | 이벤트 소비자 + notification/audit + 통합 검증 | Staging 배포 실패 |
| W5 | 06-08~12 | E2E 테스트 + 버그 수정 + 발표 준비 | E2E 시나리오 50% 미만 통과 |
| 발표 | 06-15 (월) | 최종 발표 · 시연 · 제출 | — |

- 공휴일 표기: 5/25 부처님오신날, 6/3 지방선거
- 각 주차에 "이번 주 끝날 때 이게 안 되면 위험" 시그널 포함

### §6. 문서 체계

**5종 문서 흐름도**:

```
SCOPE (5주 전체 책임 경계)
  ↓
PRD (주차별 요구사항)
  ↓
TASK (Step별 작업 정의 — 필수 10필드)
  ↓
WORKFLOW (Step → 10단계 개발 체크리스트)
  ↓
HISTORY (날짜별 일지 + 상태 대시보드)
```

**각 문서 1줄 설명 + 자기 파일 위치 안내**:
- SCOPE: "너의 5주 전체 책임이 뭔지 정의해둔 문서" → `scope/SCOPE_{트랙}.md`
- PRD: "이번 주에 뭘 만들어야 하는지" → `prd/PRD_W{N}.md`
- TASK: "구체적으로 뭘 어떻게 하는지" → `task/TASK_{트랙}.md`
- WORKFLOW: "개발 10단계 체크리스트" → `workflow/WORKFLOW_{트랙}_W{N}.md`
- HISTORY: "매일 한 일 기록" → `history/HISTORY_{트랙}.md`

**TASK 필수 10필드 요약 테이블**:

| # | 필드 | 핵심 |
|---|------|------|
| 1 | Step Name | 단계 이름 |
| 2 | Step Goal | 측정 가능 문장 ("[주체]가 [대상]에 [행위]를 [결과]한다") |
| 3 | Done When | Goal 바로 다음 고정 배치 |
| 4 | Scope | In/Out 구분 |
| 5 | Input | 필요한 입력물 |
| 6 | Instructions | 수행 작업 목록 |
| 7 | Output Format | 산출물 형태 |
| 8 | Constraints | Step 고유 제약 |
| 9 | Duration | 예상 작업일 |
| 10 | RULE Reference | 참조 문서 |

**업데이트 타이밍 규칙** (핵심 3가지):
1. 작업 시작 → TASK Status "In Progress" + HISTORY 시작일
2. Step 완료 → TASK Status "Done" + WORKFLOW 전체 체크 + HISTORY 완료일
3. 이슈 발생 → TASK Constraints 갱신 + HISTORY 기록

**10단계 개발 워크플로 요약**:

```
① TASK 확인 → ② 요구사항 분석 → ③ Security 1차
→ ④ ERD 설계 → ⑤ Security 2차 → ⑥ DTO/Entity
→ ⑦ Repository → ⑧ Service+Test → ⑨ Controller+Test → ⑩ View+Test
```

- Security 1차: 인증 필요? 권한 종류? 공개 API?
- Security 2차: 암호화? Soft Delete? 행단위 접근?
- API First: DTO 먼저, Entity 나중

### §7. Git 워크플로

**브랜치 전략**:
```
main (보호됨 — 직접 push 금지)
  └─ feature/{TICKET}-{설명}  ← 여기서 작업
       └─ PR → 1명 approve → squash merge → 브랜치 자동 삭제
```

**커밋 컨벤션** (Conventional Commits):

| prefix | 용도 | 예시 |
|--------|------|------|
| feat | 새 기능 | `feat(auth): Google OAuth 로그인 구현` |
| fix | 버그 수정 | `fix(note): 위키링크 파싱 NPE 수정` |
| chore | 인프라/설정 | `chore(infra): Docker Compose 포트 변경` |
| docs | 문서 | `docs: PRD_W1 수용 기준 갱신` |
| test | 테스트 | `test(srs): SM-2 경계값 테스트 추가` |
| refactor | 리팩토링 | `refactor(graph): 인접 리스트 → 맵 변환` |

**PR 규칙**:
- 제목: 커밋 컨벤션 형식
- 본문: "## 변경 사항" + "## 테스트 결과" 포함
- CODEOWNERS 자동 리뷰어 배정
- approve 1명 → squash merge

**절대 금지**:
- force push
- main 직접 commit
- `.env`, `*.key`, `*.pem` commit
- Classic PAT 사용

### §8. 소통 규칙

**확정**:
- 매일 데일리 스탠드업

**제안** (팀원 의견 수렴 표시):

| 항목 | 제안 | 이유 |
|------|------|------|
| 데일리 시간 | 오전 10:00, 15분 이내 | 오전에 방향 맞추고 바로 작업 시작 |
| 데일리 형식 | 어제 한 것 / 오늘 할 것 / 막히는 것 | 3줄이면 충분, 길어지면 별도 논의 |
| 이슈 보고 | 30분 이상 혼자 고민 금지, 바로 공유 | 5주밖에 없어서 시간 낭비 최소화 |
| 코드 리뷰 | PR 올리면 24h 이내 리뷰, 48h 이내 머지 | 리뷰 병목이 가장 흔한 지연 원인 |
| 긴급 소통 | 카카오톡 or 디스코드 (팀 합의) | 킥오프에서 결정 |
| 주간 회고 | 금요일 마지막 15분 | 잘된 것 / 개선할 것 / 다음 주 목표 |

### §9. Day 0 / Day 1 체크리스트

**Day 0 (오늘, ~1시간) — 환경 준비**:
- [ ] GitHub 계정 2FA 설정 + team-project-final org 합류
- [ ] `gh` CLI 설치 + `gh auth login`
- [ ] Java 21 / Python 3.11 / Flutter 3 / Docker 설치
- [ ] 자기 서비스 레포 clone
- [ ] 위키 5개 문서 순서대로 읽기 (기술스택 → 아키텍처 → Git규칙 → 워크플로 → 스케줄)
- [ ] DESIGN.md 읽기

**Day 1 (내일, ~3시간) — 트랙별 온보딩**:
- [ ] `docs/onboarding/` 자기 트랙 가이드 따라가기
- [ ] SECRETS.md 확인 + 필요 credential 수령
- [ ] 첫 PR 올리기 (Hello World → 실제 기능 수준)
- [ ] TASK 파일에서 Step 1 확인 → Status "In Progress"로 갱신

**마무리 액션 아이템** (발표 종료 시 화면에 남길 3줄):
```
1. 지금 Day 0 체크리스트 시작해
2. 막히면 바로 물어봐
3. 내일 데일리 때 Day 0 완료 여부 공유
```

---

## 4. 참조 데이터 출처

문서 작성 시 참조할 기존 문서:

| 항목 | 출처 |
|------|------|
| 프로젝트 개요 | DESIGN.md §1~§2 |
| 팀 구성 | README.md §8 담당자 매핑표 |
| 기술 스택 | wiki 18_기술_스택_정의서 |
| 레포지토리 | README.md §9 + 부트스트랩 보고서 |
| 5주 로드맵 | PRD_W1~W5 주차 개요 |
| 문서 체계 | README.md §1~§7 |
| Git 워크플로 | wiki 09_Git_규칙_정의서, 09a_Git_워크플로우_가이드 |
| 소통 규칙 | 신규 (킥오프에서 확정) |
| Day 0/Day 1 | docs/onboarding/ 7개 가이드 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| v1.0 | 2026-05-12 | Synapse Team | 초안. 9개 섹션 시간순 플로우형 킥오프 발표 문서 설계. |
