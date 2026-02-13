import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetProductsMutation } from "../../../../../store/products/productsApi";
import { useDeleteProductMutation } from "../../../../../store/products/productsApi";
import { setProducts } from "../../../../../store/products/productsSlice";

// Components
import CreateProductDlg from "./createProductDlg/CreateProductDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";
import { getStatusClass } from "../../../../../utils/getStatusClass";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TProduct} from "../../../../../models/Product";

function Products() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getProducts ] = useGetProductsMutation();
  const [ deleteProduct ] = useDeleteProductMutation();

  const [ open, setOpen ] = useState(false);
  const [ selectedProduct, setSelectedProduct ] = useState<TProduct | null>(null);
  const { products } = useSelector((state: RootState) => state.productsModule)

  const header = [
    { name: "Image", key: "image" },
    { name: "Name", key: "name" },
    { name: "Type", key: "type" },
    { name: "Segment", key: "priceSegment" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ]

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setProducts(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  // Delete Product
  const openConfirmDlg = async (e: any, item: TProduct) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteProduct(item.id).unwrap();
          if(responseDelete && responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
          if(response && response?.data) {
            dispatch(setProducts(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Edit Products
  const openEditProduct = async (item: TProduct) => {
    setSelectedProduct(item);
    setOpen(true)
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Products</h2>

            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Add Product
            </button>

            <CreateProductDlg
              open={open}
              onClose={() => {
                setOpen(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
            />
          </div>
        </section>

        <div className="w-full mx-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {header.map((item, index) => (
                    <th
                      key={item.key}
                      className={`
                        px-4 py-3 text-xs font-semibold uppercase tracking-wide
                        ${item.key === "actions" ? "text-right" : "text-left"}
                        text-slate-600
                      `}
                    >{ item.name }</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={header.length}
                      className="py-6 text-center text-slate-400"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  products && products.map((item: TProduct) => (
                    <tr key={item.id} className="bg-white hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.type}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${getStatusClass(item.priceSegment)}
                      `}>
                         {item.priceSegment}
                      </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-1
                        text-xs font-medium
                        ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                      `}>
                         {item.isActive ? "Yes" : "No"}
                      </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEditProduct(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                            ✎
                          </button>
                          <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Products;
