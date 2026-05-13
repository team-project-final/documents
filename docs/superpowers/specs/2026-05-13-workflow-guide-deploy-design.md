# Workflow Guide 페이지 배포 설계

**날짜**: 2026-05-13
**상태**: 초안 (사용자 리뷰 대기)
**대상 repo**: [team-project-final/workflow-guide](https://github.com/team-project-final/workflow-guide) (public)
**소스 repo**: [team-project-final/documents](https://github.com/team-project-final/documents)

## 1. 문제

`documents/workflow-guides/` 폴더에 약 100개의 standalone HTML 워크플로 가이드가 누적되고 있으나 (5주차 × 8 담당자 × 13 step), 정리된 진입점 없이 폴더 트리만 노출되어 있다. 작성자/리뷰어/팀장이 다음을 빠르게 하기 어렵다.

- 특정 주차·멤버·키워드로 가이드 찾기
- 전체 진척을 한눈에 보기 (행=멤버, 열=주차)
- 외부와 공유 가능한 URL로 가이드 링크 전달
- 작성자별로 다른 디자인·헤더·네비게이션 부재

## 2. 결정 요약

| # | 항목 | 선택 |
|---|---|---|
| 1 | 노출 콘텐츠 범위 | `workflow-guides/` HTML 가이드만 (≈100개) |
| 2 | 대상 repo | `team-project-final/workflow-guide` (이미 존재, public) |
| 3 | 구성 방식 | 가벼운 빌드 스크립트로 인덱스/검색 자동 생성 |
| 4 | 네비게이션 | 듀얼 탭(주차 / 멤버) + 홈 매트릭스 하이브리드 |
| 5 | 동기화 | documents = source of truth → Actions가 workflow-guide로 push |
| 6 | 디자인 통일성 | 빌드가 모든 가이드 HTML에 공통 헤더/사이드바 wrapper 주입 |
| 7 | 검색 | 필터 + fuse.js 메타데이터 검색 (본문 미인덱싱) |
| 8 | URL | 파일명의 `(한글이름)` 부분만 제거, ASCII URL |
| 9 | 빌드 도구 | Node.js + cheerio + fuse.js |
| 10 | 다크모드 | 라이트 전용 (가이드 본문 일괄 다크 대응은 별도 spec) |

## 3. 아키텍처 개요

### 시스템 구성

```
documents repo (source of truth)
  workflow-guides/
    workflow-w{1..5}-step{N}-guide/
      {role}__{topic}-workflow-guide(한글).html
      w{N}-step{M}-guide-coverage-audit.md  ← 빌드 시 제외
        │ push to main (해당 paths)
        ▼
GitHub Actions (documents/.github/workflows/deploy-workflow-guide.yml)
  - checkout documents
  - npm ci && npm run build (build/build.mjs)
  - dist/ 결과를 peaceiris/actions-gh-pages로 push
        │
        ▼
workflow-guide repo (deploy target)
  gh-pages 브랜치 (built artifacts)
  index.html · w1/… · w5/… · members/… · assets/
        │
        ▼
GitHub Pages
  https://team-project-final.github.io/workflow-guide/
```

### 책임 분리

- **documents repo** — 작성자가 HTML 가이드를 PR로 추가/수정. 보조 문서(`*-coverage-audit.md`, WORKFLOW md, PRD md 등)는 남되 deploy되지 않음.
- **빌드 스크립트 (`documents/build/`)** — `workflow-guides/`를 읽어 `dist/`로 변환(슬러그 정규화, wrapper 주입, 인덱스/매트릭스 페이지, `search.json` 생성).
- **GitHub Actions** — documents의 `workflow-guides/` 또는 `build/` 변경 시 트리거. dist를 `workflow-guide`의 `gh-pages` 브랜치로 push.
- **workflow-guide repo** — `gh-pages` 브랜치만 콘텐츠. `main`은 README/LICENSE 정도.

### 트레이드오프

- 빌드 시간: 100여 파일을 cheerio로 처리, 수 초 내. 매번 전체 빌드(증분 빌드 없음).
- 동시성: source가 단일이라 `gh-pages` push 충돌 위험 낮음.
- 노출 URL: `https://team-project-final.github.io/workflow-guide/` (커스텀 도메인 미사용).

## 4. 디렉터리 구조

### documents repo — 추가될 디렉터리

```
documents/
├── workflow-guides/                       # 기존 그대로 유지
│   └── …
├── build/                                  # 신규
│   ├── package.json                        # cheerio, fuse.js
│   ├── package-lock.json
│   ├── build.mjs                           # 진입점
│   ├── lib/
│   │   ├── discover.mjs
│   │   ├── parse-metadata.mjs
│   │   ├── slugify.mjs
│   │   ├── validate.mjs
│   │   ├── inject-wrapper.mjs
│   │   ├── render-home.mjs                 # 홈 (Hero + Matrix + Dual Tabs)
│   │   ├── render-week.mjs                 # /w{N}/index.html
│   │   ├── render-step.mjs                 # /w{N}/step{M}/index.html
│   │   ├── render-member.mjs               # /members/{role}.html
│   │   ├── render-404.mjs
│   │   ├── build-search-index.mjs
│   │   └── copy-assets.mjs
│   ├── templates/
│   │   ├── layout.html
│   │   ├── index.html
│   │   ├── week.html
│   │   └── member.html
│   └── assets/
│       ├── styles.css                      # DESIGN.md 토큰 적용
│       ├── app.js                          # 탭 토글·필터·검색
│       ├── fuse.min.js
│       └── fonts/
└── .github/workflows/
    └── deploy-workflow-guide.yml           # 신규
```

### 빌드 산출물 `dist/` (= workflow-guide repo `gh-pages` 브랜치)

```
dist/
├── index.html                              # 홈: 매트릭스 + 듀얼 탭
├── 404.html
├── assets/
│   ├── styles.css
│   ├── app.js
│   ├── fuse.min.js
│   ├── search.<sha>.json                   # fingerprint
│   ├── build-info.json
│   └── fonts/
├── w1/
│   ├── index.html                          # 주차 허브
│   ├── step1/
│   │   ├── index.html                      # step 허브
│   │   ├── team-lead__aws-infra-provisioning-workflow-guide.html
│   │   └── …                               # (한글) 제거, wrapper 주입됨
│   ├── step2/
│   └── step3/
├── w2/ …
├── w3/ …
├── w4/ …
├── w5/ …
└── members/
    ├── team-lead.html
    ├── platform-owner.html
    └── …                                   # 8개
```

### 빌드 제외

- `*.md` (coverage-audit 등)
- `node_modules/`, `.git/`, `*.bak`, 숨김 파일
- 폴더 패턴(`workflow-w{N}-step{M}-guide/`) 외부 파일

### 슬러그 규칙

1. 파일명 끝의 `(…).html` 블록을 제거 → `.html`만 남김 (`(한글)`, `(전체)` 모두 동일 처리).
2. 다른 부분(`{role}__{topic}-workflow-guide`)은 변경하지 않음.
3. 같은 `step{N}` 폴더 안에서 슬러그 중복 → 빌드 fail.

## 5. 메타데이터 파싱

### 입력 출처

| 출처 | 패턴 | 추출 값 |
|---|---|---|
| 폴더명 | `workflow-w{1..5}-step{1..13}-guide` | `week`, `step` |
| 파일명 | `{role}__{topicSlug}-workflow-guide({author한글}).html` | `role`, `topicSlug`, `authorName` |
| HTML `<title>` | `WORKFLOW Guide - {한글 제목}` | `title` |

### Guide 객체 (빌드 메모리 모델)

```js
{
  week: 1,
  step: 1,
  role: 'frontend-owner',
  roleLabel: 'Frontend',
  authorHandle: null,             // frontend는 전체 협업이라 별도 handle 없음
  authorName: '전체',              // 파일명의 (전체) 또는 (한글이름)에서 추출
  topicSlug: 'frontend-flutter-scaffold',
  title: 'Flutter 프로젝트 기본 구조 생성',
  sourcePath: 'workflow-guides/workflow-w1-step1-guide/frontend-owner__frontend-flutter-scaffold-workflow-guide(전체).html',
  outputPath: 'w1/step1/frontend-owner__frontend-flutter-scaffold-workflow-guide.html',
  url: '/w1/step1/frontend-owner__frontend-flutter-scaffold-workflow-guide.html',
}
```

### Role 매핑표 (README §8 기준)

| 파일명 prefix | Handle | roleLabel | 트랙 |
|---|---|---|---|
| `team-lead` | `@team-lead` | Team Lead | 인프라/Gateway |
| `platform-owner` | `@platform-owner` | Platform | A |
| `engagement-owner` | `@engagement-owner` | Engagement | B |
| `knowledge-owner-1` | `@knowledge-owner-1` | Knowledge-1 | C-1 |
| `knowledge-owner-2` | `@knowledge-owner-2` | Knowledge-2 | C-2 |
| `learning-card-owner` | `@learning-card-owner` | Learning Card | D-1 |
| `learning-ai-owner` | `@learning-ai-owner` | Learning AI | D-2 |
| `frontend-owner` | (전체 협업) | Frontend | 협업 |

`authorName`은 파일명 `(…)` 안 값을 우선 사용. 정규식: `/\(([^)]+)\)\.html$/`.

### 검증/경고 정책

| 케이스 | 처리 |
|---|---|
| 폴더명 패턴 불일치 | 경고, 사이트맵에서 제외 |
| 파일명 패턴 불일치 | 경고, 제외 |
| `<title>` 누락 | 경고 + 파일명에서 fallback 제목 |
| `role` 매핑표 밖 | 경고, "기타" 그룹 |
| 같은 step 폴더 내 슬러그 충돌 | **빌드 fail (exit 1)** |
| `.md`/숨김 파일 | 조용히 스킵 |

## 6. 공통 헤더/사이드바 Wrapper

### Before → After

**Before** (원본):

```html
<!doctype html>
<html lang="ko">
  <head>
    <title>WORKFLOW Guide - …</title>
    <style>body { margin: 0; … } header { … } …</style>
  </head>
  <body>
    <header>…</header>
    <main>…</main>
  </body>
</html>
```

**After** (빌드 산출물):

```html
<!doctype html>
<html lang="ko">
  <head>
    <title>WORKFLOW Guide - …</title>
    <link rel="stylesheet" href="/assets/styles.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/…">
    <style>.guide-body { margin: 0; … } .guide-body header { … } …</style>
  </head>
  <body>
    <header class="site-header">
      <a class="site-brand" href="/">Synapse Workflow Guide</a>
      <div class="site-breadcrumb">W1 · Step 1 · Frontend</div>
      <input class="site-search" type="search" placeholder="검색…">
    </header>

    <aside class="site-sidebar">
      <nav class="site-nav-tabs">
        <button data-tab="week">주차별</button>
        <button data-tab="member">멤버별</button>
      </nav>
      <ol class="site-nav-list"><!-- 빌드 시 채움 --></ol>
    </aside>

    <main class="guide-body">
      <!-- 원본 <body>의 자식 노드 그대로 -->
    </main>

    <footer class="site-footer">…</footer>
    <script src="/assets/app.js" type="module"></script>
  </body>
</html>
```

### 셀렉터 스코핑

| 원본 셀렉터 | 변환 후 |
|---|---|
| `body` | `.guide-body` |
| `header` | `.guide-body header` |
| `main` | `.guide-body main` |
| `footer` | `.guide-body footer` |
| `:root` / `*` | 그대로 유지 |

Wrapper CSS는 항상 클래스 셀렉터(`.site-header`, `.site-sidebar` 등)만 사용해서 가이드 본문 CSS와 충돌하지 않음.

### Wrapper 디자인 토큰 (DESIGN.md 준수)

- **폰트**: 헤더·사이드바·인덱스 — Fraunces(display) + Plus Jakarta Sans(body). Google Fonts CDN.
- **색**: 액센트 `#D97706`, 배경 Stone-50 `#FAFAF9`, 텍스트 Stone-900 `#1C1917`, 사이드바 활성 항목 Primary Light `#FEF3C7`.
- **사이드바 폭**: 240px (콜랩스 56px, 모바일 드로어 0px).
- **헤더 높이**: 56px, sticky.
- **본문 max-width**: 1280px(인덱스). 가이드 본문은 원본 유지.

### 반응형

| 폭 | 사이드바 | 헤더 |
|---|---|---|
| < 640px | 햄버거 드로어 | 브랜드 + 햄버거 + 검색 아이콘 |
| 640–1024px | 콜랩스 토글(56 ↔ 240) | 풀 헤더 |
| > 1024px | 240px 고정 | 풀 헤더 + 인라인 검색 |

### 사이드바 듀얼 탭

- **주차별**: W1~W5 트리, 각 주차 안 step별 펼침. 현재 페이지 step 자동 하이라이트.
- **멤버별**: 8명 + Frontend, 현재 페이지 `role` 자동 하이라이트.
- 빌드 시 정적 HTML 생성(JS 비활성에서도 동작, JS는 토글만).

## 7. 홈 인덱스 (Matrix + Dual Tabs)

### 페이지 구조

```
┌──────────────────────── header (공통) ────────────────────────┐
│ Synapse Workflow Guide              [ 검색…       ] [ 햄버거 ] │
└────────────────────────────────────────────────────────────────┘
┌──────── sidebar ────────┬──────────── main.home ─────────────┐
│ 주차별 · 멤버별 (탭)    │  HERO                              │
│   W1 (24개 가이드)      │    Synapse 워크플로 가이드           │
│   W2 (19개 가이드)      │    5주차 · 8 담당자 · 100+ 가이드     │
│   W3 (20개 가이드)      │    [ 큰 검색창 ]                     │
│   W4 (18개 가이드)      │                                      │
│   W5 (24개 가이드)      │  MATRIX (8 × 5, 셀 = 가이드 수)       │
│   (괄호 안 숫자는       │     W1  W2  W3  W4  W5               │
│    빌드 시 자동 집계)   │  TL  3   3   2   3   3               │
│                        │  …                                   │
│                        │                                      │
│                        │  DUAL TABS [ 주차별 ] [ 멤버별 ]      │
│                        │   W1 · Step1 (8) ▾                   │
│                        │     • AWS 인프라 …                    │
│                        │     • Flutter 프로젝트 골격 …          │
└────────────────────────┴──────────────────────────────────────┘
```

### Hero 섹션

- 제목(Fraunces 48px): "Synapse 워크플로 가이드"
- 부제(Plus Jakarta Sans 18px, Stone-600): 한 줄 설명
- 검색창(`.hero-search`): 헤더와 동일 동작, 더 큰 시각 비중
- 메타 통계: 가이드 수 / 주차 수 / 담당자 수 (빌드 시 자동 계산)

### Matrix 섹션 (D)

- 8행(멤버) × 5열(주차)의 정적 테이블. 빌드 시 가이드 수 집계.
- 셀:
  - **가이드 있음**: 큰 숫자(Fraunces 24px) + "guides" 라벨. 호버 시 `#FEF3C7`. 클릭 시 `/members/{role}.html#w{N}`로 이동.
  - **빈 셀**: Stone-300, "—", 비활성.
- 모바일: 가로 스크롤 또는 멤버 카드 fallback.

### Dual Tabs 섹션 (C)

- 탭 두 개: **주차별**(기본) / **멤버별**.
- 상태는 URL hash로 유지: `#by-week` / `#by-member`.
- **주차별**: W1~W5 카드, 각 카드 안 step `<details>` accordion, step 안 가이드 목록.
- **멤버별**: 8개 멤버 카드, 각 카드 안 주차 `<details>` accordion.
- 양쪽 모두 정적 HTML 생성(JS 비활성에서도 노출). JS는 탭 토글만.

### 검색 결과 박스

- Hero/헤더 검색창 입력 시 fuse.js 매칭 → hero 아래 sticky 결과.
- 빈 결과: "결과 없음 — 다른 키워드를 시도하거나 매트릭스를 살펴보세요"
- 빈 입력: 박스 hide.

### 접근성 / 키보드

- `/` 키 → 검색창 focus.
- 탭은 `role="tablist"` + 화살표 키 이동.
- 매트릭스 셀은 `<a>`로 키보드 탐색.
- 색만으로 정보 전달 금지(가이드 수 숫자 항상 표시).

### 파생 페이지

- `/w{N}/index.html` — Hero("Week N — …") + step별 목록. 듀얼 탭 없음.
- `/w{N}/step{M}/index.html` — 해당 step의 멤버 가이드 그리드.
- `/members/{role}.html` — Hero("{roleLabel}({한글이름})") + 주차×step 매트릭스(1×5).

## 8. 빌드 파이프라인 + GitHub Actions

### 빌드 진입점 동작 순서 (`build/build.mjs`)

```
1. discover()              → workflow-guides/**/*.html
2. parseMetadata(files)    → Guide[]
3. validate(guides)        → 슬러그 중복·role 매핑 검사 (fail시 exit 1)
4. injectWrapper(guides)   → dist/w{N}/step{M}/{slug}.html
5. renderWeekHubs(guides)  → dist/w{1..5}/index.html
6. renderStepHubs(guides)  → dist/w{N}/step{M}/index.html
7. renderMemberHubs(guides)→ dist/members/{role}.html (8개)
8. renderHome(guides)      → dist/index.html (Hero + Matrix + Dual Tabs)
9. buildSearchIndex(guides)→ dist/assets/search.<sha>.json
10. copyAssets()           → templates/assets/* + build-info.json
11. render404()            → dist/404.html
```

### npm scripts (`build/package.json`)

```json
{
  "type": "module",
  "scripts": {
    "build": "node build.mjs",
    "build:verbose": "node build.mjs --verbose",
    "validate": "node build.mjs --validate-only",
    "preview": "npx serve dist"
  },
  "dependencies": {
    "cheerio": "^1.x",
    "fuse.js": "^7.x"
  }
}
```

### GitHub Actions 워크플로

**파일**: `documents/.github/workflows/deploy-workflow-guide.yml`

```yaml
name: Deploy workflow-guide site

on:
  push:
    branches: [main]
    paths:
      - 'workflow-guides/**'
      - 'build/**'
      - '.github/workflows/deploy-workflow-guide.yml'
  pull_request:
    paths:
      - 'workflow-guides/**'
      - 'build/**'
  workflow_dispatch: {}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: build/package-lock.json
      - run: npm ci
        working-directory: build
      - run: npm run build
        working-directory: build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: build/dist
          retention-days: 7

  deploy:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - uses: peaceiris/actions-gh-pages@v4
        with:
          personal_token: ${{ secrets.WORKFLOW_GUIDE_DEPLOY_TOKEN }}
          external_repository: team-project-final/workflow-guide
          publish_branch: gh-pages
          publish_dir: ./dist
          commit_message: 'deploy: ${{ github.sha }}'
          user_name: 'workflow-guide-deploy[bot]'
          user_email: 'workflow-guide-deploy@users.noreply.github.com'
      - name: Health check
        run: |
          sleep 60
          curl -fsSL https://team-project-final.github.io/workflow-guide/ > /dev/null
          curl -fsSL https://team-project-final.github.io/workflow-guide/assets/search.*.json > /dev/null || true
```

### 동작 정책

| 트리거 | build | deploy |
|---|:---:|:---:|
| `main` push (관련 paths) | ✓ | ✓ |
| `main` 대상 PR (관련 paths) | ✓ | ✗ |
| 관련 paths 외부만 변경된 PR | ✗ | ✗ |
| `workflow_dispatch` | ✓ | (조건 만족 시) |

빌드 실패 시 PR check 빨강 → 머지 차단. 슬러그 중복·`<title>` 누락 등 검증 실패도 동일.

### 시크릿 / 권한

- **secret 이름**: `WORKFLOW_GUIDE_DEPLOY_TOKEN`
- **값**: `workflow-guide` repo에 `gh-pages` push 권한이 있는 PAT 또는 GitHub App 토큰.
- **최소 권한**: 해당 토큰은 `workflow-guide` repo의 `contents:write`만 부여.

### workflow-guide repo 초기 설정 (1회)

1. `main` 브랜치에 README.md, LICENSE만 (빈 사이트 안내 + 배포 URL 링크).
2. `gh-pages` 브랜치 orphan 생성. 첫 deploy가 채움.
3. Settings → Pages → Source: `gh-pages` 브랜치, root.
4. PAT를 `documents` repo secret으로 등록.

### 운영 워크플로 (작성자 관점)

1. 새 가이드 작성: `workflow-guides/workflow-w{N}-step{M}-guide/{role}__{topic}-workflow-guide({한글이름}).html` 추가.
2. PR 열기 → CI build로 검증 + dist artifact 업로드(미리보기 가능).
3. main 머지 → Actions가 자동으로 `workflow-guide` `gh-pages` 업데이트 → GitHub Pages가 수 분 내 반영.

## 9. 검색 데이터 모델 + 클라이언트

### `search.<sha>.json` 구조

```json
{
  "buildSha": "abc1234",
  "buildTime": "2026-05-13T10:00:00Z",
  "guides": [
    {
      "title": "Flutter 프로젝트 기본 구조 생성",
      "topicSlug": "frontend-flutter-scaffold",
      "roleLabel": "Frontend",
      "authorName": "전체",
      "week": 1,
      "step": 1,
      "url": "/w1/step1/frontend-owner__frontend-flutter-scaffold-workflow-guide.html"
    }
  ]
}
```

- 본문 미인덱싱 (메타데이터 범위).
- 예상 크기: 약 20 KB raw, gzip 후 약 5 KB.
- Fingerprint 규칙: `<sha>` = build 시점 `GITHUB_SHA`의 첫 7자(예: `search.abc1234.json`). 빌드마다 새 파일명이 되어 브라우저 캐시 자동 무효화. `index.html`은 빌드 시 실제 파일명을 참조하도록 치환.

### fuse.js 설정

```js
const fuse = new Fuse(data.guides, {
  keys: [
    { name: 'title',       weight: 2.0 },
    { name: 'topicSlug',   weight: 1.5 },
    { name: 'roleLabel',   weight: 1.0 },
    { name: 'authorName',  weight: 1.0 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
});
```

### 클라이언트 흐름 (`assets/app.js`)

```
search-input 'focus' (1회)
  → prefetch /assets/search.<sha>.json (백그라운드)
  → Fuse 인스턴스 캐싱

search-input 'input' (debounce 150ms)
  ├─ '' → 결과 패널 hide
  └─ … → fuse.search(value, { limit: 20 }) → render

결과 click / Enter → location.assign(url)

키보드
  '/'   → input focus
  ↑/↓  → 결과 항목 이동
  Enter → 활성 항목 이동
  Esc   → 결과 패널 닫기
```

### 결과 UI

```html
<section class="search-results-panel" hidden>
  <p class="search-results-count">검색 결과 12건</p>
  <ul class="search-results-list" role="listbox">
    <li role="option" class="search-result">
      <a href="/w1/step1/frontend-owner__...html">
        <span class="result-title"><mark>Flutter</mark> 프로젝트 기본 구조 생성</span>
        <span class="result-meta">
          <span>W1</span><span>Step 1</span><span>Frontend · 전체</span>
        </span>
      </a>
    </li>
  </ul>
</section>
```

매칭 부분은 fuse.js `includeMatches` 위치 기반으로 `<mark>` wrap.

### 빈 상태 / 에러

| 케이스 | 표시 |
|---|---|
| 입력 비움 | 결과 패널 hidden, 매트릭스/탭 그대로 |
| 결과 0건 | "검색 결과가 없습니다 — 다른 키워드를 시도하거나 매트릭스를 살펴보세요" |
| `search.json` fetch 실패 | "검색을 일시적으로 사용할 수 없습니다" + console.warn. 사이드바·매트릭스로 탐색 가능. |
| JS 비활성 | 검색창 disabled. 매트릭스·사이드바·듀얼 탭은 정적 HTML로 작동. |

### 성능 가드

- search.json fingerprint(`search.<sha>.json`) → 캐시 무효화.
- 디바운스 150ms.
- `limit: 20`. 결과 더 많으면 "더 보기" 버튼.

## 10. 검증 / 운영 / 롤백

### 빌드 검증 (`build.mjs --validate-only`)

| 검사 항목 | 실패 | 경고 |
|---|:---:|:---:|
| 폴더명 패턴 | — | ✓ |
| 파일명 패턴 | — | ✓ |
| `role` 매핑표 안 | — | ✓ |
| HTML cheerio parse | — | ✓ (제외) |
| `<title>` 존재 + non-empty | — | ✓ (fallback) |
| **슬러그 충돌(같은 step 폴더)** | ✓ | — |
| 같은 step 폴더 동일 `role` 2회 이상 | — | ✓ |
| internal 링크가 dist에 존재 | — | ✓ |

failure → exit 1 → CI check 빨강 → 머지 차단. warning → stderr + `dist/build-warnings.json` + Actions step summary.

외부 링크 검증은 별도 단계(느림). 주간 cron으로 분리.

### 로컬 워크플로

```bash
cd build
npm ci
npm run validate    # PR 전 빠른 검증
npm run build       # dist 생성
npm run preview     # http://localhost:3000
```

### CI 시나리오 매트릭스

| 시나리오 | build | validate | deploy | preview link |
|---|:---:|:---:|:---:|:---:|
| `main` push (관련 paths) | ✓ | ✓ | ✓ | — |
| `main` 대상 PR (관련 paths) | ✓ | ✓ | ✗ | artifact 첨부 |
| 관련 paths 외부만 변경된 PR | ✗ | — | ✗ | — |
| `workflow_dispatch` | ✓ | ✓ | (조건) | — |

### 작성자 매뉴얼 (`workflow-guides/README.md`에 명시)

1. **새 가이드 추가**
   - 위치: `workflow-guides/workflow-w{N}-step{M}-guide/`
   - 파일명: `{role}__{topic-kebab}-workflow-guide({한글이름 또는 '전체'}).html`
   - HTML `<title>` 필수, 형식: `WORKFLOW Guide - {한글 제목}`
   - standalone HTML 권장. `<style>` 안 `body`·`header` 같은 태그 셀렉터 사용 가능(빌드가 자동 스코프).
2. **PR 흐름**: `npm run validate` → PR → CI build check → 머지 → 자동 deploy.
3. **이동/삭제**: 파일 조작 후 PR. URL이 바뀌면 외부 링크 끊김(영구 redirect 미지원).
4. **슬러그 충돌**: 빌드 fail → `topic` 부분에 구분어 추가(예: `…-workflow-guide-v2`).

### 배포 후 헬스 체크

`deploy` job 마지막 단계에 sanity ping:

```yaml
- name: Health check
  run: |
    sleep 60
    curl -fsSL https://team-project-final.github.io/workflow-guide/ > /dev/null
    curl -fsSL https://team-project-final.github.io/workflow-guide/assets/search.*.json > /dev/null || true
```

실패해도 deploy 자체는 이미 push됨. health 실패는 별도 alert(향후 Slack 연동).

### 롤백 전략

| 상황 | 절차 |
|---|---|
| 잘못된 가이드 머지 → 콘텐츠 오류 | documents에서 revert 커밋 → 자동 재배포 |
| 빌드 스크립트 버그 → 사이트 깨짐 | `workflow-guide` 로컬 clone → `gh-pages` 직전 커밋으로 reset → force push, 또는 documents에서 빌드 스크립트 revert 머지 |
| Actions 미동작(시크릿 만료 등) | `workflow_dispatch`로 수동 트리거 + 토큰 재발급 |

### v1 출시 성공 기준

- [ ] `documents` `main` 머지 후 5분 이내 사이트 자동 반영.
- [ ] 100+ 가이드 모두 `https://team-project-final.github.io/workflow-guide/w{N}/step{M}/{slug}.html`로 도달.
- [ ] 홈에서 매트릭스 + 듀얼 탭이 정적 HTML만으로 의미 있게 노출(JS 비활성에서도).
- [ ] 헤더 검색이 "kafka", "search", "oauth" 등 키워드에 <300ms로 결과 반환.
- [ ] 모바일(<640px)에서 사이드바 드로어, 매트릭스 가로 스크롤, 검색 모두 작동.
- [ ] PR에서 슬러그 충돌 시 CI가 명확한 메시지로 머지 차단.

## 11. 스코프 밖 (후속 spec 후보)

- 가이드 본문 다크모드 일괄 대응
- 본문 전문 검색(`lunr`/`flexsearch`로 업그레이드, search index 변경)
- PR별 deploy preview(Cloudflare Pages 또는 Netlify 보조 호스팅)
- HISTORY/PRD/WORKFLOW md까지 변환해 통합 포털화
- 가이드 페이지 내부 ToC 자동 생성
- 다국어(영문) 라벨/검색 지원
