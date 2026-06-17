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
import {
  useGetIdeasMutation,
  useFetchIdeasMutation,
  useDeleteIdeaMutation,
} from "../../../../../../../../store/idea/ideaApi";
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
import { TIdea, TIdeaParams } from "../../../../../../../../models/Idea";
import { TCompetitor } from "../../../../../../../../models/Competitor";

// Enums
import { IdeaSourceType } from "../../../../../../../../enum/IdeaSourceType";
import { IdeaStatus } from "../../../../../../../../enum/IdeaStatus";
import { StylesConfig, GroupBase } from "react-select";

type SelectOption = { value: string; label: string };

// centeredSelectStyles is typed as StylesConfig<unknown> — cast for typed Select usage
const typedSelectStyles = centeredSelectStyles as StylesConfig<SelectOption, true, GroupBase<SelectOption>>;

type Props = {
  sourceType: IdeaSourceType;
  title: string;
};

// TIdea may carry a url from the API even if not declared in the model yet
type TIdeaWithUrl = TIdea & { url?: string };

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

const statusOptions = Object.values(IdeaStatus).map((status) => ({
  value: status,
  label: status,
}));

function IdeasTable({ sourceType, title }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [fetchIdeas, { isLoading: isLoadingFetch }] = useFetchIdeasMutation();
  const [getIdeas] = useGetIdeasMutation();
  const [getCompetitors] = useGetCompetitorsMutation();
  const [deleteIdea] = useDeleteIdeaMutation();

  const { ideas } = useSelector((state: RootState) => state.ideaModule);
  const { competitors } = useSelector((state: RootState) => state.competitorModule);

  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"createdAt" | "score" | "status">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIdea, setSelectedIdea] = useState<TIdea | null>(null);
  const [competitorsIds, setCompetitorsIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [openTextDlg, setOpenTextDlg] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const { copy } = useCopyToClipboard();

  const competitorsOptions = useMemo(
    () =>
      competitors?.map((competitor: TCompetitor) => ({
        value: competitor.id,
        label: competitor.name,
      })) ?? [],
    [competitors]
  );

  // Yesterday at midnight — stable reference, only computed once
  const initForm = useMemo<TIdeaParams>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return { onlyPostsNewerThan: date, sourceType };
  }, [sourceType]);

  // Load ideas and competitors for this sourceType on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const [response, responseCompetitors] = await Promise.all([
            getIdeas({ businessId, sourceType }).unwrap(),
            getCompetitors(businessId).unwrap(),
          ]);

          if (response?.data) dispatch(setIdeas(response.data));
          if (responseCompetitors?.data) dispatch(setCompetitors(responseCompetitors.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch, businessId, sourceType]);

  const competitorsMap = useMemo(() => {
    const map = new Map<string, string>();
    (competitors ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [competitors]);

  const filteredIdeas: TIdea[] = useMemo(() => {
    if (!ideas?.length) return [];

    let result = ideas as TIdea[];

    if (competitorsIds.length) {
      const selected = new Set(competitorsIds);
      result = result.filter((i) => i.competitorId && selected.has(i.competitorId));
    }

    if (statusFilter.length) {
      const selected = new Set(statusFilter);
      result = result.filter((i) => selected.has(i.status));
    }

    return result;
  }, [ideas, competitorsIds, statusFilter]);

  const sortedIdeas: TIdea[] = useMemo(() => {
    if (!filteredIdeas.length) return [];

    return [...filteredIdeas].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "createdAt") {
        const aTime = aVal ? new Date(aVal as Date).getTime() : 0;
        const bTime = bVal ? new Date(bVal as Date).getTime() : 0;
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

  const handleGetIdeas = async () => {
    try {
      const response: ApiResponse<TIdea[]> = await fetchIdeas({
        id: businessId,
        form: { onlyPostsNewerThan: initForm.onlyPostsNewerThan, sourceType },
      }).unwrap();

      if (response?.data) {
        const responseIdeas: ApiResponse<TIdea[]> = await getIdeas({
          businessId,
          sourceType,
        }).unwrap();

        if (responseIdeas?.data) {
          dispatch(setIdeas(responseIdeas.data));
          toast.success(response.message);
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleSort = (key: "score" | "createdAt" | "status") => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleDelete = async (e: React.MouseEvent, item: TIdea) => {
    e.stopPropagation();
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Idea",
      message: "Are you sure you want to delete this idea?",
    });

    if (ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteIdea(item.id).unwrap();
          if (responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<TIdea[]> = await getIdeas({
            businessId,
            sourceType,
          }).unwrap();
          if (response?.data) {
            dispatch(setIdeas(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }
  };

  const handleEditIdea = (item: TIdea) => {
    setSelectedIdea(item);
    setOpen(true);
  };

  const handleOpenText = (text: string) => {
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
                <Select<{ value: string; label: string }, true>
                  isMulti
                  placeholder="Select Competitors"
                  options={competitorsOptions}
                  value={competitorsOptions.filter((option) =>
                    competitorsIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setCompetitorsIds(selected.map((option) => option.value));
                  }}
                  styles={typedSelectStyles}
                />
              )}

              <Select<{ value: string; label: string }, true>
                isMulti
                placeholder="Select Status"
                options={statusOptions}
                value={statusOptions.filter((option) => statusFilter.includes(option.value))}
                onChange={(selected) => {
                  setStatusFilter(selected.map((option) => option.value));
                }}
                styles={typedSelectStyles}
              />

              <button
                disabled={isLoadingFetch}
                onClick={handleGetIdeas}
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
                      onClick={() => handleSort("score")}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Score {sortKey === "score" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>

                    <th
                      onClick={() => handleSort("status")}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Status {sortKey === "status" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>

                    <th
                      onClick={() => handleSort("createdAt")}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Created At {sortKey === "createdAt" ? (sortDir === "desc" ? "↓" : "↑") : ""}
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
                    paginatedItems.map((item: TIdeaWithUrl) => (
                      <tr key={item.id} className="bg-white hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <p>{item.title}</p>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <p className="line-clamp-2">{item.description}</p>

                          <div className="flex items-center gap-2 text-slate-500 mt-3">
                            <Eye
                              size={20}
                              onClick={() => handleOpenText(item.description)}
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

                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          {item.score}
                        </td>

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
                          <a
                            href={item.url}
                            className="text-blue-600 text-left"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={18} strokeWidth={2} />
                          </a>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleEditIdea(item)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-50"
                            >
                              ✎
                            </button>

                            <button
                              onClick={(e) => handleDelete(e, item)}
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
        onClose={() => setOpenTextDlg(false)}
        text={selectedText ?? ""}
      />
    </div>
  );
}

export default IdeasTable;
