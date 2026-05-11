import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import {TPrompt} from "../../models/Prompt";

export const trendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrendsByBusinessId: builder.query<ApiResponse<any>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/trends/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<any[]>
        };
      }
    })
  }),
  overrideExisting: false,
})

export const {
  useLazyGetTrendsByBusinessIdQuery
} = trendsApi;
