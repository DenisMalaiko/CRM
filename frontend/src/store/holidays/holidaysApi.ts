import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { THoliday } from "../../models/Holiday";

export const holidaysApi = api.injectEndpoints({
  endpoints: builder => ({
    getHolidays: builder.query<ApiResponse<THoliday[]>, { year: number; countryCode: string }>({
      query: ({ year, countryCode }) => ({
        url: `/holidays/${year}/${countryCode}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetHolidaysQuery } = holidaysApi;
