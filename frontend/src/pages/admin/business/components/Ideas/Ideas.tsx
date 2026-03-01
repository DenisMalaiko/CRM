import React, {useEffect, useMemo, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { usePagination } from "../../../../../hooks/usePagination";
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipboard";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetIdeasMutation, useFetchIdeasMutation } from "../../../../../store/idea/ideaApi";
import { setIdeas } from "../../../../../store/idea/ideaSlice";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";
import { toDate } from "../../../../../utils/toDate";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TIdea, TIdeaParams } from "../../../../../models/Idea";


function Ideas() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ fetchIdeas, { isLoading: isLoadingFetch } ] = useFetchIdeasMutation();
  const [ getIdeas, { isLoading: isLoadingGet } ] = useGetIdeasMutation();
  const { ideas } = useSelector((state: RootState) => state.ideaModule)

  const [sortKey, setSortKey] = useState<'createdAt' | 'score'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Init Form
  const initForm = useMemo<TIdeaParams>(() => {
    const date = new Date();

    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);

    return {
      onlyPostsNewerThan: date,
    };
  }, []);

  const header = [
    { name: "Title", key: "title" },
    { name: "Description", key: "description" },
    { name: "Score", key: "score" },
    { name: "Created At", key: "createdAt" }
  ]

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();

          if(response && response?.data) {
            console.log("IDEAS", response.data);
            dispatch(setIdeas(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const sortedIdeas = useMemo(() => {
    if (!ideas?.length) return [];

    return [...ideas].sort((a, b) => {
      if (sortKey === 'createdAt') {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        return sortDir === 'desc'
          ? bTime - aTime
          : aTime - bTime;
      }

      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;

      return sortDir === 'desc'
        ? bVal - aVal
        : aVal - bVal;
    });
  }, [ideas, sortKey, sortDir]);

  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedIdeas,
    pageSize: 10,
    resetDeps: [sortKey, sortDir],
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
  const onSort = (key: 'score' | 'createdAt') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Posts Ideas</h2>

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
                      onClick={() => onSort('score')}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Score {sortKey === 'score' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </th>

                    <th
                      onClick={() => onSort('createdAt')}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                    >
                      Created At {sortKey === 'createdAt' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
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
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.title}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.description}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.score}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-left">{ toDate(item.createdAt) }</td>
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
    </div>
  )
}

export default Ideas;