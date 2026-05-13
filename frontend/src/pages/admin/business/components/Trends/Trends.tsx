import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import Select from "react-select";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";
import { useLazyGetTrendsByBusinessIdQuery } from "../../../../../store/trends/trendsApi";
import { setTrends } from "../../../../../store/trends/trendsSlice";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";

function Trends() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ getTrendsByBusinessId, { isLoading } ] = useLazyGetTrendsByBusinessIdQuery();

  const [ open, setOpen ] = useState(false);
/*  const [ selectedTrend, setSelectedTrend ] = useState<string | null>(null);
  const { trends } = useSelector((state: any) => state.trendsModule);*/


  // Get Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
        }
      } catch (error) {
        showError(error);
      }
    }

    fetchData();
  }, [dispatch]);

  const getTrends = async () => {
    console.log("GET TRENDS")
    if (!businessId) return;
    try {
      const response = await getTrendsByBusinessId(businessId).unwrap();
      if (response && response.data) dispatch(setTrends(response.data));
    } catch (error) {
      showError(error);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Trends</h2>

          <button
            onClick={() => getTrends()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            { isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                Getting Trends...
              </>
            ) : ("Get Trends")
            }
          </button>
        </div>
      </section>
    </div>
  )
}

export default Trends;
