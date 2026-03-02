import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";

// Hooks
import { useForm } from "../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../../store/hooks";
import {
  useUpdateIdeaMutation,
  useGetIdeasMutation
} from "../../../../../../../store/idea/ideaApi";
import { setIdeas } from "../../../../../../../store/idea/ideaSlice";

// ENUM
import { IdeaStatus } from "../../../../../../../enum/IdeaStatus";

// UTILS
import { isRequired, minLength } from "../../../../../../../utils/validations";
import { showError } from "../../../../../../../utils/showError";
import { ChangeArg, isNativeEvent } from "../../../../../../../utils/isNativeEvent";
import {ApiResponse} from "../../../../../../../models/ApiResponse";
import {TIdea} from "../../../../../../../models/Idea";

function UpdateIdeaDlg({ open, onClose, idea }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const StatusList = Object.values(IdeaStatus);

  const [ updateIdea, { isLoading } ] = useUpdateIdeaMutation();
  const [ getIdeas ] = useGetIdeasMutation();

  // Init Form
  const initialForm = useMemo(() => {
    if (idea) {
      return {
        status: idea.status,
      }
    }

    return {
      status: IdeaStatus.New,
    }
  }, [idea]);

  // Form Hook
  const { form, handleChange } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    status: (value) => isRequired(value),
  });

  if (!businessId) return null;
  if (!open) return null;

  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const response = await updateIdea({ id: idea!.id, form }).unwrap();

      if(response && response?.data) {
        const responseIdeas: ApiResponse<TIdea[]> = await getIdeas(businessId).unwrap();

        if(responseIdeas && responseIdeas?.data) {
          dispatch(setIdeas(responseIdeas.data));
          toast.success(response.message);
          onClose()
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4 relative">
          <h2 className="text-lg font-semibold">Edit Idea</h2>

          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
          >
            <X size={20} strokeWidth={2} color="white"></X>
          </button>
        </div>

        <form className="space-y-4" onSubmit={update} action="">
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoading ? (
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

export default UpdateIdeaDlg;