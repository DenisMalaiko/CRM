# Business Dashboard Page

## Context

The business profile sidebar currently has 7 navigation groups but no overview/dashboard page. The user wants a Dashboard as the first item in the sidebar that shows summary metrics and recent activity for the specific business. Dashboard should be a standalone NavLink above the accordion groups, always visible.

## Design

### Sidebar Placement

Dashboard is rendered as a standalone `NavLink` at the top of SidebarNav, **before** the accordion groups. It is not part of any collapsible group — always visible. When Dashboard is active, no accordion group is forced open.

```
┌──────────────────────┐
│ 📊 Dashboard         │  ← standalone NavLink
│ ───────────────────── │  ← divider
│ ▸ Base Data          │
│ ▸ Generation         │
│ ...                  │
└──────────────────────┘
```

### Page Layout

Two sections inside a white card:

#### 1. Stat Cards (top)

Grid of 6 summary cards using existing RTK Query endpoints:

| Card | Endpoint | Count |
|------|----------|-------|
| Products | `getProducts(businessId)` | `.data.length` |
| Audiences | `getAudiences(businessId)` | `.data.length` |
| Profiles | `getProfiles(businessId)` | `.data.length` |
| Prompts | `getPrompts(businessId)` | `.data.length` |
| Content Plans | `getContentPlans(businessId)` | `.data.length` |
| AI Ideas | `getIdeasAI(businessId)` | `.data.length` |

Each card shows: icon, label, count number. Grid: `grid-cols-3 gap-4` (2 rows of 3). Loading state: show skeleton/dash while fetching.

#### 2. Recent Activity (bottom)

Merge items from the same 6 query results, each tagged with a type label and icon:
- Products → "Product created"
- Audiences → "Audience created"
- Profiles → "Profile created"
- Prompts → "Prompt created"
- Content Plans → "Content plan created"
- AI Ideas → "AI idea generated"

Sort all items by `createdAt` descending, take first 10. Each row shows: type icon, item title/name, relative date (via `date-fns` `formatDistanceToNow`).

Empty state: "No recent activity" message.

### Route

Add `dashboard` sub-route under `/profile/businesses/:businessId/`:
```
<Route path="dashboard" element={<BusinessDashboard />} />
```

### Auto-open behavior

When user navigates to a business, they should land on dashboard. The existing redirect (or lack thereof) for `/profile/businesses/:businessId` should redirect to `/profile/businesses/:businessId/dashboard`.

In SidebarNav, when pathname matches `/dashboard`, `findActiveGroupIndex` returns no match — `openGroupIndex` should be `null` (no group open). Update default from `0` to `null` for this case.

## File Changes

| File | Action |
|------|--------|
| `src/pages/admin/business/:id/components/BusinessDashboard.tsx` | **Create** — dashboard page component |
| `src/pages/admin/business/:id/SidebarNav.tsx` | **Modify** — add Dashboard NavLink before groups, update findActiveGroupIndex default to null |
| `src/App.tsx` | **Modify** — add `dashboard` route + index redirect |

## Verification

1. Navigate to `/profile/businesses/:id/dashboard` — see stat cards + activity feed
2. Sidebar shows Dashboard as first item, highlighted when active
3. No accordion group is forced open when on dashboard
4. Clicking an accordion group works as before
5. Stats show correct counts from existing endpoints
6. Activity feed shows recent items sorted by date
7. `npm run build` passes
