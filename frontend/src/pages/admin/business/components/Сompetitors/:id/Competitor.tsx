import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { usePagination } from "../../../../../../hooks/usePagination";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../store";
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useGetCompetitorMutation,
  useGenerateReportMutation,
  useGetPostsMutation,
  useGetAdsMutation,
} from "../../../../../../store/competitor/competitorApi";
import { setCompetitor, setPosts, setAds } from "../../../../../../store/competitor/competitorSlice";

// Components
import CreateCompetitorDlg from "../createCompetitorsDlg/CreateCompetitorDlg";
import GetPostsDlg from "../getPostsDlg/GetPostsDlg";
import VideoDlg from "../../../../../../components/videoDlg/VideoDlg";

// Utils
import { showError } from "../../../../../../utils/showError";

// Models
import { TCompetitor } from "../../../../../../models/Competitor";
import { ApiResponse } from "../../../../../../models/ApiResponse";
import {toDate} from "../../../../../../utils/toDate";

function Competitor() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [ open, setOpen ] = useState(false);
  const [ openPostsDlg, setOpenPostsDlg ] = useState<any>(null);

  const [ openVideoDlg, setOpenVideoDlg ] = useState<any>(null);
  const [ selectedVideo, setSelectedVideo ] = useState<any>(null);

  const [ selectedCompetitor, setSelectedCompetitor ] = useState<TCompetitor | null>(null);
  const header = [
    { name: "Media", key: "media" },
    { name: "Text", key: "text" },
    { name: "Platform", key: "platform" },
    { name: "Likes", key: "likes" },
    { name: "Shares", key: "shares" },
    { name: "Views Count", key: "viewsCount" },
    { name: "Posted At", key: "postedAt" },
    { name: "Post URL", key: "url" },
  ];

  const [sortKey, setSortKey] = useState<'postedAt' | 'likes' | 'shares' | 'viewsCount'>('postedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [ getCompetitor ] = useGetCompetitorMutation();
  const [ generateReport ] = useGenerateReportMutation();
  const [ getPosts ] = useGetPostsMutation();
  const [ getAds, { isLoading: isLoadingAds }] = useGetAdsMutation();

  const { competitor, posts } = useSelector((state: RootState) => state.competitorModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(id) {
          const response: ApiResponse<TCompetitor> = await getCompetitor(id).unwrap();
          const responsePosts: ApiResponse<any> = await getPosts(id).unwrap();

          console.log("POSTS ", responsePosts.data)

          if(response && response.data) dispatch(setCompetitor(response.data));
          if(responsePosts && responsePosts.data) dispatch(setPosts(responsePosts.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const sortedPosts = useMemo(() => {
    if (!posts?.length) return [];

    return [...posts].sort((a, b) => {
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
  }, [posts, sortKey, sortDir]);

  const {
    page,
    setPage,
    totalPages,
    paginatedItems,
    hasPrev,
    hasNext,
  } = usePagination({
    items: sortedPosts,
    pageSize: 5,
    resetDeps: [sortKey, sortDir],
  });

  if(!id) return null;

  // Edit Competitor
  const openEditCompetitor = async () => {
    setSelectedCompetitor(competitor);
    setOpen(true);
  }

  // Get Posts
  const openGetPostsDlg = async () => {
    setOpenPostsDlg(true);
  }

  // Get Ads
  const getAdsData = async () => {
    try {
      const response: ApiResponse<any> = await getAds(id).unwrap();

      if(response && response?.data) {
        toast.success(response.message);
        dispatch(setAds(response.data));
      }
    } catch (error: any) {
      showError(error);
    }
  }

  // Open Video
  const openVideo = (url: string) => {
    setSelectedVideo(url);
    setOpenVideoDlg(true);
  }

  // Sort Posts
  const onSort = (key: 'likes' | 'shares' | 'viewsCount' | 'postedAt') => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center border-b p-4 justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Competitor</h2>

          <button
            onClick={() => openEditCompetitor()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Edit Competitor
          </button>

          <CreateCompetitorDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedCompetitor(null);
            }}
            competitor={selectedCompetitor}
          ></CreateCompetitorDlg>
        </div>

        <div className="w-full">
          { competitor ? (
            <div className="w-full space-y-3 text-slate-700 text-sm p-6">
              <div className="w-full flex justify-between border-b pb-2">
                <span className="font-medium">Name</span>
                <span className="text-slate-500">{competitor?.name}</span>
              </div>

              <div className="w-full flex justify-between border-b pb-2">
                <span className="font-medium">Facebook Link</span>
                <a href={competitor?.facebookLink} target="blank" className="text-blue-600 underline cursor-pointer">{competitor.facebookLink}</a>
              </div>

              <div className="w-full flex justify-between border-b pb-2">
                <span className="font-medium">Active</span>
                <span className={`
                  inline-flex items-center rounded-full px-2.5 py-1
                  text-xs font-medium
                  ${competitor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                `}>
                   {competitor.isActive ? "Yes" : "No"}
                </span>
              </div>
            </div>
          ) : (
            "None"
          )}
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center border-b p-4 justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Posts</h2>

          <button
            onClick={() => openGetPostsDlg()}
            className={`
              px-4 py-2 rounded-lg shadow text-white
              flex items-center gap-2 justify-center min-w-[170px]
              bg-blue-600 hover:bg-blue-700
            `}
          >
              Get Posts
          </button>

          <GetPostsDlg
            open={openPostsDlg}
            onClose={() => {
              setOpenPostsDlg(false);
            }}
          ></GetPostsDlg>
        </div>

        <div className="w-full mx-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left">
                    Media
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left">
                    Text
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left">
                    Platform
                  </th>

                  <th
                    onClick={() => onSort('likes')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Likes {sortKey === 'likes' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th
                    onClick={() => onSort('shares')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Shares {sortKey === 'shares' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th
                    onClick={() => onSort('viewsCount')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Views {sortKey === 'viewsCount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th
                    onClick={() => onSort('postedAt')}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left text-nowrap"
                  >
                    Posted At {sortKey === 'postedAt' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide ursor-pointer select-none text-slate-600 text-left text-nowrap">
                    Post URL
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
              { paginatedItems && paginatedItems?.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    className="py-6 text-center text-slate-400"
                  >
                    No data
                  </td>
                </tr>
              ) : (
                paginatedItems && paginatedItems?.map((item: any) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      <div className="h-25 w-20 bg-slate-200 rounded-lg overflow-hidden">
                        {item.media[0].url ? (
                          <div className="relative">
                            <video src={item.media[0].url}></video>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <div onClick={() => openVideo(item.media[0].url)} className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer">
                                <Play size={20} strokeWidth={2} color="white"></Play>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={item.media[0].thumbnail} alt=""/>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.text }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.platform }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.likes }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.shares }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">{ item.viewsCount }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm text-nowrap">{ toDate(item.postedAt) }</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      <a href={item.url} className="text-blue-600 text-left" target="_blank">
                        <ExternalLink size={18} strokeWidth={2} ></ExternalLink>
                      </a>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 mb-5 px-5 ">
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
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center border-b p-4 justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Ads</h2>

          <button
            onClick={() => getAdsData()}
            className={`
              px-4 py-2 rounded-lg shadow text-white
              flex items-center gap-2 justify-center min-w-[170px]
              bg-blue-600 hover:bg-blue-700
            `}
          >
            {isLoadingAds ? (
              <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Getting...
              </>
            ) : (
              "Get Ads"
            )}
          </button>
        </div>
      </div>

      <VideoDlg
        open={openVideoDlg}
        onClose={() => {
          setOpenVideoDlg(false);
        }}
        videoUrl={selectedVideo}
      />
    </section>
  )
}

export default Competitor;