# Facebook Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automated Facebook page data fetching (followers/likes via Apify) and display it on the dashboard's Facebook tab with a Fetch button.

**Architecture:** Mirror the Instagram report pipeline: `FacebookService.fetchDetails()` → `BusinessService.fetchFacebookReport()` → `POST /fetch` endpoint → RTK Query mutation → Dashboard UI. Reuse existing `ApifyService`, `FacebookModule`, and dashboard patterns.

**Tech Stack:** NestJS, Prisma, Apify (`apify/facebook-pages-scraper`), React, Redux Toolkit / RTK Query, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-08-17-facebook-dashboard-design.md`

## Global Constraints

- Backend: NestJS with Prisma ORM, all endpoints guarded by `JwtAuthGuard`
- Frontend: React 18 + TypeScript, RTK Query for API, Tailwind CSS for styling
- Named function exports, `type` (not `interface`) for props, `import React` in every `.tsx`
- No `any`, no `console.log`, no commented-out code
- Event handlers prefixed with `handle`

---

### Task 1: Prisma Schema — Add `likes` to FacebookReport

**Files:**
- Modify: `backend/prisma/schema.prisma:65-72`

**Interfaces:**
- Produces: `FacebookReport` model with `likes Int @default(0)` field

- [ ] **Step 1: Add `likes` field to FacebookReport model**

In `backend/prisma/schema.prisma`, add `likes` field after `posts`:

```prisma
model FacebookReport {
  id         String   @id @default(uuid())
  businessId String   @unique
  followers  Int      @default(0)
  posts      Int      @default(0)
  likes      Int      @default(0)
  fetchedAt  DateTime @default(now())
  business   Business @relation(fields: [businessId], references: [id])
}
```

- [ ] **Step 2: Run migration**

```bash
cd /Applications/Localhost/CRM/backend
npx prisma migrate dev --name add-likes-to-facebook-report
```

- [ ] **Step 3: Verify Prisma client is regenerated**

```bash
cd /Applications/Localhost/CRM/backend
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add likes field to FacebookReport Prisma model"
```

---

### Task 2: Backend — FacebookService.fetchDetails() + Entity Type

**Files:**
- Modify: `backend/src/modules/facebook/facebook.service.ts:1-8` (add method)
- Modify: `backend/src/modules/business/entities/business.entity.ts:31-37` (add `likes` to type)

**Interfaces:**
- Consumes: `ApifyService.runActor<T>(actor: string, input: any): Promise<T[]>` (already exists)
- Produces: `FacebookService.fetchDetails(pageUrl: string): Promise<{ followers: number; likes: number }>`

- [ ] **Step 1: Add `likes` to `TFacebookReport` backend entity**

In `backend/src/modules/business/entities/business.entity.ts`, update the type:

```typescript
export type TFacebookReport = {
  id: string;
  businessId: string;
  followers: number;
  posts: number;
  likes: number;
  fetchedAt: Date;
}
```

- [ ] **Step 2: Add `fetchDetails` method to FacebookService**

In `backend/src/modules/facebook/facebook.service.ts`, add after the constructor (line 8):

```typescript
async fetchDetails(pageUrl: string): Promise<{ followers: number; likes: number }> {
  const results = await this.apify.runActor<any>('apify/facebook-pages-scraper', {
    startUrls: [{ url: pageUrl }],
  });

  const page = results[0];
  return {
    followers: page?.followers ?? 0,
    likes: page?.likes ?? 0,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/modules/facebook/facebook.service.ts backend/src/modules/business/entities/business.entity.ts
git commit -m "feat: add FacebookService.fetchDetails() using Apify pages scraper"
```

---

### Task 3: Backend — BusinessService.fetchFacebookReport() + Controller + Module

**Files:**
- Modify: `backend/src/modules/business/business.service.ts:1-11` (add import + inject FacebookService, add method)
- Modify: `backend/src/modules/business/business.controller.ts:39-43` (add fetch endpoint)
- Modify: `backend/src/modules/business/business.module.ts:1-12` (add FacebookModule import)

**Interfaces:**
- Consumes: `FacebookService.fetchDetails(pageUrl: string): Promise<{ followers: number; likes: number }>` (Task 2)
- Produces: `POST /business/:id/facebook-report/fetch` endpoint returning `TFacebookReport`

- [ ] **Step 1: Add `FacebookModule` import to `BusinessModule`**

In `backend/src/modules/business/business.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { AuthModule } from "../auth/auth.module";
import { InstagramModule } from "../instagram/instagram.module";
import { FacebookModule } from "../facebook/facebook.module";

@Module({
  imports: [AuthModule, InstagramModule, FacebookModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
```

- [ ] **Step 2: Inject `FacebookService` in `BusinessService` and add `fetchFacebookReport`**

In `backend/src/modules/business/business.service.ts`:

Update import line 4:
```typescript
import { FacebookService } from "../facebook/facebook.service";
```

Update constructor (lines 8-11):
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly instagramService: InstagramService,
  private readonly facebookService: FacebookService,
) {}
```

Update `upsertFacebookReport` signature to include `likes` (line 139):
```typescript
async upsertFacebookReport(businessId: string, data: { followers: number; posts: number; likes?: number }): Promise<TFacebookReport> {
```

Add new method after `upsertFacebookReport` (after line 145):
```typescript
async fetchFacebookReport(businessId: string): Promise<TFacebookReport> {
  const business = await this.prisma.business.findUnique({
    where: { id: businessId },
    select: { facebookLink: true },
  });

  if (!business?.facebookLink) {
    throw new BadRequestException('Business has no Facebook link configured');
  }

  const details = await this.facebookService.fetchDetails(business.facebookLink);

  return this.upsertFacebookReport(businessId, { ...details, posts: 0 });
}
```

- [ ] **Step 3: Add fetch endpoint to `BusinessController`**

In `backend/src/modules/business/business.controller.ts`, add after the existing `upsertFacebookReport` endpoint (after line 43):

```typescript
@Post("/:id/facebook-report/fetch")
@ResponseMessage('Facebook report fetched!')
fetchFacebookReport(@Param() { id }: BusinessIdParamDto) {
  return this.businessService.fetchFacebookReport(id);
}
```

- [ ] **Step 4: Verify backend compiles**

```bash
cd /Applications/Localhost/CRM/backend
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/business/business.service.ts backend/src/modules/business/business.controller.ts backend/src/modules/business/business.module.ts
git commit -m "feat: add POST /facebook-report/fetch endpoint with auto-fetch via Apify"
```

---

### Task 4: Frontend — RTK Query Mutation + Model Update + Dashboard UI

**Files:**
- Modify: `frontend/src/models/Business.ts:43-49` (add `likes` to TFacebookReport)
- Modify: `frontend/src/store/businesses/businessesApi.ts:83-97` (add mutation + export)
- Modify: `frontend/src/pages/admin/business/components/Dashboard/BusinessDashboard.tsx:7,79,83,245-252` (add fetch button + handler)

**Interfaces:**
- Consumes: `POST /business/:id/facebook-report/fetch` (Task 3)
- Produces: `useFetchFacebookReportMutation` hook, updated Facebook tab UI

- [ ] **Step 1: Add `likes` to frontend `TFacebookReport` model**

In `frontend/src/models/Business.ts`, update:

```typescript
export type TFacebookReport = {
  id: string;
  businessId: string;
  followers: number;
  posts: number;
  likes: number;
  fetchedAt: string;
}
```

- [ ] **Step 2: Add `useFetchFacebookReportMutation` to RTK Query**

In `frontend/src/store/businesses/businessesApi.ts`, add new endpoint after `fetchInstagramReport` (after line 83):

```typescript
fetchFacebookReport: builder.mutation<ApiResponse<TFacebookReport>, string>({
  query: (businessId: string) => ({
    url: `/business/${businessId}/facebook-report/fetch`,
    method: "POST",
  })
}),
```

Update the exports (line 88-97) to include the new hook:

```typescript
export const {
  useGetBusinessesMutation,
  useGetBusinessMutation,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useGetFacebookReportMutation,
  useGetInstagramReportMutation,
  useFetchInstagramReportMutation,
  useFetchFacebookReportMutation,
} = businessesApi;
```

- [ ] **Step 3: Update `BusinessDashboard.tsx` — import + hook + state + handler**

In the import line 7, add `useFetchFacebookReportMutation`:
```typescript
import { useGetFacebookReportMutation, useGetInstagramReportMutation, useFetchInstagramReportMutation, useFetchFacebookReportMutation } from "../../../../../store/businesses/businessesApi"
```

After line 81 (`[fetchCompetitorInstagramReport]`), add:
```typescript
const [fetchFacebookReport] = useFetchFacebookReportMutation()
```

After line 83 (`isFetchingIg` state), add:
```typescript
const [isFetchingFb, setIsFetchingFb] = useState(false)
```

- [ ] **Step 4: Add `handleFetchFacebook` handler**

After `handleFetchInstagram` (after line 161), add:

```typescript
const handleFetchFacebook = async () => {
  if (!businessId) return
  setIsFetchingFb(true)
  try {
    const response = await fetchFacebookReport(businessId).unwrap()
    if (response?.data) {
      setFbReport(response.data)
      toast.success(response.message)
    }
  } catch (error) {
    showError(error)
  } finally {
    setIsFetchingFb(false)
  }
}
```

- [ ] **Step 5: Update Facebook tab JSX**

Replace the current Facebook tab section (lines 245-253) with:

```tsx
{activeTab === "facebook" && (
  <div className="space-y-6">
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleFetchFacebook}
        disabled={isFetchingFb}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {isFetchingFb ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Fetching...
          </>
        ) : (
          "Fetch Facebook Data"
        )}
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <StatCard icon={Users} label="Followers" count={fbReport?.followers ?? 0} />
      <StatCard icon={FileText} label="Posts" count={fbReport?.posts ?? 0} />
      <StatCard icon={Megaphone} label="Active Ads" count={0} />
    </div>
  </div>
)}
```

- [ ] **Step 6: Verify frontend compiles**

```bash
cd /Applications/Localhost/CRM/frontend
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/models/Business.ts frontend/src/store/businesses/businessesApi.ts frontend/src/pages/admin/business/components/Dashboard/BusinessDashboard.tsx
git commit -m "feat: add Fetch Facebook Data button to dashboard with RTK Query mutation"
```
