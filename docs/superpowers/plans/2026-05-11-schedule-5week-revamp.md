# Schedule 4-week → 5-week Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4주 일정(5/12~6/6) → 5주 일정(5/12~6/15)으로 전체 일정·문서·schedule 앱 데이터를 일괄 갱신한다. W3 분할(이벤트 흐름 producer/consumer)과 W5/발표일을 도입한다.

**Architecture:** 영향 받는 파일은 3개의 독립 git 레포(`syn/`, `documents.wiki/`, `schedule/`)에 분포. 각 레포는 자체 commit 단위로 처리. tasks.json 60+개의 plannedStart/End는 일회성 Node 마이그레이션 스크립트로 일괄 재계산하여 정합성 보장. 외부 `documents` 레포(SCOPE/TASK/PRD/HISTORY 분할 마크다운)는 본 환경 외부에 있어 적용 가이드 README만 산출.

**Tech Stack:** Node.js (마이그레이션·검증 스크립트), Vite + React (schedule 앱 빌드 검증), git (3개 레포 commit), ripgrep/Grep (보정 누락 검증).

**Spec:** `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` (v3.0, commit `aa9479f`)

---

## 작업 흐름 의존도

```
T0 (사전 준비)
 ↓
T1 (sync 코드)  T2 (schedule.json)  T7 (17_스케줄)  T8 (01)  T9 (09a)  T10 (18 + grep)
 ↓                                       \         |         /
T3 (tasks.json) ← T1 의존                     T11 (위키 commit)
 ↓
T4 (검증 스크립트)
 ↓
T5 (앱 빌드/시각 확인)
 ↓
T6 (schedule commit)

T12 (외부 가이드 + syn commit) — T0 직후 시작 가능, 단 commit은 T6/T11 이후
```

권장 실행 순서: **T0 → T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12**.

---

## Task 0: 사전 준비 — 영향 범위 재확인 + 작업 백업

**Files:**
- Read: `D:/workspace/final-project-syn/syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` (정확한 매핑표 손에 두기)
- Check: `documents.wiki/`, `schedule/`, `syn/` 세 레포 git status

- [ ] **Step 1: 세 레포 git 상태 확인 (clean 여부)**

```bash
git -C "D:/workspace/final-project-syn/documents.wiki" status --short
git -C "D:/workspace/final-project-syn/schedule" status --short
git -C "D:/workspace/final-project-syn/syn" status --short
```

Expected: `documents.wiki` clean, `schedule`은 `?? .omc/` 정도(무관), `syn`은 spec commit 직후 clean. 이외의 변경이 있으면 사용자에게 확인 후 진행.

- [ ] **Step 2: 추가 grep 보정 대상 식별**

```bash
grep -rn "4주 \|W1~W4\|2026-06-06\|2026-06-08" \
  "D:/workspace/final-project-syn/documents.wiki/Home.md" \
  "D:/workspace/final-project-syn/documents.wiki/08_스토리_보드.md" \
  "D:/workspace/final-project-syn/documents.wiki/03_프로젝트_아키텍처_정의서.md" \
  "D:/workspace/final-project-syn/documents.wiki/06_화면_기능_정의서.md" \
  2>/dev/null
```

Expected: 0~수 건. 결과를 본 plan의 T10 Step 2에서 처리.

- [ ] **Step 3: 작업 직전 commit 해시 기록 (롤백용)**

```bash
echo "documents.wiki: $(git -C 'D:/workspace/final-project-syn/documents.wiki' rev-parse HEAD)"
echo "schedule:       $(git -C 'D:/workspace/final-project-syn/schedule' rev-parse HEAD)"
echo "syn:            $(git -C 'D:/workspace/final-project-syn/syn' rev-parse HEAD)"
```

Expected: 각 레포의 작업 직전 HEAD를 기록 (롤백 시 `git revert <hash>..HEAD`).

---

## Task 1: schedule/scripts/sync-from-md.js — W1~W5 확장

**Files:**
- Modify: `D:/workspace/final-project-syn/schedule/scripts/sync-from-md.js:188-189` (parseTasks의 `weekStarts`/`weekEnds`)
- Modify: `schedule/scripts/sync-from-md.js:177-185` (stepNumber 폴백 분기 보정)
- Modify: `schedule/scripts/sync-from-md.js:225` (재계산 루프의 `weekStarts`)
- Modify: `schedule/scripts/sync-from-md.js:1-15` (헤더 JSDoc에 5주 일정 주석 추가)

- [ ] **Step 1: 파일 현재 상태 확인**

Read `schedule/scripts/sync-from-md.js` lines 1-15, 175-200, 220-235.

Expected: line 188-189에 `weekStarts = { W1: '2026-05-12', W2: '2026-05-19', W3: '2026-05-26', W4: '2026-06-02' }`, line 225에 동일 객체.

- [ ] **Step 2: 헤더 JSDoc 갱신 (line 1-16)**

Edit:
- old_string: `/**
 * MD → JSON 동기화 스크립트
 *
 * documents 레포의 프로젝트 관리 문서(60개 MD)를 파싱하여
 * schedule 앱용 JSON 데이터(members.json, tasks.json, schedule.json)를 생성한다.
 *
 * 사용법:
 *   node scripts/sync-from-md.js --input <project-management-dir> --output <data-dir>
 *
 * 예시:
 *   node scripts/sync-from-md.js \
 *     --input ../documents/docs/project-management \
 *     --output src/data
 */`
- new_string: `/**
 * MD → JSON 동기화 스크립트
 *
 * documents 레포의 프로젝트 관리 문서(60개 MD)를 파싱하여
 * schedule 앱용 JSON 데이터(members.json, tasks.json, schedule.json)를 생성한다.
 *
 * 5주 일정 (2026-05-12 ~ 06-15) 반영, 2026-05-11.
 * 휴일: 5/25(부처님오신날), 6/3(제9회 전국동시지방선거).
 *
 * 사용법:
 *   node scripts/sync-from-md.js --input <project-management-dir> --output <data-dir>
 *
 * 예시:
 *   node scripts/sync-from-md.js \
 *     --input ../documents/docs/project-management \
 *     --output src/data
 */`

- [ ] **Step 3: parseTasks의 stepNumber 폴백 분기 (line 177-185) 5주로 보정**

Edit:
- old_string: `      } else if (stepNumber <= 3) {
        week = 'W1'
      } else if (stepNumber <= 6) {
        week = 'W2'
      } else if (stepNumber <= 9) {
        week = 'W3'
      } else {
        week = 'W4'
      }`
- new_string: `      } else if (stepNumber <= 3) {
        week = 'W1'
      } else if (stepNumber <= 6) {
        week = 'W2'
      } else if (stepNumber <= 8) {
        week = 'W3'
      } else if (stepNumber <= 11) {
        week = 'W4'
      } else {
        week = 'W5'
      }`

- [ ] **Step 4: parseTasks의 첫 weekStarts/weekEnds (line 188-189) 확장**

Edit:
- old_string: `      const weekStarts = { W1: '2026-05-12', W2: '2026-05-19', W3: '2026-05-26', W4: '2026-06-02' }
      const weekEnds = { W1: '2026-05-16', W2: '2026-05-23', W3: '2026-05-30', W4: '2026-06-06' }`
- new_string: `      const weekStarts = { W1: '2026-05-12', W2: '2026-05-18', W3: '2026-05-26', W4: '2026-06-01', W5: '2026-06-08' }
      const weekEnds = { W1: '2026-05-15', W2: '2026-05-22', W3: '2026-05-29', W4: '2026-06-05', W5: '2026-06-12' }`

- [ ] **Step 5: 재계산 루프의 두 번째 weekStarts (line 225) 확장**

Edit:
- old_string: `      const weekStarts = { W1: '2026-05-12', W2: '2026-05-19', W3: '2026-05-26', W4: '2026-06-02' }
      let cursor = new Date(weekStarts[week])`
- new_string: `      const weekStarts = { W1: '2026-05-12', W2: '2026-05-18', W3: '2026-05-26', W4: '2026-06-01', W5: '2026-06-08' }
      let cursor = new Date(weekStarts[week])`

- [ ] **Step 6: 변경 후 grep 검증 — 잔존 4주 정의 없음**

```bash
grep -n "W4: '2026-06-02'\|W4: '2026-06-06'\|stepNumber <= 9" \
  "D:/workspace/final-project-syn/schedule/scripts/sync-from-md.js"
```

Expected: 매치 0건 (모두 5주로 갱신됨).

- [ ] **Step 7: HOLIDAYS Set 확인 (이미 정확한지)**

```bash
grep -n "HOLIDAYS = new Set" "D:/workspace/final-project-syn/schedule/scripts/sync-from-md.js"
```

Expected: `const HOLIDAYS = new Set(['2026-05-25', '2026-06-03'])` — 변경 불필요.

---

## Task 2: schedule/src/data/schedule.json — 5주 + presentation 재작성

**Files:**
- Overwrite: `D:/workspace/final-project-syn/schedule/src/data/schedule.json`

- [ ] **Step 1: 새 schedule.json 작성 (Write로 전체 재작성)**

Write to `D:/workspace/final-project-syn/schedule/src/data/schedule.json`:

```json
{
  "weeks": [
    {
      "id": "W1",
      "name": "인프라 + 핵심 CRUD",
      "startDate": "2026-05-12",
      "endDate": "2026-05-15",
      "goals": [
        "DB 스키마",
        "4-서비스 골격",
        "기본 CRUD",
        "Spring Modulith 모듈 정의"
      ],
      "successCriteria": [
        { "text": "Docker Compose로 4-서비스 + Schema Registry 로컬 실행", "checked": false },
        { "text": "각 서비스 골격 동작 (Hello World + Health endpoint)", "checked": false },
        { "text": "Spring Modulith 모듈 검증 (`ApplicationModules.verify()`) 통과", "checked": false },
        { "text": "auth 모듈: 회원가입/로그인/JWT 발급 동작", "checked": false },
        { "text": "note·card·community 모듈: 기본 CRUD API 동작", "checked": false },
        { "text": "Flutter: 로그인/대시보드 화면 렌더링", "checked": false }
      ]
    },
    {
      "id": "W2",
      "name": "핵심 기능 완성",
      "startDate": "2026-05-18",
      "endDate": "2026-05-22",
      "goals": [
        "SRS 복습 / AI 카드 골격 / Graph + ES / 커뮤니티 공유 / Schema Registry 등록"
      ],
      "successCriteria": [
        { "text": "복습 세션 완전 동작 (카드 → 난이도 → SM-2 → 다음 복습일)", "checked": false },
        { "text": "덱 공유 → 복사 플로우 동작 (community → learning-card internal API)", "checked": false },
        { "text": "그래프 시각화 기본 동작", "checked": false },
        { "text": "검색(키워드 BM25 + 시맨틱 pgvector) 동작", "checked": false },
        { "text": "Schema Registry에 모든 v1 Avro 스키마 등록 + 호환성 검증 통과", "checked": false }
      ]
    },
    {
      "id": "W3",
      "name": "이벤트 발행자 + 검색 RRF + AI 자동 생성",
      "startDate": "2026-05-26",
      "endDate": "2026-05-29",
      "goals": [
        "gamification 완성",
        "Kafka producer 발행",
        "검색 RRF",
        "AI 카드 자동 생성"
      ],
      "successCriteria": [
        { "text": "모든 producer 토픽이 Schema Registry에 BACKWARD 호환으로 등록", "checked": false },
        { "text": "gamification.level_up / badge_earned / card.review.due / note.created 발행 동작", "checked": false },
        { "text": "gamification 완성 (배지·레벨·스트릭·리더보드)", "checked": false },
        { "text": "검색 RRF (BM25 + 시맨틱) 동작 + 정확도 측정 리포트", "checked": false },
        { "text": "AI 카드 자동 생성 (note.created → LLM → Card) 동작", "checked": false }
      ]
    },
    {
      "id": "W4",
      "name": "이벤트 소비자 + 운영 기능",
      "startDate": "2026-06-01",
      "endDate": "2026-06-05",
      "goals": [
        "notification 발송 (FCM + SES)",
        "audit Kafka 소비",
        "관리자/Admin 모더레이션",
        "통합 검증"
      ],
      "successCriteria": [
        { "text": "notification Kafka 소비 → FCM 푸시 + SES 이메일 발송 동작", "checked": false },
        { "text": "audit Kafka 소비 → audit_logs 적재 동작 (90일 보존)", "checked": false },
        { "text": "관리자 신고 처리 + 모더레이션 API 동작", "checked": false },
        { "text": "검색 튜닝 + 하이브리드 E2E 통과", "checked": false },
        { "text": "AI 카드 자동 생성 E2E 통과", "checked": false },
        { "text": "ArgoCD dev/staging 환경 자동 배포 검증", "checked": false }
      ]
    },
    {
      "id": "W5",
      "name": "E2E + 버그 + 발표 준비",
      "startDate": "2026-06-08",
      "endDate": "2026-06-12",
      "goals": [
        "전체 E2E",
        "P0 버그 수정",
        "성능 검증 (SLA)",
        "Staging 배포",
        "발표 자료/리허설"
      ],
      "successCriteria": [
        { "text": "전체 E2E 시나리오 통과", "checked": false },
        { "text": "테스트 커버리지 80% 이상", "checked": false },
        { "text": "Staging 환경 배포 완료", "checked": false },
        { "text": "P0 기능 100% 동작", "checked": false },
        { "text": "Schema Registry BACKWARD 호환성 모든 토픽 통과", "checked": false },
        { "text": "ArgoCD ApplicationSet으로 staging 환경 배포 완료", "checked": false },
        { "text": "발표 자료 완성 + 시연 리허설 1회 이상 수행", "checked": false }
      ]
    }
  ],
  "presentation": {
    "date": "2026-06-15",
    "title": "최종 발표·시연·제출",
    "frozen": true,
    "goals": [
      "최종 발표 (전체 팀)",
      "라이브 시연 (E2E 시나리오)",
      "최종 산출물 제출"
    ],
    "rules": [
      "코드 변경 금지 (긴급 P0 패치만 별도 hotfix 브랜치 허용)",
      "사전 리허설은 W5(2026-06-12) 이전에 완료"
    ]
  }
}
```

- [ ] **Step 2: JSON 유효성 검증**

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('D:/workspace/final-project-syn/schedule/src/data/schedule.json', 'utf-8')).weeks.length)"
```

Expected: `5`.

- [ ] **Step 3: presentation 객체 존재 확인**

```bash
node -e "const d = JSON.parse(require('fs').readFileSync('D:/workspace/final-project-syn/schedule/src/data/schedule.json', 'utf-8')); console.log(d.presentation?.date)"
```

Expected: `2026-06-15`.

---

## Task 3: schedule/src/data/tasks.json — 매핑 + 재계산

**Files:**
- Create (일회성): `D:/workspace/final-project-syn/schedule/scripts/recompute-tasks-5week.js`
- Overwrite: `D:/workspace/final-project-syn/schedule/src/data/tasks.json`

이 task는 60+ task의 `week` 재분류와 `plannedStart`/`plannedEnd` 재계산을 일회성 Node 스크립트로 처리한다. 스크립트는 작업 후 삭제(Step 6).

- [ ] **Step 1: 마이그레이션 스크립트 작성**

Write to `D:/workspace/final-project-syn/schedule/scripts/recompute-tasks-5week.js`:

```javascript
#!/usr/bin/env node
/**
 * 일회성 마이그레이션 — tasks.json을 4주 → 5주로 재계산.
 * spec: syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md §4.2 + §4.4
 * 작업 완료 후 본 스크립트 파일 삭제.
 */

import { readFileSync, writeFileSync } from 'fs'

const TASKS_PATH = 'src/data/tasks.json'

// §4.2 매핑: 기존 W3 task의 분배 (W3 또는 W4)
const W3_REMAP = {
  'engagement-6': 'W3', 'engagement-7': 'W3', 'engagement-8': 'W4',
  'frontend-7': 'W3', 'frontend-8': 'W4', 'frontend-9': 'W4',
  'knowledge-1-6': 'W3', 'knowledge-1-7': 'W3',
  'knowledge-2-7': 'W3', 'knowledge-2-8': 'W4', 'knowledge-2-9': 'W4',
  'learning-ai-7': 'W4', 'learning-ai-8': 'W4', 'learning-ai-9': 'W4',
  'learning-card-7': 'W3', 'learning-card-8': 'W3', 'learning-card-9': 'W4',
  'platform-6': 'W4', 'platform-7': 'W4', 'platform-8': 'W4',
  'team-lead-7': 'W4', 'team-lead-8': 'W4',
}

const WEEK_STARTS = {
  W1: '2026-05-12', W2: '2026-05-18', W3: '2026-05-26',
  W4: '2026-06-01', W5: '2026-06-08',
}
const HOLIDAYS = new Set(['2026-05-25', '2026-06-03'])

function isBusinessDay(d) {
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  return !HOLIDAYS.has(d.toISOString().split('T')[0])
}
function nextBusinessDay(d) {
  const c = new Date(d)
  while (!isBusinessDay(c)) c.setDate(c.getDate() + 1)
  return c
}
function addBusinessDays(start, days) {
  const c = new Date(start)
  let count = 0
  const target = Math.max(1, Math.ceil(days)) - 1
  while (count < target) {
    c.setDate(c.getDate() + 1)
    if (isBusinessDay(c)) count++
  }
  return c
}
function fmt(d) { return d.toISOString().split('T')[0] }

// 1) 로드
const tasks = JSON.parse(readFileSync(TASKS_PATH, 'utf-8'))

// 2) week 재분류
for (const t of tasks) {
  if (t.week === 'W3' && W3_REMAP[t.id]) {
    t.week = W3_REMAP[t.id]
  } else if (t.week === 'W4') {
    t.week = 'W5'
  }
  // W1·W2는 그대로
}

// 3) 권장 신규 task 2개 추가 (§4.3)
tasks.push({
  id: 'team-lead-12', memberId: 'team-lead', week: 'W5', stepNumber: 12,
  name: '최종 발표 자료 준비 + 시연 리허설',
  goal: '팀장이 최종 발표 자료를 준비하고 전체 팀과 시연 리허설을 1회 이상 수행한다.',
  status: 'not_started', startDate: null, endDate: null,
  durationDays: 1, plannedStart: '', plannedEnd: '',
  priority: 'P0', comments: [], dependencies: [],
})
tasks.push({
  id: 'frontend-14', memberId: 'frontend', week: 'W5', stepNumber: 14,
  name: '발표용 데모 시나리오 정돈',
  goal: '발표 시연 흐름이 안정적으로 진행되도록 데모 시나리오와 시드 데이터를 정돈한다.',
  status: 'not_started', startDate: null, endDate: null,
  durationDays: 0.5, plannedStart: '', plannedEnd: '',
  priority: 'P0', comments: [], dependencies: [],
})

// 4) plannedStart/plannedEnd 재계산 (§4.4 알고리즘)
const groups = {}
for (const t of tasks) {
  const key = `${t.memberId}|${t.week}`
  if (!groups[key]) groups[key] = []
  groups[key].push(t)
}
for (const [key, list] of Object.entries(groups)) {
  list.sort((a, b) => a.stepNumber - b.stepNumber)
  const week = key.split('|')[1]
  let cursor = new Date(WEEK_STARTS[week])
  for (const t of list) {
    cursor = nextBusinessDay(cursor)
    t.plannedStart = fmt(cursor)
    const end = addBusinessDays(cursor, t.durationDays)
    t.plannedEnd = fmt(end)
    cursor = new Date(end)
    cursor.setDate(cursor.getDate() + 1)
  }
}

// 5) stepNumber 오름차순 + memberId 정렬로 출력
tasks.sort((a, b) => {
  if (a.memberId !== b.memberId) return a.memberId.localeCompare(b.memberId)
  return a.stepNumber - b.stepNumber
})

writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2) + '\n')

// 6) 요약
const counts = {}
for (const t of tasks) counts[t.week] = (counts[t.week] || 0) + 1
console.log('재계산 완료:', JSON.stringify(counts))
console.log(`총 task 수: ${tasks.length}`)
```

- [ ] **Step 2: 스크립트 실행 (schedule 디렉토리에서)**

```bash
cd "D:/workspace/final-project-syn/schedule" && node scripts/recompute-tasks-5week.js
```

Expected 출력 예시:
```
재계산 완료: {"W1":...,"W2":...,"W3":...,"W4":...,"W5":...}
총 task 수: 83
```
W3 + W4 합이 기존 W3+W4 합과 일치(또는 권장 task 2개 만큼 증가)해야 함.

- [ ] **Step 3: 결과 샘플 검증 (W3·W4 분배 확인)**

```bash
node -e "
const t = JSON.parse(require('fs').readFileSync('D:/workspace/final-project-syn/schedule/src/data/tasks.json', 'utf-8'));
const w3 = t.filter(x => x.week === 'W3').map(x => x.id).sort();
const w4 = t.filter(x => x.week === 'W4').map(x => x.id).sort();
console.log('W3 (' + w3.length + '):', w3);
console.log('W4 (' + w4.length + '):', w4);
"
```

Expected:
- W3 task 수 = 신규 W3 분배 합계 (W1·W2 잔여 0 가정 시 8개)
- W4 task 수 = 14개 (§4.2)
- W3에 `engagement-6`, `engagement-7`, `frontend-7`, `knowledge-1-6`, `knowledge-1-7`, `knowledge-2-7`, `learning-card-7`, `learning-card-8` 포함
- W4에 `engagement-8`, `frontend-8`, `frontend-9`, `knowledge-2-8`, `knowledge-2-9`, `learning-ai-7`, `learning-ai-8`, `learning-ai-9`, `learning-card-9`, `platform-6`, `platform-7`, `platform-8`, `team-lead-7`, `team-lead-8` 포함

- [ ] **Step 4: 권장 신규 task 추가 확인**

```bash
node -e "
const t = JSON.parse(require('fs').readFileSync('D:/workspace/final-project-syn/schedule/src/data/tasks.json', 'utf-8'));
console.log('team-lead-12:', t.find(x => x.id === 'team-lead-12'));
console.log('frontend-14:', t.find(x => x.id === 'frontend-14'));
"
```

Expected: 두 객체 모두 출력, `week === 'W5'`, 유효한 `plannedStart`/`plannedEnd`.

- [ ] **Step 5: 마이그레이션 스크립트 삭제 (일회성)**

```bash
rm "D:/workspace/final-project-syn/schedule/scripts/recompute-tasks-5week.js"
```

Expected: 파일 삭제 완료. 다음 `git status` 시 신규 파일 없음.

---

## Task 4: 검증 스크립트 작성 + 실행 (V-3, V-4)

**Files:**
- Create (일회성): `D:/workspace/final-project-syn/schedule/scripts/verify-tasks-5week.js`

- [ ] **Step 1: 검증 스크립트 작성**

Write to `D:/workspace/final-project-syn/schedule/scripts/verify-tasks-5week.js`:

```javascript
#!/usr/bin/env node
/**
 * 일회성 검증 — tasks.json의 plannedStart/End가 모두 영업일이고 주차 범위 내인지.
 * spec: syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md §8.1 V-3·V-4
 */

import { readFileSync } from 'fs'

const HOLIDAYS = new Set(['2026-05-25', '2026-06-03'])
const RANGES = {
  W1: ['2026-05-12', '2026-05-15'],
  W2: ['2026-05-18', '2026-05-22'],
  W3: ['2026-05-26', '2026-05-29'],
  W4: ['2026-06-01', '2026-06-05'],
  W5: ['2026-06-08', '2026-06-12'],
}

function isBusinessDay(s) {
  const d = new Date(s)
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  return !HOLIDAYS.has(s)
}
function inRange(s, week) {
  const [start, end] = RANGES[week]
  return s >= start && s <= end
}

const tasks = JSON.parse(readFileSync('src/data/tasks.json', 'utf-8'))
const errors = []
let ok = 0
for (const t of tasks) {
  if (!isBusinessDay(t.plannedStart)) errors.push(`${t.id}: plannedStart ${t.plannedStart} not business day`)
  if (!isBusinessDay(t.plannedEnd))   errors.push(`${t.id}: plannedEnd ${t.plannedEnd} not business day`)
  if (!inRange(t.plannedStart, t.week)) errors.push(`${t.id}: plannedStart ${t.plannedStart} out of ${t.week} range ${RANGES[t.week].join('~')}`)
  if (t.plannedEnd > RANGES[t.week][1]) errors.push(`${t.id}: plannedEnd ${t.plannedEnd} > week end ${RANGES[t.week][1]} (잔무 이월 의도면 무시 가능)`)
  if (errors.length === 0 || errors[errors.length - 1].split(':')[0] !== t.id) ok++
}

if (errors.length === 0) {
  console.log(`✅ 모든 task ${tasks.length}개 검증 통과`)
} else {
  console.log(`❌ 오류 ${errors.length}건 / 검증 ${tasks.length}개:`)
  for (const e of errors) console.log(`   - ${e}`)
  process.exit(1)
}
```

- [ ] **Step 2: 검증 실행**

```bash
cd "D:/workspace/final-project-syn/schedule" && node scripts/verify-tasks-5week.js
```

Expected: `✅ 모든 task N개 검증 통과`. 만약 "잔무 이월" 경고만 있다면 사용자 확인 후 진행. 그 외 오류는 Task 3을 재실행하여 수정.

- [ ] **Step 3: 검증 스크립트 삭제 (일회성)**

```bash
rm "D:/workspace/final-project-syn/schedule/scripts/verify-tasks-5week.js"
```

Expected: 파일 삭제. `git status`에 신규 파일 없음.

---

## Task 5: schedule app 빌드 + dev 시각 확인

**Files:**
- 변경 없음 (빌드/실행만)

- [ ] **Step 1: 빌드 성공 확인**

```bash
cd "D:/workspace/final-project-syn/schedule" && npm run build
```

Expected: `vite v8.x.x building for production...` → 에러 없이 빌드 완료. 만약 import 에러 등이 발생하면 schedule.json 구조 변경(presentation 신설)이 컴포넌트에서 참조되는지 확인.

- [ ] **Step 2: dev 서버 백그라운드 실행 (시각 확인용)**

```bash
cd "D:/workspace/final-project-syn/schedule" && npm run dev
```

Run with `run_in_background: true`. 사용자에게 표시될 URL(보통 `http://localhost:5173/`)을 보고하여 직접 W1~W5 탭 표시·Gantt 6/15까지 그려짐을 확인 요청.

- [ ] **Step 3: 사용자 시각 확인 결과 받기**

사용자에게 묻기:
- "Weekly View에 W1~W5 탭 5개가 표시되는가?"
- "Gantt Chart 타임라인이 6/15(월) 발표일까지 그려지는가?"
- "Kanban Board의 W3·W4 카드 분배가 spec과 일치하는가? (W3 8개 / W4 14개)"

문제 발견 시 schedule.json/tasks.json 보정 또는 컴포넌트 코드 수정 task 추가.

- [ ] **Step 4: dev 서버 종료**

`KillBash` 또는 사용자가 `Ctrl+C`로 종료.

---

## Task 6: schedule 레포 commit

**Files:**
- Modified: `schedule/scripts/sync-from-md.js`, `schedule/src/data/schedule.json`, `schedule/src/data/tasks.json`

- [ ] **Step 1: 변경 파일 확인**

```bash
git -C "D:/workspace/final-project-syn/schedule" status --short
git -C "D:/workspace/final-project-syn/schedule" diff --stat
```

Expected: 정확히 3개 파일 변경 (sync-from-md.js, schedule.json, tasks.json). `.omc/`는 untracked로 남아 있어도 무관 (gitignore 후보).

- [ ] **Step 2: 의도된 파일만 staging**

```bash
git -C "D:/workspace/final-project-syn/schedule" add scripts/sync-from-md.js src/data/schedule.json src/data/tasks.json
```

Expected: `git status`에서 위 3개 파일이 staged 상태로 변경.

- [ ] **Step 3: commit (기존 conventional 스타일)**

```bash
git -C "D:/workspace/final-project-syn/schedule" commit -m "feat: 5주 일정 데이터 + sync 코드 W1~W5 확장 (2026-05-12 ~ 06-15)"
```

- [ ] **Step 4: 결과 확인**

```bash
git -C "D:/workspace/final-project-syn/schedule" log --oneline -3
```

Expected: 최상단에 새 commit, 이전 commit `5b061ee ci: GitHub Actions 배포 워크플로우 추가` 보존.

---

## Task 7: documents.wiki/17_스케줄.md — v3.0 전면 개편

**Files:**
- Overwrite: `D:/workspace/final-project-syn/documents.wiki/17_스케줄.md`

- [ ] **Step 1: 새 17_스케줄.md 본문 Write (전체 재작성)**

Write to `D:/workspace/final-project-syn/documents.wiki/17_스케줄.md`:

```markdown
# 17. 스케줄

> **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
> **버전**: v3.0
> **작성일**: 2026-05-07
> **수정일**: 2026-05-11
> **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

> ⚠️ **v3.0 5주 일정 개편 안내**
>
> 본 문서는 학기 팀 프로젝트의 가용 영업일이 22일 / 5주차로 확정됨에 따라 4주 → 5주로 전면 개편되었다.
> 공휴일 5/25(부처님오신날) · 6/3(제9회 전국동시지방선거)은 영업일에서 제외된다.
> 구 W3(부가 기능 + Kafka 통합 합본)은 이벤트 흐름 축으로 W3(producer)·W4(consumer)로 분할되었으며,
> 구 W4(통합 테스트/마무리)는 W5로 시프트되었다.
> 6/15(월)은 별도 최종 발표·시연·제출일로 분리된다.
> 설계 근거: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md`

---

## 1. 프로젝트 로드맵

### 전체 일정 (5주 팀 프로젝트, 22 영업일 + 발표일)

```
2026
 5월 W2(화~금)   5월 W3          5월 W4          6월 W1          6월 W2          6/15
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────┤
│ ████████      W1: 인프라+핵심CRUD (4일)
│              ██████████████  W2: 핵심 기능 완성 (5일)
│                              ████████        W3: 이벤트 발행자+RRF+AI (4일, 5/25 제외)
│                                              ████████      W4: 이벤트 소비자+운영 (4일, 6/3 제외)
│                                                            ██████████████  W5: E2E+버그+발표 준비 (5일)
│                                                                            ◆ 발표
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────┤
```

---

## 2. 마일스톤 상세

### W1: 인프라 + 핵심 CRUD (Week 1)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-12(화) ~ 2026-05-15(금), 4 영업일 |
| 목표 | DB 스키마, 4-서비스 골격, 기본 CRUD, Spring Modulith 모듈 정의 |
| **팀장** | 인프라 셋업 (EKS / RDS / MSK / Schema Registry / Redis / OpenSearch / ArgoCD / Istio — 09 §C1 Day 1 체크리스트 참조) / Docker Compose 4-서비스 + Schema Registry / CI/CD 기초 (mirror.yml + ci.yml + deploy.yml) |
| **`@platform-owner`** | synapse-platform-svc 골격 + auth 모듈 (OAuth + JWT + MFA 기초) |
| **`@engagement-owner`** | synapse-engagement-svc 골격 + community 모듈 (그룹 CRUD + 멤버 관리) |
| **`@knowledge-owner-1`** | synapse-knowledge-svc 골격 + note 모듈 (Markdown CRUD + 위키링크 파싱) |
| **`@knowledge-owner-2`** | knowledge-svc 테스트 + Spring Modulith 모듈 정의 (`@ApplicationModule`) + ArchUnit 검증 + Schema Registry 연동 검증 |
| **`@learning-card-owner`** | synapse-learning-card 골격 + card 모듈 (덱/카드 CRUD + SM-2 알고리즘 기초) |
| **`@learning-ai-owner`** | synapse-learning-ai 골격 (FastAPI scaffolding + Anthropic API 연동 + Embedding API 연결) |
| **Frontend (전체 협업)** | Flutter 앱 쉘 + 라우팅 + 인증 화면 + 대시보드 레이아웃. 모든 owner가 자기 도메인 UI를 부분 담당 |

**성공 기준**:
- [ ] Docker Compose로 4-서비스 + Schema Registry 로컬 실행
- [ ] 각 서비스 골격 동작 (Hello World + Health endpoint)
- [ ] Spring Modulith 모듈 검증 (`ApplicationModules.verify()`) 통과
- [ ] auth 모듈: 회원가입/로그인/JWT 발급 동작
- [ ] note·card·community 모듈: 기본 CRUD API 동작
- [ ] Flutter: 로그인/대시보드 화면 렌더링

---

### W2: 핵심 기능 완성 (Week 2)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-18(월) ~ 2026-05-22(금), 5 영업일 |
| 목표 | SRS 복습 / AI 카드 골격 / Graph + ES / 커뮤니티 공유 / Schema Registry 등록 |
| **팀장** | Kafka 토픽 설계 + Schema Registry 호환성 강제 (BACKWARD 글로벌 + Knowledge.events-value BACKWARD_TRANSITIVE) + Gateway 라우팅 (4-서비스) |
| **`@platform-owner`** | billing 모듈 (Stripe Checkout + Webhook + 플랜 관리) + notification 모듈 기초 (FCM 설정 + device_tokens) |
| **`@engagement-owner`** | gamification 모듈 (XP 기초 + xp_events) + community 공유 (덱·노트 share_token + 공유 콘텐츠 검색) |
| **`@knowledge-owner-1`** | graph 모듈 (백링크 + D3.js 데이터) + Elasticsearch 동기화 (Kafka) |
| **`@knowledge-owner-2`** | chunking 모듈 (비동기 청크 분할) + note 검색 통합 (BM25) |
| **`@learning-card-owner`** | SRS 복습 세션 완성 (rating → SM-2 → 다음 복습일) + card.reviewed Kafka 발행 + review_sessions 통계 |
| **`@learning-ai-owner`** | 시맨틱 검색 골격 (pgvector 임베딩 저장·조회) + AI 카드 자동 생성 골격 (Note → LLM → Card) |
| **Frontend (전체 협업)** | 노트 에디터 + SRS 복습 화면 + 커뮤니티 그룹 목록·상세 |

> **NOTE**: W2 community 기능은 Kafka stub으로 동작. 실제 알림 연동은 W4(소비자).

**성공 기준**:
- [ ] 복습 세션 완전 동작 (카드 → 난이도 → SM-2 → 다음 복습일)
- [ ] 덱 공유 → 복사 플로우 동작 (community → learning-card internal API)
- [ ] 그래프 시각화 기본 동작
- [ ] 검색(키워드 BM25 + 시맨틱 pgvector) 동작
- [ ] Schema Registry에 모든 v1 Avro 스키마 등록 + 호환성 검증 통과

---

### W3: 이벤트 발행자 + 검색 RRF + AI 자동 생성 (Week 3)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-26(화) ~ 2026-05-29(금), 4 영업일 (5/25 부처님오신날 제외) |
| 목표 | 모든 producer 토픽 발행 / gamification 완성 / 검색 RRF / AI 카드 자동 생성 |
| **팀장** | Kafka 발행 모니터링 + Schema Registry 호환성 검증 |
| **`@platform-owner`** | (W2 잔무 마무리: FCM 디바이스 등록·테스트) |
| **`@engagement-owner`** | gamification 완성 (배지 · 레벨 · 스트릭 · 리더보드) + `gamification.level_up` / `badge_earned` Kafka 발행 |
| **`@knowledge-owner-1`** | note 버전 이력 + 태그 관리 고도화 + Graph PageRank (시간 허용 시) |
| **`@knowledge-owner-2`** | 검색 RRF (BM25 + 시맨틱 결합) + 정확도 측정 |
| **`@learning-card-owner`** | `card.review.due` Kafka 발행 + 복습 통계 대시보드 |
| **`@learning-ai-owner`** | AI 카드 자동 생성 안정화 (W2 구현분 보강) + 시맨틱 캐시 (코사인 유사도 > 0.95) |
| **Frontend (전체 협업)** | 게이미피케이션 UI (XP 바·배지·레벨 애니메이션) + 검색 결과 RRF UI |

**성공 기준 (W3 종료 게이트)**:
- [ ] 모든 producer 토픽이 Schema Registry에 BACKWARD 호환으로 등록
- [ ] `gamification.level_up` / `badge_earned` / `card.review.due` / `note.created` 발행 동작
- [ ] gamification 완성 (배지·레벨·스트릭·리더보드)
- [ ] 검색 RRF (BM25 + 시맨틱) 동작 + 정확도 측정 리포트
- [ ] AI 카드 자동 생성 (`note.created` → LLM → Card) 동작

---

### W4: 이벤트 소비자 + 운영 기능 (Week 4)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-06-01(월) ~ 2026-06-05(금), 4 영업일 (6/3 제9회 전국동시지방선거 제외) |
| 목표 | notification 발송 / audit Kafka 소비 / 관리자·Admin 모더레이션 / 통합 검증 |
| **팀장** | 통합 테스트 조율 + 코드 리뷰 (모든 PR `@team-lead` 승인) + ArgoCD ApplicationSet dev/staging 배포 검증 |
| **`@platform-owner`** | notification Kafka 소비 (`gamification.*` / `community.*` / `card.review.due`) + FCM 푸시 + SES 이메일 + audit Kafka 소비 → audit_logs 적재 (90일 보존) + 테넌트·사용자 관리 |
| **`@engagement-owner`** | community 신고 처리 + Admin 모더레이션 API |
| **`@knowledge-owner-1`** | (W3 잔무 + 통합 검증) |
| **`@knowledge-owner-2`** | 검색 튜닝 + 하이브리드 검색 E2E + P0 버그 수정 |
| **`@learning-card-owner`** | (W3 잔무 + 복습 전체 E2E) |
| **`@learning-ai-owner`** | RAG Q&A (시간 허용 시) + AI 카드 자동 생성 E2E + 시맨틱 검색 정확도 검증 |
| **Frontend (전체 협업)** | 알림 센터 + 관리자 화면 + 공유 덱 탐색·상세 |

**성공 기준 (W4 종료 게이트)**:
- [ ] notification Kafka 소비 → FCM 푸시 + SES 이메일 발송 동작
- [ ] audit Kafka 소비 → audit_logs 적재 동작 (90일 보존)
- [ ] 관리자 신고 처리 + 모더레이션 API 동작
- [ ] 검색 튜닝 + 하이브리드 검색 E2E 통과
- [ ] AI 카드 자동 생성 E2E 통과
- [ ] ArgoCD dev/staging 환경 자동 배포 검증

---

### W5: E2E + 버그 + 발표 준비 (Week 5)

| 항목 | 내용 |
|------|------|
| 기간 | 2026-06-08(월) ~ 2026-06-12(금), 5 영업일 |
| 목표 | 전체 E2E / P0 버그 수정 / 성능 검증(SLA) / Staging 배포 / 발표 자료·리허설 |
| 전체 | 버그 수정, E2E 시나리오, 성능 튜닝, 문서 최종 정리, 발표 자료 작성, 시연 리허설 |

**성공 기준**:
- [ ] 전체 E2E 시나리오 통과
- [ ] 테스트 커버리지 80% 이상
- [ ] Staging 환경 배포 완료
- [ ] P0 기능 100% 동작
- [ ] Schema Registry BACKWARD 호환성 모든 토픽 통과
- [ ] ArgoCD ApplicationSet으로 staging 환경 배포 완료
- [ ] 발표 자료 완성 + 시연 리허설 1회 이상 수행

---

### 발표일 (2026-06-15 월)

| 항목 | 내용 |
|------|------|
| 일자 | 2026-06-15(월) |
| 책임 | 전체 팀 — 최종 발표·라이브 시연·제출 |
| 규칙 | **코드 동결** (긴급 P0 패치만 별도 hotfix 브랜치 허용) |
| 사전 조건 | W5(2026-06-12) 이전 시연 리허설 1회 이상 수행 |

---

## 3. 팀 분업 및 서비스 매핑

| 담당자 | 서비스 / 모듈 | W1 | W2 | W3 | W4 | W5 | 6/15 발표 |
|--------|--------|----|----|----|----|----|-----------|
| **팀장** | Gateway / 인프라 / 아키텍처 / Schema Registry / ArgoCD | 인프라 셋업 + Schema Registry + ApplicationSet | Kafka 토픽 + 호환성 강제 | Kafka 발행 모니터링 + 호환성 검증 | 통합 테스트 조율 + 코드 리뷰 + ArgoCD dev/staging | 최종 점검 + 발표 자료/리허설 | 발표 진행 |
| **`@platform-owner`** | synapse-platform-svc (auth + audit + billing + notification) | auth 모듈 (OAuth + JWT + MFA) | billing (Stripe) + notification 기초 (FCM) | (W2 잔무) | notification Kafka 소비 + FCM/SES + audit Kafka + 테넌트 관리 | 버그 수정 + 인증/결제 E2E | 발표 시연 |
| **`@engagement-owner`** | synapse-engagement-svc (community + gamification) | community CRUD + 멤버 관리 | gamification XP + community 공유 | gamification 완성 + Kafka 발행 | community 신고 + Admin 모더레이션 | 게이미피케이션/공유 E2E + P0 버그 | 발표 시연 |
| **`@knowledge-owner-1`** | synapse-knowledge-svc (note 모듈) | note Markdown CRUD + 위키링크 | graph 백링크 + ES 동기화 | note 버전·태그·Graph PageRank | (W3 잔무 + 통합 검증) | 노트/그래프 E2E + ES 안정화 | 발표 시연 |
| **`@knowledge-owner-2`** | synapse-knowledge-svc (graph + chunking 모듈, Modulith 검증) | knowledge-svc 테스트 + Modulith 모듈 정의 | chunking + 검색 BM25 | 검색 RRF (하이브리드) | 검색 튜닝 + E2E + P0 | 검색 안정화 + 정확도 리포트 | 발표 시연 |
| **`@learning-card-owner`** | synapse-learning-card (card + srs, Java) | learning-card 골격 + 덱/카드 CRUD + SM-2 | SRS 복습 세션 + Kafka 발행 | card.review.due 발행 + 복습 통계 | (W3 잔무 + 복습 전체 E2E) | 복습 안정화 + Kafka 안정화 | 발표 시연 |
| **`@learning-ai-owner`** | synapse-learning-ai (ai, Python/FastAPI) | learning-ai 골격 + LLM API 연결 | 시맨틱 검색 + AI 카드 골격 | AI 자동 생성 안정화 + 시맨틱 캐시 | RAG (시간 허용 시) + AI E2E + 정확도 검증 | 시맨틱 검색 안정화 | 발표 시연 |

> **Frontend는 전체 협업**: 별도 owner 없이 모든 트랙이 자기 도메인 UI를 담당. 매핑 상세는 `09_Git_규칙_정의서` v2.0 §0.3 참조.

---

## 4. 완료 정의 (Definition of Done)

모든 마일스톤에 공통으로 적용되는 완료 기준:

1. **기능**: 성공 기준 체크리스트 100% 충족
2. **테스트**: 커버리지 80% 이상, E2E 시나리오 통과
3. **성능**: SLA 목표 달성 (P95 기준)
4. **보안**: OWASP Top 10 취약점 없음
5. **배포**: Staging 검증 완료 → Production 배포 완료. ArgoCD ApplicationSet dev autoSync=true 자동 / staging·prod autoSync=false 수동 승인 (`09_Git_규칙_정의서` v2.0 §B3 참조)
6. **문서**: API 명세 + 변경 로그 업데이트
7. **모니터링**: 대시보드 + 알림 설정 완료

---

## 5. 장기 로드맵 안내 (Phase 1~4)

본 17은 학기 프로젝트의 **5주 단기 일정**(W1~W5: 2026-05-12 ~ 06-12) + 발표일(2026-06-15)을 다룬다. 장기 진화 로드맵은 다음 4개 Phase로 정의되어 있으며, 본 5주는 그 중 **Phase 1 MVP** 범위에 해당한다:

- **Phase 1 (MVP)**: Auth + Note CRUD + Card CRUD + 기본 XP — **본 학기 5주 범위**
- **Phase 2 (핵심 기능)**: FCM 알림 + 청킹/임베딩 + AI 카드 생성 + 리더보드
- **Phase 3 (고도화)**: MFA + Graph PageRank + RAG + 신고 시스템
- **Phase 4 (분리 검토)**: 트래픽·소유 기준 모듈 → 서비스 추출

각 Phase의 범위·일정 상세는 `SYNAPSE_Service_Consolidation.md` §5 및 `09_Git_규칙_정의서` v2.0 §0.2 참조. 본 17은 Phase 2 이후 일정을 다루지 않는다.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-05-07 | 최초 작성 (12개월 로드맵) |
| v1.1 | 2026-05-08 | 4주 팀 프로젝트 스케줄로 전면 개편; 주간 마일스톤(W1~W4) 상세 작성; 팀 분업 및 서비스 매핑 표 추가 |
| v2.0 | 2026-05-09 | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 추가. §1 4주 일정 Gantt 보존 / §2 W1~W4 마일스톤 작업 분배를 §0.3 매핑 (1+1+2+2) 7행으로 재배치 / §3 팀 분업 표 6행 → 7행 (팀장 + @platform-owner + @engagement-owner + @knowledge-owner-1·2 + @learning-card-owner + @learning-ai-owner) 재구성, Frontend 전체 협업으로 변경 / §4 DoD 배포 항목에 ApplicationSet 1줄 추가 / 신규 §5 Phase 1~4 장기 로드맵 안내 단락 추가. 도메인 서비스명을 4-서비스 + 모듈명으로 일관 정정. 4주 일정 자체는 학기 프로젝트 현실로 보존. |
| v3.0 | 2026-05-11 | 4주 → 5주 일정 전면 개편 (5/12~6/15, 22 영업일). 공휴일 5/25(부처님오신날) · 6/3(제9회 전국동시지방선거) 제외 반영. 구 W3 (gamification·notification·audit 합본) → 이벤트 흐름 ②축으로 W3(producer) · W4(consumer)로 분할. 구 W4(통합 테스트/마무리) → W5로 시프트. 6/15(월) 최종 발표·시연·제출일 별도 명시. §1 Gantt 5주로 재작성, §2 W1~W5 + 발표일 마일스톤, §3 팀 분업 표 W1~W5 + 발표 컬럼으로 확장. 설계 근거: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` |
```

- [ ] **Step 2: 변경 후 file 일관성 grep**

```bash
grep -n "4주 \|2026-06-06\|W1~W4" "D:/workspace/final-project-syn/documents.wiki/17_스케줄.md"
```

Expected: 0건 (변경 이력의 v1.1·v2.0 행에만 "4주" 보존되어 있고, 이는 역사이므로 OK). 만약 다른 위치에 잔존하면 보정.

---

## Task 8: documents.wiki/01_프로젝트_계획서.md — 부분 갱신

**Files:**
- Modify: `D:/workspace/final-project-syn/documents.wiki/01_프로젝트_계획서.md` (3곳)

- [ ] **Step 1: §1.4 In Scope 헤더 수정**

Edit:
- old_string: `### 포함 (In Scope) — MVP Phase 1 (4주)`
- new_string: `### 포함 (In Scope) — MVP Phase 1 (5주)`

- [ ] **Step 2: §1.8 일정 계획표 첫 행 수정**

Edit:
- old_string: `| Phase 1: MVP | 4주 (팀 프로젝트) | 노트/카드/SRS/AI/검색/인증/빌링 + 커뮤니티/게이미피케이션/알림 |`
- new_string: `| Phase 1: MVP | 5주 (팀 프로젝트, 2026-05-12 ~ 06-15) | 노트/카드/SRS/AI/검색/인증/빌링 + 커뮤니티/게이미피케이션/알림 |`

- [ ] **Step 3: 변경 이력에 v1.2 행 추가**

Edit:
- old_string: `| v1.0 | 2026-05-07 | 최초 작성 |
| v1.1 | 2026-05-08 | 1.3.4 스터디 그룹 멤버 페르소나 추가; 1.4 커뮤니티/게이미피케이션/알림/모더레이션/관리자 확장 In Scope 추가; 1.6 플랜 구조에 그룹 가입/덱 공유/그룹 생성 컬럼 추가; 1.7 공유 덱 복사율/스터디 그룹 참여율/알림 클릭률 KPI 추가; 1.8 Phase 1 기간 4주로 변경 및 커뮤니티/게이미피케이션/알림 포함 명시; 1.9 커뮤니티 남용/게이미피케이션 역효과/푸시 알림 피로감 리스크 추가; 1.10 7인 팀 구성으로 업데이트 |`
- new_string: `| v1.0 | 2026-05-07 | 최초 작성 |
| v1.1 | 2026-05-08 | 1.3.4 스터디 그룹 멤버 페르소나 추가; 1.4 커뮤니티/게이미피케이션/알림/모더레이션/관리자 확장 In Scope 추가; 1.6 플랜 구조에 그룹 가입/덱 공유/그룹 생성 컬럼 추가; 1.7 공유 덱 복사율/스터디 그룹 참여율/알림 클릭률 KPI 추가; 1.8 Phase 1 기간 4주로 변경 및 커뮤니티/게이미피케이션/알림 포함 명시; 1.9 커뮤니티 남용/게이미피케이션 역효과/푸시 알림 피로감 리스크 추가; 1.10 7인 팀 구성으로 업데이트 |
| v1.2 | 2026-05-11 | Phase 1 MVP 기간 4주 → 5주 (5/12~6/15, 22 영업일). §1.4 In Scope 헤더, §1.8 일정 계획표 첫 행 갱신. 설계 근거: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` |`

- [ ] **Step 4: 갱신 검증**

```bash
grep -n "MVP Phase 1\|Phase 1: MVP" "D:/workspace/final-project-syn/documents.wiki/01_프로젝트_계획서.md"
```

Expected: §1.4 헤더와 §1.8 표 행 모두 "5주"로 갱신됨.

---

## Task 9: documents.wiki/09a_Git_워크플로우_가이드.md — 부분 갱신

**Files:**
- Modify: `D:/workspace/final-project-syn/documents.wiki/09a_Git_워크플로우_가이드.md` (5곳)

이 문서는 "4주 프로젝트" 표현이 §1.1·§3.6 등 5곳에 분산되어 있어 한 곳씩 정확히 보정한다.

- [ ] **Step 1: 헤더 "프로젝트 기간" 수정 (line 4)**

Edit:
- old_string: `> **프로젝트 기간**: 4주 (단기 팀 프로젝트)`
- new_string: `> **프로젝트 기간**: 5주 (단기 팀 프로젝트, 2026-05-12 ~ 06-15)`

- [ ] **Step 2: §1.1 "4주 프로젝트라도" 본문 수정 (line 96)**

Edit:
- old_string: `4주 프로젝트라도 — 아니, 오히려 4주이기 때문에 — 한 서비스의 빌드 실패가 다른 서비스의 데모를 막아서는 안 됩니다. 주차 발표 직전 learning-svc CI가 깨졌다고 platform/knowledge 데모까지 멈출 수는 없습니다.`
- new_string: `5주 프로젝트라도 — 아니, 오히려 5주이기 때문에 — 한 서비스의 빌드 실패가 다른 서비스의 데모를 막아서는 안 됩니다. 주차 발표 직전 learning-svc CI가 깨졌다고 platform/knowledge 데모까지 멈출 수는 없습니다.`

- [ ] **Step 3: §1.1 "4주 프로젝트의 가장 큰 위험" 본문 수정 (line 110)**

Edit:
- old_string: `4주 프로젝트의 가장 큰 위험은 "merge conflict 해결로 시간을 다 쓰는 것"입니다. 한 모노레포에 6명이 모이면 매일 충돌이 발생합니다. 폴리레포는 도메인별로 작업 영역을 물리적으로 분리해 충돌을 최소화합니다.`
- new_string: `5주 프로젝트의 가장 큰 위험은 "merge conflict 해결로 시간을 다 쓰는 것"입니다. 한 모노레포에 6명이 모이면 매일 충돌이 발생합니다. 폴리레포는 도메인별로 작업 영역을 물리적으로 분리해 충돌을 최소화합니다.`

- [ ] **Step 4: §1.1 결론 본문 수정 (line 124)**

Edit:
- old_string: `**결론**: 폴리레포의 단점은 도구로 해결 가능, 모노레포의 단점(도메인 결합 + 충돌 폭증)은 4주 안에 해결 불가. 그래서 폴리레포입니다.`
- new_string: `**결론**: 폴리레포의 단점은 도구로 해결 가능, 모노레포의 단점(도메인 결합 + 충돌 폭증)은 5주 안에 해결 불가. 그래서 폴리레포입니다.`

- [ ] **Step 5: §3.6 통합 릴리즈 횟수 본문 수정 (line 914)**

Edit:
- old_string: `각 주차 종료 직전(주차별 데모 D-1). 한 주 동안 4개 백엔드 + 프론트가 각자 배포한 새 버전을 검증해서 **주차별 통합 릴리즈 태그**를 찍습니다. 4주 프로젝트 기준 총 4회의 통합 릴리즈가 발생합니다.`
- new_string: `각 주차 종료 직전(주차별 데모 D-1). 한 주 동안 4개 백엔드 + 프론트가 각자 배포한 새 버전을 검증해서 **주차별 통합 릴리즈 태그**를 찍습니다. 5주 프로젝트 기준 총 5회의 통합 릴리즈 + 발표일 hotfix 1회(필요 시)가 발생합니다.`

- [ ] **Step 6: §3.6 주차별 릴리즈 표에 W5 + 발표 행 추가 (line 921 부근)**

먼저 line 921 주변 컨텍스트 확인 후 표 본문에 행 추가. 표가 다음과 같다면:

```markdown
| 1주차 말 | `v0.1.0` (alpha) | platform 골격 |
| 2주차 말 | `v0.2.0` (beta)  | + engagement, knowledge |
| 3주차 말 | `v0.3.0` (rc)    | + 통합 테스트 |
| 4주차 말 | `v1.0.0` (release) | + learning (카드/SRS/AI) — 최종 발표 |
```

Edit (실제 표 형태에 맞게 보정 — Step 5 직후 line 921 영역을 Read로 확인 후 적용):
- old_string: `| 4주차 말 | `v1.0.0` (release) | + learning (카드/SRS/AI) — 최종 발표 |`
- new_string: `| 4주차 말 | `v0.4.0` (rc2)    | + 이벤트 소비자 + 운영 (notification/audit/admin) |
| 5주차 말 | `v1.0.0-rc` (release candidate) | + E2E + Staging 배포 |
| 6/15 발표 | `v1.0.0` (release) | 최종 발표·시연·제출 (코드 동결) |`

> 주의: §3.6 표의 정확한 형태는 Step 5 적용 후 line 920~925를 Read하여 확인. 위 diff는 추정이며, 실제 행과 다를 경우 표의 4주차 행을 5주차 + 발표로 분리하여 동일한 의미가 되도록 보정.

- [ ] **Step 7: 변경 이력에 v1.2 행 추가 (line 1219 부근)**

Edit:
- old_string: `| v1.1 | 2026-05-10 | Synapse Team | 4주 프로젝트 맥락 반영 (§1.1 폴리레포 이유 #2/#3 재구성, §3.6 주차별 통합 릴리즈로 수정), §1.2 Mermaid 다이어그램 색상 가독성 개선 (라이트/다크 모드 양쪽 호환). |`
- new_string: `| v1.1 | 2026-05-10 | Synapse Team | 4주 프로젝트 맥락 반영 (§1.1 폴리레포 이유 #2/#3 재구성, §3.6 주차별 통합 릴리즈로 수정), §1.2 Mermaid 다이어그램 색상 가독성 개선 (라이트/다크 모드 양쪽 호환). |
| v1.2 | 2026-05-11 | Synapse Team | 4주 → 5주 일정 개편 반영. 헤더 "프로젝트 기간" 5주로 갱신, §1.1 본문 "4주" 표현 3곳 보정, §3.6 주차별 통합 릴리즈 4회 → 5회 + 발표 행 추가. 설계 근거: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` |`

- [ ] **Step 8: 변경 후 갱신 검증**

```bash
grep -n "4주 프로젝트\|^> \*\*프로젝트 기간\*\*: 4주" "D:/workspace/final-project-syn/documents.wiki/09a_Git_워크플로우_가이드.md"
```

Expected: 변경 이력 v1.1 행을 제외한 모든 매치가 0건 (역사 보존). 잔존 시 추가 보정.

---

## Task 10: documents.wiki/18_기술_스택_정의서.md + 추가 grep 보정

**Files:**
- Modify: `D:/workspace/final-project-syn/documents.wiki/18_기술_스택_정의서.md` (1줄)
- (조건부) Modify: T0 Step 2에서 식별된 추가 파일들

- [ ] **Step 1: 18 본문 1줄 보정 (line 368)**

Edit:
- old_string: `Synapse는 11개 백엔드 서비스와 통신하는 복잡한 클라이언트 앱이다. Riverpod는 BLoC 대비 보일러플레이트가 적고, `@riverpod` 코드 생성으로 타입 안전한 Provider를 빠르게 작성할 수 있다. 또한 Provider 간 의존성 자동 관리, 자동 dispose, 비동기 데이터 로딩(`AsyncValue`)이 내장되어 API 호출이 많은 SaaS 앱에 적합하다. 7명 팀에서 4주 내 30+ 화면을 구현해야 하므로 생산성이 핵심이다.`
- new_string: `Synapse는 11개 백엔드 서비스와 통신하는 복잡한 클라이언트 앱이다. Riverpod는 BLoC 대비 보일러플레이트가 적고, `@riverpod` 코드 생성으로 타입 안전한 Provider를 빠르게 작성할 수 있다. 또한 Provider 간 의존성 자동 관리, 자동 dispose, 비동기 데이터 로딩(`AsyncValue`)이 내장되어 API 호출이 많은 SaaS 앱에 적합하다. 7명 팀에서 5주 내 30+ 화면을 구현해야 하므로 생산성이 핵심이다.`

- [ ] **Step 2: 18 변경 이력 §11에 v2.1 행 추가**

Edit:
- old_string: `| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 + 신규 백과사전 항목(4.1.8 Spring Modulith / 5.5 Confluent Schema Registry / 5.6 Apache Avro) 추가. 1.2 시스템 다이어그램 4-서비스 재구성 / 1.4 기술 스택 표 4행 추가 / 5.4 Kafka 절 Avro 단락 / 5.5 AWS S3 → 5.7 절번호 정정 / 7.3 ArgoCD ApplicationSet sub-section / 7.4 폴리레포 워크플로 단락 / 10.1 / 10.2 / 12.1 / 12.4 매트릭스 갱신. 직교 절(2.x / 3.x / 4.1.1~4.1.7 / 4.2 / 5.1~5.3 / 6 / 7.1 / 7.5~7.7 / 8 / 9) 보존. |`
- new_string: `| v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 + 신규 백과사전 항목(4.1.8 Spring Modulith / 5.5 Confluent Schema Registry / 5.6 Apache Avro) 추가. 1.2 시스템 다이어그램 4-서비스 재구성 / 1.4 기술 스택 표 4행 추가 / 5.4 Kafka 절 Avro 단락 / 5.5 AWS S3 → 5.7 절번호 정정 / 7.3 ArgoCD ApplicationSet sub-section / 7.4 폴리레포 워크플로 단락 / 10.1 / 10.2 / 12.1 / 12.4 매트릭스 갱신. 직교 절(2.x / 3.x / 4.1.1~4.1.7 / 4.2 / 5.1~5.3 / 6 / 7.1 / 7.5~7.7 / 8 / 9) 보존. |
| v2.1 | 2026-05-11 | Synapse Team | "7명 팀에서 4주 내 30+ 화면" → "5주 내 30+ 화면" (1줄 보정). 5주 일정 개편의 사이드 이펙트 — 설계 근거: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md` |`

- [ ] **Step 3: T0 Step 2의 추가 grep 결과 보정**

T0 Step 2에서 식별된 파일들(`Home.md`, `08_스토리_보드.md`, `03_프로젝트_아키텍처_정의서.md`, `06_화면_기능_정의서.md` 등)을 하나씩 열어 일정 의미의 "4주", "W1~W4", "06-06" 표현을 5주 표현으로 보정.

판단 기준:
- 본 학기 일정을 가리키는 표현 → 갱신
- SRS 알고리즘 설명("2~4주 후 복습"), 다른 Phase 정의(Phase 2 4주 등), 역사 변경 이력 → 보존

각 파일별로 Edit 적용 후 다음 grep으로 재검증:
```bash
grep -n "4주\|W1~W4\|06-06" "<해당 파일>"
```

- [ ] **Step 4: 전체 위키에 잔존 일정 표현 0건 확인**

```bash
grep -rn "프로젝트 기간.*4주\|MVP Phase 1.*4주\|4주 단기\|4주 팀" \
  "D:/workspace/final-project-syn/documents.wiki/" --include="*.md"
```

Expected: 변경 이력의 역사 표현(v1.1·v2.0 등)을 제외한 모든 매치가 0건. 변경 이력 매치는 OK.

---

## Task 11: documents.wiki 레포 — 통합 commit

**Files:**
- Modified: `documents.wiki/{17_스케줄, 01_프로젝트_계획서, 09a_Git_워크플로우_가이드, 18_기술_스택_정의서, ...}.md`

- [ ] **Step 1: 변경 파일 확인**

```bash
git -C "D:/workspace/final-project-syn/documents.wiki" status --short
git -C "D:/workspace/final-project-syn/documents.wiki" diff --stat
```

Expected: T7~T10에서 갱신한 파일들이 modified 상태로 표시. 의도하지 않은 파일 변경이 있으면 사용자에게 확인.

- [ ] **Step 2: 의도된 파일 staging**

```bash
git -C "D:/workspace/final-project-syn/documents.wiki" add 17_스케줄.md 01_프로젝트_계획서.md 09a_Git_워크플로우_가이드.md 18_기술_스택_정의서.md
# T10 Step 2에서 보정한 추가 파일이 있다면 함께 add
```

Expected: 위 4개 파일(+ 추가 보정 파일)이 staged.

- [ ] **Step 3: commit (기존 wiki 스타일)**

```bash
git -C "D:/workspace/final-project-syn/documents.wiki" commit -m "docs: 17 v3.0 + 01 v1.2 + 09a v1.2 + 18 4주→5주 일정 일괄 갱신 (5/12~6/15, W3 producer/consumer 분할)"
```

- [ ] **Step 4: 결과 확인**

```bash
git -C "D:/workspace/final-project-syn/documents.wiki" log --oneline -3
```

Expected: 최상단에 새 commit, 이전 commit `df54cab docs: 09 v2.0.1 ...` 보존.

---

## Task 12: 외부 documents 레포 적용 가이드 README + syn 레포 commit

**Files:**
- Create: `D:/workspace/final-project-syn/syn/docs/superpowers/notes/2026-05-11-external-documents-repo-5week-migration.md`

본 작업 환경 외부의 `documents` 레포(SCOPE/TASK/PRD/HISTORY 분할 마크다운)를 사용자가 직접 적용하기 위한 절차를 별도 노트로 산출한다. 본 spec의 §5.4 + 부록 B를 발췌·정돈.

- [ ] **Step 1: 가이드 README 작성**

Write to `D:/workspace/final-project-syn/syn/docs/superpowers/notes/2026-05-11-external-documents-repo-5week-migration.md`:

```markdown
# 외부 `documents` 레포 5주 일정 적용 가이드

> **작성일**: 2026-05-11
> **대상 레포**: `documents/docs/project-management/` (본 작업 환경 외부)
> **근거 spec**: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md`

## 1. 적용 순서

본 작업으로 `schedule/src/data/{schedule,tasks}.json`은 이미 5주로 갱신되었다.
외부 `documents` 레포의 분할 마크다운을 5주로 적용하면, sync 결과가 본 환경 결과와 일치하게 된다.

```bash
# 1. 외부 documents 레포로 이동
cd <documents-repo-path>/docs/project-management

# 2. PRD 분할/이동
git mv prd/PRD_W4.md prd/PRD_W5.md
# (PRD_W3.md는 본문 수정, 새 PRD_W4.md는 신규 작성 — §3 참조)

# 3. TASK 7개 헤더 변환 (W3 분할, W4 → W5)
#    각 TASK_*.md를 열고 spec §4.2 매핑표에 따라 ## W3 섹션을 ## W3 / ## W4로 분리,
#    기존 ## W4 섹션을 ## W5로 헤더 변경.

# 4. SCOPE 7개 — 일정 언급 부분만 5주로 보정 (대부분 변경 없음)

# 5. HISTORY 7개 — 신규 W5 step 행만 추가 (기존 행 유지)

# 6. sync 실행
cd <schedule-repo-path>
node scripts/sync-from-md.js \
  --input <documents-repo-path>/docs/project-management \
  --output src/data

# 7. 결과 비교
git diff src/data/  # 본 작업 결과와 0 diff면 적용 성공
```

## 2. PRD 분할 diff (핵심)

### 2.1 prd/PRD_W3.md (본문 수정)

```diff
- # PRD: Week 3 — 부가 기능 + Kafka 통합
- 기간 | 2026-05-26 ~ 2026-05-30
+ # PRD: Week 3 — 이벤트 발행자 + 검색 RRF + AI 자동 생성
+ 기간 | 2026-05-26 ~ 2026-05-29 (5/25 부처님오신날 제외)

- ## 5. 성공 기준
- - [ ] 복습 완료 → XP 적립 → 레벨업 → 축하 + 알림 전체 흐름 동작
- - [ ] 덱 공유 → 그룹원 알림 동작
+ ## 5. 성공 기준
+ - [ ] 모든 producer 토픽이 Schema Registry에 BACKWARD 호환으로 등록
+ - [ ] gamification.level_up / badge_earned / card.review.due / note.created 발행 동작
+ - [ ] gamification 완성 (배지·레벨·스트릭·리더보드)
+ - [ ] 검색 RRF (BM25 + 시맨틱) 동작 + 정확도 측정 리포트
+ - [ ] AI 카드 자동 생성 (note.created → LLM → Card) 동작
```

### 2.2 prd/PRD_W4.md (신규 파일)

```markdown
# PRD: Week 4 — 이벤트 소비자 + 운영 기능

| 항목 | 내용 |
|------|------|
| 기간 | 2026-06-01 ~ 2026-06-05 (6/3 지방선거일 제외) |

## 5. 성공 기준

- [ ] notification Kafka 소비 → FCM 푸시 + SES 이메일 발송 동작
- [ ] audit Kafka 소비 → audit_logs 적재 동작 (90일 보존)
- [ ] 관리자 신고 처리 + 모더레이션 API 동작
- [ ] 검색 튜닝 + 하이브리드 E2E 통과
- [ ] AI 카드 자동 생성 E2E 통과
- [ ] ArgoCD dev/staging 환경 자동 배포 검증
```

### 2.3 prd/PRD_W5.md (구 PRD_W4.md 이름 변경 + 갱신)

```diff
- # PRD: Week 4 — 통합 테스트 + 마무리
- 기간 | 2026-06-02 ~ 2026-06-06
+ # PRD: Week 5 — E2E + 버그 + 발표 준비
+ 기간 | 2026-06-08 ~ 2026-06-12
+ 발표 | 2026-06-15(월) — 코드 동결, 발표·시연·제출
```

## 3. TASK 헤더 변환 (모든 TASK_*.md 공통)

각 팀원의 `TASK_<owner>.md`에서:

```diff
- ## W3
- ### Step N: 게이미피케이션 ...
- ### Step N+1: 알림 ...
+ ## W3
+ ### Step N: 게이미피케이션 ... (발행자)
+ ## W4
+ ### Step N+1: 알림 ... (소비자)
- ## W4
+ ## W5
  (기존 W4 내용 그대로)
```

각 step의 W3 → W4 분배는 spec §4.2 매핑표를 참조.

## 4. 검증

적용 후 sync를 돌리고 본 환경의 `schedule/src/data/{schedule,tasks}.json`과 diff 0건이면 적용 성공.

```bash
cd <schedule-repo-path>
node scripts/sync-from-md.js --input <documents-repo-path>/docs/project-management --output src/data
git diff src/data/
```

## 5. 롤백

외부 레포에서 `git revert <commit>` 한 줄. sync를 다시 돌리면 schedule app은 이전 4주 상태로 돌아간다.
```

- [ ] **Step 2: 가이드 파일 staging + commit (syn 레포)**

```bash
git -C "D:/workspace/final-project-syn/syn" add docs/superpowers/notes/2026-05-11-external-documents-repo-5week-migration.md
git -C "D:/workspace/final-project-syn/syn" commit -m "docs: 외부 documents 레포 5주 일정 적용 가이드 추가 (PRD 분할 + TASK 헤더 변환)"
```

- [ ] **Step 3: 결과 확인 — 세 레포 commit 요약**

```bash
echo "=== syn ==="
git -C "D:/workspace/final-project-syn/syn" log --oneline -5
echo "=== schedule ==="
git -C "D:/workspace/final-project-syn/schedule" log --oneline -3
echo "=== documents.wiki ==="
git -C "D:/workspace/final-project-syn/documents.wiki" log --oneline -3
```

Expected:
- syn: 최상단 2개가 본 작업 (spec + 외부 가이드)
- schedule: 최상단 1개가 본 작업 (5주 데이터 + sync 코드)
- documents.wiki: 최상단 1개가 본 작업 (위키 4개 문서 일괄 갱신)

---

## 종료 후 보고 양식

작업 완료 시 사용자에게 다음 형태로 요약 보고:

```
✅ 5주 일정 개편 적용 완료

Commits:
- syn (aa9479f): spec v3.0
- syn (XXXXXXX): 외부 documents 가이드
- schedule (XXXXXXX): 데이터 + sync 코드
- documents.wiki (XXXXXXX): 위키 4개 문서

검증:
- tasks.json N개 무결성 통과 (모두 영업일, 주차 범위 내)
- schedule app build 통과
- 위키 grep "4주 프로젝트" 잔존 0건 (역사 보존 제외)

남은 작업 (사용자 환경):
- 외부 documents 레포 적용: syn/docs/superpowers/notes/2026-05-11-external-documents-repo-5week-migration.md 참조
- 적용 후 sync 실행 → schedule/src/data/ diff 0건 확인
```
