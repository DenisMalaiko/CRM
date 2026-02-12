import React from "react";
import { ArrowLeft } from "lucide-react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

function Business() {
  const navigate = useNavigate();

  const tabs = [
    {
      id: "baseData",
      title: "Base Data",
    },
    {
      id: "profiles",
      title: "Profiles",
    },
    {
      id: "creatives",
      title: "Creatives",
    },
    {
      id: "products",
      title: "Products",
    },
    {
      id: "audiences",
      title: "Audiences",
    },
    {
      id: "prompts",
      title: "Prompts",
    },
    {
      id: "competitors",
      title: "Competitors",
    }
  ]

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-4">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate("/profile/businesses")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <section className="w-full">

        <div className="container mx-auto grid grid-cols-12 gap-6 mb-5">
          <aside className="col-span-2 bg-gray-100">
            <div className="rounded-2xl bg-white shadow border border-slate-200 py-2 px-2">
              {tabs.map((tab) => (
                <NavLink
                  to={tab.id}
                  key={tab.id}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  {tab.title}
                </NavLink>
              ))}
            </div>
          </aside>

          <main className="col-span-10">
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <Outlet />
            </div>
          </main>
        </div>
      </section>
    </section>
  )
}
export default Business;