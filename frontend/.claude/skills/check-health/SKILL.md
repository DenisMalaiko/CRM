---
name: check-health
description: "Run full project health check: TypeScript compilation, ESLint, and Jest tests. Use before committing, after large refactors, or to verify project integrity."
allowed-tools: Bash, Read
---

# Project Health Check

Run all three quality checks and produce a summary report.

## Process

Run all checks in parallel:

1. **TypeScript** — `npx tsc --noEmit --pretty 2>&1 | head -40`
2. **ESLint** — `npx eslint src/ --ext .ts,.tsx --max-warnings 0 --format compact 2>&1 | tail -20`
3. **Tests** — `npm test -- --watchAll=false --ci 2>&1 | tail -30`

## Report Format

After all checks complete, produce a summary:

```
## Health Check — [date]

| Check      | Status | Details          |
|------------|--------|------------------|
| TypeScript | ✅/❌  | X error(s)       |
| ESLint     | ✅/❌  | X warning(s)     |
| Tests      | ✅/❌  | X passed, Y failed |

### Issues (if any)
- [file:line] error description
```

## Rules

- Run all three checks even if one fails — report everything at once
- Do NOT fix anything — only report. User decides next steps
- Keep output concise — max 5 most important issues per category
- If all checks pass, report a single line: "All checks passed"