import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ExternalLink, Eye, Copy } from "lucide-react";
import Select from "react-select";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";
import { useFetchIdeasAiMutation } from "../../../../../store/ai/ideas/ideaAiApi";
import { setIdeasAi } from "../../../../../store/ai/ideas/ideaAiSlice";

// Utils
import { showError } from "../../../../../utils/showError";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";


function IdeasAI() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();
  const [ fetchIdeasAi, { isLoading: isLoadingFetch } ] = useFetchIdeasAiMutation();

  const { ideasAi } = useSelector((state: RootState) => state.ideaAiModule)

  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const response = await fetchIdeasAi({ id: businessId }).unwrap();
          console.log("RESPONSE: ", response);

          if(response && response.data) dispatch(setIdeasAi(response.data));
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  if(!businessId) return null;


  // Fetch Ideas
  const getIdeasData = async () => {
    try {
      const response: ApiResponse<any> = await fetchIdeasAi({
        id: businessId
      }).unwrap();

      if(response && response?.data) {
        console.log("GET IDEAS")
      }
    } catch (error: any) {
      showError(error);
    }
  }


  return (
    <div>
      <div className="rounded-2xl bg-white shadow border border-slate-200 mb-5">
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">AI Ideas</h2>

            <button
              disabled={isLoadingFetch}
              onClick={() => getIdeasData()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingFetch ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Getting Ideas...
                </>
              ) : ("Get Ideas")
              }
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default IdeasAI;