// build/assets/app.js
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function initTabs() {
  $$('[data-tab-host]').forEach(host => {
    const buttons = $$('button[data-tab]', host);
    const panels  = $$('[data-tab-panel]', host);
    const setActive = (key) => {
      buttons.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === key ? 'true' : 'false'));
      panels.forEach(p => { p.hidden = p.dataset.tabPanel !== key; });
      if (host.dataset.tabHost === 'home') {
        history.replaceState(null, '', `#by-${key}`);
      }
    };
    buttons.forEach(b => b.addEventListener('click', () => setActive(b.dataset.tab)));
    const hash = location.hash.replace('#by-', '');
    if (hash === 'week' || hash === 'member') setActive(hash);
  });
}

function getSearchUrl() {
  const meta = document.querySelector('meta[name="search-url"]');
  if (meta && meta.dataset.searchUrl) return meta.dataset.searchUrl;
  const link = document.querySelector('link[rel="prefetch"][href*="search."]');
  if (link) return link.getAttribute('href');
  return null;
}

let fuseInstance = null;
let fuseLoading = null;
async function getFuse() {
  if (fuseInstance) return fuseInstance;
  if (fuseLoading) return fuseLoading;
  fuseLoading = (async () => {
    const url = getSearchUrl();
    if (!url) throw new Error('no search.json url available');
    const res = await fetch(url);
    if (!res.ok) throw new Error('failed to fetch search.json');
    const data = await res.json();
    const fuseUrl = new URL('./fuse.min.mjs', import.meta.url).href;
    const mod = await import(fuseUrl);
    const Fuse = mod.default || mod.Fuse;
    fuseInstance = new Fuse(data.guides, {
      keys: [
        { name: 'title', weight: 2.0 },
        { name: 'topicSlug', weight: 1.5 },
        { name: 'roleLabel', weight: 1.0 },
        { name: 'authorName', weight: 1.0 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
    });
    return fuseInstance;
  })();
  return fuseLoading;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderResults(panel, results) {
  if (results.length === 0) {
    panel.innerHTML = `<p class="search-results-count">검색 결과가 없습니다 — 다른 키워드를 시도하거나 매트릭스를 살펴보세요</p>`;
    return;
  }
  const items = results.slice(0, 20).map(({ item }) => {
    const t = item.title || item.topicSlug;
    return `
      <li role="option" class="search-result">
        <a href="${item.url}">
          <span class="result-title">${escapeHtml(t)}</span>
          <span class="result-meta">
            <span>W${item.week}</span><span>Step ${item.step}</span><span>${escapeHtml(item.roleLabel)} · ${escapeHtml(item.authorName || '-')}</span>
          </span>
        </a>
      </li>`;
  }).join('');
  panel.innerHTML = `<p class="search-results-count">검색 결과 ${results.length}건</p><ul class="search-results-list" role="listbox">${items}</ul>`;
}

function initSearch() {
  const inputs = $$('[data-search-input]');
  if (inputs.length === 0) return;
  const panel = document.createElement('section');
  panel.className = 'search-results-panel';
  panel.hidden = true;
  (document.querySelector('.site-content') || document.querySelector('.guide-body'))?.prepend(panel);

  let prefetched = false;
  let debounceId = null;
  const onInput = async (ev) => {
    const q = ev.target.value.trim();
    inputs.forEach(i => { if (i !== ev.target) i.value = ev.target.value; });
    clearTimeout(debounceId);
    if (q === '') { panel.hidden = true; return; }
    debounceId = setTimeout(async () => {
      try {
        const fuse = await getFuse();
        const results = fuse.search(q);
        renderResults(panel, results);
        panel.hidden = false;
      } catch (e) {
        panel.innerHTML = `<p>검색을 일시적으로 사용할 수 없습니다.</p>`;
        panel.hidden = false;
        console.warn(e);
      }
    }, 150);
  };
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (!prefetched) { prefetched = true; getFuse().catch(() => {}); }
    });
    input.addEventListener('input', onInput);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      inputs[0]?.focus();
    } else if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
});
