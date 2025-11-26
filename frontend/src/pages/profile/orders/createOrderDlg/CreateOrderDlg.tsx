import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { AppDispatch, RootState } from "../../../../store";
import { createOrder, updateOrder, getOrders } from "../../../../store/orders/ordersThunks";
import { OrderStatus } from "../../../../enum/OrderStatus";
import { isRequired, minLength } from "../../../../utils/validations";
import { PaymentMethod } from "../../../../enum/PaymentMethod";
import { PaymentsStatus } from "../../../../enum/PaymentsStatus";
import { ProductStatus } from "../../../../enum/ProductStatus";
import { getProducts } from "../../../../store/products/productsThunks";
import { getClients } from "../../../../store/clients/clientsThunks";
import { TProduct } from "../../../../models/Product";
import { TClient } from "../../../../models/Client";
import { useAppDispatch } from "../../../../store/hooks";

import { useUpdateOrderMutation } from "../../../../store/orders/ordersApi";
import { useCreateOrderMutation } from "../../../../store/orders/ordersApi";
import { useGetOrdersMutation } from "../../../../store/orders/ordersApi";
import { useGetClientsMutation } from "../../../../store/clients/clientsApi";
import { useGetProductsMutation } from "../../../../store/products/productsApi";

import { setOrders } from "../../../../store/orders/ordersSlice";
import { setProducts } from "../../../../store/products/productsSlice";
import { setClients } from "../../../../store/clients/clientsSlice";


function CreateOrderDlg({ open, onClose, order }: any) {
  const dispatch = useAppDispatch();

  const [ getOrders ] = useGetOrdersMutation();
  const [ createOrder ] = useCreateOrderMutation();
  const [ updateOrder ] = useUpdateOrderMutation();
  const [ getClients ] = useGetClientsMutation();
  const [ getProducts ] = useGetProductsMutation();


  const { user } = useSelector((state: RootState) => state.authModule);
  const { products } = useSelector((state: RootState) => state.productsModule);
  const { clients } = useSelector((state: RootState) => state.clientsModule);
  const paymentMethods = Object.values(PaymentMethod);
  const paymentStatuses = Object.values(PaymentsStatus);
  const orderStatuses = Object.values(OrderStatus);
  const isEdit = !!order;

  const [form, setForm] = useState({
    total: 0,
    status: OrderStatus.Pending,
    productId: "",
    quantity: 1,
    clientId: "",
    paymentStatus: PaymentsStatus.Unpaid,
    paymentMethod: PaymentMethod.CreditCard,
    notes: "",
    businessId: user?.businessId,
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts: any = await getProducts();
        dispatch(setProducts(responseProducts.data.data));

        const responseClients: any = await getClients();
        dispatch(setClients(responseClients.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);



  useEffect(() => {
    if (isEdit && order) {
      setForm({
        total: order.total,
        status: order.status,
        productId: order.productId,
        quantity: order.quantity,
        clientId: order.clientId,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        businessId: user?.businessId,
      });
    } else {
      setForm({
        total: 0,
        status: OrderStatus.Pending,
        productId: "",
        quantity: 1,
        clientId: "",
        paymentStatus: PaymentsStatus.Unpaid,
        paymentMethod: PaymentMethod.CreditCard,
        notes: "",
        businessId: user?.businessId,
      });
    }
  }, [order, isEdit, open]);

  useEffect(() => {
    if (!form.productId) return;

    const product = products?.find((p: TProduct) => p.id === form.productId);
    const price = product?.price || 0;
    const newTotal = (form.quantity || 0) * price;
    const stock = product?.stock || 0;
    const reserved = product?.reserved || 0;

    if((stock + reserved) < form.quantity) {
      toast.error("Not enough stock");
      setForm((prev) => ({ ...prev, quantity: stock }));
    }

    setForm((prev) => {
      if (prev.total === newTotal) return prev;
      return { ...prev, total: newTotal };
    });
  }, [form.productId, form.quantity, products]);

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
    if (name === "clientId") error = isRequired(data.value);
    if (name === "productId") error = isRequired(data.value);
    if (name === "paymentMethod") error = isRequired(data.value);
    if (name === "paymentStatus") error = isRequired(data.value);
    if (name === "status") {
      error = isRequired(data.value);

      const paymentStatus = data.form?.paymentStatus;
      console.log("FORM ", data.form?.paymentStatus);
      console.log("ORDER STATUS ", paymentStatus);
      console.log("PAYMENT STATUS ", data.value);

      if (data.value === "Cancelled" && paymentStatus === "Paid") {
        error = 'Payment status cannot be "Cancelled" when method is "Paid".';
      }
    }
    if (name === "notes") error = minLength(data.value, 3);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = (e: React.FormEvent<HTMLFormElement>): boolean => {
    e.preventDefault();

    const newErrors: Record<string, string | null> = {};

    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, {
        value: form[field as keyof typeof form],
        form,
      });
    });

    setErrors(newErrors);

    return window.utils.validateForm(newErrors);
  }

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateForm(e)) return;

    try {
      if (isEdit) {
        await updateOrder({ id: order!.id, form });
      } else {
        await createOrder(form);
      }


      const response: any = await getOrders().unwrap();
      dispatch(setOrders(response.data));
      toast.success(response.message);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Order</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={create} action="">
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
                <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
              )) }
            </select>
            {errors.clientId && <p className="text-red-500 text-sm mt-2 text-left">{errors.clientId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Product</label>

              <select
                name="productId"
                value={form.productId}
                onChange={(e) => {
                  handleChange(e);
                  validateField("productId", { value: e.target.value });
                  setForm((prev) => ({
                    ...prev,
                    total: (prev.quantity || 1) * (products?.find((product: TProduct) => product.id === e.target.value)?.price || 0),
                  }))
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Product
                </option>

                { products && products
                  .filter((product: TProduct) => product.status === ProductStatus.Active && product.stock > 0)
                  .map((product: TProduct) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))
                }
              </select>
              {errors.productId && <p className="text-red-500 text-sm mt-2 text-left">{errors.productId}</p>}
            </div>

            <div >
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">Quantity</label>

              <div className={`flex items-center rounded-lg border border-slate-300 w-max h-[36px] ${!form.productId ? "pointer-events-none opacity-50" : ""}`}>
                <button
                  type="button"
                  disabled={!form.productId}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, (prev.quantity || 1) - 1),
                    }))
                  }
                  className="px-2 py-1 text-slate-600 hover:text-slate-800 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="text"
                  name="quantity"
                  value={form.quantity || 1}
                  disabled={!form.productId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setForm((prev) => ({ ...prev, quantity: Number(value) || 1 }));
                  }}
                  className="w-10 text-center text-sm focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!form.productId}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: (prev.quantity || 1) + 1,
                    }))
                  }
                  className="px-2 py-1 text-slate-600 hover:text-slate-800"
                >
                  +
                </button>
              </div>
            </div>
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


          {isEdit &&
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Order Status</label>

              <select
                name="status"
                value={form.status}
                onChange={(e) => {
                  handleChange(e);
                  validateField("status", { value: e.target.value, form })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Order Status
                </option>

                {orderStatuses && orderStatuses.map((status: string) => (
                  <option key={status} value={status}>{status}</option>
                )) }
              </select>

              {errors.status && <p className="text-red-500 text-sm text-left">{errors.status}</p>}
            </div>
          }


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

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Total</label>
            <b className="block text-lg font-medium text-slate-700 text-left">$ { form.total }</b>
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

export default CreateOrderDlg;
