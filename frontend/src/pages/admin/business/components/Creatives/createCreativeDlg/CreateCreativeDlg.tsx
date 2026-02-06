import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { showError } from "../../../../../../utils/showError";
import {isRequired, minLength} from "../../../../../../utils/validations";


import { useGetCreativesMutation, useUpdateCreativeMutation } from "../../../../../../store/artifact/artifactApi";
import { setCreatives } from "../../../../../../store/artifact/artifactSlice";
import { useAppDispatch } from "../../../../../../store/hooks";
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TAIArtifact } from "../../../../../../models/AIArtifact";
import {AIArtifactStatus} from "../../../../../../enum/AIArtifactStatus";
import {setProfiles} from "../../../../../../store/profile/profileSlice";
import {Plans} from "../../../../../../enum/Plans";

function CreateCreativeDlg({ open, onClose, creative }: any) {
  const dispatch = useAppDispatch();

  const isEdit = !!creative;

  const { businessId } = useParams<{ businessId: string }>();

  const [ updateCreative, { isLoading, isSuccess } ] = useUpdateCreativeMutation();
  const [ getCreatives ] = useGetCreativesMutation();

  const [form, setForm] = useState({
    status: AIArtifactStatus.Draft,
    outputJson: {
      hook: "",
      body: "",
      cta: "",
    }
  });
  const [errors, setErrors]: any = useState({});
  const StatusList = Object.values(AIArtifactStatus);

  useEffect(() => {
    if (isEdit && creative) {
      setForm({
        status: creative.status,
        outputJson: creative.outputJson,
      });
    } else {
      setForm({
        status: AIArtifactStatus.Draft,
        outputJson: {
          hook: "",
          body: "",
          cta: "",
        }
      })
    }
  }, [creative, isEdit, open]);

  if (!open) return null;
  if (!businessId) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "status") error = isRequired(data.value);
    if (name === "hook") error = minLength(data.value, 10);
    if (name === "body") error = minLength(data.value, 10);
    if (name === "cta") error = minLength(data.value, 10);
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
        await updateCreative({id: creative!.id, form})
      }

      const response: ApiResponse<TAIArtifact[]> = await getCreatives(businessId).unwrap();

      if(response && response?.data) {
        dispatch(setCreatives(response.data));
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 overflow-hidden">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Update Creative</h2>
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
              <label className="block text-sm font-medium text-slate-700 text-left">Status</label>
            </div>

            <select
              name="status"
              value={form.status}
              onChange={(e) => {
                handleChange(e);
                validateField("status", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              { StatusList.map((status: string) => (
                <option key={status} value={status}>{status}</option>
              )) }
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-2 text-left">{errors.status}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Hook</label>
            </div>

            <textarea
              name="outputJson.hook"
              value={form.outputJson.hook}
              onChange={(e) => {
                handleChange(e);
                validateField("hook", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hook"
            />
            {errors.hook && <p className="text-red-500 text-sm mt-2 text-left">{errors.hook}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">CTA</label>
            </div>

            <textarea
              name="outputJson.cta"
              value={form.outputJson.cta}
              onChange={(e) => {
                handleChange(e);
                validateField("cta", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter cta"
            />
            {errors.cta && <p className="text-red-500 text-sm mt-2 text-left">{errors.cta}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-slate-700 text-left">Body</label>
            </div>

            <textarea
              name="outputJson.body"
              rows={5}
              value={form.outputJson.body}
              onChange={(e) => {
                handleChange(e);
                validateField("body", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter body"
            />
            {errors.body && <p className="text-red-500 text-sm mt-2 text-left">{errors.body}</p>}
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

export default CreateCreativeDlg;