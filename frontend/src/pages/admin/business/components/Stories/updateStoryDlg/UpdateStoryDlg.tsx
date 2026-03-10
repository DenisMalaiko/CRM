import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useUpdateCreativeMutation,
  useLazyGetAiArtifactsQuery
} from "../../../../../../store/artifact/artifactApi";
import {setPosts, setStories} from "../../../../../../store/artifact/artifactSlice";

// Utils
import { showError } from "../../../../../../utils/showError";
import { isRequired, minLength } from "../../../../../../utils/validations";
import { ChangeArg, isNativeEvent } from "../../../../../../utils/isNativeEvent";


// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../../models/AIArtifact";

// Enum
import { AIArtifactStatus } from "../../../../../../enum/AIArtifactStatus";
import { GalleryType } from "../../../../../../enum/GalleryType";
import {X} from "lucide-react";

function UpdateStoryDlg({ open, onClose, creative }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ updateCreative, { isLoading: isLoadingUpdating } ] = useUpdateCreativeMutation();
  const [ getAiArtifacts ] = useLazyGetAiArtifactsQuery();
  const StatusList = Object.values(AIArtifactStatus);

  const isEdit = !!creative;

  // Init Form
  const initialForm = useMemo(() => {
    if(isEdit && creative) {
      return {
        status: creative.status,
        headline: creative.outputJson.headline,
        text: creative.outputJson.text,
      }
    }

    return {
      status: AIArtifactStatus.Draft,
      headline: "",
      text: "",
    }
  }, [isEdit, creative, businessId]);

  // Form Hook
  const { form, handleChange, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    status: (value) => isRequired(value),
    headline: (value) => minLength(value, 10),
    text: (value) => minLength(value, 10),
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
            headline: form.headline,
            text: form.text,
          }
        }

        const response = await updateCreative({id: creative!.id, form: data}).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TAIArtifact[]> = await getAiArtifacts({
        businessId,
        type: GalleryType.Story
      }).unwrap();
      if(response && response?.data) {
        dispatch(setStories(response.data));
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
        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Creative</h2>


          {/* Close */}
          <button
            onClick={() => onClose()}
            className="absolute right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Headline</label>
            </div>

            <textarea
              name="headline"
              value={form.headline}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter headline"
            />
            {errors.headline && <p className="text-red-500 text-sm mt-2 text-left">{errors.headline}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">text</label>
            </div>

            <textarea
              name="text"
              value={form.text}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text"
            />
            {errors.text && <p className="text-red-500 text-sm mt-2 text-left">{errors.text}</p>}
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

export default UpdateStoryDlg;