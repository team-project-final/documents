// build/lib/render-step.mjs
import { renderShell, esc } from './render-shell.mjs';

export function renderStepHubs(guides) {
  const pairs = new Map();
  for (const g of guides) {
    const key = `${g.week}/${g.step}`;
    if (!pairs.has(key)) pairs.set(key, []);
    pairs.get(key).push(g);
  }
  const out = [];
  for (const [key, list] of pairs) {
    const [week, step] = key.split('/').map(Number);
    const items = list.map(g =>
      `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`
    ).join('');
    const content = `
      <section class="home-hero"><h1>Week ${week} · Step ${step}</h1><p class="subtitle">${list.length}개 가이드</p></section>
      <ul class="guide-list">${items}</ul>`;
    out.push({
      outputPath: `w${week}/step${step}/index.html`,
      html: renderShell({
        title: `W${week} Step ${step} · Synapse Workflow Guide`,
        pageKind: 'step',
        breadcrumb: `W${week} · Step ${step}`,
        content,
      }),
    });
  }
  return out;
}
