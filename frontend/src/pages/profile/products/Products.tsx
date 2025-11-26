import React, { useState, useEffect } from "react";
import { TProduct } from "../../../models/Product";
import { useSelector } from "react-redux";
import { RootState } from '../../../store';
import { useAppDispatch } from "../../../store/hooks";

import { toast } from "react-toastify";
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import { getStatusClass } from "../../../utils/getStatusClass";
import { toDate } from "../../../utils/toDate";
import CreateProductDlg from "./createProductDlg/CreateProductDlg";

import { useGetProductsMutation } from "../../../store/products/productsApi";
import { useDeleteProductMutation } from "../../../store/products/productsApi";
import { setProducts } from "../../../store/products/productsSlice";

function Products() {
  const dispatch = useAppDispatch();

  const [ getProducts ] = useGetProductsMutation();
  const [ deleteProduct ] = useDeleteProductMutation();

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null);
  const { products } = useSelector((state: RootState) => state.productsModule)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getProducts();
        console.log("RESPONSE: ", response.data.data)
        dispatch(setProducts(response.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);

  const header = [
    { name: "Image", key: "image" },
    { name: "Name", key: "name" },
    { name: "SKU", key: "sku" },
    { name: "Price", key: "price" },
    { name: "Stock", key: "stock" },
    { name: "Reserved", key: "reserved" },
    { name: "Category", key: "category" },
    { name: "Created At", key: "createdAt" },
    { name: "Updated At", key: "updatedAt" },
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
          await deleteProduct(item.id);
          const response: any = await getProducts().unwrap();
          dispatch(setProducts(response.data));
          toast.success(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }

  const openEditProduct = async (item: TProduct) => {
    setSelectedProduct(item);
    setOpen(true)
  }

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Products</h1>

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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600c" key={item.key}>{ item.name }</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products && products.map((item: TProduct) => (
                <tr key={item.id} className="hover:bg-slate-50 bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{item.sku}</td>
                  <td className="px-4 py-3 font-medium text-left">$ {item.price}</td>
                  <td className="px-4 py-3 text-left">{item.stock}</td>
                  <td className="px-4 py-3 text-left">{item.reserved ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{item.category}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item?.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item?.updatedAt)}</td>
                  <td className="px-4 py-3 text-left">
                    <span className={`inline-flex items-start px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(item.status)}`}>{item.status}</span>
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
