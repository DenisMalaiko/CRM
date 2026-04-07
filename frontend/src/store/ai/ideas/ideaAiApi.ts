import { api } from "../../api/api";
import { ApiResponse } from "../../../models/ApiResponse";
import { TIdeaAI, TIdeaAIUpdate } from "../../../models/IdeaAI";


export const ideaAiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchIdeasAI: builder.mutation<ApiResponse<TIdeaAI[]>, { id: string }>({
      queryFn: async ({ id }, api, _extraOptions, baseQuery) => {
        if (!id) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/ideaAI/${id}`,
          method: 'POST',
        });

        return {
          data: result.data as ApiResponse<TIdeaAI[]>
        };
      }
    }),

    getIdeasAI: builder.query<ApiResponse<TIdeaAI[]>, string>({
      query: (id: string) => ({
        url: `/ideaAI/${id}`
      })
    }),

    updateIdeaAI: builder.mutation<ApiResponse<TIdeaAI>, { id: string, form: TIdeaAIUpdate }>({
      query: ({ id, form }) => ({
        url: `/ideaAI/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteIdeaAI: builder.mutation<ApiResponse<TIdeaAI>, string>({
      query: (id: string) => ({
        url: `/ideaAI/${id}`,
        method: "DELETE",
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useFetchIdeasAIMutation,
  useUpdateIdeaAIMutation,
  useDeleteIdeaAIMutation,
  useLazyGetIdeasAIQuery,
} = ideaAiApi;