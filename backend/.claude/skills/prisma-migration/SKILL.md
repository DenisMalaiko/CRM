---
name: prisma-migration
description: Safe Prisma migration workflow. Use when changing the database schema — adding models, fields, relations, or enums. Ensures correct order of operations and prevents common migration pitfalls.
allowed-tools: Read Grep Glob Edit Write Bash
---

## Prisma Migration Checklist

### Step 1 — Plan the change
- [ ] Read current `prisma/schema.prisma`
- [ ] Identify what changes are needed (new model, field, relation, enum)
- [ ] Check if change affects existing data (breaking vs additive)
- [ ] If removing a field: confirm no code references it (`Grep` for field name)

### Step 2 — Edit schema
- [ ] Modify `prisma/schema.prisma`
- [ ] Validate syntax: `npx prisma validate`
- [ ] If adding a required field to existing model: add `@default()` or make optional first

### Step 3 — Generate client
- [ ] Run `npx prisma generate` to update the Prisma client types
- [ ] Verify no TypeScript errors: `npm run build`

### Step 4 — Create migration
- [ ] Run `npx prisma migrate dev --name <descriptive-name>`
  - Name format: `add_<thing>_to_<model>`, `create_<model>_table`, `remove_<field>_from_<model>`
- [ ] Check generated SQL in `prisma/migrations/` — verify it does what you expect
- [ ] Never edit existing migration files — create a new one instead

### Step 5 — Update code
- [ ] Update DTOs if new fields are exposed via API
- [ ] Update entities/response shapes
- [ ] Update service queries to include/exclude new fields
- [ ] Update `select` clauses where needed

### Step 6 — Verify
- [ ] `npm run build` — no errors
- [ ] `npx prisma migrate status` — no pending migrations
- [ ] Test affected endpoints manually or via tests

### Common Pitfalls
| Pitfall | Fix |
|---------|-----|
| Editing existing migration | Create new migration instead |
| Missing `@default()` on required field | Add default or make optional |
| Forgot `npx prisma generate` | Always run after schema change |
| Migration name is vague | Use descriptive name: `add_status_to_competitor` |
