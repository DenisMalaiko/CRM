import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../../../../store/hooks";
import {
  useCreateCompetitorMutation,
  useUpdateCompetitorMutation,
  useGetCompetitorsMutation,
  useGetCompetitorMutation,
} from "../../../../../../../../../store/competitor/competitorApi";
import { setCompetitors, setCompetitor } from "../../../../../../../../../store/competitor/competitorSlice";

// Utils
import { showError } from "../../../../../../../../../utils/showError";
import { isBoolean, isRequired, minLength } from "../../../../../../../../../utils/validations";

// Models
import { ApiResponse } from "../../../../../../../../../models/ApiResponse";
import { TCompetitor } from "../../../../../../../../../models/Competitor";
import { ChangeArg, isNativeEvent } from "../../../../../../../../../utils/isNativeEvent";

function CreateCompetitorDlg({ open, onClose, competitor }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!competitor;
  const { businessId } = useParams<{ businessId: string }>();

  const [ createCompetitor, { isLoading: isLoadingCreating }] = useCreateCompetitorMutation();
  const [ updateCompetitor, { isLoading: isLoadingUpdating }] = useUpdateCompetitorMutation();
  const [ getCompetitors] = useGetCompetitorsMutation();
  const [ getCompetitor ] = useGetCompetitorMutation();

  // Init Form
  const initForm = useMemo(() => {
    if(isEdit && competitor) {
      return {
        name: competitor.name,
        facebookLink: competitor.facebookLink,
        isActive: competitor.isActive,
        businessId: competitor.businessId,
      }
    }

    return {
      name: "",
      facebookLink: "",
      isActive: true,
      businessId: businessId,
    };
  }, [isEdit, competitor, businessId]);

  // Form Hooks
  const { form, handleChange, resetForm } = useForm(initForm);


  // Validation Hooks
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    facebookLink: (value) => minLength(value, 3),
    isActive: (value) => isBoolean(value),
    businessId: (value) => isRequired(value),
  });

  if (!open) return null;
  if (!businessId) return null;

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response = await updateCompetitor({ id: competitor!.id, form }).unwrap();
        if(response && response?.data) toast.success(response.message);
        const responseCompetitor = await getCompetitor(competitor!.id).unwrap();
        if(responseCompetitor && responseCompetitor?.data) dispatch(setCompetitor(responseCompetitor.data));
      } else {
        const response = await createCompetitor(form).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TCompetitor[]> = await getCompetitors(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setCompetitors(response.data));
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
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Competitor</h2>
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
              autoComplete="off"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>


          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Facebook Link</label>
            </div>

            <input
              type="text"
              name="facebookLink"
              value={form.facebookLink}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter facebook link"
              autoComplete="off"
            />
            {errors.facebookLink && <p className="text-red-500 text-sm mt-2 text-left">{errors.facebookLink}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={onChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Competitor</span>
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

export default CreateCompetitorDlg;