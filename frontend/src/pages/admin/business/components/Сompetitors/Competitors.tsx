import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  useGetCompetitorsMutation,
  useDeleteCompetitorMutation
} from "../../../../../store/competitor/competitorApi";
import { setCompetitors } from "../../../../../store/competitor/competitorSlice";

// Components
import CreateCompetitorDlg from "./:id/components/base/createCompetitorDlg/CreateCompetitorDlg";
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";
import { TCompetitor } from "../../../../../models/Competitor";

function Competitors() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getCompetitors ] = useGetCompetitorsMutation();
  const [ deleteCompetitor ] = useDeleteCompetitorMutation();

  const { competitors } = useSelector((state: RootState) => state.competitorModule);
  const [ open, setOpen ] = useState(false);
  const [ selectedCompetitor, setSelectedCompetitor ] = useState<TCompetitor | null>(null);
  const header = [
    { name: "Name", key: "name" },
    { name: "Facebook", key: "facebookLink" },
    { name: "Active", key: "isActive" },
    { name: "Actions", key: "actions"}
  ];

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if(businessId) {
          const response: ApiResponse<TCompetitor[]> = await getCompetitors(businessId).unwrap();

          if(response && response.data) {
            dispatch(setCompetitors(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;

  // Delete Prompt
  const openConfirmDlg = async (e: any, item: any) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete Competitor",
      message: "Are you sure you want to delete this competitor?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          const responseDeleted = await deleteCompetitor(item.id).unwrap();
          if(responseDeleted && responseDeleted.message) toast.success(responseDeleted.message);


          const response: ApiResponse<TCompetitor[]> = await getCompetitors(businessId).unwrap();
          if(response && response.data) {
            dispatch(setCompetitors(response.data));
          }
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }

  // Edit Competitor
  const openEditCompetitor = async (item: TCompetitor | null) => {
    setSelectedCompetitor(item);
    setOpen(true);
  }

  // Open Competitor
  const openCompetitor = (id?: string) => {
    navigate(`${id}`);
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Competitors</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Competitors
          </button>

          <CreateCompetitorDlg
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedCompetitor(null);
            }}
            competitor={selectedCompetitor}
          ></CreateCompetitorDlg>
        </div>

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
                { competitors && competitors?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={header.length}
                      className="py-6 text-center text-slate-400"
                    >
                      No data
                    </td>
                  </tr>
                  ) : (
                    competitors && competitors?.map((item: TCompetitor) => {
                      return (
                        <tr key={item.id} onClick={() => openCompetitor(item?.id)} className="bg-white hover:bg-slate-50 cursor-pointer">
                          <td className="px-4 py-3 font-medium text-slate-900 text-left">{item.name}</td>
                          <td className="px-4 py-3 font-medium text-blue-600 underline text-left">
                            <a href={item.facebookLink} target="blank">
                              {item.facebookLink}
                            </a>
                          </td>
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
                              <button onClick={(e) => {
                                e.stopPropagation()
                                openEditCompetitor(item)
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
                      )
                    })
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Competitors;