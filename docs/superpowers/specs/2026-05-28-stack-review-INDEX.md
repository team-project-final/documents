# 18 기술 스택 정의서 — 카테고리 검증 진행판

작성일: 2026-05-28
마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2 → v2.3 (예정)

## 세션 진척

| 세션 | 카테고리 | 상태 | 보고서 PR | 위키 커밋 | E1/E2/D/R/OK | P0/P1/P2 | 시작일 | 종료일 |
|------|---------|------|---------|---------|-------------|---------|--------|--------|
| S1 | 언어 | completed | [#6](https://github.com/team-project-final/documents/pull/6) | documents.wiki@6f042fc | 9/10/4/3/4 | 6/11/13 | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 (S2a 백엔드) | completed | [#7](https://github.com/team-project-final/documents/pull/7) | documents.wiki@493a7ba | 8/8/5/6/10 | 5/6/16 | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 (S2b 프론트) | pending | - | - | - | - | - | - |
| S3 | 데이터 | pending | - | - | - | - | - | - |
| S4 | 이벤트 | pending | - | - | - | - | - | - |
| S5 | 운영 | pending | - | - | - | - | - | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 15 / 약 45
  - S1 (언어): Java 21, Python 3.12, Dart 3.x
  - S2a (백엔드 프레임워크): SCG 5, Boot 4, Security 7, JPA+Hibernate 7, Flyway 11, WebFlux, Testcontainers, Modulith 2.0, FastAPI, uvicorn, LangChain→Direct SDK, httpx
- E1: 17 · E2: 18 · D: 9 · R: 9 · OK: 14
- P0: 11 · P1: 17 · P2: 29
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 0 (S2b 영역 §2.4·§2.5 충돌은 마스터 스펙 §2에서 사전 발견됨, S2b 첫 발견사항으로 예약)

## 세션 간 발생한 교차 발견사항

### S1 → S2a 처리 완료
- ✅ **§4.1.2 Spring Boot 4 "Virtual Threads 자동 활성화" 오기** — S2a-F01/F02로 정정 (S1-F03 동일 패턴)
- ✅ **§1.4 표 LangChain 행** — S2a-F28로 정정 (OpenAI/Anthropic SDK 2행으로 교체)
- ✅ **§12.3 Python AI 버전 매핑·§12.5 충돌 표** — S2a에서 cross-section 정정 완료

### S1+S2a → S2b 위임 (S2b 첫 발견사항으로 예약)
- **§2.4 google_fonts·§2.5 CanvasKit 절 번호 충돌** (마스터 스펙에서 사전 예약)
- **§2.1 Flutter pubspec 환경 제약** `>=3.0.0 <4.0.0` ≠ 실 SDK `>=3.11.0 <4.0.0`
- **§2.3 Riverpod 절·기타 §2.x 절에서 `syn/` 경로 표기 잔존 가능성** — grep 일괄 점검 필요

### S2a → S5 위임
- **§3.1 Gateway JWT 미구현** + **CircuitBreaker 미설정** — 보안·복원력 모델 갭. `deploy-mirror-standardization`와 함께 운영 세션에서

### S2a → S6 위임
- **§6 RAG 절들(§6.1 Anthropic·§6.2 OpenAI·§6.3 RAG·§6.4 Semantic Cache)의 LangChain 잔존 언급** — S6 AI/ML 세션에서 일괄 정정. S2a §4.2.4 "Direct SDK" 패턴과 일관성 유지

## 후속 과제 큐 (Follow-ups)

### 별도 코드 PR (위키 정정과 분리, 실 코드 수정 필요)
- **(P0)** `synapse-engagement-svc/build.gradle.kts:40-41` Testcontainers 좌표 수정 → `org.testcontainers:junit-jupiter:1.21.4` / `:postgresql:1.21.4` (현재 빌드 실패 위험)
- **(P1)** `synapse-learning-svc/learning-card/build.gradle.kts:81` Spring Modulith `1.3.0` → `2.0.6` (Boot 4 ABI 호환)
- **(P2)** Spring Boot 패치 라인 정합 (gateway 4.0.6 ↔ 나머지 4.0.0 → 모두 4.0.6)
- **(P2)** Spring Modulith 패치 라인 정합 (engagement 2.0.5 → 2.0.6)
- **(별도 결정)** 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부 — 본 세션들은 위키 표현 톤다운만 적용

### 별도 작업 (v2.3 통합 정리, 6 세션 종료 후)
- **§10.1 요약표** S1+S2a 변경 반영
- **§4.2.4 → "Direct SDK" 재작성**이 §1.4 본문·§10.1 매트릭스와 일관 여부 재확인

### 운영 표준 예외 기록
- S1·S2a 각각 위키에 추가 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 "세션당 단일 커밋"의 의도된 예외. S2b·S3·S4·S5·S6도 동일 패턴.

## 메모리 갱신 후보
- ✅ **`python-ai-stack-direct-sdk`** — S1 종료 시 생성됨. S2a §4.2.4 재작성과 §12.3/§12.5 cross-section 정정에 활용됨.
- (검토) **`spring-modulith-outbox-coexistence`** — Modulith Event Publication Registry와 Outbox 패턴 공존 규칙이 S2a §4.1.8 Deep Dive로 정착. S4 이벤트 세션에서 검증 후 별도 메모리화 검토.
