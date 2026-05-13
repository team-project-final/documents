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
