import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";
import { useLazyGetTikTokVideosByBusinessIdQuery } from "../../../../../../store/trends/trendsApi";
import { setTiktokVideos } from "../../../../../../store/trends/trendsSlice";

// Utils
import { showError } from "../../../../../../utils/showError";

function Tiktok() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getTikTokVideosByBusinessId, { isLoading } ] = useLazyGetTikTokVideosByBusinessIdQuery();

  const { tiktokVideos } = useSelector((state: any) => state.trendsModule);



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
  }, [dispatch]);

  const getTrends = async () => {
    console.log("GET TRENDS")
    /*if (!businessId) return;
    try {
      const response = await getTikTokVideosByBusinessId(businessId).unwrap();
      if (response && response.data) dispatch(setTiktokVideos(response.data));
    } catch (error) {
      showError(error);
    }*/
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Trends</h2>

          <button
            onClick={() => getTrends()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            { isLoading ? (
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
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">
                      Hashtags:
                      <div>
                        {item.hashtags.map((hashtag: any, index: number) => (
                          <span key={index} className="text-slate-600">
                            #{hashtag}
                            {index < item.hashtags.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="font-semibold text-slate-900 text-left">
                      Like: {item.likeCount}
                    </p>
                    <p className="font-semibold text-slate-900 text-left">
                      Shares: {item.shareCount}
                    </p>
                    <p className="font-semibold text-slate-900 text-left">
                      Comments: {item.commentCount}
                    </p>
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
