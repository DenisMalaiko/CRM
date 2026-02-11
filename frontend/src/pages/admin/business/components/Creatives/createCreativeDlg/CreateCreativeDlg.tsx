import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useGetCreativesMutation,
  useUpdateCreativeMutation
} from "../../../../../../store/artifact/artifactApi";
import { setCreatives } from "../../../../../../store/artifact/artifactSlice";

// Utils
import { showError } from "../../../../../../utils/showError";
import { isRequired, minLength } from "../../../../../../utils/validations";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../../models/AIArtifact";

// Enum
import { AIArtifactStatus } from "../../../../../../enum/AIArtifactStatus";
import {ChangeArg, isNativeEvent} from "../../../../../../utils/isNativeEvent";

function CreateCreativeDlg({ open, onClose, creative }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ updateCreative, { isLoading: isLoadingUpdating } ] = useUpdateCreativeMutation();
  const [ getCreatives ] = useGetCreativesMutation();
  const StatusList = Object.values(AIArtifactStatus);

  const isEdit = !!creative;

  // Init Form
  const initialForm = useMemo(() => {
    if(isEdit && creative) {
      return {
        status: creative.status,
        hook: creative.outputJson.hook,
        body: creative.outputJson.body,
        cta: creative.outputJson.cta,
      }
    }

    return {
      status: AIArtifactStatus.Draft,
      hook: "",
      body: "",
      cta: "",
    }
  }, [isEdit, creative, businessId]);

  // Form Hook
  const { form, handleChange, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    status: (value) => isRequired(value),
    hook: (value) => minLength(value, 10),
    body: (value) => minLength(value, 10),
    cta: (value) => minLength(value, 10),
  });

  if (!open) return null;
  if (!businessId) return null;

  // Update Creative
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const data = {
          status: form.status,
          outputJson: {
            hook: form.hook,
            body: form.body,
            cta: form.cta,
          }
        }

        const response = await updateCreative({id: creative!.id, form: data}).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TAIArtifact[]> = await getCreatives(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setCreatives(response.data));
        resetForm();
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 overflow-hidden">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Creative</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={create} action="">
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
              { StatusList.map((status: string) => (
                <option key={status} value={status}>{status}</option>
              )) }
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-2 text-left">{errors.status}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Hook</label>
            </div>

            <textarea
              name="hook"
              value={form.hook}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hook"
            />
            {errors.hook && <p className="text-red-500 text-sm mt-2 text-left">{errors.hook}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">CTA</label>
            </div>

            <textarea
              name="cta"
              value={form.cta}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter cta"
            />
            {errors.cta && <p className="text-red-500 text-sm mt-2 text-left">{errors.cta}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Body</label>
            </div>

            <textarea
              name="body"
              rows={5}
              value={form.body}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter body"
            />
            {errors.body && <p className="text-red-500 text-sm mt-2 text-left">{errors.body}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingUpdating}
              className="
                px-4 py-2 rounded-lg border  text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingUpdating}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingUpdating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Saving...
                </>
              ) : ("Save")
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateCreativeDlg;