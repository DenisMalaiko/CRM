import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Database,
  FileText,
  CalendarRange,
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

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Info",
    icon: Database,
    tabs: [
      { id: "baseData", title: "Base Data" },
      { id: "products", title: "Products" },
      { id: "audiences", title: "Audiences" },
    ],
  },
  {
    label: "Ideas",
    icon: Lightbulb,
    tabs: [
      { id: "competitors", title: "Competitors" },
      { id: "ideas/facebook-posts", title: "Facebook Ideas" },
      { id: "ideas/instagram", title: "Instagram Ideas" },
      { id: "ideas/meta-ads", title: "Meta Ads Ideas" },
      { id: "ideasAI", title: "AI Ideas" },
    ],
  },
  {
    label: "Content",
    icon: FileText,
    tabs: [
      { id: "contentPlan", title: "Content Plan" },
      { id: "posts", title: "Posts" },
      { id: "stories", title: "Stories" },
    ],
  },
  {
    label: "Gallery",
    icon: Layers,
    tabs: [
      { id: "gallery", title: "Gallery" },
      { id: "designSystem", title: "Design" },
      { id: "aiPhoto", title: "AI Photo" },
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
          `flex items-center gap-3 px-3 py-2 rounded-lg font-medium border-b border-slate-100 ${
            isActive
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          }`
        }
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <NavLink
        to="calendar"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
            isActive
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          }`
        }
      >
        <CalendarRange size={18} />
        Calendar
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
