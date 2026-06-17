# Ideas by Source Type — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `/ideas` page with 4 separate pages filtered by `IdeaSourceType`, using a shared `IdeasTable` component. Add status filtering.

**Architecture:** Extract current `Ideas.tsx` logic into a reusable `IdeasTable` component that accepts `sourceType` and `title` props. Create 4 thin wrapper pages. Update API layer to pass `sourceType` filter. Update routing and sidebar.

**Tech Stack:** React 18, TypeScript, Redux Toolkit + RTK Query, Tailwind CSS, react-select, React Router v6

**Spec:** `docs/superpowers/specs/2026-06-17-ideas-by-source-type-design.md`

---

### Task 1: Create `IdeaSourceType` enum

**Files:**
- Create: `src/enum/IdeaSourceType.ts`

- [ ] **Step 1: Create the enum file**

```typescript
export enum IdeaSourceType {
  FacebookPost = "FacebookPost",
  InstagramPost = "InstagramPost",
  InstagramReel = "InstagramReel",
  FacebookAd = "FacebookAd",
}
```

- [ ] **Step 2: Commit**

```bash
git add src/enum/IdeaSourceType.ts
git commit -m "feat: add IdeaSourceType enum"
```

---

### Task 2: Update `TIdea` model and API types

**Files:**
- Modify: `src/models/Idea.ts`

- [ ] **Step 1: Add `sourceType` and `sourceId` to `TIdea`, add `sourceType` to `TIdeaParams`**

Full updated file:

```typescript
import { IdeaStatus } from "../enum/IdeaStatus";
import { IdeaSourceType } from "../enum/IdeaSourceType";

export type TIdea = {
  id: string;
  businessId: string;
  competitorId: string;
  competitorPostId: string;
  sourceType: IdeaSourceType;
  sourceId: string;
  title: string;
  description: string;
  who: string;
  what: string;
  why: string;
  how: string;
  feeling: string;
  score: number;
  createdAt: Date;
  status: IdeaStatus;
}

export type TIdeaParams = {
  onlyPostsNewerThan: Date;
  sourceType: IdeaSourceType;
}

export type TIdeaUpdate = {
  status: IdeaStatus;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/models/Idea.ts
git commit -m "feat: add sourceType and sourceId to TIdea model"
```

---

### Task 3: Update RTK Query API endpoints

**Files:**
- Modify: `src/store/idea/ideaApi.ts`

- [ ] **Step 1: Update `getIdeas` to accept `sourceType` param, update `fetchIdeas` body**

Change `getIdeas` from accepting a plain `string` to accepting `{ businessId: string; sourceType: IdeaSourceType }`. Pass `sourceType` as a query parameter.

Update `fetchIdeas` — the `form` body already includes `TIdeaParams` which now has `sourceType`.

Full updated file:

```typescript
import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TIdea, TIdeaParams, TIdeaUpdate } from "../../models/Idea";
import { IdeaSourceType } from "../../enum/IdeaSourceType";

export const ideaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchIdeas: builder.mutation<ApiResponse<TIdea[]>, { id: string, form: TIdeaParams }>({
      queryFn: async ({ id, form }, api, _extraOptions, baseQuery) => {
        if (!id) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/ideas/${id}`,
          method: 'POST',
          body: form,
        });

        return {
          data: result.data as ApiResponse<TIdea[]>
        };
      }
    }),

    getIdeas: builder.mutation<ApiResponse<TIdea[]>, { businessId: string; sourceType: IdeaSourceType }>({
      query: ({ businessId, sourceType }) => ({
        url: `/ideas/list/${businessId}`,
        method: "GET",
        params: { sourceType },
      })
    }),

    updateIdea: builder.mutation<ApiResponse<TIdea>, { id: string, form: TIdeaUpdate }>({
      query: ({ id, form }) => ({
        url: `/ideas/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteIdea: builder.mutation<ApiResponse<TIdea>, string>({
      query: (id: string) => ({
        url: `/ideas/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIdeasMutation,
  useFetchIdeasMutation,
  useDeleteIdeaMutation,
  useUpdateIdeaMutation,
} = ideaApi;
```

- [ ] **Step 2: Commit**

```bash
git add src/store/idea/ideaApi.ts
git commit -m "feat: update getIdeas to accept sourceType filter param"
```

---

### Task 4: Create shared `IdeasTable` component

**Files:**
- Create: `src/pages/admin/business/components/Competitors/Ideas/components/ideasTable/IdeasTable.tsx`

This is the core task. Extract all logic from `Ideas.tsx` into a reusable component that accepts `sourceType` and `title` as props. Add status filtering.

- [ ] **Step 1: Create the `IdeasTable` component**

```typescript
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ExternalLink, Eye, Copy } from "lucide-react";
import Select from "react-select";

// Hooks
import { usePagination } from "../../../../../../../../hooks/usePagination";
import { useCopyToClipboard } from "../../../../../../../../hooks/useCopyToClipboard";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../store";
import { useAppDispatch } from "../../../../../../../../store/hooks";
import { useGetIdeasMutation, useFetchIdeasMutation, useDeleteIdeaMutation } from "../../../../../../../../store/idea/ideaApi";
import { useGetCompetitorsMutation } from "../../../../../../../../store/competitor/competitorApi";
import { setIdeas } from "../../../../../../../../store/idea/ideaSlice";
import { setCompetitors } from "../../../../../../../../store/competitor/competitorSlice";

// Components
import { confirm } from "../../../../../../../../components/confirmDlg/ConfirmDlg";
import UpdateIdeaDlg from "../updateIdeaDlg/UpdateIdeaDlg";
import TextDlg from "../../../../../../../../components/textDlg/TextDlg";

// Utils
import { showError } from "../../../../../../../../utils/showError";
import { toDate } from "../../../../../../../../utils/toDate";
import { getStatusClass } from "../../../../../../../../utils/getStatusClass";
import { centeredSelectStyles } from "../../../../../../../../utils/reactSelectStyles";

// Models
import { ApiResponse } from "../../../../../../../../models/ApiResponse";
import { TIdea } from "../../../../../../../../models/Idea";
import { TCompetitor } from "../../../../../../../../models/Competitor";

// Enums
import { IdeaSourceType } from "../../../../../../../../enum/IdeaSourceType";
import { IdeaStatus } from "../../../../../../../../enum/IdeaStatus";

type Props = {
  sourceType: IdeaSourceType;
  title: string;
}

function IdeasTable({ sourceType, title }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ fetchIdeas, { isLoading: isLoadingFetch } ] = useFetchIdeasMutation();
  const [ getIdeas ] = useGetIdeasMutation();
  const [ getCompetitors ] = useGetCompetitorsMutation();
  const [ deleteIdea ] = useDeleteIdeaMutation();

  const { ideas } = useSelector((state: RootState) => state.ideaModule);
  const { competitors } = useSelector((state: RootState) => state.competitorModule);

  const [ open, setOpen ] = useState(false);
  const [ sortKey, setSortKey ] = useState<'createdAt' | 'score' | 'status'>('score');
  const [ sortDir, setSortDir ] = useState<'asc' | 'desc'>('desc');
  const [ selectedIdea, setSelectedIdea ] = useState<TIdea | null>(null);
  const [ competitorsIds, setCompetitorsIds ] = useState<string[]>([]);
  const [ statusFilter, setStatusFilter ] = useState<string[]>([]);
  const [ openTextDlg, setOpenTextDlg ] = useState(false);
  const [ selectedText, setSelectedText ] = useState<string | null>(null);

  const competitorsOptions = competitors?.map((competitor: TCompetitor) => ({ value: competitor.id, label: competitor.name })) || [];

  const statusOptions = Object.values(IdeaStatus).map((status) => ({ value: status, label: status }));

  const header = [
    { name: "Title", key: "title" },
    { name: "Description", key: "description" },
    { name: "Competitor", key: "competitor" },
    { name: "Score", key: "score" },
    { name: "Status", key: "status" },
    { name: "Created At", key: "createdAt" },
    { name: "Url", key: "url" },
    { name: "Actions", key: "actions" },
  ];

  const { copy } = useCopyToClipboard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TIdea[]> = await getIdeas({ businessId, sourceType }).unwrap();
          const responseCompetitors: ApiResponse<TCompetitor[]> = await getCompetitors(businessId).unwrap();

          if (response?.data) dispatch(setIdeas(response.data));
          if (responseCompetitors?.data) dispatch(setCompetitors(responseCompetitors.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch, sourceType]);

  const competitorsMap = useMemo(() => {
    const map = new Map<string, string>();
    (competitors ?? []).forEach(c => map.set(c.id, c.name));
    return map;
  }, [competitors]);

  const filteredIdeas: TIdea[] = useMemo(() => {
    if (!ideas?.length) return [];

    let result = ideas;

    if (competitorsIds.length) {
      const selected = new Set(competitorsIds);
      result = result.filter((i: TIdea) => i.competitorId && selected.has(i.competitorId));
    }

    if (statusFilter.length) {
      const selected = new Set(statusFilter);
      result = result.filter((i: TIdea) => selected.has(i.status));
    }

    return result;
  }, [ideas, competitorsIds, statusFilter]);

  const sortedIdeas: TIdea[] = useMemo(() => {
    if (!filteredIdeas?.length) return [];

    return [...filteredIdeas].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "createdAt") {
        const aTime = aVal ? new Date(aVal as any).getTime() : 0;
        const bTime = bVal ? new Date(bVal as any).getTime() : 0;
        return sortDir === "desc" ? bTime - aTime : aTime - bTime;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }

      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");

      return sortDir === "desc" ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
  }, [filteredIdeas, sortKey, sortDir]);

  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedIdeas,
    pageSize: 10,
    resetDeps: [sortKey, sortDir, competitorsIds.join(","), statusFilter.join(",")],
  });

  if (!businessId) return null;

  const initForm = (() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return { onlyPostsNewerThan: date, sourceType };
  })();

  const getIdeasData = async () => {
    try {
      const response: ApiResponse<TIdea[]> = await fetchIdeas({
        id: businessId,
        form: initForm,
      }).unwrap();

      if (response?.data) {
        const responseIdeas: ApiResponse<TIdea[]> = await getIdeas({ businessId, sourceType }).unwrap();
        if (responseIdeas?.data) {
          dispatch(setIdeas(responseIdeas.data));
          toast.success(response.message);
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  const onSort = (key: 'score' | 'createdAt' | 'status') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const openConfirmDlg = async (e: React.MouseEvent, item: TIdea) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Idea",
      message: "Are you sure you want to delete this idea?",
    });

    if (ok) {
      try {
        const responseDelete = await deleteIdea(item.id).unwrap();
        if (responseDelete?.data) {
          toast.success(responseDelete.message);
        }

        const response: ApiResponse<TIdea[]> = await getIdeas({ businessId, sourceType }).unwrap();
        if (response?.data) {
          dispatch(setIdeas(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  const openEditIdea = (item: TIdea) => {
    setSelectedIdea(item);
    setOpen(true);
  };

  const openText = (text: string) => {
    setSelectedText(text);
    setOpenTextDlg(true);
  };

  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">{title}</h2>

            <div className="flex items-center gap-3">
              {competitors && competitors.length > 0 && (
                <Select
                  isMulti
                  placeholder="Select Competitors"
                  options={competitorsOptions}
                  value={competitorsOptions.filter((option: { value: string; label: string }) =>
                    competitorsIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setCompetitorsIds(selected.map((option: any) => option.value));
                  }}
                  styles={centeredSelectStyles}
                />
              )}

              <Select
                isMulti
                placeholder="Select Status"
                options={statusOptions}
                value={statusOptions.filter((option) => statusFilter.includes(option.value))}
                onChange={(selected) => {
                  setStatusFilter(selected.map((option) => option.value));
                }}
                styles={centeredSelectStyles}
              />

              <button
                disabled={isLoadingFetch}
                onClick={() => getIdeasData()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center text-nowrap"
              >
                {isLoadingFetch ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Getting Ideas...
                  </>
                ) : (
                  "Get Ideas"
                )}
              </button>
            </div>
          </div>

          <div className="w-full mx-auto p-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                      Title
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                      Description
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                      Competitor
                    </th>
                    <th
                      onClick={() => onSort('score')}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Score {sortKey === 'score' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th
                      onClick={() => onSort('status')}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Status {sortKey === 'status' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th
                      onClick={() => onSort('createdAt')}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Created At {sortKey === 'createdAt' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                      Url
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedItems && paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={header.length} className="py-6 text-center text-slate-400">
                        No data
                      </td>
                    </tr>
                  ) : (
                    paginatedItems &&
                    paginatedItems.map((item: TIdea) => (
                      <tr key={item.id} className="bg-white hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <p>{item.title}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <p className="line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-2 text-slate-500 mt-3">
                            <Eye
                              size={20}
                              onClick={() => openText(item.description)}
                              className="cursor-pointer text-blue-600 hover:text-blue-700"
                            />
                            <Copy
                              size={18}
                              onClick={() => copy(item.description)}
                              className="cursor-pointer text-blue-600 hover:text-blue-700"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <Link
                            to={`/profile/businesses/${businessId}/competitors/${item.competitorId}`}
                            className="text-blue-600"
                          >
                            {competitorsMap.get(item.competitorId) ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.score}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left text-nowrap">
                          {toDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <a href={item.url} className="text-blue-600 text-left" target="_blank" rel="noreferrer">
                            <ExternalLink size={18} strokeWidth={2} />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEditIdea(item)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-50"
                            >
                              ✎
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirmDlg(e, item);
                              }}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full flex items-center border-t p-4 justify-between">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={!hasPrev}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
              >
                Prev
              </button>
              <button
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      <UpdateIdeaDlg
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedIdea(null);
        }}
        idea={selectedIdea}
        sourceType={sourceType}
      />

      <TextDlg
        open={openTextDlg}
        onClose={() => {
          setOpenTextDlg(false);
        }}
        text={selectedText}
      />
    </div>
  );
}

export default IdeasTable;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/business/components/Competitors/Ideas/components/ideasTable/IdeasTable.tsx
git commit -m "feat: create shared IdeasTable component with sourceType and status filter"
```

---

### Task 5: Update `UpdateIdeaDlg` to pass `sourceType` when refetching

**Files:**
- Modify: `src/pages/admin/business/components/Competitors/Ideas/components/updateIdeaDlg/UpdateIdeaDlg.tsx`

The dialog calls `getIdeas` after updating — it now needs `sourceType`.

- [ ] **Step 1: Accept `sourceType` prop and pass it to `getIdeas`**

Add `IdeaSourceType` import:
```typescript
import { IdeaSourceType } from "../../../../../../../../enum/IdeaSourceType";
```

Change the function signature from:
```typescript
function UpdateIdeaDlg({ open, onClose, idea }: any) {
```
to:
```typescript
function UpdateIdeaDlg({ open, onClose, idea, sourceType }: { open: boolean; onClose: () => void; idea: TIdea | null; sourceType: IdeaSourceType }) {
```

Change the `getIdeas` call on line 69 from:
```typescript
const responseIdeas: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();
```
to:
```typescript
const responseIdeas: ApiResponse<TIdea[]> = await getIdeas({ businessId, sourceType }).unwrap();
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/business/components/Competitors/Ideas/components/updateIdeaDlg/UpdateIdeaDlg.tsx
git commit -m "feat: pass sourceType to getIdeas in UpdateIdeaDlg"
```

---

### Task 6: Create 4 page wrapper components

**Files:**
- Create: `src/pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas.tsx`
- Create: `src/pages/admin/business/components/Competitors/Ideas/InstagramPostsIdeas.tsx`
- Create: `src/pages/admin/business/components/Competitors/Ideas/InstagramReelsIdeas.tsx`
- Create: `src/pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas.tsx`

- [ ] **Step 1: Create `FacebookPostsIdeas.tsx`**

```typescript
import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function FacebookPostsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.FacebookPost} title="Facebook Posts Ideas" />;
}

export default FacebookPostsIdeas;
```

- [ ] **Step 2: Create `InstagramPostsIdeas.tsx`**

```typescript
import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function InstagramPostsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.InstagramPost} title="Instagram Posts Ideas" />;
}

export default InstagramPostsIdeas;
```

- [ ] **Step 3: Create `InstagramReelsIdeas.tsx`**

```typescript
import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function InstagramReelsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.InstagramReel} title="Instagram Reels Ideas" />;
}

export default InstagramReelsIdeas;
```

- [ ] **Step 4: Create `MetaAdsIdeas.tsx`**

```typescript
import React from "react";
import IdeasTable from "./components/ideasTable/IdeasTable";
import { IdeaSourceType } from "../../../../../../enum/IdeaSourceType";

function MetaAdsIdeas() {
  return <IdeasTable sourceType={IdeaSourceType.FacebookAd} title="Meta Ads Ideas" />;
}

export default MetaAdsIdeas;
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas.tsx \
       src/pages/admin/business/components/Competitors/Ideas/InstagramPostsIdeas.tsx \
       src/pages/admin/business/components/Competitors/Ideas/InstagramReelsIdeas.tsx \
       src/pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas.tsx
git commit -m "feat: create 4 idea page wrappers by source type"
```

---

### Task 7: Update routing in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the Ideas import and add 4 new imports**

Remove import on line 49:
```typescript
import Ideas from "./pages/admin/business/components/Competitors/Ideas/Ideas";
```

Add 4 new imports:
```typescript
import FacebookPostsIdeas from "./pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas";
import InstagramPostsIdeas from "./pages/admin/business/components/Competitors/Ideas/InstagramPostsIdeas";
import InstagramReelsIdeas from "./pages/admin/business/components/Competitors/Ideas/InstagramReelsIdeas";
import MetaAdsIdeas from "./pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas";
```

- [ ] **Step 2: Replace the route on line 140**

Remove:
```tsx
<Route path="ideas" element={<Ideas />}></Route>
```

Add:
```tsx
<Route path="ideas/facebook-posts" element={<FacebookPostsIdeas />} />
<Route path="ideas/instagram-posts" element={<InstagramPostsIdeas />} />
<Route path="ideas/instagram-reels" element={<InstagramReelsIdeas />} />
<Route path="ideas/meta-ads" element={<MetaAdsIdeas />} />
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace single /ideas route with 4 source-type routes"
```

---

### Task 8: Update sidebar in `Business.tsx`

**Files:**
- Modify: `src/pages/admin/business/:id/Business.tsx`

- [ ] **Step 1: Replace the `ideas` entry in `tabsCompetitors` array (lines 77-88)**

From:
```typescript
const tabsCompetitors = [
  {
    id: "competitors",
    title: "Competitors",
    icon: Swords,
  },
  {
    id: "ideas",
    title: "Competitors Ideas",
    icon: Lightbulb,
  },
]
```

To:
```typescript
const tabsCompetitors = [
  {
    id: "competitors",
    title: "Competitors",
    icon: Swords,
  },
  {
    id: "ideas/facebook-posts",
    title: "Facebook Posts Ideas",
    icon: Lightbulb,
  },
  {
    id: "ideas/instagram-posts",
    title: "Instagram Posts Ideas",
    icon: Lightbulb,
  },
  {
    id: "ideas/instagram-reels",
    title: "Instagram Reels Ideas",
    icon: Lightbulb,
  },
  {
    id: "ideas/meta-ads",
    title: "Meta Ads Ideas",
    icon: Lightbulb,
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add "src/pages/admin/business/:id/Business.tsx"
git commit -m "feat: add 4 idea source type items to sidebar"
```

---

### Task 9: Delete old `Ideas.tsx`

**Files:**
- Delete: `src/pages/admin/business/components/Competitors/Ideas/Ideas.tsx`

- [ ] **Step 1: Delete the old page file**

```bash
git rm src/pages/admin/business/components/Competitors/Ideas/Ideas.tsx
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: remove old monolithic Ideas page"
```

---

### Task 10: Build verification

- [ ] **Step 1: Run build to check for TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: If build fails, fix any import/type issues and re-run**

Common issues to check:
- Import paths (deep relative paths are error-prone)
- `getIdeas` callers — anywhere else in the codebase that calls `getIdeas(businessId)` with a plain string needs updating to `getIdeas({ businessId, sourceType })`
- `TIdeaParams` — `sourceType` is now required, so ensure all `fetchIdeas` callers pass it

- [ ] **Step 3: Commit any fixes**

```bash
git add -u
git commit -m "fix: resolve build errors after ideas page split"
```

---

### Task 11: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm start
```

- [ ] **Step 2: Verify sidebar shows 4 new items** under Competitors section

- [ ] **Step 3: Click each sidebar item** — verify page loads with correct title and fetches data filtered by source type

- [ ] **Step 4: Test status filter** — select a status, verify table filters correctly

- [ ] **Step 5: Test competitor filter** — verify existing filter still works

- [ ] **Step 6: Test "Get Ideas" button** — verify it fetches new ideas for the correct source type

- [ ] **Step 7: Test edit/delete** — verify UpdateIdeaDlg works and refetches correctly

- [ ] **Step 8: Verify old `/ideas` route returns 404 or blank** — confirm it no longer exists
