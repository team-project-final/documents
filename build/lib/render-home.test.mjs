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
  assert.match(html, /<strong>3<\/strong>/);
});
