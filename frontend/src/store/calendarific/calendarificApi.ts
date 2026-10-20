import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TCalendarificHoliday } from "../../models/CalendarificHoliday";

export const calendarificApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarificHolidays: builder.query<
      ApiResponse<TCalendarificHoliday[]>,
      { year: number; countryCode: string; language?: string }
    >({
      query: ({ year, countryCode, language = "uk" }) => ({
        url: `/calendarific/${year}/${countryCode}?language=${language}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetCalendarificHolidaysQuery } = calendarificApi;
