import React, {useEffect, useState} from "react";
import { ArrowLeft } from "lucide-react";
import {useNavigate, useParams} from "react-router-dom";
import { toast } from "react-toastify";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../store";
import { useAppDispatch } from "../../../../../../store/hooks";
import {
  useGetCompetitorMutation,
  useGenerateReportMutation
} from "../../../../../../store/competitor/competitorApi";
import { setCompetitor } from "../../../../../../store/competitor/competitorSlice";

// Utils
import { showError} from "../../../../../../utils/showError";

// Models
import { TCompetitor } from "../../../../../../models/Competitor";
import { ApiResponse } from "../../../../../../models/ApiResponse";

function Competitor() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const [ isGenerating, setIsGenerating ] = useState<boolean>(false);

  const [ getCompetitor ] = useGetCompetitorMutation();
  const [ generateReport ] = useGenerateReportMutation();

  const { competitor } = useSelector((state: RootState) => state.competitorModule);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(id) {
          const response: ApiResponse<TCompetitor> = await getCompetitor(id).unwrap();

          if(response && response.data) {
            console.log("RESPONSE")
            console.log(response);
            console.log("-------")

            dispatch(setCompetitor(response.data));
          }
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!id) return null;

  // Generate Report
  const generate = async () => {
    try {
      const response: ApiResponse<any> = await generateReport(id).unwrap();

      if(response && response?.data) {
        toast.success(response.message);
      }
    } catch (error: any) {
      showError(error);
    }
  }

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
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

      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <div className="w-full flex items-center border-b p-4 justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Competitor</h2>

          <button
            onClick={() => generate()}
            className={`
              px-4 py-2 rounded-lg shadow text-white
              flex items-center gap-2 justify-center min-w-[170px]
              bg-blue-600 hover:bg-blue-700
            `}
          >
            {isGenerating ? (
              <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </button>
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
                <span className="font-medium">Status</span>
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
    </section>
  )
}

export default Competitor;