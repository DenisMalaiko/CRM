import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import Select from "react-select";

// Redux
import { RootState } from "../../../../../../store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../../store/hooks";

// Components
import { confirm } from "../../../../../../components/confirmDlg/ConfirmDlg";

// Utils
import { showError } from "../../../../../../utils/showError";

function Settings() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ open, setOpen ] = useState(false);
  const { business } = useSelector((state: RootState) => state.businessModule)

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
          <h2 className="text-lg text-left font-semibold text-slate-800">Settings</h2>
        </div>
      </section>
    </div>
  )
}

export default Settings;