# Synapse 서비스 통합 매핑 (10 → 4) & 7명 팀 배치

> **대상**: Synapse 프로젝트 — 신규/설계 단계
> **인원**: 팀장 1명 + 6명 (1+1+2+2 분배)
> **결정 사항**: 아키텍처 정의서의 10개 서비스를 **4개 굵은 서비스로 통합**
> **근거**: 7명 팀의 콘웨이 법칙 적용 + 도메인 응집도 최대화
> **연관**: ADR-001, ADR-002 (이 문서 9장)

---

## 1. 통합의 근거 — 왜 10개 → 4개인가

### 1.1 7명 팀의 현실

```
원안: 10개 서비스 / 7명 = 0.7명 per service
   → 1인 1서비스도 불가
   → 한 사람이 1.5~2개 책임
   → 휴가/퇴사 시 마비

통합안: 4개 서비스 / 7명 = 1.75명 per service
   → 페어 또는 owner+백업 자연스러움
   → 콘웨이 법칙 부합
   → MSA의 핵심(독립 배포)은 유지
```

### 1.2 도메인 응집도 분석

원본 10개 서비스를 응집도/결합도 기준으로 그룹화:

```
[Cross-cutting / 외부 SaaS 통합 그룹]
   Auth         ─┐
   Audit        ─┤  → synapse-platform-svc
   Billing      ─┤    (1명 — 가벼움)
   Notification ─┘

[지식 그래프 코어]
   Note         ─┐  → synapse-knowledge-svc
   Graph        ─┘    (2명 — 무거움)

[학습 + AI 코어]
   Card         ─┐
   SRS algo     ─┤  → synapse-learning-svc
   AI Service   ─┘    (2명 — 매우 무거움, Java+Python)

[참여/동기화]
   Community    ─┐  → synapse-engagement-svc
   Gamification ─┘    (1명 — 보통)
```

### 1.3 통합 vs 풀 분리 트레이드오프

| 측면 | 풀 분리 (10개) | 통합 (4개) |
|---|:---:|:---:|
| 운영 부담 | ★★★★★ | ★★ |
| 7명 협업 | 어려움 | 자연스러움 |
| 독립 배포 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 미래 분리 | 이미 분리됨 | Spring Modulith로 분리 가능성 보존 |
| 통합 디버깅 | 지옥 | 관리 가능 |
| 도메인 사일로 위험 | 매우 높음 | 낮음 |

→ 통합이 7명 팀에 명백히 우월. 풀 분리는 30+ 명 팀 규모.

---

## 2. 통합된 4개 서비스 명세

### 2.1 synapse-platform-svc (Cross-cutting + 외부 SaaS) — 1명

> **역할**: 인증·감사·결제·알림. 비즈니스 로직 단순, 외부 SaaS 통합 위주.

#### 통합되는 원본 도메인
- **Auth**: OAuth (Google/GitHub/Apple/MS), JWT 발급, MFA, 세션
- **Audit**: 이벤트 소비 → audit_logs 적재, 90일 보존
- **Billing**: Stripe 연동, Webhook, 사용량 제한, 인보이스
- **Notification**: FCM/APNs/SES 발송, notification_preferences

#### 왜 한 서비스로 묶이나
공통점: "외부 시스템 통합" + "비즈니스 로직 최소"
- 모두 외부 SaaS/API에 의존
- 도메인 로직이 단순 (CRUD 또는 단순 변환)
- 자체 비즈니스 규칙보다 "전달자/감사자" 역할

#### 내부 모듈 분리 (Spring Modulith)
```
synapse-platform-svc/
├── auth/         (인증 모듈)
├── audit/        (감사 모듈)
├── billing/      (결제 모듈)
└── notification/ (알림 모듈)
```

#### 외부 의존성
- Google/GitHub/Apple/Microsoft OAuth
- Stripe API + Webhook
- FCM / APNs / AWS SES
- AWS Secrets Manager

#### 1명 owner가 가능한 이유
- 비즈니스 로직 적음 (대부분 외부 API 호출)
- SDK/문서 풍부 (Stripe, FCM 등)
- 도메인 학습 부담 적음
- MVP 단계는 단순 통합으로 충분

#### 위험 요소 / 팀장 보조
- 위험: 외부 API 학습 곡선, Webhook idempotency, 보안 민감(인증)
- 팀장 보조: OAuth/MFA 보안 검토, Stripe Webhook idempotency, 멀티테넌시

---

### 2.2 synapse-engagement-svc (Community + Gamification) — 1명

> **역할**: 사용자 참여·동기 부여. 도메인 명확하지만 외부 의존 적어 1명 가능.

#### 통합되는 원본 도메인
- **Community**: 스터디 그룹, 덱/노트 공유, 신고 처리
- **Gamification**: XP, 레벨, 배지, 리더보드, 스트릭

#### 왜 한 서비스로 묶이나
공통점: "사용자 참여" 도메인 — 둘 다 다른 서비스의 이벤트 소비 위주, 데이터 모델 유사.

#### 내부 모듈 분리
```
synapse-engagement-svc/
├── community/    (그룹/공유/신고)
└── gamification/ (XP/레벨/배지/리더보드/스트릭)
```

#### 의존성
- Kafka 소비: card.reviewed, note.created, community.*
- learning-svc internal API (`/internal/decks/copy`)

#### 1명 owner가 가능한 이유
- MVP 범위 한정 시 작업량 관리 가능
- 외부 API 의존 없음 (모두 내부)
- CRUD + 이벤트 처리가 주류

#### MVP 우선순위
```
P0 (필수):
  - 기본 XP 시스템
  - 단순 배지 (3~5개)
  - 스터디 그룹 CRUD
P1 (다음):
  - 리더보드 (주간/월간)
  - 노트/덱 공유, 신고 시스템
P2 (이후):
  - 복잡 배지 조건, 친구 시스템
```

#### 위험 요소 / 팀장 보조
- 위험: UX 비중 큼, 리더보드 성능, 신고 운영 정책
- 팀장 보조: Gamification 알고리즘, Redis 자료구조, Community 정책

---

### 2.3 synapse-knowledge-svc (Note + Graph) — 2명

> **역할**: 노트 + 지식 그래프. Synapse의 정체성. 가장 중요한 Core 도메인.

#### 통합되는 원본 도메인
- **Note**: Markdown CRUD, 위키링크 파싱, 버전 관리, 첨부파일, 청킹/임베딩
- **Graph**: 백링크, PageRank, 클러스터링, D3.js 데이터

#### 왜 한 서비스로 묶이나
공통점: "노트 = 그래프의 노드", "위키링크 = 그래프의 엣지" — Note 변경 → Graph 즉시 갱신 (강결합), 같은 데이터 소스.

#### 내부 모듈 분리
```
synapse-knowledge-svc/
├── note/         (CRUD + 위키링크 파싱 + 버전)
├── graph/        (백링크 + PageRank + 클러스터링)
└── chunking/     (비동기 청크 분할 — learning-ai 호출)
```

#### 외부 의존성
- PostgreSQL, Elasticsearch, AWS S3
- Kafka 발행: note.created/updated/deleted, graph.notes.linked

#### 2명 분담 권장
- 멤버 1: Note 모듈 (CRUD, 위키링크 파서, 버전, 검색)
- 멤버 2: Graph 모듈 + 청킹 (백링크, PageRank, 임베딩 비동기)
- 둘 다 Note 모듈도 알고 있어야 (페어 가능)

#### 위험 요소 / 팀장 보조
- 위험: 위키링크 파서 정확성, PageRank 비용, ES 동기화 일관성
- 팀장 보조: 청킹 전략, 검색 쿼리 최적화, 그래프 알고리즘 검토

---

### 2.4 synapse-learning-svc (Card + SRS + AI) — 2명

> **역할**: 학습 + AI. 가장 큰 서비스. Java + Python 멀티 스택.

#### 통합되는 원본 도메인
- **Card**: 카드/덱 CRUD
- **SRS Algorithm**: SM-2 알고리즘, 복습 큐, 세션 관리
- **AI Service**: 카드 자동 생성, RAG, 시맨틱 검색, Q&A (FastAPI/Python)

#### 왜 한 서비스로 묶이나
공통점: "학습 = AI 활용의 핵심 use case" — AI Service의 주요 use case가 카드 생성, "학습 도메인" 한 팀이 풀 소유 가능.

#### 내부 구조 (멀티 컨테이너)
```
synapse-learning-svc/         ← 모노레포, 두 컨테이너
├── learning-card/   (Java)   ← Card + SRS
└── learning-ai/     (Python) ← FastAPI

K8s에선 두 Deployment로 분리:
  - learning-card-deployment
  - learning-ai-deployment
```

#### 외부 의존성
- PostgreSQL + pgvector, Redis, Elasticsearch
- OpenAI API, Anthropic Claude API
- Kafka 소비: note.created (자동 카드 생성)
- Kafka 발행: card.reviewed, card.review.due

#### 2명 분담 권장
- 멤버 1: Card + SRS (Java/Spring Boot, SM-2)
- 멤버 2: AI Service (Python/FastAPI, RAG, LLM)
- 인터페이스: Kafka 이벤트 + Internal REST API
- 페어 가능하지만 스택이 달라 협업 까다로움

#### MVP 우선순위
```
P0 (필수):
  - Card CRUD + SM-2 기본
  - 복습 큐
  - 단순 시맨틱 검색
P1 (다음):
  - AI 카드 자동 생성 (Note → Card)
  - 시맨틱 캐시, RAG Q&A
P2 (이후):
  - 하이브리드 검색 (RRF)
  - 다중 LLM 선택
```

#### 위험 요소 / 팀장 보조
- 위험: 멀티 스택, AI 비용, LLM 비결정성, pgvector 튜닝, 시맨틱 캐시 미스
- 팀장 보조: 프롬프트 엔지니어링, LLM 비용 모니터링, pgvector 인덱스, Java↔Python 통합 패턴

---

## 3. 팀 배치 (정확히 1+1+2+2 = 6명 + 팀장 1명)

```
┌─────────────────────────────────────────────────────────────┐
│ 팀장 (1명)                                                   │
│   ─ 인프라: EKS, ArgoCD, Istio, RDS, MSK, ElastiCache       │
│   ─ 아키텍처 결정 + 모듈 경계 강제                           │
│   ─ 모든 PR 리뷰                                             │
│   ─ 멀티테넌시 보안 검토                                     │
│   ─ Kafka 토픽 설계                                          │
│   ─ Schema Registry 운영                                     │
│   ─ 각 트랙 멘토링                                           │
│   ─ 코드 작성 비중: 최소 (인프라/공통 라이브러리만)          │
└─────────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┬─────────────┐
       ▼                   ▼                   ▼             ▼
┌──────────┐       ┌──────────┐       ┌──────────┐   ┌──────────┐
│ 트랙 A   │       │ 트랙 B   │       │ 트랙 C   │   │ 트랙 D   │
│ (1명)    │       │ (1명)    │       │ (2명)    │   │ (2명)    │
│ 가벼움   │       │ 보통     │       │ 무거움    │   │ 매우 무거움│
└──────────┘       └──────────┘       └──────────┘   └──────────┘
     │                  │                  │                │
     ▼                  ▼                  ▼                ▼
synapse-          synapse-          synapse-          synapse-
platform-svc      engagement-svc    knowledge-svc     learning-svc

Auth+Audit+       Community+        Note+Graph        Card+SRS+AI
Billing+          Gamification                        (Java + Python)
Notification
```

### 3.1 팀장의 시간 분배 가이드

```
주간 시간 배분 (40시간 기준):
─ PR 리뷰 + 코드 검토:        12시간 (30%)
─ 인프라 운영 + DevOps:       10시간 (25%)
─ 아키텍처 회의 + 의사결정:    8시간 (20%)
─ 트랙별 멘토링 (1:1):         6시간 (15%)
─ 공통 라이브러리 + 인프라 코드: 4시간 (10%)
```

### 3.2 트랙별 시간 분배 가이드

```
트랙 A (1명, 가벼움) — synapse-platform-svc:
  - 외부 SaaS 통합 위주
  - 비즈니스 로직 최소
  - 학습 곡선: SaaS API 학습이 핵심
  - 위험 시 팀장이 직접 보조 가능

트랙 B (1명, 보통) — synapse-engagement-svc:
  - MVP 범위 강력 한정
  - 단순 CRUD + 이벤트 소비 위주
  - UX 비중 있음
  - 위험 시 트랙 C(2명)가 협력 가능

트랙 C (2명, 무거움) — synapse-knowledge-svc:
  - 페어로 핵심 도메인 진행
  - Note + Graph 분담
  - 한 명이 자리 비워도 다른 한 명이 컨텍스트 보유

트랙 D (2명, 매우 무거움) — synapse-learning-svc:
  - Java + Python 분담 (스택 차이)
  - 인터페이스(Kafka, REST) 명확히 합의
  - AI 비용 관리는 팀장과 함께
```

### 3.3 ⚠️ 절대 금지 사항

```
❌ 1인 1서비스 (휴가/퇴사 시 마비)
❌ 트랙 C, D를 1명으로 줄이기 (도메인 무게 못 감당)
❌ 팀장이 코드 작성 주력 (리뷰/멘토링 시간 부족)
❌ 트랙 간 코드 직접 수정 (PR로만 협력)
❌ 트랙 A에 Auth + 보안 책임 100% 위임 (팀장 협력 필수)
```

---

## 4. 서비스 간 통신 (Kafka 토픽 매핑)

원본 18개 토픽을 4개 서비스로 재매핑:

```
[platform-svc] 발행:
  user.registered          (Auth)
  billing.subscription.changed (Billing)

[platform-svc] 소비:
  audit.event              (모든 이벤트의 감사 로그)
  notification.send        (Notification 발송)

[knowledge-svc] 발행:
  note.created
  note.updated
  note.deleted
  graph.notes.linked

[knowledge-svc] 소비:
  user.deleted (정리)

[learning-svc] 발행:
  card.reviewed
  card.review.due

[learning-svc] 소비:
  note.created (자동 카드 생성)
  note.updated

[engagement-svc] 발행:
  community.deck.shared
  community.note.shared
  community.group.created
  community.group.joined
  community.report.created
  gamification.xp.earned
  gamification.badge.earned
  gamification.level.up
  notification.send

[engagement-svc] 소비:
  note.created (XP 적립)
  card.reviewed (XP 적립)
  community.* (자체 발행 + Notification)
  gamification.* (Notification)
```

→ 각 서비스의 Outbox 패턴 적용 (시리즈 #3)
→ Schema Registry 도입 (시리즈 #11)

---

## 5. 단계적 진화 로드맵

### Phase 1: MVP (Month 1~3)

```
범위:
  ✅ platform-svc: Auth (OAuth) + 기본 Billing
  ✅ knowledge-svc: Note CRUD + 위키링크 + 검색
  ✅ learning-svc: Card CRUD + SM-2 (AI 제외)
  ✅ engagement-svc: 기본 XP

제외:
  ❌ MFA, 복잡 권한
  ❌ Graph PageRank, 클러스터링
  ❌ AI Service (P1으로)
  ❌ 리더보드, 복잡 배지
```

### Phase 2: 핵심 기능 (Month 4~6)

```
추가:
  ✅ platform-svc: Notification (FCM/SES)
  ✅ knowledge-svc: 청킹 + 임베딩, Graph 시각화
  ✅ learning-svc: AI 카드 생성 (Python/FastAPI)
  ✅ engagement-svc: 리더보드, 스터디 그룹
```

### Phase 3: 고도화 (Month 7~9)

```
추가:
  ✅ platform-svc: Audit 강화, MFA
  ✅ knowledge-svc: PageRank, 클러스터링
  ✅ learning-svc: RAG, 하이브리드 검색
  ✅ engagement-svc: 신고 시스템, 노트/덱 공유
```

### Phase 4: 분리 검토 (Month 10+)

```
조건:
  - 트래픽이 한 서비스에 집중되나?
  - 한 모듈이 다른 모듈을 자주 막나?
  - 별도 팀이 필요할 정도인가?

분리 후보:
  - learning-ai (Python) → 별도 서비스
  - knowledge-graph → 별도 서비스 (PageRank 부하 격리)
  - engagement-gamification → 별도 (리더보드 트래픽)
```

---

## 6. 도메인 모델 변경 사항

### 6.1 ERD 영향

원본 ERD는 10개 서비스 가정. 4개로 통합 시:
- 서비스별 DB 스키마는 그대로 유지 가능
- Bounded Context는 서비스 안의 모듈로 표현
- RLS 정책은 동일 (멀티테넌시)

### 6.2 docker-compose 영향

```yaml
# 4개 서비스 + 인프라
services:
  # Application
  platform-svc:
    # Auth + Audit + Billing + Notification
  knowledge-svc:
    # Note + Graph
  learning-card-svc:
    # Card + SRS (Java)
  learning-ai-svc:
    # AI (Python/FastAPI)
  engagement-svc:
    # Community + Gamification

  # Infrastructure
  postgres:
  redis:
  kafka:
  schema-registry:
  elasticsearch:
```

### 6.3 K8s 리소스 재계산

```
원안 K8s (10개):
  Total CPU req: ~5000m
  Total Mem req: ~10Gi

통합안 K8s (4개):
  platform-svc:    500m / 1Gi   (HPA 1-3)
  knowledge-svc:   1000m / 2Gi  (HPA 2-6)
  learning-card:   500m / 1Gi   (HPA 2-4)
  learning-ai:     1000m / 2Gi  (HPA 2-8)
  engagement-svc:  500m / 1Gi   (HPA 1-3)

  Total: ~3500m / 7Gi
  → 운영 비용 30% 절감
```

---

## 7. 위험 요소 & 완화

### 위험 1: engagement-svc 1명 owner 부담
- MVP 범위 엄격 한정 (P0 기능만)
- 팀장 + 트랙 C가 백업 (community 도메인)
- 분기별 회고로 부담 모니터링

### 위험 2: learning-svc의 Java + Python 멀티 스택
- 처음부터 명확한 인터페이스 (Kafka + REST)
- 각 멤버 한 스택 책임 (Java 1명, Python 1명)
- 페어 프로그래밍은 인터페이스 부분만

### 위험 3: knowledge-svc가 너무 큰 도메인
- Note vs Graph 모듈 명확히 분리 (Spring Modulith)
- 두 멤버가 각각 owner 모듈 + 백업
- 청킹/임베딩은 비동기 (단순화)

### 위험 4: 통합 후 분리가 어려워짐
- 처음부터 Spring Modulith 강제
- 모듈 간 통신은 이벤트 (직접 호출 금지)
- 각 모듈 독립 DB 스키마 (RLS 정책 + 모듈별 스키마)
- 분리 시 모듈 → 서비스 추출이 자연스럽도록

### 위험 5: 팀장 번아웃
- 팀장이 코드 작성 비중 최소
- DevOps 자동화 우선 (ArgoCD, Renovate 등)
- 트랙 A(가벼움)가 인프라 보조 가능

---

## 8. 의사결정 기록 (ADR 형식)

### ADR-001: 10개 서비스를 4개로 통합

**상태**: Proposed (팀 합의 후 Accepted로 변경)

**결정**:
- 원안의 10개 마이크로서비스를 4개의 큰 서비스로 통합
- 각 서비스 내부는 Spring Modulith로 모듈 분리

**근거**:
- 7명 팀에 10개 서비스는 운영 부담 과다
- 콘웨이 법칙: 팀 구조 ≈ 시스템 구조
- MSA의 핵심 가치(독립 배포)는 4개에서도 보존
- 분리 옵션은 모듈 경계로 보존

**대안 고려**:
- A. 풀 10개 분리: 7명에 운영 부담 과다 → 거부
- B. Modular Monolith (1개): MSA 결정사항 위배 → 거부
- C. 4개 통합 ← **채택**
- D. 6개 통합: 1+1+2+2 인력 패턴 안 맞음 → 거부

**결과**:
- 운영 비용 30% 절감
- 7명 팀 협업 자연스러움
- 미래 분리 옵션 보존

---

### ADR-002: AI Service를 learning-svc에 통합 (별도 컨테이너)

**상태**: Proposed (논쟁 있음)

**결정**:
- AI Service (Python)를 learning-svc 안에 두되, 별도 컨테이너로 운영

**근거**:
- AI의 주 use case가 Card 생성 (Note → Card)
- 7명 팀에 AI Service만 별도 owner 둘 인력 없음
- Java + Python을 한 팀이 다루는 것이 가능 (인터페이스 명확 시)

**위험**:
- 멀티 스택의 학습 부담
- Java ↔ Python 통합 패턴 결정 필요

**완화**:
- 처음부터 Kafka 이벤트 + Internal REST 명확히
- 페어보다 분담 (한 명 Java, 한 명 Python)

---

## 9. 결정사항 체크리스트

### Day 1 합의 사항

- [ ] 4개 서비스 통합안 팀 전체 합의
- [ ] 트랙 매핑 (1+1+2+2) 확정
- [ ] 각 트랙의 MVP 범위 합의 (P0/P1/P2)
- [ ] 팀장의 코드 작성 비중 합의 (최소화)
- [ ] 모듈 경계 강제 (Spring Modulith) 합의
- [ ] Phase 1 (3개월) 목표 설정

### Day 1 산출물

- [ ] 이 문서를 ADR-001, ADR-002로 정식 기록
- [ ] 아키텍처 정의서(#03) 업데이트 (10개 → 4개)
- [ ] Git 규칙 정의서(#09) 보강 (별도 문서 참조)
- [ ] 스케줄(#17) 업데이트 (Phase별 일정)
- [ ] CODEOWNERS 갱신 (트랙별 매핑)

---

## 10. 참고 — 시리즈 문서와의 매핑

이 통합안은 다음 시리즈 문서의 원칙을 따름:

| 원칙 | 적용 |
|---|---|
| #1 SCS | 4개 서비스 = 4개 SCS 후보 |
| #6 DDD Tactical | 각 서비스 안 Aggregate 설계 |
| #7 Hexagonal | 각 서비스 코드 구조 |
| #8 Strategic DDD | 각 서비스 = Bounded Context |
| #9 Event Storming | Day 1 워크샵으로 도메인 재확인 권장 |
| #10 Modular Monolith | Spring Modulith로 모듈 강제 |

> **이 통합안은 시리즈의 "Modular Monolith → 단계적 MSA 진화"의 중간 지점이다.**

---

*작성: Synapse 프로젝트 아키텍처 검토*
*상태: Proposed (팀 합의 후 ADR로 정식 채택)*
*근거 문서: 03_프로젝트_아키텍처_정의서, 09_Git_규칙_정의서*
*동반 문서: SYNAPSE_Git_Rules_Polyrepo_Supplement.md*
