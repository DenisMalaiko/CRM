import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TCalendarificHoliday } from "../../models/CalendarificHoliday";

export const calendarificApi = api.injectEndpoints({
  endpoints: builder => ({
    getCalendarificHolidays: builder.query<ApiResponse<TCalendarificHoliday[]>, { year: number; countryCode: string }>({
      query: ({ year, countryCode }) => ({
        url: `/calendarific/${year}/${countryCode}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetCalendarificHolidaysQuery } = calendarificApi;
