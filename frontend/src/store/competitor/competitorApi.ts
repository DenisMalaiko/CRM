import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate } from "../../models/Competitor";

export const competitorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompetitors: builder.mutation<ApiResponse<TCompetitor[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/competitors/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TCompetitor[]>
        };
      }
    }),

    createCompetitor: builder.mutation<ApiResponse<TCompetitor>, TCompetitorCreate>({
      query: (form: TCompetitorCreate) => ({
        url: `/competitors`,
        method: "POST",
        body: form,
      })
    }),

    updateCompetitor: builder.mutation<ApiResponse<TCompetitor>, { id: string, form: TCompetitorUpdate }>({
      query: ({ id, form }) => ({
        url: `/competitors/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteCompetitor: builder.mutation<ApiResponse<TCompetitor>, string>({
      query: (id: string) => ({
        url: `/competitors/${id}`,
        method: "DELETE",
      })
    }),

    generateReport: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/competitors/generateReport/${id}`,
        method: "POST",
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useGetCompetitorsMutation,
  useCreateCompetitorMutation,
  useUpdateCompetitorMutation,
  useDeleteCompetitorMutation,
  useGenerateReportMutation,
} = competitorApi;