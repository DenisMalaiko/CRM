import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from 'react-select';

import { AppDispatch, RootState } from "../../../../store";
import { createOrder, updateOrder, getOrders } from "../../../../store/orders/ordersThunks";
import { OrderStatus } from "../../../../enum/OrderStatus";
import { isRequired, minLength } from "../../../../utils/validations";
import { PaymentMethod } from "../../../../enum/PaymentMethod";
import { PaymentsStatus } from "../../../../enum/PaymentsStatus";
import { getProducts } from "../../../../store/products/productsThunks";
import { getClients } from "../../../../store/clients/clientsThunks";
import { TProduct } from "../../../../models/Product";
import { TClient } from "../../../../models/Client";

type OptionType = {
  value: string | undefined;
  label: string;
};

function CreateOrderDlg({ open, onClose, order }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.authModule);
  const { products } = useSelector((state: RootState) => state.productsModule);
  const { clients } = useSelector((state: RootState) => state.clientsModule);
  const isEdit = !!order;

  const productsOptions: OptionType[] = products?.map((product: TProduct) => ({
    value: product.id,
    label: product.name,
  })) ?? [];

  const [form, setForm] = useState({
    total: 1,
    status: OrderStatus.Pending,
    productIds: [],
    clientId: "",
    paymentStatus: PaymentsStatus.Unpaid,
    paymentMethod: PaymentMethod.CreditCard,
    notes: "",
    businessId: user?.businessId,
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getClients());
    if (isEdit && order) {
      setForm({
        total: order.total,
        status: order.status,
        productIds: order.productIds,
        clientId: order.clientId,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        businessId: user?.businessId,
      });
    } else {
      setForm({
        total: 1,
        status: OrderStatus.Pending,
        productIds: [],
        clientId: "",
        paymentStatus: PaymentsStatus.Unpaid,
        paymentMethod: PaymentMethod.CreditCard,
        notes: "",
        businessId: user?.businessId,
      });
    }
  }, [order, isEdit, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  const handleSelectChange = (name: string, selected: readonly OptionType[]) => {
    setForm((prev) => ({
      ...prev,
      [name]: selected.map((opt) => opt.value),
    }));
  };

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "clientId") error = isRequired(data.value);
    if (name === "productsIds") error = isRequired(data.map((opt: any) => opt.value));
    if (name === "paymentMethod") error = isRequired(data.value);
    if (name === "paymentStatus") error = isRequired(data.value);
    if (name === "notes") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let response;

      if (isEdit) {
        response = await dispatch(updateOrder({ id: order!.id, form })).unwrap();
      } else {
        response = await dispatch(createOrder(form)).unwrap();
      }

      await dispatch(getOrders());
      toast.success(response.message);

      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const paymentMethods = Object.values(PaymentMethod);

  const paymentStatuses = Object.values(PaymentsStatus);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Order</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={create} action="">

          <pre> { JSON.stringify(form?.clientId) } </pre>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Client</label>
            <select
              name="clientId"
              value={form.clientId}
              onChange={(e) => {
                handleChange(e);
                validateField("clientId", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Client
              </option>

              {clients && clients.map((client: TClient) => (
                <option key={client.id} value={client.id}>{client.firstName}</option>
              )) }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Products</label>
            <Select<OptionType, true>
              isMulti
              name="colors"
              options={productsOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selected) => {
                handleSelectChange("productIds", selected);
                validateField("productIds", { value: selected })
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Payment Method</label>

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(e) => {
                handleChange(e);
                validateField("paymentMethod", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Payment Method
              </option>

              {paymentMethods && paymentMethods.map((method: string) => (
                <option key={method} value={method}>{method}</option>
              )) }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Payment Status</label>

            <select
              name="paymentStatus"
              value={form.paymentStatus}
              onChange={(e) => {
                handleChange(e);
                validateField("paymentStatus", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Payment Status
              </option>

              {paymentStatuses && paymentStatuses.map((status: string) => (
                <option key={status} value={status}>{status}</option>
              )) }
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Order Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={(e) => {
                handleChange(e);
                validateField("notes", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter order notes"
            />
            {errors.notes && <p className="text-red-500 text-sm text-left">{errors.notes}</p>}
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

export default CreateOrderDlg;