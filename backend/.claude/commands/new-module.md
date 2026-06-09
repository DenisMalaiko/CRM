Scaffold a new NestJS module named "$ARGUMENTS" following project patterns.

Create these files in `src/modules/$ARGUMENTS/`:

1. `$ARGUMENTS.module.ts` — imports `PrismaModule`, declares controller + service
2. `$ARGUMENTS.controller.ts` — `@ApiTags`, `@UseGuards(JwtAuthGuard)`, `@ResponseMessage()` on each method
3. `$ARGUMENTS.service.ts` — inject `PrismaService`, business logic here
4. `dto/$ARGUMENTS.dto.ts` — `CreateDto` and `UpdateDto` with `class-validator` decorators
5. `entities/$ARGUMENTS.entity.ts` — response shape class with `@ApiProperty()`

Then register the new module in `src/app.module.ts` imports.

Follow the exact patterns from `.claude/agents/backend.md` module/controller/service/DTO templates.
