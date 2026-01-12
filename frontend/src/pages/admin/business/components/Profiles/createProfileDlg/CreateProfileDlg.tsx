import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showError } from "../../../../../../utils/showError";
import {isRequired, minLength} from "../../../../../../utils/validations";
import Tooltip from "../../../../../../components/tooltip/Tooltip";

import { MiniTranslate } from "../../../../../../enum/miniTranslate";

import {
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetProfilesMutation
} from "../../../../../../store/profile/profileApi";

import { setProfiles } from "../../../../../../store/profile/profileSlice";
import { useAppDispatch } from "../../../../../../store/hooks";
import {ApiResponse} from "../../../../../../models/ApiResponse";
import {TBusinessProfile} from "../../../../../../models/BusinessProfile";
import {toast} from "react-toastify";

function CreateProfileDlg({ open, onClose, profile }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!profile;
  const { businessId } = useParams<{ businessId: string }>();

  const [createProfile, { isLoading, isSuccess }] = useCreateProfileMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [getProfiles] = useGetProfilesMutation();

  const [form, setForm] = useState({
    name: "",
    profileFocus: "",
    isActive: true,
    businessId: businessId ?? "",
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    if (isEdit && profile) {
      setForm({
        name: profile.name,
        profileFocus: profile.profileFocus,
        isActive: profile.isActive,
        businessId: profile.businessId ?? "",
      })
    } else {
      setForm({
        name: "",
        profileFocus: "",
        isActive: true,
        businessId: businessId ?? "",
      })
    }
  }, [profile, isEdit, open]);


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
    if (name === "profileFocus") error = minLength(data.value, 10);
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
        await updateProfile({ id: profile!.id, form })
      } else {
        await createProfile(form);
      }

      const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();

      if(response && response?.data) {
        dispatch(setProfiles(response.data));
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  /*const addGoal = () => {
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
  };*/

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
              <label className="block text-sm font-medium text-slate-700 text-left">Profile Focus</label>
            </div>

            <input
              type="text"
              name="name"
              value={form.profileFocus}
              onChange={(e) => {
                handleChange(e);
                validateField("profileFocus", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
            {errors.profileFocus && <p className="text-red-500 text-sm mt-2 text-left">{errors.profileFocus}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Profile</span>
          </label>

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