import React, {useEffect, useMemo, useState} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ExternalLink, Eye, Copy } from "lucide-react";
import Select from "react-select";

// Hooks
import { usePagination } from "../../../../../hooks/usePagination";
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipboard";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetIdeasMutation, useFetchIdeasMutation, useDeleteIdeaMutation } from "../../../../../store/idea/ideaApi";
import { useGetCompetitorsMutation } from "../../../../../store/competitor/competitorApi";
import { setIdeas } from "../../../../../store/idea/ideaSlice";
import { setCompetitors } from "../../../../../store/competitor/competitorSlice";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import UpdateIdeaDlg from "./components/updateIdeaDlg/UpdateIdeaDlg";
import TextDlg from "../../../../../components/textDlg/TextDlg";

// Utils
import { showError } from "../../../../../utils/showError";
import { toDate } from "../../../../../utils/toDate";
import { getStatusClass } from "../../../../../utils/getStatusClass";
import { centeredSelectStyles } from "../../../../../utils/reactSelectStyles";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TIdea, TIdeaParams } from "../../../../../models/Idea";
import { TCompetitor } from "../../../../../models/Competitor";

function Ideas() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ fetchIdeas, { isLoading: isLoadingFetch } ] = useFetchIdeasMutation();
  const [ getIdeas, { isLoading: isLoadingGet } ] = useGetIdeasMutation();
  const [ getCompetitors ] = useGetCompetitorsMutation();
  const [ deleteIdea ] = useDeleteIdeaMutation();

  const { ideas } = useSelector((state: RootState) => state.ideaModule);
  const { competitors } = useSelector((state: RootState) => state.competitorModule);

  const [ open, setOpen ] = useState(false);
  const [ sortKey, setSortKey ] = useState<'createdAt' | 'score' | 'status'>('score');
  const [ sortDir, setSortDir ] = useState<'asc' | 'desc'>('desc');
  const [ selectedIdea, setSelectedIdea ] = useState<any | null>(null);
  const [ competitorsIds, setCompetitorsIds ] = useState<string[]>([]);
  const [ openTextDlg, setOpenTextDlg ] = useState<any>(null);
  const [ selectedText, setSelectedText ] = useState<any>(null);

  const competitorsOptions = competitors?.map((competitor: TCompetitor) => ({ value: competitor.id, label: competitor.name })) || [];

  // Init Form
  const initForm = useMemo<TIdeaParams>(() => {
    const date = new Date();

    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);

    return {
      onlyPostsNewerThan: date,
    };
  }, []);

  const header = [
    { name: "Title", key: "title" },
    { name: "Description", key: "description" },
    { name: "Score", key: "score" },
    { name: "Status", key: "status" },
    { name: "Created At", key: "createdAt" },
    { name: "Url", key: "url" },
    { name: "Actions", key: "actions" },
  ]

  const { copy, copied } = useCopyToClipboard();

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();
          const responseCompetitors: ApiResponse<TCompetitor[]> = await getCompetitors(businessId).unwrap();

          console.log("RESPONSE: ", response)

          if(response && response?.data) dispatch(setIdeas(response.data));
          if(responseCompetitors && responseCompetitors?.data) dispatch(setCompetitors(responseCompetitors.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const competitorsMap = useMemo(() => {
    const map = new Map<string, string>();
    (competitors ?? []).forEach(c => map.set(c.id, c.name));
    return map;
  }, [competitors]);

  const filteredIdeas: TIdea[] = useMemo(() => {
    if (!ideas?.length) return [];
    if (!competitorsIds.length) return ideas; // нічого не обрано — показуємо всі

    const selected = new Set(competitorsIds);
    return ideas.filter((i: TIdea) => i.competitorId && selected.has(i.competitorId));
  }, [ideas, competitorsIds]);

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
    resetDeps: [sortKey, sortDir, competitorsIds.join(",")],
  });

  if(!businessId) return null;

  // Fetch Ideas
  const getIdeasData = async () => {
    try {
      const response: ApiResponse<TIdea[]> = await fetchIdeas({
        id: businessId,
        form: {
          onlyPostsNewerThan: initForm.onlyPostsNewerThan
        }
      }).unwrap();

      if(response && response?.data) {
        dispatch(setIdeas(response.data))
        toast.success(response.message);
      }
    } catch (error: any) {
      showError(error);
    }
  }

  // Sort Ideas
  const onSort = (key: 'score' | 'createdAt' | 'status') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Delete Audience
  const openConfirmDlg = async (e: any, item: any) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Idea",
      message: "Are you sure you want to delete this idea?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteIdea(item.id).unwrap();
          if(responseDelete && responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<any[]> = await getIdeas(businessId).unwrap();
          if(response && response?.data) {
            dispatch(setIdeas(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Edit Idea
  const openEditIdea = async (item: TIdea) => {
    setSelectedIdea(item);
    setOpen(true)
  }

  // Open Text
  const openText = (text: string) => {
    setSelectedText(text);
    setOpenTextDlg(true);
  }

  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Posts Ideas</h2>


            <div className="flex items-center gap-3">
              { competitors && competitors?.length > 0 &&
                <Select
                  isMulti
                  placeholder="Select Competitors"
                  options={competitorsOptions}
                  value={competitorsOptions.filter((option: { value: string; label: string; }) =>
                    competitorsIds.includes(option.value)
                  )}
                  onChange={(selected) => {
                    setCompetitorsIds(selected.map((option: any) => option.value));
                  }}
                  styles={centeredSelectStyles}
                />
              }

              <button
                disabled={isLoadingFetch}
                onClick={() => getIdeasData()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
              >
                { isLoadingFetch ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                    Getting Ideas...
                  </>
                  ) : ("Get Ideas")
                }
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
                  {paginatedItems && paginatedItems?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={header.length}
                        className="py-6 text-center text-slate-400"
                      >
                        No data
                      </td>
                    </tr>
                  ) : (
                    paginatedItems && paginatedItems.map((item: any) => (
                      <tr key={item.id} className="bg-white hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <>
                            <p>{item.title}</p>
                          </>
                        </td>
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
                          <Link to={`/profile/businesses/${businessId}/competitors/${item.competitorId}`} className="text-blue-600">
                            {competitorsMap.get(item.competitorId) ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.score}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <span className={`
                            inline-flex items-center rounded-full px-2.5 py-1
                            text-xs font-medium
                            ${getStatusClass(item.status)}
                          `}>
                             {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left text-nowrap">{ toDate(item.createdAt) }</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">
                          <a href={item.url} className="text-blue-600 text-left" target="_blank">
                            <ExternalLink size={18} strokeWidth={2} ></ExternalLink>
                          </a>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEditIdea(item)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50"
                            >
                              ✎
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openConfirmDlg(e, item)
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
                className=" px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
              >
                Prev
              </button>

              <button
                disabled={!hasNext}
                onClick={() => setPage(p => p + 1)}
                className=" px-4 py-2 rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
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
      ></UpdateIdeaDlg>

      <TextDlg
        open={openTextDlg}
        onClose={() => {
          setOpenTextDlg(false);
        }}
        text={selectedText}
      />
    </div>
  )
}

export default Ideas;