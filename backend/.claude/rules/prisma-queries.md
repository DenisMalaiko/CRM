---
paths:
  - "src/modules/**/*.service.ts"
  - "prisma/**"
---

# Prisma & Tenant Scoping Rules

## Tenant Scoping (Critical)
- All Prisma queries filter by `agencyId` or `businessId`
- No unscoped queries unless explicitly justified with a comment (e.g., cron jobs)
- `findMany` / `findFirst` / `update` / `delete` include tenant filter in `where`

## Query Patterns
- Use `select` to avoid over-fetching on large models
- Passwords never returned in query results — always excluded via `select`
- Multi-table writes use `prisma.$transaction()` — not sequential awaits
- Use `findUnique` where unique constraint exists — not `findFirst`
- Relations loaded only when needed — no unnecessary `include`

## Migrations
- After schema change: `npx prisma generate`, then create migration
- Always use descriptive migration name: `npx prisma migrate dev --name add_field_to_model`
- Never edit existing migration files — create a new one instead
