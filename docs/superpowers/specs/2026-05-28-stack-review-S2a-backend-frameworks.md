# 18 기술 스택 정의서 검증 — S2a 백엔드 프레임워크

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S1 후 v2.3-S1 상태)
> 위키 패치 커밋: documents.wiki@493a7ba830b49a2876fb0c7d58cea9c89101f277

## 0. 요약 (Summary)

- 검증 기술 수: 12 (Spring 7 + Python 4 + Gateway 1)
- **E1: 8 · E2: 8 · D: 5 · R: 6 · OK: 10** (총 37 findings)
- **P0: 5 · P1: 6 · P2: 16**
- Deep Dive 보강 3건 (Spring Boot 4 Virtual Threads & Actuator 보안 / Modulith Event Publication Registry vs Outbox / Spring Cloud Gateway 5 라우팅 재구성)
- Cross-section finding 1건 (PY-F08 → §1.4 표 LangChain 행 정정)

**S1 위임 처리 완료**:
- ✅ §4.1.2 Spring Boot 4의 "Virtual Threads 자동 지원" 오기 (S1-F03과 동일 패턴) → S2a-F01·F02 정정

**가장 영향 큰 발견 (P0)**:
- **S2a-F11**: `synapse-engagement-svc/build.gradle.kts:40-41`의 Testcontainers 의존성 좌표(`testcontainers-junit-jupiter:2.0.5`, `testcontainers-postgresql:2.0.5`)는 Maven Central에 존재하지 않는 artifact → 빌드 실패 위험. 위키에 트러블슈팅 추가 + 코드 수정은 별도 PR로 분리 권고
- **S2a-F21**: §4.2.4 LangChain 절 전체가 false claim (실 코드 LangChain 임포트 0건) → **재작성** 결정 — "AI Service 통합 패턴 (Direct SDK)"로 전면 교체 (memory python-ai-stack-direct-sdk 근거)
- **S2a-F28**: §1.4 표 LangChain 행이 위 재작성과 모순 → "OpenAI/Anthropic Python SDK | 1.50/0.40 | LLM 직접 호출" 행으로 교체
- **S2a-F32**: §3.1 Spring Cloud Gateway 5 "프로젝트 내 사용 위치" `api-gateway/` → `synapse-gateway/` (S1-F05와 동일 패턴 다른 절에 잔존)
- **S2a-F33**: §3.1 라우팅 구성 전면 재작성 — 위키 예시 (YAML routes + lb:// + 3개 서비스 auth/note/ai)는 실 코드 (Java DSL RouteLocatorBuilder + 직접 호스트 + 4개 서비스 platform/engagement/knowledge/learning)와 전면 불일치

## 1. 카테고리 인벤토리 (Step 1)

| 절 | 기술 | 라인 범위 | 그룹 |
|----|------|----------|------|
| §3.1 | Spring Cloud Gateway 5 | L1199-L1343 (145줄) | Gateway |
| §4.1.2 | Spring Boot 4 | L1736-L1851 (116줄) | Spring |
| §4.1.3 | Spring Security 7 | L1852-L1957 (106줄) | Spring |
| §4.1.4 | Spring Data JPA + Hibernate 7 | L1958-L2078 (121줄) | Spring |
| §4.1.5 | Flyway 10.x | L2079-L2170 (92줄) | Spring |
| §4.1.6 | Spring WebFlux | L2171-L2258 (88줄) | Spring |
| §4.1.7 | Testcontainers | L2259-L2365 (107줄) | Spring |
| §4.1.8 | Spring Modulith 2.0.x | L2366-L2463 (98줄) | Spring |
| §4.2.2 | FastAPI | L2564-L2680 (117줄) | Python |
| §4.2.3 | uvicorn | L2681-L2755 (75줄) | Python |
| §4.2.4 | LangChain | L2756-L2878 (123줄) | Python |
| §4.2.5 | httpx | L2879-L2948 (70줄) | Python |

## 2. skill-recommender 결과 (Step 2)

- 카탈로그: `C:\workspace\dsd\skill-catalog\catalog.json`
- 키워드: `spring boot,spring security,jpa hibernate,flyway,webflux,testcontainers,modulith,spring cloud gateway,fastapi,uvicorn,langchain,httpx` (12개)
- 매칭: 139건, 상위 30건 반환
- 상위 5건 (점수순): "LangChain Agent MCP Server" (35.0), "io.github.baixianger/langchain-mcp" (25.0), "FastAPI SSE MCP Server" (25.0), "LangChain Anthropic MCP Server" (25.0), "FastAPI MCP Server" (25.0)
- **마켓플레이스/MCP-official-registry/verified=true 항목**: 0건

**채택 결과**: 0건. (LangChain MCP는 본 프로젝트가 LangChain 미사용이라 채택 무의미. FastAPI MCP들도 verified가 아니므로 신뢰도 낮음.) 본 세션 1차 검증 도구는 **context7 MCP** + WebFetch fallback.

## 3. 공식 문서 검증 결과 (Step 3)

### 3.1 Spring 스택 (7개)

- **출처**: context7 `/spring-projects/spring-boot`, `/spring-projects/spring-security`, `/spring-projects/spring-data-jpa`, `/hibernate/hibernate-orm`, `/flyway/flyway-db`, `/testcontainers/testcontainers-java`, `/spring-projects/spring-modulith` + WebFetch (docs.spring.io · documentation.red-gate.com · java.testcontainers.org)
- **핵심 인용**:
  - Boot 4 Virtual Threads: "When virtual threads are enabled (using Java 21+ and `spring.threads.virtual.enabled` set to `true`) this will be a `SimpleAsyncTaskExecutor` that uses virtual threads." → opt-in 확정 (S2a-F01)
  - Modulith 2.0: BOM 2.0.5 + spring-modulith-starter-jpa 기반 Event Publication Registry (S2a-F14)
  - Testcontainers: GA는 1.21.x (2.x는 milestone). 올바른 artifact ID는 `org.testcontainers:junit-jupiter`/`postgresql`/`testcontainers` (S2a-F11)
  - Flyway: Boot 4 BOM이 Flyway 11.x를 관리 (10.x → 11.x 상승, S2a-F08)
  - Hibernate 7 `@TenantId`: 어노테이션 값을 SDK가 자동 채움 (`insertable=true` 기본 필요, S2a-F05)

### 3.2 Python 스택 (4개)

- **출처**: context7 `/fastapi/fastapi`, `/kludex/uvicorn`, `/encode/httpx` + WebFetch (fastapi.tiangolo.com, www.uvicorn.org, www.python-httpx.org)
- **LangChain**: 본 세션 핵심 — context7 검증보다 실 코드 검증 우선 (LangChain 임포트 0건이 결정적)
- **핵심 인용**:
  - FastAPI lifespan: `@asynccontextmanager` 패턴 (S2a-F29 OK)
  - uvicorn 멀티프로세스: gunicorn + UvicornWorker 또는 K8s 수평 확장 — 실 코드는 후자 (S2a-F25)
  - httpx Timeout: `httpx.Timeout(30.0, connect=5.0)` 패턴 (S2a-F31 OK, 실 코드에서 정확히 사용 중)

### 3.3 Gateway (1개)

- **출처**: context7 `/spring-cloud/spring-cloud-gateway/v5.0.0` + WebFetch (docs.spring.io/spring-cloud-gateway/reference/)
- **핵심 인용**:
  - SCG 5: "There are two distinct flavors of Spring Cloud Gateway: Server and Proxy Exchange. Each flavor offers WebFlux and Web MVC compatibility." (S2a-F35)
  - Fluent Java API: RouteLocatorBuilder 기반 .routes().route(...) 패턴 — 실 코드와 정확히 일치 (S2a-F33)
  - CircuitBreaker: `spring-cloud-starter-circuitbreaker-reactor-resilience4j` 의존성 필요 (현재 synapse-gateway에 없음, S2a-F33)

## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성·버전 비교

| 항목 | 18 문서 명시 | synapse-* 실측 | 출처 | 진실 | 클래스 |
|------|-------------|---------------|------|------|-------|
| Spring Boot 4 | "4.x" | platform/engagement/knowledge/learning-card `4.0.0`, gateway `4.0.6` | build.gradle.kts × 6 | 코드 (정합화 권고) | D (S2a-F03) |
| Spring Cloud (Oakwood) | "2025.1.x" | gateway `springCloudVersion = "2025.1.1"` | synapse-gateway/build.gradle.kts:20 | 일치 | OK (S2a-F16) |
| Spring Modulith | "2.0.x" | platform/knowledge `2.0.6`, engagement `2.0.5`, **learning-card `1.3.0`** | build.gradle.kts × 6 | 코드 (learning-card 표류) | D/P1 (S2a-F13) |
| Spring Security 7 | "7.x" | starter 통해 BOM 위임 | build.gradle.kts | 일치 | OK (S2a-F15) |
| Spring Data JPA + Hibernate 7 | "Hibernate 7" | starter 통해 BOM 위임 | build.gradle.kts | 일치 | OK (S2a-F17) |
| Flyway | "10.x" | `flyway-core` 버전 명시 없이 BOM 위임 → **Boot 4 BOM = Flyway 11.x** | spike 문서 주석에 11.14.1 확인 | 코드 (10.x → 11.x 상승) | E1/P1 (S2a-F08) |
| Spring WebFlux | "WebFlux" | gateway가 `gateway-server-webflux` 사용 | synapse-gateway/build.gradle.kts:29 | 일치 | OK (S2a-F16) |
| Testcontainers | "2.x" | platform `1.21.4`, knowledge `1.20.6`, **engagement `2.0.5` (깨진 좌표)** | build.gradle.kts × 3+ | 코드 (1.21.x GA — 마스터 스펙·위키 모두 2.x → 1.21.x 정정 필요) | E2/P0 (S2a-F11) |
| Spring Cloud Gateway 5 | "5.x" | `gateway-server-webflux` (버전 BOM 위임) | synapse-gateway/build.gradle.kts:29 | 일치 | OK (S2a-F37) |
| FastAPI | "^0.130.0" (S1에서 정정) | `>=0.115.0` (S1 정정 완료) | learning-ai/pyproject.toml | 코드 | (S1에서 처리됨, 본 세션 OK) |
| uvicorn | "^0.46.0" (S1에서 정정) | `>=0.30.0` | learning-ai/pyproject.toml | 코드 | (S1에서 처리됨) |
| LangChain | "1.x" (§1.4 표·§4.2.4) | **0건 (미사용)** | Grep `from langchain` learning-ai → 0건 | 코드 (미채택) | **E1/P0 (S2a-F21/F28)** |
| httpx | "^0.28.0" → "^0.27.0" (S1) | `>=0.27.0` | learning-ai/pyproject.toml | 코드 | (S1에서 처리됨) |

### 4.2 사용 위치 경로 실재 확인

| 18 문서 명시 경로 | 실재 여부 | 진단 |
|----------------|----------|------|
| `api-gateway/` (§3.1) | 미존재 | E1 — `synapse-gateway/`로 정정 (S2a-F32) |
| `api-gateway/src/main/java/filters/` (§3.1) | 미존재 | E1 — 디렉토리 자체 없음, JWT 필터 미구현 (S2a-F32·F34) |
| `synapse-learning-svc/learning-ai/app/services/` (§4.2.4) | 존재하나 LangChain 사용 없음 | E1 — "LangChain 통합" 표현 제거 (S2a-F21·F22) |
| `synapse-learning-svc/learning-ai/app/routers/` (§4.2.2) | 미존재 (실은 `app/api/`) | E2 — 경로 정정 (S2a-F23) |
| `synapse-learning-svc/learning-ai/tests/` (§4.2.5) | 존재 | OK + httpx 사용 위치 보강 (S2a-F27) |
| `synapse-*/src/main/resources/application.yml` | 모두 존재 | OK |

### 4.3 메모리 표준 정합성

- `data-sync-outbox-cqrs`: ✅ §4.1.8 Modulith 2.0.x 표준 일치 (learning-card 1.3.0 표류는 별도 코드 PR 필요 — S2a-F13). Modulith Event Publication Registry와 Outbox 패턴의 분리 운영을 §4.1.8 Deep Dive로 보강 (S2a-F14).
- `python-ai-stack-direct-sdk` (신규 메모리, S1 종료 시 생성): ✅ §4.2.4 LangChain 절 전체를 "AI Service 통합 패턴 (Direct SDK)"로 재작성 (S2a-F21). §1.4 표·§4.2.2 사용 위치 정정 (S2a-F28·F22).
- `deploy-mirror-standardization`: synapse-gateway가 ECR 차단 선행 조건과 연계 — 본 세션 직접 영향 없으나 §3.1 JWT 미구현·CircuitBreaker 미설정은 운영 보안 모델 갭으로 S5 운영 세션·별도 보안 PR로 위임 (S2a-F34·F33).
- `git-pr-workflow`: ✅ 본 세션도 별도 브랜치 → PR → 머지 대기 워크플로 준수.

## 5. 발견사항 (Findings)

### Spring 스택 (S2a-F01 ~ S2a-F20)

### S2a-F01 · Virtual Threads '자동 지원' 문구는 사실 오류 — opt-in 필요 · E1 / P1

- **section**: §4.1.2 Spring Boot 4
- **evidence_official**:
  ```
  docs.spring.io/spring-boot/4.0-SNAPSHOT/reference/features/spring-application.html
  docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html
  "Virtual threads require Java 21 or later... To enable them, set the
   `spring.threads.virtual.enabled` property to `true`."
  ```
- **evidence_repo**:
  ```
  Grep `spring.threads.virtual` in synapse-* application*.yml → 0건
  → 모든 서비스 가상 스레드 미설정
  ```
- **current_text**: (L1745) "Spring Boot 4는 Spring Framework 7 기반으로 Java 21 Virtual Threads 자동 지원, GraalVM Native Image 지원, AOT 처리 개선이 포함된다."
- **proposed_text**: Spring Boot 4는 Spring Framework 7 기반으로 Java 21 Virtual Threads **opt-in 지원**(`spring.threads.virtual.enabled=true`), GraalVM Native Image 지원, AOT 처리 개선이 포함된다. Virtual Threads는 기본 비활성이며, 명시적 설정 시 내장 웹서버·`@Async`·`@Scheduled`·`SimpleAsyncTaskExecutor`가 가상 스레드로 동작한다.
- **patch_target**: L1745
- **deep_dive**: false

### S2a-F02 · 기술적 이점 'Virtual Thread 자동 지원' 문구 정합화 · D / P2

- **section**: §4.1.2 Spring Boot 4
- **evidence_official**: 동 S2a-F01
- **current_text**: (L1760) "- **Virtual Thread 자동 지원**: `spring.threads.virtual.enabled=true` 한 줄로 적용"
- **proposed_text**: "- **Virtual Thread 1줄 활성**: `spring.threads.virtual.enabled=true` (opt-in). 활성 시 Tomcat/Jetty 요청 처리, `@Async` 기본 Executor, `@Scheduled` 기본 Scheduler가 가상 스레드로 전환됨"
- **patch_target**: L1760
- **deep_dive**: false

### S2a-F03 · API Gateway·서비스 런타임 표현 모호 · D / P2

- **section**: §4.1.2 Spring Boot 4
- **evidence_repo**:
  ```
  synapse-gateway/build.gradle.kts:3 → Boot 4.0.6
  synapse-platform-svc/build.gradle.kts:5 → 4.0.0
  synapse-engagement-svc/build.gradle.kts:3 → 4.0.0
  synapse-knowledge-svc/build.gradle.kts:3 → 4.0.0
  synapse-learning-svc/learning-card/build.gradle.kts:3 → 4.0.0
  → Gateway만 4.0.6, 나머지 4.0.0 (마이너 표류)
  ```
- **current_text**: (L1742) "Synapse의 API Gateway와 4개 굵은 서비스 중 Java 런타임을 Spring Boot 4로 구현한다."
- **proposed_text**: "Synapse의 API Gateway와 4개 굵은 서비스(synapse-platform-svc / engagement-svc / knowledge-svc / learning-svc) 중 Java 런타임을 Spring Boot 4로 구현한다. 현재 platform/engagement/knowledge/learning-card 4개 서비스는 4.0.0, Gateway는 4.0.6을 사용 중이며, 다음 의존성 정기 점검 시 4.0.x 패치 라인을 일치(예: 4.0.6)시키는 것을 권장한다."
- **patch_target**: L1742
- **deep_dive**: false

### S2a-F04 · actuator 노출 가이드와 실 application.yml 불일치 — Deep Dive 권장 · R / P2

- **section**: §4.1.2 Spring Boot 4
- **evidence_official**: docs.spring.io/spring-boot/reference/actuator/endpoints.html — `management.endpoints.web.exposure.include` 기본 `health`만
- **evidence_repo**: `synapse-platform-svc/src/main/resources/application.yml:50-53` `include: health,info` (위키는 `health,info,metrics,prometheus,circuitbreakers`)
- **proposed_text** (제자리 교체):
  ```yaml
  management:
    endpoints:
      web:
        exposure:
          include: health,info  # 기본 노출(synapse-platform-svc, synapse-knowledge-svc 표준)
    endpoint:
      health:
        probes:
          enabled: true        # K8s liveness/readiness
  # 운영 메트릭 노출이 필요하면(Prometheus 스크래핑) 별도 management 포트로:
  # management:
  #   server:
  #     port: 9091            # 내부 네트워크 전용 포트
  #   endpoints:
  #     web:
  #       exposure:
  #         include: health,info,metrics,prometheus,circuitbreakers
  ```
- **proposed_text** (Deep Dive 서브섹션 추가):
  ```markdown
  #### 더 깊이 / Deep Dive — Spring Boot 4 Virtual Threads & Actuator 보안
  > 출처: https://docs.spring.io/spring-boot/4.0-SNAPSHOT/reference/features/ · 검증 일자: 2026-05-28

  - **opt-in 이유**: Virtual Threads는 ScopedValue/synchronized pinning 이슈로 일부 워크로드에서 처리량 저하 가능 → Boot 4도 자동 활성 안 함. Java 24+ 사용 시 대부분 해소, JFR/jcmd로 pin 추적 후 점진 활성.
  - **Synapse 활성 전 확인**: HikariCP/JDBC, Kafka 클라이언트, Redis(Lettuce) 등 가상 스레드 pinning 검증 후 활성.
  - **운영 함정**: Actuator `/env`, `/heapdump`, `/threaddump`는 환경변수·메모리 노출 → 절대 공개 포트로 노출 금지. `management.server.port` 분리 + NetworkPolicy.
  - **실전 베스트프랙티스**: Prometheus 스크랩은 별도 management 포트(9091) + Ingress 차단. 서비스 메시 사용 시 sidecar 내부 통신만 허용.
  ```
- **patch_target**: L1803-L1811 + 트러블슈팅 후 Deep Dive 삽입
- **deep_dive**: true

### S2a-F05 · Note 엔티티 예제 `@TenantId` `insertable=false` 오류 — NOT NULL 위반 · E2 / P1

- **section**: §4.1.4 Spring Data JPA + Hibernate 7
- **evidence_official**:
  ```
  Hibernate 7 User Guide — Multitenancy:
  "@TenantId 필드는 Hibernate가 CurrentTenantIdentifierResolver 값을 자동 채움"
  → insertable 기본(=true) 필요
  ```
- **current_text**: (L2022-L2024)
  ```java
  @Column(name = "tenant_id", nullable = false,
          updatable = false, insertable = false)
  private UUID tenantId;
  ```
- **proposed_text**:
  ```java
  @TenantId
  @Column(name = "tenant_id", nullable = false, updatable = false)
  private UUID tenantId;  // insertable=true (기본) — Hibernate가 CurrentTenantIdentifierResolver 값을 INSERT 시 자동 주입
  ```
- **patch_target**: L2022-L2024
- **deep_dive**: false

### S2a-F06 · `@TenantId` import 누락 + Resolver Bean 트러블슈팅 보강 · D / P2

- **section**: §4.1.4 Spring Data JPA + Hibernate 7
- **evidence_official**: Hibernate 7 — `org.hibernate.annotations.TenantId` + `CurrentTenantIdentifierResolver<UUID>` Bean 등록 필요
- **proposed_text** (엔티티 예제 상단 import 추가 + 트러블슈팅 표 행 추가):
  ```java
  import org.hibernate.annotations.TenantId;
  ```
  ```
  | `@TenantId` 무시됨(모든 테넌트 데이터 조회됨) | `CurrentTenantIdentifierResolver<UUID>` Bean 미등록 | `TenantContext`를 읽는 Resolver Bean 등록 + `hibernate.tenant_identifier_resolver` 자동 인식 확인 |
  ```
- **patch_target**: §4.1.4 엔티티 예제 + 트러블슈팅 표 (L2062-L2070)
- **deep_dive**: false

### S2a-F07 · open-in-view 비활성화 표준 — 운영 함정 추가 · R / P2

- **section**: §4.1.4 Spring Data JPA + Hibernate 7
- **evidence_repo**: `synapse-platform-svc/src/main/resources/application.yml:13` `open-in-view: false` (이미 표준 적용)
- **proposed_text** (설정 yaml 예시 보강 + 트러블슈팅 행):
  ```yaml
  spring:
    jpa:
      open-in-view: false  # synapse-* 표준 — LazyInitializationException 컨트롤러 경계에서 조기 탐지
      hibernate:
        ddl-auto: validate
  ```
  ```
  | OSIV 활성 + HTTP 응답 직렬화 중 SQL 발생 | `open-in-view=true`(기본) + Lazy 연관 | `open-in-view: false` + DTO 프로젝션 / `@EntityGraph` |
  ```
- **patch_target**: §4.1.4 설정 가이드 + 트러블슈팅
- **deep_dive**: false

### S2a-F08 · 섹션 제목 "Flyway 10.x"가 Boot 4 BOM 실 버전과 불일치 — 11.x로 정정 · E1 / P1

- **section**: §4.1.5 Flyway 10.x
- **evidence_official**: Spring Boot 4.0 managed dependencies — Flyway 11.x 관리. 10.x는 Boot 3.2~3.4 라인
- **evidence_repo**:
  ```
  synapse-platform-svc/build.gradle.kts:43 `implementation("org.flywaydb:flyway-core")` 버전 명시 X → BOM 위임 = Flyway 11.x
  synapse-platform-svc/docs/spike/OAuth/SAMPLING_OAUTH.md:114 주석에 "flyway-core // 11.14.1"
  ```
- **current_text**: (L2079) `### 4.1.5 Flyway 10.x`
- **proposed_text**:
  ```
  ### 4.1.5 Flyway 11.x

  Spring Boot 4 BOM이 관리하는 Flyway 11.x를 사용한다(synapse-* 모든 서비스는 `flyway-core` 버전을 명시하지 않고 BOM 위임). 10.x → 11.x에서 PostgreSQL은 별도 모듈 `org.flywaydb:flyway-database-postgresql`이 필요하다(이미 모든 서비스 build.gradle.kts에 추가됨).
  ```
- **patch_target**: L2079 + 본문 모든 "10.x" 표현
- **deep_dive**: false

### S2a-F09 · 설정 예제 키와 실 application.yml 단순화 차이 · D / P2

- **section**: §4.1.5 Flyway 10.x
- **evidence_repo**: `synapse-platform-svc/application.yml:14-15` `flyway: enabled: true`만, locations·schemas·table 모두 기본값
- **proposed_text** (설정 가이드 보강):
  ```yaml
  spring:
    flyway:
      enabled: true              # synapse-* 표준 (대부분 기본값 사용)
      # 아래는 기본값 — 명시할 필요 없음
      # locations: classpath:db/migration
      # baseline-on-migrate: false
      # validate-on-migrate: true
      # 분산 락 재시도 — K8s 다중 파드 동시 시작 시 필수
      lock-retry-count: 50       # 기본 50 (Flyway 11). 100+ 권장 시 명시
  ```
- **patch_target**: L2116-L2127
- **deep_dive**: false

### S2a-F10 · K8s 분산 락 트러블슈팅 행 — `flyway.lock-retry-count`는 spring 접두사 필요 · R / P2

- **section**: §4.1.5 Flyway 10.x
- **evidence_official**: Boot 4 — `spring.flyway.lock-retry-count`. Flyway 11 raw 키는 `flyway.lockRetryCount`
- **current_text**: (L2161) "여러 파드 동시 시작 | `flyway.lock-retry-count=50` 설정"
- **proposed_text**: `| K8s에서 마이그레이션 중복 실행 | 여러 파드 동시 시작 | `spring.flyway.lock-retry-count: 50` (또는 더 큼) 설정. Flyway 11은 PostgreSQL 세션 advisory lock으로 동시성 차단 |`
- **patch_target**: L2161
- **deep_dive**: false

### S2a-F11 · synapse-engagement-svc Testcontainers 의존성 좌표 오류 — 빌드 실패 · E2 / P0

- **section**: §4.1.7 Testcontainers
- **evidence_official**:
  ```
  Testcontainers Java 공식 좌표(java.testcontainers.org, GA 1.21.x):
  - org.testcontainers:junit-jupiter:1.21.x
  - org.testcontainers:postgresql:1.21.x
  → `testcontainers-junit-jupiter`나 `testcontainers-postgresql` artifact는 존재 없음
  ```
- **evidence_repo**:
  ```
  synapse-engagement-svc/build.gradle.kts:40-41:
    testImplementation("org.testcontainers:testcontainers-junit-jupiter:2.0.5")
    testImplementation("org.testcontainers:testcontainers-postgresql:2.0.5")
  vs 정상:
  synapse-platform-svc/build.gradle.kts:60-61:
    testImplementation("org.testcontainers:junit-jupiter:1.21.4")
    testImplementation("org.testcontainers:testcontainers:1.21.4")
  ```
- **proposed_text**: 위키 §4.1.7 트러블슈팅 표에 행 추가:
  ```
  | `Could not resolve org.testcontainers:testcontainers-junit-jupiter` | 잘못된 artifact 좌표 | 올바른 좌표: `org.testcontainers:junit-jupiter` / `:postgresql` / `:testcontainers`. 현 synapse-engagement-svc/build.gradle.kts:40-41이 깨진 좌표 사용 — 즉시 수정 필요 |
  ```
  + §4.1.7 "프로젝트 내 사용 위치"에 표준 버전 박스 추가:
  ```
  > **표준 버전: 1.21.x** (Testcontainers GA. 2.x는 아직 milestone)
  > - synapse-platform-svc: `junit-jupiter:1.21.4` `testcontainers:1.21.4` ✅
  > - synapse-knowledge-svc: `junit-jupiter:1.20.6` `testcontainers:1.20.6` — 1.21.x 정렬 권장
  > - synapse-engagement-svc: 깨진 좌표 사용 중 — 별도 PR로 수정 필요
  ```
- **patch_target**: §4.1.7 (L2290-L2358)
- **deep_dive**: false

### S2a-F12 · RedisContainer는 core 모듈 아님 — GenericContainer 사용 · D / P2

- **section**: §4.1.7 Testcontainers
- **evidence_official**: java.testcontainers.org/modules/databases/redis/ — GenericContainer 권장
- **current_text**: (L2314-L2315)
  ```java
  static RedisContainer redis =
      new RedisContainer(DockerImageName.parse("redis:7-alpine"));
  ```
- **proposed_text**:
  ```java
  @Container
  @ServiceConnection(name = "redis")
  static GenericContainer<?> redis =
      new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
          .withExposedPorts(6379);
  ```
- **patch_target**: L2312-L2315
- **deep_dive**: false

### S2a-F13 · synapse-learning-svc/learning-card Modulith 1.3.0 — 2.0.x 표준 표류 · D / P1

- **section**: §4.1.8 Spring Modulith 2.0.x
- **evidence_official**: Spring Modulith 2.0.x는 Spring Boot 4 1차 호환. 1.3.x는 Spring Boot 3.3 라인
- **evidence_repo**:
  ```
  synapse-learning-svc/learning-card/build.gradle.kts:81 →
    `mavenBom("org.springframework.modulith:spring-modulith-bom:1.3.0")`
  synapse-platform-svc/build.gradle.kts:26 → 2.0.6 ✅
  synapse-knowledge-svc/build.gradle.kts:61 → 2.0.6 ✅
  synapse-engagement-svc/build.gradle.kts:54 → 2.0.5 ✅
  Memory data-sync-outbox-cqrs.md L15: "Modulith 1.x→2.0.x" 표준화 완료
  ```
- **proposed_text**: §4.1.8 "프로젝트 내 사용 위치"(L2402-L2410)에 표준 버전 박스 추가:
  ```
  > **현재 버전 상태(2026-05-28)**
  > - synapse-platform-svc · synapse-knowledge-svc: `spring-modulith-bom:2.0.6` ✅ 표준
  > - synapse-engagement-svc: `spring-modulith-bom:2.0.5` (2.0.6으로 정렬 권장)
  > - **synapse-learning-svc/learning-card: `spring-modulith-bom:1.3.0` — 즉시 2.0.x로 업그레이드 필요** (Spring Boot 4와 ABI 비호환 가능, ApplicationModuleListener 시그니처 변경)
  >
  > 후속 PR로 모든 서비스 2.0.6 정합 + `spring-modulith-events-jpa` / `events-kafka` 통합 검토.
  ```
- **patch_target**: §4.1.8 L2402-L2410
- **deep_dive**: false

### S2a-F14 · Modulith Event Publication Registry vs Outbox — Deep Dive 보강 · R / P2

- **section**: §4.1.8 Spring Modulith 2.0.x
- **evidence_official**: Spring Modulith 2.0 — `spring-modulith-starter-jpa`가 ApplicationEvent를 JPA Event Publication Registry에 저장 (트랜잭션 Outbox)
- **evidence_repo**: memory `data-sync-outbox-cqrs` 표준 — Kafka는 경계 넘을 때만, 내부는 DB 트랜잭션/Modulith. synapse-platform-svc/build.gradle.kts:41 → `spring-modulith-starter-core`만 (jpa starter 없음)
- **proposed_text** (설정 가이드 의존성 블록 보강):
  ```kotlin
  dependencies {
      implementation("org.springframework.modulith:spring-modulith-starter-core")
      // 모듈 간 이벤트 발행 + Event Publication Registry(트랜잭션 Outbox)
      implementation("org.springframework.modulith:spring-modulith-starter-jpa")
      // 외부 시스템(Kafka) 발행이 필요한 모듈만 추가
      // implementation("org.springframework.modulith:spring-modulith-events-kafka")
      testImplementation("org.springframework.modulith:spring-modulith-starter-test")
  }
  ```
  + Deep Dive 부속 서브섹션:
  ```markdown
  #### 더 깊이 / Deep Dive — Modulith Event Publication Registry vs Outbox
  > 출처: https://docs.spring.io/spring-modulith/reference/events.html · 02_ERD §2.3.A · 03-A §A.10 · 검증 일자: 2026-05-28

  - **이중 채널 패턴**: 트랜잭션 커밋 → `event_publication` 테이블 INSERT(`@TransactionalEventListener`) → 동기 listener 즉시 호출. 비동기/실패 listener는 레지스트리에 남아 재시도. **서비스 내부 한정**.
  - **Outbox와의 분리 기준**: Modulith 레지스트리는 **JVM 프로세스 내** 재시도/감사용. 다른 서비스 발행 이벤트는 별도 `outbox_event` + Polling Relay → Kafka로 보내 토픽 순서·파티션 키(`{tenant_id}:{aggregate_id}`) 보장.
  - **운영 함정**: `spring-modulith-events-kafka`를 켜면 모든 도메인 이벤트가 자동 Kafka 발행되어 Outbox 표준과 충돌. Synapse는 켜지 않고 `@ApplicationModuleListener`만 사용, 외부 발행은 명시적 Outbox INSERT.
  - **실전 베스트프랙티스**: `ApplicationEventPublisher.publishEvent(new XxxCreated(...))` → 같은 트랜잭션에서 (a) 내부 동기 리스너 호출 (b) `event_publication` 영구화 (c) 별도 `outbox_event` INSERT(Avro). 3개가 한 트랜잭션이라 부분 실패 없음.
  ```
- **patch_target**: §4.1.8 L2412-L2421 + Deep Dive 삽입
- **deep_dive**: true

### Python 스택 (S2a-F21 ~ S2a-F31)

### S2a-F21 · §4.2.4 LangChain 절 전체가 false claim — 재작성 결정 · E1 / P0

- **section**: §4.2.4 LangChain
- **evidence_official**: memory `python-ai-stack-direct-sdk` 확정. LangChain 공식 문서는 LangChain 자체 존재는 입증하나 Synapse 채택 여부와 무관
- **evidence_repo**:
  ```
  Grep `from langchain|import langchain` synapse-learning-svc/learning-ai → 0건
  pyproject.toml: openai>=1.50.0, anthropic>=0.40.0 (langchain·langchain-openai 0건)
  openai_service.py:5: from openai import AsyncOpenAI
  anthropic_service.py:3: from anthropic import AsyncAnthropic
  ```
- **재작성 결정 근거** (b 채택):
  1. **정합성**: S1 §4.2.1에서 LangChain 제거됨. §1.4 표(L128)·§4.2.4 동시 정정 필요
  2. **콘텐츠 가치**: "AI Service 통합 패턴 (Direct SDK)" 절은 실 아키텍처(Tenacity·httpx·정규화) 문서화 가치 있음
  3. **저자 의도**: §4.2.1 L2501에 이미 "OpenAI/Anthropic SDK 직접 통합 (LangChain 미사용)" 명시 — §1.4·§4.2.1·§4.2.4·§4.4 4곳 모순. (b)가 최소 정합화
- **proposed_text**: §4.2.4 전체 (L2756-L2878) 교체:
  ```
  ### 4.2.4 AI Service 통합 패턴 (Direct SDK)

  #### 개요
  Synapse AI Service는 LangChain 같은 오케스트레이션 프레임워크 대신 OpenAI Python SDK(`AsyncOpenAI`)와 Anthropic Python SDK(`AsyncAnthropic`)를 직접 호출하는 "Direct SDK" 패턴을 채택했다. Tenacity 기반 재시도, httpx 명시적 타임아웃, 도메인별 Service 클래스로 LLM 호출을 캡슐화한다.

  #### 역할
  Synapse AI Service에서 LLM 호출 계층을 담당한다. (1) 카드 자동 생성 — `card_pipeline_service.py`, (2) 임베딩 생성 — `openai_service.py` (`text-embedding-3-small`, L2 정규화), (3) Claude 텍스트 생성 — `claude_service.py`, (4) RAG 파이프라인 — `rag_service.py` (pgvector 직접 쿼리).

  #### 선택 이유
  - **의존성 최소화**: LangChain의 빠른 breaking change 회피, 의존성 그래프 단순화
  - **명시적 제어**: 재시도·타임아웃·토큰 추적 정책을 코드에서 직접 제어
  - **타입 안정성**: mypy strict 환경에서 SDK 타입 힌트가 가장 정확
  - **공식 SDK 직접 사용**: OpenAI/Anthropic 공식 SDK는 변경이 가장 빠르게 반영

  #### 대안 비교

  | 기술 | 장점 | 단점 | 선택 여부 |
  |------|------|------|-----------|
  | **OpenAI/Anthropic SDK 직접 호출** | 의존성 최소, 명시적 제어, 타입 안정성 | 반복 코드 일부 발생 | ✅ 선택 |
  | LangChain 1.x | 풍부한 추상화, LCEL, 다양한 통합 | 빠른 API 변경, 추상화 오버헤드, mypy strict 호환성 이슈 | ❌ (의존성·breaking change 부담) |
  | LlamaIndex | 문서 인덱싱/RAG 특화 | 범용성 낮음, 추가 의존성 | ❌ |
  | Haystack | 엔터프라이즈 RAG | 작은 커뮤니티 | ❌ |

  #### 기술적 이점
  - **AsyncOpenAI / AsyncAnthropic**: 공식 SDK 비동기 클라이언트 — FastAPI와 자연스럽게 통합
  - **Tenacity 재시도**: `RateLimitError`, `APIConnectionError`에 지수 백오프
  - **httpx Timeout 명시**: `httpx.Timeout(30.0, connect=5.0)`로 hang 방지
  - **L2 정규화**: 임베딩 코사인 유사도 계산 최적화 (`numpy.linalg.norm`)
  - **재시도 X SDK 내부 재시도 분리**: `max_retries=0`으로 Tenacity 단일 진입점 강제

  #### 핵심 클래스
  - `AsyncOpenAI` — OpenAI 공식 SDK 비동기 클라이언트 (`openai>=1.50.0`)
  - `AsyncAnthropic` — Anthropic 공식 SDK 비동기 클라이언트 (`anthropic>=0.40.0`)
  - `tenacity.retry` — 재시도 데코레이터
  - `httpx.Timeout` — OpenAI/Anthropic SDK 내부 httpx 타임아웃 주입

  #### 프로젝트 내 사용 위치
  - `synapse-learning-svc/learning-ai/app/services/openai_service.py` — AsyncOpenAI 임베딩·텍스트 생성
  - `synapse-learning-svc/learning-ai/app/services/anthropic_service.py` — AsyncAnthropic 기본 호출
  - `synapse-learning-svc/learning-ai/app/services/claude_service.py` — Anthropic SDK + 에러 핸들링
  - `synapse-learning-svc/learning-ai/app/services/rag_service.py` — pgvector 직접 쿼리 기반 RAG
  - `synapse-learning-svc/learning-ai/app/services/card_pipeline_service.py` — 카드 생성 파이프라인

  #### 설정 가이드

  ```python
  # app/services/openai_service.py — AsyncOpenAI + Tenacity + httpx Timeout
  import httpx
  from openai import APIConnectionError, AsyncOpenAI, RateLimitError
  from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

  class OpenAIEmbeddingService:
      def __init__(self, api_key: str):
          self.client = AsyncOpenAI(
              api_key=api_key,
              timeout=httpx.Timeout(30.0, connect=5.0),
              max_retries=0,  # Tenacity 단일 진입점
          )

      @retry(
          stop=stop_after_attempt(3),
          wait=wait_exponential(multiplier=1, min=2, max=10),
          retry=retry_if_exception_type((RateLimitError, APIConnectionError)),
      )
      async def get_embeddings(self, texts: list[str]) -> EmbedResponse:
          response = await self.client.embeddings.create(
              input=texts, model="text-embedding-3-small"
          )
          # L2 정규화로 코사인 유사도 == 내적
          normalized = [self._normalize(d.embedding) for d in response.data]
          return EmbedResponse(embeddings=normalized, model=response.model)
  ```

  ```python
  # app/services/anthropic_service.py — AsyncAnthropic 직접 호출
  from anthropic import AsyncAnthropic

  class AnthropicService:
      def __init__(self, api_key: str):
          self.client = AsyncAnthropic(api_key=api_key)

      async def generate_text(self, prompt: str, **kwargs) -> str:
          message = await self.client.messages.create(
              model=kwargs.get("model", "claude-3-5-sonnet-20240620"),
              max_tokens=kwargs.get("max_tokens", 1024),
              messages=[{"role": "user", "content": prompt}],
          )
          return message.content[0].text if message.content else ""
  ```

  #### 트러블슈팅

  | 증상 | 원인 | 해결책 |
  |------|------|--------|
  | 무한 hang | 타임아웃 미설정 | `AsyncOpenAI(timeout=httpx.Timeout(30.0, connect=5.0))` |
  | 재시도가 두 번 실행 | SDK 내부 재시도 + Tenacity 중복 | SDK `max_retries=0` 강제, Tenacity 단일 진입점 |
  | RateLimit 시 즉시 실패 | 재시도 미적용 | `retry_if_exception_type((RateLimitError, APIConnectionError))` |
  | 임베딩 유사도 부정확 | L2 정규화 누락 | `numpy.linalg.norm` 기반 정규화 |
  | mypy strict 오류 | SDK 응답 타입 None 가능 | `usage.prompt_tokens if usage else 0` 방어 |

  #### 참고 자료
  - OpenAI Python SDK: https://github.com/openai/openai-python
  - Anthropic Python SDK: https://github.com/anthropics/anthropic-sdk-python
  - Tenacity: https://tenacity.readthedocs.io/
  - 본 프로젝트 결정 메모: memory `python-ai-stack-direct-sdk`
  ```
- **patch_target**: §4.2.4 전체 L2756-L2878 통째 교체
- **deep_dive**: true (영향 분석 포함)

### S2a-F22 · §4.2.2 FastAPI 사용 위치 "LangChain 통합 서비스" 불일치 · E1 / P1

- **section**: §4.2.2 FastAPI
- **evidence_repo**: Grep `from langchain` learning-ai → 0건
- **current_text**: (L2602) `- synapse-learning-svc/learning-ai/app/services/ — LangChain 통합 서비스`
- **proposed_text**: `- synapse-learning-svc/learning-ai/app/services/ — OpenAI/Anthropic SDK 직접 통합 서비스 (Claude/OpenAI/RAG/CardPipeline). 자세한 패턴은 §4.2.4 참조`
- **patch_target**: L2602
- **deep_dive**: false

### S2a-F23 · FastAPI 라우터 디렉토리 경로 불일치 (`app/routers/` → `app/api/`) · E2 / P2

- **section**: §4.2.2 FastAPI
- **evidence_repo**: `main.py:88-89`: `app.include_router(ai_router, prefix="/ai")` + `app/api/ai.py` 존재 (routers/ 없음)
- **current_text**: `- synapse-learning-svc/learning-ai/app/routers/ — generate, search, summarize 라우터`
- **proposed_text**:
  ```
  - synapse-learning-svc/learning-ai/app/api/ai.py — `/ai` prefix 통합 라우터 (`/cards/generate`, `/generate`, `/embeddings`, `/search/semantic`, `/qa`)
  - synapse-learning-svc/learning-ai/app/api/health.py — `/health`, `/health/ready` 라우터
  ```
- **patch_target**: L2600
- **deep_dive**: false

### S2a-F24 · FastAPI 엔드포인트 경로 불일치 (`/api/generate/cards` → `/ai/cards/generate`) · E2 / P2

- **section**: §4.2.2 FastAPI
- **evidence_repo**: `main.py:89` + `app/api/ai.py:27,52,66,86` → 실제 엔드포인트 `POST /ai/cards/generate`, `/ai/embeddings`, `/ai/search/semantic`, `/ai/qa` (`/api/summarize`는 없음)
- **current_text**: (L2570) "카드 자동 생성(`POST /api/generate/cards`), 시맨틱 검색(`POST /api/search/semantic`), 노트 요약(`POST /api/summarize`), 임베딩 생성(`POST /api/embeddings`) 엔드포인트를 제공한다."
- **proposed_text**: "카드 자동 생성(`POST /ai/cards/generate`), 시맨틱 검색(`POST /ai/search/semantic`), 임베딩 생성(`POST /ai/embeddings`), Q&A(`POST /ai/qa`), 헬스 체크(`GET /health`, `GET /health/ready`) 엔드포인트를 제공한다."
- **patch_target**: L2570
- **deep_dive**: false

### S2a-F25 · uvicorn Dockerfile 예제 'gunicorn + UvicornWorker' vs 실 단일 uvicorn · E2 / P2

- **section**: §4.2.3 uvicorn
- **evidence_official**: 두 방식 모두 공식 권장이나 위키는 실 코드와 다른 방식 제시
- **evidence_repo**: `Dockerfile:27-30` `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]`. pyproject.toml에 gunicorn 의존성 없음
- **current_text**: (L2716-L2730) `CMD ["gunicorn", ...]` 멀티워커 예제
- **proposed_text**:
  ```dockerfile
  # Dockerfile (실 코드) — 멀티 스테이지 빌드 + 단일 uvicorn
  # Stage 1: Build
  FROM python:3.12-slim AS builder
  WORKDIR /app
  COPY pyproject.toml .
  COPY app app
  RUN pip install --no-cache-dir --prefix=/install .

  # Stage 2: Runtime
  FROM python:3.12-slim
  WORKDIR /app
  COPY --from=builder /install /usr/local
  COPY . .
  ENV PYTHONPATH=/app
  ENV PYTHONUNBUFFERED=1
  EXPOSE 8090
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
  ```

  > **참고 (수평 확장 권고)**: 단일 uvicorn 프로세스는 Kubernetes Pod 단위 수평 확장(HPA + replicas)을 전제로 한다. Pod 내 멀티프로세스가 필요하면 공식 권고 `gunicorn -k uvicorn.workers.UvicornWorker --workers N`으로 전환 가능.
- **patch_target**: L2716-L2730
- **deep_dive**: false

### S2a-F26 · Dockerfile poetry 사용 → 실은 pip + setuptools · E2 / P2

- **section**: §4.2.3 uvicorn
- **evidence_repo**: pyproject.toml [tool.setuptools], poetry.lock 없음, Dockerfile `pip install`
- **patch_target**: S2a-F25 패치에 흡수 (Dockerfile 통째 교체로 동시 해결)
- **deep_dive**: false

### S2a-F27 · httpx 사용 위치가 tests/만 명시 → 실은 외부 HTTP 클라이언트로도 사용 · E2 / P2

- **section**: §4.2.5 httpx
- **evidence_repo**:
  ```
  app/clients/card_client.py:3,25 → httpx.AsyncClient(base_url=..., timeout=30.0)
  app/clients/note_client.py:3,13 → httpx.AsyncClient(base_url=..., timeout=10.0)
  app/services/openai_service.py:3,24 → httpx.Timeout(30.0, connect=5.0)
  app/services/claude_service.py:4 → import httpx
  tests/test_health.py:2,13,15 → ASGITransport + AsyncClient
  ```
- **current_text**: `- synapse-learning-svc/learning-ai/tests/ — FastAPI 통합 테스트`
- **proposed_text**:
  ```
  - synapse-learning-svc/learning-ai/app/clients/card_client.py — 카드 서비스 호출 (`httpx.AsyncClient`, timeout=30s)
  - synapse-learning-svc/learning-ai/app/clients/note_client.py — 노트 서비스 호출 (`httpx.AsyncClient`, timeout=10s)
  - synapse-learning-svc/learning-ai/app/services/openai_service.py — OpenAI SDK에 `httpx.Timeout` 주입
  - synapse-learning-svc/learning-ai/app/services/claude_service.py — Anthropic SDK 타임아웃 제어
  - synapse-learning-svc/learning-ai/tests/test_health.py — `ASGITransport`로 앱 직접 테스트
  ```
- **patch_target**: L2910
- **deep_dive**: false

### S2a-F28 · §1.4 표 LangChain 행이 §4.2.4 재작성과 모순 — cross-section · E1 / P0

- **section**: §1.4 기술 스택 전체 목록 표
- **evidence_repo**: 위키 L128 `| Backend | LangChain | 1.x | LLM 오케스트레이션 |` + 실 코드 LangChain 0건
- **current_text**: (L128) `| Backend | LangChain | 1.x | LLM 오케스트레이션 |`
- **proposed_text**: `| Backend | OpenAI/Anthropic Python SDK | 1.50 / 0.40 | LLM 직접 호출 (Direct SDK 패턴, §4.2.4) |`
- **patch_target**: L128
- **deep_dive**: false

### Gateway (S2a-F32 ~ S2a-F37)

### S2a-F32 · 디렉터리 경로 `api-gateway/` 미존재 + JWT 필터 디렉토리 미존재 · E1 / P0

- **section**: §3.1 Spring Cloud Gateway 5
- **evidence_repo**:
  ```
  C:\workspace\team-project-final\synapse-gateway\ (api-gateway/ 아님)
  settings.gradle.kts L1: rootProject.name = "synapse-gateway"
  실재 구조: SynapseGatewayApplication.java + config/{RoutesConfig,RateLimiterConfig,CorsConfig}.java
  filters/ 디렉토리 미존재
  ```
- **current_text**:
  ```
  - api-gateway/ — 게이트웨이 서비스 모듈
  - api-gateway/src/main/resources/application.yml — 라우팅 설정
  - api-gateway/src/main/java/filters/ — 커스텀 필터 구현
  ```
- **proposed_text**:
  ```
  - synapse-gateway/ — 게이트웨이 서비스 모듈 (Spring Boot 4.0.6 + Spring Cloud 2025.1.1)
  - synapse-gateway/src/main/resources/application.yml — 서버 포트/Redis/Actuator 설정
  - synapse-gateway/src/main/java/com/synapse/gateway/config/RoutesConfig.java — RouteLocatorBuilder 기반 Java DSL 라우팅 (4개 백엔드: platform/engagement/knowledge/learning)
  - synapse-gateway/src/main/java/com/synapse/gateway/config/RateLimiterConfig.java — KeyResolver Bean
  - synapse-gateway/src/main/java/com/synapse/gateway/config/CorsConfig.java — CorsWebFilter
  ```
- **patch_target**: L1234-L1238
- **deep_dive**: false

### S2a-F33 · 라우팅 구성 방식·서비스명·필터 구성 전면 불일치 — Deep Dive 권장 · R / P0

- **section**: §3.1 Spring Cloud Gateway 5
- **evidence_official**: context7 SCG v5.0.0 — RouteLocatorBuilder Java DSL 공식 + CircuitBreaker 의존성 필수
- **evidence_repo**:
  ```
  build.gradle.kts: spring-cloud-starter-gateway-server-webflux + spring-boot-starter-data-redis-reactive (resilience4j 없음)
  application.yml: server/redis만 (gateway.routes 블록 없음)
  RoutesConfig.java L25-60: Java DSL 4개 route (platform/engagement/knowledge/learning), http://<svc>:8080 직접 (lb:// 없음)
  ```
- **current_text**: 위키 YAML routes 예제 + lb:// + 3개 서비스 (auth/note/ai)
- **proposed_text**:
  ```
  실 코드는 application.yml의 `spring.cloud.gateway.routes` 블록을 **사용하지 않으며**, `RoutesConfig.java`에서 RouteLocatorBuilder 기반 Java DSL로만 라우트를 정의한다. 서비스 4종은 platform-svc / engagement-svc / knowledge-svc / learning-svc 이며 K8s 서비스 호스트(`http://<svc>:8080`)로 직접 라우팅한다 (lb:// 미사용). CircuitBreaker는 현재 미설정 (resilience4j 의존성 미포함).

  ```java
  // RoutesConfig.java — RouteLocatorBuilder Java DSL (실 코드)
  @Bean
  public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
                                         RedisRateLimiter rateLimiter) {
      return builder.routes()
          .route("platform-svc", r -> r
              .path("/api/platform/**")
              .filters(f -> f
                  .stripPrefix(2)
                  .requestRateLimiter(c -> c.setRateLimiter(rateLimiter)))
              .uri("http://platform-svc:8080"))
          .route("engagement-svc", r -> r
              .path("/api/engagement/**")
              .filters(f -> f.stripPrefix(2)
                  .requestRateLimiter(c -> c.setRateLimiter(rateLimiter)))
              .uri("http://engagement-svc:8080"))
          .route("knowledge-svc", r -> r
              .path("/api/knowledge/**")
              .filters(f -> f.stripPrefix(2)
                  .requestRateLimiter(c -> c.setRateLimiter(rateLimiter)))
              .uri("http://knowledge-svc:8080"))
          .route("learning-svc", r -> r
              .path("/api/learning/**")
              .filters(f -> f.stripPrefix(2)
                  .requestRateLimiter(c -> c.setRateLimiter(rateLimiter)))
              .uri("http://learning-svc:8080"))
          .build();
  }

  @Bean
  public RedisRateLimiter redisRateLimiter() {
      // replenishRate=1/sec, burstCapacity=60
      return new RedisRateLimiter(1, 60, 1);
  }
  ```

  > **Note**: CircuitBreaker/Resilience4j 통합 및 lb:// 기반 ServiceDiscovery 라우팅은 향후 도입 시 `spring-cloud-starter-circuitbreaker-reactor-resilience4j` 의존성 추가가 필요하다 (Spring Cloud Gateway 5 공식: circuitbreaker-filter-factory.adoc).
  ```
- **patch_target**: L1241-L1290
- **deep_dive**: true

### S2a-F34 · JWT GlobalFilter는 실 코드에 미구현 — 위키가 미존재 컴포넌트를 단정 · E1 / P1

- **section**: §3.1 Spring Cloud Gateway 5
- **evidence_repo**:
  ```
  Grep "JWT|jwt|Authentication|GlobalFilter" synapse-gateway/src → 0건
  SynapseGatewayApplication.java: @SpringBootApplication만
  spring-boot-starter-security 의존성 없음
  ```
- **proposed_text**:
  ```
  > **상태**: 본 절의 JWT GlobalFilter 예시는 현재 synapse-gateway에 구현되어 있지 않다. 향후 인증 도입 시 패턴 참고용으로 유지하며, 구현되면 위치는 `synapse-gateway/src/main/java/com/synapse/gateway/filter/JwtAuthenticationFilter.java`가 되어야 한다. (현재 코드 구조: `config/` 패키지에 RoutesConfig·RateLimiterConfig·CorsConfig만 존재)
  ```
  (기존 33줄 Java 코드 블록은 "참고 패턴" 박스로 감싸고 헤더에 "TODO: 미구현" 명시)
- **patch_target**: L1292-L1324
- **deep_dive**: false

### S2a-F35 · 개요 'Netty 기반' 단정 — SCG 5는 WebFlux/WebMVC 두 변종 · E2 / P2

- **section**: §3.1 Spring Cloud Gateway 5
- **evidence_official**: context7 SCG v5.0.0 intro: "Each flavor offers WebFlux and Web MVC compatibility."
- **current_text**: (L1201-L1202) "Spring 생태계의 API 게이트웨이 솔루션으로, Netty 기반 논블로킹 I/O와 WebFlux를 사용하여 마이크로서비스 앞단의 단일 진입점을 제공한다."
- **proposed_text**: "Spring 생태계의 API 게이트웨이 솔루션. Spring Cloud Gateway 5는 **Server WebFlux**(Netty + Reactor)와 **Server Web MVC**(Tomcat/Jetty + WebMvc.fn) 두 변종을 제공하며, synapse-gateway는 `spring-cloud-starter-gateway-server-webflux` 의존성을 사용해 Netty 기반 논블로킹 I/O 변종을 채택했다."
- **patch_target**: L1201-L1202
- **deep_dive**: false

### S2a-F36 · lb:// 라우팅 / Eureka·Consul 트러블슈팅 행은 본 프로젝트 환경과 무관 · E1 / P2

- **section**: §3.1 Spring Cloud Gateway 5
- **evidence_repo**: build.gradle.kts에 eureka/consul 의존성 없음. RoutesConfig.java는 K8s 서비스 호스트 직접
- **current_text**: (L1334) `| lb:// 라우팅 실패 | Eureka/Consul 서비스 미등록 | 서비스 spring.application.name 및 등록 상태 확인 |`
- **proposed_text**: `| K8s 서비스 라우팅 실패 | 환경변수 <SVC>_URI 미주입 또는 서비스 미배포 | RoutesConfig.java @Value 환경변수 (PLATFORM_SVC_URI 등) 와 K8s Service 존재 확인 |`
- **patch_target**: L1334
- **deep_dive**: false

### OK 항목 통합 표

| finding_id | section | 한 줄 사유 | 증거 |
|-----------|---------|----------|------|
| S2a-F15 | §4.1.3 Spring Security 7 | SecurityFilterChain Lambda DSL + JwtEncoder + OAuth2 사용 표준 일치 | context7 + synapse-* OAuth2 starter 사용 |
| S2a-F16 | §4.1.6 Spring WebFlux | Gateway WebFlux 설명 정확, Spring Cloud 2025.1.1 사용 | synapse-gateway/build.gradle.kts:20,29 |
| S2a-F17 | §4.1.4 Spring Data JPA | Hibernate 7 + Jakarta EE 11 + JpaRepository 표준 일치 | context7 + Boot 4 BOM Hibernate 7.x 관리 |
| S2a-F18 | §4.1.2 Spring Boot 4 | Boot 4.0.0 BOM + dependency-management 1.1.7 패턴 표준 | synapse-* 6 레포 동일 |
| S2a-F19 | §4.1.7 Testcontainers | @ServiceConnection / @Container 패턴 정확 | context7 testcontainers + spring-boot 통합 |
| S2a-F20 | §4.1.8 Spring Modulith | @ApplicationModule + ApplicationModules.verify() 패턴 정확 | context7 + synapse-*/test/.../ModuleStructureTest.java × 4 |
| S2a-F29 | §4.2.2 FastAPI | lifespan(asynccontextmanager) 패턴 일치 | context7 + main.py:29-30 |
| S2a-F30 | §4.2.3 uvicorn | uvloop·httptools·graceful shutdown 설명 일치 | context7 + pyproject.toml uvicorn[standard] |
| S2a-F31 | §4.2.5 httpx | AsyncClient + Timeout(connect=) 패턴 일치 | context7 + openai_service.py:24 httpx.Timeout(30.0, connect=5.0) |
| S2a-F37 | §3.1 Spring Cloud Gateway 5 | Predicate/Filter 카탈로그 자체 SCG 5 공식과 일치 | context7 SCG v5.0.0 |

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

| finding_id | 절 | Deep Dive 제목 | 핵심 요지(1줄) |
|-----------|-----|-------------|-------------|
| S2a-F04 | §4.1.2 Spring Boot 4 | Virtual Threads & Actuator 보안 | opt-in 이유·Synapse 활성 전 체크·관리 포트 분리·NetworkPolicy |
| S2a-F14 | §4.1.8 Spring Modulith 2.0.x | Event Publication Registry vs Outbox | 이중 채널·분리 기준·Kafka 모듈 함정·3-INSERT 트랜잭션 패턴 |
| S2a-F33 | §3.1 Spring Cloud Gateway 5 | 라우팅 구성 재작성 (서비스명·필터·CircuitBreaker) | Java DSL 4개 route 패턴 + RedisRateLimiter Bean + CB 의존성 가이드 |

## 7. 위키 패치 diff 요약

위키 커밋: `documents.wiki@493a7ba` (master)
파일: `18_기술_스택_정의서.md` (5560 → 5617줄, +252 / -183)

| Finding | 클래스 | 위치 | 변경 유형 |
|---------|-------|--------|---------|
| S2a-F32, F33, F34, F35, F36 | E1×3 + R + E2 | §3.1 Gateway 절 전반 (L1199-L1343) | 개요/사용 위치/설정 가이드 재작성 + Deep Dive 삽입 + 트러블슈팅 정정 |
| S2a-F01, F02, F03, F04 | E1 + D×2 + R | §4.1.2 Spring Boot 4 (L1747-L1858) | 역할·선택 이유·기술적 이점·설정 yaml·Deep Dive 삽입 |
| S2a-F05, F06, F07 | E2 + D + R | §4.1.4 JPA/Hibernate 7 (L2022-L2100) | 엔티티 예제 정정 + 트러블슈팅 3행 추가 |
| S2a-F08, F09, F10 | E1 + D + R | §4.1.5 Flyway 10.x→11.x (L2113-L2199) | 절 제목·개요·대안 비교·설정 가이드·트러블슈팅 정정 |
| S2a-F11, F12 | E2 + D | §4.1.7 Testcontainers (L2327-L2404) | 표준 버전 박스 + RedisContainer→GenericContainer + 트러블슈팅 추가 |
| S2a-F13, F14 | D + R | §4.1.8 Modulith (L2447-L2503) | 버전 상태 박스 + 의존성 보강 + Outbox 관계 박스 + Deep Dive 삽입 |
| S2a-F22, F23, F24 | E1 + E2×2 | §4.2.2 FastAPI | 역할 엔드포인트·사용 위치·서비스 디렉토리 정정 |
| S2a-F25, F26 | E2×2 | §4.2.3 uvicorn | Dockerfile 멀티스테이지+단일 uvicorn 실 코드 교체 |
| S2a-F21 | E1 (deep_dive) | §4.2.4 LangChain → Direct SDK | 절 통째 재작성 (122줄 → 90줄) |
| S2a-F27 | E2 | §4.2.5 httpx | 사용 위치 app/clients 보강 |
| S2a-F28 | E1 | §1.4 표 (L128) | LangChain 행 → OpenAI/Anthropic SDK 2행 |
| cross-section | - | §12.3 Python AI 버전 매핑 | LangChain 행 제거 + OpenAI/Anthropic SDK 행 추가 |
| cross-section | - | §12.5 주요 충돌 표 | LangChain 충돌 행 → "잔존 언급 정리" 행 |
| (§11) | - | §11 변경 이력 마지막 행 | v2.3-S2a 행 신규 추가 (상세 변경 요약) |

커밋 메시지 본문 (요약):
```
docs(stack): S2a 백엔드 프레임워크 — context7·repo 검증 반영 + 보강
E1:8 · E2:8 · D:5 · R:6 · OK:10
P0:5 · P1:6 · P2:16
§3.1 Spring Cloud Gateway 5 / §4.1.2~§4.1.8 Spring 스택 / §4.2.2~§4.2.5 Python 스택
주요 정정 (P0): Gateway 경로·라우팅 재작성·LangChain → Direct SDK·Testcontainers 좌표
S1 위임: §4.1.2 Spring Boot 4 Virtual Threads opt-in 정정
Deep Dive 3건
Refs: documents PR #<TBD>
```

## 8. 후속 과제 (Follow-ups)

### 위임 항목 (다른 세션 영역)

- **(S2b 위임)** S2 행을 S2a/S2b 2줄로 분할. Flutter 스택은 S2b에서 별도 검증.
- **(S5 위임)** §4.1.7 Testcontainers는 본 세션에서 함께 검증했으나 마스터 스펙 §2는 S5 운영 후보로 표시. S5에서도 검증/이관 결정.
- **(S5 위임)** §3.1 Gateway JWT 미구현(S2a-F34) + CircuitBreaker 미설정(S2a-F33) → 보안·복원력 모델 갭. `deploy-mirror-standardization` 메모리와 함께 S5에서 검증.
- **(S6 위임)** §6 RAG 절들(§6.1 Anthropic·§6.2 OpenAI·§6.3 RAG·§6.4 Semantic Cache)에 LangChain 잔존 언급 가능성 — S6에서 일괄 정정. §4.2.4 재작성된 "Direct SDK" 패턴과 일관성 유지.
- **(S2b 위임)** §4.2.6 pytest 절(L2955) "LangChain 체인 Mock 테스트" 표현 — S2b 또는 S6에서 정정. (참고: 마스터 스펙은 pytest를 S5로 이관 후보 표시)

### 별도 코드 PR (위키 정정 외, 본 세션 범위 밖)

- **(P0 코드 PR)** `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 수정 (`testcontainers-junit-jupiter:2.0.5` → `junit-jupiter:1.21.4`). 빌드 실패 방지 — 즉시 수정 권장.
- **(P1 코드 PR)** `synapse-learning-svc/learning-card/build.gradle.kts:81` Spring Modulith `1.3.0` → `2.0.6` 업그레이드. Spring Boot 4 호환성 확보.
- **(P2 코드 PR)** Spring Boot 패치 라인 정합: gateway 4.0.6 ↔ platform/engagement/knowledge/learning-card 4.0.0 → 모두 4.0.6 정렬.
- **(P2 코드 PR)** Spring Modulith 패치 라인 정합: platform/knowledge 2.0.6 ↔ engagement 2.0.5 → 모두 2.0.6.

### 별도 작업 (위키 통합)

- **(v2.3 통합)** §1.4 기술 스택 전체 목록 표·§10.1 요약표·§11 변경 이력·§12 호환성 표 — 6 세션 종료 후 v2.3 통합 작업에서 일관성 재검토. LangChain 잔존 언급은 본 세션에서 §1.4만 정정함.

### 운영 표준 예외 기록

- 위키에 추가로 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 "세션당 단일 커밋"의 의도된 예외. S1과 동일.

### 메모리 갱신 후보

- 본 세션은 신규 메모리 작성 불필요. 기존 메모리(`data-sync-outbox-cqrs`·`python-ai-stack-direct-sdk`) 모두 본 세션 발견과 정합. S4·S6에서 신규 메모리 후보 발생 시 검토.
