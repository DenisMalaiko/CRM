import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { AppDispatch, RootState } from "../../../store";
import { getBusiness, getUsersByBusinessId } from "../../../store/business/businessThunks";
import { trimID } from "../../../utils/trimID";
import { TUser } from "../../../models/User";

function Business() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const { business, usersByBusinessId } = useSelector((state: RootState) => state.businessModule);
  const header = [
    { name: "ID", key: "id" },
    { name: "Name", key: "name" },
    { name: "Email", key: "email" },
  ]

  useEffect(() => {
    if(id) {
      dispatch(getBusiness(id))
      dispatch(getUsersByBusinessId(id))
    }
  }, [dispatch]);

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-4">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <div className="flex w-full gap-4 mb-4">
        <div className="w-1/2 rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4">
            <h2 className="text-lg text-left font-semibold text-slate-800">Business Details</h2>
          </div>

          <div className="space-y-3 text-slate-700 text-sm p-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">ID</span>
              <span className="text-slate-500">{trimID(business?.id)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Name</span>
              <span className="text-slate-500">{business?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Industry</span>
              <span className="text-slate-500">{business?.industry}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Tier</span>
              <span className="text-slate-500">{business?.tier}</span>
            </div>
          </div>
        </div>

        <div className="w-1/2 rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4 mb-5">
            <h2 className="text-lg text-left font-semibold text-slate-800">Users</h2>
          </div>

          <div className="px-6 pb-6">
            <table className="min-w-full divide-y divide-slate-200 rounded-2xl shadow border overflow-hidden">
              <thead className="bg-slate-50">
              <tr>
                {header.map((item) => (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
                ))}
              </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
              {usersByBusinessId && usersByBusinessId.map((item: TUser) => (
                <tr key={item.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{trimID(item.id)}</td>
                  <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-600 text-left">{item.email}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-4">
        <div className="w-1/2 rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4 mb-5">
            <h2 className="text-lg text-left font-semibold text-slate-800">Products</h2>
          </div>
        </div>

        <div className="w-1/2 rounded-2xl bg-white shadow border border-slate-200 ">
          <div className="border-b p-4 mb-5">
            <h2 className="text-lg text-left font-semibold text-slate-800">Clients</h2>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Business;