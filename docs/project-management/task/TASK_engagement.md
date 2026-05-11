# TASK: @engagement-owner

> **담당 서비스**: engagement-svc (community / gamification)  
> **주차**: W1 (2026-05-12 ~ 2026-05-16)  
> **관련 문서**: [SCOPE](../scope/SCOPE_engagement.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_engagement_W1.md) | [HISTORY](../history/HISTORY_engagement.md)

---

## Step 1: engagement-svc 골격 생성

- **Step Goal**: engagement-owner가 Spring Boot 4 + Modulith 기반 engagement-svc를 생성하여 community/gamification 모듈 골격이 동작한다.
- **Done When**:
  - [ ] Spring Boot 4 + Modulith 프로젝트 초기화 완료
  - [ ] community / gamification 2개 모듈 패키지 구조 생성
  - [ ] `./gradlew build` 성공
  - [ ] Modulith 구조 검증 테스트 통과 (`ApplicationModulesTest`)
  - [ ] Docker 이미지 빌드 성공
- **Scope**:
  - In Scope:
    - Spring Boot 4 + Modulith 프로젝트 생성
    - community / gamification 모듈 패키지 구조
    - build.gradle 의존성 설정
    - ApplicationModulesTest 작성
    - Dockerfile 작성
  - Out of Scope:
    - 비즈니스 로직 구현
    - DB 마이그레이션
    - Kafka 이벤트 연동
- **Input**: 03_아키텍처_정의서 §Modulith 구조, platform-svc 골격 참조
- **Instructions**:
  1. Spring Initializr로 프로젝트 생성 (Spring Boot 4, Java 21, Gradle)
  2. Modulith 의존성 추가 (spring-modulith-starter, spring-modulith-test)
  3. community / gamification 패키지 생성 + package-info.java
  4. 각 모듈에 빈 Controller + Service 클래스 생성
  5. ApplicationModulesTest 작성 및 통과 확인
  6. Dockerfile 작성 (multi-stage build)
  7. docker compose에서 engagement-svc 실행 확인
- **Output Format**: `engagement-svc/` 프로젝트 디렉토리 + Dockerfile + 테스트 통과 스크린샷
- **Constraints**:
  - Java 21 + Spring Boot 4 + Modulith
  - 모듈 간 순환 의존 금지
  - platform-svc와 동일한 빌드 구조 유지
- **Duration**: 0.5일
- **RULE Reference**: wiki 03_아키텍처_정의서 §Modulith, wiki 18_기술_스택_정의서
- **Assignee**: @engagement-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 2: community 그룹 CRUD

- **Step Goal**: 로그인 사용자가 학습 그룹을 생성/조회/수정/삭제할 수 있다.
- **Done When**:
  - [ ] `POST /groups` → 그룹 생성 (이름, 설명, 공개여부)
  - [ ] `GET /groups` → 그룹 목록 조회 (페이징)
  - [ ] `GET /groups/{id}` → 그룹 상세 조회
  - [ ] `PUT /groups/{id}` → 그룹 정보 수정 (소유자만)
  - [ ] `DELETE /groups/{id}` → 그룹 삭제 (소유자만)
  - [ ] groups 테이블 Flyway 마이그레이션 완료
  - [ ] 통합 테스트 통과
- **Scope**:
  - In Scope:
    - groups 테이블 설계 + Flyway 마이그레이션
    - Group 엔티티 + Repository
    - GroupService CRUD 로직
    - GroupController REST API
    - 소유자 권한 검증
    - 페이징 조회
    - 통합 테스트
  - Out of Scope:
    - 그룹 검색 (OpenSearch — W3)
    - 그룹 카테고리/태그
    - 그룹 이미지 업로드
- **Input**: PRD_W1 그룹 기능 요구사항, JWT 인증 토큰 (platform-svc)
- **Instructions**:
  1. groups 테이블 DDL 작성 (id, name, description, is_public, owner_id, created_at, updated_at)
  2. Flyway V1 마이그레이션 파일 생성
  3. Group 엔티티 + JPA Repository 작성
  4. GroupService 구현 (create, findAll, findById, update, delete)
  5. 소유자 권한 검증 로직 (수정/삭제 시 owner_id 확인)
  6. GroupController REST API 구현 (5개 엔드포인트)
  7. 페이징 처리 (Pageable, 기본 20건)
  8. 통합 테스트 작성 (@SpringBootTest + TestContainers)
- **Output Format**: community 모듈 코드 + Flyway 마이그레이션 + API 문서 (Swagger)
- **Constraints**:
  - 그룹명 최대 100자, 설명 최대 500자
  - 한 사용자 최대 10개 그룹 생성 가능
  - Soft delete (deleted_at 컬럼)
- **Duration**: 1.5일
- **RULE Reference**: wiki 03_아키텍처_정의서 §REST API 규칙, wiki 09_Git_규칙_정의서 §커밋 컨벤션
- **Assignee**: @engagement-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 3: community 멤버 관리

- **Step Goal**: 그룹 소유자가 멤버를 초대/가입승인/탈퇴시킬 수 있고, 멤버는 자발적으로 가입/탈퇴할 수 있다.
- **Done When**:
  - [ ] `POST /groups/{id}/members/invite` → 멤버 초대 (소유자)
  - [ ] `POST /groups/{id}/members/join` → 가입 신청 (사용자)
  - [ ] `PUT /groups/{id}/members/{memberId}/approve` → 가입 승인 (소유자)
  - [ ] `DELETE /groups/{id}/members/{memberId}` → 멤버 탈퇴/강퇴
  - [ ] `GET /groups/{id}/members` → 멤버 목록 조회
  - [ ] 멤버 역할 구분 (OWNER, ADMIN, MEMBER)
  - [ ] group_members 테이블 마이그레이션 완료
  - [ ] 통합 테스트 통과
- **Scope**:
  - In Scope:
    - group_members 테이블 설계 + Flyway 마이그레이션
    - GroupMember 엔티티 + Repository
    - 멤버 초대/가입/승인/탈퇴/강퇴 로직
    - 멤버 역할 관리 (OWNER, ADMIN, MEMBER)
    - 멤버 목록 조회 API
    - 통합 테스트
  - Out of Scope:
    - 초대 이메일/알림 발송 (W2)
    - 멤버 활동 이력
    - 멤버 수 제한 정책
- **Input**: groups 테이블, JWT 인증 토큰, PRD_W1 멤버 관리 요구사항
- **Instructions**:
  1. group_members 테이블 DDL 작성 (group_id, user_id, role, status, joined_at)
  2. Flyway V2 마이그레이션 파일 생성
  3. GroupMember 엔티티 + Repository 작성
  4. MemberService 구현 (invite, join, approve, leave, kick)
  5. 역할 기반 권한 검증 (OWNER: 모든 작업, ADMIN: 승인/강퇴, MEMBER: 탈퇴만)
  6. MemberController REST API 구현
  7. 멤버 상태 관리 (PENDING, ACTIVE, KICKED)
  8. 통합 테스트 작성 (역할별 시나리오)
- **Output Format**: community 모듈 멤버 관리 코드 + Flyway 마이그레이션 + 테스트 코드
- **Constraints**:
  - 공개 그룹: 즉시 가입, 비공개 그룹: 승인 필요
  - OWNER는 탈퇴 불가 (소유권 이전 후 탈퇴)
  - 강퇴된 멤버는 7일간 재가입 불가
- **Duration**: 2일
- **RULE Reference**: wiki 03_아키텍처_정의서 §REST API 규칙, wiki 09_Git_규칙_정의서 §커밋 컨벤션
- **Assignee**: @engagement-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done
