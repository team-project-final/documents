# Synapse 일정관리 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React SPA 일정관리 페이지를 구축하여 Gantt/칸반/주차별 3개 뷰로 전체 팀 일정을 공유하고, GitHub OAuth로 상태 변경 + 코멘트를 관리한다.

**Architecture:** Vite + React 18 SPA. JSON 파일을 데이터 소스로 사용하고, GitHub Contents API로 수정 사항을 커밋. GitHub Pages에 정적 배포. MD 파싱 스크립트로 초기 데이터 생성.

**Tech Stack:** React 18, Vite, Tailwind CSS, React Router v6, Zustand, @hello-pangea/dnd, GitHub OAuth, GitHub Pages

**Target repo:** `https://github.com/team-project-final/schedule.git` (빈 레포)

**Spec:** `docs/superpowers/specs/2026-05-11-schedule-page-design.md`

---

## File Structure

```
schedule/
├── .github/workflows/deploy.yml
├── scripts/sync-from-md.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── data/
│   │   ├── members.json
│   │   ├── tasks.json
│   │   └── schedule.json
│   ├── stores/store.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useGitHub.js
│   │   └── useData.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── statusUtils.js
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── common/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── MemberAvatar.jsx
│   │   │   ├── CommentList.jsx
│   │   │   └── TaskDetailModal.jsx
│   │   ├── GanttChart/
│   │   │   ├── GanttChart.jsx
│   │   │   ├── GanttRow.jsx
│   │   │   ├── GanttBar.jsx
│   │   │   └── GanttTimeline.jsx
│   │   ├── KanbanBoard/
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── KanbanCard.jsx
│   │   │   └── KanbanFilters.jsx
│   │   ├── WeeklyView/
│   │   │   ├── WeeklyView.jsx
│   │   │   ├── WeekTab.jsx
│   │   │   └── MemberAccordion.jsx
│   │   └── Auth/
│   │       ├── LoginButton.jsx
│   │       └── OAuthCallback.jsx
│   └── pages/
│       ├── GanttPage.jsx
│       ├── KanbanPage.jsx
│       └── WeeklyPage.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Task 1: 프로젝트 초기화 (Vite + React + Tailwind + Router)

**Files:**
- Create: `schedule/package.json`, `schedule/vite.config.js`, `schedule/tailwind.config.js`, `schedule/postcss.config.js`, `schedule/index.html`, `schedule/src/main.jsx`, `schedule/src/App.jsx`, `schedule/src/index.css`

- [ ] **Step 1: schedule 레포 클론 + Vite React 프로젝트 생성**

```bash
cd /tmp/schedule-repo
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom zustand @hello-pangea/dnd
```

- [ ] **Step 2: vite.config.js 설정 (GitHub Pages base path)**

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/schedule/',
})
```

- [ ] **Step 3: Tailwind CSS 설정**

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-done: #16a34a;
  --color-in-progress: #2563eb;
  --color-not-started: #94a3b8;
  --color-blocked: #dc2626;
  --color-warning: #f59e0b;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 4: React Router 설정 + App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import GanttPage from './pages/GanttPage'
import KanbanPage from './pages/KanbanPage'
import WeeklyPage from './pages/WeeklyPage'
import OAuthCallback from './components/Auth/OAuthCallback'

export default function App() {
  return (
    <BrowserRouter basename="/schedule">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<GanttPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="weekly/:weekId" element={<WeeklyPage />} />
          <Route path="weekly" element={<Navigate to="/weekly/W1" replace />} />
        </Route>
        <Route path="login/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: 플레이스홀더 페이지 + Layout 생성**

```jsx
// src/pages/GanttPage.jsx
export default function GanttPage() {
  return <div className="p-8"><h2 className="text-2xl font-bold">Gantt Chart</h2></div>
}

// src/pages/KanbanPage.jsx
export default function KanbanPage() {
  return <div className="p-8"><h2 className="text-2xl font-bold">Kanban Board</h2></div>
}

// src/pages/WeeklyPage.jsx
import { useParams } from 'react-router-dom'
export default function WeeklyPage() {
  const { weekId } = useParams()
  return <div className="p-8"><h2 className="text-2xl font-bold">Week {weekId}</h2></div>
}

// src/components/Auth/OAuthCallback.jsx
export default function OAuthCallback() {
  return <div className="p-8">Processing login...</div>
}
```

```jsx
// src/components/Layout/Layout.jsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

```jsx
// src/components/Layout/Header.jsx
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Gantt' },
  { to: '/kanban', label: 'Kanban' },
  { to: '/weekly/W1', label: 'Weekly' },
]

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold text-slate-900">Synapse Schedule</h1>
        <nav className="flex gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button className="text-sm text-slate-500 hover:text-slate-700">
        Login with GitHub
      </button>
    </header>
  )
}
```

```jsx
// src/components/Layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-2 text-xs text-slate-400 flex justify-between">
      <span>Synapse — 4주 팀 프로젝트 (2026-05-12 ~ 06-06)</span>
      <span>Last updated: —</span>
    </footer>
  )
}
```

- [ ] **Step 6: 개발 서버 실행 확인**

```bash
npm run dev
# → http://localhost:5173/schedule/ 접속 → Gantt/Kanban/Weekly 라우팅 동작 확인
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: 프로젝트 초기화 — Vite + React + Tailwind + Router + Layout"
```

---

## Task 2: JSON 데이터 + Zustand 스토어 + 유틸리티

**Files:**
- Create: `src/data/members.json`, `src/data/tasks.json`, `src/data/schedule.json`
- Create: `src/stores/store.js`, `src/hooks/useData.js`
- Create: `src/utils/dateUtils.js`, `src/utils/statusUtils.js`

- [ ] **Step 1: members.json — 8명 담당자 데이터**

wiki 17_스케줄과 SCOPE 문서에서 추출한 전체 8명의 멤버 데이터를 작성한다.

- [ ] **Step 2: tasks.json — 전체 W1~W4 Steps 데이터**

8명 × W1~W4의 모든 Step을 tasks.json에 작성한다. 각 Step은 id, memberId, week, stepNumber, name, goal, status, startDate, endDate, durationDays, plannedStart, plannedEnd, priority, comments, dependencies 필드를 포함.

- [ ] **Step 3: schedule.json — 4주 스케줄 + 성공 기준**

W1~W4의 주차 정보(id, name, startDate, endDate, goals, successCriteria)를 작성.

- [ ] **Step 4: 유틸리티 함수**

```js
// src/utils/dateUtils.js
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDaysBetween(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
}

export function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

export function getWeekDates(weekId, scheduleData) {
  const week = scheduleData.weeks.find(w => w.id === weekId)
  return week ? { start: week.startDate, end: week.endDate } : null
}
```

```js
// src/utils/statusUtils.js
export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

export const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
  done: { label: 'Done', color: 'bg-green-600', text: 'text-green-700', bg: 'bg-green-50' },
}

export function getProgressPercent(tasks) {
  if (!tasks.length) return 0
  const done = tasks.filter(t => t.status === STATUS.DONE).length
  return Math.round((done / tasks.length) * 100)
}
```

- [ ] **Step 5: Zustand 스토어**

```js
// src/stores/store.js
import { create } from 'zustand'
import membersData from '../data/members.json'
import tasksData from '../data/tasks.json'
import scheduleData from '../data/schedule.json'

const useStore = create((set, get) => ({
  members: membersData,
  tasks: tasksData,
  schedule: scheduleData,
  user: null, // GitHub OAuth user

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ),
  })),

  addComment: (taskId, comment) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? { ...t, comments: [...t.comments, comment] }
        : t
    ),
  })),

  getTasksByMember: (memberId) => get().tasks.filter(t => t.memberId === memberId),
  getTasksByWeek: (weekId) => get().tasks.filter(t => t.week === weekId),
  getTasksByStatus: (status) => get().tasks.filter(t => t.status === status),
  getMember: (memberId) => get().members.find(m => m.id === memberId),
}))

export default useStore
```

- [ ] **Step 6: useData 훅**

```js
// src/hooks/useData.js
import useStore from '../stores/store'
import { getProgressPercent } from '../utils/statusUtils'

export function useMembers() {
  return useStore((s) => s.members)
}

export function useTasks(filters = {}) {
  const tasks = useStore((s) => s.tasks)
  let filtered = tasks
  if (filters.memberId) filtered = filtered.filter(t => t.memberId === filters.memberId)
  if (filters.week) filtered = filtered.filter(t => t.week === filters.week)
  if (filters.status) filtered = filtered.filter(t => t.status === filters.status)
  return filtered
}

export function useSchedule() {
  return useStore((s) => s.schedule)
}

export function useProgress(filters = {}) {
  const tasks = useTasks(filters)
  return getProgressPercent(tasks)
}
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: JSON 데이터 + Zustand 스토어 + 유틸리티 함수"
```

---

## Task 3: 공통 컴포넌트 (StatusBadge, ProgressBar, MemberAvatar, TaskDetailModal)

**Files:**
- Create: `src/components/common/StatusBadge.jsx`, `ProgressBar.jsx`, `MemberAvatar.jsx`, `CommentList.jsx`, `TaskDetailModal.jsx`

- [ ] **Step 1: StatusBadge + ProgressBar + MemberAvatar**

```jsx
// src/components/common/StatusBadge.jsx
import { STATUS_CONFIG } from '../../utils/statusUtils'

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
      {config.label}
    </span>
  )
}
```

```jsx
// src/components/common/ProgressBar.jsx
export default function ProgressBar({ percent, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5'
  return (
    <div className={`w-full bg-slate-200 rounded-full ${h}`}>
      <div
        className={`${h} rounded-full transition-all duration-500 ${
          percent === 100 ? 'bg-green-600' : 'bg-blue-600'
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
```

```jsx
// src/components/common/MemberAvatar.jsx
export default function MemberAvatar({ member, size = 32 }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={member.avatar || `https://ui-avatars.com/api/?name=${member.handle}&size=${size}&background=e2e8f0&color=475569`}
        alt={member.handle}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      <span className="text-sm font-medium text-slate-700">{member.handle}</span>
    </div>
  )
}
```

- [ ] **Step 2: CommentList + TaskDetailModal**

```jsx
// src/components/common/CommentList.jsx
import { formatDate } from '../../utils/dateUtils'

export default function CommentList({ comments }) {
  if (!comments?.length) return <p className="text-sm text-slate-400">코멘트 없음</p>
  return (
    <div className="space-y-2">
      {comments.map((c, i) => (
        <div key={i} className="bg-slate-50 rounded-lg p-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{c.author}</span>
            <span className="font-mono">{formatDate(c.timestamp)}</span>
          </div>
          <p className="text-sm text-slate-700">{c.text}</p>
        </div>
      ))}
    </div>
  )
}
```

```jsx
// src/components/common/TaskDetailModal.jsx
import { useState } from 'react'
import StatusBadge from './StatusBadge'
import CommentList from './CommentList'
import useStore from '../../stores/store'

export default function TaskDetailModal({ task, member, onClose }) {
  const [comment, setComment] = useState('')
  const user = useStore((s) => s.user)
  const addComment = useStore((s) => s.addComment)

  const handleAddComment = () => {
    if (!comment.trim() || !user) return
    addComment(task.id, {
      author: user.login,
      text: comment.trim(),
      timestamp: new Date().toISOString(),
    })
    setComment('')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">{task.week} · Step {task.stepNumber}</p>
              <h3 className="text-lg font-bold text-slate-900">{task.name}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>

          <StatusBadge status={task.status} />

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-medium text-slate-600">Goal: </span>
              <span className="text-slate-700">{task.goal}</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Duration: </span>
              <span className="font-mono text-slate-700">{task.durationDays}일</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">기간: </span>
              <span className="font-mono text-slate-700">{task.plannedStart} ~ {task.plannedEnd}</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Priority: </span>
              <span className={`font-mono ${task.priority === 'P0' ? 'text-red-600' : 'text-slate-700'}`}>{task.priority}</span>
            </div>
          </div>

          <hr className="my-4 border-slate-200" />
          <h4 className="font-semibold text-slate-800 mb-2">코멘트</h4>
          <CommentList comments={task.comments} />

          {user && (
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="코멘트 추가..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "feat: 공통 컴포넌트 — StatusBadge, ProgressBar, Avatar, Modal"
```

---

## Task 4: Gantt 차트 뷰

**Files:**
- Create: `src/components/GanttChart/GanttChart.jsx`, `GanttRow.jsx`, `GanttBar.jsx`, `GanttTimeline.jsx`
- Modify: `src/pages/GanttPage.jsx`

- [ ] **Step 1: GanttTimeline (X축 날짜 헤더)**

```jsx
// src/components/GanttChart/GanttTimeline.jsx
import { getDaysBetween } from '../../utils/dateUtils'

const PROJECT_START = '2026-05-12'
const PROJECT_END = '2026-06-06'
const TOTAL_DAYS = getDaysBetween(PROJECT_START, PROJECT_END)
const DAY_WIDTH = 40

export { PROJECT_START, PROJECT_END, TOTAL_DAYS, DAY_WIDTH }

export default function GanttTimeline() {
  const days = []
  const start = new Date(PROJECT_START)
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    days.push({
      date: d,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dayName: ['일','월','화','수','목','금','토'][d.getDay()],
      isWeekend,
      isToday,
    })
  }

  return (
    <div className="flex border-b border-slate-200" style={{ width: TOTAL_DAYS * DAY_WIDTH }}>
      {days.map((day, i) => (
        <div
          key={i}
          className={`flex-shrink-0 text-center border-r border-slate-100 ${
            day.isWeekend ? 'bg-slate-50' : ''
          } ${day.isToday ? 'bg-blue-50' : ''}`}
          style={{ width: DAY_WIDTH }}
        >
          <div className="text-[10px] text-slate-400 font-mono">{day.dayName}</div>
          <div className="text-xs text-slate-600 font-mono">{day.label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: GanttBar (개별 Step 바)**

```jsx
// src/components/GanttChart/GanttBar.jsx
import { STATUS_CONFIG } from '../../utils/statusUtils'
import { DAY_WIDTH, PROJECT_START } from './GanttTimeline'

export default function GanttBar({ task, onClick }) {
  const startOffset = getDayOffset(task.plannedStart)
  const duration = getDayOffset(task.plannedEnd) - startOffset + 1

  const statusColors = {
    not_started: 'bg-slate-300',
    in_progress: 'bg-blue-500',
    done: 'bg-green-500',
  }

  return (
    <div
      className={`absolute h-6 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${statusColors[task.status]}`}
      style={{
        left: startOffset * DAY_WIDTH + 2,
        width: duration * DAY_WIDTH - 4,
        top: 4,
      }}
      onClick={() => onClick(task)}
      title={`${task.name}\n${task.goal}`}
    >
      <span className="text-[10px] text-white font-medium px-1.5 truncate block leading-6">
        {task.name}
      </span>
    </div>
  )
}

function getDayOffset(dateStr) {
  const start = new Date(PROJECT_START)
  const target = new Date(dateStr)
  return Math.floor((target - start) / (1000 * 60 * 60 * 24))
}
```

- [ ] **Step 3: GanttRow (담당자 행) + GanttChart (조립)**

```jsx
// src/components/GanttChart/GanttRow.jsx
import GanttBar from './GanttBar'
import MemberAvatar from '../common/MemberAvatar'
import { TOTAL_DAYS, DAY_WIDTH } from './GanttTimeline'

export default function GanttRow({ member, tasks, onTaskClick }) {
  return (
    <div className="flex border-b border-slate-100 hover:bg-slate-50/50">
      <div className="w-48 flex-shrink-0 px-3 py-2 border-r border-slate-200 bg-white sticky left-0 z-10">
        <MemberAvatar member={member} size={24} />
        <p className="text-[10px] text-slate-400 mt-0.5">{member.service}</p>
      </div>
      <div className="relative" style={{ width: TOTAL_DAYS * DAY_WIDTH, height: 34 }}>
        {tasks.map(task => (
          <GanttBar key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  )
}
```

```jsx
// src/components/GanttChart/GanttChart.jsx
import { useState } from 'react'
import GanttTimeline from './GanttTimeline'
import GanttRow from './GanttRow'
import TaskDetailModal from '../common/TaskDetailModal'
import useStore from '../../stores/store'

export default function GanttChart() {
  const members = useStore(s => s.members)
  const tasks = useStore(s => s.tasks)
  const [selectedTask, setSelectedTask] = useState(null)

  return (
    <div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
        <div className="flex">
          <div className="w-48 flex-shrink-0 px-3 py-2 border-r border-slate-200 bg-slate-50 sticky left-0 z-20">
            <span className="text-xs font-semibold text-slate-500">담당자</span>
          </div>
          <GanttTimeline />
        </div>
        {members.map(member => (
          <GanttRow
            key={member.id}
            member={member}
            tasks={tasks.filter(t => t.memberId === member.id)}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          member={members.find(m => m.id === selectedTask.memberId)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: GanttPage 연결**

```jsx
// src/pages/GanttPage.jsx
import GanttChart from '../components/GanttChart/GanttChart'
import ProgressBar from '../components/common/ProgressBar'
import { useProgress } from '../hooks/useData'

export default function GanttPage() {
  const progress = useProgress()
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">프로젝트 타임라인</h2>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>전체 진행률</span>
          <div className="w-32"><ProgressBar percent={progress} size="sm" /></div>
          <span className="font-mono font-semibold">{progress}%</span>
        </div>
      </div>
      <GanttChart />
    </div>
  )
}
```

- [ ] **Step 5: 브라우저 확인 + 커밋**

```bash
npm run dev
# → Gantt 차트에 8명 × 4주 바가 표시되는지 확인
git add -A
git commit -m "feat: Gantt 차트 뷰 — 타임라인, 담당자별 바, 상세 모달"
```

---

## Task 5: 칸반 보드 뷰

**Files:**
- Create: `src/components/KanbanBoard/KanbanBoard.jsx`, `KanbanColumn.jsx`, `KanbanCard.jsx`, `KanbanFilters.jsx`
- Modify: `src/pages/KanbanPage.jsx`

- [ ] **Step 1: KanbanCard + KanbanColumn**

```jsx
// src/components/KanbanBoard/KanbanCard.jsx
import { Draggable } from '@hello-pangea/dnd'
import StatusBadge from '../common/StatusBadge'
import useStore from '../../stores/store'

export default function KanbanCard({ task, index, onClick }) {
  const member = useStore(s => s.getMember(task.memberId))

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-slate-200'
          }`}
          onClick={() => onClick(task)}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400">{task.week}</span>
            <span className={`text-[10px] font-mono ${task.priority === 'P0' ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
              {task.priority}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 mb-2">{task.name}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img
                src={member?.avatar || `https://ui-avatars.com/api/?name=${member?.handle}&size=20&background=e2e8f0&color=475569`}
                className="w-5 h-5 rounded-full"
                alt=""
              />
              <span className="text-[11px] text-slate-500">{member?.handle}</span>
            </div>
            {task.comments?.length > 0 && (
              <span className="text-[10px] text-slate-400">💬 {task.comments.length}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
```

```jsx
// src/components/KanbanBoard/KanbanColumn.jsx
import { Droppable } from '@hello-pangea/dnd'
import KanbanCard from './KanbanCard'
import { STATUS_CONFIG } from '../../utils/statusUtils'

export default function KanbanColumn({ status, tasks, onCardClick }) {
  const config = STATUS_CONFIG[status]
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
        <h3 className="font-semibold text-slate-700">{config.label}</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-lg p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-slate-50'
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
```

- [ ] **Step 2: KanbanFilters + KanbanBoard**

```jsx
// src/components/KanbanBoard/KanbanFilters.jsx
import useStore from '../../stores/store'

export default function KanbanFilters({ filters, onChange }) {
  const members = useStore(s => s.members)
  const weeks = ['W1', 'W2', 'W3', 'W4']

  return (
    <div className="flex gap-3 mb-4">
      <select
        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filters.memberId || ''}
        onChange={e => onChange({ ...filters, memberId: e.target.value || null })}
      >
        <option value="">전체 담당자</option>
        {members.map(m => (
          <option key={m.id} value={m.id}>{m.handle}</option>
        ))}
      </select>
      <select
        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filters.week || ''}
        onChange={e => onChange({ ...filters, week: e.target.value || null })}
      >
        <option value="">전체 주차</option>
        {weeks.map(w => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
    </div>
  )
}
```

```jsx
// src/components/KanbanBoard/KanbanBoard.jsx
import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import KanbanFilters from './KanbanFilters'
import TaskDetailModal from '../common/TaskDetailModal'
import useStore from '../../stores/store'
import { STATUS } from '../../utils/statusUtils'

const COLUMNS = [STATUS.NOT_STARTED, STATUS.IN_PROGRESS, STATUS.DONE]

export default function KanbanBoard() {
  const tasks = useStore(s => s.tasks)
  const members = useStore(s => s.members)
  const updateTaskStatus = useStore(s => s.updateTaskStatus)
  const user = useStore(s => s.user)
  const [filters, setFilters] = useState({ memberId: null, week: null })
  const [selectedTask, setSelectedTask] = useState(null)

  const filtered = tasks.filter(t => {
    if (filters.memberId && t.memberId !== filters.memberId) return false
    if (filters.week && t.week !== filters.week) return false
    return true
  })

  const handleDragEnd = (result) => {
    if (!result.destination || !user) return
    const { draggableId, destination } = result
    updateTaskStatus(draggableId, destination.droppableId)
  }

  return (
    <div>
      <KanbanFilters filters={filters} onChange={setFilters} />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={filtered.filter(t => t.status === status)}
              onCardClick={setSelectedTask}
            />
          ))}
        </div>
      </DragDropContext>
      {!user && (
        <p className="text-xs text-slate-400 mt-3">* 상태 변경은 GitHub 로그인 후 가능합니다</p>
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          member={members.find(m => m.id === selectedTask.memberId)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: KanbanPage 연결**

```jsx
// src/pages/KanbanPage.jsx
import KanbanBoard from '../components/KanbanBoard/KanbanBoard'

export default function KanbanPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">칸반 보드</h2>
      <KanbanBoard />
    </div>
  )
}
```

- [ ] **Step 4: 브라우저 확인 + 커밋**

```bash
npm run dev
# → /kanban 접속 → 3열 보드 표시 + 필터 + 드래그 동작 확인
git add -A
git commit -m "feat: 칸반 보드 뷰 — 드래그&드롭, 필터, 상세 모달"
```

---

## Task 6: 주차별 뷰

**Files:**
- Create: `src/components/WeeklyView/WeeklyView.jsx`, `WeekTab.jsx`, `MemberAccordion.jsx`
- Modify: `src/pages/WeeklyPage.jsx`

- [ ] **Step 1: WeekTab + MemberAccordion**

```jsx
// src/components/WeeklyView/WeekTab.jsx
import { NavLink } from 'react-router-dom'

const WEEKS = ['W1', 'W2', 'W3', 'W4']

export default function WeekTab() {
  return (
    <div className="flex gap-1 mb-6">
      {WEEKS.map(w => (
        <NavLink
          key={w}
          to={`/weekly/${w}`}
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`
          }
        >
          {w}
        </NavLink>
      ))}
    </div>
  )
}
```

```jsx
// src/components/WeeklyView/MemberAccordion.jsx
import { useState } from 'react'
import StatusBadge from '../common/StatusBadge'
import ProgressBar from '../common/ProgressBar'
import MemberAvatar from '../common/MemberAvatar'
import { getProgressPercent } from '../../utils/statusUtils'

export default function MemberAccordion({ member, tasks, onTaskClick }) {
  const [open, setOpen] = useState(false)
  const progress = getProgressPercent(tasks)

  return (
    <div className="bg-white rounded-lg border border-slate-200 mb-2">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} size={28} />
          <span className="text-xs text-slate-400">({tasks.length} steps)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24"><ProgressBar percent={progress} size="sm" /></div>
          <span className="text-xs font-mono text-slate-500 w-10 text-right">{progress}%</span>
          <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 rounded cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-6">S{task.stepNumber}</span>
                <span className="text-sm text-slate-700">{task.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                {task.comments?.length > 0 && (
                  <span className="text-[10px] text-slate-400">💬{task.comments.length}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: WeeklyView + WeeklyPage**

```jsx
// src/components/WeeklyView/WeeklyView.jsx
import { useState } from 'react'
import WeekTab from './WeekTab'
import MemberAccordion from './MemberAccordion'
import TaskDetailModal from '../common/TaskDetailModal'
import useStore from '../../stores/store'

export default function WeeklyView({ weekId }) {
  const members = useStore(s => s.members)
  const tasks = useStore(s => s.tasks)
  const schedule = useStore(s => s.schedule)
  const [selectedTask, setSelectedTask] = useState(null)

  const week = schedule.weeks.find(w => w.id === weekId)
  const weekTasks = tasks.filter(t => t.week === weekId)

  return (
    <div>
      <WeekTab />

      {week && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <h3 className="font-semibold text-slate-800 mb-2">{week.name}</h3>
          <p className="text-sm text-slate-500 font-mono mb-3">{week.startDate} ~ {week.endDate}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {week.goals.map((g, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md">{g}</span>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">성공 기준</h4>
          <ul className="space-y-1">
            {week.successCriteria.map((sc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sc.checked} readOnly className="rounded" />
                <span className={sc.checked ? 'text-slate-400 line-through' : 'text-slate-700'}>{sc.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {members.map(member => {
        const memberTasks = weekTasks.filter(t => t.memberId === member.id)
        if (!memberTasks.length) return null
        return (
          <MemberAccordion
            key={member.id}
            member={member}
            tasks={memberTasks}
            onTaskClick={setSelectedTask}
          />
        )
      })}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          member={members.find(m => m.id === selectedTask.memberId)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
```

```jsx
// src/pages/WeeklyPage.jsx
import { useParams } from 'react-router-dom'
import WeeklyView from '../components/WeeklyView/WeeklyView'

export default function WeeklyPage() {
  const { weekId } = useParams()
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">주차별 상세</h2>
      <WeeklyView weekId={weekId} />
    </div>
  )
}
```

- [ ] **Step 3: 브라우저 확인 + 커밋**

```bash
npm run dev
# → /weekly/W1 접속 → 탭 + 성공 기준 + 담당자 아코디언 확인
git add -A
git commit -m "feat: 주차별 뷰 — 탭, 성공 기준, 담당자별 아코디언"
```

---

## Task 7: GitHub OAuth 인증

**Files:**
- Create: `src/hooks/useAuth.js`
- Modify: `src/components/Auth/LoginButton.jsx`, `src/components/Auth/OAuthCallback.jsx`, `src/components/Layout/Header.jsx`

- [ ] **Step 1: useAuth 훅 + LoginButton**

```js
// src/hooks/useAuth.js
import { useEffect } from 'react'
import useStore from '../stores/store'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const REDIRECT_URI = `${window.location.origin}/schedule/login/callback`

export function useAuth() {
  const user = useStore(s => s.user)
  const setUser = useStore(s => s.setUser)
  const clearUser = useStore(s => s.clearUser)

  useEffect(() => {
    const stored = sessionStorage.getItem('gh_user')
    if (stored && !user) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = () => {
    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo`
    window.location.href = url
  }

  const logout = () => {
    sessionStorage.removeItem('gh_token')
    sessionStorage.removeItem('gh_user')
    clearUser()
  }

  return { user, login, logout, isAuthenticated: !!user }
}
```

```jsx
// src/components/Auth/LoginButton.jsx
import { useAuth } from '../../hooks/useAuth'

export default function LoginButton() {
  const { user, login, logout, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" />
        <span className="text-sm text-slate-700">{user.login}</span>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 ml-1">로그아웃</button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      Login with GitHub
    </button>
  )
}
```

- [ ] **Step 2: OAuthCallback 처리**

```jsx
// src/components/Auth/OAuthCallback.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../stores/store'

export default function OAuthCallback() {
  const [status, setStatus] = useState('처리 중...')
  const navigate = useNavigate()
  const setUser = useStore(s => s.setUser)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      setStatus('인증 코드가 없습니다')
      return
    }

    // GitHub OAuth는 서버 사이드 토큰 교환이 필요.
    // GitHub Pages (정적)에서는 Gatekeeper 프록시 또는
    // Cloudflare Worker를 사용하여 code → token 교환.
    // 개발 편의를 위해 Personal Access Token 기반 폴백도 지원.
    setStatus('토큰 교환 중... (프록시 서버 필요)')

    // 데모 모드: localStorage에 PAT가 있으면 사용
    const pat = sessionStorage.getItem('gh_pat')
    if (pat) {
      fetchUser(pat)
    }

    async function fetchUser(token) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = await res.json()
        sessionStorage.setItem('gh_token', token)
        sessionStorage.setItem('gh_user', JSON.stringify(user))
        setUser(user)
        navigate('/')
      } catch {
        setStatus('로그인 실패')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-slate-600">{status}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Header에 LoginButton 연결**

Header.jsx의 로그인 버튼을 `<LoginButton />` 컴포넌트로 교체.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: GitHub OAuth 인증 — 로그인/로그아웃 + 콜백"
```

---

## Task 8: GitHub API 연동 (상태 변경 + 코멘트 커밋)

**Files:**
- Create: `src/hooks/useGitHub.js`
- Modify: `src/components/KanbanBoard/KanbanBoard.jsx`, `src/components/common/TaskDetailModal.jsx`

- [ ] **Step 1: useGitHub 훅 — JSON 파일 커밋**

```js
// src/hooks/useGitHub.js
const REPO_OWNER = 'team-project-final'
const REPO_NAME = 'schedule'
const FILE_PATH = 'src/data/tasks.json'

export function useGitHub() {
  const getToken = () => sessionStorage.getItem('gh_token')

  async function commitTasksUpdate(tasks, message) {
    const token = getToken()
    if (!token) throw new Error('로그인이 필요합니다')

    // 1. 현재 파일의 SHA 조회
    const fileRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const fileData = await fileRes.json()

    // 2. 새 내용으로 업데이트
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(tasks, null, 2))))
    const updateRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content,
          sha: fileData.sha,
          branch: 'main',
        }),
      }
    )

    if (!updateRes.ok) throw new Error('커밋 실패')
    return updateRes.json()
  }

  return { commitTasksUpdate }
}
```

- [ ] **Step 2: 칸반 드래그 시 GitHub 커밋 연동**

KanbanBoard.jsx의 `handleDragEnd`에 useGitHub 커밋 추가:

```jsx
const { commitTasksUpdate } = useGitHub()

const handleDragEnd = async (result) => {
  if (!result.destination || !user) return
  const { draggableId, destination } = result
  updateTaskStatus(draggableId, destination.droppableId)

  // GitHub 커밋 (비동기, 에러 시 토스트)
  try {
    const updatedTasks = useStore.getState().tasks
    await commitTasksUpdate(updatedTasks, `chore: ${draggableId} 상태 → ${destination.droppableId}`)
  } catch (err) {
    console.error('커밋 실패:', err)
  }
}
```

- [ ] **Step 3: 코멘트 추가 시 GitHub 커밋 연동**

TaskDetailModal.jsx의 `handleAddComment`에 커밋 추가.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: GitHub API 연동 — 상태 변경/코멘트 → JSON 커밋"
```

---

## Task 9: MD → JSON 동기화 스크립트

**Files:**
- Create: `scripts/sync-from-md.js`

- [ ] **Step 1: sync-from-md.js 작성**

Node.js 스크립트로 documents 레포의 MD 파일을 파싱하여 JSON 생성:
- SCOPE_*.md → members.json
- TASK_*.md → tasks.json (Step 필드 추출: 정규식으로 Step Name, Goal, Status, Duration 파싱)
- PRD_W*.md → schedule.json

```bash
node scripts/sync-from-md.js \
  --input ../documents/docs/project-management \
  --output src/data
```

- [ ] **Step 2: 스크립트 실행 테스트**

```bash
node scripts/sync-from-md.js --input C:/workspace/team-project-manager/team-project-final/documents/docs/project-management --output src/data
# → members.json, tasks.json, schedule.json 생성 확인
```

- [ ] **Step 3: 커밋**

```bash
git add -A
git commit -m "feat: MD → JSON 동기화 스크립트"
```

---

## Task 10: GitHub Actions 배포 + README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: deploy.yml — GitHub Pages 자동 배포**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

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
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: README.md 작성**

프로젝트 개요, 기술 스택, 로컬 실행 방법, 배포 방법, 데이터 동기화 방법 기재.

- [ ] **Step 3: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: GitHub Actions 배포 + README"
git push origin main
```

- [ ] **Step 4: GitHub Pages 설정**

GitHub repo Settings → Pages → Source: GitHub Actions 선택 → 배포 확인.
