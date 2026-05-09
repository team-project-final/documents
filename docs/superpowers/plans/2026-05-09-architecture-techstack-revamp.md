# 03 아키텍처 + 18 기술 스택 v2.0 Implementation Plan (그룹 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ADR-001/002 채택을 반영하여 `documents.wiki/03_프로젝트_아키텍처_정의서.md`와 `documents.wiki/18_기술_스택_정의서.md`를 v1.0 → v2.0으로 갱신한다 (in-place, 절 구조 보존).

**Architecture:** spec `2026-05-09-architecture-techstack-revamp-design.md` §4·§5 변경 매트릭스를 따라 21개 task로 분할. 03은 영향 절(3.1·3.2.4·3.4·3.5·3.6) 본문 Edit + H2 신규 1절 + 메타·주의문·변경 이력. 18은 1.2·1.4 갱신 + 신규 3항목(4.1.8 Spring Modulith / 5.5 Schema Registry / 5.6 Apache Avro) + 7.x ArgoCD ApplicationSet sub-section + 매트릭스 갱신 + 메타·주의문·변경 이력. 직교 콘텐츠는 보존만.

**Tech Stack:** Markdown / GFM 표·코드블록·Mermaid·ASCII / git (documents.wiki + syn).

**Repository constraints:**
- `documents.wiki` (D:\workspace\final-project-syn\documents.wiki): **git repo**. 03/18 갱신 후 commit + push 1회.
- `syn` (D:\workspace\final-project-syn\syn): git repo. plan 진척과 spec 변경을 commit (그룹 종료 시점).

**Source references:**
- spec: `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-architecture-techstack-revamp-design.md`
- 09 v2.0 (cross-reference 대상): `D:\workspace\final-project-syn\documents.wiki\09_Git_규칙_정의서.md`
- ADR 근거: `D:\workspace\final-project-syn\syn\docs\SYNAPSE_Service_Consolidation.md` (§2 4-서비스 명세, §6.3 K8s 재계산)

---

## File Structure

| 파일 | 역할 | 액션 |
|---|---|---|
| `documents.wiki/03_프로젝트_아키텍처_정의서.md` | 03 v1.0 본문 (전면 갱신 대상) | Edit N회 (Task 1~7) |
| `documents.wiki/18_기술_스택_정의서.md` | 18 v1.0 본문 (부분 갱신 대상) | Edit N회 (Task 9~17) |
| `syn/docs/superpowers/plans/2026-05-09-architecture-techstack-revamp.md` | 본 plan | 본 파일. 그룹 종료 시 commit |

직교 콘텐츠는 절 구조·본문 그대로 보존 (03: 3.2.1~3.2.3 / 3.3 / 3.7 / 3.8. 18: 2.x / 3.x / 4.1.1~4.1.7 / 4.2 / 5.1~5.3 / 6 / 7.1 / 7.5~7.7 / 8 / 9).

---

## Task 1: 03 메타데이터 v2.0 + ⚠️ 주의문 삽입

**Files:**
- Modify: `D:\workspace\final-project-syn\documents.wiki\03_프로젝트_아키텍처_정의서.md` (제목 직후, 메타데이터 블록 교체 + 주의문 신규 삽입)

- [ ] **Step 1: 03 파일 첫 10줄 Read하여 현재 메타데이터 정확한 문자열 확인**

`Read` 도구: file_path = 03 파일, offset = 0, limit = 10.

기대: line 1~6에 v1.0 메타데이터 블록 (제목 + 프로젝트명/버전/작성일/기술스택).

- [ ] **Step 2: 메타데이터 v1.0 → v2.0 + ⚠️ 주의문 신규 삽입 (Edit)**

`Edit`:
- file_path: 03 파일
- old_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v1.0
  > **작성일**: 2026-05-07
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s
  ```
- new_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v2.0
  > **작성일**: 2026-05-07
  > **수정일**: 2026-05-09
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

  > ⚠️ **v2.0 전면 개편 안내**
  >
  > 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §B1 레포 구조 / §B4 Schema Registry / Appendix A·B ADR 전문) 참조.
  >
  > 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
  >  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
  >  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 본 사이클)
  >  - `18_기술_스택_정의서` v2.0 (그룹 1 — 본 사이클)
  >  - `14_배포_가이드` v2.0 (그룹 2 — 다음 사이클)
  >  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 다음 사이클)
  >  - `17_스케줄` v2.0 (그룹 3 — 다음 사이클)
  ```

- [ ] **Step 3: 검증 — 메타·주의문 등장**

`Grep` (parallel 가능):
- pattern `\*\*버전\*\*: v2\.0` — 1+ matches
- pattern `채택일 2026-05-09` — 1+ matches
- pattern `09_Git_규칙_정의서.*v2\.0` — 1+ matches

---

## Task 2: 03 신규 H2 sub-section (4-서비스 통합 결정) 추가

**Files:**
- Modify: 03 파일 (`## 3.1 시스템 아키텍처 개요` 직전에 신규 H2 헤딩 + 본문 삽입)

- [ ] **Step 1: 03 파일에서 `## 3.1` 헤딩 위치 확인**

`Grep` (`-n true`): pattern `^## 3\.1`. 기대: 1 match (line ~10 근처).

- [ ] **Step 2: `## 3.1 시스템 아키텍처 개요` 직전에 신규 sub-section 삽입 (Edit)**

`Edit`:
- file_path: 03 파일
- old_string: `## 3.1 시스템 아키텍처 개요`
- new_string:
  ```markdown
  ## 4-서비스 통합 결정 (ADR-001 / ADR-002)

  Synapse는 원안의 10개 마이크로서비스를 4개의 굵은 서비스(synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc)로 통합하고, 각 서비스 내부는 Spring Modulith 모듈로 분리한다. AI Service는 learning-svc 안의 별도 컨테이너(learning-ai)로 운영한다. 채택일 2026-05-09. 결정 근거(7명 팀의 콘웨이 법칙·운영 비용 30% 절감·미래 분리 옵션 보존)와 ADR 전문은 `09_Git_규칙_정의서` v2.0 §0.1 / Appendix A·B 참조.

  ### 트랙 ↔ 레포 ↔ Owner 매핑

  | 트랙 | 인원 | 담당 레포 | 통합 원본 도메인 | 영문 handle |
  |---|:---:|---|---|---|
  | 팀장 | 1 | (전 영역 cross-review + 인프라/공통) | — | `@team-lead` |
  | 트랙 A | 1 | synapse-platform-svc | Auth + Audit + Billing + Notification | `@platform-owner` |
  | 트랙 B | 1 | synapse-engagement-svc | Community + Gamification | `@engagement-owner` |
  | 트랙 C | 2 | synapse-knowledge-svc | Note + Graph + Chunking | `@knowledge-owner-1`, `@knowledge-owner-2` |
  | 트랙 D | 2 | synapse-learning-svc (Java + Python) | Card + SRS + AI | `@learning-card-owner` (Java), `@learning-ai-owner` (Python) |
  | 협업 | 전체 | synapse-frontend (Flutter) | UI | `@team-lead` + 모든 owner |
  | 단독 관리 | 팀장 | synapse-shared, synapse-gitops, synapse-mirror | Avro / K8s manifest / 미러 | `@team-lead` |

  > 본 매핑은 `09_Git_규칙_정의서` §0.3과 동일. 본 03 v2.0의 모든 절은 이 4 서비스를 전제로 작성된다.

  ---

  ## 3.1 시스템 아키텍처 개요
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `^## 4-서비스 통합 결정`. 기대 1 match.
`Grep`: pattern `@platform-owner|@engagement-owner|@knowledge-owner-1|@learning-card-owner|@learning-ai-owner`. 기대 5+ matches.

---

## Task 3: 03 §3.1 시스템 다이어그램 — Core Services 10→4 노드 재작성

**Files:**
- Modify: 03 파일 §3.1 Mermaid 다이어그램 (line ~10~106 영역의 전체 다이어그램 안 `Core Services` subgraph)

- [ ] **Step 1: 03 §3.1 Mermaid 블록 정확한 본문 Read**

`Read`: 03 파일 offset 12, limit 95. 다이어그램 전체 확인.

- [ ] **Step 2: `Core Services` subgraph 노드 + 화살표를 4-서비스로 교체 (Edit)**

`Edit`:
- file_path: 03 파일
- old_string (정확한 v1.0 본문 — Read 결과로 얻은 그대로):
  ```
      subgraph Core["Core Services"]
          AUTH[Auth Service<br/>Spring Boot]
          NOTE[Note Service<br/>Spring Boot]
          CARD[Card Service<br/>Spring Boot]
          GRAPH[Graph Service<br/>Spring Boot]
          AI[AI Service<br/>FastAPI]
          BILL[Billing Service<br/>Spring Boot]
          AUDIT[Audit Service<br/>Spring Boot]
          COMM[Community Service<br/>Spring Boot]
          GAME[Gamification Service<br/>Spring Boot]
          NOTIF[Notification Service<br/>Spring Boot]
      end
  ```
- new_string:
  ```
      subgraph Core["Core Services (4-서비스 통합)"]
          PLATFORM["synapse-platform-svc<br/>Spring Boot + Modulith<br/>auth · audit · billing · notification"]
          ENGAGEMENT["synapse-engagement-svc<br/>Spring Boot + Modulith<br/>community · gamification"]
          KNOWLEDGE["synapse-knowledge-svc<br/>Spring Boot + Modulith<br/>note · graph · chunking"]
          LEARNING_CARD["synapse-learning-svc / learning-card<br/>Spring Boot + Modulith<br/>card · srs (Java)"]
          LEARNING_AI["synapse-learning-svc / learning-ai<br/>FastAPI<br/>ai (Python)"]
      end
  ```

- [ ] **Step 3: Core Services로 들어가는 Gateway 화살표 + 나가는 Data 화살표 재연결 (Edit)**

`Edit`:
- old_string (정확한 v1.0 화살표 블록):
  ```
      GW --> AUTH
      GW --> NOTE
      GW --> CARD
      GW --> GRAPH
      GW --> AI
      GW --> BILL
      GW --> AUDIT
      GW --> COMM
      GW --> GAME
      GW --> NOTIF
  ```
- new_string:
  ```
      GW --> PLATFORM
      GW --> ENGAGEMENT
      GW --> KNOWLEDGE
      GW --> LEARNING_CARD
      GW --> LEARNING_AI
  ```

- [ ] **Step 4: Core Services → Data Layer 화살표 재매핑 (Edit, replace_all 권장)**

데이터 화살표는 v1.0의 각 서비스에서 PG/RD/ES/KF/S3로 향한다. 4-서비스로 재매핑:

`Edit`:
- old_string (한 블록으로 v1.0 데이터 화살표 전체 — Read로 정확히 확인):
  ```
      AUTH --> PG
      AUTH --> RD
      AUTH --> OAUTH
      NOTE --> PG
      NOTE --> ES
      NOTE --> S3
      NOTE --> KF
      CARD --> PG
      CARD --> RD
      CARD --> KF
      GRAPH --> PG
      GRAPH --> RD
      AI --> PG
      AI --> RD
      AI --> ES
      AI --> OPENAI
      BILL --> PG
      BILL --> STRIPE
      AUDIT --> PG
      AUDIT --> KF
      COMM --> PG
      COMM --> RD
      COMM --> KF
      GAME --> PG
      GAME --> RD
      GAME --> KF
      NOTIF --> PG
      NOTIF --> RD
      NOTIF --> KF
      NOTIF --> FCM
      NOTIF --> SES
  ```
- new_string:
  ```
      PLATFORM --> PG
      PLATFORM --> RD
      PLATFORM --> KF
      PLATFORM --> OAUTH
      PLATFORM --> STRIPE
      PLATFORM --> FCM
      PLATFORM --> SES
      ENGAGEMENT --> PG
      ENGAGEMENT --> RD
      ENGAGEMENT --> KF
      KNOWLEDGE --> PG
      KNOWLEDGE --> ES
      KNOWLEDGE --> S3
      KNOWLEDGE --> KF
      LEARNING_CARD --> PG
      LEARNING_CARD --> RD
      LEARNING_CARD --> KF
      LEARNING_AI --> PG
      LEARNING_AI --> RD
      LEARNING_AI --> ES
      LEARNING_AI --> OPENAI
  ```

- [ ] **Step 5: 검증**

`Grep`: pattern `synapse-platform-svc<br/>|synapse-engagement-svc<br/>|synapse-knowledge-svc<br/>|synapse-learning-svc / learning-card|synapse-learning-svc / learning-ai`. 기대 5 matches.
`Grep`: pattern `AUTH\[Auth Service<br/>Spring Boot\]|NOTE\[Note Service<br/>Spring Boot\]|GAME\[Gamification Service<br/>Spring Boot\]`. 기대 0 matches (v1.0 서비스 노드 잔재 없음).

---

## Task 4: 03 §3.2.4 Core Services — 4-서비스 + 내부 모듈 매트릭스로 전면 재구성

**Files:**
- Modify: 03 파일 §3.2.4 (line ~169~275 영역)

- [ ] **Step 1: §3.2.4 정확한 본문 Read**

`Read`: 03 파일 offset 169, limit 110.

- [ ] **Step 2: §3.2.4의 10개 서비스 책임 표 헤더부터 §3.3 직전까지 전체를 4-서비스 매트릭스로 교체 (Edit)**

`Edit`:
- file_path: 03 파일
- old_string: `### 3.2.4 Core Services\n\n#### Auth Service` 부터 `## 3.3 멀티테넌시 모델` 직전까지 v1.0 본문 전체 (Step 1 Read로 정확한 본문 획득 후 그대로 적용)
- new_string:

```markdown
### 3.2.4 Core Services (4-서비스 + 내부 모듈)

각 서비스는 단일 git 레포로 운영되며 Spring Modulith로 내부 모듈을 분리한다. 모듈 경계는 ArchUnit으로 검증된다 (CI 자동화 — 09 §A3 참조). 미래에 트래픽이 한 모듈에 집중되면 그 모듈을 별도 서비스로 추출하는 옵션을 보존한다.

#### synapse-platform-svc (1명 owner — 트랙 A `@platform-owner`)

> Cross-cutting + 외부 SaaS 통합. 비즈니스 로직 단순, 외부 API 위주.

| 모듈 | 책임 |
|------|------|
| `auth/` | OAuth 2.0 (Google/GitHub/Apple/Microsoft 연동), JWT 발급 (Access 15분 + Refresh 7일 httpOnly Cookie), MFA TOTP, Redis 기반 Refresh Token 관리, 가입 시 자동 테넌트 생성 + 초대 가입 |
| `audit/` | Kafka 이벤트 소비 → audit_logs 적재, processed_events 기반 Idempotency, 관리자 감사 로그 검색 API, 90일 보존 → Cold Storage 이관 |
| `billing/` | Free/Pro/Team/Enterprise 플랜 정의, Stripe Checkout Session / Customer Portal, Webhook 처리 (결제 성공·실패·구독 변경), usage_counters 기반 사용량 제한 (403 반환), Stripe Invoice 조회 |
| `notification/` | Kafka 이벤트 소비 → notification_preferences 확인 → notifications INSERT, FCM (Android/Web) / APNs (iOS) 푸시, AWS SES 이메일, 인앱 알림 (Redis 미읽음 카운트), notification_preferences CRUD (quiet_hours), card.review.due 복습 리마인더, device_tokens 등록·삭제 |

외부 의존성: Google/GitHub/Apple/Microsoft OAuth · Stripe API + Webhook · FCM / APNs / AWS SES · AWS Secrets Manager.

#### synapse-engagement-svc (1명 owner — 트랙 B `@engagement-owner`)

> 사용자 참여·동기 부여. 외부 의존 적고 다른 서비스 이벤트 소비 중심.

| 모듈 | 책임 |
|------|------|
| `community/` | 스터디 그룹 CRUD (생성·수정·삭제·가입 신청·승인·거절·초대), 멤버 역할 변경 (owner/admin/member·강퇴·밴), 덱·노트 공유 (public/group/link, share_token 발급), 신고 접수 (동일 타겟 중복 방지·사용자당 일 10건 제한) |
| `gamification/` | xp_events INSERT → total_xp 업데이트 → 레벨 상승 판정, level_definitions 기반 레벨 업, criteria_json 동기 평가 배지 수여, Cron Job으로 주간/월간 leaderboards 자동 생성, daily Cron Job 스트릭 리셋 |

의존성: PostgreSQL · Redis (리더보드 Sorted Set 캐시) · Kafka (`card.reviewed` / `note.created` / `community.*` 소비 + `gamification.*` 발행) · learning-svc internal API (`/internal/decks/copy`).

#### synapse-knowledge-svc (2명 owner — 트랙 C `@knowledge-owner-1` / `@knowledge-owner-2`)

> 노트 + 지식 그래프. Synapse 정체성의 Core 도메인.

| 모듈 | 책임 |
|------|------|
| `note/` | Markdown CRUD (저장·조회·수정·삭제), 위키링크 `[[...]]` 파싱 → note_links 갱신, 저장 시 note_versions 생성, S3 Presigned URL 첨부파일, Elasticsearch 동기화 (Kafka) |
| `graph/` | 백링크 조회 (특정 노트를 가리키는 모든 노트), 노드(노트) + 엣지(링크) → D3.js 시각화 데이터, 주기적 PageRank 계산 (중요 노트 식별), 관련 노트 그룹 자동 클러스터링 |
| `chunking/` | 비동기 청크 분할, learning-ai 호출 통한 임베딩 생성, pgvector 적재 |

의존성: PostgreSQL · Elasticsearch · AWS S3 · Kafka 발행 (`note.created/updated/deleted` / `graph.notes.linked`) · Kafka 소비 (`user.deleted` 정리).

#### synapse-learning-svc (2명 owner — 트랙 D `@learning-card-owner` Java / `@learning-ai-owner` Python)

> 학습 + AI. 가장 큰 서비스. Java + Python 두 컨테이너.

| 컨테이너 / 모듈 | 책임 |
|------|------|
| `learning-card` (Java / Spring Boot) — `card/`, `srs/` | 카드/덱 CRUD (수동 카드 관리), SM-2 알고리즘 기반 due_date 계산, 오늘의 복습 카드 조회 (due_date <= now), rating → SM-2 → 다음 복습일, review_sessions 시작·완료·통계 |
| `learning-ai` (Python / FastAPI) — `ai/` | 노트 텍스트 → LLM → 카드 자동 생성 (basic/cloze), 쿼리 임베딩 → pgvector 시맨틱 검색, 시맨틱 + BM25 RRF 하이브리드, RAG 기반 Q&A, 시맨틱 캐시 (코사인 유사도 > 0.95), 토큰/비용 사용량 추적 |

K8s 배치: 두 Deployment로 분리 (`learning-card-deployment` / `learning-ai-deployment`). 인터페이스: Kafka 이벤트 + Internal REST API.

의존성: PostgreSQL + pgvector · Redis · Elasticsearch · OpenAI API · Anthropic Claude API · Kafka 소비 (`note.created` 자동 카드 생성 / `note.updated`) · Kafka 발행 (`card.reviewed` / `card.review.due`).

> 4-서비스 통합 근거·서비스별 owner 책임·미래 분리 로드맵 등 상세는 `SYNAPSE_Service_Consolidation.md` §2 / 09 §0 참조.
```

- [ ] **Step 3: 검증**

`Grep`: pattern `^#### synapse-(platform-svc|engagement-svc|knowledge-svc|learning-svc)`. 기대 4 matches.
`Grep`: pattern `^#### Auth Service|^#### Note Service|^#### Card Service|^#### Graph Service|^#### AI Service|^#### Billing Service|^#### Audit Service|^#### Community Service|^#### Gamification Service|^#### Notification Service`. 기대 0 matches.
`Grep`: pattern `auth/|audit/|billing/|notification/|community/|gamification/|note/|graph/|chunking/|card/|srs/|ai/`. 본 §3.2.4 영역에서 12+ matches (모듈 이름).

---

## Task 5: 03 §3.4 이벤트 기반 통합 — Kafka 토픽 다이어그램 + 스키마 + 페이로드 + 내부 API 갱신

**Files:**
- Modify: 03 파일 §3.4 영역 (line ~342~493)

- [ ] **Step 1: §3.4 Mermaid Producer/Consumer 노드 라벨을 4-서비스로 재작성 (Edit)**

`Edit`:
- file_path: 03 파일
- old_string:
  ```
      subgraph Producers
          NS[Note Service]
          CS[Card Service]
          AS[Auth Service]
          BS[Billing Service]
          COMM[Community Service]
          GAME[Gamification Service]
          GS[Graph Service]
      end
  ```
- new_string:
  ```
      subgraph Producers
          KNOW_NS[knowledge-svc / note 모듈]
          LEARN_CS[learning-svc / card 모듈]
          PLAT_AS[platform-svc / auth 모듈]
          PLAT_BS[platform-svc / billing 모듈]
          ENG_COMM[engagement-svc / community 모듈]
          ENG_GAME[engagement-svc / gamification 모듈]
          KNOW_GS[knowledge-svc / graph 모듈]
      end
  ```

- [ ] **Step 2: Producer 화살표 라벨을 새 노드 ID로 일괄 교체 (Edit, replace_all)**

`Edit`:
- file_path: 03 파일
- old_string: `    NS --> T1\n    NS --> T2\n    NS --> T3\n    CS --> T4\n    CS --> T17\n    AS --> T5\n    BS --> T6\n    COMM --> T8\n    COMM --> T9\n    COMM --> T10\n    COMM --> T11\n    COMM --> T12`
- new_string: `    KNOW_NS --> T1\n    KNOW_NS --> T2\n    KNOW_NS --> T3\n    LEARN_CS --> T4\n    LEARN_CS --> T17\n    PLAT_AS --> T5\n    PLAT_BS --> T6\n    ENG_COMM --> T8\n    ENG_COMM --> T9\n    ENG_COMM --> T10\n    ENG_COMM --> T11\n    ENG_COMM --> T12`

- [ ] **Step 3: §3.4 Mermaid의 나머지 Producer/Consumer 화살표 잔재 노드 ID도 4-서비스로 재매핑**

`Read`로 §3.4 Mermaid 끝 부분 (offset ~388, limit ~50) 정확한 본문 확인 후, Producer 추가 화살표(`GAME --> ...`, `GS --> ...` 등)와 Consumer subgraph 노드(`AI2`, `ES2`, `AUD`, `STAT`, `GAME2`, `NOTIF`)를 다음과 같이 변경:

`Edit`:
- old_string: `        AI2[AI Service<br/>청킹/임베딩]\n        ES2[Search Indexer<br/>ES 동기화]\n        AUD[Audit Service<br/>감사 로그]\n        STAT[Stats Aggregator<br/>통계 집계]\n        GAME2[Gamification Service<br/>XP/배지 처리]\n        NOTIF[Notification Service<br/>알림 발송]`
- new_string: `        LEARN_AI2[learning-svc / ai 모듈<br/>청킹·임베딩]\n        KNOW_ES2[knowledge-svc / note 모듈<br/>ES 동기화 indexer]\n        PLAT_AUD[platform-svc / audit 모듈<br/>감사 로그]\n        ENG_STAT[engagement-svc / gamification 모듈<br/>통계 집계]\n        ENG_GAME2[engagement-svc / gamification 모듈<br/>XP·배지 처리]\n        PLAT_NOTIF[platform-svc / notification 모듈<br/>알림 발송]`

- [ ] **Step 4: §3.4 이벤트 스키마 절 끝에 Avro/Schema Registry 1단락 추가**

`Read`로 §3.4 "이벤트 스키마 (CloudEvents 호환)" 절 끝 위치 확인.

`Edit`:
- file_path: 03 파일
- old_string: `### 신규 토픽 페이로드 스키마` (이 헤딩 직전에 1단락 삽입)
- new_string:
  ```markdown
  > **스키마 정식 관리**: 모든 이벤트 페이로드는 `synapse-shared` 레포 안 Avro `.avsc` 파일로 정식 정의되며, Confluent Schema Registry로 진화 호환성을 검증한다. 글로벌 호환성 모드는 **BACKWARD**, `Knowledge.events-value`는 **BACKWARD_TRANSITIVE**로 더 엄격. 변경 PR 절차 6단계와 절대 금지 사항(NONE 모드 / 필드 이름 변경 / default 없는 필드 추가 / enum 값 제거 / 필수 필드 삭제)은 09 §B4 참조.

  ### 신규 토픽 페이로드 스키마
  ```

- [ ] **Step 5: §3.4 내부 API 표의 "발행 서비스" 또는 "호스트" 라벨이 v1.0의 도메인 서비스명으로 적혀 있다면 4-서비스명으로 정정**

`Read`로 §3.4 "내부 API (서비스 간 통신)" 절 본문 확인 후, 표 안의 호스트가 `note-service` / `card-service` 같은 v1.0 도메인 서비스명이면 다음으로 일괄 변경:
- `note-service` → `knowledge-svc`
- `card-service` → `learning-svc / learning-card`
- `graph-service` → `knowledge-svc`
- `ai-service` → `learning-svc / learning-ai`
- `auth-service` → `platform-svc`
- `billing-service` → `platform-svc`
- `community-service` → `engagement-svc`
- `gamification-service` → `engagement-svc`
- `notification-service` → `platform-svc`

만약 v1.0 본문에 위 패턴이 없다면 그대로 둠.

`Edit`로 발견된 패턴별 1회씩 (replace_all 신중하게 사용 — 각 패턴이 다른 곳에서도 등장할 수 있으니 grep으로 미리 빈도 확인).

- [ ] **Step 6: 검증**

`Grep`: pattern `KNOW_NS|LEARN_CS|PLAT_AS|PLAT_BS|ENG_COMM|ENG_GAME|KNOW_GS|LEARN_AI2|KNOW_ES2|PLAT_AUD|ENG_STAT|ENG_GAME2|PLAT_NOTIF`. 기대 13+ matches.
`Grep`: pattern `\bNS\[Note Service\]|\bCS\[Card Service\]|\bAS\[Auth Service\]|\bBS\[Billing Service\]|\bCOMM\[Community Service\]`. 기대 0 matches.
`Grep`: pattern `BACKWARD_TRANSITIVE|Schema Registry`. 기대 1+ matches in §3.4.

---

## Task 6: 03 §3.5 데이터 흐름 + §3.6 ApplicationSet 1단락 + K8s 리소스 5행 재계산

**Files:**
- Modify: 03 파일 §3.5 (line ~494~525) + §3.6 (line ~526~571)

- [ ] **Step 1: §3.5 데이터 흐름 시퀀스 라벨에 v1.0 도메인 서비스명이 있으면 4-서비스로 정정**

`Read`로 §3.5 본문 확인. 시퀀스 다이어그램 / actor 라벨 / 텍스트 본문에서 `Note Service` / `AI Service` / `Card Service` / `Graph Service` 등이 등장하면 다음으로 변경:
- `Note Service` → `knowledge-svc / note 모듈`
- `AI Service` → `learning-svc / learning-ai 모듈`
- `Card Service` → `learning-svc / learning-card 모듈`
- `Graph Service` → `knowledge-svc / graph 모듈`

발견된 본문에 따라 Edit 호출 (각 1회씩).

- [ ] **Step 2: §3.6 AWS EKS + ArgoCD GitOps 절 끝에 ApplicationSet 1~2단락 추가**

`Read`로 §3.6 본문 확인 후 `### K8s 리소스 구성` 헤딩 직전에 다음 단락 삽입:

`Edit`:
- file_path: 03 파일
- old_string: `### K8s 리소스 구성`
- new_string:
  ```markdown
  > **ArgoCD ApplicationSet (matrix generator)**: 5개 서비스(`platform-svc` / `engagement-svc` / `knowledge-svc` / `learning-card` / `learning-ai`) × 3개 환경(`dev` / `staging` / `prod`) = 15개 ArgoCD Application을 단일 ApplicationSet 매트릭스로 정의한다. dev는 `autoSync=true`(main push → image build → kustomization newTag bump → 자동 배포), staging/prod는 `autoSync=false`(수동 승인). 풀 YAML과 deploy.yml의 GitOps 갱신 단계는 09 §B3 참조.

  ### K8s 리소스 구성
  ```

- [ ] **Step 3: §3.6 K8s 리소스 표 (10행 → 5행) 전면 갱신**

`Read`로 §3.6 K8s 리소스 표 정확한 본문 확인. 그 후:

`Edit`:
- file_path: 03 파일
- old_string: v1.0 K8s 리소스 표 전체 (Read 결과 그대로)
- new_string:
  ```markdown
  | 서비스 | CPU req | Memory req | HPA |
  |---|---|---|---|
  | `synapse-platform-svc` | 500m | 1Gi | 1 ~ 3 |
  | `synapse-engagement-svc` | 500m | 1Gi | 1 ~ 3 |
  | `synapse-knowledge-svc` | 1000m | 2Gi | 2 ~ 6 |
  | `synapse-learning-svc / learning-card` | 500m | 1Gi | 2 ~ 4 |
  | `synapse-learning-svc / learning-ai` | 1000m | 2Gi | 2 ~ 8 |
  | **합계** | **~3500m** | **~7Gi** | (10개 서비스 가정 ~5000m / 10Gi 대비 약 30% 절감) |
  ```

- [ ] **Step 4: 검증**

`Grep`: pattern `ArgoCD ApplicationSet \(matrix generator\)|matrix generator`. 기대 1+.
`Grep`: pattern `synapse-platform-svc.*500m|synapse-knowledge-svc.*1000m|synapse-learning-svc / learning-ai.*1000m`. 기대 3+ in §3.6.
`Grep`: pattern `30% 절감`. 기대 1+.

---

## Task 7: 03 변경 이력 v2.0 row 추가

**Files:**
- Modify: 03 파일 변경 이력 표 (문서 끝부분에 있을 가능성, Read로 위치 확인)

- [ ] **Step 1: 03 파일에서 "변경 이력" 또는 "Change Log" 섹션 위치 확인**

`Grep` (`-n true`): pattern `^## .+변경 이력|^## .+Change Log|^## 변경 이력`. 본 03 v1.0에는 없을 수도 — 없다면 문서 끝에 새 섹션 추가.

- [ ] **Step 2-A: 변경 이력 섹션이 이미 있는 경우 — v2.0 row 추가**

`Edit`로 v1.0 마지막 row 직후에 다음 row 추가:
```markdown
| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. 신규 H2 sub-section "4-서비스 통합 결정" + ⚠️ 주의문 추가. 3.1 시스템 다이어그램 (10→4 노드) / 3.2.4 Core Services (4-서비스 + 내부 모듈 매트릭스로 전면 재구성) / 3.4 Kafka 토픽 producer/consumer 4-서비스 재매핑 + 이벤트 스키마에 Avro/Schema Registry 단락 추가 / 3.5 데이터 흐름 라벨 갱신 / 3.6 ArgoCD ApplicationSet 단락 + K8s 리소스 표 5행 재계산 (~30% 절감). 직교 절(3.2.1~3.2.3 / 3.3 / 3.7 / 3.8) 보존. |
```

- [ ] **Step 2-B: 변경 이력 섹션이 없는 경우 — 문서 끝에 신규 섹션 추가**

`Edit`로 03 파일 마지막 라인 직후 신규 섹션:
```markdown

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v1.0 | 2026-05-07 | Synapse Team | 초안 작성 (10개 마이크로서비스 가정) |
| v2.0 | 2026-05-09 | Synapse Team | (위 v2.0 row 본문 그대로) |
```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| v2\.0 \| 2026-05-09 \|`. 기대 1+ match.

---

## Task 8: 03 v2.0 종합 검증 (spec §8 03 측면)

- [ ] **Step 1: 8.1 구조/일관성 일괄 grep**

| 패턴 | 기대 |
|---|---|
| `Auth Service\|Note Service\|Card Service\|Graph Service\|AI Service\|Billing Service\|Audit Service\|Community Service\|Gamification Service\|Notification Service` | 0 matches (단, Mermaid 노드 라벨 `Notification Service<br/>` 같은 v1.0 잔재가 있다면 다시 확인 후 정정) |
| `synapse-platform-svc` | 5+ |
| `synapse-engagement-svc` | 4+ |
| `synapse-knowledge-svc` | 5+ |
| `synapse-learning-svc` | 5+ |

- [ ] **Step 2: 8.2 매핑/참조 무결성**

| 패턴 | 기대 |
|---|---|
| `09_Git_규칙_정의서.*v2\.0\|§0\.1\|§B1\|§B3\|§B4\|Appendix A` | 3+ matches |
| `\| v2\.0 \| 2026-05-09 \|` | 1+ |

- [ ] **Step 3: 8.4 콘텐츠 보존 — 직교 절 라인 수**

`Read`로 §3.3 멀티테넌시 / §3.7 보안 / §3.8 모니터링 본문 길이 확인 (v1.0 대비 변경 거의 없음).

- [ ] **Step 4: 8.5 분량**

`Bash`: `wc -l 'D:\workspace\final-project-syn\documents.wiki\03_프로젝트_아키텍처_정의서.md'`
기대: 600 ~ 1000줄 범위.

---

## Task 9: 18 메타데이터 v2.0 + ⚠️ 주의문 삽입

**Files:**
- Modify: `D:\workspace\final-project-syn\documents.wiki\18_기술_스택_정의서.md` (제목 직후)

- [ ] **Step 1: 18 파일 첫 10줄 Read하여 현재 메타데이터 확인**

`Read`: 18 파일 offset 0, limit 10.

- [ ] **Step 2: 메타데이터 v1.0 → v2.0 + ⚠️ 주의문 신규 삽입 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v1.0
  > **작성일**: 2026-05-07
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis 7, Elasticsearch 8, Kafka 3.x, K8s
  ```
- new_string (Task 1과 동일 ⚠️ 주의문 블록 삽입, 본문 위치만 18로):
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v2.0
  > **작성일**: 2026-05-07
  > **수정일**: 2026-05-09
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis 7, Elasticsearch 8, Kafka 3.x, K8s

  > ⚠️ **v2.0 전면 개편 안내**
  >
  > 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §B1 레포 구조 / §B4 Schema Registry / Appendix A·B ADR 전문) 참조.
  >
  > 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
  >  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
  >  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 본 사이클)
  >  - `18_기술_스택_정의서` v2.0 (그룹 1 — 본 사이클)
  >  - `14_배포_가이드` v2.0 (그룹 2 — 다음 사이클)
  >  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 다음 사이클)
  >  - `17_스케줄` v2.0 (그룹 3 — 다음 사이클)
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\*\*버전\*\*: v2\.0`. 기대 1+ match.
`Grep`: pattern `채택일 2026-05-09`. 기대 1+ match.

---

## Task 10: 18 §1.2 시스템 아키텍처 ASCII 다이어그램 — Layer 4 4-서비스 재구성

**Files:**
- Modify: 18 파일 §1.2 ASCII 다이어그램 (line ~24~71)

- [ ] **Step 1: §1.2 본문 정확한 위치 Read**

`Read`: 18 파일 offset 24, limit 50. Layer 4 라인을 정확히 매칭하기 위해.

- [ ] **Step 2: Layer 4 ASCII 라인 교체 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string:
  ```
  │                   Layer 4: Backend Services                         │
  │  Auth  │ Note  │ Card  │ Graph │  AI   │Billing│ Audit │  Comm      │
  │ Spring │Spring │Spring │Spring │FastAPI│Spring │Spring │ Spring     │
  │  Boot  │ Boot  │ Boot  │ Boot  │Python │ Boot  │ Boot  │  Boot      │
  │        │       │       │       │       │       │       │            │
  │              Gamification │ Notification (Spring Boot)              │
  ```
- new_string:
  ```
  │                   Layer 4: Backend Services (4-서비스 통합)         │
  │  synapse-platform-svc  │  synapse-engagement-svc                    │
  │   auth · audit         │   community                                │
  │   billing · notification│   gamification                            │
  │  Spring Boot + Modulith│  Spring Boot + Modulith                    │
  ├────────────────────────┴────────────────────────────────────────────┤
  │  synapse-knowledge-svc │  synapse-learning-svc                      │
  │   note · graph         │   learning-card: card · srs (Java)         │
  │   chunking             │   learning-ai: ai (Python / FastAPI)       │
  │  Spring Boot + Modulith│  Spring Boot + Modulith / FastAPI          │
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `Layer 4: Backend Services \(4-서비스 통합\)`. 기대 1.
`Grep`: pattern `Auth.+Note.+Card.+Graph.+AI` in §1.2 영역. 기대 0 matches in line range 24~75 (Read로 검증).

---

## Task 11: 18 §1.4 기술 스택 전체 목록 표 — 4행 추가

**Files:**
- Modify: 18 파일 §1.4 (line ~87~119)

- [ ] **Step 1: §1.4 표 마지막 행 위치 확인**

`Read`: 18 파일 offset 113, limit 10.

- [ ] **Step 2: §1.4 표의 `Data | AWS S3 | - | 오브젝트 스토리지` 행 직후에 4행 추가 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string: `| Data | AWS S3 | - | 오브젝트 스토리지 |`
- new_string:
  ```
  | Data | AWS S3 | - | 오브젝트 스토리지 |
  | Backend | Spring Modulith | 1.x | 모듈 경계 강제 + ArchUnit 통합 검증 |
  | Data | Confluent Schema Registry | 7.x | Avro 스키마 진화 호환성 검증 |
  | Data | Apache Avro | 1.11.x | 이벤트 직렬화 / 스키마 정의 |
  | Infra | ArgoCD ApplicationSet | 2.x | 매트릭스 제너레이터 (5×3 환경) |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `Spring Modulith\s*\|\s*1\.x|Confluent Schema Registry\s*\|\s*7\.x|Apache Avro\s*\|\s*1\.11\.x|ArgoCD ApplicationSet\s*\|\s*2\.x`. 기대 4 matches.

---

## Task 12: 18 §4.1.8 Spring Modulith 신규 항목 추가

**Files:**
- Modify: 18 파일 (Java/Spring 챕터 끝, 4.1.7 Testcontainers 직후 또는 4.2 직전)

- [ ] **Step 1: 4.1.7 Testcontainers 절 끝 / 4.2 헤딩 직전 위치 확인**

`Grep` (`-n true`): pattern `^### 4\.2 Python/FastAPI Ecosystem`. 기대 1 match (line ~2295).

- [ ] **Step 2: `### 4.2 Python/FastAPI Ecosystem` 직전에 신규 4.1.8 절 삽입 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string: `### 4.2 Python/FastAPI Ecosystem`
- new_string:

```markdown
### 4.1.8 Spring Modulith 1.x

#### 개요
Spring Boot 기반 애플리케이션 안에서 **모듈 경계**를 명시적으로 정의하고 검증할 수 있게 하는 Spring 공식 라이브러리. 패키지 단위 모듈화 + 모듈 간 의존성 그래프 + ArchUnit 자동 통합 + 모듈 문서·다이어그램 자동 생성을 제공한다.

#### 역할
4-서비스 통합(ADR-001)으로 굵은 서비스(synapse-platform-svc / engagement-svc / knowledge-svc / learning-svc)가 만들어진 후, 각 서비스 안 모듈(auth/audit/billing/notification 등)의 경계를 코드 수준에서 강제한다. 모듈 간에는 직접 호출이 아닌 이벤트 또는 명시 API 통신만 허용되며, 위반 시 ArchUnit 테스트가 빌드를 실패시킨다. 미래에 모듈을 별도 서비스로 추출할 때 경계가 깨끗하게 유지되어 마이그레이션이 용이하다.

#### 선택 이유
4-서비스 통합은 운영 부담을 줄이는 대신 도메인 사일로 위험을 안았다. Spring Modulith가 없으면 한 서비스 안 모듈들이 자유롭게 서로의 internal 클래스에 접근하여 시간이 갈수록 모놀리식 진흙공이 되고 분리 옵션을 잃는다. ArchUnit만으로도 일부 가능하지만 Modulith는 모듈 정의·검증·문서화를 통합 제공한다. Spring Boot 4와 1차 호환되며 Spring 공식 지원으로 장기 안정성이 확보된다.

#### 대안 비교

| 기술 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| **Spring Modulith 1.x** | Spring 공식, 모듈 정의 + 검증 + 문서화 통합, ApplicationModuleListener 이벤트 | 비교적 신규(1.0 GA 2023), Spring Boot 의존 | ✅ 선택 |
| ArchUnit 단독 | 성숙도 ↑, 다양한 룰 | 모듈 정의 자체는 별도 패키지 컨벤션으로 관리 필요. 문서·다이어그램 자동 생성 없음 | ❌ |
| Maven multi-module / Gradle subproject | 빌드 수준 격리 | 단일 서비스 안에 여러 빌드 단위 → CI 복잡, Spring Boot 통합 빌드 흐름과 충돌 | ❌ |
| 수동 패키지 분리 | 추가 의존성 없음 | 강제력 없음, 시간 갈수록 무너짐 | ❌ |

#### 기술적 이점
- **모듈 정의 명시화**: `package-info.java` 또는 `@ApplicationModule`로 모듈 단위와 의존성 선언
- **자동 검증**: `ApplicationModules.of(Application.class).verify()` 호출만으로 모든 모듈 경계 검사
- **이벤트 발행**: `ApplicationEventPublisher` 통합 → 모듈 간 통신을 이벤트로 강제
- **문서 자동 생성**: 모듈 다이어그램 (PlantUML / AsciiDoc) + Spring REST Docs 통합
- **Observability**: 모듈 진입/이탈 자동 추적 (Micrometer 통합)
- **Spring Boot 통합**: starter 의존성 1줄로 활성화, 별도 인프라 불필요

#### 핵심 기능
1. **`@ApplicationModule`** — 패키지 또는 클래스에 모듈 선언, 허용된 의존 모듈 명시
2. **`@ApplicationModuleListener`** — 모듈 간 이벤트 핸들러 (기본 비동기, 트랜잭션 분리)
3. **`ApplicationModules.verify()`** — 빌드 시 또는 테스트 시 경계 위반 차단
4. **`ApplicationModules.toDocumentation()`** — 모듈 의존성 다이어그램 + 모듈별 README 자동 생성
5. **`@DocumentationDescription`** — 모듈 설명을 코드 옆에 두어 문서 표류 방지
6. **Modulith Test Slices** — `@ApplicationModuleTest`로 모듈 단위 통합 테스트

#### 프로젝트 내 사용 위치
- `synapse-platform-svc/src/main/java/.../auth/package-info.java` (auth 모듈 선언)
- `synapse-platform-svc/src/main/java/.../audit/package-info.java`
- `synapse-platform-svc/src/main/java/.../billing/package-info.java`
- `synapse-platform-svc/src/main/java/.../notification/package-info.java`
- `synapse-engagement-svc/src/main/java/.../{community,gamification}/package-info.java`
- `synapse-knowledge-svc/src/main/java/.../{note,graph,chunking}/package-info.java`
- `synapse-learning-svc/learning-card/src/main/java/.../{card,srs}/package-info.java`
- 각 서비스 `src/test/.../ModularityTest.java` (`ApplicationModules.verify()` 호출)

#### 설정 가이드

```kotlin
// build.gradle.kts (각 Java 서비스)
dependencies {
    implementation("org.springframework.modulith:spring-modulith-starter-core")
    implementation("org.springframework.modulith:spring-modulith-starter-jpa")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test")
}
```

```java
// src/main/java/.../auth/package-info.java
@ApplicationModule(
    displayName = "Auth Module",
    allowedDependencies = {"shared"}  // 다른 모듈에 의존하지 않음
)
package com.synapse.platform.auth;

import org.springframework.modulith.ApplicationModule;
```

```java
// src/test/.../ModularityTest.java
class ModularityTest {
    ApplicationModules modules = ApplicationModules.of(PlatformSvcApplication.class);

    @Test
    void verifiesModularStructure() {
        modules.verify();
    }

    @Test
    void writesDocumentationSnippets() {
        new Documenter(modules)
            .writeDocumentation()
            .writeIndividualModulesAsPlantUml();
    }
}
```

#### 트러블슈팅
- **모듈 경계 위반(`Cycle detected`)**: 두 모듈이 서로의 internal 클래스를 직접 호출. 해법: 호출을 이벤트(`ApplicationEventPublisher.publishEvent(...)`) 또는 명시 API(인터페이스 노출)로 변경
- **`ApplicationModules.verify()` 가 모듈을 못 찾음**: 패키지 구조가 모놀리식 1-depth면 모듈 인식 실패. 해법: 도메인별 sub-package + `@ApplicationModule` 또는 `package-info.java` 추가
- **순환 의존성**: A 모듈이 B를 호출하고 B가 A를 호출. 해법: 공통 인터페이스를 `shared` 모듈로 추출하거나 이벤트 기반으로 양방향을 단방향으로 변환

#### 공식 문서
- https://spring.io/projects/spring-modulith
- ArchUnit 통합: https://docs.spring.io/spring-modulith/reference/

```

- [ ] **Step 3: 검증**

`Grep`: pattern `^### 4\.1\.8 Spring Modulith 1\.x`. 기대 1.
`Grep`: pattern `^#### 개요|^#### 역할|^#### 선택 이유|^#### 대안 비교|^#### 기술적 이점|^#### 핵심 기능|^#### 프로젝트 내 사용 위치|^#### 설정 가이드|^#### 트러블슈팅|^#### 공식 문서` (4.1.8 영역에서). 기대 9+ matches.

---

## Task 13: 18 §5.5 Confluent Schema Registry 신규 항목 추가

**Files:**
- Modify: 18 파일 (현재 5.5 AWS S3 직전)

- [ ] **Step 1: 5.5 AWS S3 헤딩 위치 확인**

`Grep` (`-n true`): pattern `^### 5\.5 AWS S3`. 기대 1 (line ~3632).

- [ ] **Step 2: `### 5.5 AWS S3` 직전에 신규 5.5 절 삽입 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string: `### 5.5 AWS S3`
- new_string:

```markdown
### 5.5 Confluent Schema Registry 7.x

#### 개요
Apache Avro / Protobuf / JSON Schema 기반 메시지의 **스키마 레지스트리**. Kafka producer/consumer가 메시지를 직렬화·역직렬화할 때 스키마 ID만 페이로드에 포함하고 실제 스키마는 Registry에서 조회한다. 스키마 진화 호환성 (BACKWARD / FORWARD / FULL / NONE)을 강제하여 producer가 호환성 깨는 변경을 푸시하면 거부한다.

#### 역할
Synapse는 4-서비스 + Kafka 18개 토픽 기반 이벤트 아키텍처다. Schema Registry는 producer가 호환성 깨는 스키마 변경을 푸시하면 PR CI 단계에서 거부하여, consumer가 알 수 없는 스키마로 깨지는 것을 막는다. 모든 .avsc는 `synapse-shared` 레포에 정식 관리되며, PR 머지 시 자동으로 Registry에 등록된다.

#### 선택 이유
JSON 메시지로 시작했다가 Avro로 전환하는 패턴은 진화 호환성을 깨뜨려 운영 사고로 이어지는 안티패턴(09 §C2 트랩 4 참조). 처음부터 Schema Registry + Avro로 시작하는 것이 4-서비스 분산 환경에서 필수다. Confluent를 선택한 이유는 Kafka 생태계 표준이고 Confluent Cloud / 자체 호스팅 모두 가능하며, AWS Glue Schema Registry 대비 Kafka 통합이 깊다.

#### 대안 비교

| 기술 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| **Confluent Schema Registry 7.x** | Kafka 표준, 호환성 모드 다양, Cloud + 자체 호스팅 | Confluent License (Community Edition은 무료) | ✅ 선택 |
| AWS Glue Schema Registry | AWS 통합, 무료 | Kafka 외 통합 약함, 기능 제한 | ❌ |
| Apicurio Registry | 오픈소스, 다양한 직렬화 포맷 | 운영 사례 적음 | ❌ |
| 수동 스키마 (없음) | 단순 | 진화 호환성 깨짐, 운영 사고 보장 | ❌ |

#### 호환성 모드

| 모드 | 의미 | Synapse 적용 |
|------|------|------|
| **BACKWARD** | 새 스키마로 옛 데이터 읽기 가능 (필드 추가는 default 필요) | **글로벌 기본** |
| **BACKWARD_TRANSITIVE** | BACKWARD를 모든 이전 버전에 적용 | `Knowledge.events-value` (Note는 핵심 도메인 — 더 엄격) |
| FORWARD | 옛 스키마로 새 데이터 읽기 가능 | 미사용 |
| FULL | BACKWARD + FORWARD 둘 다 | 미사용 |
| **NONE** | 호환성 검사 없음 | **절대 금지** |

상세 정책·변경 PR 절차·절대 금지 사항은 09 §B4 참조.

#### 기술적 이점
- **이진 효율**: 메시지 페이로드에 스키마 ID(4바이트)만 포함, 본문은 스키마 따라 직렬화 → JSON 대비 50~80% 작은 크기
- **호환성 강제**: producer가 깨는 변경 시도 시 Registry가 즉시 거부 (PR CI 단계에서 차단)
- **버전 관리**: 모든 스키마 버전이 Registry에 보관, consumer가 옛 메시지를 옛 스키마로 디코드 가능
- **다중 포맷**: Avro / Protobuf / JSON Schema 모두 지원 (Synapse는 Avro만 사용)
- **자동 등록**: `producer.send()` 시 스키마가 자동 등록 (또는 CI가 명시 등록)

#### 핵심 기능
1. **Subject 기반 관리** — 토픽당 `{topic}-key` / `{topic}-value` 두 subject
2. **호환성 검증** — `compatibility/{subject}/versions/latest` 엔드포인트로 PR 검증
3. **버전 발행** — `subjects/{name}/versions` POST로 새 스키마 등록
4. **REST API** — Confluent Schema Registry REST API로 모든 작업 가능
5. **Kafka Serdes 통합** — Avro Serializer/Deserializer가 자동으로 Registry 조회
6. **Schema 진화 메타데이터** — `aliases` / `default` / `null union`으로 호환성 유지

#### 프로젝트 내 사용 위치
- `synapse-shared/src/main/avro/{platform,knowledge,learning,engagement,shared}/*.avsc` (스키마 정의)
- 각 서비스 `application.yml`: `spring.kafka.properties.schema.registry.url` 설정
- `synapse-shared/.github/workflows/schema-check.yml` (PR 시 호환성 검증 — 09 §B4 참조)

#### 설정 가이드

```yaml
# 각 서비스 application.yml
spring:
  kafka:
    properties:
      schema.registry.url: ${SCHEMA_REGISTRY_URL}
      basic.auth.credentials.source: USER_INFO
      basic.auth.user.info: ${SCHEMA_REGISTRY_USER}:${SCHEMA_REGISTRY_PASS}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: io.confluent.kafka.serializers.KafkaAvroDeserializer
      properties:
        specific.avro.reader: true
```

```bash
# Registry에 등록된 subject 조회
curl -u user:pass https://schema-registry/subjects

# 특정 subject의 호환성 모드 조회
curl -u user:pass https://schema-registry/config/Knowledge.events-value
```

#### 트러블슈팅
- **`Schema being registered is incompatible`** — 호환성 모드 위반. 해법: aliases 추가 / default 값 설정 / null union 사용. 절대 모드를 NONE으로 낮추지 말 것
- **`Subject not found`** — Producer가 새 토픽으로 발행 시도, Registry에 미등록. 해법: `synapse-shared`에 .avsc 추가 → PR 머지로 자동 등록
- **Consumer가 옛 메시지를 못 디코드** — Registry 다운 또는 네트워크 단절. 해법: Registry HA 구성 (Confluent Cloud 권장) + Consumer Cache TTL 설정

#### 공식 문서
- https://docs.confluent.io/platform/current/schema-registry/index.html
- 호환성 모드: https://docs.confluent.io/platform/current/schema-registry/avro.html

### 5.5 AWS S3
```

> ⚠️ **주의**: 위 new_string의 마지막 라인 `### 5.5 AWS S3`는 v1.0의 기존 헤딩이지만, 이 task에서 신규 5.5를 추가했으므로 다음 task(14)에서 절번호를 5.7로 정정한다. 본 task에서는 v1.0 헤딩을 그대로 유지(중복 5.5 두 개 발생). Task 14가 5.5 AWS S3 → 5.7 AWS S3로 정정한다.

- [ ] **Step 3: 검증**

`Grep`: pattern `^### 5\.5 Confluent Schema Registry 7\.x`. 기대 1.
`Grep`: pattern `BACKWARD_TRANSITIVE|Knowledge\.events-value`. 기대 2+.
`Grep`: pattern `^### 5\.5 AWS S3`. 기대 1 (Task 14에서 정리 예정 — 임시로 5.5 중복 허용).

---

## Task 14: 18 §5.6 Apache Avro 신규 항목 추가 + 5.5 AWS S3 → 5.7로 정정

**Files:**
- Modify: 18 파일 (Schema Registry 직후 + AWS S3 절번호 정정)

- [ ] **Step 1: 신규 5.6 Apache Avro + AWS S3 절번호 동시 정정 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string: `### 5.5 AWS S3` (Task 13 후 v1.0 잔재 헤딩)
- new_string:

```markdown
### 5.6 Apache Avro 1.11.x

#### 개요
JSON 스키마 기반의 **이진 직렬화 포맷**. 스키마 자체가 JSON으로 정의되며 데이터는 스키마 따라 이진 인코딩. 진화 호환성에 강하며 Hadoop / Kafka 생태계 표준.

#### 역할
Synapse의 모든 Kafka 메시지 페이로드 직렬화 포맷. `synapse-shared` 레포 안 `.avsc` 파일로 스키마를 정의하고, Gradle Avro Plugin이 컴파일 시 Java 클래스를 자동 생성한다. Kafka Avro Serializer가 Schema Registry와 함께 동작하여 메시지에는 스키마 ID(4바이트)만 포함된다.

#### 선택 이유
JSON 대비 50~80% 작은 페이로드, 강타입 직렬화로 런타임 오류 감소, Schema Registry 통합으로 진화 호환성 자동 검증. Protobuf 대비 JSON 표현이 친숙해 .avsc 작성·리뷰가 쉽고, Kafka 생태계에서 사실상 표준.

#### 대안 비교

| 기술 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| **Apache Avro 1.11.x** | Kafka 표준, JSON 스키마, Schema Registry 통합 | Java 외 언어에서 도구 약함 (Python OK) | ✅ 선택 |
| Protobuf | 강타입, gRPC 통합, 다언어 | .proto 신규 학습 부담, Schema Registry 통합 약함 | ❌ |
| JSON Schema | 가장 단순, 사람이 읽기 쉬움 | 페이로드 크고 진화 호환성 약함 | ❌ |

#### 기술적 이점
- **컴파일 시 Java 클래스 자동 생성** — Gradle Avro Plugin
- **Generic Record + Specific Record** 양쪽 지원
- **Logical Type** — UUID / decimal / timestamp-millis 표준 매핑
- **Default 값** — 스키마 진화 핵심 메커니즘

#### 핵심 기능
1. **`.avsc` 스키마 정의** — JSON 형식
2. **Schema Resolution** — writer schema ↔ reader schema 자동 매칭
3. **Aliases** — 필드 이름 변경 호환성 유지
4. **Union** — `["null", "string"]` 패턴으로 nullable 표현
5. **Logical Types** — `{"type": "string", "logicalType": "uuid"}`
6. **Builder Pattern** — Specific Record 생성 시 자동 빌더

#### 프로젝트 내 사용 위치
- `synapse-shared/src/main/avro/**/*.avsc` (모든 스키마 정의)
- `synapse-shared/build.gradle.kts` (Avro Gradle Plugin 설정)
- 각 서비스 `dependencies { implementation("org.synapse:synapse-shared:0.4.2") }` (생성된 Java 클래스 사용)

#### 설정 가이드

```kotlin
// synapse-shared/build.gradle.kts
plugins {
    id("com.github.davidmc24.gradle.plugin.avro") version "1.9.1"
}

avro {
    fieldVisibility.set("PRIVATE")
    stringType.set("String")
    enableDecimalLogicalType.set(true)
}
```

```json
// synapse-shared/src/main/avro/knowledge/NoteCreated.avsc
{
  "type": "record",
  "name": "NoteCreated",
  "namespace": "com.synapse.knowledge.events",
  "fields": [
    {"name": "noteId", "type": {"type": "string", "logicalType": "uuid"}},
    {"name": "tenantId", "type": {"type": "string", "logicalType": "uuid"}},
    {"name": "title", "type": "string"},
    {"name": "createdAt", "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "version", "type": "int", "default": 1}
  ]
}
```

#### 트러블슈팅
- **`Field X has no default value`** — 필드를 추가하면서 default를 주지 않음. BACKWARD 호환성 깨짐. 해법: `"default": null` (union 시) 또는 적절한 기본값 추가
- **`Cannot find Avro class`** — Gradle Avro Plugin 미적용 또는 generate 단계 누락. 해법: `./gradlew generateAvroJava` 명시 실행 후 빌드
- **Aliases가 작동 안 함** — 글로벌 호환성 모드가 NONE이거나 reader가 옛 클래스 사용. 해법: 모드 BACKWARD 확인 + reader 재컴파일

#### 공식 문서
- https://avro.apache.org/docs/1.11.1/
- Gradle Plugin: https://github.com/davidmc24/gradle-avro-plugin

### 5.7 AWS S3
```

- [ ] **Step 2: 검증**

`Grep`: pattern `^### 5\.6 Apache Avro 1\.11\.x`. 기대 1.
`Grep`: pattern `^### 5\.7 AWS S3`. 기대 1.
`Grep`: pattern `^### 5\.5 AWS S3`. 기대 0 (정정 완료).
`Grep`: pattern `^### 5\.5 Confluent Schema Registry`. 기대 1 (Task 13 결과).

---

## Task 15: 18 §5.4 Kafka 1단락 + §7.2 K8s 리소스 + §7.3 ArgoCD ApplicationSet sub-section + §7.4 GitHub Actions

**Files:**
- Modify: 18 파일 §5.4 / §7.2 / §7.3 / §7.4

- [ ] **Step 1: §5.4 Kafka 절 끝에 1단락 추가**

먼저 §5.4 절 끝 위치 확인 (다음 헤딩 직전):

`Grep` (`-n true`): pattern `^### 5\.5 Confluent Schema Registry`. 기대 1 match.

`Edit`:
- file_path: 18 파일
- old_string: `### 5.5 Confluent Schema Registry 7.x`
- new_string:
  ```markdown
  > **Schema Registry / Avro와 함께 사용**: Synapse의 모든 Kafka 메시지는 `synapse-shared` 레포 안 `.avsc` Avro 스키마로 정의되며, Confluent Schema Registry로 진화 호환성을 강제한다 (5.5 / 5.6 참조).

  ### 5.5 Confluent Schema Registry 7.x
  ```

- [ ] **Step 2: §7.2 AWS EKS K8s 리소스 표 갱신 (있는 경우)**

`Read`로 §7.2 본문 (offset ~4454, limit ~140) 확인. K8s 리소스 표가 있으면 03 §3.6과 동일한 5행 표로 정정. 없으면 skip.

만약 표가 있다면:

`Edit`:
- file_path: 18 파일
- old_string: v1.0 K8s 리소스 표 전체 (Read 결과 그대로 — 패턴은 03 §3.6과 유사할 가능성)
- new_string: 03 Task 6 Step 3과 동일한 5행 표

- [ ] **Step 3: §7.3 ArgoCD 절 끝에 ApplicationSet sub-section 신규 추가**

먼저 §7.4 GitHub Actions 헤딩 위치 확인:

`Grep` (`-n true`): pattern `^### 7\.4 GitHub Actions`. 기대 1 (line ~4683).

`Edit`:
- file_path: 18 파일
- old_string: `### 7.4 GitHub Actions`
- new_string:

```markdown
#### ApplicationSet (Synapse 적용)

Synapse는 5개 서비스(`platform-svc` / `engagement-svc` / `knowledge-svc` / `learning-card` / `learning-ai`) × 3개 환경(`dev` / `staging` / `prod`) = 15개 ArgoCD Application을 단일 **ApplicationSet matrix generator**로 정의한다.

| 환경 | autoSync | 트리거 |
|------|---|---|
| `dev` | `true` | 각 서비스 main push → image build → kustomization newTag bump → ArgoCD 자동 동기화 |
| `staging` | `false` | 수동 승인 |
| `prod` | `false` | 수동 승인 + 추가 검토 |

풀 ApplicationSet YAML과 deploy.yml의 GitOps 갱신 단계는 `09_Git_규칙_정의서` v2.0 §B3 참조.

### 7.4 GitHub Actions
```

- [ ] **Step 4: §7.4 GitHub Actions 절 끝에 폴리레포 워크플로 1단락 추가**

먼저 §7.5 Cloudflare 헤딩 위치 확인:

`Grep` (`-n true`): pattern `^### 7\.5 Cloudflare`. 기대 1 (line ~4795).

`Edit`:
- file_path: 18 파일
- old_string: `### 7.5 Cloudflare`
- new_string:
  ```markdown
  #### Synapse 폴리레포 워크플로

  Synapse는 4-서비스 폴리레포 + 미러 + GitOps 구조를 갖는다. 각 서비스 레포에 다음 GitHub Actions 워크플로를 둔다:

  - **`mirror.yml`** — main push 시 `synapse-mirror` 레포로 자동 동기화 (rsync exclude 적용)
  - **`ci.yml`** — Lint / 단위 테스트 / 통합 테스트 / 빌드 / SonarQube / Snyk / **ArchUnit + Spring Modulith** 모듈 경계 검증
  - **`deploy.yml`** — image ECR 푸시 + `synapse-gitops`의 `kustomization.yaml` newTag bump

  `synapse-shared` 레포에는 추가로:

  - **`schema-check.yml`** — Avro `.avsc` PR 시 Confluent Schema Registry BACKWARD 호환성 검증

  풀 워크플로 YAML과 PAT(`MIRROR_TOKEN` / `GITOPS_TOKEN`) 정책은 `09_Git_규칙_정의서` v2.0 §B2 / §B3 / §B4 / §B6 참조.

  ### 7.5 Cloudflare
  ```

- [ ] **Step 5: 검증**

`Grep`: pattern `Schema Registry / Avro와 함께 사용`. 기대 1.
`Grep`: pattern `^#### ApplicationSet \(Synapse 적용\)`. 기대 1.
`Grep`: pattern `^#### Synapse 폴리레포 워크플로`. 기대 1.
`Grep`: pattern `mirror\.yml|deploy\.yml|schema-check\.yml`. 기대 3+.

---

## Task 16: 18 §10.1 / §10.2 / §12.1 / §12.4 매트릭스 갱신

**Files:**
- Modify: 18 파일 §10.1 (line ~6057~6110) + §10.2 (line ~6111~6203) + §12.1 (line ~6220~6232) + §12.4 (line ~6256~6266)

- [ ] **Step 1: §10.1 전체 기술 스택 요약표 4행 추가**

`Read`로 §10.1 표 마지막 행 확인. 마지막 행 직후 다음 4행 추가:

`Edit`:
- file_path: 18 파일
- old_string: §10.1 표의 v1.0 마지막 row (Read 결과 그대로)
- new_string: 그 라인 + 다음 4행:
  ```
  | Backend | Spring Modulith 1.x | 모듈 경계 강제 + ArchUnit 통합 검증 |
  | Data | Confluent Schema Registry 7.x | Avro 스키마 진화 호환성 검증 |
  | Data | Apache Avro 1.11.x | 이벤트 직렬화 / 스키마 정의 |
  | Infra | ArgoCD ApplicationSet 2.x | 매트릭스 제너레이터 (5×3 환경) |
  ```

(컬럼 수가 §10.1 표와 다를 수 있으니 Read로 확인 후 정확한 컬럼 맞춤. §1.4 표는 4컬럼이었지만 §10.1은 3컬럼일 수도)

- [ ] **Step 2: §10.2 기술 의존성 다이어그램에 Schema Registry / Modulith 노드 추가**

`Read`로 §10.2 Mermaid 본문 확인. Mermaid 그래프에 다음 노드 추가:
- `MODULITH[Spring Modulith]` — Spring Boot 노드 옆
- `SCHEMAREG[Confluent Schema Registry]` — Kafka 노드 옆
- `AVRO[Apache Avro]` — Schema Registry 옆

화살표:
- `SPRINGBOOT --> MODULITH`
- `KAFKA --> SCHEMAREG`
- `SCHEMAREG --> AVRO`

`Edit`로 §10.2 Mermaid 블록의 적절한 위치(노드 정의 끝 + 화살표 끝)에 위 라인 삽입.

- [ ] **Step 3: §12.1 Spring Boot 4 생태계 표에 Modulith 행 추가**

`Read`로 §12.1 표 확인.

`Edit`:
- file_path: 18 파일
- old_string: §12.1 표의 v1.0 마지막 row (Read 결과)
- new_string: 그 라인 + `| Spring Modulith | 1.x | Spring Boot 4.x 호환 |`

- [ ] **Step 4: §12.4 인프라 버전 요구사항 표에 신규 행 추가**

`Read`로 §12.4 표 확인.

`Edit`:
- file_path: 18 파일
- old_string: §12.4 표의 v1.0 마지막 row
- new_string: 그 라인 + 다음 3행:
  ```
  | Confluent Schema Registry | 7.x | Kafka 3.x 호환 |
  | Apache Avro | 1.11.x | Schema Registry 7.x 호환 |
  | ArgoCD ApplicationSet | 2.x | matrix generator 사용 |
  ```

- [ ] **Step 5: 검증**

`Grep`: pattern `Spring Modulith.*1\.x`. 기대 3+ (1.4 표 + 10.1 + 12.1).
`Grep`: pattern `Confluent Schema Registry.*7\.x`. 기대 3+ (1.4 + 10.1 + 12.4).
`Grep`: pattern `Apache Avro.*1\.11\.x`. 기대 3+ (1.4 + 10.1 + 12.4).

---

## Task 17: 18 변경 이력 v2.0 row 추가

**Files:**
- Modify: 18 파일 §11 변경 이력 (문서 끝 line ~6280)

- [ ] **Step 1: §11 변경 이력 표 마지막 row 위치 확인**

`Read`: 18 파일 offset 6275, limit 20.

- [ ] **Step 2: v2.0 row 추가 (Edit)**

`Edit`:
- file_path: 18 파일
- old_string: §11 표의 v1.0 row (Read 결과 그대로)
- new_string: 그 라인 + 다음 row:
  ```
  | v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 + 신규 백과사전 항목(4.1.8 Spring Modulith / 5.5 Confluent Schema Registry / 5.6 Apache Avro) 추가. 1.2 시스템 다이어그램 4-서비스 재구성 / 1.4 기술 스택 표 4행 추가 / 5.4 Kafka 절 Avro 단락 / 5.5 AWS S3 → 5.7 절번호 정정 / 7.3 ArgoCD ApplicationSet sub-section / 7.4 폴리레포 워크플로 단락 / 10.1 / 10.2 / 12.1 / 12.4 매트릭스 갱신. 직교 절(2.x / 3.x / 4.1.1~4.1.7 / 4.2 / 5.1~5.3 / 6 / 7.1 / 7.5~7.7 / 8 / 9) 보존. |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| v2\.0 \| 2026-05-09 \|.*Spring Modulith`. 기대 1+.

---

## Task 18: 18 v2.0 종합 검증 (spec §8 18 측면)

- [ ] **Step 1: 8.1 / 8.2 일괄 grep**

| 패턴 | 기대 |
|---|---|
| `Spring Modulith.*1\.x` | 3+ |
| `Confluent Schema Registry.*7\.x` | 3+ |
| `Apache Avro.*1\.11\.x` | 3+ |
| `^### 4\.1\.8 Spring Modulith 1\.x` | 1 |
| `^### 5\.5 Confluent Schema Registry 7\.x` | 1 |
| `^### 5\.6 Apache Avro 1\.11\.x` | 1 |
| `^### 5\.7 AWS S3` | 1 |
| `^### 5\.5 AWS S3` | 0 |
| `09_Git_규칙_정의서.*§B[1-6]` | 3+ |
| `\| v2\.0 \| 2026-05-09 \|` | 1+ |
| `채택일 2026-05-09` | 1+ |

- [ ] **Step 2: 8.4 콘텐츠 보존 — 직교 절 라인 수 비교**

직교 챕터(2.x Client / 4.2 Python / 5.1~5.3 / 6 AI/ML / 8 모니터링 / 9 외부 서비스)는 v1.0 라인 수와 거의 동일해야 한다.

`Bash`: `wc -l 'D:\workspace\final-project-syn\documents.wiki\18_기술_스택_정의서.md'`
기대: 6,200 ~ 7,000줄.

---

## Task 19: 그룹 1 통합 검증 (spec §8 5영역 양 문서 종합)

- [ ] **Step 1: 양 문서 잔재 정리 일괄 grep**

```bash
# 03 v1.x 도메인 서비스명 잔재
grep -r '#### Auth Service\|#### Note Service\|#### Card Service' 'D:\workspace\final-project-syn\documents.wiki\03_프로젝트_아키텍처_정의서.md'
# 18 5.5 AWS S3 잔재
grep -r '^### 5\.5 AWS S3' 'D:\workspace\final-project-syn\documents.wiki\18_기술_스택_정의서.md'
```

기대: 모두 0 matches.

- [ ] **Step 2: 분량 확인**

```bash
wc -l 'D:\workspace\final-project-syn\documents.wiki\03_프로젝트_아키텍처_정의서.md' \
      'D:\workspace\final-project-syn\documents.wiki\18_기술_스택_정의서.md'
```

기대: 03 ∈ [600, 1000], 18 ∈ [6200, 7000].

- [ ] **Step 3: spec §8.2 매핑 무결성**

`Grep` (양 문서 각각): pattern `09_Git_규칙_정의서.*v2\.0`. 03 ≥ 1 / 18 ≥ 1.

---

## Task 20: documents.wiki commit + push

- [ ] **Step 1: status 확인**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' status -s
```

기대: M 03_프로젝트_아키텍처_정의서.md / M 18_기술_스택_정의서.md (2 modified files).

- [ ] **Step 2: 두 파일 add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' add \
  '03_프로젝트_아키텍처_정의서.md' \
  '18_기술_스택_정의서.md'

git -C 'D:\workspace\final-project-syn\documents.wiki' commit -m "$(cat <<'EOF'
docs: 03 아키텍처 + 18 기술 스택 v2.0 갱신 (그룹 1)

ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영.
09_Git_규칙_정의서 v2.0 채택 전제로 후속 갱신 5문서 중 그룹 1을 처리.

03_프로젝트_아키텍처_정의서:
- 신규 H2 sub-section "4-서비스 통합 결정" + ⚠️ 주의문
- 3.1 시스템 다이어그램 (10→4 노드)
- 3.2.4 Core Services (4-서비스 + 내부 모듈 매트릭스로 전면 재구성)
- 3.4 Kafka 토픽 producer/consumer 4-서비스 재매핑 + Avro/Schema Registry 단락
- 3.5 데이터 흐름 라벨 갱신
- 3.6 ArgoCD ApplicationSet 단락 + K8s 리소스 표 5행 (~30% 절감)
- 직교 절(3.2.1~3.2.3 / 3.3 / 3.7 / 3.8) 보존

18_기술_스택_정의서:
- ⚠️ 주의문 + 신규 백과사전 3항목 (4.1.8 Spring Modulith / 5.5 Confluent Schema Registry / 5.6 Apache Avro)
- 1.2 시스템 다이어그램 4-서비스 재구성
- 1.4 기술 스택 표 4행 추가
- 5.4 Kafka 절 Avro 단락
- 5.5 AWS S3 → 5.7 절번호 정정
- 7.3 ArgoCD ApplicationSet sub-section
- 7.4 폴리레포 워크플로 단락
- 10.1 / 10.2 / 12.1 / 12.4 매트릭스 갱신
- 직교 챕터(2.x / 3.x / 4.1.1~4.1.7 / 4.2 / 5.1~5.3 / 6 / 7.1 / 7.5~7.7 / 8 / 9) 보존

후속: 그룹 2(14+10) / 그룹 3(17)은 별도 사이클.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\documents.wiki' push
```

- [ ] **Step 3: push 확인**

기대 출력: `<old-sha>..<new-sha>  master -> master`

---

## Task 21: syn 레포에 plan 진척 commit + push

- [ ] **Step 1: plan 파일 add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\syn' add docs/superpowers/plans/2026-05-09-architecture-techstack-revamp.md

git -C 'D:\workspace\final-project-syn\syn' commit -m "$(cat <<'EOF'
docs(plan): 03 + 18 v2.0 그룹 1 작성 완료 — 21 task 검증 통과

documents.wiki에 03 v2.0 / 18 v2.0 push 완료. 양 문서 모두
ADR-001/002 채택 반영. 직교 콘텐츠는 보존.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\syn' push
```

- [ ] **Step 2: 사용자에게 결과 보고**

> "그룹 1(03 + 18 v2.0) 작성·검증·push 완료.
> - documents.wiki: 03 / 18 갱신, push commit 1건
> - syn 레포: spec + plan commit 2건 (push 완료)
> - 후속: 그룹 2(14_배포_가이드 + 10_환경_설정_템플릿) / 그룹 3(17_스케줄)은 별도 사이클로 진행 가능"

---

## Self-Review (이 plan을 작성한 후 점검)

### 1. Spec 커버리지

| spec 섹션 | plan task |
|---|---|
| spec §3 메타·주의문 (양 문서) | Task 1 (03), Task 9 (18) |
| spec §4 03 변경 매트릭스 — 메타 | Task 1 |
| spec §4 03 신규 H2 (4-서비스 통합 결정) | Task 2 |
| spec §4 03 §3.1 시스템 다이어그램 | Task 3 |
| spec §4 03 §3.2.4 Core Services | Task 4 |
| spec §4 03 §3.4 Kafka + 스키마 + 페이로드 + 내부 API | Task 5 |
| spec §4 03 §3.5 + §3.6 ApplicationSet + K8s 리소스 | Task 6 |
| spec §4 03 변경 이력 v2.0 | Task 7 |
| spec §4 03 검증 (8 row) | Task 8 |
| spec §5 18 메타·주의문 | Task 9 |
| spec §5 18 §1.2 시스템 다이어그램 | Task 10 |
| spec §5 18 §1.4 기술 스택 표 | Task 11 |
| spec §5 18 §4.1.8 Spring Modulith 신규 | Task 12 |
| spec §5 18 §5.5 Confluent Schema Registry 신규 | Task 13 |
| spec §5 18 §5.6 Apache Avro 신규 + 5.5 AWS S3 → 5.7 정정 | Task 14 |
| spec §5 18 §5.4 / §7.2 / §7.3 / §7.4 갱신 | Task 15 |
| spec §5 18 §10.1 / §10.2 / §12.1 / §12.4 매트릭스 | Task 16 |
| spec §5 18 변경 이력 v2.0 | Task 17 |
| spec §5 18 검증 (9 row) | Task 18 |
| spec §8 통합 검증 5영역 | Task 19 |
| spec §7 결과물 (commit/push) | Task 20, 21 |

✅ 모든 spec 섹션이 task로 커버됨.

### 2. Placeholder 스캔

- 모든 task의 step에 구체 본문/grep 패턴/Edit old_string·new_string 명시
- Read step은 Edit 대상 본문 정확한 매칭을 위한 사전 조회 (정상)
- Task 5 Step 5 / Task 15 Step 2의 "v1.0 본문에 패턴 없으면 skip"은 조건부 동작 — 명시 OK

### 3. Type 일관성

- 4-서비스명 일관 (synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-svc)
- 영문 handle 일관 (`@team-lead`, `@platform-owner`, `@engagement-owner`, `@knowledge-owner-1/2`, `@learning-card-owner`, `@learning-ai-owner`)
- 18 신규 절번호 일관 (4.1.8 / 5.5 / 5.6 / 5.7)
- 09 cross-reference 절번호 일관 (§0.1 / §0.3 / §A3 / §B1 / §B2 / §B3 / §B4 / §B6 / §C2 / Appendix A·B)

✅ Self-review 통과.

---

## Execution Handoff

**Plan saved to** `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-architecture-techstack-revamp.md`

Two execution options:

**1. Subagent-Driven (recommended)** — task 단위 fresh subagent dispatch + main 검증 + 두 단계 리뷰. 21개 task의 누적 컨텍스트 격리. 18은 6,290줄로 매우 크지만 본 plan은 영향 절만 다루므로 task 단위로 잘 격리됨.

**2. Inline Execution** — 본 세션에서 executing-plans 스킬로 batch 실행. checkpoint마다 사용자에게 보고. 빠르지만 누적 컨텍스트 부담 큼 (특히 신규 백과사전 항목 ~300줄 본문 작성 시).

Which approach?
