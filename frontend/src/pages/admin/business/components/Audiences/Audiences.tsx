import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import CreateAudienceDlg from "./createAudienceDlg/CreateAudienceDlg";
import { useAppDispatch } from "../../../../../store/hooks";
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TAudience } from "../../../../../models/Audience";
import { showError } from "../../../../../utils/showError";

import {
  useGetAudiencesMutation,
  useDeleteAudienceMutation
} from "../../../../../store/audience/audienceApi";
import { setAudiences } from "../../../../../store/audience/audienceSlice";

import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";
import { toast } from "react-toastify";

function Audiences() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getAudiences ] = useGetAudiencesMutation();
  const [ deleteAudience ] = useDeleteAudienceMutation();

  const [open, setOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<any | null>(null);
  const { audiences } = useSelector((state: any) => state.audienceModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setAudiences(response.data))
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  const header = [
    { name: "Name", key: "name" },
    { name: "Age Range", key: "ageRange" },
    { name: "Gender", key: "gender" },
    { name: "Geo", key: "geo" },
    { name: "Pains", key: "pains"},
    { name: "Desires", key: "desires"},
    { name: "Income Level", key: "incomeLevel"},
    { name: "Actions", key: "actions"}
  ]

  const openConfirmDlg = async (e: any, item: TAudience) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Audience",
      message: "Are you sure you want to delete this profile?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteAudience(item.id);
          const response: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setAudiences(response.data));
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  const openEditProfile = async (item: TAudience) => {
    setSelectedAudience(item);
    setOpen(true)
  }

  return (
    <section>
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Audiences</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Audience
          </button>

          <CreateAudienceDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedAudience(null);
            }}
            audience={selectedAudience}
          ></CreateAudienceDlg>
        </div>
      </section>


      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {header.map((item, index) => (
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
              {audiences?.length === 0 ? (
                <tr>
                  <td
                    colSpan={header.length}
                    className="py-6 text-center text-slate-400"
                  >
                    No data
                  </td>
                </tr>
              ) : (
                audiences && audiences.map((item: any) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.ageRange}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.gender}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.geo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.pains.join(", ")}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.desires.join(", ")}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.incomeLevel}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEditProfile(item)} className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                          ✎
                        </button>
                        <button onClick={(e) => openConfirmDlg(e, item)} className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Audiences;