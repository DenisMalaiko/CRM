import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TAIArtifact } from "../../models/AIArtifact";

export const artifactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCreatives: builder.mutation<ApiResponse<TAIArtifact[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/ai-artifact/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TAIArtifact[]>
        };
      }
    }),

    updateCreative: builder.mutation<ApiResponse<TAIArtifact>, { id: string, form: any }>({
      query: ({ id, form }) => ({
        url: `/ai-artifact/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteCreative: builder.mutation<ApiResponse<TAIArtifact>, string>({
      query: (id: string) => ({
        url: `/ai-artifact/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCreativesMutation,
  useUpdateCreativeMutation,
  useDeleteCreativeMutation
} = artifactApi;