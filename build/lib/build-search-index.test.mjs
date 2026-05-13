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
