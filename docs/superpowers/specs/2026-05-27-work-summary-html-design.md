# 레포별 작업 내용 안내 HTML 문서 — 설계 문서

- 작성일: 2026-05-27
- 산출물: `docs/work-summary.html` (단일 자체완결 HTML)
- 대상 독자: **비개발자도 이해 가능** (팀원·기획·PM 등). 개발자는 접이식 상세로 보강.

## 1. 목적

이번 세션에 4개 `*-svc` 레포에 수행한 작업을, **레포별 탭으로 분류**하여 **최대한 쉬운 말**로 설명하는 단일 HTML 문서를 만든다. 문서화 대상 작업:
1. **application.yml 공통 표준화** — 4개 서비스의 설정을 동일한 4-프로파일(base/dev/prod/test) 구조·공통 규칙으로 통일, JWT를 `synapse.jwt.*`로 통일, 포트맵, 보안 계층(engagement/learning).
2. **CI를 dev 테스트 환경과 통일** — CI가 dev 대상 PR에서 실행되게 하고, 실제 서비스를 띄워 dev 프로파일로 부팅·헬스체크하는 `dev-smoke` 추가.
3. 위 과정에서 dev-smoke로 **발견·수정한 잠복 버그** (flyway 미실행, JWT 키 손상, pgvector, ES 호환성 등).

## 2. 형식 & 제약

- **단일 HTML 파일**: 인라인 CSS/JS, 외부 의존성·CDN·인터넷 불필요. 더블클릭으로 즉시 열림.
- 한국어. 반응형(모바일에서도 가독). 인쇄/PDF 무난.
- 저장 위치: `docs/work-summary.html`.
- 사실 기반: 이 세션의 스펙/플랜 문서, 각 레포 `chore/standardize-application-yml` 커밋, PR(#34/#24/#10/#25), CI 결과만 반영. 추측·날조 금지.

## 3. 탭 구조 (상단 탭 바, JS로 전환)

| 탭 | 내용 |
|---|---|
| `📋 개요` | 이번 작업 전체 그림(2줄 요약), 공통 규칙 표(서비스명·포트·환경 4종을 쉬운 말로), 최종 결과(4개 PR 전부 CI 통과 ✅, 머지 대기) |
| `🔐 platform-svc` | 발급자(로그인/결제 안내데스크). 표준화 + JWT 키 수정 + CI |
| `📚 knowledge-svc` | 노트·검색. 표준화 + flyway/pgvector/ddl-auto 수정 + CI + ES 테스트 보류 |
| `👥 engagement-svc` | 그룹·게이미피케이션. 표준화 + JWT 보안 적용 + CI |
| `🎴 learning-svc` | 학습카드·복습. properties→yml 전환 + 보안 + flyway 수정 + CI |

- 탭 전환은 순수 JS(버튼 클릭 → 해당 패널 표시). 기본 활성 탭 = 개요.

## 4. 각 레포 탭의 공통 섹션 (동일 틀 반복)

1. **이 서비스는 뭐예요?** — 한 문장 비유.
   - platform = "회원·로그인·결제를 담당하는 안내데스크"
   - knowledge = "메모를 저장하고 검색해주는 도서관 사서"
   - engagement = "스터디 그룹과 활동 점수(배지)를 관리하는 동아리방"
   - learning = "학습용 카드와 복습 일정을 챙겨주는 암기 도우미"
2. **무엇을 바꿨나요?** — 쉬운 말 불릿 (전문용어 대신 일상어).
3. **왜 했나요? / 효과** — Before → After 좌우 대비 카드.
4. **(해당 시) 숨어있던 문제를 찾아 고쳤어요** — dev 점검으로 발견한 버그를 이야기식으로.
5. **🔧 개발자용 상세 (접이식, 기본 접힘)** — `<details>` 사용. 실제 변경(프로퍼티 키, 포트, 커밋 요지), **PR 링크**. 비개발자는 무시 가능.

## 5. 쉽게 만드는 장치 (콘텐츠 규칙)

- 전문용어 첫 등장 시 괄호 한 줄 풀이: 예 "JWT(로그인 출입증)", "프로파일(환경별 설정 묶음)", "CI(자동 점검)", "flyway(DB 설계도 자동 적용 도구)".
- 의미 아이콘: 🟢 효과 / 🐞 고친 문제 / ⚙️ 설정 / 🔐 보안 / 🧪 점검.
- Before/After는 좌우 카드로 시각 대비("전: 서비스마다 제각각 → 후: 똑같은 규칙").
- 비유는 정확성을 해치지 않는 선에서만 사용.

## 6. 비주얼/스타일

- 밝은 테마, 카드형 레이아웃, 레포별 포인트 컬러(개요=중립, platform/knowledge/engagement/learning 각 1색).
- 깔끔한 산세리프(system-ui 계열), 충분한 여백, 둥근 모서리.
- 상단 고정 탭 바 + 제목/작성일.

## 7. 콘텐츠 출처 매핑 (각 탭에 들어갈 사실)

- **개요**: 표준화 스펙/플랜 + CI 스펙/플랜 요약, 포트맵(platform 8081 / knowledge 8082 / engagement 8083 / learning 8084), JWT `synapse.jwt.*` 통일, 결과(PR #34/#24/#10/#25 전부 CI green).
- **platform**: name `synapse-platform-svc`→`platform-svc`, active→dev, port 8081, `jwt.*`→`synapse.jwt.*`(발급자), local→dev 흡수, prod redis+Hikari; dev JWT private-key 손상 키 교정; CI dev 트리거+dev-smoke(postgres+redis). PR #34.
- **knowledge**: `security.jwt.public-key-pem`→`synapse.jwt.public-key`(검증자), 빈 스텁→실 DB, port 8082; flyway 자동설정 누락 수정(`spring-boot-starter-flyway`), ddl-auto validate→none, pgvector; CI(pgvector+opensearch)+dev-smoke; `SearchElasticsearchIntegrationTest` 보류(@Disabled, ES/OpenSearch/Nori 버전 정합 별도 과제). PR #24.
- **engagement**: staging 제거/test 신설, active→dev, port 8083, 로깅 패키지 교정; JWT 보안 계층 실제 적용(보호 엔드포인트 401), 통합테스트 실제 토큰; CI+dev-smoke(postgres). PR #10.
- **learning**: `.properties`→4-yml 전환, 하드코딩 비번 제거, app name `learning-card`→`learning-svc`, port 8084; JWT 보안 적용; flyway 자동설정 누락 수정; CI+dev-smoke(postgres-only). PR #25.

## 8. 범위 외

- 빌드 도구/프레임워크 도입, 다중 파일·에셋, 서버 구동.
- 레포의 이전(이번 세션 외) 기능 이력.
- 실시간 데이터 연동(정적 스냅샷 문서).

## 9. 성공 기준

- 비개발자가 각 탭을 읽고 "이 서비스에 무엇을/왜 했고 효과가 뭔지"를 이해할 수 있다.
- 개발자는 접이식 상세 + PR 링크로 실제 변경을 확인할 수 있다.
- 파일 하나를 더블클릭하면 인터넷 없이 바로 열리고 탭 전환이 동작한다.
