import React, { useEffect, useState, useMemo } from "react";
import { Eye, Copy, ExternalLink, Play } from "lucide-react";
import { useParams } from "react-router-dom";

// Hooks
import { usePagination } from "../../../../../../../../../hooks/usePagination";
import { useCopyToClipboard } from "../../../../../../../../../hooks/useCopyToClipboard";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../../store";
import { useAppDispatch } from "../../../../../../../../../store/hooks";
import { useGetAdsMutation } from "../../../../../../../../../store/competitor/competitorApi";
import { setAds } from "../../../../../../../../../store/competitor/competitorSlice";

// Components
import VideoDlg from "../../../../../../../../../components/videoDlg/VideoDlg";
import TextDlg from "../../../../../../../../../components/textDlg/TextDlg";
import FetchAdsDlg from "../fetchAdsDlg/FetchAdsDlg";

// Models
import { ApiResponse } from "../../../../../../../../../models/ApiResponse";
import { toDate } from "../../../../../../../../../utils/toDate";
import { showError } from "../../../../../../../../../utils/showError";

function AdsTable() {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [ openAdsDlg, setOpenAdsDlg ] = useState<any>(null);
  const [ openVideoDlg, setOpenVideoDlg ] = useState<any>(null);
  const [ selectedVideo, setSelectedVideo ] = useState<any>(null);

  const [ openTextDlg, setOpenTextDlg ] = useState<any>(null);
  const [ selectedText, setSelectedText ] = useState<any>(null);

  const [sortKey, setSortKey] = useState<'postedAt' | 'likes' | 'shares' | 'viewsCount'>('postedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [ getAds ] = useGetAdsMutation();

  const { ads } = useSelector((state: RootState) => state.competitorModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(id) {
          console.log("ID ", id)
          const responseAds: ApiResponse<any> = await getAds(id).unwrap();

          console.log("ADS ", responseAds)
          if(responseAds && responseAds.data) dispatch(setAds(responseAds.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const sortedAds = useMemo(() => {
    if (!ads?.length) return [];

    return [...ads].sort((a, b) => {
      if (sortKey === 'postedAt') {
        const aTime = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const bTime = b.postedAt ? new Date(b.postedAt).getTime() : 0;

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
  }, [ads, sortKey, sortDir]);

  const { copy, copied } = useCopyToClipboard();
  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedAds,
    pageSize: 5,
    resetDeps: [sortKey, sortDir],
  });

  if(!id) return null;

  // Get Ads
  const openGetAdsDlg = async () => {
    setOpenAdsDlg(true);
  }

  // Open Video
  const openVideo = (url: string) => {
    setSelectedVideo(url);
    setOpenVideoDlg(true);
  }

  // Sort Ads
  const onSort = (key: 'likes' | 'shares' | 'viewsCount' | 'postedAt') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Open Text
  const openText = (text: string) => {
    setSelectedText(text);
    setOpenTextDlg(true);
  }

  return (
    <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
      <div className="w-full flex items-center border-b p-4 justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Ads</h2>

        <button
          onClick={() => openGetAdsDlg()}
          className={`
            px-4 py-2 rounded-lg shadow text-white
            flex items-center gap-2 justify-center
            bg-blue-600 hover:bg-blue-700
          `}
        >
          Get Ads
        </button>

        <FetchAdsDlg
          open={openAdsDlg}
          onClose={() => {
            setOpenAdsDlg(false);
          }}
        ></FetchAdsDlg>
      </div>


      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Media
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Title
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Text
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Platform
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Cta Text
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Start
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Active Days
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            { paginatedItems && paginatedItems?.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-6 text-center text-slate-400"
                >
                  No data
                </td>
              </tr>
            ) : (
              paginatedItems && paginatedItems?.map((item: any) => (
                <tr key={item.id} className="bg-white hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">
                    <div className="h-32 w-20 bg-slate-200 rounded-lg overflow-hidden">
                      {item.images && item.images.length ? (
                        item.images[0].original_image_url ? (
                          <div className="relative w-full h-full flex">
                            <img src={item.images[0].original_image_url} alt=""/>
                          </div>
                        ) : (
                          <img src={item.media[0].original_image_url} alt=""/>
                        )
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-center h-full">
                          No media
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.title }</td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">
                    <p className="line-clamp-4">{ item.body }</p>
                    <div className="flex items-center gap-2 text-slate-500 mt-3">
                      <Eye
                        size={20}
                        onClick={() => openText(item.body)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      />
                      <Copy
                        size={18}
                        onClick={() => copy(item.body)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.platform }</td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.ctaText }</td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm text-nowrap">{ toDate(item.start) }</td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.active_days }</td>

                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-1
                      text-xs font-medium
                      ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                    `}>
                       {item.isActive ? "Yes" : "No"}
                      </span>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>


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

export default AdsTable;