# `*-svc` Spring `application.yml` 공통 설정 표준화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4개 `*-svc` 레포(engagement/knowledge/platform/learning)의 Spring 설정을 동일한 `base/dev/prod/test` 4-프로파일 구조와 공통 키 규칙(DB·Redis·JWT·Logging·app-name·port)으로 표준화한다.

**Architecture:** 레포별 동일 구조/규칙(공유 모듈/Config 서버 아님). 활성 프로파일 기본값 `dev`(로컬 실행 친화: localhost PostgreSQL/Redis). JWT는 RSA 비대칭으로 통일 — platform=발급자(`synapse.jwt.private-key/public-key/kid/issuer`), 나머지=검증자(`synapse.jwt.public-key`, OAuth2 Resource Server + NimbusJwtDecoder). engagement/learning은 보안 계층만 실제 적용(컨트롤러 X-User-Id 유지).

**Tech Stack:** Spring Boot 4.0.0, Java 21, Gradle(Kotlin DSL), PostgreSQL/H2, Spring Modulith, Flyway, OAuth2 Resource Server, Nimbus JWT, Redis(platform), Kafka/Avro(learning).

**작업 규칙:** 각 레포는 독립 git repo. 각 레포에서 신규 브랜치 `chore/standardize-application-yml` 생성 → 변경 → 커밋. **push는 명시 지시 전까지 금지.** 4개 Phase는 상호 독립이며 순서 무관(권장 순서: platform → knowledge → engagement → learning).

---

## 공통 표준 레퍼런스 (Shared Standard Reference)

아래 값/패턴은 전 레포에서 동일하게 사용한다. 각 Task에서 인용한다.

### R1. 활성 프로파일 (base `application.yml` 공통)
```yaml
spring:
  application:
    name: <domain>-svc        # platform-svc / knowledge-svc / engagement-svc / learning-svc
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
```

### R2. 포트맵
| 서비스 | name | port |
|---|---|---|
| platform-svc | `platform-svc` | 8081 |
| knowledge-svc | `knowledge-svc` | 8082 |
| engagement-svc | `engagement-svc` | 8083 |
| learning-svc | `learning-svc` | 8084 |

### R3. 공통 로깅 패턴 (base `application.yml`)
```yaml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"
```
- dev: 서비스 루트 패키지 DEBUG (전 서비스 실제 루트 패키지 `com.synapse.<svc>`). ⚠️ engagement 기존 yml은 `io.synapse`로 잘못 지정돼 있었음 → 실제 패키지 `com.synapse.engagement`로 교정.
- prod: `root: INFO`

### R4. 로컬 인프라 기본값 (synapse-shared/docker-compose.yml 기준)
| 항목 | dev 기본값 |
|---|---|
| PostgreSQL | host `localhost`, port `5432`, db `synapse`, user `synapse`, pw `synapse_local_pw` |
| Redis | host `localhost`, port `6379`, pw `redis_local_pw` |

서비스별 DB명: platform=`synapse`, knowledge=`synapse`, engagement=`synapse`, learning=`synapse_learning`.

### R5. JWT 규약 (synapse-shared/docs/rules)
- 알고리즘 RS256, `kid: synapse-key-2026-05`, `issuer: synapse-auth`.
- 공통 prefix: `synapse.jwt.*`.
- **발급자(platform)**: `private-key`, `public-key`, `kid`, `issuer`.
- **검증자(knowledge/engagement/learning)**: `public-key`(+`issuer` 보관). NimbusJwtDecoder는 public-key로 검증(issuer 강제는 본 작업 범위 외 — 기존 동작하는 knowledge 검증자와 동일하게 유지).

### R6. DEV 테스트 RSA 키 (platform 발급자의 테스트 키쌍 — 전 검증자의 dev 기본 public-key로 사용)

**PRIVATE_KEY (platform dev/test 기본값, raw base64 PKCS8):**
```
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyli5uWptvswem4np3RJSQNOXrf/3ZPvg352DcyJvOurPlTwoZm3Py/qx3NsxNoM+bGUOQEuQVqzNTdib0+9IWjKbnl0hHNNkqmMs8wXJRGB93qdd8E+gCXMhvTRwZiN7p5ATVTU4BaiN7td9+Nm1Oxs3dW0Q5rp41tFba6/3kheQkO1wb+Sh4uI1vjYEXbyuGkBiYYTbiJDF8BFGqHshncTqCJaa5cgOwRpYkIq39SVRuYqlRIB+fCuJbETvyUAtcdBKYVaXZZn2u5fNQFalBkk8QY7hHFfbz3wfEDsm/lXtWqYa8SoHdlhezbDJp5ekWN+/+JY8L/7zc8zJGLpW1AgMBAAECggEAOA/wTIFSKVsU7F1Nn7JeRvTsNqVL7c6YQoh2vmiVjOzMe5B39bj4ydAMGTKRKU9xzNk9/fUIOAsyBiHhsed5uM13ud0iegQLppUnvA9oUS/W9QxS0qc3HsK8wz/8McHnZJpJsCJf+g61S+k421i/sMq1Jqe3f7oi/W37FCegYQPlrPkkXMnPGzqG/3wEkbPyxkBNTvlpFjurlzU0jftMCCYDL5J8CthE6Iu/jWZCUez5SUi5QSFpUG6lub4zTHunhEBTtah/lcxynhW5ZppiGPedxk+v2HpNGfPBv7sqRpE5h8dTbtqjCgrX7M1xEgU7wODn5VPTRTIlY1b4WopeQwKBgQD1K2Zx1W4NBoTLjYqHoATcaFZ1Q42pdojbfXDw9XbxEOYpEVu7zUj0YKWDJaB1FxijQSBfo8ZcGRI9YOOPWOS0tQY3YY/AzWG7x/QLEijHxq42+KnLE2ebsVsfMyMLy2kkMQ4w7CGHhVV048OIwrzpLMjKmiBz9oArCrcpZAHOowKBgQC6ec0qQmKeTfDo4soD3cELaxxVY9Yb1kw309LMJOOLHjMtfiHHEc9Cp2n5ekIxblPXavCREMg5AF6Dz7EqyI3/vue4HKVdfLQmx1dZudfxT0TLGfEPdlAC32gx6aK7Q1/F7CCTA0HVopVWUjCIECO7l1NmilRsd+mdnIAXH+WHxwKBgQC2ep4efhgSU9bFVs1UExNrJbGsSCKJjnNgwuYsQtdLqCNXT9cyWiJB2il3Cqt6Wz14TYIWDWUXqYV877+QMz7PDanZ0KDZhUSIKtSG5PY7c7K5sa1XPFMye/hxqXMdVUIlsOl6Glb+coxfmyMviJppB29P9RXQmhldb/VSNmBt9wKBgQCvKC/NzRODLSToK/ajkQ1+Yzr2/lMkTLPFEMQFm3TcvR5HUh36NkFfk4+Ylf1NHxvD0aBsMr5PxIgC+fipfj7bhf90UfwGh1dUwZPMJSOwd8vfltt2saRQPndJwvJnQc7ZQ4i2DaauDwJHvK2RfC9CwKBgChMTBYV96uwRqvF6r4GW1qazlMOSKErLl5967qHw2loZHwwY9v6D4a1yw2dDWhRZF2vy5ONNHxBuDAiuvY6fnhyEMENDiid/ytw5X3VLx4P5CBgOnvB7XgLfaDaKzKp6pBmitTIPfsiTT+AL726L2qQPdVHh72You1sPmDetFdSm
```

**PUBLIC_KEY (전 검증자 dev 기본값, raw base64 X509):**
```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAspYublqbb7MHpuJ6d0SUkDTl63/92T74N+dg3Mibzrqz5U8KGZtz8v6sdzbMTaDPmxlDkBLkFaszU3Ym9PvSFoym55dIRzTZKpjLPMFyURgfd6nXfBPoAlzIb00cGYje6eQE1U1OAWoje7XffjZtTsbN3VtEOa6eNbRW2uv95IXkJDtcG/koeLiNb42BF28rhpAYmGE24iQxfARRqh7IZ3E6giWmuXIDsEaWJCKt/UlUbmKpUSAfnwriWxE78lALXHQSmFWl2WZ9ruXzUBWpQZJPEGO4RxX2898HxA7Jv5V7VqmGvEqB3ZYXs2wyaeXpFjfv/iWPC/+83PMyRi6VtQIDAQAB
```

### R7. 검증자 SecurityConfig 정본 (knowledge-svc의 동작 코드 기반 — engagement/learning에 패키지만 바꿔 복제)
NimbusJwtDecoder가 raw base64 X509와 PEM을 모두 처리(공백 제거 후 base64 decode).
```java
// package: <root>.global.config;  (root: io.synapse.engagement / com.synapse.learning)
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                /* PERMIT_LIST — 서비스별로 교체 */
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth.jwt(org.springframework.security.config.Customizer.withDefaults()))
            .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${synapse.jwt.public-key:}") String publicKey) {
        RSAPublicKey key = StringUtils.hasText(publicKey) ? parse(publicKey) : ephemeral();
        return NimbusJwtDecoder.withPublicKey(key).build();
    }

    private RSAPublicKey parse(String pem) {
        try {
            String n = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                          .replace("-----END PUBLIC KEY-----", "")
                          .replaceAll("\\s+", "");
            byte[] d = Base64.getDecoder().decode(n);
            return (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(d));
        } catch (Exception ex) {
            throw new IllegalStateException("synapse.jwt.public-key 파싱 실패", ex);
        }
    }

    private RSAPublicKey ephemeral() {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048);
            KeyPair kp = g.generateKeyPair();
            return (RSAPublicKey) kp.getPublic();
        } catch (Exception ex) {
            throw new IllegalStateException("임시 공개키 생성 실패", ex);
        }
    }
}
```

---

## Phase 0: 사전 점검

### Task 0.1: 인프라/브랜치 점검

- [ ] **Step 1: 각 레포가 git repo이고 워킹트리가 깨끗한지 확인**

Run (PowerShell, 루트 `C:\workspace\team-project-final`):
```powershell
"synapse-platform-svc","synapse-knowledge-svc","synapse-engagement-svc","synapse-learning-svc" | % {
  "$_ => branch=$(git -C $_ rev-parse --abbrev-ref HEAD); dirty=$(git -C $_ status --porcelain | Measure-Object -Line | % Lines)"
}
```
Expected: 4줄 출력, 각 `dirty=0`. dirty가 0이 아니면 해당 레포에서 멈추고 사용자에게 보고.

- [ ] **Step 2: (선택) 로컬 인프라 기동 — dev 기동 검증용**

Run:
```powershell
docker compose -f synapse-shared/docker-compose.yml up -d postgres redis
```
Expected: `synapse-postgres`, `synapse-redis` 컨테이너 Up. Docker 미사용 환경이면 이 단계는 건너뛰고 dev 기동 검증 대신 `gradlew test`(H2)만 수행.

---

## Phase 1: platform-svc (발급자, 표기 정리)

브랜치 생성:
- [ ] **Step: 브랜치 생성**
```powershell
git -C synapse-platform-svc checkout -b chore/standardize-application-yml
```

### Task 1.1: JWT 프로퍼티 prefix `jwt` → `synapse.jwt`

**Files:**
- Modify: `synapse-platform-svc/src/main/java/com/synapse/platform/auth/config/JwtProperties.java`

- [ ] **Step 1: @ConfigurationProperties prefix 변경**

`JwtProperties.java`에서:
```java
@ConfigurationProperties(prefix = "jwt")
```
→
```java
@ConfigurationProperties(prefix = "synapse.jwt")
```
(나머지 record 본문/메서드는 그대로. `JwtTokenProvider`는 `properties.kid()` 등 메서드만 사용하므로 코드 변경 불필요.)

### Task 1.2: yml의 `jwt:` → `synapse.jwt:` (4개 파일)

**Files:**
- Modify: `src/main/resources/application-prod.yml`
- Modify: `src/test/resources/application.yml`
- (dev/local은 Task 1.4에서 재작성하며 함께 반영)

- [ ] **Step 1: application-prod.yml — `jwt:` 블록을 `synapse.jwt:`로 중첩**

기존:
```yaml
jwt:
  private-key: ${JWT_PRIVATE_KEY}
  public-key: ${JWT_PUBLIC_KEY}
  kid: ${JWT_KID:synapse-key-2026-05}
  issuer: ${JWT_ISSUER:synapse-auth}
```
→
```yaml
synapse:
  jwt:
    private-key: ${JWT_PRIVATE_KEY}
    public-key: ${JWT_PUBLIC_KEY}
    kid: ${JWT_KID:synapse-key-2026-05}
    issuer: ${JWT_ISSUER:synapse-auth}
```

- [ ] **Step 2: src/test/resources/application.yml — 동일하게 `jwt:` → `synapse.jwt:`**

기존 test의 `jwt:` 블록(테스트 RSA 키/kid/issuer 포함)을 `synapse:\n  jwt:` 하위로 그대로 이동(들여쓰기 2칸 추가). 값은 변경하지 않는다.

### Task 1.3: base `application.yml` 정리 (name/active/port/logging)

**Files:**
- Modify: `src/main/resources/application.yml`

- [ ] **Step 1: app name·active·port·logging 반영**

`spring.application.name`을 `synapse-platform-svc` → `platform-svc`로 변경. `spring.profiles.active`를 `local` → `${SPRING_PROFILES_ACTIVE:dev}`로 변경. `server.port: 8080` → `8081`. 파일 끝에 R3 로깅 패턴 추가:
```yaml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"
```
(oauth2/management/app/stripe 등 기존 블록은 유지.)

### Task 1.4: local 흡수 → dev 재작성, local 삭제

**Files:**
- Delete: `src/main/resources/application-local.yml`
- Modify(전체 교체): `src/main/resources/application-dev.yml`

- [ ] **Step 1: application-local.yml 삭제**
```powershell
git -C synapse-platform-svc rm src/main/resources/application-local.yml
```

- [ ] **Step 2: application-dev.yml 전체 내용을 아래로 교체** (구 local의 로컬 실행 기본값 + synapse.jwt + redis 포함)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/synapse}
    username: ${DB_USERNAME:synapse}
    password: ${DB_PASSWORD:synapse_local_pw}
    driver-class-name: org.postgresql.Driver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
  data:
    redis:
      host: ${SPRING_DATA_REDIS_HOST:localhost}
      port: ${SPRING_DATA_REDIS_PORT:6379}
      password: ${SPRING_DATA_REDIS_PASSWORD:redis_local_pw}
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID:local-google-client-id}
            client-secret: ${GOOGLE_CLIENT_SECRET:local-google-client-secret}
            scope: openid,email,profile
          github:
            client-id: ${GITHUB_CLIENT_ID:local-github-client-id}
            client-secret: ${GITHUB_CLIENT_SECRET:local-github-client-secret}
            scope: read:user,user:email
          apple:
            client-id: ${APPLE_CLIENT_ID:local-apple-client-id}
            client-secret: ${APPLE_CLIENT_SECRET:local-apple-client-secret}
            scope: openid,name,email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            client-authentication-method: client_secret_post

synapse:
  jwt:
    private-key: ${JWT_PRIVATE_KEY:<R6 PRIVATE_KEY 값 그대로 붙여넣기>}
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    kid: synapse-key-2026-05
    issuer: synapse-auth

app:
  cors:
    allowed-origins: http://127.0.0.1:8088,http://localhost:3000,http://localhost:5173
  crypto:
    aes-secret-key: ${AES_SECRET_KEY:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=}

stripe:
  api:
    key: ${STRIPE_API_KEY:sk_test_unit}
  webhook:
    secret: ${STRIPE_WEBHOOK_SECRET:whsec_test}
  plans:
    pro:
      price-id: ${STRIPE_PRO_PRICE_ID:price_pro_test}
    team:
      price-id: ${STRIPE_TEAM_PRICE_ID:price_team_test}
    enterprise:
      price-id: ${STRIPE_ENTERPRISE_PRICE_ID:price_enterprise_test}

logging:
  level:
    com.synapse.platform: DEBUG
```
> `<R6 ... 값 그대로 붙여넣기>`는 위 레퍼런스 R6의 실제 base64 문자열을 그대로 사용.

### Task 1.5: prod.yml에 redis 추가 + logging

**Files:**
- Modify: `src/main/resources/application-prod.yml`

- [ ] **Step 1: redis(env 필수)와 prod 로깅 추가**
```yaml
spring:
  data:
    redis:
      host: ${SPRING_DATA_REDIS_HOST}
      port: ${SPRING_DATA_REDIS_PORT:6379}
      password: ${SPRING_DATA_REDIS_PASSWORD}

logging:
  level:
    root: INFO
```
(기존 datasource/jpa/synapse.jwt 블록과 병합. 같은 `spring:` 루트 아래 `data.redis` 추가.)

### Task 1.6: 검증 & 커밋

- [ ] **Step 1: 컴파일**

Run: `cd synapse-platform-svc; ./gradlew compileJava`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 2: 테스트(기존 auth/JWT 테스트가 synapse.jwt 바인딩을 커버)**

Run: `./gradlew test`
Expected: `BUILD SUCCESSFUL`. JWT 관련 테스트 통과(= prefix 변경이 정상 반영).
실패 시: 남은 `jwt:`/`@ConfigurationProperties(prefix="jwt")` 누락 위치를 grep으로 점검(`Select-String -Pattern "prefix = \"jwt\"","^jwt:" -Path src -Recurse`).

- [ ] **Step 3: (가능 시) dev 기동 스모크**

Run: `./gradlew bootRun --args='--spring.profiles.active=dev'`
Expected: 8081 포트 기동, `/actuator/health` 200. 확인 후 종료.

- [ ] **Step 4: 커밋**
```powershell
git -C synapse-platform-svc add -A
git -C synapse-platform-svc commit -m "chore: standardize application.yml (profiles dev/prod/test, synapse.jwt prefix, port 8081)"
```

---

## Phase 2: knowledge-svc (검증자, 프로퍼티 리네임 + dev DB 실주입)

- [ ] **Step: 브랜치 생성**
```powershell
git -C synapse-knowledge-svc checkout -b chore/standardize-application-yml
```

### Task 2.1: JWT 프로퍼티 `security.jwt.public-key-pem` → `synapse.jwt.public-key`

**Files:**
- Modify: `src/main/java/com/synapse/knowledge/global/config/SecurityConfig.java`

- [ ] **Step 1: @Value 키와 에러 메시지 변경**

`SecurityConfig.java`:
```java
JwtDecoder jwtDecoder(@Value("${security.jwt.public-key-pem:}") String publicKeyPem) {
```
→
```java
JwtDecoder jwtDecoder(@Value("${synapse.jwt.public-key:}") String publicKeyPem) {
```
그리고 에러 메시지:
```java
throw new IllegalStateException("security.jwt.public-key-pem 파싱에 실패했습니다", ex);
```
→
```java
throw new IllegalStateException("synapse.jwt.public-key 파싱에 실패했습니다", ex);
```

### Task 2.2: base `application.yml` 정리

**Files:**
- Modify: `src/main/resources/application.yml`

- [ ] **Step 1: name/active/port/logging + JWT 키 이동**

기존:
```yaml
spring:
  application:
    name: knowledge-svc
  profiles:
    default: local
  elasticsearch:
    uris: ${ELASTICSEARCH_URIS:http://localhost:9200}

security:
  jwt:
    public-key-pem: ${SECURITY_JWT_PUBLIC_KEY_PEM:}
```
→
```yaml
spring:
  application:
    name: knowledge-svc
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  elasticsearch:
    uris: ${ELASTICSEARCH_URIS:http://localhost:9200}

server:
  port: 8082

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"
```

### Task 2.3: 빈 스텁 프로파일 → 실제 dev/prod 작성, local 삭제

**Files:**
- Delete: `src/main/resources/application-local.yml`
- Modify(전체 교체): `src/main/resources/application-dev.yml`
- Modify(전체 교체): `src/main/resources/application-prod.yml`

- [ ] **Step 1: local 삭제**
```powershell
git -C synapse-knowledge-svc rm src/main/resources/application-local.yml
```

- [ ] **Step 2: application-dev.yml 전체 교체** (현재는 `on-profile`만 있는 빈 파일)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/synapse}
    username: ${DB_USERNAME:synapse}
    password: ${DB_PASSWORD:synapse_local_pw}
    driver-class-name: org.postgresql.Driver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  elasticsearch:
    uris: ${ELASTICSEARCH_URIS:http://localhost:9200}

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth

logging:
  level:
    com.synapse.knowledge: DEBUG
```

- [ ] **Step 3: application-prod.yml 전체 교체**
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  elasticsearch:
    uris: ${ELASTICSEARCH_URIS}

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  level:
    root: INFO
```

### Task 2.4: test 프로파일 정합

**Files:**
- Modify: `src/test/resources/application-test.yml`

- [ ] **Step 1: 기존 H2/flyway-off 설정 유지 확인 + synapse.jwt 검증자 기본값 추가**

기존 datasource(H2)/flyway(disabled)/jpa 블록은 그대로 두고, 파일 끝에 추가:
```yaml
synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth
```
(테스트가 토큰 검증을 요구하지 않으면 무시되지만, 표준 키 정합을 위해 둔다.)

### Task 2.5: 검증 & 커밋

- [ ] **Step 1: 컴파일**

Run: `cd synapse-knowledge-svc; ./gradlew compileJava`
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 2: 프로퍼티 잔재 점검**

Run (PowerShell): `Select-String -Path src -Recurse -Pattern "security\.jwt\.public-key-pem","SECURITY_JWT_PUBLIC_KEY_PEM"`
Expected: 매칭 없음.

- [ ] **Step 3: 테스트**

Run: `./gradlew test`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 4: 커밋**
```powershell
git -C synapse-knowledge-svc add -A
git -C synapse-knowledge-svc commit -m "chore: standardize application.yml (profiles dev/prod/test, synapse.jwt prefix, port 8082)"
```

---

## Phase 3: engagement-svc (보안 계층 신설 + 프로파일 정리)

- [ ] **Step: 브랜치 생성**
```powershell
git -C synapse-engagement-svc checkout -b chore/standardize-application-yml
```

### Task 3.1: 보안 의존성 추가

**Files:**
- Modify: `synapse-engagement-svc/build.gradle.kts`

- [ ] **Step 1: dependencies 블록에 추가**
```kotlin
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    testImplementation("org.springframework.security:spring-security-test")
```

- [ ] **Step 2: 의존성 해석 확인**

Run: `cd synapse-engagement-svc; ./gradlew dependencies --configuration runtimeClasspath -q | Select-String "oauth2-resource-server"`
Expected: oauth2-resource-server 라인 출력.

### Task 3.2: 검증자 SecurityConfig 구현 (빈 스텁 교체)

**Files:**
- Modify(전체 교체): `src/main/java/com/synapse/engagement/global/config/SecurityConfig.java`
- Delete: `src/main/java/com/synapse/engagement/global/security/JwtTokenProvider.java` (빈 스텁, 검증자 패턴에선 불필요)
- Delete: `src/main/java/com/synapse/engagement/global/security/JwtAuthFilter.java` (빈 스텁)

- [ ] **Step 1: 빈 스텁 2개 삭제**
```powershell
git -C synapse-engagement-svc rm src/main/java/com/synapse/engagement/global/security/JwtTokenProvider.java src/main/java/com/synapse/engagement/global/security/JwtAuthFilter.java
```

- [ ] **Step 2: SecurityConfig 전체 교체** (R7 정본 + engagement permit-list)
```java
package com.synapse.engagement.global.config;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/community/share/*", "/api/v1/community/search").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
            .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${synapse.jwt.public-key:}") String publicKey) {
        RSAPublicKey key = StringUtils.hasText(publicKey) ? parse(publicKey) : ephemeral();
        return NimbusJwtDecoder.withPublicKey(key).build();
    }

    private RSAPublicKey parse(String pem) {
        try {
            String n = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                          .replace("-----END PUBLIC KEY-----", "")
                          .replaceAll("\\s+", "");
            byte[] d = Base64.getDecoder().decode(n);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(d));
        } catch (Exception ex) {
            throw new IllegalStateException("synapse.jwt.public-key 파싱 실패", ex);
        }
    }

    private RSAPublicKey ephemeral() {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048);
            KeyPair kp = g.generateKeyPair();
            return (RSAPublicKey) kp.getPublic();
        } catch (Exception ex) {
            throw new IllegalStateException("임시 공개키 생성 실패", ex);
        }
    }
}
```

### Task 3.3: base/dev/prod/test yml 표준화 (staging 제거, test 신설)

**Files:**
- Modify: `src/main/resources/application.yml`
- Delete: `src/main/resources/application-local.yml`, `src/main/resources/application-staging.yml`
- Modify(전체 교체): `src/main/resources/application-dev.yml`, `src/main/resources/application-prod.yml`
- Create: `src/test/resources/application-test.yml`

- [ ] **Step 1: local·staging 삭제**
```powershell
git -C synapse-engagement-svc rm src/main/resources/application-local.yml src/main/resources/application-staging.yml
```

- [ ] **Step 2: base application.yml 갱신**

기존 base(`name: engagement-svc`, `active: ${SPRING_PROFILES_ACTIVE:local}`, flyway, `server.port: 8080`, management)에서:
- `spring.profiles.active`: `${SPRING_PROFILES_ACTIVE:local}` → `${SPRING_PROFILES_ACTIVE:dev}`
- `server.port: 8080` → `8083`
- 파일 끝에 추가:
```yaml
synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"
```
(flyway.locations / management 블록 유지.)

- [ ] **Step 3: application-dev.yml 전체 교체** (구 dev는 env-only였음 → 로컬 기본값 주입)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/synapse}
    username: ${DB_USERNAME:synapse}
    password: ${DB_PASSWORD:synapse_local_pw}
    driver-class-name: org.postgresql.Driver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: validate

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth

logging:
  level:
    com.synapse.engagement: DEBUG
```

- [ ] **Step 4: application-prod.yml 전체 교체**
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  level:
    root: INFO
    com.synapse.engagement: WARN
```

- [ ] **Step 5: src/test/resources/application-test.yml 신설** (H2)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:engagement;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH
    username: sa
    password:
    driver-class-name: org.h2.Driver
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth
```

### Task 3.4: 보안 동작 테스트 (신규, TDD) + 기존 테스트 복구

**Files:**
- Create: `src/test/java/com/synapse/engagement/global/config/SecurityFilterChainTest.java`

- [ ] **Step 1: 실패 테스트 작성 — 보호 엔드포인트는 토큰 없으면 401, health는 200**
```java
package com.synapse.engagement.global.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityFilterChainTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void health_isPublic() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void protectedEndpoint_withoutToken_is401() throws Exception {
        mockMvc.perform(get("/api/v1/gamification/profile").header("X-User-Id", "1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withJwt_isNot401() throws Exception {
        mockMvc.perform(get("/api/v1/gamification/profile")
                .with(jwt())
                .header("X-User-Id", "1"))
            .andExpect(status().is(org.hamcrest.Matchers.not(401)));
    }
}
```

- [ ] **Step 2: 테스트 실행 → 통과 확인**

Run: `cd synapse-engagement-svc; ./gradlew test --tests "*SecurityFilterChainTest"`
Expected: 3개 통과. (SecurityConfig가 정상 적용됨을 검증.)

- [ ] **Step 3: 전체 테스트 실행 → 기존 컨트롤러 테스트의 401 회귀 파악**

Run: `./gradlew test`
Expected 초기: 인증 보호 엔드포인트를 토큰 없이 호출하던 기존 컨트롤러 테스트가 401로 실패할 수 있음. 실패 목록을 기록.

- [ ] **Step 4: 실패한 컨트롤러 테스트에 jwt() 주입**

실패한 각 테스트의 MockMvc 요청에 다음을 추가 (import + `.with(jwt())`):
```java
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
// ...
mockMvc.perform(get("/api/v1/...")
        .with(jwt())          // ← 추가
        .header("X-User-Id", "1")
        ...)
```
공개 엔드포인트(`/api/v1/community/share/*`, `/search`, actuator) 테스트에는 추가하지 않는다.
- 슬라이스 테스트(`@WebMvcTest`)인 경우 SecurityConfig가 로드되도록 `@Import(com.synapse.engagement.global.config.SecurityConfig.class)`를 추가하고, 그래도 안 되면 `@WebMvcTest`를 유지한 채 `spring-security-test`의 `jwt()`로 인증을 모킹.

- [ ] **Step 5: 전체 테스트 재실행 → 그린**

Run: `./gradlew test`
Expected: `BUILD SUCCESSFUL`.

### Task 3.5: 검증 & 커밋

- [ ] **Step 1: (가능 시) dev 기동 스모크**

Run: `./gradlew bootRun --args='--spring.profiles.active=dev'`
Expected: 8083 기동, `/actuator/health` 200, 보호 엔드포인트 토큰 없이 401. 확인 후 종료.

- [ ] **Step 2: 커밋**
```powershell
git -C synapse-engagement-svc add -A
git -C synapse-engagement-svc commit -m "chore: standardize application.yml + add JWT resource-server security (profiles dev/prod/test, port 8083)"
```

---

## Phase 4: learning-svc (properties→yml 전환 + 보안 신설)

- [ ] **Step: 브랜치 생성**
```powershell
git -C synapse-learning-svc checkout -b chore/standardize-application-yml
```

### Task 4.1: 보안 의존성 추가

**Files:**
- Modify: `synapse-learning-svc/learning-card/build.gradle.kts`

- [ ] **Step 1: dependencies 블록에 추가**
```kotlin
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    testImplementation("org.springframework.security:spring-security-test")
```

### Task 4.2: application.properties → application.yml (base) 전환

**Files:**
- Delete: `learning-card/src/main/resources/application.properties`
- Create: `learning-card/src/main/resources/application.yml`

- [ ] **Step 1: 기존 properties 삭제**
```powershell
git -C synapse-learning-svc rm learning-card/src/main/resources/application.properties
```

- [ ] **Step 2: base application.yml 생성** (프로파일 무관 공통 — 하드코딩 비번 제거, app name=learning-svc)
```yaml
spring:
  application:
    name: learning-svc
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  jpa:
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  kafka:
    bootstrap-servers: ${SPRING_KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
      acks: all
      retries: 3
      properties:
        schema.registry.url: ${SPRING_KAFKA_SCHEMA_REGISTRY_URL:http://localhost:8081}
        retry.backoff.ms: 1000

server:
  port: 8084

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true

springdoc:
  swagger-ui:
    path: /swagger-ui.html

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%thread] %logger{36} - %msg%n"
  level:
    org.flywaydb: INFO
```
> `KafkaConfig.java`가 `@Value`로 읽는 키(`spring.kafka.bootstrap-servers`, `...schema.registry.url`, `acks`, `retries`, `retry.backoff.ms`)는 위 yml 경로와 동일하게 유지됨 — 코드 변경 불필요.

### Task 4.3: dev/prod/test yml 생성

**Files:**
- Create: `learning-card/src/main/resources/application-dev.yml`
- Create: `learning-card/src/main/resources/application-prod.yml`
- Create: `learning-card/src/test/resources/application-test.yml`

- [ ] **Step 1: application-dev.yml** (localhost PostgreSQL, 하드코딩 비번 제거)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/synapse_learning}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: none

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth

logging:
  level:
    com.synapse.learning: DEBUG
```
> 기존 `application.properties`의 로컬 비번은 `1234`였으나 평문 하드코딩 제거. dev 기본값은 docker-compose(`postgres/postgres`) 기준. 실제 비번은 `DB_PASSWORD`로 주입.

- [ ] **Step 2: application-prod.yml**
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: none
  kafka:
    bootstrap-servers: ${SPRING_KAFKA_BOOTSTRAP_SERVERS}
    producer:
      properties:
        schema.registry.url: ${SPRING_KAFKA_SCHEMA_REGISTRY_URL}

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY}
    issuer: ${JWT_ISSUER:synapse-auth}

logging:
  level:
    root: INFO
```

- [ ] **Step 3: src/test/resources/application-test.yml 신설** (H2 + flyway off + kafka 비활성)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:learning;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
    username: sa
    password:
    driver-class-name: org.h2.Driver
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
  kafka:
    bootstrap-servers: ${SPRING_EMBEDDED_KAFKA_BROKERS:localhost:9092}

synapse:
  jwt:
    public-key: ${JWT_PUBLIC_KEY:<R6 PUBLIC_KEY 값 그대로 붙여넣기>}
    issuer: synapse-auth
```
> 기존 테스트는 `src/test/resources`가 없었음. Kafka Avro 직렬화가 schema-registry를 요구하므로, 이벤트 발행 통합테스트는 `@EmbeddedKafka` 또는 기존 모킹 방식을 따른다(기존 `CardReviewedEventPublisherTest`/`...IntegrationTest` 패턴 유지). 본 yml은 schema-registry URL을 강제하지 않도록 producer schema.registry.url을 base에서만 정의.

### Task 4.4: 검증자 SecurityConfig 신설

**Files:**
- Create: `learning-card/src/main/java/com/synapse/learning/config/SecurityConfig.java`

- [ ] **Step 1: SecurityConfig 생성** (R7 정본 + learning permit-list; 기존 config 패키지 `com.synapse.learning.config`)
```java
package com.synapse.learning.config;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
            .build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${synapse.jwt.public-key:}") String publicKey) {
        RSAPublicKey key = StringUtils.hasText(publicKey) ? parse(publicKey) : ephemeral();
        return NimbusJwtDecoder.withPublicKey(key).build();
    }

    private RSAPublicKey parse(String pem) {
        try {
            String n = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                          .replace("-----END PUBLIC KEY-----", "")
                          .replaceAll("\\s+", "");
            byte[] d = Base64.getDecoder().decode(n);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(d));
        } catch (Exception ex) {
            throw new IllegalStateException("synapse.jwt.public-key 파싱 실패", ex);
        }
    }

    private RSAPublicKey ephemeral() {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048);
            KeyPair kp = g.generateKeyPair();
            return (RSAPublicKey) kp.getPublic();
        } catch (Exception ex) {
            throw new IllegalStateException("임시 공개키 생성 실패", ex);
        }
    }
}
```

### Task 4.5: 보안 동작 테스트 + 기존 테스트 복구

**Files:**
- Create: `learning-card/src/test/java/com/synapse/learning/config/SecurityFilterChainTest.java`

- [ ] **Step 1: 실패 테스트 작성**
```java
package com.synapse.learning.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityFilterChainTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void health_isPublic() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void protectedEndpoint_withoutToken_is401() throws Exception {
        mockMvc.perform(get("/decks").header("X-User-Id", "1").header("X-Tenant-Id", "1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withJwt_isNot401() throws Exception {
        mockMvc.perform(get("/decks")
                .with(jwt())
                .header("X-User-Id", "1").header("X-Tenant-Id", "1"))
            .andExpect(status().is(org.hamcrest.Matchers.not(401)));
    }
}
```

- [ ] **Step 2: 신규 보안 테스트 실행 → 통과**

Run: `cd synapse-learning-svc; ./gradlew :learning-card:test --tests "*SecurityFilterChainTest"`
Expected: 3개 통과.

- [ ] **Step 3: 전체 테스트 → 회귀 파악**

Run: `./gradlew :learning-card:test`
Expected 초기: 기존 컨트롤러 테스트(CardControllerTest/DeckControllerTest/ReviewSessionControllerTest/ReviewStatsControllerTest)가 보안 적용으로 401 실패 가능. 목록 기록.

- [ ] **Step 4: 실패 컨트롤러 테스트에 jwt() 주입**

각 실패 테스트의 MockMvc 요청에 import와 `.with(jwt())`를 추가 (Phase 3 Task 3.4 Step 4와 동일 패턴):
```java
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
// ...
mockMvc.perform(post("/decks").with(jwt())
        .header("X-User-Id", "...").header("X-Tenant-Id", "...")
        ...)
```
- `@WebMvcTest` 슬라이스면 `@Import(com.synapse.learning.config.SecurityConfig.class)` 추가.

- [ ] **Step 5: 전체 테스트 재실행 → 그린**

Run: `./gradlew :learning-card:test`
Expected: `BUILD SUCCESSFUL`.

### Task 4.6: 검증 & 커밋

- [ ] **Step 1: 컴파일**

Run: `cd synapse-learning-svc; ./gradlew :learning-card:compileJava`
Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 2: 평문 비밀번호 잔재 점검**

Run (PowerShell): `Select-String -Path synapse-learning-svc/learning-card/src -Recurse -Pattern "password.*1234","password=1234"`
Expected: 매칭 없음.

- [ ] **Step 3: (가능 시) dev 기동 스모크**

Run: `./gradlew :learning-card:bootRun --args='--spring.profiles.active=dev'`
Expected: 8084 기동, `/actuator/health` 200. (PostgreSQL/Kafka 미기동 시 시작 실패할 수 있으므로 docker-compose 인프라 전제. 인프라 없으면 이 단계 생략.)

- [ ] **Step 4: 커밋**
```powershell
git -C synapse-learning-svc add -A
git -C synapse-learning-svc commit -m "chore: migrate properties to yml + standardize profiles + add JWT resource-server security (learning-svc, port 8084)"
```

---

## Final Verification

- [ ] **Step 1: 4개 레포 커밋 확인 (push는 하지 않음)**
```powershell
"synapse-platform-svc","synapse-knowledge-svc","synapse-engagement-svc","synapse-learning-svc" | % {
  "$_ => $(git -C $_ log --oneline -1) | unpushed=$(git -C $_ log --oneline @{u}.. 2>$null | Measure-Object -Line | % Lines)"
}
```
Expected: 각 레포 최신 커밋이 표준화 커밋, 브랜치 `chore/standardize-application-yml`. (원격 미설정/미푸시 정상.)

- [ ] **Step 2: 표준 일관성 스폿체크**

Run (PowerShell):
```powershell
Select-String -Path */src/main/resources/application.yml -Pattern "active: \$\{SPRING_PROFILES_ACTIVE:dev\}"
Select-String -Path */src/main/resources/application*.yml -Pattern "^\s*synapse:|public-key|private-key"
```
Expected: 4개 base 모두 `active: ${SPRING_PROFILES_ACTIVE:dev}`; JWT는 전부 `synapse.jwt.*`(구 `jwt.`/`security.jwt.` 없음).

- [ ] **Step 3: 사용자에게 push 여부 확인**

각 레포 브랜치/커밋 요약을 보고하고 push 진행 여부를 사용자에게 묻는다. (push는 명시 지시 전까지 금지.)

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** 4-파일 구조(전 Phase), active=dev(R1·각 base Task), 포트맵(R2·각 base), DB 프로파일별(각 dev/prod/test), Redis=platform만(Phase1 Task1.4/1.5), JWT RSA `synapse.jwt.*`(R5·R7·Phase1~4), Logging 패턴/레벨(R3·각 Task), app-name 통일(각 base), learning properties→yml(Phase4), 비밀 외부화(Phase4 비번 제거), git 브랜치/커밋/푸시대기(각 Phase + Final) — 모두 대응 Task 존재.
- **Placeholder scan:** `<R6 ... 값 그대로 붙여넣기>`와 `<domain>`/`<root>`는 의도된 치환 지시이며 실제 값(R6/R2)이 문서 내 명시됨. "PERMIT_LIST 교체" 주석은 R7 템플릿용이며 각 서비스 Task에 구체 permit-list가 완전히 기재됨. TODO/TBD 없음.
- **Type consistency:** `synapse.jwt.public-key`(검증자) / `synapse.jwt.private-key|public-key|kid|issuer`(발급자) 네이밍, `JwtDecoder jwtDecoder(...)` 시그니처, SecurityConfig 패키지 경로가 각 서비스 루트 패키지와 일치(engagement=`com.synapse.engagement.global.config`, learning=`com.synapse.learning.config`).
- 미확정 위험: 컨트롤러 테스트의 슬라이스(@WebMvcTest) 여부는 실행 시 분기 처리(각 보안 Task의 `@Import` 안내)로 흡수.
