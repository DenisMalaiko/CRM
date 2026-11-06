import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import {
  TContentPlan,
  TContentPlanGenerate,
  TContentPlanUpdate,
  TContentPlanPost,
  TContentPlanPostUpdate,
} from "../../models/ContentPlan";

export const contentPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateContentPlan: builder.mutation<
      ApiResponse<TContentPlan[]>,
      { id: string; form: TContentPlanGenerate }
    >({
      query: ({ id, form }) => ({
        url: `/contentPlan/${id}`,
        method: "POST",
        body: form,
      }),
    }),

    getContentPlans: builder.query<ApiResponse<TContentPlan[]>, string>({
      query: (id: string) => ({
        url: `/contentPlan/${id}`,
      }),
    }),

    updateContentPlan: builder.mutation<
      ApiResponse<TContentPlan>,
      { id: string; form: TContentPlanUpdate }
    >({
      query: ({ id, form }) => ({
        url: `/contentPlan/${id}`,
        method: "PATCH",
        body: form,
      }),
    }),

    deleteContentPlan: builder.mutation<ApiResponse<TContentPlan>, string>({
      query: (id: string) => ({
        url: `/contentPlan/${id}`,
        method: "DELETE",
      }),
    }),

    getContentPlanPosts: builder.query<ApiResponse<TContentPlanPost[]>, string>(
      {
        query: (id: string) => ({
          url: `/contentPlan/posts/${id}`,
        }),
      },
    ),

    updateContentPlanPost: builder.mutation<
      ApiResponse<TContentPlanPost>,
      { id: string; day: number; form: TContentPlanPostUpdate }
    >({
      query: ({ id, day, form }) => ({
        url: `/contentPlan/${id}/posts/${day}`,
        method: "PATCH",
        body: form,
      }),
    }),

    deleteContentPlanPost: builder.mutation<
      ApiResponse<void>,
      { id: string; day: number }
    >({
      query: ({ id, day }) => ({
        url: `/contentPlan/${id}/posts/${day}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGenerateContentPlanMutation,
  useLazyGetContentPlansQuery,
  useUpdateContentPlanMutation,
  useDeleteContentPlanMutation,
  useGetContentPlanPostsQuery,
  useLazyGetContentPlanPostsQuery,
  useUpdateContentPlanPostMutation,
  useDeleteContentPlanPostMutation,
} = contentPlanApi;
