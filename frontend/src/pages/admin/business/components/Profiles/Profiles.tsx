import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import CreateProfileDlg from "./createProfileDlg/CreateProfileDlg";
import { useAppDispatch } from "../../../../../store/hooks";
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TBusinessProfile } from "../../../../../models/BusinessProfile";

import { useGetProfilesMutation } from "../../../../../store/profile/profileApi";
import { setProfiles } from "../../../../../store/profile/profileSlice";

function Profiles() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getProfiles ] = useGetProfilesMutation();

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
    { name: "Positioning", key: "positioning" },
    { name: "Tone Of Voice", key: "toneOfVoice" },
    { name: "Brand Rules", key: "brandRules" },
    { name: "Goals", key: "Goals" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ]

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
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.positioning}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.toneOfVoice}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.brandRules}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.goals.join(", ")}</td>
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
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg border  text-slate-600 hover:bg-slate-50">
                        ✎
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg border text-rose-600 hover:bg-rose-50">
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