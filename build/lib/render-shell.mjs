// build/lib/render-shell.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BASE_PATH } from './base-path.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shellPath = join(__dirname, '..', 'templates', 'layout-shell.html');
const shellHtml = readFileSync(shellPath, 'utf-8');

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderShell({ title, pageKind, breadcrumb, content, navList = '' }) {
  return shellHtml
    .replace(/\{\{TITLE\}\}/g, esc(title))
    .replace(/\{\{PAGE_KIND\}\}/g, pageKind)
    .replace(/\{\{BREADCRUMB\}\}/g, esc(breadcrumb))
    .replace(/\{\{NAV_LIST\}\}/g, navList)
    .replace(/\{\{BASE\}\}/g, BASE_PATH)
    .replace(/\{\{CONTENT\}\}/g, content);
}
