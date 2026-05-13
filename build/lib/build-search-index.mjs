// build/lib/build-search-index.mjs
import { createHash } from 'node:crypto';

export function buildSearchIndex(guides, { sha, time } = {}) {
  const entries = guides.map(g => ({
    title: g.title,
    topicSlug: g.topicSlug,
    roleLabel: g.roleLabel,
    authorName: g.authorName,
    week: g.week,
    step: g.step,
    url: g.url,
  }));
  const buildSha = (sha && sha.slice(0, 7)) || createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 7);
  const buildTime = time || new Date().toISOString();
  const payload = { buildSha, buildTime, guides: entries };
  const content = JSON.stringify(payload, null, 2);
  return {
    outputPath: `assets/search.${buildSha}.json`,
    content,
    fingerprint: buildSha,
  };
}
