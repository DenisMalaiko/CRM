import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrends: builder.query<ApiResponse<any>, string>({
      query: (businessId) => ({
        url: `/trends/${businessId}`
      })
    })
  }),
  overrideExisting: false,
})

export const {
  useLazyGetTrendsQuery
} = trendsApi;