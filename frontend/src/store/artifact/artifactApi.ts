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
    })
  }),
  overrideExisting: false,
})

export const {
  useGetCreativesMutation
} = artifactApi;