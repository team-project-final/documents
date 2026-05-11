# TASK: @knowledge-owner-2

> **담당 서비스**: knowledge-svc
> **주차**: W1 (2026-05-12 ~ 2026-05-16)
> **관련 문서**: [SCOPE](../scope/SCOPE_knowledge.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_knowledge_W1.md) | [HISTORY](../history/HISTORY_knowledge.md)

---

## Step 1: Modulith 모듈 구조 설정

| 필드 | 내용 |
|------|------|
| **Step Name** | Modulith 모듈 구조 설정 |
| **Step Goal** | knowledge-owner-2가 knowledge-svc의 note/graph/chunking 모듈에 @ApplicationModule을 설정하고 모듈 간 의존성 규칙을 정의한다. |
| **Done When** | ApplicationModules.verify() 통과 + 모듈 간 직접 import 시 빌드 실패 |
| **Scope** | **In**: Modulith 설정, 모듈 패키지 구조 정의 (note, graph, chunking) / **Out**: 비즈니스 로직 구현 |
| **Input** | Spring Modulith 공식 문서, knowledge-svc 기존 패키지 구조, PRD_W1 모듈 분리 요구사항 |
| **Instructions** | 1. `build.gradle.kts`에 Spring Modulith 의존성 추가<br>2. `note`, `graph`, `chunking` 패키지 생성 및 `package-info.java` 작성<br>3. 각 모듈에 `@ApplicationModule(allowedDependencies=...)` 어노테이션 설정<br>4. 모듈 간 public API용 인터페이스 정의 (internal 패키지 분리)<br>5. `ApplicationModules.verify()` 통합 테스트 작성<br>6. 의존 위반 시 빌드 실패하는지 수동 검증<br>7. 모듈 구조 다이어그램 문서화 |
| **Output Format** | 모듈별 패키지 구조 + verify() 테스트 코드 + 빌드 로그 캡처 |
| **Constraints** | - Spring Modulith 2.x 사용<br>- 모듈 간 순환 의존 금지<br>- internal 패키지 외부 접근 시 컴파일 에러 보장<br>- 각 모듈은 독립 테스트 가능해야 함 |
| **Duration** | 1일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @knowledge-owner-2 |
| **Reviewer** | @tech-lead |

---

## Step 2: ArchUnit 모듈 경계 테스트

| 필드 | 내용 |
|------|------|
| **Step Name** | ArchUnit 모듈 경계 테스트 |
| **Step Goal** | knowledge-owner-2가 ArchUnit 테스트로 모듈 경계 위반을 자동 감지하고 CI에서 위반 시 빌드가 실패한다. |
| **Done When** | ArchUnit 테스트 3건 + CI 실행 + 위반 코드 FAIL 확인 |
| **Scope** | **In**: ArchUnit 테스트 규칙 정의, CI 파이프라인 연동 / **Out**: 런타임 모듈 격리, 성능 테스트 |
| **Input** | Step 1 완료된 모듈 구조, ArchUnit 라이브러리 문서, GitHub Actions CI 설정 |
| **Instructions** | 1. `archunit-junit5` 의존성 추가<br>2. 모듈 간 직접 의존 금지 규칙 테스트 작성<br>3. 순환 참조 감지 테스트 작성<br>4. internal 패키지 외부 접근 금지 테스트 작성<br>5. CI workflow에 ArchUnit 테스트 단계 추가<br>6. 의도적 위반 코드 push → FAIL 확인<br>7. 테스트 통과 후 위반 코드 revert |
| **Output Format** | ArchUnit 테스트 파일 3건 + CI 파이프라인 설정 + FAIL/PASS 스크린샷 |
| **Constraints** | - ArchUnit 1.3+ 사용<br>- 테스트 실행 시간 10초 이내<br>- CI에서 ArchUnit 실패 시 전체 빌드 FAIL<br>- 테스트는 `src/test/java` 내 별도 패키지로 관리 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [09-버전-관리-정책](../../wiki/09-버전-관리-정책.md) |
| **Assignee** | @knowledge-owner-2 |
| **Reviewer** | @tech-lead |

---

## Step 3: Avro 스키마 등록 및 호환성 검증

| 필드 | 내용 |
|------|------|
| **Step Name** | Avro 스키마 등록 및 호환성 검증 |
| **Step Goal** | knowledge-owner-2가 Avro 스키마를 Schema Registry에 등록하고 BACKWARD 호환성 검증이 동작한다. |
| **Done When** | note-created-v1.avsc 등록 + 비호환 스키마 거부 확인 |
| **Scope** | **In**: Avro 스키마 정의, Schema Registry 연동, 호환성 모드 설정 / **Out**: Kafka Producer/Consumer 구현, 이벤트 핸들러 |
| **Input** | note-created 이벤트 명세 (PRD_W1), Confluent Schema Registry 문서, Avro 스키마 규격 |
| **Instructions** | 1. `note-created-v1.avsc` 스키마 파일 작성 (noteId, title, content, createdAt 필드)<br>2. Schema Registry Docker 컨테이너 구성 (docker-compose)<br>3. Gradle Avro 플러그인 설정 및 코드 생성 확인<br>4. Schema Registry에 스키마 등록 스크립트 작성<br>5. BACKWARD 호환성 모드 설정<br>6. 비호환 변경(필드 삭제) 시 등록 거부 테스트<br>7. 호환 변경(optional 필드 추가) 시 등록 성공 테스트 |
| **Output Format** | Avro 스키마 파일 + docker-compose 설정 + 등록/거부 API 응답 로그 |
| **Constraints** | - Schema Registry 호환성 모드: BACKWARD<br>- 스키마 subject 네이밍: `{topic}-value`<br>- 필수 필드 삭제 불가, optional 필드만 추가 허용<br>- 스키마 ID는 자동 증분 관리 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) · [14-배포-가이드](../../wiki/14-배포-가이드.md) |
| **Assignee** | @knowledge-owner-2 |
| **Reviewer** | @tech-lead |
