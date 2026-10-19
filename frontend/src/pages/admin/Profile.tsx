import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Building2, ChevronLeft, ChevronRight } from "lucide-react";

function Profile() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen wrapper bg-gray-100">
      <aside className={`fixed inset-y-0 left-0 z-10 ${collapsed ? "w-16 px-2" : "w-64 px-4"} h-screen py-4 bg-white shadow-md transition-all duration-200`}>
        <button
          onClick={() => setCollapsed(prev => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-4 top-20 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <nav className="mt-16 space-y-2">
        <NavLink
          to="dashboard"
          title={collapsed ? t('Sidebar.dashboard') : undefined}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${collapsed ? "justify-center" : ""} ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && t('Sidebar.dashboard')}
        </NavLink>

        <NavLink
          to="businesses"
          title={collapsed ? t('Sidebar.businesses') : undefined}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${collapsed ? "justify-center" : ""} ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <Building2 size={18} />
          {!collapsed && t('Sidebar.businesses')}
        </NavLink>
        </nav>
      </aside>

      <main className={`${collapsed ? "ml-16" : "ml-64"} p-6 min-h-screen bg-gray-100 transition-all duration-200`}>
        <Outlet />
      </main>
    </div>
  );
}

export default Profile;
