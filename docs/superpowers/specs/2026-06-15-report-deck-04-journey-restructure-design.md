# 설계 스펙 — report-deck 04 "사용자 여정" 재구성 + 시연 영상 요약

> 작성일: 2026-06-15 · 대상: `docs/report-deck.html`(및 소스 `docs/content.json`)
> 생성 스킬: `team-project-report-presentation` (content.json → build_deck.mjs → html → pptx)
> 승인된 방식: **옵션 A — 여정 순서 + 프레이밍(1인 1슬라이드 유지)**

---

## 1. 목표 (Goal)

04 "프로젝트 수행 경과"를 **담당자별 나열**에서 **한 사용자의 학습 여정(동작 순서)** 흐름으로 재구성한다.
DEMO_SCENARIO.md의 사용자 1인 여정(로그인 → 노트 → AI 카드 → 복습 → 검색 → 부가)을 흐름 축으로 삼아,
슬라이드 **순서와 제목·프레이밍을 재배치**하되 **각 담당자가 단독 슬라이드를 유지**(평가 가독성 보존)한다.
또한 04 마지막 "시연" 슬라이드를 **DEMO_SCENARIO.md 요약**(시연 영상 안내)으로 교체한다.

### 비목표 (Non-goals)
- 01·02·03·05·06 섹션, 표지(발표 2026-06-17·역할표), 디자인 시스템(styles.css/DESIGN.md)은 **변경하지 않는다**.
- 담당자 경계를 해체한 완전 내러티브(옵션 C)는 채택하지 않는다 — 개인 기여 가독성 유지.
- 새 사실/수치를 만들지 않는다. 기존 content.json의 문구를 **재배치·재제목**하고, 신규 2슬라이드만 작성한다.

---

## 2. 현재 상태 (As-is)

`docs/content.json`의 `slides` 배열(0-기반, 총 31장). 04 블록은 인덱스 **12–18**:

| idx | 슬라이드 |
|----|----|
| 12 | section-slide `04 프로젝트 수행 경과` (부제: "담당자별 — platform · knowledge · learning · engagement · Gateway/인프라 → 시연") |
| 13 | 04-① platform — 김해준 |
| 14 | 04-② knowledge — 김현지(좌)·박은서(우) **2단** |
| 15 | 04-③ learning — 조유지(좌 card)·김나경(우 ai) **2단** |
| 16 | 04-④ engagement — 한승완 |
| 17 | 04-⑤ Gateway·인프라 — 김민구 |
| 18 | 04-⑥ 시연 — "학습 순환 한 바퀴" 표 (`cue`: "여기서 라이브 시연 또는 영상 전환") |

또한 인덱스 **1**(목차)의 04 줄이 "담당자별(...) → 시연"으로 기술돼 있다.

빌드: `node <skill>/scripts/build_deck.mjs docs/content.json docs/report-deck.html`.
제약: 슬라이드 콘텐츠 높이 **≤ 460px**(초과 시 잘림). 04는 소주제별 분할이 원칙.

---

## 3. 목표 구조 (To-be) — 04 콘텐츠 6장 → 9장 (섹션 슬라이드 포함 7 → 10장)

section-slide(12) 부제 수정 + 콘텐츠 슬라이드(13–18, 6장)를 아래 **9장**으로 교체. 전체 덱 31 → **34장**.

| 새 # | 슬라이드 | 담당(트랙) | 출처 |
|----|----|----|----|
| (섹션) | `04 프로젝트 수행 경과` — 부제 교체 | — | idx 12 수정 |
| O | **사용자 시나리오 한 바퀴** (이벤트 루프 표) | — | **신규** |
| ① | **진입·계정** | platform · 김해준(A) | idx 13 재제목 |
| ② | **노트가 지식이 된다** | knowledge · 김현지(C-1) | idx 14 **좌단 분리** |
| ③ | **노트가 카드가 된다 — AI 카드 생성** | learning-ai · 김나경(D-2) | idx 15 **우단 분리** |
| ④ | **카드로 복습한다 — SRS** | learning-card · 조유지(D-1) | idx 15 **좌단 분리** |
| ⑤ | **복습이 보상이 된다** | engagement · 한승완(B) | idx 16 재제목 |
| ⑥ | **다시 찾는다 — 검색·재발견** | knowledge · 박은서(C-2) | idx 14 **우단 분리** |
| ⑦ | **이 모든 걸 떠받친다 — 백본** | 김민구(팀장) | idx 17 재제목 |
| ⑧ | **시연 영상 — 한 사용자의 3분 여정** | — | idx 18 **교체** |

> 분할 근거: knowledge(C-1/C-2)·learning(D-1/D-2)의 모듈 경계가 여정 단계와 자연 정합 → 2단 슬라이드 2장을 단독 4장으로 분리해도 각자 1슬라이드를 가진다.

---

## 4. 슬라이드별 콘텐츠 명세 (구현용 HTML)

각 `content`는 `.slide-content` 내부에 들어갈 완성 HTML. 별도 표기 없으면 본문 문구는 기존 content.json **그대로**.

### 4.0 목차(idx 1) — 04 `<li>` 교체
```html
<li class='fragment' data-step='4'><strong>04 프로젝트 수행 경과</strong> — 사용자 여정 흐름(진입→노트→AI 카드→복습→보상·검색→백본) → 시연 영상</li>
```

### 4.1 section-slide(idx 12) — 부제 교체
```html
<div class='section-no'>04</div><h2>프로젝트 수행 경과</h2><p class='subtitle'>한 사용자의 학습 여정으로 보는 수행 경과 — 진입 → 노트 → AI 카드 → 복습 → 보상 → 검색 → 백본 → 시연 영상</p>
```

### 4.2 신규: 오버뷰 "사용자 시나리오 한 바퀴"
```html
<h2>사용자 시나리오 한 바퀴 — 노트가 도는 학습 루프</h2><table><tr><th>단계</th><th>사용자 동작 · 핵심</th><th>이벤트 / 기술</th><th>담당</th></tr><tr><td>① 진입·계정</td><td>가입·로그인·결제·알림</td><td><code>user-registered</code> 발행</td><td>김해준</td></tr><tr><td>② 노트·그래프</td><td>마크다운·위키링크·백링크</td><td><code>note-created</code> · PageRank</td><td>김현지</td></tr><tr><td>③ AI 카드</td><td>노트 → 카드 자동 생성</td><td>소비 → Claude · RAG(SSE)</td><td>김나경</td></tr><tr><td>④ 복습(SRS)</td><td>SM-2 4버튼·세션</td><td><code>review-completed</code> 발행</td><td>조유지</td></tr><tr><td>⑤ 보상·커뮤니티</td><td>XP·레벨·배지·공유</td><td>소비 → <code>level-up</code> · 알림 환류</td><td>한승완</td></tr><tr><td>⑥ 검색·재발견</td><td>의미 검색·AI 튜터</td><td>임베딩 · BM25 × RRF</td><td>박은서</td></tr><tr><td>⑦ 백본</td><td>Gateway·인프라·운영</td><td>Kafka(Outbox) · EKS · SLA</td><td>김민구</td></tr></table><p class='subtitle'>노트 한 장이 카드 → 복습 → 보상 → 검색으로 순환 — 아래 ①~⑦이 그 순서, ⑦ 백본 위에서 전 구간이 돈다.</p>
```
notes: "04는 담당자 나열이 아니라 한 사용자가 제품을 한 바퀴 도는 흐름으로 봅니다. 노트가 카드가 되고, 복습이 보상과 알림으로 돌아오고, 검색으로 다시 발견되는 순환입니다."

### 4.3 ① 진입·계정 (platform · 김해준) — idx 13 재제목
```html
<h2>① 진입·계정 — platform · 김해준 (트랙 A)</h2><p class='subtitle'>사용자가 들어오는 관문 — 인증·결제·알림·감사의 기반</p><ul><li><strong>인증·테넌트</strong> — OAuth(Google/GitHub/Apple) + JWT RS256 + MFA(TOTP), tenant self-service·초대·DB 기반 role</li><li><strong>결제(Stripe)</strong> — Free/Pro/Team 구독, 결제 이력·영수증·사용량 조회</li><li><strong>알림</strong> — 인박스 + FCM/SES 발송(<code>notification-send</code> 소비), 미읽음 배지·클릭 라우팅</li><li><strong>감사·관리자</strong> — 전 이벤트 소비 audit log(90일 보존), GDPR 데이터 요청, 시스템 설정·분석 API</li><li><strong>이벤트</strong> — <code>user-registered</code> 발행(Transactional Outbox), 그룹 <code>platform-svc-group</code></li></ul>
```

### 4.4 ② 노트가 지식이 된다 (knowledge · 김현지 C-1) — idx 14 좌단 분리
```html
<h2>② 노트가 지식이 된다 — knowledge · 김현지 (트랙 C-1)</h2><p class='subtitle'>쓴 노트가 링크로 엮여 지식 그래프가 된다</p><ul><li>Markdown 노트 CRUD · 버전 이력·복원 · 태그 (소유자 격리 <code>validateOwner</code>)</li><li>위키링크 파싱 · 백링크 · PageRank 그래프 (<code>GraphQueryPort</code> 포트 패턴)</li><li>Kafka→ES 자동 동기화 (Outbox <code>AFTER_COMMIT</code> · 멱등 Redis TTL 7d · DLQ)</li></ul>
```

### 4.5 ③ 노트가 카드가 된다 — AI 카드 생성 (learning-ai · 김나경 D-2) — idx 15 우단 분리
```html
<h2>③ 노트가 카드가 된다 — AI 카드 생성 · learning-ai · 김나경 (트랙 D-2)</h2><p class='subtitle'>노트를 던지면 AI가 플래시카드를 만든다 — 제품의 핵심</p><ul><li>FastAPI 골격 + <strong>LLM 이중화</strong>(Tenacity → OpenAI Fallback)</li><li><strong>Claude 카드 자동 생성</strong> · OpenAI 임베딩 · pgvector 시맨틱 검색 · RAG(SSE)</li><li>소비 <code>note-created</code> → 카드 생성, AiCard Consumer(DLQ·멱등)</li></ul>
```

### 4.6 ④ 카드로 복습한다 — SRS (learning-card · 조유지 D-1) — idx 15 좌단 분리
```html
<h2>④ 카드로 복습한다 — SRS · learning-card · 조유지 (트랙 D-1)</h2><p class='subtitle'>만들어진 카드를 간격 반복으로 복습한다</p><ul><li>덱·카드 CRUD, <strong>SM-2 4버튼 복습 스케줄링</strong></li><li>복습 세션·통계 (overview/heatmap/retention)</li><li>발행 <code>review-completed</code>·<code>review-due</code>, Flutter 복습 UI 연동</li></ul>
```

### 4.7 ⑤ 복습이 보상이 된다 (engagement · 한승완 B) — idx 16 재제목
```html
<h2>⑤ 복습이 보상이 된다 — engagement · 한승완 (트랙 B)</h2><p class='subtitle'>복습이 XP·레벨·배지로 환원되고 알림으로 돌아온다</p><ul><li><strong>community</strong> — 그룹 CRUD · 멤버 관리 · 공유(덱/노트)·fork · 검색 · 신고/모더레이션</li><li><strong>gamification</strong> — XP · 레벨 · 배지 · 스트릭 · 리더보드(Redis 캐시 → DB 폴백)</li><li><strong>이벤트</strong> — 소비 <code>user-registered</code>(프로필 생성)·<code>review-completed</code>(XP 적립), 발행 <code>level-up</code>·<code>badge-earned</code>·<code>notification-send</code>, 그룹 <code>engagement-svc-group</code></li><li><strong>검증</strong> — Step 9~11 E2E(복습→XP→레벨업→audit), 멱등성(<code>eventId</code> / <code>cardId+reviewedAt</code>)</li></ul>
```

### 4.8 ⑥ 다시 찾는다 — 검색·재발견 (knowledge · 박은서 C-2) — idx 14 우단 분리
```html
<h2>⑥ 다시 찾는다 — 검색·재발견 · knowledge · 박은서 (트랙 C-2)</h2><p class='subtitle'>쌓인 지식을 의미로 다시 꺼낸다</p><ul><li>비동기 청킹 → OpenAI 임베딩 → <code>note_chunks</code>(pgvector)</li><li>ES BM25(Nori) + <strong>RRF 하이브리드</strong>(시맨틱은 learning-ai 위임) + 키워드 폴백</li><li>Modulith 경계(ArchUnit) · Avro 스키마 · 검색 E2E CI 복구</li></ul>
```

### 4.9 ⑦ 이 모든 걸 떠받친다 — 백본 (김민구 팀장) — idx 17 재제목
```html
<h2>⑦ 이 모든 걸 떠받친다 — Gateway·인프라·CI/CD · 김민구 (팀장)</h2><p class='subtitle'>①~⑥ 전 여정이 도는 무대 — 게이트웨이·이벤트·운영</p><ul><li><strong>Gateway</strong> — <code>/api/{svc}/**</code> 라우팅(StripPrefix) · JWT 엣지검증+신원 전파 · Redis rate-limit(1rps·burst 60) · CORS · frontend 캐치올</li><li><strong>인프라(IaC)</strong> — EKS·RDS·MSK·ElastiCache·ES Terraform, ArgoCD GitOps(dev/staging/prod), bring-up 멱등 자동화(kafka-topics·db-init·es-reindex)</li><li><strong>공유·표준</strong> — shared Avro 계약·Schema Registry, reusable CI(deploy/mirror/flyway-guard), 토픽 환경 프리픽스(#199)</li><li><strong>운영·SLA</strong> — PR 크로스리뷰, staging <strong>16/16 Healthy · 24h 소크</strong>, SLA 실측 5/7(P1 79.7ms·P4 1.31s·P7 FCM 100%), 장애 추적·복구</li></ul>
```

### 4.10 ⑧ 시연 영상 — DEMO_SCENARIO 요약 (idx 18 교체)
```html
<h2>⑧ 시연 영상 — 한 사용자의 3분 여정</h2><p class='subtitle'>사용자 1인 연속 여정 · 로컬 풀스택(minikube) · 약 3분 — 핵심 루프에 집중</p><table><tr><th>시간</th><th>화면</th></tr><tr><td>0:00</td><td>로그인 — 진입 애니메이션</td></tr><tr><td>0:10</td><td>대시보드 · 통합 메뉴 둘러보기</td></tr><tr><td>0:22</td><td><strong>★ 노트</strong> — 마크다운 · 위키링크</td></tr><tr><td>0:50</td><td><strong>★ AI 카드</strong> — 실시간 스트리밍 생성</td></tr><tr><td>1:25</td><td><strong>★ 복습(SRS)</strong> — 4버튼 · 간격 반복</td></tr><tr><td>1:55</td><td><strong>★ 검색 · AI 튜터</strong> — 의미 기반 답변</td></tr><tr><td>2:20</td><td>부가 — 알림 · 설정 · Pro 결제</td></tr><tr><td>2:45</td><td>클로징</td></tr></table><div class='callout'>핵심 루프(<strong>노트→AI 카드→복습→검색</strong>)에 시간 집중 · <strong>모듈식 Optional 구성</strong> — 고정 코어(로그인·대시보드·클로징)에 준비된 파트만 끼워 3분.</div>
```
- `cue`: `"여기서 시연 영상 재생"` (기존 cue 문구 갱신)
- notes: "이 영상은 제품 설명이 아니라 한 사용자가 로그인해서 노트·AI 카드·복습·검색까지 실제로 써보는 3분 연속 여정입니다. 핵심 가치 루프에 시간을 몰아주고, 알림·설정·결제 같은 부가 기능은 빠르게 훑습니다."

---

## 5. 구현 순서 (Implementation)

1. `docs/content.json` 수정:
   - `slides[1]`(목차) 04 `<li>` 교체(§4.0)
   - `slides[12]`(section 04) 부제 교체(§4.1)
   - `slides[13..18]`(6장)을 §4.2~4.10의 **9장**으로 교체 (오버뷰, ①~⑦, ⑧ 순서)
   - 각 슬라이드 `notes`/`cue`는 명세대로(미명시 슬라이드는 기존 notes 유지)
2. 빌드: `node <skill>/scripts/build_deck.mjs docs/content.json docs/report-deck.html`
3. 검증: `node <skill>/scripts/capture_slides.mjs docs/report-deck.html docs/_caps --verify-only`
   → `docs/_caps/deck-report.html`에서 **READY** 확인. BLOCKED(460px 초과)면 §6 폴백 적용 후 재빌드.
4. (선택) PPTX 재생성 — 사용자가 원할 때만:
   `capture_slides.mjs --verify` → `deck_to_pptx.py docs/_caps docs/report-deck.pptx --title "SYNAPSE 결과보고서"`

`<skill>` = `C:\workspace\dsd\.claude\skills\team-project-report-presentation`.

---

## 6. 오버플로 폴백 (460px 대응)

- **오버뷰(§4.2)**: 7행 표 + 부제 1줄. 초과 시 → `이벤트/기술` 열 삭제(3열화) 또는 부제를 제거.
- **⑧ 영상(§4.10)**: 8행 표 + callout. 초과 시 → callout을 `<p class='subtitle'>` 한 줄로 축약하거나, 0:10 대시보드 행을 0:00 행에 병합.
- 각 단계 슬라이드: 부제 1줄 추가분이 초과를 유발하면 해당 부제를 H2 뒤 짧은 구절로 축약.

---

## 7. 인수 기준 (Acceptance)

- [ ] `report-deck.html`이 **34장**으로 빌드되고, 카운터 총계가 일치한다.
- [ ] 04가 오버뷰 → ①진입 → ②노트 → ③AI카드 → ④복습 → ⑤보상 → ⑥검색 → ⑦백본 → ⑧영상 **순서**로 나온다.
- [ ] 7인 전원이 각자 단독 슬라이드를 가진다(김해준·김현지·김나경·조유지·한승완·박은서·김민구).
- [ ] 담당 정합: 조유지=learning-card(④), 김나경=learning-ai(③) — content.json 정본 유지.
- [ ] ⑧이 DEMO_SCENARIO.md의 타임라인·핵심 루프·모듈식 Optional을 요약한다(라이브 시연표가 아니라 영상 안내).
- [ ] 목차·04 섹션 부제가 여정 흐름으로 갱신된다.
- [ ] `capture_slides.mjs --verify-only` 결과 **READY**(오버플로 0).
- [ ] 01·02·03·05·06·표지는 변경 없음(diff가 04 블록 + 목차 1줄에 국한).

---

## 8. 리스크 / 메모

- 04가 6→9장으로 늘어 발표 시간이 소폭 증가. 각 단계 슬라이드는 3~4불릿로 가볍게 유지(증가폭 최소화).
- 빌드/검증은 Node + (PPTX 시) Playwright/Python 필요. HTML만 갱신하면 Node만으로 충분.
- 작업 디렉터리는 git 레포가 아니라 스펙 커밋은 생략(파일 저장만).
