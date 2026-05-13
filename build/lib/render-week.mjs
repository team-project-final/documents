// build/lib/render-week.mjs
import { renderShell, esc } from './render-shell.mjs';

export function renderWeekHubs(guides) {
  const weeks = [...new Set(guides.map(g => g.week))].sort();
  return weeks.map(week => {
    const weekGuides = guides.filter(g => g.week === week);
    const steps = [...new Set(weekGuides.map(g => g.step))].sort((a, b) => a - b);
    const stepsHtml = steps.map(step => {
      const list = weekGuides.filter(g => g.step === step);
      const items = list.map(g =>
        `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`
      ).join('');
      return `<section><h3><a href="/w${week}/step${step}/">Step ${step}</a> <span class="meta">(${list.length}개)</span></h3><ul class="guide-list">${items}</ul></section>`;
    }).join('');
    const content = `
      <section class="home-hero"><h1>Week ${week}</h1><p class="subtitle">${weekGuides.length}개 가이드 · ${steps.length}개 step</p></section>
      ${stepsHtml}`;
    return {
      outputPath: `w${week}/index.html`,
      html: renderShell({
        title: `Week ${week} · Synapse Workflow Guide`,
        pageKind: 'week',
        breadcrumb: `W${week}`,
        content,
      }),
    };
  });
}
