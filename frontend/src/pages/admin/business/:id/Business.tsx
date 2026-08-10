import React from "react";
import { ArrowLeft } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";

function Business() {
  const navigate = useNavigate();

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
          <aside className="col-span-2">
            <SidebarNav />
          </aside>

          <main className="col-span-10">
            <Outlet />
          </main>
        </div>
      </section>
    </section>
  )
}
export default Business;
