import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { X } from "lucide-react";

import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";
import {
  useUpdateContentPlanPostMutation,
  useLazyGetContentPlanPostsQuery,
} from "../../../../../../store/contentPlan/contentPlanApi";
import { TContentPlanPost } from "../../../../../../models/ContentPlan";
import { isRequired } from "../../../../../../utils/validations";
import { showError } from "../../../../../../utils/showError";
import { ChangeArg, isNativeEvent } from "../../../../../../utils/isNativeEvent";

type Props = {
  open: boolean;
  onClose: () => void;
  post: TContentPlanPost;
  contentPlanId: string;
};

const FUNNEL_STAGES = ["TOFU", "MOFU", "BOFU"];
const FORMATS = ["POST", "REELS", "STORIES"];

function UpdateContentPlanPostDlg({ open, onClose, post, contentPlanId }: Props) {
  const { t } = useTranslation();
  const [updatePost, { isLoading }] = useUpdateContentPlanPostMutation();
  const [getContentPlanPosts] = useLazyGetContentPlanPostsQuery();

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
  });

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
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.value;
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border text-slate-600 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateContentPlanPostDlg;