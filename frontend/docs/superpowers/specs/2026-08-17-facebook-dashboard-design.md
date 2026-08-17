# Facebook Dashboard — Design Spec

## Context

The Instagram dashboard has a complete fetch pipeline: `InstagramService` (Apify scraper) -> `BusinessService.fetchInstagramReport()` -> `POST /fetch` endpoint -> RTK Query mutation -> Dashboard UI with Fetch button. Facebook currently lacks this pipeline — it has only a manual upsert endpoint and a basic GET. This spec adds the same architecture for Facebook, starting with a followers stat card.

## Apify Actor

**Actor:** `apify/facebook-pages-scraper`

**Input:**
```json
{ "startUrls": [{ "url": "https://www.facebook.com/pagename/" }] }
```

**Output fields used:** `followers` (number), `likes` (number)

**Cost:** ~$0.005 per page

## Backend Changes

### 1. `FacebookService.fetchDetails(pageUrl)` — NEW METHOD

**File:** `backend/src/modules/facebook/facebook.service.ts`

```typescript
async fetchDetails(pageUrl: string): Promise<{ followers: number; likes: number }> {
  const results = await this.apifyService.runActor<any>('apify/facebook-pages-scraper', {
    startUrls: [{ url: pageUrl }],
  });
  const page = results[0];
  return {
    followers: page?.followers ?? 0,
    likes: page?.likes ?? 0,
  };
}
```

Pattern: mirrors `InstagramService.fetchDetails()`.

### 2. `BusinessService.fetchFacebookReport(businessId)` — NEW METHOD

**File:** `backend/src/modules/business/business.service.ts`

- Inject `FacebookService` in constructor (alongside existing `InstagramService`)
- Validate `business.facebookLink` exists, throw `BadRequestException` if not
- Call `this.facebookService.fetchDetails(business.facebookLink)`
- Call `this.upsertFacebookReport(businessId, data)`
- Return the upserted report

### 3. `BusinessController` — NEW ENDPOINT

**File:** `backend/src/modules/business/business.controller.ts`

```typescript
@Post("/:id/facebook-report/fetch")
@ResponseMessage('Facebook report fetched!')
fetchFacebookReport(@Param() { id }: BusinessIdParamDto)
```

### 4. `BusinessModule` — ADD IMPORT

**File:** `backend/src/modules/business/business.module.ts`

Add `FacebookModule` to `imports` array.

### 5. Prisma Schema — ADD `likes` FIELD

**File:** `backend/prisma/schema.prisma`

```prisma
model FacebookReport {
  id         String   @id @default(uuid())
  businessId String   @unique
  followers  Int      @default(0)
  posts      Int      @default(0)
  likes      Int      @default(0)          // NEW
  fetchedAt  DateTime @default(now())
  business   Business @relation(fields: [businessId], references: [id])
}
```

Run `npx prisma migrate dev --name add-likes-to-facebook-report`.

### 6. Backend Entity Type — UPDATE

**File:** `backend/src/modules/business/entities/business.entity.ts`

Add `likes: number` to `TFacebookReport`.

## Frontend Changes

### 7. Frontend Model — UPDATE

**File:** `frontend/src/models/Business.ts`

Add `likes: number` to `TFacebookReport`.

### 8. RTK Query — NEW MUTATION

**File:** `frontend/src/store/businesses/businessesApi.ts`

```typescript
useFetchFacebookReportMutation: builder.mutation({
  query: (businessId: string) => ({
    url: `/business/${businessId}/facebook-report/fetch`,
    method: 'POST',
  }),
})
```

### 9. Dashboard UI — FACEBOOK TAB

**File:** `frontend/src/pages/admin/business/components/Dashboard/BusinessDashboard.tsx`

- Import `useFetchFacebookReportMutation`
- Add `handleFetchFacebook` handler (same pattern as `handleFetchInstagram`)
- In Facebook tab: add "Fetch Facebook Report" button + Followers stat card using existing `StatCard` component
- Display `fbReport.followers` value

## Files Changed

| File | Action |
|------|--------|
| `backend/prisma/schema.prisma` | Add `likes` field to FacebookReport |
| `backend/src/modules/business/entities/business.entity.ts` | Add `likes` to TFacebookReport |
| `backend/src/modules/facebook/facebook.service.ts` | Add `fetchDetails()` method |
| `backend/src/modules/business/business.service.ts` | Add `fetchFacebookReport()`, inject FacebookService |
| `backend/src/modules/business/business.controller.ts` | Add POST `/fetch` endpoint |
| `backend/src/modules/business/business.module.ts` | Import FacebookModule |
| `frontend/src/models/Business.ts` | Add `likes` to TFacebookReport |
| `frontend/src/store/businesses/businessesApi.ts` | Add `useFetchFacebookReportMutation` |
| `frontend/src/pages/.../BusinessDashboard.tsx` | Facebook tab with Fetch button + Followers card |

## Verification

1. **Backend:** `POST /business/:id/facebook-report/fetch` with a business that has `facebookLink` set -> returns report with followers/likes
2. **Frontend:** Open dashboard -> Facebook tab -> click Fetch -> followers stat card updates
3. **Error case:** Business without `facebookLink` -> returns 400 error
4. **DB:** `FacebookReport` row created/updated with correct values
