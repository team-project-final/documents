# 04 슬라이드 앱 스크린샷 추가 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. 이 작업은 라이브 minikube 앱·Flutter 웹 내부·런타임 디스커버리에 의존하므로 **인라인 실행**이 적합하다(서브에이전트 부적합). Steps use checkbox (`- [ ]`).

**Goal:** 로컬 SYNAPSE 앱(localhost:8080)에 로그인 후 04 ①~⑥ 슬라이드에 맞는 화면을 캡처해 `report-deck.html`에 좌불릿/우스크린샷 2단으로 삽입하고 PR→main 머지한다. ⑦ 백본 제외.

**Architecture:** Flutter 웹은 캔버스 렌더라 클릭-셀렉터가 안 되므로 **URL(go_router) 네비 + API 로그인 토큰 주입**으로 화면을 띄운다. learning-ai 파드는 크래시 → **8090에 mock 스텁** 기동(③ AI카드·AI튜터). 캡처는 Playwright MCP, 삽입은 `report-deck.html`의 슬라이드별 H2 앵커 정규식으로 `<ul>`을 2단+base64 이미지로 감싼다(content.json 부재).

**Tech Stack:** minikube/kubectl · Node(스텁·패치 스크립트) · Playwright MCP(브라우저) · 번들 덱 엔진(build_deck/capture_slides) · git/gh.

---

## 전제 / 환경

- 작업 디렉터리 `C:\workspace\team-project-final`는 git 레포 아님. 덱은 `documents`(git) 레포의 `docs/final-deliverables/report-deck.html`.
- 스펙: `documents/docs/superpowers/specs/2026-06-15-04-slide-screenshots-design.md`.
- `<skill>` = `C:\workspace\dsd\.claude\skills\team-project-report-presentation`.
- DEMO_SCENARIO(시드·환경): `documents/docs/final-deliverables/DEMO_SCENARIO.md`.
- **런타임 디스커버리 원칙**: Flutter 라우트·스토리지 키·learning-ai API 형태는 미확정 → 각 Task에 "관찰→적용" 단계와 폴백을 둔다. 관찰은 Playwright 네트워크/스토리지로 한다.

## 파일 구조

| 파일 | 책임 |
|---|---|
| `C:/workspace/team-project-final/_stub_learning_ai.cjs` | 8090 mock 스텁(임시, 작업 후 보존/정리 선택) |
| `documents/docs/final-deliverables/screenshots/04-<n>-<name>.png` | 캡처 6장(①~⑥) |
| `C:/workspace/team-project-final/_insert_04_shots.cjs` | report-deck.html 2단+base64 삽입(임시) |
| `documents/docs/final-deliverables/report-deck.html` | 수정 대상(슬라이드 ①~⑥) |

---

## Task 1: 환경·포트포워드 보장

**Files:** (없음 — 점검만)

- [ ] **Step 1: 파드 상태 확인**

Run:
```bash
kubectl get pods -n synapse-local 2>&1 | grep -E "frontend|gateway|platform|knowledge|learning-card|engagement|postgres|elasticsearch"
```
Expected: 위 파드들 `Running`. (learning-ai는 CrashLoop여도 무방 — 스텁으로 대체.)

- [ ] **Step 2: 포트포워드 확인/기동 (8080 게이트웨이, 8084 learning-card)**

Run:
```bash
curl -s -m 3 -o /dev/null -w "8080:%{http_code}\n" http://localhost:8080/; curl -s -m 3 -o /dev/null -w "8084:%{http_code}\n" http://localhost:8084/
```
Expected: `8080:200`, `8084:401`(헤더 필요). 8080이 200이 아니면 포트포워드 기동:
```bash
kubectl -n synapse-local port-forward svc/gateway 8080:80 &
kubectl -n synapse-local port-forward svc/learning-card 8084:80 &
```
(8090은 실 파드 대신 Task 3 스텁이 점유한다 — 실 learning-ai 포트포워드는 띄우지 않는다.)

---

## Task 2: API 로그인 토큰 확보 + 라우트/스토리지 디스커버리

Flutter 폼 자동입력은 불안정 → **platform 로그인 API로 JWT를 받아** 앱 스토리지에 주입한다.

**Files:** (없음)

- [ ] **Step 1: 데모 계정 로그인 시도(없으면 가입)**

Run(로그인):
```bash
curl -s -m 8 -X POST http://localhost:8080/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"ssar@nate.com","password":"Ssar1234!"}' | head -c 400; echo
```
응답에 `accessToken`이 있으면 그대로 사용. 401/없음이면 가입 후 재로그인:
```bash
curl -s -m 8 -X POST http://localhost:8080/api/v1/auth/signup -H 'Content-Type: application/json' -d '{"email":"ssar@nate.com","password":"Ssar1234!","name":"ssar"}' | head -c 300; echo
```
Expected: `accessToken`(JWT) 확보. (엔드포인트 경로가 다르면 `/api/v1/auth/*` 하위를 `curl` 탐색.)

- [ ] **Step 2: 앱 로드 + 스토리지 키 관찰 (Playwright)**

브라우저로 `http://localhost:8080/` 열고, 개발 바이패스로 한 번 진입했다 나오거나 로그인 폼 로드 상태에서 `browser_evaluate`로 스토리지 키를 관찰:
```js
() => ({ ls: Object.keys(localStorage), lsDump: Object.fromEntries(Object.entries(localStorage).map(([k,v])=>[k, String(v).slice(0,40)])) })
```
Expected: 토큰을 보관하는 키 발견(예 `accessToken`/`flutter.token`/`auth_*`). 못 찾으면 폼으로 1회 로그인해 키를 역추적.

- [ ] **Step 3: 토큰 주입 후 로그인 상태 진입**

`browser_evaluate`로 Step1의 JWT를 Step2에서 찾은 키에 주입 후 reload:
```js
(token) => { localStorage.setItem('<발견한_키>', token); location.reload(); }
```
(주입이 안 먹으면 폴백: Flutter 로그인 폼의 hidden input(`flt-text-editing`/`input`)에 focus→type, 버튼은 좌표 클릭.)
Expected: 대시보드 진입(통합 메뉴 보임).

- [ ] **Step 4: go_router 경로 확보**

`browser_evaluate`로 현재 라우트/이동 테스트:
```js
() => location.pathname + location.hash
```
사이드바 항목별 URL을 1개씩 직접 이동하며 확인(`/notes`,`/review`,`/graph`,`/search`,`/ai-cards`,`/community`,`/settings` 등 — 실제 경로는 관찰로 확정). 각 이동 후 화면이 렌더되면 그 경로를 기록.
Expected: ①~⑥ 화면 경로 목록 확정.

---

## Task 3: learning-ai 스텁(8090) 작성·기동

**Files:**
- Create: `C:/workspace/team-project-final/_stub_learning_ai.cjs`

- [ ] **Step 1: 로깅 캐치올 + SSE 기본 응답 스텁 작성**

```js
// 8090 mock learning-ai — 모든 요청 로깅 + 카드생성/튜터 SSE 기본 응답, CORS 허용.
const http = require('http');
const CARDS = [
  { front: '지도학습이란?', back: '정답(레이블)이 있는 데이터로 학습하는 방식.' },
  { front: '경사하강법의 목적은?', back: '손실을 줄이는 방향으로 파라미터를 갱신.' },
  { front: '과적합(overfitting)이란?', back: '학습 데이터에 과하게 맞춰 일반화가 떨어지는 현상.' },
];
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','*');}
const server = http.createServer((req,res)=>{
  let body='';req.on('data',c=>body+=c);req.on('end',()=>{
    console.log('[stub]',req.method,req.url,body.slice(0,200));
    cors(res);
    if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
    const u=req.url||'';
    // 카드 생성/튜터: SSE 스트리밍 흉내
    if(u.includes('generate')||u.includes('card')||u.includes('tutor')||u.includes('chat')||u.includes('rag')||u.includes('stream')){
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
      let i=0;const t=setInterval(()=>{
        if(i<CARDS.length){res.write('data: '+JSON.stringify(CARDS[i])+'\n\n');i++;}
        else{res.write('data: [DONE]\n\n');clearInterval(t);res.end();}
      },350);
      return;
    }
    // 그 외(검색/임베딩 등): JSON 기본
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({results:CARDS.map((c,i)=>({id:i+1,title:c.front,snippet:c.back,score:0.9-i*0.1})), cards:CARDS}));
  });
});
server.listen(8090,()=>console.log('stub learning-ai on :8090'));
```

- [ ] **Step 2: 스텁 기동(백그라운드) + 헬스 확인**

Run: `node "C:/workspace/team-project-final/_stub_learning_ai.cjs"` (run_in_background)
Then: `curl -s -m 3 -X POST http://localhost:8090/ai/cards/generate -d '{}' | head -c 120; echo`
Expected: SSE `data: {...}` 또는 JSON 응답. 8090 점유 확인.

- [ ] **Step 3: 프런트 실호출 형태 관찰 후 스텁 보정**

③ AI 카드 화면을 띄워(Task 5에서) 프런트가 8090에 실제 호출하는 경로·payload를 스텁 콘솔 로그(`[stub] ...`)로 확인. 응답 형태(SSE event 명/JSON 키)가 프런트 기대와 다르면 Step1 `CARDS`/응답 구조를 그에 맞게 수정 후 스텁 재기동. (폴백: 형태 못 맞추면 ③은 learning-card에 시드한 "카드 덱" 화면으로 대체.)

---

## Task 4: 시드 데이터 (빈 화면 방지)

**Files:** (없음 — API/SQL 시드)

- [ ] **Step 1: 노트 시드(②·⑥용, API)**

Task2의 JWT로 노트 3개 생성(DEMO_SCENARIO §3.3):
```bash
TOKEN='<accessToken>'
for n in "머신러닝 기초::# 머신러닝 기초\n\n지도학습과 비지도학습. [[경사하강법]]으로 최적화.::머신러닝,기초" \
         "경사하강법::# 경사하강법\n\n손실을 줄이는 방향으로 파라미터 갱신.::머신러닝,최적화" \
         "알고리즘 정리::# 알고리즘\n\n정렬·탐색·DP. [[머신러닝 기초]] 연결.::알고리즘"; do
  t="${n%%::*}";r="${n#*::}";b="${r%%::*}";g="${r##*::}"
  curl -s -X POST http://localhost:8080/api/v1/notes -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    -d "{\"title\":\"$t\",\"contentMd\":\"$b\",\"tags\":[\"${g//,/\",\"}\"]}" -o /dev/null -w "note:%{http_code}\n"
done
```
Expected: `note:200/201` ×3. (경로 다르면 `/api/v1/notes` 확인.)

- [ ] **Step 2: 덱·카드 시드(④용, SQL)**

DEMO_SCENARIO §3.4 SQL을 learning DB에 실행(고정 dev 유저 `00000000-…-001`, due<=now 카드 포함):
```bash
kubectl -n synapse-local exec deploy/postgres -- psql -U synapse -d synapse -c "<§3.4 INSERT card_decks + cards>"
```
Expected: 덱 1 + due 카드 2~3장. (`/reviews/queue`가 카드를 반환하면 OK.)

- [ ] **Step 3: (선택) 결제·알림·커뮤니티 시드**

①(부가)·⑤(커뮤니티) 화면을 쓸 경우만 DEMO_SCENARIO §3.1/§3.2/§3.5 시드. 아니면 생략. **빈 화면이면 시드 재실행 또는 스텁/임의 데이터로 채운다.**

---

## Task 5: ①~⑥ 화면 캡처 (Playwright)

각 화면을 URL로 이동 → 렌더 완료 대기 → 16:9 캡처. 뷰포트 1280×720.

**Files:**
- Create: `documents/docs/final-deliverables/screenshots/04-1-login.png` … `04-6-search.png`

- [ ] **Step 1: 캡처 공통 절차**

각 슬라이드마다: (a) `browser_navigate` 또는 `browser_evaluate`로 해당 경로 이동, (b) 로딩 스피너 사라질 때까지 대기(`browser_evaluate`로 DOM/캔버스 안정 확인 또는 1.5s 대기), (c) `browser_take_screenshot { type:'png', filename:'04-<n>-<name>.png' }`. 저장 후 `Read`로 육안 확인(빈/에러 화면이면 시드·스텁 보정 후 재캡처).

- [ ] **Step 2: ① 진입·계정 → `04-1-account.png`**

로그인 직후 **대시보드**(통합 메뉴 보이는 홈)로 이동해 캡처. Expected: 위젯/사이드바 보이는 화면.

- [ ] **Step 3: ② 노트 → `04-2-notes.png`**

노트 경로로 이동 → 시드한 노트 상세(마크다운·위키링크) 캡처. Expected: 노트 본문 표시.

- [ ] **Step 4: ③ AI 카드 → `04-3-ai-card.png`** (스텁 의존)

AI 카드 화면 이동 → "이 내용으로 카드 만들어줘" 트리거(또는 화면 진입 시 자동 호출) → 스텁 SSE로 카드가 스트리밍/표시되면 캡처. Expected: 생성된 플래시카드 표시. (안 되면 Task3 Step3 보정 또는 카드 덱 화면 폴백.)

- [ ] **Step 5: ④ 복습 → `04-4-review.png`**

복습 경로 이동 → 시드 덱 '복습 시작' → 카드 앞면+난이도 버튼 화면 캡처. Expected: 카드+4버튼.

- [ ] **Step 6: ⑤ 보상 → `04-5-gamification.png`**

게이미피케이션(XP·레벨·배지) 화면 캡처(없으면 커뮤니티). Expected: XP/배지 또는 커뮤니티 목록.

- [ ] **Step 7: ⑥ 검색 → `04-6-search.png`**

검색 화면 이동 → 키워드(예 "머신러닝") 검색 → 결과 캡처. Expected: 검색 결과 목록. (AI튜터가 프런트 직결이면 스텁 답변 컷도 가능.)

- [ ] **Step 8: 6장 존재·크기 확인**

Run: `ls -la "C:/workspace/team-project-final/documents/docs/final-deliverables/screenshots/"04-*.png 2>&1; echo "count: $(ls "C:/workspace/team-project-final/documents/docs/final-deliverables/screenshots/"04-*.png 2>/dev/null | wc -l)"`
Expected: 6개, 각 >20KB(빈 화면 아님).

---

## Task 6: report-deck.html 2단+이미지 삽입

**Files:**
- Create: `C:/workspace/team-project-final/_insert_04_shots.cjs`
- Modify: `documents/docs/final-deliverables/report-deck.html`

- [ ] **Step 1: 삽입 스크립트 작성 (H2 앵커로 `<ul>`을 2단+base64로 감쌈)**

```js
const fs=require('fs');
const DECK='C:/workspace/team-project-final/documents/docs/final-deliverables/report-deck.html';
const DIR='C:/workspace/team-project-final/documents/docs/final-deliverables/screenshots/';
let h=fs.readFileSync(DECK,'utf8');
if(h.includes('slide-shot')) throw new Error('이미 삽입됨 — 중단');
const b64=f=>fs.readFileSync(DIR+f).toString('base64');
// [H2 시작 마커, 스크린샷 파일]
const MAP=[
  ['① 진입·계정','04-1-account.png'],
  ['② 노트가 지식이 된다','04-2-notes.png'],
  ['③ 노트가 카드가 된다','04-3-ai-card.png'],
  ['④ 카드로 복습한다','04-4-review.png'],
  ['⑤ 복습이 보상이 된다','04-5-gamification.png'],
  ['⑥ 다시 찾는다','04-6-search.png'],
];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const [marker,png] of MAP){
  const re=new RegExp('(<h2>'+esc(marker)+'[\\s\\S]*?)(<ul>[\\s\\S]*?</ul>)');
  if(!re.test(h)) throw new Error('앵커 미발견: '+marker);
  const img="<div><img class='slide-shot' src='data:image/png;base64,"+b64(png)+"' alt='"+marker+" 화면'/></div>";
  h=h.replace(re,(m,pre,ul)=>pre+"<div class='two-columns'><div>"+ul+"</div>"+img+"</div>");
}
// .slide-shot 프레임 CSS를 인라인 <style>에 추가(없으면)
if(!h.includes('.slide-shot{')){
  h=h.replace('</style>', '.slide-shot{max-width:100%;height:auto;border:1px solid rgba(var(--line-rgb),0.22);border-radius:4px;display:block;}\n</style>');
}
fs.writeFileSync(DECK,h,'utf8');
console.log('삽입 완료: slide-shot='+(h.match(/slide-shot'/g)||[]).length);
```

- [ ] **Step 2: 실행**

Run: `node "C:/workspace/team-project-final/_insert_04_shots.cjs"`
Expected: `삽입 완료: slide-shot=6`. (앵커 미발견 에러 시 marker 텍스트를 report-deck.html의 실제 H2와 대조해 보정.)

---

## Task 7: 검증 (Deck Doctor + 시각)

- [ ] **Step 1: Deck Doctor 460px 검증**

Run:
```bash
node "C:/workspace/dsd/.claude/skills/team-project-report-presentation/scripts/capture_slides.mjs" "C:/workspace/team-project-final/documents/docs/final-deliverables/report-deck.html" "C:/workspace/team-project-final/_caps_chk" --verify-only; echo "exit=$?"
```
Expected: verdict **READY**, exit 0. **BLOCKED**면 해당 슬라이드 이미지 폭을 줄이거나(예 `.slide-shot{max-width:88%}`) 불릿을 축약 후 재실행.

- [ ] **Step 2: 시각 확인 (Playwright)**

로컬 HTTP로 서빙(`py -3.14 -m http.server 8767 --directory ".../final-deliverables"`) → `http://localhost:8767/report-deck.html` 열고 ①~⑥(slide-15~20)로 이동하며 좌불릿/우스크린샷 표시·잘림 없음 확인. 서버·브라우저 정리.

- [ ] **Step 3: 임시 검증 폴더 정리**

Run: `rm -rf "C:/workspace/team-project-final/_caps_chk"`

---

## Task 8: 커밋 + PR + 머지

**Files:** Modify: `report-deck.html` (+ `screenshots/04-*.png` 신규)

- [ ] **Step 1: 변경 스테이징·커밋**

```bash
cd "C:/workspace/team-project-final/documents" && git add docs/final-deliverables/report-deck.html docs/final-deliverables/screenshots/04-*.png && git commit -F - <<'MSG'
docs(final-deliverables): 04 ①~⑥ 슬라이드에 앱 스크린샷 추가

로컬 SYNAPSE 앱 로그인 후 각 기능 화면을 캡처해 좌불릿/우스크린샷 2단으로 삽입(③ AI카드·AI튜터는 8090 스텁). ⑦ 백본·오버뷰·⑧ 영상 제외.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
git push 2>&1 | tail -3
```
Expected: 커밋·푸시 성공(거부 시 `git pull --rebase origin <branch>` 후 재푸시).

- [ ] **Step 2: PR 생성 + main 머지**

```bash
cd "C:/workspace/team-project-final/documents" && gh pr create --base main --title "docs(final-deliverables): 04 슬라이드 앱 스크린샷 추가" --body-file - <<'PRBODY' && gh pr merge --merge
04 ①~⑥ 슬라이드에 로컬 SYNAPSE 앱 화면 스크린샷을 2단(좌 불릿/우 화면)으로 추가. ③ AI카드·AI튜터는 learning-ai 크래시로 8090 mock 스텁 사용. ⑦ 백본 제외.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
PRBODY
```
Expected: PR 생성·MERGED.

- [ ] **Step 3: main 반영 검증**

Run: `cd "C:/workspace/team-project-final/documents" && git fetch origin main -q; echo "slide-shot in main: $(git show origin/main:docs/final-deliverables/report-deck.html | grep -c "slide-shot'")"`
Expected: `6`.

- [ ] **Step 4: 임시 스크립트 정리(선택)**

Run: `rm -f "C:/workspace/team-project-final/_stub_learning_ai.cjs" "C:/workspace/team-project-final/_insert_04_shots.cjs"` (스텁 서버 프로세스도 종료)

---

## Self-Review (작성자 점검)

**1. 스펙 커버리지** — 스펙 §4 매핑=Task5, §5 캡처(환경/스텁/시드/캡처)=Task1~5, §6 삽입(2단·base64·H2앵커 패치)=Task6, §7 검증·배포=Task7~8, §8 인수기준=Task6 Step2·Task7·Task8. §2 비목표(⑦/오버뷰/⑧ 제외)=MAP에서 제외. 누락 없음.

**2. 플레이스홀더 스캔** — TBD/TODO 없음. 런타임 미확정(라우트·스토리지 키·learning-ai API 형태·로그인/노트 엔드포인트)은 **관찰 단계 + 폴백**을 명시(Task2 Step2~4, Task3 Step3, Task4 Step1, Task5). `<accessToken>`·`<발견한_키>`·`<§3.4 INSERT…>`는 디스커버리로 채우는 런타임 값.

**3. 타입/구조 일관성** — 스크린샷 파일명 `04-<n>-<name>.png`가 Task5 생성과 Task6 MAP·Task8 add에서 일치. 삽입 마커(H2 텍스트)는 report-deck.html 실제 H2(① 진입·계정 … ⑥ 다시 찾는다)와 일치. `.slide-shot` 클래스 정의(Task6)와 사용 일치.

**4. 환경 적합성** — Flutter 캔버스 한계(URL 네비·토큰 주입), learning-ai 크래시(스텁), content.json 부재(HTML 패치), CRLF(정규식 `[\s\S]`로 무관)를 반영.

---

## Execution Handoff

이 계획은 라이브 앱·Flutter 내부·런타임 디스커버리에 강하게 의존하므로 **인라인 실행**(`superpowers:executing-plans`)이 적합하다(서브에이전트는 라이브 env·반복 관찰에 부적합). 핵심 게이트: **6장 캡처(Task5 Step8)**, **삽입=6(Task6)**, **Deck Doctor READY(Task7)**, **main 반영=6(Task8)**.
