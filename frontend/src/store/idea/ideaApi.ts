import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TIdea, TIdeaParams, TIdeaUpdate } from "../../models/Idea";

export const ideaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchIdeas: builder.mutation<ApiResponse<TIdea[]>, { id: string, form: TIdeaParams }>({
      queryFn: async ({ id, form }, api, _extraOptions, baseQuery) => {
        if (!id) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/ideas/${id}`,
          method: 'POST',
          body: form,
        });

        return {
          data: result.data as ApiResponse<TIdea[]>
        };
      }
    }),

    getIdeas: builder.mutation<ApiResponse<TIdea[]>, string>({
      query: (id: string) => ({
        url: `/ideas/list/${id}`,
        method: "GET",
      })
    }),

    updateIdea: builder.mutation<ApiResponse<TIdea>, { id: string, form: TIdeaUpdate }>({
      query: ({ id, form }) => ({
        url: `/ideas/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteIdea: builder.mutation<ApiResponse<TIdea>, string>({
      query: (id: string) => ({
        url: `/ideas/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIdeasMutation,
  useFetchIdeasMutation,
  useDeleteIdeaMutation,
  useUpdateIdeaMutation,
} = ideaApi;