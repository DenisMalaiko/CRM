import React, {useState} from "react";
import { useParams } from "react-router-dom";
import {ProductType} from "../../../../../../enum/ProductType";
import {PriceSegment} from "../../../../../../enum/PriceSegment";
import { showError } from "../../../../../../utils/showError";
import {isRequired, minLength} from "../../../../../../utils/validations";
import Tooltip from "../../../../../../components/tooltip/Tooltip";
import { Plus, Minus } from "lucide-react";

import { MiniTranslate } from "../../../../../../enum/miniTranslate";

function CreateProfileDlg({ open, onClose, profile }: any) {
  const isEdit = !!profile;
  const { businessId } = useParams<{ businessId: string }>();

  const [form, setForm] = useState({
    name: "",
    positioning: "",
    toneOfVoice: "",
    brandRules: "",
    goals: [
      "Goal 1",
    ],
    isActive: true,
    businessId: businessId ?? "",
  });
  const [errors, setErrors]: any = useState({});


  if (!open) return null;

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
    if (name === "positioning") error = minLength(data.value, 10);
    if (name === "toneOfVoice") error = minLength(data.value, 10);
    if (name === "brandRules") error = minLength(data.value, 10);
    if (name === "goals") error = isRequired(data.value);
    if (name === "isActive") error = isRequired(data.value);
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
        //await updateProduct({ id: product!.id, form })
      } else {
        console.log("CREATE PROFILE:")
        //await createProduct(form);
      }
    } catch (error) {
      showError(error);
    }
  }

  const addGoal = () => {
    setForm((prev) => ({
      ...prev,
      goals: [...prev.goals, "New Goal"],
    }));
  }

  const deleteGoal = (index: number) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  }

  const updateGoal = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) =>
        i === index ? value : goal
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Profile</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Positioning</label>
              <Tooltip text={MiniTranslate.ProfilePositioningTooltip}/>
            </div>

            <textarea
              name="positioning"
              value={form.positioning}
              onChange={(e) => {
                handleChange(e);
                validateField("positioning", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter positioning"
            />
            {errors.positioning && <p className="text-red-500 text-sm mt-2 text-left">{errors.positioning}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Tone Of Voice</label>
              <Tooltip text={MiniTranslate.ProfileToneOfVoiceTooltip}/>
            </div>

            <textarea
              name="toneOfVoice"
              value={form.toneOfVoice}
              onChange={(e) => {
                handleChange(e);
                validateField("toneOfVoice", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tone Of Voice"
            />
            {errors.toneOfVoice && <p className="text-red-500 text-sm mt-2 text-left">{errors.toneOfVoice}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Brand Rules</label>
              <Tooltip text={MiniTranslate.ProfileBrandRulesTooltip}/>
            </div>

            <textarea
              name="brandRules"
              value={form.brandRules}
              onChange={(e) => {
                handleChange(e);
                validateField("brandRules", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter brand rules"
            />
            {errors.brandRules && <p className="text-red-500 text-sm mt-2 text-left">{errors.brandRules}</p>}
          </div>

          <div className="flex flex-col items-start justify-start">
            <div className="flex w-full items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Goals</label>
              <Tooltip text={MiniTranslate.ProfileGoalsTooltip}/>
            </div>

            { form.goals.map((goal, index) => (
              <div className="flex items-center gap-2 w-full" key={index}>
                <textarea
                  name="goal"
                  value={goal}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  className="mt-1 mb-2 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter goal"
                />

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => deleteGoal(index)}
                    className="
                    inline-flex items-center gap-1.5
                    px-2.5 py-1.5
                    rounded-md
                    text-sm font-medium
                    text-red-500
                    border border-red-200
                    hover:bg-red-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  >
                    Delete Goal
                  </button>
                )}
              </div>
              ))
            }
            {errors.goals && <p className="text-red-500 text-sm mt-2 text-left">{errors.goals}</p>}

            <button
              type="button"
              onClick={addGoal}
              className="
                inline-flex items-center gap-1.5
                px-2.5 py-1.5
                rounded-md
                text-sm font-medium
                text-blue-600
                border border-blue-200
                hover:bg-blue-50
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Plus className="w-3 h-3"></Plus>
              New Goal
            </button>
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

export default CreateProfileDlg;