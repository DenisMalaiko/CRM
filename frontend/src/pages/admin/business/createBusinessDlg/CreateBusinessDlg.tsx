import React, { useState, useMemo } from 'react';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../hooks/useForm";
import { useValidation } from "../../../../hooks/useValidation";

// Redux
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store";
import { useAppDispatch } from "../../../../store/hooks";
import { useUpdateBusinessMutation } from "../../../../store/businesses/businessesApi";
import { useCreateBusinessMutation } from "../../../../store/businesses/businessesApi";
import { useGetBusinessesMutation } from "../../../../store/businesses/businessesApi";
import { setBusiness, setBusinesses } from "../../../../store/businesses/businessesSlice";

// Utils
import { showError } from "../../../../utils/showError";
import { minLength, isRequired } from "../../../../utils/validations";

// Models
import { TBusiness } from "../../../../models/Business";
import { ApiResponse } from "../../../../models/ApiResponse";

// Enums
import { BusinessStatus } from "../../../../enum/BusinessStatus";

function CreateBusinessDlg({ open, onClose, business }: any) {
  const dispatch = useAppDispatch();
  const [ getBusinesses ] = useGetBusinessesMutation();
  const [ createBusiness, { isLoading: isLoadingCreating } ] = useCreateBusinessMutation();
  const [ updateBusiness, { isLoading: isLoadingUpdating } ] = useUpdateBusinessMutation();

  const { user } = useSelector((state: RootState) => state.authModule);
  const isEdit = !!business;
  const StatusList = Object.values(BusinessStatus);

  // Init From
  const initialForm = useMemo(() => {
    if (isEdit && business) {
      return {
        name: business.name,
        website: business.website,
        industry: business.industry,
        status: business.status,
        agencyId: business.agencyId,
      };
    }

    return {
      name: "",
      website: "",
      industry: "",
      status: BusinessStatus.Active,
      agencyId: user?.agencyId,
    };
  }, [isEdit, business, user?.agencyId]);

  // Form Hook
  const { form, handleChange, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    website: (value) => minLength(value, 3),
    industry: (value) => minLength(value, 3),
    status: (value) => isRequired(value),
    agencyId: (value) => isRequired(value),
  })

  if (!open) return null;

  // Create Business
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response: ApiResponse<TBusiness> = await updateBusiness({ id: business!.id, form }).unwrap();
        if(response && response.data) {
          dispatch(setBusiness(response.data));
          toast.success(response.message);
        }
      } else {
        const response: ApiResponse<TBusiness> = await createBusiness(form).unwrap();
        if(response && response?.data) {
          dispatch(setBusiness(response.data));
          toast.success(response.message);
        }
      }

      const response: any = await getBusinesses().unwrap();
      dispatch(setBusinesses(response.data));
      resetForm();
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(e);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create"} Business</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={create} action="">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Name</label>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Website</label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website"
                autoComplete="off"
              />
              {errors.website && <p className="text-red-500 text-sm mt-2 text-left">{errors.website}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Industry</label>
              <input
                type="text"
                name="industry"
                value={form.industry}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter industry"
                autoComplete="off"
              />
              {errors.industry && <p className="text-red-500 text-sm mt-2 text-left">{errors.industry}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Status</label>
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
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

export default CreateBusinessDlg;
