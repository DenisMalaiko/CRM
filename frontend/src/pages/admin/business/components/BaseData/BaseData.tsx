import React, {useEffect, useState} from 'react';
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { setBusiness } from "../../../../../store/businesses/businessesSlice";

import { useGetBusinessMutation } from "../../../../../store/businesses/businessesApi";
import { TBusiness } from "../../../../../models/Business";
import { trimID } from "../../../../../utils/trimID";

import CreateBusinessDlg from "../../createBusinessDlg/CreateBusinessDlg";
import {ApiResponse} from "../../../../../models/ApiResponse";
import {getStatusClass} from "../../../../../utils/getStatusClass";

function BaseData() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ getBusiness ] = useGetBusinessMutation();

  const [open, setOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<TBusiness | null>(null);

  const { business } = useSelector((state: RootState) => state.businessModule)

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
      }
    }

    fetchData();
  }, [dispatch]);

  const openEditBusiness = async (item: TBusiness) => {
    setSelectedBusiness(item);
    setOpen(true)
  }

  return (
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
  )
}

export default BaseData;