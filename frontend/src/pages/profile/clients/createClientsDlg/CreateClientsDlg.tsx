import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "../../../../store";
import { createClient, getClients, updateClient } from "../../../../store/clients/clientsThunks";
import {exactLength, isEmail, isPhoneNumber, minLength} from "../../../../utils/validations";
import { ClientRoles } from "../../../../enum/ClientRoles";
import { toast } from "react-toastify";

function CreateClientsDlg({ open, onClose, client }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.authModule);
  const roles = Object.values(ClientRoles);
  const isEdit = !!client;
  const [countryCode, setCountryCode] = useState("+38");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+38",
    phoneNumber: "",
    address: "",
    role: ClientRoles.Customer,
    isActive: true,
    businessId: user?.businessId,
  });
  const [errors, setErrors]: any = useState({});


  useEffect(() => {
    if (isEdit && client) {
      setForm({
        firstName: client.firstName,
        lastName: client.lastName,
        businessId: client.businessId,
        email: client.email,
        countryCode: client.countryCode,
        phoneNumber: client.phoneNumber,
        address: client.address,
        role: client.role,
        isActive: client.isActive,
      });
    } else {
      setForm({
        firstName: "",
        lastName: "",
        businessId: user?.businessId,
        email: "",
        countryCode: "+38",
        phoneNumber: "",
        address: "",
        role: ClientRoles.Customer,
        isActive: true,
      });
    }
  }, [client, isEdit, open]);


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
    if (name === "firstName") error = minLength(data.value, 2);
    if (name === "lastName") error = minLength(data.value, 2);
    if (name === "email") error = isEmail(data.value);
    if (name === "phoneNumber") error = minLength(data.value, 9);
    if (name === "address") error = minLength(data.value, 2);
    if (name === "role") error = minLength(data.value, 2);
    if (name === "isActive") error = minLength(data.value, 2);
    if (name === "businessId") error = minLength(data.value, 2);
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
      let response;

      if (isEdit) {
        response = await dispatch(updateClient({ id: client!.id, form })).unwrap();
      } else {
        response = await dispatch(createClient(form)).unwrap();
      }

      await dispatch(getClients());
      toast.success(response.message);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Client</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={create} action="">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Client First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={(e) => {
                  handleChange(e);
                  validateField("firstName", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter firstname"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-2 text-left">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Client Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={(e) => {
                  handleChange(e);
                  validateField("lastName", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lastname"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-2 text-left">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={(e) => {
                  handleChange(e);
                  validateField("email", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-2 text-left">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Phone Number</label>

              <div className="flex mt-1">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={(e) => {
                    handleChange(e);
                    validateField("countryCode", { value: e.target.value })
                  }}
                  className="rounded-l-lg border border-slate-300 bg-gray-50 px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="+38">+38</option>
                  <option value="+48">+48</option>
                  <option value="+49">+49</option>
                </select>

                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000 000 00 00"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-2 text-left">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="New York, NY"
              />
              {errors.address && <p className="text-red-500 text-sm mt-2 text-left">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                { roles.map((role: string) => (
                  <option key={role} value={role}>{role}</option>
                )) }
              </select>
            </div>
          </div>


          {/* Actions */}
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

export default CreateClientsDlg;