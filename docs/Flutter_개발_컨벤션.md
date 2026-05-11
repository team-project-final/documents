# Flutter 개발 컨벤션

> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS  
> **버전**: v1.0  
> **작성일**: 2026-05-11  
> **대상**: 프론트엔드 개발자  
> **기술 스택**: Flutter 3.x / Dart 3.x / Riverpod 3.0 / GoRouter 14 / Dio 5 / CanvasKit

---

## 1. 개요

본 문서는 Synapse 프론트엔드 개발자가 Flutter 코드 작성 시 준수해야 하는 컨벤션을 정의한다.

### DESIGN.md 연동

UI 구현 시 반드시 [DESIGN.md](../DESIGN.md)를 참조한다. 색상/타이포/스페이싱/모션/컴포넌트 패턴은 DESIGN.md가 단일 소스(Single Source of Truth)이며, 본 문서는 **Flutter 코드로 어떻게 적용하는지**를 정의한다.

### 관련 문서

| 문서 | 역할 |
|------|------|
| [공통 개발 규칙](./공통_개발_규칙.md) | 전체 팀원 공통 규칙 (먼저 읽을 것) |
| [Spring 개발 컨벤션](./Spring_개발_컨벤션.md) | 백엔드 컨벤션 |
| [DESIGN.md](../DESIGN.md) | UI 디자인 시스템 (색상, 타이포, 스페이싱, 모션) |
| [wiki 05_화면_흐름_시퀀스](https://github.com/Public-Project-Area-Oragans/syn/wiki/05_화면_흐름_시퀀스_다이어그램) | 유저 플로우 |
| [wiki 06_화면_기능_정의서](https://github.com/Public-Project-Area-Oragans/syn/wiki/06_화면_기능_정의서) | 화면 인벤토리 |
| [wiki 18_기술_스택_정의서](https://github.com/Public-Project-Area-Oragans/syn/wiki/18_기술_스택_정의서) | 기술 스택 상세 |

---

## 2. 기본 규칙

---

### 2.1 폴더 구조

**Feature-first** 구조를 사용한다. 기능별로 완결된 폴더를 구성하고, 공용 코드만 `core/`와 `shared/`에 배치한다.

#### 표준 폴더 트리

```
lib/
├── main.dart                        # 진입점 + ProviderScope 래핑
├── app.dart                         # MaterialApp + GoRouter + ThemeData
├── core/                            # 앱 전체 공통 (변경 빈도 낮음)
│   ├── constants/                   # 정적 상수
│   │   ├── app_colors.dart          # DESIGN.md 색상 토큰
│   │   ├── app_spacing.dart         # DESIGN.md 스페이싱 토큰
│   │   ├── app_text_styles.dart     # DESIGN.md 타이포 토큰
│   │   ├── app_breakpoints.dart     # 반응형 브레이크포인트
│   │   └── app_routes.dart          # GoRouter 경로 상수
│   ├── theme/                       # ThemeData 확장
│   │   ├── app_theme.dart           # Light/Dark 테마
│   │   └── app_theme_extensions.dart
│   ├── network/                     # HTTP 클라이언트
│   │   ├── dio_client.dart          # Dio 인스턴스 + 인터셉터
│   │   ├── auth_interceptor.dart    # 토큰 갱신
│   │   └── tenant_interceptor.dart  # X-Tenant-Id 주입
│   ├── error/                       # 에러 모델
│   │   ├── app_exception.dart       # 커스텀 예외 계층
│   │   └── error_handler.dart       # 전역 에러 핸들링
│   └── utils/                       # 유틸리티
│       ├── date_formatter.dart
│       └── string_extensions.dart
├── shared/                          # 재사용 위젯/모델 (여러 feature에서 사용)
│   ├── widgets/                     # 공용 위젯
│   │   ├── app_loading_widget.dart
│   │   ├── app_error_widget.dart
│   │   ├── app_empty_widget.dart
│   │   └── app_skeleton.dart
│   └── models/                      # 공용 도메인 모델
│       ├── user.dart
│       └── pagination.dart
├── features/                        # 기능별 모듈 (핵심!)
│   ├── auth/                        # 인증
│   │   ├── data/                    # Repository 구현 + DTO
│   │   │   ├── auth_repository_impl.dart
│   │   │   ├── auth_remote_data_source.dart
│   │   │   └── dto/
│   │   │       ├── login_request_dto.dart
│   │   │       └── auth_response_dto.dart
│   │   ├── domain/                  # 모델 + Repository 인터페이스
│   │   │   ├── auth_repository.dart
│   │   │   └── models/
│   │   │       └── auth_state.dart
│   │   ├── presentation/           # 화면 + 위젯
│   │   │   ├── login_screen.dart
│   │   │   └── widgets/
│   │   │       └── login_form.dart
│   │   └── providers/              # Riverpod Provider
│   │       └── auth_provider.dart
│   ├── notes/
│   ├── cards/
│   ├── graph/
│   └── dashboard/
└── l10n/                            # 국제화
    ├── app_ko.arb
    └── app_en.arb
```

#### 폴더 규칙

| 규칙 | 설명 |
|------|------|
| Feature 자기 완결 | 각 feature 폴더가 data/domain/presentation/providers를 자체 보유 |
| 횡단 참조 금지 | `features/notes/`에서 `features/cards/data/` 직접 import 금지 |
| 공유가 필요하면 | `shared/`로 올리거나 이벤트/Provider 구독으로 연결 |
| 3단계 이상 상대경로 금지 | `../../../` 대신 `package:synapse/` 사용 |

#### Good 예제

```dart
// notes feature 내부에서의 import — 상대경로 OK (같은 feature)
import '../providers/note_list_provider.dart';
import '../domain/models/note.dart';

// 다른 feature의 기능이 필요하면 → shared/models 또는 Provider 구독
import 'package:synapse/shared/models/user.dart';  // 공용 모델
```

#### Bad 예제

```dart
// feature 횡단 import — 금지
import 'package:synapse/features/cards/data/card_repository_impl.dart'; // cards의 내부 구현!
import '../../../core/network/../../features/auth/data/auth_dto.dart';  // 경로 지옥
```

---

### 2.2 네이밍 컨벤션

#### 파일/클래스/변수

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 | snake_case | `note_editor_screen.dart` |
| 클래스/위젯 | PascalCase | `NoteEditorScreen` |
| 변수/함수 | camelCase | `noteCount`, `fetchNotes()` |
| 상수 | lowerCamelCase | `defaultPageSize`, `maxRetryCount` |
| private | `_` 접두사 | `_buildHeader()`, `_noteCache` |
| enum 값 | camelCase | `NoteStatus.published` |
| 파일과 클래스 | 1:1 매칭 | `note_card.dart` → `NoteCard` |

#### 역할별 접미사

| 접미사 | 역할 | 예시 |
|--------|------|------|
| `*Screen` | 전체 페이지 (Scaffold 포함) | `NoteListScreen` |
| `*Widget` | 재사용 가능 위젯 | `NoteCardWidget` |
| `*Provider` | Riverpod Provider | `noteListProvider` |
| `*Notifier` | Riverpod Notifier | `NoteEditorNotifier` |
| `*Repository` | 데이터 접근 추상화 | `NoteRepository` |
| `*DataSource` | 원격/로컬 데이터 소스 | `NoteRemoteDataSource` |
| `*Dto` | API 전송 객체 | `NoteResponseDto` |
| `*Model` / 접미사 없음 | 도메인 모델 | `Note`, `ReviewResult` |

#### Good 예제

```dart
// 파일명과 클래스 일치, 역할 명확
// file: note_list_screen.dart
class NoteListScreen extends ConsumerWidget { ... }

// file: note_repository.dart
abstract class NoteRepository { ... }

// file: note_list_provider.dart
final noteListProvider = FutureProvider.autoDispose<List<Note>>((ref) { ... });
```

#### Bad 예제

```dart
// 파일명과 클래스 불일치
// file: notes.dart
class NoteListPage { ... }     // 파일명 모호, Page 대신 Screen 사용

// 접미사 없음 — 역할 불명확
class NoteManager { ... }      // Repository? Service? Provider?
class NoteHelper { ... }       // 무슨 도움?
class NoteBloc { ... }         // BLoC 미사용 프로젝트에서 혼란

// 네이밍 규칙 위반
class noteCard { ... }         // 소문자 시작 — PascalCase 위반
var NoteCount = 0;             // 대문자 시작 — camelCase 위반
```

---

### 2.3 위젯 작성 규칙

#### 핵심 원칙

| 규칙 | 설명 |
|------|------|
| StatelessWidget 우선 | Riverpod `ConsumerWidget`으로 상태 접근 — StatefulWidget 최소화 |
| build() 50줄 제한 | 초과 시 private 위젯 메서드 또는 별도 위젯으로 추출 |
| 파일당 public 위젯 1개 | private helper 위젯(`_`)은 같은 파일에 허용 |
| const 생성자 필수 | 모든 정적 위젯은 `const` 생성자 사용 |
| key 전달 | 모든 public 위젯에 `{super.key}` 포함 |

#### Good 예제

```dart
// ConsumerWidget + const + 작은 build + 헬퍼 분리
class NoteCard extends ConsumerWidget {
  const NoteCard({super.key, required this.noteId});
  final String noteId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final noteAsync = ref.watch(noteProvider(noteId));
    return noteAsync.when(
      data: (note) => _NoteCardContent(note: note),
      loading: () => const NoteCardSkeleton(),
      error: (e, _) => AppErrorWidget(error: e, onRetry: () => ref.invalidate(noteProvider(noteId))),
    );
  }
}

// private 헬퍼 위젯 — 같은 파일에 허용
class _NoteCardContent extends StatelessWidget {
  const _NoteCardContent({required this.note});
  final Note note;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(note.title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(note.summary ?? '', style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}
```

#### Bad 예제

```dart
// StatefulWidget 남용 + 거대 build + const 미사용
class NoteCard extends StatefulWidget {  // Riverpod ConsumerWidget이면 충분
  NoteCard({required this.noteId});       // const 누락, key 누락
  final String noteId;
  
  @override
  State<NoteCard> createState() => _NoteCardState();
}

class _NoteCardState extends State<NoteCard> {
  @override
  Widget build(BuildContext context) {
    // 200줄의 거대한 build 메서드...
    return Container(
      color: Color(0xFFD97706),  // 하드코딩 색상! AppColors.primaryAmber 사용
      padding: EdgeInsets.all(16), // const 누락, AppSpacing.md 사용
      child: Column(children: [
        // ... 100줄 더 ...
      ]),
    );
  }
}
```

---

### 2.4 코드 포맷팅

#### 기본 설정

| 항목 | 규칙 |
|------|------|
| 포맷터 | `dart format` (자동) |
| 줄 길이 | 80자 |
| trailing comma | **강제** (위젯 트리 정렬 최적화) |
| 린트 | `flutter_lints` + 프로젝트 커스텀 |

#### analysis_options.yaml

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  strong-mode:
    implicit-casts: false
    implicit-dynamic: false
  errors:
    missing_required_param: error
    missing_return: error
    todo: warning
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

linter:
  rules:
    # 필수
    - always_declare_return_types
    - avoid_dynamic_calls
    - avoid_print
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_final_locals
    - require_trailing_commas
    - sort_pub_dependencies
    # 네이밍
    - camel_case_types
    - file_names
    - non_constant_identifier_names
    # 스타일
    - avoid_empty_else
    - avoid_unnecessary_containers
    - sized_box_for_whitespace
    - use_colored_box
```

#### trailing comma 규칙

```dart
// Good — trailing comma → 포맷터가 각 인자를 별도 줄로 정렬
Container(
  padding: const EdgeInsets.all(AppSpacing.md),
  decoration: BoxDecoration(
    color: AppColors.stone50,
    borderRadius: BorderRadius.circular(8),
  ),
  child: const Text('Hello'),
)

// Bad — trailing comma 없음 → 한 줄로 뭉침 (가독성 저하)
Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)), child: const Text('Hello'))
```

---

### 2.5 import 정리

#### 순서 (자동 정렬)

```dart
// 1. dart: 내장 라이브러리
import 'dart:async';
import 'dart:convert';

// 2. package: 외부 패키지
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// 3. package: 프로젝트 (core/shared — 절대경로)
import 'package:synapse/core/constants/app_colors.dart';
import 'package:synapse/shared/widgets/app_error_widget.dart';

// 4. 상대경로 (같은 feature 내에서만)
import '../providers/note_list_provider.dart';
import '../domain/models/note.dart';
```

#### barrel file (index) 규칙

```dart
// features/notes/notes.dart — feature의 공개 API만 export
export 'domain/models/note.dart';
export 'providers/note_list_provider.dart';
export 'presentation/note_list_screen.dart';
// data/ 내부는 export하지 않음 (구현 상세)
```

#### 규칙

| 규칙 | 설명 |
|------|------|
| 상대경로 | 같은 feature 내에서**만** 허용 |
| 3단계 이상 `../` | 금지 → `package:synapse/` 절대경로 사용 |
| feature 횡단 | `package:synapse/features/X/` 직접 import 금지 |
| barrel file | feature 공개 API만 export (data/ 내부 숨김) |
| show/hide | 대형 패키지에서 필요한 것만 `show` |

#### Good 예제

```dart
// 깔끔한 import
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:synapse/core/constants/app_spacing.dart';
import 'package:synapse/shared/widgets/app_loading_widget.dart';

import '../providers/note_list_provider.dart';
```

#### Bad 예제

```dart
// 순서 뒤섞임 + feature 횡단 + 깊은 상대경로
import '../providers/note_list_provider.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:synapse/features/cards/data/card_repository_impl.dart'; // 횡단!
import '../../../core/network/dio_client.dart'; // 3단계 상대경로
```

---

## 3. 심화 패턴

> Good/Bad 코드 예제 + Why 설명 포함.

---

### 3.1 상태관리 (Riverpod 3.0)

#### Provider 의사결정 테이블

| 상황 | Provider 타입 | 예시 |
|------|--------------|------|
| 단순 계산/변환 | `Provider` | `filteredNotesProvider` |
| 1회성 비동기 데이터 | `FutureProvider` | `userProfileProvider` |
| 실시간 스트림 | `StreamProvider` | `notificationsProvider` |
| 변경 가능 상태 + 액션 | `NotifierProvider` | `noteEditorProvider` |
| ID별 인스턴스 필요 | `.family` modifier | `noteProvider(noteId)` |
| 화면 이탈 시 해제 | `autoDispose` | 대부분의 화면 Provider |

#### autoDispose 사용 기준

| 사용 | 미사용 |
|------|--------|
| 화면별 데이터 (상세, 편집) | 전역 상태 (인증, 테넌트) |
| 일시적 폼 상태 | 캐시 유지가 필요한 목록 |
| 검색 결과 | 앱 수명 동안 유지할 설정 |

#### Good 예제 — @riverpod 코드 생성

```dart
// providers/note_list_provider.dart
@riverpod
Future<List<Note>> noteList(NoteListRef ref) async {
  final repository = ref.watch(noteRepositoryProvider);
  return repository.fetchNotes();
}

// providers/note_provider.dart — family (ID별 인스턴스)
@riverpod
Future<Note> note(NoteRef ref, String noteId) async {
  final repository = ref.watch(noteRepositoryProvider);
  final result = await repository.getNote(noteId);
  return result.when(
    success: (note) => note,
    failure: (e) => throw e,
  );
}

// providers/note_editor_provider.dart — Notifier (변경 가능 상태)
@riverpod
class NoteEditor extends _$NoteEditor {
  @override
  NoteEditorState build(String noteId) {
    // 초기 상태 로딩
    _loadNote(noteId);
    return NoteEditorState.loading();
  }

  Future<void> _loadNote(String noteId) async {
    final repo = ref.read(noteRepositoryProvider);
    final result = await repo.getNote(noteId);
    state = result.when(
      success: (note) => NoteEditorState.loaded(
        noteId: noteId,
        title: note.title,
        content: note.content,
        tags: note.tags,
      ),
      failure: (e) => NoteEditorState.error(e),
    );
  }

  void updateTitle(String title) {
    if (state case NoteEditorState(:final loaded?)) {
      state = loaded.copyWith(title: title, isDirty: true);
    }
  }

  Future<void> save() async {
    if (state case NoteEditorState(:final loaded?)) {
      state = loaded.copyWith(saving: true);
      final repo = ref.read(noteRepositoryProvider);
      final result = await repo.updateNote(
        noteId: loaded.noteId,
        request: NoteUpdateRequest(title: loaded.title, content: loaded.content),
      );
      state = result.when(
        success: (_) => loaded.copyWith(saving: false, isDirty: false),
        failure: (e) => loaded.copyWith(saving: false, error: e),
      );
    }
  }
}
```

#### Bad 예제

```dart
// StateProvider로 복잡한 상태 관리 — 일관성 없음
final noteTitleProvider = StateProvider<String>((ref) => '');
final noteContentProvider = StateProvider<String>((ref) => '');
final noteSavingProvider = StateProvider<bool>((ref) => false);
final noteErrorProvider = StateProvider<String?>((ref) => null);
// 4개 Provider가 각각 독립 → 상태 일관성 보장 불가

// Provider 안에서 부작용(side effect) 직접 실행
final noteProvider = Provider<Note>((ref) {
  final dio = ref.read(dioProvider);
  dio.post('/analytics', data: {'event': 'note_viewed'}); // 부작용!
  return Note.empty();
});
```

---

### 3.2 라우팅 (GoRouter)

#### 경로 상수 — 중앙 관리

```dart
// core/constants/app_routes.dart
abstract class AppRoutes {
  // Auth
  static const login = '/login';
  static const register = '/register';
  static const onboarding = '/onboarding';

  // Main (ShellRoute 하위)
  static const home = '/';
  static const notes = '/notes';
  static const noteDetail = '/notes/:noteId';
  static const noteEditor = '/notes/:noteId/edit';
  static const cards = '/cards';
  static const cardReview = '/cards/review';
  static const graph = '/graph';
  static const settings = '/settings';
  static const profile = '/settings/profile';

  // 헬퍼 — 파라미터 치환
  static String noteDetailPath(String noteId) => '/notes/$noteId';
  static String noteEditorPath(String noteId) => '/notes/$noteId/edit';
}
```

#### GoRouter 설정

```dart
// app.dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: kDebugMode,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isOnboarded = authState.isOnboarded;
      final currentPath = state.matchedLocation;

      final authRoutes = [AppRoutes.login, AppRoutes.register];
      final isOnAuthRoute = authRoutes.contains(currentPath);

      // 미인증 → 로그인으로
      if (!isLoggedIn && !isOnAuthRoute) return AppRoutes.login;
      // 인증됨 + 로그인 페이지 → 홈으로
      if (isLoggedIn && isOnAuthRoute) return AppRoutes.home;
      // 인증됨 + 온보딩 미완료 → 온보딩으로
      if (isLoggedIn && !isOnboarded && currentPath != AppRoutes.onboarding) {
        return AppRoutes.onboarding;
      }
      return null; // 리다이렉트 없음
    },
    routes: [
      // 인증 라우트 (ShellRoute 밖)
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
      GoRoute(path: AppRoutes.register, builder: (_, __) => const RegisterScreen()),
      GoRoute(path: AppRoutes.onboarding, builder: (_, __) => const OnboardingScreen()),

      // 메인 ShellRoute (하단 탭 유지)
      ShellRoute(
        builder: (_, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.notes,
            builder: (_, __) => const NoteListScreen(),
            routes: [
              GoRoute(
                path: ':noteId',
                builder: (_, state) => NoteDetailScreen(
                  noteId: state.pathParameters['noteId']!,
                ),
                routes: [
                  GoRoute(
                    path: 'edit',
                    builder: (_, state) => NoteEditorScreen(
                      noteId: state.pathParameters['noteId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          GoRoute(path: AppRoutes.cards, builder: (_, __) => const CardListScreen()),
          GoRoute(path: AppRoutes.graph, builder: (_, __) => const GraphScreen()),
          GoRoute(path: AppRoutes.settings, builder: (_, __) => const SettingsScreen()),
        ],
      ),
    ],
  );
});
```

#### Good 예제 — 네비게이션

```dart
// 상수 사용 + 타입 안전
context.go(AppRoutes.noteDetailPath(note.id));
context.push(AppRoutes.noteEditorPath(note.id));
context.pop(); // 뒤로 가기
```

#### Bad 예제

```dart
// 하드코딩 문자열 경로
context.go('/notes/${note.id}');         // 오타 위험, 리팩토링 어려움
Navigator.push(context, MaterialPageRoute(  // GoRouter 미사용
  builder: (_) => NoteDetailScreen(noteId: note.id),
));
```

---

### 3.3 API 통신 패턴

#### 3계층 구조

```
Repository (추상) → RemoteDataSource (HTTP) → DTO → Domain Model
```

#### Repository 인터페이스 (domain/)

```dart
// features/notes/domain/note_repository.dart
abstract class NoteRepository {
  Future<Result<List<Note>>> fetchNotes({String? cursor, int limit = 20});
  Future<Result<Note>> getNote(String noteId);
  Future<Result<Note>> createNote(NoteCreateRequest request);
  Future<Result<void>> updateNote({required String noteId, required NoteUpdateRequest request});
  Future<Result<void>> deleteNote(String noteId);
}
```

#### Result 타입 (에러 핸들링)

```dart
// core/error/result.dart
sealed class Result<T> {
  const Result();
  factory Result.success(T data) = Success<T>;
  factory Result.failure(AppException error) = Failure<T>;

  R when<R>({
    required R Function(T data) success,
    required R Function(AppException error) failure,
  });
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);

  @override
  R when<R>({required R Function(T) success, required R Function(AppException) failure}) {
    return success(data);
  }
}

class Failure<T> extends Result<T> {
  final AppException error;
  const Failure(this.error);

  @override
  R when<R>({required R Function(T) success, required R Function(AppException) failure}) {
    return failure(error);
  }
}
```

#### Repository 구현 (data/)

```dart
// features/notes/data/note_repository_impl.dart
class NoteRepositoryImpl implements NoteRepository {
  final NoteRemoteDataSource _remote;
  NoteRepositoryImpl(this._remote);

  @override
  Future<Result<List<Note>>> fetchNotes({String? cursor, int limit = 20}) async {
    try {
      final dtos = await _remote.fetchNotes(cursor: cursor, limit: limit);
      final notes = dtos.map((dto) => dto.toDomain()).toList();
      return Result.success(notes);
    } on AppException catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<Note>> createNote(NoteCreateRequest request) async {
    try {
      final dto = await _remote.createNote(request);
      return Result.success(dto.toDomain());
    } on AppException catch (e) {
      return Result.failure(e);
    }
  }
}
```

#### RemoteDataSource (data/)

```dart
// features/notes/data/note_remote_data_source.dart
class NoteRemoteDataSource {
  final Dio _dio;
  NoteRemoteDataSource(this._dio);

  Future<List<NoteDto>> fetchNotes({String? cursor, int limit = 20}) async {
    final response = await _dio.get('/api/v1/notes', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
    });
    final list = (response.data['data'] as List)
        .map((json) => NoteDto.fromJson(json as Map<String, dynamic>))
        .toList();
    return list;
  }

  Future<NoteDto> createNote(NoteCreateRequest request) async {
    final response = await _dio.post('/api/v1/notes', data: request.toJson());
    return NoteDto.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
```

#### Dio 인터셉터 — 토큰 갱신 + 테넌트 헤더

```dart
// core/network/auth_interceptor.dart
class AuthInterceptor extends Interceptor {
  final Ref ref;
  AuthInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = ref.read(authStateProvider).accessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // 토큰 갱신 시도
      final refreshed = await ref.read(authStateProvider.notifier).refreshToken();
      if (refreshed) {
        // 원래 요청 재시도
        final token = ref.read(authStateProvider).accessToken;
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      }
    }
    handler.next(err);
  }
}

// core/network/tenant_interceptor.dart
class TenantInterceptor extends Interceptor {
  final Ref ref;
  TenantInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final tenantId = ref.read(tenantProvider);
    if (tenantId != null) {
      options.headers['X-Tenant-Id'] = tenantId;
    }
    handler.next(options);
  }
}
```

#### 에러 매핑 (DioException → AppException)

```dart
// core/error/app_exception.dart
class AppException implements Exception {
  final String code;
  final String message;
  final int? statusCode;

  const AppException({required this.code, required this.message, this.statusCode});

  factory AppException.fromDioError(DioException error) {
    if (error.response?.data case {'error': {'code': String code, 'message': String msg}}) {
      return AppException(
        code: code,
        message: msg,
        statusCode: error.response?.statusCode,
      );
    }
    return switch (error.type) {
      DioExceptionType.connectionTimeout => const AppException(
        code: 'NETWORK_TIMEOUT', message: '서버 연결 시간이 초과되었습니다.'),
      DioExceptionType.connectionError => const AppException(
        code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.'),
      _ => AppException(
        code: 'UNKNOWN_ERROR', message: error.message ?? '알 수 없는 오류'),
    };
  }
}
```

#### Good 예제

```dart
// Provider에서 Repository 사용 — 깔끔한 에러 흐름
@riverpod
Future<List<Note>> noteList(NoteListRef ref) async {
  final repo = ref.watch(noteRepositoryProvider);
  final result = await repo.fetchNotes();
  return result.when(
    success: (notes) => notes,
    failure: (e) => throw e, // AsyncValue.error로 전파
  );
}
```

#### Bad 예제

```dart
// Provider에서 Dio 직접 호출 — 레이어 무시
@riverpod
Future<List<Note>> noteList(NoteListRef ref) async {
  final dio = ref.read(dioProvider);
  final response = await dio.get('/api/v1/notes'); // Repository 없이 직접!
  return (response.data['data'] as List)
      .map((j) => Note.fromJson(j)).toList(); // DTO 변환 없이 직접 파싱
}
```

---

### 3.4 에러/로딩 상태 처리

#### AsyncValue 3상태 패턴

모든 비동기 데이터는 Riverpod의 `AsyncValue`로 관리한다.

```dart
// 표준 패턴 — when으로 3상태 분기
@override
Widget build(BuildContext context, WidgetRef ref) {
  final notesAsync = ref.watch(noteListProvider);

  return notesAsync.when(
    data: (notes) => notes.isEmpty
        ? const AppEmptyWidget(message: '아직 노트가 없습니다')
        : NoteListView(notes: notes),
    loading: () => const NoteListSkeleton(),
    error: (error, stack) => AppErrorWidget(
      error: error,
      onRetry: () => ref.invalidate(noteListProvider),
    ),
  );
}
```

#### 공용 위젯

```dart
// shared/widgets/app_error_widget.dart
class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key, required this.error, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final message = error is AppException
        ? (error as AppException).message
        : '문제가 발생했습니다.';

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: Theme.of(context).textTheme.bodyMedium),
          if (onRetry != null) ...[
            const SizedBox(height: AppSpacing.lg),
            FilledButton(
              onPressed: onRetry,
              child: const Text('재시도'),
            ),
          ],
        ],
      ),
    );
  }
}

// shared/widgets/app_loading_widget.dart
class AppLoadingWidget extends StatelessWidget {
  const AppLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(color: AppColors.primaryAmber),
    );
  }
}

// shared/widgets/app_empty_widget.dart
class AppEmptyWidget extends StatelessWidget {
  const AppEmptyWidget({super.key, required this.message, this.icon});
  final String message;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon ?? Icons.inbox_outlined, size: 64, color: AppColors.stone400),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.stone500,
          )),
        ],
      ),
    );
  }
}
```

#### 스켈레톤 로딩 (Shimmer)

```dart
// shared/widgets/app_skeleton.dart
class AppSkeleton extends StatelessWidget {
  const AppSkeleton({super.key, required this.width, required this.height, this.borderRadius});
  final double width;
  final double height;
  final double? borderRadius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.stone200,      // DESIGN.md Stone-200
      highlightColor: AppColors.stone100, // DESIGN.md Stone-100
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.stone200,
          borderRadius: BorderRadius.circular(borderRadius ?? 4),
        ),
      ),
    );
  }
}

// 사용 — NoteCardSkeleton
class NoteCardSkeleton extends StatelessWidget {
  const NoteCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppSkeleton(width: 200, height: 20, borderRadius: 4),
            const SizedBox(height: AppSpacing.sm),
            AppSkeleton(width: double.infinity, height: 14, borderRadius: 4),
            const SizedBox(height: AppSpacing.xs),
            AppSkeleton(width: 150, height: 14, borderRadius: 4),
          ],
        ),
      ),
    );
  }
}
```

#### Good 예제

```dart
// AsyncValue.when + 빈 상태 + 재시도
noteListAsync.when(
  data: (notes) => notes.isEmpty
      ? const AppEmptyWidget(message: '검색 결과가 없습니다', icon: Icons.search_off)
      : ListView.builder(
          itemCount: notes.length,
          itemBuilder: (_, i) => NoteCard(noteId: notes[i].id),
        ),
  loading: () => const NoteListSkeleton(),
  error: (e, _) => AppErrorWidget(error: e, onRetry: () => ref.invalidate(noteListProvider)),
);
```

#### Bad 예제

```dart
// FutureBuilder 사용 — Riverpod 미활용
FutureBuilder<List<Note>>(
  future: fetchNotes(), // 매 빌드마다 재호출!
  builder: (context, snapshot) {
    if (snapshot.hasData) return Text('${snapshot.data}');
    if (snapshot.hasError) return Text('Error'); // 재시도 없음
    return CircularProgressIndicator(); // const 누락
  },
);

// 에러 무시
final notes = ref.watch(noteListProvider);
return notes.when(
  data: (d) => NoteList(notes: d),
  loading: () => Container(),      // 빈 컨테이너 — 사용자에게 피드백 없음
  error: (_, __) => Container(),   // 에러 무시 — 디버깅 불가
);
```

---

### 3.5 UI 컴포넌트 규칙

#### DESIGN.md 토큰 → Flutter 코드 매핑

**색상 상수:**
```dart
// core/constants/app_colors.dart
abstract class AppColors {
  // Primary (DESIGN.md: Warm Amber)
  static const primaryAmber = Color(0xFFD97706);
  static const primaryHover = Color(0xFFB45309);
  static const primaryLight = Color(0xFFFEF3C7);

  // Secondary (DESIGN.md: Muted Teal)
  static const secondaryTeal = Color(0xFF0D9488);

  // Neutrals (DESIGN.md: Warm Stone)
  static const stone50  = Color(0xFFFAFAF9);
  static const stone100 = Color(0xFFF5F5F4);
  static const stone200 = Color(0xFFE7E5E4);
  static const stone300 = Color(0xFFD6D3D1);
  static const stone400 = Color(0xFFA8A29E);
  static const stone500 = Color(0xFF78716C);
  static const stone600 = Color(0xFF57534E);
  static const stone700 = Color(0xFF44403C);
  static const stone800 = Color(0xFF292524);
  static const stone900 = Color(0xFF1C1917);
  static const stone950 = Color(0xFF0C0A09);

  // Semantic
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);
  static const error   = Color(0xFFDC2626);
  static const info    = Color(0xFF0EA5E9);

  // Dark Mode
  static const darkBackground = stone900;  // #1C1917
  static const darkSurface    = stone800;  // #292524
  static const darkElevated   = stone700;  // #44403C
}
```

**스페이싱 상수:**
```dart
// core/constants/app_spacing.dart
abstract class AppSpacing {
  static const double xxs  = 2;
  static const double xs   = 4;
  static const double sm   = 8;
  static const double md   = 16;
  static const double lg   = 24;
  static const double xl   = 32;
  static const double xxl  = 48;
  static const double xxxl = 64;

  // Content padding (반응형)
  static double contentPadding(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width < AppBreakpoints.mobile) return md;   // 모바일: 16px
    if (width < AppBreakpoints.tablet) return lg;   // 태블릿: 24px
    return xl;                                       // 데스크톱: 32px
  }
}
```

**브레이크포인트:**
```dart
// core/constants/app_breakpoints.dart
abstract class AppBreakpoints {
  static const double mobile  = 640;
  static const double tablet  = 1024;
}
```

**타이포그래피:**
```dart
// core/constants/app_text_styles.dart (google_fonts 패키지 사용)
import 'package:google_fonts/google_fonts.dart';

abstract class AppTextStyles {
  // Display (DESIGN.md: Fraunces)
  static TextStyle displayXl = GoogleFonts.fraunces(fontSize: 48, height: 1.1);
  static TextStyle display   = GoogleFonts.fraunces(fontSize: 36, height: 1.2);
  static TextStyle h1        = GoogleFonts.fraunces(fontSize: 30, height: 1.3);

  // Headings (DESIGN.md: Plus Jakarta Sans 600)
  static TextStyle h2 = GoogleFonts.plusJakartaSans(fontSize: 24, height: 1.35, fontWeight: FontWeight.w600);
  static TextStyle h3 = GoogleFonts.plusJakartaSans(fontSize: 20, height: 1.4, fontWeight: FontWeight.w600);

  // Body (DESIGN.md: Plus Jakarta Sans 400)
  static TextStyle body      = GoogleFonts.plusJakartaSans(fontSize: 16, height: 1.6);
  static TextStyle bodySmall = GoogleFonts.plusJakartaSans(fontSize: 14, height: 1.5);
  static TextStyle caption   = GoogleFonts.plusJakartaSans(fontSize: 12, height: 1.4, fontWeight: FontWeight.w500);

  // Code (DESIGN.md: Geist Mono)
  static TextStyle code = GoogleFonts.geistMono(fontSize: 14, height: 1.5);
}
```

#### 반응형 레이아웃

```dart
// 표준 반응형 패턴
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= AppBreakpoints.tablet) {
          return desktop ?? tablet ?? mobile;
        }
        if (constraints.maxWidth >= AppBreakpoints.mobile) {
          return tablet ?? mobile;
        }
        return mobile;
      },
    );
  }
}
```

#### Border Radius (DESIGN.md 매핑)

```dart
// core/constants/app_radius.dart
abstract class AppRadius {
  static const double sm   = 4;   // inputs, badges
  static const double md   = 8;   // cards, buttons
  static const double lg   = 12;  // panels, dialogs
  static const double xl   = 16;  // hero sections
  static const double full = 9999; // avatars, pills
}
```

#### Good 예제

```dart
// DESIGN.md 토큰 사용 — 일관된 UI
Card(
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(AppRadius.md),
  ),
  color: AppColors.stone50,
  elevation: 0,
  child: Padding(
    padding: const EdgeInsets.all(AppSpacing.md),
    child: Text('노트 제목', style: AppTextStyles.h3),
  ),
)
```

#### Bad 예제

```dart
// 하드코딩 — DESIGN.md 무시
Card(
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(10), // AppRadius.md(8) 사용!
  ),
  color: Colors.white,                       // AppColors.stone50 사용!
  child: Padding(
    padding: EdgeInsets.all(15),              // const + AppSpacing.md(16) 사용!
    child: Text('노트 제목', style: TextStyle(fontSize: 20)), // AppTextStyles 사용!
  ),
)
```

---

### 3.6 테스트 작성 패턴

#### 테스트 종류

| 종류 | 목적 | 도구 |
|------|------|------|
| Widget Test | 위젯 렌더링/인터랙션 검증 | `flutter_test` + `pumpWidget` |
| Provider Test | 상태 로직 검증 | `ProviderContainer` + overrides |
| Golden Test | UI 회귀 방지 (스냅샷 비교) | `matchesGoldenFile` |
| Integration Test | 전체 앱 시나리오 | `integration_test` 패키지 |

#### 테스트 네이밍

```dart
'should [행동/결과] when [조건]'
```

#### Widget Test

```dart
testWidgets('should display note title when loaded', (tester) async {
  // given
  final testNote = Note(id: 'note-1', title: '테스트 노트', content: '내용');

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        noteProvider('note-1').overrideWith(
          (ref, noteId) => Future.value(testNote),
        ),
      ],
      child: const MaterialApp(home: NoteDetailScreen(noteId: 'note-1')),
    ),
  );
  await tester.pumpAndSettle();

  // then
  expect(find.text('테스트 노트'), findsOneWidget);
});

testWidgets('should show error widget when fetch fails', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        noteListProvider.overrideWith(
          (ref) => throw const AppException(code: 'NETWORK_ERROR', message: '네트워크 오류'),
        ),
      ],
      child: const MaterialApp(home: NoteListScreen()),
    ),
  );
  await tester.pumpAndSettle();

  expect(find.byType(AppErrorWidget), findsOneWidget);
  expect(find.text('재시도'), findsOneWidget);
});

testWidgets('should call retry when retry button tapped', (tester) async {
  var invalidateCount = 0;

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        noteListProvider.overrideWith((ref) {
          ref.onDispose(() => invalidateCount++);
          throw const AppException(code: 'ERROR', message: '오류');
        }),
      ],
      child: const MaterialApp(home: NoteListScreen()),
    ),
  );
  await tester.pumpAndSettle();

  // when
  await tester.tap(find.text('재시도'));
  await tester.pumpAndSettle();

  // then
  expect(invalidateCount, greaterThan(0));
});
```

#### Provider Unit Test

```dart
test('should update title when updateTitle called', () async {
  final container = ProviderContainer(
    overrides: [
      noteRepositoryProvider.overrideWithValue(MockNoteRepository()),
    ],
  );
  addTearDown(container.dispose);

  // given
  final notifier = container.read(noteEditorProvider('note-1').notifier);
  await container.pump(); // 초기 로딩 대기

  // when
  notifier.updateTitle('새 제목');

  // then
  final state = container.read(noteEditorProvider('note-1'));
  expect(state.title, '새 제목');
  expect(state.isDirty, true);
});
```

#### Golden Test

```dart
testWidgets('DashboardScreen golden test', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [/* mock providers */],
      child: const MaterialApp(home: DashboardScreen()),
    ),
  );
  await tester.pumpAndSettle();

  await expectLater(
    find.byType(DashboardScreen),
    matchesGoldenFile('goldens/dashboard_screen.png'),
  );
});
```

#### Good 예제

```dart
// 하나의 테스트 — 하나의 검증 의도
testWidgets('should navigate to note detail when card tapped', (tester) async {
  // given + when + then 명확
});
```

#### Bad 예제

```dart
// 하나의 테스트에 여러 시나리오 혼합
testWidgets('test notes', (tester) async {
  // 생성 테스트
  // 수정 테스트
  // 삭제 테스트
  // → 각각 별도 테스트로 분리
});
```

---

### 3.7 성능 규칙

#### 핵심 규칙 테이블

| 규칙 | Why | 적용 방법 |
|------|-----|-----------|
| `const` 위젯 | 동일 인스턴스 재사용 → 리빌드 방지 | 모든 정적 위젯에 const 생성자 |
| `RepaintBoundary` | 불필요한 repaint 격리 | 애니메이션/스크롤 영역 감싸기 |
| `ListView.builder` | lazy rendering (화면 밖 미렌더링) | 10개 이상 리스트 |
| `CachedNetworkImage` | 이미지 중복 다운로드 방지 | 모든 네트워크 이미지 |
| `cacheWidth/Height` | 메모리에 원본 대신 축소본 유지 | 썸네일에 항상 적용 |
| `Isolate.run` | 무거운 연산을 별도 스레드로 | JSON 파싱, 마크다운 변환 |
| `CanvasKit` 강제 | 웹에서 일관된 렌더링 보장 | 빌드 설정 |

#### Good 예제

```dart
// const + RepaintBoundary + ListView.builder
class NoteListView extends ConsumerWidget {
  const NoteListView({super.key, required this.notes});
  final List<Note> notes;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView.builder(
      itemCount: notes.length,
      itemBuilder: (_, index) => RepaintBoundary(
        child: NoteCard(noteId: notes[index].id),
      ),
    );
  }
}

// CachedNetworkImage + resize
CachedNetworkImage(
  imageUrl: user.avatarUrl,
  memCacheWidth: 64,   // 메모리에 64px로 축소 저장
  memCacheHeight: 64,
  placeholder: (_, __) => const AppSkeleton(width: 32, height: 32),
  errorWidget: (_, __, ___) => const Icon(Icons.person, size: 32),
)

// 무거운 연산은 Isolate로 분리
Future<List<Note>> parseNotesJson(String json) async {
  return await Isolate.run(() {
    final list = jsonDecode(json) as List;
    return list.map((e) => Note.fromJson(e)).toList();
  });
}
```

#### Bad 예제

```dart
// Column + map — 1000개 아이템을 한번에 렌더링
Column(
  children: notes.map((n) => NoteCard(note: n)).toList(), // 전부 메모리에!
)

// 이미지 캐싱/리사이징 없음
Image.network(url)  // 매번 다운로드, 원본 크기 메모리 점유

// UI 스레드에서 무거운 연산
Widget build(BuildContext context) {
  final parsed = jsonDecode(hugeJsonString); // UI 프레임 드롭!
  return Text(parsed['title']);
}

// const 누락 — 불필요한 리빌드 유발
SizedBox(height: 16)                   // const SizedBox(height: 16) 이어야 함
Padding(padding: EdgeInsets.all(8))     // const EdgeInsets.all(8) 이어야 함
```
