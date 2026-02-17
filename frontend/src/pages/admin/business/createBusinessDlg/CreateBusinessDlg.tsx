import React, { useMemo } from 'react';
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

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
import { minLength, isRequired, isString } from "../../../../utils/validations";
import { ChangeArg, isNativeEvent } from "../../../../utils/isNativeEvent";

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
        brand: business.brand ?? "",
        advantages: business.advantages ?? [""],
        goals: business.goals ?? [""],
      };
    }

    return {
      name: "",
      website: "",
      industry: "",
      status: BusinessStatus.Active,
      agencyId: user?.agencyId,
      brand: "",
      advantages: [""],
      goals: [""],
    };
  }, [isEdit, business, user?.agencyId]);

  // Form Hook
  const { form, handleChange, setForm, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    website: (value) => minLength(value, 3),
    industry: (value) => minLength(value, 3),
    status: (value) => isRequired(value),
    agencyId: (value) => isRequired(value),
    brand: (value) => isString(value),
    advantages: (value) => isRequired(value),
    goals: (value) => isRequired(value),
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
        console.log("FORM ", form)
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


  type StringArrayField = Extract<{[K in keyof TBusiness]: TBusiness[K] extends string[] ? K : never }[keyof TBusiness], string>;

  const addItem = (field: StringArrayField, value = "") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
  }

  const deleteItem = (field: StringArrayField, index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: any) => i !== index),
    }));
  };

  const updateItem = (
    field: StringArrayField,
    index: number,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: any) =>
        i === index ? value : item
      ),
    }));
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-auto">
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

          <div className="grid">
            <label className="block text-sm font-medium text-slate-700 text-left">Brand</label>
            <textarea
              name="brand"
              value={form.brand}
              onChange={onChange}
              rows={8}
              className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter About Brand"
            ></textarea>
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Advantages
              </label>
            </div>

            {form.advantages.map((advantage: any, index: number) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={advantage}
                  onChange={(e) =>
                    updateItem("advantages", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter advantage"
                  rows={3}
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("advantages", index)}
                    className="
                      inline-flex items-center gap-1.5
                      px-2.5 py-1.5
                      rounded-md
                      text-sm font-medium
                      text-red-500
                      border border-red-200
                      hover:bg-red-50
                    "
                  >
                    Delete Advantage
                  </button>
                )}
              </div>
            ))}

            {errors.advantages && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.advantages}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("advantages")}
              className="
                inline-flex items-center gap-1.5
                px-2.5 py-1.5
                rounded-md
                text-sm font-medium
                text-blue-600
                border border-blue-200
                hover:bg-blue-50
              "
            >
              <Plus className="h-3 w-3" />
              New Advantage
            </button>
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Goals
              </label>
            </div>

            {form.goals.map((goal: any, index: number) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={goal}
                  onChange={(e) =>
                    updateItem("goals", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter goal"
                  rows={3}
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("goals", index)}
                    className="
                      inline-flex items-center gap-1.5
                      px-2.5 py-1.5
                      rounded-md
                      text-sm font-medium
                      text-red-500
                      border border-red-200
                      hover:bg-red-50
                    "
                  >
                    Delete Pain
                  </button>
                )}
              </div>
            ))}

            {errors.goals && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.goals}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("goals")}
              className="
                inline-flex items-center gap-1.5
                px-2.5 py-1.5
                rounded-md
                text-sm font-medium
                text-blue-600
                border border-blue-200
                hover:bg-blue-50
              "
            >
              <Plus className="h-3 w-3" />
              New Goal
            </button>
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
