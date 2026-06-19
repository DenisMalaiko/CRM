import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TContentPlan, TContentPlanGenerate, TContentPlanUpdate } from "../../models/ContentPlan";

export const contentPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateContentPlan: builder.mutation<ApiResponse<TContentPlan[]>, { id: string, form: TContentPlanGenerate }>({
      query: ({ id, form }) => ({
        url: `/contentPlan/${id}`,
        method: "POST",
        body: form,
      })
    }),

    getContentPlans: builder.query<ApiResponse<TContentPlan[]>, string>({
      query: (id: string) => ({
        url: `/contentPlan/${id}`
      })
    }),

    updateContentPlan: builder.mutation<ApiResponse<TContentPlan>, { id: string, form: TContentPlanUpdate }>({
      query: ({ id, form }) => ({
        url: `/contentPlan/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteContentPlan: builder.mutation<ApiResponse<TContentPlan>, string>({
      query: (id: string) => ({
        url: `/contentPlan/${id}`,
        method: "DELETE",
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useGenerateContentPlanMutation,
  useLazyGetContentPlansQuery,
  useUpdateContentPlanMutation,
  useDeleteContentPlanMutation,
} = contentPlanApi;
