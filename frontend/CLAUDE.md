# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server on port 3000
npm run build      # Production build
npm test           # Jest tests (watch mode)
```

No custom lint script — ESLint runs via `react-scripts` using the `react-app` preset.

## Architecture

**Stack:** React 18 + TypeScript, React Router v6, Redux Toolkit + RTK Query, Tailwind CSS, Create React App.

**Environment variables:**
- `REACT_APP_API` — backend base URL (localhost:4000 in dev, production IP in prod)
- `REACT_APP_SECRET_ADMIN` — admin secret key

### Routing

Three route groups, protected by route guards in `src/router/`:
- Public: `/`, `/signIn`, `/signUp`
- Admin: `/admin/signIn`, `/admin/signUp`, `/admin/**`
- Authenticated user: `/profile/**` (guarded by `Guard`)
  - Business sub-routes split into context (`baseData`, `profiles`, `products`, `audiences`) and generation (`posts`, `stories`, `prompts`, `gallery`, `designSystem`) and management (`competitors`, `ideas`, `ideasAI`, `trends`, `settings`)

### State & API Layer

Redux store lives in `src/store/` with one slice + RTK Query API file per feature (e.g. `businessesSlice.ts` + `businessesApi.ts`). All API calls go through a shared `fetchBaseQuery` base configured in `src/store/api/` with:
- Bearer token auth injected from Redux state
- Automatic token refresh on 401 (queues retries, logs out on second failure)
- Toast notifications on 429 rate-limit responses

### Key Directories

| Path | Purpose |
|------|---------|
| `src/pages/` | Route-level page components (`auth/`, `admin/`, `adminSuper/`, `home/`) |
| `src/components/` | Shared UI components (dialogs, sliders, header, etc.) |
| `src/store/` | Redux slices and RTK Query API definitions per feature |
| `src/models/` | TypeScript interfaces for all domain objects |
| `src/hooks/` | Custom hooks (`useForm`, `usePagination`, etc.) |
| `src/enum/` | Enums (`UserRole`, `BusinessStatus`, etc.) |
| `src/const/` | Static constants (industries, languages, geo, ads) |
| `src/utils/` | Pure helper functions (validation, error formatting) |


# Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.


# Task Management

1. **Plan First**: Write plan to `./docs/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `./docs/todo.md`
6. **Capture Lessons**: Update `./docs/lessons.md` after corrections


# Agent Dispatch (MANDATORY)

- **ALWAYS** follow the agent pipeline defined in `.claude/rules/workflow.md`
- **ALWAYS** run independent pipeline steps in parallel (e.g., Security Scanner + QA + Tester can run simultaneously after Developer completes)
- **ALWAYS** autonomously determine which agents from `.claude/agents/` should execute each part of the user's task — do NOT ask the user which agent to use

- **Available agents**:
  `frontend`, `reviewer`, `tester`
- For every non-trivial task:
    **analyze → select agents → dispatch in parallel where possible → collect results → verify**