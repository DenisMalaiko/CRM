---
paths:
  - "src/modules/**/dto/**"
  - "src/modules/**/*.dto.ts"
---

# DTO Validation Rules

- Every DTO field must have `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.)
- Nested DTOs use `@ValidateNested()` + `@Type()`
- Array fields use `@IsArray()` + `@ArrayMinSize()` where appropriate
- Optional fields always annotated with `@IsOptional()`
- UUID fields must use `@IsUUID()` — not `@IsString()`
- Required strings need `@IsString()` + `@IsNotEmpty()` — not just `@IsString()`
- `@ApiProperty()` on required fields, `@ApiPropertyOptional()` on optional
- No raw `any` in DTO types — use explicit types or enums
