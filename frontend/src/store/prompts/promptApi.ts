import { api } from "../api/api"
import { ApiResponse } from "../../models/ApiResponse";
import { TPrompt, TPromptCreate } from "../../models/Prompt";

export const promptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrompts: builder.mutation<ApiResponse<TPrompt[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/prompts/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TPrompt[]>
        };
      }
    }),

    createPrompt: builder.mutation<ApiResponse<TPrompt>, TPromptCreate>({
      query: (form: TPromptCreate) => ({
        url: `/prompts/create`,
        method: "POST",
        body: form,
      })
    }),

    updatePrompt: builder.mutation<ApiResponse<TPrompt>, { id: string, form: TPromptCreate }>({
      query: ({ id, form }) => ({
        url: `/prompts/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deletePrompt: builder.mutation<ApiResponse<TPrompt>, string>({
      query: (id: string) => ({
        url: `/prompts/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPromptsMutation,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useDeletePromptMutation
} = promptApi;