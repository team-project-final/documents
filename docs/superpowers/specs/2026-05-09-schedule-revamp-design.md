# 17 스케줄 v2.0 — 갱신 설계서 (그룹 3 — 마지막)

> **상태**: Spec (브레인스토밍 산출물)
> **작성일**: 2026-05-09
> **대상 문서**: `documents.wiki/17_스케줄.md` (v1.1 → v2.0)
> **상위 결정**: 09_Git_규칙_정의서 v2.0 채택(2026-05-09) / ADR-001 / ADR-002
> **본 사이클 = 그룹 3 (마지막)**: 그룹 1(03+18) / 그룹 2(14+10) 모두 채택 완료. 본 사이클 채택 시 5문서 후속 갱신 종료.

---

## 1. 개요

### 1.1 목적

09 v2.0 채택의 후속 갱신 5문서 중 **그룹 3** — `17_스케줄`을 v2.0으로 갱신한다. 17은 학기 프로젝트의 **4주 일정** 문서이므로 일정 자체는 보존하되, 트랙 분배·작업 명을 §0.3 매핑(4-서비스 + 1+1+2+2)으로 정정한다. v1.0의 6명 트랙(팀원 A~F)을 §0.3 매핑(@platform-owner / @engagement-owner / @knowledge-owner-1·2 / @learning-card-owner / @learning-ai-owner)으로 재배치한다.

### 1.2 작업 범위

- `documents.wiki/17_스케줄.md`를 in-place v2.0 갱신
- 그룹 1·2와 동일한 결정 패턴 적용 (Q2=1 v2.0 전면 / Q3=c 절충 cross-reference / 구조=X 절 보존)
- 4주 일정(W1~W4: 2026-05-12 ~ 06-06) 유지
- §3 팀 분업 표 6행 → 7행으로 재구성 (§0.3 매핑 1+1+2+2)
- §2 W1~W4 작업 분배도 7행 매핑에 맞춰 재정렬
- 신규 §5 Phase 1~4 장기 로드맵 안내 1단락 추가 (source 참조)
- 변경 이력에 v2.0 추가 + 채택일 2026-05-09 명기
- 작업 완료 후 wiki repo commit + push

### 1.3 비범위 (out-of-scope)

- v1.0의 4주 일정 자체 변경 — 학기 프로젝트 현실로 보존 (Q1=A 결정)
- Phase 1~4 (Month 1~10+) 일정으로 전면 재작성 — Q1=A 거부
- 17 v1.0의 직교 절(§1 Gantt / §4 DoD 본문 핵심) 갱신 — 보존만
- 06-06 이후 일정 — 17 범위 밖. 사용자 결정에 위임
- 추가 위키 문서 갱신 — 본 그룹 3이 마지막 사이클이므로 후속 작업 **없음**

---

## 2. 결정 사항 (브레인스토밍 결과)

| # | 결정 항목 | 채택 옵션 | 핵심 |
|---|---|---|---|
| Q1 | 4주 일정 처리 | **A. 4주 유지 + 트랙·매핑만 §0.3 정정** | v1.0 4주 W1~W4 그대로, 트랙 분배만 정정 |
| Q2 | §3 팀 분업 표 재구성 | **가. 7행 §0.3 1+1+2+2** | 팀장 + @platform-owner + @engagement-owner + @knowledge-owner-1·2 + @learning-card-owner + @learning-ai-owner. Frontend는 전체 협업 |
| 그룹 1·2 패턴 | 그대로 적용 | — | Q2=1 v2.0 전면 / Q3=c cross-reference / 구조=X 절 보존 |

---

## 3. 메타데이터 / 상단 주의문 (그룹 1·2 동일 패턴, 본 사이클 표기)

```markdown
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

---

## 4. 17 v2.0 — 변경 매트릭스 (5개 메인 절)

### 4.1 절별 명세

| 절 | 액션 | 작성 명세 |
|---|---|---|
| 메타데이터 | **갱신** | v1.1 → v2.0, 수정일 2026-05-09 추가 |
| 메타데이터 직후 | **신규** | §3 ⚠️ 주의문 블록 그대로 |
| §1 프로젝트 로드맵 (4주 일정 ASCII Gantt) | **흡수** | Gantt 그대로 (현실 일정) |
| §2 마일스톤 W1 인프라 + 핵심 CRUD | **갱신 (전면 재구성)** | 6행 (팀장 + 팀원 A~F) → 7행 (§0.3 매핑) 재배치. 작업 분배 본문은 §4.2 W1 명세 참조 |
| §2 마일스톤 W2 핵심 기능 완성 | **갱신** | 동일하게 7행 재배치. §4.2 W2 명세 |
| §2 마일스톤 W3 부가 기능 + Kafka 통합 | **갱신** | §4.2 W3 명세 |
| §2 마일스톤 W4 통합 테스트 + 마무리 | **흡수 + 미세 갱신** | "전체" 작업 큰 변경 없음. 도메인 서비스명만 4-서비스로 정정 (해당 시) |
| §3 팀 분업 및 서비스 매핑 표 | **갱신 (전면 재구성)** | 6행 → 7행 표. 컬럼(담당자 / 서비스 / W1 / W2 / W3 / W4) 유지. Frontend는 별도 행 없이 표 아래 1줄 안내 |
| §4 완료 정의 (DoD) | **흡수 + 미세 갱신** | 7개 DoD 항목 보존. "배포" 항목에 "ArgoCD ApplicationSet 자동 동기화 (dev) / 수동 승인 (staging·prod)" 1줄 추가 |
| §5 (신규) Phase 1~4 장기 로드맵 안내 | **신규 1단락** | "본 17은 4주 학기 프로젝트 일정. 장기 진화 로드맵(Phase 1 MVP → 2 핵심 기능 → 3 고도화 → 4 분리 검토)은 source `SYNAPSE_Service_Consolidation.md` §5 / `09_Git_규칙_정의서` §0.2 참조. 본 학기 4주는 Phase 1 MVP 범위에 해당." |
| 변경 이력 | **갱신** | v2.0 row 추가 |

### 4.2 W1~W3 작업 분배 명세 (§2 본문)

#### W1: 인프라 + 핵심 CRUD (2026-05-12 ~ 2026-05-16)

| 담당자 | 작업 |
|---|---|
| **팀장** | 인프라 셋업 (EKS / RDS / MSK / Schema Registry / Redis / OpenSearch / ArgoCD / Istio — 09 §C1 Day 1 체크리스트 참조) / Docker Compose 4-서비스 + Schema Registry / CI/CD 기초 (mirror.yml + ci.yml + deploy.yml) |
| **@platform-owner** | synapse-platform-svc 골격 + auth 모듈 (OAuth + JWT + MFA 기초) |
| **@engagement-owner** | synapse-engagement-svc 골격 + community 모듈 (그룹 CRUD + 멤버 관리) |
| **@knowledge-owner-1** | synapse-knowledge-svc 골격 + note 모듈 (Markdown CRUD + 위키링크 파싱) |
| **@knowledge-owner-2** | knowledge-svc 테스트 + Spring Modulith 모듈 정의 (`@ApplicationModule`) + ArchUnit 검증 + Schema Registry 연동 검증 |
| **@learning-card-owner** | synapse-learning-card 골격 + card 모듈 (덱/카드 CRUD + SM-2 알고리즘 기초) |
| **@learning-ai-owner** | synapse-learning-ai 골격 (FastAPI scaffolding + Anthropic API 연동 + Embedding API 연결) |
| **Frontend (전체 협업)** | Flutter 앱 쉘 + 라우팅 + 인증 화면 + 대시보드 레이아웃. 모든 owner가 자기 도메인 UI를 부분 담당 |

**성공 기준 (W1)**:
- [ ] Docker Compose로 4-서비스 + Schema Registry 로컬 실행
- [ ] 각 서비스 골격 동작 (Hello World + Health endpoint)
- [ ] Spring Modulith 모듈 검증 (`ApplicationModules.verify()`) 통과
- [ ] auth 모듈: 회원가입/로그인/JWT 발급 동작
- [ ] note·card·community 모듈: 기본 CRUD API 동작
- [ ] Flutter: 로그인/대시보드 화면 렌더링

#### W2: 핵심 기능 완성 (2026-05-19 ~ 2026-05-23)

| 담당자 | 작업 |
|---|---|
| **팀장** | Kafka 토픽 설계 + Schema Registry 호환성 강제 (BACKWARD) + Gateway 라우팅 (4-서비스) |
| **@platform-owner** | billing 모듈 (Stripe Checkout + Webhook + 플랜 관리) + notification 모듈 기초 (FCM 설정 + device_tokens) |
| **@engagement-owner** | gamification 모듈 (XP 기초 + xp_events) + community 공유 (덱·노트 share_token + 공유 콘텐츠 검색) |
| **@knowledge-owner-1** | graph 모듈 (백링크 + D3.js 데이터) + Elasticsearch 동기화 (Kafka) |
| **@knowledge-owner-2** | chunking 모듈 (비동기 청크 분할) + note 검색 통합 (BM25) |
| **@learning-card-owner** | SRS 복습 세션 완성 (rating → SM-2 → 다음 복습일) + card.reviewed Kafka 발행 + review_sessions 통계 |
| **@learning-ai-owner** | 시맨틱 검색 골격 (pgvector 임베딩 저장·조회) + AI 카드 자동 생성 골격 (Note → LLM → Card) |
| **Frontend (전체 협업)** | 노트 에디터 + SRS 복습 화면 + 커뮤니티 그룹 목록·상세 |

> **NOTE**: W2 community 기능은 Kafka stub으로 동작. 실제 알림 연동은 W3.

**성공 기준 (W2)**:
- [ ] 복습 세션 완전 동작 (카드 → 난이도 → SM-2 → 다음 복습일)
- [ ] 덱 공유 → 복사 플로우 동작 (community → learning-card internal API)
- [ ] 그래프 시각화 기본 동작
- [ ] 검색(키워드 BM25 + 시맨틱 pgvector) 동작
- [ ] Schema Registry에 모든 v1 Avro 스키마 등록 + 호환성 검증 통과

#### W3: 부가 기능 + Kafka 통합 (2026-05-26 ~ 2026-05-30)

| 담당자 | 작업 |
|---|---|
| **팀장** | 전체 통합 테스트 조율 + 코드 리뷰 (모든 PR @team-lead 승인) + ArgoCD ApplicationSet dev/staging 배포 검증 |
| **@platform-owner** | audit 모듈 (Kafka 이벤트 소비 → audit_logs 적재 + 90일 보존) + 테넌트·사용자 관리 + notification Kafka 연동 (gamification.* / community.* / card.review.due 소비) + 푸시 발송 + 이메일 알림 (AWS SES) |
| **@engagement-owner** | gamification 완성 (배지·레벨·스트릭·리더보드 + Kafka 연동) + community 신고 처리 + Admin 모더레이션 API |
| **@knowledge-owner-1·2** | note 버전 이력 + 태그 관리 고도화 + Graph PageRank (시간 허용 시) + 검색 RRF (시맨틱 + BM25 결합) |
| **@learning-card-owner** | card.reviewed Kafka 발행 자동화 + 복습 통계 대시보드 + card.review.due 발행 (복습 리마인더 트리거) |
| **@learning-ai-owner** | AI 카드 자동 생성 (Note → Card 자동) + RAG Q&A (시간 허용 시) + 시맨틱 캐시 (코사인 유사도 > 0.95) |
| **Frontend (전체 협업)** | 게이미피케이션 UI (XP 바·배지·레벨 애니메이션) + 알림 센터 + 관리자 화면 + 공유 덱 탐색 |

**성공 기준 (W3)**:
- [ ] 복습 완료 → XP 적립 → 레벨업 → 축하 + 알림 전체 흐름 동작
- [ ] 덱 공유 → 그룹원 알림 동작
- [ ] 리더보드 조회 동작
- [ ] 관리자 신고 처리 동작
- [ ] ArgoCD dev 환경 자동 배포 + Schema Registry 검증 통과

#### W4: 통합 테스트 + 마무리 (2026-06-02 ~ 2026-06-06)

| 항목 | 내용 |
|---|---|
| **전체** | 버그 수정 / E2E 테스트 / 성능 튜닝 / 문서 최종 정리 |

**성공 기준 (W4)**:
- [ ] 전체 E2E 시나리오 통과
- [ ] 테스트 커버리지 80% 이상
- [ ] Staging 환경 배포 완료 (ArgoCD ApplicationSet)
- [ ] P0 기능 100% 동작
- [ ] Schema Registry BACKWARD 호환성 모든 토픽 통과

### 4.3 §3 팀 분업 표 (7행 §0.3 매핑)

| 담당자 | 서비스 / 모듈 | W1 | W2 | W3 | W4 |
|---|---|---|---|---|---|
| 팀장 | Gateway / 인프라 / 아키텍처 / Schema Registry / ArgoCD | 인프라 셋업 + Schema Registry + ApplicationSet | Kafka 토픽 + 호환성 강제 | 통합 테스트 조율 + 코드 리뷰 | 최종 점검 |
| `@platform-owner` | synapse-platform-svc (auth + audit + billing + notification) | auth 모듈 (OAuth + JWT + MFA) | billing (Stripe) + notification 기초 (FCM) | audit Kafka + notification 발송 + 테넌트 관리 | 버그 수정 |
| `@engagement-owner` | synapse-engagement-svc (community + gamification) | community CRUD + 멤버 관리 | gamification XP + community 공유 | gamification 배지/리더보드 + Admin 모더레이션 | 버그 수정 |
| `@knowledge-owner-1` | synapse-knowledge-svc (note 모듈) | note Markdown CRUD + 위키링크 | graph 백링크 + ES 동기화 | note 버전·태그·Graph PageRank | 버그 수정 |
| `@knowledge-owner-2` | synapse-knowledge-svc (graph + chunking 모듈, Modulith 검증) | knowledge-svc 테스트 + Modulith 모듈 정의 | chunking + 검색 BM25 | 검색 RRF (하이브리드) | 버그 수정 |
| `@learning-card-owner` | synapse-learning-card (card + srs, Java) | learning-card 골격 + 덱/카드 CRUD + SM-2 | SRS 복습 세션 + Kafka 발행 | card.review.due + 복습 통계 | 버그 수정 |
| `@learning-ai-owner` | synapse-learning-ai (ai, Python/FastAPI) | learning-ai 골격 + LLM API 연결 | 시맨틱 검색 + AI 카드 골격 | AI 카드 자동 생성 + RAG (시간 허용 시) | 버그 수정 |

> **Frontend는 전체 협업**: 별도 owner 없이 모든 트랙이 자기 도메인 UI(인증·노트·복습·커뮤니티·게이미피케이션·알림)를 담당. v1.0의 "팀원 F Flutter"는 §0.3 매핑 결정으로 해체됨.

### 4.4 §4 DoD 미세 갱신

기존 7개 항목 그대로 + 다음 1줄 추가:

> 5. **배포**: Staging 검증 완료 → Production 배포 완료. ArgoCD ApplicationSet dev autoSync 자동 / staging·prod 수동 승인 (`09_Git_규칙_정의서` §B3 참조).

### 4.5 §5 Phase 1~4 장기 로드맵 안내 (신규 1단락)

```markdown
## 5. 장기 로드맵 안내 (Phase 1~4)

본 17은 학기 프로젝트의 **4주 단기 일정**(W1~W4: 2026-05-12 ~ 06-06)을 다룬다. 장기 진화 로드맵은 다음 4개 Phase로 정의되어 있으며, 본 4주는 그 중 **Phase 1 MVP** 범위에 해당한다:

- **Phase 1 (MVP)**: Auth + Note CRUD + Card CRUD + 기본 XP — **본 학기 4주 범위**
- **Phase 2 (핵심 기능)**: FCM 알림 + 청킹/임베딩 + AI 카드 생성 + 리더보드
- **Phase 3 (고도화)**: MFA + Graph PageRank + RAG + 신고 시스템
- **Phase 4 (분리 검토)**: 트래픽·소유 기준 모듈 → 서비스 추출

각 Phase의 범위·일정 상세는 `SYNAPSE_Service_Consolidation.md` §5 및 `09_Git_규칙_정의서` v2.0 §0.2 참조. 본 17은 Phase 2 이후 일정을 다루지 않는다.
```

---

## 5. 변경 이력 row

```markdown
| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 추가. §1 4주 일정 Gantt 보존 / §2 W1~W4 마일스톤 작업 분배를 §0.3 매핑 (1+1+2+2) 7행으로 재배치 / §3 팀 분업 표 6행 → 7행 (팀장 + @platform-owner + @engagement-owner + @knowledge-owner-1·2 + @learning-card-owner + @learning-ai-owner) 재구성, Frontend 전체 협업으로 변경 / §4 DoD 배포 항목에 ApplicationSet 1줄 추가 / 신규 §5 Phase 1~4 장기 로드맵 안내 단락 추가. 도메인 서비스명을 4-서비스 + 모듈명으로 일관 정정. 4주 일정 자체는 학기 프로젝트 현실로 보존. |
```

---

## 6. 결과물 / 산출 위치

| 산출 | 경로 | git |
|---|---|---|
| 본 spec | `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-schedule-revamp-design.md` | syn 레포 |
| 본 plan | `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-schedule-revamp.md` | syn 레포 |
| 17 v2.0 본문 | `D:\workspace\final-project-syn\documents.wiki\17_스케줄.md` | wiki repo (in-place + commit + push) |

---

## 7. 검증 / 완료 기준 (5영역)

### 7.1 구조 / 일관성
- [ ] v1.0 도메인 서비스명(`Auth Service|Note Service|Card Service|Graph Service|AI Service|Billing Service|Community Service|Gamification Service|Notification Service`) 본문 잔재 0
- [ ] 4-서비스명(synapse-platform-svc / -engagement-svc / -knowledge-svc / -learning-card / -learning-ai) 일관 사용
- [ ] 4주 W1~W4 일정 그대로 (2026-05-12 ~ 06-06)
- [ ] 분량 약 200~240줄 (v1.1 152줄 + 7행 재구성 + 신규 §5 + ⚠️ 주의문)

### 7.2 매핑 / 참조 무결성
- [ ] §3 표 7행: 팀장 + 6 owner (@platform-owner / @engagement-owner / @knowledge-owner-1 / @knowledge-owner-2 / @learning-card-owner / @learning-ai-owner)
- [ ] v1.0 "팀원 A / 팀원 B / 팀원 C / 팀원 D / 팀원 E / 팀원 F" 본문 잔재 0
- [ ] 09 cross-reference (§0.2 / §0.3 / §B3 / §C1 등 ≥2)
- [ ] 변경 이력 v2.0 row

### 7.3 정합성 안내
- [ ] 상단 ⚠️ 주의문에 채택일 2026-05-09 + 그룹 1·2 채택 완료 + 그룹 3 본 사이클 표기

### 7.4 콘텐츠 보존
- [ ] §1 Gantt 다이어그램 (4주 일정) 보존
- [ ] §4 DoD 7개 항목 핵심 보존 (배포 1줄만 추가)

### 7.5 신규 절
- [ ] §5 Phase 1~4 장기 로드맵 안내 1단락 등장
- [ ] §5에서 Phase 1 MVP가 4주 범위에 해당 명시
- [ ] §5에서 Phase 2~4 일정은 17 범위 밖 명시

---

## 8. 후속 작업 — **없음**

본 그룹 3이 09 v2.0 채택의 후속 갱신 5문서 사이클 중 마지막. 본 17 v2.0이 채택되면:

- ✅ `09_Git_규칙_정의서` v2.0 (이미 채택)
- ✅ `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1)
- ✅ `18_기술_스택_정의서` v2.0 (그룹 1)
- ✅ `14_배포_가이드` v2.0 (그룹 2)
- ✅ `10_환경_설정_템플릿` v2.0 (그룹 2)
- ✅ `17_스케줄` v2.0 (그룹 3 — 본 사이클)

→ ADR-001/002 채택의 위키 정합성 작업 **완료**.

---

## 9. 작업 흐름 요약

1. 본 spec syn 레포 commit + push
2. writing-plans 호출 → 단계별 task plan 작성 (예상 task: 메타+주의문 / W1 / W2 / W3 / W4 / §3 표 / §4 DoD / 신규 §5 / 변경 이력 / 검증 / commit·push, 총 9~11 task)
3. plan 기반 task 단위 fresh subagent 실행 (subagent-driven-development)
4. 매 task 검증 통과 후 다음 task
5. 모든 task 완료 후 documents.wiki에서 17 commit + push (1회)
6. syn 레포에 plan 진척 commit + push

---

*end of design spec*
