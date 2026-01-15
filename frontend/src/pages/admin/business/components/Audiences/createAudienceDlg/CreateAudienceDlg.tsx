import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showError } from "../../../../../../utils/showError";
import {isRequired, minLength} from "../../../../../../utils/validations";
import Tooltip from "../../../../../../components/tooltip/Tooltip";

import { MiniTranslate } from "../../../../../../enum/miniTranslate";

import {
  useCreateAudienceMutation,
  useUpdateAudienceMutation,
  useGetAudiencesMutation
} from "../../../../../../store/audience/audienceApi";

import { setAudiences } from "../../../../../../store/audience/audienceSlice";

import { useAppDispatch } from "../../../../../../store/hooks";
import {ApiResponse} from "../../../../../../models/ApiResponse";
import { TAudience } from "../../../../../../models/Audience";
import { toast } from "react-toastify";
import { Gender } from "../../../../../../enum/Gender";
import { IncomeLevel } from "../../../../../../enum/IncomeLevel";
import { Plus } from "lucide-react";

function CreateAudienceDlg({ open, onClose, audience }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!audience;
  const { businessId } = useParams<{ businessId: string }>();

  const [ createAudience, { isLoading: isCreateLoading } ] = useCreateAudienceMutation();
  const [ updateAudience, { isLoading: isUpdateLoading } ] = useUpdateAudienceMutation();
  const [ getAudiences ] = useGetAudiencesMutation();

  const GenderList = Object.values(Gender);
  const IncomeLevelList = Object.values(IncomeLevel);

  const [form, setForm] = useState({
    name: "",
    ageRange: "",
    gender: Gender.Male,
    geo: "",
    pains: [""],
    desires: [""],
    triggers: [""],
    incomeLevel: IncomeLevel.Low,
    businessId: businessId ?? "",
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    if (isEdit && audience) {
      setForm({
        name: audience.name,
        ageRange: audience.ageRange,
        gender: audience.gender,
        geo: audience.geo,
        pains: audience.pains,
        desires: audience.desires,
        triggers: audience.triggers,
        incomeLevel: audience.incomeLevel,
        businessId: audience.businessId ?? "",
      })
    } else {
      setForm({
        name: "",
        ageRange: "",
        gender: Gender.Male,
        geo: "",
        pains: [""],
        desires: [""],
        triggers: [""],
        incomeLevel: IncomeLevel.Low,
        businessId: businessId ?? "",
      })
    }
  }, [audience, isEdit, open]);

  if (!open) return null;
  if (!businessId) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 3);
    if (name === "ageRange") error = minLength(data.value, 3);
    if (name === "gender") error = minLength(data.value, 3);
    if (name === "geo") error = minLength(data.value, 3);
    if (name === "pains") {
      console.log("DATA VALUE ", data.value)
      error = isRequired(data.value);
    }
    if (name === "desires") error = isRequired(data.value);
    if (name === "triggers") error = isRequired(data.value);
    if (name === "incomeLevel") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = (e: React.FormEvent<HTMLFormElement>): boolean => {
    e.preventDefault();

    const newErrors: Record<string, string | null> = {};

    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, { value: form[field as keyof typeof form] });
    });

    setErrors(newErrors);

    return window.utils.validateForm(newErrors);
  }

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateForm(e)) return;

    try {
      if (isEdit) {
        console.log("UPDATE PROFILE:")
        await updateAudience({ id: audience!.id, form })
      } else {
        console.log("FORM ", form)
        await createAudience(form);
      }

      const response: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();

      if(response && response?.data) {
        dispatch(setAudiences(response.data));
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  type StringArrayField = Extract<
    {
      [K in keyof TAudience]: TAudience[K] extends string[] ? K : never
    }[keyof TAudience],
    string
  >;

  const addItem = (field: StringArrayField, value = "") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
  }

  const deleteItem = (field: StringArrayField, index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (
    field: StringArrayField,
    index: number,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 max-h-[800px] overflow-y-auto overflow-x-hidden">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Audience</h2>
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
              <Tooltip text={MiniTranslate.ProfileNameTooltip}/>
            </div>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => {
                handleChange(e);
                validateField("name", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Age Range</label>
            </div>

            <input
              type="text"
              name="ageRange"
              value={form.ageRange}
              onChange={(e) => {
                handleChange(e);
                validateField("ageRange", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Age Range"
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
              onChange={(e) => {
                handleChange(e);
                validateField("gender", { value: e.target.value })
              }}
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

            <input
              type="text"
              name="geo"
              value={form.geo}
              onChange={(e) => {
                handleChange(e);
                validateField("geo", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Geo"
            />
            {errors.geo && <p className="text-red-500 text-sm mt-2 text-left">{errors.geo}</p>}
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Pains
              </label>
              <Tooltip text={MiniTranslate.ProfileGoalsTooltip} />
            </div>

            {form.pains.map((pain, index) => (
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

            {form.desires.map((desire, index) => (
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

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Triggers
              </label>
            </div>

            {form.triggers.map((trigger, index) => (
              <div className="flex w-full items-center gap-2" key={index}>
                <textarea
                  value={trigger}
                  onChange={(e) =>
                    updateItem("triggers", index, e.target.value)
                  }
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trigger"
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteItem("triggers", index)}
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
                    Delete Trigger
                  </button>
                )}
              </div>
            ))}

            {errors.triggers && (
              <p className="mt-2 text-left text-sm text-red-500">
                {errors.triggers}
              </p>
            )}

            <button
              type="button"
              onClick={() => addItem("triggers")}
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
              New Trigger
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Income Level</label>
            </div>

            <select
              name="incomeLevel"
              value={form.incomeLevel}
              onChange={(e) => {
                handleChange(e);
                validateField("incomeLevel", { value: e.target.value })
              }}
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
              className="
                px-4 py-2 rounded-lg  text-white font-medium
                bg-blue-600 hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
              "
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAudienceDlg;