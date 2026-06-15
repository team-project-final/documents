# report-deck 04 "사용자 여정" 재구성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/report-deck.html`의 04 "프로젝트 수행 경과"를 담당자 나열에서 한 사용자의 학습 여정(노트→AI카드→복습→검색) 흐름으로 재구성하고, 04 마지막 시연 슬라이드를 DEMO_SCENARIO.md 요약(시연 영상 안내)으로 교체한다.

**Architecture:** 소스는 단일 `docs/content.json`(슬라이드 배열). 이를 편집한 뒤 `build_deck.mjs`로 `report-deck.html`을 재생성하고 `capture_slides.mjs --verify-only`(Deck Doctor)로 460px 오버플로를 검증한다. content.json의 04 블록(콘텐츠 6객체)을 9객체로 교체하고 목차·섹션 부제 2줄을 수정하는, **diff가 04에 국한된** 변경이다.

**Tech Stack:** JSON(content) · Node(build_deck.mjs / capture_slides.mjs, Playwright) · 번들 HTML/CSS/JS 프레젠테이션 엔진 · (선택) Python `py -3.14` + python-pptx(PPTX).

---

## 전제 / 환경

- **작업 디렉터리** `C:\workspace\team-project-final` 는 **git 레포가 아니다**(환경 확인). → 각 태스크의 git 커밋은 **생략**하고, Task 1의 `content.json.bak` 백업으로 롤백을 보장한다.
- **소스 단일성**: `docs/content.json` 만 편집한다. `report-deck.html`·`_caps`·`report-deck.pptx`는 **생성물**이다(직접 편집 금지).
- **`<skill>`** = `C:\workspace\dsd\.claude\skills\team-project-report-presentation`
- 명령은 **Bash 도구(Git Bash)** 기준, 절대경로 사용(슬래시 `/`는 Windows Node에서 동작). 경로에 한글/공백 없음.
- **제약**: 슬라이드 콘텐츠 높이 ≤ **460px**. 초과 시 잘림 → Task 6의 폴백 적용.
- 승인 스펙: `docs/superpowers/specs/2026-06-15-report-deck-04-journey-restructure-design.md`

## 파일 구조

| 파일 | 책임 | 변경 |
|---|---|---|
| `docs/content.json` | 덱 소스(슬라이드 배열) | **수정**: `slides[1]`(목차 04줄), `slides[12]`(섹션 부제), `slides[13..18]`(6객체)→9객체 |
| `docs/content.json.bak` | 롤백 백업 | **생성**(Task 1) |
| `docs/report-deck.html` | 발표용 단일 HTML | **재생성**(Task 5) |
| `docs/_caps/` | 검증 리포트(deck-report.html/json) | **생성**(Task 6) |
| `docs/report-deck.pptx` | 제출용 PPTX | **선택 재생성**(Task 7) |

---

## Task 1: 백업 + 베이스라인 확인

**Files:**
- Create: `docs/content.json.bak`
- Read: `docs/content.json`

- [ ] **Step 1: 백업 생성**

Run:
```bash
cp "C:/workspace/team-project-final/docs/content.json" "C:/workspace/team-project-final/docs/content.json.bak"
```

- [ ] **Step 2: 현재 슬라이드 수 확인 (베이스라인 = 31)**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));console.log('slides:',d.slides.length)"
```
Expected: `slides: 31`

- [ ] **Step 3: 04 블록 경계 확인 (13~18이 04-①~04-⑥인지)**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));[12,13,14,15,16,17,18,19].forEach(i=>console.log(i,(d.slides[i].content.match(/<h2>(.*?)<\/h2>|section-no'>(\d+)/)||['','?'])[0].slice(0,40)))"
```
Expected: 12=`section-no'>04`, 13=`04-① platform`, 14=`04-② knowledge`, 15=`04-③ learning`, 16=`04-④ engagement`, 17=`04-⑤ Gateway`, 18=`04-⑥ 시연`, 19=`section-no'>05`.
(불일치하면 인덱스가 달라진 것 — 이후 태스크의 인덱스를 실제값으로 보정한다.)

---

## Task 2: 목차(slides[1]) 04 줄 교체

**Files:**
- Modify: `docs/content.json` (slides[1].content 내 04 `<li>`)

- [ ] **Step 1: Edit — 04 목차 줄 교체**

old_string:
```
<li class='fragment' data-step='4'><strong>04 프로젝트 수행 경과</strong> — 담당자별(platform · knowledge · learning · engagement · Gateway/인프라) → 시연</li>
```
new_string:
```
<li class='fragment' data-step='4'><strong>04 프로젝트 수행 경과</strong> — 사용자 여정 흐름(진입→노트→AI 카드→복습→보상·검색→백본) → 시연 영상</li>
```

- [ ] **Step 2: JSON 유효성 검사**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));console.log('JSON OK')"
```
Expected: `JSON OK`

---

## Task 3: section 04(slides[12]) 부제 교체

**Files:**
- Modify: `docs/content.json` (slides[12].content)

- [ ] **Step 1: Edit — 섹션 부제 교체**

old_string:
```
<div class='section-no'>04</div><h2>프로젝트 수행 경과</h2><p class='subtitle'>담당자별 — platform · knowledge · learning · engagement · Gateway/인프라 → 시연</p>
```
new_string:
```
<div class='section-no'>04</div><h2>프로젝트 수행 경과</h2><p class='subtitle'>한 사용자의 학습 여정으로 보는 수행 경과 — 진입 → 노트 → AI 카드 → 복습 → 보상 → 검색 → 백본 → 시연 영상</p>
```

- [ ] **Step 2: JSON 유효성 검사**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));console.log('JSON OK')"
```
Expected: `JSON OK`

---

## Task 4: 04 콘텐츠 블록(slides[13..18]) → 9개 객체로 교체

기존 6개 슬라이드 객체(`04-① platform` … `04-⑥ 시연`)를 아래 **9개 객체**(오버뷰·①~⑦·⑧)로 교체한다. 순서 = 오버뷰 → ①진입 → ②노트 → ③AI카드 → ④복습 → ⑤보상 → ⑥검색 → ⑦백본 → ⑧영상.

**Files:**
- Modify: `docs/content.json` (slides[13]~slides[18] 6객체 → 9객체)

- [ ] **Step 1: 교체할 옛 블록의 경계 확인**

옛 블록 = `04-① platform`로 시작하는 객체의 여는 `{` 부터, `"cue": "여기서 라이브 시연 또는 영상 전환"` 를 포함하는 `04-⑥ 시연` 객체의 닫는 `},` 까지(연속 6객체). Edit 도구의 old_string은 이 6객체 전체를 **content.json에서 그대로 복사**해 사용한다(현재 파일 텍스트가 정본).

- [ ] **Step 2: Edit — 6객체를 다음 9객체로 교체**

new_string (그대로 삽입; 마지막 객체도 뒤의 05 섹션과 잇도록 `},`로 끝남):
```json
    {
      "content": "<h2>사용자 시나리오 한 바퀴 — 노트가 도는 학습 루프</h2><table><tr><th>단계</th><th>사용자 동작 · 핵심</th><th>이벤트 / 기술</th><th>담당</th></tr><tr><td>① 진입·계정</td><td>가입·로그인·결제·알림</td><td><code>user-registered</code> 발행</td><td>김해준</td></tr><tr><td>② 노트·그래프</td><td>마크다운·위키링크·백링크</td><td><code>note-created</code> · PageRank</td><td>김현지</td></tr><tr><td>③ AI 카드</td><td>노트 → 카드 자동 생성</td><td>소비 → Claude · RAG(SSE)</td><td>김나경</td></tr><tr><td>④ 복습(SRS)</td><td>SM-2 4버튼·세션</td><td><code>review-completed</code> 발행</td><td>조유지</td></tr><tr><td>⑤ 보상·커뮤니티</td><td>XP·레벨·배지·공유</td><td>소비 → <code>level-up</code> · 알림 환류</td><td>한승완</td></tr><tr><td>⑥ 검색·재발견</td><td>의미 검색·AI 튜터</td><td>임베딩 · BM25 × RRF</td><td>박은서</td></tr><tr><td>⑦ 백본</td><td>Gateway·인프라·운영</td><td>Kafka(Outbox) · EKS · SLA</td><td>김민구</td></tr></table><p class='subtitle'>노트 한 장이 카드 → 복습 → 보상 → 검색으로 순환 — 아래 ①~⑦이 그 순서, ⑦ 백본 위에서 전 구간이 돈다.</p>",
      "notes": "04는 담당자 나열이 아니라 한 사용자가 제품을 한 바퀴 도는 흐름으로 봅니다. 노트가 카드가 되고, 복습이 보상과 알림으로 돌아오고, 검색으로 다시 발견되는 순환입니다."
    },
    {
      "content": "<h2>① 진입·계정 — platform · 김해준 (트랙 A)</h2><p class='subtitle'>사용자가 들어오는 관문 — 인증·결제·알림·감사의 기반</p><ul><li><strong>인증·테넌트</strong> — OAuth(Google/GitHub/Apple) + JWT RS256 + MFA(TOTP), tenant self-service·초대·DB 기반 role</li><li><strong>결제(Stripe)</strong> — Free/Pro/Team 구독, 결제 이력·영수증·사용량 조회</li><li><strong>알림</strong> — 인박스 + FCM/SES 발송(<code>notification-send</code> 소비), 미읽음 배지·클릭 라우팅</li><li><strong>감사·관리자</strong> — 전 이벤트 소비 audit log(90일 보존), GDPR 데이터 요청, 시스템 설정·분석 API</li><li><strong>이벤트</strong> — <code>user-registered</code> 발행(Transactional Outbox), 그룹 <code>platform-svc-group</code></li></ul>",
      "notes": "플랫폼 서비스는 인증부터 결제, 알림, 감사까지 — 사용자가 들어오는 관문이자 다른 모든 서비스가 기대는 기반입니다."
    },
    {
      "content": "<h2>② 노트가 지식이 된다 — knowledge · 김현지 (트랙 C-1)</h2><p class='subtitle'>쓴 노트가 링크로 엮여 지식 그래프가 된다</p><ul><li>Markdown 노트 CRUD · 버전 이력·복원 · 태그 (소유자 격리 <code>validateOwner</code>)</li><li>위키링크 파싱 · 백링크 · PageRank 그래프 (<code>GraphQueryPort</code> 포트 패턴)</li><li>Kafka→ES 자동 동기화 (Outbox <code>AFTER_COMMIT</code> · 멱등 Redis TTL 7d · DLQ)</li></ul>",
      "notes": "노트를 작성하면 위키링크로 노트끼리 연결되고, 백링크와 PageRank로 지식 그래프가 만들어집니다. 저장 즉시 Outbox 이벤트로 검색 인덱스에 동기화됩니다."
    },
    {
      "content": "<h2>③ 노트가 카드가 된다 — AI 카드 생성 · learning-ai · 김나경 (트랙 D-2)</h2><p class='subtitle'>노트를 던지면 AI가 플래시카드를 만든다 — 제품의 핵심</p><ul><li>FastAPI 골격 + <strong>LLM 이중화</strong>(Tenacity → OpenAI Fallback)</li><li><strong>Claude 카드 자동 생성</strong> · OpenAI 임베딩 · pgvector 시맨틱 검색 · RAG(SSE)</li><li>소비 <code>note-created</code> → 카드 생성, AiCard Consumer(DLQ·멱등)</li></ul>",
      "notes": "노트 생성 이벤트를 소비해 Claude가 플래시카드를 자동 생성합니다. 장애 대비 OpenAI 폴백과 DLQ·멱등으로 안정성을 확보했습니다."
    },
    {
      "content": "<h2>④ 카드로 복습한다 — SRS · learning-card · 조유지 (트랙 D-1)</h2><p class='subtitle'>만들어진 카드를 간격 반복으로 복습한다</p><ul><li>덱·카드 CRUD, <strong>SM-2 4버튼 복습 스케줄링</strong></li><li>복습 세션·통계 (overview/heatmap/retention)</li><li>발행 <code>review-completed</code>·<code>review-due</code>, Flutter 복습 UI 연동</li></ul>",
      "notes": "생성된 카드는 SM-2 4버튼 평가로 복습하고, 알고리즘이 다음 복습일을 잡습니다. 복습 완료는 이벤트로 발행되어 보상으로 이어집니다."
    },
    {
      "content": "<h2>⑤ 복습이 보상이 된다 — engagement · 한승완 (트랙 B)</h2><p class='subtitle'>복습이 XP·레벨·배지로 환원되고 알림으로 돌아온다</p><ul><li><strong>community</strong> — 그룹 CRUD · 멤버 관리 · 공유(덱/노트)·fork · 검색 · 신고/모더레이션</li><li><strong>gamification</strong> — XP · 레벨 · 배지 · 스트릭 · 리더보드(Redis 캐시 → DB 폴백)</li><li><strong>이벤트</strong> — 소비 <code>user-registered</code>(프로필 생성)·<code>review-completed</code>(XP 적립), 발행 <code>level-up</code>·<code>badge-earned</code>·<code>notification-send</code>, 그룹 <code>engagement-svc-group</code></li><li><strong>검증</strong> — Step 9~11 E2E(복습→XP→레벨업→audit), 멱등성(<code>eventId</code> / <code>cardId+reviewedAt</code>)</li></ul>",
      "notes": "복습 완료 이벤트를 소비해 XP·레벨·배지를 부여하고, 레벨업·배지는 다시 알림으로 환류됩니다. 점수 누적에도 멱등성을 보장합니다."
    },
    {
      "content": "<h2>⑥ 다시 찾는다 — 검색·재발견 · knowledge · 박은서 (트랙 C-2)</h2><p class='subtitle'>쌓인 지식을 의미로 다시 꺼낸다</p><ul><li>비동기 청킹 → OpenAI 임베딩 → <code>note_chunks</code>(pgvector)</li><li>ES BM25(Nori) + <strong>RRF 하이브리드</strong>(시맨틱은 learning-ai 위임) + 키워드 폴백</li><li>Modulith 경계(ArchUnit) · Avro 스키마 · 검색 E2E CI 복구</li></ul>",
      "notes": "노트를 청크로 나눠 임베딩하고, 키워드(BM25)와 의미(임베딩) 검색을 RRF로 융합합니다. 시맨틱 실패 시 키워드 단독으로 폴백해 가용성을 지킵니다."
    },
    {
      "content": "<h2>⑦ 이 모든 걸 떠받친다 — Gateway·인프라·CI/CD · 김민구 (팀장)</h2><p class='subtitle'>①~⑥ 전 여정이 도는 무대 — 게이트웨이·이벤트·운영</p><ul><li><strong>Gateway</strong> — <code>/api/{svc}/**</code> 라우팅(StripPrefix) · JWT 엣지검증+신원 전파 · Redis rate-limit(1rps·burst 60) · CORS · frontend 캐치올</li><li><strong>인프라(IaC)</strong> — EKS·RDS·MSK·ElastiCache·ES Terraform, ArgoCD GitOps(dev/staging/prod), bring-up 멱등 자동화(kafka-topics·db-init·es-reindex)</li><li><strong>공유·표준</strong> — shared Avro 계약·Schema Registry, reusable CI(deploy/mirror/flyway-guard), 토픽 환경 프리픽스(#199)</li><li><strong>운영·SLA</strong> — PR 크로스리뷰, staging <strong>16/16 Healthy · 24h 소크</strong>, SLA 실측 5/7(P1 79.7ms·P4 1.31s·P7 FCM 100%), 장애 추적·복구</li></ul>",
      "notes": "설계로 끝나지 않고 실제 AWS에 dev와 staging 두 환경을 올려 SLA 실측과 24시간 안정화까지 운영을 증명했습니다. 이 백본 위에서 앞의 전 여정이 돕니다."
    },
    {
      "content": "<h2>⑧ 시연 영상 — 한 사용자의 3분 여정</h2><p class='subtitle'>사용자 1인 연속 여정 · 로컬 풀스택(minikube) · 약 3분 — 핵심 루프에 집중</p><table><tr><th>시간</th><th>화면</th></tr><tr><td>0:00</td><td>로그인 — 진입 애니메이션</td></tr><tr><td>0:10</td><td>대시보드 · 통합 메뉴 둘러보기</td></tr><tr><td>0:22</td><td><strong>★ 노트</strong> — 마크다운 · 위키링크</td></tr><tr><td>0:50</td><td><strong>★ AI 카드</strong> — 실시간 스트리밍 생성</td></tr><tr><td>1:25</td><td><strong>★ 복습(SRS)</strong> — 4버튼 · 간격 반복</td></tr><tr><td>1:55</td><td><strong>★ 검색 · AI 튜터</strong> — 의미 기반 답변</td></tr><tr><td>2:20</td><td>부가 — 알림 · 설정 · Pro 결제</td></tr><tr><td>2:45</td><td>클로징</td></tr></table><div class='callout'>핵심 루프(<strong>노트→AI 카드→복습→검색</strong>)에 시간 집중 · <strong>모듈식 Optional 구성</strong> — 고정 코어(로그인·대시보드·클로징)에 준비된 파트만 끼워 3분.</div>",
      "cue": "여기서 시연 영상 재생",
      "notes": "이 영상은 제품 설명이 아니라 한 사용자가 로그인해서 노트·AI 카드·복습·검색까지 실제로 써보는 3분 연속 여정입니다. 핵심 가치 루프에 시간을 몰아주고, 알림·설정·결제 같은 부가 기능은 빠르게 훑습니다."
    },
```

- [ ] **Step 3: JSON 유효성 + 슬라이드 수 = 34**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));console.log('slides:',d.slides.length)"
```
Expected: `slides: 34`

- [ ] **Step 4: 04 순서 스폿체크 (13~21번 H2)**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));d.slides.slice(13,22).forEach((s,i)=>console.log(13+i,((s.content.match(/<h2>(.*?)<\/h2>/)||[])[1]||'').slice(0,32)))"
```
Expected (앞부분):
`13 사용자 시나리오 한 바퀴` / `14 ① 진입·계정` / `15 ② 노트가 지식이 된다` / `16 ③ 노트가 카드가 된다` / `17 ④ 카드로 복습한다` / `18 ⑤ 복습이 보상이 된다` / `19 ⑥ 다시 찾는다` / `20 ⑦ 이 모든 걸 떠받친다` / `21 ⑧ 시연 영상`

---

## Task 5: 웹 프레젠테이션 빌드

**Files:**
- Generate: `docs/report-deck.html`

- [ ] **Step 1: build_deck.mjs 실행**

Run:
```bash
node "C:/workspace/dsd/.claude/skills/team-project-report-presentation/scripts/build_deck.mjs" "C:/workspace/team-project-final/docs/content.json" "C:/workspace/team-project-final/docs/report-deck.html"
```
Expected: 오류 없이 종료(빌더가 슬라이드 수/카운터 자동 일치).

- [ ] **Step 2: 산출 HTML이 34장인지 확인**

Grep 도구: pattern `of 34"` , path `docs/report-deck.html`, output_mode `count`.
Expected: 34건 내외(각 `<section>`의 `aria-label="N of 34"`). 0이면 빌드 실패 — Step 1 재확인.

---

## Task 6: 검증 (Deck Doctor) — 460px 오버플로 차단

**Files:**
- Generate: `docs/_caps/deck-report.html`, `docs/_caps/deck-report.json`

- [ ] **Step 1: (최초 1회) chromium 확보 — 이미 있으면 즉시 통과**

Run:
```bash
cd "C:/workspace/dsd/.claude/skills/team-project-report-presentation" && npx playwright install chromium
```
Expected: 이미 설치돼 있으면 빠르게 통과. (`cd` 권한 프롬프트가 뜨면 승인)

- [ ] **Step 2: verify-only 실행**

Run:
```bash
node "C:/workspace/dsd/.claude/skills/team-project-report-presentation/scripts/capture_slides.mjs" "C:/workspace/team-project-final/docs/report-deck.html" "C:/workspace/team-project-final/docs/_caps" --verify-only
```
Expected: exit 0. 콘솔/리포트 verdict = **READY**.

- [ ] **Step 3: verdict 확인**

Run:
```bash
node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/_caps/deck-report.json','utf8'));console.log('verdict:',j.verdict||j.status||JSON.stringify(j).slice(0,200))"
```
Expected: `verdict: READY`. (`docs/_caps/deck-report.html`을 브라우저로 열어 실패 행을 시각 확인해도 됨.)

- [ ] **Step 4: (BLOCKED일 때만) 460px 폴백 적용 후 재빌드·재검증**

BLOCKED 슬라이드가 오버뷰(14번)면 — slides[13]의 `이벤트 / 기술` 열 삭제(3열화):
old_string:
```
<th>이벤트 / 기술</th><th>담당</th>
```
new_string:
```
<th>담당</th>
```
그리고 같은 슬라이드의 각 행에서 3번째 `<td>...</td>`(예 `<td><code>user-registered</code> 발행</td>`)를 모두 삭제한다.

BLOCKED 슬라이드가 ⑧ 영상(21번)이면 — callout을 한 줄 부제로 축약:
old_string:
```
<div class='callout'>핵심 루프(<strong>노트→AI 카드→복습→검색</strong>)에 시간 집중 · <strong>모듈식 Optional 구성</strong> — 고정 코어(로그인·대시보드·클로징)에 준비된 파트만 끼워 3분.</div>
```
new_string:
```
<p class='subtitle'>핵심 루프(노트→AI 카드→복습→검색)에 시간 집중 · 모듈식 Optional 구성으로 3분 구성.</p>
```
수정 후 Task 5 Step 1 + Task 6 Step 2~3 재실행 → READY 확인.

---

## Task 7 (선택): PPTX 재생성 — 사용자가 PPTX도 원할 때만

**Files:**
- Generate: `docs/report-deck.pptx`

- [ ] **Step 1: 캡처 + 최종 검증**

Run:
```bash
node "C:/workspace/dsd/.claude/skills/team-project-report-presentation/scripts/capture_slides.mjs" "C:/workspace/team-project-final/docs/report-deck.html" "C:/workspace/team-project-final/docs/_caps" --scale 2 --verify
```
Expected: READY, `_caps`에 슬라이드 PNG + `notes.json` 생성.

- [ ] **Step 2: PPTX 생성**

Run:
```bash
py -3.14 "C:/workspace/dsd/.claude/skills/team-project-report-presentation/scripts/deck_to_pptx.py" "C:/workspace/team-project-final/docs/_caps" "C:/workspace/team-project-final/docs/report-deck.pptx" --title "SYNAPSE 결과보고서"
```
Expected: `report-deck.pptx` 생성(verdict blocked면 자동 중단).

---

## Task 8: 최종 인수 점검 (Acceptance)

**Files:**
- Read: `docs/report-deck.html`, `docs/content.json`

- [ ] **Step 1: 7인 전원 단독 슬라이드 존재 확인 (04 H2)**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));const names=['김해준','김현지','김나경','조유지','한승완','박은서','김민구'];const h2=d.slides.slice(13,22).map(s=>(s.content.match(/<h2>(.*?)<\/h2>/)||[])[1]||'').join('\n');names.forEach(n=>console.log(n, h2.includes(n)?'OK':'MISSING'))"
```
Expected: 7명 모두 `OK`.

- [ ] **Step 2: 담당 정합 — 조유지=learning-card(④), 김나경=learning-ai(③)**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));const t=d.slides.map(s=>s.content).join('');console.log('④조유지=card:', /④[^<]*[\s\S]*?learning-card[\s\S]*?조유지/.test(t.replace(/\n/g,'')) || t.includes('learning-card · 조유지'));console.log('③김나경=ai:', t.includes('learning-ai · 김나경'))"
```
Expected: 둘 다 `true`. (간단 확인: ③ H2에 `learning-ai · 김나경`, ④ H2에 `learning-card · 조유지` 포함)

- [ ] **Step 3: ⑧이 시연 영상 요약(라이브 시연표 아님) 확인**

Run:
```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8'));const s=d.slides[21].content;console.log('영상요약:', s.includes('시연 영상')&&s.includes('3분')&&s.includes('모듈식'))"
```
Expected: `영상요약: true`.

- [ ] **Step 4: 미변경 섹션 보존 확인 (백업과 diff가 04+목차에 국한)**

Run:
```bash
node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json.bak','utf8')).slides;const b=JSON.parse(fs.readFileSync('C:/workspace/team-project-final/docs/content.json','utf8')).slides;const same=i=>JSON.stringify(a[i])===JSON.stringify(b[i]);console.log('표지/01/02/03 (0,2~11) 동일:', [0,2,3,4,5,6,7,8,9,10,11].every(same));console.log('목차(1) 변경:', !same(1));console.log('05/06 꼬리 동일:', JSON.stringify(a.slice(19))===JSON.stringify(b.slice(22)))"
```
Expected: `표지/01/02/03 동일: true`, `목차(1) 변경: true`, `05/06 꼬리 동일: true`.

- [ ] **Step 5: 최종 READY 재확인** — Task 6 Step 3가 READY인지 확인(이미 통과했으면 생략).

- [ ] **Step 6: 산출물 안내** — 사용자에게 `docs/report-deck.html`(웹 발표용) 경로와, 검증 리포트 `docs/_caps/deck-report.html`, (생성했다면) `docs/report-deck.pptx` 경로를 알린다. 백업 `docs/content.json.bak`은 문제없으면 삭제 가능함을 안내.

---

## Self-Review (작성자 점검 결과)

**1. 스펙 커버리지** — 스펙 §4.0~§4.10 전 슬라이드가 Task 2(목차)·3(부제)·4(9객체)에 1:1 매핑됨. §5 구현순서=Task 2~7, §6 폴백=Task 6 Step 4, §7 인수기준 8항목=Task 8 Step 1~5 + Task 5 Step 2. 누락 없음.

**2. 플레이스홀더 스캔** — TBD/TODO/"적절히 처리" 없음. 모든 Edit에 old/new 전문, 모든 명령에 기대 출력 명시. 폴백도 구체 old/new 제공.

**3. 타입/구조 일관성** — 슬라이드 객체 키(`content`/`notes`/`cue`)가 기존 content.json 스키마와 일치(⑧만 `cue` 보유, 기존 시연 슬라이드와 동일 패턴). 인덱스 일관: splice(13,6,…9) 후 ⑧=slides[21], 05섹션=slides[22]; Task 8 Step 4의 `b.slice(22)`와 정합. 슬라이드 수 31→34 전 구간 일치.

**4. 환경 적합성** — git 미사용(레포 아님) → 커밋 제거·백업 대체 명시. Windows 경로/슬래시·Bash 명령 일관.

---

## Execution Handoff

이 계획은 코드 빌드가 아니라 **콘텐츠(JSON) 편집 + 결정적 빌드/검증**이라 변경 폭이 작고 순차 의존적이다. 인라인 실행이 적합하다.
실행 시 `superpowers:executing-plans`(체크포인트 일괄 실행) 또는 `superpowers:subagent-driven-development`(태스크별 신규 서브에이전트) 중 선택한다. 핵심 게이트: **Task 4 Step 3(=34장)**, **Task 6(READY)**, **Task 8(인수)**.
