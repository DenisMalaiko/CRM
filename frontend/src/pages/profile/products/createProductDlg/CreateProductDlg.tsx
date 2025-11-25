import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store";

import { ProductStatus } from "../../../../enum/ProductStatus";
import {isPositiveNumber, isRequired, minLength} from "../../../../utils/validations";
import { Categories } from "../../../../enum/Categories";
import { toast } from "react-toastify";

import { useUpdateProductMutation } from "../../../../store/products/productsApi";
import { useCreateProductMutation } from "../../../../store/products/productsApi";
import { useGetProductsMutation } from "../../../../store/products/productsApi";

import { setProducts } from "../../../../store/products/productsSlice";
import { useAppDispatch } from "../../../../store/hooks";

function CreateProductDlg({ open, onClose, product }: any) {
  const dispatch = useAppDispatch();

  const [ getProducts ] = useGetProductsMutation();
  const [ createProduct ] = useCreateProductMutation();
  const [ updateProduct ] = useUpdateProductMutation();

  const { user } = useSelector((state: RootState) => state.authModule);
  const statuses = Object.values(ProductStatus);
  const categories = Object.values(Categories);
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: 0,
    stock: 0,
    reserved: 0,
    category: Categories.Device,
    status: ProductStatus.Active,
    businessId: user?.businessId,
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        reserved: product.reserved,
        category: product.category,
        status: product.status,
        businessId: product.businessId,
      });
    } else {
      setForm({
        name: "",
        description: "",
        sku: "",
        price: 0,
        stock: 0,
        reserved: 0,
        category: Categories.Device,
        status: ProductStatus.Active,
        businessId: user?.businessId,
      });
    }
  }, [product, isEdit, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (["price", "stock"].includes(name)) {
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
    if (name === "name") error = minLength(data.value, 3);
    if (name === "description") error = minLength(data.value, 10);
    if (name === "sku") error = minLength(data.value, 6);
    if (name === "category") error = isRequired(data.value);
    if (name === "price") error = isPositiveNumber(data.value);
    if (name === "stock") error = isPositiveNumber(data.value);
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
      form.price = Number(form.price);
      form.stock = Number(form.stock);


      if (isEdit) {
        await updateProduct({ id: product!.id, form })
      } else {
        console.log("CREATE FORM ", form)
        await createProduct(form);
      }

      const response: any = await getProducts();
      dispatch(setProducts(response.data.data));
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
          <h2 className="text-lg font-semibold">Create Product</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>


        <form className="space-y-4" onSubmit={create} action="">
          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Product Name</label>
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
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm">
                  $
                </span>
                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-2 text-left">{errors.price}</p>}
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
              {errors.stock && <p className="text-red-500 text-sm mt-2 text-left">{errors.stock}</p>}
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
