import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Copy } from "lucide-react";

// Hooks
import { usePagination } from "../../../../../hooks/usePagination";
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipboard";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import TextDlg from "../../../../../components/textDlg/TextDlg";
import GenerateContentPlanDlg from "./components/GenerateContentPlanDlg";
import UpdateContentPlanDlg from "./components/UpdateContentPlanDlg";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  useLazyGetContentPlansQuery,
  useDeleteContentPlanMutation,
} from "../../../../../store/contentPlan/contentPlanApi";
import { setContentPlans } from "../../../../../store/contentPlan/contentPlanSlice";

// Utils
import { showError } from "../../../../../utils/showError";
import { getStatusClass } from "../../../../../utils/getStatusClass";
import { toDate } from "../../../../../utils/toDate";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TContentPlan } from "../../../../../models/ContentPlan";

const COLUMNS = [
  { name: "Title", key: "title" },
  { name: "Description", key: "description" },
  { name: "Status", key: "status" },
  { name: "Mode", key: "mode" },
  { name: "Created At", key: "createdAt" },
  { name: "Actions", key: "actions" },
];

function ContentPlan() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ getContentPlans ] = useLazyGetContentPlansQuery();
  const [ deleteContentPlan ] = useDeleteContentPlanMutation();

  const { contentPlans } = useSelector((state: RootState) => state.contentPlanModule);

  const [ open, setOpen ] = useState(false);
  const [ sortKey, setSortKey ] = useState<'createdAt' | 'status'>('createdAt');
  const [ sortDir, setSortDir ] = useState<'asc' | 'desc'>('desc');
  const [ openEdit, setOpenEdit ] = useState(false);
  const [ selectedPlan, setSelectedPlan ] = useState<TContentPlan | null>(null);
  const [ openTextDlg, setOpenTextDlg ] = useState(false);
  const [ selectedText, setSelectedText ] = useState<string | null>(null);

  const { copy } = useCopyToClipboard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TContentPlan[]> = await getContentPlans(businessId).unwrap();
          if (response && response.data) dispatch(setContentPlans(response.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const sortedPlans: TContentPlan[] = useMemo(() => {
    if (!contentPlans?.length) return [];

    return [...contentPlans].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "createdAt") {
        const aTime = aVal ? new Date(aVal as string | Date).getTime() : 0;
        const bTime = bVal ? new Date(bVal as string | Date).getTime() : 0;
        return sortDir === "desc" ? bTime - aTime : aTime - bTime;
      }

      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");

      return sortDir === "desc" ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
  }, [contentPlans, sortKey, sortDir]);

  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedPlans,
    pageSize: 5,
    resetDeps: [sortKey, sortDir],
  });

  if (!businessId) return null;

  const onSort = (key: 'createdAt' | 'status') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const openConfirmDlg = async (e: React.MouseEvent, item: TContentPlan) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Content Plan",
      message: "Are you sure you want to delete this content plan?",
    });

    if (ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteContentPlan(item.id).unwrap();
          if (responseDelete && responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<TContentPlan[]> = await getContentPlans(businessId).unwrap();
          if (response && response?.data) {
            dispatch(setContentPlans(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  const openEditPlan = (item: TContentPlan) => {
    setSelectedPlan(item);
    setOpenEdit(true);
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
            <h2 className="text-lg text-left font-semibold text-slate-800">Content Plan</h2>

            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              Generate
            </button>
          </div>
        </section>

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

                  <th
                    onClick={() => onSort('status')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Status {sortKey === 'status' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                    Mode
                  </th>

                  <th
                    onClick={() => onSort('createdAt')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Created At {sortKey === 'createdAt' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedItems && paginatedItems?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="py-6 text-center text-slate-400"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  paginatedItems && paginatedItems.map((item: TContentPlan) => (
                    <tr key={item.id} className="bg-white hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.title}</td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                        <>
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
                        </>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                        <span className={`
                          inline-flex items-center rounded-full px-2.5 py-1
                          text-xs font-medium
                          ${getStatusClass(item.status)}
                        `}>
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left capitalize">{item.mode}</td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left text-nowrap">{toDate(item.createdAt)}</td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEditPlan(item)}
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
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
            >
              Prev
            </button>

            <button
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <GenerateContentPlanDlg
        open={open}
        onClose={() => setOpen(false)}
      />

      <UpdateContentPlanDlg
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedPlan(null);
        }}
        contentPlan={selectedPlan}
      />

      <TextDlg
        open={openTextDlg}
        onClose={() => {
          setOpenTextDlg(false);
        }}
        text={selectedText ?? ""}
      />
    </div>
  );
}

export default ContentPlan;
