# Design Spec: Synapse 개발 컨벤션 통합 정의서

> **Date:** 2026-05-11  
> **Status:** Approved  
> **Author:** velka + Claude  

---

## 1. 목적

Spring Boot 4 + Flutter 3.x 기반 Synapse 프로젝트에서, 새 팀원이 합류했을 때 **"이것만 읽으면 바로 코딩 시작 가능"한 원스톱 개발 컨벤션 가이드**를 작성한다.

### 핵심 목표
- 혼합 팀(주니어~시니어) 대응: 기본 규칙은 간결, 심화 패턴은 분리
- 각 규칙마다 **Good/Bad 코드 예제** 쌍 포함
- 기존 문서(wiki/documents)의 규칙은 **요약 재기술 + 원본 링크**로 완결성 확보

---

## 2. 산출물

3개 파일, `documents/docs/` 디렉토리에 배치:

| 파일명 | 대상 | 크기 예상 |
|--------|------|-----------|
| `Spring_개발_컨벤션.md` | 백엔드 개발자 | ~5,000줄 |
| `Flutter_개발_컨벤션.md` | 프론트엔드 개발자 | ~4,500줄 |
| `공통_개발_규칙.md` | 전체 팀원 | ~2,500줄 |

---

## 3. 문서 구조 상세

### 3.1 `Spring_개발_컨벤션.md`

```
1. 개요
   - 목적, 대상, 관련 문서 링크 (wiki 03/04/09/10/11/12/18)

2. [기본 규칙] — 빠른 참조 (테이블/불릿 중심)
   2.1 패키지 구조
       - 4-서비스(platform/engagement/knowledge/learning) × Modulith 모듈
       - 표준 ASCII 트리 + 각 패키지 역할 1줄 설명
       - Good: 모듈 내 계층 분리 / Bad: 도메인 횡단 import
   
   2.2 네이밍 컨벤션
       - 대조표: 클래스(PascalCase) / 메서드(camelCase) / 상수(UPPER_SNAKE)
       - DB: 테이블(snake_case 복수형) / 컬럼(snake_case)
       - 접미사 규칙: *Controller, *Service, *Repository, *Event, *Dto
       - Good/Bad 예제
   
   2.3 레이어 책임
       - Controller: 요청 검증 + 응답 래핑만. 비즈니스 로직 금지.
       - Service: 비즈니스 로직 + 트랜잭션 경계. Repository 직접 호출만.
       - Repository: 데이터 접근. 쿼리 외 로직 금지.
       - 금지사항 목록 + Good/Bad 예제
   
   2.4 DTO 규칙
       - Request/Response/내부 DTO 분리
       - Java record 사용 기준 (불변, 단순 데이터 전달)
       - Entity ↔ DTO 변환: MapStruct 매퍼 사용
       - Good/Bad 예제
   
   2.5 코드 포맷팅
       - Google Java Style Guide 적용
       - IDE 설정 파일 경로 및 적용법
       - import 순서: java → javax → org → com → project

3. [심화 패턴] — Good/Bad 예제 + Why 설명
   3.1 예외 처리 패턴
       - GlobalExceptionHandler 구조
       - 커스텀 예외 계층: BusinessException → 도메인별 Exception
       - 에러 코드 Enum → API 에러 응답 매핑
       - Good: 명확한 예외 계층 / Bad: 범용 RuntimeException 남용
   
   3.2 멀티테넌시 적용 패턴
       - TenantContext (ThreadLocal/Virtual Thread 호환)
       - Repository에서 tenant_id 자동 필터링 패턴
       - Redis 캐시 키: "tenant:{tenantId}:domain:{key}" 형식
       - Kafka 이벤트에 tenantId 필수 포함
       - Good: 자동 필터 / Bad: 수동 WHERE 추가
   
   3.3 이벤트 발행/구독 패턴
       - 모듈 내부: Spring ApplicationEvent (Modulith @ApplicationModuleListener)
       - 모듈 외부(크로스 서비스): Kafka + Avro 스키마
       - Schema Registry BACKWARD 호환성 규칙
       - 이벤트 네이밍: {도메인}.{동사}.{버전} (예: note.created.v1)
       - Good/Bad 예제
   
   3.4 트랜잭션 & 동시성
       - @Transactional 위치: Service 레이어만
       - 읽기 전용: @Transactional(readOnly = true)
       - 낙관적 잠금: @Version 필드 사용 기준
       - 멱등성 키: Idempotency-Key 헤더 → DB unique constraint
       - Good/Bad 예제
   
   3.5 테스트 작성 패턴
       - 단위 테스트: @ExtendWith(MockitoExtension.class), given-when-then
       - 통합 테스트: @SpringBootTest + Testcontainers (PostgreSQL, Redis, Kafka)
       - 테스트 네이밍: should_결과_when_조건()
       - 커버리지 목표: 전체 80%, 신규 코드 85%
       - Good/Bad 예제
   
   3.6 API 구현 패턴
       - 표준 응답 래핑: ApiResponse<T> 클래스
       - 페이지네이션: 커서 기반 (lastId + limit)
       - Rate Limit 헤더 자동 삽입 (인터셉터)
       - Swagger/OpenAPI 어노테이션 규칙
       - Good/Bad 예제
```

---

### 3.2 `Flutter_개발_컨벤션.md`

```
1. 개요
   - 목적, 대상, DESIGN.md 연동 설명
   - 관련 문서 링크 (wiki 05/06/08/18, DESIGN.md)

2. [기본 규칙] — 빠른 참조
   2.1 폴더 구조
       - Feature-first 구조 (lib/features/{feature_name}/)
       - 공용 모듈: lib/core/, lib/shared/
       - 표준 ASCII 트리 + 각 폴더 역할 1줄 설명
       - Good: feature 내 자기 완결 / Bad: 기능 횡단 참조
   
   2.2 네이밍 컨벤션
       - 파일: snake_case (예: note_editor_screen.dart)
       - 클래스/위젯: PascalCase (예: NoteEditorScreen)
       - 변수/함수: camelCase
       - 상수: lowerCamelCase (Dart 컨벤션)
       - 접미사 규칙: *Screen, *Widget, *Provider, *Repository, *Model
       - Good/Bad 예제
   
   2.3 위젯 작성 규칙
       - StatelessWidget 우선, StatefulWidget은 최소화
       - 위젯 분할 기준: build() 50줄 초과 시 추출
       - 파일당 위젯 1개 원칙 (private 헬퍼 위젯은 허용)
       - const 생성자 적극 사용
       - Good/Bad 예제
   
   2.4 코드 포맷팅
       - dart format (line length 80)
       - analysis_options.yaml: flutter_lints + 프로젝트 커스텀 룰
       - trailing comma 강제 (포맷터 정렬 최적화)
   
   2.5 import 정리
       - 순서: dart: → package: → relative
       - barrel file (index.dart): feature 공개 API만 export
       - 상대경로: 같은 feature 내에서만 허용
       - Good/Bad 예제

3. [심화 패턴] — Good/Bad 예제 + Why 설명
   3.1 상태관리 (Riverpod 3.0)
       - Provider 종류별 의사결정 테이블:
         | 상황 | Provider 타입 |
         | 단순 계산값 | Provider |
         | 비동기 데이터 | FutureProvider / StreamProvider |
         | 변경 가능 상태 | NotifierProvider |
         | 가족 패턴 (ID별) | .family modifier |
       - 생명주기: autoDispose 사용 기준
       - Provider 네이밍: {도메인}{역할}Provider (예: noteListProvider)
       - 테스트: ProviderContainer override 패턴
       - Good/Bad 예제
   
   3.2 라우팅 (GoRouter)
       - 경로 상수: AppRoutes 클래스에 집중 관리
       - 가드: redirect에서 인증/온보딩 체크
       - 중첩 라우트: ShellRoute로 하단 탭 유지
       - 딥링크: /{feature}/{id} 패턴 통일
       - Good/Bad 예제
   
   3.3 API 통신 패턴
       - 3계층: Repository(추상) → RemoteDataSource(HTTP) → DTO → Domain Model
       - HTTP 클라이언트: Dio + 인터셉터 (토큰 자동 갱신, tenant 헤더 주입)
       - DTO → Model 변환: fromJson factory + toJson method
       - 에러 매핑: DioException → AppException 변환 규칙
       - Good/Bad 예제
   
   3.4 에러/로딩 상태 처리
       - AsyncValue 3상태: loading / data / error
       - 공용 위젯: AppLoadingWidget, AppErrorWidget (재시도 콜백 포함)
       - 빈 상태: AppEmptyWidget
       - 스켈레톤 로딩: Shimmer 패턴 (DESIGN.md Stone-200 컬러)
       - Good/Bad 예제
   
   3.5 UI 컴포넌트 규칙
       - DESIGN.md 토큰 참조법:
         - 색상: Theme.of(context).colorScheme / AppColors 상수
         - 타이포: Theme.of(context).textTheme / AppTextStyles
         - 스페이싱: AppSpacing.md (16px) 등 상수
       - 커스텀 위젯: lib/shared/widgets/ 에 공용 컴포넌트
       - 반응형: LayoutBuilder + 브레이크포인트 상수 (640/1024)
       - Good/Bad 예제
   
   3.6 테스트 작성 패턴
       - Widget Test: pumpWidget + finder 패턴
       - Provider Mock: ProviderScope overrides
       - Golden Test: 핵심 화면별 스냅샷 (CI에서 비교)
       - 테스트 네이밍: 'should [행동] when [조건]'
       - Good/Bad 예제
   
   3.7 성능 규칙
       - const 위젯으로 불필요 리빌드 방지
       - RepaintBoundary: 애니메이션/스크롤 영역에 적용
       - 이미지: CachedNetworkImage + 적절한 cacheWidth/Height
       - 리스트: ListView.builder (lazy rendering)
       - CanvasKit 렌더러 (웹 빌드 시 강제)
       - Good/Bad 예제
```

---

### 3.3 `공통_개발_규칙.md`

```
1. 개요
   - 목적: 전체 팀원(BE+FE) 공통 규칙
   - Spring/Flutter 문서와의 관계 설명
   - 관련 문서 링크 (wiki 09/10/12/14/16)

2. [기본 규칙] — 빠른 참조
   2.1 환경 변수 관리
       - .env 파일 구조: .env.example (커밋) / .env.local (gitignore)
       - 비밀 값: 로컬은 .env, CI/CD는 GitHub Secrets / K8s Secrets
       - 환경별 분리: dev / staging / prod
       - 네이밍: UPPER_SNAKE_CASE, 접두사로 서비스 구분 (PLATFORM_, KNOWLEDGE_ 등)
       - Good/Bad 예제
       - → 상세: wiki 10_환경_설정_템플릿
   
   2.2 Git 워크플로우 요약
       - 브랜치: feature/PLAT-NNN-설명 (서비스 접두사 + 이슈 번호)
       - 커밋: Conventional Commits (feat/fix/refactor/docs + scope)
       - PR: 400줄 이하 권장, 팀장 + 도메인 오너 2인 승인
       - 수명: 브랜치 최대 5일 → 강제 PR
       - Good/Bad 예제
       - → 상세: wiki 09_Git_규칙_정의서, docs/SYNAPSE_Git_Rules_Polyrepo_Supplement
   
   2.3 API 규약 요약
       - 응답 포맷: { success, data, meta } / { success: false, error: {...}, meta }
       - 페이지네이션: 커서 기반 (lastId + limit)
       - Rate Limit: 비인증 60/min, 인증 600/min, LLM 30/min
       - 멱등성: POST에 Idempotency-Key 헤더
       - Good/Bad 예제
       - → 상세: wiki 04_API_명세서, docs/03_api_specification
   
   2.4 코드 리뷰 요약
       - 체크리스트 6축: 기능 / 보안 / 테넌트 격리 / 성능 / 가독성 / 테스트
       - 피드백 태그: [MUST] [SHOULD] [COULD] [QUESTION] [PRAISE] [NIT]
       - SLA: 첫 리뷰 24h, 재검토 48h
       - Good/Bad 예제 (리뷰 코멘트 작성법)
       - → 상세: wiki 12_코드_리뷰_규칙

3. [심화 패턴] — Good/Bad 예제 + Why 설명
   3.1 로깅 규칙
       - 로그 레벨 기준:
         | 레벨 | 사용 시점 |
         | ERROR | 즉시 대응 필요한 장애 |
         | WARN | 잠재적 문제, 곧 조치 필요 |
         | INFO | 비즈니스 이벤트 (로그인, 결제, 카드 생성) |
         | DEBUG | 개발/디버깅용 (prod 비활성) |
       - 구조화 로깅: JSON 포맷 (timestamp, level, service, traceId, tenantId, message)
       - 민감정보 마스킹: 이메일(*처리), 토큰(앞 8자만), 비밀번호(절대 금지)
       - Good/Bad 예제
   
   3.2 보안 체크리스트 (PR 전 자가 점검표)
       - 인증/인가: JWT 검증, 권한 체크, 리소스 소유자 확인
       - 입력 검증: SQL Injection (@Param binding), XSS (HTML sanitize), SSRF
       - 의존성: 알려진 취약점 없는지 (Dependabot/Snyk)
       - 비밀 값: 하드코딩 금지, 로그 출력 금지
       - CORS: 허용 origin 명시적 화이트리스트
       - 파일 업로드: 확장자/MIME 검증, 크기 제한
       - Good/Bad 예제
       - → 상세: docs/04_operations_security
   
   3.3 멀티테넌시 공통 규칙
       - 전체 흐름도:
         Client(X-Tenant-Id) → Gateway(JWT 추출) → Spring(TenantContext)
         → Repository(WHERE tenant_id) → PostgreSQL(RLS 이중 방어)
         → API 응답 → Flutter(Provider에서 tenant 상태 관리)
       - BE 규칙: TenantContext 자동 주입, 캐시/이벤트에 tenantId 포함
       - FE 규칙: 로그인 시 tenant 설정, API 요청에 자동 헤더 주입
       - Good/Bad 예제
   
   3.4 에러 코드 & 메시지 관리
       - 에러 코드 체계: {도메인}_{에러유형} (예: AUTH_TOKEN_EXPIRED, NOTE_NOT_FOUND)
       - BE: ErrorCode enum → GlobalExceptionHandler에서 매핑
       - FE: 에러 코드별 사용자 메시지 매핑 (i18n 지원)
       - 신규 에러 추가 프로세스: BE enum 추가 → API 문서 갱신 → FE 매핑 추가
       - Good/Bad 예제
   
   3.5 문서화 규칙
       - 코드 주석: "왜(Why)"만 기술, "무엇(What)"은 코드가 설명
       - API 문서: SpringDoc OpenAPI 자동 생성 + 커스텀 설명 어노테이션
       - 변경 동기화: 스키마/API 변경 시 관련 wiki 문서 업데이트 필수
       - PR 설명: 변경 영향 서비스, 스키마 변경 여부, 호환성 체크 명시
       - Good/Bad 예제
```

---

## 4. 설계 원칙

| 원칙 | 적용 |
|------|------|
| 완결성 | 각 문서만 읽어도 코딩 시작 가능 (외부 참조는 보충용) |
| 스캔 가능성 | 기본 규칙은 테이블/불릿으로 30초 내 핵심 파악 |
| 실용성 | 모든 규칙에 Good/Bad 코드 예제 (복붙 가능) |
| 혼합 팀 대응 | 기본 규칙(주니어도 즉시 적용) + 심화 패턴(시니어 참조) 분리 |
| 유지보수 | 기존 문서 참조 링크로 규칙 변경 시 원본 1곳만 수정 |

---

## 5. 참조 문서 매핑

| 새 문서 섹션 | 참조 원본 |
|-------------|-----------|
| 패키지 구조 / 아키텍처 | wiki 03, docs/MSA_SCS_MicroFrontend_BFF |
| API 규약 | wiki 04, docs/03_api_specification |
| Git 규칙 | wiki 09/09a, docs/SYNAPSE_Git_Rules_Polyrepo_Supplement |
| 환경 설정 | wiki 10 |
| 테스트 전략 | wiki 11 |
| 코드 리뷰 | wiki 12 |
| 기술 스택 상세 | wiki 18 |
| 보안/운영 | docs/04_operations_security |
| 서비스 통합 | docs/SYNAPSE_Service_Consolidation |
| UI 디자인 토큰 | DESIGN.md |

---

## 6. 구현 순서

1. `공통_개발_규칙.md` (전원 필독 → 먼저 완성)
2. `Spring_개발_컨벤션.md` (백엔드 4명 → 두 번째)
3. `Flutter_개발_컨벤션.md` (프론트엔드 → 세 번째)

---

## 7. 성공 기준

- [ ] 새 팀원이 문서만 읽고 첫 PR을 올릴 수 있다
- [ ] 코드 리뷰에서 "컨벤션 위반" 지적 시 문서 특정 섹션을 링크할 수 있다
- [ ] Good/Bad 예제가 실제 프로젝트 코드 패턴과 일치한다
- [ ] 기존 wiki/documents와 규칙 충돌이 없다
