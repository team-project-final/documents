# Wiki / Project Management 정합성 개선 작업 계획

> 작성일: 2026-05-15
> 기준 보고서: `docs/project-management/reports/wiki-project-management-consistency-report-2026-05-15.md`
> 목표: Wiki와 `docs/project-management`의 일정, 책임, 서비스 경계, 범위 표현을 실행 문서 기준으로 정합화한다.

## 1. 작업 원칙

1. 기준 문서는 Wiki `17_스케줄.md` v3.1, `01_프로젝트_계획서.md` v1.3, `07_요구사항_정의서.md` v1.2로 둔다.
2. 날짜와 주차는 Wiki `17_스케줄.md`의 5주 영업일 기준을 우선한다.
3. 서비스 경계는 “4개 서비스 리포지토리 + `synapse-learning-svc` 내부 2개 런타임/모듈”로 표현한다.
4. 변경은 작은 단위로 나누고, 각 단계마다 `rg` 기반 검증과 `git diff --check`를 수행한다.
5. 기존 보고서 원문은 감사 증적으로 유지하고, 실제 수정 결과는 별도 변경 로그에 남긴다.

## 2. 단계별 계획

### Phase 0. 기준 확정 및 백업

목표: 본격 수정 전에 적용할 기준값과 범위를 고정한다.

| 작업 | 대상 | 산출물 | 검증 |
| --- | --- | --- | --- |
| 현재 Wiki / 본 저장소 최신 상태 확인 | `documents`, `documents.wiki` | 기준 commit 기록 | `git status`, `git log -1` |
| 수정 대상 파일 목록 확정 | `prd`, `task`, `workflow`, `history`, `scope` | 수정 체크리스트 | `rg` 검색 결과 |
| 보고서 기준값 추출 | 보고서 F-001~F-007 | 기준표 | 수동 리뷰 |

완료 조건:

- 수정 대상과 비대상 파일이 분리되어 있다.
- 기존 워킹트리 변경이 있으면 별도 보존 또는 제외 처리한다.

### Phase 1. 주차 날짜 정규화

목표: 모든 실행 문서의 W1~W5 날짜를 Wiki 기준으로 통일한다.

기준 날짜:

| 주차 | 표준 표기 |
| --- | --- |
| W1 | `2026-05-12 ~ 2026-05-15, 4 영업일` |
| W2 | `2026-05-18 ~ 2026-05-22, 5 영업일` |
| W3 | `2026-05-26 ~ 2026-05-29, 4 영업일, 5/25 부처님오신날 제외` |
| W4 | `2026-06-01 ~ 2026-06-05, 4 영업일, 6/3 지방선거 제외` |
| W5 | `2026-06-08 ~ 2026-06-12, 5 영업일` |

수정 대상:

- `docs/project-management/prd/PRD_W1.md`~`PRD_W5.md`
- `docs/project-management/task/TASK_*.md`
- `docs/project-management/workflow/WORKFLOW_*_W*.md`
- `docs/project-management/history/HISTORY_*.md`

주요 수정:

- `2026-05-12 ~ 2026-05-16` → `2026-05-12 ~ 2026-05-15`
- `2026-05-19 ~ 2026-05-23` → `2026-05-18 ~ 2026-05-22`
- `2026-05-26 ~ 2026-05-30` → `2026-05-26 ~ 2026-05-29`
- `2026-06-02 ~ 2026-06-06` → `2026-06-01 ~ 2026-06-05`
- 요일 표기가 있으면 실제 2026년 달력 기준으로 함께 수정한다.

검증:

```powershell
rg -n "2026-05-16|2026-05-19|2026-05-23|2026-05-30|2026-06-02|2026-06-06" docs/project-management
rg -n "2026-05-12 \\(월\\)|2026-05-16 \\(금\\)" docs/project-management
git diff --check
```

완료 조건:

- 토요일 포함 표기가 남지 않는다.
- PRD, TASK, WORKFLOW, HISTORY가 같은 주차 날짜를 사용한다.

### Phase 2. W5 workflow 생성

목표: `PRD_W5.md`와 각 `TASK_*.md`의 W5 항목을 실행 가능한 workflow로 연결한다.

생성 대상:

- `workflow/WORKFLOW_team-lead_W5.md`
- `workflow/WORKFLOW_platform_W5.md`
- `workflow/WORKFLOW_engagement_W5.md`
- `workflow/WORKFLOW_knowledge-1_W5.md`
- `workflow/WORKFLOW_knowledge-2_W5.md`
- `workflow/WORKFLOW_learning-card_W5.md`
- `workflow/WORKFLOW_learning-ai_W5.md`
- `workflow/WORKFLOW_frontend_W5.md`는 Phase 3 결정에 따라 생성 또는 제외한다.

공통 구성:

1. Task 문서 링크
2. 기간: `2026-06-08 ~ 2026-06-12, 5 영업일`
3. W5 목표
4. E2E 시나리오
5. P0 버그 triage
6. 성능/안정화 검증
7. 발표/시연 산출물
8. Done When 체크리스트

트랙별 핵심 내용:

| 트랙 | W5 핵심 |
| --- | --- |
| team-lead | 전체 E2E 조율, staging 배포, 성능 검증, 발표 리허설 |
| platform | 인증/결제/알림 E2E, P0 버그, 알림 안정화 |
| engagement | 게이미피케이션/커뮤니티 공유·신고 E2E |
| knowledge-1 | 노트/그래프/ES 동기화 E2E |
| knowledge-2 | 검색 정확도 리포트, 하이브리드 검색 안정화 |
| learning-card | 복습/SRS/Kafka 이벤트 안정화 |
| learning-ai | AI 카드 자동 생성, 시맨틱 검색 정확도, RAG 시간 허용 항목 정리 |

검증:

```powershell
Get-ChildItem docs/project-management/workflow -Filter "WORKFLOW_*_W5.md"
rg -n "PRD_W5|2026-06-08|2026-06-12|P0|E2E" docs/project-management/workflow
git diff --check
```

완료 조건:

- W5 workflow가 모든 공식 트랙에 존재한다.
- `PRD_W5.md`의 요구사항과 W5 workflow의 체크리스트가 연결된다.

### Phase 3. Frontend 책임 모델 정리

목표: Wiki의 “Frontend 전체 협업” 기준과 project-management 문서를 맞춘다.

보고서 기준 권장안:

- `@frontend-owner`를 공식 단일 owner로 두지 않는다.
- frontend는 전체 협업 트랙으로 두고, 각 도메인 owner가 자기 도메인 UI를 담당한다.

수정 대상:

- `task/TASK_frontend.md`
- `workflow/WORKFLOW_frontend_W1.md`~`WORKFLOW_frontend_W4.md`
- `history/HISTORY_frontend.md`
- `README.md`, `KICKOFF.md`의 frontend 설명

수정 방향:

- `@frontend-owner` → `Frontend 전체 협업`
- `Assignee: @frontend-owner` → `Assignee: 각 도메인 owner / 전체 협업`
- 존재하지 않는 `scope/SCOPE_frontend.md` 링크 제거 또는 `scope`가 필요하면 “공동 책임 스코프” 문서로 새로 만든다.

검증:

```powershell
rg -n "@frontend-owner|SCOPE_frontend" docs/project-management
git diff --check
```

완료 조건:

- `@frontend-owner`가 더 이상 단일 책임자로 등장하지 않는다.
- frontend 문서가 “전체 협업” 모델을 일관되게 설명한다.

### Phase 4. 4-서비스 / 런타임 용어 통일

목표: 서비스 경계와 실행 컨테이너 경계를 혼동하지 않게 문구를 정리한다.

표준 표현:

| 상황 | 표준 표현 |
| --- | --- |
| 리포지토리/도메인 서비스 | `4개 서비스` |
| Docker Compose 실행 단위 | `4개 서비스 + learning 내부 2개 런타임` |
| learning 설명 | `synapse-learning-svc / learning-card`, `synapse-learning-svc / learning-ai` |
| 금지/대체 | `5-서비스` 단독 표현은 사용하지 않음 |

수정 대상:

- `task/TASK_team-lead.md`
- `workflow/WORKFLOW_team-lead_W1.md`
- `history/HISTORY_team-lead.md`
- 필요 시 `PRD_W1.md`, `README.md`, `KICKOFF.md`

검증:

```powershell
rg -n "5-서비스|5개 서비스|learning-card-svc|learning-ai-svc" docs/project-management
rg -n "4개 서비스 \\+ learning 내부 2개 런타임|synapse-learning-svc / learning" docs/project-management
git diff --check
```

완료 조건:

- “5-서비스”가 서비스 경계 의미로 남지 않는다.
- Compose 문서에서는 runtime/container 기준임을 명시한다.

### Phase 5. 5주 MVP와 장기 Phase 범위 분리

목표: Wiki의 장기 Phase 설명과 project-management의 5주 실행 범위를 서로 모순 없이 설명한다.

수정 대상:

- Wiki `17_스케줄.md`
- 필요 시 Wiki `01_프로젝트_계획서.md`
- `docs/project-management/prd/PRD_W2.md`~`PRD_W5.md`

수정 방향:

- “제품 장기 Phase”와 “학기 프로젝트 5주 MVP”를 별도 표로 분리한다.
- 5주 MVP에는 PRD/TASK가 실제로 다루는 항목을 명시한다.
- 장기 Phase는 제품화 이후 확장 로드맵으로 정의한다.

권장 표기:

| 구분 | 의미 | 범위 |
| --- | --- | --- |
| 학기 프로젝트 5주 MVP | 2026-05-12 ~ 2026-06-12 구현·시연 범위 | Auth, Note, Card/SRS, Graph/Search, AI 카드, Billing test mode, Notification, Community/Gamification 핵심, E2E |
| 제품 장기 Phase | 5주 이후 제품화 로드맵 | 고도화, 운영 자동화, 확장 기능, 분리 검토 |

검증:

```powershell
rg -n "Phase 1 \\(MVP\\)|5주 MVP|학기 프로젝트 5주 MVP|제품 장기 Phase" docs/project-management
```

완료 조건:

- “Phase 1 MVP”만 보고 5주 구현 범위를 오해할 여지가 줄어든다.
- PRD/TASK P0 범위와 Wiki 설명이 같은 방향이다.

### Phase 6. OAuth Provider 범위 정렬

목표: W1 인증 구현 범위를 문서별로 동일하게 만든다.

현재 리스크:

- Wiki는 MVP Google/GitHub/Apple, 확장 Microsoft.
- 일부 project-management 문서는 Google/GitHub만 말한다.
- 일부 workflow/scope는 Microsoft까지 함께 말한다.

결정 필요:

보고서의 권장 수정에는 Microsoft 표기가 중복되어 있으므로, 실제 수정 전 아래 기준 중 하나를 확정해야 한다.

| 선택지 | P0 | P1/Extension | 영향 |
| --- | --- | --- | --- |
| A | Google/GitHub/Apple | Microsoft | Wiki `07` 기준 유지 |
| B | Google/GitHub | Apple/Microsoft | 구현 범위 축소 |
| C | Google/GitHub/Apple/Microsoft | 없음 | W1 인증 범위 확대 |

권장안:

- 선택지 A를 기본으로 한다.
- 사유: 기존 Wiki `07_요구사항_정의서.md`와 이전 정합화 기준에 맞고, Microsoft를 확장으로 분리할 수 있다.

수정 대상:

- `prd/PRD_W1.md`
- `task/TASK_platform.md`
- `workflow/WORKFLOW_platform_W1.md`
- `scope/SCOPE_platform.md`

검증:

```powershell
rg -n "Google/GitHub|Apple|Microsoft|OAuth Provider|OAuth" docs/project-management/prd docs/project-management/task docs/project-management/workflow docs/project-management/scope
git diff --check
```

완료 조건:

- OAuth Provider의 P0/P1 또는 MVP/Extension 구분이 모든 문서에서 동일하다.

### Phase 7. Scope 문서 5주화

목표: `scope/SCOPE_*.md`의 “4주 전체 책임 범위” 표현을 5주 기준으로 정리하고 W5 책임을 추가한다.

수정 대상:

- `scope/SCOPE_team-lead.md`
- `scope/SCOPE_platform.md`
- `scope/SCOPE_engagement.md`
- `scope/SCOPE_knowledge-1.md`
- `scope/SCOPE_knowledge-2.md`
- `scope/SCOPE_learning-card.md`
- `scope/SCOPE_learning-ai.md`

수정 방향:

- 제목: `## 4주 전체 책임 범위` → `## 5주 전체 책임 범위`
- 주차 표에 W5 행 추가
- W5 행은 Phase 2에서 만든 W5 workflow와 동일한 책임을 요약한다.

검증:

```powershell
rg -n "4주 전체 책임 범위|W5" docs/project-management/scope
git diff --check
```

완료 조건:

- 모든 scope 문서가 5주 책임 범위로 표현된다.
- W5 안정화/발표 준비 책임이 누락되지 않는다.

## 3. 권장 실행 순서

| 순서 | Phase | 이유 | 커밋 단위 |
| --- | --- | --- | --- |
| 1 | Phase 1 날짜 정규화 | 모든 문서의 기본 축 | `docs: align project management schedule dates` |
| 2 | Phase 2 W5 workflow 생성 | 실행 공백 제거 | `docs: add week 5 workflow plans` |
| 3 | Phase 3 frontend 책임 모델 | 트랙/담당자 혼선 제거 | `docs: align frontend ownership model` |
| 4 | Phase 4 서비스 용어 | 아키텍처 경계 혼선 제거 | `docs: clarify service and runtime terminology` |
| 5 | Phase 7 scope 5주화 | 책임 범위와 W5 workflow 연결 | `docs: update scope docs for five week plan` |
| 6 | Phase 6 OAuth 범위 | 인증 구현 범위 확정 필요 | `docs: align oauth provider scope` |
| 7 | Phase 5 MVP/Phase 범위 | Wiki 포함 변경이라 마지막에 통합 확인 | `docs: clarify five week mvp scope` |

## 4. 완료 검증 체크리스트

최종 작업 완료 후 아래 명령을 실행한다.

```powershell
rg -n "2026-05-16|2026-05-19|2026-05-23|2026-05-30|2026-06-02|2026-06-06" docs/project-management
rg -n "@frontend-owner|SCOPE_frontend" docs/project-management
rg -n "5-서비스|5개 서비스|learning-card-svc|learning-ai-svc" docs/project-management
rg -n "4주 전체 책임 범위" docs/project-management/scope
Get-ChildItem docs/project-management/workflow -Filter "WORKFLOW_*_W5.md"
git diff --check
```

성공 기준:

- 날짜 잔여 검색 결과가 없다.
- `@frontend-owner` 잔여 검색 결과가 없다.
- “5-서비스” 단독 표현이 없다.
- 모든 scope 문서가 5주 기준이다.
- 공식 트랙별 W5 workflow가 존재한다.
- `git diff --check`가 통과한다.

## 5. 예상 산출물

| 산출물 | 설명 |
| --- | --- |
| 수정된 PRD/TASK/WORKFLOW/HISTORY 문서 | Wiki 기준 날짜 반영 |
| W5 workflow 문서 묶음 | 최종 안정화 주차 실행 계획 |
| frontend 책임 모델 정리 | 전체 협업 기준 정합화 |
| scope 5주화 | 각 트랙의 W5 책임 추가 |
| Wiki 장기 Phase 설명 보정 | 5주 MVP와 제품 장기 로드맵 분리 |
| 최종 검증 로그 | `rg`, `git diff --check` 결과 |
