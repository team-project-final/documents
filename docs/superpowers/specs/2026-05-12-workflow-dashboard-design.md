# Workflow Dashboard 설계서

> **작성일**: 2026-05-12
> **상태**: Approved
> **목적**: GitHub Pages 기반 프로젝트 진행 상황 대시보드. 각 서비스 레포의 WORKFLOW/TASK/PRD 문서 변경 시 자동으로 진행률을 수집하여 시각화.
> **레포**: [team-project-final/workflow-dashboard](https://github.com/team-project-final/workflow-dashboard)

---

## 1. 개요

### 1.1 목적

팀장과 팀원이 Synapse 프로젝트의 전체 진행 상황을 한 페이지에서 파악할 수 있는 대시보드.
- 트랙별 진행률 카드 (카드 그리드)
- 주차 × 트랙 상세 테이블 + 타임라인 추이 차트
- 카드 클릭 → PRD/TASK/WORKFLOW 상세 드릴다운
- 변경 이력 추적 (Step 추가/삭제/수정, 체크 완료/해제 diff)

### 1.2 대상 사용자

- 팀장 (김민구): 전체 현황 파악, 위험 징후 조기 감지
- 팀원 6명: 자기 트랙 + 다른 트랙 진행 상황 확인

### 1.3 URL

`https://team-project-final.github.io/workflow-dashboard`

---

## 2. 아키텍처

### 2.1 Push 모델 데이터 흐름

```
서비스 레포 6개 (WORKFLOW/TASK/PRD 변경)
  │
  ├─→ parse-workflow.yml (GitHub Actions)
  │     1. 체크박스 파싱 (- [ ] / - [x])
  │     2. 이전 JSON과 diff → changelog 생성
  │     3. history 배열에 날짜별 스냅샷 append
  │     4. data/{repo}.json → workflow-dashboard 레포에 push
  │
  ▼
workflow-dashboard 레포
  │
  ├─→ build.yml (data/ 변경 시 트리거)
  │     1. npm run build (React + Vite)
  │     2. gh-pages 브랜치에 배포
  │
  ▼
GitHub Pages (정적 사이트)
  └─→ data/*.json fetch → React가 렌더링
```

### 2.2 필요 토큰

| 토큰 | 용도 | 발급 위치 | 스코프 |
|------|------|----------|--------|
| DASHBOARD_TOKEN | 서비스 레포 → dashboard 레포 push | GitHub fine-grained PAT | workflow-dashboard Contents 쓰기 |

각 서비스 레포의 Repository secret에 `DASHBOARD_TOKEN` 등록.

### 2.3 데이터 소스 레포 (6개)

| 레포 | 파싱 대상 파일 | 트랙 |
|------|---------------|------|
| synapse-platform-svc | WORKFLOW_platform_W*.md, TASK_platform.md, PRD_W*.md | platform |
| synapse-engagement-svc | WORKFLOW_engagement_W*.md, TASK_engagement.md, PRD_W*.md | engagement |
| synapse-knowledge-svc | WORKFLOW_knowledge-{1,2}_W*.md, TASK_knowledge-{1,2}.md, PRD_W*.md | knowledge-1, knowledge-2 |
| synapse-learning-svc | WORKFLOW_learning-{card,ai}_W*.md, TASK_learning-{card,ai}.md, PRD_W*.md | learning-card, learning-ai |
| synapse-frontend | WORKFLOW_frontend_W*.md, TASK_frontend.md, PRD_W*.md | frontend |
| synapse-shared | WORKFLOW_team-lead_W*.md, TASK_team-lead.md, PRD_W*.md | team-lead |

---

## 3. JSON 데이터 스키마

### 3.1 `data/{repo}.json`

```json
{
  "repo": "synapse-platform-svc",
  "updatedAt": "2026-05-14T09:30:00+09:00",
  "tracks": [
    {
      "name": "platform",
      "owner": "김해준",
      "weeks": [
        {
          "week": "W1",
          "period": "05-12~05-16",
          "steps": [
            {
              "name": "platform-svc 골격 생성",
              "status": "Done",
              "phases": [
                { "name": "TASK 시작", "total": 3, "done": 3 },
                { "name": "요구사항 분석", "total": 4, "done": 4 }
              ],
              "totalChecks": 80,
              "doneChecks": 80
            }
          ],
          "totalChecks": 160,
          "doneChecks": 72
        }
      ]
    }
  ],
  "prd": [
    {
      "week": "W1",
      "items": [
        { "id": "FR-PL-001", "title": "Google OAuth 회원가입", "status": "done" },
        { "id": "FR-PL-002", "title": "GitHub OAuth 로그인", "status": "in_progress" },
        { "id": "FR-PL-003", "title": "JWT Access/Refresh Token", "status": "in_progress" },
        { "id": "FR-PL-004", "title": "TOTP 기반 MFA", "status": "not_started" }
      ]
    }
  ],
  "history": [
    { "date": "2026-05-12", "totalChecks": 160, "doneChecks": 10 },
    { "date": "2026-05-13", "totalChecks": 160, "doneChecks": 35 },
    { "date": "2026-05-14", "totalChecks": 160, "doneChecks": 72 }
  ],
  "changelog": [
    {
      "date": "2026-05-14T09:30:00+09:00",
      "commit": "a1b2c3d",
      "author": "김해준",
      "file": "TASK_platform.md",
      "changes": [
        {
          "type": "step_added",
          "target": "Step 5: Redis 세션 관리",
          "detail": "W1에 Step 5 신규 추가 (기존 4개 → 5개)"
        }
      ]
    },
    {
      "date": "2026-05-13T17:20:00+09:00",
      "commit": "d4e5f6g",
      "author": "김해준",
      "file": "TASK_platform.md",
      "changes": [
        {
          "type": "step_modified",
          "target": "Step 2: OAuth 회원가입/로그인",
          "field": "Scope",
          "before": "In Scope: Google OAuth만",
          "after": "In Scope: Google + GitHub OAuth"
        }
      ]
    }
  ]
}
```

### 3.2 변경 유형 (changelog.changes[].type)

| type | 설명 | 색상 | 필드 |
|------|------|------|------|
| `step_added` | Step 신규 추가 | 🔵 #0ea5e9 | target, detail |
| `step_deleted` | Step 삭제 | 🔴 #dc2626 | target, detail |
| `step_modified` | Step 내용 수정 | 🟠 #d97706 | target, field, before, after |
| `check_done` | 체크 완료 ([ ]→[x]) | 🟢 #16a34a | target, detail |
| `check_undone` | 체크 해제 ([x]→[ ]) | ⚪ #a8a29e | target, detail |
| `phase_added` | 워크플로 단계 추가 | 🔵 #0ea5e9 | target, detail |
| `phase_deleted` | 워크플로 단계 삭제 | 🔴 #dc2626 | target, detail |

---

## 4. UI 설계

### 4.1 메인 대시보드 (카드 그리드 + 테이블/차트)

**상단 다크 헤더**:
- 좌: "Synapse Workflow Dashboard" 로고
- 우: 전체 진행률 (큰 숫자) + 현재 주차 표시

**카드 그리드** (6개):
- 레포/트랙별 카드: 진행률 숫자 + 담당자 + 프로그레스 바 + 주차별 미니 막대
- 카드 클릭 → 상세 드릴다운 뷰로 전환
- 컬러: 진행률 60%+ = Amber 보더, 30~59% = 기본 보더, <30% = 빨간 보더

**좌측 테이블**:
- 트랙(행) × 주차(열) 교차 테이블
- 셀 값: 진행률 % (컬러코딩: 🟢60%+ 🟠30~59% 🔴<30%)
- 합계 열

**우측 타임라인 차트**:
- Chart.js 라인 차트
- X축: 날짜 (5주간)
- Y축: 진행률 0~100%
- 트랙별 라인 (Amber=platform, Teal=engagement, Stone=기타)
- "오늘" 마커 수직선

### 4.2 상세 드릴다운 뷰 (카드 클릭 시)

**헤더**:
- "← 대시보드" 뒤로가기
- 레포명 + 담당자 + 트랙 + 전체 진행률

**뷰 전환 탭**:
- "상세 (PRD/TASK/WORKFLOW)" — 기본 탭
- "변경 이력" — changelog 탭

**상세 탭 — 3컬럼**:

| 좌: PRD | 중: TASK | 우: WORKFLOW |
|---------|---------|-------------|
| 해당 주차 요구사항 | Step별 상태 카드 | 현재 진행중 Step의 10단계 |
| FR-PL-001~004 | Done/In Progress/Not Started | 체크리스트 + 세부 체크 펼침 |
| 완료=🟢 진행=🟠 예정=⬜ | Done When 체크 + 진행률 바 | 완료=✅ 진행=🔄 미시작=⬜ |

**주차 탭**: W1~W5 전환

**변경 이력 탭**:

- 필터 바: 전체 / Step 추가·삭제 / 내용 수정 / 체크 완료
- 날짜별 타임라인 (최신순)
- 각 변경 항목:
  - 변경 유형 뱃지 (컬러 코딩)
  - 파일명 (TASK/WORKFLOW)
  - 변경 대상 + 상세 설명
  - 내용 수정인 경우: git diff 스타일 before(빨강)/after(초록) 블록
  - 시간 + commit SHA
- 범례: 텍스트는 Stone-800 이상 어두운 색 사용 (가독성 보장)

### 4.3 반응형

- 데스크톱: 카드 4열, 테이블+차트 나란히
- 태블릿: 카드 2열, 테이블/차트 세로 배치
- 모바일: 카드 1열, 테이블 가로 스크롤

---

## 5. 기술 스택

| 구분 | 스택 |
|------|------|
| 프레임워크 | React 19 + Vite 6 |
| 차트 | Chart.js 4 + react-chartjs-2 |
| 스타일 | Tailwind CSS 4 (Synapse Warm Intellectual 테마) |
| 라우팅 | React Router 7 (HashRouter — GitHub Pages 호환) |
| 빌드/배포 | GitHub Actions → Vite build → gh-pages 브랜치 |
| 데이터 | 정적 JSON fetch (`data/*.json`) |
| 폰트 | Fraunces (Display), Plus Jakarta Sans (Body), Geist Mono (Data) |

---

## 6. GitHub Actions 설계

### 6.1 서비스 레포: `parse-workflow.yml`

```yaml
name: Parse Workflow → Dashboard
on:
  push:
    branches: [main]
    paths:
      - 'docs/project-management/workflow/**'
      - 'docs/project-management/task/**'
      - 'docs/project-management/prd/**'
```

**동작**:
1. checkout 서비스 레포
2. checkout workflow-dashboard 레포 (DASHBOARD_TOKEN)
3. Node.js 스크립트 실행: WORKFLOW/TASK/PRD 파일 파싱
   - 체크박스 정규식: `/- \[([ x])\]/g`
   - Step 이름 정규식: `/^## Step \d+: (.+)$/m`
   - Phase 이름 정규식: `/^### \d+\.\d+ (.+)$/m`
4. 이전 `data/{repo}.json`과 diff → changelog 생성
5. history에 오늘 날짜 스냅샷 append (같은 날이면 덮어쓰기)
6. `data/{repo}.json` 갱신 + commit + push

### 6.2 대시보드 레포: `build.yml`

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]
    paths: ['data/**']
  workflow_dispatch:
```

**동작**:
1. checkout
2. `npm ci && npm run build`
3. `data/*.json`을 `dist/data/`에 복사
4. gh-pages 브랜치에 `dist/` 배포

---

## 7. 파서 스크립트 설계

### 7.1 `scripts/parse-workflow.mjs`

각 서비스 레포의 Actions에서 실행되는 Node.js 스크립트:

**입력**: 서비스 레포의 `docs/project-management/` 디렉토리
**출력**: `data/{repo}.json`

**파싱 로직**:
1. WORKFLOW 파일에서 Step/Phase/체크박스 추출
2. TASK 파일에서 Step 이름/상태/Done When 추출
3. PRD 파일에서 FR 항목 + 상태 추출 (Done When 체크 기반)
4. 이전 JSON 로드 → diff 계산 → changelog append
5. history 배열에 오늘 스냅샷 upsert

**diff 알고리즘**:
- Step 목록 비교: 이름 기준 매칭, 없으면 added/deleted
- 체크박스 비교: (total, done) 튜플 비교, done 증가면 check_done, 감소면 check_undone
- 텍스트 비교: Step 내 필드(Goal, Scope, Constraints 등) 문자열 비교, 다르면 step_modified + before/after

### 7.2 `scripts/parse-prd.mjs`

PRD 파일에서 요구사항 항목 추출:
- `| FR-XX-NNN |` 패턴으로 항목 파싱
- 상태 판단: TASK의 해당 Step 상태 기반 (Done→done, In Progress→in_progress, Not Started→not_started)

---

## 8. React 컴포넌트 구조

```
src/
├── App.tsx                 # HashRouter + 라우팅
├── pages/
│   ├── Dashboard.tsx       # 메인: 카드 그리드 + 테이블 + 차트
│   └── Detail.tsx          # 상세: PRD/TASK/WORKFLOW + 변경 이력
├── components/
│   ├── Header.tsx          # 다크 헤더 (로고 + 전체 진행률)
│   ├── TrackCard.tsx       # 트랙별 카드 (진행률 + 미니 막대)
│   ├── ProgressTable.tsx   # 주차×트랙 테이블
│   ├── TimelineChart.tsx   # Chart.js 라인 차트
│   ├── PrdColumn.tsx       # PRD 요구사항 목록
│   ├── TaskColumn.tsx      # TASK Step 카드 목록
│   ├── WorkflowColumn.tsx  # WORKFLOW 10단계 체크리스트
│   ├── ChangelogTab.tsx    # 변경 이력 타임라인
│   └── WeekTabs.tsx        # W1~W5 주차 탭
├── hooks/
│   └── useData.ts          # data/*.json fetch + 병합
├── types/
│   └── index.ts            # TypeScript 타입 정의
├── theme/
│   └── tailwind.config.ts  # Synapse Warm Intellectual 커스텀 테마
└── data/                   # 빌드 시 복사되는 JSON (gitignore, CI에서 주입)
```

---

## 9. 디자인 테마

Synapse Warm Intellectual (DESIGN.md) 적용:

| 요소 | 값 |
|------|-----|
| 액센트 | Warm Amber #D97706 |
| 배경 | Stone-50 #FAFAF9 |
| 카드 배경 | White |
| 다크 헤더 | Stone-900 #1C1917 → Stone-800 #292524 그라데이션 |
| 텍스트 | Stone-800 #292524 (본문), Stone-500 #78716C (보조) |
| 성공 | Green-600 #16A34A |
| 경고 | Amber-500 #F59E0B |
| 위험 | Red-600 #DC2626 |
| 정보 | Sky-500 #0EA5E9 |
| Display 폰트 | Fraunces (헤더, 큰 숫자) |
| Body 폰트 | Plus Jakarta Sans (테이블, 본문) |
| Data 폰트 | Geist Mono (commit SHA, 수치) |

---

## 10. 배포 매핑

### 10.1 서비스 레포에 추가되는 파일

각 서비스 레포 (6개):
- `.github/workflows/parse-workflow.yml` — Actions 워크플로
- `scripts/parse-workflow.mjs` — 파서 스크립트
- `scripts/parse-prd.mjs` — PRD 파서
- Repository secret: `DASHBOARD_TOKEN`

### 10.2 dashboard 레포 구조

```
workflow-dashboard/
├── .github/workflows/build.yml
├── data/                          # 서비스 레포에서 push되는 JSON
│   ├── synapse-platform-svc.json
│   ├── synapse-engagement-svc.json
│   ├── synapse-knowledge-svc.json
│   ├── synapse-learning-svc.json
│   ├── synapse-frontend.json
│   └── synapse-shared.json
├── src/                           # React 소스
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| v1.0 | 2026-05-12 | Synapse Team | 초안. Push 모델 + React/Vite + 카드 그리드/테이블/차트 + 상세 드릴다운(PRD/TASK/WORKFLOW) + 변경 이력 추적. |
