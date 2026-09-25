import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import {
  Database,
  FileText,
  Layers,
  LayoutDashboard,
  Swords,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  LucideIcon,
} from "lucide-react"

type SidebarTab = {
  id: string
  title: string
}

type SidebarGroup = {
  label: string
  icon: LucideIcon
  tabs: SidebarTab[]
}

export function SidebarNav() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  let sidebarGroups: SidebarGroup[] = []

  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(
    () => findActiveGroupIndex(pathname)
  )
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpenGroupIndex(findActiveGroupIndex(pathname))
  }

  sidebarGroups = [
    {
      label: t('BusinessSidebar.Info'),
      icon: Database,
      tabs: [
        { id: "baseData", title: t('BusinessSidebar.BaseData') },
        { id: "products", title: t('BusinessSidebar.Products') },
        { id: "audiences", title: t('BusinessSidebar.Audiences') },
        { id: "calendar", title: t('BusinessSidebar.Calendar') },
      ],
    },
    {
      label: t('BusinessSidebar.Competitors'),
      icon: Swords,
      tabs: [
        { id: "competitors/list", title: t('BusinessSidebar.List') },
        { id: "competitors/dashboard", title: t('BusinessSidebar.Dashboard') },
      ],
    },
    {
      label: t('BusinessSidebar.Ideas'),
      icon: Lightbulb,
      tabs: [
        { id: "ideas/facebook-posts", title: t('BusinessSidebar.FacebookIdeas') },
        { id: "ideas/instagram", title: t('BusinessSidebar.InstagramIdeas') },
        { id: "ideas/meta-ads", title: t('BusinessSidebar.MetaAdsIdeas') },
        { id: "ideasAI", title: t('BusinessSidebar.AIIdeas') },
      ],
    },
    {
      label: t('BusinessSidebar.Content'),
      icon: FileText,
      tabs: [
        { id: "contentPlan", title: t('BusinessSidebar.ContentPlan') },
        { id: "posts", title: t('BusinessSidebar.Posts') },
        { id: "stories", title: t('BusinessSidebar.Stories') },
      ],
    },
    {
      label: t('BusinessSidebar.Gallery'),
      icon: Layers,
      tabs: [
        { id: "gallery", title: t('BusinessSidebar.Gallery') },
        { id: "designSystem", title: t('BusinessSidebar.Design') },
        { id: "aiPhoto", title: t('BusinessSidebar.AIPhoto') },
      ],
    },


    /*{
      label: "Others",
      icon: TrendingUp,
      tabs: [
        { id: "trends", title: "Tiktok" },
        { id: "profiles", title: "Context" },
        { id: "prompts", title: "Prompts" },
      ],
    },*/
  ]

  function findActiveGroupIndex(pathname: string): number | null {
    for (let i = 0; i < sidebarGroups.length; i++) {
      for (const tab of sidebarGroups[i].tabs) {
        if (pathname.includes(`/${tab.id}`)) {
          return i
        }
      }
    }
    return null
  }

  function handleToggle(index: number) {
    setOpenGroupIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 py-2 px-2">
      <NavLink
        to="dashboard"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            isActive
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          }`
        }
      >
        <LayoutDashboard size={18} />
        {t('BusinessSidebar.Dashboard')}
      </NavLink>

      <div className="border-b border-slate-100 my-1" />
      {sidebarGroups.map((group, index) => {
        const isOpen = openGroupIndex === index
        const isLast = index === sidebarGroups.length - 1

        return (
          <div key={group.label} className={isLast ? "" : "border-b border-slate-100"}>
            <button
              onClick={() => handleToggle(index)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <span className="flex items-center gap-3">
                <group.icon size={18} />
                {group.label}
              </span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-200 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="flex flex-col gap-1 pb-1">
                  {group.tabs.map((tab) => (
                    <NavLink
                      to={tab.id}
                      key={tab.id}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                          isActive
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        }`
                      }
                    >
                      {tab.title}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
