import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Hooks
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipboard";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  useGetAudiencesMutation,
  useDeleteAudienceMutation
} from "../../../../../store/audience/audienceApi";
import { setAudiences } from "../../../../../store/audience/audienceSlice";

// Components
import CreateAudienceDlg from "./createAudienceDlg/CreateAudienceDlg";
import TextDlg from "../../../../../components/textDlg/TextDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TAudience } from "../../../../../models/Audience";
import { Copy, Eye } from "lucide-react";

function Audiences() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getAudiences ] = useGetAudiencesMutation();
  const [ deleteAudience ] = useDeleteAudienceMutation();

  const [ open, setOpen ] = useState(false);
  const [ selectedAudience, setSelectedAudience ] = useState<TAudience | null>(null);
  const { audiences } = useSelector((state: RootState) => state.audienceModule);

  const [ openTextDlg, setOpenTextDlg ] = useState<any>(null);
  const [ selectedText, setSelectedText ] = useState<any>(null);

  const header = [
    { name: "Name", key: "name" },
    { name: "Age Range", key: "ageRange" },
    { name: "Gender", key: "gender" },
    { name: "Geo", key: "geo" },
    { name: "Interests", key: "interests"},
    { name: "Pains", key: "pains"},
    { name: "Desires", key: "desires"},
    { name: "Income Level", key: "incomeLevel"},
    { name: "Actions", key: "actions"}
  ];

  const { copy, copied } = useCopyToClipboard();

  // Get Data
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
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  // Delete Audience
  const openConfirmDlg = async (e: any, item: TAudience) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Audience",
      message: "Are you sure you want to delete this profile?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseDelete = await deleteAudience(item.id).unwrap();
          if(responseDelete && responseDelete?.data) {
            toast.success(responseDelete.message);
          }

          const response: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
          if(response && response?.data) {
            dispatch(setAudiences(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Edit Audience
  const openEditProfile = async (item: TAudience) => {
    setSelectedAudience(item);
    setOpen(true)
  }

  // Open Text
  const openText = (text: string) => {
    setSelectedText(text);
    setOpenTextDlg(true);
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
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
                      <td className="px-4 py-3 font-medium text-slate-900 text-left">

                        { item?.interests && item?.interests.length && item?.interests[0].length > 0 ? (
                          <>
                            <p className="line-clamp-2">
                              {item.interests.map((interest: string, i: number) => (
                                <div className="mb-2" key={i}>{interest};</div>
                              ))}
                            </p>

                            <div className="flex items-center gap-2 text-slate-500 mt-3">
                              <Eye
                                size={20}
                                onClick={() => openText(item.interests)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                              <Copy
                                size={18}
                                onClick={() => copy(item.interests)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                            </div>
                          </>
                        ) : "None"}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                        { item?.pains && item?.pains.length && item?.pains[0].length > 0 ? (
                          <>
                            <p className="line-clamp-2">
                              {item.pains.map((pain: string, i: number) => (
                                <div className="mb-2" key={i}>{pain};</div>
                              ))}
                            </p>

                            <div className="flex items-center gap-2 text-slate-500 mt-3">
                              <Eye
                                size={20}
                                onClick={() => openText(item.pains)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                              <Copy
                                size={18}
                                onClick={() => copy(item.pains)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                            </div>
                          </>
                        ) : "None"}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900 text-left">
                        { item?.desires && item?.desires.length && item?.desires[0].length > 0 ? (
                          <>
                            <p className="line-clamp-2">
                              {item.desires.map((desire: string, i: number) => (
                                <div className="mb-2" key={i}>{desire};</div>
                              ))}
                            </p>

                            <div className="flex items-center gap-2 text-slate-500 mt-3">
                              <Eye
                                size={20}
                                onClick={() => openText(item.desires)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                              <Copy
                                size={18}
                                onClick={() => copy(item.desires)}
                                className="cursor-pointer text-blue-600 hover:text-blue-700"
                              />
                            </div>
                          </>
                        ) : "None"}
                      </td>
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

      <TextDlg
        open={openTextDlg}
        onClose={() => {
          setOpenTextDlg(false);
        }}
        text={selectedText}
      />

    </div>
  )
}

export default Audiences;