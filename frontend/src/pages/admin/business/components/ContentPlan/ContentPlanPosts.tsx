import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ArrowLeft, Download, Image, Pencil, Trash2 } from "lucide-react";

import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import UpdateContentPlanPostDlg from "./components/UpdateContentPlanPostDlg";

import {
  useGetContentPlanPostsQuery,
  useDeleteContentPlanPostMutation,
  useLazyGetContentPlanPostsQuery,
} from "../../../../../store/contentPlan/contentPlanApi";
import { useAppSelector } from "../../../../../store/hooks";
import { TContentPlanPost } from "../../../../../models/ContentPlan";
import { showError } from "../../../../../utils/showError";

const FUNNEL_BADGE: Record<TContentPlanPost["funnelStage"], string> = {
  TOFU: "bg-green-100 text-green-700",
  MOFU: "bg-amber-100 text-amber-700",
  BOFU: "bg-blue-100 text-blue-700",
};

type PostCardProps = {
  post: TContentPlanPost;
  businessName: string;
  onEdit: (post: TContentPlanPost) => void;
  onDelete: (post: TContentPlanPost) => void;
};

function PostCard({ post, businessName, onEdit, onDelete }: PostCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const avatarLetter = businessName.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-base">{avatarLetter}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{businessName}</span>
            <span className="text-xs text-slate-400 mt-0.5">
              {t("ContentPlanPosts.Day")} {post.day} &middot; {post.date}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${FUNNEL_BADGE[post.funnelStage]}`}>
            {post.funnelStage}
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
            {post.format}
          </span>

          <button
            onClick={() => onEdit(post)}
            title={t("ContentPlanPosts.EditPost")}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 ml-1"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={() => onDelete(post)}
            title={t("ContentPlanPosts.DeletePost")}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Post body */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <p className="text-sm text-slate-800 leading-relaxed">{post.hook}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{post.thesis}</p>
        <p className="text-sm font-semibold text-blue-600">{post.cta}</p>
      </div>

      {/* Visual placeholder */}
      <div className="mx-4 mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2 p-5 min-h-28">
        <Image size={28} className="text-slate-400" />
        <p className="text-xs text-slate-500 text-center leading-relaxed">{post.designReference}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-500 truncate max-w-[30%]">{post.contentType}</span>
        <span className="text-xs font-medium text-slate-700 bg-slate-200 rounded-full px-2.5 py-0.5 truncate max-w-[38%]">{post.topic}</span>
        <span className="text-xs text-slate-500 truncate max-w-[26%] text-right">{post.marketingGoal}</span>
      </div>

      {/* Expandable details */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 self-start text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? t("ContentPlanPosts.HideDetails") : t("ContentPlanPosts.ShowDetails")}
        </button>

        {expanded && (
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 mt-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("ContentPlanPosts.Title")}
              </span>
              <p className="text-sm text-slate-700 mt-0.5">{post.title}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentPlanPosts() {
  const { t } = useTranslation();
  const { contentPlanId } = useParams<{ contentPlanId: string }>();
  const navigate = useNavigate();
  const business = useAppSelector((state) => state.businessModule.business);
  const { data, isFetching, isError } = useGetContentPlanPostsQuery(contentPlanId!, { skip: !contentPlanId });
  const posts = useMemo(() => [...(data?.data ?? [])].sort((a, b) => a.day - b.day), [data]);
  const businessName = business?.name ?? "";

  const [deleteContentPlanPost] = useDeleteContentPlanPostMutation();
  const [getContentPlanPosts] = useLazyGetContentPlanPostsQuery();

  const [editingPost, setEditingPost] = useState<TContentPlanPost | null>(null);

  const handleEdit = (post: TContentPlanPost) => {
    setEditingPost(post);
  };

  const handleDelete = async (post: TContentPlanPost) => {
    const ok = await confirm({
      title: t("ContentPlanPosts.DeletePost"),
      message: t("ContentPlanPosts.DeletePostConfirm"),
    });

    if (!ok || !contentPlanId) return;

    try {
      await deleteContentPlanPost({ id: contentPlanId, day: post.day }).unwrap();
      await getContentPlanPosts(contentPlanId).unwrap();
      toast.success(t("ContentPlanPosts.PostDeleted"));
    } catch (error) {
      showError(error);
    }
  };

  function handleExportXLSX() {
    if (!posts.length) return;

    const headers = ["Day", "Date", "Funnel Stage", "Format", "Content Type", "Topic", "Marketing Goal", "Title", "Hook", "Thesis", "CTA", "Design Reference"];
    const esc = (v: string) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const headerRow = headers.map((h) => `<th style="font-weight:bold;background-color:#f1f5f9;">${esc(h)}</th>`).join("");
    const dataRows = posts.map((p) =>
      `<tr>${[p.day, p.date, p.funnelStage, p.format, p.contentType, p.topic, p.marketingGoal, p.title, p.hook, p.thesis, p.cta, p.designReference]
        .map((v) => `<td>${esc(String(v))}</td>`).join("")}</tr>`
    ).join("");

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"/></head>
<body><table border="1">${headerRow}${dataRows}</table></body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-plan-posts.xls";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          {posts.length > 0 && (
            <button
              type="button"
              onClick={handleExportXLSX}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              <Download size={16} />
              Export Excel
            </button>
          )}
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {posts.map((post) => (
                <PostCard
                  key={`${post.day}-${post.date}`}
                  post={post}
                  businessName={businessName}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editingPost && contentPlanId && (
        <UpdateContentPlanPostDlg
          open={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          contentPlanId={contentPlanId}
        />
      )}
    </div>
  );
}
