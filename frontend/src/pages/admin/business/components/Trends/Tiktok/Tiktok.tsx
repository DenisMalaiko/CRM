import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MessageCircle } from "lucide-react";

// Redux
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { useLazyGetTikTokVideosByBusinessIdQuery, useFetchTikTokVideosMutation } from "../../../../../../store/trends/trendsApi";
import { setTiktokVideos } from "../../../../../../store/trends/trendsSlice";

// Utils
import { showError } from "../../../../../../utils/showError";

export function Tiktok() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getTikTokVideosByBusinessId, { isLoading } ] = useLazyGetTikTokVideosByBusinessIdQuery();
  const [ fetchTikTokVideos, { isLoading: isMutating } ] = useFetchTikTokVideosMutation();

  const { tiktokVideos } = useAppSelector((state) => state.trendsModule);



  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response = await getTikTokVideosByBusinessId(businessId).unwrap();
          if (response && response.data) dispatch(setTiktokVideos(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch, businessId, getTikTokVideosByBusinessId]);

  const getTrends = async () => {
    try {
      if (!businessId) return;
      await fetchTikTokVideos(businessId).unwrap();
      const response = await getTikTokVideosByBusinessId(businessId).unwrap();
      if (response && response.data) dispatch(setTiktokVideos(response.data));
    } catch (error) {
      showError(error);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Trends</h2>

          <button
            onClick={() => getTrends()}
            disabled={isLoading || isMutating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            { (isLoading || isMutating) ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Getting Trends...
              </>
            ) : ("Get Tiktok")
            }
          </button>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        {tiktokVideos?.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-2">
            <span className="text-gray-400">No data</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {tiktokVideos?.map((item: any) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center gap-3"></div>

                  <div className="flex items-center gap-3">
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50"
                    >
                      ✎
                    </button>

                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Image */}
                {item?.url && (
                  <div className="flex flex-col gap-4 px-3 py-3">
                    <div className="relative w-full aspect-[9/16] bg-slate-100 rounded-xl overflow-hidden">
                      <video
                        src={item.raw?.videoMeta?.downloadAddr}
                        poster={item.coverUrl ?? undefined}
                        controls
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto border-t border-slate-100 bg-slate-50 px-3 py-3">
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.hashtags.map((hashtag: any, index: number) => (
                        <span key={hashtag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">#{hashtag}</span>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {item.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {item.shareCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {item.commentCount}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tiktok;

