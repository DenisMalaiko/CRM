# Backend Workflow

This workflow is MANDATORY for all backend tasks. Follow every stage in order.
Skip a stage only if the user explicitly says so.

---

## Pipeline Overview

```
Analyze → Plan (await approval) → developer → [backend-reviewer + backend-tester] → Document
                                                             ↓ 🔴 Critical
                                                      developer fixes
                                                      backend-reviewer re-checks (tester does NOT re-run)
                                                      Max 2 retry cycles
                                                      After 2 failures → escalate to user
```

---

## Stage 1 — Analyze

Before writing any code:

1. Read the relevant files — module, service, controller, related DTOs, Prisma schema
2. Understand the scope — new module, new endpoint, schema change, or refactor?
3. Check if the task requires a Prisma migration — if yes, state it in the plan explicitly
4. Check if the task requires:
    - New Prisma model or field → migration needed, plan it as a separate step
    - New module → check `app.module.ts` to plan the import
    - AI integration → identify which provider (OpenAI / Vertex / LangChain) and prompt location
    - S3 upload → check `StorageModule` is imported in the target module
5. Identify risks — what existing queries or modules could be affected?

---

## Stage 2 — Plan

1. Write a plan to `./docs/todo.md` with checkable items:

```md
## [Task name] — [date]

### Plan
- [ ] Read affected files
- [ ] Update Prisma schema (if needed)
- [ ] Run migration: `npx prisma migrate dev --name <descriptive-name>` (if needed)
- [ ] Create / update module X
- [ ] Create / update service X
- [ ] Create / update controller X
- [ ] Create / update DTOs
- [ ] Quality gate: backend-reviewer + backend-tester

### Notes
- Migration needed: yes / no
- Affected modules: ...
- Any risks or assumptions
```

2. **Show the plan to the user and wait for confirmation before proceeding.**
   Do not start implementation until the user approves.
   If migration is needed — explicitly confirm with user before running it.

---

## Stage 3 — Execute (`developer` agent)

1. Follow the plan step by step
2. Mark each item complete as you go: `- [x]`
3. After each meaningful change — write a one-line summary of what was done and why
4. Follow all conventions from `.claude/agents/developer.md`:
    - Business logic in service — not controller
    - Every DTO field has `class-validator` decorators
    - All Prisma queries scoped by `agencyId` or `businessId`
    - `@ResponseMessage()` on every controller method
    - `jsonrepair()` before `JSON.parse()` on any AI output
    - No `console.log` in committed code

### Migration rules
- Run migration only after schema change is confirmed in plan
- Always use descriptive migration name: `npx prisma migrate dev --name add_field_to_model`
- Never edit existing migration files — create a new one instead

### Agent coordination
- If frontend changes are needed → `SendMessage` to `frontend` agent with exact requirements
- Do NOT implement frontend logic yourself

When implementation is complete → proceed to Stage 4.

---

## Stage 4 — Quality Gate

### First run — `backend-reviewer` + `backend-tester` in parallel

Spawn both agents simultaneously on first run.

**`backend-reviewer` checks:**
- NestJS architecture (logic in service, not controller)
- DTO validation completeness (`class-validator` decorators)
- Prisma query correctness and tenant scoping
- Security (JWT guard, no hardcoded secrets, no plain passwords)
- TypeScript correctness (no `any`, proper return types)
- AI integration patterns (`jsonrepair` + Zod validation)
- Response shape (`@ResponseMessage`, NestJS exceptions)
- Code hygiene (no `console.log`, no commented code)

**`backend-tester` writes:**
- Integration tests using `@nestjs/testing` with real modules
- Controller tests via `supertest` with `JwtAuthGuard` bypassed
- Happy path, not-found, validation, and tenant isolation scenarios
- AI service tests: valid JSON, malformed JSON, Zod failure
- Runs `npm test -- --watchAll=false` to verify all pass

### Quality Gate Resolution

| Outcome | Action |
|---------|--------|
| `backend-reviewer` → ✅ PASS, `backend-tester` → ✅ all tests pass | Proceed to Stage 5 |
| `backend-reviewer` → 🟢 Suggestions only | Proceed to Stage 5. Log suggestions in `docs/lessons.md` |
| `backend-reviewer` → 🔴 Critical or 🟡 Important | `developer` fixes → **only `backend-reviewer` re-runs** |
| `backend-tester` → tests fail | `developer` fixes → **only `backend-tester` re-runs** |
| Both fail | `developer` fixes → both re-run |

**Max 2 retry cycles.** If quality gate still fails after 2 fix attempts → stop and escalate to user.

> **Note:** On retry after a reviewer finding — `backend-tester` does NOT re-run unless tests were also broken. Tests written in the first pass remain valid unless the fix changes behavior.

---

## Stage 5 — Document

1. Add a review section to `./docs/todo.md`:

```md
### Review
- [x] backend-reviewer → PASS
- [x] backend-tester → all tests pass
- [x] Migration applied (if needed)
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

| Stage        | Agent(s)                                              | Blocking?                          |
|--------------|-------------------------------------------------------|------------------------------------|
| Analyze      | orchestrator                                          | No                                 |
| Plan         | orchestrator                                          | Yes — wait for user approval       |
| Execute      | `developer`                                           | No                                 |
| Quality Gate | `backend-reviewer` + `backend-tester` (parallel)      | Yes — fix before finishing         |
| Retry        | `backend-reviewer` only (unless tests also broken)    | Yes                                |
| Document     | orchestrator                                          | No                                 |

**Retry limit: 2 cycles max. After that → escalate to user.**