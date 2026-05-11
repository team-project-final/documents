# Synapse 개발 컨벤션 통합 정의서 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spring Boot 4 + Flutter 3.x 기반 Synapse 프로젝트의 원스톱 개발 컨벤션 가이드 3개 문서를 작성한다.

**Architecture:** 역할 기반 3분할 — `공통_개발_규칙.md`(전원), `Spring_개발_컨벤션.md`(BE), `Flutter_개발_컨벤션.md`(FE). 각 문서는 [기본 규칙](빠른 참조) + [심화 패턴](Good/Bad 예제) 2단 구조.

**Tech Stack:** Markdown 문서. 참조: Spring Boot 4 / Java 21 / Spring Modulith 1.x / Riverpod 3.0 / GoRouter 14 / Dio 5 / PostgreSQL 16 / Kafka 3.x / Avro

**Output directory:** `C:/workspace/team-project-manager/team-project-final/documents/docs/`

**Spec:** `docs/superpowers/specs/2026-05-11-development-convention-guide-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `docs/공통_개발_규칙.md` | 전체 팀원 공통: 환경변수, Git, API 규약, 코드 리뷰, 로깅, 보안, 멀티테넌시, 에러코드, 문서화 |
| `docs/Spring_개발_컨벤션.md` | 백엔드: 패키지 구조, 네이밍, 레이어, DTO, 포맷팅, 예외처리, 멀티테넌시, 이벤트, 트랜잭션, 테스트, API 구현 |
| `docs/Flutter_개발_컨벤션.md` | 프론트엔드: 폴더 구조, 네이밍, 위젯, 포맷팅, import, Riverpod, GoRouter, API 통신, 에러/로딩, UI 컴포넌트, 테스트, 성능 |

---

## Task 1: `공통_개발_규칙.md` — 개요 + 기본 규칙 섹션

**Files:**
- Create: `docs/공통_개발_규칙.md`

- [ ] **Step 1: 문서 헤더 + 개요 + 섹션 2.1 환경 변수 관리 작성**

문서를 생성하고 다음 내용을 작성한다:
- 문서 헤더 (제목, 버전, 대상, 목적)
- 개요 섹션 (Spring/Flutter 문서와의 관계, 관련 문서 링크)
- 섹션 2.1 환경 변수 관리:
  - .env 파일 구조 (.env.example은 커밋, .env.local은 gitignore)
  - 환경별 분리: dev / staging / prod
  - 네이밍: UPPER_SNAKE_CASE, 서비스 접두사 (PLATFORM_, KNOWLEDGE_ 등)
  - Good/Bad 예제 (올바른 .env 구조 vs 비밀값 하드코딩)
  - → 상세: wiki 10_환경_설정_템플릿

- [ ] **Step 2: 섹션 2.2 Git 워크플로우 요약 작성**

- 브랜치 네이밍: `feature/PLAT-NNN-설명` (서비스 접두사 + 이슈 번호)
- Conventional Commits: `feat(auth): 소셜 로그인 추가`
- PR 규칙: 400줄 이하, 팀장 + 도메인 오너 2인 승인, 5일 수명
- Good 예제: `feature/KNOW-042-graph-search-filter` + `feat(graph): 검색 필터 옵션 추가`
- Bad 예제: `feature/new-feature` + `update code`
- → 상세: wiki 09_Git_규칙_정의서, docs/SYNAPSE_Git_Rules_Polyrepo_Supplement

- [ ] **Step 3: 섹션 2.3 API 규약 요약 작성**

- 응답 포맷: `{ success, data, meta }` / 에러: `{ success: false, error: {code, message, details}, meta }`
- 페이지네이션: 커서 기반 `?cursor={lastId}&limit=20`
- Rate Limit: 비인증 60/min, 인증 600/min, LLM 30/min
- 멱등성: POST에 `Idempotency-Key` 헤더
- Good 예제: 표준 성공/에러 JSON 응답
- Bad 예제: 비표준 응답 구조, status 코드 불일치
- → 상세: wiki 04_API_명세서, docs/03_api_specification

- [ ] **Step 4: 섹션 2.4 코드 리뷰 요약 작성**

- 체크리스트 6축: 기능 / 보안 / 테넌트 격리 / 성능 / 가독성 / 테스트
- 피드백 태그: `[MUST]` `[SHOULD]` `[COULD]` `[QUESTION]` `[PRAISE]` `[NIT]`
- SLA: 첫 리뷰 24h, 재검토 48h
- Good 예제: 구체적이고 건설적인 리뷰 코멘트
- Bad 예제: "이거 왜 이렇게 했어요?" 같은 비구체적 코멘트
- → 상세: wiki 12_코드_리뷰_규칙

- [ ] **Step 5: 중간 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/공통_개발_규칙.md
git commit -m "docs: 공통 개발 규칙 — 기본 규칙 섹션 작성 (환경변수/Git/API/리뷰)"
```

---

## Task 2: `공통_개발_규칙.md` — 심화 패턴 섹션

**Files:**
- Modify: `docs/공통_개발_규칙.md`

- [ ] **Step 1: 섹션 3.1 로깅 규칙 작성**

- 로그 레벨 기준 테이블 (ERROR/WARN/INFO/DEBUG + 사용 시점)
- 구조화 로깅 JSON 포맷: `{timestamp, level, service, traceId, tenantId, message, context}`
- 민감정보 마스킹 규칙: 이메일(`u***@domain.com`), 토큰(앞 8자), 비밀번호(절대 금지)
- Good 예제 (Java):
```java
log.info("노트 생성 완료", Map.of(
    "noteId", note.getId(),
    "tenantId", TenantContext.getCurrentTenantId(),
    "userId", userId
));
```
- Bad 예제 (Java):
```java
log.info("User " + user.getEmail() + " created note " + note.toString());
```

- [ ] **Step 2: 섹션 3.2 보안 체크리스트 작성**

PR 전 자가 점검표 형태로:
- [ ] 인증/인가: JWT 검증, 권한 체크, 리소스 소유자 확인
- [ ] 입력 검증: SQL Injection (@Param binding), XSS (HTML sanitize)
- [ ] 의존성: 알려진 취약점 없는지 (Dependabot/Snyk)
- [ ] 비밀 값: 하드코딩 금지, 로그 출력 금지
- [ ] CORS: 허용 origin 화이트리스트
- [ ] 파일 업로드: 확장자/MIME 검증, 크기 제한 (10MB)
- Good/Bad 예제 (SQL Injection 방어, XSS 방어)
- → 상세: docs/04_operations_security

- [ ] **Step 3: 섹션 3.3 멀티테넌시 공통 규칙 작성**

전체 흐름도 (ASCII):
```
Client(X-Tenant-Id) → Gateway(JWT에서 tenantId 추출)
→ Spring(TenantContext ThreadLocal) → Repository(WHERE tenant_id = ?)
→ PostgreSQL(RLS 이중 방어) → API 응답
→ Flutter(tenantProvider에서 관리)
```
- BE 규칙: TenantContext 자동 주입, 캐시 키 `tenant:{id}:domain:{key}`, Kafka 이벤트에 tenantId 포함
- FE 규칙: 로그인 시 tenant 설정, Dio 인터셉터에서 X-Tenant-Id 자동 주입
- Good/Bad 예제 (자동 필터 vs 수동 WHERE)

- [ ] **Step 4: 섹션 3.4 에러 코드 & 메시지 관리 작성**

- 에러 코드 체계: `{도메인}_{에러유형}` (예: `AUTH_TOKEN_EXPIRED`, `NOTE_NOT_FOUND`)
- BE: ErrorCode enum 정의 패턴
- FE: 에러 코드별 사용자 메시지 매핑 (i18n)
- 신규 에러 추가 프로세스: BE enum → API 문서 → FE 매핑
- Good/Bad 예제

- [ ] **Step 5: 섹션 3.5 문서화 규칙 작성**

- 코드 주석: "왜(Why)"만 기술
- API 문서: SpringDoc OpenAPI 자동 생성
- 변경 동기화: 스키마/API 변경 시 wiki 문서 업데이트 필수
- PR 설명: 변경 영향 서비스, 스키마 변경 여부, 호환성 체크
- Good/Bad 예제 (주석 작성법, PR 설명 작성법)

- [ ] **Step 6: 최종 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/공통_개발_규칙.md
git commit -m "docs: 공통 개발 규칙 — 심화 패턴 섹션 완성 (로깅/보안/테넌시/에러/문서화)"
```

---

## Task 3: `Spring_개발_컨벤션.md` — 개요 + 기본 규칙 섹션

**Files:**
- Create: `docs/Spring_개발_컨벤션.md`

- [ ] **Step 1: 문서 헤더 + 개요 + 섹션 2.1 패키지 구조 작성**

문서 생성 및:
- 헤더 (제목, 버전, 대상: 백엔드 개발자)
- 개요 (관련 문서 링크: wiki 03/04/09/10/11/12/18)
- 섹션 2.1 패키지 구조:
  - 4-서비스 표준 패키지 트리 (ASCII):
```
com.synapse.{service}/
├── {module}/                    # Spring Modulith 모듈
│   ├── api/                     # Controller + Request/Response DTO
│   ├── application/             # Service (유스케이스)
│   ├── domain/                  # Entity, VO, Repository 인터페이스
│   │   ├── model/
│   │   ├── repository/
│   │   └── event/
│   └── infrastructure/          # Repository 구현체, 외부 연동
│       ├── persistence/
│       └── messaging/
├── shared/                      # 서비스 내 공통 (예외, 유틸)
└── config/                      # 설정 클래스
```
  - Good: 모듈 내 계층 분리 (auth 모듈이 billing 모듈 직접 import 금지)
  - Bad: `com.synapse.platform.auth.service.BillingService` (도메인 횡단)

- [ ] **Step 2: 섹션 2.2 네이밍 컨벤션 대조표 작성**

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스 | PascalCase | `NoteService`, `GraphRepository` |
| 인터페이스 | PascalCase (접두사 I 금지) | `NoteRepository` |
| 메서드 | camelCase (동사 시작) | `createNote()`, `findByTenantId()` |
| 변수 | camelCase | `noteCount`, `currentUser` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| 패키지 | lowercase (단수) | `com.synapse.knowledge.note` |
| DB 테이블 | snake_case (복수형) | `notes`, `user_profiles` |
| DB 컬럼 | snake_case | `tenant_id`, `created_at` |
| DTO | PascalCase + 용도 접미사 | `NoteCreateRequest`, `NoteResponse` |
| 이벤트 | PascalCase + Event | `NoteCreatedEvent` |

- Good/Bad 예제

- [ ] **Step 3: 섹션 2.3 레이어 책임 작성**

각 레이어 규칙:
- **Controller**: 요청 검증(@Valid) + 응답 래핑(ApiResponse) + HTTP 상태 코드 매핑. 비즈니스 로직 금지.
- **Service**: 비즈니스 로직 + @Transactional 경계. Repository만 호출. 다른 모듈은 이벤트 발행.
- **Repository**: 데이터 접근만. 쿼리 외 로직 금지. 인터페이스는 domain/, 구현은 infrastructure/

Good 예제:
```java
// Controller — 검증 + 위임만
@PostMapping("/notes")
public ResponseEntity<ApiResponse<NoteResponse>> createNote(
        @Valid @RequestBody NoteCreateRequest request) {
    NoteResponse response = noteService.createNote(request);
    return ResponseEntity.status(CREATED).body(ApiResponse.success(response));
}
```

Bad 예제:
```java
// Controller에 비즈니스 로직 혼재
@PostMapping("/notes")
public ResponseEntity<?> createNote(@RequestBody Map<String, Object> body) {
    String title = (String) body.get("title");
    if (title == null || title.length() > 200) { /* 검증 로직 */ }
    Note note = new Note();
    note.setTitle(title);
    noteRepository.save(note); // Repository 직접 호출
    kafkaTemplate.send("note-events", note); // 인프라 직접 접근
    return ResponseEntity.ok(note);
}
```

- [ ] **Step 4: 섹션 2.4 DTO 규칙 작성**

- Request DTO: `*Request` record (불변, @Valid 어노테이션)
- Response DTO: `*Response` record (Entity 정보 노출 최소화)
- 내부 DTO: 서비스 간 전달용, 패키지 private
- 변환: MapStruct 매퍼 사용 (`@Mapper(componentModel = "spring")`)

Good 예제:
```java
// record로 불변 DTO
public record NoteCreateRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 50000) String content,
    List<String> tags
) {}

// MapStruct 매퍼
@Mapper(componentModel = "spring")
public interface NoteMapper {
    NoteResponse toResponse(Note entity);
    Note toEntity(NoteCreateRequest request);
}
```

Bad 예제:
```java
// 가변 클래스 + getter/setter + Entity 직접 노출
public class NoteDto {
    private String title;
    public void setTitle(String t) { this.title = t; }
    // ... 30개 getter/setter
}
// Controller에서 Entity를 JSON으로 직접 반환
return ResponseEntity.ok(noteRepository.findById(id));
```

- [ ] **Step 5: 섹션 2.5 코드 포맷팅 작성**

- Google Java Style Guide 적용
- IDE 설정: `.editorconfig` + IntelliJ `google-java-format` 플러그인
- import 순서: `java.*` → `javax.*` → `org.*` → `com.*` → 프로젝트
- 금지: `import *` (와일드카드)
- 줄 길이: 120자
- 들여쓰기: 스페이스 4칸 (탭 금지)

- [ ] **Step 6: 중간 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Spring_개발_컨벤션.md
git commit -m "docs: Spring 개발 컨벤션 — 기본 규칙 섹션 작성 (구조/네이밍/레이어/DTO/포맷팅)"
```

---

## Task 4: `Spring_개발_컨벤션.md` — 심화 패턴 섹션 (전반)

**Files:**
- Modify: `docs/Spring_개발_컨벤션.md`

- [ ] **Step 1: 섹션 3.1 예외 처리 패턴 작성**

- 예외 계층:
```
RuntimeException
└── BusinessException (code, message, httpStatus)
    ├── AuthException (AUTH_*)
    ├── NoteException (NOTE_*)
    ├── CardException (CARD_*)
    └── QuotaExceededException (QUOTA_*)
```
- GlobalExceptionHandler:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e) {
        return ResponseEntity.status(e.getHttpStatus())
            .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        List<String> details = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("VALIDATION_FAILED", "입력값 검증 실패", details));
    }
}
```
- Good: 도메인별 예외 + 명확한 에러 코드
- Bad: `throw new RuntimeException("something went wrong")`

- [ ] **Step 2: 섹션 3.2 멀티테넌시 적용 패턴 작성**

- TenantContext:
```java
public class TenantContext {
    private static final ScopedValue<String> TENANT_ID = ScopedValue.newInstance();
    
    public static String getCurrentTenantId() {
        return TENANT_ID.get();
    }
    
    public static <T> T execute(String tenantId, Callable<T> task) {
        return ScopedValue.callWhere(TENANT_ID, tenantId, task);
    }
}
```
- JPA 자동 필터: `@Filter` + `@FilterDef` 또는 Hibernate `@TenantId`
- Redis 캐시 키 규칙: `tenant:{tenantId}:notes:{noteId}`
- Kafka 이벤트: CloudEvents 확장 속성으로 `tenantid` 포함

Good 예제:
```java
// Hibernate 6.x @TenantId 활용
@Entity @Table(name = "notes")
public class Note {
    @TenantId
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
}
```

Bad 예제:
```java
// 수동 WHERE — 누락 위험
public List<Note> findAll(String tenantId) {
    return em.createQuery("SELECT n FROM Note n WHERE n.tenantId = :tid")
        .setParameter("tid", tenantId).getResultList();
}
```

- [ ] **Step 3: 섹션 3.3 이벤트 발행/구독 패턴 작성**

- 모듈 내부 (Spring Modulith):
```java
// 발행
@Service @RequiredArgsConstructor
public class NoteService {
    private final ApplicationEventPublisher events;
    
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        Note note = noteRepository.save(mapper.toEntity(request));
        events.publishEvent(new NoteCreatedEvent(note.getId(), note.getTenantId()));
        return mapper.toResponse(note);
    }
}

// 구독 (같은 서비스 내 다른 모듈)
@ApplicationModuleListener
public void onNoteCreated(NoteCreatedEvent event) {
    graphService.addNodeForNote(event.noteId());
}
```

- 크로스 서비스 (Kafka + Avro):
```java
// Avro 스키마: note-created-v1.avsc
// 네이밍: {도메인}.{동사}.{버전}
@Component @RequiredArgsConstructor
public class NoteEventPublisher {
    private final KafkaTemplate<String, SpecificRecord> kafka;
    
    public void publishNoteCreated(Note note) {
        var event = NoteCreated.newBuilder()
            .setNoteId(note.getId().toString())
            .setTenantId(note.getTenantId())
            .setTimestamp(Instant.now())
            .build();
        kafka.send("knowledge.note.created.v1", note.getTenantId(), event);
    }
}
```

- Schema Registry 규칙: BACKWARD 호환성 강제 (필드 추가만 허용, 삭제/타입변경 금지)
- Good/Bad 예제 포함

- [ ] **Step 4: 중간 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Spring_개발_컨벤션.md
git commit -m "docs: Spring 개발 컨벤션 — 심화 패턴 전반 (예외/멀티테넌시/이벤트)"
```

---

## Task 5: `Spring_개발_컨벤션.md` — 심화 패턴 섹션 (후반)

**Files:**
- Modify: `docs/Spring_개발_컨벤션.md`

- [ ] **Step 1: 섹션 3.4 트랜잭션 & 동시성 작성**

- `@Transactional` 위치: Service 레이어만 (Controller/Repository 금지)
- 읽기 전용: `@Transactional(readOnly = true)` (slave DB 라우팅)
- 낙관적 잠금:
```java
@Entity
public class Note {
    @Version
    private Long version;
}
```
- 멱등성 키:
```java
@PostMapping("/cards")
public ResponseEntity<ApiResponse<CardResponse>> createCard(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @Valid @RequestBody CardCreateRequest request) {
    // DB unique constraint on (tenant_id, idempotency_key)
    return cardService.createCardIdempotent(idempotencyKey, request);
}
```
- Good/Bad 예제 (트랜잭션 범위 최소화 vs 전체 메서드 래핑)

- [ ] **Step 2: 섹션 3.5 테스트 작성 패턴 작성**

- 단위 테스트:
```java
@ExtendWith(MockitoExtension.class)
class NoteServiceTest {
    @Mock NoteRepository noteRepository;
    @Mock NoteMapper noteMapper;
    @InjectMocks NoteService noteService;
    
    @Test
    void should_createNote_when_validRequest() {
        // given
        var request = new NoteCreateRequest("제목", "내용", List.of("java"));
        var entity = new Note(/* ... */);
        given(noteMapper.toEntity(request)).willReturn(entity);
        given(noteRepository.save(entity)).willReturn(entity);
        
        // when
        var result = noteService.createNote(request);
        
        // then
        assertThat(result).isNotNull();
        verify(noteRepository).save(entity);
    }
}
```

- 통합 테스트:
```java
@SpringBootTest
@Testcontainers
class NoteIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
    
    @Test
    void should_persistNote_when_validInput() {
        // 실제 DB 사용 통합 테스트
    }
}
```

- 테스트 네이밍: `should_{결과}_when_{조건}()`
- 커버리지: 전체 80%, 신규 85%
- Good/Bad 예제

- [ ] **Step 3: 섹션 3.6 API 구현 패턴 작성**

- 표준 응답 래핑:
```java
public record ApiResponse<T>(
    boolean success,
    T data,
    ApiMeta meta
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, ApiMeta.now());
    }
    
    public static ApiResponse<Void> error(String code, String message) {
        return new ApiResponse<>(false, null, ApiMeta.now());
    }
}
```

- 커서 기반 페이지네이션:
```java
public record CursorPage<T>(
    List<T> data,
    String cursor,
    boolean hasMore,
    long totalCount
) {}
```

- Rate Limit 인터셉터 (Redis Token Bucket 연동)
- Swagger 어노테이션:
```java
@Operation(summary = "노트 생성", description = "새 노트를 생성합니다")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "생성 성공"),
    @ApiResponse(responseCode = "400", description = "검증 실패")
})
```

- Good/Bad 예제

- [ ] **Step 4: 최종 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Spring_개발_컨벤션.md
git commit -m "docs: Spring 개발 컨벤션 — 심화 패턴 후반 완성 (트랜잭션/테스트/API)"
```

---

## Task 6: `Flutter_개발_컨벤션.md` — 개요 + 기본 규칙 섹션

**Files:**
- Create: `docs/Flutter_개발_컨벤션.md`

- [ ] **Step 1: 문서 헤더 + 개요 + 섹션 2.1 폴더 구조 작성**

- 헤더 (대상: 프론트엔드 개발자)
- 개요: DESIGN.md 연동 설명, 관련 문서 링크
- 섹션 2.1 폴더 구조 (Feature-first):
```
lib/
├── app.dart                     # MaterialApp + GoRouter 설정
├── main.dart                    # 진입점 + ProviderScope
├── core/                        # 앱 전체 공통
│   ├── constants/               # 색상, 스페이싱, 라우트 상수
│   ├── theme/                   # ThemeData + DESIGN.md 토큰
│   ├── network/                 # Dio 클라이언트 + 인터셉터
│   ├── error/                   # AppException 계층
│   └── utils/                   # 포맷터, 날짜 유틸
├── shared/                      # 재사용 위젯/모델
│   ├── widgets/                 # AppLoadingWidget, AppErrorWidget 등
│   └── models/                  # 공용 모델 (User, Tenant)
├── features/                    # 기능별 모듈
│   ├── auth/
│   │   ├── data/                # Repository 구현 + DTO
│   │   ├── domain/              # 모델 + Repository 인터페이스
│   │   ├── presentation/        # Screen + Widget
│   │   └── providers/           # Riverpod Provider
│   ├── notes/
│   ├── cards/
│   ├── graph/
│   └── dashboard/
└── l10n/                        # 국제화 파일
```
- Good: feature 내 자기 완결
- Bad: `features/notes/` 에서 `features/cards/data/` 직접 import

- [ ] **Step 2: 섹션 2.2 네이밍 컨벤션 + 2.3 위젯 작성 규칙 작성**

네이밍:
| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 | snake_case | `note_editor_screen.dart` |
| 클래스/위젯 | PascalCase | `NoteEditorScreen` |
| 변수/함수 | camelCase | `noteCount`, `fetchNotes()` |
| 상수 | lowerCamelCase | `defaultPageSize`, `maxRetryCount` |
| private | _ 접두사 | `_buildHeader()` |
| Provider | camelCase + Provider | `noteListProvider` |
| 접미사 | 역할 구분 | `*Screen`, `*Widget`, `*Provider`, `*Repository`, `*Model` |

위젯 규칙:
- StatelessWidget 우선 (Riverpod ConsumerWidget으로 상태 접근)
- build() 50줄 초과 → private 위젯 추출
- 파일당 public 위젯 1개 (private helper는 허용)
- const 생성자 적극 사용

Good:
```dart
class NoteCard extends ConsumerWidget {
  const NoteCard({super.key, required this.noteId});
  final String noteId;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final note = ref.watch(noteProvider(noteId));
    return note.when(
      data: (n) => _NoteCardContent(note: n),
      loading: () => const NoteCardSkeleton(),
      error: (e, _) => AppErrorWidget(error: e),
    );
  }
}
```

Bad:
```dart
// 하나의 파일에 300줄 build() + StatefulWidget 남용
class notecard extends StatefulWidget { // 네이밍 위반
  var noteData; // dynamic 타입, 가변
```

- [ ] **Step 3: 섹션 2.4 코드 포맷팅 + 2.5 import 정리 작성**

포맷팅:
- `dart format` (line length 80)
- trailing comma 강제 (위젯 트리 정렬 최적화)
- `analysis_options.yaml`: flutter_lints + 커스텀 룰 (`avoid_print`, `require_trailing_commas`, `prefer_const_constructors`)

import 정리:
- 순서: `dart:` → `package:` → relative (같은 feature 내만)
- barrel file: `features/notes/notes.dart` 에서 public API만 export
- Good:
```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/note_list_provider.dart';
```
- Bad:
```dart
import '../../../core/network/dio_client.dart'; // 상대경로 3단계 이상
import 'package:synapse/features/cards/data/card_repository.dart'; // feature 횡단
```

- [ ] **Step 4: 중간 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Flutter_개발_컨벤션.md
git commit -m "docs: Flutter 개발 컨벤션 — 기본 규칙 섹션 작성 (구조/네이밍/위젯/포맷/import)"
```

---

## Task 7: `Flutter_개발_컨벤션.md` — 심화 패턴 섹션 (전반)

**Files:**
- Modify: `docs/Flutter_개발_컨벤션.md`

- [ ] **Step 1: 섹션 3.1 상태관리 (Riverpod 3.0) 작성**

Provider 의사결정 테이블:
| 상황 | Provider 타입 | 예시 |
|------|--------------|------|
| 단순 계산값/변환 | `Provider` | `filteredNotesProvider` |
| 1회성 비동기 | `FutureProvider` | `userProfileProvider` |
| 실시간 스트림 | `StreamProvider` | `notificationsProvider` |
| 변경 가능 상태 | `NotifierProvider` | `noteEditorProvider` |
| ID별 인스턴스 | `.family` modifier | `noteProvider(noteId)` |
| 화면 이탈 시 해제 | `autoDispose` | `noteDetailProvider` |

Good:
```dart
@riverpod
class NoteEditor extends _$NoteEditor {
  @override
  NoteEditorState build(String noteId) {
    return NoteEditorState.initial();
  }
  
  Future<void> save() async {
    state = state.copyWith(saving: true);
    final result = await ref.read(noteRepositoryProvider).updateNote(
      noteId: state.noteId,
      title: state.title,
      content: state.content,
    );
    result.when(
      success: (_) => state = state.copyWith(saving: false, saved: true),
      failure: (e) => state = state.copyWith(saving: false, error: e),
    );
  }
}
```

Bad:
```dart
// StateProvider로 복잡한 상태 관리 시도
final noteProvider = StateProvider<Map<String, dynamic>>((ref) => {});
// 여러 StateProvider를 조합해서 일관성 없는 상태
```

- [ ] **Step 2: 섹션 3.2 라우팅 (GoRouter) 작성**

- 경로 상수:
```dart
abstract class AppRoutes {
  static const home = '/';
  static const login = '/login';
  static const notes = '/notes';
  static const noteDetail = '/notes/:noteId';
  static const cards = '/cards';
  static const cardReview = '/cards/review';
  static const graph = '/graph';
  static const settings = '/settings';
}
```

- GoRouter 설정:
```dart
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    redirect: (context, state) {
      final isLoggedIn = ref.read(authStateProvider).isAuthenticated;
      final isAuthRoute = state.matchedLocation == AppRoutes.login;
      if (!isLoggedIn && !isAuthRoute) return AppRoutes.login;
      if (isLoggedIn && isAuthRoute) return AppRoutes.home;
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: AppRoutes.home, builder: (_, __) => const DashboardScreen()),
          GoRoute(path: AppRoutes.notes, builder: (_, __) => const NoteListScreen()),
          GoRoute(path: AppRoutes.noteDetail, builder: (_, state) => 
            NoteDetailScreen(noteId: state.pathParameters['noteId']!)),
        ],
      ),
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
    ],
  );
});
```

- Good/Bad 예제 (중앙화된 라우트 vs 하드코딩된 문자열 경로)

- [ ] **Step 3: 섹션 3.3 API 통신 패턴 작성**

3계층 구조:
```dart
// 1. Repository 인터페이스 (domain/)
abstract class NoteRepository {
  Future<Result<List<Note>>> fetchNotes({String? cursor, int limit = 20});
  Future<Result<Note>> createNote(NoteCreateRequest request);
}

// 2. Repository 구현 (data/)
class NoteRepositoryImpl implements NoteRepository {
  final NoteRemoteDataSource _remote;
  
  @override
  Future<Result<List<Note>>> fetchNotes({String? cursor, int limit = 20}) async {
    try {
      final dtos = await _remote.fetchNotes(cursor: cursor, limit: limit);
      return Result.success(dtos.map((d) => d.toDomain()).toList());
    } on AppException catch (e) {
      return Result.failure(e);
    }
  }
}

// 3. RemoteDataSource (data/)
class NoteRemoteDataSource {
  final Dio _dio;
  
  Future<List<NoteDto>> fetchNotes({String? cursor, int limit = 20}) async {
    final response = await _dio.get('/notes', queryParameters: {
      if (cursor != null) 'cursor': cursor,
      'limit': limit,
    });
    final list = (response.data['data'] as List)
        .map((json) => NoteDto.fromJson(json))
        .toList();
    return list;
  }
}
```

- Dio 인터셉터: 토큰 자동 갱신 + X-Tenant-Id 헤더 주입
- 에러 매핑: DioException → AppException

Good/Bad 예제

- [ ] **Step 4: 섹션 3.4 에러/로딩 상태 처리 작성**

- AsyncValue 3상태 패턴:
```dart
// 표준 패턴
noteAsync.when(
  data: (note) => NoteContent(note: note),
  loading: () => const NoteContentSkeleton(),
  error: (error, stack) => AppErrorWidget(
    error: error,
    onRetry: () => ref.invalidate(noteProvider(noteId)),
  ),
);
```

- 공용 위젯:
```dart
class AppErrorWidget extends StatelessWidget {
  const AppErrorWidget({super.key, required this.error, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;
  // Stone-800 텍스트 + Error 색상 아이콘 + retry 버튼 (Amber)
}

class AppLoadingWidget extends StatelessWidget {
  const AppLoadingWidget({super.key});
  // CircularProgressIndicator + Amber 색상
}

class AppEmptyWidget extends StatelessWidget {
  const AppEmptyWidget({super.key, required this.message});
  final String message;
  // Stone-400 아이콘 + Stone-500 텍스트
}
```

- 스켈레톤: Shimmer 패턴 (Stone-200 기본 / Stone-100 하이라이트)
- Good/Bad 예제

- [ ] **Step 5: 중간 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Flutter_개발_컨벤션.md
git commit -m "docs: Flutter 개발 컨벤션 — 심화 패턴 전반 (Riverpod/GoRouter/API통신/에러처리)"
```

---

## Task 8: `Flutter_개발_컨벤션.md` — 심화 패턴 섹션 (후반)

**Files:**
- Modify: `docs/Flutter_개발_컨벤션.md`

- [ ] **Step 1: 섹션 3.5 UI 컴포넌트 규칙 작성**

DESIGN.md 토큰 참조법:
```dart
// core/constants/app_colors.dart — DESIGN.md 매핑
abstract class AppColors {
  // Primary
  static const primaryAmber = Color(0xFFD97706);
  static const primaryHover = Color(0xFFB45309);
  static const primaryLight = Color(0xFFFEF3C7);
  
  // Secondary
  static const secondaryTeal = Color(0xFF0D9488);
  
  // Neutrals (Warm Stone)
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
  
  // Semantic
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);
  static const error   = Color(0xFFDC2626);
  static const info    = Color(0xFF0EA5E9);
}

// core/constants/app_spacing.dart
abstract class AppSpacing {
  static const xxs = 2.0;
  static const xs  = 4.0;
  static const sm  = 8.0;
  static const md  = 16.0;
  static const lg  = 24.0;
  static const xl  = 32.0;
  static const xxl = 48.0;
  static const xxxl = 64.0;
}

// core/constants/app_breakpoints.dart
abstract class AppBreakpoints {
  static const mobile  = 640.0;
  static const tablet  = 1024.0;
}
```

- 반응형: LayoutBuilder + 브레이크포인트
```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth < AppBreakpoints.mobile) {
      return const MobileLayout();
    } else if (constraints.maxWidth < AppBreakpoints.tablet) {
      return const TabletLayout();
    }
    return const DesktopLayout();
  },
)
```

- Good: 토큰 상수 사용 / Bad: 하드코딩된 Color(0xFF...) 직접 사용

- [ ] **Step 2: 섹션 3.6 테스트 작성 패턴 작성**

- Widget Test:
```dart
testWidgets('should display note title when loaded', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        noteProvider('note-1').overrideWith(
          (ref) => AsyncValue.data(Note(id: 'note-1', title: '테스트 노트')),
        ),
      ],
      child: const MaterialApp(home: NoteDetailScreen(noteId: 'note-1')),
    ),
  );
  await tester.pumpAndSettle();
  
  expect(find.text('테스트 노트'), findsOneWidget);
});
```

- Provider Mock:
```dart
testWidgets('should show error when fetch fails', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        noteListProvider.overrideWith(
          (ref) => AsyncValue.error(AppException('NETWORK_ERROR'), StackTrace.empty),
        ),
      ],
      child: const MaterialApp(home: NoteListScreen()),
    ),
  );
  await tester.pumpAndSettle();
  
  expect(find.byType(AppErrorWidget), findsOneWidget);
  expect(find.text('재시도'), findsOneWidget);
});
```

- Golden Test 기준: 핵심 화면(Dashboard, NoteEditor, CardReview) 스냅샷
- 테스트 네이밍: `'should [행동] when [조건]'`
- Good/Bad 예제

- [ ] **Step 3: 섹션 3.7 성능 규칙 작성**

| 규칙 | Why | 적용 |
|------|-----|------|
| const 위젯 | 리빌드 방지 (동일 인스턴스 재사용) | 모든 정적 위젯에 const 생성자 |
| RepaintBoundary | 불필요한 repaint 격리 | 애니메이션, 스크롤 영역 |
| ListView.builder | lazy rendering | 10개 이상 리스트 |
| CachedNetworkImage | 이미지 캐싱 | 모든 네트워크 이미지 |
| cacheWidth/Height | 메모리 절약 | 썸네일에 resize 강제 |
| Isolate.run | UI 프레임 드롭 방지 | JSON 파싱, 마크다운 변환 |

Good:
```dart
// const + RepaintBoundary + ListView.builder
class NoteListView extends ConsumerWidget {
  const NoteListView({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notes = ref.watch(noteListProvider);
    return notes.when(
      data: (list) => ListView.builder(
        itemCount: list.length,
        itemBuilder: (_, index) => RepaintBoundary(
          child: NoteCard(noteId: list[index].id),
        ),
      ),
      loading: () => const AppLoadingWidget(),
      error: (e, _) => AppErrorWidget(error: e),
    );
  }
}
```

Bad:
```dart
// Column + map (모든 아이템 한번에 렌더링)
Column(children: notes.map((n) => NoteCard(note: n)).toList())
// 이미지 캐싱 없이 직접 로드
Image.network(url) // 캐싱 없음, resize 없음
```

- [ ] **Step 4: 최종 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/Flutter_개발_컨벤션.md
git commit -m "docs: Flutter 개발 컨벤션 — 심화 패턴 후반 완성 (UI컴포넌트/테스트/성능)"
```

---

## Task 9: 최종 검증 및 상호 참조 확인

**Files:**
- Modify: `docs/공통_개발_규칙.md`
- Modify: `docs/Spring_개발_컨벤션.md`
- Modify: `docs/Flutter_개발_컨벤션.md`

- [ ] **Step 1: 문서 간 상호 참조 링크 삽입**

각 문서의 개요 섹션에 다른 2개 문서 링크 + wiki/docs 참조 링크 확인:
- `공통_개발_규칙.md` → Spring/Flutter 문서 링크
- `Spring_개발_컨벤션.md` → 공통/Flutter 문서 링크
- `Flutter_개발_컨벤션.md` → 공통/Spring 문서 링크

- [ ] **Step 2: 일관성 검증**

확인 항목:
- 에러 코드 체계가 3개 문서에서 동일한지 (공통 3.4 ↔ Spring 3.1 ↔ Flutter 3.3)
- 멀티테넌시 패턴이 일관되는지 (공통 3.3 ↔ Spring 3.2 ↔ Flutter Dio 인터셉터)
- API 응답 포맷이 동일한지 (공통 2.3 ↔ Spring 3.6 ↔ Flutter DTO)
- DESIGN.md 토큰 값이 Flutter 컴포넌트 규칙과 일치하는지

- [ ] **Step 3: 최종 커밋**

```bash
cd C:/workspace/team-project-manager/team-project-final/documents
git add docs/공통_개발_규칙.md docs/Spring_개발_컨벤션.md docs/Flutter_개발_컨벤션.md
git commit -m "docs: 개발 컨벤션 3개 문서 상호 참조 및 일관성 검증 완료"
```
