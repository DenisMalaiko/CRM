# Backend Coding Conventions — Summary

Full rules are split into path-scoped files for token efficiency:

- **DTO Validation** → `rules/dto-validation.md` (scoped to `dto/` files)
- **Prisma & Tenant Scoping** → `rules/prisma-queries.md` (scoped to `*.service.ts` + `prisma/`)
- **AI Integration** → `rules/ai-integration.md` (scoped to `ai/` modules)
- **API Response & Routes** → `rules/api-response.md` (scoped to `*.controller.ts`)
- **Code Hygiene** → `rules/code-hygiene.md` (scoped to all `src/**/*.ts`)

## Quick Reference — Common Pitfalls

| Anti-pattern                                 | Correct approach                                         |
|----------------------------------------------|----------------------------------------------------------|
| Business logic in controllers                | Move to service                                          |
| Missing `@IsOptional()` on optional DTO fields | Always annotate optional fields explicitly             |
| Querying without tenant scoping              | Always filter by `agencyId` or `businessId`             |
| Returning Prisma model directly              | Use entity class or select specific fields              |
| `JSON.parse()` on AI output directly         | `jsonrepair()` first, then parse, then Zod validate     |
| Editing migration files                      | Create a new migration instead                          |
| `any` type in TypeScript                     | Explicit type or Zod-inferred type                      |
| `console.log` left in committed code         | Remove before commit                                    |
