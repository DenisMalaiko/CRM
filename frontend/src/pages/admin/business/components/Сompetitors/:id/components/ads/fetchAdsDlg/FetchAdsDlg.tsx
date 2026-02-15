import React, { useMemo } from 'react';
import DatePicker from "react-datepicker";
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";

// Hooks
import { useForm } from "../../../../../../../../../hooks/useForm";
import { useValidation } from "../../../../../../../../../hooks/useValidation";

// Redux
import { useAppDispatch } from "../../../../../../../../../store/hooks";
import {
  useFetchAdsMutation,
  useGetAdsMutation
} from "../../../../../../../../../store/competitor/competitorApi";
import { setAds } from "../../../../../../../../../store/competitor/competitorSlice";

// Components
import Select from "react-select";

// Models
import { ApiResponse } from "../../../../../../../../../models/ApiResponse";
import { ChangeArg, isNativeEvent } from "../../../../../../../../../utils/isNativeEvent";
import { TCompetitorAdsParams } from "../../../../../../../../../models/Competitor";

// Utils
import { showError } from "../../../../../../../../../utils/showError";
import { isRequired } from "../../../../../../../../../utils/validations";
import { toDate, toStartOfDay } from "../../../../../../../../../utils/toDate";

// Const
import { AdsStatusOptions, AdsPeriodOptions, AdsSortOptions, Option } from "../../../../../../../../../const/Ads";
import { centeredSelectStyles } from "../../../../../../../../../utils/reactSelectStyles";

function FetchAdsDlg({ open, onClose }: any) {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [ fetchAds, { isLoading: isLoadingAds } ] = useFetchAdsMutation();
  const [ getAds ] = useGetAdsMutation();

  // Init Form
  const initForm = useMemo<TCompetitorAdsParams>(() => {
    return {
      activeStatus: AdsStatusOptions[0].value,
      period: AdsPeriodOptions[0].value,
      sortBy: AdsSortOptions[0].value,
    }
  }, []);

  // Form Hooks
  const { form, handleChange, resetForm } = useForm(initForm);

  // Validation Hooks
  const { errors, validateField, validateAll } = useValidation({
    activeStatus: (value) => isRequired(value),
    period: (value) => isRequired(value),
    sortBy: (value) => isRequired(value),
  });

  if(!open) return null;
  if(!id) return null;

  // Get Ads
  const getAdsData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll(form)) return;

    try {
      const response: ApiResponse<any> = await fetchAds({
        id,
        form: {
          activeStatus: form.activeStatus,
          period: form.period,
          sortBy: form.sortBy,
        },
      }).unwrap();

      if(response && response?.data) {
        const responseAds: ApiResponse<any> = await getAds(id).unwrap();
        console.log("ADS ", responseAds?.data)
        if(responseAds && responseAds?.data) dispatch(setAds(responseAds.data));
        toast.success(response.message);
      }
    } catch (error: any) {
      showError(error);
    } finally {
      onClose()
    }
  }

  // Handle Change
  const onChange = (arg: ChangeArg) => {
    let name: string;
    let value: any;

    if (isNativeEvent(arg)) {
      const t = arg.target as HTMLInputElement;
      name = t.name;
      value = t.type === "checkbox" ? t.checked : t.value;
    } else {
      name = arg.name;
      value = arg.value;
    }

    handleChange({ name, value });
    validateField(name as keyof typeof form, value, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Params</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={getAdsData} action="">
          <div>
            <div className="flex items-center gap-2 justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 text-left">Ads Status</label>
            </div>

            <Select
              options={AdsStatusOptions}
              value={AdsStatusOptions.find(
                (option: Option) => form.activeStatus === option.value
              )}
              onChange={(selected: any) =>
                onChange({
                  name: "activeStatus",
                  value: selected.value,
                })
              }
              styles={centeredSelectStyles}
            />
          </div>


          <div>
            <div className="flex items-center gap-2 justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 text-left">Ads Period</label>
            </div>

            <Select
              options={AdsPeriodOptions}
              value={AdsPeriodOptions.find(
                (option: Option) => form.period === option.value
              )}
              onChange={(selected: any) =>
                onChange({
                  name: "period",
                  value: selected.value,
                })
              }
              styles={centeredSelectStyles}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 text-left">Ads Sort By</label>
            </div>

            <Select
              options={AdsSortOptions}
              value={AdsSortOptions.find(
                (option: Option) => form.sortBy === option.value
              )}
              onChange={(selected: any) =>
                onChange({
                  name: "sortBy",
                  value: selected.value,
                })
              }
              styles={centeredSelectStyles}
            />
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoadingAds}
              className="
                px-4 py-2 rounded-lg border  text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoadingAds}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center"
            >
              { isLoadingAds ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                  Getting...
                </>
              ) : ("Get")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FetchAdsDlg;