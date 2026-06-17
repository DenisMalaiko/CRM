# Ideas by Source Type — Design Spec

## Problem

All competitor ideas are displayed on a single `/ideas` page. As the number of ideas grows across different content types (Facebook Posts, Instagram Posts, Instagram Reels, Meta Ads), the page becomes hard to navigate. Users need focused views per content type.

## Solution

Replace the single `/ideas` page with 4 separate pages, one per `IdeaSourceType`. Each page uses a shared `IdeasTable` component. Add status filtering alongside existing competitor filtering.

## IdeaSourceType Enum

```typescript
export enum IdeaSourceType {
  FacebookPost = "FacebookPost",
  InstagramPost = "InstagramPost",
  InstagramReel = "InstagramReel",
  FacebookAd = "FacebookAd",
}
```

Matches backend Prisma enum exactly.

## Model Changes

### `src/models/Idea.ts`

Add fields to `TIdea`:
- `sourceType: IdeaSourceType` (required)
- `sourceId: string` (required)

Update `TIdeaParams`:
- Add `sourceType: IdeaSourceType` to filter by content type

## API Changes

### `src/store/idea/ideaApi.ts`

- `getIdeas` — change from `mutation<..., string>` to accept `{ businessId: string, sourceType: IdeaSourceType }`. Update URL to pass `sourceType` as query param: `GET /ideas/list/{businessId}?sourceType={sourceType}`
- `fetchIdeas` — add `sourceType` to the request body

## Component Architecture

### Shared Component: `IdeasTable`

**Location:** `src/pages/admin/business/components/Competitors/Ideas/components/ideasTable/IdeasTable.tsx`

**Props:**
```typescript
type Props = {
  sourceType: IdeaSourceType;
  title: string;
}
```

**Functionality (extracted from current `Ideas.tsx`):**
- Fetches ideas filtered by `sourceType` via `getIdeas`
- Fetches competitors for filter dropdown
- Filter by competitors (existing multi-select)
- Filter by status (new multi-select with IdeaStatus values: New, Planned, Used, Archived)
- Sortable table (score, status, createdAt)
- Pagination (10 per page)
- Edit idea dialog (UpdateIdeaDlg)
- View description dialog (TextDlg)
- Delete idea with confirmation
- "Get Ideas" button — calls `fetchIdeas` with `sourceType`

### Page Components (thin wrappers)

| File | Route | Props passed |
|------|-------|-------------|
| `src/pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas.tsx` | `ideas/facebook-posts` | `sourceType="FacebookPost"` title="Facebook Posts Ideas" |
| `src/pages/admin/business/components/Competitors/Ideas/InstagramPostsIdeas.tsx` | `ideas/instagram-posts` | `sourceType="InstagramPost"` title="Instagram Posts Ideas" |
| `src/pages/admin/business/components/Competitors/Ideas/InstagramReelsIdeas.tsx` | `ideas/instagram-reels` | `sourceType="InstagramReel"` title="Instagram Reels Ideas" |
| `src/pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas.tsx` | `ideas/meta-ads` | `sourceType="FacebookAd"` title="Meta Ads Ideas" |

Each file is ~10 lines — just imports `IdeasTable` and passes props.

## Routing Changes

### `src/App.tsx`

Remove:
```tsx
<Route path="ideas" element={<Ideas />} />
```

Add:
```tsx
<Route path="ideas/facebook-posts" element={<FacebookPostsIdeas />} />
<Route path="ideas/instagram-posts" element={<InstagramPostsIdeas />} />
<Route path="ideas/instagram-reels" element={<InstagramReelsIdeas />} />
<Route path="ideas/meta-ads" element={<MetaAdsIdeas />} />
```

## Sidebar Changes

### `src/pages/admin/business/:id/Business.tsx`

Replace in `tabsCompetitors`:
```typescript
// REMOVE
{ id: "ideas", title: "Competitors Ideas", icon: Lightbulb }

// ADD
{ id: "ideas/facebook-posts", title: "Facebook Posts Ideas", icon: Lightbulb },
{ id: "ideas/instagram-posts", title: "Instagram Posts Ideas", icon: Lightbulb },
{ id: "ideas/instagram-reels", title: "Instagram Reels Ideas", icon: Lightbulb },
{ id: "ideas/meta-ads", title: "Meta Ads Ideas", icon: Lightbulb },
```

## Status Filter

Add a multi-select filter (same style as competitor filter) for `IdeaStatus`:
- Options: New, Planned, Used, Archived
- Placed next to the existing competitor filter
- Filters `filteredIdeas` in the `useMemo` chain

## Files to Create

1. `src/enum/IdeaSourceType.ts`
2. `src/pages/admin/business/components/Competitors/Ideas/components/ideasTable/IdeasTable.tsx`
3. `src/pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas.tsx`
4. `src/pages/admin/business/components/Competitors/Ideas/InstagramPostsIdeas.tsx`
5. `src/pages/admin/business/components/Competitors/Ideas/InstagramReelsIdeas.tsx`
6. `src/pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas.tsx`

## Files to Modify

1. `src/models/Idea.ts` — add sourceType, sourceId fields + update TIdeaParams
2. `src/store/idea/ideaApi.ts` — update getIdeas and fetchIdeas endpoints
3. `src/App.tsx` — replace routes
4. `src/pages/admin/business/:id/Business.tsx` — update sidebar tabs

## Files to Delete

1. `src/pages/admin/business/components/Competitors/Ideas/Ideas.tsx` — replaced by IdeasTable + 4 wrappers

## Verification

1. Run `npm start` — confirm no build errors
2. Navigate to each of the 4 new sidebar items — verify page loads with correct title
3. Verify "Get Ideas" button works and returns ideas filtered by sourceType
4. Verify competitor filter and new status filter work correctly
5. Verify sort, pagination, edit, delete all function as before
6. Verify old `/ideas` route no longer exists (should 404 or redirect)
