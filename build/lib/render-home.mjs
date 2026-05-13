// build/lib/render-home.mjs
import { ROLE_MAP } from './parse-metadata.mjs';
import { renderShell, esc } from './render-shell.mjs';
import { BASE_PATH } from './base-path.mjs';

const ROLES = Object.keys(ROLE_MAP);
const WEEKS = [1, 2, 3, 4, 5];

function groupByWeekStep(guides) {
  const map = new Map();
  for (const g of guides) {
    const k = `${g.week}/${g.step}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(g);
  }
  return map;
}

function countByRoleWeek(guides, role, week) {
  return guides.filter(g => g.role === role && g.week === week).length;
}

function renderMatrix(guides) {
  const headerCells = WEEKS.map(w => `<th>W${w}</th>`).join('');
  const rows = ROLES.map(role => {
    const cells = WEEKS.map(week => {
      const count = countByRoleWeek(guides, role, week);
      if (count === 0) return `<td class="matrix-cell-empty">—</td>`;
      return `<td class="matrix-cell-has"><a href="${BASE_PATH}/members/${role}.html#w${week}"><strong>${count}</strong><span>guides</span></a></td>`;
    }).join('');
    return `<tr><th scope="row">${esc(ROLE_MAP[role].label)}</th>${cells}</tr>`;
  }).join('');
  return `
    <section class="matrix">
      <h2>전체 진척 매트릭스</h2>
      <table class="matrix-table">
        <thead><tr><th scope="col"></th>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;
}

function renderWeekPanel(guides) {
  const grouped = groupByWeekStep(guides);
  return WEEKS.map(week => {
    const stepsInWeek = [...new Set(guides.filter(g => g.week === week).map(g => g.step))].sort((a, b) => a - b);
    if (stepsInWeek.length === 0) return '';
    const stepsHtml = stepsInWeek.map(step => {
      const list = (grouped.get(`${week}/${step}`) || [])
        .map(g => `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· ${esc(g.roleLabel)} · ${esc(g.authorName || '-')}</span></li>`)
        .join('');
      const count = (grouped.get(`${week}/${step}`) || []).length;
      return `<details><summary>Step ${step} (${count}개 가이드)</summary><ul class="guide-list">${list}</ul></details>`;
    }).join('');
    return `<article class="week-card" id="w${week}"><h3>Week ${week}</h3>${stepsHtml}</article>`;
  }).join('');
}

function renderMemberPanel(guides) {
  return ROLES.map(role => {
    const mine = guides.filter(g => g.role === role);
    if (mine.length === 0) return '';
    const byWeek = WEEKS.map(week => {
      const list = mine.filter(g => g.week === week);
      if (list.length === 0) return '';
      const items = list.map(g => `<li><a href="${g.url}">${esc(g.title)}</a><span class="meta">· Step ${g.step}</span></li>`).join('');
      return `<details id="${role}-w${week}"><summary>W${week} (${list.length}개 가이드)</summary><ul class="guide-list">${items}</ul></details>`;
    }).join('');
    const sample = mine[0];
    return `<article class="member-card" id="${role}"><h3>${esc(ROLE_MAP[role].label)} (${esc(sample.authorName || '-')})</h3>${byWeek}</article>`;
  }).join('');
}

export function renderHome(guides) {
  const totalGuides = guides.length;
  const totalSteps = new Set(guides.map(g => `${g.week}/${g.step}`)).size;
  const content = `
    <section class="home-hero">
      <h1>Synapse 워크플로 가이드</h1>
      <p class="subtitle">5주차 · 8 담당자 · ${totalGuides}개 가이드 · ${totalSteps}개 step</p>
      <input class="hero-search" type="search" placeholder="제목·주제·멤버 검색…" data-search-input aria-label="가이드 검색">
      <div class="home-stats">
        <span>📘 ${totalGuides} 가이드</span>
        <span>🗓️ ${WEEKS.length} 주차</span>
        <span>👥 ${ROLES.length} 담당자</span>
      </div>
    </section>
    ${renderMatrix(guides)}
    <section class="tabs-section" data-tab-host="home">
      <nav class="tabs-nav" role="tablist">
        <button data-tab="week" role="tab" aria-selected="true">주차별</button>
        <button data-tab="member" role="tab" aria-selected="false">멤버별</button>
      </nav>
      <div class="tab-panel" data-tab-panel="week">${renderWeekPanel(guides)}</div>
      <div class="tab-panel" data-tab-panel="member" hidden>${renderMemberPanel(guides)}</div>
    </section>`;
  return renderShell({
    title: 'Synapse Workflow Guide',
    pageKind: 'home',
    breadcrumb: '홈',
    content,
  });
}
