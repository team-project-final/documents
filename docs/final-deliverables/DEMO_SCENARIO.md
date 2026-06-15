# Synapse 시연 영상 시나리오 (약 3분)

> 작성일: 2026-06-11 KST
> 용도: 팀 데모 영상 촬영 (제품 설명은 PPT 별도, 이 영상은 **시연만**)
> 시점: **일반 사용자 1인의 연속 여정** (관리자 화면 제외)
> 환경: **로컬 풀스택(minikube)**, 웹 브라우저 촬영
> 강조점: **기능 커버리지** (한 사용자가 제품을 한 바퀴 도는 흐름)
>
> 📌 **이 문서는 "미리 준비해 두는" 시나리오다.** 아직 여러 서비스가 작업 중이라 **지금 촬영하지 않는다.** 각 파트는 완성 시점이 제각각이므로, **각 세그먼트를 독립 Optional 모듈로 다룬다** — §1의 각 화면에 🔀 **Optional 처리**(뺄 때 동작 + 앞뒤를 잇는 대체 멘트)를 달아, **준비된 것만 조립해 3분**을 구성한다. §3 시드 스크립트는 *그 파트가 준비됐을 때* 빈 화면을 막기 위한 참고용이며, 스키마/엔드포인트는 **작성일 기준 스냅샷**이라 실제 촬영 직전 한 번 더 맞춰본다.

---

## 0. 핵심 원칙

- 기능 나열이 아니라 **한 사람이 로그인해서 실제로 써보는 하나의 흐름**으로 간다.
- **핵심 가치(노트 → AI 카드 → 복습 → 검색)에 시간을 몰아준다.** 이게 제품의 본질이다.
- **platform(인증·알림·설정·결제)은 부가 기능** — "이런 것도 된다" 수준으로 빠르게 훑고 지나간다. (로그인은 진입이라 짧게, 인트로 애니메이션만 살림)
- 로컬에서 안 되는 것(OAuth·결제·재설정 메일)은 **동선에서 제외**한다 (§4).
- 빈 화면이 안 나오게 **데이터 시드 선행**(§3).
- **회원가입은 생략**하고 로그인부터 시작한다.

---

## 1. 샷 리스트 (3분)

> **시간 배분 요약**: 핵심 루프(0:22–2:20, 약 2분)에 집중. platform 부가 기능은 진입(로그인)·마무리(부가 montage)로 합쳐 ~35초.

| 시간 | 화면 | 비중 |
|------|------|------|
| 0:00–0:10 | 로그인 | 진입(짧게) |
| 0:10–0:22 | 대시보드 / 사이드바 | 짧게 |
| 0:22–0:50 | 노트 | ★핵심 |
| 0:50–1:25 | AI 카드 생성 | ★핵심 |
| 1:25–1:55 | 복습 (SRS) | ★핵심 |
| 1:55–2:20 | 검색 / AI 튜터 | ★핵심 |
| 2:20–2:45 | 부가 기능 (알림·설정·결제) | 압축 · 🔀항목별 Opt |
| 2:45–3:00 | 클로징 | — |

> **고정 코어**(거의 항상 가능): 로그인 · 대시보드 · 클로징. **나머지 세그먼트는 모두 🔀 Optional** — 준비된 것만 조립한다. 각 화면의 🔀 Optional 처리에 "뺄 때 대체 멘트"가 있어, 빠져도 앞뒤가 이어진다. 최소 영상 = 로그인+대시보드+클로징(약 40초)에서 준비된 파트를 끼워 3분까지 늘리는 식.

---

### 화면별 상세 동작 + 멘트

> **멘트 사용법**: 보이스오버 또는 자막용 초안. 한 화면당 1~2문장, 천천히 읽어 3분 안에 들어오게. 동작과 싱크 맞춰 읽는다. 큰따옴표 안이 그대로 읽을 멘트.

**화면: 로그인** (0:00–0:10)
- 이메일/비밀번호 입력 후 로그인 시도
- 인트로 애니메이션(중앙 팝업 → 재생 → 축소) 시청 후 대시보드로 이동
- ⚠ OAuth 버튼(Google/GitHub/Apple)은 누르지 않는다
- 🎙️ *"Synapse에 로그인합니다. 노트부터 AI 복습까지, 학습의 모든 과정을 한 곳에서 관리하는 서비스입니다."*

**화면: 대시보드** (0:10–0:22)
- 대시보드를 위/아래로 스크롤하며 위젯 보드 둘러보기 (오늘 복습·스트릭·최근 노트·지식 그래프 등)
- '편집' 토글 → 위젯 제거(×)/추가 바에서 추가 → '완료'로 편집 종료
  - ⚠ **위젯 편집은 로컬 화면 상태만 변경(서버 저장 없음)** — 새로고침하면 초기화되니, "저장됨" 멘트는 피하고 "내 보드를 자유롭게 구성" 정도로만
- 왼쪽 사이드바 펼쳐 전체 메뉴(홈·플래너·노트·복습·그래프·검색·AI 카드·알림·설정) 살펴보기 → 4개 서비스가 한 앱에 통합된 구조 강조
- 🎙️ *"로그인하면 나만의 학습 대시보드가 펼쳐집니다. 오늘 복습할 카드, 학습 스트릭, 최근 노트를 위젯으로 자유롭게 구성할 수 있고요. 노트·복습·검색·AI까지, 필요한 기능이 한 화면에 모여 있습니다."*

**화면: 노트** (0:22–0:50) · knowledge
- 노트 목록에서 정렬(제목순/최근 수정)·태그 필터(머신러닝/알고리즘 등) 살펴보기
- 노트 1개 열어 마크다운 본문·위키링크 확인
- (선택) '새 노트'로 작성 흐름 살짝
- 이 노트를 AI 카드 생성에 쓸 것이라는 맥락 만들기
- 🔀 **Optional 처리** — 핵심이라 가능하면 살림. knowledge 미완성/노트 시드 없음이면 이 세그먼트 **드롭**하고 대시보드 → AI 카드로 직행(흐름 성립).
  - 뺄 때 대체 멘트(앞↔AI 카드 연결): 🎙️ *"이제 핵심 기능입니다. 학습할 내용을 입력하면, AI가 알아서 복습 카드로 만들어 줍니다."*
- 🎙️ *"먼저 학습 노트입니다. 마크다운으로 정리하고, 위키링크로 노트끼리 연결할 수 있습니다. 태그와 정렬로 쌓인 노트를 빠르게 찾고요. 이렇게 정리한 노트를, 이제 복습 카드로 만들어 보겠습니다."*

**화면: AI 카드 생성** (0:50–1:25) · learning-ai
- 채팅 입력 바에 노트 내용을 붙여넣거나 "이 내용으로 카드 만들어줘" 요청
- '생성 중' 상태 → 카드가 **실시간 스트리밍**으로 생성되는 과정 보여주기 (핵심 차별점)
- 생성된 플래시카드(앞/뒤) 결과 확인
- 🔀 **Optional 처리** — SSE만 불안정: §3.4 사전 카드를 결과처럼 노출 후 "이렇게 생성된다" 멘트로 대체. learning-ai 통째 미완성: 세그먼트 드롭하고 복습으로 직행, AI 멘트 생략.
  - 드롭 시 대체 멘트(앞↔복습 연결): 🎙️ *"미리 만들어 둔 카드로 바로 복습을 시작해 보겠습니다."*
- 🎙️ *"노트 내용을 붙여넣고 카드 생성을 요청하면, AI가 핵심을 뽑아 플래시카드를 만들어 줍니다. 보시는 것처럼 결과가 실시간으로 생성되죠. 직접 카드를 만들 필요 없이, 노트만 있으면 복습 자료가 완성됩니다."*

**화면: 복습 (SRS)** (1:25–1:55) · learning
- 덱에서 '복습 시작'
- 카드 앞면 제시 → 탭하여 뒷면으로 뒤집기
- 난이도 선택(Again / Hard / Good / Easy) → 다음 카드
- 진행률 바와 '다음 복습 예정' 표시 확인 (간격 반복 학습)
- 🔀 **Optional 처리** — learning은 고정 유저 헤더라 미완성 가능성 낮음(가급적 유지). 큐가 비면 §3.4 `due_date<=now()` 시드 누락이니 재시드. 정 안 되면 드롭하고 검색으로.
  - 드롭 시 대체 멘트(앞↔검색 연결): 🎙️ *"복습한 내용을, 이번엔 검색하고 AI에게 직접 물어보겠습니다."*
- 🎙️ *"생성된 카드는 바로 복습할 수 있습니다. 카드를 뒤집어 답을 확인하고, 얼마나 잘 외웠는지 난이도를 고르면 — 간격 반복 알고리즘이 다음 복습 날짜를 자동으로 잡아 줍니다. 어려운 카드는 자주, 쉬운 카드는 드물게요."*

**화면: 검색 / AI 튜터** (1:55–2:20) · knowledge
- 의미 검색(✦)으로 노트 내용 찾기 → 관련 결과 확인
- "노트 내용에 대해 질문하세요" — AI 튜터에 질문 → '답변 중' 스트리밍 답변
- (그래프 뷰가 준비되면 지식 그래프 한 컷 추가 가능)
- 🔀 **Optional 처리** — 임베딩 미생성이면 의미검색 빔: **AI 튜터 질문 한 컷만** 살림. knowledge 통째 미완성: 세그먼트 드롭하고 부가/클로징으로. 그래프는 임베딩 의존이라 함께 스킵 가능.
  - 드롭 시 대체 멘트(앞↔부가/클로징 연결): 🎙️ *"이 외에도 알림·설정 같은 편의 기능까지 한 앱에 담았습니다."* (또는 바로 클로징)
- 🎙️ *"검색은 단순 키워드가 아니라 의미 기반입니다. 그리고 내 노트를 학습한 AI 튜터에게 직접 질문하면, 쌓아 둔 내용을 근거로 답해 줍니다. 내 지식이 그대로 나만의 AI가 되는 거죠."*

**화면: 부가 기능 — 빠르게 montage** (2:20–2:45) · platform
- **알림**: 인박스에서 안 읽은 알림 읽음 처리(배지 숫자 변화) → 알림 설정 토글 슬쩍
- **설정**: 프로필 편집 → 보안(2단계 인증) 슬쩍
- **결제**: 현재 플랜이 **PRO(활성 구독)** 로 표시됨 + 결제 이력 목록 (시드 §3.1) — "구독 중" 컨셉 확인
  - ⚠ 각 ~8초씩 빠르게. 영수증 버튼은 클릭하지 않음(외부 이동)
- 🔀 **Optional 처리** — 알림·설정·결제는 **각각 독립 Optional**(셋 다 platform이라 함께 될 가능성↑). 준비된 항목만 넣고, 멘트는 **보여준 항목만** 언급하도록 줄여 읽는다. 셋 다 미완성이면 montage 통째 드롭하고 클로징 직행.
  - 일부만 뺄 때 멘트 예: (결제만) 🎙️ *"알림과 프로필·보안 설정까지, 편의 기능도 한 앱에 모았습니다."*
- 🎙️ (전체 노출 시) *"이 외에도 알림, 프로필·보안 같은 2단계 인증 설정, 그리고 구독 관리까지 갖췄습니다. 지금 이 계정은 Pro 플랜을 이용 중이고, 결제 내역도 확인할 수 있습니다."*

**화면: 클로징** (2:45–3:00)
- 대시보드로 복귀하며 마무리
- 🎙️ *"노트 정리부터 AI 카드 생성, 간격 반복 복습, 그리고 나만의 AI 튜터까지 — Synapse였습니다. 감사합니다."*

---

### (Optional) 화면: 커뮤니티 — engagement 연동 완료 시에만
- 위치: **1:55 근처**(검색 구간 앞/뒤)에 ~15초 삽입
- 동작: 커뮤니티 그룹/공유 덱 둘러보기 → 콘텐츠 복사
- 🎙️ *"잘 만든 덱은 커뮤니티에 공유하고, 다른 사람의 덱을 내 것으로 가져올 수도 있습니다. 혼자가 아니라 함께 공부하는 거죠."*
- ⚠ **engagement 백엔드(그룹·공유덱·게이미피케이션)는 구현 완료, 프론트가 아직 mock**. **프론트 연동이 끝나면** §3.5 시드로 포함, 아니면 **스킵**(빼도 흐름 자연스러움). 넣을 경우 부가 기능 구간을 더 줄여 3분 유지.

> **멘트 총 분량**: 위 멘트 전체를 또박또박 읽으면 대략 2분 30~40초. 화면 동작 시간과 맞춰 일부는 자막으로 빼거나 줄여도 됨. 핵심 루프(노트→AI→복습→검색) 멘트는 살리고, 부가/클로징은 짧게 쳐도 무방.

---

## 2. 촬영 환경 — 로컬 풀스택 (minikube)

`platformDev`(8081 직결)로는 knowledge가 안 감 → **게이트웨이(8080) 경유 풀스택 + `dev` 빌드** 필요.

### 필요한 서비스
| 서비스 | 포트 | 시나리오에서 쓰는 곳 |
|--------|------|----------------------|
| gateway | 8080 | 프론트 same-origin 서빙 + platform/knowledge 라우팅 |
| platform-svc | 8081 | 로그인·알림·설정·결제 |
| knowledge-svc | 8082 | 노트·검색·그래프 |
| learning-svc | 8084 | 카드·복습(SRS) |
| learning-ai | 8090 | AI 카드 생성(SSE) |
| (engagement-svc) | 8083 | 커뮤니티 — Optional, 현재 프론트 mock |

### 기동 (프로젝트 표준) — ✅ 2026-06-12 실기동 검증 완료
```
# synapse-gitops
bash scripts/minikube-up.sh
# 문제 시 초기화 후 재기동
kubectl delete ns synapse-local && bash scripts/minikube-up.sh
```
- **장점**: 게이트웨이가 프론트를 같은 출처로 서빙 → **CORS 사고 없음**. gitops 시크릿 주입이라 staging에 가장 가깝고, **OAuth도 동작할 가능성**(로컬 bootRun과 달리 실 client-id).
- learning-ai는 `team_project_2/.learning-ai-key` 파일(OpenAI 키)이 있으면 기동 시 자동 주입.

### 접속 — port-forward **3개** 필요 (각각 별도 유지)
프론트 `dev` 빌드는 platform·knowledge는 게이트웨이(8080) 경유, **learning(8084)·ai(8090)는 localhost 직결**로 호출하므로 셋 다 떠 있어야 전 화면이 동작한다:
```
kubectl -n synapse-local port-forward svc/gateway       8080:80   # SPA + platform/knowledge
kubectl -n synapse-local port-forward svc/learning-card 8084:80   # 카드·복습 (프론트 직결)
kubectl -n synapse-local port-forward svc/learning-ai   8090:80   # AI 카드 생성 (프론트 직결)
```
- 브라우저: `http://localhost:8080/`

### 참고: learning/ai 직결 단축
- 프론트의 learning(8084)/ai(8090) dio는 **고정 dev 유저 헤더**(`X-User-Id: 00000000-...-001`)로 호출. 로그인 유저와 별개로 동작하므로, **복습·AI 카드 데이터는 그 고정 유저 기준**으로 준비해야 화면에 보인다.
- ⚠ 이를 위해 local-k8s 의 learning-card 는 **dev 프로파일**(permitAll+CORS)로 두고, knowledge 시크릿에 **JWT_PUBLIC_KEY** 를 주입해 둠 — 빠지면 둘 다 401 (gitops `fix/local-k8s-frontend-auth` 브랜치, 2026-06-12). 촬영 전 이 설정이 main 에 반영됐는지 확인.

---

## 3. 촬영 전 준비물 (체크리스트)

> **계정 컨셉: 이미 Pro 구독 중인 사용자.** 결제 화면에서 활성 구독 + 결제 이력이 보이도록 §3.1 시드를 선행한다.

- [ ] minikube 풀스택 기동 + 전 서비스 Healthy 확인
- [ ] **촬영용 프론트 빌드는 바이패스 OFF(실 로그인)** — 바이패스 가짜 토큰은 저장이 안 돼 `Authorization` 헤더가 안 붙어서 platform·knowledge·engagement가 401 (learning만 고정 헤더라 예외)
- [ ] 프론트 `dev` 환경으로 빌드/서빙 (게이트웨이 경유)
- [x] **데모 계정** 1개: `ssar@nate.com` / `Ssar1234!` (2026-06-12 minikube에 가입 완료 — 클러스터 초기화 시 재가입 필요). 가입 시 tenant 자동 생성·본인 owner. **로그인해 JWT 확보**(노트/커뮤니티 시드에 사용)
- [ ] **시드 데이터** (빈 화면 방지) — 소유자·방법이 파트별로 다름(아래 각 항목·§3 참고):
  - [x] **PRO 활성 구독 + 결제 이력 (platform)** — §3.1 심음(2026-06-12, ACTIVE + $15×3개월, API 200 확인). 클러스터 초기화 시 재시드
  - [x] **알림 인박스 (platform)** — §3.2 심음(2026-06-12, 안읽음 3+읽음 1, 배지 3 확인). '오늘의 복습 18장' 알림은 대시보드 타일 숫자와 일치시킴
  - [~] **노트 (knowledge)** — 프론트가 아직 mock(data/providers 미구현, 타 담당)이라 백엔드 시드 무의미. 화면엔 mock 목록이 표시됨 — 연동 완료 시 §3.3 실행
  - [x] **덱 + 복습 대기 카드 (learning)** — §3.4 심음(2026-06-12, '머신러닝 기초' 덱 + 카드 5장 중 3장 due, API 확인). ⚠ card_type 허용값은 basic/cloze/definition (qa 아님)
  - [ ] (선택) 커뮤니티 그룹/공유덱 (engagement) — §3.5, **프론트 연동 시에만**
- [ ] (검색/그래프 쓸 거면) note_chunks 임베딩 채워졌는지 확인 — 미가동이면 검색 컷 스킵
- [ ] 동선 1~2회 리허설 (에러 화면 안 뜨게)

### 3.1 결제 시드 SQL — "이미 Pro 구독 중" 컨셉

데모 유저 이메일만 바꿔 실행. 그 유저의 tenant(가입 시 자동 생성)에 **PRO 활성 구독 + 최근 3개월 결제 이력**을 심는다.
실행 위치: platform DB (로컬 컨테이너면 `docker exec synapse-postgres psql -U synapse -d synapse`).

```sql
-- 데모 유저 이메일만 교체
\set demo_email 'ssar@nate.com'

-- 1) 대상 tenant 조회 (가입 시 owner로 자동 생성됨)
WITH t AS (
  SELECT tm.tenant_id
  FROM users u JOIN tenant_members tm ON tm.user_id = u.id
  WHERE u.email = :'demo_email' AND tm.role = 'owner'
  LIMIT 1
),
-- 2) PRO 활성 구독 (이번 달 기준 기간)
sub AS (
  INSERT INTO subscriptions
    (id, tenant_id, plan_code, stripe_customer_id, stripe_subscription_id,
     status, current_period_start, current_period_end)
  SELECT gen_random_uuid(), t.tenant_id, 'PRO', 'cus_demo', 'sub_demo',
         'ACTIVE', date_trunc('month', now()), date_trunc('month', now()) + interval '1 month'
  FROM t
  RETURNING id, tenant_id
)
-- 3) 최근 3개월 결제 이력 (amount=센티 단위; usd 1500 => $15.00)
INSERT INTO payment_history
  (id, tenant_id, subscription_id, stripe_payment_intent_id, amount, currency,
   status, paid_at, stripe_invoice_id, invoice_url, invoice_pdf_url)
SELECT gen_random_uuid(), sub.tenant_id, sub.id,
       'pi_demo_' || g, 1500, 'usd', 'succeeded',
       date_trunc('month', now()) - (g || ' month')::interval,
       'in_demo_' || g, NULL, NULL
FROM sub, generate_series(0, 2) AS g;
```

- **금액/통화**: 프론트는 `usd`면 `/100`해서 `$15.00`로 표시(KRW/JPY는 정수). Pro를 원화로 보이려면 `currency='krw'`, `amount=15000`처럼.
- **plan_code** 허용값: `FREE / PRO / TEAM / ENTERPRISE`. status: 구독 `ACTIVE`, 결제 `succeeded`.
- ⚠ **영수증 버튼**: `invoice_url/pdf`를 NULL로 두면 "영수증 없음". 클릭 시연하려면 안전한 URL을 넣되, 외부 이동되니 **촬영 중엔 클릭 권장 안 함**(이력 표시까지만).
- ⚠ 구독은 `tenant_id` 활성 1건 unique → 같은 유저에 두 번 심으면 충돌. 재시드 시 기존 구독 먼저 정리.

### 3.2 알림 시드 SQL (platform) — "안 읽은 알림 N건"

배지·인박스가 비지 않게 **안 읽은 알림 2~3건 + 읽은 1건**을 심는다. 알림은 생성 REST가 없어(이벤트 구동) **raw SQL로만** 심는다.
대상 user_id = **데모 유저의 실제 UUID**(platform은 JWT subject를 `UUID.fromString`으로 그대로 씀). 실행 위치: platform DB.

```sql
-- 데모 유저 이메일만 교체
\set demo_email 'ssar@nate.com'

WITH u AS (
  SELECT id AS user_id, default_tenant_id AS tenant_id
  FROM users WHERE email = :'demo_email' AND deleted_at IS NULL
  LIMIT 1
)
INSERT INTO notifications
  (id, event_id, user_id, tenant_id, notification_type, channel,
   title, body, status, attempts, sent_at, read_at, created_at)
SELECT gen_random_uuid(), gen_random_uuid(), u.user_id, u.tenant_id,
       v.ntype, 'FCM', v.title, v.body, 'SENT', 1,
       now() - v.ago, v.read_at, now() - v.ago
FROM u, (VALUES
  ('PAYMENT_SUCCESS',      '결제 완료',     'Pro 플랜 결제가 정상 처리되었습니다.',        interval '1 hour',    NULL::timestamptz),
  ('SUBSCRIPTION_RENEWED', '구독 갱신',     'Pro 구독이 한 달 더 연장되었습니다.',          interval '2 hours',   NULL),
  ('FEATURE_ENABLED',      '새 기능 안내',  '의미 검색과 그래프 뷰가 활성화되었습니다.',      interval '30 minutes',NULL),
  ('WELCOME',              '환영합니다',    'Synapse 시작 가이드를 확인해 보세요.',         interval '1 day',     now() - interval '23 hours')
) AS v(ntype, title, body, ago, read_at);
```

- **안 읽음 기준**: `read_at IS NULL` (위 3건). 배지 카운트는 `channel='FCM' AND status='SENT' AND read_at IS NULL`.
- ⚠ `(event_id, channel)` unique → 재시드 시 `gen_random_uuid()`라 충돌 없음. 정리하려면 해당 user_id 알림 DELETE 후 재실행.

### 3.3 노트 시드 (knowledge) — **API 방식 권장**

knowledge는 JWT sub(UUID)를 **결정적 해시로 Long 변환**해 user_id로 쓴다 → raw SQL로 그 Long을 맞추기 까다롭다. **데모 계정으로 로그인한 상태에서 앱 UI 또는 curl로 노트 3~4개를 생성**하는 게 가장 안전하고, 동시에 **검색·그래프용 임베딩 비동기 생성**도 트리거된다.

```bash
# 데모 계정 로그인으로 받은 JWT를 TOKEN에 넣고, 게이트웨이(8080) 경유로 생성
TOKEN='<데모계정 accessToken>'
BASE='https://<게이트웨이주소>'   # minikube/nip.io 주소

for f in "머신러닝 기초::# 머신러닝 기초\n\n지도학습과 비지도학습. [[경사하강법]]으로 최적화한다.::머신러닝,기초" \
         "경사하강법::# 경사하강법\n\n손실을 줄이는 방향으로 파라미터를 갱신. 학습률이 핵심.::머신러닝,최적화" \
         "알고리즘 정리::# 알고리즘\n\n정렬·탐색·DP 핵심 요약. [[머신러닝 기초]] 와 연결.::알고리즘"; do
  title="${f%%::*}"; rest="${f#*::}"; body="${rest%%::*}"; tags="${rest##*::}"
  curl -s -X POST "$BASE/api/v1/notes" -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"title\":\"$title\",\"contentMd\":\"$body\",\"tags\":[\"${tags//,/\",\"}\"]}" >/dev/null
done
```

- **검색·그래프 동작 조건**: 노트 저장 후 `note_chunks.embedding`이 채워져야 함(`NoteChunkingRequested` 이벤트 → 비동기). **로컬 Kafka/임베딩 파이프라인이 떠 있어야** 함. 미가동이면 목록·본문은 보이지만 의미검색·그래프는 빔 → §1 검색 폴백(스킵).
- ⚠ raw SQL로 굳이 심으려면: `notes(tenant_id, user_id, title, content_md, content_plain, status='active', created_at, updated_at)` + `note_tags(note_id, tag)`. 단 user_id는 `UUID.nameUUIDFromBytes(sub.getBytes())`의 상위 63비트라 API 방식보다 위험.

### 3.4 덱·카드·복습 시드 SQL (learning) — 고정 dev 유저, 항상 동작

learning은 고정 헤더 유저(`00000000-…-001`)라 **로그인과 무관하게 raw SQL로 확실히** 심는다. **'오늘 복습 대기'는 `due_date <= now()`**. 실행 위치: learning(card) DB.

```sql
-- 고정 dev 유저/테넌트 = 프론트 헤더값과 동일해야 보인다
-- user_id = tenant_id = 00000000-0000-0000-0000-000000000001

-- 1) 덱 1개
INSERT INTO card_decks (id, tenant_id, user_id, name, description, color, created_at, updated_at)
VALUES ('e0000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '머신러닝 복습 덱', '시연용 SRS 데모', '#4A90E2',
        now() - interval '2 days', now() - interval '2 days');

-- 2) 카드들 — 2장은 오늘 복습 대기(due<=now), 1장은 미래
INSERT INTO cards
  (id, tenant_id, deck_id, card_type, front_content, back_content,
   status, easiness_factor, interval_days, repetitions, lapses,
   due_date, last_reviewed_at, created_at, updated_at)
VALUES
 ('c0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001','qa',
  '지도학습이란?','정답(레이블)이 있는 데이터로 학습하는 방식.',
  'learning',2.50,1,1,0, now(), now()-interval '1 day', now()-interval '1 day', now()-interval '1 day'),
 ('c0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001','cloze',
  '경사하강법은 [...] 를 줄이는 방향으로 파라미터를 갱신한다.','손실(loss)',
  'review',2.60,3,2,0, now()-interval '1 day', now()-interval '2 days', now()-interval '2 days', now()-interval '1 day'),
 ('c0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001','definition',
  '과적합(overfitting)','학습 데이터에 과하게 맞춰 일반화가 떨어지는 현상.',
  'review',2.70,7,3,1, now()+interval '1 day', now()-interval '7 days', now()-interval '7 days', now()-interval '7 days');
```

- **복습 대기 조건**: `due_date <= now()` AND `status IN ('new','learning','review','relearning')` AND `deleted_at IS NULL` → 위 1·2번 카드가 큐에 뜬다.
- 복습 시작 = `GET /reviews/queue?deckId=…` → `POST /reviews/sessions`. 난이도 제출 시 SM-2로 `due_date` 등 자동 갱신(별도 시드 불필요).
- ⚠ AI 카드 폴백(§1)도 이 덱을 재사용 — SSE 실패 시 이 카드들을 결과처럼 노출.

### 3.5 커뮤니티 시드 (engagement) — 백엔드 완성, **프론트 연동 후** 사용

engagement-svc는 그룹·공유덱·게이미피케이션까지 **백엔드 구현 완료**. 다만 **프론트가 아직 mock**이라, 실제로 보이게 하려면 프론트 연동이 선행돼야 한다. 연동되면 데모 유저로 로그인해 API로 심는 게 안전(knowledge처럼 sub→Long).

```bash
TOKEN='<데모계정 accessToken>'; BASE='https://<게이트웨이주소>'
# 그룹 생성
curl -s -X POST "$BASE/api/v1/community/groups" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"머신러닝 스터디","description":"함께 복습 덱을 공유하는 모임","isPublic":true}' >/dev/null
# 공유 덱 게시 (content_id = learning 덱 id 참조)
curl -s -X POST "$BASE/api/v1/community/share" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"contentType":"DECK","contentId":1,"title":"머신러닝 복습 덱","description":"기초 SRS 덱 공유"}' >/dev/null
```

- 목록 조회: `GET /api/v1/community/groups`, 공유덱 검색: `GET /api/v1/community/search?q=&contentType=DECK`.
- ⚠ 그룹은 유저당 생성 한도(소스 기준 최대치) 있음. 프론트 mock→실연동 교체 전엔 화면에 안 반영됨.

---

## 4. 카메라에 절대 안 띄울 것 (로컬 제약)

- **OAuth 버튼**(Google/GitHub/Apple) — 실 client-id 없으면 `invalid_client`. (minikube+gitops면 될 수도 있으니 촬영 전 1회 테스트)
- **결제 체크아웃** — Stripe 가짜 키(`sk_test_unit`)면 실패. 결제는 **이력 조회만** 노출.
- **비밀번호 재설정 '코드 발송'** — 로컬 KAFKA_ENABLED=false → Noop 발송, 메일 안 옴.

---

## 5. 녹화 팁

- 주소는 **반드시 게이트웨이 same-origin URL** (직결 시 CORS 주의).
- 1080p 이상, 브라우저 100% 줌, **시크릿창**(확장프로그램 노이즈 제거).
- 마우스 동선 천천히, 클릭 전 0.5초 멈춤 → 편집·시청 편하게.
- 인트로 애니메이션(로그인 성공) 구간은 **끊지 말고** 풀로 보여주기 — 첫 임팩트.

---

## 변경 이력
| 날짜 | 내용 |
|------|------|
| 2026-06-11 | 최초 작성 (일반 사용자 시점, 관리자 제외, 커뮤니티 Optional) |
| 2026-06-11 | 파트별 시드 스크립트(§3.2~3.5) 추가. "미리 준비용" 문서임을 명시하고 상태 표기를 작성일 스냅샷으로 한정 |
| 2026-06-11 | **모듈식 Optional 구성** — engagement처럼 각 세그먼트(노트·AI카드·복습·검색·부가)에 🔀 Optional 처리(뺄 때 동작 + 앞뒤 잇는 대체 멘트) 부여. 촬영일까지 일부 파트 미완성이어도 "준비된 것만 조립해 3분" 가능하도록. 고정 코어=로그인·대시보드·클로징 |
