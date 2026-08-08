# Business Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Dashboard page as the first item in the business profile sidebar, showing stat cards (counts) and recent activity feed from existing RTK Query data.

**Architecture:** Dashboard fetches data via existing RTK mutation hooks (same pattern as other business pages: mutation → useEffect → dispatch to Redux). Stat cards read counts from Redux store. Activity feed merges items with `createdAt` from multiple slices, sorted descending, limited to 10.

**Tech Stack:** React 18, TypeScript, Redux Toolkit (mutations + slices), Tailwind CSS, date-fns, lucide-react

## Global Constraints

- Named function exports, `type` not `interface` for props
- `import React from 'react'` at top of every .tsx
- Tailwind only — no inline styles
- No `any`, no `console.log`, no commented code
- `useAppDispatch`, `useAppSelector` from `src/store/hooks.ts`
- `date-fns` for date formatting
- Icons from `lucide-react`

---

### Task 1: Create BusinessDashboard page component

**Files:**
- Create: `src/pages/admin/business/:id/components/Dashboard/BusinessDashboard.tsx`
- Test: `src/pages/admin/business/:id/components/Dashboard/BusinessDashboard.test.tsx`

**Interfaces:**
- Consumes: RTK mutation hooks (`useGetProductsMutation`, `useGetAudiencesMutation`, `useGetProfilesMutation`, `useGetPromptsMutation`), RTK query hooks (`useGetContentPlansQuery`, `useLazyGetIdeasAIQuery`), Redux state slices (`productsModule`, `audienceModule`, `profileModule`, `promptModule`, `contentPlanModule`, `ideaAiModule`), dispatch actions (`setProducts`, `setAudiences`, `setProfiles`, `setPrompts`, `setIdeasAi`)
- Produces: `<BusinessDashboard />` — default export, page component

**Redux store module names (from `src/store/index.ts`):**
- `state.productsModule.products` → `TProduct[] | null`
- `state.audienceModule.audiences` → `TAudience[] | null`
- `state.profileModule.profiles` → `TBusinessProfile[] | null`
- `state.promptModule.prompts` → `TPrompt[] | null`
- `state.contentPlanModule.contentPlans` → `TContentPlan[] | null`
- `state.ideaAiModule.ideasAi` → `TIdeaAI[] | null`

**Mutation/Query hooks (from respective Api files):**
- `useGetProductsMutation` from `src/store/products/productsApi` → param: `string` (businessId)
- `useGetAudiencesMutation` from `src/store/audience/audienceApi` → param: `string` (businessId)
- `useGetProfilesMutation` from `src/store/profile/profileApi` → param: `string` (businessId)
- `useGetPromptsMutation` from `src/store/prompts/promptApi` → param: `string` (businessId)
- `useGetContentPlansQuery` from `src/store/contentPlan/contentPlanApi` → param: `string` (businessId)
- `useLazyGetIdeasAIQuery` from `src/store/ai/ideas/ideaAiApi` → param: `string` (businessId)

**Dispatch actions:**
- `setProducts` from `src/store/products/productsSlice`
- `setAudiences` from `src/store/audience/audienceSlice`
- `setProfiles` from `src/store/profile/profileSlice`
- `setPrompts` from `src/store/prompts/promptSlice`
- `setIdeasAi` from `src/store/ai/ideas/ideaAiSlice`
- Content plans are handled by RTK Query cache (query, not mutation)

**Models with `createdAt` (for activity feed):**
- `TBusinessProfile` — has `name`, `createdAt`
- `TPrompt` — has `name`, `createdAt`
- `TContentPlan` — has `title`, `createdAt`
- `TIdeaAI` — has `title`, `createdAt`

**Models WITHOUT `createdAt` (counts only):**
- `TProduct` — has `name`, NO `createdAt`
- `TAudience` — has `name`, NO `createdAt`

- [ ] **Step 1: Write the test file**

Create `src/pages/admin/business/:id/components/Dashboard/BusinessDashboard.test.tsx`:

```tsx
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import BusinessDashboard from "./BusinessDashboard"

const mockGetProducts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Product 1" }] }) })
const mockGetAudiences = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Audience 1" }] }) })
const mockGetProfiles = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }) })
const mockGetPrompts = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }) })
const mockGetIdeasAI = jest.fn()

jest.mock("../../../../../../store/products/productsApi", () => ({
  useGetProductsMutation: () => [mockGetProducts, { isLoading: false }],
}))
jest.mock("../../../../../../store/audience/audienceApi", () => ({
  useGetAudiencesMutation: () => [mockGetAudiences, { isLoading: false }],
}))
jest.mock("../../../../../../store/profile/profileApi", () => ({
  useGetProfilesMutation: () => [mockGetProfiles, { isLoading: false }],
}))
jest.mock("../../../../../../store/prompts/promptApi", () => ({
  useGetPromptsMutation: () => [mockGetPrompts, { isLoading: false }],
}))
jest.mock("../../../../../../store/contentPlan/contentPlanApi", () => ({
  useGetContentPlansQuery: () => ({ data: { data: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }, isLoading: false }),
}))
jest.mock("../../../../../../store/ai/ideas/ideaAiApi", () => ({
  useLazyGetIdeasAIQuery: () => [mockGetIdeasAI, { data: { data: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }, isLoading: false }],
}))

const mockStore = configureStore({
  reducer: {
    productsModule: () => ({ products: [{ id: "1", name: "Product 1" }] }),
    audienceModule: () => ({ audiences: [{ id: "1", name: "Audience 1" }] }),
    profileModule: () => ({ profiles: [{ id: "1", name: "Profile 1", createdAt: "2026-08-01T00:00:00Z" }] }),
    promptModule: () => ({ prompts: [{ id: "1", name: "Prompt 1", createdAt: "2026-08-02T00:00:00Z" }] }),
    contentPlanModule: () => ({ contentPlans: [{ id: "1", title: "Plan 1", createdAt: "2026-08-03T00:00:00Z" }] }),
    ideaAiModule: () => ({ ideasAi: [{ id: "1", title: "Idea 1", createdAt: "2026-08-04T00:00:00Z" }] }),
  },
})

function renderDashboard() {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={["/profile/businesses/test-id/dashboard"]}>
        <Routes>
          <Route path="/profile/businesses/:businessId/dashboard" element={<BusinessDashboard />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe("BusinessDashboard", () => {
  it("renders stat cards with correct counts", () => {
    renderDashboard()

    expect(screen.getByText("Products")).toBeInTheDocument()
    expect(screen.getByText("Audiences")).toBeInTheDocument()
    expect(screen.getByText("Profiles")).toBeInTheDocument()
    expect(screen.getByText("Prompts")).toBeInTheDocument()
    expect(screen.getByText("Content Plans")).toBeInTheDocument()
    expect(screen.getByText("AI Ideas")).toBeInTheDocument()
  })

  it("renders stat card count values", () => {
    renderDashboard()

    const ones = screen.getAllByText("1")
    expect(ones.length).toBeGreaterThanOrEqual(6)
  })

  it("renders the Recent Activity section", () => {
    renderDashboard()

    expect(screen.getByText("Recent Activity")).toBeInTheDocument()
  })

  it("renders activity items from models with createdAt", () => {
    renderDashboard()

    expect(screen.getByText("Idea 1")).toBeInTheDocument()
    expect(screen.getByText("Plan 1")).toBeInTheDocument()
    expect(screen.getByText("Prompt 1")).toBeInTheDocument()
    expect(screen.getByText("Profile 1")).toBeInTheDocument()
  })

  it("calls mutation hooks on mount with businessId", () => {
    renderDashboard()

    expect(mockGetProducts).toHaveBeenCalledWith("test-id")
    expect(mockGetAudiences).toHaveBeenCalledWith("test-id")
    expect(mockGetProfiles).toHaveBeenCalledWith("test-id")
    expect(mockGetPrompts).toHaveBeenCalledWith("test-id")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Applications/Localhost/CRM/frontend && npx react-scripts test --watchAll=false --testPathPattern="BusinessDashboard"`
Expected: FAIL — module not found

- [ ] **Step 3: Write the component**

Create `src/pages/admin/business/:id/components/Dashboard/BusinessDashboard.tsx`:

```tsx
import React, { useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
  Package,
  Users,
  Layers,
  Wand2,
  CalendarRange,
  Lightbulb,
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks"
import { useGetProductsMutation } from "../../../../../../store/products/productsApi"
import { useGetAudiencesMutation } from "../../../../../../store/audience/audienceApi"
import { useGetProfilesMutation } from "../../../../../../store/profile/profileApi"
import { useGetPromptsMutation } from "../../../../../../store/prompts/promptApi"
import { useGetContentPlansQuery } from "../../../../../../store/contentPlan/contentPlanApi"
import { useLazyGetIdeasAIQuery } from "../../../../../../store/ai/ideas/ideaAiApi"
import { setProducts } from "../../../../../../store/products/productsSlice"
import { setAudiences } from "../../../../../../store/audience/audienceSlice"
import { setProfiles } from "../../../../../../store/profile/profileSlice"
import { setPrompts } from "../../../../../../store/prompts/promptSlice"
import { setIdeasAi } from "../../../../../../store/ai/ideas/ideaAiSlice"
import { ApiResponse } from "../../../../../../models/ApiResponse"
import { TProduct } from "../../../../../../models/Product"
import { TAudience } from "../../../../../../models/Audience"
import { TBusinessProfile } from "../../../../../../models/BusinessProfile"
import { TPrompt } from "../../../../../../models/Prompt"
import { showError } from "../../../../../../utils/showError"

type StatCardProps = {
  icon: LucideIcon
  label: string
  count: number
}

type ActivityItem = {
  id: string
  label: string
  type: string
  createdAt: string | Date
}

function StatCard({ icon: Icon, label, count }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
      <div className="rounded-lg bg-blue-50 p-2">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{count}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function BusinessDashboard() {
  const dispatch = useAppDispatch()
  const { businessId } = useParams<{ businessId: string }>()

  const [getProducts] = useGetProductsMutation()
  const [getAudiences] = useGetAudiencesMutation()
  const [getProfiles] = useGetProfilesMutation()
  const [getPrompts] = useGetPromptsMutation()
  const [getIdeasAI] = useLazyGetIdeasAIQuery()
  useGetContentPlansQuery(businessId!, { skip: !businessId })

  const products = useAppSelector((state) => state.productsModule.products)
  const audiences = useAppSelector((state) => state.audienceModule.audiences)
  const profiles = useAppSelector((state) => state.profileModule.profiles)
  const prompts = useAppSelector((state) => state.promptModule.prompts)
  const contentPlans = useAppSelector((state) => state.contentPlanModule.contentPlans)
  const ideasAi = useAppSelector((state) => state.ideaAiModule.ideasAi)

  useEffect(() => {
    if (!businessId) return

    async function fetchAll() {
      try {
        const [productsRes, audiencesRes, profilesRes, promptsRes] = await Promise.all([
          getProducts(businessId!).unwrap(),
          getAudiences(businessId!).unwrap(),
          getProfiles(businessId!).unwrap(),
          getPrompts(businessId!).unwrap(),
        ])

        if (productsRes?.data) dispatch(setProducts(productsRes.data as TProduct[]))
        if (audiencesRes?.data) dispatch(setAudiences(audiencesRes.data as TAudience[]))
        if (profilesRes?.data) dispatch(setProfiles(profilesRes.data as TBusinessProfile[]))
        if (promptsRes?.data) dispatch(setPrompts(promptsRes.data as TPrompt[]))

        getIdeasAI(businessId!)
      } catch (error) {
        showError(error)
      }
    }

    fetchAll()
  }, [businessId, dispatch])

  const stats: StatCardProps[] = [
    { icon: Package, label: "Products", count: products?.length ?? 0 },
    { icon: Users, label: "Audiences", count: audiences?.length ?? 0 },
    { icon: Layers, label: "Profiles", count: profiles?.length ?? 0 },
    { icon: Wand2, label: "Prompts", count: prompts?.length ?? 0 },
    { icon: CalendarRange, label: "Content Plans", count: contentPlans?.length ?? 0 },
    { icon: Lightbulb, label: "AI Ideas", count: ideasAi?.length ?? 0 },
  ]

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = []

    profiles?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: "Profile created", createdAt: p.createdAt })
    })
    prompts?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: "Prompt created", createdAt: p.createdAt })
    })
    contentPlans?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: "Content plan created", createdAt: p.createdAt })
    })
    ideasAi?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: "AI idea generated", createdAt: p.createdAt })
    })

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }, [profiles, prompts, contentPlans, ideasAi])

  if (!businessId) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.type}</p>
                </div>
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Applications/Localhost/CRM/frontend && npx react-scripts test --watchAll=false --testPathPattern="BusinessDashboard"`
Expected: PASS — all 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/business/:id/components/Dashboard/
git commit -m "feat: add BusinessDashboard page with stat cards and activity feed"
```

---

### Task 2: Add Dashboard to sidebar and routes

**Files:**
- Modify: `src/pages/admin/business/:id/SidebarNav.tsx` — add Dashboard NavLink before groups, update `findActiveGroupIndex` default to `null`
- Modify: `src/App.tsx` — add `dashboard` route + index redirect
- Modify: `src/pages/admin/business/:id/SidebarNav.test.tsx` — add tests for Dashboard link

**Interfaces:**
- Consumes: `BusinessDashboard` component from Task 1
- Produces: Route `/profile/businesses/:businessId/dashboard`, sidebar Dashboard link

- [ ] **Step 1: Update SidebarNav — add Dashboard NavLink and LayoutDashboard icon**

In `src/pages/admin/business/:id/SidebarNav.tsx`:

Add `LayoutDashboard` to lucide-react imports.

Before the `sidebarGroups.map(...)` block (inside the outer card div), add:

```tsx
<NavLink
  to="dashboard"
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`
  }
>
  <LayoutDashboard size={18} />
  Dashboard
</NavLink>
<div className="border-b border-slate-100 my-1" />
```

Update `findActiveGroupIndex` return type to `number | null` and change default return from `0` to `null`:

```ts
function findActiveGroupIndex(pathname: string): number | null {
  // ... same loop ...
  return null
}
```

Update `useState` type to match — already `useState<number | null>`, so it's compatible.

- [ ] **Step 2: Add route and redirect in App.tsx**

In `src/App.tsx`:

Add import at top:
```tsx
import BusinessDashboard from "./pages/admin/business/:id/components/Dashboard/BusinessDashboard"
```

Add `Navigate` to `react-router-dom` imports (if not already imported).

Inside `<Route path="businesses/:businessId" element={<Business />}>`, add as the first child route:
```tsx
<Route index element={<Navigate to="dashboard" replace />} />
<Route path="dashboard" element={<BusinessDashboard />} />
```

The `index` route with `Navigate` ensures that navigating to `/profile/businesses/:id` automatically redirects to `/profile/businesses/:id/dashboard`.

- [ ] **Step 3: Update SidebarNav test**

Add to `SidebarNav.test.tsx`:

```tsx
it('renders Dashboard link before groups', () => {
  renderAt('/dashboard');

  const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
  expect(dashboardLink).toBeInTheDocument();
  expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  expect(dashboardLink).toHaveClass('bg-blue-100');
});

it('does not force-open any accordion group when on dashboard', () => {
  renderAt('/dashboard');

  sidebarGroups.forEach((_, index) => {
    const buttons = screen.getAllByRole('button');
    const accordion = buttons[index].nextElementSibling as HTMLElement;
    expect(accordion).toHaveClass('grid-rows-[0fr]');
  });
});
```

Note: the test accesses `sidebarGroups` — since it's not exported, the test should check behavior: all group accordions should have `grid-rows-[0fr]` class when dashboard is active (no group matches → `findActiveGroupIndex` returns `null` → all closed).

- [ ] **Step 4: Run all tests**

Run: `cd /Applications/Localhost/CRM/frontend && npx react-scripts test --watchAll=false --testPathPattern="SidebarNav|BusinessDashboard"`
Expected: all tests pass

- [ ] **Step 5: TypeScript check**

Run: `cd /Applications/Localhost/CRM/frontend && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/business/:id/SidebarNav.tsx src/pages/admin/business/:id/SidebarNav.test.tsx src/App.tsx
git commit -m "feat: add Dashboard to sidebar and route with auto-redirect"
```
