// build/lib/validate.mjs
export function validateGuides(guides) {
  const failures = [];
  const warnings = [];

  const byOutput = new Map();
  for (const g of guides) {
    if (!byOutput.has(g.outputPath)) byOutput.set(g.outputPath, []);
    byOutput.get(g.outputPath).push(g);
  }
  for (const [path, list] of byOutput) {
    if (list.length > 1) {
      failures.push(`slug collision: ${path} produced by ${list.map(g => g.sourcePath).join(', ')}`);
    }
  }

  const byStepRole = new Map();
  for (const g of guides) {
    const key = `w${g.week}/step${g.step}/${g.role}`;
    if (!byStepRole.has(key)) byStepRole.set(key, []);
    byStepRole.get(key).push(g);
  }
  for (const [key, list] of byStepRole) {
    if (list.length > 1) {
      warnings.push(`same role appears twice in same step (${key}): ${list.map(g => g.sourcePath).join(', ')}`);
    }
  }

  return { failures, warnings };
}
