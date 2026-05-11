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
