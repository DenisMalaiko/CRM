# File Placement Rules

When creating new files, follow these placement rules strictly.

| What | Where | Example |
|------|-------|---------|
| Shared component (2+ pages) | `src/components/<name>/` | `src/components/confirmDlg/ConfirmDlg.tsx` |
| Page-local component | `src/pages/<section>/components/<name>/` | `src/pages/admin/components/StatCard.tsx` |
| Custom hook | `src/hooks/` | `src/hooks/useDebounce.ts` |
| TypeScript model/type | `src/models/` | `src/models/Business.ts` |
| Enum | `src/enum/` | `src/enum/UserRole.ts` |
| Static constant | `src/const/` | `src/const/Industries.ts` |
| Redux slice + API | `src/store/<domain>/` | `src/store/auth/authSlice.ts` + `authApi.ts` |
| Utility function | `src/utils/` | `src/utils/validations.ts` |
| Route guard | `src/router/` | `src/router/Guard.tsx` |

## Rules

- One component per file — file name matches component name
- One model/type per file in `src/models/`
- One enum per file in `src/enum/`
- Test files co-located next to source: `MyComponent.test.tsx`
- Redux: one slice file + one API file per domain folder