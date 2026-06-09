---
paths:
  - "src/**/*.ts"
---

# Code Hygiene Rules

- No `console.log` — use NestJS `Logger` instead
- No `any` types — use proper TypeScript types or Prisma-generated types
- No commented-out code blocks
- No unused imports or variables
- Passwords hashed with bcrypt — never stored or returned in plain text
- `StorageModule` must be imported in modules that handle file uploads
- S3 key includes tenant context (agencyId or businessId)
