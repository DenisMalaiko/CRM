# AI Photo Page — Design Spec
**Date:** 2026-04-23  
**Branch:** feature/competitors  

---

## Context

The business management section already has an "AI Ideas" feature that generates text ideas using AI. This spec adds an "AI Photo" page alongside it — allowing users to generate images via a text prompt, view them in a gallery-style grid, and delete them with confirmation.

---

## Architecture

### Route
```
/profile/businesses/:businessId/aiPhoto
```
Added to `src/App.tsx` alongside existing business sub-routes.

### Navigation
Added to `tabsAI` array in `src/pages/admin/business/:id/Business.tsx` (currently contains only `ideasAI`):
```ts
const tabsAI = [
  { id: "ideasAI", title: "AI Ideas", icon: Lightbulb },
  { id: "aiPhoto", title: "AI Photo", icon: ImageIcon },
]
```

---

## Component Structure

**File:** `src/pages/admin/business/components/AiPhoto/AiPhoto.tsx`

### Section 1 — Header
- Page title: "AI Photo"
- Button "Generate" → opens a Dialog (reuse existing dialog pattern from Gallery/IdeasAI)
- **Dialog contents:**
  - Textarea field labeled "Prompt"
  - Button "Generate" → calls `POST /aiPhoto/:businessId` with `{ prompt: string }`
  - Loading state on button while request is in-flight
  - On success: close dialog, reload photo list

### Section 2 — Photo Grid
- Layout: `grid grid-cols-2 sm:grid-cols-3` (mirrors Gallery)
- Each card:
  - Image from `url`
  - Hover overlay with:
    - View button (opens full-size in new tab or lightbox)
    - Delete button → opens confirm Dialog → calls `DELETE /aiPhoto/:id`
- Empty state: short message when no photos generated yet
- Loading skeleton while fetching

---

## Data Model

**File:** `src/models/AiPhoto.ts`
```ts
export type TAiPhoto = {
  id: string;
  businessId: string;
  url: string;
  prompt: string;
  createdAt: Date;
}
```

---

## Redux + API Layer

### Slice — `src/store/ai/photo/photoAiSlice.ts`
```ts
type PhotoAiState = {
  photosAi: TAiPhoto[] | null;
}
// Actions: setPhotosAi
```

### API — `src/store/ai/photo/photoAiApi.ts`
Uses `api.injectEndpoints()` pattern (same as ideaAiApi.ts).

| Hook | Method | URL | Body |
|------|--------|-----|------|
| `useGeneratePhotoAIMutation` | POST | `/aiPhoto/:businessId` | `{ prompt: string }` |
| `useLazyGetPhotosAIQuery` | GET | `/aiPhoto/:businessId` | — |
| `useDeletePhotoAIMutation` | DELETE | `/aiPhoto/:id` | — |

### Store registration — `src/store/index.ts`
Add `photoAiModule` to `reducer` and import `photoAiSlice`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Add `<Route path="aiPhoto" element={<AiPhoto />} />` |
| `src/pages/admin/business/:id/Business.tsx` | Add AI Photo to `tabsAI` |
| `src/store/index.ts` | Register `photoAiModule` |

## New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/business/components/AiPhoto/AiPhoto.tsx` | Main page component |
| `src/store/ai/photo/photoAiSlice.ts` | Redux state |
| `src/store/ai/photo/photoAiApi.ts` | RTK Query endpoints |
| `src/models/AiPhoto.ts` | TypeScript model |

---

## Conventions to Follow

- `export function AiPhoto()` (not arrow + FC)
- `type Props` (not interface)
- `import React` explicitly
- Tailwind only, no inline styles
- `useAppDispatch` / `useAppSelector` typed hooks
- No `console.log`, no commented code

---

## Verification

1. Navigate to a business → sidebar shows "AI Photo" in AI section
2. Click "AI Photo" → page loads with empty state
3. Click "Generate" → dialog opens with Prompt textarea
4. Enter prompt, click Generate → loading state, then grid shows new photo(s)
5. Hover photo → View and Delete buttons appear
6. Click Delete → confirm dialog appears → confirm → photo removed from grid
7. Reload page → photos persist (fetched via GET on mount)