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

test('tolerates whitespace before (author) block', () => {
  const guide = parseGuide({
    rootDir: '/repo',
    absPath: '/repo/workflow-guides/workflow-w1-step1-guide/engagement-owner__svc-scaffold-workflow-guide (한승완).html',
    html: '<html><head><title>WORKFLOW Guide - 골격</title></head></html>',
  });
  assert.ok(guide, 'guide should not be null');
  assert.equal(guide.role, 'engagement-owner');
  assert.equal(guide.authorName, '한승완');
  assert.equal(guide.outputPath, 'w1/step1/engagement-owner__svc-scaffold-workflow-guide.html');
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
