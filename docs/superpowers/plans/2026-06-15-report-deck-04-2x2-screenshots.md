# 04 수행 경과 2x2 스크린샷화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** report-deck.html 04장 ①~⑥ 슬라이드(slide-15~20)의 우측 스크린샷을 1장→2x2(4장)로 확장하고, local-k8s 실기동 화면을 직접 캡처해 base64로 임베드한다.

**Architecture:** minikube로 Synapse 풀스택 기동 → DEMO_SCENARIO §3 레시피로 데모 계정·시드 → 헤드리스 브라우저로 `localhost:8080` 각 화면 캡처 → 파이썬 스크립트로 PNG를 base64 2x2 블록으로 변환해 최종 HTML의 6개 슬라이드 우측 셀을 결정적으로 교체.

**Tech Stack:** minikube/kubectl, Flutter web SPA, PostgreSQL(서비스별 DB 격리), gstack-browse(헤드리스 캡처), Python 3(`py -3.14`, base64 임베드 스크립트), HTML/CSS.

**참조 문서:**
- 스펙: `documents/docs/superpowers/specs/2026-06-15-report-deck-04-2x2-screenshots-design.md`
- 시드 레시피: `documents/docs/final-deliverables/DEMO_SCENARIO.md` §2~§3
- 기동: `synapse-gitops/scripts/minikube-up.sh`, `synapse-gitops/local-k8s/README.md`

**대상 파일:** `documents/docs/final-deliverables/report-deck.html` (slide-15~20), `documents/docs/final-deliverables/screenshots/`

---

## File Structure

- **Create** `documents/docs/final-deliverables/screenshots/raw/` — 캡처 원본 PNG (24장, `04-<n>-<slug>-<a|b|c|d>.png`)
- **Create** `report-presentation/embed_2x2.py` — PNG 4장 → base64 `.shot-2x2` 블록 생성 + 슬라이드 우측 셀 교체 스크립트 (1회용 도구, 레포 외 또는 작업용)
- **Modify** `documents/docs/final-deliverables/report-deck.html` — `.shot-2x2` CSS 1블록 추가 + slide-15~20 우측 셀 6곳 교체
- **Modify** `documents/docs/final-deliverables/screenshots/` — 최종 채택 24장 보관 (raw에서 선별·복사)

작업 브랜치: `docs/report-deck-04-2x2` (이미 생성됨, 스펙 커밋 `98e53ae` 존재).

---

## Task 0: 사전 점검 — 환경·프론트 연동 상태 확인

**Files:** 없음 (조사·검증만)

- [ ] **Step 1: 도구·레포 가용성 확인**

Run:
```bash
which minikube kubectl docker
cd /d/workspace/final-project-syn
for s in gateway platform-svc engagement-svc knowledge-svc learning-svc frontend; do [ -d "synapse-$s" ] && echo "synapse-$s OK" || echo "synapse-$s MISSING"; done
py -3.14 -c "import sys; print(sys.version)"
```
Expected: 세 도구 경로 출력, 6개 레포 모두 OK, Python 3.14 버전 출력.

- [ ] **Step 2: ②노트·⑤커뮤니티 프론트 실연동 여부 확인 (mock 리스크)**

frontend 레포에서 노트·커뮤니티 화면이 실제 API를 호출하는지 mock provider인지 확인한다.

Run:
```bash
cd /d/workspace/final-project-syn/synapse-frontend
git log --oneline -10
```
그리고 노트/커뮤니티 data provider가 mock인지 grep:
```bash
grep -rinE "mock|fake|dummy|sample" lib/ --include=*.dart -l | grep -iE "note|community|group|deck" | head
```
Expected: 결과를 기록. mock이면 §7 폴백(해당 칸은 mock 화면 캡처 또는 칸 수 축소) 적용 대상으로 메모.

- [ ] **Step 3: 결과 기록 (커밋 없음)**

판단: ②/⑤가 실연동이면 4칸 목표 유지, mock이면 "mock 화면이라도 캡처" 또는 "1~3칸" 결정을 메모에 남긴다. 이 Task는 코드 변경이 없으므로 커밋하지 않는다.

---

## Task 1: local-k8s 풀스택 기동

**Files:** 없음 (인프라 기동)

- [ ] **Step 1: minikube 기동 스크립트 실행 (백그라운드, ~20분)**

Run (long-running, run_in_background):
```bash
cd /d/workspace/final-project-syn/synapse-gitops
bash scripts/minikube-up.sh
```
Expected: minikube 기동(8GB/4CPU) → 이미지 6개 빌드·적재 → `kubectl apply -k local-k8s` → 롤아웃 대기. learning-ai는 OpenAI 키 없이 CrashLoop(정상 예상), 나머지는 Running.

- [ ] **Step 2: 파드 상태 확인**

Run:
```bash
kubectl -n synapse-local get pods
```
Expected: 인프라(postgres/redis/zookeeper/kafka/schema-registry/elasticsearch) + 앱(gateway/platform/engagement/knowledge/learning-card/frontend) `1/1 Running`. learning-ai만 `CrashLoopBackOff` 허용.

- [ ] **Step 3: 게이트웨이 헬스 확인**

별도 터미널에서 port-forward 후:
```bash
kubectl -n synapse-local port-forward svc/gateway 8080:80 &
curl -s http://localhost:8080/api/platform/actuator/health
```
Expected: `{"status":"UP"}` (또는 200).

---

## Task 2: 데모 계정 가입 + JWT 확보

**Files:** 없음 (런타임 데이터)

- [ ] **Step 1: 브라우저 바이패스 OFF 확인**

`localhost:8080`에 접속해 실제 로그인 폼이 뜨는지 확인(바이패스 토큰이면 401 발생). Flutter `dev` 빌드 기준.

- [ ] **Step 2: 데모 계정 가입**

브라우저(`http://localhost:8080/`) 또는 API로 `ssar@nate.com` / `Ssar1234!` 가입. 가입 시 tenant 자동 생성·본인 owner.

Run (API 예, 실제 엔드포인트는 platform-svc 회원가입 API 확인):
```bash
curl -s -X POST http://localhost:8080/api/platform/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"ssar@nate.com","password":"Ssar1234!","name":"ssar"}'
```
Expected: 가입 성공(200/201). 이미 있으면 다음 단계로.

- [ ] **Step 3: 로그인해 JWT 확보**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/platform/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ssar@nate.com","password":"Ssar1234!"}' | python -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))")
echo "TOKEN len=${#TOKEN}"
```
Expected: TOKEN 길이 > 0. (응답 키명은 platform-svc 로그인 응답 스키마에 맞춰 조정.)

---

## Task 3: 시드 데이터 주입 (DEMO_SCENARIO §3)

**Files:** 없음 (DB/API 데이터)

- [ ] **Step 1: postgres 파드명·서비스별 DB명 확인**

서비스별 DB가 격리되어 있으므로 DB명을 먼저 확인한다.
```bash
PG=$(kubectl -n synapse-local get pod -l app=postgres -o jsonpath='{.items[0].metadata.name}')
echo "PG=$PG"
kubectl -n synapse-local exec "$PG" -- psql -U synapse -c "\l" | grep -iE "platform|knowledge|learning|engagement|synapse"
```
Expected: platform/knowledge/learning(+engagement) 용 DB명 목록 출력. 이후 단계에서 `-d <db>`에 사용. (DB 생성 정의: `synapse-gitops/local-k8s/infra/postgres-initdb.yaml`.)

- [ ] **Step 2: 결제 시드 (§3.1) — PRO 활성 구독 + 결제 이력**

`DEMO_SCENARIO.md` §3.1(178~215행)의 INSERT(subscriptions, payment_history)를 platform DB에 실행.
```bash
kubectl -n synapse-local exec -i "$PG" -- psql -U synapse -d <platform-db> <<'SQL'
-- DEMO_SCENARIO.md §3.1 내용 붙여넣기 (subscriptions ACTIVE 1건 + payment_history $15×3)
SQL
```
Expected: INSERT 성공. ⚠ 구독은 tenant_id 활성 1건 unique — 재시드 시 기존 구독 먼저 DELETE.

- [ ] **Step 3: 알림 시드 (§3.2) — 안 읽은 알림 N건**

§3.2(217~246행)의 notifications INSERT를 platform DB에 실행(①의 알림 인박스 화면용).
```bash
kubectl -n synapse-local exec -i "$PG" -- psql -U synapse -d <platform-db> <<'SQL'
-- DEMO_SCENARIO.md §3.2 notifications INSERT
SQL
```
Expected: INSERT 성공.

- [ ] **Step 4: 노트 시드 (§3.3) — API 방식**

§3.3(248~268행)은 API 권장. Task 2의 `$TOKEN`으로 게이트웨이 경유 노트 생성(위키링크 포함 2~3개 + 백링크 형성).
```bash
# DEMO_SCENARIO.md §3.3 의 curl 블록을 TOKEN 넣어 실행
```
Expected: 노트 201. ②노트 프론트가 mock이면(Task 0) 화면 반영 안 될 수 있음 — §7 폴백.

- [ ] **Step 5: 덱·카드·복습 시드 (§3.4) — 고정 dev 유저**

§3.4(270~308행)의 card_decks/cards INSERT를 learning DB에 실행. **user_id는 고정 dev 유저 `00000000-...-001`**, 카드 일부 `due_date<=now()`로.
```bash
kubectl -n synapse-local exec -i "$PG" -- psql -U synapse -d <learning-db> <<'SQL'
-- DEMO_SCENARIO.md §3.4 card_decks + cards INSERT (user_id=0000...001, due_date<=now() 포함)
SQL
```
Expected: INSERT 성공. ③·④ 화면(카드 목록·복습 큐)에서 표시될 데이터.

- [ ] **Step 6: 커뮤니티 시드 (§3.5) — engagement (프론트 연동 시)**

Task 0에서 ⑤ 프론트가 실연동이면 §3.5(310~329행) 시드 실행, mock이면 스킵하고 §7 폴백.
```bash
kubectl -n synapse-local exec -i "$PG" -- psql -U synapse -d <engagement-db> <<'SQL'
-- DEMO_SCENARIO.md §3.5 (실연동 시에만)
SQL
```
Expected: 실연동이면 INSERT 성공, 아니면 스킵 기록.

- [ ] **Step 7: learning 직결 port-forward 추가**

③·④ 화면은 프론트가 learning(8084)·ai(8090) 직결 호출. 두 개 추가 기동(별도 터미널 유지).
```bash
kubectl -n synapse-local port-forward svc/learning-card 8084:80 &
# learning-ai는 키 없어 CrashLoop이면 8090 직결 화면은 시드 카드(learning-card) 기준으로 대체
```
Expected: 8084 LISTEN. 8090은 learning-ai 미가동 시 ③를 learning-card 카드 화면으로 대체.

---

## Task 4: 화면 캡처 (①~⑥, 목표 24장)

**Files:** Create `documents/docs/final-deliverables/screenshots/raw/04-*-*.png`

gstack-browse 또는 web-capture로 각 라우트를 캡처. 캡처 해상도 1280×800 권장(임베드 시 CSS 축소). 빈 칸이면 §7대로 칸 수 축소.

- [ ] **Step 1: ① 진입·계정 (platform) 4장**

로그인 / 대시보드 / 알림 인박스 / Pro 결제·구독 화면을 캡처.
```
04-1-account-a.png  로그인
04-1-account-b.png  대시보드
04-1-account-c.png  알림 인박스
04-1-account-d.png  Pro 결제·구독
```
Run 예 (web-capture/gstack-browse 스킬 사용, URL은 SPA 라우트에 맞춤). Expected: raw/에 4 PNG 생성, 빈 화면 아님.

- [ ] **Step 2: ② 노트 (knowledge) 4장**

노트 목록 / 마크다운+위키링크 에디터 / 백링크 패널 / 지식 그래프(2D). 파일 `04-2-note-a~d.png`. Expected: 4 PNG. mock이면 캡처 가능한 칸만.

- [ ] **Step 3: ③ AI카드 (learning, 시드) 4장**

카드 생성 진입 / 카드 목록 / 카드 상세(앞) / 카드 상세(뒤). 파일 `04-3-aicard-a~d.png`. Expected: 4 PNG (learning-card 시드 기반).

- [ ] **Step 4: ④ 복습 (learning-card) 4장**

복습 큐·세션 시작 / 카드 복습 4버튼 / 세션 결과 / 통계(heatmap). 파일 `04-4-review-a~d.png`. Expected: 4 PNG.

- [ ] **Step 5: ⑤ 보상·커뮤니티 (engagement) 4장**

XP·레벨 프로필 / 배지 / 리더보드 / 커뮤니티 그룹·공유덱. 파일 `04-5-reward-a~d.png`. Expected: 4 PNG. mock이면 캡처 가능한 칸만.

- [ ] **Step 6: ⑥ 검색 (knowledge) 4장**

검색 결과(하이브리드) / 의미검색 / AI 튜터 답변 / 필터·재발견. 파일 `04-6-search-a~d.png`. Expected: 4 PNG.

- [ ] **Step 7: 캡처 인벤토리 확정 + 커밋**

각 슬라이드 실제 확보 장수(1~4)를 기록. 채택본을 `screenshots/`로 복사.
```bash
cd /d/workspace/final-project-syn/documents
ls docs/final-deliverables/screenshots/raw/
git add docs/final-deliverables/screenshots/raw/
git commit -m "chore: 04장 2x2용 화면 캡처 원본 추가"
```
Expected: 커밋 성공. (raw 보관 — 최종 임베드와 분리.)

---

## Task 5: `.shot-2x2` CSS 추가

**Files:** Modify `documents/docs/final-deliverables/report-deck.html` (line 858 부근, `.slide-shot` 정의 직후)

- [ ] **Step 1: CSS 블록 추가**

`.slide-shot{...}` 규칙(858행) 바로 뒤에 추가:
```css
.shot-cols .shot-2x2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.shot-2x2 figure{margin:0;}
.shot-2x2 figcaption{font-size:11px;opacity:.7;margin-top:2px;text-align:center;}
```

- [ ] **Step 2: 추가 확인**

Run:
```bash
grep -c "shot-2x2" documents/docs/final-deliverables/report-deck.html
```
Expected: `1` 이상(CSS 블록).

- [ ] **Step 3: 커밋**

```bash
cd /d/workspace/final-project-syn/documents
git add docs/final-deliverables/report-deck.html
git commit -m "style: report-deck .shot-2x2 그리드 CSS 추가"
```

---

## Task 6: 임베드 스크립트 작성 + slide-15~20 교체

**Files:** Create `report-presentation/embed_2x2.py`; Modify `documents/docs/final-deliverables/report-deck.html`

거대한 base64 라인 수작업 편집은 위험하므로 결정적 스크립트로 교체한다.

- [ ] **Step 1: 임베드 스크립트 작성**

`report-presentation/embed_2x2.py` — 슬라이드 id와 PNG 4개(없으면 가변)를 받아, 해당 `<section id="slide-NN">` 안의 `.shot-cols` 우측 셀(`<div><img class="slide-shot" .../></div>`)을 `<div class="shot-2x2">...figure 4개...</div>`로 치환. base64 인라인.
```python
import base64, re, sys, pathlib
HTML = pathlib.Path(r"D:/workspace/final-project-syn/documents/docs/final-deliverables/report-deck.html")
def b64(p):
    return "data:image/png;base64," + base64.b64encode(pathlib.Path(p).read_bytes()).decode()
def figures(items):  # items: list of (path, caption)
    cells = "".join(
        f'<figure><img class="slide-shot" src="{b64(p)}" alt="{cap}"/><figcaption>{cap}</figcaption></figure>'
        for p, cap in items)
    return f'<div class="shot-2x2">{cells}</div>'
def replace_slide(html, slide_id, items):
    # slide 섹션 범위 추출
    start = html.index(f'id="{slide_id}"')
    sec_start = html.rindex("<section", 0, start)
    sec_end = html.index("</section>", start)
    sec = html[sec_start:sec_end]
    # 우측 셀: <div><img class="slide-shot" ...></div>  (단일 img 래퍼)
    new_sec = re.sub(r'<div>\s*<img class="slide-shot"[^>]*>\s*</div>', figures(items), sec, count=1)
    assert new_sec != sec, f"{slide_id}: 우측 셀 치환 실패"
    return html[:sec_start] + new_sec + html[sec_end:]
# 사용: python embed_2x2.py 로 아래 SLIDES 매핑 적용
```
SLIDES 매핑(슬라이드 id ↔ 채택 PNG 목록)을 스크립트 하단에 명시하고, 존재하는 파일만 포함하도록 한다.

- [ ] **Step 2: 단일 슬라이드(slide-15, ①)로 dry-run**

먼저 ① 한 장만 치환해 구조가 깨지지 않는지 검증(백업 후).
```bash
cp documents/docs/final-deliverables/report-deck.html /tmp/report-deck.bak.html
py -3.14 report-presentation/embed_2x2.py --only slide-15
grep -c 'class="shot-2x2"' documents/docs/final-deliverables/report-deck.html
```
Expected: `1` (slide-15만 교체됨). 치환 실패 시 assert로 중단 → 복원 후 정규식 점검.

- [ ] **Step 3: 나머지 5개 슬라이드 교체**

```bash
py -3.14 report-presentation/embed_2x2.py --all   # slide-15~20
grep -c 'class="shot-2x2"' documents/docs/final-deliverables/report-deck.html
```
Expected: `6` (slide-15~20 전부). 기존 단일 `.slide-shot` 래퍼는 0건 남아야 함:
```bash
grep -oE '<div>\s*<img class="slide-shot"' documents/docs/final-deliverables/report-deck.html | wc -l
```
Expected: `0`.

- [ ] **Step 4: HTML 무결성 확인 (section/슬라이드 수 보존)**

```bash
grep -oE 'id="slide-[0-9]+"' documents/docs/final-deliverables/report-deck.html | wc -l
```
Expected: `34` (슬라이드 수 불변). `<section`/`</section>` 짝도 동일해야 함.

- [ ] **Step 5: 커밋**

```bash
cd /d/workspace/final-project-syn/documents
git add docs/final-deliverables/report-deck.html ../report-presentation/embed_2x2.py 2>/dev/null || git add docs/final-deliverables/report-deck.html
git commit -m "feat: 04장 ①~⑥ 슬라이드 2x2 스크린샷 임베드"
```

---

## Task 7: 육안 검증 (일반 보기 + capture-mode)

**Files:** 없음 (검증)

- [ ] **Step 1: 브라우저로 04장 6슬라이드 확인**

`report-deck.html`을 브라우저로 열어 slide-15~20을 넘기며 2x2 그리드 정렬·썸네일 가독성·좌측 텍스트 유지 확인. gstack-browse로 스크린샷 떠서 점검.
Expected: 6슬라이드 모두 우측 2x2(또는 폴백 칸 수), 깨짐 없음.

- [ ] **Step 2: capture-mode(960×540) 점검**

`body.capture-mode`로 단일 슬라이드 펼침 시 2x2가 프레임 내에 들어오는지 확인(PPTX 재추출 대비).
Expected: 960×540 안에서 잘림/오버플로 없음. 문제 시 `.shot-2x2 gap`/썸네일 크기 조정 후 재커밋.

- [ ] **Step 3: 최종 채택본 screenshots/ 정리 + 커밋**

```bash
cd /d/workspace/final-project-syn/documents
# raw에서 채택본을 screenshots/ 루트에 규칙대로 배치(기존 04-1~6은 대체/보존 결정)
git add docs/final-deliverables/screenshots/
git commit -m "chore: 04장 최종 채택 스크린샷 정리"
```
Expected: 커밋 성공.

---

## Task 8: 정리 (선택)

**Files:** 없음

- [ ] **Step 1: minikube 정리 (작업 종료 시)**

```bash
kubectl delete ns synapse-local
minikube stop   # 또는 minikube delete
```
Expected: 리소스 해제. (재작업 필요 시 Task 1부터 재현 가능.)

- [ ] **Step 2: PR 준비 안내**

`docs/report-deck-04-2x2` 브랜치 → (develop 부재 시 규칙대로) base 결정 후 PR. push/PR은 사용자 확인 후 진행.

---

## Self-Review 결과

- **스펙 커버리지:** §2 결정(범위·레이아웃·시딩·③폴백·수정방식) → Task 0~7 매핑. §3 CSS → Task 5. §4 기동·시드 → Task 1~3. §5 4샷 목록 → Task 4. §6 캡처도구 → Task 4. §7 리스크 폴백 → Task 0 Step 2 + Task 4 가변 칸 + Task 3 Step 6 조건부. §8 DoD → Task 7. 누락 없음.
- **Placeholder 스캔:** 시드 SQL 본문은 DEMO_SCENARIO §3 정확 라인범위(178~329)를 참조하도록 지정(문서에 실 SQL 존재). DB명·엔드포인트 키명은 "확인 후 대입"으로 명시 — 환경 의존값이라 발견 단계 포함. 그 외 모호 지시 없음.
- **타입/명명 일관성:** `.shot-2x2`(CSS·마크업·grep), `embed_2x2.py`의 `figures()/replace_slide()`, 파일 네이밍 `04-<n>-<slug>-<a|b|c|d>.png` 전 Task 일관.
