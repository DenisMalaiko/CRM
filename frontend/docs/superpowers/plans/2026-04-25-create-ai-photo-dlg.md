# CreateAiPhotoDlg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up `AiPhoto.tsx`, restore photo grid, and implement `CreateAiPhotoDlg` as a working popup for AI photo generation with prompt + reference photo selection.

**Architecture:** `AiPhoto` owns data fetching, grid display, and delete; `CreateAiPhotoDlg` owns the generation form with prompt textarea and `SelectGalleryDlg` (Images + Decorations only). After successful generation, `CreateAiPhotoDlg` calls `onSuccess()` → `AiPhoto` re-fetches and updates the grid. `SelectGalleryDlg` gains a `focus: BusinessProfileFocus | null` signature — null shows only Images and Decorations.

**Tech Stack:** React 18, TypeScript, Redux Toolkit + RTK Query, Tailwind CSS, react-toastify, lucide-react.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/models/Gallery.ts` | Add `photosIds`/`defaultPhotosIds` to `TAIGalleryPhotoCreate` |
| Modify | `src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.tsx` | Make `focus` nullable; update `visibleCategories` |
| Modify test | `src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.test.tsx` | Add test for `focus={null}` |
| Modify | `src/pages/admin/business/components/AiPhoto/AiPhoto.tsx` | Remove all commented code, restore grid, fix delete, add `onSuccess` |
| Modify | `src/pages/admin/business/components/AiPhoto/components/CreateAiPhotoDlg.tsx` | Full implementation |
| Create test | `src/pages/admin/business/components/AiPhoto/components/CreateAiPhotoDlg.test.tsx` | Tests for dialog |

---

### Task 1: Update `TAIGalleryPhotoCreate` model

**Files:**
- Modify: `src/models/Gallery.ts`

- [ ] **Step 1: Update the type**

Find:
```typescript
export type TAIGalleryPhotoCreate = {
  prompt: string;
}
```

Replace with:
```typescript
export type TAIGalleryPhotoCreate = {
  prompt: string;
  photosIds: string[];
  defaultPhotosIds: string[];
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Applications/Localhost/CRM/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `TAIGalleryPhotoCreate`.

- [ ] **Step 3: Commit**

```bash
git add src/models/Gallery.ts
git commit -m "feat: add photosIds/defaultPhotosIds to TAIGalleryPhotoCreate"
```

---

### Task 2: Make `SelectGalleryDlg` `focus` nullable

**Files:**
- Modify: `src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.tsx`
- Modify test: `src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.test.tsx`

- [ ] **Step 1: Write failing test for `focus={null}`**

Open `SelectGalleryDlg.test.tsx`. Add inside the existing test file:

```typescript
describe('focus={null}', () => {
  it('shows Images and Decorations categories', () => {
    mockGalleryState = {
      photos: [
        { id: '1', url: 'img1.jpg', type: 'Image', businessId: 'biz-1', isActive: true, description: '', createdAt: new Date() },
        { id: '2', url: 'dec1.jpg', type: 'Decoration', businessId: 'biz-1', isActive: true, description: '', createdAt: new Date() },
      ],
      defaultPhotos: [],
      aiPhotos: [],
    };

    render(
      <Provider store={store}>
        <SelectGalleryDlg focus={null} selectedIds={[]} onSelect={jest.fn()} />
      </Provider>
    );

    expect(screen.getByText('IMAGES')).toBeInTheDocument();
    expect(screen.getByText('DECORATIONS')).toBeInTheDocument();
  });

  it('does not show Post or Story templates when focus is null', () => {
    mockGalleryState = {
      photos: [
        { id: '1', url: 'post1.jpg', type: 'Post', businessId: 'biz-1', isActive: true, description: '', createdAt: new Date() },
        { id: '2', url: 'story1.jpg', type: 'Story', businessId: 'biz-1', isActive: true, description: '', createdAt: new Date() },
      ],
      defaultPhotos: [],
      aiPhotos: [],
    };

    render(
      <Provider store={store}>
        <SelectGalleryDlg focus={null} selectedIds={[]} onSelect={jest.fn()} />
      </Provider>
    );

    expect(screen.queryByText(/templates for posts/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/templates for stories/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Applications/Localhost/CRM/frontend && npm test -- --watchAll=false --testPathPattern=SelectGalleryDlg 2>&1 | tail -20
```

Expected: FAIL — TypeScript error or type mismatch on `focus={null}`.

- [ ] **Step 3: Update Props type in `SelectGalleryDlg.tsx`**

Find:
```typescript
type Props = {
  onSelect: (selectedPhotos: TGalleryPhoto[]) => void;
  selectedIds: string[];
  focus: BusinessProfileFocus;
}
```

Replace with:
```typescript
type Props = {
  onSelect: (selectedPhotos: TGalleryPhoto[]) => void;
  selectedIds: string[];
  focus: BusinessProfileFocus | null;
}
```

The `visibleCategories` logic already handles null correctly — when `focus === null`, neither `GeneratePosts` nor `GenerateStories` conditions match, so only Images and Decorations are included. No further changes needed.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Applications/Localhost/CRM/frontend && npm test -- --watchAll=false --testPathPattern=SelectGalleryDlg 2>&1 | tail -20
```

Expected: all tests pass (previously 13, now 15).

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.tsx \
        src/pages/admin/business/components/Gallery/components/selectGalleryDlg/SelectGalleryDlg.test.tsx
git commit -m "feat: make SelectGalleryDlg focus nullable for Images+Decorations-only mode"
```

---

### Task 3: Implement `CreateAiPhotoDlg.tsx`

**Files:**
- Modify: `src/pages/admin/business/components/AiPhoto/components/CreateAiPhotoDlg.tsx`
- Create test: `src/pages/admin/business/components/AiPhoto/components/CreateAiPhotoDlg.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `CreateAiPhotoDlg.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CreateAiPhotoDlg from './CreateAiPhotoDlg';

// Mock react-toastify
jest.mock('react-toastify', () => ({ toast: { success: jest.fn() } }));

// Mock gallery API
const mockGeneratePhoto = jest.fn();
jest.mock('../../../../../../store/gallery/galleryApi', () => ({
  useGenerateAiPhotoMutation: () => [mockGeneratePhoto, { isLoading: false }],
}));

// Mock SelectGalleryDlg
jest.mock('../../Gallery/components/selectGalleryDlg/SelectGalleryDlg', () => ({
  SelectGalleryDlg: ({ focus }: any) => (
    <div data-testid="select-gallery-dlg" data-focus={focus ?? 'null'} />
  ),
}));

let mockGalleryState = { photos: [], defaultPhotos: [], aiPhotos: [] };

jest.mock('../../../../../../store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({ galleryModule: mockGalleryState }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ businessId: 'biz-1' }),
}));

const store = configureStore({ reducer: { galleryModule: () => mockGalleryState } });

function renderDialog(props = {}) {
  const defaults = { open: true, onClose: jest.fn(), onSuccess: jest.fn() };
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateAiPhotoDlg {...defaults} {...props} />
      </MemoryRouter>
    </Provider>
  );
}

describe('CreateAiPhotoDlg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open=true', () => {
    renderDialog({ open: true });
    expect(screen.getByText('Generate AI Photo')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Generate AI Photo')).not.toBeInTheDocument();
  });

  it('Generate button is disabled when prompt is empty', () => {
    renderDialog();
    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).toBeDisabled();
  });

  it('Generate button is enabled when prompt has text', () => {
    renderDialog();
    const textarea = screen.getByPlaceholderText(/describe the photo/i);
    userEvent.type(textarea, 'a sunset over mountains');
    const btn = screen.getByRole('button', { name: /generate/i });
    expect(btn).not.toBeDisabled();
  });

  it('calls generatePhoto with correct args on submit', async () => {
    mockGeneratePhoto.mockResolvedValue({ data: { id: '1', url: 'x.jpg' }, message: 'Done' });
    renderDialog();
    userEvent.type(screen.getByPlaceholderText(/describe the photo/i), 'a mountain');
    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(mockGeneratePhoto).toHaveBeenCalledWith({
        id: 'biz-1',
        form: { prompt: 'a mountain', photosIds: [], defaultPhotosIds: [] },
      });
    });
  });

  it('calls onSuccess and onClose after successful generation', async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    mockGeneratePhoto.mockResolvedValue({ data: { id: '1' }, message: 'Done' });
    renderDialog({ onSuccess, onClose });
    userEvent.type(screen.getByPlaceholderText(/describe the photo/i), 'a mountain');
    userEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders SelectGalleryDlg with focus=null', () => {
    renderDialog();
    const gallery = screen.getByTestId('select-gallery-dlg');
    expect(gallery).toBeInTheDocument();
    expect(gallery.getAttribute('data-focus')).toBe('null');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderDialog({ onClose });
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Applications/Localhost/CRM/frontend && npm test -- --watchAll=false --testPathPattern=CreateAiPhotoDlg 2>&1 | tail -20
```

Expected: FAIL — component not implemented yet.

- [ ] **Step 3: Implement `CreateAiPhotoDlg.tsx`**

Replace the entire file content:

```typescript
import React, { useState } from 'react';
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useGenerateAiPhotoMutation } from "../../../../../../store/gallery/galleryApi";

// Components
import { SelectGalleryDlg } from "../../Gallery/components/selectGalleryDlg/SelectGalleryDlg";

// Models
import { TGalleryPhoto } from "../../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../../utils/showError";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAiPhotoDlg({ open, onClose, onSuccess }: Props) {
  const { businessId } = useParams<{ businessId: string }>();

  const [form, setForm] = useState({
    prompt: '',
    photosIds: [] as string[],
    defaultPhotosIds: [] as string[],
  });

  const [generatePhoto, { isLoading }] = useGenerateAiPhotoMutation();

  if (!open) return null;
  if (!businessId) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await generatePhoto({
        id: businessId,
        form: {
          prompt: form.prompt,
          photosIds: form.photosIds,
          defaultPhotosIds: form.defaultPhotosIds,
        },
      }).unwrap();

      if (response && response.data) {
        toast.success(response.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleSelectPhotos = (selectedPhotos: TGalleryPhoto[]) => {
    const photosIds = selectedPhotos.filter(p => !p.isDefault).map(p => p.id);
    const defaultPhotosIds = selectedPhotos.filter(p => p.isDefault).map(p => p.id);
    setForm(prev => ({ ...prev, photosIds, defaultPhotosIds }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">

        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">Generate AI Photo</h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
            <textarea
              value={form.prompt}
              onChange={(e) => setForm(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Describe the photo you want to generate..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SelectGalleryDlg
            focus={null}
            selectedIds={[...form.photosIds, ...form.defaultPhotosIds]}
            onSelect={handleSelectPhotos}
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!form.prompt.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CreateAiPhotoDlg;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Applications/Localhost/CRM/frontend && npm test -- --watchAll=false --testPathPattern=CreateAiPhotoDlg 2>&1 | tail -20
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/business/components/AiPhotos/components/CreateAiPhotoDlg.tsx \
        src/pages/admin/business/components/AiPhotos/components/CreateAiPhotoDlg.test.tsx
git commit -m "feat: implement CreateAiPhotoDlg with prompt textarea and photo selection"
```

---

### Task 4: Clean up and restore `AiPhoto.tsx`

**Files:**
- Modify: `src/pages/admin/business/components/AiPhoto/AiPhoto.tsx`

- [ ] **Step 1: Replace entire file with cleaned-up version**

```typescript
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ImagePlay, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  useLazyGetAiPhotosQuery,
  useDeletePhotoMutation,
} from "../../../../../store/gallery/galleryApi";
import { setAiPhotosGalleryPhotos } from "../../../../../store/gallery/gallerySlice";

// Components
import CreateAiPhotoDlg from "./components/CreateAiPhotoDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import SliderDlg from "../../../../../components/sliderDlg/SliderDlg";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TGalleryPhoto } from "../../../../../models/Gallery";

// Utils
import { showError } from "../../../../../utils/showError";

export function AiPhoto() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [open, setOpen] = useState(false);
  const [openSliderDlg, setOpenSliderDlg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string }[] | null>(null);

  const [getPhotos] = useLazyGetAiPhotosQuery();
  const [deletePhoto] = useDeletePhotoMutation();

  const { aiPhotos } = useAppSelector((state) => state.galleryModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
          if (response && response.data) dispatch(setAiPhotosGalleryPhotos(response.data));
        }
      } catch (error) {
        showError(error);
      }
    };
    fetchData();
  }, [businessId, dispatch]);

  if (!businessId) return null;

  const handleSuccess = async () => {
    if (!businessId) return;
    try {
      const response: ApiResponse<TGalleryPhoto[]> = await getPhotos(businessId).unwrap();
      if (response && response.data) dispatch(setAiPhotosGalleryPhotos(response.data));
    } catch (error) {
      showError(error);
    }
  };

  const handleOpenSlider = (photo: TGalleryPhoto) => {
    setSelectedMedia([{ url: photo.url }]);
    setOpenSliderDlg(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Delete Photo",
      message: "Are you sure you want to delete this photo?",
    });
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

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">AI Photo</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      <div className="p-5">
        {aiPhotos.length === 0 ? (
          <div className="py-4 text-center text-slate-400 text-sm">
            No photos generated yet
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
            {aiPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition h-80 bg-gray-200 p-5 flex justify-center items-center"
              >
                <img
                  src={photo.url}
                  className="w-auto h-auto max-w-full max-h-full"
                  alt={photo.description}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
                  <div className="flex gap-5">
                    <button
                      onClick={() => handleOpenSlider(photo)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <ImagePlay size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, photo.id)}
                      className="opacity-0 group-hover:opacity-100 transition duration-300 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateAiPhotoDlg
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />

      <SliderDlg
        open={openSliderDlg}
        onClose={() => setOpenSliderDlg(false)}
        medias={selectedMedia ?? []}
      />
    </div>
  );
}

export default AiPhoto;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Applications/Localhost/CRM/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run all related tests**

```bash
cd /Applications/Localhost/CRM/frontend && npm test -- --watchAll=false --testPathPattern="AiPhoto|SelectGalleryDlg|CreateAiPhoto" 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/business/components/AiPhotos/AiPhotos.tsx
git commit -m "feat: restore AiPhoto grid, fix delete, connect CreateAiPhotoDlg"
```
