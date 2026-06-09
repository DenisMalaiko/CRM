---
name: debug-api
description: Systematic API debugging workflow. Use when an API endpoint returns errors, unexpected data, or behaves incorrectly. Traces the full request lifecycle from controller to database.
allowed-tools: Read Grep Glob Bash
---

## API Debugging Checklist

### Step 1 — Reproduce
- [ ] Identify the failing endpoint (method + path)
- [ ] Determine the error: HTTP status code, error message, unexpected behavior
- [ ] Check if it's consistent or intermittent

### Step 2 — Trace the request flow
- [ ] Read the **controller method** — check route decorator, guards, DTO binding
- [ ] Read the **service method** — check business logic, Prisma queries
- [ ] Read the **DTO** — check validation rules match the request payload
- [ ] Check **module imports** — is everything registered and imported?

### Step 3 — Check database layer
- [ ] Read the Prisma query in the service method
- [ ] Verify tenant scoping (`agencyId`/`businessId` in `where`)
- [ ] Check if the queried model/field exists in `prisma/schema.prisma`
- [ ] Look for missing `include` or `select` that could cause null fields

### Step 4 — Check common failure points
- [ ] **400 Bad Request** → DTO validation failing. Check `class-validator` decorators match payload
- [ ] **401 Unauthorized** → JWT guard. Check token, check `@Public()` if needed
- [ ] **404 Not Found** → Entity doesn't exist or tenant scoping is wrong
- [ ] **500 Internal Server Error** → Unhandled exception in service. Check for null access, missing await, Prisma error
- [ ] **AI endpoints** → Check `jsonrepair()` + Zod validation on AI response

### Step 5 — Isolate the root cause
- [ ] Add temporary `Logger.debug()` calls at key points (remove after fix)
- [ ] Check if the issue is in data (DB), logic (service), or validation (DTO)
- [ ] Verify with a minimal test case

### Step 6 — Fix and verify
- [ ] Apply the fix in the correct layer (service for logic, DTO for validation, etc.)
- [ ] Run `npm run build` — no errors
- [ ] Test the endpoint to confirm the fix
- [ ] Remove any temporary debug logging
