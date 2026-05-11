# TASK: @learning-card-owner

> **담당 서비스**: learning-card-svc
> **주차**: W1 (2026-05-12 ~ 2026-05-16)
> **관련 문서**: [SCOPE](../scope/SCOPE_learning-card.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_learning-card_W1.md) | [HISTORY](../history/HISTORY_learning-card.md)

---

## Step 1: 프로젝트 초기 설정

| 필드 | 내용 |
|------|------|
| **Step Name** | 프로젝트 초기 설정 |
| **Step Goal** | learning-card-owner가 Spring Boot 4 + Modulith 기반 learning-card 프로젝트를 생성하여 card/srs 모듈 골격이 동작한다. |
| **Done When** | 빌드 성공 + Modulith verify + Health endpoint |
| **Scope** | **In**: Spring Boot 4 프로젝트 생성, Modulith 설정, card/srs 모듈 패키지, Health endpoint / **Out**: 비즈니스 로직, DB 마이그레이션, API 구현 |
| **Input** | Spring Initializr 설정, PRD_W1 모듈 구조 요구사항, 팀 공통 Gradle 설정 |
| **Instructions** | 1. Spring Initializr로 Spring Boot 4 + Java 21 프로젝트 생성<br>2. `build.gradle.kts`에 Modulith, Actuator, Web 의존성 추가<br>3. `card`, `srs` 패키지 생성 및 `@ApplicationModule` 설정<br>4. `ApplicationModules.verify()` 테스트 작성<br>5. Health endpoint (`/actuator/health`) 활성화 및 확인<br>6. `.gitignore`, `Dockerfile`, `docker-compose.yml` 기본 설정 |
| **Output Format** | 프로젝트 디렉토리 구조 + 빌드 로그 + Health 응답 캡처 |
| **Constraints** | - Spring Boot 4.x + Java 21<br>- Gradle Kotlin DSL 사용<br>- 포트: 8082<br>- Modulith verify 필수 통과 |
| **Duration** | 0.5일 |
| **RULE Reference** | [18-기술-스택](../../wiki/18-기술-스택.md) · [10-환경-설정](../../wiki/10-환경-설정.md) |
| **Assignee** | @learning-card-owner |
| **Reviewer** | @tech-lead |

---

## Step 2: 덱/카드 CRUD API

| 필드 | 내용 |
|------|------|
| **Step Name** | 덱/카드 CRUD API |
| **Step Goal** | 로그인 사용자가 덱(Deck)을 생성/관리하고, 덱 내 카드(앞면/뒷면)를 생성/조회/수정/삭제할 수 있다. |
| **Done When** | 덱/카드 CRUD API + 1:N 관계 + 테스트 통과 |
| **Scope** | **In**: decks 테이블, cards 테이블, CRUD API, 페이지네이션 / **Out**: SM-2 알고리즘, 복습 세션, Kafka 이벤트 |
| **Input** | Step 1 완료된 프로젝트, ERD 설계, PRD_W1 API 명세 |
| **Instructions** | 1. `decks` 테이블 스키마 설계 (id, userId, title, description, createdAt, updatedAt)<br>2. `cards` 테이블 스키마 설계 (id, deckId, front, back, createdAt, updatedAt)<br>3. Flyway 마이그레이션 스크립트 작성<br>4. Deck CRUD REST API 구현 (POST/GET/PUT/DELETE)<br>5. Card CRUD REST API 구현 (Deck 하위 리소스)<br>6. 페이지네이션 적용 (Pageable, 기본 20건)<br>7. 통합 테스트 작성 (각 API 엔드포인트별)<br>8. 입력값 검증 (Bean Validation) 적용 |
| **Output Format** | API 엔드포인트 목록 + 테스트 결과 + Flyway 마이그레이션 파일 |
| **Constraints** | - RESTful URL 규칙 준수 (`/api/v1/decks/{deckId}/cards`)<br>- userId는 JWT에서 추출 (인증 필터 연동)<br>- 페이지네이션 최대 100건 제한<br>- soft delete 적용 (deletedAt 컬럼)<br>- PostgreSQL 사용 |
| **Duration** | 2일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) · [09-버전-관리-정책](../../wiki/09-버전-관리-정책.md) |
| **Assignee** | @learning-card-owner |
| **Reviewer** | @tech-lead |

---

## Step 3: SM-2 알고리즘 구현

| 필드 | 내용 |
|------|------|
| **Step Name** | SM-2 알고리즘 구현 |
| **Step Goal** | 시스템이 카드 복습 결과(rating)를 받아 SM-2 알고리즘으로 다음 복습일과 ease factor를 계산한다. |
| **Done When** | SM-2 계산 로직 + 단위 테스트(4개 rating × 경계값) 통과 |
| **Scope** | **In**: SM-2 알고리즘 로직, rating 입력 처리, interval/EF 계산 / **Out**: 복습 세션 UI, 복습 스케줄링, 통계 집계 |
| **Input** | SM-2 알고리즘 논문/명세, Step 2 완료된 카드 엔티티, PRD_W1 SRS 요구사항 |
| **Instructions** | 1. `Sm2Calculator` 도메인 서비스 클래스 생성<br>2. rating enum 정의 (Again=0, Hard=1, Good=2, Easy=3)<br>3. interval 계산 로직 구현 (rating별 분기)<br>4. ease factor 업데이트 로직 구현 (최소 1.3 보장)<br>5. `review_logs` 테이블 설계 및 마이그레이션<br>6. 단위 테스트 작성: 4개 rating × 초기/중간/고EF 경계값<br>7. 통합 테스트: POST `/api/v1/cards/{cardId}/review` 엔드포인트 |
| **Output Format** | SM-2 계산 클래스 + 단위 테스트 결과 + review API 응답 예시 |
| **Constraints** | - Again → interval = 1 (리셋)<br>- Hard → interval 유지 (변경 없음)<br>- Good → interval × EF<br>- Easy → interval × EF × 2<br>- EF 최솟값: 1.3<br>- 초기 interval: 1일<br>- 부동소수점 연산 시 반올림 처리 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @learning-card-owner |
| **Reviewer** | @tech-lead |
