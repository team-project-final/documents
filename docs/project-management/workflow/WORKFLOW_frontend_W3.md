# WORKFLOW: @frontend-owner — Week 3

> **Task 문서**: [TASK_frontend.md](../task/TASK_frontend.md)  
> **기간**: 2026-05-26 ~ 2026-05-30  
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
- [ ] XP/레벨 데이터 클라이언트 측 조작 방지 (서버 데이터만 표시)
- [ ] 배지 이미지 URL XSS 방지
- [ ] 민감 정보 노출: 없음
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] GamificationProvider 설계 (Riverpod StateNotifier)
- [ ] GamificationState 모델 (xp, level, nextLevelXp, streak, badges[])
- [ ] Badge 모델 (id, name, description, iconUrl, earned)
- [ ] API 연동 모델 (engagement-svc /gamification/me 응답 매핑)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] GamificationRepository 클래스 작성 (HTTP client + engagement-svc 연동)
- [ ] GET /gamification/me API 호출
- [ ] GET /gamification/badges API 호출
- [ ] GET /gamification/leaderboard API 호출

### 1.8 Service + Test
- [ ] GamificationNotifier 구현 (데이터 로드, 레벨업 감지)
- [ ] 레벨업 축하 트리거 로직 (이전 레벨 < 현재 레벨 시 애니메이션 표시)
- [ ] 주기적 갱신 로직 (복습 완료 후 자동 갱신)
- [ ] Unit 테스트 (상태 전이, 레벨업 감지)

### 1.9 Controller + Test
- [ ] XP 프로그레스 바 Widget 구현 (LinearProgressIndicator + 레벨 라벨)
- [ ] 배지 갤러리 Widget 구현 (GridView + 획득/미획득 구분)
- [ ] 배지 상세 모달 Widget 구현 (이름, 설명, 획득 조건, 획득일)
- [ ] 레벨 표시 Widget 구현 (사이드바 프로필 영역)
- [ ] 레벨업 축하 애니메이션 Widget 구현 (Overlay + Lottie/Rive)
- [ ] Widget 테스트 (XP 바, 배지 그리드, 애니메이션 트리거)

### 1.10 View + Test
- [ ] 게이미피케이션 페이지 전체 렌더링 확인
- [ ] 레벨업 시 축하 애니메이션 동작 확인
- [ ] 반응형 레이아웃 확인 (데스크탑 ↔ 모바일)
- [ ] Smoke Test 1건 (XP 표시 + 배지 갤러리 + 레벨 표시)
- [ ] RULE Reference → TASK 반영

**Step 7 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 8: 알림 센터 — 알림 목록 + 읽음/안읽음 + 설정

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W3 해당 요구사항 확인 (알림 센터)
- [ ] Duration 산정 확인

### 1.2 요구사항 분석
- [ ] 알림 목록 UI 요건 분석 (무한 스크롤, 시간순 정렬)
- [ ] 읽음/안읽음 표시 요건 분석 (뱃지 카운트, 볼드 처리)
- [ ] 알림 설정 UI 요건 분석 (채널별 on/off 토글)
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: Yes (로그인 사용자)
- [ ] 권한 종류: 본인 알림만 조회
- [ ] 공개 API 여부: No
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 알림 상태 모델 설계 (NotificationState: notifications[], unreadCount, settings)
- [ ] 알림 타입별 라우팅 설계 (알림 클릭 → 관련 페이지 이동)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 알림 내용 XSS 방지 (HTML 태그 이스케이프)
- [ ] 알림 설정 변경 시 서버 동기화 필수
- [ ] 민감 정보 노출: 없음
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] NotificationProvider 설계 (Riverpod StateNotifier)
- [ ] NotificationState 모델 (notifications[], unreadCount, hasMore)
- [ ] Notification 모델 (id, type, title, body, isRead, createdAt)
- [ ] NotificationSetting 모델 (channel, eventType, enabled)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] NotificationRepository 클래스 작성 (HTTP client + platform-svc 연동)
- [ ] GET /notifications API 호출 (페이징)
- [ ] PATCH /notifications/{id}/read API 호출
- [ ] GET /notification-settings API 호출
- [ ] PUT /notification-settings API 호출

### 1.8 Service + Test
- [ ] NotificationNotifier 구현 (알림 목록 로드, 무한 스크롤, 읽음 처리)
- [ ] 안읽은 알림 카운트 실시간 갱신 (폴링 30초 간격)
- [ ] 알림 설정 관리 로직 (토글 on/off → API 호출)
- [ ] Unit 테스트 (알림 상태 전이, 읽음 처리)

### 1.9 Controller + Test
- [ ] 알림 벨 아이콘 Widget 구현 (AppBar, 안읽은 카운트 뱃지)
- [ ] 알림 목록 페이지 Widget 구현 (ListView + 무한 스크롤)
- [ ] 알림 항목 Widget 구현 (아이콘 + 제목 + 시간 + 읽음/안읽음 스타일)
- [ ] 알림 클릭 시 상세 이동 로직 (타입별 라우팅)
- [ ] 알림 설정 페이지 Widget 구현 (채널별 토글 스위치)
- [ ] Widget 테스트 (알림 목록, 읽음 처리, 설정 토글)

### 1.10 View + Test
- [ ] 알림 센터 전체 렌더링 확인
- [ ] 읽음/안읽음 스타일 전환 확인
- [ ] 알림 설정 토글 동작 확인
- [ ] Smoke Test 1건 (알림 목록 → 읽음 처리 → 설정 변경)
- [ ] RULE Reference → TASK 반영

**Step 8 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

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
- [ ] 인증 필요 여부: Yes (관리자 전용)
- [ ] 권한 종류: ROLE_ADMIN
- [ ] 라우트 가드: 관리자가 아닌 경우 접근 차단
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 관리자 상태 모델 설계 (AdminReportState: reports[], filters, pagination)
- [ ] 관리자 라우트 설계 (/admin/reports, /admin/reports/:id)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 관리자 권한 확인 로직 (JWT role 기반)
- [ ] 비관리자 접근 시 403 페이지 표시
- [ ] 처리 액션 확인 다이얼로그 필수 (실수 방지)
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] AdminReportProvider 설계 (Riverpod StateNotifier)
- [ ] Report 모델 (id, targetType, targetId, reason, status, createdAt)
- [ ] ReportModerateRequest 모델 (status, adminNote)
- [ ] API 연동 모델 (engagement-svc /admin/reports 응답 매핑)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] AdminReportRepository 클래스 작성 (HTTP client + engagement-svc 연동)
- [ ] GET /admin/reports API 호출 (페이징, 필터)
- [ ] PATCH /admin/reports/{id} API 호출 (승인/거부)

### 1.8 Service + Test
- [ ] AdminReportNotifier 구현 (신고 목록 로드, 필터, 페이징)
- [ ] 신고 처리 로직 (승인/거부 → API 호출 → 목록 갱신)
- [ ] 처리 결과 스낵바 알림 (성공/실패)
- [ ] Unit 테스트 (상태 전이, 처리 로직)

### 1.9 Controller + Test
- [ ] 관리자 신고 목록 페이지 Widget 구현 (DataTable + 필터 드롭다운)
- [ ] 상태 필터 Widget 구현 (PENDING/APPROVED/REJECTED 탭)
- [ ] 신고 상세 다이얼로그 Widget 구현 (사유 + 대상 콘텐츠 미리보기)
- [ ] 승인/거부 버튼 + 사유 입력 + 확인 다이얼로그 구현
- [ ] 관리자 라우트 가드 구현 (GoRouter redirect)
- [ ] Widget 테스트 (목록 렌더링, 필터, 처리 다이얼로그)

### 1.10 View + Test
- [ ] 관리자 신고 목록 페이지 전체 렌더링 확인
- [ ] 필터링/페이징 동작 확인
- [ ] 승인/거부 처리 → 목록 갱신 확인
- [ ] Smoke Test 1건 (신고 목록 → 상세 → 승인 처리)
- [ ] RULE Reference → TASK 반영

**Step 9 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

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
- [ ] SharedDeckProvider 설계 (Riverpod StateNotifier)
- [ ] SharedDeck 모델 (id, title, description, cardCount, author, tags[])
- [ ] SharedDeckDetail 모델 (deck + cards[] 미리보기)
- [ ] API 연동 모델 (learning-card-svc /shared-decks 응답 매핑)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] SharedDeckRepository 클래스 작성 (HTTP client + learning-card-svc 연동)
- [ ] GET /shared-decks API 호출 (페이징, 정렬, 태그 필터)
- [ ] GET /shared-decks/{id} API 호출 (상세)
- [ ] POST /shared-decks/{id}/copy API 호출 (복사)

### 1.8 Service + Test
- [ ] SharedDeckNotifier 구현 (목록 로드, 무한 스크롤, 필터)
- [ ] SharedDeckDetailNotifier 구현 (상세 로드)
- [ ] 복사 로직 (복사 API 호출 → 성공 시 내 덱 목록 갱신)
- [ ] Unit 테스트 (상태 전이, 복사 로직)

### 1.9 Controller + Test
- [ ] 공유 덱 탐색 페이지 Widget 구현 (카드 그리드 + 검색바 + 태그 필터)
- [ ] 공유 덱 카드 Widget 구현 (썸네일 + 제목 + 카드 수 + 태그)
- [ ] 공유 덱 상세 페이지 Widget 구현 (덱 정보 + 카드 미리보기 리스트)
- [ ] 복사 버튼 Widget 구현 (복사 확인 다이얼로그 + 로딩 + 성공 피드백)
- [ ] Widget 테스트 (목록 렌더링, 상세, 복사 버튼)

### 1.10 View + Test
- [ ] 공유 덱 탐색 페이지 전체 렌더링 확인
- [ ] 덱 상세 → 카드 미리보기 동작 확인
- [ ] 복사 버튼 → 내 덱 추가 확인
- [ ] Smoke Test 1건 (탐색 → 상세 → 복사)
- [ ] RULE Reference → TASK 반영

**Step 10 Status**: [ ] Not Started / [ ] In Progress / [ ] Done
