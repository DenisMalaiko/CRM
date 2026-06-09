---
name: refactor-component
description: "Refactor an existing React component to match project conventions. Use when: component uses arrow functions, interface for props, missing React import, inline styles, or any anti-patterns from react-conventions rules."
allowed-tools: Read, Edit, Grep, Glob
---

# Refactor Component to Project Conventions

Refactor the component at `$ARGUMENTS` to comply with all project conventions.

## Process

1. **Read** the target component file
2. **Audit** against `.claude/rules/react-conventions.md`:

| Check | Fix |
|-------|-----|
| Arrow function export (`const X = () =>`) | Convert to `export function X()` |
| `interface Props` | Change to `type Props` |
| Missing `import React` | Add explicit import |
| Inline `style={{}}` | Convert to Tailwind classes |
| `useDispatch` / `useSelector` | Replace with `useAppDispatch` / `useAppSelector` |
| `moment()` calls | Migrate to `date-fns` equivalents |
| `console.log` statements | Remove |
| Commented-out code | Remove |
| Unused imports | Remove |

3. **Check file placement** against `.claude/rules/file-structure.md`
4. **Apply fixes** — minimal changes, preserve existing logic
5. **Report** what was changed and why

## Rules

- Do NOT change component logic or behavior — only conventions
- Do NOT add features or refactor business logic
- Do NOT touch code that already complies
- Preserve all existing tests — if changes break tests, fix the tests too