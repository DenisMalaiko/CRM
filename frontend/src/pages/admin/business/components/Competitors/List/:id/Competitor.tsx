import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// Redux
import { useAppSelector, useAppDispatch } from "../../../../../../../store/hooks";
import {
  useFetchCompetitorFacebookReportMutation,
  useGetCompetitorsMutation,
  useGetPostsMutation,
  useGetInstagramPostsMutation,
  useGetInstagramReelsMutation,
  useGetAdsMutation,
} from "../../../../../../../store/competitor/competitorApi";
import { setCompetitors, setPosts, setInstagramPosts, setInstagramReels, setAds } from "../../../../../../../store/competitor/competitorSlice";

// Models
import { TCompetitorWithReport } from "../../../../../../../models/Competitor";

// Components
import BaseData from "./components/base/Base";
import PostsTable from "./components/posts/table/Table";
import InstagramPostsTable from "./components/instagramPosts/table/Table";
import InstagramReelsTable from "./components/instagramReels/table/Table";
import AdsTable from "./components/ads/table/Table";
import { ContentTypeChart } from "../../../../../../../components/analytics/ContentTypeChart/ContentTypeChart";
import { AdsFormatChart } from "../../../../../../../components/analytics/AdsFormatChart/AdsFormatChart";
import { AdsCtaChart } from "../../../../../../../components/analytics/AdsCtaChart/AdsCtaChart";
import { CompetitorCtaBlock } from "../../../../../../../components/analytics/CompetitorCtaBlock/CompetitorCtaBlock";
import { TopAdsBlock } from "../../../../../../../components/analytics/TopAdsBlock/TopAdsBlock";
import { TopAdTexts } from "../../../../../../../components/analytics/TopAdTexts/TopAdTexts";

function Competitor() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id, businessId } = useParams<{ id: string; businessId: string }>();
  const [isFetching, setIsFetching] = useState(false);

  const [fetchCompetitorFacebookReport] = useFetchCompetitorFacebookReportMutation();
  const [getCompetitors] = useGetCompetitorsMutation();
  const [getPosts] = useGetPostsMutation();
  const [getInstagramPosts] = useGetInstagramPostsMutation();
  const [getInstagramReels] = useGetInstagramReelsMutation();
  const [getAds] = useGetAdsMutation();

  const { competitors } = useAppSelector((state) => state.competitorModule);

  const competitorWithReport = useMemo<TCompetitorWithReport | null>(
    () => competitors?.find((c) => c.id === id) ?? null,
    [competitors, id]
  );

  const report = competitorWithReport?.facebookReport;

  const topAdTexts = useMemo(() => {
    if (!competitorWithReport?.facebookReport?.topAdTexts) return [];
    return competitorWithReport.facebookReport.topAdTexts
      .map((ad) => ({
        competitorName: competitorWithReport.name,
        text: ad.text,
        collationCount: ad.collationCount,
        url: ad.url,
      }))
      .sort((a, b) => b.collationCount - a.collationCount)
      .slice(0, 6);
  }, [competitorWithReport]);

  const handleFetchAll = async () => {
    if (!id || !businessId) return;
    setIsFetching(true);

    try {
      await fetchCompetitorFacebookReport(id).unwrap();

      const [competitorsRes, postsRes, igPostsRes, igReelsRes, adsRes] = await Promise.all([
        getCompetitors(businessId).unwrap(),
        getPosts(id).unwrap(),
        getInstagramPosts(id).unwrap(),
        getInstagramReels(id).unwrap(),
        getAds(id).unwrap(),
      ]);

      if (competitorsRes?.data) dispatch(setCompetitors(competitorsRes.data));
      if (postsRes?.data) dispatch(setPosts(postsRes.data));
      if (igPostsRes?.data) dispatch(setInstagramPosts(igPostsRes.data));
      if (igReelsRes?.data) dispatch(setInstagramReels(igReelsRes.data));
      if (adsRes?.data) dispatch(setAds(adsRes.data));

      toast.success("All data fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsFetching(false);
    }
  };

  if(!id) return null;

  return (
    <section className="space-y-5">
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200">
        <div className="w-full flex items-center justify-between p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>

          <button
            type="button"
            onClick={handleFetchAll}
            disabled={isFetching}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Fetching...
              </>
            ) : (
              "Fetch All Data"
            )}
          </button>
        </div>
      </div>

      <BaseData />

      {report && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <ContentTypeChart
              postsImageCount={report.postsImageCount}
              postsVideoCount={report.postsVideoCount}
              postsCarouselCount={report.postsCarouselCount}
            />
            <AdsFormatChart
              adsVideoCount={report.adsVideoCount}
              adsImageCount={report.adsImageCount}
              adsCarouselCount={report.adsCarouselCount}
              adsDcoCount={report.adsDcoCount}
            />
            <AdsCtaChart
              adsCtaWebsite={report.adsCtaWebsite}
              adsCtaDirectMessage={report.adsCtaDirectMessage}
              adsCtaInstagramPage={report.adsCtaInstagramPage}
              adsCtaProduct={report.adsCtaProduct}
              adsCtaMetaPage={report.adsCtaMetaPage}
            />
          </div>

          <CompetitorCtaBlock competitors={[competitorWithReport]} />
          <TopAdsBlock competitors={[competitorWithReport]} />
          <TopAdTexts ads={topAdTexts} />
        </>
      )}

      <PostsTable />

      <InstagramPostsTable />

      <InstagramReelsTable />

      <AdsTable />
    </section>
  )
}

export default Competitor;