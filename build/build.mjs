// build/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverGuides } from './lib/discover.mjs';
import { parseGuide } from './lib/parse-metadata.mjs';
import { validateGuides } from './lib/validate.mjs';
import { injectWrapper } from './lib/inject-wrapper.mjs';
import { renderHome } from './lib/render-home.mjs';
import { renderWeekHubs } from './lib/render-week.mjs';
import { renderStepHubs } from './lib/render-step.mjs';
import { renderMemberHubs } from './lib/render-member.mjs';
import { render404 } from './lib/render-404.mjs';
import { buildSearchIndex } from './lib/build-search-index.mjs';
import { copyAssets } from './lib/copy-assets.mjs';
import { copyFuseRuntime } from './lib/fetch-fuse.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GUIDES_DIR = join(ROOT, 'workflow-guides');
const DIST = join(__dirname, 'dist');
const ASSETS_SRC = join(__dirname, 'assets');

const args = process.argv.slice(2);
const VALIDATE_ONLY = args.includes('--validate-only');
const VERBOSE = args.includes('--verbose');

function log(...m) { if (VERBOSE) console.log('[build]', ...m); }
function writeFileMkdir(absPath, contents) {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, contents);
}

function injectSearchFingerprint(dir, snippet) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (entry === 'assets') continue;
    if (statSync(p).isDirectory()) injectSearchFingerprint(p, snippet);
    else if (entry.endsWith('.html')) {
      const html = readFileSync(p, 'utf-8');
      if (html.includes('data-search-url')) continue;
      writeFileSync(p, html.replace('</head>', `  ${snippet}\n  </head>`));
    }
  }
}

async function main() {
  const files = discoverGuides(GUIDES_DIR);
  log(`discovered ${files.length} files`);

  const guides = [];
  const warnings = [];
  for (const absPath of files) {
    const html = readFileSync(absPath, 'utf-8');
    const guide = parseGuide({ rootDir: ROOT, absPath, html });
    if (!guide) {
      warnings.push(`skipped (pattern mismatch): ${absPath}`);
      continue;
    }
    guides.push(guide);
  }

  const v = validateGuides(guides);
  warnings.push(...v.warnings);
  if (v.failures.length > 0) {
    console.error('[build] validation failures:');
    for (const f of v.failures) console.error('  -', f);
    process.exit(1);
  }
  for (const w of warnings) console.warn('[build] warning:', w);

  if (VALIDATE_ONLY) {
    console.log(`[build] validate-only OK · ${guides.length} guides · ${warnings.length} warnings`);
    return;
  }

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  for (const guide of guides) {
    const srcAbs = join(ROOT, guide.sourcePath);
    const raw = readFileSync(srcAbs, 'utf-8');
    const wrapped = injectWrapper(raw, guide);
    writeFileMkdir(join(DIST, guide.outputPath), wrapped);
  }

  writeFileMkdir(join(DIST, 'index.html'), renderHome(guides));
  for (const { outputPath, html } of renderWeekHubs(guides))   writeFileMkdir(join(DIST, outputPath), html);
  for (const { outputPath, html } of renderStepHubs(guides))   writeFileMkdir(join(DIST, outputPath), html);
  for (const { outputPath, html } of renderMemberHubs(guides)) writeFileMkdir(join(DIST, outputPath), html);
  const four04 = render404();
  writeFileMkdir(join(DIST, four04.outputPath), four04.html);

  const sha = process.env.GITHUB_SHA || '';
  const search = buildSearchIndex(guides, { sha });
  writeFileMkdir(join(DIST, search.outputPath), search.content);

  const fingerprintSnippet =
    `<link rel="prefetch" as="fetch" href="/${search.outputPath}" crossorigin>` +
    `<meta name="search-url" data-search-url="/${search.outputPath}">`;
  injectSearchFingerprint(DIST, fingerprintSnippet);

  copyAssets({ srcDir: ASSETS_SRC, distDir: DIST });
  copyFuseRuntime(DIST);

  writeFileMkdir(join(DIST, 'assets', 'build-info.json'), JSON.stringify({
    buildSha: search.fingerprint,
    buildTime: new Date().toISOString(),
    guideCount: guides.length,
    warnings,
  }, null, 2));

  writeFileMkdir(join(DIST, 'build-warnings.json'), JSON.stringify({ warnings }, null, 2));

  console.log(`[build] OK · ${guides.length} guides → dist/`);
}

main().catch(err => { console.error(err); process.exit(1); });
