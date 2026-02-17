import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useCreateAudienceMutation,
  useUpdateAudienceMutation,
  useGetAudiencesMutation
} from "../../../../../../store/audience/audienceApi";
import { setAudiences } from "../../../../../../store/audience/audienceSlice";

// Components
import Select from "react-select";
import Tooltip from "../../../../../../components/tooltip/Tooltip";

// Utils
import { showError } from "../../../../../../utils/showError";
import { isRequired, minLength } from "../../../../../../utils/validations";
import { ChangeArg, isNativeEvent } from "../../../../../../utils/isNativeEvent";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";

// Enum
import { Gender } from "../../../../../../enum/Gender";
import { MiniTranslate } from "../../../../../../enum/MiniTranslate";
import { IncomeLevel } from "../../../../../../enum/IncomeLevel";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAudience } from "../../../../../../models/Audience";

// Const
import { GeoList } from "../../../../../../const/Geo";

function CreateAudienceDlg({ open, onClose, audience }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!audience;
  const { businessId } = useParams<{ businessId: string }>();

  const [ createAudience, { isLoading: isLoadingCreating } ] = useCreateAudienceMutation();
  const [ updateAudience, { isLoading: isLoadingUpdating } ] = useUpdateAudienceMutation();
  const [ getAudiences ] = useGetAudiencesMutation();

  const GenderList = Object.values(Gender);
  const IncomeLevelList = Object.values(IncomeLevel);

  // Init Form
  const initForm = useMemo(() => {
    if(isEdit && audience) {
      return {
        name: audience.name,
        ageRange: audience.ageRange,
        gender: audience.gender,
        geo: audience.geo,
        pains: audience.pains,
        desires: audience.desires,
        triggers: audience.triggers,
        interests: audience.interests,
        incomeLevel: audience.incomeLevel,
        businessId: audience.businessId ?? "",
      }
    }

    return {
      name: "",
      ageRange: "20-50",
      gender: Gender.All,
      geo: GeoList[0].value,
      pains: [""],
      desires: [""],
      triggers: [""],
      interests: [""],
      incomeLevel: IncomeLevel.Medium,
      businessId: businessId ?? "",
    }
  }, [isEdit, audience, businessId]);

  // Form Hook
  const { form, handleChange, setForm, resetForm } = useForm(initForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    ageRange: (value) => minLength(value, 3),
    gender: (value) => isRequired(value),
    geo: (value) => isRequired(value),
    pains: (value) => isRequired(value),
    desires: (value) => isRequired(value),
    triggers: (value) => isRequired(value),
    interests: (value) => isRequired(value),
    incomeLevel: (value) => isRequired(value),
    businessId: (value) => isRequired(value),
  });

  if (!open) return null;
  if (!businessId) return null;

  // Create Audience
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response = await updateAudience({ id: audience!.id, form }).unwrap();
        if(response && response?.data) toast.success(response.message);
      } else {
        const response = await createAudience(form).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setAudiences(response.data));
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


  type StringArrayField = Extract<{[K in keyof TAudience]: TAudience[K] extends string[] ? K : never }[keyof TAudience], string>;

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

  const onAgeRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    value = value.replace(/[^\d-]/g, "");

    if (value.length === 2 && !value.includes("-")) {
      value = value + "-";
    }

    if (value.length > 5) return;

    setForm((prev) => ({
      ...prev,
      ageRange: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 max-h-[800px] overflow-y-auto overflow-x-hidden">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Audience</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Age Range</label>
              <Tooltip text={MiniTranslate.AudienceAge}/>
            </div>

            <input
              type="text"
              name="ageRange"
              value={form.ageRange}
              onChange={onAgeRangeChange}
              placeholder="20-50"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.ageRange && <p className="text-red-500 text-sm mt-2 text-left">{errors.ageRange}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Gender</label>
            </div>

            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { GenderList.map((gender: string) => (
                <option key={gender} value={gender}>{gender}</option>
              )) }
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Geo</label>
            </div>

            <Select
              options={GeoList}
              value={GeoList.filter((option) =>
                form.geo.includes(option.value)
              )}
              onChange={(selected: any) =>
                onChange({
                  name: "geo",
                  value: selected ? selected?.value : "",
                })
              }
              styles={centeredSelectStyles}
            />

            {errors.geo && <p className="text-red-500 text-sm mt-2 text-left">{errors.geo}</p>}
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Interests
              </label>
            </div>

            {form.interests.map((interest: any, index: number) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={interest}
                  onChange={(e) =>
                    updateItem("interests", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter interest"
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("interests", index)}
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
                    Delete Interest
                  </button>
                )}
              </div>
            ))}

            {errors.interests && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.interests}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("interests")}
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
              New Interest
            </button>
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Pains
              </label>
            </div>

            {form.pains.map((pain: any, index: number) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={pain}
                  onChange={(e) =>
                    updateItem("pains", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter pain"
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("pains", index)}
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

            {errors.pains && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.pains}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("pains")}
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
              New Pain
            </button>
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Desires
              </label>
            </div>

            {form.desires.map((desire: any, index: number) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={desire}
                  onChange={(e) =>
                    updateItem("desires", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter desire"
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("desires", index)}
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
                    Delete Desire
                  </button>
                )}
              </div>
            ))}

            {errors.desires && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.desires}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("desires")}
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
              New Desire
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Income Level</label>
            </div>

            <select
              name="incomeLevel"
              value={form.incomeLevel}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { IncomeLevelList.map((level: string) => (
                <option key={level} value={level}>{level}</option>
              )) }
            </select>

            {errors.incomeLevel && <p className="text-red-500 text-sm mt-2 text-left">{errors.incomeLevel}</p>}
          </div>

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

export default CreateAudienceDlg;