import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useUpdateContentPlanMutation,
  useLazyGetContentPlansQuery,
} from "../../../../../../store/contentPlan/contentPlanApi";
import { setContentPlans } from "../../../../../../store/contentPlan/contentPlanSlice";

// Enum
import { ContentPlanStatus } from "../../../../../../enum/ContentPlanStatus";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TContentPlan } from "../../../../../../models/ContentPlan";

// Utils
import { isRequired } from "../../../../../../utils/validations";
import { showError } from "../../../../../../utils/showError";
import { ChangeArg, isNativeEvent } from "../../../../../../utils/isNativeEvent";

type Props = {
  open: boolean;
  onClose: () => void;
  contentPlan: TContentPlan | null;
};

function UpdateContentPlanDlg({ open, onClose, contentPlan }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const StatusList = Object.values(ContentPlanStatus);

  const [ updateContentPlan, { isLoading } ] = useUpdateContentPlanMutation();
  const [ getContentPlans ] = useLazyGetContentPlansQuery();

  const initialForm = useMemo(() => {
    if (contentPlan) {
      return {
        status: contentPlan.status,
        title: contentPlan.title,
        description: contentPlan.description,
      };
    }

    return {
      status: ContentPlanStatus.Draft,
      title: "",
      description: "",
    };
  }, [contentPlan]);

  const { form, handleChange } = useForm(initialForm);

  const { errors, validateField, validateAll } = useValidation({
    status: (value) => isRequired(value),
    title: (value) => isRequired(value),
    description: (value) => isRequired(value),
  });

  if (!businessId) return null;
  if (!open) return null;

  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const response = await updateContentPlan({ id: contentPlan!.id, form }).unwrap();

      if (response && response?.data) {
        const responsePlans: ApiResponse<TContentPlan[]> = await getContentPlans(businessId).unwrap();

        if (responsePlans && responsePlans?.data) {
          dispatch(setContentPlans(responsePlans.data));
          toast.success(response.message);
          onClose();
        }
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
      value = target.type === "checkbox" ? String(target.checked) : target.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  const isIdeaMode = contentPlan?.mode !== "marketing_calendar";

  const productsValue = contentPlan?.products?.map((p) => p.product.name).join(", ") ?? "";
  const audiencesValue = contentPlan?.audiences?.map((a) => a.targetAudience.name).join(", ") ?? "";
  const ideasValue = [
    ...(contentPlan?.ideas?.map((i) => i.idea.title) ?? []),
    ...(contentPlan?.ideasAI?.map((i) => i.ideaAI.title) ?? []),
  ].join(", ");
  const holidayValue = contentPlan?.holidayName
    ? `${contentPlan.holidayName}${contentPlan.holidayDate ? ` (${contentPlan.holidayDate})` : ""}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{t("ContentPlan.editTitle")}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="p-6 space-y-4 overflow-y-auto" onSubmit={update}>
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.products")}</label>
              <input
                type="text"
                value={productsValue}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.audiences")}</label>
              <input
                type="text"
                value={audiencesValue}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>

            {contentPlan?.designSystem && (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.designSystem")}</label>
                <div className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 flex items-center justify-between">
                  <span>{contentPlan.designSystem.name}</span>
                  <div className="flex gap-1">
                    {[
                      contentPlan.designSystem.colors.primary,
                      contentPlan.designSystem.colors.secondary,
                      contentPlan.designSystem.colors.accent,
                      contentPlan.designSystem.colors.muted,
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isIdeaMode}
                  disabled
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-500">{t("ContentPlan.idea")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isIdeaMode}
                  disabled
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-500">{t("ContentPlan.marketingCalendar")}</span>
              </label>
            </div>

            {isIdeaMode ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.ideas")}</label>
                <input
                  type="text"
                  value={ideasValue}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.holiday")}</label>
                <input
                  type="text"
                  value={holidayValue}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.title")}</label>
            </div>

            <textarea
              name="title"
              value={form.title}
              onChange={onChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t("ContentPlan.titlePlaceholder")}
            />

            {errors.title && <p className="text-red-500 text-sm mt-2 text-left">{errors.title}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">{t("ContentPlan.description")}</label>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t("ContentPlan.descriptionPlaceholder")}
            />

            {errors.description && <p className="text-red-500 text-sm mt-2 text-left">{errors.description}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">{t("General.status")}</label>
            </div>

            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {StatusList.map((status: string) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {errors.status && <p className="text-red-500 text-sm mt-2 text-left">{errors.status}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg border text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
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
              ) : (t("General.save"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateContentPlanDlg;
