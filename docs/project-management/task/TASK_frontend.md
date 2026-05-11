# TASK: @frontend-owner

> **담당 서비스**: frontend (Flutter Web)
> **주차**: W1 (2026-05-12 ~ 2026-05-16)
> **관련 문서**: [SCOPE](../scope/SCOPE_frontend.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_frontend_W1.md) | [HISTORY](../history/HISTORY_frontend.md)

---

## Step 1: Flutter 프로젝트 기본 구조 생성

| 필드 | 내용 |
|------|------|
| **Step Name** | Flutter 프로젝트 기본 구조 생성 |
| **Step Goal** | 전체 팀이 Flutter 앱의 기본 구조(ProviderScope, GoRouter, ThemeData)를 생성하여 빈 화면이 라우팅으로 전환된다. |
| **Done When** | flutter run -d chrome → 라우팅 동작 + DESIGN.md 테마 적용 |
| **Scope** | **In**: Flutter 프로젝트 생성, Riverpod ProviderScope, GoRouter 라우팅, ThemeData 설정 / **Out**: 개별 페이지 구현, API 연동, 상태 관리 로직 |
| **Input** | Flutter 공식 문서, DESIGN.md 테마 규격, PRD_W1 화면 구조 요구사항 |
| **Instructions** | 1. `flutter create --platforms web` 프로젝트 생성<br>2. `pubspec.yaml`에 flutter_riverpod, go_router, google_fonts 의존성 추가<br>3. `ProviderScope`로 앱 최상위 래핑<br>4. GoRouter 설정 (/, /login, /dashboard 라우트 정의)<br>5. DESIGN.md 기반 ThemeData 생성 (ColorScheme, Typography)<br>6. 라우트별 빈 Scaffold 페이지 생성<br>7. `flutter run -d chrome`으로 라우팅 전환 확인<br>8. 폴더 구조 정리 (`lib/core/`, `lib/features/`, `lib/shared/`) |
| **Output Format** | 프로젝트 구조 + 라우팅 동작 스크린샷 + ThemeData 코드 |
| **Constraints** | - Flutter 3.24+ / Dart 3.5+<br>- Web 플랫폼 전용 (mobile 미지원)<br>- Riverpod 2.x (flutter_riverpod)<br>- GoRouter 14.x<br>- Material 3 디자인 시스템 |
| **Duration** | 1일 |
| **RULE Reference** | [18-기술-스택](../../wiki/18-기술-스택.md) · [03-아키텍처](../../wiki/03-아키텍처.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |

---

## Step 2: 로그인/회원가입 화면 및 OAuth 인증

| 필드 | 내용 |
|------|------|
| **Step Name** | 로그인/회원가입 화면 및 OAuth 인증 |
| **Step Goal** | 사용자가 Flutter Web에서 로그인/회원가입 화면을 통해 OAuth 인증을 수행할 수 있다. |
| **Done When** | 로그인/회원가입 화면 + OAuth 버튼 → platform-svc 연동 + 토큰 저장 |
| **Scope** | **In**: 로그인 화면 UI, 회원가입 화면 UI, OAuth 버튼, platform-svc 토큰 연동, SecureStorage 저장 / **Out**: 토큰 갱신 로직, 소셜 로그인 다중 프로바이더, 프로필 관리 |
| **Input** | Step 1 완료된 프로젝트, DESIGN.md UI 규격, platform-svc OAuth API 명세 |
| **Instructions** | 1. 로그인 페이지 UI 구현 (이메일/비밀번호 폼 + OAuth 버튼)<br>2. 회원가입 페이지 UI 구현 (이메일/비밀번호/확인 폼)<br>3. OAuth 버튼 클릭 시 platform-svc 인증 URL로 리다이렉트<br>4. 콜백 처리 및 access_token/refresh_token 수신<br>5. flutter_secure_storage로 토큰 저장<br>6. 인증 상태 Riverpod Provider 구현 (AuthNotifier)<br>7. GoRouter redirect guard 설정 (미인증 시 /login 이동)<br>8. 폼 유효성 검증 및 에러 메시지 표시 |
| **Output Format** | 로그인/회원가입 화면 스크린샷 + OAuth 플로우 시퀀스 + 토큰 저장 확인 |
| **Constraints** | - OAuth 2.0 + PKCE 플로우<br>- 토큰은 SecureStorage에만 저장 (localStorage 금지)<br>- 비밀번호 최소 8자, 영문+숫자+특수문자<br>- platform-svc 베이스 URL 환경변수 관리<br>- 로딩 상태 및 에러 상태 UI 필수 |
| **Duration** | 2일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) · [17-스케줄](../../wiki/17-스케줄.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |

---

## Step 3: 대시보드 및 사이드바 네비게이션

| 필드 | 내용 |
|------|------|
| **Step Name** | 대시보드 및 사이드바 네비게이션 |
| **Step Goal** | 인증된 사용자가 대시보드 화면에서 사이드바 네비게이션을 통해 각 섹션으로 이동할 수 있다. |
| **Done When** | 대시보드 + 사이드바(240px/56px 토글) + 라우트 연결 + 반응형 |
| **Scope** | **In**: 대시보드 레이아웃, 사이드바 컴포넌트, 네비게이션 라우팅, 반응형 대응 / **Out**: 각 섹션별 콘텐츠 구현, 실시간 데이터 표시, 알림 시스템 |
| **Input** | Step 2 완료된 인증 구조, DESIGN.md 레이아웃 규격, PRD_W1 대시보드 요구사항 |
| **Instructions** | 1. 대시보드 ShellRoute 구현 (사이드바 + 콘텐츠 영역)<br>2. 사이드바 컴포넌트 구현 (확장 240px / 축소 56px 토글)<br>3. 네비게이션 항목 정의 (대시보드, 노트, 카드, 설정)<br>4. 각 항목 클릭 시 GoRouter nested route 이동<br>5. 반응형 처리: 모바일(< 768px) 시 Drawer로 전환<br>6. 현재 활성 라우트 하이라이트 표시<br>7. 사이드바 토글 상태 Riverpod Provider로 관리<br>8. 애니메이션 전환 효과 적용 (200ms ease-in-out) |
| **Output Format** | 대시보드 스크린샷 (확장/축소) + 반응형 동작 캡처 + 라우트 구조도 |
| **Constraints** | - 사이드바 확장: 240px, 축소: 56px (아이콘만 표시)<br>- 반응형 브레이크포인트: 768px<br>- 전환 애니메이션: 200ms ease-in-out<br>- 네비게이션 항목 최대 8개<br>- 키보드 접근성 (Tab 이동, Enter 선택) 지원 |
| **Duration** | 2일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) · [17-스케줄](../../wiki/17-스케줄.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
