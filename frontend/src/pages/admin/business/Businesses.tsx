import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../store/hooks";
import { showError } from "../../../utils/showError";

import { TBusiness } from "../../../models/Business";
import { confirm } from "../../../components/confirmDlg/ConfirmDlg";
import { toast } from "react-toastify";
import CreateBusinessDlg from "./createBusinessDlg/CreateBusinessDlg";

import { useGetBusinessesMutation } from "../../../store/businesses/businessesApi";
import { useDeleteBusinessMutation } from "../../../store/businesses/businessesApi";
import { setBusinesses } from "../../../store/businesses/businessesSlice";
import { ApiResponse } from "../../../models/ApiResponse";
import { getStatusClass } from "../../../utils/getStatusClass";

function Businesses() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [ getBusinesses ] = useGetBusinessesMutation();
  const [ deleteBusiness ] = useDeleteBusinessMutation();

  const [ open, setOpen ] = useState(false);
  const [ selectedBusiness, setSelectedBusiness ] = useState<TBusiness | null>(null);
  const { businesses } = useSelector((state: RootState) => state.businessModule)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getBusinesses().unwrap();
        if(response && response.data) dispatch(setBusinesses(response.data));
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const header = [
    { name: "Name", key: "name" },
    { name: "Website", key: "website" },
    { name: "Industry", key: "industry" },
    { name: "Status", key: "status" },
    { name: "Actions", key: "actions" }
  ];

  const openConfirmDlg = async (e: any, item: TBusiness) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Business",
      message: "Are you sure you want to delete this business?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseBusiness = await deleteBusiness(item.id).unwrap();
          if(responseBusiness && responseBusiness.data) toast.success(responseBusiness.message);

          const response: ApiResponse<TBusiness[]> = await getBusinesses().unwrap();
          if(response && response.data) dispatch(setBusinesses(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }
  }

  const openEditBusiness = async (item: TBusiness) => {
    setSelectedBusiness(item);
    setOpen(true)
  }

  const openBusiness = (id?: string) => {
    navigate(`${id}/baseData`);
  }

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Businesses</h1>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Business
          </button>

          <CreateBusinessDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedBusiness(null);
            }}
            business={selectedBusiness}
          ></CreateBusinessDlg>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {header.map((item) => (
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
              {businesses && businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    className="py-6 text-center text-slate-400"
                  >
                    No data
                  </td>
                </tr>
                ) : (
                  businesses && businesses.map((item: TBusiness) => (
                    <tr key={item.id} onClick={() => openBusiness(item?.id)} className="bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.website}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.industry}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-1
                      text-xs font-medium
                      ${getStatusClass(item.status)}
                    `}>
                       {item.status}
                    </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditBusiness(item)
                            }} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                            ✎
                          </button>
                          <button onClick={(e) => {
                            e.stopPropagation()
                            openConfirmDlg(e, item)
                          }} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Businesses;
