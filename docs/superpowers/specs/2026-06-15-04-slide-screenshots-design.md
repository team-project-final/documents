# 설계 스펙 — 04 수행경과 슬라이드에 앱 스크린샷 추가

> 작성일: 2026-06-15 · 대상: `documents/docs/final-deliverables/report-deck.html`
> 캡처 소스: 로컬 minikube SYNAPSE 앱(게이트웨이 `http://localhost:8080`)

## 1. 목표

발표 덱 04 "프로젝트 수행 경과"의 담당자별 기능 슬라이드 **①~⑥**에, 로컬에서 실제로
구동되는 SYNAPSE 앱 화면을 **회원가입/로그인 후 캡처**해 각 슬라이드에 추가한다.
레이아웃은 **좌측 기존 불릿 + 우측 16:9 스크린샷(2단)**.

## 2. 비목표

- **⑦ 백본(Gateway·인프라)** — 스크린샷 만들기 어려운 환경이라 **제외**(요청).
- 오버뷰(사용자 시나리오 한 바퀴)·⑧ 시연 영상 — 대응되는 단일 앱 화면이 없어 스크린샷 없음.
- learning-svc 등 서비스 레포 코드 수정(범위 외 — 메모리 repo-edit-scope-policy).
- 덱의 텍스트 내용 변경(불릿은 그대로, 레이아웃만 2단화).

## 3. 현황·제약 (2026-06-15 점검)

- `minikube` Running. 파드 대부분 정상: frontend·gateway·platform-svc·knowledge-svc·
  learning-card·engagement-svc·ES·Kafka·postgres·redis·schema-registry.
- **`learning-ai` CrashLoopBackOff** — 원인은 `prometheus_fastapi_instrumentator`
  버그(`AttributeError: '_IncludedRouter' object has no attribute 'path'`, 요청 시 터짐
  → 프로브 실패 → 재시작). learning-svc 코드 수정 필요 = 범위 외 → **8090에 mock 스텁**으로 대체.
- 프런트는 **Flutter 웹(캔버스 렌더링)** → DOM mock 주입 불가. mock은 **API 레벨(스텁/시드)** 로.
- 프런트 API 배선(DEMO_SCENARIO §2.3): platform·knowledge는 게이트웨이(8080) 경유,
  **learning-card(8084)·learning-ai(8090)는 localhost 직결**. learning은 고정 dev 헤더 유저
  (`X-User-Id: 00000000-…-001`) 기준 데이터.
- **content.json은 앞서 정리로 삭제됨** → 삽입은 배포 `report-deck.html` **직접 패치**.

## 4. 슬라이드 → 화면 매핑 (1슬라이드 1스크린샷)

| 슬라이드(덱 idx) | 캡처 화면 | 데이터 출처 | 확보 방식 |
|---|---|---|---|
| ① 진입·계정 (14) | 로그인 → 대시보드 | platform-svc | 실 회원가입/로그인 |
| ② 노트·지식그래프 (15) | 노트 상세(마크다운·위키링크) | knowledge-svc | API 시드(§3.3) — 빈 화면이면 시드 후 |
| ③ AI 카드 생성 (16) | AI 카드 생성(SSE 스트리밍) | **8090 스텁** | 스텁이 카드 스트리밍 응답 |
| ④ SRS 복습 (17) | 복습 세션(카드 앞/뒤 + 4버튼) | learning-card | SQL 시드(§3.4, due<=now) |
| ⑤ 보상·커뮤니티 (18) | 게이미피케이션(XP·레벨·배지) | engagement-svc | 시드/현행(mock 허용) |
| ⑥ 검색·재발견 (19) | 키워드 검색 결과(+AI튜터 스텁) | knowledge ES | 노트 시드 후 검색; AI튜터는 프런트 직결 시 스텁 |

> 괄호 (N)은 content.json 0-기반 순서(참고용). content.json은 삭제됐으므로 패치는 각 슬라이드의
> **H2 텍스트를 앵커**로 한다(report-deck.html의 slide-id는 +1 — 예: ① = `slide-15`).
> 화면 선택은 실행 시 조정 가능(②=그래프 뷰 대안, ⑤=커뮤니티 대안). 각 슬라이드 1장 기준,
> ①은 로그인+대시보드 2장 중 대표 1장(대시보드 권장 — 통합 메뉴가 보임).

## 5. 캡처 절차

### 5.1 환경 기동
- 포트포워드 3개 보장: `gateway 8080`, `learning-card 8084`, **`8090`(스텁)**.
- 실 learning-ai 파드는 크래시(범위 외) → **로컬 stub 서버를 8090에 기동**:
  - AI 카드 생성: 프런트가 호출하는 SSE/HTTP 엔드포인트를 **실행 시 dio 네트워크 호출로 확인** 후,
    캔 응답(플래시카드 앞/뒤 3~5장)을 스트리밍/반환.
  - AI 튜터(프런트 직결이면): 질문에 캔 답변 SSE.
  - 스텁은 단일 파일(Node/Python)로 작성, CORS 허용.
- 촬영용 프런트는 **바이패스 OFF(실 로그인)**, `dev` 빌드(게이트웨이 경유).

### 5.2 계정·시드
- 데모 계정 `ssar@nate.com` / `Ssar1234!`(없으면 신규 가입). 로그인해 JWT 확보.
- 시드(DEMO_SCENARIO §3, 빈 화면 방지):
  - 노트(§3.3 API): 머신러닝 기초·경사하강법·알고리즘 등 3~4개(②·⑥용).
  - 덱·카드(§3.4 SQL): '머신러닝 복습 덱' + due 카드(④용).
  - 결제 PRO·알림(§3.1·3.2): ① 부가 확인용(필요 시).
  - 커뮤니티(§3.5): ⑤ 커뮤니티 화면 쓸 경우.
- **데이터 미출력 시**: 시드 재실행 또는 스텁 응답으로 화면을 채운 뒤 캡처(요청: 임의 mock 허용).

### 5.3 캡처 (Playwright)
- 게이트웨이 same-origin URL로 접속(`http://localhost:8080/`).
- 각 화면으로 네비게이트(사이드바: 노트·복습·그래프·검색·AI 카드·설정 등).
- 16:9 뷰포트(예 1280×720)로 화면 캡처 → `documents/docs/final-deliverables/screenshots/04-<n>-<name>.png`.
- 총 6장(①~⑥).

## 6. 삽입 · 레이아웃

- 각 슬라이드(idx 14~19)의 `<ul>…</ul>` 를 아래로 교체:
  ```html
  <div class='two-columns'><div><ul>…기존 불릿…</ul></div>
  <div><img class='slide-shot' src='data:image/png;base64,…' alt='…'/></div></div>
  ```
- **이미지: base64 임베드**(자기완결 단일 HTML 유지). PNG 원본은 `screenshots/`에도 보관.
- 프레임: `.slide-shot` = `max-width:100%; border:1px solid rgba(var(--line-rgb),0.22);
  border-radius:4px;`(DESIGN.md 헤어라인 준수). 필요 시 `styles.css`에 규칙 추가(배포 HTML에도 반영).
- content.json 없음 → **배포 `report-deck.html` Node 패치**(슬라이드별 고유 앵커로 `<ul>` 교체,
  CRLF 자동 감지 — touch-action 패치와 동일 방식).

## 7. 검증 · 배포

- **460px 오버플로 검증**: `capture_slides.mjs --verify-only`(Deck Doctor) READY.
  2단+이미지가 넘치면 이미지 폭/불릿 축약으로 조정.
- Playwright로 ①~⑥ 슬라이드 육안 확인(이미지 표시, 잘림 없음).
- `documents` 레포 commit(`docs(final-deliverables): 04 슬라이드 앱 스크린샷 추가`) → **PR → main 머지**.
- 스킬 변경이 있으면(`styles.css`의 `.slide-shot`) `develop-study-documents`에도 커밋.

## 8. 인수 기준

- [ ] ①~⑥ 6개 슬라이드가 좌 불릿 / 우 스크린샷 2단으로 렌더된다.
- [ ] 각 스크린샷이 해당 슬라이드 기능과 일치한다(① 로그인·계정, ② 노트, ③ AI 카드, ④ 복습, ⑤ 보상, ⑥ 검색).
- [ ] Deck Doctor READY(오버플로 0), 34장 유지.
- [ ] ⑦ 백본·오버뷰·⑧ 영상은 스크린샷 없음(불변).
- [ ] PR이 main에 머지되고 origin/main report-deck.html에 이미지가 포함된다.

## 9. 리스크

- learning-ai 스텁: 프런트의 정확한 SSE/엔드포인트 형태를 실행 시 확인해야 함(네트워크 탭). 형태 불명확 시 ③은 "생성된 카드 덱" 대안 화면으로 폴백.
- ⑥ 의미검색은 knowledge→learning-ai 내부 위임이라 localhost 스텁 미적용 → 키워드 검색으로 캡처(AI튜터만 프런트 직결 시 스텁).
- base64로 HTML이 ~1MB+ 증가(허용 범위, 자기완결 우선).
- Flutter 캔버스라 캡처는 페이지 렌더 완료 대기 필요(로딩 스피너 회피).
