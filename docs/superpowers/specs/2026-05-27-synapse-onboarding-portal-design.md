# synapse-onboarding — 신입 온보딩 Flutter Web 포털 설계

> **작성일**: 2026-05-27
> **상태**: 설계 (구현 전)
> **대상 독자**: MSA를 처음 접하는 신입 개발자
> **산출물**: 신규 레포 `synapse-onboarding` — GitHub Pages 배포 Flutter Web 포털

---

## 1. 목적

SYNAPSE에 새로 합류한 신입 개발자가 **한 번 읽으면 시스템 전체가 어떻게 맞물려 돌아가는지** 머릿속에 그려지는 온보딩 포털을 만든다.

기존 자료는 이미 풍부하다 — 18개 위키 문서(기획/설계/개발규칙/운영), 트랙별 온보딩 가이드(`documents/docs/onboarding/`), 서비스별 ARCHITECTURE.md, 코딩 컨벤션. 그러나 이들은 **계정·도구 셋업**과 **트랙별 첫 작업**, 또는 **세부 스펙**에 초점이 맞춰져 있어, "전체 시스템 흐름과 기능을 한눈에 보여주는 조망 문서"는 비어 있다. 이 포털이 그 갭을 채운다.

### 핵심 원칙: 하이브리드(조망 + 서사 + 링크)

- **재작성하지 않는다**: API 필드, ERD 컬럼, env 값, 설치 절차 같은 세부 스펙은 원본 문서로 **링크**만 한다. 중복은 부채다 — 원본이 바뀌면 이 포털이 낡는다.
- **이해는 여기서 끝낸다**: "SYNAPSE가 뭐고 → 어떤 서비스가 있고 → 요청/이벤트가 어떻게 흐르고 → 핵심 기능이 뭔지"는 이 포털 안에서 자체 완결된 **서사**로 설명한다. 신입이 5개 문서를 튕겨 다니며 그림을 맞추게 하지 않는다.
- **MSA 처음인 독자 기준**: MSA·Kafka·멀티테넌시·RAG 같은 개념을 짧게 풀어주고, "왜 이렇게 설계했는지"(예: 10→4 서비스 통합)까지 짚는다.

---

## 2. 산출물 개요

워크스페이스 형제 폴더로 신규 레포 **`synapse-onboarding/`** 를 생성한다. `synapse-gitops/site`의 "Synapse Docs Portal"(Flutter Web + 마크다운→JSON 빌드 + GitHub Pages 배포)을 **포크·각색**하고, 그 위에 신입용 전체 흐름·기능 서사 콘텐츠를 직접 작성한다.

- **검증 종착점**: 로컬 `flutter run -d chrome` 정상 구동 + 9개 섹션 렌더 + 다이어그램 표시.
- **배포**: GitHub Pages 워크플로(`--base-href /synapse-onboarding/`)를 포함하되, 실제 push와 Pages 활성화는 GitHub 권한이 필요하므로 **사용자가 트리거**한다.
- **언어**: 콘텐츠·UI 모두 한국어. 포크된 site의 디자인 테마(DESIGN.md 기반)를 유지한다.

### 포크 베이스 결정

`synapse-gitops`를 포크 베이스로 쓴다. `synapse-gitops-s6`에는 `.github`가 없고, `synapse-gitops`에만 완성된 `deploy-pages.yml`(Flutter Web 빌드 → GitHub Pages)이 있다.

---

## 3. 레포 구조

```
synapse-onboarding/
├─ content/                       # 신규 작성 — 온보딩 서사 마크다운 (§5)
│  ├─ 01-what-is-synapse.md
│  ├─ 02-msa-and-big-picture.md
│  ├─ 03-four-services.md
│  ├─ 04-sync-request-flow.md
│  ├─ 05-async-event-flow.md
│  ├─ 06-core-user-flows.md
│  ├─ 07-frontend.md
│  ├─ 08-data-deploy-observability.md
│  └─ 09-where-to-start.md
├─ site/                          # synapse-gitops/site에서 포크한 Flutter 앱
│  ├─ lib/
│  │  ├─ app.dart                 # 라우트 단순화 (home · doc · search)
│  │  ├─ pages/ (home · doc · search · TOC)
│  │  └─ widgets/ (markdown viewer · sidebar · mermaid 위젯 신규 · ...)
│  ├─ scripts/build_docs.mjs      # local content/ 읽도록 각색
│  ├─ web/index.html              # mermaid.js CDN 로드 추가
│  └─ assets/docs/*.json          # 빌드 산출물
├─ .github/workflows/deploy-pages.yml
└─ README.md                      # 로컬 실행 + 기여 방법
```

### 포크 후 각색 포인트

1. **콘텐츠 소스 변경**: 원본 `build_docs.mjs`는 sibling 레포(`synapse-gitops/docs/runbooks`, `synapse-shared/docs`)에서 수집한다. 온보딩 콘텐츠는 자체 완결이므로 **레포 내부 `content/`** 에서 수집하도록 `WORKSPACE`/수집 경로와 `CATEGORY_MAP`을 각색한다.
2. **배포 워크플로 단순화**: sibling 체크아웃, `SHARED_REPO_TOKEN`, Dart `parse-runbooks.dart` 단계를 제거한다(콘텐츠가 한 레포 안에 있으므로 불필요). `--base-href`를 `/synapse-onboarding/`로 변경.
3. **불필요 페이지 제거**: gitops 전용 `runbook_page.dart`, `dashboard_page.dart`와 관련 모델/라우트를 제거한다. `home · doc · search`만 유지한다.
4. **AI 요약 비활성화**: `build_docs.mjs`의 AI 요약(Haiku)은 끈다(`NO_AI=1`). 큐레이션된 온보딩 문서는 손수 쓴 섹션 인트로가 더 낫고, 빌드를 결정적으로 유지한다.
5. **Mermaid 렌더링 위젯 추가**: §6 참조.

---

## 4. 콘텐츠 정확성의 원천 (검증된 사실)

콘텐츠는 다음 원본에서 확인된 사실에 근거한다(`documents.wiki/03_프로젝트_아키텍처_정의서.md` v2.1 기준).

- **제품**: 통합 학습-지식 그래프 SaaS — Obsidian + Anki + RAG 융합.
- **4개 핵심 서비스**(ADR-001/002로 10→4 통합, 내부는 Spring Modulith):
  - `synapse-platform-svc` — auth · audit · billing · notification (트랙 A)
  - `synapse-engagement-svc` — community · gamification (트랙 B)
  - `synapse-knowledge-svc` — note · graph · chunking (트랙 C, 2명)
  - `synapse-learning-svc` — card·srs (Java) + ai (Python/FastAPI) 두 컨테이너 (트랙 D, 2명)
- **Gateway**: Spring Cloud Gateway 5 — CORS → Rate Limiter(Redis) → JWT 검증 → Tenant Resolver(X-Tenant-Id 주입) → Request Logger → Circuit Breaker.
- **멀티테넌시 3단계**: L1 Gateway(JWT→tenant_id) / L2 Application(Repository WHERE 강제) / L3 DB(PostgreSQL RLS).
- **이벤트 기반**: Kafka + CloudEvents 스키마, Avro(`synapse-shared`) + Confluent Schema Registry(BACKWARD). 대표 흐름 `note.created` → learning-ai 청킹·임베딩(pgvector) + knowledge-svc ES 인덱싱(nori).
- **프론트엔드**: Flutter 3.x (Web/iOS/Android), 4계층 UI→Riverpod→Repository→DataSource.
- **데이터**: PostgreSQL 16 + pgvector, Redis 7, Elasticsearch 8 + nori, Kafka 3.x, AWS S3.
- **배포**: AWS EKS + ArgoCD GitOps(ApplicationSet matrix, 5 svc × 3 env), dev autoSync / staging·prod 수동.
- **관측성**: Prometheus + Grafana, Fluent Bit→CloudWatch, OpenTelemetry→Jaeger, Sentry.

> 구현 시 각 섹션 작성 전에 해당 원본 문서(아키텍처 정의서, 04 API 명세, 02 ERD, 트랙 가이드 등)를 정독해 사실을 재확인한다.

---

## 5. 콘텐츠 구조 (9개 섹션)

각 섹션 = **서사 본문 + "MSA 처음이면" 개념 박스 + 원본 문서 링크(다음 읽을거리)**. 다이어그램은 Mermaid로 작성.

| # | 섹션 | 핵심 내용 | 주요 다이어그램 |
|---|------|-----------|----------------|
| 1 | SYNAPSE란? | Obsidian+Anki+RAG 한 줄 정의, 누가 왜 쓰나, 핵심 기능 5축(노트·지식그래프 / 학습·SRS / AI·RAG / 커뮤니티·게이미피케이션 / 플랫폼) | 기능 맵 |
| 2 | MSA 입문 + 큰 그림 | 전체 아키텍처 1장(Edge→Client→Gateway→4서비스→Data), 모놀리식 vs MSA, *왜 10→4 통합(ADR-001 콘웨이 법칙·운영비 30%↓)* | 전체 아키텍처 graph |
| 3 | 4개 서비스 소개 | platform / engagement / knowledge / learning(Java+Python)의 책임·모듈·오너 트랙·스택 | 서비스-모듈 매트릭스 |
| 4 | 요청 하나가 흐르는 길 (동기) | CF→Gateway 필터체인(JWT·tenant·rate limit)→Service→DB, 멀티테넌시 3단계 격리(L1/L2/L3) | Gateway 필터체인 + 테넌시 흐름 |
| 5 | 이벤트가 흐르는 길 (비동기) | 왜 Kafka?(서비스 간 느슨한 결합), `note.created`→AI 청킹·임베딩 + ES 인덱싱 시퀀스, CloudEvents/Avro/Schema Registry | Kafka 토픽 흐름 + 시퀀스 |
| 6 | 핵심 유저 플로우 E2E | ① 노트 작성→검색가능 ② AI 자동 카드 생성→SRS 복습 ③ RAG Q&A — 각 시나리오가 횡단하는 서비스·이벤트 | 시나리오별 시퀀스 |
| 7 | 프론트엔드 연결 | Flutter 4계층(UI·Riverpod·Repository·DataSource)이 Gateway로 붙는 법 | 클라이언트 레이어 graph |
| 8 | 데이터·배포·관측성 | PG/Redis/ES/Kafka/S3 용도, EKS+ArgoCD GitOps, Prometheus/Grafana/OTel | 배포 파이프라인 graph |
| 9 | 그래서 어디서 시작하죠? | 트랙별 진입점 + common-day1·트랙 가이드·18개 위키로 가는 "다음 읽을거리" 지도 | 문서 지도 |

---

## 6. 빌드·렌더 파이프라인

### 마크다운 → JSON

`build_docs.mjs`(각색): `content/*.md`를 수집 → frontmatter 파싱, TOC 추출, 검색 인덱스 생성, 카테고리별 JSON + `index.json` + `search-index.json`을 `assets/docs/`에 출력. AI 요약은 비활성화.

### Mermaid 렌더링 (클라이언트 위젯 방식)

Flutter 포털에 **클라이언트 Mermaid 렌더링 위젯**을 추가한다. 콘텐츠는 마크다운 안에 ```` ```mermaid ```` 코드블록으로 작성하고, `markdown_viewer`가 이 블록을 감지해 전용 위젯으로 렌더한다.

- **Flutter Web 구현 방식**: `web/index.html`에 mermaid.js(CDN/번들)를 로드하고, `HtmlElementView` + `dart:js_interop`으로 `<div class="mermaid">`에 다이어그램 텍스트를 주입해 `mermaid.render()`를 호출한다. (Flutter Web의 platform view 등록은 `dart:ui_web`의 `platformViewRegistry` 사용.)
- **구현 리스크**(스펙에 명시): ① 플랫폼 뷰 + JS interop은 코드량과 타이밍(렌더 후 높이 측정) 이슈가 있다. ② 본 포털은 **웹 전용**이므로 모바일 대응은 범위 밖. ③ mermaid.js 버전 고정 필요. 구현 단계에서 작은 PoC로 위젯 하나를 먼저 검증한 뒤 전 섹션에 적용한다.

---

## 7. 배포

`deploy-pages.yml`(각색):

1. `synapse-onboarding` 체크아웃 (sibling 체크아웃 단계 제거)
2. Node 설치 → `cd site/scripts && npm ci && NO_AI=1 node build_docs.mjs`
3. Flutter 설치 → `flutter pub get` → `flutter build web --release --base-href /synapse-onboarding/`
4. `actions/upload-pages-artifact` → `actions/deploy-pages`

main 푸시 시 자동 배포. 실제 GitHub push·Pages 활성화는 사용자가 수행한다.

---

## 8. 범위 경계 / 가정 / 검증

### 범위 안
- 신규 레포 `synapse-onboarding` 생성, 포털 포크·각색, 9개 섹션 콘텐츠 작성, Mermaid 위젯 추가, 배포 워크플로 작성, 로컬 구동 검증.

### 범위 밖 (Non-goals)
- 세부 스펙(API/ERD/env) 재작성 — 링크만.
- 모바일(iOS/Android) 대응 — 웹 전용.
- 기존 18개 위키·트랙 가이드 수정.
- 실제 GitHub push 및 Pages 활성화(사용자 트리거).

### 가정
- 워크스페이스 루트는 git 레포가 아니다. 신규 레포는 자체 git으로 초기화한다.
- Flutter SDK(≥3.11)·Node 20이 로컬에 설치돼 있다(없으면 설치 안내).
- 콘텐츠 사실은 `documents.wiki` v2.x 문서를 단일 출처로 삼는다.

### 검증 기준 (완료 정의)
- [ ] `cd site/scripts && NO_AI=1 node build_docs.mjs` 성공, `assets/docs/`에 9개 문서 JSON + 인덱스 생성.
- [ ] `flutter run -d chrome` 또는 `flutter build web` 성공.
- [ ] 9개 섹션이 좌측 사이드바·TOC·검색에 노출되고 본문 렌더.
- [ ] 각 섹션의 Mermaid 다이어그램이 텍스트가 아닌 그래픽으로 표시.
- [ ] 모든 "다음 읽을거리" 링크가 올바른 원본 문서/위키를 가리킴.

---

## 9. 향후 (Out of scope, 참고)
- 영문 번역본.
- 트랙별 심화 페이지(현 트랙 가이드와 연계).
- 콘텐츠 변경 시 자동 링크 검증 CI.
