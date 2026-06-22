# WORKFLOW: Frontend 전체 협업 — Week 3

> **Task 문서**: [TASK_frontend.md](../task/TASK_frontend.md)
> **기간**: 2026-05-26 ~ 2026-05-29, 4 영업일
> **PRD**: [PRD_W3.md](../prd/PRD_W3.md)

---

## Step 7: 게이미피케이션 UI — XP 바 + 배지 갤러리 + 레벨 표시 + 레벨업 축하 애니메이션

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W3 해당 요구사항 확인 (게이미피케이션 UI)
- [ ] Duration 산정 확인

### 1.2 요구사항 분석
- [ ] XP 바 UI 요건 분석 (현재 XP / 다음 레벨 XP, 프로그레스 바)
- [ ] 배지 갤러리 UI 요건 분석 (획득/미획득 배지 그리드, 상세 모달)
- [ ] 레벨 표시 UI 요건 분석 (프로필 영역, 사이드바)
- [ ] 레벨업 축하 애니메이션 요건 분석 (Lottie / Rive 애니메이션)
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: Yes (로그인 사용자)
- [ ] 권한 종류: 본인 XP/배지/레벨 조회
- [ ] 공개 API 여부: No
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 게이미피케이션 상태 모델 설계 (GamificationState: xp, level, streak, badges[])
- [ ] 레벨업 이벤트 감지 로직 설계 (이전 레벨 vs 현재 레벨 비교)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [x] XP/레벨 데이터 클라이언트 측 조작 방지 (서버 데이터만 표시)
- [x] 배지 이미지 URL XSS 방지 (현재 UI는 `iconUrl` 이미지를 직접 렌더링하지 않음)
- [x] 민감 정보 노출: 없음
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [x] GamificationProvider 설계 (Riverpod FutureProvider family)
- [x] GamificationProfile 모델 (xp, level, nextLevelXp, streak, badges[])
- [x] Badge 모델 (code, name, description, iconUrl, earnedAt)
- [x] API 연동 모델 (engagement-svc `/api/v1/gamification/me` 응답 매핑 — xp, level, currentStreak, longestStreak, badges)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [x] EngagementApi gamification methods 작성 (HTTP client + engagement-svc 연동)
- [x] GET `/api/v1/gamification/me` API 호출
- [x] GET `/api/v1/gamification/badges` API 호출
- [x] GET `/api/v1/gamification/leaderboard` API 호출
- [x] GET `/api/v1/gamification/xp/history` API 호출

### 1.8 Service + Test
- [x] Gamification FutureProvider 구현 (profile, badges, leaderboard, xp history 데이터 로드)
- [ ] 레벨업 축하 트리거 로직 (이전 레벨 < 현재 레벨 시 애니메이션 표시)
- [ ] 주기적 갱신 로직 (복습 완료 후 자동 갱신)
- [x] API contract + render smoke 테스트 (`engagement_api_test.dart`, `gamification_screens_render_test.dart`)

### 1.9 Controller + Test
- [x] XP 프로그레스 바 Widget 구현 (LinearProgressIndicator + 레벨 라벨)
- [x] 배지 갤러리 Widget 구현 (GridView + 획득/미획득 구분)
- [x] 배지 상세 모달 Widget 구현 (이름, 설명, 획득 조건)
- [x] 레벨 표시 Widget 구현 (프로필 route)
- [ ] 레벨업 축하 애니메이션 Widget 구현 (Overlay + Lottie/Rive)
- [x] Widget 테스트 (profile/badge/leaderboard desktop+mobile render)

### 1.10 View + Test
- [x] 게이미피케이션 페이지 전체 렌더링 확인
- [ ] 레벨업 시 축하 애니메이션 동작 확인
- [x] 반응형 레이아웃 확인 (데스크탑 ↔ 모바일)
- [x] Smoke Test 1건 (XP 표시 + 배지 갤러리 + 레벨 표시)
- [ ] RULE Reference → TASK 반영

**Step 7 Status**: [ ] Not Started / [x] In Progress / [ ] Done (2026-06-22 P0 slice: FE-06 profile/badge/leaderboard/xp history API-backed. Level-up live animation/event evidence remains.)

---

## Step 8: 알림 센터 — 알림 목록 + 읽음/안읽음 + 설정

### 1.1 TASK 시작
- [x] Step Goal / Done When / Scope / Input 확인
- [x] PRD_W3 해당 요구사항 확인 (알림 센터)
- [x] Duration 산정 확인

### 1.2 요구사항 분석
- [x] 알림 목록 UI 요건 분석 (페이지네이션은 '더 보기' 버튼 방식으로 구현)
- [x] 읽음/안읽음 표시 요건 분석 (뱃지 카운트, 볼드 처리)
- [x] 알림 설정 UI 요건 분석 (채널별 on/off 토글)
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [x] 인증 필요 여부: Yes (로그인 사용자)
- [x] 권한 종류: 본인 알림만 조회
- [x] 공개 API 여부: No
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [x] 프론트엔드 — ERD 해당 없음
- [x] 알림 상태 모델 설계 (NotificationState: notifications[], unreadCount, settings)
- [x] 알림 타입별 라우팅 설계 (알림 클릭 → 분류별 대표 화면 이동, 시스템/미지 타입은 이동 없음)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [x] 알림 내용 XSS 방지 (Flutter Text 위젯 — HTML 미해석)
- [x] 알림 설정 변경 시 서버 동기화 필수
- [x] 민감 정보 노출: 없음
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [x] NotificationProvider 설계 (Riverpod)
- [x] NotificationState 모델 (notifications[], unreadCount)
- [x] Notification 모델 (id, type, title, body, isRead, createdAt)
- [x] NotificationSetting 모델 (channel, eventType, enabled)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [x] 알림 API 클라이언트 작성 (notification_inbox_api — platform-svc 연동)
- [x] GET /notifications API 호출 (첫 N건 — 페이지네이션 한계 기록)
- [x] 읽음 처리 API 호출 (PUT /notifications/{id}/read + 모두 읽음)
- [x] GET /notifications/settings API 호출
- [x] PUT /notifications/settings API 호출

### 1.8 Service + Test
- [x] 알림 목록 로드·읽음 처리 구현 ('더 보기' 페이지네이션 포함)
- [x] 안읽은 알림 카운트 실시간 갱신 (폴링 30초 간격 — 실제 앱에서만 활성)
- [x] 알림 설정 관리 로직 (토글 on/off → API 호출)
- [x] Unit 테스트 (알림 상태 전이, 읽음 처리)

### 1.9 Controller + Test
- [x] 안읽은 카운트 뱃지 구현 (사이드바 unread-count 뱃지)
- [x] 알림 목록 페이지 Widget 구현 (ListView + '더 보기' 페이지네이션)
- [x] 알림 항목 Widget 구현 (아이콘 + 제목 + 시간 + 읽음/안읽음 스타일)
- [x] 알림 클릭 시 상세 이동 로직 (분류별 라우팅 — 복습/커뮤니티/게이미피케이션)
- [x] 알림 설정 페이지 Widget 구현 (채널별 토글 스위치)
- [x] Widget 테스트 (알림 목록, 읽음 처리, 설정 토글)

### 1.10 View + Test
- [x] 알림 센터 전체 렌더링 확인
- [x] 읽음/안읽음 스타일 전환 확인
- [x] 알림 설정 토글 동작 확인
- [x] Smoke Test 1건 (알림 목록 → 읽음 처리 → 설정 변경)
- [ ] RULE Reference → TASK 반영

**Step 8 Status**: [ ] Not Started / [x] In Progress / [ ] Done

---

## Step 9: 관리자 화면 — 신고 목록 + 처리(승인/거부)

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W3 해당 요구사항 확인 (관리자 모더레이션 화면)
- [ ] Duration 산정 확인

### 1.2 요구사항 분석
- [ ] 관리자 신고 목록 UI 요건 분석 (테이블, 필터, 페이징)
- [ ] 신고 상세 UI 요건 분석 (신고 사유, 대상 콘텐츠, 처리 입력)
- [ ] 승인/거부 처리 UI 요건 분석 (사유 입력, 확인 다이얼로그)
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [x] 인증 필요 여부: Yes (관리자 전용)
- [x] 권한 종류: ROLE_ADMIN
- [x] 라우트 가드: 관리자가 아닌 경우 접근 차단 (PR #34 — GoRouter redirect)
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 관리자 상태 모델 설계 (AdminReportState: reports[], filters, pagination)
- [ ] 관리자 라우트 설계 (/admin/reports, /admin/reports/:id)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [x] 관리자 권한 확인 로직 (JWT role 기반 — access token `roles` 클레임 디코드, PR #34)
- [ ] 비관리자 접근 시 403 페이지 표시 — redirect 방식으로 대체 (별도 403 페이지 없음)
- [ ] 처리 액션 확인 다이얼로그 필수 (실수 방지)
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [x] AdminReportProvider 설계 (Riverpod FutureProvider family)
- [x] Report 모델 (id, targetType, targetId, reason, status, createdAt)
- [x] ReportModerateRequest 모델 (status, adminNote)
- [x] API 연동 모델 (engagement-svc `/api/v1/admin/reports` 응답 매핑)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [x] EngagementApi admin report methods 작성 (HTTP client + engagement-svc 연동)
- [x] GET `/api/v1/admin/reports?status=...` API 호출
- [x] PATCH `/api/v1/admin/reports/{reportId}` API 호출 (APPROVED/REJECTED)

### 1.8 Service + Test
- [x] AdminReport provider 구현 (신고 목록 로드, status tab)
- [x] 신고 처리 로직 (승인/거부 → API 호출 → 목록 갱신)
- [ ] 처리 결과 스낵바 알림 (성공/실패)
- [x] API contract + render smoke 테스트

### 1.9 Controller + Test
- [x] 관리자 신고 목록 페이지 Widget 구현 (DataTable + 상태 탭)
- [x] 상태 필터 Widget 구현 (PENDING/APPROVED/REJECTED 탭)
- [ ] 신고 상세 다이얼로그 Widget 구현 (사유 + 대상 콘텐츠 미리보기)
- [x] 승인/거부 버튼 + 확인 다이얼로그 구현
- [x] 관리자 라우트 가드 구현 (GoRouter redirect — PR #34, 사이드바 admin 메뉴 가드 포함)
- [x] Widget 테스트 (목록 렌더링)

### 1.10 View + Test
- [x] 관리자 신고 목록 페이지 전체 렌더링 확인
- [ ] 필터링/페이징 동작 확인
- [x] 승인/거부 처리 → 목록 갱신 로직 구현
- [ ] Smoke Test 1건 (신고 목록 → 상세 → 승인 처리)
- [ ] RULE Reference → TASK 반영

**Step 9 Status**: [ ] Not Started / [x] In Progress / [ ] Done

---

## Step 10: 공유 덱 탐색/상세 — 공유 콘텐츠 목록 + 복사 버튼

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W3 해당 요구사항 확인 (공유 덱 탐색)
- [ ] Duration 산정 확인

### 1.2 요구사항 분석
- [ ] 공유 덱 목록 UI 요건 분석 (카드 그리드, 정렬, 필터)
- [ ] 공유 덱 상세 UI 요건 분석 (덱 정보, 카드 미리보기, 통계)
- [ ] 복사 기능 요건 분석 (공유 덱 → 내 덱으로 복사)
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: Yes (로그인 사용자)
- [ ] 권한 종류: 공유된 덱만 조회 가능
- [ ] 복사 시 원본 소유자 정보 비노출
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 공유 덱 상태 모델 설계 (SharedDeckState: decks[], selectedDeck, filters)
- [ ] 라우트 설계 (/explore, /explore/:deckId)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 비공개 덱 접근 차단 확인
- [ ] 복사 시 원본 덱 ID 참조만 저장 (콘텐츠 독립 복사)
- [ ] 민감 정보 노출: 없음
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [x] SharedContentProvider 설계 (Riverpod FutureProvider family)
- [x] SharedContent 모델 (id, shareToken, contentType, contentId, ownerId, title, description, tags[])
- [x] SharedContent detail 모델 (backend `SharedContentResponse` 필드만 표시)
- [x] API 연동 모델 (engagement-svc `/api/v1/community/search`, `/share/{token}` 응답 매핑)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [x] EngagementApi shared content methods 작성 (HTTP client + engagement-svc 연동)
- [x] GET `/api/v1/community/search?q=...&contentType=DECK|NOTE` API 호출
- [x] GET `/api/v1/community/share/{token}` API 호출 (상세)
- [x] POST `/api/v1/community/share/{token}/fork` API 호출 (복사)
- [x] POST `/api/v1/community/reports` API 호출 (신고)

### 1.8 Service + Test
- [x] SharedContent provider 구현 (목록 로드, 검색, 최신/인기 정렬)
- [x] SharedContent detail provider 구현 (상세 로드)
- [x] 복사 로직 (fork API 호출 → provider invalidate)
- [x] API contract + render smoke 테스트

### 1.9 Controller + Test
- [x] 공유 덱/노트 탐색 페이지 Widget 구현 (카드 그리드/리스트 + 검색바 + 정렬)
- [x] 공유 덱/노트 카드 Widget 구현 (제목 + 설명 + owner + tags + download count)
- [x] 공유 덱/노트 상세 페이지 Widget 구현 (backend detail 필드)
- [x] 복사 버튼 Widget 구현 (로딩 + 성공/실패 피드백)
- [x] Widget 테스트 (목록/상세 렌더링)

### 1.10 View + Test
- [x] 공유 덱/노트 탐색 페이지 전체 렌더링 확인
- [ ] 덱 상세 → 카드 미리보기 동작 확인 (backend detail 응답에 카드 미리보기 없음)
- [x] 복사 버튼 → fork API 호출 로직 확인
- [x] Smoke Test 1건 (탐색/상세 API-backed render)
- [ ] RULE Reference → TASK 반영

**Step 10 Status**: [ ] Not Started / [x] In Progress / [ ] Done (2026-06-22 P0 slice: FE-05/09 shared decks/notes search/detail/fork/report API-backed. Group API and live staging copy evidence remain.)
