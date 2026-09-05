import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { ExternalLink } from "lucide-react"
import { useGetCompetitorsMutation, useFetchCompetitorFacebookReportMutation } from "../../../../../../store/competitor/competitorApi"
import { TCompetitorWithReport } from "../../../../../../models/Competitor"
import { showError } from "../../../../../../utils/showError"
import { ContentTypeChart } from "../../../../../../components/analytics/ContentTypeChart/ContentTypeChart"
import { AdsFormatChart } from "../../../../../../components/analytics/AdsFormatChart/AdsFormatChart"
import { AdsCtaChart } from "../../../../../../components/analytics/AdsCtaChart/AdsCtaChart"
import { CompetitorCtaBlock } from "../../../../../../components/analytics/CompetitorCtaBlock/CompetitorCtaBlock"
import { TopAdsBlock } from "../../../../../../components/analytics/TopAdsBlock/TopAdsBlock"
import { TopAdTexts } from "../../../../../../components/analytics/TopAdTexts/TopAdTexts"
import { StrategicInsights } from "../../../../../../components/analytics/StrategicInsights/StrategicInsights"

export default function CompetitorsDashboard() {
  const { businessId } = useParams<{ businessId: string }>()
  const [competitors, setCompetitors] = useState<TCompetitorWithReport[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const [getCompetitors] = useGetCompetitorsMutation()
  const [fetchCompetitorFacebookReport] = useFetchCompetitorFacebookReportMutation()

  useEffect(() => {
    if (!businessId) return

    async function loadCompetitors() {
      try {
        const res = await getCompetitors(businessId!).unwrap()
        if (res?.data) setCompetitors(res.data as TCompetitorWithReport[])
      } catch (error) {
        showError(error)
      }
    }

    loadCompetitors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  const aggregated = useMemo(() => {
    let postsImageCount = 0, postsVideoCount = 0, postsCarouselCount = 0
    let adsVideoCount = 0, adsImageCount = 0, adsCarouselCount = 0, adsDcoCount = 0
    let adsCtaWebsite = 0, adsCtaDirectMessage = 0, adsCtaInstagramPage = 0, adsCtaProduct = 0, adsCtaMetaPage = 0

    for (const c of competitors) {
      const r = c.facebookReport
      if (!r) continue
      postsImageCount += r.postsImageCount
      postsVideoCount += r.postsVideoCount
      postsCarouselCount += r.postsCarouselCount
      adsVideoCount += r.adsVideoCount
      adsImageCount += r.adsImageCount
      adsCarouselCount += r.adsCarouselCount
      adsDcoCount += r.adsDcoCount
      adsCtaWebsite += r.adsCtaWebsite
      adsCtaDirectMessage += r.adsCtaDirectMessage
      adsCtaInstagramPage += r.adsCtaInstagramPage
      adsCtaProduct += r.adsCtaProduct
      adsCtaMetaPage += r.adsCtaMetaPage
    }

    return {
      postsImageCount, postsVideoCount, postsCarouselCount,
      adsVideoCount, adsImageCount, adsCarouselCount, adsDcoCount,
      adsCtaWebsite, adsCtaDirectMessage, adsCtaInstagramPage, adsCtaProduct, adsCtaMetaPage,
    }
  }, [competitors])

  const topAdTexts = useMemo(() => {
    return competitors
      .flatMap((c) =>
        (c.facebookReport?.topAdTexts ?? []).map((ad) => ({
          competitorName: c.name,
          text: ad.text,
          collationCount: ad.collationCount,
          url: ad.url,
        }))
      )
      .sort((a, b) => b.collationCount - a.collationCount)
      .slice(0, 6)
  }, [competitors])

  const handleFetchFacebook = async () => {
    if (!businessId) return
    setIsFetching(true)
    try {
      await Promise.all(
        competitors.map((c) =>
          fetchCompetitorFacebookReport(c.id).unwrap().catch(() => null)
        )
      )
      const res = await getCompetitors(businessId).unwrap().catch(() => null)
      if (res?.data) {
        setCompetitors(res.data as TCompetitorWithReport[])
        toast.success("Facebook data fetched successfully")
      }
    } catch (error) {
      showError(error)
    } finally {
      setIsFetching(false)
    }
  }

  function handleOpenLink(url: string) {
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!businessId) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleFetchFacebook}
          disabled={isFetching}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isFetching ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Fetching...
            </>
          ) : (
            "Fetch Facebook Data"
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ContentTypeChart
          postsImageCount={aggregated.postsImageCount}
          postsVideoCount={aggregated.postsVideoCount}
          postsCarouselCount={aggregated.postsCarouselCount}
        />
        <AdsFormatChart
          adsVideoCount={aggregated.adsVideoCount}
          adsImageCount={aggregated.adsImageCount}
          adsCarouselCount={aggregated.adsCarouselCount}
          adsDcoCount={aggregated.adsDcoCount}
        />
        <AdsCtaChart
          adsCtaWebsite={aggregated.adsCtaWebsite}
          adsCtaDirectMessage={aggregated.adsCtaDirectMessage}
          adsCtaInstagramPage={aggregated.adsCtaInstagramPage}
          adsCtaProduct={aggregated.adsCtaProduct}
          adsCtaMetaPage={aggregated.adsCtaMetaPage}
        />
      </div>

      <div className="rounded-2xl bg-white shadow border border-slate-200">
        <div className="border-b p-4">
          <h2 className="text-lg text-left font-semibold text-slate-800">Competitors</h2>
        </div>
        <div className="p-4">
          {competitors.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No competitors added</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 shadow">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Followers</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Posts (90D)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Active Ads</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">New Ads (30D)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Meta Ads Library</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competitors.map((c) => (
                  <tr
                    key={c.id}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleOpenLink(c.facebookLink)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleOpenLink(c.facebookLink)
                    }}
                  >
                    <td className="px-4 py-3 text-left font-medium text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {c.name}
                        <ExternalLink size={14} className="text-blue-500" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.facebookReport?.followers ?? 0).toLocaleString("uk-UA")}</td>
                    <td className="px-4 py-3 text-left font-medium text-slate-900">{c.facebookReport?.posts != null ? (c.facebookReport.posts >= 90 ? "90+" : c.facebookReport.posts) : 0}</td>
                    <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.facebookReport?.ads ?? 0).toLocaleString("uk-UA")}</td>
                    <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.facebookReport?.ads30d ?? 0).toLocaleString("uk-UA")}</td>
                    <td className="px-4 py-3 text-left">
                      {c.facebookPageId && (
                        <a
                          href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=UA&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=${c.facebookPageId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Ads Library
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CompetitorCtaBlock competitors={competitors} />
      <TopAdsBlock competitors={competitors} />
      <TopAdTexts ads={topAdTexts} />
      <StrategicInsights />
    </div>
  )
}
