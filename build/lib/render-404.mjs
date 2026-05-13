// build/lib/render-404.mjs
import { renderShell } from './render-shell.mjs';

export function render404() {
  const content = `
    <section class="home-hero">
      <h1>404 — 페이지를 찾을 수 없습니다</h1>
      <p class="subtitle">URL이 변경되었거나 가이드가 이동/삭제되었을 수 있습니다.</p>
      <p><a href="/">홈으로 돌아가기</a></p>
    </section>`;
  return {
    outputPath: '404.html',
    html: renderShell({
      title: '404 · Synapse Workflow Guide',
      pageKind: '404',
      breadcrumb: '404',
      content,
    }),
  };
}
