import React, { useMemo } from 'react';
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductsMutation
} from "../../../../../../store/products/productsApi";
import { setProducts } from "../../../../../../store/products/productsSlice";

// Utils
import { showError } from "../../../../../../utils/showError";
import { isRequired, minLength, isBoolean } from "../../../../../../utils/validations";
import { isNativeEvent, ChangeArg } from "../../../../../../utils/isNativeEvent";

// Enum
import { ProductType } from "../../../../../../enum/ProductType";
import { PriceSegment } from "../../../../../../enum/PriceSegment";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TProduct } from "../../../../../../models/Product";

function CreateProductDlg({ open, onClose, product }: any) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ createProduct, { isLoading: isLoadingCreating } ] = useCreateProductMutation();
  const [ updateProduct, { isLoading: isLoadingUpdating } ] = useUpdateProductMutation();
  const [ getProducts ] = useGetProductsMutation();

  const types = Object.values(ProductType);
  const priceSegments = Object.values(PriceSegment);

  const isEdit = !!product;

  // Init Form
  const initialForm = useMemo(() => {
    if(isEdit && product) {
      return {
        name: product.name,
        description: product.description,
        type: product.type,
        priceSegment: product.priceSegment,
        isActive: product.isActive,
        businessId: businessId ?? "",
      }
    }

    return {
      name: "",
      description: "",
      type: ProductType.Product,
      priceSegment: PriceSegment.Middle,
      isActive: true,
      businessId: businessId ?? "",
    }
  }, [isEdit, product, businessId]);

  // Form Hook
  const { form, handleChange, resetForm } = useForm(initialForm);

  // Validation Hook
  const { errors, validateField, validateAll } = useValidation({
    name: (value) => minLength(value, 3),
    description: (value) => minLength(value, 10),
    type: (value) => isRequired(value),
    priceSegment: (value) => isRequired(value),
    isActive: (value) => isBoolean(value),
    businessId: (value) => isRequired(value),
  });

  if (!open) return null;
  if (!businessId) return null;

  // Create Product
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      if (isEdit) {
        const response = await updateProduct({ id: product!.id, form }).unwrap();
        if(response && response?.data) toast.success(response.message);
      } else {
        const response = await createProduct(form).unwrap();
        if(response && response?.data) toast.success(response.message);
      }

      const response: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
      if(response && response?.data) {
        dispatch(setProducts(response.data));
        resetForm();
        onClose();
      }
    } catch (error) {
      showError(error);
    }
  }

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange(arg);
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{ isEdit ? "Edit" : "Create" } Product</h2>
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
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              autoComplete="off"
            />
            {errors.name && <p className="text-red-500 text-sm mt-2 text-left">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 text-left">Product Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
              autoComplete="off"
              rows={6}
            />
            {errors.description && <p className="text-red-500 text-sm text-left">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 text-left">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
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
                onChange={onChange}
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
              onChange={onChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />

            <span className="block text-sm font-medium text-slate-700 text-left">Active Product</span>
          </label>



          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingCreating || isLoadingUpdating}
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
              disabled={isLoadingCreating || isLoadingUpdating}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingCreating || isLoadingUpdating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Saving...
                </>
                ) : ("Save")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProductDlg;
