import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { showError } from "../../../../../../../utils/showError";
import { minLength } from "../../../../../../../utils/validations";
import { Platforms } from "../../../../../../../enum/Platforms";

import {
  useCreatePlatformMutation,
  useUpdatePlatformMutation,
  useGetPlatformsMutation
} from "../../../../../../../store/platform/platformApi";

import { setPlatforms } from "../../../../../../../store/platform/platformSlice";

import { useAppDispatch } from "../../../../../../../store/hooks";
import { ApiResponse } from "../../../../../../../models/ApiResponse";
import { TPlatform } from "../../../../../../../models/Platform";
import { toast } from "react-toastify";

function CreatePlatformDlg({ open, onClose, platform }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!platform;
  const { businessId } = useParams<{ businessId: string }>();

  const [createPlatform, { isLoading, isSuccess }] = useCreatePlatformMutation();
  const [updatePlatform] = useUpdatePlatformMutation();
  const [getPlatforms] = useGetPlatformsMutation();

  const PlatformsList = Object.values(Platforms);

  const [form, setForm] = useState({
    name: "",
    code: Platforms.TikTok,
    isActive: true,
    trendRefreshRate: 0,
    businessId: businessId ?? "",
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    if (isEdit && platform) {
      setForm({
        name: platform.name,
        code: platform.code,
        isActive: platform.isActive,
        trendRefreshRate: 0,
        businessId: platform.businessId ?? businessId,
      })
    } else {
      setForm({
        name: "",
        code: Platforms.TikTok,
        isActive: true,
        trendRefreshRate: 0,
        businessId: businessId ?? "",
      })
    }
  }, [platform, isEdit, open]);

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
    if (name === "code") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  }

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
        await updatePlatform({ id: platform!.id, form })
      } else {
        await createPlatform(form);
      }

      const response: ApiResponse<TPlatform[]> = await getPlatforms(businessId).unwrap();

      if(response && response?.data) {
        dispatch(setPlatforms(response.data));
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 max-h-[800px] overflow-y-auto overflow-x-hidden">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Platform</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Code</label>
            </div>

            <select
              name="code"
              value={form.code}
              onChange={(e) => {
                handleChange(e);
                validateField("code", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { PlatformsList.map((platform: string) => (
                <option key={platform} value={platform}>{platform}</option>
              )) }
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Platform</span>
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

export default CreatePlatformDlg;