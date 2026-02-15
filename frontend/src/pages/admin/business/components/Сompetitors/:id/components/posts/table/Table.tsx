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
import { useGetPostsMutation } from "../../../../../../../../../store/competitor/competitorApi";
import { setPosts } from "../../../../../../../../../store/competitor/competitorSlice";

// Components
import VideoDlg from "../../../../../../../../../components/videoDlg/VideoDlg";
import TextDlg from "../../../../../../../../../components/textDlg/TextDlg";
import FetchPostsDlg from "../fetchPostsDlg/FetchPostsDlg";

// Models
import { ApiResponse } from "../../../../../../../../../models/ApiResponse";
import { toDate } from "../../../../../../../../../utils/toDate";
import { showError } from "../../../../../../../../../utils/showError";

function PostsTable() {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [ openPostsDlg, setOpenPostsDlg ] = useState<any>(null);
  const [ openVideoDlg, setOpenVideoDlg ] = useState<any>(null);
  const [ selectedVideo, setSelectedVideo ] = useState<any>(null);

  const [ openTextDlg, setOpenTextDlg ] = useState<any>(null);
  const [ selectedText, setSelectedText ] = useState<any>(null);

  const [sortKey, setSortKey] = useState<'postedAt' | 'likes' | 'shares' | 'viewsCount'>('postedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [ getPosts ] = useGetPostsMutation();

  const { posts } = useSelector((state: RootState) => state.competitorModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(id) {
          const responsePosts: ApiResponse<any> = await getPosts(id).unwrap();

          console.log("POSTS ", responsePosts.data)
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

  const { copy, copied } = useCopyToClipboard();
  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedPosts,
    pageSize: 5,
    resetDeps: [sortKey, sortDir],
  });

  if(!id) return null;

  // Get Posts
  const openGetPostsDlg = async () => {
    setOpenPostsDlg(true);
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

  // Open Text
  const openText = (text: string) => {
    setSelectedText(text);
    setOpenTextDlg(true);
  }

  return (
    <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
      <div className="w-full flex items-center border-b p-4 justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Posts</h2>

        <button
          onClick={() => openGetPostsDlg()}
          className={`
            px-4 py-2 rounded-lg shadow text-white
            flex items-center gap-2 justify-center
            bg-blue-600 hover:bg-blue-700
          `}
        >
          Get Posts
        </button>

        <FetchPostsDlg
          open={openPostsDlg}
          onClose={() => {
            setOpenPostsDlg(false);
          }}
        ></FetchPostsDlg>
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
                  Text
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left">
                  Platform
                </th>

                <th
                  onClick={() => onSort('likes')}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                >
                  Likes {sortKey === 'likes' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>

                <th
                  onClick={() => onSort('shares')}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                >
                  Shares {sortKey === 'shares' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>

                <th
                  onClick={() => onSort('viewsCount')}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                >
                  Views {sortKey === 'viewsCount' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>

                <th
                  onClick={() => onSort('postedAt')}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap"
                >
                  Posted At {sortKey === 'postedAt' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-slate-600 text-left text-nowrap">
                  Post URL
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
                      {item.media && item.media.length ? (
                        item.media[0].url ? (
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
                        )
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-center h-full">
                          No media
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left text-sm">
                    <p className="line-clamp-4">{ item.text }</p>
                    <div className="flex items-center gap-2 text-slate-500 mt-3">
                      <Eye
                        size={20}
                        onClick={() => openText(item.text)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      />
                      <Copy
                        size={18}
                        onClick={() => copy(item.text)}
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      />
                    </div>
                  </td>
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

      <VideoDlg
        open={openVideoDlg}
        onClose={() => {
          setOpenVideoDlg(false);
        }}
        videoUrl={selectedVideo}
      />

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

export default PostsTable;