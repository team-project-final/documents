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
