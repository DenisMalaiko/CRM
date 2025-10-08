import React, { useState, useEffect } from "react";
import CreateProductDlg from "./createProductDlg/CreateProductDlg";
import { TProduct } from "../../../models/Product";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../../store';
import { getProducts, deleteProduct } from "../../../store/products/productsThunks";
import { toast } from "react-toastify";
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import { ProductStatus } from "../../../enum/ProductStatus";

function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null);
  const { products } = useSelector((state: RootState) => state.productsModule)

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const header = [
    { name: "Image", key: "image" },
    { name: "Name", key: "name" },
    { name: "SKU", key: "sku" },
    { name: "Price", key: "price" },
    { name: "Stock", key: "stock" },
    { name: "Category", key: "category" },
    { name: "Updated", key: "updated" },
    { name: "Status", key: "status" },
    { name: "Actions", key: "actions"}
  ]

  const openConfirmDlg = async (e: any, item: TProduct) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const response = await dispatch(
            deleteProduct(item?.id)
          ).unwrap();

          await dispatch(getProducts());

          toast.success(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }

  const openEditProduct = async (item: TProduct) => {
    console.log("PRODUCT: ", item);
    setSelectedProduct(item);
    setOpen(true)
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case ProductStatus.Active:
        return "bg-emerald-50 text-emerald-700";
      case ProductStatus.Draft:
        return "bg-amber-50 text-amber-700";
      case ProductStatus.Archived:
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-end px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            + Add New
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
              {header.map((item) => (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
              ))}
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products && products.map((item: TProduct) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{item.sku}</td>
                  <td className="px-4 py-3 font-medium text-left">{item.price}</td>
                  <td className="px-4 py-3 text-left">{item.stock}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{item.category}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">2025-10-03</td>
                  <td className="px-4 py-3 text-left">
                    <span className={`inline-flex items-start px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(item.status)}`}>{item.status}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Products;