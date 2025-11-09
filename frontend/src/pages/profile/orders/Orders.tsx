import React, { useState, useEffect } from "react";
import { TOrder } from "../../../models/Order";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getOrders, deleteOrder } from "../../../store/orders/ordersThunks";
import { toast } from "react-toastify";
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import { trimID } from "../../../utils/trimID";
import { toDate } from "../../../utils/toDate";
import { getStatusClass } from "../../../utils/getStatusClass";
import CreateOrderDlg from "./createOrderDlg/CreateOrderDlg";

function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const { orders } = useSelector((state: RootState) => state.ordersModule);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const header = [
    { name: "ID", key: "id" },
    { name: "Client Name", key: "client" },
    { name: "Product ID", key: "productIds" },
    { name: "Quantity", key: "quantity" },
    { name: "Total", key: "total" },
    { name: "Status", key: "status" },
    { name: "Payment Status", key: "paymentStatus" },
    { name: "Created At", key: "createdAt" },
    { name: "Updated At", key: "updatedAt" },
    { name: "Fulfilled At", key: "fulfilledAt" },
    { name: "Actions", key: "actions" }
  ]

  const openConfirmDlg = async (e: any, item: TOrder) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Order",
      message: "Are you sure you want to delete this order?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const response = await dispatch(
            deleteOrder(item?.id)
          ).unwrap();

          await dispatch(getOrders());

          toast.success(response.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }

  const openEditOrder = async (item: TOrder) => {
    setSelectedOrder(item);
    setOpen(true)
  }

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Orders</h1>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Order
          </button>

          <CreateOrderDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
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
              {orders && orders.map((item: TOrder) => (
                <tr key={item.id} className="hover:bg-slate-50 bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.id)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item?.client?.firstName} {item?.client?.lastName}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item?.product?.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.quantity}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">$ {item.total}</td>
                  <td className="px-4 py-3 text-left">
                    <span className={`inline-flex items-start px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-left">
                    <span className={`inline-flex items-start px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(item.paymentStatus)}`}>{item.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item.updatedAt)}</td>
                  <td className="px-4 py-3 text-slate-600 text-left">{toDate(item.fulfilledAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEditOrder(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
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

export default Orders;