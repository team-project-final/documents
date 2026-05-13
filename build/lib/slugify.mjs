// build/lib/slugify.mjs
const TRAILING_PARENS = /\(([^)]+)\)\.html$/;

export function slugifyFilename(filename) {
  return filename.replace(TRAILING_PARENS, '.html');
}

export function extractAuthorFromFilename(filename) {
  const match = filename.match(TRAILING_PARENS);
  return match ? match[1] : null;
}
