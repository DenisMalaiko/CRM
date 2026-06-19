import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";

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
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? String(t.checked) : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">Edit Content Plan</h2>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={update}>
          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Title</label>
            </div>

            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Content plan title"
            />

            {errors.title && <p className="text-red-500 text-sm mt-2 text-left">{errors.title}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Description</label>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Content plan description"
            />

            {errors.description && <p className="text-red-500 text-sm mt-2 text-left">{errors.description}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Status</label>
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
              ) : ("Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateContentPlanDlg;
