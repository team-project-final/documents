// build/lib/copy-assets.mjs
import { mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyRecursive(s, d);
    else copyFileSync(s, d);
  }
}

export function copyAssets({ srcDir, distDir }) {
  copyRecursive(srcDir, join(distDir, 'assets'));
}
