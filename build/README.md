# build/

Static-site builder for the `workflow-guide` deploy target.

## Usage

```bash
npm ci
npm run validate    # PR 전 빠른 검증
npm run build       # dist/ 생성
npm run preview     # http://localhost:3000
npm test            # unit tests
```

See [the design spec](../docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md) for full details.
