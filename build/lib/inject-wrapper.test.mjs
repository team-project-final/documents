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
  assert.match(out, /<header class="site-header"/);
  assert.match(out, /<aside class="site-sidebar"/);
  assert.match(out, /<footer class="site-footer"/);
  assert.match(out, /<main class="guide-body"/);
  assert.match(out, /\.guide-body \{ margin: 0; \}/);
  assert.match(out, /W1.*Step 1.*Frontend/);
});

test('injectWrapper links to /assets/styles.css and /assets/app.js', () => {
  const out = injectWrapper('<html><head></head><body></body></html>', guide);
  assert.match(out, /href="\/assets\/styles\.css"/);
  assert.match(out, /src="\/assets\/app\.js"/);
});
