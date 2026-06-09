Audit the NestJS module "$ARGUMENTS" for convention compliance.

1. Find and read all files in `src/modules/$ARGUMENTS/`:
   - `*.module.ts`, `*.controller.ts`, `*.service.ts`
   - `dto/*.ts`, `entities/*.ts`
2. Check against `.claude/rules/conventions.md`:
   - Business logic in service, not controller
   - Every DTO field has `class-validator` decorators
   - Optional fields have `@IsOptional()`
   - All Prisma queries scoped by `agencyId` or `businessId`
   - `@ResponseMessage()` on every controller method
   - `@UseGuards(JwtAuthGuard)` applied
   - No `console.log`, no `any` types, no commented-out code
3. Report findings as: pass / issues found (with file:line references)
