---
paths:
  - "src/modules/**/*.controller.ts"
---

# API Response & Route Protection Rules

## Route Protection
- Protected routes use `@UseGuards(JwtAuthGuard)` (class-level or method-level)
- Use `@Public()` decorator to opt out on public routes
- User payload available via `@Request() req` → `req.user` (id, role, agencyId)

## Response Shape
- Every controller method has `@ResponseMessage('...')` decorator
- All responses wrapped by `ApiResponseInterceptor` into `{ message, data }`
- Errors use NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.) — not raw `throw new Error()`

## Architecture
- Business logic lives in the **service**, not the controller
- Controller only handles: route definition, guards, DTO binding, calling service, return
- New modules must be registered in `app.module.ts` imports
