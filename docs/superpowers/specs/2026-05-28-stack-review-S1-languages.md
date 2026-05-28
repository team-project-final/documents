# 18 기술 스택 정의서 검증 — S1 언어

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2
> 위키 패치 커밋: documents.wiki@6f042fc1e6d28fa6f1cdff9922a610c1d14530fd

## 0. 요약 (Summary)

- 검증 기술 수: 3 (Java 21 / Python 3.12 / Dart 3.x)
- **E1: 9 · E2: 10 · D: 4 · R: 3 · OK: 4** (총 30 findings)
- **P0: 6 · P1: 11 · P2: 13**
- 문서 자체 결함(절 번호 충돌 등): 0건 (단, S2 영역 §2.4·§2.5 충돌은 마스터 스펙 §2에서 사전 발견됨)
- 부수 발견(범위 외 위임): 4건 (§4.1.2 Spring Boot 동일 오류 외)

**가장 영향 큰 발견 (P0)**:
- §4.2.1 Python 절이 실 코드와 거의 전면 괴리: Poetry → 실은 pip+PEP 621, LangChain 의존성 주장 → 실은 OpenAI/Anthropic SDK 직접, Anthropic 의존성 자체 누락 (S1-F12~F14)
- §2.2 Dart 절의 프로젝트 경로 `syn/` 미존재 (실은 `synapse-frontend/`), BLoC 전제 (실은 Riverpod 채택), `strong-mode.implicit-casts` deprecated 옵션 사용 (S1-F23~F25)
- §4.1.1 Java 절의 "Spring Boot 4 Virtual Threads 자동 활성화" 표현 (실은 opt-in 필요, 현재 모든 서비스가 미설정 상태) (S1-F03)

## 1. 카테고리 인벤토리 (Step 1)

| 절 | 기술 | 명시 버전 | 본문 라인 수 | 코드 블록 수 | 1차 진단 |
|----|------|----------|-----------|-----------|---------|
| §4.1.1 (L1581-L1688) | Java 21 LTS | Java 21 (2023-09 GA / 2028까지 Premier) | 108 | 2 (java+dockerfile) | Virtual Threads/Pattern Matching/Record 강조, JEP 444/441/395/409/431 인용 |
| §4.2.1 (L2417-L2494) | Python 3.12 | ^3.12 | 78 | 1 (toml) | "3.11 대비 5% 향상", PEP 695 인용, FastAPI 0.130 / langchain 1.2 / openai 1.40 / pydantic 2.7 |
| §2.2 (L260-L358) | Dart 3.x | 명시 minor 없음 ("Dart 3.0+"·"Dart 3.x") | 100 | 2 (yaml+dart) | Records/Pattern Matching/Null Safety/Isolate.run/Mixins. 문서 헤더 §12.2는 "Dart 3.8+" 명시 |

**문서 자체 사전 관찰**: 18 문서 헤더와 §2.2 본문의 Dart 버전 표기 불일치 (헤더: "Dart 3.8+", §2.2 본문: "Dart 3.x") — D-F06으로 추후 검증.

## 2. skill-recommender 결과 (Step 2)

- 카탈로그: `C:\workspace\dsd\skill-catalog\catalog.json` (17,612,949 bytes)
- 키워드 1차 (8개): `java 21,virtual threads,zgc,python 3.12,asyncio,dart 3,null safety,records` → 30개 반환, 대부분 "records" 오매칭 (Airtable/Court Records 등 SaaS 통합 MCP)
- 키워드 2차 정제 (7개): `java 21,openjdk,project loom,python documentation,cpython,dart language,flutter dart` → 2개만 반환 (낮은 점수, 비-verified)

| # | 이름 | 유형 | 출처 | 채택 사유 |
|---|------|------|------|----------|
| — | (없음) | — | — | 카탈로그가 SaaS 통합 MCP 위주이며 S1 검증용 도구는 부재 |

**채택 결과**: 0개. 본 세션의 1차 검증 도구는 **context7 MCP** (마스터 스펙 §1 Step 3에 이미 명시). 카탈로그가 S1 카테고리에 새로운 도구를 추가하지 못함은 그 자체로 기록 가치 있음 (향후 카탈로그 보강 후보).

## 3. 공식 문서 검증 결과 (Step 3)

### 3.1 Java 21

- **출처**: context7 (`/openjdk/jdk`, `/websites/oracle_en_java_javase_21`) + WebFetch (Spring Boot docs, Oracle Virtual Threads docs, Oracle Records/Sealed docs, InfoQ Java 21 GA, Wikipedia version history)
- **검증 토픽**: Virtual Threads, JEP 표준화 시점, GC 옵션, LTS 라이프사이클, Pattern Matching, Spring Boot 4 통합
- **18 문서와의 일치 여부**:
  - 버전 21 LTS: **E1** (Premier만 표기, Extended 누락 — S1-F06)
  - Virtual Threads 매핑: **E1** (1:N → M:N 오기 — S1-F01)
  - JEP 395/409 표기: **E1** (Java 16/17 표준화, Java 21 신규 아님 — S1-F02)
  - Spring Boot 4 자동 활성화: **E1** (opt-in 필요 — S1-F03)
  - YAML 주석 `//`: **E2** (YAML 문법 오류 — S1-F07)
  - Pattern Matching 예시 sealed 누락: **E2** (S1-F08)
- **인용 원문** (Spring Boot docs): "When virtual threads are enabled (using Java 21+ and `spring.threads.virtual.enabled` set to `true`) this will be a `SimpleAsyncTaskExecutor` that uses virtual threads."

### 3.2 Python 3.12

- **출처**: context7 (`/python/cpython`) + WebFetch (devguide.python.org/versions/, docs.python.org/3.12/whatsnew/3.12.html, PEP 602/695/701)
- **검증 토픽**: asyncio 성능, PEP 695/701/669/692, EoL 정책, type parameter vs type alias 문법
- **18 문서와의 일치 여부**:
  - "3.11 대비 5% 향상": **E2** (전체 평균 ~5% 맞지만, asyncio 75%·comprehension 2배·재시작 patterns 등 누락 — S1-F16)
  - PEP 695 예시: **E2** (type parameter ≠ type alias — `def f[T](x:T)` 시그니처가 type parameter, `type Vector = list[float]`는 type alias — S1-F17)
  - PEP 701/669/692 미인용: **E2** (P-F07 보강 — S1-F18)
  - EoL 명시 부재: **R** (PEP 602 보강 — S1-F20)
- **인용 원문** (docs.python.org/3.12/whatsnew/3.12.html): "asyncio ... 75% speed up", "comprehension inlining ... speeds up ... by up to two times"

### 3.3 Dart 3.x

- **출처**: context7 (`/websites/dart_dev`, `/dart-lang/site-www`) + WebFetch (dart.dev/language, dart.dev/null-safety, dart.dev/language/records, dart.dev/tools/analysis)
- **검증 토픽**: Records, Pattern Matching, Isolate.run, analyzer 옵션, build_runner 권장 명령
- **18 문서와의 일치 여부**:
  - `analyzer.strong-mode.implicit-casts/implicit-dynamic`: **E1** (Dart 3에서 deprecated, `language.strict-casts/strict-raw-types`로 대체 — S1-F25)
  - `flutter pub run build_runner`: **E2** (구식, 공식은 `dart run build_runner` — S1-F26)
  - typedef positional record (`(CardId id, ...)`): **E2** (이름은 문서용 주석일 뿐, 접근은 `$1/$2/$3` — S1-F29)
  - Isolate.run 도입 버전 보강: **R** (Dart 2.19+ — S1-F30)
- **인용 원문** (dart.dev/language/records): "Naming positional fields in a record type annotation is for documentation only and does not affect the record's type compatibility."

## 4. 실 코드 대조 결과 (Step 4)

### 4.1 의존성·버전 비교

| 항목 | 18 문서 명시 | synapse-* 실측 | 출처(파일:라인) | 진실 | 클래스 |
|------|-------------|---------------|--------------|------|-------|
| Java toolchain | 21 | 21 | synapse-platform-svc/build.gradle.kts L14-L15 외 6개 레포 모두 `JavaLanguageVersion.of(21)` | 일치 | OK (S1-F10) |
| Dockerfile 베이스 | `eclipse-temurin:21-jre-alpine` | `21-jdk-jammy` + `21-jre-jammy` (gateway만 alpine) | synapse-platform-svc/Dockerfile L2,L16 | 코드 (jammy 표준) | D (S1-F04) |
| Spring Boot Virtual Threads | "자동 활성화" | 모든 application.yml에 `spring.threads.virtual.enabled` 미설정 | synapse-*/src/main/resources/application.yml | 18 명시 변경 필요 | E1 (S1-F03) |
| 사용 위치 폴더명 | `api-gateway/` | `synapse-gateway/` | 디렉토리 실측 | 코드 (synapse-*) | D (S1-F05) |
| Python 빌드 시스템 | Poetry (`[tool.poetry]`) | pip + PEP 621 (`[project]`) + setuptools | learning-ai/pyproject.toml L1-L36 | 코드 | E1 (S1-F12) |
| Python LangChain | `langchain ^1.2.0` | 미사용 (Grep 0건) | learning-ai 전체 | 코드 | E1 (S1-F13) |
| Python Anthropic | (누락) | `anthropic>=0.40.0` 사용 중 | learning-ai/pyproject.toml L11, app/services/anthropic_service.py | 코드 | E1 (S1-F14) |
| Python FastAPI | `^0.130.0` | `>=0.115.0` | learning-ai/pyproject.toml L7 | 코드 | E2 (S1-F15) |
| Python Pydantic | `^2.7.0` | `>=2.9.0` | learning-ai/pyproject.toml | 코드 | E2 (S1-F15) |
| Python redis extras | `redis` | `redis[hiredis]` | learning-ai/pyproject.toml | 코드 | E2 (S1-F15) |
| Dart 프로젝트 경로 | `syn/lib/**` | `synapse-frontend/lib/**` | 디렉토리 실측 | 코드 | E1 (S1-F23) |
| Dart 상태 관리 | BLoC 언급 | Riverpod (`flutter_riverpod: ^3.3.1`, `flutter_bloc` 없음) | synapse-frontend/pubspec.yaml L12, CLAUDE.md L20 | 코드 | E1 (S1-F24) |
| Dart Freezed | "Freezed 생성" | codegen 미사용 (build_runner 의존성 없음) | synapse-frontend/pubspec.yaml, CLAUDE.md L19 | 코드 | E1 (S1-F27) |
| Dart SDK constraint | "Dart 3.x" / 헤더 "Dart 3.8+" / §2.1 ">=3.0.0 <4.0.0" | `>=3.11.0 <4.0.0` | synapse-frontend/pubspec.yaml L6-L7 | 코드 | E2 (S1-F28) |
| Dart analyzer 옵션 | `strong-mode.implicit-casts` | `language.strict-casts/strict-raw-types` | synapse-frontend/analysis_options.yaml L26-L30 | 코드 (Dart 3 표준) | E1 (S1-F25) |

### 4.2 사용 위치 경로 실재 확인

| 18 문서 명시 경로 | Glob 결과 | 진단 |
|----------------|----------|------|
| `api-gateway/` | 미존재 | D — `synapse-gateway/`로 정정 (S1-F05) |
| `synapse-platform-svc/`, `synapse-engagement-svc/`, `synapse-knowledge-svc/`, `synapse-learning-svc/learning-card/` | 모두 존재 | OK |
| `synapse-*/src/main/java/*/dto/` | 존재 (note/dto, search/dto, auth/dto 등) | OK |
| `synapse-*/src/main/java/*/domain/` | learning-card만 존재, 다른 서비스 미존재 | D (Spring Modulith 모듈 단위 구조 — S1-F05) |
| `synapse-learning-svc/learning-ai/`, `app/services/` | 모두 존재 | OK (S1-F22) |
| `syn/lib/**/*.dart` | 미존재 (syn/엔 docs/scripts만) | E1 — `synapse-frontend/lib/**`로 정정 (S1-F23) |
| `syn/lib/core/models/` Freezed | 미존재 + Freezed 미사용 | E1 (S1-F23, S1-F27) |
| `syn/lib/features/*/bloc/` | 미존재 + BLoC 미채택 | E1 (S1-F23, S1-F24) |

### 4.3 메모리 표준 정합성

- `data-sync-outbox-cqrs` (S4 영역, 본 세션 직접 영향 없음): learning-ai의 `aiokafka>=0.11.0` 의존성이 pyproject.toml에 있음 — Python 측 Kafka 통합 일관성 확인됨. S4 세션에서 본격 검증.
- `deploy-mirror-standardization` (S5 영역, 본 세션 직접 영향 없음): synapse-* 빌드/Dockerfile 패턴이 표준화 진행 중. S5에서 검증.
- `git-pr-workflow` (운영 표준): 본 세션도 별도 브랜치 → PR → 머지 대기 워크플로 준수. Spec compliance OK.

## 5. 발견사항 (Findings)

### S1-F01 · Virtual Threads의 OS 스레드 매핑 방향 오기 (1:N → M:N) · E1 / P2

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
  "to simulate a lot of threads, the Java runtime maps a large number of
  virtual threads to a small number of OS threads."
  → 가상 스레드(다수)가 OS 스레드(소수)에 매핑되는 M:N 모델
  ```
- **current_text**:
  ```
  - **Virtual Threads (JEP 444)**: OS 스레드와 1:N 매핑으로 수만 개의 동시 요청 처리
  ```
- **proposed_text**:
  ```
  - **Virtual Threads (JEP 444)**: 다수의 가상 스레드를 소수의 플랫폼(OS) 스레드(carrier)에 M:N으로 매핑(mount/unmount) — 수만 개 동시 요청을 적은 OS 스레드로 처리
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1603
- **deep_dive**: false

### S1-F02 · JEP 395/409는 Java 21 신규 기능이 아님 (Java 16/17 표준화) · E1 / P2

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  - Oracle docs (Java 16 records.html / Java 17 sealed-classes-and-interfaces.html)에 표준화
  - context7 /websites/oracle_en_java_javase_21: "Additions in this release
    include record patterns and pattern matching for switch."
  - Java 21 신규 final JEP: 431, 439, 440, 441, 444, 449, 451, 452 (395/409 미포함)
  ```
- **current_text**:
  ```
  - **Record Classes (JEP 395)**: 불변 데이터 캐리어를 1줄로 정의 (DTO, Value Object)
  - **Sealed Classes (JEP 409)**: 타입 계층을 컴파일 타임에 닫힌 집합으로 제한
  ```
- **proposed_text**:
  ```
  - **Record Classes (Java 16, JEP 395)**: 불변 데이터 캐리어를 1줄로 정의 (DTO, Value Object) — Java 21에서 사용 가능
  - **Sealed Classes (Java 17, JEP 409)**: 타입 계층을 컴파일 타임에 닫힌 집합으로 제한 — Java 21에서 사용 가능
  - **Record Patterns (Java 21, JEP 440)**: `switch`/`instanceof`에서 레코드 구조 분해 — Java 21 신규 final
  - **Pattern Matching for switch (Java 21, JEP 441)**: 타입 + 가드(`when`) 패턴을 `switch`에서 표현
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1604-L1607
- **deep_dive**: false

### S1-F03 · Spring Boot 4가 Virtual Threads를 자동 활성화한다는 표현은 오기 · E1 / P1

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html
  "When virtual threads are enabled (using Java 21+ and `spring.threads.virtual.enabled`
  set to `true`) this will be a `SimpleAsyncTaskExecutor` that uses virtual threads."
  → Spring Boot는 Java 21+에서도 `spring.threads.virtual.enabled=true`를 명시적으로
  설정해야 가상 스레드를 사용. 기본값은 false (opt-in).
  ```
- **evidence_repo**:
  ```
  synapse-*/src/main/resources/application.yml: `spring.threads.virtual.enabled` 0건
  전체 자바 소스에서 `Thread.ofVirtual` / `newVirtualThreadPerTaskExecutor` 호출 0건
  → 실 코드는 현재 가상 스레드 미사용 상태
  ```
- **current_text**:
  ```java
  // Virtual Threads 활성화 (Spring Boot 4에서 자동 지원)
  // application.yml
  spring:
    threads:
      virtual:
        enabled: true  // Spring Boot 4: Virtual Threads 자동 활성화
  ```
- **proposed_text**:
  ```yaml
  # application.yml — Virtual Threads는 opt-in (Java 21+, Spring Boot 4)
  # 기본값 false. true로 설정해야 Async/Scheduling/내장 Tomcat 요청 처리가 가상 스레드 사용
  spring:
    threads:
      virtual:
        enabled: true   # 기본값 false. true로 설정해야 가상 스레드 사용
  ```
  (코드 펜스 언어 태그도 `java`가 아닌 `yaml`로 변경 — S1-F07도 같은 변경)
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1622-L1628
- **deep_dive**: false

### S1-F04 · Dockerfile 베이스 이미지·JAVA_OPTS가 실 레포와 불일치 · D / P1

- **section**: §4.1.1 Java 21
- **evidence_repo**:
  ```
  synapse-platform-svc/Dockerfile L2,L16:
    FROM eclipse-temurin:21-jdk-jammy AS builder
    FROM eclipse-temurin:21-jre-jammy
  synapse-engagement-svc / knowledge-svc / learning-card/Dockerfile — 모두 21-jdk/jre-jammy
  synapse-gateway/Dockerfile — 21-jdk-alpine / 21-jre-alpine (예외)
  모든 Dockerfile에 JAVA_OPTS 환경 변수 미정의. ENTRYPOINT는 직접 `java -jar app.jar`
  ```
- **current_text**:
  ```dockerfile
  # Dockerfile — Java 21 + Virtual Threads
  FROM eclipse-temurin:21-jre-alpine AS runtime
  WORKDIR /app
  ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
                 -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 \
                 -Djava.security.egd=file:/dev/./urandom"
  COPY target/*.jar app.jar
  ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
  ```
- **proposed_text**:
  ```dockerfile
  # 실 사용 패턴 — Synapse 4개 굵은 서비스 공통 (예: synapse-platform-svc/Dockerfile)
  # 빌더/런타임 분리 멀티스테이지. jammy(glibc) 베이스를 표준으로 채택.
  FROM eclipse-temurin:21-jdk-jammy AS builder
  WORKDIR /app
  COPY gradlew settings.gradle.kts build.gradle.kts ./
  COPY gradle gradle
  RUN chmod +x gradlew && ./gradlew dependencies --no-daemon
  COPY src src
  RUN ./gradlew clean bootJar --no-daemon

  FROM eclipse-temurin:21-jre-jammy
  WORKDIR /app
  RUN addgroup --system app && adduser --system --ingroup app app
  COPY --from=builder /app/build/libs/*.jar app.jar
  RUN chown app:app app.jar
  USER app
  EXPOSE 8080
  # 권장 JVM 플래그 (현재 Dockerfile 미박힘 — K8s Deployment의 JAVA_TOOL_OPTIONS로 주입 권장)
  # ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
  #                -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```
  > **운영 합의**: alpine은 `synapse-gateway`만 사용(이미지 슬림). 나머지는 jammy(glibc 호환·JFR/네이티브 친화). JVM 플래그는 ConfigMap/`JAVA_TOOL_OPTIONS`로 관리.
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1660-L1669
- **deep_dive**: false

### S1-F05 · 프로젝트 내 사용 위치의 폴더명·domain 디렉토리 불일치 · D / P2

- **section**: §4.1.1 Java 21
- **evidence_repo**:
  ```
  실재: synapse-gateway/ (api-gateway/ 미존재)
  domain/ 디렉토리 실재 현황:
    synapse-platform-svc/src/main/java        → domain/ 없음, auth/dto·billing/dto 등 존재
    synapse-engagement-svc/src/main/java      → domain/ 없음, community/dto·gamification/dto 등
    synapse-knowledge-svc/src/main/java       → domain/ 없음, note/dto·search/dto·graph/dto 등
    synapse-learning-svc/learning-card/...    → domain/ 존재 (card/domain, srs/domain)
    synapse-gateway/src/main/java             → dto/·domain/ 모두 없음 (config/만)
  ```
- **current_text**:
  ```
  - `api-gateway/`, `synapse-platform-svc/`, `synapse-engagement-svc/`, `synapse-knowledge-svc/`, `synapse-learning-svc/learning-card/` — Spring Boot 런타임
  - `synapse-*/src/main/java/*/dto/` — Record 클래스 기반 DTO
  - `synapse-*/src/main/java/*/domain/` — 도메인 모델
  ```
- **proposed_text**:
  ```
  - `synapse-gateway/`, `synapse-platform-svc/`, `synapse-engagement-svc/`, `synapse-knowledge-svc/`, `synapse-learning-svc/learning-card/` — Spring Boot 4 런타임 (Java 21 toolchain)
  - 각 굵은 서비스 도메인 패키지 하위 `**/dto/` — Record 클래스 기반 DTO
    (예: `synapse-knowledge-svc/src/main/java/com/synapse/knowledge/note/dto/`)
  - `synapse-learning-svc/learning-card/src/main/java/com/synapse/learning/{card,srs}/domain/` — 도메인 모델 (DDD 패턴 적용 서비스)
  - 그 외 굵은 서비스(platform/engagement/knowledge)는 Spring Modulith 모듈 단위 패키지(`auth/`, `community/`, `note/`…)이며 `domain/` 디렉토리 표준은 아직 미적용
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1615-L1618
- **deep_dive**: false

### S1-F06 · 장기 지원 종료 시점 표기가 Premier만 인용 (Extended 누락) · D / P2

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  Wikipedia "Java version history" (2026-05-28 확인):
  "Java SE 21 (LTS): Oracle Premier Support end September 2028,
   Oracle Extended Support end September 2031."
  ```
- **current_text**:
  ```
  Java 21은 2023년 9월 GA 릴리스된 LTS 버전으로, 2028년까지 장기 지원이 보장된다.
  ```
- **proposed_text**:
  ```
  Java 21은 2023년 9월 GA 릴리스된 LTS 버전으로, Oracle Premier Support 2028년 9월, Extended Support 2031년 9월까지 보장된다(Eclipse Temurin·Amazon Corretto 등 OpenJDK 배포판도 최소 2028년까지 패치 제공).
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1590
- **deep_dive**: false

### S1-F07 · application.yml 코드 블록에 `//` 주석 사용 — YAML 문법 오류 · E2 / P1

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  YAML 1.2 spec: 주석은 `#`으로 시작. `//`는 주석이 아니라 문자열로 파싱되어
  `true // ...` 매핑 값을 문자열로 인식해 부팅 실패.
  ```
- **current_text**: (S1-F03의 current_text와 동일 위치 — 같은 블록의 다른 측면)
- **proposed_text**: (S1-F03의 proposed_text가 동시에 해결 — 단일 Edit으로 처리)
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1622-L1628 (S1-F03과 결합 패치)
- **deep_dive**: false

### S1-F08 · Pattern Matching 예시가 sealed/permits 타입 가정 — 컨텍스트 누락 · E2 / P2

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  https://openjdk.org/jeps/441 (Pattern Matching for switch, Final in Java 21):
  switch의 totality(완전성) 검사는 selector 타입이 sealed 계층이거나 enum이어야
  default 절 없이 컴파일됨. 그렇지 않으면 컴파일 에러.
  ```
- **current_text**:
  ```java
  // Pattern Matching 활용 예시
  String formatOutcome(ReviewOutcome outcome) {
      return switch (outcome) {
          case CorrectOutcome c when c.intervalDays() > 30 -> ...
          case CorrectOutcome c -> ...
          case IncorrectOutcome i -> ...
      };
  }
  ```
- **proposed_text**:
  ```java
  // Pattern Matching + Sealed Type (Java 21 final)
  // selector를 sealed로 선언해야 default 절 없이 totality 보장
  sealed interface ReviewOutcome permits CorrectOutcome, IncorrectOutcome {}
  record CorrectOutcome(int intervalDays) implements ReviewOutcome {}
  record IncorrectOutcome(int streak) implements ReviewOutcome {}

  String formatOutcome(ReviewOutcome outcome) {
      return switch (outcome) {
          case CorrectOutcome c when c.intervalDays() > 30 ->
              "장기 기억 전환: 다음 복습 " + c.intervalDays() + "일 후";
          case CorrectOutcome c ->
              "정답: 다음 복습 " + c.intervalDays() + "일 후";
          case IncorrectOutcome i ->
              "오답: 내일 재복습 예정 (연속 오답: " + i.streak() + "회)";
      };
  }
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L1647-L1657
- **deep_dive**: false

### S1-F09 · Virtual Threads 운영 함정·튜닝 가이드 부족 (보강 권장) · R / P2

- **section**: §4.1.1 Java 21
- **evidence_official**:
  ```
  https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
  https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html
  - synchronized + 블로킹 호출 시 carrier에 pin (Java 24/JEP 491에서 해소, 21은 영향)
  - ReentrantLock/StampedLock/j.u.c. 대체 권장
  - JFR jdk.VirtualThreadPinned 이벤트
  - -Djdk.tracePinnedThreads=full
  - ThreadLocal은 다수 가상 스레드에서 누수원
  ```
- **proposed_text** (Deep Dive 부속 서브섹션):
  ```markdown
  #### 더 깊이 / Deep Dive — Virtual Threads 운영 가이드
  > 출처: https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html · https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html · 검증 일자: 2026-05-28

  - **Pin 트리거 (Java 21 LTS)**: `synchronized` 블록·메서드 안에서 블로킹 I/O를 호출하면 가상 스레드가 carrier에 고정(pin)되어 그 동안 다른 가상 스레드를 실행할 수 없다. `ReentrantLock` / `StampedLock` / `java.util.concurrent`로 교체. (Java 24 JEP 491에서 해소됐으나 본 프로젝트는 21 LTS 기준)
  - **Pin 추적**: `-Djdk.tracePinnedThreads=full` 또는 `=short`로 stack 출력. JFR 이벤트 `jdk.VirtualThreadPinned`를 Grafana/Prometheus로 수집.
  - **풀 크기 재검토**: 가상 스레드는 거의 무제한 생성 가능하므로, 실 병목은 **DB 커넥션 풀**(HikariCP `maximumPoolSize`), **HTTP 클라이언트 풀**, **외부 API rate-limit**. 가상 스레드 도입 시 이 자원들의 사이즈를 함께 재산정.
  - **ThreadLocal 함정**: 가상 스레드는 수만 개 생성될 수 있어 ThreadLocal 캐시가 메모리 누수원. Java 21+는 `ScopedValue`(JEP 446, Preview) 또는 명시적 컨텍스트 전달을 권장.
  - **Spring 통합 포인트**: `spring.threads.virtual.enabled=true`는 (1) 내장 Tomcat의 request 처리 (2) `@Async`/`@Scheduled` 실행기 두 곳에만 적용. WebFlux 핸들러나 수동 `ExecutorService`는 별도 `Executors.newVirtualThreadPerTaskExecutor()` 사용.
  - **실전 베스트프랙티스**: 도입 전후 `wrk`/`k6` 부하 테스트로 처리량 비교. JFR로 pin/대기 측정.
  - **운영 함정**: Jackson 등 라이브러리 내부 `synchronized` 블록은 가상 스레드에서 pinning 유발 → 의존성 라이브러리 버전 점검 필수 (Jackson 2.17+ 권장).
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` "참고 자료" 헤더 직전(L1681 위)
- **deep_dive**: true

### S1-F10 · Java 21 toolchain 6개 레포에 일관 적용 · OK

- **section**: §4.1.1 Java 21
- **evidence**: `synapse-platform-svc/build.gradle.kts L14-L15`, `synapse-engagement-svc/build.gradle.kts L11-L12`, `synapse-knowledge-svc/build.gradle.kts L11-L12`, `synapse-gateway/build.gradle.kts L11-L12`, `synapse-shared/build.gradle.kts L16-L17`, `synapse-learning-svc/learning-card/build.gradle.kts L12-L13` 모두 `JavaLanguageVersion.of(21)` toolchain. 베이스 이미지도 모두 `eclipse-temurin:21-*`.

### S1-F11 · Record 클래스 DTO 패턴 실 코드에서 광범위 채택 · OK

- **section**: §4.1.1 Java 21
- **evidence**: `synapse-knowledge-svc/src/main/java` 하위에서 `public record ...` 매치 10건 이상 (예: note/dto/NoteCreateRequest.java, note/dto/NoteResponse.java, search/dto/SearchRequest.java). Wiki "Record 클래스로 불변 DTO를 간결하게 정의" 주장과 실 코드 일치.

---

### S1-F12 · 패키지 매니저 오기재: Poetry가 아니라 pip + PEP 621 setuptools · E1 / P0

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  PEP 621 — Storing project metadata in pyproject.toml. [project] 테이블은
  Poetry가 아닌 표준 빌드 백엔드(setuptools 등)에서 사용.
  https://peps.python.org/pep-0621/
  ```
- **evidence_repo**:
  ```
  learning-ai/pyproject.toml L1-L36:
    [project]
    name = "learning-ai"
    requires-python = ">=3.12"
    dependencies = [...]
    [tool.setuptools]
    packages = ["app"]
  learning-ai/Dockerfile L9:
    RUN pip install --no-cache-dir --prefix=/install .
  poetry.lock/uv.lock 파일 0건
  ```
- **current_text**:
  ```
  - poetry: 의존성 및 가상환경 관리
  ```toml
  [tool.poetry]
  name = "synapse-learning-ai"
  ...
  [tool.poetry.dependencies]
  python = "^3.12"
  ...
  ```
  | 패키지 충돌 | 전역 설치 패키지 | 반드시 가상환경 사용 (poetry env) |
  ```
- **proposed_text**: (S1-F15와 결합 패치 — 아래 단일 PEP 621 블록으로 교체)
  ```
  - pip + PEP 621 (`[project]` 테이블) + setuptools: 의존성 및 빌드 메타데이터 관리
  ...
  ```toml
  [project]
  name = "learning-ai"
  version = "0.1.0"
  requires-python = ">=3.12"
  dependencies = [
      "fastapi>=0.115.0",
      "uvicorn[standard]>=0.30.0",
      "pydantic>=2.9.0",
      "pydantic-settings>=2.5.0",
      "anthropic>=0.40.0",
      "openai>=1.50.0",
      "sqlalchemy>=2.0.0",
      "alembic>=1.13.0",
      "asyncpg>=0.29.0",
      "pgvector>=0.2.0",
      "numpy>=1.26.0",
      "tenacity>=8.2.0",
      "jinja2>=3.1.0",
      "httpx>=0.27.0",
      "aiokafka>=0.11.0",
      "redis[hiredis]>=5.0.0",
  ]
  [tool.setuptools]
  packages = ["app"]
  [tool.mypy]
  python_version = "3.12"
  strict = true
  ```
  | 패키지 충돌 | 전역 설치 패키지 | 가상환경(venv) + `pip install -e .` 사용 |
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` §4.2.1 핵심 기능 + 설정 가이드 + 트러블슈팅 (L2447, L2455-L2479, L2487)
- **deep_dive**: false

### S1-F13 · LangChain 사용 주장 실 코드에 부재 · E1 / P0

- **section**: §4.2.1 Python 3.12
- **evidence_repo**:
  ```
  Grep "langchain" (case-insensitive) on learning-ai 전체: 0건
  pyproject.toml dependencies에 langchain/langchain-openai 항목 없음
  실 LLM 호출:
    app/services/openai_service.py L5: from openai import AsyncOpenAI
    app/services/anthropic_service.py L3: from anthropic import AsyncAnthropic
    app/services/claude_service.py L5: from anthropic import APIConnectionError, AsyncAnthropic
  ```
- **current_text**: (S1-F14와 결합 — 역할/선택 이유/사용 위치/설정 가이드 4개 하위 절)
  ```
  ## 역할
  OpenAI API 연동, RAG ... 을 Python/FastAPI 스택으로 구현한다.
  ## 선택 이유
  AI/ML 라이브러리 생태계(LangChain, OpenAI SDK, sentence-transformers, huggingface_hub)가 Python에 집중...
  ## 프로젝트 내 사용 위치
  - synapse-learning-svc/learning-ai/app/services/ — LangChain, OpenAI 통합
  ```
- **proposed_text**:
  ```
  ## 역할
  OpenAI API 및 Anthropic Claude API 연동, RAG(Retrieval Augmented Generation) 파이프라인, SRS 카드 자동 생성, 시맨틱 검색(pgvector), 노트 요약 기능을 Python/FastAPI 스택으로 구현한다.
  ## 선택 이유
  AI/ML 라이브러리 생태계(OpenAI SDK, Anthropic SDK, NumPy, pgvector 등)가 Python에 집중되어 있어 선택이 사실상 필수적이다. Python 3.12의 성능 개선과 asyncio 성숙도가 FastAPI와 시너지를 만든다.
  ## 프로젝트 내 사용 위치
  - synapse-learning-svc/learning-ai/app/services/ — OpenAI/Anthropic SDK 직접 통합 (LangChain 미사용)
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L2422-L2426, L2450-L2451
- **deep_dive**: false

### S1-F14 · Anthropic Claude 의존성 누락 · E1 / P0

- **section**: §4.2.1 Python 3.12
- **evidence_repo**:
  ```
  learning-ai/pyproject.toml L11: "anthropic>=0.40.0",
  learning-ai/app/services/anthropic_service.py L3: from anthropic import AsyncAnthropic
  learning-ai/app/services/claude_service.py L5: from anthropic import ...
  ```
- **current_text** + **proposed_text**: S1-F12의 PEP 621 블록에서 `anthropic>=0.40.0` 행 추가로 통합 해결
- **patch_target**: S1-F12와 결합
- **deep_dive**: false

### S1-F15 · 패키지 버전 핀 다수 불일치 · E2 / P1

- **section**: §4.2.1 Python 3.12
- **evidence_repo**:
  ```
  learning-ai/pyproject.toml L7-L22:
    fastapi>=0.115.0      (wiki ^0.130.0)
    uvicorn[standard]>=0.30.0 (wiki ^0.46.0)
    openai>=1.50.0        (wiki ^1.40.0)
    pydantic>=2.9.0       (wiki ^2.7.0)
    pydantic-settings>=2.5.0 (wiki ^2.3.0)
    httpx>=0.27.0         (wiki ^0.28.0)
    sqlalchemy>=2.0.0     (wiki sqlalchemy{extras=["asyncio"]} ^2.0.0)
    asyncpg>=0.29.0       (wiki ^0.29.0, OK)
    redis[hiredis]>=5.0.0 (wiki redis ^5.0.0, extras 누락)
  ```
- **patch_target**: S1-F12와 결합 (PEP 621 블록 단일 교체로 통합)
- **deep_dive**: false

### S1-F16 · 성능 수치 과소 — 3.11 대비 5%가 아니라 5–11%, asyncio 75% · E2 / P1

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  https://docs.python.org/3.12/whatsnew/3.12.html
  - "asyncio ... 75% speed up"
  - "asyncio.current_task() ... 4x-6x speedup"
  - "comprehension inlining ... speeds up ... by up to two times"
  - "isinstance() against runtime-checkable protocols ... between two and 20 times"
  (3.12 전체 pyperformance 결과는 3.11 대비 약 5% 향상, 워크로드별 편차 큼)
  ```
- **current_text**:
  ```
  - Python 3.12 성능: CPython 최적화로 3.11 대비 약 5% 향상
  ```
- **proposed_text**:
  ```
  - Python 3.12 성능: pyperformance 기준 3.11 대비 평균 약 5% 향상(워크로드별 편차 큼). 특히 asyncio가 약 75% 더 빠르며 `asyncio.current_task()` 4–6배, 컴프리헨션 인라이닝으로 최대 2배, `re.sub()` 2–3배 빨라졌다.
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L2438
- **deep_dive**: false

### S1-F17 · PEP 695 예제 표기 오류 — type alias는 type 키워드 사용 · E2 / P1

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  https://peps.python.org/pep-0695/ + docs.python.org/3.12/whatsnew/3.12.html
  type Point = tuple[float, float]
  type Point[T] = tuple[T, T]
  def max[T](...)
  class Box[T]:
  → 단순 `type Vector = list[float]`는 type alias 예시이지 type parameter 예시 아님
  ```
- **current_text**:
  ```
  - 타입 힌팅 강화: PEP 695 타입 파라미터 (type Vector = list[float])
  ```
- **proposed_text**:
  ```
  - 타입 힌팅 강화(PEP 695): 타입 파라미터 문법 `def f[T](x: T) -> T:` / `class Box[T]:`, type alias 문 `type Vector = list[float]` 도입
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L2441
- **deep_dive**: false

### S1-F18 · 주요 기능 누락 — PEP 701/669/692 · E2 / P2

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  https://docs.python.org/3.12/whatsnew/3.12.html
  PEP 701 — Syntactic formalization of f-strings
  PEP 669 — Low impact monitoring for CPython
  PEP 692 — Using TypedDict for more precise **kwargs typing
  ```
- **current_text**: ("기술적 이점"에 PEP 701/669/692 미포함)
- **proposed_text**: "기술적 이점" 끝에 추가:
  ```
  - PEP 701: f-string 내부에서 따옴표 재사용·백슬래시·멀티라인 표현 허용
  - PEP 669 (`sys.monitoring`): 저오버헤드 모니터링/프로파일링 API
  - PEP 692: `TypedDict`로 `**kwargs` 정밀 타입 지정
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L2441 직후
- **deep_dive**: false

### S1-F19 · asyncio TaskGroup(3.11+) — FastAPI 비동기 활용 권장에 누락 · E2 / P2

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  https://docs.python.org/3.12/library/asyncio-task.html
  asyncio.TaskGroup — asynchronous context manager holding a group of tasks
  (3.11 도입, 3.12 안정)
  ```
- **current_text**:
  ```
  - asyncio: 이벤트 루프 기반 비동기 프로그래밍
  ```
- **proposed_text**:
  ```
  - asyncio: 이벤트 루프 기반 비동기 프로그래밍 (3.12에서 약 75% 성능 향상, `TaskGroup`/`asyncio.timeout()` 컨텍스트 매니저로 구조화된 동시성 지원)
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L2444
- **deep_dive**: false

### S1-F20 · Python 3.12 EOL/지원 단계 명시 권장 · R / P2

- **section**: §4.2.1 Python 3.12
- **evidence_official**:
  ```
  https://devguide.python.org/versions/
  Python 3.12 — First release 2023-10-02, EOL 2028-10 (scheduled), Status: security
  PEP 602: 3.9–3.12는 1.5년 풀 지원 + 3.5년 보안 패치(총 5년)
  ```
- **proposed_text** (Deep Dive 부속 서브섹션):
  ```markdown
  #### 더 깊이 / Deep Dive — Python 3.12 vs 3.13 채택 근거
  > 출처: https://devguide.python.org/versions/ · https://peps.python.org/pep-0602/ · 검증 일자: 2026-05-28

  - **3.12 (2023-10-02 릴리스, EOL 2028-10, 현재 security 단계)**: AI/ML 생태계가 가장 폭넓게 지원하는 라인. ML 휠 가용성·안정성 균형이 좋음.
  - **3.13 (2024-10-07 릴리스, EOL 2029-10, 현재 bugfix 단계)**: 실험적 free-threaded(`--disable-gil`) 빌드와 JIT 도입. AI/ML 휠 일부가 아직 3.13 미지원이라 신규 도입은 위험.
  - **3.11 (EOL 2027-10)**: 3.12 asyncio 75% 개선·PEP 695·PEP 701을 놓치고, 잔여 지원 기간이 짧음.
  - **결론**: 현 시점(2026-05) 3.12 채택은 합리적. EOL과 PEP 602 지원 정책 명시로 근거 보강.
  - **실전 베스트프랙티스**: `requires-python = ">=3.12"` (`<3.13` 제한은 두지 않음)으로 3.13 호환 자동 검증을 미루지 않기. CI에서 3.12·3.13 매트릭스 실행.
  - **운영 함정**: sentence-transformers/Torch 등 일부 ML 휠은 3.13 wheel 빌드가 지연됨 — 3.13 전환 전 의존성 가용성 점검 필수.
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` "참고 자료" 헤더 직전(L2489 위)
- **deep_dive**: true

### S1-F21 · Dockerfile의 python:3.12-slim 베이스 일치 · OK

- **section**: §4.2.1 Python 3.12
- **evidence**: `learning-ai/Dockerfile L2,L12: FROM python:3.12-slim AS builder` + `FROM python:3.12-slim`. Wiki §4.2.1 명시 Python 3.12와 런타임 이미지 정확 일치.

### S1-F22 · app/services/ 경로 + mypy strict 설정 일치 · OK

- **section**: §4.2.1 Python 3.12
- **evidence**: `learning-ai/app/services/` 디렉토리 존재 (`ai_service.py`, `openai_service.py`, `anthropic_service.py`, `claude_service.py`, `rag_service.py`, `card_pipeline_service.py`). `pyproject.toml L45-L47: [tool.mypy] python_version = "3.12" strict = true`. Wiki "사용 위치"·mypy 기조와 일치.

---

### S1-F23 · 프로젝트 경로 'syn/'가 실재하지 않음 — 실제 Flutter 모듈은 'synapse-frontend/' · E1 / P0

- **section**: §2.2 Dart 3.x
- **evidence_repo**:
  ```
  C:\workspace\team-project-final\syn\ 디렉토리는 docs/·scripts/만 존재
  pubspec.yaml/analysis_options.yaml/lib/ 없음 (Glob "syn\\**\\pubspec.yaml" → 0건)
  실 Flutter 프로젝트: C:\workspace\team-project-final\synapse-frontend\
  (pubspec.yaml L1: "name: synapse_frontend")
  ```
- **current_text**:
  ```
  - 모든 `syn/lib/**/*.dart` 파일
  - `syn/lib/core/models/` — 도메인 모델 (Freezed 생성)
  - `syn/lib/core/repositories/` — API 통신 레이어
  - `syn/lib/features/*/bloc/` — BLoC 이벤트/상태 정의
  ```
- **proposed_text**:
  ```
  - 모든 `synapse-frontend/lib/**/*.dart` 파일
  - `synapse-frontend/lib/core/` — 공통 상수·라우터·네트워크·테마
  - `synapse-frontend/lib/services/<boundary>/features/<feature>/domain/` — Entity, UseCase, Repository 인터페이스(Port)
  - `synapse-frontend/lib/services/<boundary>/features/<feature>/data/` — Repository 구현, DTO, DataSource
  - `synapse-frontend/lib/services/<boundary>/features/<feature>/providers/` — Riverpod Provider (이벤트/상태 정의)
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L294-L298
- **deep_dive**: false

### S1-F24 · BLoC 전제가 실 코드와 상충 — 프로젝트는 Riverpod 채택, §2.3에서 BLoC 명시 거부 · E1 / P0

- **section**: §2.2 Dart 3.x
- **evidence_repo**:
  ```
  synapse-frontend/CLAUDE.md L20: 상태 관리: Riverpod manual providers (codegen 사용 안 함)
  synapse-frontend/pubspec.yaml L12: flutter_riverpod: ^3.3.1 (flutter_bloc 없음)
  18_기술_스택_정의서.md §2.3 L375-L378: Riverpod 선택, flutter_bloc은 ❌ 로 명시 거부
  Grep "flutter_bloc|package:bloc" → synapse-frontend/lib 하위 0건
  ```
- **current_text** (3개 위치 동시):
  ```
  (선택 이유, L269) Dart 3.0의 Records와 Pattern Matching은 BLoC 상태 모델링에 직접적으로 유용하다.
  (사용 위치, L298) syn/lib/features/*/bloc/ — BLoC 이벤트/상태 정의
  (트러블슈팅, L349) Stream 메모리 누수 ... BLoC의 close() 메서드에서 subscription.cancel()
  ```
- **proposed_text**:
  ```
  (선택 이유) Dart 3.0의 Records와 Pattern Matching은 Riverpod Notifier의 상태 모델링·`AsyncValue` 패턴 매칭에 직접적으로 유용하다.
  (사용 위치) S1-F23의 proposed_text가 동시에 해결 (`providers/` 디렉토리)
  (트러블슈팅 Stream 행) ... Riverpod Notifier의 dispose 콜백 또는 ref.onDispose 안에서 subscription.cancel()
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L269, L349 (사용 위치는 S1-F23과 결합)
- **deep_dive**: false

### S1-F25 · analyzer.strong-mode.implicit-casts/implicit-dynamic는 Dart 3에서 폐기 · E1 / P0

- **section**: §2.2 Dart 3.x
- **evidence_official**:
  ```
  dart.dev/resources/dart-3-migration, dart.dev/tools/analysis:
  "The options implicit-casts and implicit-dynamic under strong-mode are no
  longer supported. Replace with strict-casts and strict-raw-types under language."
  ```
- **evidence_repo**:
  ```
  synapse-frontend/analysis_options.yaml L26-L30:
    analyzer:
      language:
        strict-casts: true
        strict-inference: true
        strict-raw-types: true
  (실 코드는 이미 신규 language 옵션 사용 중)
  ```
- **current_text**:
  ```yaml
  analyzer:
    strong-mode:
      implicit-casts: false
      implicit-dynamic: false
    errors:
      missing_required_param: error
      missing_return: error
      todo: warning
  ```
- **proposed_text**:
  ```yaml
  analyzer:
    language:
      strict-casts: true
      strict-inference: true
      strict-raw-types: true
    errors:
      missing_required_param: error
      missing_return: error
      todo: warning
    exclude:
      - "**/*.g.dart"
      - "**/*.freezed.dart"
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L306-L313
- **deep_dive**: false

### S1-F26 · `flutter pub run build_runner` 구식 — `dart run build_runner` 권장 · E2 / P1

- **section**: §2.2 Dart 3.x
- **evidence_official**:
  ```
  dart.dev/tools/build_runner: "dart run build_runner build"
  dart.dev/blog/dart-2-16: "pub command is deprecated, dart pub or flutter pub recommended"
  공식 build_runner 문서는 `dart run` 만 예시
  ```
- **current_text**:
  ```
  | freezed 코드 생성 실패 | build_runner 캐시 오염 | flutter pub run build_runner clean && build_runner build |
  ```
- **proposed_text**:
  ```
  | freezed 코드 생성 실패 | build_runner 캐시 오염 | `dart run build_runner clean && dart run build_runner build --delete-conflicting-outputs` |
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L348
- **deep_dive**: false

### S1-F27 · 'Freezed 생성' 언급이 실 코드와 불일치 — 프로젝트는 codegen 미사용 · E1 / P1

- **section**: §2.2 Dart 3.x
- **evidence_repo**:
  ```
  synapse-frontend/CLAUDE.md L19-L20: Riverpod manual providers (codegen 사용 안 함)
  Grep "freezed|@freezed" in synapse-frontend/lib → 0건
  pubspec.yaml에 freezed/build_runner 의존성 없음
  ```
- **current_text** + **proposed_text**: S1-F23의 proposed_text가 동시 해결 (`syn/lib/core/models/` → `synapse-frontend/lib/services/<...>/domain/`, Freezed 표기 제거)
- **patch_target**: S1-F23과 결합
- **deep_dive**: false

### S1-F28 · 버전 표기 격차 — 18 헤더 'Dart 3.8+' / §2.2 'Dart 3.x' / 실 pubspec '>=3.11.0 <4.0.0' · E2 / P1

- **section**: §2.2 Dart 3.x
- **evidence_repo**:
  ```
  synapse-frontend/pubspec.yaml L6-L7: environment: sdk: '>=3.11.0 <4.0.0'
  18 §7/§12.2 헤더: "Flutter 3.41.x / Dart 3.8+"
  §2.2 L260 제목: "Dart 3.x"
  §2.1 Flutter pubspec 예시: ">=3.0.0 <4.0.0"
  → 네 곳이 모두 다른 SDK 하한선 시사
  ```
- **current_text**:
  ```
  ### 2.2 Dart 3.x  (L260)
  ```
- **proposed_text**:
  ```
  ### 2.2 Dart 3.8+ (실 빌드 SDK: >=3.11.0 <4.0.0)
  ```
  + (§2.1·§12.2와의 일관성 정정은 S2/별도 작업으로 위임)
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L260
- **deep_dive**: false

### S1-F29 · typedef positional record 시맨틱 — 필드명은 문서용일 뿐 · E2 / P2

- **section**: §2.2 Dart 3.x
- **evidence_official**:
  ```
  dart.dev/language/records:
  "Naming positional fields in a record type annotation is for documentation only
  and does not affect the record's type compatibility."
  "Positional fields use $<position> notation, while named fields use their names."
  ```
- **current_text**:
  ```dart
  typedef ReviewOutcome = (CardId id, int newInterval, double easeFactor);
  ```
- **proposed_text**:
  ```dart
  // 옵션 A (권장 — 이름으로 접근): named record 사용
  typedef ReviewOutcome = ({CardId id, int newInterval, double easeFactor});
  // 호출부에서 result.id / result.newInterval / result.easeFactor 접근 가능

  // 옵션 B (위치 기반): positional record — 필드명은 문서용 주석에 불과
  // typedef ReviewOutcome = (CardId, int, double);
  // 호출부에서 result.$1 / result.$2 / result.$3 접근
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L330
- **deep_dive**: false

### S1-F30 · Isolate.run 도입 버전·권장 사용 보강 · R / P2

- **section**: §2.2 Dart 3.x
- **evidence_official**:
  ```
  dart.dev/language/concurrency, /blog/better-isolate-management-with-isolate-run:
  Isolate.run() function, introduced in Dart 2.19, simplifies concurrency.
  Recommended for most cases over spawn. Available since Dart 2.19 and Flutter 3.7.
  ```
- **current_text**:
  ```
  - Isolate 기반 동시성: 메모리 공유 없는 안전한 멀티스레딩
  ```
- **proposed_text**:
  ```
  - Isolate 기반 동시성: 메모리 공유 없는 안전한 멀티스레딩. 단발성 백그라운드 연산에는 Dart 2.19+에서 도입된 `Isolate.run()`을 권장 (수기 `Isolate.spawn` + `SendPort` 셋업 불필요).
  ```
- **patch_target**: `documents.wiki/18_기술_스택_정의서.md` L284
- **deep_dive**: false

### OK 항목 통합 표

| finding_id | section | 한 줄 사유 | 증거 |
|-----------|---------|----------|------|
| S1-F10 | §4.1.1 Java 21 | Java 21 toolchain 6개 레포 일관 | build.gradle.kts × 6 모두 `JavaLanguageVersion.of(21)` |
| S1-F11 | §4.1.1 Java 21 | Record DTO 광범위 채택 | synapse-knowledge-svc/src/main/java 하위 `public record` 10건+ |
| S1-F21 | §4.2.1 Python 3.12 | Dockerfile python:3.12-slim 일치 | learning-ai/Dockerfile L2,L12 |
| S1-F22 | §4.2.1 Python 3.12 | app/services + mypy strict 일치 | pyproject.toml L45-L47, app/services/ 디렉토리 실재 |

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

| finding_id | 절 | Deep Dive 제목 | 핵심 요지(1줄) |
|-----------|-----|-------------|-------------|
| S1-F09 | §4.1.1 Java 21 | "Virtual Threads 운영 가이드" | Pin 트리거·추적·풀 크기·ThreadLocal·Spring 통합·운영 함정 |
| S1-F20 | §4.2.1 Python 3.12 | "Python 3.12 vs 3.13 채택 근거" | EOL·status·ML 휠 가용성 + 3.11/3.13 비교 |

(§2.2 Dart는 본 세션에서 Deep Dive 보강 항목 없음 — S1-F30이 R이지만 1~2줄 본문 보강으로 충분)

## 7. 위키 패치 diff 요약

위키 커밋: `documents.wiki@6f042fc` (master)
파일: `18_기술_스택_정의서.md` (5498 → 5560줄, +132 / -62)

| Finding | 클래스 | 위치 | 변경 유형 |
|---------|-------|--------|---------|
| S1-F01 ~ F02 | E1 | §4.1.1 기술적 이점 (Virtual Threads + JEP 표) | 표 5행 → 6행 (M:N 정정 + JEP 440 추가) |
| S1-F03 + F07 | E1 + E2 | §4.1.1 설정 가이드 (application.yml) | 코드 펜스 java→yaml + 주석 #로 + 주의 박스 추가 |
| S1-F04 | D | §4.1.1 설정 가이드 (Dockerfile) | alpine 단일 스테이지 → jammy 멀티스테이지 + 운영 합의 박스 |
| S1-F05 | D | §4.1.1 프로젝트 내 사용 위치 | 3행 → 4행 (synapse-gateway/, Modulith 패키지, learning-card domain/) |
| S1-F06 | D | §4.1.1 선택 이유 (LTS 기간) | Premier만 표기 → Premier(2028.09) + Extended(2031.09) |
| S1-F08 | E2 | §4.1.1 설정 가이드 (Pattern Matching) | sealed interface + record 선언 3줄 추가 |
| S1-F09 | R | §4.1.1 트러블슈팅과 참고 자료 사이 | "더 깊이 / Deep Dive — Virtual Threads 운영 가이드" 13줄 삽입 |
| S1-F12 + F13 + F14 + F15 | E1×3 + E2 | §4.2.1 설정 가이드 (pyproject.toml) | Poetry 블록 25줄 → pip PEP 621 블록 30줄 (Anthropic 추가·LangChain 제거·버전 핀 정렬) |
| S1-F13 | E1 | §4.2.1 역할 / 선택 이유 / 사용 위치 | 3개 문단에서 LangChain 언급 제거 + Anthropic 추가 |
| S1-F16 | E2 | §4.2.1 기술적 이점 (성능 수치) | 1줄 → 1줄 (asyncio 75% 등 상세) |
| S1-F17 + F18 | E2 × 2 | §4.2.1 기술적 이점 (PEP) | PEP 695 표기 정정 + PEP 701/669/692 3행 추가 |
| S1-F19 | E2 | §4.2.1 핵심 기능 (asyncio) | TaskGroup/timeout 컨텍스트 매니저 명시 |
| S1-F20 | R | §4.2.1 트러블슈팅과 참고 자료 사이 | "더 깊이 / Deep Dive — Python 3.12 vs 3.13 채택 근거" 9줄 삽입 + 참고 자료 3개 URL 추가 |
| S1-F23 + F24 + F27 | E1 × 3 | §2.2 프로젝트 내 사용 위치 + 선택 이유 + 트러블슈팅 | syn/→synapse-frontend/, BLoC→Riverpod, Freezed 제거 |
| S1-F25 | E1 | §2.2 설정 가이드 (analysis_options.yaml) | strong-mode 블록 4줄 → language 블록 + exclude 패턴 |
| S1-F26 | E2 | §2.2 트러블슈팅 (build_runner) | `flutter pub run` → `dart run --delete-conflicting-outputs` |
| S1-F28 | E2 | §2.2 제목 | "Dart 3.x" → "Dart 3.8+ (실 빌드 SDK: >=3.11.0 <4.0.0)" |
| S1-F29 | E2 | §2.2 설정 가이드 (typedef record) | positional → named record 권장 + 위치 옵션 주석 |
| S1-F30 | R | §2.2 기술적 이점 (Isolate) | Isolate.run 도입 버전·권장 1줄 보강 |
| (§11) | - | §11 변경 이력 마지막 행 | v2.3-S1 행 신규 추가 |

커밋 메시지 본문:
```
docs(stack): S1 언어 — context7·repo 검증 반영 + 보강

E1:9 · E2:10 · D:4 · R:3 · OK:4
P0:6 · P1:11 · P2:13

§4.1.1 Java 21 / §4.2.1 Python 3.12 / §2.2 Dart 3.x
...
Refs: documents PR #<TBD>
```

## 8. 후속 과제 (Follow-ups)

### 위임 항목 (다른 세션 영역)

- **(S2 위임)** §4.1.2 Spring Boot 4 절에 §4.1.1 Java 21의 "Virtual Threads 자동 활성화" 오기와 동일한 표현이 있을 가능성 — Java 검증 subagent가 발견. S2 프레임워크 세션에서 §4.1.2 검증 시 함께 정정.
- **(S2 위임)** §2.4 google_fonts·§2.5 CanvasKit 절 번호 충돌 — 마스터 스펙 §2에서 사전 발견된 결함. S2 첫 발견사항으로 인덱스에 이미 예약.
- **(S2 위임)** §2.1 Flutter pubspec 예시의 환경 제약 `>=3.0.0 <4.0.0`이 실 SDK `>=3.11.0 <4.0.0`과 불일치 — S2 Frontend 검증 시 정정.
- **(S2 위임)** §2.3 Riverpod 절·기타 §2.x 절에서 'syn/' 경로 표기 출현 여부 — S2 Frontend 검증 시 grep으로 일괄 점검.
- **(별도 작업)** 18 문서 §1.4 기술 스택 전체 목록 표·§10.1 요약표 — 본 세션 변경(특히 LangChain 제거·Anthropic 추가)이 §1.4/§10.1에 반영 필요. 6 세션 종료 후 v2.3 통합 정리 단계(마스터 스펙 §6.4)에서 처리.

### 실 코드 변경 후보 (위키 정정 외)

- **(별도 결정)** §4.1.1 §4.1.2가 Virtual Threads "사용 중"으로 명시하나 실 코드는 미설정. 다음 둘 중 결정 필요:
  - (a) 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가하고 위키 표현 유지
  - (b) 위키 표현을 "도입 예정"으로 톤다운
  - 본 세션에서는 (b)를 적용해 위키만 정정. (a)는 별도 PR로 분리 권장.

### 운영 표준 예외 기록

- 위키에 추가로 1 커밋(§11 PR 번호 기입). 운영 표준의 의도된 예외.

### 메모리 갱신 후보

- Python 절의 LangChain → 직접 SDK(OpenAI/Anthropic) 채택 사실은 S6 AI/ML 세션에서도 영향이 큼. S6 시작 전 별도 메모리 후보 (`python-ai-stack-direct-sdk`) 작성 검토.
