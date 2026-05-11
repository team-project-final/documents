# Spring 개발 컨벤션

> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS  
> **버전**: v1.0  
> **작성일**: 2026-05-11  
> **대상**: 백엔드 개발자  
> **기술 스택**: Spring Boot 4 / Java 21 / Spring Modulith 1.x / Spring Security 7 / PostgreSQL 16

---

## 1. 개요

본 문서는 Synapse 백엔드 개발자가 코드 작성 시 준수해야 하는 컨벤션을 정의한다.

### 관련 문서

| 문서 | 역할 |
|------|------|
| [공통 개발 규칙](./공통_개발_규칙.md) | 전체 팀원 공통 규칙 (먼저 읽을 것) |
| [Flutter 개발 컨벤션](./Flutter_개발_컨벤션.md) | 프론트엔드 컨벤션 |
| [wiki 03_아키텍처_정의서](https://github.com/Public-Project-Area-Oragans/syn/wiki/03_프로젝트_아키텍처_정의서) | 4-서비스 통합 아키텍처 |
| [wiki 18_기술_스택_정의서](https://github.com/Public-Project-Area-Oragans/syn/wiki/18_기술_스택_정의서) | 기술 스택 상세 |
| [wiki 11_테스트_전략서](https://github.com/Public-Project-Area-Oragans/syn/wiki/11_테스트_전략서) | 테스트 피라미드/커버리지 |
| [docs/MSA_SCS_MicroFrontend_BFF](./MSA_SCS_MicroFrontend_BFF.md) | SCS/모듈 경계 상세 |

---

## 2. 기본 규칙

---

### 2.1 패키지 구조

Synapse는 **4-서비스 통합 아키텍처**로, 각 서비스 내부는 **Spring Modulith** 모듈로 분리한다.

#### 서비스 × 모듈 매핑

| 서비스 | 모듈 | 담당 |
|--------|------|------|
| `synapse-platform-svc` | auth, audit, billing, notification | 트랙 A (1명) |
| `synapse-engagement-svc` | community, gamification | 트랙 B (1명) |
| `synapse-knowledge-svc` | note, graph, chunking | 트랙 C (2명) |
| `synapse-learning-svc` | card, srs (Java) / ai (Python) | 트랙 D (2명) |

#### 표준 패키지 트리

```
com.synapse.{service}/
├── {module}/                        # Spring Modulith 모듈 (예: note, graph)
│   ├── api/                         # @RestController + Request/Response DTO
│   │   ├── NoteController.java
│   │   ├── NoteCreateRequest.java
│   │   └── NoteResponse.java
│   ├── application/                 # @Service — 유스케이스 (비즈니스 로직)
│   │   └── NoteService.java
│   ├── domain/                      # Entity, VO, Repository 인터페이스, Event
│   │   ├── model/
│   │   │   ├── Note.java
│   │   │   └── NoteStatus.java
│   │   ├── repository/
│   │   │   └── NoteRepository.java  # 인터페이스 (JpaRepository 상속)
│   │   └── event/
│   │       └── NoteCreatedEvent.java
│   └── infrastructure/              # 구현체, 외부 연동
│       ├── persistence/
│       │   └── NoteQueryRepository.java  # 복잡 쿼리 구현
│       └── messaging/
│           └── NoteEventPublisher.java
├── shared/                          # 서비스 내 공통 (BaseEntity, 공통 유틸)
│   ├── BaseEntity.java
│   ├── ApiResponse.java
│   └── exception/
│       ├── BusinessException.java
│       └── GlobalExceptionHandler.java
└── config/                          # @Configuration 클래스
    ├── SecurityConfig.java
    ├── JpaConfig.java
    └── KafkaConfig.java
```

#### 모듈 경계 규칙

- **같은 서비스 내 모듈 간**: Spring ApplicationEvent로만 통신 (직접 import 금지)
- **다른 서비스 간**: Kafka + Avro 이벤트로만 통신
- **ArchUnit 자동 검증**: CI에서 모듈 경계 위반 시 빌드 실패

#### Good 예제

```java
// note 모듈에서 graph 모듈에 알림 → 이벤트 발행
@Service
@RequiredArgsConstructor
public class NoteService {
    private final ApplicationEventPublisher events;
    
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        Note note = noteRepository.save(mapper.toEntity(request));
        events.publishEvent(new NoteCreatedEvent(note.getId(), note.getTenantId()));
        return mapper.toResponse(note);
    }
}

// graph 모듈에서 이벤트 수신
@ApplicationModuleListener
public class GraphEventListener {
    public void onNoteCreated(NoteCreatedEvent event) {
        graphService.addNodeForNote(event.noteId());
    }
}
```

#### Bad 예제

```java
// note 모듈에서 graph 모듈을 직접 import — 모듈 경계 위반
package com.synapse.knowledge.note.application;

import com.synapse.knowledge.graph.application.GraphService; // ArchUnit 실패!

@Service
public class NoteService {
    private final GraphService graphService; // 직접 의존 — 금지
}
```

---

### 2.2 네이밍 컨벤션

#### Java 코드

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스 | PascalCase + 역할 접미사 | `NoteService`, `GraphRepository` |
| 인터페이스 | PascalCase (I 접두사 금지) | `NoteRepository` (not `INoteRepository`) |
| 메서드 | camelCase + 동사 시작 | `createNote()`, `findByTenantId()` |
| 변수 | camelCase | `noteCount`, `currentUser` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| 패키지 | lowercase 단수 | `com.synapse.knowledge.note` |
| Enum 값 | UPPER_SNAKE_CASE | `NoteStatus.PUBLISHED` |

#### 역할별 접미사

| 접미사 | 역할 | 예시 |
|--------|------|------|
| `*Controller` | REST 엔드포인트 | `NoteController` |
| `*Service` | 비즈니스 로직 | `NoteService` |
| `*Repository` | 데이터 접근 | `NoteRepository` |
| `*Event` | 도메인 이벤트 | `NoteCreatedEvent` |
| `*Request` | API 요청 DTO | `NoteCreateRequest` |
| `*Response` | API 응답 DTO | `NoteResponse` |
| `*Mapper` | DTO↔Entity 변환 | `NoteMapper` |
| `*Config` | 설정 클래스 | `SecurityConfig` |
| `*Interceptor` | 요청 가로채기 | `TenantInterceptor` |
| `*Listener` | 이벤트 수신 | `GraphEventListener` |

#### DB 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블 | snake_case **복수형** | `notes`, `user_profiles`, `srs_cards` |
| 컬럼 | snake_case | `tenant_id`, `created_at`, `ease_factor` |
| 인덱스 | `idx_{테이블}_{컬럼}` | `idx_notes_tenant_id_updated_at` |
| FK | `fk_{테이블}_{참조테이블}` | `fk_notes_users` |
| PK | `id` (UUID v7) | `id UUID PRIMARY KEY` |

#### Good 예제

```java
// 명확한 네이밍
public class NoteCreateRequest { }       // Request DTO
public class NoteResponse { }            // Response DTO
public class NoteCreatedEvent { }        // 도메인 이벤트
public interface NoteRepository { }      // Repository 인터페이스
public class NoteService { }             // Service

// 메서드 — 동사로 시작, 의도 명확
noteService.createNote(request);
noteRepository.findAllByTenantId(tenantId);
noteMapper.toResponse(entity);
```

#### Bad 예제

```java
// 불명확한 네이밍
public class NoteDto { }         // Request? Response? 내부? — 모호
public class NoteManager { }     // Service와 역할 구분 불가
public class INoteRepo { }       // I 접두사 + 약어 — Java 컨벤션 위반
public class Util { }            // 무엇의 유틸?

// 메서드 — 의미 불명확
noteService.process(data);       // 무슨 처리?
noteService.doStuff();           // 의미 없음
noteService.getNoteData();       // Data 접미사 불필요
```

---

### 2.3 레이어 책임

#### 각 레이어의 역할과 금지사항

| 레이어 | 책임 | 금지사항 |
|--------|------|----------|
| **Controller** (api/) | 요청 검증(@Valid) + 응답 래핑(ApiResponse) + HTTP 상태 코드 | 비즈니스 로직, Repository 직접 호출, 트랜잭션 |
| **Service** (application/) | 비즈니스 로직 + @Transactional 경계 + 이벤트 발행 | Controller 의존, 다른 모듈 Service 직접 호출 |
| **Repository** (domain/) | 데이터 접근 인터페이스 정의 | 비즈니스 로직, HTTP 관련 코드 |
| **Infrastructure** | Repository 구현, 외부 API 연동, 메시징 | 비즈니스 로직 |

#### Good 예제

```java
// === Controller — 검증 + 위임만 ===
@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody NoteCreateRequest request) {
        NoteResponse response = noteService.createNote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CursorPage<NoteResponse>>> listNotes(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        CursorPage<NoteResponse> page = noteService.listNotes(cursor, limit);
        return ResponseEntity.ok(ApiResponse.success(page));
    }
}

// === Service — 비즈니스 로직 + 트랜잭션 ===
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {
    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;
    private final ApplicationEventPublisher events;

    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        Note note = noteMapper.toEntity(request);
        note = noteRepository.save(note);
        events.publishEvent(new NoteCreatedEvent(note.getId(), note.getTenantId()));
        return noteMapper.toResponse(note);
    }

    public CursorPage<NoteResponse> listNotes(String cursor, int limit) {
        // 페이지네이션 로직
        List<Note> notes = noteRepository.findByCursor(cursor, limit + 1);
        boolean hasMore = notes.size() > limit;
        if (hasMore) notes = notes.subList(0, limit);
        
        List<NoteResponse> responses = notes.stream()
            .map(noteMapper::toResponse).toList();
        String nextCursor = hasMore ? notes.getLast().getId().toString() : null;
        
        return new CursorPage<>(responses, nextCursor, hasMore, 
            noteRepository.countByTenantId(TenantContext.getCurrentTenantId()));
    }
}
```

#### Bad 예제

```java
// Controller에 비즈니스 로직 혼재
@PostMapping("/notes")
public ResponseEntity<?> createNote(@RequestBody Map<String, Object> body) {
    // 수동 검증 — @Valid 미사용
    String title = (String) body.get("title");
    if (title == null || title.length() > 200) {
        return ResponseEntity.badRequest().body("제목 오류");
    }
    
    // Entity 직접 생성 — Service 미위임
    Note note = new Note();
    note.setTitle(title);
    note.setTenantId(TenantContext.getCurrentTenantId());
    
    // Repository 직접 호출 — 레이어 위반
    noteRepository.save(note);
    
    // 인프라 직접 접근 — 결합도 높음
    kafkaTemplate.send("note-events", note.toString());
    
    return ResponseEntity.ok(note); // Entity 직접 반환 — 내부 구조 노출
}
```

---

### 2.4 DTO 규칙

#### DTO 분류

| 종류 | 위치 | 네이밍 | 용도 |
|------|------|--------|------|
| Request DTO | api/ | `*CreateRequest`, `*UpdateRequest` | 클라이언트 → 서버 |
| Response DTO | api/ | `*Response`, `*SummaryResponse` | 서버 → 클라이언트 |
| 내부 DTO | application/ | `*Command`, `*Query` | Service 간 전달 |

#### Java Record 사용 기준

- **Request/Response DTO**: 반드시 `record` 사용 (불변 + 간결)
- **Entity**: 일반 `class` (JPA 프록시 필요)
- **내부 DTO**: `record` 권장

#### 변환: MapStruct 매퍼

```java
@Mapper(componentModel = "spring")
public interface NoteMapper {
    NoteResponse toResponse(Note entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)  // TenantContext에서 자동 주입
    @Mapping(target = "createdAt", ignore = true)
    Note toEntity(NoteCreateRequest request);
}
```

#### Good 예제

```java
// Request DTO — record + validation
public record NoteCreateRequest(
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하")
    String title,
    
    @Size(max = 50000, message = "본문은 50,000자 이하")
    String content,
    
    @Size(max = 10, message = "태그는 최대 10개")
    List<@Size(max = 30) String> tags
) {}

// Response DTO — 필요한 정보만 노출
public record NoteResponse(
    String id,
    String title,
    String content,
    List<String> tags,
    String status,
    Instant createdAt,
    Instant updatedAt
) {}

// Entity → Response 변환은 MapStruct가 처리
NoteResponse response = noteMapper.toResponse(savedNote);
```

#### Bad 예제

```java
// 가변 클래스 + getter/setter 남발
public class NoteDto {
    private String id;
    private String title;
    private String content;
    private String tenantId;    // 내부 정보 노출!
    private String password;    // 민감정보 포함!
    
    // 30개의 getter/setter...
    public void setTitle(String t) { this.title = t; }
}

// Entity를 직접 API 응답으로 반환
@GetMapping("/notes/{id}")
public Note getNote(@PathVariable String id) {
    return noteRepository.findById(id).orElseThrow();
    // 내부 필드(tenantId, version, audit 정보) 전부 노출
}
```

---

### 2.5 코드 포맷팅

#### 기본 설정

| 항목 | 규칙 |
|------|------|
| 스타일 가이드 | Google Java Style Guide |
| 들여쓰기 | 스페이스 4칸 (탭 금지) |
| 줄 길이 | 120자 |
| 인코딩 | UTF-8 |
| 줄 끝 | LF (Unix) |

#### import 순서

```java
import java.util.*;           // 1. java.*
import javax.validation.*;    // 2. javax.*
import jakarta.persistence.*; // 3. jakarta.*

import org.springframework.*; // 4. org.*
import org.slf4j.*;

import com.synapse.*;          // 5. 프로젝트

import static org.assertj.*;   // 6. static import (마지막)
```

#### 금지 사항

- `import *` (와일드카드 import) — 사용 금지
- 미사용 import — IDE에서 자동 정리
- `System.out.println()` — 로거 사용 필수

#### IDE 설정

```
# .editorconfig (프로젝트 루트)
root = true

[*.java]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 120
```

- **IntelliJ**: `google-java-format` 플러그인 + Save Actions (format on save)
- **VS Code**: `Extension Pack for Java` + `google-java-format` formatter

---

## 3. 심화 패턴

> Good/Bad 코드 예제 + Why 설명 포함. 시니어는 패턴 확인, 주니어는 학습용.

---

### 3.1 예외 처리 패턴

#### 예외 계층 구조

```
RuntimeException
└── BusinessException (code: ErrorCode, message: String)
    ├── AuthException
    │   ├── TokenExpiredException
    │   └── InsufficientPermissionException
    ├── NoteException
    │   ├── NoteNotFoundException
    │   └── NoteQuotaExceededException
    ├── CardException
    │   └── CardReviewIntervalException
    └── BillingException
        └── PaymentFailedException
```

#### Why

- **단일 GlobalExceptionHandler**에서 모든 예외를 일관된 API 응답으로 변환
- **ErrorCode enum**으로 FE가 코드 기반으로 에러를 처리 가능
- **도메인별 예외 분리**로 catch 블록에서 세밀한 처리 가능

#### 핵심 코드

```java
// === shared/exception/BusinessException.java ===
@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    
    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
    
    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }
}

// === 도메인별 예외 ===
public class NoteNotFoundException extends BusinessException {
    public NoteNotFoundException(String noteId) {
        super(ErrorCode.NOTE_NOT_FOUND, 
              "노트를 찾을 수 없습니다: " + noteId);
    }
}

// === shared/exception/GlobalExceptionHandler.java ===
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e) {
        log.warn("비즈니스 예외 [code={}, message={}]", 
            e.getErrorCode().name(), e.getMessage());
        return ResponseEntity.status(e.getHttpStatus())
            .body(ApiResponse.error(e.getErrorCode().name(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException e) {
        List<String> details = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("VALIDATION_FAILED", "입력값 검증 실패", details));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception e) {
        log.error("예상치 못한 오류", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다."));
    }
}
```

#### Good 예제 — 사용법

```java
@Service
public class NoteService {
    public NoteResponse getNote(String noteId) {
        return noteRepository.findById(UUID.fromString(noteId))
            .map(noteMapper::toResponse)
            .orElseThrow(() -> new NoteNotFoundException(noteId));
    }
    
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        long count = noteRepository.countByTenantId(TenantContext.getCurrentTenantId());
        if (count >= quotaService.getNoteLimit()) {
            throw new NoteQuotaExceededException();
        }
        // ...
    }
}
```

#### Bad 예제

```java
// 범용 RuntimeException — 에러 코드 없음, FE 처리 불가
throw new RuntimeException("노트를 찾을 수 없습니다");

// ResponseStatusException — ErrorCode 체계 우회
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "not found");

// try-catch에서 예외 삼킴
try {
    noteRepository.save(note);
} catch (Exception e) {
    // 무시 — 에러가 사라짐
}
```

---

### 3.2 멀티테넌시 적용 패턴

#### Why

Synapse는 멀티테넌트 SaaS이므로, 모든 데이터 접근에서 **테넌트 격리**가 보장되어야 한다. 격리 실패 = 다른 조직의 데이터 노출 = 심각한 보안 사고.

#### TenantContext (Java 21 ScopedValue)

```java
// === shared/tenant/TenantContext.java ===
public final class TenantContext {
    private static final ScopedValue<String> TENANT_ID = ScopedValue.newInstance();
    
    private TenantContext() {}
    
    public static String getCurrentTenantId() {
        if (!TENANT_ID.isBound()) {
            throw new IllegalStateException("TenantContext가 설정되지 않았습니다");
        }
        return TENANT_ID.get();
    }
    
    public static <T> T executeWithTenant(String tenantId, Callable<T> task) 
            throws Exception {
        return ScopedValue.callWhere(TENANT_ID, tenantId, task);
    }
}

// === config/TenantFilter.java ===
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
            HttpServletResponse response, FilterChain chain) throws Exception {
        String tenantId = request.getHeader("X-Tenant-Id");
        if (tenantId == null) {
            response.sendError(400, "X-Tenant-Id 헤더 필수");
            return;
        }
        ScopedValue.runWhere(TenantContext.TENANT_ID, tenantId, 
            () -> chain.doFilter(request, response));
    }
}
```

#### Hibernate @TenantId 자동 필터링

```java
// === shared/BaseEntity.java ===
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @TenantId
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;
    
    @Version
    private Long version;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

#### Redis 캐시 키 규칙

```java
// 패턴: tenant:{tenantId}:{domain}:{key}
@Cacheable(
    cacheNames = "notes",
    key = "'tenant:' + T(com.synapse.knowledge.shared.TenantContext).getCurrentTenantId() "
        + "+ ':note:' + #noteId"
)
public NoteResponse getNote(String noteId) {
    return noteRepository.findById(UUID.fromString(noteId))
        .map(noteMapper::toResponse)
        .orElseThrow(() -> new NoteNotFoundException(noteId));
}

// 캐시 무효화
@CacheEvict(
    cacheNames = "notes",
    key = "'tenant:' + T(TenantContext).getCurrentTenantId() + ':note:' + #noteId"
)
@Transactional
public NoteResponse updateNote(String noteId, NoteUpdateRequest request) { /* ... */ }
```

#### Kafka 이벤트에 tenantId 포함

```java
// Avro 스키마에 tenantId 필수 필드
// note-created-v1.avsc
{
  "type": "record",
  "name": "NoteCreated",
  "namespace": "com.synapse.knowledge.event",
  "fields": [
    {"name": "noteId", "type": "string"},
    {"name": "tenantId", "type": "string"},  // 필수!
    {"name": "title", "type": "string"},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}}
  ]
}
```

#### Good 예제

```java
// @TenantId 적용 Entity — 모든 쿼리 자동 필터링
@Entity @Table(name = "notes")
public class Note extends BaseEntity {
    // tenantId는 BaseEntity에서 @TenantId로 자동 관리
    private String title;
    private String content;
}

// Repository — 별도 WHERE 불필요 (Hibernate가 자동 추가)
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findAllByOrderByUpdatedAtDesc(); // tenant_id 자동 필터링됨
}
```

#### Bad 예제

```java
// 수동 WHERE — 누락 시 전체 테넌트 데이터 노출
@Query("SELECT n FROM Note n WHERE n.tenantId = :tenantId")
List<Note> findAllByTenantId(@Param("tenantId") String tenantId);
// 이 패턴은 개발자가 tenantId 전달을 잊으면 보안 사고 발생

// 캐시 키에 tenantId 누락
@Cacheable(key = "'note:' + #noteId")  // 다른 테넌트의 캐시 반환 위험!
public NoteResponse getNote(String noteId) { /* ... */ }
```

---

### 3.3 이벤트 발행/구독 패턴

#### 두 가지 이벤트 채널

| 범위 | 방식 | 용도 |
|------|------|------|
| 모듈 내부 (같은 서비스) | Spring ApplicationEvent | note → graph 알림 |
| 서비스 간 (크로스) | Kafka + Avro | knowledge → learning 알림 |

#### 이벤트 네이밍 규칙

- Kafka 토픽: `{도메인}.{동사}.{버전}` (예: `knowledge.note.created.v1`)
- Event 클래스: `{도메인}{동사}Event` (예: `NoteCreatedEvent`)

#### 모듈 내부 이벤트 (Spring Modulith)

```java
// === 이벤트 정의 ===
public record NoteCreatedEvent(
    UUID noteId,
    String tenantId,
    String title,
    Instant occurredAt
) {
    public NoteCreatedEvent(UUID noteId, String tenantId, String title) {
        this(noteId, tenantId, title, Instant.now());
    }
}

// === 발행 (note 모듈) ===
@Service
@RequiredArgsConstructor
public class NoteService {
    private final ApplicationEventPublisher events;
    
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        Note note = noteRepository.save(mapper.toEntity(request));
        events.publishEvent(new NoteCreatedEvent(
            note.getId(), note.getTenantId(), note.getTitle()));
        return mapper.toResponse(note);
    }
}

// === 구독 (graph 모듈 — 같은 서비스 내) ===
@Component
@RequiredArgsConstructor
public class GraphNoteListener {
    private final GraphService graphService;
    
    @ApplicationModuleListener
    public void onNoteCreated(NoteCreatedEvent event) {
        graphService.createNodeForNote(event.noteId(), event.title());
    }
}
```

#### 크로스 서비스 이벤트 (Kafka + Avro)

```java
// === Avro 스키마 정의 (synapse-shared 레포) ===
// schemas/knowledge/note-created-v1.avsc
{
  "type": "record",
  "name": "NoteCreated",
  "namespace": "com.synapse.event.knowledge",
  "fields": [
    {"name": "noteId", "type": "string"},
    {"name": "tenantId", "type": "string"},
    {"name": "title", "type": "string"},
    {"name": "tags", "type": {"type": "array", "items": "string"}},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}}
  ]
}

// === 발행 (knowledge-svc) ===
@Component
@RequiredArgsConstructor
public class NoteKafkaPublisher {
    private final KafkaTemplate<String, SpecificRecord> kafkaTemplate;
    
    public void publishNoteCreated(Note note) {
        var event = NoteCreated.newBuilder()
            .setNoteId(note.getId().toString())
            .setTenantId(note.getTenantId())
            .setTitle(note.getTitle())
            .setTags(note.getTags())
            .setTimestamp(Instant.now().toEpochMilli())
            .build();
        
        // 키 = tenantId (같은 테넌트 이벤트는 같은 파티션)
        kafkaTemplate.send("knowledge.note.created.v1", 
            note.getTenantId(), event);
    }
}

// === 구독 (learning-svc) ===
@Component
@RequiredArgsConstructor
@Slf4j
public class NoteCreatedConsumer {
    private final CardSuggestionService cardSuggestionService;
    
    @KafkaListener(
        topics = "knowledge.note.created.v1",
        groupId = "learning-svc-note-consumer"
    )
    public void consume(NoteCreated event) {
        log.info("노트 생성 이벤트 수신 [noteId={}, tenantId={}]",
            event.getNoteId(), event.getTenantId());
        
        TenantContext.executeWithTenant(event.getTenantId(), () -> {
            cardSuggestionService.suggestCardsForNote(event.getNoteId());
            return null;
        });
    }
}
```

#### Schema Registry 규칙

| 규칙 | 설명 |
|------|------|
| 호환성 모드 | **BACKWARD** (기본값) |
| 필드 추가 | 허용 (default 값 필수) |
| 필드 삭제 | 금지 (소비자가 읽기 실패) |
| 필드 타입 변경 | 금지 (새 토픽 버전 생성) |
| 새 버전 토픽 | `knowledge.note.created.v2` |

#### Good 예제

```java
// 이벤트에 필요한 정보만 포함 (Entity 전체 전달 금지)
events.publishEvent(new NoteCreatedEvent(note.getId(), note.getTenantId(), note.getTitle()));
```

#### Bad 예제

```java
// Entity를 이벤트로 전달 — 결합도 높음 + 직렬화 문제
events.publishEvent(note); // Entity 직접 전달 금지

// Kafka에 JSON 직렬화 — 스키마 진화 불가
kafkaTemplate.send("notes", objectMapper.writeValueAsString(note));
// Avro + Schema Registry를 사용해야 함

// 이벤트에 tenantId 누락
var event = NoteCreated.newBuilder()
    .setNoteId(note.getId().toString())
    // .setTenantId(???) — 누락! 소비자가 테넌트 컨텍스트를 설정할 수 없음
    .build();
```

---

### 3.4 트랜잭션 & 동시성

#### 규칙 요약

| 규칙 | 설명 |
|------|------|
| @Transactional 위치 | **Service 레이어만** (Controller/Repository 금지) |
| 읽기 전용 | `@Transactional(readOnly = true)` — slave DB 라우팅 |
| 범위 최소화 | 외부 API 호출은 트랜잭션 밖에서 |
| 낙관적 잠금 | `@Version` 필드 — 동시 수정 감지 |
| 멱등성 | `Idempotency-Key` → DB unique constraint |

#### Why

- 트랜잭션 범위가 넓으면 DB 커넥션 점유 시간 증가 → 풀 고갈
- 외부 API(Stripe, OpenAI) 호출을 트랜잭션 안에 넣으면 타임아웃 시 롤백 불가
- 낙관적 잠금 없이 동시 수정 시 마지막 쓰기만 남음 (lost update)

#### Good 예제

```java
// 클래스 레벨: readOnly (대부분의 메서드가 조회)
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {
    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;
    private final NoteKafkaPublisher kafkaPublisher;

    // 조회 — readOnly 그대로
    public NoteResponse getNote(String noteId) {
        return noteRepository.findById(UUID.fromString(noteId))
            .map(noteMapper::toResponse)
            .orElseThrow(() -> new NoteNotFoundException(noteId));
    }

    // 쓰기 — 메서드 레벨에서 override
    @Transactional
    public NoteResponse createNote(NoteCreateRequest request) {
        Note note = noteRepository.save(noteMapper.toEntity(request));
        // 트랜잭션 커밋 후 이벤트 발행 (TransactionalEventListener 권장)
        return noteMapper.toResponse(note);
    }
}
```

```java
// 낙관적 잠금 — @Version
@Entity @Table(name = "notes")
public class Note extends BaseEntity {
    // BaseEntity에 @Version 포함
    private String title;
    private String content;
}

// 동시 수정 시 OptimisticLockingFailureException 발생
// → GlobalExceptionHandler에서 409 Conflict 반환
@ExceptionHandler(OptimisticLockingFailureException.class)
public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(
        OptimisticLockingFailureException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ApiResponse.error("CONCURRENT_MODIFICATION", 
            "다른 사용자가 동시에 수정했습니다. 새로고침 후 다시 시도해주세요."));
}
```

```java
// 멱등성 키 패턴
@Transactional
public CardResponse createCardIdempotent(String idempotencyKey, CardCreateRequest request) {
    // 1. 기존 결과 조회
    return idempotencyRepository.findByKey(
            TenantContext.getCurrentTenantId(), idempotencyKey)
        .map(record -> objectMapper.readValue(record.getResponse(), CardResponse.class))
        .orElseGet(() -> {
            // 2. 새로 생성
            CardResponse response = createCard(request);
            // 3. 멱등성 레코드 저장
            idempotencyRepository.save(new IdempotencyRecord(
                TenantContext.getCurrentTenantId(), idempotencyKey,
                objectMapper.writeValueAsString(response)));
            return response;
        });
}
```

#### Bad 예제

```java
// 트랜잭션 안에서 외부 API 호출 — 타임아웃 시 커넥션 점유
@Transactional
public NoteResponse createNoteWithAI(NoteCreateRequest request) {
    Note note = noteRepository.save(mapper.toEntity(request));
    
    // 외부 API — 5초 이상 걸릴 수 있음 → 트랜잭션 밖으로 이동해야 함
    String summary = openAiClient.summarize(note.getContent()); // 여기서 타임아웃!
    note.setSummary(summary);
    
    return mapper.toResponse(note);
}

// Controller에서 @Transactional — 레이어 위반
@Transactional // Controller에 금지!
@PostMapping("/notes")
public ResponseEntity<?> createNote(...) { /* ... */ }
```

---

### 3.5 테스트 작성 패턴

#### 테스트 피라미드

| 종류 | 비율 | 목적 | 도구 |
|------|------|------|------|
| 단위 테스트 | 75% | 비즈니스 로직 검증 | JUnit 5 + Mockito |
| 통합 테스트 | 20% | DB/캐시/메시징 연동 검증 | @SpringBootTest + Testcontainers |
| E2E 테스트 | 5% | 유저 시나리오 검증 | RestAssured / WebTestClient |

#### 커버리지 목표

- 전체: **80%** 이상
- 신규 코드: **85%** 이상
- CI에서 자동 체크 (jacoco)

#### 테스트 네이밍

```
should_{기대결과}_when_{조건}()
```

예시: `should_throwNoteNotFound_when_invalidId()`

#### 단위 테스트 패턴

```java
@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock NoteRepository noteRepository;
    @Mock NoteMapper noteMapper;
    @Mock ApplicationEventPublisher events;
    @InjectMocks NoteService noteService;

    @Test
    void should_createNote_when_validRequest() {
        // given
        var request = new NoteCreateRequest("제목", "내용", List.of("java"));
        var entity = Note.builder().id(UUID.randomUUID()).title("제목").build();
        var response = new NoteResponse("id", "제목", "내용", List.of("java"), 
            "DRAFT", Instant.now(), Instant.now());
        
        given(noteMapper.toEntity(request)).willReturn(entity);
        given(noteRepository.save(entity)).willReturn(entity);
        given(noteMapper.toResponse(entity)).willReturn(response);
        
        // when
        NoteResponse result = noteService.createNote(request);
        
        // then
        assertThat(result.title()).isEqualTo("제목");
        verify(noteRepository).save(entity);
        verify(events).publishEvent(any(NoteCreatedEvent.class));
    }

    @Test
    void should_throwNoteNotFound_when_invalidId() {
        // given
        String invalidId = UUID.randomUUID().toString();
        given(noteRepository.findById(any())).willReturn(Optional.empty());
        
        // when & then
        assertThatThrownBy(() -> noteService.getNote(invalidId))
            .isInstanceOf(NoteNotFoundException.class);
    }
}
```

#### 통합 테스트 패턴

```java
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class NoteIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("synapse_test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
    }

    @Autowired NoteService noteService;
    @Autowired NoteRepository noteRepository;

    @BeforeEach
    void setUp() {
        noteRepository.deleteAll();
        // TenantContext 설정
        TenantContext.executeWithTenant("test-tenant", () -> null);
    }

    @Test
    void should_persistAndRetrieveNote_when_created() {
        // given
        var request = new NoteCreateRequest("통합 테스트 노트", "내용", List.of());
        
        // when
        NoteResponse created = noteService.createNote(request);
        NoteResponse retrieved = noteService.getNote(created.id());
        
        // then
        assertThat(retrieved.title()).isEqualTo("통합 테스트 노트");
    }
}
```

#### Good 예제

```java
// given-when-then 구조 + 명확한 네이밍 + 하나의 assert 의도
@Test
void should_returnCursorPage_when_moreThanLimitNotes() {
    // given
    IntStream.range(0, 25).forEach(i -> 
        noteService.createNote(new NoteCreateRequest("노트 " + i, "", List.of())));
    
    // when
    CursorPage<NoteResponse> page = noteService.listNotes(null, 20);
    
    // then
    assertThat(page.data()).hasSize(20);
    assertThat(page.hasMore()).isTrue();
    assertThat(page.cursor()).isNotNull();
}
```

#### Bad 예제

```java
// 테스트 이름으로 의도 파악 불가
@Test
void test1() { /* ... */ }

// 하나의 테스트에 너무 많은 assert (무엇을 검증하는지 불명확)
@Test
void testNoteService() {
    // 생성도 테스트하고, 수정도 테스트하고, 삭제도 테스트하고...
    // → 각각 별도 메서드로 분리
}

// Mock 없이 외부 의존성 직접 호출 (단위 테스트가 아님)
@Test
void should_createNote() {
    NoteService service = new NoteService(
        new RealNoteRepository(), // 실제 DB 연결 — 단위 테스트에 부적합
        new RealMapper());
}
```

---

### 3.6 API 구현 패턴

#### 표준 응답 래핑 — ApiResponse

```java
// === shared/ApiResponse.java ===
public record ApiResponse<T>(
    boolean success,
    T data,
    Object error,
    ApiMeta meta
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, ApiMeta.now());
    }
    
    public static ApiResponse<Void> error(String code, String message) {
        return new ApiResponse<>(false, null, 
            new ApiError(code, message, List.of()), ApiMeta.now());
    }
    
    public static ApiResponse<Void> error(String code, String message, List<String> details) {
        return new ApiResponse<>(false, null, 
            new ApiError(code, message, details), ApiMeta.now());
    }
}

public record ApiMeta(Instant timestamp, String requestId) {
    public static ApiMeta now() {
        return new ApiMeta(Instant.now(), MDC.get("requestId"));
    }
}

public record ApiError(String code, String message, List<String> details) {}
```

#### 커서 기반 페이지네이션

```java
// === shared/CursorPage.java ===
public record CursorPage<T>(
    List<T> data,
    String cursor,
    boolean hasMore,
    long totalCount
) {}

// === Repository 구현 ===
@Repository
public class NoteQueryRepository {
    private final EntityManager em;
    
    public List<Note> findByCursor(String cursor, int limit) {
        var query = em.createQuery(
            "SELECT n FROM Note n " +
            (cursor != null ? "WHERE n.id < :cursor " : "") +
            "ORDER BY n.createdAt DESC, n.id DESC", Note.class);
        
        if (cursor != null) {
            query.setParameter("cursor", UUID.fromString(cursor));
        }
        return query.setMaxResults(limit).getResultList();
    }
}
```

#### Swagger/OpenAPI 어노테이션

```java
@Tag(name = "Notes", description = "노트 CRUD API")
@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    @Operation(summary = "노트 생성", description = "새 노트를 생성합니다. Markdown 지원.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", description = "검증 실패"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403", description = "할당량 초과")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody NoteCreateRequest request) {
        NoteResponse response = noteService.createNote(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }

    @Operation(summary = "노트 목록 조회", description = "커서 기반 페이지네이션으로 노트 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<CursorPage<NoteResponse>>> listNotes(
            @Parameter(description = "이전 페이지 마지막 ID") 
            @RequestParam(required = false) String cursor,
            @Parameter(description = "페이지 크기 (기본 20, 최대 100)")
            @RequestParam(defaultValue = "20") @Max(100) int limit) {
        return ResponseEntity.ok(ApiResponse.success(noteService.listNotes(cursor, limit)));
    }
}
```

#### Good 예제

```java
// 일관된 패턴: Controller는 위임만, 응답은 항상 ApiResponse 래핑
@DeleteMapping("/{noteId}")
public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable String noteId) {
    noteService.deleteNote(noteId);
    return ResponseEntity.ok(ApiResponse.success(null));
}
```

#### Bad 예제

```java
// 비일관적 응답 — ApiResponse 미사용
@GetMapping("/{id}")
public Note getNote(@PathVariable String id) {
    return noteRepository.findById(UUID.fromString(id)).orElse(null); // null 반환!
}

// Map 반환 — 타입 안전하지 않음
@PostMapping
public Map<String, Object> createNote(@RequestBody Map<String, Object> body) {
    return Map.of("status", "ok", "id", "some-id"); // 구조 보장 없음
}
```
