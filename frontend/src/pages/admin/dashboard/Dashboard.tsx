import React, { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {showError} from "../../../utils/showError";


function Dashboard() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("GET USER DATA")
      } catch (error) {
        console.error("Error fetching data:", error);
        showError(error);
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
          <h2 className="text-lg font-bold">TikTok Ads</h2>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Meta Ads</h2>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Google Ads</h2>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>
      </div>
    </section>
  )
}

export default Dashboard;
