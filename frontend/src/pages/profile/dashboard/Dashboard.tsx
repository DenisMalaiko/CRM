export default function Dashboard() {
  return ("Dashboard")
};

/*
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getOrders } from "../../../store/orders/ordersThunks";
import { getClients } from "../../../store/clients/clientsThunks";
import { getProducts } from "../../../store/products/productsThunks";

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.productsModule);
  const { clients } = useSelector((state: RootState) => state.clientsModule);
  const { orders } = useSelector((state: RootState) => state.ordersModule);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getClients())
    dispatch(getOrders())
  }, [dispatch]);

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
      </section>

      {/!* Example grid cards *!/}
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

export default Dashboard;*/
