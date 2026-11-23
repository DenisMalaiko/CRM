import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { X, ImagePlus } from "lucide-react";

import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";
import {
  useUpdateContentPlanPostMutation,
  useLazyGetContentPlanPostsQuery,
} from "../../../../../../store/contentPlan/contentPlanApi";
import { TContentPlanPost } from "../../../../../../models/ContentPlan";
import { TGalleryPhoto } from "../../../../../../models/Gallery";
import { isRequired } from "../../../../../../utils/validations";
import { showError } from "../../../../../../utils/showError";
import { ChangeArg, isNativeEvent } from "../../../../../../utils/isNativeEvent";
import { SelectGalleryDlg } from "../../Assets/Gallery/components/selectGalleryDlg/SelectGalleryDlg";
import { getFormatDimensions } from "../../../../../../const/ContentFormats";
import { PostOverlay } from "./PostOverlay";

type Props = {
  open: boolean;
  onClose: () => void;
  post: TContentPlanPost;
  contentPlanId: string;
};

const FUNNEL_STAGES = ["TOFU", "MOFU", "BOFU"];
const FORMATS = ["POST", "REELS", "STORIES"];

export function UpdateContentPlanPostDlg({ open, onClose, post, contentPlanId }: Props) {
  const { t } = useTranslation();
  const [updatePost, { isLoading }] = useUpdateContentPlanPostMutation();
  const [getContentPlanPosts] = useLazyGetContentPlanPostsQuery();
  const [showGallery, setShowGallery] = useState(false);

  const { form, handleChange } = useForm({
    date: post.date,
    funnelStage: post.funnelStage,
    format: post.format,
    contentType: post.contentType,
    topic: post.topic,
    marketingGoal: post.marketingGoal,
    title: post.title,
    hook: post.hook,
    thesis: post.thesis,
    cta: post.cta,
    designReference: post.designReference,
    overlayHtml: post.overlayHtml ?? '',
    photosIds: (post.photos ?? []).map((p) => p.photoId),
  });

  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>(
    Object.fromEntries((post.photos ?? []).map((p) => [p.photoId, p.url]))
  );

  const { errors, validateField, validateAll } = useValidation<typeof form>({
    title: (value: string) => isRequired(value),
    hook: (value: string) => isRequired(value),
    thesis: (value: string) => isRequired(value),
    cta: (value: string) => isRequired(value),
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll(form)) return;

    try {
      const response = await updatePost({ id: contentPlanId, day: post.day, form }).unwrap();

      if (response?.data) {
        await getContentPlanPosts(contentPlanId).unwrap();
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  };

  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: string;

    if (isNativeEvent(arg)) {
      const target = arg.target as HTMLInputElement;
      name = target.name;
      value = target.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("ContentPlanPosts.EditPost")}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="p-6 space-y-4 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">
                {t("ContentPlanPosts.FunnelStage")}
              </label>
              <select
                name="funnelStage"
                value={form.funnelStage}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {FUNNEL_STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">
                {t("ContentPlanPosts.Format")}
              </label>
              <select
                name="format"
                value={form.format}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">
                {t("ContentPlanPosts.ContentType")}
              </label>
              <input
                name="contentType"
                value={form.contentType}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.Title")}
            </label>
            <textarea
              name="title"
              value={form.title}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1 text-left">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.Topic")}
            </label>
            <textarea
              name="topic"
              value={form.topic}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.Hook")}
            </label>
            <textarea
              name="hook"
              value={form.hook}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.hook && <p className="text-red-500 text-sm mt-1 text-left">{errors.hook}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.Thesis")}
            </label>
            <textarea
              name="thesis"
              value={form.thesis}
              onChange={onChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.thesis && <p className="text-red-500 text-sm mt-1 text-left">{errors.thesis}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.CTA")}
            </label>
            <textarea
              name="cta"
              value={form.cta}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.cta && <p className="text-red-500 text-sm mt-1 text-left">{errors.cta}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.MarketingGoal")}
            </label>
            <textarea
              name="marketingGoal"
              value={form.marketingGoal}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Photo section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 text-left mb-2">
              {t("ContentPlanPosts.Photo")}
            </label>

            {form.photosIds.length > 0 && (
              <div className="flex gap-2 mb-2">
                {form.photosIds.map((id: string) => (
                  <div
                    key={id}
                    style={{ aspectRatio: getFormatDimensions(form.format).aspectRatio }}
                    className="relative h-24 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img
                      src={photoUrls[id] ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.photosIds.filter((pid: string) => pid !== id);
                        handleChange({ name: "photosIds", value: next });
                      }}
                      className="absolute top-0.5 right-0.5 bg-slate-900/60 rounded-full p-0.5 hover:bg-slate-900/80"
                    >
                      <X size={12} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGallery(!showGallery)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ImagePlus size={16} />
              {form.photosIds.length > 0
                ? t("ContentPlanPosts.ChangePhoto")
                : t("ContentPlanPosts.SelectPhoto")}
            </button>

            {showGallery && (
              <div className="mt-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                <SelectGalleryDlg
                  selectedIds={form.photosIds}
                  maxSelected={3}
                  focus={null}
                  onSelect={(selectedPhotos: TGalleryPhoto[]) => {
                    handleChange({ name: "photosIds", value: selectedPhotos.map((p) => p.id) });
                    setPhotoUrls((prev) => ({
                      ...prev,
                      ...Object.fromEntries(selectedPhotos.map((p) => [p.id, p.url])),
                    }));
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">
              {t("ContentPlanPosts.DesignReference")}
            </label>
            <textarea
              name="designReference"
              value={form.designReference}
              onChange={onChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Overlay HTML */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              {t("UpdateContentPlanPostDlg.OverlayHtml")}
            </label>
            {form.overlayHtml && (
              <div
                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-72"
                style={{ aspectRatio: getFormatDimensions(form.format).aspectRatio }}
              >
                <PostOverlay overlayHtml={form.overlayHtml} photoUrl={photoUrls[form.photosIds[0]]} />
              </div>
            )}
            <textarea
              name="overlayHtml"
              value={form.overlayHtml}
              onChange={onChange}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
              placeholder="<div style='position:absolute;width:100%;height:100%'>...</div>"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border text-slate-600 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("General.cancel")}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("General.saving")}
                </>
              ) : (
                t("General.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

