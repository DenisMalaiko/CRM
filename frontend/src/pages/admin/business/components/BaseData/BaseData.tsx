import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useGetBusinessMutation } from "../../../../../store/businesses/businessesApi";
import { setBusiness } from "../../../../../store/businesses/businessesSlice";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TBusiness } from "../../../../../models/Business";

// Components
import CreateBusinessDlg from "../../createBusinessDlg/CreateBusinessDlg";

// Utils
import { trimID } from "../../../../../utils/trimID";
import { showError } from "../../../../../utils/showError";
import { getStatusClass } from "../../../../../utils/getStatusClass";

function BaseData() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ getBusiness ] = useGetBusinessMutation();
  const [open, setOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<TBusiness | null>(null);
  const { business } = useSelector((state: RootState) => state.businessModule)

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TBusiness> = await getBusiness(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setBusiness(response.data));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  // Open Edit Business Dialog
  const openEditBusiness = async (item: TBusiness) => {
    setSelectedBusiness(item);
    setOpen(true)
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Business Details</h2>

          <button
            onClick={() => openEditBusiness(business as TBusiness)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Edit Business
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

        {business &&
          <div className="space-y-3 text-slate-700 text-sm p-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">ID </span>
              <span className="text-slate-500">{trimID(business?.id)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Agency ID</span>
              <span className="text-slate-500">{trimID(business?.agencyId)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Name</span>
              <span className="text-slate-500">{business?.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Website</span>
              <span className="text-slate-500">{business?.website}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Industry</span>
              <span className="text-slate-500">{business?.industry}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Status</span>
              <span className={`
                inline-flex items-center rounded-full px-2.5 py-1
                text-xs font-medium
                ${getStatusClass(business.status)}
              `}>
                 {business?.status}
              </span>
            </div>
          </div>
        }

      </section>
    </div>
  )
}

export default BaseData;