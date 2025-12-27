import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store";
import { isEmail, isPhoneNumber, minLength } from "../../../../utils/validations";
import { toast } from "react-toastify";
import { BusinessStatus } from "../../../../enum/BusinessStatus";
import { showError } from "../../../../utils/showError";

import { useUpdateBusinessMutation } from "../../../../store/businesses/businessesApi";
import { useCreateBusinessMutation } from "../../../../store/businesses/businessesApi";
import { useGetBusinessesMutation } from "../../../../store/businesses/businessesApi";
import { useGetBusinessMutation } from "../../../../store/businesses/businessesApi";
import { setBusiness, setBusinesses } from "../../../../store/businesses/businessesSlice";
import { useAppDispatch } from "../../../../store/hooks";
import {TBusiness} from "../../../../models/Business";
import {ApiResponse} from "../../../../models/ApiResponse";


function CreateBusinessDlg({ open, onClose, business }: any) {
  const dispatch = useAppDispatch();

  const [ getBusinesses ] = useGetBusinessesMutation();
  const [ createBusiness ] = useCreateBusinessMutation();
  const [ updateBusiness ] = useUpdateBusinessMutation();

  const { user } = useSelector((state: RootState) => state.authModule);
  const isEdit = !!business;
  const statuses = Object.values(BusinessStatus);

  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "",
    status: BusinessStatus.Active,
    agencyId: user ? user.agencyId : business.agencyId,
  });
  const [errors, setErrors]: any = useState({});


  useEffect(() => {
    if (isEdit && business) {
      setForm({
        name: business.name,
        website: business.website,
        industry: business.industry,
        status: business.status,
        agencyId: business.agencyId,
      });
    } else {
      setForm({
        name: "",
        website: "",
        industry: "",
        status: BusinessStatus.Active,
        agencyId: user?.agencyId,
      });
    }
  }, [business, isEdit, open]);


  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (["phoneNumber"].includes(name)) {
      newValue = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // лише цифри та одна крапка
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "number"
        ? newValue === "" ? "" : Number(newValue)
        : newValue
    }));
  }

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 2);
    if (name === "website") error = minLength(data.value, 2);
    if (name === "industry") error = minLength(data.value, 2);
    if (name === "status") error = minLength(data.value, 2);
    if (name === "agencyId") error = minLength(data.value, 2);
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
        const response: ApiResponse<TBusiness> = await updateBusiness({ id: business!.id, form }).unwrap();
        if(response && response.data) {
          dispatch(setBusiness(response.data));
        }
      } else {
        const response: ApiResponse<TBusiness> = await createBusiness(form).unwrap();
        if(response && response?.data) {
          dispatch(setBusiness(response.data));
        }
      }

      const response: any = await getBusinesses().unwrap();
      dispatch(setBusinesses(response.data));
      toast.success(response.message);
      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Business</h2>
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
                onChange={(e) => {
                  handleChange(e);
                  validateField("name", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Website</label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => {
                  handleChange(e);
                  validateField("website", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website"
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
                onChange={(e) => {
                  handleChange(e);
                  validateField("industry", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter industry"
              />
              {errors.industry && <p className="text-red-500 text-sm mt-2 text-left">{errors.industry}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                { statuses.map((status: string) => (
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBusinessDlg;
