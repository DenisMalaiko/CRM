import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { format, getYear } from "date-fns";

// Hooks
import { useForm } from "../../../../../../hooks/useForm";

// Redux
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import {
  useGenerateContentPlanMutation,
  useLazyGetContentPlansQuery,
} from "../../../../../../store/contentPlan/contentPlanApi";
import { setContentPlans } from "../../../../../../store/contentPlan/contentPlanSlice";
import { useGetProductsMutation } from "../../../../../../store/products/productsApi";
import { setProducts } from "../../../../../../store/products/productsSlice";
import { useGetAudiencesMutation } from "../../../../../../store/audience/audienceApi";
import { setAudiences } from "../../../../../../store/audience/audienceSlice";
import { useGetIdeasMutation } from "../../../../../../store/idea/ideaApi";
import { setIdeas } from "../../../../../../store/idea/ideaSlice";
import { useLazyGetIdeasAIQuery } from "../../../../../../store/ai/ideas/ideaAiApi";
import { setIdeasAi } from "../../../../../../store/ai/ideas/ideaAiSlice";
import { useGetCalendarificHolidaysQuery } from "../../../../../../store/calendarific/calendarificApi";

// Components
import Select from "react-select";

// Models
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TContentPlan, TContentPlanGenerate } from "../../../../../../models/ContentPlan";
import { TProduct } from "../../../../../../models/Product";
import { TAudience } from "../../../../../../models/Audience";
import { TIdea } from "../../../../../../models/Idea";
import { TIdeaAI } from "../../../../../../models/IdeaAI";
import { TCalendarificHoliday } from "../../../../../../models/CalendarificHoliday";

// Utils
import { showError } from "../../../../../../utils/showError";
import { centeredSelectStyles } from "../../../../../../utils/reactSelectStyles";
import { StylesConfig } from "react-select";

// Enum
import { IdeaStatus } from "../../../../../../enum/IdeaStatus";

type SelectOption = { value: string; label: string };
type IdeaSelectOption = SelectOption & { type: "manual" | "ai" };

type Props = {
  open: boolean;
  onClose: () => void;
};

function GenerateContentPlanDlg({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  const [ generateContentPlan ] = useGenerateContentPlanMutation();
  const [ getContentPlans ] = useLazyGetContentPlansQuery();
  const [ getProducts ] = useGetProductsMutation();
  const [ getAudiences ] = useGetAudiencesMutation();
  const [ getIdeas ] = useGetIdeasMutation();
  const [ getIdeasAI ] = useLazyGetIdeasAIQuery();

  const { products } = useAppSelector((state) => state.productsModule);
  const { audiences } = useAppSelector((state) => state.audienceModule);
  const { ideas } = useAppSelector((state) => state.ideaModule);
  const { ideasAi } = useAppSelector((state) => state.ideaAiModule);
  const business = useAppSelector((state) => state.businessModule.business);
  const country = business?.country;

  const [isLoading, setIsLoading] = useState(false);
  const [sourceMode, setSourceMode] = useState<"idea" | "marketing_calendar">("idea");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<{ name: string; date: string } | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const { form, handleChange } = useForm({
    productsIds: [] as string[],
    audiencesIds: [] as string[],
    ideasIds: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (businessId) {
          const productsResponse: ApiResponse<TProduct[]> = await getProducts(businessId).unwrap();
          const audiencesResponse: ApiResponse<TAudience[]> = await getAudiences(businessId).unwrap();
          const ideasResponse: ApiResponse<TIdea[]> = await getIdeas({ businessId }).unwrap();
          const ideasAiResponse: ApiResponse<TIdeaAI[]> = await getIdeasAI(businessId).unwrap();

          if (productsResponse && productsResponse?.data) dispatch(setProducts(productsResponse.data));
          if (audiencesResponse && audiencesResponse?.data) dispatch(setAudiences(audiencesResponse.data));
          if (ideasResponse && ideasResponse?.data) dispatch(setIdeas(ideasResponse.data));
          if (ideasAiResponse && ideasAiResponse?.data) dispatch(setIdeasAi(ideasAiResponse.data));
        }
      } catch (error) {
        showError(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const productsOptions = useMemo(
    () => products?.map((product: TProduct) => ({ value: product.id, label: product.name })) ?? [],
    [products]
  );

  const audiencesOptions = useMemo(
    () => audiences?.map((audience: TAudience) => ({ value: audience.id, label: audience.name })) ?? [],
    [audiences]
  );

  const allIdeasOptions = useMemo(() => {
    return [
      ...(ideas ?? [])
        .filter((idea: TIdea) => idea.status === IdeaStatus.Planned || idea.status === IdeaStatus.Used)
        .map((idea: TIdea) => ({
          label: idea.title,
          value: idea.id,
          type: "manual" as const,
        })),
      ...(ideasAi ?? [])
        .filter((idea: TIdeaAI) => idea.status === IdeaStatus.Planned || idea.status === IdeaStatus.Used)
        .map((idea: TIdeaAI) => ({
          label: idea.title,
          value: idea.id,
          type: "ai" as const,
        })),
    ];
  }, [ideas, ideasAi]);

  const { data: holidaysResponse, isLoading: isHolidaysLoading } = useGetCalendarificHolidaysQuery(
    { year: getYear(viewDate), countryCode: country!, language: "uk" },
    { skip: !country }
  );

  const holidayMap = useMemo(() => {
    const map = new Map<string, TCalendarificHoliday[]>();
    if (holidaysResponse?.data) {
      for (const h of holidaysResponse.data) {
        const existing = map.get(h.date) || [];
        existing.push(h);
        map.set(h.date, existing);
      }
    }
    return map;
  }, [holidaysResponse]);

  const highlightDates = useMemo(() => {
    if (!holidaysResponse?.data) return [];
    return [{
      "react-datepicker__day--highlighted-custom": holidaysResponse.data.map(
        (h) => new Date(h.date)
      ),
    }];
  }, [holidaysResponse]);

  if (!open) return null;
  if (!businessId) return null;

  const isHolidayDate = (date: Date): boolean => {
    if (holidayMap.size === 0) return true;
    return holidayMap.has(format(date, "yyyy-MM-dd"));
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const holidays = holidayMap.get(dateStr);
    if (holidays && holidays.length > 0) {
      setSelectedDate(date);
      setSelectedHoliday({ name: holidays[0].name, date: dateStr });
    }
  };

  const generate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      let formData: TContentPlanGenerate;

      if (sourceMode === "idea") {
        formData = {
          mode: "manual",
          productsIds: form.productsIds,
          audiencesIds: form.audiencesIds,
          ideasIds: form.ideasIds,
        };
      } else {
        if (!selectedHoliday) {
          toast.error("Please select a holiday from the calendar");
          setIsLoading(false);
          return;
        }
        formData = {
          mode: "marketing_calendar",
          productsIds: form.productsIds,
          audiencesIds: form.audiencesIds,
          holidayName: selectedHoliday.name,
          holidayDate: selectedHoliday.date,
        };
      }

      const response: ApiResponse<TContentPlan[]> = await generateContentPlan({
        id: businessId,
        form: formData,
      }).unwrap();

      if (response && response?.data) {
        const responsePlans: ApiResponse<TContentPlan[]> = await getContentPlans(businessId).unwrap();

        if (responsePlans && responsePlans?.data) {
          dispatch(setContentPlans(responsePlans.data));
          toast.success(response.message);
          onClose();
        }
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl relative">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Generate Content Plan</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={generate}>
          <div className="relative z-20 space-y-3">
            {!!productsOptions.length && (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-left mb-1">Products</label>
                <Select<SelectOption>
                  options={productsOptions}
                  value={productsOptions.find(
                    (option) => form.productsIds[0] === option.value
                  )}
                  onChange={(selected) =>
                    handleChange({
                      name: "productsIds",
                      value: selected ? [selected.value] : [],
                    })
                  }
                  styles={centeredSelectStyles as StylesConfig<SelectOption>}
                />
              </div>
            )}

            {!!audiencesOptions.length && (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-left mb-1">Audiences</label>
                <Select<SelectOption, true>
                  isMulti
                  options={audiencesOptions}
                  value={audiencesOptions.filter((option) =>
                    form.audiencesIds.includes(option.value)
                  )}
                  onChange={(selected) =>
                    handleChange({
                      name: "audiencesIds",
                      value: selected.map((o) => o.value),
                    })
                  }
                  styles={centeredSelectStyles as StylesConfig<SelectOption, true>}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceMode"
                value="idea"
                checked={sourceMode === "idea"}
                onChange={() => setSourceMode("idea")}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Idea</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceMode"
                value="marketing_calendar"
                checked={sourceMode === "marketing_calendar"}
                onChange={() => setSourceMode("marketing_calendar")}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Marketing Calendar</span>
            </label>
          </div>

          {sourceMode === "idea" && !!allIdeasOptions.length && (
            <div className="relative z-20">
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">Ideas</label>
              <Select<IdeaSelectOption, true>
                isMulti
                options={allIdeasOptions}
                value={allIdeasOptions.filter((option) =>
                  form.ideasIds.includes(option.value)
                )}
                onChange={(selected) =>
                  handleChange({
                    name: "ideasIds",
                    value: selected.map((o) => o.value),
                  })
                }
                formatOptionLabel={(option) => (
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>{option.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        option.type === "ai"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {option.type === "ai" ? "AI" : "Competitor"}
                    </span>
                  </div>
                )}
                styles={centeredSelectStyles as StylesConfig<IdeaSelectOption, true>}
              />
            </div>
          )}

          {sourceMode === "marketing_calendar" && (
            <div className="space-y-3">
              <style>{`
                .content-plan-datepicker .react-datepicker {
                  border: 1px solid #e2e8f0;
                  border-radius: 0.75rem;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                  font-family: inherit;
                  overflow: hidden;
                }
                .content-plan-datepicker .react-datepicker__header {
                  background: #f8fafc;
                  border-bottom: 1px solid #e2e8f0;
                  padding-top: 12px;
                }
                .content-plan-datepicker .react-datepicker__current-month {
                  font-weight: 600;
                  font-size: 0.95rem;
                  color: #1e293b;
                }
                .content-plan-datepicker .react-datepicker__day-name {
                  color: #94a3b8;
                  font-weight: 500;
                  font-size: 0.75rem;
                  width: 2.2rem;
                  line-height: 2.2rem;
                }
                .content-plan-datepicker .react-datepicker__day {
                  width: 2.2rem;
                  line-height: 2.2rem;
                  border-radius: 0.5rem;
                  font-size: 0.85rem;
                  color: #334155;
                  transition: all 0.15s ease;
                }
                .content-plan-datepicker .react-datepicker__day:hover {
                  background-color: #eff6ff;
                  border-radius: 0.5rem;
                }
                .content-plan-datepicker .react-datepicker__day--selected {
                  background-color: #2563eb !important;
                  color: white !important;
                  border-radius: 0.5rem;
                  font-weight: 600;
                }
                .content-plan-datepicker .react-datepicker__day--disabled {
                  color: #cbd5e1 !important;
                  cursor: not-allowed;
                }
                .content-plan-datepicker .react-datepicker__day--disabled:hover {
                  background-color: transparent;
                }
                .content-plan-datepicker .react-datepicker__day--highlighted-custom {
                  background-color: #dbeafe !important;
                  color: #1d4ed8 !important;
                  font-weight: 600;
                  border-radius: 0.5rem;
                }
                .content-plan-datepicker .react-datepicker__day--highlighted-custom:hover {
                  background-color: #bfdbfe !important;
                }
                .content-plan-datepicker .react-datepicker__day--highlighted-custom.react-datepicker__day--selected {
                  background-color: #2563eb !important;
                  color: white !important;
                }
                .content-plan-datepicker .react-datepicker__navigation {
                  top: 10px;
                }
                .content-plan-datepicker .react-datepicker__navigation-icon::before {
                  border-color: #64748b;
                  border-width: 2px 2px 0 0;
                  height: 8px;
                  width: 8px;
                }
                .content-plan-datepicker .react-datepicker__navigation:hover *::before {
                  border-color: #1e293b;
                }
              `}</style>
              <label className="block text-sm font-medium text-slate-700 text-left mb-1">
                Select a holiday
              </label>
              <div className="w-full">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  onMonthChange={(date: Date) => setViewDate(date)}
                  filterDate={isHolidayDate}
                  highlightDates={highlightDates}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  wrapperClassName="w-full"
                  popperClassName="content-plan-datepicker"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                />
              </div>
              {selectedHoliday && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  Selected: <strong>{selectedHoliday.name}</strong> ({selectedHoliday.date})
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg border text-slate-600
                border-slate-300 hover:bg-slate-50
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || (sourceMode === "marketing_calendar" && !selectedHoliday)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : ("Generate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateContentPlanDlg;
