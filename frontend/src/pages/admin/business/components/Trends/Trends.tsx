import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import Select from "react-select";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";

function Trends() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

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

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Trends</h2>
        </div>
      </section>
    </div>
  )
}

export default Trends;