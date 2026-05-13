// build/lib/inject-wrapper.mjs
import * as cheerio from 'cheerio';
import { BASE_PATH } from './base-path.mjs';

export function scopeStyleSheet(css) {
  // 콤마/공백 기반 토큰화로 body/header/main/footer 셀렉터를 스코프.
  return css.replace(
    /(^|[}\s,])(body|header|main|footer)(?=[\s,{:])/g,
    (m, pre, sel) => {
      if (sel === 'body') return `${pre}.guide-body`;
      return `${pre}.guide-body ${sel}`;
    },
  );
}

export function injectWrapper(html, guide) {
  const $ = cheerio.load(html, { decodeEntities: false });

  // 1) <style> 내부 셀렉터 스코핑
  $('style').each((_, el) => {
    const raw = $(el).html() || '';
    $(el).html(scopeStyleSheet(raw));
  });

  // 2) <head>에 외부 자산 링크 주입
  const stylesHref = `${BASE_PATH}/assets/styles.css`;
  if ($(`link[href="${stylesHref}"]`).length === 0) {
    $('head').append(`\n  <link rel="stylesheet" href="${stylesHref}">`);
  }
  if ($('link[rel="stylesheet"][href*="fonts.googleapis.com"]').length === 0) {
    $('head').append(
      '\n  <link rel="preconnect" href="https://fonts.googleapis.com">' +
      '\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">'
    );
  }

  // 3) 원본 body 내용을 <main class="guide-body">로 감쌈
  const bodyHtml = $('body').html() || '';
  $('body').empty();

  const breadcrumb = `W${guide.week} · Step ${guide.step} · ${guide.roleLabel}`;
  const titleEscaped = guide.title.replace(/"/g, '&quot;');

  $('body').append(`
    <header class="site-header">
      <a class="site-brand" href="${BASE_PATH}/">Synapse Workflow Guide</a>
      <div class="site-breadcrumb">${breadcrumb}</div>
      <input class="site-search" type="search" placeholder="검색…" aria-label="가이드 검색" data-search-input>
    </header>
    <aside class="site-sidebar" data-sidebar>
      <nav class="site-nav-tabs" role="tablist">
        <button data-tab="week" role="tab" aria-selected="true">주차별</button>
        <button data-tab="member" role="tab" aria-selected="false">멤버별</button>
      </nav>
      <ol class="site-nav-list" data-nav-list></ol>
    </aside>
    <main class="guide-body" data-page-title="${titleEscaped}">${bodyHtml}</main>
    <footer class="site-footer">
      <p>&copy; Synapse Workflow Guide · <a href="https://github.com/team-project-final/documents">source</a></p>
    </footer>
    <script src="/assets/app.js" type="module"></script>
  `);

  return $.html();
}
