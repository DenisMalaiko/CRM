import { api } from "../../api/api";
import { ApiResponse } from "../../../models/ApiResponse";


export const ideaAiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchIdeasAi: builder.mutation<ApiResponse<any[]>, { id: string }>({
      queryFn: async ({ id }, api, _extraOptions, baseQuery) => {
        if (!id) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/ideasAI/${id}`,
          method: 'POST',
        });

        return {
          data: result.data as ApiResponse<any[]>
        };
      }
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchIdeasAiMutation
} = ideaAiApi;