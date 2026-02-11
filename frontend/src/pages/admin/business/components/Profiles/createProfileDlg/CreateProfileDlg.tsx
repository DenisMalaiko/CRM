import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetProfilesMutation
} from "../../../../../../store/profile/profileApi";
import { setProfiles } from "../../../../../../store/profile/profileSlice";

// Utils
import { showError } from "../../../../../../utils/showError";
import { isRequired, isRequiredArray, minLength, isBoolean } from "../../../../../../utils/validations";
import { isNativeEvent, ChangeArg } from "../../../../../../utils/isNativeEvent";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";

// Enum
import { BusinessProfileFocus } from "../../../../../../enum/BusinessProfileFocus";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TBusinessProfile } from "../../../../../../models/BusinessProfile";
import { TProduct } from "../../../../../../models/Product";
import { TAudience } from "../../../../../../models/Audience";
import { TPrompt } from "../../../../../../models/Prompt";

function CreateProfileDlg({ open, onClose, profile }: any) {
  const dispatch = useAppDispatch();

  const { products } = useSelector((state: any) => state.productsModule);
  const { audiences } = useSelector((state: any) => state.audienceModule);
  const { prompts } = useSelector((state: any) => state.promptModule);

  const isEdit = !!profile;
  const { businessId } = useParams<{ businessId: string }>();
  const [ createProfile, { isLoading: isLoadingCreating }] = useCreateProfileMutation();
  const [ updateProfile, { isLoading: isLoadingUpdating } ] = useUpdateProfileMutation();
  const [ getProfiles ] = useGetProfilesMutation();

  const productsOptions = products?.map((product: any) => ({ value: product.id, label: product.name })) ?? [];
  const audiencesOptions = audiences?.map((audience: any) => ({ value: audience.id, label: audience.name })) ?? [];
  const promptsOptions = prompts?.map((prompt: any) => ({ value: prompt.id, label: `${prompt.name} | ${prompt.purpose}` })) ?? [];
  const profileFocusOptions = Object.values(BusinessProfileFocus);

  // Init Form
  const initialForm = useMemo(() => {
    if (isEdit && profile) {
      return {
        name: profile.name,
        profileFocus: profile.profileFocus,
        productsIds: profile.products.map((x: TProduct) => x.id) ?? [],
        audiencesIds: profile.audiences.map((x: TAudience) => x.id) ?? [],
        promptsIds: profile.prompts.map((x: TPrompt) => x.id) ?? [],
        isActive: profile.isActive,
        businessId: profile.businessId ?? "",
      }
    }

    return {
      name: "",
      profileFocus: BusinessProfileFocus.GeneratePosts,
      productsIds: [] as string[],
      audiencesIds: [] as string[],
      promptsIds: [] as string[],
      isActive: true,
      businessId: businessId ?? "",
    }
  }, [isEdit, profile, businessId]);

  // Form Hook
  const { form, handleChange, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    profileFocus: (value) => isRequired(value),
    productsIds: (value) => isRequiredArray(value),
    audiencesIds: (value) => isRequiredArray(value),
    promptsIds: (value) => isRequiredArray(value),
    businessId: (value) => isRequired(value),
    isActive: (value) => isBoolean(value),
  });

  if (!open) return null;
  if (!businessId) return null;

  // Create Profile
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response = await updateProfile({ id: profile!.id, form }).unwrap();
        if(response && response?.data) toast.success(response.message);
      } else {
        const response = await createProfile(form).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setProfiles(response.data));
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
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Profile</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Profile Focus</label>
            </div>

            <select
              name="profileFocus"
              value={form.profileFocus}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { profileFocusOptions.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              )) }
            </select>

            {errors.profileFocus && <p className="text-red-500 text-sm mt-2 text-left">{errors.profileFocus}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Product</label>
            </div>

            <Select
              options={productsOptions}
              value={productsOptions.find(
                (option: { label: string, value: string }) => form.productsIds[0] === option.value
              )}
              onChange={(selected) =>
                onChange({
                  name: "productsIds",
                  value: selected ? [selected.value] : [],
                })
              }
              styles={centeredSelectStyles}
            />

            {errors.productsIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.productsIds}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Audiences</label>
            </div>

            <Select
              isMulti
              options={audiencesOptions}
              value={audiencesOptions.filter((option: any) =>
                form.audiencesIds.includes(option.value)
              )}
              onChange={(selected) =>
                onChange({
                  name: "audiencesIds",
                  value: selected.map((o) => o.value),
                })
              }
              styles={centeredSelectStyles}
            />

            {errors.audiencesIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.audiencesIds}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Prompts</label>
            </div>

            <Select
              isMulti
              options={promptsOptions}
              value={promptsOptions.filter((option: any) =>
                form.promptsIds.includes(option.value)
              )}
              onChange={(selected) =>
                onChange({
                  name: "promptsIds",
                  value: selected.map((o) => o.value),
                })
              }
              styles={centeredSelectStyles}
            />

            {errors.promptsIds && <p className="text-red-500 text-sm mt-2 text-left">{errors.promptsIds}</p>}
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

export default CreateProfileDlg;