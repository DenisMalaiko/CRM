import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";

// Redux
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";
import { useAppDispatch } from "../../../../../store/hooks";

// Components
import { confirm } from "../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../utils/showError";

// Models
import { ApiResponse } from "../../../../../models/ApiResponse";

function Ideas() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ open, setOpen ] = useState(false);
  const [ selectedIdea, setSelectedIdea ] = useState<any | null>(null);


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

  if(!businessId) return null;

  // Delete Idea
  const openConfirmDlg = async (e: any, item: any) => {
    e.preventDefault();

    const ok = await confirm({
      title: "Delete idea",
      message: "Are you sure you want to delete this idea?",
    });

    if(ok) {
      try {
        if (item?.id != null) {
          console.log("DELETE IDEA", item);
        }
      } catch (error: any) {
        showError(error);
      }
    }
  }


  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg text-left font-semibold text-slate-800">Ideas</h2>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Idea
          </button>
        </div>

        <div className="w-full mx-auto p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          </div>
        </div>
      </section>
    </div>
  )
}

export default Ideas;