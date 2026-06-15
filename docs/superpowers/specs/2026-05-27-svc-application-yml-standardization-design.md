# `*-svc` Spring `application.yml` 공통 설정 표준화 — 설계 문서

- 작성일: 2026-05-27
- 대상: `synapse-engagement-svc`, `synapse-knowledge-svc`, `synapse-platform-svc`, `synapse-learning-svc`
- 참고: `synapse-svc-template`(정본 패턴), `synapse-gateway`, `synapse-shared`

## 1. 목표 & 원칙

- 모든 `*-svc`가 **동일한 4-파일 프로파일 구조**와 **동일한 키 네이밍·기본값 규칙**을 따른다.
- 활성 프로파일 기본값 = **`dev`** (로컬 실행 친화: localhost PostgreSQL/Redis + 개발 기본값).
- 공통 관심사(**DB·Redis·JWT·Logging**)는 구조·키·표기법을 통일한다.
- 서비스 고유 설정(oauth2/stripe/elasticsearch/kafka 등)은 동일한 프로파일 체계에 맞춰 재배치한다.
- 비밀값은 전부 `${ENV}`로 외부화한다 (learning-svc의 하드코딩 비밀번호 `1234` 제거 포함).
- 공통화 방식은 **레포별 동일 구조/규칙**(공유 모듈/Config 서버 아님). `synapse-svc-template`을 정본으로 삼는다.

## 2. 표준 파일 구조 (모든 svc 동일)

| 파일 | 위치 | 역할 |
|---|---|---|
| `application.yml` | `src/main/resources` | **base**: 프로파일 무관 공통 — app name, port, `active=dev`, actuator, 로깅 패턴, `ddl-auto=validate`, JWT 구조, 서비스 고유 공통값 |
| `application-dev.yml` | `src/main/resources` | **로컬 실행**: localhost PostgreSQL/Redis + 개발 기본값(env 오버라이드), `show-sql=true`, 앱 로그 DEBUG |
| `application-prod.yml` | `src/main/resources` | **운영**: env 필수(기본값 없음), Hikari 풀, `show-sql=false`, 로그 INFO/WARN, JWT env 필수 |
| `application-test.yml` | `src/test/resources` | **테스트**: H2 in-memory(PostgreSQL mode), flyway off, 내장 테스트 키/스텁 |

정리 작업:
- 기존 `application-local.yml`·`application-staging.yml` **제거** (dev가 local 의미를 흡수).
- `knowledge-svc`의 빈 dev/local/prod 스텁(`spring.config.activate.on-profile`만 있는 파일) **정리**.
- `learning-svc`는 `application.properties` → 4-yml 구조로 **마이그레이션**.

## 3. 공통 설정 표준

### 3.1 프로파일 활성화 (base, 전 svc 동일 표기)

```yaml
spring:
  application:
    name: <domain>-svc
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
```

### 3.2 app name + 포트맵

| 서비스 | `spring.application.name` | port |
|---|---|---|
| gateway | `synapse-gateway` | 8080 (유지, 진입점) |
| platform-svc | `platform-svc` | 8081 |
| knowledge-svc | `knowledge-svc` | 8082 |
| engagement-svc | `engagement-svc` | 8083 |
| learning-svc | `learning-svc` | 8084 (유지) |

- app name은 `synapse-` prefix를 떼고 `<domain>-svc`로 통일 (platform이 `synapse-platform-svc`, learning이 `learning-card`로 어긋나 있던 것 교정).

### 3.3 DB / JPA (프로파일별)

- **base**: `jpa.open-in-view: false`, `hibernate.ddl-auto: validate`, dialect 명시(`PostgreSQLDialect`).
- **dev**: `url: ${DB_URL:jdbc:postgresql://localhost:5432/<db>}` + 기본 계정(`${DB_USERNAME:synapse}` 등), `show-sql: true`, flyway on. → **localhost PostgreSQL(docker-compose) 전제** (H2 아님).
- **prod**: `${DB_URL}`/`${DB_USERNAME}`/`${DB_PASSWORD}` env 필수(기본값 없음), Hikari `maximum-pool-size: 20`, `show-sql: false`.
- **test**: H2 in-memory PostgreSQL mode, `ddl-auto: create-drop`, flyway off, `H2Dialect`.

### 3.4 Redis (실제 사용하는 서비스에만, 구조 동일)

- **dev**: `host: ${SPRING_DATA_REDIS_HOST:localhost}`, `port: ${SPRING_DATA_REDIS_PORT:6379}`, `password: ${SPRING_DATA_REDIS_PASSWORD:}`(빈 기본값).
- **prod**: env 필수 + `password: ${SPRING_DATA_REDIS_PASSWORD}`.
- 사용하지 않는 서비스에는 추가하지 않음(불필요한 연결 시도/기동 실패 방지).

### 3.5 JWT — `synapse.jwt.*`로 통일 (RSA 비대칭)

- **platform-svc (발급자)**: `synapse.jwt.private-key`, `public-key`, `kid`, `issuer`.
- **그 외 JWT 사용 svc (검증자)**: `synapse.jwt.public-key`, `issuer`.
- **dev**: 테스트 RSA 키 기본값 내장(`${...:<test-key>}`). **prod**: env 필수(기본값 없음).
- 기존 표기 마이그레이션:
  - platform: `jwt.*` → `synapse.jwt.*`
  - knowledge: `security.jwt.public-key-pem` → `synapse.jwt.public-key`
  - template의 HMAC `synapse.jwt.secret` 방식은 채택하지 않음.
- **engagement-svc / learning-svc: JWT 검증을 실제 코드까지 적용** (config만이 아니라 검증 필터/시큐리티 와이어링 포함).

### 3.6 Logging (공통, 컨테이너 stdout 기준 — 파일 출력 미사용)

- **base**: 공통 console 패턴
  `"%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"`.
- **dev**: 서비스 루트 패키지 DEBUG.
- **prod**: `root: INFO` + 노이즈 라이브러리 WARN.
- 루트 패키지가 `io.synapse`(engagement) vs `com.synapse.*`(others)로 갈리므로 **로깅 레벨 키는 각 서비스 실제 패키지에 맞춤**. 패키지명 리네임은 본 작업 범위 외(관찰 사항으로만 기록).

### 3.7 Actuator (base 공통)

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true
```

## 4. 서비스별 적용 계획

| 서비스 | 규모 | 핵심 변경 | 고유 설정(프로파일 재배치) |
|---|---|---|---|
| **engagement-svc** | 中 | staging 제거, test 신설, active→dev, dev에 localhost PostgreSQL 기본값, **JWT 검증자 + 실제 코드 와이어링**, 로깅 패턴 | flyway migration locations |
| **knowledge-svc** | 中 | 빈 스텁 정리, dev에 DB 실주입, JWT `security.jwt`→`synapse.jwt`(검증자), active→dev, test 정합 | `elasticsearch.uris` |
| **platform-svc** | 中 | local→dev 흡수, JWT `jwt.*`→`synapse.jwt.*`(발급자), app name prefix 제거, port 8081, 로깅 패턴 | oauth2(google/github/apple), stripe, `app.cors/cookie/crypto` |
| **learning-svc** | **大** | `.properties`→4-yml 전환, 프로파일 신설, 하드코딩 비번 제거, app name `learning-card`→`learning-svc`, **JWT 검증자 + 실제 코드 와이어링** | kafka+avro+schema-registry, springdoc, shedlock |
| (gateway) | 검토만 | 필요 시 표기 정합성만(별도 PR 아님) | cloud gateway routes, reactive redis |

## 5. 작업 방식 (git)

- 각 svc는 **독립 git repo** (현재 브랜치: engagement/knowledge/learning=`dev`, platform=`main`).
- 각 레포에서 **신규 브랜치** 생성 → 변경 → **커밋까지** 수행. **푸쉬는 대기**(명시 지시 전까지 push 금지).
- 브랜치명 규칙(제안): `chore/standardize-application-yml`.
- 본 설계 문서는 `docs/`(비-git)에 위치 — 루트/`docs`는 git 미관리.

## 6. 검증

- 각 레포 `./gradlew compileJava` 컴파일 통과.
- 가능 시 `./gradlew bootRun --args='--spring.profiles.active=dev'` 기동 확인(로컬 PostgreSQL/Redis 전제).
- `./gradlew test` (test 프로파일, H2) 통과.
- 비밀값이 yml에 평문으로 남지 않았는지 확인(특히 learning의 `1234`).

## 7. 확정된 결정 사항

- 공통화 방식: **레포별 동일 구조/규칙** (svc-template 정본).
- dev 프로파일: **로컬 실행 친화**(local 흡수), local·staging 제거.
- JWT: **RSA 비대칭** 통일, `synapse.jwt.*` 네이밍.
- app name `<도메인>-svc` 통일 + 포트맵.
- Redis: **사용하는 서비스에만** 공통 블록.
- 범위: **yml + 필요한 코드**(JWT 키명/검증 와이어링, learning yml화, redis 의존성 등).
- dev DB: **localhost PostgreSQL(docker-compose)** 전제.
- engagement/learning: **JWT 검증 실제 적용**.

## 8. 범위 외 (Out of scope)

- 패키지명 통일(`io.synapse` vs `com.synapse.*`) 리네임.
- gateway의 라우팅/구조 변경.
- 공유 설정 모듈화 또는 Spring Cloud Config 도입.
- 원격 push 및 PR 생성(명시 지시 시 별도 진행).
