import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useGetPromptsMutation
} from "../../../../../../store/prompts/promptApi";
import { setPrompts } from "../../../../../../store/prompts/promptSlice";

// Components

// Utils
import { showError } from "../../../../../../utils/showError";
import {isBoolean, isRequired, minLength} from "../../../../../../utils/validations";

// Enum
import { PromptPurpose } from "../../../../../../enum/PromptPurpose";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TPrompt } from "../../../../../../models/Prompt";
import {ChangeArg, isNativeEvent} from "../../../../../../utils/isNativeEvent";


function CreatePromptDlg({ open, onClose, prompt }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!prompt;
  const { businessId } = useParams<{ businessId: string }>();

  const [ createPrompt, { isLoading: isLoadingCreating }] = useCreatePromptMutation();
  const [ updatePrompt, { isLoading: isLoadingUpdating }] = useUpdatePromptMutation();
  const [ getPrompts ] = useGetPromptsMutation();

  const promptPurposesOptions = Object.values(PromptPurpose);

  // Init Form
  const initForm = useMemo(() => {
    if(isEdit && prompt) {
      return {
        name: prompt.name,
        purpose: prompt.purpose,
        text: prompt.text,
        isActive: prompt.isActive,
        businessId: prompt.businessId ?? "",
      }
    }

    return {
      name: "",
      purpose: PromptPurpose.Text,
      text: "",
      isActive: true,
      businessId: businessId ?? ""
    }
  }, [isEdit, prompt, businessId]);

  // Form Hooks
  const { form, handleChange, resetForm } = useForm(initForm);

  // Validation Hooks
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    purpose: (value) => isRequired(value),
    text: (value) => minLength(value, 10),
    isActive: (value) => isBoolean(value),
    businessId: (value) => isRequired(value),
  })

  if (!open) return null;
  if (!businessId) return null;

  // Create Prompt
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response = await updatePrompt({ id: prompt!.id, form }).unwrap();
        if(response && response?.data) toast.success(response.message);
      } else {
        const response = await createPrompt(form).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TPrompt[]> = await getPrompts(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setPrompts(response.data));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Prompt</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Name</label>
            </div>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Purpose</label>
            </div>

            <select
              name="purpose"
              value={form.purpose}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { promptPurposesOptions.map((purpose: string) => (
                <option key={purpose} value={purpose}>{purpose}</option>
              )) }
            </select>

            {errors.purpose && <p className="text-red-500 text-sm mt-2 text-left">{errors.purpose}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Text</label>
            <textarea
              name="text"
              value={form.text}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text"
              rows={6}
            />
            {errors.text && <p className="text-red-500 text-sm text-left">{errors.text}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={onChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Profile</span>
          </label>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingCreating || isLoadingUpdating}
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
              disabled={isLoadingCreating || isLoadingUpdating}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingCreating || isLoadingUpdating ? (
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

export default CreatePromptDlg;