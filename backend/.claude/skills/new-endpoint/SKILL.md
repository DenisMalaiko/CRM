---
name: new-endpoint
description: Step-by-step guide for creating a new REST endpoint following project patterns. Use when adding a new route to an existing or new module. Ensures DTO, controller method, service method, and entity are all created correctly.
allowed-tools: Read Grep Glob Edit Write Bash
---

## New Endpoint Checklist

Create a new REST endpoint following the project's NestJS patterns.

### Step 1 — Understand the endpoint
- [ ] Identify: HTTP method, route path, request body/params, response shape
- [ ] Determine: which module this belongs to (existing or new)

### Step 2 — DTO (if request has a body)
Create/update `src/modules/<module>/dto/<module>.dto.ts`:
- [ ] Add DTO class with `class-validator` decorators on every field
- [ ] `@IsOptional()` on optional fields
- [ ] `@IsUUID()` on UUID fields (not `@IsString()`)
- [ ] `@ApiProperty()` / `@ApiPropertyOptional()` for Swagger

### Step 3 — Entity (response shape)
Create/update `src/modules/<module>/entities/<module>.entity.ts`:
- [ ] Define response class with `@ApiProperty()` on each field
- [ ] Match Prisma model shape (only selected fields)

### Step 4 — Service method
Add to `src/modules/<module>/<module>.service.ts`:
- [ ] All business logic here — not in controller
- [ ] Prisma query scoped by `agencyId` or `businessId`
- [ ] Use `select` to avoid over-fetching
- [ ] Return typed result (not raw Prisma model)

### Step 5 — Controller method
Add to `src/modules/<module>/<module>.controller.ts`:
- [ ] `@Get()` / `@Post()` / `@Patch()` / `@Delete()` decorator
- [ ] `@ResponseMessage('...')` decorator
- [ ] `@UseGuards(JwtAuthGuard)` (if not class-level)
- [ ] Swagger decorators: `@ApiOperation()`, `@ApiResponse()`
- [ ] Extract `req.user` for tenant context
- [ ] Call service method and return result

### Step 6 — Module registration
- [ ] If new module: register in `src/app.module.ts` imports
- [ ] If service needed by others: add to module `exports`

### Step 7 — Verify
- [ ] `npm run build` — no TypeScript errors
- [ ] Check Swagger at `/docs` — endpoint visible with correct schema
