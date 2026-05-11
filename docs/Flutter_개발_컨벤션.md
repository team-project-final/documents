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
