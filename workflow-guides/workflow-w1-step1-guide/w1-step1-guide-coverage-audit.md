# W1 Step 1 Guide Coverage Audit

> 기준: `documents/docs/project-management/workflow/*_W1.md`의 `## Step 1`
> 비교 대상: `documents/workflow-w1-step1-guide/*.html`

## 결론

W1 첫 번째 Step은 총 8개입니다. 현재 `workflow-w1-step1-guide` 폴더에는 8개 가이드 HTML이 있어 전체 항목이 커버되어 있습니다.

누락 항목:

- 없음

## 커버리지 표

| Workflow 문서 | Step 1 | 가이드 문서 | 상태 |
|---|---|---|---|
| `WORKFLOW_team-lead_W1.md` | AWS 인프라 프로비저닝 | `team-lead__aws-infra-provisioning-workflow-guide.html` | 커버됨 |
| `WORKFLOW_platform_W1.md` | platform-svc 골격 생성 | `platform-owner__platform-svc-spring-modulith-scaffold-workflow-guide.html` | 커버됨 |
| `WORKFLOW_engagement_W1.md` | engagement-svc 골격 생성 | `engagement-owner__engagement-svc-spring-modulith-scaffold-workflow-guide.html` | 커버됨 |
| `WORKFLOW_knowledge-1_W1.md` | knowledge-svc 골격 생성 | `knowledge-owner-1__knowledge-svc-spring-modulith-scaffold-workflow-guide.html` | 커버됨 |
| `WORKFLOW_knowledge-2_W1.md` | Modulith 모듈 구조 설정 | `knowledge-owner-2__modulith-workflow-guide.html` | 커버됨 |
| `WORKFLOW_learning-card_W1.md` | 프로젝트 초기 설정 | `learning-card-owner__learning-card-spring-modulith-scaffold-workflow-guide.html` | 커버됨 |
| `WORKFLOW_learning-ai_W1.md` | FastAPI 프로젝트 초기 설정 | `learning-ai-owner__learning-ai-fastapi-scaffold-workflow-guide.html` | 커버됨 |
| `WORKFLOW_frontend_W1.md` | Flutter 프로젝트 기본 구조 생성 | `frontend-owner__frontend-flutter-scaffold-workflow-guide.html` | 커버됨 |

## Frontend Step 1 체크리스트

`WORKFLOW_frontend_W1.md` 기준으로 새 가이드에 포함해야 할 항목은 다음과 같습니다.

### 1. TASK 시작

- Step Goal / Done When / Scope / Input 확인
- PRD_W1 해당 요구사항 확인 (프로젝트 골격)
- Duration 산정 확인 (1일)

### 2. 요구사항 분석

- Flutter 3.24+ / Dart 3.5+ 프로젝트 구조 분석
- Riverpod + GoRouter + Material 3 의존성 확인
- `DESIGN.md` 테마 규격 (ColorScheme, Typography) 확인
- Instructions 초안 → TASK 문서 반영

### 3. Security 1차 검토

- 인증 필요 여부: No (골격만 생성)
- 권한 종류: 없음
- 공개 API 여부: No (프론트엔드 앱)
- 결과 → TASK Constraints 반영

### 4. ERD 설계

- 프론트엔드 — ERD 해당 없음
- 폴더 구조 설계 (`lib/core/`, `lib/features/`, `lib/shared/`)
- 라우트 구조 정의 (`/`, `/login`, `/dashboard`)
- Duration(final) 갱신

### 5. Security 2차 검토

- 민감 정보 암호화: 비해당 (골격 단계)
- 환경변수 관리 (`.env`, API base URL)
- 코드 내 시크릿 하드코딩 금지 확인
- 결과 → TASK Constraints 반영

### 6. DTO / Entity 설계 (API First)

- 골격 단계 — 빈 Scaffold 페이지만 생성
- GoRouter 라우트 설정 (`/`, `/login`, `/dashboard`)
- ThemeData 생성 (`DESIGN.md` 기반)
- Output Format → TASK 반영

### 7. Repository 구현

- `pubspec.yaml` 의존성 추가 (`flutter_riverpod`, `go_router`, `google_fonts`)
- ProviderScope 최상위 래핑

### 8. Service + Test

- GoRouter 설정 구현
- ThemeData (ColorScheme + Typography) 구현
- 라우트별 빈 Scaffold 페이지 생성
- Widget 테스트 (라우팅 전환 확인)

### 9. Controller + Test

- `flutter run -d chrome` 동작 확인
- 라우팅 전환 동작 확인
- `DESIGN.md` 테마 적용 확인

### 10. View + Test

- 각 라우트 빈 화면 렌더링 확인
- Smoke Test 1건 (앱 실행 → 에러 없음)
- RULE Reference → TASK 반영

## 생성 파일

- `frontend-owner__frontend-flutter-scaffold-workflow-guide.html`

권장 포함 내용:

- Flutter 3.24+ / Dart 3.5+ 프로젝트 구조
- Riverpod, GoRouter, Material 3, Google Fonts 의존성
- `lib/core/`, `lib/features/`, `lib/shared/` 폴더 구조
- `/`, `/login`, `/dashboard` 빈 Scaffold 라우트
- `DESIGN.md` 기반 ThemeData 적용
- `.env`와 API base URL 관리
- ProviderScope 최상위 래핑
- `flutter test`, `flutter run -d chrome`, smoke test 검증 명령
