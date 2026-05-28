# 18 기술 스택 정의서 검증 — S2b 프론트엔드 프레임워크

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S1+S2a 후 v2.3-S2a 상태)
> 위키 패치 커밋: documents.wiki@463c43d9f0056e97ba261212c0d9dcba5e03cda0

## 0. 요약 (Summary)

- 검증 기술 수: 7 (Flutter / Riverpod / GoRouter / google_fonts / Sliver / CanvasKit / D3.js→CustomPainter / flutter_test)
- **E1: 11 · E2: 6 · D: 0 · R: 1 · OK: 6** (총 24 findings)
- **P0: 0 · P1: 5 · P2: 13** (R 1건 P1)
- Deep Dive 1건 (D3.js → Flutter CustomPainter 절 재작성)
- **구조 변경**: 절 번호 충돌 해소 — §2.4·§2.5 각 2건이 §2.5/§2.6/§2.7/§2.8/§2.9로 재번호 부여

**S1+S2a 위임 처리 완료**:
- ✅ §2.4·§2.5 절 번호 충돌 → 재번호 부여 (§2.5 Sliver / §2.6 google_fonts / §2.7 CanvasKit / §2.8 D3.js→CustomPainter / §2.9 flutter_test)
- ✅ §2.1 Flutter SDK 제약 정정 → `>=3.11.0 <4.0.0` (S2b-F01)
- ✅ §2.x `syn/` 경로 잔존 5개 절 전부 정리 → `synapse-frontend/` (S2b-F03·F06·F09·F12·F15)

**가장 영향 큰 발견 (P1)**:
- **S2b-F01**: §2.1 pubspec 예제가 실 코드와 6+ 의존성 불일치 (go_router 14→17, google_fonts 6→8, codegen 패키지 제거, hive_ce→hive)
- **S2b-F02**: §2.1 `flutter build web --web-renderer canvaskit` 플래그 폐기됨 → `flutter_bootstrap.js` 사용
- **S2b-F04**: §2.3 Riverpod 코드 예제 전체가 `@riverpod` codegen 가정 → 본 프로젝트는 manual provider 규약 (CLAUDE.md)
- **S2b-F13**: §2.5 CanvasKit `window.flutterConfiguration` 폐기 → `_flutter.loader.load` 패턴
- **S2b-F16**: §2.6 "D3.js + Web Worker 사용" 단언 → 실 코드는 순수 Flutter `CustomPainter` (절 전체 재작성, R+Deep Dive)

## 1. 카테고리 인벤토리 (Step 1)

| 절 (현재→재번호) | 기술 | 라인 범위 (~) | 1차 진단 |
|----|------|----------|---------|
| §2.1 → §2.1 (유지) | Flutter 3.x | L148-L260 (113줄) | pubspec 예제 다수 불일치, `--web-renderer` 플래그 폐기 |
| §2.3 → §2.3 (유지) | Riverpod (flutter_riverpod) | L370-L542 (173줄) | codegen 예제 → manual provider 재작성 필요 |
| §2.4 → §2.4 (유지) | GoRouter (go_router) — 첫 번째 §2.4 | L543-L650 (108줄) | 버전 14→17, redirect 예제 정합화 |
| §2.5 → §2.5 (재번호 유지) | Sliver 기반 리스트 — 첫 번째 §2.5 | L651-L799 (149줄) | 화면 적용 표 현 구현 수준으로 보정 |
| §2.4 → §2.6 (재번호) | google_fonts — 두 번째 §2.4 (충돌) | L800-L900 (101줄) | 버전 6→8, Fraunces/Plus Jakarta → Noto Sans |
| §2.5 → §2.7 (재번호) | CanvasKit — 두 번째 §2.5 (충돌) | L901-L987 (87줄) | flutter_bootstrap.js 패턴으로 재작성 |
| §2.6 → §2.8 (재번호) | D3.js → 지식 그래프 (Flutter CustomPainter) | L988-L1091 (104줄) | 절 전체 재작성 (R+Deep Dive) |
| §2.7 → §2.9 (재번호) | flutter_test + integration_test | L1092-L1198 (107줄) | integration_test 미작성, BLoC→Riverpod 교체 |

**cross-section 인용**: `§2.x` 형식 인용 0건 (재번호 부여 외부 영향 없음).
**`syn/lib` 잔존**: 5개 절 ~20 라인 (§2.1·§2.3·§2.4·§2.5(google_fonts)·§2.6).

## 2. skill-recommender 결과 (Step 2)

- 카탈로그: `C:\workspace\dsd\skill-catalog\catalog.json`
- 키워드: `flutter,riverpod,go_router,google_fonts,sliver,canvaskit,d3js,flutter_test,integration_test`
- 매칭: 32건, 상위 20건 반환
- 상위 5건 (점수순): "flutter-mobile" (25.0), "io.github.bajoski34/mcp-flutterwave" (25.0), "Flutter Mobile Workbench" (25.0), "Flutter Package MCP Server" (25.0), "Figma to Flutter MCP Server" (25.0)
- **마켓플레이스/MCP-official/verified**: 0건

**채택 결과**: 0건. (S1·S2a와 동일 패턴 — 카탈로그가 SaaS 통합 MCP 위주이며 Flutter 검증용 verified 도구 부재.) 본 세션 1차 검증 도구는 **context7 MCP** + WebFetch.

## 3. 공식 문서 검증 결과 (Step 3)

- **출처**: context7 (`/flutter/website`, `/websites/riverpod_dev`, `/websites/pub_dev_packages_go_router`) + WebFetch (pub.dev google_fonts·go_router·flutter_riverpod, docs.flutter.dev renderers, riverpod.dev whats_new, d3js.org)
- **핵심 인용**:
  - Flutter Web 렌더러: "Flutter Web currently has two renderers: CanvasKit (default) and SkWasm (--wasm build). HTML renderer is deprecated." → 위키의 `--web-renderer` 플래그·HTML 옵션 폐기 확정 (S2b-F02·F13·F14)
  - Riverpod 3.x: `@riverpod` 어노테이션은 선택사항. `NotifierProvider` 수기 작성도 정식 패턴 (S2b-F04). Riverpod 3.0에서 `AutoDisposeNotifier`가 `Notifier`에 통합됨
  - go_router 17.2.3: 15/16/17 각각 breaking change. `notifyRootObserver` 등 (S2b-F07)
  - d3-force: JavaScript 기반 force simulation. Flutter 통합은 `dart:js_interop`/HtmlElementView 필요 (S2b-F16)

## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성·버전 비교

| 항목 | 18 문서 명시 | synapse-frontend 실측 | 출처 | 진실 | 클래스 |
|------|-------------|---------------------|------|------|-------|
| Dart SDK 제약 | `>=3.0.0 <4.0.0` | `>=3.11.0 <4.0.0` | pubspec.yaml L6-L7 | 코드 | E1 (S2b-F01) |
| flutter_riverpod | ^3.0.0 | ^3.3.1 | pubspec.yaml L12 | 코드 | E2 (S2b-F01) |
| go_router | ^14.0.0 | ^17.2.3 | pubspec.yaml L13 | 코드 | E2 (S2b-F07) |
| google_fonts | ^6.1.0 | ^8.1.0 | pubspec.yaml L15 | 코드 | E2 (S2b-F11) |
| hive | `hive_ce_flutter ^latest` | `hive_flutter ^1.1.0` | pubspec.yaml L16 | 코드 | E2 (S2b-F01) |
| flutter_markdown | ^0.6.18 | ^0.7.6 | pubspec.yaml L17 | 코드 | E2 (S2b-F01) |
| Freezed/codegen | freezed/build_runner 명시 | 의존성 자체 없음 (manual 규약) | pubspec.yaml | 코드 (CLAUDE.md 규약) | E1 (S2b-F04·F05) |
| 빌드 명령 | `--web-renderer canvaskit` | (플래그 자체 폐기됨) | docs.flutter.dev | 공식 | E1 (S2b-F02·F13) |
| 그래프 시각화 | D3.js + WebWorker | Flutter `CustomPainter` (순수 Dart) | graph_screens.dart L70 | 코드 | R+Deep Dive (S2b-F16) |
| 폰트 정책 | Fraunces/Plus Jakarta/Geist Mono | `GoogleFonts.notoSansTextTheme()` | app_theme.dart L16 | 코드 (현 단계) | E2 (S2b-F11) |
| integration_test 디렉토리 | "E2E 통합 테스트 작성됨" 명시 | 디렉토리·코드 자체 없음 | 실측 | 코드 (미작성) | E2 (S2b-F17) |
| BLoC 테스트 패턴 | BlocProvider/MockBloc 예제 | ProviderScope + Riverpod override만 | test/widget_test.dart 외 | 코드 | E2 (S2b-F18) |

### 4.2 사용 위치 경로 실재 확인 (`syn/` → `synapse-frontend/`)

| 18 문서 명시 경로 | 실재 여부 | 정정 finding |
|----------------|----------|------|
| `syn/lib/` 외 (§2.1) | 미존재 | E1 (S2b-F03) |
| `syn/lib/features/*/providers/` (§2.3) | 미존재 (실은 `lib/services/<boundary>/features/<feature>/providers/`) | E1 (S2b-F06) |
| `syn/lib/app/router.dart` (§2.4) | 미존재 (실은 `lib/core/router/app_router.dart`) | E1 (S2b-F09) |
| `syn/lib/core/theme/text_styles.dart` (§2.4 google_fonts) | 미존재 (text_styles.dart 자체 없음) | E1 (S2b-F12) |
| `syn/web/index.html` (§2.5 CanvasKit) | 미존재 (실은 `synapse-frontend/web/index.html`) | E1 (S2b-F15) |

### 4.3 메모리 표준 정합성

- `git-pr-workflow`: ✅ 본 세션도 별도 브랜치 → PR → 머지 대기 워크플로 준수.
- `python-ai-stack-direct-sdk` / `data-sync-outbox-cqrs`: 본 세션 직접 영향 없음 (Flutter 클라이언트 측 영역).

## 5. 발견사항 (Findings)

### §2.1 Flutter 3.x

### S2b-F01 · pubspec 예제의 Dart SDK 제약과 의존성이 실 코드와 6+ 불일치 · E1 / P1

- **section**: §2.1 Flutter 3.x
- **evidence_repo**:
  ```
  synapse-frontend/pubspec.yaml L6-L7: environment: sdk: '>=3.11.0 <4.0.0' (위키: >=3.0.0)
  L12: flutter_riverpod ^3.3.1 (위키: ^3.0.0)
  L13: go_router ^17.2.3 (위키: ^14.0.0)
  L15: google_fonts ^8.1.0 (위키: ^6.1.0)
  L16: hive_flutter ^1.1.0 (위키: hive_ce_flutter ^latest)
  L17: flutter_markdown ^0.7.6 (위키: ^0.6.18)
  freezed_annotation / json_annotation / build_runner / freezed / riverpod_annotation 0건 (CLAUDE.md: codegen 미사용)
  ```
- **patch_target**: L193-L226 (§2.1 pubspec 블록)
- **deep_dive**: false

### S2b-F02 · Flutter Web 빌드 `--web-renderer canvaskit` 플래그 폐기 · E1 / P1

- **section**: §2.1 Flutter 3.x
- **evidence_official**:
  ```
  docs.flutter.dev/platform-integration/web/renderers — "Flutter Web currently has two renderers: CanvasKit (default build mode) and SkWasm (--wasm build mode). The documentation does not mention a --web-renderer flag."
  ```
- **evidence_repo**: `synapse-frontend/web/index.html L36-L45` — `flutter_bootstrap.js`만 사용. `window.flutterConfiguration` 미사용
- **patch_target**: L228-L241 (§2.1 빌드 설정 블록)
- **deep_dive**: false

### S2b-F03 · `syn/` 경로 잔존 → `synapse-frontend/` · E1 / P2

- **section**: §2.1 Flutter 3.x
- **evidence_repo**: `syn/` 디렉토리 미존재. 실 Flutter 모듈은 `synapse-frontend/`
- **patch_target**: L184-L189 (§2.1 프로젝트 내 사용 위치 6행)
- **deep_dive**: false

### §2.3 Riverpod

### S2b-F04 · 코드 예제 전체가 codegen 가정 — 본 프로젝트는 manual provider 규약 · E1 / P1

- **section**: §2.3 Riverpod
- **evidence_official**: riverpod.dev "Riverpod 3.x에서 AutoDisposeNotifier가 Notifier에 통합됨. `@riverpod` 어노테이션은 선택사항."
- **evidence_repo**:
  ```
  synapse-frontend/CLAUDE.md L20: "Riverpod manual providers (codegen 사용 안 함). 모든 Provider는 직접 Provider(...) / NotifierProvider(...) 작성."
  synapse-frontend/lib/core/auth/auth_notifier.dart L6-L8: NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new)
  pubspec.yaml에 riverpod_annotation/riverpod_generator/build_runner/freezed 0건
  ```
- **patch_target**: L432-L523 (§2.3 설정 가이드 코드 블록 전체)
- **deep_dive**: false

### S2b-F05 · pubspec 의존성 블록의 codegen 패키지 제거 · E1 / P2

- **section**: §2.3 Riverpod
- **evidence_repo**: pubspec.yaml에 flutter_riverpod ^3.3.1만 존재
- **patch_target**: L421-L430 (§2.3 pubspec 블록)
- **deep_dive**: false (S2b-F04 결합 가능)

### S2b-F06 · `syn/` 경로 잔존 + 미구현 placeholder 미반영 · E1 / P2

- **section**: §2.3 Riverpod
- **evidence_repo**: 실 경로 `lib/services/<boundary>/features/<feature>/providers/`. 비-Mock NotifierProvider는 `AuthNotifier` 1개만 (S1·S2a에서도 확인된 placeholder 상태)
- **patch_target**: L409-L417 (§2.3 사용 위치 8행)
- **deep_dive**: false

### §2.4 GoRouter

### S2b-F07 · go_router 버전 ^14.0.0 → 실제 ^17.2.3 · E2 / P2

- **section**: §2.4 GoRouter
- **evidence_official**: pub.dev/packages/go_router Latest 17.2.3. 15/16/17 각각 breaking
- **evidence_repo**: pubspec.yaml L13
- **patch_target**: L209 (§2.1 pubspec 예시) + §2.4 본문
- **deep_dive**: false

### S2b-F08 · 라우터 예제 인증 redirect placeholder — 실 코드로 교체 · E2 / P2

- **section**: §2.4 GoRouter
- **evidence_repo**: `synapse-frontend/lib/core/router/app_router.dart L23-L57` — `Provider<GoRouter>` + `ref.watch(authNotifierProvider)` 패턴
- **patch_target**: L589-L632 (§2.4 설정 가이드 코드 블록)
- **deep_dive**: false

### S2b-F09 · `syn/` 경로 잔존 + 라우터 파일 경로 정정 · E1 / P2

- **section**: §2.4 GoRouter
- **evidence_repo**: `lib/core/router/app_router.dart`, `lib/shared/widgets/app_shell.dart`, `lib/shared/widgets/admin_shell.dart`
- **patch_target**: L582-L584 (§2.4 사용 위치 3행)
- **deep_dive**: false

### §2.5 Sliver (재번호 → §2.6)

### S2b-F10 · Sliver 적용 화면 표가 실 구현 범위와 차이 — 대부분 placeholder · E2 / P2

- **section**: §2.5 Sliver (유지)
- **evidence_repo**: 실 사용 5개 파일 (domain_placeholder_scaffold·card_screens·community_screens·gamification_screens·admin_screens). SliverList/SliverPersistentHeader/SliverAnimatedList 미사용.
- **patch_target**: L690-L703 (§2.5/재번호 §2.6 사용 위치 표)
- **deep_dive**: false

### §2.4 google_fonts (재번호 → §2.5)

### S2b-F11 · 버전 ^6.1.0 → ^8.1.0; 폰트 Fraunces/Plus Jakarta → 실제는 Noto Sans · E2 / P2

- **section**: §2.4 google_fonts (재번호 §2.6)
- **evidence_official**: pub.dev/packages/google_fonts Latest 8.1.0
- **evidence_repo**: pubspec.yaml L15 google_fonts ^8.1.0. `lib/core/theme/app_theme.dart L16: GoogleFonts.notoSansTextTheme()`. Fraunces/Plus Jakarta/Geist Mono 사용처 0건
- **patch_target**: L800-L885 (§2.4/재번호 §2.5 본문 + 설정 가이드)
- **deep_dive**: false

### S2b-F12 · `syn/` 경로 잔존 + 미존재 파일(text_styles.dart) 제거 · E1 / P2

- **section**: §2.4 google_fonts (재번호 §2.6)
- **evidence_repo**: `lib/core/theme/app_theme.dart` 존재, `text_styles.dart` 미존재
- **patch_target**: L830-L831 (§2.4/재번호 §2.5 사용 위치)
- **deep_dive**: false

### §2.5 CanvasKit (재번호 → §2.7)

### S2b-F13 · `flutterConfiguration` / `--web-renderer` 모두 폐기 — `flutter_bootstrap.js` 패턴으로 재작성 · E1 / P1

- **section**: §2.5 CanvasKit (재번호 §2.7)
- **evidence_official**: docs.flutter.dev/platform-integration/web/renderers — `_flutter.loader.load({ config: { renderer: ... } })` 패턴. `--web-renderer` 플래그 제거됨
- **evidence_repo**: `synapse-frontend/web/index.html L34,L36-L45` — `<link rel="preload" href="canvaskit/canvaskit.wasm">` + `<script src="flutter_bootstrap.js" async>`
- **patch_target**: L936-L971 (§2.5/재번호 §2.7 설정 가이드)
- **deep_dive**: false

### S2b-F14 · 대안 비교 표의 HTML 렌더러 — 폐기됨을 명시 + SkWasm 추가 · E1 / P2

- **section**: §2.5 CanvasKit (재번호 §2.7)
- **evidence_official**: docs.flutter.dev/platform-integration/web/renderers — CanvasKit + SkWasm 두 변종만. HTML 폐기
- **patch_target**: L912-L918 (§2.5/재번호 §2.7 대안 비교)
- **deep_dive**: false

### S2b-F15 · `syn/` 경로 잔존 · E1 / P2

- **section**: §2.5 CanvasKit (재번호 §2.7)
- **evidence_repo**: 실 경로 `synapse-frontend/web/index.html`
- **patch_target**: L930-L932 (§2.5/재번호 §2.7 사용 위치)
- **deep_dive**: false

### §2.6 D3.js (재번호 → §2.8) — 절 전체 재작성

### S2b-F16 · D3.js 채택 단언 → 실제는 순수 Flutter CustomPainter, 절 전체 재작성 · R / P1

- **section**: §2.6 D3.js (재번호 §2.8)
- **evidence_official**: d3js.org/d3-force — d3-force는 JavaScript 라이브러리. Flutter 통합은 dart:js_interop/HtmlElementView 필요
- **evidence_repo**:
  ```
  synapse-frontend/lib/services/knowledge/features/graph/presentation/screens/graph_screens.dart L70: class _GraphPainter extends CustomPainter
  HtmlElementView / d3 / js_interop / js_util 사용처 0건
  synapse-frontend/web/js/ 디렉토리 미존재
  pubspec.yaml에 d3 또는 그래프 라이브러리 의존성 전무
  ```
- **proposed_text** (절 전체 재작성):
  ```markdown
  ### 2.8 지식 그래프 시각화 (Flutter CustomPainter 기반)

  #### 개요
  현 단계 Synapse 지식 그래프는 **Flutter `CustomPainter` + `Canvas` API**로 직접 노드/엣지를 그린다. 외부 JS 라이브러리(D3.js)에 의존하지 않으므로 Web/Mobile에서 동일한 코드로 동작하며, JS Interop 오버헤드가 없다.

  #### 역할
  노트 간 백링크 관계를 노드-링크 다이어그램으로 시각화한다. 노드는 `pageRank` 기반으로 색상/크기 가중치를 주고, 클러스터는 색상으로 구분한다. 선택·하이라이트·디밍 상태를 painter 레벨에서 처리한다.

  #### 선택 이유
  - 단일 코드베이스: Web/iOS/Android에서 동일한 `Canvas` API로 픽셀 동일 렌더링
  - JS Interop 미사용: `dart:js_interop` 호환성 이슈, WebView 보안 문제, mobile 폴백 분기를 회피
  - 학습 비용 최소화: Flutter 팀이 이미 `CustomPainter` 패턴에 익숙

  #### 대안 비교

  | 기술 | 장점 | 단점 | 선택 여부 |
  |------|------|------|-----------|
  | **Flutter `CustomPainter`** | 단일 코드베이스, JS Interop 불필요, mobile 동등 | 대규모 force 시뮬레이션 직접 구현 | ✅ 선택 (현 단계) |
  | D3.js (`d3-force`) | 검증된 force simulation, 풍부한 인터랙션 | Web 전용, mobile 폴백 별도, JS Interop 복잡도 | ❌ (검토했으나 미채택) |
  | `flutter_force_directed_graph` | Flutter 네이티브 force | 커뮤니티 작음, 커스터마이징 제한 | 향후 검토 |

  #### 핵심 기능 (현 구현)
  - `CustomPainter.paint(Canvas, Size)` — 엣지(`drawLine`) + 노드(`drawCircle`) + 라벨(`TextPainter`)
  - 사전 계산된 `x`/`y` 좌표 (Mock) — Phase D에서 force layout 알고리즘 적용 예정
  - `shouldRepaint`로 선택/디밍 상태 변화 시에만 재페인트

  #### 프로젝트 내 사용 위치
  - `synapse-frontend/lib/services/knowledge/features/graph/presentation/screens/graph_screens.dart` — `_GraphPainter extends CustomPainter`
  - (없음) `web/js/` JS Worker 디렉토리는 존재하지 않음

  #### 향후 계획
  - 대규모 그래프(>500 노드) 도달 시 force layout 알고리즘을 Isolate에서 실행하거나, `flutter_force_directed_graph` 같은 패키지 도입 검토
  - JS interop 도입은 mobile 호환성 비용 대비 이득이 명확해진 시점에 재평가

  #### 더 깊이 / Deep Dive — D3.js → CustomPainter 결정 이력
  > 출처: synapse-frontend/lib/.../graph_screens.dart · 검증 일자: 2026-05-28

  - **드리프트 원인**: 위키 §2.6은 "지식 그래프는 Obsidian/Roam처럼 D3 force를 사용한다"는 *디자인 의도*를 기록했지만, 5주 단축 일정(`2026-05-11-schedule-5week-revamp`)에서 JS Interop·WebView·mobile 폴백 분기 비용을 부담할 수 없다고 판단되어 순수 Flutter `CustomPainter`로 단순화됨. 그러나 18 문서는 미갱신.
  - **현 시점 영향**: 위키만 보고 진입하는 신규 인력이 "D3.js 통합 코드를 찾는다 → 존재하지 않는다 → 혼란" 시나리오. 향후 누군가 위키 그대로 `d3.v7.min.js`를 import하면 mobile에서 깨진다.
  - **실전 베스트프랙티스**: 그래프 화면 진입 시 `RepaintBoundary`로 그래프 페인터를 분리 → 인근 위젯 리빌드 시 페인터 재페인트 회피
  - **운영 함정**: 노드 수 증가 시 `paint()`가 16ms를 초과하면 60fps 미달 → `Isolate.run`으로 좌표 계산 분리 + `ValueListenable`로 페인터에 전달

  #### 참고 자료
  - Flutter `CustomPainter`: https://api.flutter.dev/flutter/rendering/CustomPainter-class.html
  - d3-force (향후 검토용): https://d3js.org/d3-force
  ```
- **patch_target**: L988-L1089 (§2.6 D3.js 절 전체 / 재번호 §2.8)
- **deep_dive**: true

### §2.7 flutter_test (재번호 → §2.9)

### S2b-F17 · integration_test 미작성 — 본문 과장, "Phase D 이후 적용 예정"으로 솔직히 표기 · E2 / P2

- **section**: §2.7 flutter_test (재번호 §2.9)
- **evidence_repo**:
  ```
  pubspec.yaml L23-L24: integration_test (SDK) — dev_dependencies에 존재
  synapse-frontend/integration_test/ 디렉토리 자체 미존재
  synapse-frontend/test/ — 18개 파일, testWidgets 19회 사용 (단위·위젯만)
  ```
- **patch_target**: L1097-L1180 (§2.7/재번호 §2.9 본문 + 사용 위치)
- **deep_dive**: false

### S2b-F18 · BLoC 기반 테스트 예제 → Riverpod `ProviderScope` override 패턴으로 교체 · E2 / P2

- **section**: §2.7 flutter_test (재번호 §2.9)
- **evidence_repo**: `synapse-frontend/test/widget_test.dart` 외 모든 테스트는 `ProviderScope` + `provider.overrideWithValue(...)` 패턴. BlocProvider/MockBloc/bloc_test 사용처 0건
- **patch_target**: L1130-L1189 (§2.7/재번호 §2.9 코드 예제 + 트러블슈팅)
- **deep_dive**: false

### OK 항목 통합 표

| finding_id | section | 한 줄 사유 | 증거 |
|-----------|---------|----------|------|
| S2b-F19 | §2.1 Flutter 3.x | Impeller·CanvasKit·Isolates 본문 설명 적절 | context7 + docs.flutter.dev |
| S2b-F20 | §2.3 Riverpod | 채택 이유 + 대안 비교 (BLoC/Provider/GetX/MobX) 적절 | riverpod.dev |
| S2b-F21 | §2.4 GoRouter | 채택 이유 + ShellRoute/redirect 핵심 기능 적절 | pub.dev/go_router |
| S2b-F22 | §2.5 Sliver (유지) | 단일 스크롤 컨텍스트 + lazy building 설명 적절 | docs.flutter.dev/ui/layout/scrolling/slivers |
| S2b-F23 | §2.5 CanvasKit (재번호 §2.7) | 픽셀 퍼펙트 + Mobile 일관성 채택 이유 적절 | docs.flutter.dev/platform-integration/web/renderers |
| S2b-F24 | §2.7 flutter_test (재번호 §2.9) | SDK 내장 + WidgetTester API 채택 이유 적절 | docs.flutter.dev/testing/overview |

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

| finding_id | 절 (재번호 후) | Deep Dive 제목 | 핵심 요지(1줄) |
|-----------|-----|-------------|-------------|
| S2b-F16 | §2.8 지식 그래프 (재작성) | D3.js → CustomPainter 결정 이력 | 5주 단축 일정의 트레이드오프 + RepaintBoundary·Isolate 베스트프랙티스 |

## 7. 위키 패치 diff 요약

위키 커밋: `documents.wiki@463c43d` (master)
파일: `18_기술_스택_정의서.md` (5618 → 5556줄, +251 / -315 — net 약 -62줄, §2.8 D3.js 코드·§2.3 codegen 예제·§2.7 CanvasKit 구식 설정 등 deprecated 항목 제거가 추가보다 많음)

| 변경 영역 | 위치 | 변경 유형 |
|---------|------|---------|
| 절 번호 재부여 (5건) | L800·L651·L901·L988·L1092 헤더 | google_fonts §2.4→§2.6, Sliver §2.5→§2.5(유지), CanvasKit §2.5→§2.7, D3.js §2.6→§2.8, flutter_test §2.7→§2.9 |
| S2b-F01 §2.1 pubspec | L193-L226 | 33행 → 27행 (go_router 14→17, google_fonts 6→8, hive_ce→hive, codegen 제거, SDK 3.0→3.11) |
| S2b-F02 §2.1 빌드 | L228-L241 | `--web-renderer` 플래그 → `flutter_bootstrap.js` + `--wasm` |
| S2b-F03 §2.1 사용 위치 | L184-L189 | `syn/lib/` 6행 → `synapse-frontend/lib/` 7행 |
| S2b-F04~F06 §2.3 Riverpod | L409-L478 | codegen 예제 100+행 → manual provider(AuthNotifier) 50행 |
| S2b-F07~F09 §2.4 GoRouter | L549-L584, L582 | 사용 위치 정정 + redirect 예제를 Provider<GoRouter> 실 코드로 |
| S2b-F11·F12 §2.6 google_fonts | L800-L862 | Fraunces/Plus Jakarta 30행 → Noto Sans 단순화 + 사용 위치 |
| S2b-F13~F15 §2.7 CanvasKit | L887-L932 | flutterConfiguration·--web-renderer → flutter_bootstrap.js + 렌더러 비교 표 |
| S2b-F16 §2.8 D3.js → CustomPainter | L939-L1039 | 절 전체 재작성 (105행 → 100행) + Deep Dive 추가 |
| S2b-F17·F18 §2.9 flutter_test | L1080-L1138 | BLoC mock 예제 → ProviderScope override 패턴 + integration_test "Phase D 이후" 명시 |
| §11 변경 이력 | L6755 근처 | v2.3-S2b 행 추가 (구조 변경·정정 상세) |

커밋 메시지 본문:
```
docs(stack): S2b 프론트엔드 프레임워크 — context7·repo 검증 반영 + 보강
E1:11 · E2:6 · D:0 · R:1 · OK:6
P0:0 · P1:5 · P2:13
§2.1·§2.3·§2.4·§2.5·§2.6·§2.7·§2.8·§2.9 Flutter 스택 7개 기술
구조 변경: §2.4·§2.5 절 번호 충돌 해소
주요 정정 (P1): pubspec / build 명령 / Riverpod manual / CanvasKit bootstrap / D3 → CustomPainter
Refs: documents PR #<TBD>
```

## 8. 후속 과제 (Follow-ups)

### S1+S2a 위임 처리 완료

- ✅ §2.4·§2.5 절 번호 충돌 → 재번호 부여 (§2.5/§2.6/§2.7/§2.8/§2.9)
- ✅ §2.1 Flutter SDK 제약 정정 (>=3.0.0 → >=3.11.0)
- ✅ §2.x `syn/` 경로 잔존 5개 절 전부 정리 (synapse-frontend/로 통일)

### 별도 작업 (v2.3 통합 정리, 6 세션 종료 후)

- **§12.2 Flutter 생태계 버전 매핑 표**: go_router 14→17, google_fonts 6→8, freezed/build_runner 제거(미사용) 반영 검토
- **§10.1 요약표**: 본 S2b 정정 반영
- **§4.2.4 → §2.8 D3.js 절 재작성**의 다른 절 영향 (RAG·시맨틱 검색 등) 검증

### 별도 결정 사항 (위키 정정 외)

- **5주 단축 일정 트레이드오프 ADR화 검토**: §2.8 Deep Dive에서 명시한 "JS Interop 회피 결정"을 ADR로 정식화하면 향후 D3 도입 재고 시 근거가 됨
- **integration_test 실제 작성**: Phase D 백엔드 연동 완료 후 SRS 복습 플로우·노트 에디터 입력 E2E 시나리오 작성

### S3/S4/S5/S6 위임

- 본 세션에서 새로 발생한 다른 세션 영역 위임 항목 없음 (S2b는 Frontend 자기완결적)

### 운영 표준 예외 기록

- 위키에 추가로 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 dual-commit 예외 (S1·S2a 동일 패턴)

### 메모리 갱신 후보

- **`flutter-frontend-policy`** (검토): "Riverpod manual providers (no codegen)", "지식 그래프 = CustomPainter (no D3)", "integration_test Phase D 이후" 등 본 세션 정착 정책을 별도 메모리화 검토. S6/S7 세션 시작 전 결정.
