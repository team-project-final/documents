# 04 수행 경과 슬라이드 2x2 스크린샷화 — 설계 문서

- 작성일: 2026-06-15
- 대상: `documents/docs/final-deliverables/report-deck.html`
- 목적: 04장 ①~⑥ 슬라이드의 스크린샷을 슬라이드당 1장 → **2x2(4장)**으로 늘려 수행 경과를 더 충실히 보여준다. 스크린샷은 local-k8s로 실제 앱을 띄워 브라우저에서 캡처한다.

## 1. 배경 / 현재 상태

- 04장에서 스크린샷을 가진 슬라이드는 **slide-15 ~ slide-20 (①~⑥)** 6개.
- 각 슬라이드는 `.shot-cols` 2단 그리드 = **좌측 텍스트 불릿 + 우측 `<img class="slide-shot">` 1장** 구조.
- ⑦ 백본(slide-21)·⑧ 시연영상(slide-22)은 스크린샷 없음 → **변경 대상 아님**.
- 스크린샷 6장(`04-1-account` ~ `04-6-search`)은 HTML에 **base64로 인라인**되어 있다.
- 덱은 총 34슬라이드. THREE.js 번들 임베드로 파일 1.3MB.

### 생성 파이프라인은 사용하지 않는다 (중요)
- `report-presentation/`에 `gen_content.mjs` + `content.json`(**20슬라이드**) 생성 파이프라인이 있으나 **stale**하다 — 최종 덱은 34슬라이드 + 스크린샷 임베드로 이미 진화함.
- content.json에서 재생성하면 34슬라이드 구조와 스크린샷이 소실되므로 **재생성 금지**. 최종 HTML을 **외과적으로 직접 편집**한다.

## 2. 결정 사항 (확정)

| 항목 | 결정 |
|---|---|
| 대상 범위 | ①~⑥ 6장만, 총 24장 (⑦·⑧ 현행 유지) |
| 레이아웃 | 좌 텍스트 불릿 유지 + 우측 셀을 2x2 4장 |
| 데이터 시딩 | DEMO_SCENARIO.md §3 레시피 (데모 계정 + 시드 SQL) |
| ③ AI카드 | 시드 카드 폴백 (OpenAI 키 불요, learning-card가 카드 화면 서빙) |
| 수정 방식 | 최종 HTML 직접 편집, base64 인라인, 생성기 미사용 |
| 이미지 정책 | base64 인라인 필수 (CLAUDE.md: 외부/CDN/`file://` 폰트·이미지 참조 금지) |

## 3. 레이아웃 / CSS 변경

기존 `.shot-cols`(좌 1.08fr / 우 0.92fr)와 `.slide-shot`는 유지하고, 우측 셀에 2x2 그리드를 추가한다.

```css
.shot-cols .shot-2x2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.shot-2x2 figure{margin:0;}
.shot-2x2 figcaption{font-size:11px;opacity:.7;margin-top:2px;text-align:center;}
/* .slide-shot 기존 스타일(테두리·radius·shadow) 재사용 */
```

마크업 (우측 셀 교체 예):
```html
<div class="shot-2x2">
  <figure><img class="slide-shot" src="data:image/png;base64,..." alt="① 로그인"/><figcaption>로그인</figcaption></figure>
  <figure><img class="slide-shot" src="data:image/png;base64,..." alt="① 대시보드"/><figcaption>대시보드</figcaption></figure>
  <figure><img class="slide-shot" src="data:image/png;base64,..." alt="① 알림"/><figcaption>알림</figcaption></figure>
  <figure><img class="slide-shot" src="data:image/png;base64,..." alt="① 결제"/><figcaption>Pro 결제</figcaption></figure>
</div>
```

- 960×540 기준 우측 썸네일 ~210×120px. `figcaption`은 선택 — 좁으면 생략.
- `capture-mode`(960×540 단일 슬라이드 캡처)에서 깨지지 않는지 확인.

## 4. 로컬 기동 & 시드 절차 (DEMO_SCENARIO.md §3)

1. minikube 기동: `synapse-gitops` 기준 `bash scripts/minikube-up.sh` (8GB/4CPU, 형제 레포 이미지 6개 빌드, ~20분). learning-ai는 OpenAI 키 없이 CrashLoop이나 **나머지 5+인프라 정상** — ③은 시드 폴백이라 무방.
2. 데모 계정 재가입: `ssar@nate.com` / `Ssar1234!` (클러스터 초기화로 재가입 필요). 로그인해 JWT 확보.
3. 시드 SQL 실행:
   - §3.1 PRO 활성 구독 + 결제 이력 (platform)
   - §3.3 노트 (knowledge) — 프론트 실연동 시
   - §3.4 카드 `due_date<=now()` (learning) — 고정 dev 유저 `X-User-Id: 0000...001` 기준
   - §3.5 engagement — 프론트 실연동 시
4. port-forward 3개 (gateway 8080 메인 진입점 등), 별도 터미널 유지.
5. **촬영용 빌드는 바이패스 OFF(실 로그인)** — 바이패스 토큰은 저장 안 돼 401 발생.

## 5. 슬라이드별 4샷 목록 (24장)

| 슬 | 도메인 | 4장 | 의존 |
|---|---|---|---|
| ① 진입·계정 | platform | 로그인 / 대시보드 / 알림 인박스 / Pro 결제·구독 | platform 실연동 (검증됨) |
| ② 노트 | knowledge | 노트 목록 / 마크다운+위키링크 에디터 / 백링크 패널 / 지식 그래프(2D) | **프론트 mock 리스크** |
| ③ AI카드 | learning-ai(시드) | 노트→카드 생성 진입 / 생성된 카드 목록 / 카드 상세(앞) / 카드 상세(뒤) | learning-card 서빙 |
| ④ 복습 | learning-card | 복습 큐·세션 시작 / 카드 복습 4버튼 / 세션 결과 / 통계(heatmap) | 고정 헤더라 안정 |
| ⑤ 보상·커뮤니티 | engagement | XP·레벨 프로필 / 배지 / 리더보드 / 커뮤니티 그룹·공유덱 | **프론트 mock 리스크** |
| ⑥ 검색 | knowledge | 검색 결과(하이브리드) / 의미검색 / AI 튜터 답변 / 필터·재발견 | knowledge 검색 |

파일 네이밍: `screenshots/04-<n>-<slug>-<a|b|c|d>.png` (예: `04-1-account-a.png`).

## 6. 캡처 도구

- `gstack-browse` 데몬 헤드리스 브라우저 또는 `web-capture` 스킬로 `http://localhost:8080`의 각 화면 캡처.
- Flutter web은 CanvasKit 렌더 → DOM 셀렉터 인터랙션은 제약이 있으나 **전체 화면 캡처는 정상**. 라우팅은 URL 딥링크/메뉴 클릭으로 이동.
- 캡처 해상도는 슬라이드 썸네일 대비 충분히 크게(예: 1280×800) 후 덱 임베드 시 CSS로 축소.

## 7. 리스크 & 폴백

1. **②노트·⑤커뮤니티 프론트 mock (2026-06-12 기준)** — 오늘(06-15) frontend pull로 바뀌었을 수 있음. **캡처 전 실연동 여부 재확인**. mock이면: (a) mock 데이터 화면이라도 캡처(시연 영상도 동일 전제), 또는 (b) 해당 칸은 기존 1장 유지/3장 구성.
2. **bring-up 무거움(20분+)·일부 서비스 데이터 미렌더** — 4칸을 못 채우면 **2x2 대신 1~3장**으로 유연 대응. 그리드는 가변(빈 칸 없이 채움).
3. **③ 실시간 SSE 생성 장면 없음** — 시드 카드 폴백. 캡션으로 "AI 생성 결과" 명시.
4. **base64 인라인으로 파일 크기 증가** — 24장 추가 시 덱이 더 커짐. 캡처 원본을 적정 해상도/압축(PNG 최적화 또는 품질 조정)해 비대화 억제.

## 8. 완료 기준 (Definition of Done)

- [ ] local-k8s 기동 + 시드 완료, `localhost:8080` 실로그인 접속 확인.
- [ ] ①~⑥ 각 도메인 화면 캡처 (가능한 칸까지, 목표 24장).
- [ ] `report-deck.html` slide-15~20 우측 셀이 2x2 그리드로 교체, base64 인라인.
- [ ] `.shot-2x2` CSS 추가, 일반 보기 + `capture-mode` 양쪽에서 레이아웃 정상.
- [ ] 원본 PNG가 `screenshots/`에 네이밍 규칙대로 보관.
- [ ] 브라우저로 덱 04장 6슬라이드 육안 확인 (썸네일 가독성·정렬).

## 9. 범위 밖 (Out of Scope)

- ⑦ 백본·⑧ 시연영상 슬라이드 변경.
- `report-presentation/` 생성 파이프라인(`gen_content.mjs`/`content.json`) 수정.
- `.pptx` 재생성 (필요 시 별도 후속 — 캡처 모드로 슬라이드 재추출).
- OpenAI 실시간 AI카드 생성 파이프라인 구동.
