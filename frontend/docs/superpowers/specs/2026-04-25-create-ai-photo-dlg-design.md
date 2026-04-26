# Design: CreateAiPhotoDlg — AI Photo Generation Popup

**Date:** 2026-04-25

## Context

`AiPhoto.tsx` contains a large amount of commented-out code from a previous implementation (photo grid, generate dialog, old API imports, delete logic). `CreateAiPhotoDlg.tsx` exists as a skeleton with no real implementation. The goal is to clean up `AiPhoto.tsx` and implement `CreateAiPhotoDlg` as a working popup for generating AI photos with a text prompt and optional reference photo selection.

## Scope

4 files modified, no new files created.

## Changes

### 1. `src/models/Gallery.ts`

Update `TAIGalleryPhotoCreate` to accept reference photo IDs:

```typescript
export type TAIGalleryPhotoCreate = {
  prompt: string;
  photosIds: string[];
  defaultPhotosIds: string[];
}
```

### 2. `SelectGalleryDlg.tsx`

Make `focus` optional (`BusinessProfileFocus | null`):

```typescript
type Props = {
  onSelect: (selectedPhotos: TGalleryPhoto[]) => void;
  selectedIds: string[];
  focus: BusinessProfileFocus | null;
}
```

`visibleCategories` logic update — when `focus === null`, only Images and Decorations are shown (no Post or Story templates):

```typescript
const visibleCategories = [
  { type: GalleryType.Image, label: 'Images', photos: imagePhotos },
  ...(focus === BusinessProfileFocus.GeneratePosts ? [...] : []),
  ...(focus === BusinessProfileFocus.GenerateStories ? [...] : []),
  { type: GalleryType.Decoration, label: 'Decorations', photos: decorationPhotos },
];
```

When `focus === null`, spread conditions evaluate to `[]` — no additional categories added.

### 3. `AiPhoto.tsx`

**Remove:**
- Commented-out old API imports block
- `prompt` state
- `handleGenerate` function (moved to dialog)
- `useGenerateAiPhotoMutation` (moved to dialog)
- `isGenerating` destructure
- Commented-out `handleDelete` body — replace with working implementation
- Commented-out photo grid section — restore it
- Commented-out generate dialog section — delete entirely (replaced by `CreateAiPhotoDlg`)
- `console.log("WATCH AI PHOTOS")`
- `TAiPhoto` import (use `TGalleryPhoto` already imported)

**Restore photo grid** using `aiPhotos` from Redux store:
```tsx
{aiPhotos.length === 0 ? (
  <div className="py-4 text-center text-slate-400 text-sm">No photos generated yet</div>
) : (
  <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
    {aiPhotos.map((photo) => (
      <div key={photo.id} className="group relative rounded-2xl ...">
        <img src={photo.url} ... />
        {/* hover overlay with ImagePlay + Trash2 buttons */}
      </div>
    ))}
  </div>
)}
```

**Restore `handleDelete`** using `deletePhoto` + re-fetch:
```typescript
const handleDelete = async (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  const ok = await confirm({ title: "Delete Photo", message: "..." });
  if (ok) {
    try {
      const response: ApiResponse<null> = await deletePhoto(id).unwrap();
      if (response && response.success) {
        const refreshed: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
        if (refreshed && refreshed.data) dispatch(setAiPhotosGalleryPhotos(refreshed.data));
        toast.success(response.message);
      }
    } catch (error) {
      showError(error);
    }
  }
};
```

**Add `onSuccess` handler** (passed to dialog for post-generation refresh):
```typescript
const handleSuccess = async () => {
  const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
  if (response && response.data) dispatch(setAiPhotosGalleryPhotos(response.data));
};
```

**Updated `CreateAiPhotoDlg` usage:**
```tsx
<CreateAiPhotoDlg
  open={open}
  onClose={() => setOpen(false)}
  onSuccess={handleSuccess}
/>
```

### 4. `CreateAiPhotoDlg.tsx`

**Props:**
```typescript
type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Form state:**
```typescript
const [form, setForm] = useState({ prompt: '', photosIds: [] as string[], defaultPhotosIds: [] as string[] });
```

**Hooks:**
```typescript
const { businessId } = useParams<{ businessId: string }>();
const [generatePhoto, { isLoading }] = useGenerateAiPhotoMutation();
```

**Submit handler:**
```typescript
const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  const response = await generatePhoto({
    id: businessId,
    form: { prompt: form.prompt, photosIds: form.photosIds, defaultPhotosIds: form.defaultPhotosIds }
  }).unwrap();
  if (response && response.data) {
    toast.success(response.message);
    onSuccess();
    onClose();
  }
};
```

**JSX structure:**
- Modal wrapper (same pattern as other dialogs: `fixed inset-0 z-50`)
- Header: "Generate AI Photo" + close button
- Form:
  - `textarea` for prompt (required, placeholder: "Describe the photo you want to generate...")
  - `SelectGalleryDlg` with `focus={null}` (Images + Decorations only)
  - Submit button: "Generate" / "Generating..." (disabled when loading or prompt empty)

**Remove** unused imports: `useForm`, `useValidation`, `useGetPhotosMutation`, `useLazyGetDefaultPhotosQuery`, `useSelector`, `Pencil`.

## Data Flow

```
User fills prompt + selects photos
  → handleCreate
    → generateAiPhoto({ id: businessId, form: { prompt, photosIds, defaultPhotosIds } })
      → success: toast + onSuccess() + onClose()
        → AiPhoto.handleSuccess re-fetches aiPhotos
          → Redux store updated
            → grid re-renders
```

## Verification

1. Click "Generate" button in AiPhoto → CreateAiPhotoDlg opens
2. Enter prompt text → "Generate" button becomes enabled
3. Select reference photos (Images/Decorations only visible, no Post/Story templates)
4. Submit → loading state visible
5. Success → dialog closes, toast shown, photo grid refreshes with new photo
6. Delete photo → confirm dialog → photo removed from grid
7. Existing SelectGalleryDlg usages with `focus={GeneratePosts/GenerateStories}` — behavior unchanged
