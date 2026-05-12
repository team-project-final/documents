# 코드 Rule북 설계서

> **작성일**: 2026-05-12
> **상태**: Approved
> **목적**: Synapse 프로젝트의 코드 작성 규칙을 참조 레포(`VelkaressiaBlutkrone/spring-react-flutter-sns-mng` doc/rules) 구조를 기반으로 Synapse 스택에 맞게 구성
> **참조**: [참조 레포 doc/rules](https://github.com/VelkaressiaBlutkrone/spring-react-flutter-sns-mng/tree/main/doc/rules)

---

## 1. 개요

### 1.1 목적

Synapse 프로젝트 전체 코드베이스에 적용되는 규칙북. 7명 팀원이 일관된 품질로 코드를 작성하고 리뷰할 수 있도록 한다.

### 1.2 범위

- **적용 대상**: synapse-platform-svc, synapse-engagement-svc, synapse-knowledge-svc, synapse-learning-svc, synapse-frontend, synapse-shared, synapse-gitops
- **적용 기간**: 2026-05-12 ~ 2026-06-15 (5주)
- **적용 인원**: 7명 전원

### 1.3 형태

- **저장 위치**: `docs/rules/` (documents 레포 중앙 관리)
- **배포**: 각 서비스 레포 `docs/rules/`에 해당 트랙 관련 파일 배포
- **톤**: 반말 캐주얼체
- **준수 레벨**: `[MUST]` / `[SHOULD]` / `[MAY]` 3단계
  - `[MUST]`: 위반 시 PR 머지 금지
  - `[SHOULD]`: 코드 리뷰에서 지적, 합리적 사유 시 예외 가능
  - `[MAY]`: 권장, 미준수해도 무방

### 1.4 구조 원칙

참조 레포의 14챕터 + 부록 3개 구조를 유지하되:
- React/JavaScript 챕터 삭제 (07-platform-react.md, 08-javascript.md)
- Kafka/Avro 이벤트 챕터 신규 추가 (08-kafka-event.md)
- 각 챕터 내용을 Synapse 스택(Spring Boot 4 + Modulith, Flutter 3, FastAPI, Kafka, EKS)에 맞게 작성

---

## 2. 파일 구조

```
docs/rules/
├── 01-security.md              보안
├── 02-function.md              기능 설계
├── 03-technical.md             기술 구현
├── 04-quality.md               품질
├── 05-operation.md             운영
├── 06-auth-token.md            인증/토큰
├── 07-platform.md              플랫폼 공통
├── 07-platform-spring.md       Spring Boot 4 + Modulith
├── 07-platform-flutter.md      Flutter 3 + Riverpod
├── 08-kafka-event.md           Kafka + Avro + Schema Registry
├── 09-observability.md         관측성
├── 10-container-k8s.md         컨테이너 + K8s
├── 11-data-sovereignty.md      데이터 주권
├── 12-working-log.md           작업 로그
├── 13-python-llm.md            Python + LLM
├── 14-task-structure.md        Task 문서 구조
├── appendix-a-asvs.md          부록 A: ASVS 매핑
├── appendix-b-owasp.md         부록 B: OWASP Top 10 2025
└── appendix-c-checklist.md     부록 C: 준수 체크리스트
```

총 19개 파일.

---

## 3. 서비스 레포별 배포 매핑

각 서비스 레포에는 해당 트랙에 관련된 파일만 배포한다.

### 공통 (모든 서비스 레포)

```
01-security.md, 02-function.md, 03-technical.md, 04-quality.md,
05-operation.md, 06-auth-token.md, 07-platform.md, 09-observability.md,
11-data-sovereignty.md, 12-working-log.md, 14-task-structure.md,
appendix-a-asvs.md, appendix-b-owasp.md, appendix-c-checklist.md
```

### 트랙별 추가

| 레포 | 추가 파일 |
|------|----------|
| synapse-platform-svc | 07-platform-spring.md, 08-kafka-event.md, 10-container-k8s.md |
| synapse-engagement-svc | 07-platform-spring.md, 08-kafka-event.md, 10-container-k8s.md |
| synapse-knowledge-svc | 07-platform-spring.md, 08-kafka-event.md, 10-container-k8s.md |
| synapse-learning-svc | 07-platform-spring.md, 07-platform-flutter.md, 08-kafka-event.md, 10-container-k8s.md, 13-python-llm.md |
| synapse-frontend | 07-platform-flutter.md |
| synapse-shared | 08-kafka-event.md |
| synapse-gitops | 10-container-k8s.md |

---

## 4. 챕터별 상세 설계

### 4.1 — 01-security.md (보안)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 1.1 | Secrets 관리 | `[MUST]` | `.env`/`*.key`/`*.pem` 커밋 금지. GitHub fine-grained PAT만 허용. MIRROR_TOKEN/GITOPS_TOKEN 90일 로테이션 |
| 1.1.1 | Secrets Rotation 정책 | `[MUST]` | DB 비밀번호 30~90일, API 키 90일, JWT 서명키 90~180일. Grace Period 최소 1~24시간 |
| 1.2 | 접근 제어 | `[MUST]` | IDOR 방지 — 노트/카드/덱은 반드시 `userId == currentUser` 체크. 401(미인증) vs 403(권한 없음) 명확 구분 |
| 1.3 | CORS | `[MUST]` | whitelist 방식, `*` 금지. dev에서만 localhost 허용 |
| 1.4 | 입력 검증 | `[SHOULD]` | 마크다운 본문 XSS 필터링, SQL Injection 방지 (JPA 파라미터 바인딩), Avro 스키마 검증 |
| 1.5 | OWASP 2025 매핑 | — | A01(접근 제어), A06(안전하지 않은 설계), A10(예외 처리) 항목별 Synapse 대응 |

### 4.2 — 02-function.md (기능 설계)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 2.1 | API 설계 | `[MUST]` | RESTful, `kebab-case` URI, 3~4단계 depth, `/api/v1/` prefix |
| 2.2 | 페이지네이션 | `[SHOULD]` | 커서 기반 기본, offset은 관리자 API만 |
| 2.3 | 에러 응답 | `[MUST]` | RFC 7807 Problem Details 형식. 서비스별 에러 코드 (PLAT-001, ENGM-001, KNOW-001, LRNG-001) |
| 2.4 | Soft Delete | `[MUST]` | 사용자 데이터 soft delete 필수 (`deleted_at` 컬럼). 시스템 데이터는 물리 삭제 가능 |
| 2.5 | DIP·OCP | `[MUST]` | 모듈 간 의존은 인터페이스만. 구현체 직접 참조 금지 |

### 4.3 — 03-technical.md (기술 구현)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 3.1 | 메서드 크기 | `[SHOULD]` | 30~40줄 권장, 초과 시 분리 |
| 3.2 | N+1 방지 | `[MUST]` | `fetchJoin()` 또는 `@EntityGraph` 필수. 코드 예시 포함 |
| 3.3 | 트랜잭션 | `[MUST]` | 읽기: `@Transactional(readOnly=true)`, 쓰기: 전파 레벨 명시. 서비스 계층에서만 선언 |
| 3.4 | AOP | `[MUST]` | cross-cutting concern만 (로깅, 감사, 인증). 비즈니스 로직 AOP 적용 절대 금지 |
| 3.5 | Modulith 경계 | `[MUST]` | `@ApplicationModule(allowedDependencies={"shared"})`. shared만 공통 의존 허용. 순환 의존 금지 |
| 3.6 | 예외 처리 | `[SHOULD]` | 도메인별 커스텀 예외 계층. catch 후 로깅 없이 재throw 금지 |

### 4.4 — 04-quality.md (품질)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 4.1 | 테스트 구조 | `[MUST]` | Given-When-Then 패턴. BDD 네이밍: `메서드명_상황_should기대결과` |
| 4.2 | 커버리지 | `[SHOULD]`/`[MAY]` | line 70% `[SHOULD]`, branch 60% `[MAY]` |
| 4.3 | 코드 리뷰 | `[SHOULD]` | PR 400줄 이하, 24시간 이내 리뷰, 48시간 이내 머지 |
| 4.4 | 정적 분석 | `[MUST]` | Spring: Checkstyle + SpotBugs, Flutter: `flutter analyze` 경고 0건, Python: ruff + mypy |
| 4.5 | 테스트 종류 | — | Unit (모듈 내), Integration (모듈 간 / DB), E2E (API 시나리오). 각각 예시 포함 |

### 4.5 — 05-operation.md (운영)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 5.1 | 배포 전략 | `[MUST]` | GitOps 단일 경로 (ArgoCD). dev=autoSync, staging/prod=수동 승인 |
| 5.2 | 롤백 | `[MUST]` | 이전 이미지 태그 복원. 60초 이내 이상 징후 판단 기준 |
| 5.3 | Health Check | `[MUST]` | Spring: `/actuator/health/liveness` + `/readiness`. FastAPI: `/health` + `/health/ready` |
| 5.4 | 장애 대응 | `[SHOULD]` | 장애 발생 → 슬랙/카톡 공유 → 원인 격리 → 롤백 또는 핫픽스 |

### 4.6 — 06-auth-token.md (인증/토큰)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 6.1 | JWT | `[MUST]` | Access 15분, Refresh 7일. RSA-256 서명, kid 헤더 필수 |
| 6.2 | OAuth | `[MUST]` | Google + GitHub 소셜 로그인. PKCE flow `[SHOULD]` |
| 6.3 | MFA | `[SHOULD]` | TOTP 6자리 30초, 복구 코드 10개 |
| 6.4 | 세션/블랙리스트 | `[MUST]` | Redis 기반 토큰 블랙리스트. 로그아웃 시 즉시 무효화 |

### 4.7 — 07-platform.md (플랫폼 공통)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 7.0.1 | 의존 방향 | `[MUST]` | `shared ← 각 도메인 모듈`. 역방향 금지 |
| 7.0.2 | 환경 설정 | `[MUST]` | `application-{profile}.yml` 분리 (local/dev/staging/prod) |
| 7.0.3 | 같은 레포 공유 | `[MUST]` | C-1/C-2, D-1/D-2 모듈 경계 침범 금지. `allowedDependencies`로 강제 |

### 4.8 — 07-platform-spring.md (Spring Boot 4 + Modulith)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 7.1.1 | Modulith | `[MUST]` | `@ApplicationModule` 필수, `ApplicationModules.verify()` CI 통과 |
| 7.1.2 | DTO | `[SHOULD]` | Java Record 사용, 불변 보장 |
| 7.1.3 | Entity | `[MUST]` | `@Getter`만 허용, `@Setter` 금지. 변경은 도메인 메서드로 |
| 7.1.4 | 예외 핸들러 | `[MUST]` | `@RestControllerAdvice` 단일. 도메인별 커스텀 예외 계층 |
| 7.1.5 | Gradle | `[SHOULD]` | 빌드 30초 이내, `--no-daemon` CI 모드 |

### 4.9 — 07-platform-flutter.md (Flutter 3 + Riverpod)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 7.3.1 | 상태 관리 | `[MUST]` | Riverpod 3 + code generation. `setState()` 금지 |
| 7.3.2 | 라우팅 | `[SHOULD]` | GoRouter 14, 딥링크 지원 |
| 7.3.3 | 디렉토리 | `[MUST]` | Feature-first: `lib/features/{name}/presentation/` |
| 7.3.4 | 디자인 토큰 | `[MUST]` | `AppColors`, `AppSpacing` 상수 클래스 사용, 하드코딩 금지 |
| 7.3.5 | 분석 | `[MUST]` | `flutter analyze` 경고 0건, `analysis_options.yaml` 엄격 모드 |

### 4.10 — 08-kafka-event.md (Kafka + Avro + Schema Registry) ★ NEW

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 8.1 | 토픽 네이밍 | `[MUST]` | `{서비스}.{도메인}.{이벤트}-v{N}` (예: `platform.auth.user-registered-v1`) |
| 8.2 | CloudEvents 1.0 | `[MUST]` | 필수 필드: specversion, id, source, type, time, tenantid |
| 8.3 | Avro 스키마 | `[MUST]` | namespace `com.synapse.event.{도메인}`, 모든 필드에 default 값 |
| 8.4 | 호환성 | `[MUST]` | BACKWARD 기본, knowledge 도메인은 BACKWARD_TRANSITIVE |
| 8.5 | 금지 사항 | `[MUST]` | NONE 모드, 필드 이름 변경, default 없는 필드 추가, enum 값 제거, 필수 필드 삭제 |
| 8.6 | Consumer | `[MUST]` | 멱등 처리, 최소 1회 전달 가정 |
| 8.7 | DLQ | `[SHOULD]` | Dead Letter Queue 설정, 3회 재시도 후 DLQ 전송 |

### 4.11 — 09-observability.md (관측성)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 9.1 | 로깅 | `[SHOULD]` | 구조화 JSON 로그, traceId/spanId 자동 주입 |
| 9.2 | 메트릭 | `[SHOULD]` | Actuator + Micrometer, 비즈니스 메트릭 (카드 복습 수, 노트 생성 수) |
| 9.3 | 트레이싱 | `[SHOULD]` | OpenTelemetry, Kafka consumer 체인까지 전파 |

### 4.12 — 10-container-k8s.md (컨테이너 + K8s)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 10.1 | Dockerfile | `[MUST]` | multi-stage build, non-root 실행, `.dockerignore` 필수 |
| 10.2 | 이미지 태그 | `[MUST]` | git SHA 사용, `latest` 금지 |
| 10.3 | Kustomize | `[MUST]` | base/overlay 분리, 환경별 `kustomization.yaml` |
| 10.4 | ArgoCD | `[MUST]` | dev=autoSync, staging/prod=수동 승인 |
| 10.5 | 리소스 | `[MUST]` | requests/limits 명시, OOM 방지 |

### 4.13 — 11-data-sovereignty.md (데이터 주권)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 11.1 | 개인정보 | `[MUST]`/`[SHOULD]` | 비밀번호 bcrypt `[MUST]`, 이메일/이름 AES-256 `[SHOULD]` |
| 11.2 | 데이터 보존 | `[SHOULD]` | soft delete 후 90일 보관, 이후 익명화 |
| 11.3 | 로그 마스킹 | `[MUST]` | 개인정보 필드 자동 마스킹 |

### 4.14 — 12-working-log.md (작업 로그)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 12.1 | 커밋 | `[MUST]` | Conventional Commits 형식. 본문에 "왜" 포함 `[SHOULD]` |
| 12.2 | PR | `[MUST]` | `## 변경 사항` + `## 테스트 결과` 필수, 400줄 이하 `[SHOULD]` |
| 12.3 | HISTORY | `[MUST]` | 매일 퇴근 전 갱신. 3줄: 한 일 / 이슈 / 내일 계획 |

### 4.15 — 13-python-llm.md (Python + LLM)

| 절 | 제목 | 레벨 | 핵심 내용 |
|----|------|------|----------|
| 13.1 | FastAPI | `[MUST]` | Pydantic v2, async 엔드포인트 |
| 13.2 | LLM 호출 | `[MUST]` | timeout 30초, retry 3회 + exponential backoff |
| 13.3 | 프롬프트 | `[SHOULD]` | 시스템/유저 분리, 파일 기반 버전 관리 |
| 13.4 | 비용 제어 | `[MUST]`/`[SHOULD]` | 토큰 사용량 로깅 `[MUST]`, 일일 한도 `[SHOULD]` |
| 13.5 | 테스트 | `[MUST]` | LLM 응답 mock (CI에서 실제 API 호출 금지) |

### 4.16 — 14-task-structure.md (Task 문서 구조)

기존 README §6~§7 내용을 Rule 형식으로 재구성:
- 10필드 강제 `[MUST]`
- Step Goal 측정 가능 문장 형식 `[MUST]`
- Done When 배치 규칙 `[MUST]`
- 10단계 개발 워크플로 `[SHOULD]`

### 4.17 — 부록

- **appendix-a-asvs.md**: ASVS 4.0 항목 중 Synapse 해당 항목만 매핑
- **appendix-b-owasp.md**: OWASP Top 10 2025 요약 + 각 항목의 Synapse 대응 (01-security.md §1.5와 연동)
- **appendix-c-checklist.md**: 전체 `[MUST]` 규칙을 체크박스 형태로 나열. PR 셀프체크 용도

---

## 5. 각 파일의 공통 포맷

```markdown
# {N}. {카테고리} RULE — {부제}

> **참조**: [전체 Rule 목록](../rules/) | [준수 체크리스트](appendix-c-checklist.md)
> **적용 대상**: {해당 서비스/스택}
> **준수 레벨**: [MUST] 위반 시 PR 머지 금지 / [SHOULD] 리뷰 지적 / [MAY] 권장

---

## {N}.1 {절 제목} [{레벨}]

{규칙 설명}

✅ Good:
```{lang}
// 좋은 예시 코드
```

❌ Bad:
```{lang}
// 나쁜 예시 코드
```

> **이유**: {왜 이 규칙이 필요한지 1~2줄}
```

---

## 6. 참조 데이터 출처

| 챕터 | 주요 출처 |
|------|----------|
| 01 Security | 참조 레포 01-security.md + OWASP 2025 |
| 02 Function | 참조 레포 02-function.md |
| 03 Technical | 참조 레포 03-technical.md |
| 04 Quality | 참조 레포 04-quality.md |
| 05 Operation | 참조 레포 05-operation.md + Synapse GitOps 구조 |
| 06 Auth/Token | 참조 레포 06-auth-token.md + Synapse PRD FR-PL-001~004 |
| 07 Platform | 참조 레포 07-platform*.md |
| 08 Kafka/Event | 신규 — Synapse 부트스트랩 설계서 §5, shared-avro.sh, SCHEMA_EVOLUTION.md |
| 09 Observability | 참조 레포 09-observability.md |
| 10 Container/K8s | 참조 레포 10-container-k8s.md + Synapse gitops-manifests.sh |
| 11 Data Sovereignty | 참조 레포 11-data-sovereignty.md |
| 12 Working Log | 참조 레포 12-working-log.md + Synapse KICKOFF.md §7 |
| 13 Python/LLM | 참조 레포 13-python-llm.md + Synapse learning-ai-fastapi.sh |
| 14 Task Structure | 참조 레포 14-task-structure.md + Synapse README §6~§7 |
| 부록 | 참조 레포 appendix-a/b/c |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| v1.0 | 2026-05-12 | Synapse Team | 초안. 참조 레포 구조 기반 16챕터 + 부록 3개, React/JS 삭제 + Kafka/Avro 추가. |
