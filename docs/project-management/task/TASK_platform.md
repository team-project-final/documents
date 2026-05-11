# TASK: @platform-owner

> **담당 서비스**: platform-svc (auth / user / notification / admin)  
> **주차**: W1 (2026-05-12 ~ 2026-05-16)  
> **관련 문서**: [SCOPE](../scope/SCOPE_platform.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_platform_W1.md) | [HISTORY](../history/HISTORY_platform.md)

---

## Step 1: platform-svc 골격 생성

- **Step Goal**: platform-owner가 Spring Boot 4 + Modulith 기반 platform-svc 프로젝트를 생성하여 4개 모듈 골격이 동작한다.
- **Done When**:
  - [ ] Spring Boot 4 + Modulith 프로젝트 초기화 완료
  - [ ] auth / user / notification / admin 4개 모듈 패키지 구조 생성
  - [ ] `./gradlew build` 성공
  - [ ] Modulith 구조 검증 테스트 통과 (`ApplicationModulesTest`)
  - [ ] Docker 이미지 빌드 성공
- **Scope**:
  - In Scope:
    - Spring Boot 4 + Modulith 프로젝트 생성
    - 4개 모듈 패키지 구조 (auth, user, notification, admin)
    - build.gradle 의존성 설정
    - ApplicationModulesTest 작성
    - Dockerfile 작성
  - Out of Scope:
    - 비즈니스 로직 구현
    - DB 마이그레이션
    - 외부 서비스 연동
- **Input**: 03_아키텍처_정의서 §Modulith 구조, Spring Boot 4 + Modulith 설정 가이드
- **Instructions**:
  1. Spring Initializr로 프로젝트 생성 (Spring Boot 4, Java 21, Gradle)
  2. Modulith 의존성 추가 (spring-modulith-starter, spring-modulith-test)
  3. auth / user / notification / admin 패키지 생성 + package-info.java
  4. 각 모듈에 빈 Controller + Service 클래스 생성
  5. ApplicationModulesTest 작성 및 통과 확인
  6. Dockerfile 작성 (multi-stage build)
  7. docker compose에서 platform-svc 실행 확인
- **Output Format**: `platform-svc/` 프로젝트 디렉토리 + Dockerfile + 테스트 통과 스크린샷
- **Constraints**:
  - Java 21 + Spring Boot 4 + Modulith
  - 모듈 간 순환 의존 금지
  - Gradle 빌드 시간 < 30초
- **Duration**: 1일
- **RULE Reference**: wiki 03_아키텍처_정의서 §Modulith, wiki 18_기술_스택_정의서
- **Assignee**: @platform-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 2: OAuth 회원가입/로그인

- **Step Goal**: 사용자가 Google/GitHub OAuth를 통해 회원가입하고 로그인할 수 있다.
- **Done When**:
  - [ ] Google OAuth 로그인 → 신규 사용자 자동 회원가입
  - [ ] GitHub OAuth 로그인 → 신규 사용자 자동 회원가입
  - [ ] 기존 사용자 OAuth 로그인 시 기존 계정과 매핑
  - [ ] users 테이블에 provider/provider_id 저장
  - [ ] 통합 테스트 통과
- **Scope**:
  - In Scope:
    - Spring Security OAuth2 Client 설정
    - Google OAuth 연동 (회원가입 + 로그인)
    - GitHub OAuth 연동 (회원가입 + 로그인)
    - users 테이블 설계 + Flyway 마이그레이션
    - OAuth 콜백 핸들러
    - 통합 테스트
  - Out of Scope:
    - 이메일/비밀번호 로그인
    - 소셜 프로필 동기화
    - 계정 연동 해제
- **Input**: Google/GitHub OAuth Client ID/Secret, Spring Security OAuth2 문서
- **Instructions**:
  1. application.yml에 OAuth2 Client 설정 (Google, GitHub)
  2. users 테이블 DDL 작성 + Flyway V1 마이그레이션
  3. OAuth2UserService 구현 (사용자 조회/생성 로직)
  4. OAuth2 성공 핸들러 구현 (JWT 발급 연계)
  5. 신규 사용자 자동 회원가입 로직 구현
  6. 기존 사용자 매핑 로직 구현 (email 기준)
  7. 통합 테스트 작성 (MockOAuth2User)
- **Output Format**: auth 모듈 코드 + Flyway 마이그레이션 + 테스트 코드
- **Constraints**:
  - OAuth2 Authorization Code Grant만 사용
  - 사용자 정보 최소 수집 (email, name, avatar)
  - OAuth 상태값(state) CSRF 방어 필수
- **Duration**: 2일
- **RULE Reference**: wiki 03_아키텍처_정의서 §인증, wiki 18_기술_스택_정의서 §Spring Security
- **Assignee**: @platform-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 3: JWT + MFA 기초

- **Step Goal**: 인증된 사용자에게 JWT Access/Refresh Token을 발급하고, MFA(TOTP) 등록 기초가 동작한다.
- **Done When**:
  - [ ] OAuth 로그인 성공 시 JWT Access Token (15분) 발급
  - [ ] Refresh Token (7일) 발급 + Redis 저장
  - [ ] Access Token 만료 시 Refresh Token으로 갱신
  - [ ] MFA(TOTP) 시크릿 생성 + QR 코드 URL 반환
  - [ ] TOTP 코드 검증 API 동작
  - [ ] 단위/통합 테스트 통과
- **Scope**:
  - In Scope:
    - JWT Access/Refresh Token 발급 로직
    - Refresh Token Redis 저장/조회/삭제
    - Token 갱신 API (`POST /auth/refresh`)
    - TOTP 시크릿 생성 (`POST /auth/mfa/setup`)
    - TOTP 검증 API (`POST /auth/mfa/verify`)
    - 단위/통합 테스트
  - Out of Scope:
    - MFA 강제 적용 정책
    - Token 블랙리스트 (W2)
    - SMS/이메일 MFA
- **Input**: JWT 라이브러리 (jjwt), TOTP 라이브러리 (GoogleAuth), Redis 접속 정보
- **Instructions**:
  1. JWT 유틸리티 클래스 구현 (생성, 파싱, 검증)
  2. Access Token 발급 로직 (claims: userId, roles, exp=15min)
  3. Refresh Token 발급 + Redis 저장 (key: userId, TTL: 7d)
  4. Token 갱신 엔드포인트 구현 (`POST /auth/refresh`)
  5. TOTP 시크릿 생성 + QR 코드 URL 생성 API
  6. TOTP 코드 검증 API 구현
  7. Security Filter에 JWT 검증 추가
  8. 단위 테스트 + 통합 테스트 작성
- **Output Format**: auth 모듈 JWT/MFA 코드 + Redis 설정 + 테스트 코드
- **Constraints**:
  - Access Token: 15분, Refresh Token: 7일
  - Refresh Token은 Redis에만 저장 (DB 저장 X)
  - TOTP는 RFC 6238 준수
  - JWT 서명: RS256
- **Duration**: 2일
- **RULE Reference**: wiki 03_아키텍처_정의서 §인증, wiki 10_환경_설정_템플릿 §Redis
- **Assignee**: @platform-owner
- **Reviewer**: @team-lead

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done
