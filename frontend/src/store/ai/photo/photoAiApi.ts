import { api } from "../../api/api";
import { ApiResponse } from "../../../models/ApiResponse";
import { TAiPhoto } from "../../../models/AiPhoto";

export const photoAiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generatePhotoAI: builder.mutation<
      ApiResponse<TAiPhoto[]>,
      { id: string; prompt: string }
    >({
      queryFn: async ({ id, prompt }, _api, _extraOptions, baseQuery) => {
        if (!id) {
          return { error: { status: 400, data: "Missing businessId" } as any };
        }
        const result = await baseQuery({
          url: `/aiPhoto/${id}`,
          method: "POST",
          body: { prompt },
        });
        return { data: result.data as ApiResponse<TAiPhoto[]> };
      },
    }),

    getPhotosAI: builder.query<ApiResponse<TAiPhoto[]>, string>({
      query: (id: string) => ({
        url: `/aiPhoto/${id}`,
      }),
    }),

    deletePhotoAI: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/aiPhoto/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGeneratePhotoAIMutation,
  useLazyGetPhotosAIQuery,
  useDeletePhotoAIMutation,
} = photoAiApi;
