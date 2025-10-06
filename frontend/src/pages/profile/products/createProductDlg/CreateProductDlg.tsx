import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from "../../../../store";
import { createProducts, getProducts } from "../../../../store/products/productsThunks";

import { ProductStatus } from "../../../../enum/ProductStatus";
import { isRequired, minLength} from "../../../../utils/validations";
import { Categories } from "../../../../enum/Categories";
import { toast } from "react-toastify";

function CreateProductDlg({ open, onClose }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const statuses = Object.values(ProductStatus);
  const categories = Object.values(Categories);

  const [form, setForm] = useState({
    name: "Product Name",
    description: "Product Description",
    sku: "123456",
    price: 10,
    stock: 10,
    category: Categories.Transport,
    status: ProductStatus.Active,
  });
  const [errors, setErrors]: any = useState({});

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

  const createProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      form.price = Number(form.price);
      form.stock = Number(form.stock);

      const response = await dispatch(
        createProducts(form)
      ).unwrap();

      await dispatch(getProducts());

      console.log("RESPONSE ", response)
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
          <h2 className="text-lg font-semibold">Create Product</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={createProduct} action="">
          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Product Name {form.name}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => {
                handleChange(e);
                validateField("name", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Product Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => {
                handleChange(e);
                validateField("description", { value: e.target.value })
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm text-left">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">SKU</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={(e) => {
                  handleChange(e);
                  validateField("sku", { value: e.target.value })
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="SKU123"
              />
              {errors.sku && <p className="text-red-500 text-sm mt-2 text-left">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Price</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="$0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Stock</label>
              <input
                type="text"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                { categories.map((status: string) => (
                  <option key={status} value={status}>{status}</option>
                )) }
              </select>
            </div>
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

export default CreateProductDlg;