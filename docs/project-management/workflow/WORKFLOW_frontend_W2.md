# WORKFLOW: Frontend 전체 협업 — Week 2

> **Task 문서**: [TASK_frontend.md](../task/TASK_frontend.md)
> **기간**: 2026-05-18 ~ 2026-05-22, 5 영업일
> **PRD**: [PRD_W2.md](../prd/PRD_W2.md)

---

## Step 4: 노트 에디터 화면 — Markdown 편집 + 미리보기 + 저장

### 4.1 TASK 시작
- [x] Step Goal / Done When / Scope / Input 확인
- [x] PRD_W2 해당 요구사항 확인 (노트 에디터)
- [x] Duration 산정 확인

### 4.2 요구사항 분석
- [x] Markdown 편집기 위젯 선정 (flutter_markdown 채택)
- [x] 편집/미리보기 전환 모드 요건 (Desktop: split / Mobile: tab)
- [x] 자동 저장 요건 (debounce 2초 또는 수동 저장) — 2026-06-22 P0 slice: 기존 노트 2초 debounce autosave + 수동 저장 구현
- [x] 노트 CRUD API 연동 엔드포인트 확인 (knowledge-svc) — 2026-06-22 P0 slice: `/api/v1/notes`, backlinks/outlinks, versions 확인
- [x] Instructions 초안 → TASK 문서 반영

### 4.3 Security 1차 검토
- [x] 인증 필요 여부: Yes (인증된 사용자만 접근) — router redirect + bearer interceptor 경유
- [x] 권한 종류: 로그인 사용자 (본인 노트만) — backend current user scoped API 계약 사용
- [x] 공개 API 여부: No
- [ ] XSS 방지: Markdown 렌더링 시 HTML sanitization
- [ ] 결과 → TASK Constraints 반영

### 4.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [x] 노트 상태 모델 설계 (NoteState: loading/editing/saving/saved/error) — `AsyncValue` + editor saving/autosaving 상태
- [x] 자동 저장 debounce 로직 설계 — 2초 Timer debounce
- [ ] Duration(final) 갱신

### 4.5 Security 2차 검토
- [ ] Markdown → HTML 변환 시 스크립트 태그 제거 확인
- [ ] 이미지 URL 외부 리소스 로딩 정책 확인
- [ ] 미저장 데이터 유실 방지 (beforeunload 경고)
- [ ] 결과 → TASK Constraints 반영

### 4.6 DTO / Entity 설계 (API First)
- [x] NoteCreateRequest 모델 정의 (title, content, tags) — tenantId 포함 `KnowledgeApi.createNote`
- [x] NoteUpdateRequest 모델 정의 (title, content, tags) — tenantId 포함 `KnowledgeApi.updateNote`
- [x] NoteResponse 모델 정의 (id, title, content, tags, createdAt, updatedAt) — `KnowledgeNote`
- [x] NoteEditorState Provider 설계 (content, isDirty, isSaving) — editor local state + `noteDetailProvider`
- [ ] Output Format → TASK 반영

### 4.7 Repository 구현
- [x] NoteRepository 클래스 작성 (HTTP client + knowledge-svc 연동) — `KnowledgeApi`
- [x] CRUD API 호출 (POST/GET/PATCH/DELETE /notes) — create/get/list/update/delete API wrapper 추가
- [x] Riverpod Provider 등록 (NoteNotifier) — `knowledgeApiProvider`, `noteListProvider`, `noteDetailProvider`, backlinks/outlinks/version providers

### 4.8 Service + Test
- [ ] NoteNotifier 구현 (create, load, update, delete)
- [ ] Markdown 편집 상태 관리 (isDirty 추적)
- [x] 자동 저장 로직 구현 (Timer debounce)
- [x] Markdown → 미리보기 렌더링 서비스
- [ ] Unit 테스트 (NoteNotifier 상태 전이, 자동 저장 debounce)
- [ ] 테스트 통과 확인

### 4.9 Controller + Test
- [x] 노트 에디터 페이지 Widget 구현 (편집 영역 + 미리보기 영역) — 뼈대 완료
- [x] 편집/미리보기 모드 전환 탭/토글 구현 — Desktop split, Mobile tab
- [x] Markdown 툴바 구현 (Bold, Italic, Heading, Link, Code) — 뼈대 완료
- [x] 저장 버튼 + 자동 저장 인디케이터 구현 — 2026-06-22 API-backed save/autosave
- [x] 노트 제목/태그 입력 폼 구현 — 제목 입력 + 본문 `#tag` 추출
- [x] Widget 테스트 (편집 → 미리보기 전환, 저장 동작) — note render/autocomplete smoke 유지

### 4.10 View + Test
- [x] Markdown 편집 + 실시간 미리보기 렌더링 확인 — render tests PASS
- [x] 자동 저장 동작 확인 (입력 후 2초 대기 → 저장 표시) — implementation + analyze/test PASS, live API smoke는 staging demo 잔여
- [ ] Smoke Test 1건 (노트 생성 → 편집 → 저장 → 재로드)
- [ ] RULE Reference → TASK 반영

**Step 4 Status**: [x] In Progress (2026-06-22 P0 slice: knowledge note list/detail/editor/tag/version API-backed 전환, autosave, loading/error/empty state, focused API/widget test, full test, release build PASS. Live staging note smoke는 Phase E demo 잔여)

---

## Step 5: SRS 복습 화면 — 카드 제시 → 뒤집기 → 난이도 선택 → 다음 카드

### 5.1 TASK 시작
- [x] Step Goal / Done When / Scope / Input 확인
- [x] PRD_W2 해당 요구사항 확인 (SRS 복습 화면)
- [x] Duration 산정 확인

### 5.2 요구사항 분석
- [x] 복습 세션 시작 플로우 정의 (세션 생성 API → 카드 큐 로드) — `LearningReviewApi.startSession` + `getReviewQueue` 확인
- [x] 카드 제시 UI 요건 (앞면 → 탭/클릭 → 뒷면 뒤집기 애니메이션) — FlipCard 위젯 완료
- [x] 난이도 선택 버튼 요건 (Again, Hard, Good, Easy) — 4버튼 레이아웃 완료
- [x] 세션 완료 화면 요건 (복습 결과 요약) — `completeSession` 결과를 provider state로 보존해 ReviewResultScreen 표시
- [x] Instructions 초안 → TASK 문서 반영

### 5.3 Security 1차 검토
- [x] 인증 필요 여부: Yes (인증된 사용자만 접근) — router redirect + bearer interceptor 경유
- [x] 권한 종류: 로그인 사용자 (본인 카드만) — learning-card user-scoped API + current tenant header 경유
- [x] 공개 API 여부: No
- [ ] 결과 → TASK Constraints 반영

### 5.4 ERD 설계
- [x] 프론트엔드 — ERD 해당 없음
- [x] 복습 세션 상태 모델 설계 (ReviewSessionState: loading/reviewing/flipped/completed) — ReviewState(isLoading/isSubmitting/isCompleted) 구현
- [x] 카드 큐 상태 관리 설계 (currentIndex, totalCards, remainingCards) — ReviewState.currentIndex/total 구현
- [ ] Duration(final) 갱신

### 5.5 Security 2차 검토
- [x] 세션 데이터 메모리 관리 (세션 종료 시 클리어) — 새 `start()` 시 세션/결과 초기화, 완료 결과는 result route 표시용 보존
- [ ] 네트워크 에러 시 복습 데이터 유실 방지 (로컬 버퍼)
- [ ] 결과 → TASK Constraints 반영

### 5.6 DTO / Entity 설계 (API First)
- [x] ReviewSessionState Provider 설계 — ReviewState + ReviewNotifier 구현
- [x] ReviewCardDisplay 모델 정의 (front, back, isFlipped) — ReviewCard entity 구현
- [x] ReviewResult 모델 정의 (totalCards, correctCount, sessionDuration) — ReviewSession + ReviewSubmitResult entity 구현
- [ ] Output Format → TASK 반영

### 5.7 Repository 구현
- [x] ReviewRepository 클래스 작성 (HTTP client + learning-card 런타임 연동) — `LearningReviewApi`
- [x] 세션 시작/카드 큐/rating 제출/세션 완료 API 호출 — `/reviews/sessions`, `/reviews/queue`, `/submit`, `/complete`
- [x] Riverpod Provider 등록 (ReviewSessionNotifier) — reviewNotifierProvider 등록

### 5.8 Service + Test
- [x] ReviewSessionNotifier 구현 (startSession, flipCard, submitRating, nextCard, completeSession) — ReviewNotifier `start`, `submitRating`, `completeSession` 구현
- [x] 카드 큐 관리 로직 (현재 카드 인덱스, 남은 카드 수) — ReviewState.currentIndex/total 구현
- [x] 카드 뒤집기 상태 관리 — FlipCard 위젯 내부 상태 관리
- [x] 세션 완료 시 결과 집계 (정답률, 소요 시간) — ReviewState.accuracy/elapsedMs 구현
- [x] Unit 테스트 (ReviewSessionNotifier 상태 전이) — `learning_review_provider_test.dart`
- [x] 테스트 통과 확인 — focused learning tests PASS, full `flutter test` PASS (205 tests, 1 skipped)

### 5.9 Controller + Test
- [x] 복습 시작 화면 Widget 구현 (오늘 복습 카드 수 표시 + 시작 버튼) — ReviewScreen API auto-start + loading/error/empty state
- [x] 카드 제시 Widget 구현 (앞면 표시 → 뒤집기 애니메이션) — FlipCard 뼈대 완료
- [x] 난이도 선택 버튼 Widget 구현 (Again/Hard/Good/Easy 4버튼) — 레이아웃 완료
- [x] 진행률 표시 Widget 구현 (n/total 프로그레스 바) — LinearProgressIndicator 완료
- [x] 세션 완료 화면 Widget 구현 (결과 요약 + 돌아가기 버튼) — ReviewResultScreen 구현
- [x] Widget 테스트 (뒤집기 → 난이도 선택 → 다음 카드 플로우) — rating 제출 후 다음 카드 이동 smoke

### 5.10 View + Test
- [x] 복습 시작 → 카드 뒤집기 → 난이도 선택 → 다음 카드 전체 플로우 확인 — provider/widget focused tests PASS
- [x] 카드 뒤집기 애니메이션 동작 확인 — shared FlipCard test + render smoke 유지
- [x] 세션 완료 결과 화면 확인 — provider completion test + result render smoke
- [ ] Smoke Test 1건 (세션 시작 → 3장 복습 → 완료)
- [ ] RULE Reference → TASK 반영

**Step 5 Status**: [x] In Progress (2026-06-22 P0 slice: learning-card review deck/session/queue/rating/complete API-backed 전환, loading/error/empty state, provider/API/widget tests, full test, release build PASS. review-due notification live evidence와 staging smoke는 Phase E demo 잔여)

---

## Step 6: 커뮤니티 그룹 목록/상세 화면

### 6.1 TASK 시작
- [x] Step Goal / Done When / Scope / Input 확인
- [x] PRD_W2 해당 요구사항 확인 (커뮤니티 화면)
- [x] Duration 산정 확인

### 6.2 요구사항 분석
- [ ] 커뮤니티 그룹 목록 화면 요건 (검색, 카테고리 필터, 정렬)
- [ ] 그룹 상세 화면 요건 (공유 콘텐츠 목록, 복사 기능)
- [ ] 공유 콘텐츠 검색/필터 요건
- [ ] engagement-svc API 연동 엔드포인트 확인
- [ ] Instructions 초안 → TASK 문서 반영

### 6.3 Security 1차 검토
- [ ] 인증 필요 여부: Yes (인증된 사용자만 접근)
- [ ] 권한 종류: 로그인 사용자
- [ ] 공개 API 여부: No
- [ ] 결과 → TASK Constraints 반영

### 6.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 커뮤니티 상태 모델 설계 (CommunityState: loading/loaded/error)
- [ ] 검색/필터 상태 관리 설계
- [ ] Duration(final) 갱신

### 6.5 Security 2차 검토
- [ ] 공유 콘텐츠 복사 시 소유권 확인
- [ ] 부적절 콘텐츠 신고 UI 확인
- [ ] 결과 → TASK Constraints 반영

### 6.6 DTO / Entity 설계 (API First)
- [ ] SharedContentDisplay 모델 정의 (id, title, description, tags, downloadCount, shareToken)
- [ ] CommunitySearchState Provider 설계 (query, filters, results)
- [ ] Output Format → TASK 반영

### 6.7 Repository 구현
- [ ] CommunityRepository 클래스 작성 (HTTP client + engagement-svc 연동)
- [ ] 검색/필터/공유 콘텐츠 조회/복사 API 호출
- [ ] Riverpod Provider 등록 (CommunityNotifier)

### 6.8 Service + Test
- [ ] CommunityNotifier 구현 (search, loadSharedContent, copyContent)
- [ ] 검색 + 필터링 상태 관리
- [ ] 페이지네이션 (무한 스크롤 또는 페이지 번호)
- [ ] 콘텐츠 복사(copy) 확인 다이얼로그 로직
- [ ] Unit 테스트 (CommunityNotifier 상태 전이)
- [ ] 테스트 통과 확인

### 6.9 Controller + Test
- [x] 커뮤니티 그룹 목록 페이지 Widget 구현 — 탭(내 그룹/탐색) + 빈 상태 UI 뼈대 완료
- [ ] 검색 바 + 카테고리 필터 칩 Widget 구현 — 팀원 구현
- [ ] 공유 콘텐츠 카드 리스트 Widget 구현 (제목, 설명, 태그, 다운로드 수) — 팀원 구현
- [x] 공유 콘텐츠 상세 화면 Widget 구현 — 멤버/공유 콘텐츠 탭 뼈대 완료
- [ ] 복사 확인 다이얼로그 Widget 구현 — 팀원 구현
- [ ] Widget 테스트 (검색 → 결과 표시 → 콘텐츠 복사 플로우)

### 6.10 View + Test
- [ ] 커뮤니티 목록 렌더링 + 검색 동작 확인
- [ ] 카테고리 필터 동작 확인
- [ ] 콘텐츠 복사(copy) 전체 플로우 확인
- [ ] Smoke Test 1건 (검색 → 상세 보기 → 복사)
- [ ] RULE Reference → TASK 반영

**Step 6 Status**: [x] In Progress (뼈대 완료: 그룹 목록/상세 탭 레이아웃. API 연동/페이지네이션은 팀원 잔여)
