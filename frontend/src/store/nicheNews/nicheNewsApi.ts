import { api } from "../api/api"
import { ApiResponse } from "../../models/ApiResponse"
import { TNicheNews } from "../../models/NicheNews"

export const nicheNewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNicheNewsByBusinessId: builder.mutation<ApiResponse<TNicheNews[]>, string>({
      query: (businessId) => ({
        url: `/niche-news/business/${businessId}`,
        method: "GET",
      }),
    }),
    fetchNicheNews: builder.mutation<ApiResponse<TNicheNews[]>, string>({
      query: (businessId) => ({
        url: `/niche-news/fetch/${businessId}`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetNicheNewsByBusinessIdMutation, useFetchNicheNewsMutation } = nicheNewsApi
