# Design Spec: Synapse 프로젝트 관리 문서 체계

> **Date:** 2026-05-11  
> **Status:** Approved  
> **Author:** velka + Claude

---

## 1. 목적

wiki 17_스케줄.md 기반으로, 팀장 + 6명 팀원 각자의 **작업 스코프 → PRD → Task → Workflow → WorkHistory** 문서 체계를 구축한다. 작업의 정의/진행/완료가 문서로 추적 가능해야 한다.

### 핵심 목표
- 각 담당자의 4주 책임 범위를 명확히 정의 (SCOPE)
- 주차별 요구사항을 PRD로 정리
- Task는 제시된 필수 필드 구조(10개 필드) 엄격 준수
- Workflow는 Task Step을 기능개발 10단계로 세분화
- WorkHistory는 상태 추적 대시보드 + 날짜별 일지
- **W1(Week 1) 전체 7명분**을 완성 (W2~W4는 동일 구조로 이후 추가)

---

## 2. 산출물

### 배치 위치: `documents/docs/project-management/`

```
docs/project-management/
├── README.md                              # 문서 체계 가이드
├── scope/                                 # 작업 스코프 정의 (7개)
│   ├── SCOPE_team-lead.md
│   ├── SCOPE_platform.md
│   ├── SCOPE_engagement.md
│   ├── SCOPE_knowledge-1.md
│   ├── SCOPE_knowledge-2.md
│   ├── SCOPE_learning-card.md
│   └── SCOPE_learning-ai.md
├── prd/                                   # 주차별 PRD (W1만 작성)
│   └── PRD_W1.md
├── task/                                  # 담당자별 Task (8개)
│   ├── TASK_team-lead.md
│   ├── TASK_platform.md
│   ├── TASK_engagement.md
│   ├── TASK_knowledge-1.md
│   ├── TASK_knowledge-2.md
│   ├── TASK_learning-card.md
│   ├── TASK_learning-ai.md
│   └── TASK_frontend.md
├── workflow/                              # 담당자 × W1 (8개)
│   ├── WORKFLOW_team-lead_W1.md
│   ├── WORKFLOW_platform_W1.md
│   ├── WORKFLOW_engagement_W1.md
│   ├── WORKFLOW_knowledge-1_W1.md
│   ├── WORKFLOW_knowledge-2_W1.md
│   ├── WORKFLOW_learning-card_W1.md
│   ├── WORKFLOW_learning-ai_W1.md
│   └── WORKFLOW_frontend_W1.md
└── history/                               # 담당자별 WorkHistory (8개)
    ├── HISTORY_team-lead.md
    ├── HISTORY_platform.md
    ├── HISTORY_engagement.md
    ├── HISTORY_knowledge-1.md
    ├── HISTORY_knowledge-2.md
    ├── HISTORY_learning-card.md
    ├── HISTORY_learning-ai.md
    └── HISTORY_frontend.md
```

**총 파일 수**: 1 (README) + 7 (SCOPE) + 1 (PRD W1) + 8 (TASK) + 8 (WORKFLOW W1) + 8 (HISTORY) = **33개 파일**

---

## 3. 문서 간 관계

```
SCOPE (4주 전체 책임)
  ↓ 참조
PRD_W{N} (주차별 요구사항)
  ↓ 분해
TASK_{담당자} (Step 단위 작업 정의 — 필수 10필드)
  ↓ 세분화
WORKFLOW_{담당자}_W{N} (Step별 기능개발 10단계)
  ↓ 기록
HISTORY_{담당자} (상태 대시보드 + 날짜별 일지)
```

### 작업 진행/완료 시 업데이트 규칙

| 이벤트 | PRD | TASK | WORKFLOW | HISTORY |
|--------|-----|------|----------|---------|
| 작업 시작 | — | Step 상태 → `In Progress` | 해당 단계 체크박스 시작 | 시작일 기록 + 로그 |
| 하위 단계 완료 | — | — | 체크박스 `[x]` 체크 | 로그에 완료 기록 |
| Step 완료 | — | Step 상태 → `Done` | 전체 체크박스 완료 | 완료일 기록 + 로그 |
| 주차 종료 | 성공 기준 체크 | — | — | 주간 요약 작성 |
| 이슈 발생 | — | Constraints 갱신 | 해당 단계에 이슈 메모 | 이슈 기록 |

---

## 4. 각 문서 구조 상세

### 4.1 README.md

```
1. 개요 (문서 체계 목적)
2. 문서 흐름도 (SCOPE → PRD → TASK → WORKFLOW → HISTORY)
3. 문서별 역할 테이블
4. 디렉토리 구조
5. 작업 진행/완료 시 업데이트 규칙
6. Task 문서 작성 규칙 (필수 10필드 + Workflow + Done When 배치 등)
7. 담당자 매핑표
```

### 4.2 SCOPE_{담당자}.md

```
# 작업 스코프: {담당자 handle}

## 담당자 정보
- Handle: @{handle}
- 역할: 트랙 {X}
- 담당 서비스: synapse-{service}-svc
- 담당 모듈: {modules}

## 4주 전체 책임 범위

### 도메인 경계
- In Scope: (이 담당자가 책임지는 모듈/기능)
- Out of Scope: (다른 담당자 소관)

### 주차별 스코프 매트릭스
| 주차 | 기간 | 핵심 목표 | 산출물 | 의존성 |
| W1 | 05-12~16 | ... | ... | ... |
| W2 | 05-19~23 | ... | ... | ... |
| W3 | 05-26~30 | ... | ... | ... |
| W4 | 06-02~06 | ... | ... | ... |

## 협업 인터페이스
| 상대 | 주고받는 것 | 방향 |
| @knowledge-owner-1 | NoteCreatedEvent | 수신 |

## 성공 기준
4주 종료 시점 기대 상태 (wiki 17_스케줄 §4 DoD 기반)
```

### 4.3 PRD_W{N}.md

```
# PRD: Week {N} — {주차 목표}

## 1. 주차 개요
- 기간: YYYY-MM-DD ~ YYYY-MM-DD
- 목표: (wiki 17에서 추출)
- 전주 결과: (W2부터 기재)

## 2. 기능 요구사항

### 2.1 @platform-owner
| ID | 유저 스토리 | 수용 기준 | 우선순위 |
| FR-P-001 | 사용자가 OAuth로 회원가입할 수 있다 | Google/GitHub 로그인 동작 | P0 |

### 2.2 @engagement-owner
(동일 구조)

### 2.3 ~ 2.7 (각 담당자)

## 3. 비기능 요구사항
| ID | 항목 | 기준 |
| NFR-001 | 응답 시간 | P95 < 200ms |

## 4. 의존성 맵
| From | To | 내용 |
| auth (platform) | 전체 | JWT 토큰 발급 |

## 5. 성공 기준 체크리스트
(wiki 17 W{N} 성공 기준 그대로 옮기고 체크박스화)

## 6. 리스크 & 대안
| 리스크 | 영향 | 대안 |
```

### 4.4 TASK_{담당자}.md — 필수 10필드 엄격 준수

```
# TASK: {담당자 handle}

> 본 문서는 프로젝트 관리 문서 체계의 Task 규칙을 준수한다.
> Task 규칙 상세: [README.md](../README.md) §6

## Step 1: {Step Name}

- **Step Goal**: [주체]가 [대상]에 대해 [행위]를 [결과]한다.
- **Done When**:
  - [ ] 기준 1
  - [ ] 기준 2
- **Scope**:
  - In Scope:
    - 포함 항목 1
    - 포함 항목 2
  - Out of Scope:
    - 제외 항목 1
    - 향후 고려: ...
- **Input**: 필요한 문서/코드/환경
- **Instructions**:
  1. 작업 항목 1
  2. 작업 항목 2
- **Output Format**: 산출물 형태·위치·형식
- **Constraints**: Step 고유 제약
- **Duration**: N일 (1명 기준)
- **RULE Reference**: 참조 문서
- **Assignee**: @{handle}
- **Reviewer**: @team-lead

---
**Status**: [ ] Not Started / [ ] In Progress / [x] Done

## Step 2: ...
(동일 구조 반복)
```

### 4.5 WORKFLOW_{담당자}_W{N}.md — Task Step의 기능개발 10단계 세분화

```
# WORKFLOW: {담당자} — Week {N}

> Task 문서: [TASK_{담당자}.md](../task/TASK_{담당자}.md)
> 본 Workflow는 Task의 각 Step을 기능개발 10단계로 세분화한다.

## Step 1: {Step Name}

### 1.1 TASK 시작
- [ ] Step Goal/Done When/Scope/Input/Duration(rough) 확인
- [ ] 관련 PRD 확인: PRD_W{N}.md §{section}

### 1.2 요구사항 분석
- [ ] API 스펙 정의 (엔드포인트, 메서드, 파라미터)
- [ ] 예외 케이스 정의
- [ ] 비즈니스 규칙 정리
- [ ] Instructions 초안 → TASK에 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: {Yes/No}
- [ ] 권한 종류: {일반/관리자/특정 권한}
- [ ] 공개 API 여부: {Yes/No}
- [ ] 체크 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 테이블 설계
- [ ] 인덱스 설계
- [ ] 관계 정의
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 민감 정보 암호화: {해당/비해당}
- [ ] Soft Delete 정책: {물리삭제/논리삭제}
- [ ] 행 단위 접근 제어: {필요/불필요}
- [ ] 체크 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] Request DTO 정의
- [ ] Response DTO 정의
- [ ] Entity 작성
- [ ] Output Format → TASK에 반영

### 1.7 Repository 구현
- [ ] JpaRepository 인터페이스 작성
- [ ] 커스텀 쿼리 (필요 시)

### 1.8 Service + Test
- [ ] 비즈니스 로직 구현
- [ ] 단위 테스트 작성 (@ExtendWith MockitoExtension)
- [ ] 테스트 통과 확인

### 1.9 Controller + Test
- [ ] REST API 구현
- [ ] 슬라이스 테스트 (@WebMvcTest)
- [ ] 401/403 테스트 포함
- [ ] 테스트 통과 확인

### 1.10 View + Test (해당 시)
- [ ] Flutter 화면 구현
- [ ] Smoke Test 1건 이상
- [ ] RULE Reference → TASK에 반영

**Step 1 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 2: {Step Name}
(동일 10단계 반복)
```

### 4.6 HISTORY_{담당자}.md — 상태 대시보드 + 일지

```
# Work History: {담당자 handle}

## 진행 상태 대시보드

### W1 (2026-05-12 ~ 05-16)

| Step | Task 문서 참조 | 상태 | 시작일 | 완료일 | 비고 |
|------|---------------|------|--------|--------|------|
| Step 1: ... | TASK §Step1 | Not Started | — | — | |
| Step 2: ... | TASK §Step2 | Not Started | — | — | |

### W2 (2026-05-19 ~ 05-23)
(이후 주차별 추가)

---

## 작업 로그

### W1

#### 2026-05-12 (월)
- **완료**: 
- **진행 중**: 
- **이슈**: 
- **다음**: 

#### 2026-05-13 (화)
(동일 구조)

...

#### 2026-05-16 (금)
- **완료**: 
- **주간 요약**: 
```

---

## 5. 담당자 매핑 (wiki 17 기반)

| 담당자 handle | 서비스 | 모듈 | 파일 접미사 |
|--------------|--------|------|------------|
| `@team-lead` | Gateway / 인프라 / 아키텍처 | Schema Registry, ArgoCD, CI/CD | `team-lead` |
| `@platform-owner` | synapse-platform-svc | auth, audit, billing, notification | `platform` |
| `@engagement-owner` | synapse-engagement-svc | community, gamification | `engagement` |
| `@knowledge-owner-1` | synapse-knowledge-svc | note, graph | `knowledge-1` |
| `@knowledge-owner-2` | synapse-knowledge-svc | chunking, 검색, Modulith 검증 | `knowledge-2` |
| `@learning-card-owner` | synapse-learning-svc | card, srs (Java) | `learning-card` |
| `@learning-ai-owner` | synapse-learning-svc | ai (Python/FastAPI) | `learning-ai` |
| 전체 협업 | synapse-frontend | Flutter UI | `frontend` |

---

## 6. W1 작성 범위

W1(2026-05-12 ~ 05-16) 기준으로 다음을 완전히 작성한다:

### 각 담당자별 W1 Step 내역 (wiki 17 §2 W1 기반)

#### @team-lead (W1)
- Step 1: EKS / RDS / MSK / Schema Registry / Redis / OpenSearch / ArgoCD 인프라 셋업
- Step 2: Docker Compose 4-서비스 + Schema Registry 구성
- Step 3: CI/CD 기초 (mirror.yml + ci.yml + deploy.yml)

#### @platform-owner (W1)
- Step 1: synapse-platform-svc 프로젝트 골격 생성 + Spring Modulith 설정
- Step 2: auth 모듈 — OAuth 회원가입/로그인
- Step 3: auth 모듈 — JWT 발급/검증 + MFA 기초

#### @engagement-owner (W1)
- Step 1: synapse-engagement-svc 프로젝트 골격 생성 + Spring Modulith 설정
- Step 2: community 모듈 — 그룹 CRUD
- Step 3: community 모듈 — 멤버 관리 (가입/탈퇴/권한)

#### @knowledge-owner-1 (W1)
- Step 1: synapse-knowledge-svc 프로젝트 골격 생성
- Step 2: note 모듈 — Markdown CRUD
- Step 3: note 모듈 — 위키링크 파싱 (`[[note-title]]` 추출)

#### @knowledge-owner-2 (W1)
- Step 1: knowledge-svc Spring Modulith 모듈 정의 + @ApplicationModule 설정
- Step 2: ArchUnit 경계 검증 테스트 작성 + CI 연동
- Step 3: Schema Registry 연동 검증 (Avro 스키마 등록/호환성 테스트)

#### @learning-card-owner (W1)
- Step 1: synapse-learning-card 프로젝트 골격 생성 + Spring Modulith 설정
- Step 2: card 모듈 — 덱/카드 CRUD
- Step 3: card 모듈 — SM-2 알고리즘 기초 구현

#### @learning-ai-owner (W1)
- Step 1: synapse-learning-ai FastAPI scaffolding
- Step 2: Anthropic Claude API 연동 (기본 호출 + 에러 핸들링)
- Step 3: OpenAI Embedding API 연결 (텍스트 → 벡터 변환)

#### Frontend 전체 협업 (W1)
- Step 1: Flutter 앱 쉘 + ProviderScope + GoRouter 설정
- Step 2: 인증 화면 (로그인/회원가입)
- Step 3: 대시보드 레이아웃 + 사이드바

---

## 7. 구현 순서

1. `README.md` (문서 체계 가이드)
2. `scope/` (7개 SCOPE 문서)
3. `prd/PRD_W1.md` (W1 PRD)
4. `task/` (8개 TASK 문서 — 필수 10필드)
5. `workflow/` (8개 W1 WORKFLOW)
6. `history/` (8개 HISTORY 초기 템플릿)

---

## 8. 성공 기준

- [ ] 33개 파일 모두 생성
- [ ] 모든 TASK Step이 필수 10필드를 갖추고 있다
- [ ] 모든 Step Goal이 "[주체]가 [행위]를 [결과]한다" 형식이다
- [ ] Done When이 Step Goal 바로 다음에 배치되어 있다
- [ ] Scope가 In Scope / Out of Scope로 분리되어 있다
- [ ] WORKFLOW가 기능개발 10단계(TASK시작~View+Test)로 세분화되어 있다
- [ ] HISTORY가 상태 대시보드 + 날짜별 로그 구조를 갖추고 있다
- [ ] 문서 간 상호 참조 링크가 작동한다
