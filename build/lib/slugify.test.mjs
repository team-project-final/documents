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

test('handles whitespace between guide and (author)', () => {
  assert.equal(
    slugifyFilename('engagement-owner__svc-scaffold-workflow-guide (한승완).html'),
    'engagement-owner__svc-scaffold-workflow-guide.html',
  );
});
