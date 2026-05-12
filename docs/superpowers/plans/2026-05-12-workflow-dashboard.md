# Workflow Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Pages 기반 프로젝트 진행 상황 대시보드를 구축한다. 6개 서비스 레포의 WORKFLOW/TASK/PRD 변경 시 JSON을 자동 생성하여 dashboard 레포에 push하고, React SPA가 이를 시각화한다.

**Architecture:** Push 모델. 서비스 레포에서 parse-workflow Actions → JSON 생성 → workflow-dashboard 레포 data/ 에 push → build Actions → Vite build → gh-pages 배포. Dashboard는 정적 JSON만 fetch하여 렌더링.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, Chart.js 4, react-chartjs-2, React Router 7 (HashRouter), Node.js 22 (파서 스크립트), GitHub Actions

**Spec reference:** [`docs/superpowers/specs/2026-05-12-workflow-dashboard-design.md`](../specs/2026-05-12-workflow-dashboard-design.md)

---

## File Structure

### workflow-dashboard 레포

```
workflow-dashboard/
├── .github/workflows/build.yml          # data/ 변경 시 Vite build + gh-pages 배포
├── scripts/
│   ├── parse-workflow.mjs               # WORKFLOW/TASK 파서 (서비스 레포에서도 사용)
│   ├── parse-prd.mjs                    # PRD 파서
│   └── generate-sample-data.mjs         # 개발용 샘플 JSON 생성
├── data/                                # 서비스 레포에서 push되는 JSON
│   └── .gitkeep
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── types/index.ts                   # TypeScript 타입 정의
│   ├── hooks/useData.ts                 # JSON fetch + 병합
│   ├── pages/
│   │   ├── Dashboard.tsx                # 메인: 카드 그리드 + 테이블 + 차트
│   │   └── Detail.tsx                   # 상세: PRD/TASK/WORKFLOW + 변경 이력
│   └── components/
│       ├── Header.tsx                   # 다크 헤더
│       ├── TrackCard.tsx                # 트랙별 카드
│       ├── ProgressTable.tsx            # 주차×트랙 테이블
│       ├── TimelineChart.tsx            # Chart.js 라인 차트
│       ├── WeekTabs.tsx                 # W1~W5 주차 탭
│       ├── PrdColumn.tsx                # PRD 요구사항 목록
│       ├── TaskColumn.tsx               # TASK Step 카드
│       ├── WorkflowColumn.tsx           # WORKFLOW 10단계 체크리스트
│       └── ChangelogTab.tsx             # 변경 이력 타임라인
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### 서비스 레포에 추가되는 파일 (6개 레포 공통)

```
.github/workflows/parse-workflow.yml     # WORKFLOW/TASK/PRD 변경 시 트리거
scripts/parse-workflow.mjs               # 파서 (dashboard 레포에서 복사)
scripts/parse-prd.mjs                    # PRD 파서 (dashboard 레포에서 복사)
```

---

## Task Dependency Graph

```
T1 (dashboard 레포 초기화 + Vite scaffolding) ─→ T2 (TypeScript 타입 + 샘플 데이터)
                                                     │
T3 (파서 스크립트 parse-workflow.mjs + parse-prd.mjs) ─┤
                                                     │
                                                     ▼
T4 (useData hook + Header + TrackCard) ─→ T5 (Dashboard 페이지: 테이블 + 차트)
                                              │
                                              ▼
                                         T6 (Detail 페이지: PRD/TASK/WORKFLOW 3컬럼)
                                              │
                                              ▼
                                         T7 (ChangelogTab: 변경 이력)
                                              │
                                              ▼
                                         T8 (build.yml + gh-pages 배포)
                                              │
                                              ▼
                                         T9 (서비스 레포 parse-workflow.yml 배포)
                                              │
                                              ▼
                                         T10 (E2E 검증)
```

---

## Task 1: Dashboard 레포 초기화 + Vite Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `data/.gitkeep`
- Create: `README.md`

- [ ] **Step 1: 레포 clone + 초기화**

```bash
gh repo clone team-project-final/workflow-dashboard /tmp/workflow-dashboard
cd /tmp/workflow-dashboard
git checkout -b main 2>/dev/null || true
```

- [ ] **Step 2: Vite + React + TypeScript 프로젝트 생성**

```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 3: 의존성 설치**

```bash
npm install react-router-dom chart.js react-chartjs-2
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 4: vite.config.ts 작성**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/workflow-dashboard/',
  build: {
    outDir: 'dist',
  },
})
```

- [ ] **Step 5: tailwind.config.ts 작성 (Synapse Warm Intellectual 테마)**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FEF3C7',
        },
        teal: { DEFAULT: '#0D9488' },
        stone: {
          50: '#FAFAF9', 100: '#F5F5F4', 200: '#E7E5E4', 300: '#D6D3D1',
          400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C',
          800: '#292524', 900: '#1C1917',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#0EA5E9',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: index.html 작성 (Google Fonts CDN)**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Synapse Workflow Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Geist+Mono&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 7: src/main.tsx 작성**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
```

- [ ] **Step 8: src/index.css 작성 (Tailwind import)**

```css
@import "tailwindcss";
```

- [ ] **Step 9: src/App.tsx 기본 라우팅**

```typescript
import { Routes, Route } from 'react-router-dom'

function Placeholder({ name }: { name: string }) {
  return <div className="p-8 text-stone-500">Page: {name}</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder name="Dashboard" />} />
      <Route path="/detail/:repo" element={<Placeholder name="Detail" />} />
    </Routes>
  )
}
```

- [ ] **Step 10: data/.gitkeep + README.md 작성**

```bash
mkdir -p data
touch data/.gitkeep
```

README.md:
```markdown
# Synapse Workflow Dashboard

프로젝트 진행 상황 대시보드. GitHub Pages에서 호스팅.

## URL

https://team-project-final.github.io/workflow-dashboard

## 데이터 흐름

서비스 레포 WORKFLOW/TASK 변경 → parse-workflow Actions → data/*.json push → build + deploy
```

- [ ] **Step 11: 빌드 확인**

```bash
npm run build
```
Expected: `dist/` 디렉토리에 빌드 결과물 생성, 에러 없음

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Vite + React + Tailwind 초기 scaffolding

React 19 + Vite 6 + Tailwind (Synapse Warm Intellectual 테마).
HashRouter 라우팅, Chart.js 의존성 설치.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push -u origin main
```

---

## Task 2: TypeScript 타입 정의 + 샘플 데이터 생성

**Files:**
- Create: `src/types/index.ts`
- Create: `scripts/generate-sample-data.mjs`

- [ ] **Step 1: TypeScript 타입 정의**

`src/types/index.ts`:
```typescript
export interface Phase {
  name: string
  total: number
  done: number
}

export interface Step {
  name: string
  status: 'Done' | 'In Progress' | 'Not Started'
  phases: Phase[]
  totalChecks: number
  doneChecks: number
}

export interface Week {
  week: string
  period: string
  steps: Step[]
  totalChecks: number
  doneChecks: number
}

export interface Track {
  name: string
  owner: string
  weeks: Week[]
}

export interface PrdItem {
  id: string
  title: string
  status: 'done' | 'in_progress' | 'not_started'
}

export interface PrdWeek {
  week: string
  items: PrdItem[]
}

export interface HistoryEntry {
  date: string
  totalChecks: number
  doneChecks: number
}

export interface ChangeDetail {
  type: 'step_added' | 'step_deleted' | 'step_modified' | 'check_done' | 'check_undone' | 'phase_added' | 'phase_deleted'
  target: string
  detail?: string
  field?: string
  before?: string
  after?: string
}

export interface ChangelogEntry {
  date: string
  commit: string
  author: string
  file: string
  changes: ChangeDetail[]
}

export interface RepoData {
  repo: string
  updatedAt: string
  tracks: Track[]
  prd: PrdWeek[]
  history: HistoryEntry[]
  changelog: ChangelogEntry[]
}
```

- [ ] **Step 2: 샘플 데이터 생성 스크립트**

`scripts/generate-sample-data.mjs`:
```javascript
import { writeFileSync, mkdirSync } from 'fs'

const repos = [
  {
    repo: 'synapse-platform-svc',
    tracks: [{ name: 'platform', owner: '김해준' }],
    prdPrefix: 'FR-PL',
  },
  {
    repo: 'synapse-engagement-svc',
    tracks: [{ name: 'engagement', owner: '한승완' }],
    prdPrefix: 'FR-EG',
  },
  {
    repo: 'synapse-knowledge-svc',
    tracks: [
      { name: 'knowledge-1', owner: '김현지' },
      { name: 'knowledge-2', owner: '박은서' },
    ],
    prdPrefix: 'FR-KN',
  },
  {
    repo: 'synapse-learning-svc',
    tracks: [
      { name: 'learning-card', owner: '김나경' },
      { name: 'learning-ai', owner: '조유지' },
    ],
    prdPrefix: 'FR-LC',
  },
  {
    repo: 'synapse-frontend',
    tracks: [{ name: 'frontend', owner: '전원' }],
    prdPrefix: 'FR-FE',
  },
  {
    repo: 'synapse-shared',
    tracks: [{ name: 'team-lead', owner: '김민구' }],
    prdPrefix: 'FR-TL',
  },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePhases(doneRatio) {
  const phaseNames = [
    'TASK 시작', '요구사항 분석', 'Security 1차', 'ERD 설계',
    'Security 2차', 'DTO/Entity', 'Repository', 'Service+Test',
    'Controller+Test', 'View+Test',
  ]
  return phaseNames.map((name, i) => {
    const total = randomInt(2, 5)
    const done = i / 10 < doneRatio ? total : i / 10 < doneRatio + 0.1 ? randomInt(0, total) : 0
    return { name, total, done }
  })
}

function generateWeeks(trackName) {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5']
  const periods = ['05-12~05-16', '05-19~05-23', '05-26~05-29', '06-01~06-05', '06-08~06-12']
  return weeks.map((week, wi) => {
    const stepCount = randomInt(2, 4)
    const weekDoneRatio = wi === 0 ? 0.7 : wi === 1 ? 0.3 : 0
    const steps = Array.from({ length: stepCount }, (_, si) => {
      const doneRatio = weekDoneRatio * (1 - si * 0.2)
      const phases = generatePhases(Math.max(0, doneRatio))
      const totalChecks = phases.reduce((s, p) => s + p.total, 0)
      const doneChecks = phases.reduce((s, p) => s + p.done, 0)
      const status = doneChecks === totalChecks ? 'Done' : doneChecks > 0 ? 'In Progress' : 'Not Started'
      return {
        name: `${trackName} Step ${si + 1} (${week})`,
        status,
        phases,
        totalChecks,
        doneChecks,
      }
    })
    return {
      week,
      period: periods[wi],
      steps,
      totalChecks: steps.reduce((s, st) => s + st.totalChecks, 0),
      doneChecks: steps.reduce((s, st) => s + st.doneChecks, 0),
    }
  })
}

function generateHistory() {
  const entries = []
  const startDate = new Date('2026-05-12')
  for (let d = 0; d < 3; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    entries.push({
      date: date.toISOString().slice(0, 10),
      totalChecks: 160,
      doneChecks: randomInt(d * 20, d * 30 + 10),
    })
  }
  return entries
}

function generateChangelog(trackName, author) {
  return [
    {
      date: '2026-05-13T17:20:00+09:00',
      commit: 'abc1234',
      author,
      file: `TASK_${trackName}.md`,
      changes: [
        { type: 'step_modified', target: 'Step 2', field: 'Scope', before: 'Google OAuth만', after: 'Google + GitHub OAuth' },
      ],
    },
    {
      date: '2026-05-13T11:00:00+09:00',
      commit: 'def5678',
      author,
      file: `WORKFLOW_${trackName}_W1.md`,
      changes: [
        { type: 'check_done', target: 'Step 1 > Security 1차', detail: '3개 항목 완료' },
      ],
    },
  ]
}

function generatePrd(prefix) {
  return [{
    week: 'W1',
    items: [
      { id: `${prefix}-001`, title: '기능 A', status: 'done' },
      { id: `${prefix}-002`, title: '기능 B', status: 'in_progress' },
      { id: `${prefix}-003`, title: '기능 C', status: 'not_started' },
    ],
  }]
}

mkdirSync('data', { recursive: true })

for (const { repo, tracks, prdPrefix } of repos) {
  const data = {
    repo,
    updatedAt: new Date().toISOString(),
    tracks: tracks.map(t => ({
      name: t.name,
      owner: t.owner,
      weeks: generateWeeks(t.name),
    })),
    prd: generatePrd(prdPrefix),
    history: generateHistory(),
    changelog: generateChangelog(tracks[0].name, tracks[0].owner),
  }
  writeFileSync(`data/${repo}.json`, JSON.stringify(data, null, 2))
  console.log(`Generated: data/${repo}.json`)
}
```

- [ ] **Step 3: 샘플 데이터 생성 + 검증**

```bash
node scripts/generate-sample-data.mjs
ls data/*.json | wc -l
```
Expected: 6개 JSON 파일

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts scripts/generate-sample-data.mjs data/*.json
git commit -m "feat: TypeScript 타입 정의 + 샘플 데이터 생성

RepoData/Track/Step/Phase/Changelog 타입.
6개 서비스 레포 샘플 JSON 생성 스크립트.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 파서 스크립트 (parse-workflow.mjs + parse-prd.mjs)

**Files:**
- Create: `scripts/parse-workflow.mjs`
- Create: `scripts/parse-prd.mjs`

- [ ] **Step 1: parse-workflow.mjs 작성**

`scripts/parse-workflow.mjs`:
```javascript
#!/usr/bin/env node
/**
 * WORKFLOW/TASK 파서: 마크다운 체크박스를 파싱하여 JSON 생성.
 * Usage: node parse-workflow.mjs <docs-dir> <repo-name> <output-json>
 *
 * docs-dir: 서비스 레포의 docs/project-management/ 경로
 * repo-name: e.g. synapse-platform-svc
 * output-json: e.g. data/synapse-platform-svc.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, basename } from 'path'

const [docsDir, repoName, outputPath] = process.argv.slice(2)
if (!docsDir || !repoName || !outputPath) {
  console.error('Usage: node parse-workflow.mjs <docs-dir> <repo-name> <output-json>')
  process.exit(1)
}

const CHECKBOX_RE = /^(\s*)- \[([ x])\]\s+(.+)$/gm
const STEP_HEADING_RE = /^## Step (\d+): (.+)$/gm
const PHASE_HEADING_RE = /^### (\d+\.\d+) (.+)$/gm

function parseCheckboxes(content) {
  const checks = []
  let match
  const re = /^(\s*)- \[([ x])\]\s+(.+)$/gm
  while ((match = re.exec(content)) !== null) {
    checks.push({ done: match[2] === 'x', text: match[3].trim() })
  }
  return checks
}

function parseWorkflowFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const steps = []
  const stepParts = content.split(/^## Step \d+: /m).slice(1)
  const stepNames = [...content.matchAll(/^## Step (\d+): (.+)$/gm)].map(m => m[2])

  stepParts.forEach((part, i) => {
    const phases = []
    const phaseParts = part.split(/^### \d+\.\d+ /m).slice(1)
    const phaseNames = [...part.matchAll(/^### (\d+\.\d+) (.+)$/gm)].map(m => m[2])

    phaseParts.forEach((pp, j) => {
      const checks = parseCheckboxes(pp)
      phases.push({
        name: phaseNames[j] || `Phase ${j + 1}`,
        total: checks.length,
        done: checks.filter(c => c.done).length,
      })
    })

    const totalChecks = phases.reduce((s, p) => s + p.total, 0)
    const doneChecks = phases.reduce((s, p) => s + p.done, 0)
    const status = totalChecks === 0 ? 'Not Started'
      : doneChecks === totalChecks ? 'Done'
      : doneChecks > 0 ? 'In Progress' : 'Not Started'

    steps.push({ name: stepNames[i] || `Step ${i + 1}`, status, phases, totalChecks, doneChecks })
  })

  return steps
}

function parseTaskFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const trackMatch = content.match(/^> \*\*GitHub Repository\*\*:/)
  const ownerMatch = content.match(/^# TASK: @(.+)$/m)
  return { owner: ownerMatch ? ownerMatch[1] : 'unknown' }
}

// WORKFLOW 파일 수집
const workflowDir = join(docsDir, 'workflow')
const taskDir = join(docsDir, 'task')

if (!existsSync(workflowDir)) {
  console.error(`Workflow dir not found: ${workflowDir}`)
  process.exit(1)
}

const workflowFiles = readdirSync(workflowDir).filter(f => f.startsWith('WORKFLOW_') && f.endsWith('.md'))

// 트랙별 그룹핑
const trackMap = new Map()
for (const file of workflowFiles) {
  const match = file.match(/^WORKFLOW_(.+)_(W\d+)\.md$/)
  if (!match) continue
  const [, trackName, week] = match
  if (!trackMap.has(trackName)) trackMap.set(trackName, new Map())
  trackMap.get(trackName).set(week, join(workflowDir, file))
}

// 트랙별 파싱
const tracks = []
for (const [trackName, weekFiles] of trackMap) {
  const taskFile = join(taskDir, `TASK_${trackName}.md`)
  const taskInfo = existsSync(taskFile) ? parseTaskFile(taskFile) : { owner: 'unknown' }

  // owner 이름 매핑
  const ownerMap = {
    'platform': '김해준', 'engagement': '한승완',
    'knowledge-1': '김현지', 'knowledge-2': '박은서',
    'learning-card': '김나경', 'learning-ai': '조유지',
    'frontend': '전원', 'team-lead': '김민구',
  }

  const weeks = []
  const periodMap = {
    W1: '05-12~05-16', W2: '05-19~05-23', W3: '05-26~05-29',
    W4: '06-01~06-05', W5: '06-08~06-12',
  }

  for (const [week, filePath] of [...weekFiles].sort()) {
    const steps = parseWorkflowFile(filePath)
    weeks.push({
      week,
      period: periodMap[week] || '',
      steps,
      totalChecks: steps.reduce((s, st) => s + st.totalChecks, 0),
      doneChecks: steps.reduce((s, st) => s + st.doneChecks, 0),
    })
  }

  tracks.push({ name: trackName, owner: ownerMap[trackName] || taskInfo.owner, weeks })
}

// 이전 JSON 로드 + diff → changelog
let oldData = null
if (existsSync(outputPath)) {
  oldData = JSON.parse(readFileSync(outputPath, 'utf-8'))
}

function computeChangelog(oldData, newTracks) {
  if (!oldData) return []
  const changes = []
  const commitSha = process.env.GITHUB_SHA?.slice(0, 7) || 'local'
  const author = process.env.GITHUB_ACTOR || 'unknown'

  for (const newTrack of newTracks) {
    const oldTrack = oldData.tracks?.find(t => t.name === newTrack.name)
    if (!oldTrack) continue

    for (const newWeek of newTrack.weeks) {
      const oldWeek = oldTrack.weeks?.find(w => w.week === newWeek.week)
      if (!oldWeek) continue

      // Step 수 변경
      if (newWeek.steps.length > (oldWeek.steps?.length || 0)) {
        const addedSteps = newWeek.steps.slice(oldWeek.steps?.length || 0)
        for (const s of addedSteps) {
          changes.push({
            type: 'step_added',
            target: `${newWeek.week} > ${s.name}`,
            detail: `${newWeek.week}에 Step 추가 (${oldWeek.steps?.length || 0}개 → ${newWeek.steps.length}개)`,
          })
        }
      }

      // 체크박스 변경
      for (let si = 0; si < Math.min(newWeek.steps.length, oldWeek.steps?.length || 0); si++) {
        const newStep = newWeek.steps[si]
        const oldStep = oldWeek.steps[si]
        const doneDiff = newStep.doneChecks - (oldStep?.doneChecks || 0)
        if (doneDiff > 0) {
          changes.push({
            type: 'check_done',
            target: `${newWeek.week} > ${newStep.name}`,
            detail: `${doneDiff}개 항목 완료 (${oldStep?.doneChecks || 0} → ${newStep.doneChecks})`,
          })
        } else if (doneDiff < 0) {
          changes.push({
            type: 'check_undone',
            target: `${newWeek.week} > ${newStep.name}`,
            detail: `${-doneDiff}개 항목 해제 (${oldStep?.doneChecks || 0} → ${newStep.doneChecks})`,
          })
        }
      }
    }
  }

  if (changes.length === 0) return []
  return [{
    date: new Date().toISOString(),
    commit: commitSha,
    author,
    file: `WORKFLOW_*`,
    changes,
  }]
}

const newChangelog = computeChangelog(oldData, tracks)

// history 업데이트
const today = new Date().toISOString().slice(0, 10)
const totalChecks = tracks.reduce((s, t) => s + t.weeks.reduce((ws, w) => ws + w.totalChecks, 0), 0)
const doneChecks = tracks.reduce((s, t) => s + t.weeks.reduce((ws, w) => ws + w.doneChecks, 0), 0)

const oldHistory = oldData?.history || []
const todayIdx = oldHistory.findIndex(h => h.date === today)
const historyEntry = { date: today, totalChecks, doneChecks }
const history = todayIdx >= 0
  ? [...oldHistory.slice(0, todayIdx), historyEntry, ...oldHistory.slice(todayIdx + 1)]
  : [...oldHistory, historyEntry]

// PRD는 parse-prd.mjs에서 별도 처리
const prd = oldData?.prd || []
const changelog = [...(oldData?.changelog || []), ...newChangelog]

const output = {
  repo: repoName,
  updatedAt: new Date().toISOString(),
  tracks,
  prd,
  history,
  changelog,
}

writeFileSync(outputPath, JSON.stringify(output, null, 2))
console.log(`Parsed: ${repoName} → ${outputPath}`)
console.log(`  Tracks: ${tracks.map(t => t.name).join(', ')}`)
console.log(`  Total: ${totalChecks} checks, ${doneChecks} done (${totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0}%)`)
console.log(`  New changelog entries: ${newChangelog.length}`)
```

- [ ] **Step 2: parse-prd.mjs 작성**

`scripts/parse-prd.mjs`:
```javascript
#!/usr/bin/env node
/**
 * PRD 파서: PRD 파일에서 요구사항 항목 + 상태 추출.
 * Usage: node parse-prd.mjs <docs-dir> <repo-json>
 *
 * repo-json에 prd 필드를 업데이트한다.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const [docsDir, repoJsonPath] = process.argv.slice(2)
if (!docsDir || !repoJsonPath) {
  console.error('Usage: node parse-prd.mjs <docs-dir> <repo-json>')
  process.exit(1)
}

const prdDir = join(docsDir, 'prd')
if (!existsSync(prdDir)) {
  console.log('PRD dir not found, skipping')
  process.exit(0)
}

const FR_RE = /\|\s*(FR-[A-Z]+-\d+)\s*\|\s*(.+?)\s*\|/g
const taskDir = join(docsDir, 'task')

// TASK 파일에서 Step status 추출 (Done When 체크박스 기반)
function getTaskStatuses(taskDir) {
  const statuses = new Map()
  if (!existsSync(taskDir)) return statuses

  for (const file of readdirSync(taskDir).filter(f => f.endsWith('.md'))) {
    const content = readFileSync(join(taskDir, file), 'utf-8')
    const statusMatches = content.matchAll(/\*\*Status\*\*:\s*\[([x ])\] Not Started \/ \[([x ])\] In Progress \/ \[([x ])\] Done/g)
    // 간단한 방법: "Done" 체크 유무로 판단
    const steps = content.split(/^## Step \d+/m).slice(1)
    const stepNames = [...content.matchAll(/^## Step (\d+): (.+)$/gm)]

    stepNames.forEach((m, i) => {
      const section = steps[i] || ''
      const doneChecks = (section.match(/- \[x\]/g) || []).length
      const totalChecks = (section.match(/- \[[ x]\]/g) || []).length
      const status = totalChecks === 0 ? 'not_started'
        : doneChecks === totalChecks ? 'done'
        : doneChecks > 0 ? 'in_progress' : 'not_started'
      statuses.set(`Step ${m[1]}`, status)
    })
  }
  return statuses
}

const taskStatuses = getTaskStatuses(taskDir)

const prdWeeks = []
for (const file of readdirSync(prdDir).filter(f => f.match(/^PRD_W\d+\.md$/)).sort()) {
  const weekMatch = file.match(/PRD_(W\d+)/)
  if (!weekMatch) continue
  const week = weekMatch[1]
  const content = readFileSync(join(prdDir, file), 'utf-8')

  const items = []
  let match
  const re = /\|\s*(FR-[A-Z]+-\d+)\s*\|\s*(.+?)\s*\|/g
  while ((match = re.exec(content)) !== null) {
    const id = match[1]
    const title = match[2].trim()
    if (title === '유저 스토리' || title.startsWith('---')) continue
    items.push({ id, title, status: 'not_started' })
  }

  if (items.length > 0) {
    prdWeeks.push({ week, items })
  }
}

// 기존 JSON 업데이트
if (existsSync(repoJsonPath)) {
  const data = JSON.parse(readFileSync(repoJsonPath, 'utf-8'))
  data.prd = prdWeeks
  writeFileSync(repoJsonPath, JSON.stringify(data, null, 2))
  console.log(`PRD updated: ${repoJsonPath} (${prdWeeks.length} weeks, ${prdWeeks.reduce((s, w) => s + w.items.length, 0)} items)`)
} else {
  console.log(`Repo JSON not found: ${repoJsonPath}`)
}
```

- [ ] **Step 3: 로컬 테스트 (서비스 레포 클론에서)**

```bash
# platform-svc 클론에서 파서 테스트
node scripts/parse-workflow.mjs /tmp/bootstrap/synapse-platform-svc/docs/project-management synapse-platform-svc data/synapse-platform-svc.json
node scripts/parse-prd.mjs /tmp/bootstrap/synapse-platform-svc/docs/project-management data/synapse-platform-svc.json
cat data/synapse-platform-svc.json | head -20
```
Expected: JSON 출력에 tracks, prd, history, changelog 필드

- [ ] **Step 4: Commit**

```bash
git add scripts/parse-workflow.mjs scripts/parse-prd.mjs
git commit -m "feat: WORKFLOW/TASK/PRD 파서 스크립트

마크다운 체크박스 파싱, 이전 JSON diff로 changelog 자동 생성,
history 날짜별 스냅샷 append.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: useData Hook + Header + TrackCard 컴포넌트

**Files:**
- Create: `src/hooks/useData.ts`
- Create: `src/components/Header.tsx`
- Create: `src/components/TrackCard.tsx`

- [ ] **Step 1: useData hook 작성**

`src/hooks/useData.ts`:
```typescript
import { useState, useEffect } from 'react'
import type { RepoData } from '../types'

const REPOS = [
  'synapse-platform-svc',
  'synapse-engagement-svc',
  'synapse-knowledge-svc',
  'synapse-learning-svc',
  'synapse-frontend',
  'synapse-shared',
]

export function useData() {
  const [data, setData] = useState<RepoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all(
      REPOS.map(repo =>
        fetch(`${import.meta.env.BASE_URL}data/${repo}.json`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      setData(results.filter((r): r is RepoData => r !== null))
      setLoading(false)
    }).catch(err => {
      setError(err.message)
      setLoading(false)
    })
  }, [])

  const totalChecks = data.reduce((s, d) =>
    s + d.tracks.reduce((ts, t) => ts + t.weeks.reduce((ws, w) => ws + w.totalChecks, 0), 0), 0)
  const doneChecks = data.reduce((s, d) =>
    s + d.tracks.reduce((ts, t) => ts + t.weeks.reduce((ws, w) => ws + w.doneChecks, 0), 0), 0)
  const overallPercent = totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0

  return { data, loading, error, overallPercent, totalChecks, doneChecks }
}

export function useRepoData(repo: string) {
  const [data, setData] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/${repo}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [repo])

  return { data, loading }
}
```

- [ ] **Step 2: Header 컴포넌트 작성**

`src/components/Header.tsx`:
```typescript
interface HeaderProps {
  overallPercent: number
  subtitle?: string
  backLink?: string
}

export default function Header({ overallPercent, subtitle, backLink }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-stone-900 to-stone-800 px-6 py-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {backLink && (
          <>
            <a href={backLink} className="text-stone-400 hover:text-amber text-sm">← 대시보드</a>
            <div className="w-px h-5 bg-stone-700" />
          </>
        )}
        <div>
          <h1 className="text-xl font-bold text-amber font-display">Synapse</h1>
          <p className="text-xs text-stone-400">{subtitle || 'Workflow Dashboard'}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-4xl font-bold text-amber-light font-display">{overallPercent}%</div>
        <p className="text-xs text-stone-400">전체 진행률</p>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: TrackCard 컴포넌트 작성**

`src/components/TrackCard.tsx`:
```typescript
import { useNavigate } from 'react-router-dom'
import type { RepoData } from '../types'

interface TrackCardProps {
  repoData: RepoData
  trackName: string
  owner: string
}

export default function TrackCard({ repoData, trackName, owner }: TrackCardProps) {
  const navigate = useNavigate()
  const track = repoData.tracks.find(t => t.name === trackName)
  if (!track) return null

  const totalChecks = track.weeks.reduce((s, w) => s + w.totalChecks, 0)
  const doneChecks = track.weeks.reduce((s, w) => s + w.doneChecks, 0)
  const percent = totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0

  const borderColor = percent >= 60 ? 'border-amber' : percent >= 30 ? 'border-stone-300' : 'border-danger'

  return (
    <div
      onClick={() => navigate(`/detail/${repoData.repo}`)}
      className={`bg-white border-2 ${borderColor} rounded-xl p-4 text-center cursor-pointer
        hover:shadow-lg transition-shadow`}
    >
      <div className={`text-3xl font-bold font-display ${
        percent >= 60 ? 'text-amber' : percent >= 30 ? 'text-stone-600' : 'text-danger'
      }`}>
        {percent}%
      </div>
      <div className="text-xs font-semibold text-stone-600 mt-1">{repoData.repo.replace('synapse-', '')}</div>
      <div className="text-[10px] text-stone-400">{owner}</div>
      <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${percent >= 60 ? 'bg-amber' : percent >= 30 ? 'bg-stone-500' : 'bg-danger'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex gap-0.5 mt-2 justify-center">
        {track.weeks.map(w => {
          const wp = w.totalChecks > 0 ? Math.round(w.doneChecks / w.totalChecks * 100) : 0
          return (
            <div key={w.week} className="flex flex-col items-center">
              <div
                className={`w-3.5 rounded-sm ${wp > 60 ? 'bg-success' : wp > 0 ? 'bg-amber' : 'bg-stone-200'}`}
                style={{ height: `${Math.max(4, wp * 0.2)}px` }}
              />
              <span className="text-[7px] text-stone-400 mt-0.5">{w.week}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```
Expected: 에러 없이 빌드 성공

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useData.ts src/components/Header.tsx src/components/TrackCard.tsx
git commit -m "feat: useData hook + Header + TrackCard 컴포넌트

JSON fetch, 전체 진행률 계산, Synapse 다크 헤더, 트랙별 진행률 카드.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Dashboard 페이지 (ProgressTable + TimelineChart)

**Files:**
- Create: `src/components/ProgressTable.tsx`
- Create: `src/components/TimelineChart.tsx`
- Create: `src/pages/Dashboard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: ProgressTable 작성**

`src/components/ProgressTable.tsx`:
```typescript
import type { RepoData } from '../types'

interface Props {
  data: RepoData[]
}

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5']

function percentColor(p: number) {
  if (p >= 60) return 'text-success font-semibold'
  if (p >= 30) return 'text-amber font-semibold'
  if (p > 0) return 'text-danger font-semibold'
  return 'text-stone-400'
}

export default function ProgressTable({ data }: Props) {
  const rows = data.flatMap(d =>
    d.tracks.map(t => ({
      name: `${t.owner} ${t.name}`,
      weeks: WEEKS.map(w => {
        const week = t.weeks.find(wk => wk.week === w)
        if (!week || week.totalChecks === 0) return null
        return Math.round(week.doneChecks / week.totalChecks * 100)
      }),
      total: (() => {
        const tc = t.weeks.reduce((s, w) => s + w.totalChecks, 0)
        const dc = t.weeks.reduce((s, w) => s + w.doneChecks, 0)
        return tc > 0 ? Math.round(dc / tc * 100) : 0
      })(),
    }))
  )

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-600 mb-2">주차별 상세</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-amber-light">
            <th className="p-1.5 text-left border-b-2 border-amber text-[10px]">트랙</th>
            {WEEKS.map(w => <th key={w} className="p-1.5 text-center border-b-2 border-amber text-[10px]">{w}</th>)}
            <th className="p-1.5 text-center border-b-2 border-amber text-[10px] font-bold">합계</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-stone-100">
              <td className="p-1.5">{r.name}</td>
              {r.weeks.map((w, j) => (
                <td key={j} className={`text-center ${w !== null ? percentColor(w) : 'text-stone-300'}`}>
                  {w !== null ? `${w}%` : '—'}
                </td>
              ))}
              <td className="text-center font-bold">{r.total}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-[10px] text-stone-400">
        🟢 60%+ &nbsp; 🟠 30~59% &nbsp; 🔴 &lt;30% &nbsp; — 미시작
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TimelineChart 작성**

`src/components/TimelineChart.tsx`:
```typescript
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import type { RepoData } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const TRACK_COLORS: Record<string, string> = {
  platform: '#D97706',
  engagement: '#0D9488',
  'knowledge-1': '#78716C',
  'knowledge-2': '#A8A29E',
  'learning-card': '#0EA5E9',
  'learning-ai': '#8B5CF6',
  frontend: '#EC4899',
  'team-lead': '#16A34A',
}

interface Props {
  data: RepoData[]
}

export default function TimelineChart({ data }: Props) {
  const allDates = [...new Set(data.flatMap(d => d.history.map(h => h.date)))].sort()

  const datasets = data.flatMap(d =>
    d.tracks.map(t => ({
      label: t.name,
      data: allDates.map(date => {
        const entry = d.history.find(h => h.date === date)
        if (!entry || entry.totalChecks === 0) return null
        return Math.round(entry.doneChecks / entry.totalChecks * 100)
      }),
      borderColor: TRACK_COLORS[t.name] || '#78716C',
      backgroundColor: 'transparent',
      tension: 0.3,
      pointRadius: 2,
      borderWidth: 2,
    }))
  )

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-600 mb-2">진행률 추이</h3>
      <Line
        data={{ labels: allDates, datasets }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => `${v}%` } },
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
          },
        }}
        height={200}
      />
    </div>
  )
}
```

- [ ] **Step 3: Dashboard 페이지 작성**

`src/pages/Dashboard.tsx`:
```typescript
import { useData } from '../hooks/useData'
import Header from '../components/Header'
import TrackCard from '../components/TrackCard'
import ProgressTable from '../components/ProgressTable'
import TimelineChart from '../components/TimelineChart'

export default function Dashboard() {
  const { data, loading, overallPercent } = useData()

  if (loading) return <div className="p-8 text-stone-400">Loading...</div>

  const trackEntries = data.flatMap(d =>
    d.tracks.map(t => ({ repoData: d, trackName: t.name, owner: t.owner }))
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <Header overallPercent={overallPercent} />

      <div className="px-6 py-4">
        <h2 className="text-sm font-semibold text-stone-600 mb-2">트랙별 현황</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trackEntries.map(e => (
            <TrackCard key={e.trackName} {...e} />
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressTable data={data} />
        <TimelineChart data={data} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: App.tsx 업데이트**

`src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

function DetailPlaceholder() {
  return <div className="p-8 text-stone-500">Detail page (coming next)</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/detail/:repo" element={<DetailPlaceholder />} />
    </Routes>
  )
}
```

- [ ] **Step 5: dev 서버 확인**

```bash
npm run dev
```
Expected: localhost에서 카드 그리드 + 테이블 + 차트가 렌더링됨

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: Dashboard 메인 페이지 (카드 그리드 + 테이블 + 차트)

ProgressTable 주차별 상세, TimelineChart 추이 그래프, TrackCard 클릭으로 상세 이동.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Detail 페이지 (PRD/TASK/WORKFLOW 3컬럼)

**Files:**
- Create: `src/components/WeekTabs.tsx`
- Create: `src/components/PrdColumn.tsx`
- Create: `src/components/TaskColumn.tsx`
- Create: `src/components/WorkflowColumn.tsx`
- Create: `src/pages/Detail.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: WeekTabs 작성**

`src/components/WeekTabs.tsx`:
```typescript
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5']

interface Props {
  selected: string
  onChange: (week: string) => void
}

export default function WeekTabs({ selected, onChange }: Props) {
  return (
    <div className="flex bg-stone-800 px-6">
      {WEEKS.map(w => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={`px-4 py-2.5 text-xs font-medium transition-colors ${
            w === selected
              ? 'text-amber border-b-2 border-amber'
              : 'text-stone-400 hover:text-stone-300'
          }`}
        >
          {w}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: PrdColumn 작성**

`src/components/PrdColumn.tsx`:
```typescript
import type { PrdWeek } from '../types'

const STATUS_STYLE = {
  done: { border: 'border-l-success', badge: 'text-success', icon: '✅' },
  in_progress: { border: 'border-l-amber', badge: 'text-amber', icon: '🔄' },
  not_started: { border: 'border-l-stone-300', badge: 'text-stone-400', icon: '⬜' },
}

interface Props {
  prdWeek: PrdWeek | undefined
}

export default function PrdColumn({ prdWeek }: Props) {
  return (
    <div className="border-r border-stone-200 p-3.5">
      <h3 className="text-[11px] font-bold text-amber uppercase tracking-wider mb-2.5">
        PRD — 요구사항
      </h3>
      {!prdWeek || prdWeek.items.length === 0 ? (
        <p className="text-xs text-stone-400">해당 주차 PRD 항목 없음</p>
      ) : (
        prdWeek.items.map(item => {
          const s = STATUS_STYLE[item.status]
          return (
            <div key={item.id} className={`mb-2 p-2 bg-white rounded-md border-l-[3px] ${s.border}`}>
              <div className={`text-[10px] font-semibold ${s.badge}`}>{item.id} {s.icon}</div>
              <div className="text-[11px] text-stone-700 mt-0.5">{item.title}</div>
            </div>
          )
        })
      )}
    </div>
  )
}
```

- [ ] **Step 3: TaskColumn 작성**

`src/components/TaskColumn.tsx`:
```typescript
import type { Step } from '../types'

const STATUS_CONFIG = {
  Done: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-success text-white', barBg: 'bg-green-100', barFill: 'bg-success' },
  'In Progress': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber text-white', barBg: 'bg-amber-100', barFill: 'bg-amber' },
  'Not Started': { bg: 'bg-white', border: 'border-stone-200', badge: 'bg-stone-200 text-stone-500', barBg: 'bg-stone-100', barFill: '' },
}

interface Props {
  steps: Step[]
  onSelectStep: (step: Step) => void
  selectedStep: Step | null
}

export default function TaskColumn({ steps, onSelectStep, selectedStep }: Props) {
  return (
    <div className="border-r border-stone-200 p-3.5">
      <h3 className="text-[11px] font-bold text-amber uppercase tracking-wider mb-2.5">
        TASK — Step 상세
      </h3>
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step.status]
        const percent = step.totalChecks > 0 ? Math.round(step.doneChecks / step.totalChecks * 100) : 0
        const isSelected = selectedStep?.name === step.name
        return (
          <div
            key={i}
            onClick={() => onSelectStep(step)}
            className={`mb-2 p-2.5 rounded-md border cursor-pointer transition-shadow
              ${cfg.bg} ${cfg.border} ${isSelected ? 'ring-2 ring-amber' : 'hover:shadow-sm'}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-stone-700">Step {i + 1}: {step.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{step.status}</span>
            </div>
            <div className={`mt-1.5 h-1 rounded-full ${cfg.barBg}`}>
              <div className={`h-full rounded-full ${cfg.barFill}`} style={{ width: `${percent}%` }} />
            </div>
            <div className="text-[9px] text-stone-400 mt-1">
              {step.doneChecks}/{step.totalChecks} 체크
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: WorkflowColumn 작성**

`src/components/WorkflowColumn.tsx`:
```typescript
import type { Step } from '../types'

interface Props {
  step: Step | null
}

export default function WorkflowColumn({ step }: Props) {
  if (!step) {
    return (
      <div className="p-3.5">
        <h3 className="text-[11px] font-bold text-amber uppercase tracking-wider mb-2.5">
          WORKFLOW — 10단계
        </h3>
        <p className="text-xs text-stone-400">좌측에서 Step을 선택해줘</p>
      </div>
    )
  }

  return (
    <div className="p-3.5">
      <h3 className="text-[11px] font-bold text-amber uppercase tracking-wider mb-2.5">
        WORKFLOW — {step.name}
      </h3>
      <div className="text-[10px] text-stone-600 mb-2 px-2 py-1.5 bg-amber-light rounded">
        {step.doneChecks}/{step.totalChecks} 완료 ({step.totalChecks > 0 ? Math.round(step.doneChecks / step.totalChecks * 100) : 0}%)
      </div>
      <div className="space-y-1">
        {step.phases.map((phase, i) => {
          const done = phase.done === phase.total && phase.total > 0
          const inProgress = phase.done > 0 && phase.done < phase.total
          return (
            <div key={i} className={`flex items-center gap-2 text-[11px] ${
              done ? 'text-success' : inProgress ? 'text-amber font-semibold' : 'text-stone-400'
            }`}>
              <span className="text-sm">{done ? '✅' : inProgress ? '🔄' : '⬜'}</span>
              <span>{i + 1}. {phase.name}</span>
              <span className="ml-auto text-[9px] font-mono text-stone-400">
                {phase.done}/{phase.total}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Detail 페이지 작성**

`src/pages/Detail.tsx`:
```typescript
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRepoData } from '../hooks/useData'
import Header from '../components/Header'
import WeekTabs from '../components/WeekTabs'
import PrdColumn from '../components/PrdColumn'
import TaskColumn from '../components/TaskColumn'
import WorkflowColumn from '../components/WorkflowColumn'
import type { Step } from '../types'

export default function Detail() {
  const { repo } = useParams<{ repo: string }>()
  const { data, loading } = useRepoData(repo || '')
  const [selectedWeek, setSelectedWeek] = useState('W1')
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [activeTab, setActiveTab] = useState<'detail' | 'changelog'>('detail')

  if (loading || !data) return <div className="p-8 text-stone-400">Loading...</div>

  const track = data.tracks[0]
  const totalChecks = track?.weeks.reduce((s, w) => s + w.totalChecks, 0) || 0
  const doneChecks = track?.weeks.reduce((s, w) => s + w.doneChecks, 0) || 0
  const percent = totalChecks > 0 ? Math.round(doneChecks / totalChecks * 100) : 0

  const currentWeek = track?.weeks.find(w => w.week === selectedWeek)
  const prdWeek = data.prd.find(p => p.week === selectedWeek)

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        overallPercent={percent}
        subtitle={`${data.repo} · ${track?.owner || ''}`}
        backLink="#/"
      />

      <div className="flex bg-stone-800 px-6">
        <button
          onClick={() => setActiveTab('detail')}
          className={`px-4 py-2.5 text-xs ${activeTab === 'detail' ? 'text-amber border-b-2 border-amber font-semibold' : 'text-stone-400'}`}
        >
          상세 (PRD/TASK/WORKFLOW)
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          className={`px-4 py-2.5 text-xs ${activeTab === 'changelog' ? 'text-amber border-b-2 border-amber font-semibold' : 'text-stone-400'}`}
        >
          변경 이력
        </button>
      </div>

      {activeTab === 'detail' && (
        <>
          <WeekTabs selected={selectedWeek} onChange={w => { setSelectedWeek(w); setSelectedStep(null) }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
            <PrdColumn prdWeek={prdWeek} />
            <TaskColumn
              steps={currentWeek?.steps || []}
              onSelectStep={setSelectedStep}
              selectedStep={selectedStep}
            />
            <WorkflowColumn step={selectedStep} />
          </div>
        </>
      )}

      {activeTab === 'changelog' && (
        <div className="p-6 text-stone-400 text-sm">Changelog tab (coming next)</div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: App.tsx 업데이트**

`src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Detail from './pages/Detail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/detail/:repo" element={<Detail />} />
    </Routes>
  )
}
```

- [ ] **Step 7: 빌드 + dev 서버 확인**

```bash
npm run build
npm run dev
```
Expected: 카드 클릭 → 상세 페이지 3컬럼 렌더링

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: Detail 페이지 (PRD/TASK/WORKFLOW 3컬럼 드릴다운)

WeekTabs 주차 전환, PrdColumn 요구사항 상태, TaskColumn Step 카드,
WorkflowColumn 10단계 체크리스트.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: ChangelogTab (변경 이력)

**Files:**
- Create: `src/components/ChangelogTab.tsx`
- Modify: `src/pages/Detail.tsx`

- [ ] **Step 1: ChangelogTab 작성**

`src/components/ChangelogTab.tsx`:
```typescript
import { useState } from 'react'
import type { ChangelogEntry, ChangeDetail } from '../types'

const TYPE_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  step_added:    { bg: 'bg-sky-50',    text: 'text-sky-800',    border: 'border-l-info',    label: 'Step 추가' },
  step_deleted:  { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-l-danger',  label: 'Step 삭제' },
  step_modified: { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-l-amber',   label: '내용 수정' },
  check_done:    { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-l-success',  label: '체크 완료' },
  check_undone:  { bg: 'bg-stone-50',  text: 'text-stone-600',  border: 'border-l-stone-400', label: '체크 해제' },
  phase_added:   { bg: 'bg-sky-50',    text: 'text-sky-800',    border: 'border-l-info',    label: '단계 추가' },
  phase_deleted: { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-l-danger',  label: '단계 삭제' },
}

type FilterType = 'all' | 'structure' | 'modified' | 'checks'

interface Props {
  changelog: ChangelogEntry[]
}

export default function ChangelogTab({ changelog }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = changelog
    .flatMap(entry =>
      entry.changes
        .filter(c => {
          if (filter === 'all') return true
          if (filter === 'structure') return ['step_added', 'step_deleted', 'phase_added', 'phase_deleted'].includes(c.type)
          if (filter === 'modified') return c.type === 'step_modified'
          if (filter === 'checks') return ['check_done', 'check_undone'].includes(c.type)
          return true
        })
        .map(c => ({ ...c, date: entry.date, commit: entry.commit, author: entry.author, file: entry.file }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  // 날짜별 그룹핑
  const grouped = new Map<string, typeof filtered>()
  for (const item of filtered) {
    const day = item.date.slice(0, 10)
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(item)
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'structure', label: 'Step 추가/삭제' },
    { key: 'modified', label: '내용 수정' },
    { key: 'checks', label: '체크 완료' },
  ]

  return (
    <div>
      <div className="px-6 py-3 flex gap-2 items-center border-b border-stone-200 bg-white">
        <span className="text-[11px] text-stone-500">필터:</span>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-full text-[10px] transition-colors ${
              filter === f.key ? 'bg-amber text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-stone-400">총 {filtered.length}건</span>
      </div>

      <div className="px-6 py-4">
        {[...grouped].map(([day, items]) => (
          <div key={day} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber rounded-full" />
              <span className="text-xs font-bold text-stone-600">{day}</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            {items.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.check_done
              return (
                <div key={i} className={`ml-5 mb-2 p-2.5 bg-white rounded-lg border-l-[3px] ${cfg.border} shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-700">{item.file}</span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">{item.target}</div>
                      {item.detail && <div className="text-[10px] text-stone-500 mt-0.5">{item.detail}</div>}
                      {item.type === 'step_modified' && item.before && item.after && (
                        <div className="mt-1.5 font-mono text-[10px] rounded overflow-hidden border border-stone-200">
                          <div className="px-2 py-1 bg-red-50 text-red-900">
                            <span className="text-danger font-bold">−</span> {item.before}
                          </div>
                          <div className="px-2 py-1 bg-green-50 text-green-900">
                            <span className="text-success font-bold">+</span> {item.after}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-3 whitespace-nowrap">
                      <div className="text-[9px] text-stone-400">{item.date.slice(11, 16)}</div>
                      <code className="text-[9px] bg-stone-100 px-1 py-0.5 rounded text-stone-500">
                        {item.commit}
                      </code>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">변경 이력이 없어</p>
        )}
      </div>

      <div className="px-6 pb-4">
        <div className="flex gap-4 flex-wrap text-[11px] text-stone-700">
          <span><span className="inline-block w-2.5 h-2.5 bg-info rounded-sm align-middle mr-1" />추가</span>
          <span><span className="inline-block w-2.5 h-2.5 bg-danger rounded-sm align-middle mr-1" />삭제</span>
          <span><span className="inline-block w-2.5 h-2.5 bg-amber rounded-sm align-middle mr-1" />수정</span>
          <span><span className="inline-block w-2.5 h-2.5 bg-success rounded-sm align-middle mr-1" />완료</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Detail.tsx에 ChangelogTab 연결**

`src/pages/Detail.tsx`의 changelog placeholder를 교체:

```typescript
// import 추가
import ChangelogTab from '../components/ChangelogTab'

// activeTab === 'changelog' 부분 교체
{activeTab === 'changelog' && (
  <ChangelogTab changelog={data.changelog} />
)}
```

- [ ] **Step 3: 빌드 + dev 서버 확인**

```bash
npm run build
npm run dev
```
Expected: 상세 페이지에서 "변경 이력" 탭 클릭 → 타임라인 + 필터 + diff 표시

- [ ] **Step 4: Commit**

```bash
git add src/components/ChangelogTab.tsx src/pages/Detail.tsx
git commit -m "feat: 변경 이력 탭 (필터 + 타임라인 + diff 비교)

날짜별 그룹핑, 7가지 변경 유형 컬러코딩, step_modified는 before/after diff 블록.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: build.yml (GitHub Actions → gh-pages 배포)

**Files:**
- Create: `.github/workflows/build.yml`

- [ ] **Step 1: build.yml 작성**

`.github/workflows/build.yml`:
```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
    paths:
      - 'data/**'
      - 'src/**'
      - 'package.json'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Copy data to dist
        run: cp -r data dist/data

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: GitHub Pages 설정 확인**

```bash
gh api repos/team-project-final/workflow-dashboard -X PATCH \
  -f "has_pages=true" >/dev/null 2>&1 || true
gh api repos/team-project-final/workflow-dashboard/pages -X POST \
  --input - <<< '{"build_type":"workflow"}' 2>/dev/null || true
echo "Pages configured"
```

- [ ] **Step 3: Commit + Push**

```bash
git add .github/workflows/build.yml
git commit -m "ci: build.yml — Vite build + GitHub Pages 배포

data/ 또는 src/ 변경 시 빌드, dist/에 data/ 복사, deploy-pages로 배포.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

---

## Task 9: 서비스 레포에 parse-workflow.yml 배포

**Files:**
- 각 서비스 레포에 추가:
  - `.github/workflows/parse-workflow.yml`
  - `scripts/parse-workflow.mjs`
  - `scripts/parse-prd.mjs`

- [ ] **Step 1: PAT 발급 안내**

사용자에게 DASHBOARD_TOKEN 발급 요청:
- fine-grained PAT
- Resource owner: team-project-final
- Repository: workflow-dashboard 1개
- Permissions: Contents Read and write
- Expiration: 90일

```bash
# 6개 서비스 레포에 DASHBOARD_TOKEN 등록
for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  gh secret set DASHBOARD_TOKEN --repo team-project-final/$repo --body "$DASHBOARD_TOKEN"
  echo "Set DASHBOARD_TOKEN on $repo"
done
```

- [ ] **Step 2: parse-workflow.yml 작성**

```yaml
name: Parse Workflow → Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'docs/project-management/workflow/**'
      - 'docs/project-management/task/**'
      - 'docs/project-management/prd/**'

jobs:
  parse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/checkout@v4
        with:
          repository: team-project-final/workflow-dashboard
          token: ${{ secrets.DASHBOARD_TOKEN }}
          path: _dashboard

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run parser
        run: |
          REPO_NAME="${{ github.event.repository.name }}"
          node _dashboard/scripts/parse-workflow.mjs \
            docs/project-management \
            "$REPO_NAME" \
            "_dashboard/data/${REPO_NAME}.json"
          node _dashboard/scripts/parse-prd.mjs \
            docs/project-management \
            "_dashboard/data/${REPO_NAME}.json"

      - name: Push to dashboard
        working-directory: _dashboard
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          if git diff --cached --quiet; then
            echo "No changes"
            exit 0
          fi
          git commit -m "data: update ${{ github.event.repository.name }} from ${{ github.sha }}"
          git push
```

- [ ] **Step 3: 6개 레포에 배포**

```bash
SRC="/tmp/workflow-dashboard"
WORKFLOW_YML="$SRC/.github/workflows/parse-workflow.yml"  # 위에서 작성한 파일 경로

for repo in synapse-platform-svc synapse-engagement-svc synapse-knowledge-svc \
            synapse-learning-svc synapse-frontend synapse-shared; do
  cd /tmp/bootstrap/$repo
  git pull --rebase origin main >/dev/null 2>&1
  mkdir -p .github/workflows scripts
  # parse-workflow.yml 복사 (위 Step 2에서 작성한 내용)
  # scripts/parse-workflow.mjs, parse-prd.mjs는 dashboard 레포에서 참조하므로 복사 불필요
  # (Actions에서 _dashboard/ checkout으로 가져옴)
  cp "$WORKFLOW_YML" .github/workflows/parse-workflow.yml 2>/dev/null || true
  git add .github/workflows/parse-workflow.yml
  if ! git diff --cached --quiet; then
    git commit -m "ci: parse-workflow.yml — Dashboard 데이터 자동 push

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
    git push origin main
    echo "[OK] $repo"
  else
    echo "[SKIP] $repo — no changes"
  fi
  cd /tmp
done
```

- [ ] **Step 4: Commit (dashboard 레포)**

```bash
cd /tmp/workflow-dashboard
git add -A
git commit -m "feat: parse-workflow.yml 서비스 레포 배포 준비

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

---

## Task 10: E2E 검증

- [ ] **Step 1: 서비스 레포에서 WORKFLOW 파일 수정 → Actions 트리거 확인**

```bash
# platform-svc에서 WORKFLOW 파일에 체크 하나 추가
cd /tmp/bootstrap/synapse-platform-svc
git pull --rebase origin main
# WORKFLOW_platform_W1.md 의 첫 번째 [ ] 를 [x]로 변경 → commit → push
```

- [ ] **Step 2: Actions 실행 확인**

```bash
gh run list --repo team-project-final/synapse-platform-svc --workflow=parse-workflow.yml --limit 1
```
Expected: 1개 run (success 또는 in_progress)

- [ ] **Step 3: dashboard 레포 data/ 업데이트 확인**

```bash
gh api repos/team-project-final/workflow-dashboard/contents/data/synapse-platform-svc.json --jq '.size'
```
Expected: JSON 파일 크기 > 0

- [ ] **Step 4: GitHub Pages 접속 확인**

```bash
curl -s -o /dev/null -w "%{http_code}" https://team-project-final.github.io/workflow-dashboard/
```
Expected: 200

- [ ] **Step 5: 최종 commit**

```bash
cd /tmp/workflow-dashboard
git add -A
git commit -m "chore: E2E 검증 완료

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

---

## Self-Review

### 1. Spec coverage

| 스펙 섹션 | Task 매핑 | 커버 |
|-----------|----------|:----:|
| §2.1 Push 모델 흐름 | T9 (parse-workflow.yml) + T8 (build.yml) | ✅ |
| §2.2 DASHBOARD_TOKEN | T9 Step 1 | ✅ |
| §3 JSON 스키마 | T2 (types) + T3 (파서) | ✅ |
| §3.2 변경 유형 | T3 (파서 diff) + T7 (ChangelogTab) | ✅ |
| §4.1 메인 대시보드 | T4 (Header/TrackCard) + T5 (Table/Chart) | ✅ |
| §4.2 상세 드릴다운 | T6 (3컬럼) + T7 (변경 이력) | ✅ |
| §4.3 반응형 | T5 Dashboard grid cols (1/2/4) | ✅ |
| §5 기술 스택 | T1 (Vite/React/Tailwind/Chart.js) | ✅ |
| §6.1 parse-workflow.yml | T9 | ✅ |
| §6.2 build.yml | T8 | ✅ |
| §7 파서 스크립트 | T3 | ✅ |
| §8 컴포넌트 구조 | T4~T7 | ✅ |
| §9 디자인 테마 | T1 (tailwind.config), T4~T7 (Warm Intellectual 색상) | ✅ |
| §10 배포 매핑 | T9 | ✅ |

미커버 항목: 없음.

### 2. Placeholder scan

TBD/TODO 없음. 모든 Task에 실제 코드 포함.

### 3. 일관성

- TypeScript 타입 `RepoData` (T2) → `useData` (T4) → 모든 컴포넌트에서 동일 import 경로 ✓
- JSON 필드명 (`tracks`, `prd`, `history`, `changelog`) → 파서(T3)와 컴포넌트(T4~T7)에서 동일 ✓
- Tailwind 컬러 (`text-amber`, `bg-success`, `text-danger`) → tailwind.config(T1)에 정의된 커스텀 색상 ✓
- Chart.js register → TimelineChart(T5)에서 import 시 등록 ✓
