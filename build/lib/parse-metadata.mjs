// build/lib/parse-metadata.mjs
import { basename, dirname, posix } from 'node:path';
import { slugifyFilename, extractAuthorFromFilename } from './slugify.mjs';

export const ROLE_MAP = {
  'team-lead':           { label: 'Team Lead',     handle: '@team-lead',           track: '인프라/Gateway' },
  'platform-owner':      { label: 'Platform',      handle: '@platform-owner',      track: 'A' },
  'engagement-owner':    { label: 'Engagement',    handle: '@engagement-owner',    track: 'B' },
  'knowledge-owner-1':   { label: 'Knowledge-1',   handle: '@knowledge-owner-1',   track: 'C-1' },
  'knowledge-owner-2':   { label: 'Knowledge-2',   handle: '@knowledge-owner-2',   track: 'C-2' },
  'learning-card-owner': { label: 'Learning Card', handle: '@learning-card-owner', track: 'D-1' },
  'learning-ai-owner':   { label: 'Learning AI',   handle: '@learning-ai-owner',   track: 'D-2' },
  'frontend-owner':      { label: 'Frontend',      handle: null,                   track: '협업' },
};

const FOLDER_PATTERN = /^workflow-w([1-5])-step(\d{1,2})-guide$/;
const FILE_PATTERN   = /^([a-z0-9-]+)__([a-z0-9-]+)-workflow-guide\s*(?:\(([^)]+)\))?\.html$/;
const TITLE_PATTERN  = /<title>\s*(?:WORKFLOW Guide\s*-\s*)?([^<]*?)\s*<\/title>/i;

function toPosix(p) {
  return p.split(/[\\/]/).join('/');
}

export function parseGuide({ rootDir, absPath, html }) {
  const posixPath = toPosix(absPath);
  const folder = basename(dirname(posixPath));
  const file = basename(posixPath);
  const folderMatch = folder.match(FOLDER_PATTERN);
  const fileMatch = file.match(FILE_PATTERN);
  if (!folderMatch || !fileMatch) return null;

  const role = fileMatch[1];
  const roleEntry = ROLE_MAP[role];
  if (!roleEntry) return null;

  const week = Number(folderMatch[1]);
  const step = Number(folderMatch[2]);
  const topicSlug = fileMatch[2];
  const authorName = fileMatch[3] || extractAuthorFromFilename(file) || null;

  const titleMatch = html.match(TITLE_PATTERN);
  const title = (titleMatch && titleMatch[1].trim()) || topicSlug.replace(/-/g, ' ');

  const slugFilename = slugifyFilename(file);
  const outputPath = posix.join(`w${week}`, `step${step}`, slugFilename);

  const sourcePath = toPosix(absPath).replace(toPosix(rootDir) + '/', '');

  return {
    week,
    step,
    role,
    roleLabel: roleEntry.label,
    authorHandle: roleEntry.handle,
    authorName,
    topicSlug,
    title,
    sourcePath,
    outputPath,
    url: '/' + outputPath,
  };
}
