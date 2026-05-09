# 17 스케줄 v2.0 Implementation Plan (그룹 3 — 마지막)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ADR-001/002 채택을 반영하여 `documents.wiki/17_스케줄.md`를 v1.1 → v2.0으로 갱신한다 (in-place, 4주 일정 보존, 트랙 §0.3 매핑으로 정정).

**Architecture:** spec `2026-05-09-schedule-revamp-design.md` §4 변경 매트릭스를 따라 11개 task로 분할. v1.0의 4주 일정(W1~W4)은 그대로 유지하되 §2 W1~W3 작업 분배·§3 팀 분업 표를 §0.3 매핑(1+1+2+2 + Frontend 전체 협업)으로 7행 재구성. 신규 §5 Phase 1~4 안내 1단락 추가. 직교 콘텐츠(§1 Gantt / §4 DoD 핵심)는 보존만.

**Tech Stack:** Markdown / GFM 표·코드블록 / git (documents.wiki + syn).

**Repository constraints:**
- `documents.wiki`: git repo. 17 갱신 후 commit + push 1회 (Task 10).
- `syn`: git repo. plan commit + push (Task 11).

**Source references:**
- spec: `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-schedule-revamp-design.md`
- 09 v2.0 (cross-reference 대상): `D:\workspace\final-project-syn\documents.wiki\09_Git_규칙_정의서.md`

---

## File Structure

| 파일 | 액션 |
|---|---|
| `documents.wiki/17_스케줄.md` | Edit N회 (Task 1~8) |
| `syn/docs/superpowers/plans/2026-05-09-schedule-revamp.md` | Task 11에서 commit |

---

## Task 1: 17 메타데이터 v2.0 + ⚠️ 주의문

**Files:**
- Modify: `D:\workspace\final-project-syn\documents.wiki\17_스케줄.md` (제목 직후)

- [ ] **Step 1: Read 첫 12줄**

`Read`: 17 파일, offset 0, limit 12.

기대: v1.1 메타데이터 (버전 v1.1, 작성일 2026-05-07, 수정일 2026-05-08).

- [ ] **Step 2: Edit 교체**

`Edit`:
- file_path: `D:\workspace\final-project-syn\documents.wiki\17_스케줄.md`
- old_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v1.1
  > **작성일**: 2026-05-07
  > **수정일**: 2026-05-08
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
  > 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §0.2 Phase 요지 / §0.3 매핑표 / Appendix A·B ADR 전문) 참조.
  >
  > 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
  >  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
  >  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 채택 완료)
  >  - `18_기술_스택_정의서` v2.0 (그룹 1 — 채택 완료)
  >  - `14_배포_가이드` v2.0 (그룹 2 — 채택 완료)
  >  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 채택 완료)
  >  - `17_스케줄` v2.0 (그룹 3 — 본 사이클, 마지막)
  ```

만약 v1.1 메타데이터가 위 패턴과 약간 다르면 (수정일이 2026-05-08가 아닐 수 있음) Step 1 Read 결과로 정확한 매칭.

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `\*\*버전\*\*: v2\.0` | 1+ |
| `채택일 2026-05-09` | 1+ |
| `\*\*버전\*\*: v1\.1` | 0 |
| `그룹 3 — 본 사이클, 마지막` | 1 |

---

## Task 2: §2 W1 작업 분배 — 7행 §0.3 매핑으로 재구성

**Files:**
- Modify: 17 파일 §2 W1 영역 (line ~34~56)

- [ ] **Step 1: Read §2 W1 본문 전체**

`Grep` (`-n true`): pattern `^### W1: 인프라 \+ 핵심 CRUD`. 위치 확인.
`Grep` (`-n true`): pattern `^### W2: 핵심 기능 완성`. 다음 절 위치.

`Read`: 17 파일, §W1 시작~§W2 직전.

기대: v1.0 W1 작업 분배 표 (팀장 + 팀원 A~F 6명 각 1행 + 성공 기준).

- [ ] **Step 2: Edit 교체 — W1 영역 전체를 7행 표 + 성공 기준으로 재작성**

`Edit`:
- file_path: 17 파일
- old_string: `### W1: 인프라 + 핵심 CRUD (Week 1)` 부터 `### W2: 핵심 기능 완성 (Week 2)` 직전까지 v1.0 본문 전체
- new_string:

```markdown
### W1: 인프라 + 핵심 CRUD (Week 1)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-12 ~ 2026-05-16 |
| 목표 | DB 스키마, 4-서비스 골격, 기본 CRUD, Spring Modulith 모듈 정의 |
| **팀장** | 인프라 셋업 (EKS / RDS / MSK / Schema Registry / Redis / OpenSearch / ArgoCD / Istio — 09 §C1 Day 1 체크리스트 참조) / Docker Compose 4-서비스 + Schema Registry / CI/CD 기초 (mirror.yml + ci.yml + deploy.yml) |
| **`@platform-owner`** | synapse-platform-svc 골격 + auth 모듈 (OAuth + JWT + MFA 기초) |
| **`@engagement-owner`** | synapse-engagement-svc 골격 + community 모듈 (그룹 CRUD + 멤버 관리) |
| **`@knowledge-owner-1`** | synapse-knowledge-svc 골격 + note 모듈 (Markdown CRUD + 위키링크 파싱) |
| **`@knowledge-owner-2`** | knowledge-svc 테스트 + Spring Modulith 모듈 정의 (`@ApplicationModule`) + ArchUnit 검증 + Schema Registry 연동 검증 |
| **`@learning-card-owner`** | synapse-learning-card 골격 + card 모듈 (덱/카드 CRUD + SM-2 알고리즘 기초) |
| **`@learning-ai-owner`** | synapse-learning-ai 골격 (FastAPI scaffolding + Anthropic API 연동 + Embedding API 연결) |
| **Frontend (전체 협업)** | Flutter 앱 쉘 + 라우팅 + 인증 화면 + 대시보드 레이아웃. 모든 owner가 자기 도메인 UI를 부분 담당 |

**성공 기준**:
- [ ] Docker Compose로 4-서비스 + Schema Registry 로컬 실행
- [ ] 각 서비스 골격 동작 (Hello World + Health endpoint)
- [ ] Spring Modulith 모듈 검증 (`ApplicationModules.verify()`) 통과
- [ ] auth 모듈: 회원가입/로그인/JWT 발급 동작
- [ ] note·card·community 모듈: 기본 CRUD API 동작
- [ ] Flutter: 로그인/대시보드 화면 렌더링

---

```

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `^### W1: 인프라 \+ 핵심 CRUD \(Week 1\)` | 1 |
| `@platform-owner\|@engagement-owner\|@knowledge-owner-1\|@knowledge-owner-2\|@learning-card-owner\|@learning-ai-owner` (W1 영역) | 6+ |
| `팀원 A\|팀원 B\|팀원 C\|팀원 D\|팀원 E\|팀원 F` (W1 영역) | 0 |
| `Auth Service\|Note Service\|Card Service\|Community Service\|Notification Service` (W1 영역) | 0 |
| `Spring Modulith\|Schema Registry` | 1+ |

---

## Task 3: §2 W2 작업 분배 — 7행 재구성

**Files:**
- Modify: 17 파일 §2 W2 영역 (line ~57~80)

- [ ] **Step 1: Read §2 W2 본문**

`Grep` (`-n true`): pattern `^### W3: 부가 기능 \+ Kafka 통합`. 다음 절 위치.

`Read`: 17 파일, §W2 시작~§W3 직전.

- [ ] **Step 2: Edit 교체 — W2 영역 전체를 7행 표 + 성공 기준으로 재작성**

`Edit`:
- file_path: 17 파일
- old_string: `### W2: 핵심 기능 완성 (Week 2)` 부터 `### W3: 부가 기능 + Kafka 통합 (Week 3)` 직전까지 v1.0 본문 전체
- new_string:

```markdown
### W2: 핵심 기능 완성 (Week 2)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-19 ~ 2026-05-23 |
| 목표 | SRS 복습 / AI 카드 골격 / Graph + ES / 커뮤니티 공유 / Schema Registry 등록 |
| **팀장** | Kafka 토픽 설계 + Schema Registry 호환성 강제 (BACKWARD 글로벌 + Knowledge.events-value BACKWARD_TRANSITIVE) + Gateway 라우팅 (4-서비스) |
| **`@platform-owner`** | billing 모듈 (Stripe Checkout + Webhook + 플랜 관리) + notification 모듈 기초 (FCM 설정 + device_tokens) |
| **`@engagement-owner`** | gamification 모듈 (XP 기초 + xp_events) + community 공유 (덱·노트 share_token + 공유 콘텐츠 검색) |
| **`@knowledge-owner-1`** | graph 모듈 (백링크 + D3.js 데이터) + Elasticsearch 동기화 (Kafka) |
| **`@knowledge-owner-2`** | chunking 모듈 (비동기 청크 분할) + note 검색 통합 (BM25) |
| **`@learning-card-owner`** | SRS 복습 세션 완성 (rating → SM-2 → 다음 복습일) + card.reviewed Kafka 발행 + review_sessions 통계 |
| **`@learning-ai-owner`** | 시맨틱 검색 골격 (pgvector 임베딩 저장·조회) + AI 카드 자동 생성 골격 (Note → LLM → Card) |
| **Frontend (전체 협업)** | 노트 에디터 + SRS 복습 화면 + 커뮤니티 그룹 목록·상세 |

> **NOTE**: W2 community 기능은 Kafka stub으로 동작. 실제 알림 연동은 W3.

**성공 기준**:
- [ ] 복습 세션 완전 동작 (카드 → 난이도 → SM-2 → 다음 복습일)
- [ ] 덱 공유 → 복사 플로우 동작 (community → learning-card internal API)
- [ ] 그래프 시각화 기본 동작
- [ ] 검색(키워드 BM25 + 시맨틱 pgvector) 동작
- [ ] Schema Registry에 모든 v1 Avro 스키마 등록 + 호환성 검증 통과

---

```

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `^### W2: 핵심 기능 완성` | 1 |
| `@platform-owner\|@engagement-owner\|@knowledge-owner-1\|@knowledge-owner-2\|@learning-card-owner\|@learning-ai-owner` (W2 영역) | 6+ |
| `팀원 A\|팀원 B\|팀원 C\|팀원 D\|팀원 E\|팀원 F` (W2 영역) | 0 |
| `card\.reviewed\|Schema Registry\|pgvector\|BM25` | 4+ |

---

## Task 4: §2 W3 작업 분배 — 7행 재구성

**Files:**
- Modify: 17 파일 §2 W3 영역 (line ~81~102)

- [ ] **Step 1: Read §2 W3 본문**

`Grep` (`-n true`): pattern `^### W4: 통합 테스트 \+ 마무리`. 다음 절 위치.

`Read`: 17 파일, §W3 시작~§W4 직전.

- [ ] **Step 2: Edit 교체 — W3 영역 전체 재작성**

`Edit`:
- file_path: 17 파일
- old_string: `### W3: 부가 기능 + Kafka 통합 (Week 3)` 부터 `### W4: 통합 테스트 + 마무리 (Week 4)` 직전까지 v1.0 본문 전체
- new_string:

```markdown
### W3: 부가 기능 + Kafka 통합 (Week 3)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-26 ~ 2026-05-30 |
| 목표 | gamification 완성 / 알림 발송 / Kafka 이벤트 연동 / 관리자 / Audit |
| **팀장** | 전체 통합 테스트 조율 + 코드 리뷰 (모든 PR `@team-lead` 승인) + ArgoCD ApplicationSet dev/staging 배포 검증 |
| **`@platform-owner`** | audit 모듈 (Kafka 이벤트 소비 → audit_logs 적재 + 90일 보존) + 테넌트·사용자 관리 + notification Kafka 연동 (`gamification.*` / `community.*` / `card.review.due` 소비) + 푸시 발송 + 이메일 알림 (AWS SES) |
| **`@engagement-owner`** | gamification 완성 (배지 · 레벨 · 스트릭 · 리더보드 + Kafka 연동) + community 신고 처리 + Admin 모더레이션 API |
| **`@knowledge-owner-1`** | note 버전 이력 + 태그 관리 고도화 + Graph PageRank (시간 허용 시) |
| **`@knowledge-owner-2`** | 검색 RRF (시맨틱 + BM25 결합) + 검색 정확도 측정 |
| **`@learning-card-owner`** | card.reviewed Kafka 발행 자동화 + 복습 통계 대시보드 + card.review.due 발행 (복습 리마인더 트리거) |
| **`@learning-ai-owner`** | AI 카드 자동 생성 (Note → Card 자동 — `note.created` 소비) + RAG Q&A (시간 허용 시) + 시맨틱 캐시 (코사인 유사도 > 0.95) |
| **Frontend (전체 협업)** | 게이미피케이션 UI (XP 바 · 배지 · 레벨 애니메이션) + 알림 센터 + 관리자 화면 + 공유 덱 탐색·상세 |

**성공 기준**:
- [ ] 복습 완료 → XP 적립 → 레벨업 → 축하 + 알림 전체 흐름 동작
- [ ] 덱 공유 → 그룹원 알림 동작
- [ ] 리더보드 조회 동작
- [ ] 관리자 신고 처리 동작
- [ ] ArgoCD dev 환경 자동 배포 + Schema Registry 검증 통과

---

```

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `^### W3: 부가 기능 \+ Kafka 통합` | 1 |
| `@platform-owner\|@engagement-owner\|@knowledge-owner-1\|@knowledge-owner-2\|@learning-card-owner\|@learning-ai-owner` (W3 영역) | 6+ |
| `팀원 A\|팀원 B\|팀원 C\|팀원 D\|팀원 E\|팀원 F` (W3 영역) | 0 |
| `audit_logs\|gamification\.\*\|card\.review\.due\|ApplicationSet` | 4+ |

---

## Task 5: §2 W4 미세 갱신 + §4 DoD ApplicationSet 1줄 추가

**Files:**
- Modify: 17 파일 §2 W4 영역 + §4 DoD

- [ ] **Step 1: §2 W4 영역 Read**

`Grep` (`-n true`): pattern `^### W4: 통합 테스트`.
`Grep` (`-n true`): pattern `^## 3\. 팀 분업`. 다음 절.

`Read`: §W4 시작~§3 직전.

- [ ] **Step 2: §2 W4 본문에서 도메인 서비스명 발견 시 정정 (조건부)**

§W4 본문 안에 `Auth Service / Note Service / Card Service / AI Service / Community Service / Gamification Service / Notification Service` 같은 도메인 서비스명 등장 여부 확인.

만약 등장하면 다음으로 정정:
- `Auth Service` → `platform-svc / auth 모듈`
- `Note Service` → `knowledge-svc / note 모듈`
- 등등

만약 §W4가 "전체 / 버그 수정 / E2E" 같은 추상 표기만 있다면 skip.

성공 기준 표는 유지하되 마지막 항목에 다음 추가 가능:

```markdown
- [ ] Schema Registry BACKWARD 호환성 모든 토픽 통과
- [ ] ArgoCD ApplicationSet으로 staging 환경 배포 완료
```

`Edit`로 §W4 성공 기준 마지막 row 직후 위 두 항목 추가.

- [ ] **Step 3: §4 DoD 배포 항목에 ApplicationSet 1줄 추가**

`Grep` (`-n true`): pattern `^## 4\. 완료 정의`. 위치 확인.

`Read`: §4 본문.

기대: 7개 DoD 항목 (기능 / 테스트 / 성능 / 보안 / 배포 / 문서 / 모니터링).

`Edit`:
- file_path: 17 파일
- old_string: 5번 배포 항목 v1.0 본문 (Read 결과 정확한 라인, 예: `5. **배포**: Staging 검증 완료 → Production 배포 완료`)
- new_string: 그 라인 + 1줄 추가 또는 인라인 보강:
  ```
  5. **배포**: Staging 검증 완료 → Production 배포 완료. ArgoCD ApplicationSet dev autoSync=true 자동 / staging·prod autoSync=false 수동 승인 (`09_Git_규칙_정의서` v2.0 §B3 참조)
  ```

만약 v1.0의 5번 항목 본문이 위와 다르면 Read 결과로 정확한 매칭.

- [ ] **Step 4: 검증**

| 패턴 | 기대 |
|---|---|
| `ArgoCD ApplicationSet` (DoD 영역) | 1+ |
| `dev autoSync=true\|staging.*수동 승인` | 1+ |

---

## Task 6: §3 팀 분업 표 6→7행 재구성

**Files:**
- Modify: 17 파일 §3 (line ~119~131)

- [ ] **Step 1: Read §3 본문**

`Grep` (`-n true`): pattern `^## 3\. 팀 분업 및 서비스 매핑`.
`Grep` (`-n true`): pattern `^## 4\. 완료 정의`.

`Read`: §3 시작~§4 직전.

기대: 6행 표 (팀장 + 팀원 A~F).

- [ ] **Step 2: Edit 교체 — §3 표를 7행으로 재구성**

`Edit`:
- file_path: 17 파일
- old_string: §3 v1.0 본문 전체 (헤딩 포함, Read 결과 정확한 문자열)
- new_string:

```markdown
## 3. 팀 분업 및 서비스 매핑

| 담당자 | 서비스 / 모듈 | W1 | W2 | W3 | W4 |
|--------|--------|----|----|----|----|
| **팀장** | Gateway / 인프라 / 아키텍처 / Schema Registry / ArgoCD | 인프라 셋업 + Schema Registry + ApplicationSet | Kafka 토픽 + 호환성 강제 | 통합 테스트 조율 + 코드 리뷰 | 최종 점검 |
| **`@platform-owner`** | synapse-platform-svc (auth + audit + billing + notification) | auth 모듈 (OAuth + JWT + MFA) | billing (Stripe) + notification 기초 (FCM) | audit Kafka + notification 발송 + 테넌트 관리 | 버그 수정 |
| **`@engagement-owner`** | synapse-engagement-svc (community + gamification) | community CRUD + 멤버 관리 | gamification XP + community 공유 | gamification 배지·리더보드 + community 신고/Admin | 버그 수정 |
| **`@knowledge-owner-1`** | synapse-knowledge-svc (note 모듈) | note Markdown CRUD + 위키링크 | graph 백링크 + ES 동기화 | note 버전·태그·Graph PageRank | 버그 수정 |
| **`@knowledge-owner-2`** | synapse-knowledge-svc (graph + chunking 모듈, Modulith 검증) | knowledge-svc 테스트 + Modulith 모듈 정의 | chunking + 검색 BM25 | 검색 RRF (하이브리드) | 버그 수정 |
| **`@learning-card-owner`** | synapse-learning-card (card + srs, Java) | learning-card 골격 + 덱/카드 CRUD + SM-2 | SRS 복습 세션 + Kafka 발행 | card.review.due + 복습 통계 | 버그 수정 |
| **`@learning-ai-owner`** | synapse-learning-ai (ai, Python/FastAPI) | learning-ai 골격 + LLM API 연결 | 시맨틱 검색 + AI 카드 골격 | AI 카드 자동 생성 + RAG (시간 허용 시) | 버그 수정 |

> **Frontend는 전체 협업**: 별도 owner 없이 모든 트랙이 자기 도메인 UI(인증·노트·복습·커뮤니티·게이미피케이션·알림)를 담당. v1.0의 "팀원 F Flutter"는 §0.3 매핑 결정으로 해체됨. 매핑 상세는 `09_Git_규칙_정의서` v2.0 §0.3 참조.

---
```

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `^## 3\. 팀 분업 및 서비스 매핑` | 1 |
| `@platform-owner` (§3 영역) | 1+ |
| `@engagement-owner` (§3 영역) | 1+ |
| `@knowledge-owner-1` (§3 영역) | 1+ |
| `@knowledge-owner-2` (§3 영역) | 1+ |
| `@learning-card-owner` (§3 영역) | 1+ |
| `@learning-ai-owner` (§3 영역) | 1+ |
| `\| 팀원 [A-F] \|` | 0 (전체 파일) |
| `Frontend는 전체 협업` | 1 |

---

## Task 7: 신규 §5 Phase 1~4 장기 로드맵 안내

**Files:**
- Modify: 17 파일 §4 다음에 §5 신규 절 삽입

- [ ] **Step 1: §변경 이력 헤딩 위치 확인**

`Grep` (`-n true`): pattern `^## 변경 이력`. 위치 확인.

- [ ] **Step 2: §변경 이력 직전에 신규 §5 삽입 (Edit)**

`Edit`:
- file_path: 17 파일
- old_string: `## 변경 이력`
- new_string:
```
## 5. 장기 로드맵 안내 (Phase 1~4)

본 17은 학기 프로젝트의 **4주 단기 일정**(W1~W4: 2026-05-12 ~ 06-06)을 다룬다. 장기 진화 로드맵은 다음 4개 Phase로 정의되어 있으며, 본 4주는 그 중 **Phase 1 MVP** 범위에 해당한다:

- **Phase 1 (MVP)**: Auth + Note CRUD + Card CRUD + 기본 XP — **본 학기 4주 범위**
- **Phase 2 (핵심 기능)**: FCM 알림 + 청킹/임베딩 + AI 카드 생성 + 리더보드
- **Phase 3 (고도화)**: MFA + Graph PageRank + RAG + 신고 시스템
- **Phase 4 (분리 검토)**: 트래픽·소유 기준 모듈 → 서비스 추출

각 Phase의 범위·일정 상세는 `SYNAPSE_Service_Consolidation.md` §5 및 `09_Git_규칙_정의서` v2.0 §0.2 참조. 본 17은 Phase 2 이후 일정을 다루지 않는다.

---

## 변경 이력
```

- [ ] **Step 3: 검증**

| 패턴 | 기대 |
|---|---|
| `^## 5\. 장기 로드맵 안내 \(Phase 1~4\)` | 1 |
| `Phase 1 \(MVP\)\|Phase 2 \(핵심 기능\)\|Phase 3 \(고도화\)\|Phase 4 \(분리 검토\)` | 4+ |
| `본 학기 4주 범위` | 1 |

---

## Task 8: 변경 이력 v2.0 row 추가

**Files:**
- Modify: 17 파일 변경 이력 표

- [ ] **Step 1: Read 변경 이력 본문**

`Read`: 17 파일, §변경 이력 영역 (offset = grep 결과, limit = 20).

- [ ] **Step 2: v2.0 row 추가 (Edit)**

`Edit`:
- old_string: §변경 이력 표의 v1.1 마지막 row (Read 결과)
- new_string: 그 row + 다음:
  ```
  | v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 추가. §1 4주 일정 Gantt 보존 / §2 W1~W4 마일스톤 작업 분배를 §0.3 매핑 (1+1+2+2) 7행으로 재배치 / §3 팀 분업 표 6행 → 7행 (팀장 + @platform-owner + @engagement-owner + @knowledge-owner-1·2 + @learning-card-owner + @learning-ai-owner) 재구성, Frontend 전체 협업으로 변경 / §4 DoD 배포 항목에 ApplicationSet 1줄 추가 / 신규 §5 Phase 1~4 장기 로드맵 안내 단락 추가. 도메인 서비스명을 4-서비스 + 모듈명으로 일관 정정. 4주 일정 자체는 학기 프로젝트 현실로 보존. |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| v2\.0 \| 2026-05-09 \|`. 기대 1+.

---

## Task 9: 17 종합 검증 (spec §7 5영역)

- [ ] **Step 1: 일괄 grep**

| 패턴 | path | 기대 |
|---|---|---|
| `Auth Service\|Note Service\|Card Service\|Graph Service\|AI Service\|Billing Service\|Community Service\|Gamification Service\|Notification Service` | 17 | 0 (모듈 라벨 허용) |
| `synapse-platform-svc\|synapse-engagement-svc\|synapse-knowledge-svc\|synapse-learning-card\|synapse-learning-ai` | 17 | 5+ |
| `^### W1: 인프라\|^### W2: 핵심 기능\|^### W3: 부가 기능\|^### W4: 통합 테스트` | 17 | 4 (4주 일정 보존) |
| `\| 팀원 [A-F] \|` | 17 | 0 |
| `@platform-owner\|@engagement-owner\|@knowledge-owner-1\|@knowledge-owner-2\|@learning-card-owner\|@learning-ai-owner` | 17 | 12+ (W1·W2·W3·§3 표 누적) |
| `^## 5\. 장기 로드맵 안내` | 17 | 1 |
| `Phase 1 \(MVP\)\|Phase 2\|Phase 3\|Phase 4` | 17 | 4+ |
| `\| v2\.0 \| 2026-05-09 \|` | 17 | 1+ |
| `09_Git_규칙_정의서.*v2\.0\|§0\.2\|§0\.3\|§B3\|§C1` | 17 | 2+ |

- [ ] **Step 2: 분량 확인**

`Bash`: `wc -l 'D:\workspace\final-project-syn\documents.wiki\17_스케줄.md'`

기대: 약 200 ~ 240줄.

---

## Task 10: documents.wiki commit + push

- [ ] **Step 1: status 확인**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' status -s
```

기대: M 17_스케줄.md.

- [ ] **Step 2: add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' add '17_스케줄.md'

git -C 'D:\workspace\final-project-syn\documents.wiki' commit -m "$(cat <<'EOF'
docs: 17 스케줄 v2.0 갱신 (그룹 3 — 마지막)

ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영.
09_Git_규칙_정의서 v2.0 채택 전제로 후속 갱신 5문서 중 그룹 3(마지막)을 처리.

17_스케줄:
- ⚠️ 주의문 (그룹 1·2 채택 완료 + 본 사이클 마지막)
- §1 4주 일정 Gantt 보존
- §2 W1~W4 마일스톤 작업 분배를 §0.3 매핑 (1+1+2+2) 7행으로 재배치
  · 팀장 + @platform-owner + @engagement-owner + @knowledge-owner-1·2
  · @learning-card-owner + @learning-ai-owner
  · Frontend는 전체 협업
- §3 팀 분업 표 6행 → 7행 재구성
- §4 DoD 배포 항목에 ApplicationSet 1줄 추가
- 신규 §5 Phase 1~4 장기 로드맵 안내 단락 (4주 = Phase 1 MVP 범위 명시)
- 변경 이력 v2.0
- 도메인 서비스명을 4-서비스 + 모듈명으로 정정
- 4주 일정 자체는 학기 프로젝트 현실로 보존

본 그룹 3 채택으로 09 v2.0 후속 갱신 5문서 사이클 완료:
✅ 09 / 03 / 18 / 14 / 10 / 17 모두 v2.0 채택 완료.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\documents.wiki' push
```

기대 출력: `<old-sha>..<new-sha>  master -> master`

---

## Task 11: syn 레포 plan commit + push + 최종 보고

- [ ] **Step 1: plan add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\syn' add docs/superpowers/plans/2026-05-09-schedule-revamp.md

git -C 'D:\workspace\final-project-syn\syn' commit -m "$(cat <<'EOF'
docs(plan): 17 스케줄 v2.0 그룹 3 작성 완료 — 11 task 검증 통과

documents.wiki에 17 v2.0 push 완료. 09 v2.0 후속 갱신 5문서 사이클 종료:
✅ 09_Git_규칙_정의서 (이미)
✅ 03_프로젝트_아키텍처_정의서 (그룹 1)
✅ 18_기술_스택_정의서 (그룹 1)
✅ 14_배포_가이드 (그룹 2)
✅ 10_환경_설정_템플릿 (그룹 2)
✅ 17_스케줄 (그룹 3 — 본 사이클, 마지막)

ADR-001/002 채택의 위키 정합성 작업 완료.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\syn' push
```

- [ ] **Step 2: 사용자에게 최종 보고**

> "그룹 3(17 v2.0) + 5문서 후속 갱신 사이클 종료 보고.
> - documents.wiki: 17 갱신 + push 완료
> - syn 레포: spec + plan commit + push
> - 09 v2.0 후속 갱신 5문서 모두 v2.0 채택 완료. ADR-001/002 위키 정합성 작업 완료."

---

## Self-Review

### 1. Spec 커버리지

| spec 섹션 | plan task |
|---|---|
| spec §3 메타·주의문 | Task 1 |
| spec §4.1 메타데이터 갱신 | Task 1 |
| spec §4.2 W1 작업 분배 | Task 2 |
| spec §4.2 W2 작업 분배 | Task 3 |
| spec §4.2 W3 작업 분배 | Task 4 |
| spec §4.2 W4 + §4.4 DoD 미세 갱신 | Task 5 |
| spec §4.3 §3 7행 표 재구성 | Task 6 |
| spec §4.5 신규 §5 Phase 안내 | Task 7 |
| spec §5 변경 이력 v2.0 | Task 8 |
| spec §7 검증 5영역 | Task 9 |
| spec §6 결과물 (commit/push) | Task 10, 11 |

✅ 모든 spec 섹션이 task로 커버됨.

### 2. Placeholder 스캔

- 모든 task의 step에 구체 본문/grep 패턴/Edit old_string·new_string 명시
- Task 5 Step 2/3의 v1.0 본문 형태 의존 부분은 명시적 조건부 처리

### 3. Type 일관성

- 4-서비스명 일관 (synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-card / synapse-learning-ai)
- 영문 handle 7종 일관 (`@team-lead` / `@platform-owner` / `@engagement-owner` / `@knowledge-owner-1` / `@knowledge-owner-2` / `@learning-card-owner` / `@learning-ai-owner`)
- W1~W4 일정 (2026-05-12 ~ 06-06) 일관
- 09 cross-reference 절번호 일관 (§0.2 / §0.3 / §B3 / §C1)

✅ Self-review 통과.

---

## Execution Handoff

**Plan saved to** `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-schedule-revamp.md`

Two execution options:

**1. Subagent-Driven (recommended)** — task 단위 fresh subagent + main 검증. 그룹 1·2와 동일 패턴.

**2. Inline Execution** — 본 세션에서 batch 실행. 17은 작은 문서라 부담 적음.

Which approach?
