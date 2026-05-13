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
