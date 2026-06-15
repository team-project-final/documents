# 🧠 Synapse — 프로젝트 계획서

> **통합 학습-지식 그래프 SaaS** · Obsidian + Anki + RAG 융합 플랫폼
> 노트(PKM)와 복습(SRS)을 하나의 워크플로우로 연결하고, AI가 카드 생성·검색·그래프 탐색을 자동화한다.

|  |  |
|---|---|
| **프로젝트명** | Synapse |
| **버전** | v1.3 (계획서 기준) |
| **기간** | 5주 MVP — 2026-05-12 ~ 06-12 (22 영업일) + 발표 2026-06-15 |
| **팀 구성** | 7인 (팀장 1 + 백엔드 5 트랙 + 프론트 협업) |
| **핵심 스택** | Spring Boot 4 / Flutter 3.x / FastAPI / PostgreSQL 16+pgvector / Redis / Elasticsearch / Kafka / EKS |

> 📚 본 페이지는 프로젝트 Wiki를 단일 페이지로 요약한 계획서입니다.
> 원문: `01 프로젝트 계획서` · `03 아키텍처 정의서` · `17 스케줄` · `02 ERD` · `04 API 명세서` · `07 요구사항 정의서` · `18 기술 스택 정의서`

---

## 1. 배경 & 문제 정의

기존 도구는 **지식을 기록하는 도구(PKM)** 와 **학습하는 도구(SRS)** 가 분리되어 워크플로우가 단절된다.

| 구분 | PKM (Obsidian, Notion) | SRS (Anki, Quizlet) |
|------|------------------------|---------------------|
| 강점 | 자유로운 노트, 백링크 | 과학적 반복 학습 알고리즘 |
| 약점 | 복습 메커니즘 부재 | 맥락 없는 단편 카드 |
| 통합 | 수동 복사/붙여넣기 | 원본 노트와 단절 |

**핵심 문제 5가지**
1. PKM과 SRS의 분리 → 워크플로우 단절
2. 맥락 상실 → Anki 카드가 원본 노트와 연결되지 않음
3. 수동 카드 생성 부담 → 학습 의욕 저하
4. 지식 관계 시각화 부재
5. 시맨틱(의미 기반) 검색 부재

---

## 2. 프로젝트 목표 (Goals)

| # | 목표 | 측정 기준 |
|---|------|-----------|
| G1 | PKM-SRS 통합 | 노트→카드 전환율 60%+ |
| G2 | AI 카드 자동 생성 | 카드 생성 시간 90% 단축 |
| G3 | 지식 그래프 (백링크 + PageRank) | 그래프 탐색 세션 DAU 30%+ |
| G4 | 시맨틱 검색 (pgvector + ES 하이브리드) | 검색 정확도 MRR@10 0.7+ |
| G5 | 크로스 플랫폼 (Flutter) | Web/iOS/Android 동시 출시 |
| G6 | SaaS 수익화 (Freemium) | MRR $10K / 12개월 |

---

## 3. 대상 사용자 (Persona)

- **학습자 (Primary)** — 대학생·자격증 준비생·평생학습자. 일 30분~2시간, 모바일 복습 + 데스크톱 노트.
- **스터디 그룹 멤버** — 학습 커뮤니티 참여자. 공유 덱 복사·리더보드 비교.
- **교육자 (Phase 4+)** — 온라인 강사·기업 교육 담당자. 콘텐츠 배포·진도 추적.
- **관리자/운영** — Synapse 내부 운영팀. 테넌트 관리·모니터링·모더레이션.

---

## 4. 프로젝트 범위 (Scope)

### ✅ In Scope — MVP (5주)

| 영역 | 기능 |
|------|------|
| 노트 | Markdown 에디터, 위키링크 `[[]]`, 태그, 버전 이력 |
| 그래프 | 양방향 백링크 자동 감지, 2D 시각화, PageRank |
| 카드/복습 | 덱 관리, SM-2 SRS 스케줄링, 스와이프 UI |
| AI | 노트→카드 자동 생성(LLM), 시맨틱 캐시, RAG Q&A(여유 시) |
| 검색 | pgvector 임베딩 + BM25 키워드 하이브리드(RRF) |
| 인증/빌링 | OAuth 2.0(Google/GitHub/Apple) + JWT, Stripe Free/Pro |
| 멀티테넌시 | Pool 모델 + RLS 3단계 격리 |
| 커뮤니티 | 스터디 그룹, 덱/노트 공유, 신고/모더레이션 |
| 게이미피케이션 | XP/레벨/배지/스트릭/리더보드 |
| 알림 | 인앱 + 푸시(FCM/APNs) + 이메일(SES), 복습 리마인더 |
| UX | Cmd+K 커맨드 팔레트, 온보딩 체크리스트(TTFV 5분), 복습 축하 애니메이션 |

### ❌ Out of Scope

| 기능 | 사유 | 예상 시점 |
|------|------|-----------|
| Enterprise 플랜 | B2B 영업 체계 미구축 | Phase 5+ |
| 데스크톱 앱 (Electron) | Flutter Web으로 충분 | 미정 |
| 교육자 대시보드 | 로드맵 후순위 | Phase 4 |
| 오프라인 동기화 | 기술 복잡도 높음 | Phase 3 |
| 자체 LLM 학습 | 비용 대비 효과 불분명 | 미정 |

---

## 5. 시스템 아키텍처

> ADR-001 / ADR-002 (2026-05-09 채택)로 **원안 10개 마이크로서비스 → 4개 굵은 서비스**로 통합. 각 서비스 내부는 **Spring Modulith** 모듈로 분리하고 ArchUnit으로 경계를 검증한다. (콘웨이 법칙 · 운영비 ~30% 절감 · 미래 분리 옵션 보존)

```
┌──────────────────────────────────────────────────────────┐
│  Client     Flutter 3.x (Web / iOS / Android)             │
├──────────────────────────────────────────────────────────┤
│  Edge       Cloudflare CDN + WAF (TLS 1.3, DDoS)          │
├──────────────────────────────────────────────────────────┤
│  Gateway    Spring Cloud Gateway 5                        │
│             (CORS → RateLimit → JWT → Tenant → Routing)   │
├──────────────────────────────────────────────────────────┤
│  Services   platform-svc   engagement-svc                 │
│             knowledge-svc   learning-svc (Java + Python)  │
├──────────────────────────────────────────────────────────┤
│  Data       PostgreSQL 16+pgvector · Redis · ES8+nori     │
│             Kafka 3.x · AWS S3                            │
├──────────────────────────────────────────────────────────┤
│  Infra      AWS EKS · ArgoCD · GitHub Actions · Istio     │
└──────────────────────────────────────────────────────────┘
```

### 4-서비스 ↔ 트랙 ↔ Owner

| 트랙 | 레포 / 서비스 | 도메인 모듈 | Owner |
|------|---------------|-------------|-------|
| 팀장 | Gateway · 인프라 · Schema Registry · ArgoCD | (전 영역 cross-review) | `@team-lead` |
| A | synapse-platform-svc | auth · audit · billing · notification | `@platform-owner` |
| B | synapse-engagement-svc | community · gamification | `@engagement-owner` |
| C | synapse-knowledge-svc | note · graph · chunking | `@knowledge-owner-1·2` |
| D | synapse-learning-svc | card · srs (Java) / ai (Python) | `@learning-card-owner` · `@learning-ai-owner` |
| 협업 | synapse-frontend (Flutter) | UI 전체 | 팀장 + 모든 owner |

### 핵심 설계 결정

- **멀티테넌시 3단계 격리** — L1 Gateway(JWT→tenant_id 헤더) · L2 Application(Repository WHERE 강제) · L3 DB(PostgreSQL RLS). 한 계층이 누락돼도 다른 계층이 차단.
- **이벤트 기반 통합** — Kafka 18개 토픽. 페이로드는 `synapse-shared`의 Avro `.avsc`로 정의, Confluent Schema Registry로 **BACKWARD**(Knowledge.events는 BACKWARD_TRANSITIVE) 호환성 강제.
- **서비스 간 내부 통신** — Gateway 우회, Istio mTLS 직접 통신 (예: 공유 덱 복사 `POST /internal/decks/copy`).
- **GitOps 배포** — ArgoCD ApplicationSet 매트릭스(5 서비스 × 3 환경 = 15 App). dev `autoSync=true` 자동 / staging·prod `autoSync=false` 수동 승인.

---

## 6. 일정 (5주 마일스톤)

> 공휴일 제외: 5/25 부처님오신날 · 6/3 전국동시지방선거. 6/15(월) 최종 발표·시연·제출.

| 주차 | 기간 | 핵심 목표 | 종료 게이트 |
|------|------|-----------|-------------|
| **W1** | 05-12~15 (4일) | 인프라 + 4-서비스 골격 + 기본 CRUD + Modulith 모듈 정의 | Docker Compose 로컬 실행, auth/note/card/community CRUD, Modulith verify 통과 |
| **W2** | 05-18~22 (5일) | SRS 복습 / AI 골격 / Graph+ES / 커뮤니티 공유 / Schema 등록 | 복습 세션 동작, 덱 공유→복사, 그래프·하이브리드 검색, v1 Avro 등록 |
| **W3** | 05-26~29 (4일) | 이벤트 발행자 + 검색 RRF + AI 자동 생성 + 게이미피케이션 | 모든 producer 토픽 BACKWARD 등록, RRF 정확도 리포트, AI 카드 생성 |
| **W4** | 06-01~05 (4일) | 이벤트 소비자 + 알림/감사 + 관리자 모더레이션 + 통합 검증 | FCM/SES 발송, audit_logs 적재, 모더레이션 API, ArgoCD dev/staging |
| **W5** | 06-08~12 (5일) | 전체 E2E + P0 버그 + 성능(SLA) + Staging 배포 + 발표 준비 | E2E 통과, 커버리지 80%+, Staging 배포, 리허설 1회+ |
| **발표** | 06-15 (월) | 최종 발표·라이브 시연·제출 | **코드 동결** (P0 hotfix만 허용) |

> **이벤트 흐름 축 분할**이 일정의 핵심: W3은 **발행자(producer)**, W4는 **소비자(consumer)** 로 나눠 Kafka 통합 리스크를 단계적으로 검증한다.

### 완료 정의 (DoD)

기능 체크리스트 100% · 커버리지 80%+ · SLA(P95) 달성 · OWASP Top 10 무취약 · Staging 검증 · API 명세/변경로그 갱신 · 모니터링 설정 완료.

---

## 7. 비즈니스 모델 (Freemium)

| 플랜 | 가격 | 노트/카드 | AI 생성 | 그룹·공유 |
|------|------|-----------|---------|-----------|
| Free | $0 | 100 / 500 | 50회/월 | 가입 2 · 공유 3회/월 |
| Pro | $9.99/월 | 무제한 | 500회/월 | 무제한 가입·공유 |
| Team | $19.99/seat/월 | 무제한 | 1000회/seat/월 | 그룹 생성 무제한 |
| Enterprise | 커스텀 | 무제한 | 무제한 | 전체 |

- **주 수익** 구독료(Pro/Team) · **부 수익** AI 초과 과금·Enterprise 계약
- **전환 목표** Free → Pro 5%+

---

## 8. 성공 지표 (KPI)

| 지표 | 목표 | 지표 | 목표 |
|------|------|------|------|
| D7 Retention | 40%+ | 노트→카드 전환율 | 60%+ |
| 30일 복습 유지율 | 70%+ | 공유 덱 복사율 | 30%+ |
| MAU | 10,000 / 12개월 | 스터디 그룹 참여율 | 20%+ |
| MRR | $10,000 / 12개월 | NPS | 50+ |
| 평균 세션 시간 | 15분+ | 알림 클릭률 | 15%+ |

**기술 SLA** — 검색 응답 < 200ms(P95) · API 가용성 99.9% · 에러율 < 0.1% · AI 카드 생성 < 5초/장

---

## 9. 리스크 & 대응

| 리스크 | 영향 | 확률 | 대응 |
|--------|:----:|:----:|------|
| LLM API 비용 증가 | 高 | 中 | 시맨틱 캐시, 요약 최적화, 로컬 모델 대안 |
| 인력 병목 | 高 | 高 | MVP 범위 최소화, 트랙별 분업 |
| 사용자 획득 | 高 | 中 | SEO, 커뮤니티, 전환 최적화 |
| 기술 부채 | 中 | 高 | TDD, CI/CD 자동화, 주기적 리팩토링 |
| 데이터 유출 | 高 | 低 | RLS, 감사 로그, 정기 보안 점검 |
| 커뮤니티 남용/스팸 | 中 | 中 | 신고 시스템, 자동 필터, 모더레이션 |
| 푸시 알림 피로 | 中 | 高 | 카테고리 설정, 방해금지 시간대 |

---

## 10. 팀 & 개발 방법론

| 역할 | 담당 |
|------|------|
| 팀장 | Gateway + 아키텍처 + 인프라 + 코드 리뷰 (전 PR 승인) |
| 트랙 A | Auth + Audit + Billing + Notification |
| 트랙 B | Community + Gamification |
| 트랙 C (2명) | Note + Graph + Chunking |
| 트랙 D (2명) | Card + SRS (Java) / AI (Python) |
| 협업 | Flutter Frontend (전원 자기 도메인 UI 담당) |

- **방법론** Agile/Scrum, 1주 스프린트 · **도구** GitHub Projects
- **CI/CD** GitHub Actions → ArgoCD · **모니터링** Prometheus + Grafana + Loki + OpenTelemetry + Sentry

---

> 📌 **장기 로드맵**: 본 계획서는 학기 5주 MVP 범위입니다. 제품화 이후 Phase(고도화·트래픽 대응·모듈→서비스 추출)는 `17 스케줄 §5` 및 `09 Git 규칙 정의서`를 참조하세요.
