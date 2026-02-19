import { api } from "../api/api";
import { ApiResponse} from "../../models/ApiResponse";
import { TGalleryPhoto } from "../../models/Gallery";
import {TCompetitorUpdate} from "../../models/Competitor";

export const galleryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.mutation<ApiResponse<TGalleryPhoto[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/gallery/list/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TGalleryPhoto[]>
        };
      }
    }),

    getPhoto: builder.mutation<ApiResponse<TGalleryPhoto>, string>({
      query: (id: string) => ({
        url: `/gallery/${id}`,
        method: "GET",
      })
    }),

    uploadPhotos: builder.mutation<ApiResponse<{ count: number } | []>, FormData>({
      query: (form: FormData) => ({
        url: `/gallery`,
        method: "POST",
        body: form,
      })
    }),

    updatePhoto: builder.mutation<ApiResponse<TGalleryPhoto>, { id: string, form: TGalleryPhoto }>({
      query: ({ id, form }) => ({
        url: `/gallery/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deletePhoto: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/gallery/${id}`,
        method: "DELETE",
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useGetPhotosMutation,
  useGetPhotoMutation,
  useUploadPhotosMutation,
  useUpdatePhotoMutation,
  useDeletePhotoMutation,
} = galleryApi;