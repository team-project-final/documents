# TASK: @frontend-owner

> **담당 서비스**: frontend (Flutter Web)
> **GitHub Repository**: [synapse-frontend](https://github.com/team-project-final/synapse-frontend)
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

---

# W2 (2026-05-19 ~ 2026-05-23)

## Step 4: 노트 에디터 (Markdown 편집/미리보기)

| 필드 | 내용 |
|------|------|
| **Step Name** | 노트 에디터 (Markdown 편집/미리보기) |
| **Step Goal** | 사용자가 노트 에디터에서 Markdown을 편집하고 미리보기하며 저장할 수 있다. |
| **Done When** | Markdown 편집기 + 실시간 미리보기 + knowledge-svc 저장 API 연동 + 테스트 통과 |
| **Scope** | **In**: Markdown 에디터 위젯, 미리보기 렌더러, knowledge-svc API 연동 / **Out**: 이미지 업로드, 공동 편집, 버전 히스토리 |
| **Input** | Step 3 완료된 대시보드 구조, knowledge-svc 노트 API 명세, DESIGN.md UI 규격 |
| **Instructions** | 1. Markdown 에디터 위젯 구현 (flutter_markdown 또는 커스텀)<br>2. 실시간 미리보기 패널 구현 (편집/미리보기 분할 뷰)<br>3. 툴바 구현 (Bold, Italic, Heading, Link, Code Block)<br>4. knowledge-svc 노트 CRUD API 연동 (DioProvider)<br>5. 자동 저장 로직 구현 (5초 debounce)<br>6. 저장 상태 표시 (저장 중/저장 완료/오프라인)<br>7. 노트 목록 화면 → 에디터 화면 네비게이션 연동<br>8. Widget 테스트 작성 |
| **Output Format** | 노트 에디터 스크린샷 + API 연동 코드 + Widget 테스트 결과 |
| **Constraints** | - Markdown 표준 문법 지원 (CommonMark)<br>- 자동 저장 debounce: 5초<br>- 에디터 최대 입력: 50,000자<br>- 미리보기 렌더링 지연 200ms 이내<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 2일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 5: SRS 복습 화면

| 필드 | 내용 |
|------|------|
| **Step Name** | SRS 복습 화면 |
| **Step Goal** | 사용자가 SRS 복습 화면에서 카드를 뒤집고 난이도를 선택하여 복습할 수 있다. |
| **Done When** | 카드 플립 애니메이션 + 난이도 버튼(Again/Hard/Good/Easy) + learning-card API 연동 |
| **Scope** | **In**: 카드 플립 UI, 난이도 선택 버튼, learning-card-svc API 연동 / **Out**: 통계 대시보드, 스트릭 UI, 게이미피케이션 |
| **Input** | Step 3 완료된 대시보드 구조, learning-card-svc 복습 API 명세, DESIGN.md UI 규격 |
| **Instructions** | 1. 카드 플립 위젯 구현 (3D Transform 애니메이션)<br>2. 카드 앞면/뒷면 렌더링 (Markdown 지원)<br>3. 난이도 선택 버튼 구현 (Again=0, Hard=1, Good=2, Easy=3)<br>4. learning-card-svc 복습 세션 API 연동<br>5. 복습 진행 상태 표시 (n/전체 카드 수)<br>6. 복습 완료 화면 (결과 요약: 정답률, 소요 시간)<br>7. 카드 스와이프 제스처 지원 (좌: Again, 우: Good)<br>8. Widget 테스트 작성 |
| **Output Format** | 복습 화면 스크린샷 + 플립 애니메이션 캡처 + Widget 테스트 결과 |
| **Constraints** | - 플립 애니메이션: 300ms ease-in-out<br>- 난이도 버튼 4종 고정 (Again/Hard/Good/Easy)<br>- 복습 세션당 최대 50장<br>- 오프라인 시 로컬 캐시에서 카드 로드<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 6: 커뮤니티 그룹 목록/상세

| 필드 | 내용 |
|------|------|
| **Step Name** | 커뮤니티 그룹 목록/상세 |
| **Step Goal** | 사용자가 커뮤니티 그룹 목록과 상세(멤버, 공유 콘텐츠)를 볼 수 있다. |
| **Done When** | 그룹 목록 화면 + 그룹 상세 화면(멤버/공유 콘텐츠) + API 연동 + 테스트 통과 |
| **Scope** | **In**: 그룹 목록 UI, 그룹 상세 UI, 멤버 목록, 공유 콘텐츠 표시 / **Out**: 그룹 생성/편집, 초대, 실시간 채팅 |
| **Input** | Step 3 완료된 대시보드 구조, community-svc API 명세, DESIGN.md UI 규격 |
| **Instructions** | 1. 그룹 목록 화면 구현 (카드 형태, 그룹명/멤버 수/설명 표시)<br>2. 그룹 상세 화면 구현 (탭: 멤버, 공유 콘텐츠)<br>3. 멤버 목록 렌더링 (프로필 아바타, 이름, 역할)<br>4. 공유 콘텐츠 목록 렌더링 (노트/덱 카드)<br>5. community-svc API 연동 (그룹 목록/상세/멤버/콘텐츠)<br>6. 무한 스크롤 페이지네이션 적용<br>7. 빈 상태 UI (그룹 없음/멤버 없음)<br>8. Widget 테스트 작성 |
| **Output Format** | 그룹 목록/상세 스크린샷 + API 연동 코드 + Widget 테스트 결과 |
| **Constraints** | - 그룹 목록 페이지네이션: 20건씩<br>- 멤버 목록 최대 표시: 50명<br>- 공유 콘텐츠 정렬: 최신순<br>- 로딩/에러 상태 UI 필수<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

# W3 (2026-05-26 ~ 2026-05-29, 5/25 부처님오신날 제외 — 발행자 + 가시 기능 UI)

## Step 7: 게이미피케이션 UI

| 필드 | 내용 |
|------|------|
| **Step Name** | 게이미피케이션 UI |
| **Step Goal** | 사용자가 게이미피케이션 UI(XP 바, 배지 갤러리, 레벨 표시, 레벨업 축하 애니메이션)를 볼 수 있다. |
| **Done When** | XP 프로그레스 바 + 배지 갤러리 + 레벨 표시 + 레벨업 애니메이션 + 테스트 통과 |
| **Scope** | **In**: XP 프로그레스 바, 배지 갤러리, 레벨 표시, 레벨업 축하 애니메이션 / **Out**: XP 계산 로직(백엔드), 배지 획득 조건(백엔드), 랭킹 |
| **Input** | gamification-svc API 명세, DESIGN.md 게이미피케이션 규격, PRD_W3 요구사항 |
| **Instructions** | 1. XP 프로그레스 바 위젯 구현 (현재 XP / 다음 레벨 XP)<br>2. 레벨 표시 위젯 구현 (레벨 번호 + 아이콘)<br>3. 배지 갤러리 화면 구현 (획득/미획득 배지 그리드)<br>4. 레벨업 축하 애니메이션 구현 (confetti + 모달)<br>5. gamification-svc API 연동 (XP 조회, 배지 목록, 레벨 정보)<br>6. 실시간 XP 업데이트 (Riverpod StateNotifier)<br>7. 배지 상세 팝업 (획득 조건, 획득 일시)<br>8. Widget 테스트 작성 |
| **Output Format** | 게이미피케이션 UI 스크린샷 + 레벨업 애니메이션 캡처 + Widget 테스트 결과 |
| **Constraints** | - XP 바 애니메이션: 500ms ease-out<br>- 레벨업 애니메이션: 2초 (confetti 라이브러리 사용)<br>- 배지 그리드: 한 행 4개 (반응형 조정)<br>- 미획득 배지: 회색 처리 + 잠금 아이콘<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 8: 알림 센터

| 필드 | 내용 |
|------|------|
| **Step Name** | 알림 센터 |
| **Step Goal** | 사용자가 알림 센터에서 알림을 확인하고 읽음/안읽음을 관리할 수 있다. |
| **Done When** | 알림 목록 화면 + 읽음/안읽음 토글 + 알림 배지 카운터 + API 연동 + 테스트 통과 |
| **Scope** | **In**: 알림 목록 UI, 읽음/안읽음 관리, 알림 배지 카운터 / **Out**: 실시간 푸시 알림, 알림 설정, 이메일 알림 |
| **Input** | notification-svc API 명세, DESIGN.md UI 규격, PRD_W3 알림 요구사항 |
| **Instructions** | 1. 알림 목록 화면 구현 (타입별 아이콘, 제목, 시간 표시)<br>2. 읽음/안읽음 토글 기능 구현 (스와이프 또는 탭)<br>3. 안읽음 알림 배지 카운터 구현 (사이드바/헤더)<br>4. notification-svc API 연동 (목록 조회, 읽음 처리)<br>5. 알림 타입별 렌더링 (복습 리마인더, 배지 획득, 그룹 초대 등)<br>6. 전체 읽음 처리 버튼<br>7. 무한 스크롤 페이지네이션<br>8. Widget 테스트 작성 |
| **Output Format** | 알림 센터 스크린샷 + 읽음/안읽음 동작 캡처 + Widget 테스트 결과 |
| **Constraints** | - 알림 목록 페이지네이션: 20건씩<br>- 안읽음 알림 시각적 구분 (배경색 차이)<br>- 알림 배지 최대 표시: 99+<br>- 알림 없을 시 빈 상태 UI<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 9: 관리자 신고 처리 화면

| 필드 | 내용 |
|------|------|
| **Step Name** | 관리자 신고 처리 화면 |
| **Step Goal** | 관리자가 관리 화면에서 신고를 처리(승인/거부)할 수 있다. |
| **Done When** | 신고 목록 화면 + 신고 상세 + 승인/거부 처리 + 관리자 권한 가드 + 테스트 통과 |
| **Scope** | **In**: 신고 목록 UI, 신고 상세 UI, 승인/거부 처리, 관리자 권한 가드 / **Out**: 신고 통계 대시보드, 자동 제재, 이의 제기 |
| **Input** | admin-svc API 명세, DESIGN.md UI 규격, PRD_W3 관리자 요구사항 |
| **Instructions** | 1. 관리자 전용 라우트 가드 구현 (role=ADMIN 검증)<br>2. 신고 목록 화면 구현 (신고 유형, 상태, 날짜 필터)<br>3. 신고 상세 화면 구현 (신고 내용, 신고 대상 콘텐츠, 신고자 정보)<br>4. 승인/거부 버튼 및 사유 입력 모달<br>5. admin-svc API 연동 (신고 목록/상세/처리)<br>6. 처리 완료 후 목록 자동 갱신<br>7. 관리자 미인증 시 접근 차단 UI<br>8. Widget 테스트 작성 |
| **Output Format** | 관리자 화면 스크린샷 + 신고 처리 플로우 캡처 + Widget 테스트 결과 |
| **Constraints** | - 관리자 권한 필수 (role=ADMIN)<br>- 신고 상태: PENDING, APPROVED, REJECTED<br>- 처리 사유 필수 입력 (최소 10자)<br>- 처리 후 되돌리기 불가 (확인 다이얼로그)<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 10: 공유 덱 탐색/복사

| 필드 | 내용 |
|------|------|
| **Step Name** | 공유 덱 탐색/복사 |
| **Step Goal** | 사용자가 공유 덱을 탐색하고 상세를 보고 내 덱으로 복사할 수 있다. |
| **Done When** | 공유 덱 목록 + 상세 화면 + 내 덱으로 복사 + API 연동 + 테스트 통과 |
| **Scope** | **In**: 공유 덱 목록 UI, 공유 덱 상세 UI, 덱 복사 기능 / **Out**: 덱 공유 설정, 평점/리뷰, 추천 알고리즘 |
| **Input** | learning-card-svc 공유 덱 API 명세, DESIGN.md UI 규격, PRD_W3 요구사항 |
| **Instructions** | 1. 공유 덱 목록 화면 구현 (덱명, 카드 수, 작성자, 복사 수 표시)<br>2. 검색 및 카테고리 필터 구현<br>3. 공유 덱 상세 화면 구현 (설명, 카드 미리보기, 작성자 정보)<br>4. "내 덱으로 복사" 버튼 및 확인 다이얼로그<br>5. learning-card-svc API 연동 (공유 덱 목록/상세/복사)<br>6. 복사 완료 후 내 덱 목록으로 이동<br>7. 무한 스크롤 페이지네이션<br>8. Widget 테스트 작성 |
| **Output Format** | 공유 덱 화면 스크린샷 + 복사 플로우 캡처 + Widget 테스트 결과 |
| **Constraints** | - 공유 덱 목록 페이지네이션: 20건씩<br>- 카드 미리보기: 최대 5장<br>- 복사 시 원본과의 연결 없음 (독립 사본)<br>- 복사 후 즉시 내 덱 목록에 반영<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

# W5 (2026-06-08 ~ 2026-06-12 — E2E + 발표 준비)

## Step 11: 반응형 검증 (Mobile/Tablet/Desktop)

| 필드 | 내용 |
|------|------|
| **Step Name** | 반응형 검증 (Mobile/Tablet/Desktop) |
| **Step Goal** | 전체 화면 반응형(Mobile/Tablet/Desktop)이 검증된다. |
| **Done When** | 전 화면 3개 뷰포트 검증 + 레이아웃 깨짐 0건 + 반응형 테스트 통과 |
| **Scope** | **In**: 전체 화면 반응형 검증, 뷰포트별 레이아웃 조정 / **Out**: 네이티브 앱 대응, 접근성 고도화 |
| **Input** | Step 4-10 완료된 전체 화면, DESIGN.md 반응형 브레이크포인트, 테스트 시나리오 |
| **Instructions** | 1. 반응형 브레이크포인트 정의 확인 (Mobile < 768px, Tablet 768-1024px, Desktop > 1024px)<br>2. 전체 화면별 3개 뷰포트 레이아웃 검증<br>3. 사이드바 반응형 동작 확인 (Drawer 전환)<br>4. 카드/그리드 레이아웃 반응형 열 수 조정 확인<br>5. 텍스트 오버플로우/잘림 확인 및 수정<br>6. 터치 타겟 크기 검증 (최소 48x48dp)<br>7. 반응형 Widget 테스트 작성 (LayoutBuilder 기반) |
| **Output Format** | 3개 뷰포트별 전체 화면 스크린샷 + 수정 내역 + 테스트 결과 |
| **Constraints** | - Mobile: < 768px<br>- Tablet: 768-1024px<br>- Desktop: > 1024px<br>- 레이아웃 깨짐 0건<br>- 터치 타겟 최소 48x48dp |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 12: 에러/로딩 상태 일관성

| 필드 | 내용 |
|------|------|
| **Step Name** | 에러/로딩 상태 일관성 |
| **Step Goal** | 모든 화면의 에러/로딩 상태가 AppErrorWidget/AppLoadingWidget으로 일관되게 표시된다. |
| **Done When** | 전체 화면 에러/로딩 위젯 통일 + 하드코딩 에러 UI 0건 + 테스트 통과 |
| **Scope** | **In**: AppErrorWidget/AppLoadingWidget 공통 위젯 적용, 전체 화면 일관성 검증 / **Out**: 오프라인 모드, 커스텀 에러 페이지 |
| **Input** | Step 4-10 완료된 전체 화면, DESIGN.md 에러/로딩 규격, 공통 위젯 컴포넌트 |
| **Instructions** | 1. AppErrorWidget 공통 위젯 확인 (에러 아이콘, 메시지, 재시도 버튼)<br>2. AppLoadingWidget 공통 위젯 확인 (스피너/스켈레톤)<br>3. 전체 화면 순회하며 하드코딩된 에러/로딩 UI 탐색<br>4. 하드코딩 에러 UI → AppErrorWidget으로 교체<br>5. 하드코딩 로딩 UI → AppLoadingWidget으로 교체<br>6. 네트워크 에러, 서버 에러, 인증 에러 분기 처리 확인<br>7. Widget 테스트: 각 에러/로딩 상태 렌더링 검증 |
| **Output Format** | 에러/로딩 상태 스크린샷 + 교체 내역 + Widget 테스트 결과 |
| **Constraints** | - AppErrorWidget 필수 사용 (직접 에러 UI 구현 금지)<br>- AppLoadingWidget 필수 사용 (직접 로딩 UI 구현 금지)<br>- 재시도 버튼 필수 포함 (에러 상태)<br>- 하드코딩 에러/로딩 UI 0건<br>- DESIGN.md 토큰 일관 적용 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |

---

## Step 13: DESIGN.md 토큰 하드코딩 제거

| 필드 | 내용 |
|------|------|
| **Step Name** | DESIGN.md 토큰 하드코딩 제거 |
| **Step Goal** | DESIGN.md 토큰(색상/타이포/스페이싱) 하드코딩이 0건이다. |
| **Done When** | 전체 코드베이스 하드코딩 스캔 0건 + ThemeData 토큰으로 전환 완료 + 테스트 통과 |
| **Scope** | **In**: 하드코딩 토큰 탐색 및 ThemeData 토큰 전환 / **Out**: 다크 모드, 동적 테마 전환 |
| **Input** | Step 4-12 완료된 전체 코드베이스, DESIGN.md 토큰 정의, ThemeData 설정 |
| **Instructions** | 1. 전체 코드베이스에서 하드코딩된 색상값 검색 (Color(0x...), #hex)<br>2. 하드코딩된 폰트 크기/웨이트 검색<br>3. 하드코딩된 간격/패딩값 검색<br>4. 각 하드코딩을 Theme.of(context) 또는 AppTheme 토큰으로 교체<br>5. 색상: ColorScheme 토큰 사용<br>6. 타이포: TextTheme 토큰 사용<br>7. 스페이싱: AppSpacing 상수 사용<br>8. 교체 후 전체 빌드 및 시각적 회귀 확인 |
| **Output Format** | 하드코딩 검색 결과 + 교체 내역 목록 + 빌드 성공 로그 |
| **Constraints** | - 하드코딩 색상/타이포/스페이싱 0건 달성 필수<br>- Theme.of(context) 또는 AppTheme 상수만 허용<br>- 교체 후 시각적 변경 없어야 함 (1:1 매핑)<br>- 빌드 에러 0건<br>- DESIGN.md 토큰 정의와 100% 일치 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |
---

## Step 14: 발표용 데모 시나리오 정돈

| 필드 | 내용 |
|------|------|
| **Step Name** | 발표용 데모 시나리오 정돈 |
| **Step Goal** | 발표 시연 흐름이 안정적으로 진행되도록 데모 시나리오와 시드 데이터를 정돈한다. |
| **Done When** | 시연 흐름 정상 동작 + 시드 데이터 일관성 + 깨진 링크 0건 + 리허설 검증 통과 |
| **Scope** | **In**: 데모 시나리오 점검, 시드 데이터 정돈, 깨진 링크/이미지 수정 / **Out**: 새 기능 추가, 디자인 변경 |
| **Input** | Step 11~13 완료된 전체 화면, 데모 스크립트, 시드 데이터 스크립트 |
| **Instructions** | 1. 데모 스크립트 따라 전체 시연 흐름 사전 점검<br>2. 시드 데이터 일관성 확인 (사용자/노트/카드/그룹 등 정합)<br>3. 깨진 링크/이미지/버튼 식별 및 수정<br>4. 시연 중 발생 가능 에러 케이스 점검<br>5. 화면 전환 부드러움 확인 (애니메이션 끊김 등)<br>6. 시연 환경(브라우저 zoom, 해상도)에서 최종 검증 |
| **Output Format** | 데모 시나리오 점검 결과 + 수정 내역 + 시드 데이터 스크립트 |
| **Constraints** | - 시연 흐름 100% 동작<br>- 시드 데이터 깨진 참조 0건<br>- 응답 지연 시각적 피드백 필수 |
| **Duration** | 0.5일 |
| **RULE Reference** | wiki 17_스케줄 §발표일 규칙 |
| **Assignee** | @frontend-owner |
| **Reviewer** | @tech-lead |
| **Status** | TODO |
