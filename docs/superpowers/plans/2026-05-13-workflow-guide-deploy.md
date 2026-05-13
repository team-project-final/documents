# Workflow Guide 페이지 배포 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `documents/workflow-guides/`의 standalone HTML 가이드 ~100개를 별도 `team-project-final/workflow-guide` repo의 GitHub Pages 사이트로 자동 배포한다. 사이트는 공통 헤더/사이드바, 매트릭스+듀얼 탭 홈, fuse.js 메타데이터 검색을 제공한다.

**Architecture:** documents repo의 `build/` 디렉터리에 Node.js ESM 빌드 스크립트(`build.mjs` + `lib/*.mjs`)를 둔다. cheerio가 각 가이드 HTML에 wrapper를 주입하고 셀렉터를 스코프하며, 빌드 산출물 `dist/`를 GitHub Actions(`peaceiris/actions-gh-pages@v4`)가 외부 `workflow-guide` repo의 `gh-pages` 브랜치로 push한다.

**Tech Stack:** Node.js 20+ (ESM), cheerio ^1, fuse.js ^7, `node:test` 내장 러너, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md` (afd912f).

---

### Task 1: build/ 디렉터리 및 package.json 초기화

**Files:**
- Create: `build/package.json`
- Create: `build/.gitignore`
- Create: `build/README.md`

- [ ] **Step 1: build/package.json 작성**

```json
{
  "name": "workflow-guide-build",
  "version": "0.1.0",
  "description": "Build the workflow-guide static site from workflow-guides/*.html",
  "type": "module",
  "private": true,
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "node build.mjs",
    "build:verbose": "node build.mjs --verbose",
    "validate": "node build.mjs --validate-only",
    "preview": "npx --yes serve@14 dist",
    "test": "node --test lib/"
  },
  "dependencies": {
    "cheerio": "^1.0.0-rc.12",
    "fuse.js": "^7.0.0"
  }
}
```

- [ ] **Step 2: build/.gitignore 작성**

```
node_modules/
dist/
*.log
.DS_Store
```

- [ ] **Step 3: build/README.md 작성**

```markdown
# build/

Static-site builder for the `workflow-guide` deploy target.

## Usage

```bash
npm ci
npm run validate    # PR 전 빠른 검증
npm run build       # dist/ 생성
npm run preview     # http://localhost:3000
npm test            # unit tests
```

See [the design spec](../docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md) for full details.
```

- [ ] **Step 4: npm 의존성 설치 확인**

Run: `cd build && npm install`
Expected: `node_modules/`와 `package-lock.json` 생성, "added N packages" 메시지.

- [ ] **Step 5: 커밋**

```bash
git add build/package.json build/package-lock.json build/.gitignore build/README.md
git commit -m "feat(build): initialize workflow-guide build directory"
```

---

### Task 2: discover.mjs — 파일 트리 탐색

**Files:**
- Create: `build/lib/discover.mjs`
- Create: `build/lib/discover.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/discover.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverGuides } from './discover.mjs';

function setupFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'wgd-discover-'));
  const w1s1 = join(dir, 'workflow-w1-step1-guide');
  mkdirSync(w1s1, { recursive: true });
  writeFileSync(join(w1s1, 'team-lead__aws-workflow-guide(김민구).html'), '<html></html>');
  writeFileSync(join(w1s1, 'w1-step1-guide-coverage-audit.md'), '# audit');
  writeFileSync(join(w1s1, '.hidden'), 'x');
  mkdirSync(join(dir, 'unrelated-folder'), { recursive: true });
  writeFileSync(join(dir, 'unrelated-folder', 'x.html'), '<html></html>');
  return dir;
}

test('discovers only .html files inside workflow-w{N}-step{M}-guide folders', () => {
  const dir = setupFixture();
  try {
    const files = discoverGuides(dir);
    assert.equal(files.length, 1);
    assert.match(files[0], /team-lead__aws-workflow-guide\(김민구\)\.html$/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('returns empty array when no matching folders', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wgd-empty-'));
  try {
    assert.deepEqual(discoverGuides(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/discover.test.mjs`
Expected: FAIL — `Cannot find module ./discover.mjs`.

- [ ] **Step 3: discover.mjs 구현**

```js
// build/lib/discover.mjs
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FOLDER_PATTERN = /^workflow-w[1-5]-step\d{1,2}-guide$/;

export function discoverGuides(rootDir) {
  let entries;
  try {
    entries = readdirSync(rootDir);
  } catch {
    return [];
  }
  const results = [];
  for (const entry of entries) {
    if (!FOLDER_PATTERN.test(entry)) continue;
    const folderPath = join(rootDir, entry);
    if (!statSync(folderPath).isDirectory()) continue;
    for (const file of readdirSync(folderPath)) {
      if (file.startsWith('.')) continue;
      if (!file.endsWith('.html')) continue;
      results.push(join(folderPath, file));
    }
  }
  return results.sort();
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/discover.test.mjs`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/discover.mjs build/lib/discover.test.mjs
git commit -m "feat(build): add discover.mjs to walk workflow-guides tree"
```

---

### Task 3: slugify.mjs — 파일명 슬러그 정규화

**Files:**
- Create: `build/lib/slugify.mjs`
- Create: `build/lib/slugify.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/slugify.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugifyFilename } from './slugify.mjs';

test('removes (한글 이름) block before .html', () => {
  assert.equal(
    slugifyFilename('engagement-owner__community-workflow-guide(한승완).html'),
    'engagement-owner__community-workflow-guide.html',
  );
});

test('removes (전체) block', () => {
  assert.equal(
    slugifyFilename('frontend-owner__flutter-scaffold-workflow-guide(전체).html'),
    'frontend-owner__flutter-scaffold-workflow-guide.html',
  );
});

test('leaves filename unchanged when no trailing parens', () => {
  assert.equal(
    slugifyFilename('team-lead__aws-infra-workflow-guide.html'),
    'team-lead__aws-infra-workflow-guide.html',
  );
});

test('only strips the FINAL parens block', () => {
  assert.equal(
    slugifyFilename('role__topic-(a)-workflow-guide(name).html'),
    'role__topic-(a)-workflow-guide.html',
  );
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/slugify.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: slugify.mjs 구현**

```js
// build/lib/slugify.mjs
const TRAILING_PARENS = /\(([^)]+)\)\.html$/;

export function slugifyFilename(filename) {
  return filename.replace(TRAILING_PARENS, '.html');
}

export function extractAuthorFromFilename(filename) {
  const match = filename.match(TRAILING_PARENS);
  return match ? match[1] : null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/slugify.test.mjs`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/slugify.mjs build/lib/slugify.test.mjs
git commit -m "feat(build): add slugifyFilename to strip (author) blocks"
```

---

### Task 4: parse-metadata.mjs — Guide 객체 구성

**Files:**
- Create: `build/lib/parse-metadata.mjs`
- Create: `build/lib/parse-metadata.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/parse-metadata.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGuide, ROLE_MAP } from './parse-metadata.mjs';

const sampleHtml = '<!doctype html><html><head><title>WORKFLOW Guide - Flutter 골격</title></head><body></body></html>';

test('parses frontend-owner guide from W1 step1', () => {
  const guide = parseGuide({
    rootDir: '/repo',
    absPath: '/repo/workflow-guides/workflow-w1-step1-guide/frontend-owner__frontend-flutter-scaffold-workflow-guide(전체).html',
    html: sampleHtml,
  });
  assert.equal(guide.week, 1);
  assert.equal(guide.step, 1);
  assert.equal(guide.role, 'frontend-owner');
  assert.equal(guide.roleLabel, 'Frontend');
  assert.equal(guide.authorHandle, null);
  assert.equal(guide.authorName, '전체');
  assert.equal(guide.topicSlug, 'frontend-flutter-scaffold');
  assert.equal(guide.title, 'Flutter 골격');
  assert.equal(guide.outputPath, 'w1/step1/frontend-owner__frontend-flutter-scaffold-workflow-guide.html');
  assert.equal(guide.url, '/w1/step1/frontend-owner__frontend-flutter-scaffold-workflow-guide.html');
});

test('parses team-lead handle correctly', () => {
  const guide = parseGuide({
    rootDir: '/repo',
    absPath: '/repo/workflow-guides/workflow-w5-step3-guide/team-lead__full-regression-workflow-guide(김민구).html',
    html: '<html><head><title>WORKFLOW Guide - 통합 회귀</title></head></html>',
  });
  assert.equal(guide.role, 'team-lead');
  assert.equal(guide.roleLabel, 'Team Lead');
  assert.equal(guide.authorHandle, '@team-lead');
  assert.equal(guide.authorName, '김민구');
  assert.equal(guide.week, 5);
  assert.equal(guide.step, 3);
});

test('falls back to filename topic when <title> missing', () => {
  const guide = parseGuide({
    rootDir: '/repo',
    absPath: '/repo/workflow-guides/workflow-w2-step5-guide/platform-owner__notification-fcm-workflow-guide(김해준).html',
    html: '<html><head></head></html>',
  });
  assert.equal(guide.title, 'notification fcm');
});

test('returns null when filename pattern does not match', () => {
  const guide = parseGuide({
    rootDir: '/repo',
    absPath: '/repo/workflow-guides/workflow-w1-step1-guide/weird.html',
    html: sampleHtml,
  });
  assert.equal(guide, null);
});

test('ROLE_MAP contains all 8 roles', () => {
  assert.equal(Object.keys(ROLE_MAP).length, 8);
  for (const key of ['team-lead', 'platform-owner', 'engagement-owner',
                     'knowledge-owner-1', 'knowledge-owner-2',
                     'learning-card-owner', 'learning-ai-owner', 'frontend-owner']) {
    assert.ok(ROLE_MAP[key], `missing role ${key}`);
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/parse-metadata.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: parse-metadata.mjs 구현**

```js
// build/lib/parse-metadata.mjs
import { basename, dirname, posix } from 'node:path';
import { slugifyFilename, extractAuthorFromFilename } from './slugify.mjs';

export const ROLE_MAP = {
  'team-lead':           { label: 'Team Lead',     handle: '@team-lead',           track: '인프라/Gateway' },
  'platform-owner':      { label: 'Platform',      handle: '@platform-owner',      track: 'A' },
  'engagement-owner':    { label: 'Engagement',    handle: '@engagement-owner',    track: 'B' },
  'knowledge-owner-1':   { label: 'Knowledge-1',   handle: '@knowledge-owner-1',   track: 'C-1' },
  'knowledge-owner-2':   { label: 'Knowledge-2',   handle: '@knowledge-owner-2',   track: 'C-2' },
  'learning-card-owner': { label: 'Learning Card', handle: '@learning-card-owner', track: 'D-1' },
  'learning-ai-owner':   { label: 'Learning AI',   handle: '@learning-ai-owner',   track: 'D-2' },
  'frontend-owner':      { label: 'Frontend',      handle: null,                   track: '협업' },
};

const FOLDER_PATTERN = /^workflow-w([1-5])-step(\d{1,2})-guide$/;
const FILE_PATTERN   = /^([a-z0-9-]+)__([a-z0-9-]+)-workflow-guide(?:\(([^)]+)\))?\.html$/;
const TITLE_PATTERN  = /<title>\s*(?:WORKFLOW Guide\s*-\s*)?([^<]*?)\s*<\/title>/i;

function toPosix(p) {
  return p.split(/[\\/]/).join('/');
}

export function parseGuide({ rootDir, absPath, html }) {
  const posixPath = toPosix(absPath);
  const folder = basename(dirname(posixPath));
  const file = basename(posixPath);
  const folderMatch = folder.match(FOLDER_PATTERN);
  const fileMatch = file.match(FILE_PATTERN);
  if (!folderMatch || !fileMatch) return null;

  const role = fileMatch[1];
  const roleEntry = ROLE_MAP[role];
  if (!roleEntry) return null;

  const week = Number(folderMatch[1]);
  const step = Number(folderMatch[2]);
  const topicSlug = fileMatch[2];
  const authorName = fileMatch[3] || extractAuthorFromFilename(file) || null;

  const titleMatch = html.match(TITLE_PATTERN);
  const title = (titleMatch && titleMatch[1].trim()) || topicSlug.replace(/-/g, ' ');

  const slugFilename = slugifyFilename(file);
  const outputPath = posix.join(`w${week}`, `step${step}`, slugFilename);

  const sourcePath = toPosix(absPath).replace(toPosix(rootDir) + '/', '');

  return {
    week,
    step,
    role,
    roleLabel: roleEntry.label,
    authorHandle: roleEntry.handle,
    authorName,
    topicSlug,
    title,
    sourcePath,
    outputPath,
    url: '/' + outputPath,
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/parse-metadata.test.mjs`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/parse-metadata.mjs build/lib/parse-metadata.test.mjs
git commit -m "feat(build): add parse-metadata.mjs with ROLE_MAP"
```

---

### Task 5: validate.mjs — 슬러그 충돌 + role 매핑 검사

**Files:**
- Create: `build/lib/validate.mjs`
- Create: `build/lib/validate.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/validate.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateGuides } from './validate.mjs';

function g(over = {}) {
  return {
    week: 1, step: 1, role: 'team-lead', roleLabel: 'Team Lead',
    authorHandle: '@team-lead', authorName: '김민구', topicSlug: 't',
    title: 'x', sourcePath: 's', outputPath: 'w1/step1/team-lead__t-workflow-guide.html',
    url: '/w1/step1/team-lead__t-workflow-guide.html', ...over,
  };
}

test('passes when no collisions', () => {
  const result = validateGuides([g(), g({ role: 'platform-owner', outputPath: 'w1/step1/platform-owner__t-workflow-guide.html' })]);
  assert.equal(result.failures.length, 0);
});

test('fails on slug collision within same step folder', () => {
  const result = validateGuides([g(), g()]);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /slug collision/i);
});

test('warns when same role appears twice in same step', () => {
  const result = validateGuides([
    g(),
    g({ topicSlug: 'other', outputPath: 'w1/step1/team-lead__other-workflow-guide.html' }),
  ]);
  assert.equal(result.failures.length, 0);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /same role.*twice/i);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/validate.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: validate.mjs 구현**

```js
// build/lib/validate.mjs
export function validateGuides(guides) {
  const failures = [];
  const warnings = [];

  const byOutput = new Map();
  for (const g of guides) {
    if (!byOutput.has(g.outputPath)) byOutput.set(g.outputPath, []);
    byOutput.get(g.outputPath).push(g);
  }
  for (const [path, list] of byOutput) {
    if (list.length > 1) {
      failures.push(`slug collision: ${path} produced by ${list.map(g => g.sourcePath).join(', ')}`);
    }
  }

  const byStepRole = new Map();
  for (const g of guides) {
    const key = `w${g.week}/step${g.step}/${g.role}`;
    if (!byStepRole.has(key)) byStepRole.set(key, []);
    byStepRole.get(key).push(g);
  }
  for (const [key, list] of byStepRole) {
    if (list.length > 1) {
      warnings.push(`same role appears twice in same step (${key}): ${list.map(g => g.sourcePath).join(', ')}`);
    }
  }

  return { failures, warnings };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/validate.test.mjs`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/validate.mjs build/lib/validate.test.mjs
git commit -m "feat(build): add validate.mjs for slug collisions and role duplicates"
```

---

### Task 6: inject-wrapper.mjs — cheerio HTML wrapper + 셀렉터 스코핑

**Files:**
- Create: `build/lib/inject-wrapper.mjs`
- Create: `build/lib/inject-wrapper.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/inject-wrapper.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { injectWrapper, scopeStyleSheet } from './inject-wrapper.mjs';

const guide = {
  week: 1, step: 1, role: 'frontend-owner', roleLabel: 'Frontend',
  authorHandle: null, authorName: '전체', topicSlug: 't',
  title: 'Flutter 골격',
  sourcePath: 'workflow-guides/workflow-w1-step1-guide/frontend-owner__t-workflow-guide(전체).html',
  outputPath: 'w1/step1/frontend-owner__t-workflow-guide.html',
  url: '/w1/step1/frontend-owner__t-workflow-guide.html',
};

test('scopeStyleSheet rewrites body/header/main/footer selectors', () => {
  const css = 'body { margin: 0; } header { color: red; } .guide-body main { x: 1; }';
  const scoped = scopeStyleSheet(css);
  assert.match(scoped, /\.guide-body \{ margin: 0; \}/);
  assert.match(scoped, /\.guide-body header \{ color: red; \}/);
  assert.match(scoped, /\.guide-body main \{ x: 1; \}/);
});

test('scopeStyleSheet leaves :root and * alone', () => {
  const css = ':root { --x: 1; } * { box-sizing: border-box; }';
  const scoped = scopeStyleSheet(css);
  assert.match(scoped, /:root \{/);
  assert.match(scoped, /\* \{/);
});

test('injectWrapper wraps body and injects site-header/sidebar/footer', () => {
  const html = '<!doctype html><html><head><title>x</title><style>body { margin: 0; }</style></head><body><header>orig</header><main>m</main></body></html>';
  const out = injectWrapper(html, guide);
  assert.match(out, /<header class="site-header">/);
  assert.match(out, /<aside class="site-sidebar">/);
  assert.match(out, /<footer class="site-footer">/);
  assert.match(out, /<main class="guide-body">/);
  assert.match(out, /\.guide-body \{ margin: 0; \}/);
  // breadcrumb 확인
  assert.match(out, /W1.*Step 1.*Frontend/);
});

test('injectWrapper links to /assets/styles.css and /assets/app.js', () => {
  const out = injectWrapper('<html><head></head><body></body></html>', guide);
  assert.match(out, /href="\/assets\/styles\.css"/);
  assert.match(out, /src="\/assets\/app\.js"/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/inject-wrapper.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: inject-wrapper.mjs 구현**

```js
// build/lib/inject-wrapper.mjs
import * as cheerio from 'cheerio';

const SCOPE_SELECTORS = new Set(['body', 'header', 'main', 'footer']);

export function scopeStyleSheet(css) {
  // 매우 단순한 셀렉터 스코핑: 콤마/공백 기반 토큰화
  return css.replace(
    /(^|[}\s,])(body|header|main|footer)(?=[\s,{:])/g,
    (m, pre, sel) => {
      if (sel === 'body') return `${pre}.guide-body`;
      return `${pre}.guide-body ${sel}`;
    },
  );
}

export function injectWrapper(html, guide) {
  const $ = cheerio.load(html, { decodeEntities: false });

  // 1) <style> 내부 셀렉터 스코핑
  $('style').each((_, el) => {
    const raw = $(el).html() || '';
    $(el).html(scopeStyleSheet(raw));
  });

  // 2) <head>에 외부 자산 링크 주입
  if ($('link[href="/assets/styles.css"]').length === 0) {
    $('head').append('\n  <link rel="stylesheet" href="/assets/styles.css">');
  }
  if ($('link[rel="stylesheet"][href*="fonts.googleapis.com"]').length === 0) {
    $('head').append(
      '\n  <link rel="preconnect" href="https://fonts.googleapis.com">' +
      '\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">'
    );
  }

  // 3) 원본 body 내용을 <main class="guide-body">로 감쌈
  const bodyHtml = $('body').html() || '';
  $('body').empty();

  const breadcrumb = `W${guide.week} · Step ${guide.step} · ${guide.roleLabel}`;
  const titleEscaped = guide.title.replace(/"/g, '&quot;');

  $('body').append(`
    <header class="site-header">
      <a class="site-brand" href="/">Synapse Workflow Guide</a>
      <div class="site-breadcrumb">${breadcrumb}</div>
      <input class="site-search" type="search" placeholder="검색…" aria-label="가이드 검색" data-search-input>
    </header>
    <aside class="site-sidebar" data-sidebar>
      <nav class="site-nav-tabs" role="tablist">
        <button data-tab="week" role="tab" aria-selected="true">주차별</button>
        <button data-tab="member" role="tab" aria-selected="false">멤버별</button>
      </nav>
      <ol class="site-nav-list" data-nav-list></ol>
    </aside>
    <main class="guide-body" data-page-title="${titleEscaped}">${bodyHtml}</main>
    <footer class="site-footer">
      <p>&copy; Synapse Workflow Guide · <a href="https://github.com/team-project-final/documents">source</a></p>
    </footer>
    <script src="/assets/app.js" type="module"></script>
  `);

  return $.html();
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/inject-wrapper.test.mjs`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/inject-wrapper.mjs build/lib/inject-wrapper.test.mjs
git commit -m "feat(build): add inject-wrapper.mjs with cheerio + CSS scoping"
```

---

### Task 7: templates/ 및 assets/ 기본 골격

**Files:**
- Create: `build/templates/layout-shell.html`
- Create: `build/assets/styles.css`
- Create: `build/assets/app.js`

- [ ] **Step 1: build/templates/layout-shell.html 작성** (홈/허브 페이지에서 사용할 외곽 템플릿)

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{TITLE}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body class="page-{{PAGE_KIND}}">
    <header class="site-header">
      <a class="site-brand" href="/">Synapse Workflow Guide</a>
      <div class="site-breadcrumb">{{BREADCRUMB}}</div>
      <input class="site-search" type="search" placeholder="검색…" aria-label="가이드 검색" data-search-input>
    </header>
    <aside class="site-sidebar" data-sidebar>
      <nav class="site-nav-tabs" role="tablist">
        <button data-tab="week" role="tab" aria-selected="true">주차별</button>
        <button data-tab="member" role="tab" aria-selected="false">멤버별</button>
      </nav>
      <ol class="site-nav-list" data-nav-list>{{NAV_LIST}}</ol>
    </aside>
    <main class="site-content">{{CONTENT}}</main>
    <footer class="site-footer">
      <p>&copy; Synapse Workflow Guide · <a href="https://github.com/team-project-final/documents">source</a></p>
    </footer>
    <script src="/assets/app.js" type="module"></script>
  </body>
</html>
```

- [ ] **Step 2: build/assets/styles.css 작성** (DESIGN.md 토큰 기반 핵심 스타일)

```css
:root {
  --amber:       #D97706;
  --amber-hover: #B45309;
  --amber-soft:  #FEF3C7;
  --stone-50:  #FAFAF9;
  --stone-100: #F5F5F4;
  --stone-200: #E7E5E4;
  --stone-300: #D6D3D1;
  --stone-400: #A8A29E;
  --stone-500: #78716C;
  --stone-600: #57534E;
  --stone-700: #44403C;
  --stone-800: #292524;
  --stone-900: #1C1917;
  --header-h: 56px;
  --sidebar-w: 240px;
  --sidebar-collapsed: 56px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--stone-50); color: var(--stone-900); font-family: var(--font-body); }

.site-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 16px;
  height: var(--header-h); padding: 0 24px;
  background: #fff; border-bottom: 1px solid var(--stone-200);
}
.site-brand { font-family: var(--font-display); font-size: 18px; font-weight: 600; text-decoration: none; color: var(--stone-900); }
.site-breadcrumb { color: var(--stone-600); font-size: 14px; }
.site-search { flex: 0 1 320px; margin-left: auto; padding: 8px 12px; border: 1px solid var(--stone-300); border-radius: var(--radius-md); font: inherit; }
.site-search:focus { outline: 2px solid var(--amber); outline-offset: -1px; }

.site-sidebar {
  position: fixed; top: var(--header-h); left: 0; bottom: 0;
  width: var(--sidebar-w);
  background: #fff; border-right: 1px solid var(--stone-200);
  overflow-y: auto; padding: 16px 0;
}
.site-nav-tabs { display: flex; gap: 4px; padding: 0 16px 12px; }
.site-nav-tabs button { flex: 1; padding: 6px 0; background: none; border: 1px solid var(--stone-200); border-radius: var(--radius-md); cursor: pointer; font: inherit; }
.site-nav-tabs button[aria-selected="true"] { background: var(--amber-soft); border-color: var(--amber); }
.site-nav-list { list-style: none; margin: 0; padding: 0; }
.site-nav-list li a { display: block; padding: 6px 16px; color: var(--stone-700); text-decoration: none; }
.site-nav-list li a:hover { background: var(--stone-100); }
.site-nav-list li a[aria-current="page"] { background: var(--amber-soft); color: var(--stone-900); }

.site-content, .guide-body { padding: 24px; margin-left: var(--sidebar-w); }
.site-content { max-width: 1280px; }
.site-footer { padding: 24px; color: var(--stone-500); text-align: center; font-size: 13px; margin-left: var(--sidebar-w); }

.home-hero { padding: 48px 0 32px; }
.home-hero h1 { font-family: var(--font-display); font-size: 48px; line-height: 1.1; margin: 0; }
.home-hero p.subtitle { color: var(--stone-600); font-size: 18px; margin: 12px 0 24px; }
.hero-search { width: 100%; max-width: 540px; padding: 12px 16px; border: 1px solid var(--stone-300); border-radius: var(--radius-md); font: inherit; }
.home-stats { display: flex; gap: 24px; margin-top: 16px; color: var(--stone-600); font-size: 14px; }

.matrix { margin-top: 32px; }
.matrix h2 { font-family: var(--font-display); font-size: 24px; margin: 0 0 12px; }
.matrix-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--stone-200); border-radius: var(--radius-md); overflow: hidden; }
.matrix-table th, .matrix-table td { padding: 12px 16px; text-align: center; border-bottom: 1px solid var(--stone-200); }
.matrix-table thead th { background: var(--stone-100); font-weight: 600; }
.matrix-table tbody th { text-align: left; font-weight: 500; background: var(--stone-50); }
.matrix-cell-has { color: var(--stone-900); }
.matrix-cell-has strong { display: block; font-family: var(--font-display); font-size: 22px; }
.matrix-cell-has a:hover { background: var(--amber-soft); display: block; }
.matrix-cell-empty { color: var(--stone-400); }

.tabs-section { margin-top: 32px; }
.tabs-nav { display: flex; gap: 8px; border-bottom: 1px solid var(--stone-200); }
.tabs-nav button { padding: 10px 16px; background: none; border: none; cursor: pointer; font: inherit; color: var(--stone-600); border-bottom: 2px solid transparent; }
.tabs-nav button[aria-selected="true"] { color: var(--stone-900); border-bottom-color: var(--amber); }
.tab-panel[hidden] { display: none; }
.week-card, .member-card { background: #fff; border: 1px solid var(--stone-200); border-radius: var(--radius-md); padding: 16px; margin: 12px 0; }
.week-card h3, .member-card h3 { font-family: var(--font-display); margin: 0 0 8px; font-size: 20px; }
.week-card details, .member-card details { margin: 8px 0; }
.week-card summary, .member-card summary { cursor: pointer; padding: 6px 0; font-weight: 500; }
.guide-list { list-style: none; padding-left: 8px; margin: 4px 0 0; }
.guide-list li { padding: 4px 0; }
.guide-list a { color: var(--stone-700); text-decoration: none; }
.guide-list a:hover { color: var(--amber); text-decoration: underline; }
.guide-list .meta { color: var(--stone-500); font-size: 13px; margin-left: 4px; }

.search-results-panel { position: sticky; top: var(--header-h); background: #fff; border: 1px solid var(--stone-200); border-radius: var(--radius-md); margin: 8px 0; padding: 12px; max-height: 60vh; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.search-results-list { list-style: none; margin: 8px 0 0; padding: 0; }
.search-result { padding: 8px; border-radius: var(--radius-md); }
.search-result:hover, .search-result[aria-selected="true"] { background: var(--amber-soft); }
.search-result a { color: var(--stone-900); text-decoration: none; display: flex; flex-direction: column; gap: 4px; }
.result-meta { color: var(--stone-500); font-size: 13px; display: flex; gap: 8px; }
mark { background: var(--amber-soft); color: inherit; }

@media (max-width: 1024px) {
  .site-sidebar { transform: translateX(-100%); transition: transform 0.2s; }
  .site-sidebar.is-open { transform: translateX(0); }
  .site-content, .guide-body, .site-footer { margin-left: 0; }
}
@media (max-width: 640px) {
  .matrix-table { display: block; overflow-x: auto; white-space: nowrap; }
  .home-hero h1 { font-size: 32px; }
}
```

- [ ] **Step 3: build/assets/app.js 작성** (탭 토글 + 검색)

```js
// build/assets/app.js
const SEARCH_URL_ATTR = 'data-search-url';

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function initTabs() {
  $$('[data-tab-host]').forEach(host => {
    const buttons = $$('button[data-tab]', host);
    const panels  = $$('[data-tab-panel]', host);
    const setActive = (key) => {
      buttons.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === key ? 'true' : 'false'));
      panels.forEach(p => { p.hidden = p.dataset.tabPanel !== key; });
      if (host.dataset.tabHost === 'home') {
        history.replaceState(null, '', `#by-${key}`);
      }
    };
    buttons.forEach(b => b.addEventListener('click', () => setActive(b.dataset.tab)));
    const hash = location.hash.replace('#by-', '');
    if (hash === 'week' || hash === 'member') setActive(hash);
  });
}

async function fetchSearchIndex() {
  const link = $('link[rel="prefetch"][as="fetch"][href*="search."]');
  const url = (link && link.href) || $('[data-search-url]')?.getAttribute(SEARCH_URL_ATTR);
  if (!url) throw new Error('no search.json url available');
  const res = await fetch(url);
  if (!res.ok) throw new Error('failed to fetch search.json');
  return res.json();
}

let fuseInstance = null;
let fuseLoading = null;
async function getFuse() {
  if (fuseInstance) return fuseInstance;
  if (fuseLoading) return fuseLoading;
  fuseLoading = (async () => {
    const data = await fetchSearchIndex();
    const Fuse = (await import('/assets/fuse.min.mjs')).default;
    fuseInstance = new Fuse(data.guides, {
      keys: [
        { name: 'title', weight: 2.0 },
        { name: 'topicSlug', weight: 1.5 },
        { name: 'roleLabel', weight: 1.0 },
        { name: 'authorName', weight: 1.0 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
    });
    return fuseInstance;
  })();
  return fuseLoading;
}

function renderResults(panel, results, query) {
  if (results.length === 0) {
    panel.innerHTML = `<p class="search-results-count">검색 결과가 없습니다 — 다른 키워드를 시도하거나 매트릭스를 살펴보세요</p>`;
    return;
  }
  const items = results.slice(0, 20).map(({ item, matches }) => {
    const t = item.title || item.topicSlug;
    return `
      <li role="option" class="search-result">
        <a href="${item.url}">
          <span class="result-title">${escapeHtml(t)}</span>
          <span class="result-meta">
            <span>W${item.week}</span><span>Step ${item.step}</span><span>${escapeHtml(item.roleLabel)} · ${escapeHtml(item.authorName || '-')}</span>
          </span>
        </a>
      </li>`;
  }).join('');
  panel.innerHTML = `<p class="search-results-count">검색 결과 ${results.length}건</p><ul class="search-results-list" role="listbox">${items}</ul>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initSearch() {
  const inputs = $$('[data-search-input]');
  if (inputs.length === 0) return;
  const panel = document.createElement('section');
  panel.className = 'search-results-panel';
  panel.hidden = true;
  document.querySelector('.site-content, .guide-body')?.prepend(panel);

  let prefetched = false;
  let debounceId = null;
  const onInput = async (ev) => {
    const q = ev.target.value.trim();
    inputs.forEach(i => { if (i !== ev.target) i.value = ev.target.value; });
    clearTimeout(debounceId);
    if (q === '') { panel.hidden = true; return; }
    debounceId = setTimeout(async () => {
      try {
        const fuse = await getFuse();
        const results = fuse.search(q);
        renderResults(panel, results, q);
        panel.hidden = false;
      } catch (e) {
        panel.innerHTML = `<p>검색을 일시적으로 사용할 수 없습니다.</p>`;
        panel.hidden = false;
        console.warn(e);
      }
    }, 150);
  };
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (!prefetched) { prefetched = true; getFuse().catch(() => {}); }
    });
    input.addEventListener('input', onInput);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      inputs[0]?.focus();
    } else if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
});
```

- [ ] **Step 4: 시각 검증** (이번 task에서는 다른 task의 산출물이 필요하므로 보류)

본 task에는 별도 테스트를 두지 않는다. Task 19(첫 배포 검증)에서 통합 확인.

- [ ] **Step 5: 커밋**

```bash
git add build/templates/layout-shell.html build/assets/styles.css build/assets/app.js
git commit -m "feat(build): add layout shell, base styles, client-side app.js"
```

---

### Task 8: render-home.mjs — 홈(Hero + Matrix + Dual Tabs)

**Files:**
- Create: `build/lib/render-home.mjs`
- Create: `build/lib/render-home.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/render-home.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from './render-home.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

function g(week, step, role, topicSlug = 't', title = 'x') {
  return {
    week, step, role, roleLabel: ROLE_MAP[role].label,
    authorHandle: ROLE_MAP[role].handle, authorName: 'a', topicSlug, title,
    sourcePath: 'x', outputPath: `w${week}/step${step}/${role}__${topicSlug}-workflow-guide.html`,
    url: `/w${week}/step${step}/${role}__${topicSlug}-workflow-guide.html`,
  };
}

test('renderHome produces matrix and tabs with all 8 roles as rows', () => {
  const guides = [g(1, 1, 'team-lead'), g(1, 1, 'frontend-owner'), g(2, 5, 'platform-owner')];
  const html = renderHome(guides);
  assert.match(html, /matrix-table/);
  for (const role of Object.keys(ROLE_MAP)) {
    assert.match(html, new RegExp(ROLE_MAP[role].label), `missing label ${ROLE_MAP[role].label}`);
  }
  assert.match(html, /data-tab-host="home"/);
  assert.match(html, /data-tab-panel="week"/);
  assert.match(html, /data-tab-panel="member"/);
});

test('renderHome links matrix cells correctly', () => {
  const html = renderHome([g(1, 1, 'team-lead')]);
  assert.match(html, /href="\/members\/team-lead\.html#w1"/);
});

test('renderHome shows guide count per cell', () => {
  const html = renderHome([g(1, 1, 'team-lead'), g(1, 2, 'team-lead'), g(1, 3, 'team-lead')]);
  // matrix cell for team-lead, week 1, should show 3
  assert.match(html, /<strong>3<\/strong>/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/render-home.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: render-home.mjs 구현**

```js
// build/lib/render-home.mjs
import { ROLE_MAP } from './parse-metadata.mjs';
import { renderShell, esc } from './render-shell.mjs';

const ROLES = Object.keys(ROLE_MAP);
const WEEKS = [1, 2, 3, 4, 5];

function groupByWeekStep(guides) {
  const map = new Map();
  for (const g of guides) {
    const k = `${g.week}/${g.step}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(g);
  }
  return map;
}

function countByRoleWeek(guides, role, week) {
  return guides.filter(g => g.role === role && g.week === week).length;
}

function renderMatrix(guides) {
  const headerCells = WEEKS.map(w => `<th>W${w}</th>`).join('');
  const rows = ROLES.map(role => {
    const cells = WEEKS.map(week => {
      const count = countByRoleWeek(guides, role, week);
      if (count === 0) return `<td class="matrix-cell-empty">—</td>`;
      return `<td class="matrix-cell-has"><a href="/members/${role}.html#w${week}"><strong>${count}</strong><span>guides</span></a></td>`;
    }).join('');
    return `<tr><th scope="row">${esc(ROLE_MAP[role].label)}</th>${cells}</tr>`;
  }).join('');
  return `
    <section class="matrix">
      <h2>전체 진척 매트릭스</h2>
      <table class="matrix-table">
        <thead><tr><th scope="col"></th>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;
}

function renderWeekPanel(guides) {
  const grouped = groupByWeekStep(guides);
  return WEEKS.map(week => {
    const stepsInWeek = [...new Set(guides.filter(g => g.week === week).map(g => g.step))].sort((a, b) => a - b);
    if (stepsInWeek.length === 0) return '';
    const stepsHtml = stepsInWeek.map(step => {
      const list = (grouped.get(`${week}/${step}`) || [])
        .map(g => `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`)
        .join('');
      const count = (grouped.get(`${week}/${step}`) || []).length;
      return `<details><summary>Step ${step} (${count}개 가이드)</summary><ul class="guide-list">${list}</ul></details>`;
    }).join('');
    return `<article class="week-card" id="w${week}"><h3>Week ${week}</h3>${stepsHtml}</article>`;
  }).join('');
}

function renderMemberPanel(guides) {
  return ROLES.map(role => {
    const mine = guides.filter(g => g.role === role);
    if (mine.length === 0) return '';
    const byWeek = WEEKS.map(week => {
      const list = mine.filter(g => g.week === week);
      if (list.length === 0) return '';
      const items = list.map(g => `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· Step ${g.step}</span></li>`).join('');
      return `<details id="${role}-w${week}"><summary>W${week} (${list.length}개 가이드)</summary><ul class="guide-list">${items}</ul></details>`;
    }).join('');
    const sample = mine[0];
    return `<article class="member-card" id="${role}"><h3>${esc(ROLE_MAP[role].label)} (${esc(sample.authorName || '-')})</h3>${byWeek}</article>`;
  }).join('');
}

export function renderHome(guides) {
  const totalGuides = guides.length;
  const totalSteps = new Set(guides.map(g => `${g.week}/${g.step}`)).size;
  const content = `
    <section class="home-hero">
      <h1>Synapse 워크플로 가이드</h1>
      <p class="subtitle">5주차 · 8 담당자 · ${totalGuides}개 가이드 · ${totalSteps}개 step</p>
      <input class="hero-search" type="search" placeholder="제목·주제·멤버 검색…" data-search-input aria-label="가이드 검색">
      <div class="home-stats">
        <span>📘 ${totalGuides} 가이드</span>
        <span>🗓️ ${WEEKS.length} 주차</span>
        <span>👥 ${ROLES.length} 담당자</span>
      </div>
    </section>
    ${renderMatrix(guides)}
    <section class="tabs-section" data-tab-host="home">
      <nav class="tabs-nav" role="tablist">
        <button data-tab="week" role="tab" aria-selected="true">주차별</button>
        <button data-tab="member" role="tab" aria-selected="false">멤버별</button>
      </nav>
      <div class="tab-panel" data-tab-panel="week">${renderWeekPanel(guides)}</div>
      <div class="tab-panel" data-tab-panel="member" hidden>${renderMemberPanel(guides)}</div>
    </section>`;
  return renderShell({
    title: 'Synapse Workflow Guide',
    pageKind: 'home',
    breadcrumb: '홈',
    content,
  });
}
```

- [ ] **Step 4: render-shell.mjs 헬퍼 작성**

```js
// build/lib/render-shell.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shellPath = join(__dirname, '..', 'templates', 'layout-shell.html');
const shellHtml = readFileSync(shellPath, 'utf-8');

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderShell({ title, pageKind, breadcrumb, content, navList = '' }) {
  return shellHtml
    .replace(/\{\{TITLE\}\}/g, esc(title))
    .replace(/\{\{PAGE_KIND\}\}/g, pageKind)
    .replace(/\{\{BREADCRUMB\}\}/g, esc(breadcrumb))
    .replace(/\{\{NAV_LIST\}\}/g, navList)
    .replace(/\{\{CONTENT\}\}/g, content);
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd build && node --test lib/render-home.test.mjs`
Expected: PASS — 3 tests passed.

- [ ] **Step 6: 커밋**

```bash
git add build/lib/render-home.mjs build/lib/render-home.test.mjs build/lib/render-shell.mjs
git commit -m "feat(build): add render-home.mjs with hero, matrix, dual tabs"
```

---

### Task 9: render-week.mjs — 주차 허브

**Files:**
- Create: `build/lib/render-week.mjs`
- Create: `build/lib/render-week.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/render-week.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderWeekHubs } from './render-week.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

function g(week, step, role) {
  return {
    week, step, role, roleLabel: ROLE_MAP[role].label,
    authorHandle: ROLE_MAP[role].handle, authorName: 'a', topicSlug: 't',
    title: 't', sourcePath: 'x',
    outputPath: `w${week}/step${step}/${role}__t-workflow-guide.html`,
    url: `/w${week}/step${step}/${role}__t-workflow-guide.html`,
  };
}

test('renderWeekHubs returns one entry per week present in guides', () => {
  const out = renderWeekHubs([g(1, 1, 'team-lead'), g(1, 2, 'frontend-owner'), g(3, 7, 'platform-owner')]);
  const paths = out.map(o => o.outputPath).sort();
  assert.deepEqual(paths, ['w1/index.html', 'w3/index.html']);
});

test('week hub html lists steps with guides', () => {
  const out = renderWeekHubs([g(1, 1, 'team-lead'), g(1, 2, 'frontend-owner')]);
  const w1 = out.find(o => o.outputPath === 'w1/index.html');
  assert.ok(w1);
  assert.match(w1.html, /Week 1/);
  assert.match(w1.html, /Step 1/);
  assert.match(w1.html, /Step 2/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/render-week.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: render-week.mjs 구현**

```js
// build/lib/render-week.mjs
import { renderShell, esc } from './render-shell.mjs';

export function renderWeekHubs(guides) {
  const weeks = [...new Set(guides.map(g => g.week))].sort();
  return weeks.map(week => {
    const weekGuides = guides.filter(g => g.week === week);
    const steps = [...new Set(weekGuides.map(g => g.step))].sort((a, b) => a - b);
    const stepsHtml = steps.map(step => {
      const list = weekGuides.filter(g => g.step === step);
      const items = list.map(g =>
        `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`
      ).join('');
      return `<section><h3><a href="/w${week}/step${step}/">Step ${step}</a> <span class="meta">(${list.length}개)</span></h3><ul class="guide-list">${items}</ul></section>`;
    }).join('');
    const content = `
      <section class="home-hero"><h1>Week ${week}</h1><p class="subtitle">${weekGuides.length}개 가이드 · ${steps.length}개 step</p></section>
      ${stepsHtml}`;
    return {
      outputPath: `w${week}/index.html`,
      html: renderShell({
        title: `Week ${week} · Synapse Workflow Guide`,
        pageKind: 'week',
        breadcrumb: `W${week}`,
        content,
      }),
    };
  });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/render-week.test.mjs`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/render-week.mjs build/lib/render-week.test.mjs
git commit -m "feat(build): add render-week.mjs for week hub pages"
```

---

### Task 10: render-step.mjs — 스텝 허브

**Files:**
- Create: `build/lib/render-step.mjs`
- Create: `build/lib/render-step.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/render-step.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderStepHubs } from './render-step.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

function g(week, step, role) {
  return {
    week, step, role, roleLabel: ROLE_MAP[role].label,
    authorHandle: ROLE_MAP[role].handle, authorName: 'a', topicSlug: 't',
    title: 't', sourcePath: 'x',
    outputPath: `w${week}/step${step}/${role}__t-workflow-guide.html`,
    url: `/w${week}/step${step}/${role}__t-workflow-guide.html`,
  };
}

test('renderStepHubs returns one entry per (week, step) pair', () => {
  const out = renderStepHubs([g(1, 1, 'team-lead'), g(1, 1, 'frontend-owner'), g(1, 2, 'team-lead')]);
  const paths = out.map(o => o.outputPath).sort();
  assert.deepEqual(paths, ['w1/step1/index.html', 'w1/step2/index.html']);
});

test('step hub lists all guides for that step', () => {
  const out = renderStepHubs([g(1, 1, 'team-lead'), g(1, 1, 'frontend-owner')]);
  const w1s1 = out.find(o => o.outputPath === 'w1/step1/index.html');
  assert.match(w1s1.html, /Team Lead/);
  assert.match(w1s1.html, /Frontend/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/render-step.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: render-step.mjs 구현**

```js
// build/lib/render-step.mjs
import { renderShell, esc } from './render-shell.mjs';

export function renderStepHubs(guides) {
  const pairs = new Map();
  for (const g of guides) {
    const key = `${g.week}/${g.step}`;
    if (!pairs.has(key)) pairs.set(key, []);
    pairs.get(key).push(g);
  }
  const out = [];
  for (const [key, list] of pairs) {
    const [week, step] = key.split('/').map(Number);
    const items = list.map(g =>
      `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`
    ).join('');
    const content = `
      <section class="home-hero"><h1>Week ${week} · Step ${step}</h1><p class="subtitle">${list.length}개 가이드</p></section>
      <ul class="guide-list">${items}</ul>`;
    out.push({
      outputPath: `w${week}/step${step}/index.html`,
      html: renderShell({
        title: `W${week} Step ${step} · Synapse Workflow Guide`,
        pageKind: 'step',
        breadcrumb: `W${week} · Step ${step}`,
        content,
      }),
    });
  }
  return out;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/render-step.test.mjs`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/render-step.mjs build/lib/render-step.test.mjs
git commit -m "feat(build): add render-step.mjs for step hub pages"
```

---

### Task 11: render-member.mjs — 멤버 허브

**Files:**
- Create: `build/lib/render-member.mjs`
- Create: `build/lib/render-member.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/render-member.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMemberHubs } from './render-member.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

function g(week, step, role) {
  return {
    week, step, role, roleLabel: ROLE_MAP[role].label,
    authorHandle: ROLE_MAP[role].handle, authorName: 'a', topicSlug: 't',
    title: 't', sourcePath: 'x',
    outputPath: `w${week}/step${step}/${role}__t-workflow-guide.html`,
    url: `/w${week}/step${step}/${role}__t-workflow-guide.html`,
  };
}

test('renderMemberHubs returns one entry per role present in guides', () => {
  const out = renderMemberHubs([g(1, 1, 'team-lead'), g(1, 2, 'frontend-owner')]);
  const paths = out.map(o => o.outputPath).sort();
  assert.deepEqual(paths, ['members/frontend-owner.html', 'members/team-lead.html']);
});

test('member hub groups by week with anchor ids', () => {
  const out = renderMemberHubs([g(1, 1, 'team-lead'), g(2, 4, 'team-lead')]);
  const tl = out.find(o => o.outputPath === 'members/team-lead.html');
  assert.match(tl.html, /id="w1"/);
  assert.match(tl.html, /id="w2"/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/render-member.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: render-member.mjs 구현**

```js
// build/lib/render-member.mjs
import { renderShell, esc } from './render-shell.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

export function renderMemberHubs(guides) {
  const roles = [...new Set(guides.map(g => g.role))];
  return roles.map(role => {
    const mine = guides.filter(g => g.role === role).sort((a, b) => a.week - b.week || a.step - b.step);
    const weeks = [...new Set(mine.map(g => g.week))].sort();
    const sample = mine[0];
    const weeksHtml = weeks.map(week => {
      const list = mine.filter(g => g.week === week);
      const items = list.map(g =>
        `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· Step ${g.step}</span></li>`
      ).join('');
      return `<section id="w${week}"><h2>Week ${week} <span class="meta">(${list.length}개)</span></h2><ul class="guide-list">${items}</ul></section>`;
    }).join('');
    const content = `
      <section class="home-hero"><h1>${esc(ROLE_MAP[role].label)} · ${esc(sample.authorName || '-')}</h1><p class="subtitle">${mine.length}개 가이드 · ${weeks.length}개 주차</p></section>
      ${weeksHtml}`;
    return {
      outputPath: `members/${role}.html`,
      html: renderShell({
        title: `${ROLE_MAP[role].label} · Synapse Workflow Guide`,
        pageKind: 'member',
        breadcrumb: `${ROLE_MAP[role].label}`,
        content,
      }),
    };
  });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/render-member.test.mjs`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/render-member.mjs build/lib/render-member.test.mjs
git commit -m "feat(build): add render-member.mjs for member hub pages"
```

---

### Task 12: render-404.mjs

**Files:**
- Create: `build/lib/render-404.mjs`

- [ ] **Step 1: render-404.mjs 구현** (테스트는 단순 정적 페이지라 생략, smoke만)

```js
// build/lib/render-404.mjs
import { renderShell } from './render-shell.mjs';

export function render404() {
  const content = `
    <section class="home-hero">
      <h1>404 — 페이지를 찾을 수 없습니다</h1>
      <p class="subtitle">URL이 변경되었거나 가이드가 이동/삭제되었을 수 있습니다.</p>
      <p><a href="/">홈으로 돌아가기</a></p>
    </section>`;
  return {
    outputPath: '404.html',
    html: renderShell({
      title: '404 · Synapse Workflow Guide',
      pageKind: '404',
      breadcrumb: '404',
      content,
    }),
  };
}
```

- [ ] **Step 2: 빠른 smoke**

Run: `cd build && node -e "import('./lib/render-404.mjs').then(m => console.log(m.render404().outputPath))"`
Expected: `404.html` 출력.

- [ ] **Step 3: 커밋**

```bash
git add build/lib/render-404.mjs
git commit -m "feat(build): add render-404.mjs"
```

---

### Task 13: build-search-index.mjs — search.<sha>.json 생성

**Files:**
- Create: `build/lib/build-search-index.mjs`
- Create: `build/lib/build-search-index.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/build-search-index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex } from './build-search-index.mjs';

const guides = [{
  week: 1, step: 1, role: 'team-lead', roleLabel: 'Team Lead',
  authorHandle: '@team-lead', authorName: '김민구', topicSlug: 'aws-infra',
  title: 'AWS 인프라 프로비저닝', sourcePath: 'x',
  outputPath: 'w1/step1/team-lead__aws-infra-workflow-guide.html',
  url: '/w1/step1/team-lead__aws-infra-workflow-guide.html',
}];

test('buildSearchIndex returns fingerprinted filename and JSON content', () => {
  const { outputPath, content } = buildSearchIndex(guides, { sha: 'abcdef1234567890' });
  assert.equal(outputPath, 'assets/search.abcdef1.json');
  const parsed = JSON.parse(content);
  assert.equal(parsed.buildSha, 'abcdef1');
  assert.equal(parsed.guides.length, 1);
  assert.equal(parsed.guides[0].title, 'AWS 인프라 프로비저닝');
  assert.equal(parsed.guides[0].topicSlug, 'aws-infra');
});

test('buildSearchIndex omits internal-only fields', () => {
  const { content } = buildSearchIndex(guides, { sha: 'a1b2c3d' });
  const parsed = JSON.parse(content);
  assert.equal(parsed.guides[0].sourcePath, undefined);
  assert.equal(parsed.guides[0].outputPath, undefined);
});

test('fingerprint falls back when no sha provided', () => {
  const { outputPath } = buildSearchIndex(guides, {});
  assert.match(outputPath, /^assets\/search\.[a-z0-9]+\.json$/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/build-search-index.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: build-search-index.mjs 구현**

```js
// build/lib/build-search-index.mjs
import { createHash } from 'node:crypto';

export function buildSearchIndex(guides, { sha, time } = {}) {
  const entries = guides.map(g => ({
    title: g.title,
    topicSlug: g.topicSlug,
    roleLabel: g.roleLabel,
    authorName: g.authorName,
    week: g.week,
    step: g.step,
    url: g.url,
  }));
  const buildSha = (sha && sha.slice(0, 7)) || createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 7);
  const buildTime = time || new Date().toISOString();
  const payload = { buildSha, buildTime, guides: entries };
  const content = JSON.stringify(payload, null, 2);
  return {
    outputPath: `assets/search.${buildSha}.json`,
    content,
    fingerprint: buildSha,
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/build-search-index.test.mjs`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/build-search-index.mjs build/lib/build-search-index.test.mjs
git commit -m "feat(build): add build-search-index.mjs with sha fingerprint"
```

---

### Task 14: copy-assets.mjs — 정적 자산 복사 + index.html 자산 경로 치환

**Files:**
- Create: `build/lib/copy-assets.mjs`
- Create: `build/lib/copy-assets.test.mjs`

- [ ] **Step 1: 테스트 작성**

```js
// build/lib/copy-assets.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copyAssets } from './copy-assets.mjs';

test('copyAssets copies files from src to dist/assets', () => {
  const root = mkdtempSync(join(tmpdir(), 'wgd-copy-'));
  const srcAssets = join(root, 'assets');
  mkdirSync(srcAssets, { recursive: true });
  writeFileSync(join(srcAssets, 'styles.css'), 'body{}');
  writeFileSync(join(srcAssets, 'app.js'), 'console.log(1)');
  const distDir = join(root, 'dist');
  try {
    copyAssets({ srcDir: srcAssets, distDir });
    assert.ok(existsSync(join(distDir, 'assets', 'styles.css')));
    assert.equal(readFileSync(join(distDir, 'assets', 'styles.css'), 'utf-8'), 'body{}');
    assert.ok(existsSync(join(distDir, 'assets', 'app.js')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd build && node --test lib/copy-assets.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: copy-assets.mjs 구현**

```js
// build/lib/copy-assets.mjs
import { mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyRecursive(s, d);
    else copyFileSync(s, d);
  }
}

export function copyAssets({ srcDir, distDir }) {
  copyRecursive(srcDir, join(distDir, 'assets'));
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd build && node --test lib/copy-assets.test.mjs`
Expected: PASS — 1 test passed.

- [ ] **Step 5: 커밋**

```bash
git add build/lib/copy-assets.mjs build/lib/copy-assets.test.mjs
git commit -m "feat(build): add copy-assets.mjs to copy assets/ into dist/"
```

---

### Task 15: build.mjs 진입점 통합

**Files:**
- Create: `build/build.mjs`
- Create: `build/lib/fetch-fuse.mjs`

- [ ] **Step 1: build/lib/fetch-fuse.mjs 작성** (fuse.js 클라이언트 번들 복사 헬퍼)

```js
// build/lib/fetch-fuse.mjs
// fuse.js ESM 빌드는 node_modules/fuse.js/dist/fuse.mjs 에 위치. dist/assets/로 복사.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function copyFuseRuntime(distDir) {
  const fuseEsm = require.resolve('fuse.js/dist/fuse.mjs');
  const target = join(distDir, 'assets', 'fuse.min.mjs');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(fuseEsm, target);
}
```

- [ ] **Step 2: build/build.mjs 작성**

```js
// build/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverGuides } from './lib/discover.mjs';
import { parseGuide } from './lib/parse-metadata.mjs';
import { validateGuides } from './lib/validate.mjs';
import { injectWrapper } from './lib/inject-wrapper.mjs';
import { renderHome } from './lib/render-home.mjs';
import { renderWeekHubs } from './lib/render-week.mjs';
import { renderStepHubs } from './lib/render-step.mjs';
import { renderMemberHubs } from './lib/render-member.mjs';
import { render404 } from './lib/render-404.mjs';
import { buildSearchIndex } from './lib/build-search-index.mjs';
import { copyAssets } from './lib/copy-assets.mjs';
import { copyFuseRuntime } from './lib/fetch-fuse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GUIDES_DIR = join(ROOT, 'workflow-guides');
const DIST = join(__dirname, 'dist');
const ASSETS_SRC = join(__dirname, 'assets');

const args = process.argv.slice(2);
const VALIDATE_ONLY = args.includes('--validate-only');
const VERBOSE = args.includes('--verbose');

function log(...m) { if (VERBOSE) console.log('[build]', ...m); }
function writeFileMkdir(absPath, contents) {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, contents);
}

async function main() {
  const files = discoverGuides(GUIDES_DIR);
  log(`discovered ${files.length} files`);

  const guides = [];
  const warnings = [];
  for (const absPath of files) {
    const html = readFileSync(absPath, 'utf-8');
    const guide = parseGuide({ rootDir: ROOT, absPath, html });
    if (!guide) {
      warnings.push(`skipped (pattern mismatch): ${absPath}`);
      continue;
    }
    guides.push(guide);
  }

  const v = validateGuides(guides);
  warnings.push(...v.warnings);
  if (v.failures.length > 0) {
    console.error('[build] validation failures:');
    for (const f of v.failures) console.error('  -', f);
    process.exit(1);
  }
  for (const w of warnings) console.warn('[build] warning:', w);

  if (VALIDATE_ONLY) {
    console.log(`[build] validate-only OK · ${guides.length} guides · ${warnings.length} warnings`);
    return;
  }

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // 1. 가이드 HTML wrapper 주입
  for (const guide of guides) {
    const srcAbs = join(ROOT, guide.sourcePath);
    const raw = readFileSync(srcAbs, 'utf-8');
    const wrapped = injectWrapper(raw, guide);
    writeFileMkdir(join(DIST, guide.outputPath), wrapped);
  }

  // 2. 인덱스 페이지들
  writeFileMkdir(join(DIST, 'index.html'), renderHome(guides));
  for (const { outputPath, html } of renderWeekHubs(guides))   writeFileMkdir(join(DIST, outputPath), html);
  for (const { outputPath, html } of renderStepHubs(guides))   writeFileMkdir(join(DIST, outputPath), html);
  for (const { outputPath, html } of renderMemberHubs(guides)) writeFileMkdir(join(DIST, outputPath), html);
  const four04 = render404();
  writeFileMkdir(join(DIST, four04.outputPath), four04.html);

  // 3. search.json (fingerprinted)
  const sha = process.env.GITHUB_SHA || '';
  const search = buildSearchIndex(guides, { sha });
  writeFileMkdir(join(DIST, search.outputPath), search.content);

  // 4. search.json fingerprint 를 모든 dist HTML에 주입 (<link rel="prefetch"> + data-search-url)
  const fingerprintSnippet =
    `<link rel="prefetch" as="fetch" href="/${search.outputPath}" crossorigin>` +
    `<meta name="search-url" data-search-url="/${search.outputPath}">`;
  injectSearchFingerprint(DIST, fingerprintSnippet);

  // 5. 자산 복사
  copyAssets({ srcDir: ASSETS_SRC, distDir: DIST });
  copyFuseRuntime(DIST);

  // 6. build-info.json
  writeFileMkdir(join(DIST, 'assets', 'build-info.json'), JSON.stringify({
    buildSha: search.fingerprint,
    buildTime: new Date().toISOString(),
    guideCount: guides.length,
    warnings,
  }, null, 2));

  // 7. dist/build-warnings.json
  writeFileMkdir(join(DIST, 'build-warnings.json'), JSON.stringify({ warnings }, null, 2));

  console.log(`[build] OK · ${guides.length} guides → dist/`);
}

import { readdirSync, statSync } from 'node:fs';
function injectSearchFingerprint(dir, snippet) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (entry === 'assets') continue;
    if (statSync(p).isDirectory()) injectSearchFingerprint(p, snippet);
    else if (entry.endsWith('.html')) {
      const html = readFileSync(p, 'utf-8');
      if (html.includes('data-search-url')) continue;
      writeFileSync(p, html.replace('</head>', `  ${snippet}\n  </head>`));
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: 전체 빌드 smoke test**

Run: `cd build && node build.mjs --verbose`
Expected:
- `[build] OK · N guides → dist/` 메시지 출력
- `build/dist/index.html` 존재
- `build/dist/w1/step1/<role>__<topic>-workflow-guide.html` 다수 존재
- `build/dist/assets/search.<sha>.json` 존재
- `build/dist/assets/styles.css`, `app.js`, `fuse.min.mjs` 존재

- [ ] **Step 4: validate-only 모드 확인**

Run: `cd build && node build.mjs --validate-only`
Expected: `[build] validate-only OK · N guides · M warnings` 출력, dist/ 미생성.

- [ ] **Step 5: 로컬 preview 확인**

Run: `cd build && npm run preview` (별도 터미널)
브라우저에서 `http://localhost:3000/` 열기.

Expected:
- 홈 페이지 로드: 헤더 · 사이드바(주차/멤버 탭) · 매트릭스 · 듀얼 탭 보임
- 매트릭스 셀 클릭 → 해당 멤버 페이지로 이동
- 탭 토글 동작, URL hash 변경 (`#by-week`/`#by-member`)
- 헤더 검색창에 `kafka` 입력 → 결과 박스 노출, 클릭 시 가이드로 이동
- 가이드 페이지 클릭 → 공통 헤더/사이드바 노출, 본문 원본 보임

- [ ] **Step 6: 커밋**

```bash
git add build/build.mjs build/lib/fetch-fuse.mjs
git commit -m "feat(build): add build.mjs entrypoint integrating all pipeline steps"
```

---

### Task 16: GitHub Actions 워크플로

**Files:**
- Create: `.github/workflows/deploy-workflow-guide.yml`

- [ ] **Step 1: deploy-workflow-guide.yml 작성**

```yaml
# .github/workflows/deploy-workflow-guide.yml
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
      - '.github/workflows/deploy-workflow-guide.yml'
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
      - run: npm test
        working-directory: build
      - run: npm run build
        working-directory: build
        env:
          GITHUB_SHA: ${{ github.sha }}
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
        with:
          name: dist
          path: dist
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
```

- [ ] **Step 2: yaml lint (선택)**

Run: `npx --yes yaml-lint .github/workflows/deploy-workflow-guide.yml` 또는 `python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-workflow-guide.yml'))"`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add .github/workflows/deploy-workflow-guide.yml
git commit -m "ci: add deploy-workflow-guide.yml for automated Pages deploy"
```

---

### Task 17: workflow-guide repo 초기 설정 (수동, 1회)

**Files:** (외부 repo `team-project-final/workflow-guide` 측 작업)

이 task는 documents repo 외부에서 실행한다. 별도 작업 디렉터리에서 수행 후 결과만 본 plan에 체크한다.

- [ ] **Step 1: workflow-guide repo 로컬 clone**

```bash
cd /tmp
git clone https://github.com/team-project-final/workflow-guide.git
cd workflow-guide
```

- [ ] **Step 2: main 브랜치에 README.md, LICENSE 생성**

`README.md`:

```markdown
# Synapse Workflow Guide

Static site that aggregates the workflow guides from
[team-project-final/documents](https://github.com/team-project-final/documents/tree/main/workflow-guides).

- **Live site**: <https://team-project-final.github.io/workflow-guide/>
- **Source**: gh-pages branch is built by the `Deploy workflow-guide site` Action
  in the `documents` repo. Do not commit to gh-pages manually.

## Contributing

Add or edit guides in `documents/workflow-guides/`. See
[the design spec](https://github.com/team-project-final/documents/blob/main/docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md)
for the build pipeline.
```

`LICENSE` (MIT 또는 팀 표준):

```
MIT License
Copyright (c) 2026 team-project-final
...
```

```bash
git add README.md LICENSE
git commit -m "docs: initial README and LICENSE"
git push origin main
```

- [ ] **Step 3: gh-pages 빈 브랜치 생성**

```bash
git checkout --orphan gh-pages
git rm -rf .
echo '<!doctype html><meta charset="utf-8"><title>workflow-guide</title><p>First deploy pending…</p>' > index.html
git add index.html
git commit -m "init: empty gh-pages"
git push origin gh-pages
git checkout main
```

- [ ] **Step 4: GitHub Pages 활성화**

GitHub UI: workflow-guide repo → Settings → Pages → Source: `Deploy from a branch` · Branch: `gh-pages` / `(root)` → Save.
Expected: 안내 메시지 "Your site is live at https://team-project-final.github.io/workflow-guide/".

- [ ] **Step 5: PAT 생성 + secret 등록**

1. GitHub UI에서 fine-grained PAT 생성:
   - Resource owner: `team-project-final`
   - Repository access: `workflow-guide`만 선택
   - Permissions: Contents: Read and write
   - 만료: 365일 (또는 팀 정책)
2. `documents` repo → Settings → Secrets and variables → Actions → New repository secret:
   - Name: `WORKFLOW_GUIDE_DEPLOY_TOKEN`
   - Value: 생성한 PAT
3. 토큰 갱신 절차를 README에 메모.

이 task는 외부 작업이므로 git commit 없음. 모든 체크박스 완료로 마무리.

---

### Task 18: 작성자 매뉴얼 (workflow-guides/README.md)

**Files:**
- Create: `workflow-guides/README.md`

- [ ] **Step 1: README.md 작성**

```markdown
# workflow-guides/

Standalone HTML 워크플로 가이드. 이 폴더의 파일들은 자동으로
[workflow-guide 사이트](https://team-project-final.github.io/workflow-guide/)에 배포된다.

## 새 가이드 추가

1. 적절한 step 폴더에 HTML 파일 추가:
   - 위치: `workflow-guides/workflow-w{N}-step{M}-guide/`
   - 파일명: `{role}__{topic-kebab}-workflow-guide({한글이름 또는 '전체'}).html`
2. HTML `<title>` 필수, 형식: `WORKFLOW Guide - {한글 제목}`
3. standalone HTML 권장. `<style>` 안에 `body`/`header`/`main`/`footer` 셀렉터를 자유롭게
   사용해도 된다 (빌드가 `.guide-body`로 자동 스코프).

## Role 매핑표

| 파일명 prefix | 표시명 | 트랙 |
|---|---|---|
| `team-lead` | Team Lead | 인프라/Gateway |
| `platform-owner` | Platform | A |
| `engagement-owner` | Engagement | B |
| `knowledge-owner-1` | Knowledge-1 | C-1 |
| `knowledge-owner-2` | Knowledge-2 | C-2 |
| `learning-card-owner` | Learning Card | D-1 |
| `learning-ai-owner` | Learning AI | D-2 |
| `frontend-owner` | Frontend | 협업 |

## 로컬 검증

```bash
cd build
npm ci                # 최초 1회
npm run validate      # PR 전 빠른 검증
npm run build         # dist 생성
npm run preview       # http://localhost:3000 미리보기
```

## PR 흐름

1. PR 열기 → CI(`Deploy workflow-guide site` Action)가 build + 검증 실행
2. PR check 녹색이면 머지 가능
3. main 머지 → 자동 deploy (수 분 내 사이트 반영)

## 슬러그 충돌

같은 step 폴더 안에서 슬러그가 같으면 빌드가 fail한다. `topic-kebab` 부분에 구분어를
추가해서 해결 (예: `…-workflow-guide-v2`).

## 보조 문서 (deploy되지 않음)

- `w{N}-step{M}-guide-coverage-audit.md` — step별 가이드 커버리지 점검 문서
- 폴더 외 다른 `.md` 파일들

## 자세한 설계

[docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md](../docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md)
```

- [ ] **Step 2: 커밋**

```bash
git add workflow-guides/README.md
git commit -m "docs(workflow-guides): add contributor manual"
```

---

### Task 19: 첫 배포 + v1 성공 기준 검증

**Files:** (검증만, 산출물 변경 없음)

- [ ] **Step 1: main 브랜치에 push 후 Actions 모니터**

Run: `git push origin main` (이전 task의 commit들을 한꺼번에 push)
GitHub UI에서 documents repo → Actions 탭 → `Deploy workflow-guide site` 워크플로 확인.

Expected:
- `build` job 통과 (npm ci → npm test → npm run build → artifact upload)
- `deploy` job 통과 (artifact download → peaceiris push → health check)
- 노란색 deploy commit이 `workflow-guide` repo의 `gh-pages` 브랜치에 생김

- [ ] **Step 2: 사이트 1차 확인** (Pages 빌드까지 1-3분 대기)

브라우저에서 `https://team-project-final.github.io/workflow-guide/` 열기.

Expected:
- 홈 페이지가 정상 로드 (헤더 · 사이드바 · 매트릭스 · 듀얼 탭)
- 매트릭스 셀 숫자가 실제 가이드 수와 일치
- 사이드바 주차별 탭에 W1~W5 표시
- Console에 에러 없음

- [ ] **Step 3: v1 성공 기준 점검**

순서대로 확인:

| 항목 | 검증 방법 | 통과 조건 |
|---|---|---|
| 자동 반영 | 작은 가이드 1개 추가 PR → 머지 → Actions 확인 | 5분 이내 사이트 반영 |
| 100+ 도달성 | 임의 5개 가이드 URL 직접 방문 | 모두 200, wrapper 노출 |
| 정적 노출 | DevTools에서 JS 비활성 후 새로고침 | 매트릭스·사이드바·듀얼 탭이 여전히 의미 있게 보임 |
| 검색 응답 | 헤더 검색에 `kafka` 입력 | <300ms로 결과 노출 |
| 모바일 | DevTools 모바일 뷰(<640px) | 사이드바 드로어, 매트릭스 가로 스크롤, 검색 동작 |
| 슬러그 충돌 | 의도적 충돌 PR (예: 같은 topic으로 한 파일 더) | CI fail + 명확한 메시지 |

각 항목에 대해 결과를 본 plan의 체크박스에 기록.

- [ ] **Step 4: 검증 결과 요약**

검증 완료 후 PR/이슈에 요약 코멘트:

```
[deploy verification] 2026-05-XX
- ✅ 자동 반영: PR #N 머지 → 4분에 사이트 반영
- ✅ 100+ 도달성: 5/5 샘플 페이지 정상
- ✅ 정적 노출: JS off 상태에서 매트릭스/탭/사이드바 정상
- ✅ 검색 응답: kafka·search·oauth 모두 <200ms
- ✅ 모바일: 360px·414px 뷰 정상
- ✅ 슬러그 충돌: 의도적 충돌 PR이 CI fail로 차단됨
```

- [ ] **Step 5: 운영 모드 전환 커밋**

design doc 상태를 "초안" → "구현 완료"로 갱신:

```bash
# docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md
# **상태**: 초안 (사용자 리뷰 대기)  →  **상태**: 구현 완료 (2026-05-XX 첫 배포)
```

(spec 파일 헤더 한 줄만 수정.)

```bash
git add docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md
git commit -m "docs(spec): mark workflow-guide deploy spec as implemented"
git push origin main
```

---

## 부록: 스코프 밖 (별도 spec)

본 plan에서 다루지 않음 (spec §11에 명시):
- 가이드 본문 일괄 다크모드 대응
- 본문 전문 검색(lunr/flexsearch)
- PR별 deploy preview
- HISTORY/PRD/WORKFLOW md까지 통합 포털화
- 가이드 페이지 내부 ToC 자동 생성
- 다국어(영문) 라벨/검색
