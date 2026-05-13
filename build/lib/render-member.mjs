// build/lib/render-member.mjs
import { renderShell, esc } from './render-shell.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

export function renderMemberHubs(guides) {
  const roles = [...new Set(guides.map(g => g.role))];
  return roles.map(role => {
    const mine = guides.filter(g => g.role === role).sort((a, b) => a.week - b.week || a.step - b.step);
    const weeks = [...new Set(mine.map(g => g.week))].sort();
    const sample = mine[0];
    const weeksHtml = weeks.map(week => {
      const list = mine.filter(g => g.week === week);
      const items = list.map(g =>
        `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· Step ${g.step}</span></li>`
      ).join('');
      return `<section id="w${week}"><h2>Week ${week} <span class="meta">(${list.length}개)</span></h2><ul class="guide-list">${items}</ul></section>`;
    }).join('');
    const content = `
      <section class="home-hero"><h1>${esc(ROLE_MAP[role].label)} · ${esc(sample.authorName || '-')}</h1><p class="subtitle">${mine.length}개 가이드 · ${weeks.length}개 주차</p></section>
      ${weeksHtml}`;
    return {
      outputPath: `members/${role}.html`,
      html: renderShell({
        title: `${ROLE_MAP[role].label} · Synapse Workflow Guide`,
        pageKind: 'member',
        breadcrumb: `${ROLE_MAP[role].label}`,
        content,
      }),
    };
  });
}
