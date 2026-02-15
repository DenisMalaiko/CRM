import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../../store";
import { useAppDispatch } from "../../../../../../../../store/hooks";
import { useGetCompetitorMutation } from "../../../../../../../../store/competitor/competitorApi";
import { setCompetitor } from "../../../../../../../../store/competitor/competitorSlice";

// Components
import CreateCompetitorDlg from "./createCompetitorDlg/CreateCompetitorDlg";

// Utils
import { showError } from "../../../../../../../../utils/showError";

// Models
import { TCompetitor } from "../../../../../../../../models/Competitor";
import { ApiResponse } from "../../../../../../../../models/ApiResponse";

function BaseData() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {id} = useParams<{ id: string }>();

  const [ open, setOpen ] = useState(false);
  const [ selectedCompetitor, setSelectedCompetitor ] = useState<TCompetitor | null>(null);

  const [ getCompetitor ] = useGetCompetitorMutation();
  const { competitor } = useSelector((state: RootState) => state.competitorModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(id) {
          const response: ApiResponse<TCompetitor> = await getCompetitor(id).unwrap();

          if(response && response.data) dispatch(setCompetitor(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!id) return null;

  // Edit Competitor
  const openEditCompetitor = async () => {
    setSelectedCompetitor(competitor);
    setOpen(true);
  }

  return (
    <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
      <div className="w-full flex items-center border-b p-4 justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Competitor</h2>

        <button
          onClick={() => openEditCompetitor()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Edit Competitor
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

      <div className="w-full">
        { competitor ? (
          <div className="w-full space-y-3 text-slate-700 text-sm p-6">
            <div className="w-full flex justify-between border-b pb-2">
              <span className="font-medium">Name</span>
              <span className="text-slate-500">{competitor?.name}</span>
            </div>

            <div className="w-full flex justify-between border-b pb-2">
              <span className="font-medium">Facebook Link</span>
              <a href={competitor?.facebookLink} target="blank" className="text-blue-600 underline cursor-pointer">{competitor.facebookLink}</a>
            </div>

            <div className="w-full flex justify-between border-b pb-2">
              <span className="font-medium">Active</span>
              <span className={`
                  inline-flex items-center rounded-full px-2.5 py-1
                  text-xs font-medium
                  ${competitor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}
                `}>
                   {competitor.isActive ? "Yes" : "No"}
                </span>
            </div>
          </div>
        ) : (
          "None"
        )}
      </div>
    </div>
  )
}

export default BaseData;