import React, { useState } from "react";
import CreateProductDlg from "./createProductDlg/CreateProductDlg";
import { Product } from "../../../models/Product";

function Products() {
  const [open, setOpen] = useState(false);

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

  const products: Product[] = []

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

          <CreateProductDlg open={open} onClose={() => setOpen(false)}/>
        </div>
      </section>

      {/* Example grid cards */}
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
            <tr className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="h-10 w-10 bg-slate-200 rounded-lg" />
              </td>
              <td className="px-4 py-3 font-medium text-slate-900 text-left">Product Name</td>
              <td className="px-4 py-3 text-slate-600 text-left">SKU123</td>
              <td className="px-4 py-3 font-medium text-left">$19.99</td>
              <td className="px-4 py-3 text-left">42</td>
              <td className="px-4 py-3 text-slate-600 text-left">Category</td>
              <td className="px-4 py-3 text-slate-600 text-left">2025-10-03</td>
              <td className="px-4 py-3 text-left">
                <span className="inline-flex items-start px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">Active</span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                    ✎
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50">
                    🗑
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Products;