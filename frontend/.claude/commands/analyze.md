Analyze the component or feature at `$ARGUMENTS` and produce a structured report.

## What to Report

### 1. File Overview
- File path, size, last modified
- Exports (components, hooks, types, utils)

### 2. Dependencies
- **Imports** — list all imports grouped by: React, third-party, project internal
- **Imported by** — search the codebase for files that import this module

### 3. State & Data
- Redux usage — which slices, selectors, dispatched actions
- RTK Query — which API endpoints used
- Local state — `useState`, `useReducer` calls
- Props received and their types

### 4. Routing
- Is this component routed? Check `src/router/` for references
- Does it use `useNavigate`, `useParams`, `useSearchParams`?

### 5. Test Coverage
- Does a `.test.tsx` file exist next to this component?
- If yes — how many tests, what do they cover?
- If no — flag as "needs tests"

### 6. Convention Compliance
- Check against `.claude/rules/react-conventions.md`
- Flag any violations: `any` types, `console.log`, inline styles, arrow exports, etc.

## Output Format

Provide a concise markdown report with sections above. Use checkmarks for compliance and warnings for violations.
