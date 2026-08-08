import React, { useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Package, Users, Layers, Wand2, CalendarRange, Lightbulb, LucideIcon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks"
import { useGetProductsMutation } from "../../../../../../store/products/productsApi"
import { useGetAudiencesMutation } from "../../../../../../store/audience/audienceApi"
import { useGetProfilesMutation } from "../../../../../../store/profile/profileApi"
import { useGetPromptsMutation } from "../../../../../../store/prompts/promptApi"
import { useLazyGetContentPlansQuery } from "../../../../../../store/contentPlan/contentPlanApi"
import { useLazyGetIdeasAIQuery } from "../../../../../../store/ai/ideas/ideaAiApi"
import { setProducts } from "../../../../../../store/products/productsSlice"
import { setAudiences } from "../../../../../../store/audience/audienceSlice"
import { setProfiles } from "../../../../../../store/profile/profileSlice"
import { setPrompts } from "../../../../../../store/prompts/promptSlice"
import { setContentPlans } from "../../../../../../store/contentPlan/contentPlanSlice"
import { setIdeasAi } from "../../../../../../store/ai/ideas/ideaAiSlice"
import { TProduct } from "../../../../../../models/Product"
import { TAudience } from "../../../../../../models/Audience"
import { TBusinessProfile } from "../../../../../../models/BusinessProfile"
import { TPrompt } from "../../../../../../models/Prompt"
import { TContentPlan } from "../../../../../../models/ContentPlan"
import { TIdeaAI } from "../../../../../../models/IdeaAI"
import { showError } from "../../../../../../utils/showError"

type StatCardProps = {
  icon: LucideIcon
  label: string
  count: number
}

type ActivityItem = {
  id: string
  label: string
  type: string
  createdAt: string | Date
}

function StatCard({ icon: Icon, label, count }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
      <div className="rounded-lg bg-blue-50 p-2">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{count}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function BusinessDashboard() {
  const dispatch = useAppDispatch()
  const { businessId } = useParams<{ businessId: string }>()

  const [getProducts] = useGetProductsMutation()
  const [getAudiences] = useGetAudiencesMutation()
  const [getProfiles] = useGetProfilesMutation()
  const [getPrompts] = useGetPromptsMutation()
  const [getContentPlans] = useLazyGetContentPlansQuery()
  const [getIdeasAI] = useLazyGetIdeasAIQuery()

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
      } catch (error) {
        showError(error)
      }
    }

    fetchAll()
  }, [businessId, dispatch])

  const stats: StatCardProps[] = [
    { icon: Package, label: "Products", count: products?.length ?? 0 },
    { icon: Users, label: "Audiences", count: audiences?.length ?? 0 },
    { icon: Layers, label: "Profiles", count: profiles?.length ?? 0 },
    { icon: Wand2, label: "Prompts", count: prompts?.length ?? 0 },
    { icon: CalendarRange, label: "Content Plans", count: contentPlans?.length ?? 0 },
    { icon: Lightbulb, label: "AI Ideas", count: ideasAi?.length ?? 0 },
  ]

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = []

    profiles?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: "Profile created", createdAt: p.createdAt })
    })
    prompts?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.name, type: "Prompt created", createdAt: p.createdAt })
    })
    contentPlans?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: "Content plan created", createdAt: p.createdAt })
    })
    ideasAi?.forEach((p) => {
      if (p.createdAt) items.push({ id: p.id, label: p.title, type: "AI idea generated", createdAt: p.createdAt })
    })

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }, [profiles, prompts, contentPlans, ideasAi])

  if (!businessId) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.type}</p>
                </div>
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
