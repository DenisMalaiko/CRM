import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  getYear,
} from "date-fns";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { useGetCalendarificHolidaysQuery } from "../../../../../../store/calendarific/calendarificApi";
import { useGetBusinessMutation } from "../../../../../../store/businesses/businessesApi";
import { setBusiness } from "../../../../../../store/businesses/businessesSlice";
import { TCalendarificHoliday } from "../../../../../../models/CalendarificHoliday";
import { ApiResponse } from "../../../../../../models/ApiResponse";
import { TBusiness } from "../../../../../../models/Business";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { businessId } = useParams<{ businessId: string }>();
  const dispatch = useAppDispatch();
  const business = useAppSelector(state => state.businessModule.business);
  const country = business?.country;
  const [getBusiness] = useGetBusinessMutation();

  useEffect(() => {
    if (!business && businessId) {
      getBusiness(businessId).unwrap().then((response: ApiResponse<TBusiness>) => {
        if (response?.data) dispatch(setBusiness(response.data));
      });
    }
  }, [business, businessId, dispatch, getBusiness]);
  const year = getYear(currentMonth);
  const { data: calendarificResponse } = useGetCalendarificHolidaysQuery(
    { year, countryCode: country! },
    { skip: !country }
  );

  const calendarificMap = useMemo(() => {
    const map = new Map<string, TCalendarificHoliday[]>();
    if (calendarificResponse?.data) {
      for (const holiday of calendarificResponse.data) {
        const existing = map.get(holiday.date) || [];
        existing.push(holiday);
        map.set(holiday.date, existing);
      }
    }
    return map;
  }, [calendarificResponse]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const weekDayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Calendar</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
              Holidays
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            Today
          </button>

          <button
            onClick={handlePrevMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[140px] text-center font-semibold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </span>

          <button
            onClick={handleNextMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7">
          {weekDayHeaders.map(day => (
            <div
              key={day}
              className="py-2 pl-2 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const dateKey = format(day, "yyyy-MM-dd");
            const calendarificHolidays = calendarificMap.get(dateKey);

            const bgColor = !isCurrentMonth
              ? "bg-slate-50"
              : calendarificHolidays
              ? "bg-blue-50"
              : "bg-white";

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 flex flex-col justify-start items-start ${bgColor}`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                    isTodayDate
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : isCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {calendarificHolidays && isCurrentMonth && calendarificHolidays.map((ch, i) => (
                  <div key={i} className="mt-1 w-full bg-blue-100 rounded px-1.5 py-0.5 overflow-hidden text-left">
                    <span className="text-xs text-blue-700 block truncate" title={ch.primaryType}>
                      {ch.name}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
