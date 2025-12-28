import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { ProductType } from "../../../../../../enum/ProductType";
import { PriceSegment } from "../../../../../../enum/PriceSegment";
import { isRequired, minLength} from "../../../../../../utils/validations";
import { showError } from "../../../../../../utils/showError";

import { useUpdateProductMutation } from "../../../../../../store/products/productsApi";
import { useCreateProductMutation } from "../../../../../../store/products/productsApi";
import { useGetProductsMutation } from "../../../../../../store/products/productsApi";

import { setProducts } from "../../../../../../store/products/productsSlice";
import { useAppDispatch } from "../../../../../../store/hooks";
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TProduct } from "../../../../../../models/Product";

function CreateProductDlg({ open, onClose, product }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getProducts ] = useGetProductsMutation();
  const [ createProduct, { isLoading, isSuccess } ] = useCreateProductMutation();
  const [ updateProduct ] = useUpdateProductMutation();

  const types = Object.values(ProductType);
  const priceSegments = Object.values(PriceSegment);

  const isEdit = !!product;

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: ProductType.Product,
    priceSegment: PriceSegment.Middle,
    isActive: true,
    businessId: businessId ?? "",
  });
  const [errors, setErrors]: any = useState({});

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name,
        description: product.description,
        type: product.type,
        priceSegment: product.priceSegment,
        isActive: product.isActive,
        businessId: businessId ?? "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        type: ProductType.Product,
        priceSegment: PriceSegment.Middle,
        isActive: true,
        businessId: businessId ?? "",
      });
    }
  }, [product, isEdit, open]);

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
    if (name === "description") error = minLength(data.value, 10);
    if (name === "type") error = isRequired(data.value);
    if (name === "priceSegment") error = isRequired(data.value);
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
        await updateProduct({ id: product!.id, form })
      } else {
        await createProduct(form);
      }

      const response: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

      if(response && response?.data) {
        dispatch(setProducts(response.data));
        toast.success(response.message);
        onClose();
      }
    } catch (error) {
      showError(error);
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
                validateField("name", {value: e.target.value})
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
                validateField("description", {value: e.target.value})
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm text-left">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {types.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Price Segment</label>
              <select
                name="priceSegment"
                value={form.priceSegment}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {priceSegments.map((segment: string) => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
            </div>
          </div>


          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Product</span>
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
              disabled={isLoading}
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
              disabled={isLoading}
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
