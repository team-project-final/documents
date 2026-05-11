# Design Spec: Synapse 일정관리 페이지

> **Date:** 2026-05-11  
> **Status:** Approved  
> **Author:** velka + Claude  
> **배포 레포:** https://github.com/team-project-final/schedule.git  
> **배포 URL:** GitHub Pages (`https://team-project-final.github.io/schedule/`)

---

## 1. 목적

프로젝트 관리 문서(60개)를 기반으로, 팀 전체 일정을 **한눈에 공유**하는 웹 페이지를 만든다.

### 핵심 목표
- **인터랙티브 관리**: 상태 변경 + 코멘트/이슈 기록 (GitHub OAuth 인증 후)
- **프레젠테이션**: 교수/외부에게 프로젝트 진행 상황을 보여주는 포트폴리오
- 읽기는 공개, 수정은 팀원만

---

## 2. 기술 스택

| 항목 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | **React 18** | 생태계 최대, Gantt/칸반 라이브러리 풍부 |
| 빌드 도구 | **Vite** | 빠른 빌드, GitHub Pages 정적 export |
| 라우팅 | **React Router v6** | SPA 라우팅 |
| 상태관리 | **Zustand** | 가벼운 전역 상태 (JSON 데이터 캐시) |
| Gantt 차트 | **@neuronicx/gantt-task-react** 또는 커스텀 SVG | 타임라인 시각화 |
| 칸반 | **@hello-pangea/dnd** (react-beautiful-dnd fork) | 드래그 & 드롭 |
| 인증 | **GitHub OAuth App** | 팀원 식별 + API 커밋 |
| 배포 | **GitHub Pages** (gh-pages branch) | 무료 정적 호스팅 |
| 스타일링 | **Tailwind CSS** | 유틸리티 퍼스트, 클린 화이트 구현 용이 |

---

## 3. 데이터 구조

### 3.1 데이터 소스

- **주 데이터**: `schedule` 레포 `src/data/*.json`
- **초기 데이터**: `documents` 레포 MD 파일에서 `scripts/sync-from-md.js`로 파싱하여 JSON 생성
- **실시간 수정**: GitHub OAuth 인증 후 GitHub Contents API로 JSON 파일 커밋

### 3.2 JSON 스키마

#### members.json
```json
[
  {
    "id": "team-lead",
    "handle": "@team-lead",
    "role": "팀장",
    "track": "—",
    "service": "Gateway / 인프라",
    "modules": ["Schema Registry", "ArgoCD", "CI/CD"],
    "avatar": "https://github.com/username.png"
  }
]
```

#### tasks.json
```json
[
  {
    "id": "team-lead-step-1",
    "memberId": "team-lead",
    "week": "W1",
    "stepNumber": 1,
    "name": "AWS 인프라 프로비저닝",
    "goal": "팀장이 AWS 인프라를 프로비저닝하여 4-서비스 배포 기반을 확보한다.",
    "status": "not_started",
    "startDate": null,
    "endDate": null,
    "durationDays": 2,
    "plannedStart": "2026-05-12",
    "plannedEnd": "2026-05-13",
    "priority": "P0",
    "comments": [],
    "dependencies": []
  }
]
```

#### comments (tasks.json 내 배열)
```json
{
  "author": "github-username",
  "text": "EKS 프로비저닝 지연 — IAM 권한 이슈",
  "timestamp": "2026-05-12T14:30:00Z"
}
```

#### schedule.json
```json
{
  "weeks": [
    {
      "id": "W1",
      "name": "인프라 + 핵심 CRUD",
      "startDate": "2026-05-12",
      "endDate": "2026-05-16",
      "goals": ["DB 스키마", "4-서비스 골격", "기본 CRUD"],
      "successCriteria": [
        { "text": "Docker Compose 4-서비스 로컬 실행", "checked": false },
        { "text": "각 서비스 Health endpoint 동작", "checked": false }
      ]
    }
  ]
}
```

---

## 4. 페이지 구조

### 4.1 라우팅

| 경로 | 뷰 | 설명 |
|------|-----|------|
| `/` | 대시보드 (Gantt) | 기본 랜딩 — 4주 Gantt 타임라인 |
| `/kanban` | 칸반 보드 | 드래그&드롭 상태 관리 |
| `/weekly/:weekId` | 주차별 상세 | W1~W4 PRD + 진행 상태 |
| `/member/:memberId` | 담당자 상세 (선택) | 특정 담당자 전체 현황 |
| `/login/callback` | OAuth 콜백 | GitHub OAuth 처리 |

### 4.2 레이아웃

```
┌─────────────────────────────────────────────────┐
│  헤더: Synapse Schedule | Gantt | Kanban | Weekly │
│  [로그인 버튼 / 아바타]                            │
├─────────────────────────────────────────────────┤
│                                                   │
│  메인 콘텐츠 영역                                   │
│  (Gantt / Kanban / Weekly 중 선택된 뷰)            │
│                                                   │
├─────────────────────────────────────────────────┤
│  푸터: 진행률 요약 바 | 최종 업데이트 시각            │
└─────────────────────────────────────────────────┘
```

### 4.3 3개 핵심 뷰 상세

#### Gantt 차트 (메인 / 프레젠테이션)
- X축: 4주 타임라인 (05-12 ~ 06-06), 일 단위 그리드
- Y축: 담당자 8명 (team-lead ~ frontend)
- 바(bar): 각 Step의 plannedStart~plannedEnd
- 색상: 상태별 (회색=Not Started, 파랑=In Progress, 초록=Done)
- 오늘 표시: 빨간 세로선
- 호버: Step 이름 + Goal 툴팁
- 클릭: 상세 패널 슬라이드아웃

#### 칸반 보드 (인터랙티브 관리)
- 3열: Not Started | In Progress | Done
- 카드: Step 이름, 담당자 아바타, 주차 뱃지, 우선순위 태그
- 드래그&드롭: 열 간 이동 → 상태 변경 → JSON 커밋 (OAuth 필요)
- 필터: 담당자별 / 주차별
- 카드 클릭: 상세 모달 (Goal, Done When, 코멘트 목록, 메모 추가)

#### 주차별 뷰 (상세 확인)
- 탭: W1 | W2 | W3 | W4
- 상단: 주차 목표 + 성공 기준 체크리스트
- 하단: 담당자별 접이식(Accordion) 패널
  - 각 패널: Step 목록 (상태 뱃지, 진행 바, 코멘트 수)
- 성공 기준 체크: OAuth 인증 시 직접 체크 가능

---

## 5. 인증 흐름

```
[GitHub Pages] → "로그인" 클릭
    ↓
[GitHub OAuth] → authorize → callback → access_token
    ↓
[프론트엔드] → token 저장 (sessionStorage)
    ↓
[수정 시] → GitHub Contents API → data/tasks.json PUT → 커밋
```

### 권한
- **읽기**: 누구나 (공개 GitHub Pages)
- **수정**: GitHub OAuth 로그인 + `team-project-final` org 멤버 확인
- **OAuth App**: GitHub Settings에서 등록, `VITE_GITHUB_CLIENT_ID` 환경변수

---

## 6. MD → JSON 동기화 스크립트

```
scripts/sync-from-md.js

입력: documents 레포의 docs/project-management/ (60개 MD 파일)
출력: src/data/members.json, tasks.json, schedule.json

파싱 로직:
- SCOPE_*.md → members.json (담당자 정보, 주차별 매트릭스)
- TASK_*.md → tasks.json (Step 필드 추출: name, goal, status, duration)
- PRD_W*.md → schedule.json (주차 목표, 성공 기준)
- HISTORY_*.md → tasks.json의 startDate/endDate/comments 반영

실행: node scripts/sync-from-md.js --input ../documents/docs/project-management --output src/data
```

---

## 7. 디자인 시스템

### 색상
| 용도 | 값 |
|------|-----|
| 배경 | `#f8fafc` (slate-50) |
| 표면 | `#ffffff` (카드, 모달) |
| 텍스트 | `#0f172a` (slate-900) |
| 텍스트 보조 | `#64748b` (slate-500) |
| 액센트 (주요) | `#2563eb` (blue-600) |
| 액센트 호버 | `#1d4ed8` (blue-700) |
| 성공/Done | `#16a34a` (green-600) |
| 진행/In Progress | `#2563eb` (blue-600) |
| 대기/Not Started | `#94a3b8` (slate-400) |
| 위험/Blocked | `#dc2626` (red-600) |
| 경고 | `#f59e0b` (amber-500) |
| 경계선 | `#e2e8f0` (slate-200) |

### 타이포그래피
| 용도 | 폰트 | 크기 |
|------|------|------|
| 제목 | Inter 700 | 24px |
| 소제목 | Inter 600 | 18px |
| 본문 | Inter 400 | 14px |
| 라벨 | Inter 500 | 12px |
| 데이터/날짜 | JetBrains Mono 400 | 13px |

### 반응형
| 브레이크포인트 | 레이아웃 |
|--------------|---------|
| < 768px | 모바일: 탭 내비게이션, Gantt 가로 스크롤, 칸반 1열 |
| 768~1280px | 태블릿: Gantt 축소, 칸반 3열 |
| > 1280px | 데스크톱: 전체 레이아웃 |

---

## 8. 빌드 & 배포

```bash
# 개발
npm run dev          # Vite dev server (localhost:5173)

# 빌드
npm run build        # dist/ 생성

# 배포 (GitHub Pages)
npm run deploy       # gh-pages branch에 push
```

### GitHub Actions 자동 배포
```
main push → npm ci → npm run build → gh-pages branch deploy
```

---

## 9. 파일 구조

```
schedule/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Pages 자동 배포
├── scripts/
│   └── sync-from-md.js            # MD → JSON 변환
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── GanttChart/
│   │   │   ├── GanttChart.jsx     # 메인 Gantt 뷰
│   │   │   ├── GanttBar.jsx       # 개별 바
│   │   │   ├── GanttTimeline.jsx  # X축 날짜 헤더
│   │   │   └── GanttTooltip.jsx   # 호버 상세
│   │   ├── KanbanBoard/
│   │   │   ├── KanbanBoard.jsx    # 3열 보드
│   │   │   ├── KanbanColumn.jsx   # 단일 열
│   │   │   ├── KanbanCard.jsx     # 드래그 가능 카드
│   │   │   └── TaskDetailModal.jsx # 상세 모달
│   │   ├── WeeklyView/
│   │   │   ├── WeeklyView.jsx     # 탭 + 주차 상세
│   │   │   ├── WeekTab.jsx        # 주차 탭
│   │   │   └── MemberAccordion.jsx # 담당자별 접이식
│   │   ├── Auth/
│   │   │   ├── LoginButton.jsx
│   │   │   └── OAuthCallback.jsx
│   │   └── common/
│   │       ├── StatusBadge.jsx     # 상태 뱃지
│   │       ├── ProgressBar.jsx     # 진행률 바
│   │       ├── CommentList.jsx     # 코멘트 목록
│   │       └── MemberAvatar.jsx    # 아바타
│   ├── data/
│   │   ├── members.json
│   │   ├── tasks.json
│   │   ├── schedule.json
│   │   └── history.json
│   ├── hooks/
│   │   ├── useGitHub.js           # GitHub API 커밋
│   │   ├── useAuth.js             # OAuth 상태
│   │   └── useData.js             # JSON fetch + 캐시
│   ├── stores/
│   │   └── store.js               # Zustand 전역 상태
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── statusUtils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Tailwind 설정
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 10. 구현 순서

1. 프로젝트 초기화 (Vite + React + Tailwind + 라우팅)
2. JSON 데이터 구조 + 샘플 데이터
3. MD → JSON 동기화 스크립트
4. 공통 컴포넌트 (Layout, StatusBadge, ProgressBar)
5. Gantt 차트 뷰
6. 칸반 보드 뷰 (드래그&드롭)
7. 주차별 뷰
8. GitHub OAuth 인증
9. 인터랙티브 수정 (상태 변경 + 코멘트 → GitHub API 커밋)
10. GitHub Actions 배포
11. 최종 검증 + README

---

## 11. 성공 기준

- [ ] 3개 뷰(Gantt/칸반/주차별) 모두 렌더링
- [ ] 60개 문서 데이터가 정확히 표시 (8명 × W1~W4)
- [ ] 칸반 드래그&드롭 → 상태 변경 동작
- [ ] GitHub OAuth → 코멘트 추가 → JSON 커밋 동작
- [ ] GitHub Pages 배포 + 공개 접근 가능
- [ ] 모바일/태블릿/데스크톱 반응형 동작
- [ ] 프레젠테이션용 Gantt가 시각적으로 깔끔
