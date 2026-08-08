import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Database,
  Package,
  Users,
  FileText,
  Sparkles,
  CalendarRange,
  CalendarDays,
  Layers,
  Wand2,
  Image,
  LayoutDashboard,
  Swords,
  Facebook,
  Instagram,
  Megaphone,
  Lightbulb,
  Camera,
  TrendingUp,
  ChevronRight,
  LucideIcon,
} from "lucide-react"

type SidebarTab = {
  id: string
  title: string
  icon: LucideIcon
}

type SidebarGroup = {
  label: string
  tabs: SidebarTab[]
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Base Data",
    tabs: [
      { id: "baseData", title: "Base Data", icon: Database },
      { id: "products", title: "Products", icon: Package },
      { id: "audiences", title: "Audiences", icon: Users },
    ],
  },
  {
    label: "Generation",
    tabs: [
      { id: "posts", title: "Posts", icon: FileText },
      { id: "stories", title: "Stories", icon: Sparkles },
    ],
  },
  {
    label: "Content Plan",
    tabs: [
      { id: "contentPlan", title: "Content Plan", icon: CalendarRange },
      { id: "calendar", title: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Creator",
    tabs: [
      { id: "profiles", title: "Context", icon: Layers },
      { id: "prompts", title: "Prompts", icon: Wand2 },
      { id: "gallery", title: "Gallery", icon: Image },
      { id: "designSystem", title: "Design", icon: LayoutDashboard },
    ],
  },
  {
    label: "Competitors",
    tabs: [
      { id: "competitors", title: "Competitors", icon: Swords },
      { id: "ideas/facebook-posts", title: "Facebook Ideas", icon: Facebook },
      { id: "ideas/instagram", title: "Instagram Ideas", icon: Instagram },
      { id: "ideas/meta-ads", title: "Meta Ads Ideas", icon: Megaphone },
    ],
  },
  {
    label: "AI",
    tabs: [
      { id: "ideasAI", title: "AI Ideas", icon: Lightbulb },
      { id: "aiPhoto", title: "AI Photo", icon: Camera },
    ],
  },
  {
    label: "Trends",
    tabs: [
      { id: "trends", title: "Tiktok", icon: TrendingUp },
    ],
  },
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

export function SidebarNav() {
  const { pathname } = useLocation()
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(
    () => findActiveGroupIndex(pathname)
  )
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpenGroupIndex(findActiveGroupIndex(pathname))
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
        Dashboard
      </NavLink>
      <div className="border-b border-slate-100 my-1" />
      {sidebarGroups.map((group, index) => {
        const isOpen = openGroupIndex === index
        const isLast = index === sidebarGroups.length - 1

        return (
          <div key={group.label} className={isLast ? "" : "border-b border-slate-100"}>
            <button
              onClick={() => handleToggle(index)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"
            >
              {group.label}
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
                  {group.tabs.map((tab) => {
                    const Icon = tab.icon

                    return (
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
                        <Icon size={18} />
                        {tab.title}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
