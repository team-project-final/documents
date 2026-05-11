# Synapse 프로젝트 관리 문서 체계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 33개 프로젝트 관리 문서(README + 7 SCOPE + 1 PRD + 8 TASK + 8 WORKFLOW + 8 HISTORY)를 생성하여 팀의 작업 정의/진행/완료를 문서로 추적 가능하게 한다.

**Architecture:** 계층형 디렉토리 구조 — `docs/project-management/` 하위에 scope/prd/task/workflow/history 5개 서브디렉토리. 문서 흐름: SCOPE → PRD → TASK → WORKFLOW → HISTORY. W1(Week 1) 전체 7명 + Frontend 협업분 작성.

**Tech Stack:** Markdown 문서. 참조: wiki 17_스케줄.md, wiki 03_아키텍처_정의서.md

**Output directory:** `C:/workspace/team-project-manager/team-project-final/documents/docs/project-management/`

**Spec:** `docs/superpowers/specs/2026-05-11-project-management-docs-design.md`

---

## File Structure

| Directory | Files | Responsibility |
|-----------|-------|---------------|
| `project-management/` | `README.md` | 문서 체계 가이드, 규칙 정의 |
| `project-management/scope/` | 7 SCOPE files | 각 담당자 4주 전체 책임 범위 |
| `project-management/prd/` | `PRD_W1.md` | W1 주차별 요구사항 |
| `project-management/task/` | 8 TASK files | 담당자별 Step 정의 (필수 10필드) |
| `project-management/workflow/` | 8 WORKFLOW files | Step별 기능개발 10단계 세분화 |
| `project-management/history/` | 8 HISTORY files | 상태 대시보드 + 날짜별 로그 |

---

## Task 1: README + 디렉토리 생성

**Files:**
- Create: `docs/project-management/README.md`

- [ ] **Step 1: 디렉토리 구조 생성**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
mkdir -p docs/project-management/{scope,prd,task,workflow,history}
```

- [ ] **Step 2: README.md 작성**

README.md를 작성한다. 내용:
1. 개요 (문서 체계 목적)
2. 문서 흐름도 (SCOPE → PRD → TASK → WORKFLOW → HISTORY)
3. 문서별 역할 테이블
4. 디렉토리 구조
5. 작업 진행/완료 시 업데이트 규칙 (시작/완료/주차종료 시 어떤 문서를 어떻게 업데이트)
6. Task 문서 작성 규칙 (필수 10필드 정의, Step Goal 형식, Done When 배치, Scope 구조, Constraints vs RULE Reference)
7. 기능 개발 Workflow (10단계 다이어그램 + 설명)
8. 담당자 매핑표

- [ ] **Step 3: 커밋**

```bash
git add docs/project-management/README.md
git commit -m "docs: 프로젝트 관리 문서 체계 — README 가이드 작성"
```

---

## Task 2: SCOPE 문서 (7개)

**Files:**
- Create: `docs/project-management/scope/SCOPE_team-lead.md`
- Create: `docs/project-management/scope/SCOPE_platform.md`
- Create: `docs/project-management/scope/SCOPE_engagement.md`
- Create: `docs/project-management/scope/SCOPE_knowledge-1.md`
- Create: `docs/project-management/scope/SCOPE_knowledge-2.md`
- Create: `docs/project-management/scope/SCOPE_learning-card.md`
- Create: `docs/project-management/scope/SCOPE_learning-ai.md`

- [ ] **Step 1: SCOPE_team-lead.md 작성**

내용 (wiki 17 §2~3 기반):
- Handle: @team-lead, 역할: 팀장
- 담당: Gateway / 인프라 / 아키텍처 / Schema Registry / ArgoCD
- In Scope: EKS, RDS, MSK, Redis, OpenSearch, ArgoCD, CI/CD, Docker Compose, Gateway 라우팅, Schema Registry 호환성 관리, 전 PR cross-review
- Out of Scope: 개별 서비스 비즈니스 로직 구현
- 주차별 매트릭스: W1(인프라셋업+DC+CI/CD) / W2(Kafka토픽+Schema강제+Gateway) / W3(통합테스트조율+코드리뷰+ArgoCD검증) / W4(최종점검)
- 협업: 전 팀원에게 인프라 제공, PR 승인
- 성공기준: 4-서비스 K8s 배포 완료, CI/CD 파이프라인 정상, Schema Registry 전 토픽 호환

- [ ] **Step 2: SCOPE_platform.md 작성**

- Handle: @platform-owner, 트랙 A (1명)
- 담당: synapse-platform-svc (auth, audit, billing, notification)
- In Scope: OAuth+JWT+MFA, Stripe Checkout+Webhook, FCM 알림, Audit 로그
- Out of Scope: 다른 서비스 비즈니스 로직, 프론트엔드 전체
- 주차별: W1(OAuth+JWT+MFA기초) / W2(billing Stripe+notification FCM) / W3(audit Kafka+notification 발송+테넌트관리) / W4(버그수정)
- 협업: auth → 전체(JWT), notification ← engagement(gamification.*), learning(card.review.due)
- 성공기준: 인증 완전 동작, 결제 플로우, 알림 발송

- [ ] **Step 3: SCOPE_engagement.md 작성**

- Handle: @engagement-owner, 트랙 B (1명)
- 담당: synapse-engagement-svc (community, gamification)
- In Scope: 그룹CRUD, 멤버관리, 덱/노트 공유, XP/배지/레벨/스트릭/리더보드, 신고처리
- Out of Scope: 알림 발송(platform 담당), 카드/노트 자체 CRUD
- 주차별: W1(community CRUD+멤버) / W2(gamification XP+community공유) / W3(배지·리더보드+신고Admin) / W4(버그수정)

- [ ] **Step 4: SCOPE_knowledge-1.md 작성**

- Handle: @knowledge-owner-1, 트랙 C-1
- 담당: synapse-knowledge-svc (note 모듈, graph 모듈)
- In Scope: Markdown CRUD, 위키링크, 백링크, D3.js 그래프 데이터, ES 동기화, 노트 버전이력, 태그 고도화
- Out of Scope: chunking, 검색 BM25/RRF (owner-2), AI 카드 생성
- 주차별: W1(note CRUD+위키링크) / W2(graph 백링크+ES동기화) / W3(버전이력+태그+PageRank) / W4(버그수정)

- [ ] **Step 5: SCOPE_knowledge-2.md 작성**

- Handle: @knowledge-owner-2, 트랙 C-2
- 담당: synapse-knowledge-svc (chunking 모듈, 검색, Modulith 검증)
- In Scope: Spring Modulith 모듈 정의, ArchUnit 검증, Schema Registry 연동, 청크 분할, BM25 검색, RRF 하이브리드
- Out of Scope: note CRUD, graph 시각화 (owner-1)
- 주차별: W1(Modulith+ArchUnit+Schema) / W2(chunking+BM25) / W3(RRF+정확도측정) / W4(버그수정)

- [ ] **Step 6: SCOPE_learning-card.md 작성**

- Handle: @learning-card-owner, 트랙 D-1
- 담당: synapse-learning-svc / learning-card (card, srs 모듈, Java)
- In Scope: 덱/카드 CRUD, SM-2 알고리즘, 복습 세션, Kafka 이벤트 발행, 복습 통계
- Out of Scope: AI 카드 자동 생성 (ai-owner), 알림 발송 (platform)
- 주차별: W1(덱/카드CRUD+SM-2기초) / W2(복습세션+Kafka발행) / W3(review.due+통계대시보드) / W4(버그수정)

- [ ] **Step 7: SCOPE_learning-ai.md 작성**

- Handle: @learning-ai-owner, 트랙 D-2
- 담당: synapse-learning-svc / learning-ai (ai 모듈, Python/FastAPI)
- In Scope: FastAPI 골격, Anthropic API 연동, Embedding API, 시맨틱 검색, AI 카드 자동 생성, RAG Q&A(시간 허용 시)
- Out of Scope: 카드/SRS Java 로직 (card-owner), 인프라 (team-lead)
- 주차별: W1(FastAPI+Claude+Embedding) / W2(시맨틱검색+AI카드골격) / W3(AI자동생성+RAG) / W4(버그수정)

- [ ] **Step 8: 커밋**

```bash
git add docs/project-management/scope/
git commit -m "docs: 프로젝트 관리 — 7명 담당자 작업 스코프(SCOPE) 정의"
```

---

## Task 3: PRD_W1.md

**Files:**
- Create: `docs/project-management/prd/PRD_W1.md`

- [ ] **Step 1: PRD_W1.md 작성**

wiki 17 §2 W1 기반으로 작성. 내용:
- 기간: 2026-05-12 ~ 2026-05-16
- 목표: DB 스키마, 4-서비스 골격, 기본 CRUD, Spring Modulith 모듈 정의
- 기능 요구사항을 담당자별로 분류하고 각각 유저 스토리 + 수용 기준 + 우선순위(P0/P1) 기재
- 비기능 요구사항: Docker Compose 로컬 실행, Health endpoint 응답 < 100ms, Modulith verify 통과
- 의존성 맵: auth → 전체(JWT), infra → 전체(Docker Compose)
- 성공 기준 체크리스트 (wiki 17 W1 성공 기준 6항목 체크박스)
- 리스크: 인프라 셋업 지연, 서비스 간 의존성 충돌

- [ ] **Step 2: 커밋**

```bash
git add docs/project-management/prd/PRD_W1.md
git commit -m "docs: 프로젝트 관리 — W1 PRD 작성"
```

---

## Task 4: TASK 문서 (8개) — 필수 10필드 준수

**Files:**
- Create: `docs/project-management/task/TASK_team-lead.md`
- Create: `docs/project-management/task/TASK_platform.md`
- Create: `docs/project-management/task/TASK_engagement.md`
- Create: `docs/project-management/task/TASK_knowledge-1.md`
- Create: `docs/project-management/task/TASK_knowledge-2.md`
- Create: `docs/project-management/task/TASK_learning-card.md`
- Create: `docs/project-management/task/TASK_learning-ai.md`
- Create: `docs/project-management/task/TASK_frontend.md`

모든 Step은 반드시 아래 필드를 **이 순서대로** 포함한다:
1. Step Name
2. Step Goal (측정 가능 문장: "[주체]가 [행위]를 [결과]한다")
3. Done When (Step Goal 바로 다음 고정)
4. Scope (In Scope / Out of Scope)
5. Input
6. Instructions
7. Output Format
8. Constraints
9. Duration
10. RULE Reference
11. Assignee / Reviewer

- [ ] **Step 1: TASK_team-lead.md 작성 (3 Steps)**

Step 1: EKS/RDS/MSK/Redis/OpenSearch/ArgoCD 인프라 셋업
- Goal: 팀장이 AWS 인프라(EKS, RDS, MSK, Redis, OpenSearch)와 ArgoCD를 프로비저닝하여 4-서비스 배포 기반을 확보한다.
- Done When: EKS 클러스터 가동 + RDS/Redis/MSK/OpenSearch 접속 가능 + ArgoCD 대시보드 접근 가능
- Duration: 2일

Step 2: Docker Compose 4-서비스 + Schema Registry 구성
- Goal: 팀장이 Docker Compose로 4개 서비스 + Schema Registry + 인프라(PostgreSQL, Redis, Kafka, ES)를 로컬에서 한 번에 실행할 수 있다.
- Done When: `docker compose up` → 4-서비스 Health OK + Schema Registry 접속
- Duration: 1일

Step 3: CI/CD 기초 (mirror.yml + ci.yml + deploy.yml)
- Goal: 팀장이 GitHub Actions CI/CD 파이프라인(mirror sync, CI test, deploy)을 구성하여 main push 시 자동 빌드/배포가 동작한다.
- Done When: main push → CI 통과 → ECR 이미지 푸시 → ArgoCD dev 동기화
- Duration: 2일

- [ ] **Step 2: TASK_platform.md 작성 (3 Steps)**

Step 1: synapse-platform-svc 골격 생성
- Goal: @platform-owner가 Spring Boot 4 + Modulith 기반 platform-svc 프로젝트를 생성하여 auth/audit/billing/notification 4개 모듈 골격이 동작한다.
- Done When: 프로젝트 빌드 성공 + Modulith verify 통과 + Health endpoint 응답
- Duration: 1일

Step 2: auth 모듈 — OAuth 회원가입/로그인
- Goal: 사용자가 Google/GitHub OAuth를 통해 회원가입하고 로그인할 수 있다.
- Done When: OAuth 콜백 → 회원 생성/조회 + Access Token 반환 + 단위 테스트 통과
- Duration: 2일

Step 3: auth 모듈 — JWT 발급/검증 + MFA 기초
- Goal: 인증된 사용자에게 JWT Access/Refresh Token을 발급하고, Gateway에서 검증하며, MFA(TOTP) 등록 기초가 동작한다.
- Done When: JWT 발급/갱신/검증 API 동작 + MFA 등록 API 동작 + 슬라이스 테스트 통과
- Duration: 2일

- [ ] **Step 3: TASK_engagement.md 작성 (3 Steps)**

Step 1: synapse-engagement-svc 골격
- Goal: @engagement-owner가 Spring Boot 4 + Modulith 기반 engagement-svc를 생성하여 community/gamification 2개 모듈 골격이 동작한다.
- Done When: 빌드 성공 + Modulith verify + Health endpoint
- Duration: 0.5일

Step 2: community 모듈 — 그룹 CRUD
- Goal: 로그인 사용자가 학습 그룹을 생성/조회/수정/삭제할 수 있다.
- Done When: POST/GET/PUT/DELETE /api/v1/groups 동작 + 단위/슬라이스 테스트 통과
- Duration: 1.5일

Step 3: community 모듈 — 멤버 관리
- Goal: 그룹 소유자가 멤버를 초대/가입승인/탈퇴시킬 수 있고, 멤버는 자발적으로 가입/탈퇴할 수 있다.
- Done When: 멤버 CRUD API 동작 + 권한 체크(소유자만 관리) + 테스트 통과
- Duration: 2일

- [ ] **Step 4: TASK_knowledge-1.md 작성 (3 Steps)**

Step 1: synapse-knowledge-svc 골격
- Goal: @knowledge-owner-1이 Spring Boot 4 + Modulith 기반 knowledge-svc를 생성하여 note/graph/chunking 3개 모듈 골격이 동작한다.
- Done When: 빌드 성공 + Modulith verify + Health endpoint
- Duration: 0.5일

Step 2: note 모듈 — Markdown CRUD
- Goal: 로그인 사용자가 Markdown 노트를 생성/조회/수정/삭제할 수 있다.
- Done When: POST/GET/PUT/DELETE /api/v1/notes 동작 + Markdown 본문 저장/반환 + 테스트 통과
- Duration: 2일

Step 3: note 모듈 — 위키링크 파싱
- Goal: 노트 저장 시 `[[note-title]]` 형식의 위키링크를 자동으로 추출하여 note_links 테이블에 저장한다.
- Done When: 노트 생성/수정 시 위키링크 파싱 → note_links 저장 + 양방향 조회 API + 테스트 통과
- Duration: 1.5일

- [ ] **Step 5: TASK_knowledge-2.md 작성 (3 Steps)**

Step 1: Spring Modulith 모듈 정의 + @ApplicationModule
- Goal: @knowledge-owner-2가 knowledge-svc의 note/graph/chunking 모듈에 @ApplicationModule을 설정하고 모듈 간 의존성 규칙을 정의한다.
- Done When: ApplicationModules.verify() 통과 + 모듈 간 직접 import 시 빌드 실패 확인
- Duration: 1일

Step 2: ArchUnit 경계 검증 테스트 + CI 연동
- Goal: @knowledge-owner-2가 ArchUnit 테스트로 모듈 경계 위반을 자동 감지하고, CI 파이프라인에서 위반 시 빌드가 실패한다.
- Done When: ArchUnit 테스트 3건 이상 작성 + CI에서 자동 실행 + 위반 코드 시 FAIL 확인
- Duration: 1.5일

Step 3: Schema Registry 연동 검증
- Goal: @knowledge-owner-2가 Avro 스키마를 Schema Registry에 등록하고, BACKWARD 호환성 검증이 동작하는 것을 확인한다.
- Done When: note-created-v1.avsc 등록 성공 + 비호환 스키마 등록 시 거부 확인 + 통합 테스트 통과
- Duration: 1.5일

- [ ] **Step 6: TASK_learning-card.md 작성 (3 Steps)**

Step 1: synapse-learning-card 골격
- Goal: @learning-card-owner가 Spring Boot 4 + Modulith 기반 learning-card 프로젝트를 생성하여 card/srs 2개 모듈 골격이 동작한다.
- Done When: 빌드 성공 + Modulith verify + Health endpoint
- Duration: 0.5일

Step 2: card 모듈 — 덱/카드 CRUD
- Goal: 로그인 사용자가 덱(Deck)을 생성/관리하고, 덱 내 카드(앞면/뒷면)를 생성/조회/수정/삭제할 수 있다.
- Done When: 덱 CRUD + 카드 CRUD API 동작 + 덱-카드 1:N 관계 + 테스트 통과
- Duration: 2일

Step 3: card 모듈 — SM-2 알고리즘 기초
- Goal: 시스템이 카드 복습 결과(rating)를 받아 SM-2 알고리즘으로 다음 복습일과 ease factor를 계산한다.
- Done When: SM-2 계산 로직 구현 + 단위 테스트(4개 난이도 × 경계값) 통과
- Duration: 1.5일

- [ ] **Step 7: TASK_learning-ai.md 작성 (3 Steps)**

Step 1: FastAPI scaffolding
- Goal: @learning-ai-owner가 FastAPI + uvicorn 기반 learning-ai 프로젝트를 생성하여 Health endpoint와 기본 구조가 동작한다.
- Done When: `uvicorn main:app` → /health 200 OK + pytest 실행 가능 + Dockerfile 빌드 성공
- Duration: 0.5일

Step 2: Anthropic Claude API 연동
- Goal: learning-ai 서비스가 Anthropic Claude API를 호출하여 텍스트를 생성할 수 있다.
- Done When: POST /api/v1/ai/generate → Claude 응답 반환 + 에러 핸들링(429/500) + pytest 모킹 테스트 통과
- Duration: 1.5일

Step 3: OpenAI Embedding API 연결
- Goal: learning-ai 서비스가 텍스트를 OpenAI Embedding API로 벡터(1536차원)로 변환할 수 있다.
- Done When: POST /api/v1/ai/embed → 벡터 반환 + pgvector 저장 준비 + pytest 테스트 통과
- Duration: 2일

- [ ] **Step 8: TASK_frontend.md 작성 (3 Steps)**

Step 1: Flutter 앱 쉘 + ProviderScope + GoRouter
- Goal: 전체 팀이 Flutter 앱의 기본 구조(ProviderScope, GoRouter, ThemeData)를 생성하여 빈 화면이 라우팅으로 전환된다.
- Done When: `flutter run -d chrome` → 라우팅 동작 + DESIGN.md 테마 적용 확인
- Duration: 1일

Step 2: 인증 화면 (로그인/회원가입)
- Goal: 사용자가 Flutter Web에서 로그인/회원가입 화면을 통해 OAuth 인증을 수행할 수 있다.
- Done When: 로그인/회원가입 화면 렌더링 + OAuth 버튼 → platform-svc 연동 + 토큰 저장
- Duration: 2일

Step 3: 대시보드 레이아웃 + 사이드바
- Goal: 인증된 사용자가 대시보드 화면에서 사이드바 네비게이션(노트/카드/그래프/설정)을 통해 각 섹션으로 이동할 수 있다.
- Done When: 대시보드 + 사이드바(240px/56px 토글) 렌더링 + 라우트 연결 + 반응형(mobile/tablet/desktop)
- Duration: 2일

- [ ] **Step 9: 커밋**

```bash
git add docs/project-management/task/
git commit -m "docs: 프로젝트 관리 — W1 TASK 문서 8개 작성 (필수 10필드 준수)"
```

---

## Task 5: WORKFLOW 문서 (8개) — Task Step을 기능개발 10단계로 세분화

**Files:**
- Create: `docs/project-management/workflow/WORKFLOW_team-lead_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_platform_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_engagement_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_knowledge-1_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_knowledge-2_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_learning-card_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_learning-ai_W1.md`
- Create: `docs/project-management/workflow/WORKFLOW_frontend_W1.md`

각 Workflow는 TASK의 각 Step을 기능개발 10단계로 세분화한다:
1.1 TASK 시작 / 1.2 요구사항 분석 / 1.3 Security 1차 검토 / 1.4 ERD 설계 / 1.5 Security 2차 검토 / 1.6 DTO/Entity 설계 / 1.7 Repository / 1.8 Service+Test / 1.9 Controller+Test / 1.10 View+Test

**참고**: team-lead와 knowledge-2는 인프라/설정 작업이므로 10단계 중 해당하는 단계만 적용 (ERD, DTO 등은 해당 없을 수 있음).

- [ ] **Step 1: WORKFLOW_team-lead_W1.md 작성**

3개 Step × 적용 가능한 세부 단계. 인프라 작업이므로:
- 1.1 TASK 시작 → 1.2 요구사항 분석 → 1.3 보안 검토(접근제어) → 1.4 설계(인프라 아키텍처) → 1.5 보안 2차(네트워크) → 1.6 구성 파일 작성 → 1.7 배포/적용 → 1.8 검증 테스트 → 1.9 문서화

- [ ] **Step 2: WORKFLOW_platform_W1.md 작성**

3개 Step × 10단계. auth 모듈은 완전한 기능개발이므로 10단계 모두 적용:
- Step 2 (OAuth): 요구사항 → Security 1차(인증필수:No 회원가입이므로) → ERD(users/oauth_accounts) → Security 2차(비밀번호 암호화) → DTO(OAuthCallbackRequest/AuthResponse) → Entity → Repository → Service+Test → Controller+Test → View연동

- [ ] **Step 3: WORKFLOW_engagement_W1.md 작성**

3개 Step × 10단계. community 그룹 CRUD + 멤버 관리는 표준 기능개발:
- Step 2 (그룹CRUD): ERD(groups 테이블) → DTO(GroupCreateRequest/GroupResponse) → Repository → Service+Test → Controller+Test
- Step 3 (멤버): ERD(group_members) → 권한 체크(소유자) → Service+Test → Controller+Test

- [ ] **Step 4: WORKFLOW_knowledge-1_W1.md 작성**

3개 Step × 10단계. note CRUD + 위키링크:
- Step 2 (Markdown CRUD): ERD(notes 테이블) → DTO → Repository → Service+Test → Controller+Test
- Step 3 (위키링크): ERD(note_links) → 파서 구현 → Service+Test(정규식 추출 검증)

- [ ] **Step 5: WORKFLOW_knowledge-2_W1.md 작성**

3개 Step. Modulith/ArchUnit/Schema Registry 작업이므로:
- Step 1: 모듈 설정 파일 작성 → verify() 실행 → 위반 테스트
- Step 2: ArchUnit 의존성 룰 정의 → 테스트 작성 → CI yml 수정
- Step 3: Avro 스키마 작성 → Registry 등록 → 호환성 테스트

- [ ] **Step 6: WORKFLOW_learning-card_W1.md 작성**

3개 Step × 10단계. 덱/카드 CRUD + SM-2:
- Step 2 (CRUD): ERD(decks, cards) → DTO → Repository → Service+Test → Controller+Test
- Step 3 (SM-2): 알고리즘 설계 → Service 구현 → 단위 테스트(경계값)

- [ ] **Step 7: WORKFLOW_learning-ai_W1.md 작성**

3개 Step. Python/FastAPI이므로 Spring 기능개발 10단계를 Python 맥락으로 변환:
- Step 1: 프로젝트 구조 → pyproject.toml → Dockerfile → 테스트 셋업
- Step 2: API 클라이언트 작성 → 에러 핸들링 → pytest mock
- Step 3: Embedding 클라이언트 → 벡터 변환 → pgvector 스키마 준비

- [ ] **Step 8: WORKFLOW_frontend_W1.md 작성**

3개 Step. Flutter이므로:
- Step 1: 프로젝트 생성 → pubspec.yaml → GoRouter 설정 → ThemeData
- Step 2: 인증 화면 위젯 → Provider → API 연동 → Widget Test
- Step 3: 대시보드 레이아웃 → 사이드바 토글 → 반응형 → Widget Test

- [ ] **Step 9: 커밋**

```bash
git add docs/project-management/workflow/
git commit -m "docs: 프로젝트 관리 — W1 WORKFLOW 문서 8개 작성 (기능개발 10단계 세분화)"
```

---

## Task 6: HISTORY 문서 (8개) — 상태 대시보드 + 일지 템플릿

**Files:**
- Create: `docs/project-management/history/HISTORY_team-lead.md`
- Create: `docs/project-management/history/HISTORY_platform.md`
- Create: `docs/project-management/history/HISTORY_engagement.md`
- Create: `docs/project-management/history/HISTORY_knowledge-1.md`
- Create: `docs/project-management/history/HISTORY_knowledge-2.md`
- Create: `docs/project-management/history/HISTORY_learning-card.md`
- Create: `docs/project-management/history/HISTORY_learning-ai.md`
- Create: `docs/project-management/history/HISTORY_frontend.md`

각 HISTORY는:
1. 진행 상태 대시보드 (W1 Step들의 상태 테이블 — 초기값 "Not Started")
2. 작업 로그 (W1 5일치 날짜 템플릿 — 빈 상태로)

- [ ] **Step 1: 8개 HISTORY 파일 작성**

각 파일 구조:
```markdown
# Work History: {handle}

## 진행 상태 대시보드

### W1 (2026-05-12 ~ 05-16)
| Step | 상태 | 시작일 | 완료일 | 비고 |
|------|------|--------|--------|------|
| Step 1: {name} | Not Started | — | — | |
| Step 2: {name} | Not Started | — | — | |
| Step 3: {name} | Not Started | — | — | |

---

## 작업 로그

### W1

#### 2026-05-12 (월)
- **완료**:
- **진행 중**:
- **이슈**:
- **다음**:

#### 2026-05-13 (화)
...

#### 2026-05-14 (수)
...

#### 2026-05-15 (목)
...

#### 2026-05-16 (금)
- **완료**:
- **주간 요약**:
```

- [ ] **Step 2: 커밋**

```bash
git add docs/project-management/history/
git commit -m "docs: 프로젝트 관리 — HISTORY 문서 8개 초기 템플릿 작성"
```

---

## Task 7: 최종 검증 + 상호 참조 링크

**Files:**
- Modify: All 33 files (링크 확인)

- [ ] **Step 1: 문서 간 상호 참조 확인**

각 문서의 헤더에 관련 문서 링크가 올바른지 확인:
- SCOPE → PRD, TASK 링크
- PRD → SCOPE, TASK 링크
- TASK → SCOPE, WORKFLOW, HISTORY 링크
- WORKFLOW → TASK 링크
- HISTORY → TASK, WORKFLOW 링크

- [ ] **Step 2: TASK 필수 필드 검증**

8개 TASK 파일의 모든 Step이 10개 필드를 갖추고 있는지 확인:
- Step Goal이 "[주체]가 [행위]를 [결과]한다" 형식인지
- Done When이 Step Goal 바로 다음인지
- Scope가 In/Out으로 분리되어 있는지

- [ ] **Step 3: 최종 커밋**

```bash
git add docs/project-management/
git commit -m "docs: 프로젝트 관리 문서 체계 — 상호 참조 및 최종 검증 완료"
```
