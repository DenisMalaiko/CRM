---
name: pre-impl-check
description: Verify NestJS backend patterns before implementing a feature or endpoint. Use before writing any new controller, service, DTO, or module code. Checks guards, validation, tenant scoping, response shape, AI patterns, and code hygiene.
allowed-tools: Read Grep Glob
---

## Pre-Implementation Checklist

Full convention details are in `.claude/rules/conventions.md`. This checklist verifies compliance before writing code.

Read the affected controller, service, and DTO files, then verify each item:

- [ ] **Route Protection** — `@UseGuards(JwtAuthGuard)` present; public routes use `@Public()`
- [ ] **DTO Validation** — every field has `class-validator` decorators; optional fields have `@IsOptional()`
- [ ] **Tenant Scoping** — all Prisma queries filter by `agencyId` or `businessId`
- [ ] **Response Shape** — `@ResponseMessage()` on controller method; errors use NestJS exceptions
- [ ] **Architecture** — business logic in service, not controller; new module in `app.module.ts`
- [ ] **AI Integration** *(if applicable)* — `jsonrepair()` before parse; Zod validation on output
- [ ] **File Uploads** *(if applicable)* — `StorageModule` imported; S3 key has tenant context
- [ ] **Code Hygiene** — no `console.log`, no `any`, no commented-out code

Report which items pass, which need attention, and which are not applicable.
