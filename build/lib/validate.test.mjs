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
