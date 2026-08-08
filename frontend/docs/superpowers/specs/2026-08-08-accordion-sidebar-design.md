# Accordion Sidebar for Business Profile

## Context

The business profile page (`/profile/businesses/:id/...`) has a sidebar with 7 groups of navigation links, each rendered as a separate white card. With 18 total menu items across 7 cards, the sidebar feels cluttered ("на купі"). This redesign consolidates all groups into a single card with accordion behavior — only one group open at a time.

## Design

### Visual Structure

One white card containing all 7 groups. Each group has:
- A clickable header with group label + chevron icon (`ChevronRight` from lucide-react)
- Collapsible list of `NavLink` items inside
- Thin divider (`border-b border-slate-100`) between groups (except last)

### Behavior

- **Accordion**: only one group open at a time. Clicking another closes the current.
- **Auto-expand**: group containing the active route opens automatically via `useLocation()`.
- **Toggle**: clicking an open group's header closes it (all collapsed state allowed).
- **Smooth animation**: CSS Grid `grid-rows-[0fr] → grid-rows-[1fr]` with `transition duration-200`.
- **Chevron rotation**: `rotate-90` when expanded, `transition-transform duration-200`.

### Groups (unchanged from current)

| Group | Items |
|-------|-------|
| Base Data | Base Data, Products, Audiences |
| Generation | Posts, Stories |
| Content Plan | Content Plan, Calendar |
| Creator | Context, Prompts, Gallery, Design |
| Competitors | Competitors, Facebook Ideas, Instagram Ideas, Meta Ads Ideas |
| AI | AI Ideas, AI Photo |
| Trends | Tiktok |

### Styling

- **Group header**: `flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wide`
- **NavLink active**: `bg-blue-100 text-blue-600` (unchanged)
- **NavLink hover**: `hover:bg-blue-50 hover:text-blue-600` (unchanged)
- **Card wrapper**: `rounded-2xl bg-white shadow border border-slate-200 py-2 px-2`

## File Changes

| File | Action |
|------|--------|
| `src/pages/admin/business/:id/SidebarNav.tsx` | **Create** — accordion sidebar component (~90 lines) |
| `src/pages/admin/business/:id/Business.tsx` | **Simplify** — remove 7 tab arrays + 7 card blocks, import `<SidebarNav />` |

### SidebarNav.tsx — Key Implementation Details

1. **Data**: single `sidebarGroups: SidebarGroup[]` array defined outside component (static)
2. **Types**: `SidebarTab = { id: string; title: string; icon: LucideIcon }`, `SidebarGroup = { label: string; tabs: SidebarTab[] }`
3. **State**: `useState<number | null>` for `openGroupIndex`
4. **Route detection**: `useLocation()` → find group index where any tab id matches pathname
5. **Sync**: `useEffect` sets `openGroupIndex` to active group index on pathname change
6. **Animation wrapper per group**: `div.grid.transition-[grid-template-rows].duration-200` with `grid-rows-[0fr]` (closed) / `grid-rows-[1fr]` (open), inner div has `overflow-hidden min-h-0`

### Business.tsx — Changes

- Remove all icon imports except `ArrowLeft`
- Remove all `tabs*` array definitions (lines 28–137)
- Remove all 7 card `div` blocks from aside (lines 157–331)
- Remove `bg-gray-100` from aside className
- Import and render `<SidebarNav />` inside aside

## Verification

1. `npm start` — dev server, navigate to `/profile/businesses/:id/baseData`
2. Verify only Base Data group is expanded (matches active route)
3. Click another group header → it expands, Base Data collapses
4. Click a NavLink inside the expanded group → navigates, group stays open
5. Navigate via URL directly → correct group auto-expands
6. Verify smooth animation on expand/collapse
7. Verify chevron rotates on toggle
8. `npm run build` — no TypeScript errors
