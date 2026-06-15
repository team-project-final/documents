---
marp: true
paginate: true
size: 16:9
style: |
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
  :root {
    --ink: #2d2418;
    --paper: #faf6ef;
    --accent: #b5562a;
    --accent-soft: #e8d9c3;
    --muted: #7a6a55;
  }
  section {
    font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 21px;
    padding: 48px 64px;
    line-height: 1.45;
  }
  h1 { font-size: 1.5em; color: var(--ink); }
  h2 { font-size: 1.15em; color: var(--accent); margin-top: 0; }
  h6 { color: var(--muted); font-weight: 600; letter-spacing: .12em; margin-bottom: 2px; }
  strong { color: var(--accent); }
  table { font-size: .82em; border-collapse: collapse; }
  th { background: var(--accent-soft); color: var(--ink); }
  th, td { border: 1px solid #d8cbb6; padding: 5px 10px; }
  blockquote { border-left: 4px solid var(--accent); color: var(--muted); padding-left: 14px; }
  section.lead { display: flex; flex-direction: column; justify-content: center; text-align: center; }
  section.lead h1 { font-size: 2.1em; }
  section.divider { display: flex; flex-direction: column; justify-content: center; background: var(--ink); color: var(--paper); }
  section.divider h1 { color: var(--paper); font-size: 1.9em; }
  section.divider p { color: var(--accent-soft); }
  .cols { display: flex; gap: 28px; }
  .cols > div { flex: 1; }
  .box { background: #fff; border: 1.5px solid var(--accent-soft); border-radius: 10px; padding: 8px 12px; text-align: center; }
  .arrow { color: var(--accent); font-weight: 700; align-self: center; }
  .small { font-size: .8em; color: var(--muted); }
  section.compact { font-size: 18px; padding: 36px 56px; }
  section.compact table { font-size: .85em; }
footer: 'SYNAPSE — K-Digital Training 팀별 프로젝트 결과보고서'
---

<!-- _class: lead -->
<!-- _footer: '' -->

###### K-DIGITAL TRAINING

# SYNAPSE
## 노트가 카드가 되는 AI 통합 학습 플랫폼 (PKM + SRS + AI)

**TEAM SYNAPSE** (7인)
김민구(팀장) · 김해준 · 한승완 · 김현지 · 박은서 · 김나경 · 조유지

<span class="small">개발 기간: 2026-05-12 ~ 06-15 (5주) · 발표: 2026-06-17</span>

---

# 목 차

1. **프로젝트 개요** — 주제·배경·기획의도 / 차별화 / 내용·구조 / 개발환경 / 활용방안
2. **프로젝트 팀 구성 및 역할**
3. **프로젝트 수행 절차 및 방법**
4. **프로젝트 수행 경과** — 담당자별(platform · knowledge · learning · engagement · Gateway/인프라) → 시연
5. **하브루타 · 트러블슈팅** — 팀원별 회고
6. **자체 평가 의견**

---

###### 01. 프로젝트 개요

# 주제 · 선정 배경 · 기획 의도

> **SYNAPSE** — PKM(개인 지식 관리)과 SRS(간격 반복 학습)를 **하나의 워크플로우로 통합**하고, 그 사이를 **AI(LLM)** 가 자동으로 연결하는 멀티테넌트 학습 SaaS. 포지셔닝: **"Obsidian + Anki + RAG 융합"**

**해결하려는 문제 — 기존 도구의 단절**

| # | 문제 | 원인 |
|---|---|---|
| 1 | 워크플로우 단절 | PKM(Obsidian·Notion)과 SRS(Anki)가 분리 — 노트를 카드로 **수동 복사** |
| 2 | 맥락 상실 | 복습 카드가 원본 노트와 연결되지 않음 |
| 3 | 카드 제작 노동 | 손으로 만드는 카드가 학습 의욕을 저하 |
| 4 | 관계 시각화 부재 | 노트 간 연결을 한눈에 볼 수 없음 |
| 5 | 검색 한계 | 키워드 매칭만 가능, 의미 기반 검색 없음 |

**기획 의도(목표)**: G1 통합 워크플로우 · G2 AI 카드 자동 생성 · G3 지식 그래프 · G4 하이브리드 시맨틱 검색 · G5 크로스플랫폼(Flutter) · G6 Freemium SaaS 수익화

---

###### 01. 프로젝트 개요

# 차별화 포인트

<div class="cols">
<div>

**제품 — "통합과 자동화"**

- **PKM+SRS 단일 플랫폼**: 카드가 항상 원본 노트에 링크 → 맥락 유지
- **AI 카드 자동 생성**: LLM이 노트를 분석해 플래시카드 자동 생성 → 제작 노동 제거
- **위키링크 지식 그래프**: `[[링크]]` 자동 감지, 백링크·PageRank 중요도, 2D 시각화
- **하이브리드 검색**: BM25(키워드) × 임베딩(의미)을 **RRF**로 융합

</div>
<div>

**아키텍처 — "현업형 MSA 정공법" (ADR 3건)**

| ADR | 결정 | 근거 |
|---|---|---|
| 0001 | **MSA** 채택 | 4개 도메인 자연 분리, 경계를 네트워크·배포로 강제 |
| 0002 | **Kafka+Avro+Outbox** | 가용성 결합 제거, BACKWARD 호환 강제, 이벤트 재생 |
| 0003 | **단일 PG + 스키마 격리** | 7인 팀 현실 비용 + 계정 권한 분리, 크로스 스키마 금지 |

토이 프로젝트가 아닌 **의사결정 기록(ADR)을 남기는 아키텍처 학습**

</div>
</div>

---

<!-- _class: compact -->

###### 01. 프로젝트 개요

# 프로젝트 구조 — 시스템 구성도

<div class="cols" style="font-size:.85em">
<div style="flex:0 0 17%">
<div class="box"><b>Flutter</b><br/>Web·iOS·Android</div>
<p class="arrow" style="text-align:center">▼ REST /api/*</p>
<div class="box"><b>Gateway</b><br/>JWT 엣지검증<br/>Redis rate-limit</div>
</div>
<div style="flex:0 0 38%">
<div class="cols" style="gap:8px">
<div class="box"><b>platform</b><br/>인증·결제<br/>알림·감사</div>
<div class="box"><b>knowledge</b><br/>노트·그래프<br/>검색</div>
</div>
<div class="cols" style="gap:8px; margin-top:8px">
<div class="box"><b>learning</b><br/>SM-2 복습(Java)<br/>AI 카드(Python)</div>
<div class="box"><b>engagement</b><br/>커뮤니티<br/>게이미피케이션</div>
</div>
<p class="arrow" style="text-align:center">▲▼ 발행/소비 (Transactional Outbox)</p>
<div class="box" style="background:var(--accent-soft)"><b>Kafka + Schema Registry (Avro·BACKWARD)</b><br/><span class="small">user-registered · note-created/updated · review-completed · notification-send · level-up/badge-earned (8토픽)</span></div>
</div>
<div style="flex:0 0 30%">
<div class="box"><b>PostgreSQL 16.9</b><br/>스키마 격리 + pgvector(1536d)</div>
<div class="box" style="margin-top:8px"><b>Redis 7.1</b><br/>캐시·rate-limit</div>
<div class="box" style="margin-top:8px"><b>Elasticsearch 9.2.1</b><br/>Nori 한국어 분석기</div>
<div class="box" style="margin-top:8px"><b>Kubernetes + ArgoCD GitOps</b><br/>dev · staging · prod</div>
</div>
</div>

**이벤트 순환 예**: 노트 생성 → AI 카드 생성 → 복습 완료 → XP/레벨업 → 알림 (전 이벤트 감사 기록)

---

###### 01. 프로젝트 개요

# 개발환경 · 활용방안

| 영역 | 스택 |
|---|---|
| 백엔드 | **Java 21 · Spring Boot 4.0** · Spring Modulith(+ArchUnit) · Spring Cloud Gateway(WebFlux) |
| AI | **Python 3.12 · FastAPI** · anthropic/openai SDK 직접 호출(LangChain 미사용) · pgvector |
| 프론트 | **Flutter 3 / Dart** · Riverpod · go_router (단일 코드베이스 Web/iOS/Android) |
| 데이터 | PostgreSQL 16.9 · Redis 7.1 · Kafka(TLS) · Schema Registry 7.7 · Elasticsearch 9.2(Nori) |
| 인프라 | **Kubernetes 1.30** · Terraform(IaC) · Kustomize · **ArgoCD GitOps** · External Secrets |
| CI/CD·품질 | GitHub Actions 재사용 워크플로우(shared) · Testcontainers · JaCoCo 80% 게이트 · Flyway 가드 |

<div class="cols">
<div>

**활용방안** — Freemium SaaS(Free/Pro/Team/Enterprise), 멀티테넌트로 B2C·B2B(교육기관) 동시 대응

</div>
<div>

**기대효과** — 카드 제작 노동 제거 + 망각곡선 복습 정착 + 시맨틱 재발견 / MSA·이벤트·GitOps·LLM **현업 표준 레퍼런스**

</div>
</div>

---

<!-- _class: compact -->

###### 02. 팀 구성 및 역할

# 7인 — 도메인 트랙 분담, 프론트엔드는 전원 협업

| 훈련생 | 역할 | 트랙 | 담당 |
|---|---|---|---|
| **김민구** | **팀장** | Gateway·인프라 | 쿠버네티스·Kafka·DB 인프라(IaC), ArgoCD·CI/CD·Schema Registry, API Gateway, PR 크로스리뷰·통합 조율, staging 복구 |
| 김해준 | 팀원 | A · platform | 인증(OAuth+JWT+MFA), Stripe 결제, 알림(FCM/SES), 감사로그(전 이벤트 소비), GDPR Admin |
| 한승완 | 팀원 | B · engagement | 커뮤니티(그룹·공유·신고/모더레이션), 게이미피케이션(XP·레벨·배지·리더보드) |
| 김현지 | 팀원 | C-1 · knowledge | 노트 CRUD·버전·태그, 위키링크·백링크, 지식 그래프(PageRank), 검색 인덱스 동기화 |
| 박은서 | 팀원 | C-2 · knowledge | 비동기 청킹, BM25·RRF 하이브리드 검색, Modulith 경계(ArchUnit), Avro 스키마 |
| 조유지 | 팀원 | D-1 · learning-card | 덱·카드, **SM-2 복습 알고리즘**, 세션·통계, review 이벤트 발행 |
| 김나경 | 팀원 | D-2 · learning-ai | **Claude 카드 자동 생성**, OpenAI 임베딩, pgvector 시맨틱 검색, RAG |

- **Flutter 프론트엔드**: 별도 owner 없이 **각자 자기 도메인 화면을 전원 공동 구현**

---

###### 03. 수행 절차 및 방법

# 5주 스프린트 (2026-05-12 ~ 06-15, 22 영업일)

| 구분 | 기간 | 활동 | 비고 |
|---|---|---|---|
| 사전 기획 | ~05-11 | 주제·페르소나·요구사항, **ADR 0001~0003**, 문서체계 수립 | 아이디어 선정 |
| **W1** 환경·골격 | 05-12~15 | 쿠버네티스·DB·Kafka·ArgoCD 셋업, 4서비스 골격+CRUD, auth, Flutter 쉘 | 인프라 구축 |
| **W2** 핵심 구현 | 05-18~22 | SM-2 복습, AI 카드 골격, 그래프·검색 동기화, 청킹·BM25, Avro v1 등록 | 전처리·모델링 |
| **W3** 이벤트·고도화 | 05-26~29 | 전 producer 발행, 게이미피케이션 완성, RRF 하이브리드, AI 안정화 | 중간보고 (4일) |
| **W4** 통합·소비자 | 06-01~05 | notification(FCM/SES)·audit 소비, 모더레이션, ArgoCD dev/staging 검증 | (4일) |
| **W5** 안정화·발표 | 06-08~12 | **E2E 10 시나리오·P0 0건·SLA 측정·커버리지 80%·Staging 가동** | 최적화·오류 수정 |
| 발표 | **06-17** | 최종 발표·시연 — **코드 동결**(P0 hotfix만) | |

> 공휴일(5/25 부처님오신날·6/3 지방선거) 제외로 W3·W4는 4영업일 운영. 이벤트 흐름 축(producer→consumer) 기준으로 주차 분할.

---

###### 03. 수행 절차 및 방법

# 수행 방법 — 협업·품질 체계

<div class="cols">
<div>

**형상·협업**

- **멀티레포 19개** — 서비스 / gitops / shared 계약 / 문서·산출물 분리
- 브랜치 → PR → **크로스리뷰** → merge (Conventional Commits)
- **workflow-dashboard** — 7개 레포 진행 현황 일 3회 동기화 시각화
- shared **Avro 계약 단일 소스** → GitHub Packages 배포

</div>
<div>

**품질·운영**

- **5종 문서체계**: SCOPE → PRD → TASK → WORKFLOW → HISTORY (1주 스프린트)
- **ADR**로 아키텍처 의사결정 기록
- TDD·Testcontainers·**JaCoCo 80% 게이트**·ArchUnit 모듈 경계
- **GitOps**: ArgoCD — dev 자동 sync / staging·prod 승인 게이트, Image Updater
- 재사용 CI: deploy·schema-check·flyway-guard·mirror

</div>
</div>

```text
주제·ADR → 골격(W1) → 전처리·핵심 모델(W2) → 이벤트·고도화(W3) → 소비·통합(W4) → E2E·SLA·Staging·발표(W5)
```

---

<!-- _class: compact -->

###### 04. 수행 경과 — ① platform

# 김해준 (트랙 A) — 인증·결제·알림·감사

- **인증·테넌트** — OAuth(Google/GitHub/Apple) + JWT RS256 + MFA(TOTP), tenant self-service·초대·DB 기반 role
- **결제(Stripe)** — Free/Pro/Team 구독, 결제 이력·영수증·사용량 조회
- **알림** — 인박스 + FCM/SES 발송(`notification-send` 소비), 미읽음 배지·클릭 라우팅
- **감사·관리자** — 전 이벤트 소비 audit log(90일 보존), GDPR 데이터 요청, 시스템 설정·분석 API
- **이벤트** — `user-registered` 발행(Transactional Outbox), 그룹 `platform-svc-group`

---

<!-- _class: compact -->

###### 04. 수행 경과 — ② knowledge

# 김현지(C-1) · 박은서(C-2) — 노트·그래프·검색

<div class="cols">
<div>

**노트·그래프 — 김현지**

- Markdown 노트 CRUD · 버전 이력·복원 · 태그 (소유자 격리 `validateOwner`)
- 위키링크 파싱 · 백링크 · PageRank 그래프 (`GraphQueryPort` 포트 패턴)
- Kafka→ES 자동 동기화 (Outbox `AFTER_COMMIT` · 멱등 Redis TTL 7d · DLQ)

</div>
<div>

**청킹·검색 — 박은서**

- 비동기 청킹 → OpenAI 임베딩 → `note_chunks`(pgvector)
- ES BM25(Nori) + **RRF 하이브리드**(시맨틱은 learning-ai 위임) + 키워드 폴백
- Modulith 경계(ArchUnit) · Avro 스키마 · 검색 E2E CI 복구

</div>
</div>

---

<!-- _class: compact -->

###### 04. 수행 경과 — ③ learning

# 조유지(D-1 card) · 김나경(D-2 ai) — 복습·AI

<div class="cols">
<div>

**learning-card · SRS — 조유지**

- 덱·카드 CRUD, **SM-2 4버튼 복습 스케줄링**
- 복습 세션·통계 (overview/heatmap/retention)
- 발행 `review-completed`·`review-due`, Flutter 복습 UI 연동

</div>
<div>

**learning-ai · AI — 김나경**

- FastAPI 골격 + **LLM 이중화**(Tenacity → OpenAI Fallback)
- **Claude 카드 자동 생성** · OpenAI 임베딩 · pgvector 시맨틱 검색 · RAG(SSE)
- 소비 `note-created` → 카드 생성, AiCard Consumer(DLQ·멱등)

</div>
</div>

---

<!-- _class: compact -->

###### 04. 수행 경과 — ④ engagement

# 한승완 (트랙 B) — 커뮤니티·게이미피케이션

- **community** — 그룹 CRUD · 멤버 관리 · 공유(덱/노트)·fork · 검색 · 신고/모더레이션
- **gamification** — XP · 레벨 · 배지 · 스트릭 · 리더보드(Redis 캐시 → DB 폴백)
- **이벤트** — 소비 `user-registered`(프로필 생성)·`review-completed`(XP 적립), 발행 `level-up`·`badge-earned`·`notification-send`, 그룹 `engagement-svc-group`
- **검증** — Step 9~11 E2E(복습→XP→레벨업→audit), 멱등성(`eventId` / `cardId+reviewedAt`)

---

<!-- _class: compact -->

###### 04. 수행 경과 — ⑤ Gateway · 인프라 · CI/CD

# 김민구 (팀장) — 플랫폼 기반 · 통합

- **Gateway** — `/api/{svc}/**` 라우팅(StripPrefix) · JWT 엣지검증+신원 전파 · Redis rate-limit(1rps·burst 60) · CORS · frontend 캐치올
- **인프라(IaC)** — EKS·RDS·MSK·ElastiCache·ES Terraform, ArgoCD GitOps(dev/staging/prod), bring-up 멱등 자동화(kafka-topics·db-init·es-reindex)
- **공유·표준** — shared Avro 계약·Schema Registry, reusable CI(deploy/mirror/flyway-guard), 토픽 환경 프리픽스(#199)
- **운영·SLA** — PR 크로스리뷰, staging **16/16 Healthy · 24h 소크**, SLA 실측 5/7(P1 79.7ms·P4 1.31s·P7 FCM 100%), 장애 추적·복구

---

###### 04-⑥ 시연

# 데모 — 학습 순환 한 바퀴

| 구간 | 시연 내용 | 확인 포인트 |
|---|---|---|
| ① 가입·로그인 | 신규 가입 → JWT 발급 | `user-registered` 이벤트 → 프로필 자동 생성 |
| ② 노트 작성 | Markdown + `[[위키링크]]` → 그래프 뷰 | 백링크·PageRank 시각화 |
| ③ AI 카드 | 노트 저장 → 자동 생성된 플래시카드 확인 | `note-created` → Claude 생성 체인 |
| ④ 복습 | SM-2 복습 세션 → 4버튼 평가 | XP +10 → 레벨업 → 알림 환류 |
| ⑤ 검색 | 키워드 vs 시맨틱 vs **하이브리드** 비교 | RRF 융합 랭킹·하이라이트 |
| ⑥ 운영 화면 | Grafana 대시보드·audit 로그 | 방금 발생한 이벤트가 메트릭·감사에 반영 |

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (1/7)

# 김민구 — 팀장 · Gateway · 인프라

<div class="cols">
<div>

**하브루타노트**

- **폴리레포 부트스트랩 멱등 자동화(syn)** — `repo_exists`/`secret_exists` 가드로 Phase 1~3(레포·시크릿·scaffold) 재실행 안전 + 자동 보고서<br/><span class="small">멱등·재실행 안전 설계로 실패를 수치로 진단·복구.</span>
- **대시보드 자동 파이프라인 vs 수기 데이터** — 파서 CI가 수기 데이터를 덮어써 진행률 역행 → `trackAliasMap` + history rolling **max(단조 증가)**<br/><span class="small">단조 지표는 쓰기 시점에 max 불변식으로 강제.</span>
- **Flyway 버전 표준 + CI 가드** — 전역 정수 버전 수동선택이 부른 V28 중복 → 14자리 타임스탬프 버전 + `flyway_guard.py`<br/><span class="small">표준은 문서가 아니라 CI 가드로 fail-fast 강제.</span>

</div>
<div>

**트러블슈팅**

- **gradlew 실행권한 누락 → CI 실패** — `gradlew`가 100644로 커밋돼 'Permission denied'(암묵적 권한 의존) → file mode 100755 + 워크플로 `chmod +x` 안전망<br/><span class="small">CI 통과가 행운에 기대지 않게 명시 고정.</span>
- **Gateway Boot 4.0.6 YAML 라우트 버그** — 선언적 라우트 미동작 → `RoutesConfig`/`CorsConfig` **Java config 전환** 후 429·CORS 실검증<br/><span class="small">메이저 .0 초기버전은 검증된 programmatic 경로로 우회.</span>
- **분기 보호 ruleset — PR BLOCKED·BEHIND 레이스** — required check를 워크플로명으로 적어 잡명 `validate`와 불일치 + strict로 직렬 BEHIND → 잡명 정정·strict 완화<br/><span class="small">required check는 잡명으로, strict는 처닝 잦은 main에 부적합.</span>

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (2/7)

# 김해준 — platform (트랙 A)

<div class="cols">
<div>

**하브루타노트**

- **AI Agent 작업 문서 구조 초기화** — Director·Researcher·Worker 역할 분리(`docs/ai`·`DECISION_LOG.md`)<br/><span class="small">회고: 프로젝트 초반엔 코드보다 작업 기준 문서가 먼저 잡혀야 한다.</span>
- **Stripe Billing 보안 버그 수정** — `/billing/**` 전체 permitAll → webhook만 공개·나머지 인증 강제(302→**401**)<br/><span class="small">회고: AI 코드라도 인증·결제·개인정보는 직접 검토 — 검토 책임은 오히려 더 중요해졌다.</span>
- **디자인 목업 워크플로우를 재사용 스킬로 패키징** — 제품명 제거·도메인 중립화 + 토큰 다중 내보내기(Theme/CSS/Tailwind/JSON)<br/><span class="small">회고: 두 번 이상 할 작업은 워크플로우 자체를 산출물로 만든다.</span>

</div>
<div>

**트러블슈팅**

- **로컬 실행 인프라 기준 누락** — Dockerfile만 있고 의존 서비스 실행 기준 부재 → `docker-compose.yml` 추가<br/><span class="small">Dockerfile=빌드 기준, compose=실행 기준(역할이 다르다).</span>
- **Notification Modulith 경계 위반** — notification이 auth 내부 `JwtAuthenticationFilter` 직접 import → `@Qualifier` Filter 주입<br/><span class="small">bean 주입이 돼도 패키지 import가 곧 모듈 의존.</span>
- **MSA 협업·세팅 관리 부재** — 세팅 충돌 → 역할 기반 질문 체계(일반/인프라/교육) 정립<br/><span class="small">개인 능력보다 팀 작업흐름·온보딩 관리가 중요.</span>

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (3/7)

# 김나경 — learning-ai (트랙 D-2)

<div class="cols">
<div>

**하브루타노트**

- **FastAPI 골격 + LLM 이중화** — Claude 장애 대비 Tenacity 재시도 → OpenAI Fallback, 토큰 사용량 로깅<br/><span class="small">Fallback을 처음부터 설계에 넣으니 이후 안심이 됐다.</span>
- **pgvector 시맨틱 검색 + 카드 생성 프롬프트** — HNSW 인덱스, Jinja2 템플릿 외부 분리<br/><span class="small">LLM이 마크다운 섞어 반환 → 방어적 파싱이 필수.</span>
- **AiCard Kafka Consumer(재시도·DLQ·멱등) + RAG** — event_id 중복 skip, 60s timeout, Redis 시맨틱 캐시·SSE<br/><span class="small">단일 인스턴스는 인메모리 set, 스케일아웃 시 Redis로.</span>

</div>
<div>

**트러블슈팅**

- **Kafka SSL `ssl_context` 미전달 → CrashLoop** — `security_protocol=SSL`만으론 부족, 컨텍스트 생성·전달 필요
- **Kafka Consumer 메모리 누수** — `_processed` 멱등 set에 상한이 없어 무제한 증가
- **Consumer 전량 DLQ 이동** — 이벤트 content 계약 불일치로 전부 DLQ행

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (4/7)

# 조유지 — learning-card (트랙 D-1)

<div class="cols">
<div>

**하브루타노트**

- **문서 읽고 역할 파악** — 맡은 복습 기능이 전체 서비스에서 어떤 역할인지 먼저 이해<br/><span class="small">비전공자라 큰 흐름을 먼저 잡으니 이후 개발이 수월.</span>
- **코드리뷰 반영 + E2E 버그 수정** — 로컬 환경 정합, 누락 마이그레이션·스케줄러 쿼리 오류 보완<br/><span class="small">작성만큼 실제 실행·검증 과정이 중요.</span>
- **Flutter ↔ 백엔드 연결** — 카드 생성·복습 흐름 동작, 카드 타입 값 정합<br/><span class="small">화면만이 아니라 프론트·백엔드·DB 데이터 기준이 모두 맞아야.</span>

</div>
<div>

**트러블슈팅**

- **bootRun 실패 (PostgreSQL/Redis 포트 충돌)** — 로컬 서비스가 Docker와 같은 포트 → 로컬 중지 후 compose 재실행
- **카드 생성 500 (card_type CHECK 위반)** — 프론트 `BASIC` ↔ DB 허용값 불일치 → 백엔드 변환
- **Flutter 저장 버튼 무반응** — 실패를 화면에 미표시 → 저장 실패 시 SnackBar로 노출

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (5/7)

# 박은서 — knowledge (트랙 C-2)

<div class="cols">
<div>

**하브루타노트**

- **Spring Modulith 학습·실습** — 주문·재고 예제로 이벤트 기반 모듈 통신 직접 구현<br/><span class="small">개념만보다 작은 예제 구현이 학습 효율↑, "왜 필요한가"를 먼저.</span>
- **semantic/hybrid 검색 + RRF** — BM25 위에 learning-ai 시맨틱 프록시·RRF 병합, 3s 폴백<br/><span class="small">테스트 컨텍스트 공통 빈(ObjectMapper)까지 함께 설계.</span>
- **검색 E2E CI 복구** — `@Disabled` 제거, `searchE2eTest` 분리, consumer offset/readiness 정합<br/><span class="small">읽는 데이터 범위·consumer 시작 시점 통제가 핵심.</span>

</div>
<div>

**트러블슈팅**

- **PR Build 실패 — ES cleanup** — 인덱스 무조건 삭제 가정 → `indices().exists()` 후 삭제<br/><span class="small">CI는 초기 상태라 숨은 환경 가정을 드러낸다.</span>
- **컨트롤러 테스트 실패 — ObjectMapper 빈 누락** — `@ConditionalOnMissingBean` fallback 빈 추가
- **NeighborGraph Docker/Postgres 정렬** — Testcontainers→compose 전환, Flyway 유지·`ddl-auto: none`, pgvector 이미지

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (6/7)

# 김현지 — knowledge (트랙 C-1)

<div class="cols">
<div>

**하브루타노트**

- **지식 그래프 API + 포트 패턴** — `GET /api/graph/data`, `GraphQueryPort`로 모듈 경계 준수(ArchUnit 통과)<br/><span class="small">포트 패턴으로 Modulith 경계를 지키며 확장성 확보.</span>
- **Kafka→ES 자동 동기화 풀스택** — Outbox(AFTER_COMMIT) + 멱등 Consumer(Redis TTL 7d) + DLQ·Slack + CloudEvents 1.0<br/><span class="small">분산 메시징은 멱등성·실패경로(DLQ)를 처음부터 설계.</span>
- **노트 버전 이력·복원 + 태그 API** — 모든 버전/태그 메서드에 `validateOwner`(소유자 격리)<br/><span class="small">기능과 동시에 보안·컨벤션을 챙겨야 리뷰가 매끄럽다.</span>

</div>
<div>

**트러블슈팅**

- **searchE2eTest 7/7 실패 — nori 미설치** — ES 컨테이너에 한국어 nori 플러그인 부재 → `--force-recreate` 재생성 후 7/7 PASS<br/><span class="small">테스트 실패=코드버그 아닐 수 있다, 환경 먼저 의심.</span>
- **actuator health DOWN — CI Redis 누락** — 인기태그 캐싱이 Redis 의존인데 CI compose에 부재 → Redis 추가<br/><span class="small">의존성 추가 시 CI 인프라도 함께 챙겨야 health 통과.</span>
- **squash 머지 후 커밋 누락** — squash로 dev가 단일 머지커밋 압축→개별 SHA 어긋남 → dev 기반 새 브랜치+cherry-pick<br/><span class="small">squash 머지 후 기존 브랜치 재사용 금지.</span>

</div>
</div>

---

<!-- _class: compact -->

###### 05. 하브루타 · 트러블슈팅 (7/7)

# 한승완 — engagement (트랙 B)

<div class="cols">
<div>

**하브루타노트**

- **community 그룹 CRUD (W1)** — 생성·조회·수정·삭제 + 권한·실패케이스(401/403/400)·soft delete 검증<br/><span class="small">권한·인증·입력·soft delete를 처음부터 잡아야 이후 기능이 안 흔들린다.</span>
- **gamification XP 기초 (W2)** — 누적 XP·이력(`user_profiles_gamification`·`xp_events`), `eventId`/`userId+eventType+sourceId`로 멱등성<br/><span class="small">점수 누적에도 멱등성 — 중복 한 번에 레벨·리더보드가 틀어진다.</span>
- **Kafka 이벤트 Avro 리팩토링 (W3)** — JSON/CloudEvents → Avro+Schema Registry(`LevelUp`·`BadgeEarned.avsc`), 공통메타·key=tenantId<br/><span class="small">Kafka 이벤트는 단순 전송이 아니라 서비스 간 계약.</span>

</div>
<div>

**트러블슈팅**

- **status DOWN — Redis 설정 불완전** — host/port/password 누락 → 인증 실패(`NOAUTH`)로 Actuator health 503/DOWN → 환경별 Redis 설정 연결<br/><span class="small">기능 동작(DB fallback)과 health check는 분리해서 봐야 한다.</span>
- **Flyway 마이그레이션** — JPA Entity≠실제 테이블 보장, 환경마다 schema 갈림 → `V번호__설명.sql` migration + `flyway_schema_history` 추적<br/><span class="small">DB 직접 수정 말고 migration 파일로 변경 이력을 코드와 함께.</span>
- **SOFT DELETE** — 진짜 삭제 대신 `deleted_at` 표시(복구·기록·연관데이터 보호), 조회 시 `deleted_at IS NULL` 필수<br/><span class="small">지우는 게 아니라 숨기는 방식 — 조회 조건 누락 주의.</span>

</div>
</div>

---

###### 06. 자체 평가

# 기획 의도 대비 달성도

| 목표 | 결과 | 달성 |
|---|---|---|
| G1 PKM-SRS 통합 워크플로우 | 노트→카드→복습 순환 전 구간 구현·E2E 검증 | ✅ |
| G2 AI 카드 자동 생성 | Claude 파이프라인 + 파싱 견고화 + DLQ (운영 키 주입 과제 잔존) | 🟡 |
| G3 지식 그래프 | 위키링크·백링크·PageRank·2D 시각화 | ✅ |
| G4 하이브리드 시맨틱 검색 | BM25×임베딩 RRF 융합 + 폴백 (정확도 정량 측정은 과제) | 🟡 |
| G5 크로스 플랫폼 | Flutter 단일 코드베이스 Web/iOS/Android | ✅ |
| G6 SaaS 수익화 | Stripe 결제·Freemium 4단계·멀티테넌트 | ✅ |

**+ 계획에 없던 성취** — 쿠버네티스 staging **실 운영**: ArgoCD 16/16 Healthy, SLA 실측 5/7 충족, 장애 복구·24h 안정 사인오프

<p class="small">※ 종합 점수·팀 의견은 발표 전 팀 회고에서 확정</p>

---

###### 06. 자체 평가

# 개선·보완할 점

| 항목 | 현황 | 개선 방향 |
|---|---|---|
| 사용자 식별자 모델 | UUID ↔ 일부 서비스 Long 해시 혼재 | **전 서비스 UUID 정본 통일** (진행 중) |
| P6 AI 카드 체인 | 운영 환경 실 키·스키마 정렬 미완 | 키 주입 + ReviewCompleted 정본 정렬 후 SLA 재측정 |
| 검색 정확도 | 레이턴시만 실측, MRR@10 미측정 | 골든셋 구축 → 정량 평가 |
| Avro 버전 드리프트 | 서비스 간 1.11.3/7.5.0 vs 1.12.0/7.7.0 | 정본 정렬 + CI 호환성 검증 전 서비스 확대 |
| Outbox 재시도 | 무한 재시도 (상한 없음) | max-attempt + DLQ 상한 도입 |
| 잔여 기능 | Streak 스텁 · 파일 첨부(오브젝트 스토리지) 미구현 · 리더보드 DB 정렬 | 차기 스프린트 반영 |

---

###### 06. 자체 평가

# 성과와 소감

<div class="cols">
<div>

**잘한 점**

- **정공법 아키텍처** — ADR로 결정을 기록하고 MSA·이벤트 드리븐·Outbox·CQRS를 끝까지 구현
- **운영까지 완주** — 쿠버네티스·GitOps 실 배포, SLA 실측, 장애 복구, 관측성(Prometheus·Grafana·Loki)
- **협업 체계** — 7인 멀티레포·크로스리뷰·5종 문서·대시보드로 5주 스프린트 완수
- 발견한 결함을 **이슈→PR→회귀 검증**으로 닫는 사이클 정착

</div>
<div>

**아쉬운 점**

- AI 체인의 운영 환경 검증을 발표 주까지 끌고 옴 — 외부 의존(키·스키마)은 더 일찍
- 식별자 모델 통일을 설계 단계에서 확정하지 못해 후반 비용 발생
- 검색 품질의 정량 평가(골든셋) 미완

**경력 연계** — 백엔드·인프라·AI 각자 트랙에서 **현업 표준 도구체인을 실전 경험**

</div>
</div>

<p style="text-align:center; margin-top:24px"><b>감사합니다</b></p>
