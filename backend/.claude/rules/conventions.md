# Backend Coding Conventions

These rules apply to all backend code. Loaded automatically into every session.

## Route Protection

- Protected routes use `@UseGuards(JwtAuthGuard)` (class-level or method-level)
- Use `@Public()` decorator to opt out on public routes
- User payload available via `@Request() req` → `req.user` (id, role, agencyId)

## DTO Validation

- Every DTO field must have `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.)
- Nested DTOs use `@ValidateNested()` + `@Type()`
- Array fields use `@IsArray()` + `@ArrayMinSize()` where appropriate
- Optional fields always annotated with `@IsOptional()`

## Tenant Scoping

- All Prisma queries filter by `agencyId` or `businessId`
- No unscoped queries unless explicitly justified with a comment (e.g., cron jobs)
- `findMany` / `findFirst` / `update` / `delete` include tenant filter in `where`

## Response Shape

- Every controller method has `@ResponseMessage('...')` decorator
- All responses wrapped by `ApiResponseInterceptor` into `{ message, data }`
- Errors use NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.) — not raw `throw new Error()`

## Architecture

- Business logic lives in the **service**, not the controller
- Controller only handles: route definition, guards, DTO binding, calling service, return
- New modules must be registered in `app.module.ts` imports

## AI Integration

- `jsonrepair()` before `JSON.parse()` on any AI-generated output
- Zod schema validation on parsed AI responses
- Prompts in `src/modules/ai/prompts/` as separate files per content type — not inline strings
- Never trust raw AI output — always validate

## File Uploads

- `StorageModule` must be imported in the target module
- S3 key includes tenant context (agencyId or businessId)

## Code Hygiene

- No `console.log` — use NestJS `Logger` instead
- No `any` types — use proper TypeScript types or Prisma-generated types
- No commented-out code blocks
- Passwords hashed with bcrypt — never stored or returned in plain text

## Common Pitfalls

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
