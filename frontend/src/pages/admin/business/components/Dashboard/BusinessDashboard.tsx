import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Package, Users, Lightbulb, Megaphone, FileText, Film, BookImage, LucideIcon, ExternalLink } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks"
import { useGetFacebookReportMutation, useGetInstagramReportMutation, useFetchInstagramReportMutation, useFetchFacebookReportMutation } from "../../../../../store/businesses/businessesApi"
import { TFacebookReport, TInstagramReport } from "../../../../../models/Business"
import { useGetCompetitorsMutation, useFetchCompetitorInstagramReportMutation } from "../../../../../store/competitor/competitorApi"
import { TCompetitorWithReport } from "../../../../../models/Competitor"
import { useGetProductsMutation } from "../../../../../store/products/productsApi"
import { useGetAudiencesMutation } from "../../../../../store/audience/audienceApi"
import { useGetProfilesMutation } from "../../../../../store/profile/profileApi"
import { useGetPromptsMutation } from "../../../../../store/prompts/promptApi"
import { useLazyGetContentPlansQuery } from "../../../../../store/contentPlan/contentPlanApi"
import { useLazyGetIdeasAIQuery } from "../../../../../store/ai/ideas/ideaAiApi"
import { setProducts } from "../../../../../store/products/productsSlice"
import { setAudiences } from "../../../../../store/audience/audienceSlice"
import { setProfiles } from "../../../../../store/profile/profileSlice"
import { setPrompts } from "../../../../../store/prompts/promptSlice"
import { setContentPlans } from "../../../../../store/contentPlan/contentPlanSlice"
import { setIdeasAi } from "../../../../../store/ai/ideas/ideaAiSlice"
import { TProduct } from "../../../../../models/Product"
import { TAudience } from "../../../../../models/Audience"
import { TBusinessProfile } from "../../../../../models/BusinessProfile"
import { TPrompt } from "../../../../../models/Prompt"
import { TContentPlan } from "../../../../../models/ContentPlan"
import { TIdeaAI } from "../../../../../models/IdeaAI"
import { showError } from "../../../../../utils/showError"
import { ContentTypeChart } from "../../../../../components/analytics/ContentTypeChart/ContentTypeChart"
import { StoriesTypeChart } from "./StoriesTypeChart"
import { AdsFormatChart } from "../../../../../components/analytics/AdsFormatChart/AdsFormatChart"
import { AdsCtaChart } from "../../../../../components/analytics/AdsCtaChart/AdsCtaChart"
import { TopPostsBlock } from "../../../../../components/analytics/TopPostsBlock/TopPostsBlock"
import { TopPostTexts } from "../../../../../components/analytics/TopPostTexts/TopPostTexts"
import { TopAdsBlock } from "../../../../../components/analytics/TopAdsBlock/TopAdsBlock"
import { TopAdTexts } from "../../../../../components/analytics/TopAdTexts/TopAdTexts"
import { NicheNewsBlock } from "../../../../../components/analytics/NicheNewsBlock/NicheNewsBlock"
import { RecentActivityBlock, ActivityItem } from "../../../../../components/analytics/RecentActivityBlock/RecentActivityBlock"
import { useGetNicheNewsByBusinessIdMutation, useFetchNicheNewsMutation } from "../../../../../store/nicheNews/nicheNewsApi"
import { TNicheNews } from "../../../../../models/NicheNews"
import { useTranslation } from 'react-i18next'

type StatCardProps = {
  icon: LucideIcon
  label: string
  count: number | string
}

function StatCard({ icon: Icon, label, count }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
      <div className="rounded-lg bg-blue-50 p-2">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 text-left">{typeof count === 'number' ? count.toLocaleString('uk-UA') : count}</p>
        <p className="text-sm text-slate-500 text-left">{label}</p>
      </div>
    </div>
  )
}

export function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState<"general" | "facebook" | "instagram">("general")
  const { t } = useTranslation()

  const tabs = [
    { key: "general" as const, label: t('BusinessDashboard.general') },
    { key: "facebook" as const, label: t('General.facebook') },
    { key: "instagram" as const, label: t('General.instagram') },
  ]

  const dispatch = useAppDispatch()
  const { businessId } = useParams<{ businessId: string }>()

  const [getProducts] = useGetProductsMutation()
  const [getAudiences] = useGetAudiencesMutation()
  const [getProfiles] = useGetProfilesMutation()
  const [getPrompts] = useGetPromptsMutation()
  const [getContentPlans] = useLazyGetContentPlansQuery()
  const [getIdeasAI] = useLazyGetIdeasAIQuery()
  const [getFacebookReport] = useGetFacebookReportMutation()
  const [getInstagramReport] = useGetInstagramReportMutation()
  const [fetchInstagramReport] = useFetchInstagramReportMutation()
  const [getCompetitors] = useGetCompetitorsMutation()
  const [fetchCompetitorInstagramReport] = useFetchCompetitorInstagramReportMutation()
  const [fetchFacebookReport] = useFetchFacebookReportMutation()
  const [getNicheNews] = useGetNicheNewsByBusinessIdMutation()
  const [fetchNicheNews] = useFetchNicheNewsMutation()

  const [isFetchingIg, setIsFetchingIg] = useState(false)
  const [isFetchingFb, setIsFetchingFb] = useState(false)
  const [fbReport, setFbReport] = useState<TFacebookReport | null>(null)
  const [igReport, setIgReport] = useState<TInstagramReport | null>(null)
  const [competitors, setCompetitors] = useState<TCompetitorWithReport[]>([])
  const [nicheNews, setNicheNewsData] = useState<TNicheNews[]>([])
  const [isFetchingNews, setIsFetchingNews] = useState(false)

  const products = useAppSelector((state) => state.productsModule.products)
  const audiences = useAppSelector((state) => state.audienceModule.audiences)
  const profiles = useAppSelector((state) => state.profileModule.profiles)
  const prompts = useAppSelector((state) => state.promptModule.prompts)
  const contentPlans = useAppSelector((state) => state.contentPlanModule.contentPlans)
  const ideasAi = useAppSelector((state) => state.ideaAiModule.ideasAi)

  useEffect(() => {
    if (!businessId) return

    async function fetchAll() {
      try {
        const [productsRes, audiencesRes, profilesRes, promptsRes, contentPlansRes] = await Promise.all([
          getProducts(businessId!).unwrap(),
          getAudiences(businessId!).unwrap(),
          getProfiles(businessId!).unwrap(),
          getPrompts(businessId!).unwrap(),
          getContentPlans(businessId!).unwrap(),
        ])

        if (productsRes?.data) dispatch(setProducts(productsRes.data as TProduct[]))
        if (audiencesRes?.data) dispatch(setAudiences(audiencesRes.data as TAudience[]))
        if (profilesRes?.data) dispatch(setProfiles(profilesRes.data as TBusinessProfile[]))
        if (promptsRes?.data) dispatch(setPrompts(promptsRes.data as TPrompt[]))
        if (contentPlansRes?.data) dispatch(setContentPlans(contentPlansRes.data as TContentPlan[]))

        const ideasRes = await getIdeasAI(businessId!).unwrap()
        if (ideasRes?.data) dispatch(setIdeasAi(ideasRes.data as TIdeaAI[]))

        const [fbRes, igRes, competitorsRes, nicheNewsRes] = await Promise.all([
          getFacebookReport(businessId!).unwrap().catch(() => null),
          getInstagramReport(businessId!).unwrap().catch(() => null),
          getCompetitors(businessId!).unwrap().catch(() => null),
          getNicheNews(businessId!).unwrap().catch(() => null),
        ])
        if (fbRes?.data) setFbReport(fbRes.data)
        if (igRes?.data) setIgReport(igRes.data)
        if (competitorsRes?.data) setCompetitors(competitorsRes.data as TCompetitorWithReport[])
        if (nicheNewsRes?.data) setNicheNewsData(nicheNewsRes.data as TNicheNews[])
      } catch (error) {
        showError(error)
      }
    }

    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, dispatch])

  const stats: StatCardProps[] = [
    { icon: Package, label: t('BusinessDashboard.products'), count: products?.length ?? 0 },
    { icon: Users, label: t('BusinessDashboard.audiences'), count: audiences?.length ?? 0 },
    { icon: Lightbulb, label: t('BusinessDashboard.aiIdeas'), count: ideasAi?.length ?? 0 },
  ]

  const handleFetchInstagram = async () => {
    if (!businessId) return
    setIsFetchingIg(true)
    try {
      const [response] = await Promise.all([
        fetchInstagramReport(businessId).unwrap(),
        ...competitors.map((c) =>
          fetchCompetitorInstagramReport(c.id).unwrap().catch(() => null)
        ),
      ])
      if (response?.data) {
        setIgReport(response.data)
        toast.success(response.message)
      }
      const competitorsRes = await getCompetitors(businessId).unwrap().catch(() => null)
      if (competitorsRes?.data) setCompetitors(competitorsRes.data as TCompetitorWithReport[])
    } catch (error) {
      showError(error)
    } finally {
      setIsFetchingIg(false)
    }
  }

  const handleFetchFacebook = async () => {
    if (!businessId) return
    setIsFetchingFb(true)
    try {
      const response = await fetchFacebookReport(businessId).unwrap()
      if (response?.data) {
        setFbReport(response.data)
        toast.success(response.message)
      }
    } catch (error) {
      showError(error)
    } finally {
      setIsFetchingFb(false)
    }
  }

  const handleFetchNews = async () => {
    if (!businessId) return
    setIsFetchingNews(true)
    try {
      const response = await fetchNicheNews(businessId).unwrap()
      if (response?.data) {
        setNicheNewsData(response.data as TNicheNews[])
        toast.success(response.message)
      }
    } catch (error) {
      showError(error)
    } finally {
      setIsFetchingNews(false)
    }
  }

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = []

    profiles?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: t('BusinessDashboard.profileCreated'), createdAt: p.createdAt })
    })
    prompts?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: t('BusinessDashboard.promptCreated'), createdAt: p.createdAt })
    })
    contentPlans?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: t('BusinessDashboard.contentPlanCreated'), createdAt: p.createdAt })
    })
    ideasAi?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: t('BusinessDashboard.aiIdeaGenerated'), createdAt: p.createdAt })
    })

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }, [profiles, prompts, contentPlans, ideasAi])

  const businessTopPostTexts = useMemo(() => {
    return (fbReport?.topPostTexts ?? []).map((post) => ({
      competitorName: '',
      text: post.text,
      collationCount: post.collationCount,
      url: post.url,
    }))
  }, [fbReport])

  const businessTopAdTexts = useMemo(() => {
    return (fbReport?.topAdTexts ?? []).map((ad) => ({
      competitorName: '',
      text: ad.text,
      collationCount: ad.collationCount,
      url: ad.url,
    }))
  }, [fbReport])

  function handleOpenLink(url: string) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!businessId) return null

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <RecentActivityBlock recentActivity={recentActivity} />
            <NicheNewsBlock nicheNews={nicheNews} onFetch={handleFetchNews} isFetching={isFetchingNews} />
          </div>
        </div>
      )}

      {activeTab === "facebook" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFetchFacebook}
              disabled={isFetchingFb}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isFetchingFb ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('BusinessDashboard.fetching')}
                </>
              ) : (
                t('BusinessDashboard.fetchFacebookData')
              )}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={Users} label={t('BusinessDashboard.followers')} count={fbReport?.followers ?? 0} />
            <StatCard icon={FileText} label={t('BusinessDashboard.posts90d')} count={fbReport?.posts != null ? (fbReport.posts >= 90 ? '90+' : fbReport.posts) : 0} />
            <StatCard icon={Megaphone} label={t('BusinessDashboard.ads')} count={fbReport?.activeAds ?? 0} />
            <StatCard icon={Megaphone} label={t('BusinessDashboard.newAds30d')} count={fbReport?.activeAds30d ?? 0} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ContentTypeChart
              postsImageCount={fbReport?.postsImageCount ?? 0}
              postsVideoCount={fbReport?.postsVideoCount ?? 0}
              postsCarouselCount={fbReport?.postsCarouselCount ?? 0}
            />
            <AdsFormatChart
              adsVideoCount={fbReport?.adsVideoCount ?? 0}
              adsImageCount={fbReport?.adsImageCount ?? 0}
              adsCarouselCount={fbReport?.adsCarouselCount ?? 0}
              adsDcoCount={fbReport?.adsDcoCount ?? 0}
            />
            <AdsCtaChart
              adsCtaWebsite={fbReport?.adsCtaWebsite ?? 0}
              adsCtaDirectMessage={fbReport?.adsCtaDirectMessage ?? 0}
              adsCtaInstagramPage={fbReport?.adsCtaInstagramPage ?? 0}
              adsCtaProduct={fbReport?.adsCtaProduct ?? 0}
              adsCtaMetaPage={fbReport?.adsCtaMetaPage ?? 0}
            />
          </div>

          <TopPostsBlock posts={fbReport?.topPosts ?? []} />
          <TopPostTexts posts={businessTopPostTexts} />
          <TopAdsBlock ads={fbReport?.topAds ?? []} />
          <TopAdTexts ads={businessTopAdTexts} />
        </div>
      )}

      {activeTab === "instagram" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFetchInstagram}
              disabled={isFetchingIg}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isFetchingIg ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('BusinessDashboard.fetching')}
                </>
              ) : (
                t('BusinessDashboard.fetchInstagramData')
              )}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={Users} label={t('BusinessDashboard.followers')} count={igReport?.followers ?? 0} />
            <StatCard icon={FileText} label={t('BusinessDashboard.posts')} count={igReport?.posts ?? 0} />
            <StatCard icon={Film} label={t('BusinessDashboard.reels')} count={igReport?.reels ?? 0} />
            <StatCard icon={BookImage} label={t('BusinessDashboard.stories')} count={igReport?.stories ?? 0} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <ContentTypeChart
              postsImageCount={igReport?.postsImageCount ?? 0}
              postsVideoCount={igReport?.postsVideoCount ?? 0}
              postsCarouselCount={igReport?.postsCarouselCount ?? 0}
            />
            <StoriesTypeChart
              storiesImageCount={igReport?.storiesImageCount ?? 0}
              storiesVideoCount={igReport?.storiesVideoCount ?? 0}
            />
          </div>

          <div className="rounded-2xl bg-white shadow border border-slate-200">
            <div className="border-b p-4">
              <h2 className="text-lg text-left font-semibold text-slate-800">{t('BusinessDashboard.competitors')}</h2>
            </div>
            <div className="p-4">
            {competitors.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">{t('BusinessDashboard.noCompetitorsAdded')}</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 shadow">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('General.name')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.followers')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.posts')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.reels')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.stories')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitors.map((c) => (
                    <tr
                      key={c.id}
                      role="link"
                      tabIndex={0}
                      className="cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => handleOpenLink(c.instagramLink)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleOpenLink(c.instagramLink)
                      }}
                    >
                      <td className="px-4 py-3 text-left font-medium text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {c.name}
                          <ExternalLink size={14} className="text-blue-500" />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.followers ?? 0).toLocaleString('uk-UA')}</td>
                      <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.posts ?? 0).toLocaleString('uk-UA')}</td>
                      <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.reels ?? 0).toLocaleString('uk-UA')}</td>
                      <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.stories ?? 0).toLocaleString('uk-UA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
