import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import { createOrder, updateOrder, getOrders } from "../../../../store/orders/ordersThunks";
import { OrderStatus } from "../../../../enum/OrderStatus";
import { isRequired, minLength } from "../../../../utils/validations";
import { toast } from "react-toastify";
import {PaymentMethod} from "../../../../enum/PaymentMethod";
import {PaymentsStatus} from "../../../../enum/PaymentsStatus";
import {getProducts} from "../../../../store/products/productsThunks";
import {getClients} from "../../../../store/clients/clientsThunks";

function CreateOrderDlg({ open, onClose, order }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.authModule);
  const { products } = useSelector((state: RootState) => state.productsModule);
  const { clients } = useSelector((state: RootState) => state.clientsModule);
  const isEdit = !!order;

  const [form, setForm] = useState({
    total: 1,
    status: OrderStatus.Pending,
    productIds: [],
    clientId: null,
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
        clientId: null,
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

  const validateField = (name: string, data: any) => {
    let error: string | null = null;
    if (name === "name") error = minLength(data.value, 3);
    if (name === "description") error = minLength(data.value, 10);
    if (name === "sku") error = minLength(data.value, 6);
    if (name === "category") error = isRequired(data.value);
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

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Products { form.productIds } </label>

            <select
              multiple
              name="products"
              value={form.productIds}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {products && products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
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