# React & TypeScript Conventions

These conventions are MANDATORY for all code in this project.

## Component Style

- `export function ComponentName(props: Props)` — named export, not arrow + `FC`
- `type Props = { ... }` — use `type`, not `interface` for props
- `import React from 'react'` — explicit import at top of every `.tsx` file
- Props destructured in function signature, not inside body
- Event handlers prefixed with `handle` — `handleSubmit`, `handleChange`

## TypeScript

- No `any` — use explicit interfaces or generics
- No `@ts-ignore` / `@ts-expect-error` without explanation comment
- Annotate return types on complex or exported functions
- One model per file in `src/models/`

## Styling

- Tailwind CSS only — no inline `style={{}}` unless value is truly dynamic
- No mixing Tailwind with plain CSS classes on same element
- No hardcoded color values — use Tailwind palette
- Responsive via breakpoint prefixes: `sm:` `md:` `lg:`

## State Management

- Typed hooks only: `useAppDispatch`, `useAppSelector` (from `src/store/hooks.ts`)
- Never plain `useDispatch` / `useSelector`
- Server data NOT in Redux — use RTK Query cache or local state
- State mutation only inside `createSlice` reducers

## Date Handling

- `date-fns` for all new code — no new `moment` usage
- Format via `format()` from `date-fns`, not `.toString()` or template strings
- Migrate existing `moment` calls when touching the file

## Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Component | PascalCase | `UserCard.tsx` |
| Hook | camelCase + `use` prefix | `useUserData.ts` |
| Redux slice | camelCase + `Slice` suffix | `authSlice.ts` |
| RTK Query API | camelCase + `Api` suffix | `authApi.ts` |
| Type/Interface | PascalCase | `UserProfile` |
| Event handler | `handle` prefix | `handleSubmit` |

## Forbidden in Committed Code

- `console.log` / `console.warn` / `console.error` (use proper logging or remove)
- Commented-out code blocks
- Unused imports or variables (prefix intentionally unused params with `_`)
