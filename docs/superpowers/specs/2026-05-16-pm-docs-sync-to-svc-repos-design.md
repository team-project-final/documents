# PM 문서 동기화 설계서 — documents → -svc 레포

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-05-16 |
| 작성자 | deepestdark@gmail.com (with Claude Code) |
| 상태 | 승인 완료 (구현 계획 대기) |
| 소스 오브 트루스 | `team-project-final/documents` @ main (`b80635b`) |
| 대상 레포 | `synapse-platform-svc`, `synapse-knowledge-svc`, `synapse-learning-svc`, `synapse-engagement-svc`, `synapse-frontend` |
| 관련 보고서 | `docs/project-management/reports/wiki-project-management-consistency-report-2026-05-15.md`, `wiki-project-management-consistency-action-plan-2026-05-15.md` |

## 1. 배경 & 목적

`team-project-final/documents/docs/project-management/`의 PRD/TASK/WORKFLOW/SCOPE 문서는 현재 wiki와 정합성을 맞춰 최신 상태로 갱신되었다. 그러나 각 서비스 레포(`**-svc`, `synapse-frontend`)의 `docs/project-management/` 폴더는 **옛 wiki 시절 내용**을 그대로 보유하고 있어, 팀원들이 서로 다른 버전의 문서를 참고하며 혼란이 발생하고 있다.

본 작업은 위 5개 레포의 PM 문서를 `documents` 레포 최신 상태와 정합성을 맞추는 일회성 동기화이다. 각 서비스 레포는 다른 팀원이 활발히 작업 중이므로 **main/dev 직접 커밋·푸쉬는 금지**하며, 별도 작업 브런치 → `dev` 베이스 PR 방식으로 진행한다.

## 2. 기본 원칙

- **소스 오브 트루스**: `team-project-final/documents` 레포의 `main` 브런치 (`b80635b`)
- **타깃**: 5개 레포 각각의 `docs/project-management/{prd,task,workflow,scope}/`
- **필터**: 각 레포는 "자기 서비스 관련 파일만" 보유 (섹션 4 매핑)
- **잔재 제거**: 위 4개 폴더 안의 비대상 파일은 모두 삭제
- **머지 책임**: 각 PR의 머지는 본 작업 범위 밖. 레포 담당자가 검토 후 진행.

## 3. 대상 레포 & 베이스 브런치

| 레포 | 베이스 브런치 처리 |
| --- | --- |
| `synapse-knowledge-svc` | 기존 `dev` 사용 |
| `synapse-learning-svc` | 기존 `dev` 사용 |
| `synapse-engagement-svc` | 기존 `dev` 사용 |
| `synapse-platform-svc` | `main`에서 `dev` 신규 생성 → `dev` 사용 |
| `synapse-frontend` | `main`에서 `dev` 신규 생성 → `dev` 사용 |

**작업 브런치 (5개 레포 공통)**: `chore/sync-pm-docs-from-documents-20260516`

## 4. 파일 매핑 (서비스별 보유 대상)

각 레포 `docs/project-management/`의 4개 폴더(`prd/`, `task/`, `workflow/`, `scope/`)에 **남아야 할 파일**. 목록에 없는 파일은 모두 삭제. PRD는 서비스 공통.

### 4.1 synapse-platform-svc (12개)
- `prd/`: `PRD_W1.md` ~ `PRD_W5.md`
- `task/`: `TASK_platform.md`
- `workflow/`: `WORKFLOW_platform_W1.md` ~ `WORKFLOW_platform_W5.md`
- `scope/`: `SCOPE_platform.md`

### 4.2 synapse-knowledge-svc (19개)
- `prd/`: `PRD_W1.md` ~ `PRD_W5.md`
- `task/`: `TASK_knowledge-1.md`, `TASK_knowledge-2.md`
- `workflow/`: `WORKFLOW_knowledge-1_W1.md` ~ `W5.md`, `WORKFLOW_knowledge-2_W1.md` ~ `W5.md`
- `scope/`: `SCOPE_knowledge-1.md`, `SCOPE_knowledge-2.md`

### 4.3 synapse-learning-svc (19개)
- `prd/`: `PRD_W1.md` ~ `PRD_W5.md`
- `task/`: `TASK_learning-card.md`, `TASK_learning-ai.md`
- `workflow/`: `WORKFLOW_learning-card_W1.md` ~ `W5.md`, `WORKFLOW_learning-ai_W1.md` ~ `W5.md`
- `scope/`: `SCOPE_learning-card.md`, `SCOPE_learning-ai.md`

### 4.4 synapse-engagement-svc (12개)
- `prd/`: `PRD_W1.md` ~ `PRD_W5.md`
- `task/`: `TASK_engagement.md`
- `workflow/`: `WORKFLOW_engagement_W1.md` ~ `WORKFLOW_engagement_W5.md`
- `scope/`: `SCOPE_engagement.md`

### 4.5 synapse-frontend (11개, scope 폴더는 동기화 제외)
- `prd/`: `PRD_W1.md` ~ `PRD_W5.md`
- `task/`: `TASK_frontend.md`
- `workflow/`: `WORKFLOW_frontend_W1.md` ~ `WORKFLOW_frontend_W5.md`
- `scope/`: **이번 동기화에서 제외 (documents에 `SCOPE_frontend.md` 없음, 폴더 손대지 않음)**

## 5. 실행 워크플로우

### 5.1 단계 1 — 파일럿: `synapse-engagement-svc`
1. 클론: `D:\workspace\final-project-syn\synapse-engagement-svc`
2. `dev` 브런치 fetch & checkout
3. 작업 브런치 생성: `chore/sync-pm-docs-from-documents-20260516`
4. 동기화 실행 (섹션 4 매핑 적용):
   - 4개 폴더 내 비대상 파일 삭제
   - documents의 자기 서비스 파일을 해당 위치로 복사 (덮어쓰기 포함)
5. 검증 (섹션 7)
6. 단일 커밋 (섹션 6 한글 메시지)
7. `git push --set-upstream`
8. PR 생성 (베이스: `dev`, 헤드: `chore/sync-pm-docs-from-documents-20260516`, 한글 본문)
9. PR URL 사용자 보고 → **사용자 검토·승인 대기**

### 5.2 단계 2 — 일괄: 나머지 4개 레포
파일럿 승인 후 병렬 실행 가능.

- `synapse-knowledge-svc`, `synapse-learning-svc`: 단계 1과 동일 (dev 기존)
- `synapse-platform-svc`, `synapse-frontend`: `main`에서 `dev` 신규 생성(push) 후 단계 1과 동일

### 5.3 단계 3 — 마무리
- 5개 PR URL을 표로 정리해 사용자에게 보고
- 머지는 각 레포 담당자/팀 리드

### 5.4 클론 위치 규약
`D:\workspace\final-project-syn\` 하위에 레포명 그대로:
- `synapse-engagement-svc/`
- `synapse-knowledge-svc/`
- `synapse-learning-svc/`
- `synapse-platform-svc/`
- `synapse-frontend/`

### 5.5 충돌·예외 처리
- **클론 실패**: 즉시 중단, 사용자에게 보고
- **클론 디렉토리 사전 존재**: 사용자 확인 후 진행 (덮어쓰지 않음)
- **작업 브런치명 사전 존재 (로컬/원격)**: 사용자 확인 후 진행
- **PR 생성 실패**: push까지만 두고 사용자에게 수동 PR 안내

## 6. 커밋 & PR 한글 양식

### 6.1 커밋 메시지 템플릿

```
chore(docs): documents 레포 기준으로 PM 문서 동기화

기존 -svc 레포 PM 문서가 옛 wiki 내용에 머물러 팀원 혼란이 발생하고 있어,
team-project-final/documents 레포 최신 내용 기준으로 prd/task/workflow/scope
4개 폴더 내용을 재정렬합니다.

- 동기화 범위: docs/project-management/{prd,task,workflow,scope}
- 적용 정책: 본 서비스(<서비스명>) 관련 문서만 보유
- 비대상 파일은 삭제하여 옛 잔재 제거
- KICKOFF.md, README.md, history/ 등은 미변경

소스: team-project-final/documents @ b80635b
```

`<서비스명>` 자동 치환 (예: `engagement`, `knowledge`, `learning`, `platform`, `frontend`).

### 6.2 PR 제목

```
chore(docs): documents 레포 기준으로 PM 문서 동기화 (prd/task/workflow/scope)
```

### 6.3 PR 본문 템플릿

```markdown
## 배경

기존 -svc 레포의 `docs/project-management/` 문서가 옛 wiki 시절 내용에
맞춰져 있어, 현재 wiki 및 `team-project-final/documents` 레포의 PM 문서와
정합성이 깨져 있습니다. 팀원 간 참고하는 문서가 달라 혼란이 발생하고 있습니다.

## 변경 내용

`team-project-final/documents/docs/project-management` (main @ `b80635b`)
기준으로 본 레포의 `docs/project-management/` 하위 4개 폴더 내용을
재정렬합니다.

- 동기화 폴더: `prd/`, `task/`, `workflow/`, `scope/`
- 적용 정책: 본 서비스(`<서비스명>`) 관련 파일만 보유
- 그 외 옛 잔재 파일은 삭제

## 본 PR에서 손대지 않은 항목

- `docs/project-management/KICKOFF.md`, `README.md`, `history/`
- `docs/rules/`, `docs/spike/`, `docs/ai/` 등 PM 외 디렉토리
- 코드, CI 설정

## 보유 파일 목록 (동기화 후)

<섹션 4의 해당 서비스 파일 목록 그대로 삽입>

## 검토 포인트

- [ ] 본 서비스가 참조하는 문서가 빠짐없이 포함됐는지
- [ ] 삭제된 파일이 실제로 본 서비스와 무관한지
- [ ] documents 레포의 최신 내용과 동일한지 (소스 SHA 확인)

## 머지 안내

각 레포 담당자/팀 리드가 검토 후 머지 부탁드립니다.
머지 후에는 본 레포의 PM 문서가 documents 레포 및 wiki와 정합성을 갖추게 됩니다.
```

## 7. 검증 체크리스트

각 레포 PR 생성 직전 자동 검증. 검증 실패 시 push 중단(검증 1~3) 또는 사용자 수동 안내(검증 4).

### 7.1 동기화 정확성
- [ ] 4개 폴더(prd/task/workflow/scope) 내 파일 목록 = 섹션 4 매핑과 완전 일치 (없는 파일 없음, 여분 파일 없음)
- [ ] 각 파일 내용 = documents 레포 원본과 byte-identical (해시 비교)

### 7.2 비변경 영역 무결성
- [ ] `docs/project-management/KICKOFF.md` — diff 없음
- [ ] `docs/project-management/README.md` — diff 없음
- [ ] `docs/project-management/history/` — diff 없음
- [ ] `docs/project-management/` 외부 — diff 없음
- [ ] `synapse-frontend`의 경우 `scope/`도 diff 없음

### 7.3 브런치 & 커밋 위생
- [ ] 작업 브런치명 = `chore/sync-pm-docs-from-documents-20260516`
- [ ] 베이스 브런치 대비 커밋 1개만 추가
- [ ] 커밋 메시지가 한글 양식 일치, `<서비스명>` 치환 완료
- [ ] 베이스 브런치가 의도한 `dev` (platform/frontend의 경우 신규 생성된 dev)

### 7.4 PR 위생
- [ ] PR 제목/본문 한글 양식 일치
- [ ] PR 본문의 "보유 파일 목록"이 실제 변경 결과와 일치
- [ ] 베이스 브런치 = 의도한 `dev`
- [ ] PR URL 정상 발급

### 7.5 사용자 보고
- [ ] 파일럿(engagement-svc) PR URL 단독 보고 → 사용자 승인 대기
- [ ] 일괄 완료 후 5개 PR URL 표 보고

## 8. 비범위 (Out of Scope)

- documents 레포 자체 수정
- 각 -svc의 `docs/rules`, `docs/spike`, `docs/ai`, `docs/project-management/{KICKOFF.md, README.md, history/}` 변경
- 코드 변경, CI 설정 변경
- 각 레포 PR 머지 (담당자 책임)

## 9. 위험 & 완화

| 위험 | 완화 |
| --- | --- |
| 파일럿 PR 검토에서 형식 결함 발견 | 단계 1 정지, 수정 후 재진행. 단계 2 미진행으로 영향 1개 PR로 한정 |
| 클론 시 사용자가 동일 경로에 기존 작업 보관 | 클론 전 디렉토리 존재 점검, 발견 시 사용자 확인 |
| platform/frontend의 `dev` 신규 생성이 다른 작업과 충돌 | dev 생성 직전 원격에 dev 존재 여부 재확인, 있으면 그것 사용 |
| 작업 브런치명이 원격에 이미 존재 | push 전 ls-remote로 확인, 있으면 사용자 확인 |
| documents 레포 main SHA가 작업 중 갱신 | 커밋·PR 메시지에 작업 시점 SHA 명시. 작업 중 documents pull 금지 |

## 10. 다음 단계

본 설계 승인 후 `superpowers:writing-plans` 스킬을 호출하여 상세 구현 계획을 수립한다.
