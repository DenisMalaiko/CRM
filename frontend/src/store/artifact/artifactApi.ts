import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TAIArtifact } from "../../models/AIArtifact";
import { GalleryType } from "../../enum/GalleryType";
import {TGalleryPhoto} from "../../models/Gallery";


export const artifactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAiArtifacts: builder.query<ApiResponse<TAIArtifact[]>, { businessId: string; type: GalleryType }>({
      query: ({ businessId, type }) => ({
        url: `/ai-artifact/${businessId}`,
        params: { type }
      })
    }),

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

    deleteCreativeBatch: builder.mutation<ApiResponse<TAIArtifact[]>, string[]>({
      query: (ids: string[]) => ({
        url: `/ai-artifact/batch`,
        method: "DELETE",
        body: { ids }
      })
    }),

    createCreativeManually: builder.mutation<ApiResponse<TAIArtifact>, { id: string, form: any, mediaType: string }>({
      query: ({ id, form, mediaType }) => ({
        url: `/ai-artifact/${id}`,
        method: "POST",
        body: { form, mediaType },
      })
    }),

    regenerateCreative: builder.mutation<ApiResponse<TAIArtifact>, { id: string, mediaId: string, form: { prompt: string } }>({
      query: ({ id, mediaId, form }) => ({
        url: `/ai-artifact/${id}/regenerate`,
        method: "POST",
        body: { ...form, mediaId },
      })
    }),

    revertCreativeOriginal: builder.mutation<ApiResponse<TAIArtifact>, { id: string, mediaId: string }>({
      query: ({ id, mediaId }) => ({
        url: `/ai-artifact/${id}/revert-original`,
        method: "POST",
        body: { mediaId },
      })
    }),

    revertCreativePrevious: builder.mutation<ApiResponse<TAIArtifact>, { id: string, mediaId: string }>({
      query: ({ id, mediaId }) => ({
        url: `/ai-artifact/${id}/revert-previous`,
        method: "POST",
        body: { mediaId },
      })
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCreativesMutation,
  useUpdateCreativeMutation,
  useDeleteCreativeMutation,
  useDeleteCreativeBatchMutation,
  useLazyGetAiArtifactsQuery,
  useCreateCreativeManuallyMutation,

  useRegenerateCreativeMutation,
  useRevertCreativeOriginalMutation,
  useRevertCreativePreviousMutation,
} = artifactApi;
