# WORKFLOW: Frontend 전체 협업 — Week 1

> **Task 문서**: [TASK_frontend.md](../task/TASK_frontend.md)
> **기간**: 2026-05-12 ~ 2026-05-15, 4 영업일
> **기능개발 Workflow**: [README §7](../README.md)

---

## Step 1: Flutter 프로젝트 기본 구조 생성

### 1.1 TASK 시작
- [x] Step Goal / Done When / Scope / Input 확인
- [x] PRD_W1 해당 요구사항 확인 (프로젝트 골격)
- [x] Duration 산정 확인 (1일)

### 1.2 요구사항 분석
- [x] Flutter 3.24+ / Dart 3.5+ 프로젝트 구조 분석
- [x] Riverpod + GoRouter + Material 3 의존성 확인
- [x] DESIGN.md 테마 규격 (ColorScheme, Typography) 확인
- [x] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [x] 인증 필요 여부: No (골격만 생성)
- [x] 권한 종류: 없음
- [x] 공개 API 여부: No (프론트엔드 앱)
- [x] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [x] 프론트엔드 — ERD 해당 없음
- [x] 폴더 구조 설계 (lib/core/, lib/features/, lib/shared/)
- [x] 라우트 구조 정의 (/, /login, /dashboard)
- [x] Duration(final) 갱신

### 1.5 Security 2차 검토
- [x] 민감 정보 암호화: 비해당 (골격 단계)
- [x] 환경변수 관리 (.env, API base URL)
- [x] 코드 내 시크릿 하드코딩 금지 확인
- [x] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [x] 골격 단계 — 빈 Scaffold 페이지만 생성
- [x] GoRouter 라우트 설정 (/, /login, /dashboard)
- [x] ThemeData 생성 (DESIGN.md 기반)
- [x] Output Format → TASK 반영

### 1.7 Repository 구현
- [x] pubspec.yaml 의존성 추가 (flutter_riverpod, go_router, google_fonts)
- [x] ProviderScope 최상위 래핑

### 1.8 Service + Test
- [x] GoRouter 설정 구현
- [x] ThemeData (ColorScheme + Typography) 구현
- [x] 라우트별 빈 Scaffold 페이지 생성
- [x] Widget 테스트 (라우팅 전환 확인)

### 1.9 Controller + Test
- [x] `flutter run -d chrome` 동작 확인
- [x] 라우팅 전환 동작 확인
- [x] DESIGN.md 테마 적용 확인

### 1.10 View + Test
- [x] 각 라우트 빈 화면 렌더링 확인
- [x] Smoke Test 1건 (앱 실행 → 에러 없음)
- [x] RULE Reference → TASK 반영

**Step 1 Status**: [x] Done

---

## Step 2: 로그인/회원가입 화면 및 OAuth 인증

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W1 해당 요구사항 확인 (FR-AU-xxx 인증 화면)
- [ ] Duration 산정 확인 (2일)

### 1.2 요구사항 분석
- [ ] 로그인 화면 UI 요소 정의 (이메일/비밀번호 폼 + OAuth 버튼)
- [ ] 회원가입 화면 UI 요소 정의 (이메일/비밀번호/확인 폼)
- [ ] OAuth 2.0 + PKCE 플로우 분석
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: No (인증 화면 자체는 공개)
- [ ] 권한 종류: 없음 (인증 전 화면)
- [ ] 공개 API 여부: Yes (인증 화면)
- [ ] 토큰 저장: SecureStorage만 허용 (localStorage 금지)
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 인증 상태 모델 설계 (AuthState: unauthenticated/loading/authenticated)
- [ ] 토큰 저장 구조 설계 (access_token: SecureStorage 저장, refresh_token: httpOnly Cookie — 서버에서 Set-Cookie로 발급되므로 클라이언트에서 직접 저장 불필요)
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 토큰 SecureStorage 전용 저장 확인
- [ ] 비밀번호 입력 마스킹 확인
- [ ] platform-svc 베이스 URL 환경변수 관리
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] LoginRequest 모델 정의 (email, password)
- [ ] SignupRequest 모델 정의 (email, password, confirmPassword)
- [ ] AuthToken 모델 정의 (accessToken, expiresIn) — refreshToken은 httpOnly Cookie로 서버 관리, JSON body 미포함
- [ ] AuthState Provider 설계
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] AuthRepository 클래스 작성 (HTTP client + platform-svc 연동)
- [ ] SecureStorage 토큰 저장/조회/삭제 구현
- [ ] flutter_secure_storage 의존성 추가

### 1.8 Service + Test
- [ ] AuthNotifier (Riverpod StateNotifier) 구현
- [ ] OAuth 콜백 처리 및 토큰 수신 로직
- [ ] GoRouter redirect guard 구현 (미인증 시 /login 이동)
- [ ] Unit 테스트 (AuthNotifier 상태 전이)
- [ ] 테스트 통과 확인

### 1.9 Controller + Test
- [ ] 로그인 페이지 Widget 구현 (폼 + OAuth 버튼)
- [ ] 회원가입 페이지 Widget 구현 (폼 + 유효성 검증)
- [ ] 폼 유효성 검증 (비밀번호 8자+, 영문+숫자+특수문자)
- [ ] 로딩 상태 및 에러 상태 UI 구현
- [ ] Widget 테스트 (폼 제출, 에러 표시)

### 1.10 View + Test
- [ ] 로그인 화면 렌더링 + OAuth 버튼 동작 확인
- [ ] 회원가입 화면 렌더링 + 유효성 검증 확인
- [ ] Smoke Test 1건 (로그인 → 대시보드 이동)
- [ ] RULE Reference → TASK 반영

**Step 2 Status**: [x] In Progress (폼 UI 뼈대 완료, OAuth 연동 잔여)

---

## Step 3: 대시보드 및 사이드바 네비게이션

### 1.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W1 해당 요구사항 확인 (FR-UI-xxx 대시보드)
- [ ] Duration 산정 확인 (2일)

### 1.2 요구사항 분석
- [ ] 대시보드 ShellRoute 레이아웃 구조 분석
- [ ] 사이드바 확장/축소 토글 (240px / 56px) 요건
- [ ] 반응형 브레이크포인트 (768px) 요건
- [ ] Instructions 초안 → TASK 문서 반영

### 1.3 Security 1차 검토
- [ ] 인증 필요 여부: Yes (인증된 사용자만 접근)
- [ ] 권한 종류: 로그인 사용자
- [ ] 공개 API 여부: No
- [ ] GoRouter guard로 미인증 리다이렉트 확인
- [ ] 결과 → TASK Constraints 반영

### 1.4 ERD 설계
- [ ] 프론트엔드 — ERD 해당 없음
- [ ] 네비게이션 항목 정의 (대시보드, 노트, 카드, 설정)
- [ ] 라우트 구조도 (nested routes) 설계
- [ ] Duration(final) 갱신

### 1.5 Security 2차 검토
- [ ] 민감 정보 암호화: 비해당
- [ ] 인증 토큰 만료 시 자동 리다이렉트 확인
- [ ] 키보드 접근성 (Tab 이동, Enter 선택) 지원
- [ ] 결과 → TASK Constraints 반영

### 1.6 DTO / Entity 설계 (API First)
- [ ] NavigationItem 모델 정의 (icon, label, route)
- [ ] SidebarState Provider 설계 (expanded/collapsed)
- [ ] Output Format → TASK 반영

### 1.7 Repository 구현
- [ ] 대시보드 — API 연동 해당 없음 (레이아웃 구현)
- [ ] Riverpod Provider 등록 (SidebarNotifier)

### 1.8 Service + Test
- [ ] SidebarNotifier 구현 (확장/축소 토글 상태 관리)
- [ ] 반응형 감지 로직 (LayoutBuilder / MediaQuery)
- [ ] 애니메이션 전환 (200ms ease-in-out)
- [ ] Unit 테스트 (SidebarNotifier 상태 토글)

### 1.9 Controller + Test
- [ ] 대시보드 ShellRoute Widget 구현 (사이드바 + 콘텐츠 영역)
- [ ] 사이드바 컴포넌트 구현 (확장 240px / 축소 56px)
- [ ] 네비게이션 항목 클릭 시 GoRouter nested route 이동
- [ ] 현재 활성 라우트 하이라이트 표시
- [ ] 반응형 처리: 모바일(< 768px) 시 Drawer로 전환
- [ ] Widget 테스트 (사이드바 토글, 라우트 이동)

### 1.10 View + Test
- [ ] 대시보드 확장/축소 상태 렌더링 확인
- [ ] 반응형 동작 확인 (데스크탑 ↔ 모바일)
- [ ] Smoke Test 1건 (사이드바 토글 + 페이지 이동)
- [ ] RULE Reference → TASK 반영

**Step 3 Status**: [x] In Progress (ShellRoute + SideNav 뼈대 완료, API 연동 잔여)
