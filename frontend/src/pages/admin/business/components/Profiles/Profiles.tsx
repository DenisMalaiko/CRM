import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import CreateProfileDlg from "./createProfileDlg/CreateProfileDlg";
import { useAppDispatch } from "../../../../../store/hooks";
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TBusinessProfile } from "../../../../../models/BusinessProfile";
import { showError } from "../../../../../utils/showError";

import { useGetProfilesMutation } from "../../../../../store/profile/profileApi";
import { useDeleteProfileMutation } from "../../../../../store/profile/profileApi";
import { setProfiles } from "../../../../../store/profile/profileSlice";

import {confirm} from "../../../../../components/confirmDlg/ConfirmDlg";
import {toast} from "react-toastify";

function Profiles() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getProfiles ] = useGetProfilesMutation();
  const [ deleteProfile ] = useDeleteProfileMutation();

  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const { profiles } = useSelector((state: any) => state.profileModule)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setProfiles(response.data))
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  const header = [
    { name: "Name", key: "name" },
    { name: "Profile Focus", key: "profileFocus" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ]

  const openConfirmDlg = async (e: any, item: TBusinessProfile) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Profile",
      message: "Are you sure you want to delete this profile?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          await deleteProfile(item.id);
          const response: ApiResponse<TBusinessProfile[]> = await getProfiles(businessId).unwrap();

          if(response && response?.data) {
            dispatch(setProfiles(response.data));
            toast.success(response.message);
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  const openEditProfile = async (item: TBusinessProfile) => {
    setSelectedProfile(item);
    setOpen(true)
  }

  return (
    <section>
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Profiles</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Profile
          </button>

          <CreateProfileDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedProfile(null);
            }}
            profile={selectedProfile}
          ></CreateProfileDlg>
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
              {profiles && profiles.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.profileFocus}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-1
                      text-xs font-medium
                      ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                    `}>
                      {item.isActive ? "Yes" : "No"}
                    </span>
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default Profiles;