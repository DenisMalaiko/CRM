import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { useGetContentPlanPostsQuery } from "../../../../../store/contentPlan/contentPlanApi";
import { TContentPlanPost } from "../../../../../models/ContentPlan";

const FUNNEL_BADGE: Record<TContentPlanPost["funnelStage"], string> = {
  TOFU: "bg-green-100 text-green-700",
  MOFU: "bg-amber-100 text-amber-700",
  BOFU: "bg-blue-100 text-blue-700",
};

type PostCardProps = {
  post: TContentPlanPost;
};

function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 text-left">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">
          {t("ContentPlanPosts.Day")} {post.day} &middot; {post.date}
        </span>

        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${FUNNEL_BADGE[post.funnelStage]}`}>
          {post.funnelStage}
        </span>

        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600">
          {post.format}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-slate-900">{post.topic}</p>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("ContentPlanPosts.Hook")}
          </span>
          <p className="text-sm text-slate-700 mt-0.5">{post.hook}</p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("ContentPlanPosts.CTA")}
          </span>
          <p className="text-sm text-slate-700 mt-0.5">{post.cta}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="self-start text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {expanded ? t("ContentPlanPosts.HideDetails") : t("ContentPlanPosts.ShowDetails")}
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("ContentPlanPosts.Title")}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{post.title}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("ContentPlanPosts.Thesis")}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{post.thesis}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("ContentPlanPosts.MarketingGoal")}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{post.marketingGoal}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("ContentPlanPosts.ContentType")}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{post.contentType}</p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("ContentPlanPosts.DesignReference")}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{post.designReference}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContentPlanPosts() {
  const { t } = useTranslation();
  const { contentPlanId } = useParams<{ contentPlanId: string }>();
  const navigate = useNavigate();
  const { data, isFetching, isError } = useGetContentPlanPostsQuery(contentPlanId!, { skip: !contentPlanId });
  const posts = useMemo(() => [...(data?.data ?? [])].sort((a, b) => a.day - b.day), [data]);

  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="border-b p-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t("ContentPlanPosts.BackButton")}</span>
          </button>

          <h2 className="text-lg font-semibold text-slate-800">
            {t("ContentPlanPosts.Title_page")}
          </h2>
        </div>

        <div className="p-4">
          {isFetching && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}

          {!isFetching && isError && (
            <p className="text-center text-rose-500 py-12">
              {t("ContentPlanPosts.Error")}
            </p>
          )}

          {!isFetching && !isError && posts.length === 0 && (
            <p className="text-center text-slate-400 py-12">
              {t("ContentPlanPosts.Empty")}
            </p>
          )}

          {!isFetching && !isError && posts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.day} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
