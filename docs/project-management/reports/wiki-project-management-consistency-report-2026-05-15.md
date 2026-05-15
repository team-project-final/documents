# Wiki / Project Management 문서 정합성 점검 보고서

> 점검일: 2026-05-15
> 점검 대상: GitHub Wiki 문서, `docs/project-management/prd`, `docs/project-management/task`, `docs/project-management/workflow`
> 기준 문서: Wiki `17_스케줄.md` v3.1, `01_프로젝트_계획서.md` v1.3, `07_요구사항_정의서.md` v1.2

## 1. 요약

현재 문서들은 큰 방향에서는 동일하다. 5주 일정, 4개 핵심 서비스 리포지토리, `synapse-learning-svc` 내부의 `learning-card`/`learning-ai` 분리, Refresh Token 7일, Gateway Rate Limit 정책은 대체로 맞다.

다만 실행 문서 수준에서는 일정 날짜, W5 workflow 커버리지, frontend 책임 모델, MVP Phase 범위에 불일치가 남아 있다. 특히 날짜와 W5 workflow 부재는 실제 스프린트 운영에서 혼선을 만들 수 있으므로 우선 수정이 필요하다.

## 2. 정합한 항목

| 항목 | Wiki 기준 | project-management 상태 | 판정 |
| --- | --- | --- | --- |
| 5주 프로젝트 구조 | `17_스케줄.md`가 W1~W5 + 2026-06-15 발표일 정의 | `KICKOFF.md`, `README.md`, `prd/PRD_W1.md`~`PRD_W5.md` 존재 | 정합 |
| 핵심 서비스 리포지토리 | `platform`, `engagement`, `knowledge`, `learning` 4개 서비스 | `README.md`, `KICKOFF.md`, PRD 다수에서 `synapse-learning-svc` 기준 사용 | 대체로 정합 |
| learning 분리 방식 | `synapse-learning-svc / learning-card`, `synapse-learning-svc / learning-ai` | `scope/SCOPE_learning-card.md`, `scope/SCOPE_learning-ai.md`, `task/TASK_learning-*.md`에서 동일 표기 | 정합 |
| Refresh Token TTL | `07_요구사항_정의서.md`: 7일 | `PRD_W1.md`, `TASK_platform.md`가 7일 표기 | 정합 |
| 일반 API Rate Limit | Free 100/min, Pro 1000/min, Team 3000/min | `TASK_team-lead.md`, `WORKFLOW_team-lead_W2.md`에 동일 표기 | 정합 |

## 3. 불일치 및 리스크

### F-001. 주차별 날짜가 Wiki와 project-management 실행 문서에서 다름

심각도: High

Wiki `17_스케줄.md` 기준:

| 주차 | Wiki 날짜 |
| --- | --- |
| W1 | 2026-05-12(화) ~ 2026-05-15(금) |
| W2 | 2026-05-18(월) ~ 2026-05-22(금) |
| W3 | 2026-05-26(화) ~ 2026-05-29(금) |
| W4 | 2026-06-01(월) ~ 2026-06-05(금), 6/3 제외 |
| W5 | 2026-06-08(월) ~ 2026-06-12(금) |

project-management 문서의 상이한 표기:

- `prd/PRD_W1.md`: `2026-05-12 (월) ~ 2026-05-16 (금)`
- 다수 `task/TASK_*.md`: W1 `2026-05-12 ~ 2026-05-16`, W2 `2026-05-19 ~ 2026-05-23`
- 다수 `workflow/WORKFLOW_*_W*.md`: W1 `2026-05-12 ~ 2026-05-16`, W2 `2026-05-19 ~ 2026-05-23`, W3 `2026-05-26 ~ 2026-05-30`, W4 `2026-06-02 ~ 2026-06-06`
- 다수 `history/HISTORY_*.md`: W1~W4가 동일하게 토요일 포함 형태

영향:

- 스프린트 시작/종료일, 데일리 로그, 리뷰 마감일이 문서별로 달라진다.
- Wiki는 공휴일을 제외한 22영업일 기준인데, task/workflow/history 일부는 토요일을 포함하는 형태다.

권장 수정:

1. `prd`, `task`, `workflow`, `history`의 모든 주차 날짜를 Wiki `17_스케줄.md` 기준으로 일괄 정규화한다.
2. 날짜 옆에 영업일 수를 명시한다. 예: `W1 (2026-05-12 ~ 2026-05-15, 4 영업일)`.

### F-002. W5 PRD/TASK는 있으나 W5 workflow 문서가 없음

심각도: High

확인 결과:

- 존재: `prd/PRD_W5.md`
- 존재: 일부 `task/TASK_*.md`에 W5 섹션
- 부재: `workflow/WORKFLOW_*_W5.md` 전체

현재 workflow 디렉터리는 각 트랙별 W1~W4까지만 존재한다.

영향:

- Wiki `17_스케줄.md`는 W5를 “전체 E2E / P0 버그 수정 / 성능 검증 / Staging 배포 / 발표 자료·리허설”로 정의한다.
- `PRD_W5.md`도 최종 안정화 요구사항을 정의하지만, 실제 실행 체크리스트인 workflow가 없어 W5의 일일 작업·검증·산출물 추적이 끊긴다.

권장 수정:

1. `workflow/WORKFLOW_{track}_W5.md`를 생성한다.
2. 최소 대상 트랙: `team-lead`, `platform`, `engagement`, `knowledge-1`, `knowledge-2`, `learning-card`, `learning-ai`.
3. frontend를 별도 트랙으로 유지한다면 `WORKFLOW_frontend_W5.md`도 생성한다.

### F-003. Frontend 책임 모델이 Wiki와 project-management에서 다름

심각도: Medium

Wiki 기준:

- `17_스케줄.md`: “Frontend는 전체 협업: 별도 owner 없이 모든 트랙이 자기 도메인 UI를 담당”

project-management 상태:

- `task/TASK_frontend.md`: `# TASK: @frontend-owner`
- `workflow/WORKFLOW_frontend_W1.md`~`WORKFLOW_frontend_W4.md`: `@frontend-owner`
- `history/HISTORY_frontend.md`: 별도 frontend history 존재
- `task/TASK_frontend.md`는 `scope/SCOPE_frontend.md`를 참조하지만 해당 파일은 없음

영향:

- Wiki를 따르면 frontend는 별도 owner가 없는 공동 책임이다.
- project-management를 따르면 `@frontend-owner`라는 별도 책임자가 존재한다.
- `SCOPE_frontend.md`가 없어서 별도 트랙으로 운영하기에도 책임 경계 문서가 빠져 있다.

권장 수정:

선택지는 둘 중 하나로 정리해야 한다.

1. Wiki 기준 유지: `TASK_frontend.md`, `WORKFLOW_frontend_*`, `HISTORY_frontend.md`의 `@frontend-owner` 표현을 “전체 협업 / 도메인별 owner”로 바꾼다.
2. 별도 frontend 트랙 채택: Wiki `17_스케줄.md`와 `09_Git_규칙_정의서`에 `@frontend-owner`를 공식 트랙으로 추가하고 `scope/SCOPE_frontend.md`를 생성한다.

### F-004. “4-서비스”와 “5-서비스” 용어가 혼재됨

심각도: Medium

Wiki 기준:

- 서비스 리포지토리는 4개: `platform`, `engagement`, `knowledge`, `learning`
- `learning-card`와 `learning-ai`는 `synapse-learning-svc` 내부 런타임/모듈

project-management의 혼재 사례:

- `prd/PRD_W1.md`: 4-서비스 골격, 4-서비스 로컬 실행
- `task/TASK_team-lead.md`: 제목은 “Docker Compose 4-서비스 구성”이나 Done When은 “5-서비스 Health OK”
- `workflow/WORKFLOW_team-lead_W1.md`: “Docker Compose 5-서비스 구성”, “platform, engagement, knowledge, learning-card, learning-ai”

판정:

기술적으로 Docker Compose 런타임 컨테이너가 5개일 수는 있다. 하지만 Wiki가 “4개 서비스 리포지토리 + learning 내부 2개 런타임/모듈”을 기준으로 정리되어 있으므로, “5-서비스”라는 표현은 서비스 경계 오해를 만든다.

권장 수정:

- “4-서비스”는 리포지토리/도메인 서비스 경계에만 사용한다.
- Compose 실행 단위는 “5 runtime containers” 또는 “4 서비스 + learning 내부 2 런타임”으로 표기한다.
- `TASK_team-lead.md`, `WORKFLOW_team-lead_W1.md`의 표현을 이 기준으로 통일한다.

### F-005. MVP Phase 범위 설명이 Wiki 장기 로드맵과 PRD/TASK의 5주 범위에서 다름

심각도: Medium

Wiki `17_스케줄.md`의 장기 로드맵:

- Phase 1 (MVP): Auth + Note CRUD + Card CRUD + 기본 XP
- Phase 2: FCM 알림 + 청킹/임베딩 + AI 카드 생성 + 리더보드
- Phase 3: MFA + Graph PageRank + RAG + 신고 시스템

반면 project-management PRD/TASK는 5주 내에 다음을 포함한다.

- W1: MFA 기초
- W2: Billing, Notification 기초, 시맨틱 검색, AI 카드 골격, 커뮤니티 공유
- W3: 게이미피케이션 완성, 리더보드, AI 자동 생성 안정화, RAG 시간 허용
- W4: Notification 소비, audit, admin 모더레이션, RAG 시간 허용
- W5: 인증/결제/게이미피케이션/커뮤니티/검색/AI E2E

영향:

- Wiki `17`의 Phase 설명만 보면 billing, notification, AI, 리더보드, 신고 시스템은 5주 MVP 밖으로 보인다.
- PRD/TASK는 해당 항목들을 W2~W5 실행 범위로 잡고 있어, “5주 MVP의 실제 구현 범위” 판단이 갈린다.

권장 수정:

1. `17_스케줄.md`의 Phase 1 설명을 project-management 범위에 맞게 확장한다.
2. 또는 PRD/TASK의 P0/P1 우선순위를 Wiki Phase 기준에 맞게 낮춘다.
3. 가장 현실적인 방식은 “5주 학기 프로젝트 MVP”와 “제품 장기 Phase”를 분리해 표기하는 것이다.

### F-006. OAuth Provider 범위가 문서별로 다름

심각도: Medium

Wiki 기준:

- `07_요구사항_정의서.md`: MVP Google/GitHub/Apple, 확장 Microsoft

project-management 상태:

- `PRD_W1.md`: Google, GitHub만 개별 요구사항으로 정의
- `TASK_platform.md`: Step Goal과 Input이 Google/GitHub 기준
- `scope/SCOPE_platform.md`, `workflow/WORKFLOW_platform_W1.md`: Google/GitHub/Apple/Microsoft까지 언급

영향:

- 구현자가 Apple을 W1 MVP 필수로 봐야 하는지, Microsoft까지 구현해야 하는지 판단하기 어렵다.

권장 수정:

- W1 P0: Google/GitHub/Apple
- W1 P1 또는 Extension: Microsoft
- `PRD_W1.md`, `TASK_platform.md`, `WORKFLOW_platform_W1.md`, `SCOPE_platform.md`를 동일한 Provider 등급으로 맞춘다.

### F-007. Scope 문서 제목은 “4주”인데 README/KICKOFF는 5주 책임 범위라고 설명함

심각도: Low

project-management 상태:

- `README.md`: `SCOPE`를 “5주 전체 책임/경계 정의”로 설명
- `KICKOFF.md`: `SCOPE -> 5주 전체 책임 경계`
- 다수 `scope/SCOPE_*.md`: `## 4주 전체 책임 범위`

영향:

- 내용 일부는 W1~W4 중심이고 W5 안정화/발표 준비 책임이 누락되어 보일 수 있다.

권장 수정:

- 모든 `scope/SCOPE_*.md` 제목을 “5주 전체 책임 범위”로 바꾸고 W5 책임을 추가한다.

## 4. 권장 수정 우선순위

| 우선순위 | 작업 | 대상 |
| --- | --- | --- |
| P0 | 주차 날짜 정규화 | `prd`, `task`, `workflow`, `history` 전체 |
| P0 | W5 workflow 생성 | `workflow/WORKFLOW_*_W5.md` |
| P1 | frontend 책임 모델 결정 및 정리 | Wiki `17`, `TASK_frontend.md`, `WORKFLOW_frontend_*`, `HISTORY_frontend.md`, `SCOPE_frontend.md` |
| P1 | 4-서비스/5-runtime 용어 통일 | `TASK_team-lead.md`, `WORKFLOW_team-lead_W1.md`, 관련 README |
| P1 | 5주 MVP와 장기 Phase 범위 분리 | Wiki `17`, PRD W2~W5 |
| P2 | OAuth Provider 등급 정렬 | Wiki `07`, `PRD_W1.md`, `TASK_platform.md`, `WORKFLOW_platform_W1.md` |
| P2 | Scope 제목 및 W5 책임 추가 | `scope/SCOPE_*.md` |

## 5. 결론

문서 체계는 “5주 프로젝트 + 4개 서비스 리포지토리 + learning 내부 2 런타임” 방향으로 거의 수렴했다. 남은 문제는 대부분 실행 문서가 5주 개편 이전의 날짜와 트랙 구조를 일부 유지하고 있는 데서 발생한다.

가장 먼저 날짜와 W5 workflow를 맞추면 스프린트 운영 혼선은 크게 줄어든다. 그 다음 frontend 트랙을 공식화할지 공동 책임으로 유지할지 결정하면 project-management 문서와 Wiki의 책임 모델도 안정화된다.
