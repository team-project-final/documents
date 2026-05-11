# 05 — Frontend 협업 가이드 (전 트랙)

> **트랙 mention**: 전 트랙 + `@team-lead` 협업 (별도 단일 owner 없음)
> **담당 레포**: `synapse-frontend`
> **담당 도메인**: Flutter Web/Mobile UI (모든 백엔드 도메인의 클라이언트)
> **소요**: Day 1 작업 ~3시간

frontend는 다른 5개 트랙과 달리 "공동 소유". 각 트랙 owner가 자기 백엔드 도메인의 UI를 부분 담당하고, `@team-lead`가 전체 일관성(특히 DESIGN.md 준수) cross-review.

---

## Day 1 흐름

```
0. 환경 점검 (15분 — Flutter SDK 설치가 처음이면 추가)
1. 레포 클론 + 로컬 빌드 (25분 — pub get + 첫 build)
2. DESIGN.md + Flutter 컨벤션 정독 (50분 — UI 일관성의 핵심)
3. 위키 트랙 정독 (30분)
4. 자기 백엔드 도메인의 첫 UI PR (60분)
```

---

## 1. 환경 점검 (15분)

```bash
flutter --version
# Flutter 3.x.x (channel stable)
# Dart 3.4.x
```

미설치 시:
- https://docs.flutter.dev/get-started/install
- Channel: `stable`
- Web 활성화: `flutter config --enable-web`
- (선택) Android Studio + Xcode — mobile 빌드 시점에

```bash
flutter doctor
```
모든 ✓ (또는 web만 필요하면 `Chrome - develop for the web` ✓ 까지). Android/iOS는 W3+ mobile 작업 시점에 활성화.

IDE:
- VS Code + Dart/Flutter 확장 (가벼움)
- Android Studio + Flutter 플러그인 (전체 디버깅 도구)

---

## 2. 레포 클론 + 로컬 빌드 (25분)

```bash
cd D:/workspace/synapse
gh repo clone team-project-final/synapse-frontend

cd synapse-frontend
flutter pub get
flutter analyze   # 0 issues
flutter test      # 기본 widget test 통과
flutter run -d chrome
```

기대: Chrome 새 창에 "Synapse" + "학습을 자동화하는 PKM + SRS + AI" + Warm Amber 액센트가 보임. (부트스트랩 phase3.sh의 dashboard_screen.dart)

---

## 3. DESIGN.md + Flutter 컨벤션 정독 (50분)

### 3.1 DESIGN.md (핵심 — 25분)

```bash
cd D:/workspace/synapse/documents
cat DESIGN.md
```

Frontend 작업의 단일 소스(Single Source of Truth). 외워둘 키워드:

- **Warm Intellectual** 미학 — "서점/도서관 느낌"
- **Warm Amber #D97706** 액센트 (CTA, 선택 상태, XP 바)
- **Fraunces** display 폰트 (세리프, PKM 도구 차별점)
- **Plus Jakarta Sans** 본문 (Inter/Roboto 회피)
- **Warm Stone neutrals** (Cool gray 대신 따뜻한 회색)
- **Comfortable spacing density** (8px base unit)
- **Intentional motion** (장식적 모션 금지, SRS 카드 뒤집기 = spring easing)
- **게이미피케이션 UI 절제**: Duolingo 같은 게임 느낌 X, "학습 성장 기록" 느낌 O

부트스트랩이 lib/core/constants에 토큰을 이미 깔아뒀음:
- `AppColors` (12개 Stone + Amber + Teal + semantic)
- `AppSpacing` (xxs ~ xxxl 8개 + contentPadding 반응형)
- `AppTextStyles` (Fraunces display + Plus Jakarta Sans body + Geist Mono code)

새 UI 작업 시 항상 이 토큰만 사용. 하드코딩 색상/사이즈 발견 시 PR review에서 `[MUST] AppColors.X 사용` 차단.

### 3.2 Flutter 컨벤션 (25분)

```bash
cat D:/workspace/synapse/documents/docs/Flutter_개발_컨벤션.md
```

핵심:
- **Feature-first** 폴더 구조 (`lib/features/<feature>/{data,domain,presentation,providers}/`)
- **Riverpod 3.0** Provider 의사결정 (Provider/FutureProvider/StreamProvider/NotifierProvider + `.family` + `autoDispose`)
- **GoRouter** 라우팅 (경로 상수는 `AppRoutes`)
- **AsyncValue.when** 3상태 패턴 (data/loading/error + retry)
- **trailing comma 강제** (위젯 트리 정렬)
- **StatelessWidget 우선** (Riverpod ConsumerWidget으로 상태 접근)
- **`const` 위젯 + RepaintBoundary + ListView.builder** 성능 규칙

---

## 4. 위키 트랙 정독 (30분)

| 문서 | 자기 영역 |
|---|---|
| **05 화면 흐름 시퀀스** §5.1~5.12 | 12개 시퀀스 (가입/OAuth/노트작성/AI카드/복습/검색/Stripe/GDPR/덱공유/그룹/XP/알림) — frontend는 각 시나리오의 첫 진입점 |
| **06 화면 기능 정의서** | SCR-ID 체계 (W: Web, M: Mobile, A: Admin) + 화면 인벤토리 + ASCII 목업 + 화면 전환 맵 + 공통 UI 컴포넌트 표 |
| **18 기술 스택** §4.1 | Flutter 스택 + Riverpod/GoRouter/Dio/Hive + 그래프뷰 성능 대응 (LOD + 200 노드 상한 + Isolate) |

특히 06 화면 기능 정의서의 **6.6 공통 UI 컴포넌트 표**가 W1~W2 작업 우선순위. CommandPalette (Cmd+K), OnboardingChecklist, AutoSaveIndicator, NoteCard, FlashCard 등이 정의됨.

---

## 5. 자기 백엔드 도메인의 첫 UI PR (60분)

frontend는 협업이라 본인의 백엔드 트랙에 맞춰 첫 UI PR을 만듭니다.

### 5.1 트랙 → 첫 UI 매핑

| 본인 백엔드 트랙 | 첫 UI 작업 (W1) | 화면 ID |
|---|---|---|
| Platform (auth) | 로그인 / 회원가입 / MFA 검증 | SCR-W-AUTH-001~003 |
| Engagement (community) | 스터디 그룹 목록 + 생성 | SCR-W-COMM-001, 003 |
| Knowledge (note) | 노트 목록 + 에디터 기초 | SCR-W-NOTE-001, 002 |
| Learning-card (card) | 덱 목록 + 카드 목록 | SCR-W-CARD-001, 002 |
| Learning-ai | AI 카드 생성 진입 화면 | SCR-W-CARD-004 |

### 5.2 브랜치

```bash
cd synapse-frontend
git checkout -b feature/FE-002-login-screen   # 트랙 A의 경우
# 또는: feature/FE-003-deck-list, feature/FE-004-note-editor, etc.
```

### 5.3 구현 범위 (W1 첫 PR — 화면 1개)

| 파일 | 변경 |
|---|---|
| `lib/features/auth/presentation/login_screen.dart` (Create) | LoginScreen widget |
| `lib/features/auth/data/auth_repository.dart` (Create) | Repository 인터페이스 |
| `lib/features/auth/data/auth_remote_data_source.dart` (Create) | Dio HTTP 호출 |
| `lib/features/auth/providers/auth_state_provider.dart` (Create) | Riverpod Notifier |
| `lib/core/constants/app_routes.dart` (Modify) | `login = '/login'` 추가 |
| `lib/app.dart` (Modify) | GoRouter route 등록 |
| `test/features/auth/login_screen_test.dart` (Create) | Widget test |

API 호출은 04 API §4.2에 정의된 `POST /api/v1/auth/login` 사용. 백엔드가 W1엔 stub만 있어도 frontend는 mock으로 진행.

### 5.4 PR

```bash
git push -u origin feature/FE-002-login-screen
gh pr create --fill
```

PR 본문 — 영향 받는 다른 서비스: `[x] platform-svc` (API contract 일치 확인). 09 §A3 PR 본문 템플릿.

Reviewer: `@team-lead` (DESIGN.md 일관성 cross-review) + `@platform-owner` (API contract).

---

## 6. W1~W5 Frontend 작업 (17 스케줄 v3.0)

| 주차 | 전 트랙 협업 주제 |
|---|---|
| **W1** (5/12~15) | Flutter 앱 쉘 + 라우팅 + 인증 화면 + 대시보드 레이아웃. 모든 owner가 자기 도메인 UI 부분 담당 |
| **W2** (5/18~22) | 노트 에디터 + SRS 복습 화면 + 커뮤니티 그룹 목록·상세 |
| **W3** (5/26~29) | 게이미피케이션 UI (XP 바·배지·레벨 애니메이션) + 검색 결과 RRF UI |
| **W4** (6/1~5) | 알림 센터 + 관리자 화면 + 공유 덱 탐색·상세 |
| **W5** (6/8~12) | (각 트랙의 W5 작업과 통합) 전체 E2E + 디자인 폴리싱 |

각 owner가 자기 도메인 PR을 가져가는 협업 패턴. PR 마다 reviewer:
1. `@team-lead` (DESIGN.md + 아키텍처)
2. 해당 백엔드 트랙 owner (API contract)

---

## 7. 도메인 깊이 학습 자료

- **DESIGN.md** (필수): syn 레포 루트 — Warm Intellectual 미학의 단일 소스
- **Flutter 컨벤션** (필수): `docs/Flutter_개발_컨벤션.md` — 3.x + Riverpod 3.0 + GoRouter 14
- **Material 3 + DESIGN.md**: ColorScheme.fromSeed(Warm Amber) + 자체 Color tokens
- **Riverpod 3.0 codegen**: `@riverpod` annotation + `build_runner` — `flutter pub run build_runner watch`
- **GoRouter redirect**: 인증/온보딩 분기 — Flutter 컨벤션 §3.2
- **CanvasKit 강제 (Web)**: `flutter build web --web-renderer canvaskit` (100+ 그래프 노드)
- **그래프뷰 성능 대응**: 18 기술 스택 §4.1 LOD + Isolate + 200 노드 상한
- **CachedNetworkImage + cacheWidth/Height**: 메모리 절감 (Flutter 컨벤션 §3.7)

---

## 8. Frontend FAQ

**Q1. 다른 트랙 멤버와 같은 파일을 동시에 만지면 충돌이?**
> Feature-first 폴더 구조라 일반적으로 다른 feature는 충돌 없음. `lib/core/constants/app_routes.dart`만 모두가 건드림 — W1엔 한 번에 모든 route 상수를 추가하는 PR(`FE-001-routes-skeleton`)을 `@team-lead`가 먼저 만들고, 이후 각 트랙은 그 위에 작업.

**Q2. 백엔드 API가 아직 stub인데 frontend는 어떻게 진행?**
> Riverpod Provider override + mock repository. `test/`에서 `ProviderScope(overrides: [...])`로 가짜 데이터. W1엔 hard-coded mock으로 시작, W2 백엔드 stub → dev 환경 호출, W3+ 실제 데이터.

**Q3. DESIGN.md에 없는 새 컴포넌트가 필요할 때?**
> `@team-lead`에게 먼저 `#architecture` 채널에서 토론. DESIGN.md 확장이 필요하면 별도 PR(`feature/DOC-XXX-design-update`)로 syn 레포에 commit + 본 frontend PR에서 그 토큰 사용.

**Q4. 다크모드는 언제 작업?**
> Phase 2 (W6+, MVP 후) 권장. DESIGN.md에 Dark mode strategy가 정의되어 있지만 (Stone-900 background 등), MVP 5주엔 라이트 모드만. ThemeData에 light만 정의.

**Q5. 모바일(iOS/Android) 빌드는 W1에 필요?**
> Web만 W1. Mobile 빌드는 W3+ (17 스케줄 Phase 2 모바일 + 검색 강화). W1엔 Chrome run + Flutter web build 정상이면 OK.

**Q6. 6.6 공통 UI 컴포넌트 표의 컴포넌트들은 누가 만들지?**
> AppBar/SideNav 등 전역 컴포넌트는 `@team-lead`가 W1 첫 PR로 깔아둠 (`FE-001-app-shell`). 도메인별 컴포넌트(NoteCard, FlashCard, DeckCard 등)는 해당 백엔드 트랙 owner가 자기 화면 만들면서 추출.

**Q7. trailing comma 강제 이유?**
> dart format이 trailing comma 있으면 각 인자를 별도 줄로 정렬해서 위젯 트리 가독성이 크게 좋아짐. analysis_options.yaml에 `require_trailing_commas: true` 활성. lint 자동 차단.

---

## 9. 막혔을 때

| 상황 | 멘토 | 채널 |
|---|---|---|
| DESIGN.md 해석 | `@team-lead` | `#synapse-dev` |
| Riverpod Provider 선택 | `@team-lead` | `#synapse-dev` |
| API contract 불일치 | 해당 백엔드 트랙 owner | DM 또는 `#synapse-dev` |
| 그래프뷰 성능 | `@team-lead` | `#architecture` |
| Flutter 빌드 에러 | `@team-lead` | `#devops` |
| 모바일 빌드 (W3+) | `@team-lead` | `#devops` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — Frontend 협업 가이드 (전 트랙 공동 소유, DESIGN.md 중심) |
