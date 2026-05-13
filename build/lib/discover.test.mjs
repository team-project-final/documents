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
