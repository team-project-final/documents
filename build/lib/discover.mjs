// build/lib/discover.mjs
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FOLDER_PATTERN = /^workflow-w[1-5]-step\d{1,2}-guide$/;

export function discoverGuides(rootDir) {
  let entries;
  try {
    entries = readdirSync(rootDir);
  } catch {
    return [];
  }
  const results = [];
  for (const entry of entries) {
    if (!FOLDER_PATTERN.test(entry)) continue;
    const folderPath = join(rootDir, entry);
    if (!statSync(folderPath).isDirectory()) continue;
    for (const file of readdirSync(folderPath)) {
      if (file.startsWith('.')) continue;
      if (!file.endsWith('.html')) continue;
      results.push(join(folderPath, file));
    }
  }
  return results.sort();
}
