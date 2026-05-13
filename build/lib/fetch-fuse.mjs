// build/lib/fetch-fuse.mjs
// fuse.js ESM 빌드를 dist/assets/fuse.min.mjs로 복사.
// fuse.js v7의 exports map은 'fuse.js' 진입점만 노출하므로 그 경로를 사용한다.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function copyFuseRuntime(distDir) {
  const fuseEsm = require.resolve('fuse.js');
  const target = join(distDir, 'assets', 'fuse.min.mjs');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(fuseEsm, target);
}
