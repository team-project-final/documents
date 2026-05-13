// build/lib/base-path.mjs
// GitHub Pages가 https://<owner>.github.io/<repo>/ 하위에서 호스팅하므로
// 모든 절대 경로 앞에 base path를 prefix해야 한다. 로컬 preview에서는 빈 값.
export const BASE_PATH = process.env.BASE_PATH || '';
