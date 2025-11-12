import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../store/hooks";

import { useGetProductsMutation } from "../../../store/products/productsApi";
import { useGetClientsMutation } from "../../../store/clients/clientsApi";
import { useGetOrdersMutation } from "../../../store/orders/ordersApi";

import { setProducts } from "../../../store/products/productsSlice";
import { setClients } from "../../../store/clients/clientsSlice";
import { setOrders } from "../../../store/orders/ordersSlice";

function Dashboard() {
  const dispatch = useAppDispatch();

  const [ getProducts ] = useGetProductsMutation();
  const [ getClients ] = useGetClientsMutation();
  const [ getOrders ] = useGetOrdersMutation();

  const { products } = useSelector((state: RootState) => state.productsModule);
  const { clients } = useSelector((state: RootState) => state.clientsModule);
  const { orders } = useSelector((state: RootState) => state.ordersModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts: any = await getProducts();
        const responseClients: any = await getClients();
        const responseOrders: any = await getOrders();

        dispatch(setProducts(responseProducts.data.data));
        dispatch(setClients(responseClients.data.data));
        dispatch(setOrders(responseOrders.data.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Products</h2>
          <p className="text-2xl font-semibold mt-2">{ products?.length ?? 0 }</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Clients</h2>
          <p className="text-2xl font-semibold mt-2">{ clients?.length ?? 0 }</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Orders</h2>
          <p className="text-2xl font-semibold mt-2">{ orders?.length ?? 0 }</p>
        </div>
      </div>
    </section>
  )
}

export default Dashboard;
