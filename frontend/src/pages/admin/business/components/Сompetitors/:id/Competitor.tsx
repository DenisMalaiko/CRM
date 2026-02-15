import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import BaseData from "./components/base/Base";
import PostsTable from "./components/posts/table/Table";
import AdsTable from "./components/ads/table/Table";

function Competitor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if(!id) return null;

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <BaseData />

      <PostsTable />

      <AdsTable />
    </section>
  )
}

export default Competitor;