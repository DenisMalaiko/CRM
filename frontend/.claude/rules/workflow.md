# Frontend Workflow

This workflow is MANDATORY for all frontend tasks. Follow every stage in order.
Skip a stage only if the user explicitly says so.

---

## Pipeline Overview

```
Analyze → Plan (await approval) → frontend → [reviewer + tester] → Document
                                                      ↓ 🔴 Critical
                                               frontend fixes
                                               [reviewer + tester] again
                                               Max 2 retry cycles
                                               After 2 failures → escalate to user
```

---

## Stage 1 — Analyze

Before writing any code:

1. Read the relevant files — component, its imports, related store slice, models
2. Understand the scope — is this a new component, edit, or refactor?
3. Identify which pages or components are affected
4. Check if the task requires:
    - New API data → notify `developer` agent via SendMessage before starting
    - New Redux slice or RTK Query endpoint → plan it as part of the task
    - New route → check `src/router/` and plan the route addition
5. Identify risks — what could break if this change is made?

---

## Stage 2 — Plan

1. Write a plan to `./docs/todo.md` with checkable items:

```md
## [Task name] — [date]

### Plan
- [ ] Read affected files
- [ ] Create / edit component X
- [ ] Update Redux slice Y (if needed)
- [ ] Add route (if needed)
- [ ] Quality gate: reviewer + tester

### Notes
- Any risks or assumptions
```

2. **Show the plan to the user and wait for confirmation before proceeding.**
   Do not start implementation until the user approves.

---

## Stage 3 — Execute (`frontend` agent)

1. Follow the plan step by step
2. Mark each item complete as you go: `- [x]`
3. After each meaningful change — write a one-line summary of what was done and why
4. Follow all conventions from `.claude/rules/react-conventions.md` and `.claude/rules/file-structure.md`

### Agent coordination
- If backend changes are needed → `SendMessage` to `developer` agent with exact requirements
- Do NOT implement backend logic yourself

When implementation is complete → proceed to Stage 4.

---

## Stage 4 — Quality Gate (`reviewer` + `tester` in parallel)

Spawn `reviewer` and `tester` simultaneously. Do not wait for one before starting the other.

### `reviewer` checks:
- TypeScript correctness (no `any`, proper types)
- Component conventions (named function, `type Props`, `import React`)
- React patterns (no `useEffect` for derived state, stable keys, proper memoization)
- Redux usage (typed hooks, no server state in Redux)
- Styling (Tailwind only, no inline styles)
- Code hygiene (no `console.log`, no commented code, no unused imports)
- File placement correctness

### `tester` writes:
- Unit tests for new/modified components
- Hook tests via `renderHook`
- Utility function tests
- Runs `npm test -- --watchAll=false` to verify all pass

### Quality Gate Resolution

| Outcome | Action |
|---------|--------|
| `reviewer` → ✅ PASS, `tester` → ✅ all tests pass | Proceed to Stage 5 |
| `reviewer` → 🟢 Suggestions only | Proceed to Stage 5. Log suggestions in `docs/lessons.md` |
| `reviewer` → 🔴 Critical or 🟡 Important | `frontend` fixes → re-run both `reviewer` + `tester` |
| `tester` → tests fail | `frontend` fixes → re-run both `reviewer` + `tester` |

**Max 2 retry cycles.** If quality gate still fails after 2 fix attempts → stop and escalate to user.

---

## Stage 5 — Document

1. Add a review section to `./docs/todo.md`:

```md
### Review
- [x] reviewer → PASS
- [x] tester → all tests pass
- [x] No regressions found
- Summary: [one sentence what was done]
```

2. If mistakes were made and corrected — update `./docs/lessons.md`:

```md
## [date] — [short title]
**What went wrong:** ...
**What was correct:** ...
**Rule going forward:** ...
```

---

## Quick Reference

| Stage    | Agent(s)               | Blocking?                          |
|----------|------------------------|------------------------------------|
| Analyze  | orchestrator           | No                                 |
| Plan     | orchestrator           | Yes — wait for user approval       |
| Execute  | `frontend`             | No                                 |
| Quality Gate | `reviewer` + `tester` (parallel) | Yes — fix before finishing |
| Document | orchestrator           | No                                 |

**Retry limit: 2 cycles max. After that → escalate to user.**