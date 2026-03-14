import { api } from "../api/api";
import { ApiResponse} from "../../models/ApiResponse";
import {
  TGalleryPhoto,
  TGalleryPhotoUpdate,
  TGalleryPhotoUpdateForm,
  TDefaultGalleryPhoto,
  TDefaultGalleryPhotoUpdateForm
} from "../../models/Gallery";

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

    updatePhoto: builder.mutation<ApiResponse<TGalleryPhoto>, { id: string, form: TGalleryPhotoUpdateForm }>({
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
    }),


    // Default DefaultGalleryPhotos
    getDefaultPhotos: builder.query<ApiResponse<TDefaultGalleryPhoto[]>, void>({
      query: () => ({
        url: `/gallery/default-list`,
      })
    }),

    uploadDefaultPhotos: builder.mutation<ApiResponse<{ count: number } | []>, FormData>({
      query: (form: FormData) => ({
        url: `/gallery/default-list`,
        method: "POST",
        body: form,
      })
    }),

    updateDefaultPhoto: builder.mutation<ApiResponse<TDefaultGalleryPhoto>, { id: string, form: TDefaultGalleryPhotoUpdateForm }>({
      query: ({ id, form }) => ({
        url: `/gallery/default-list/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteDefaultPhoto: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/gallery/default-list/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPhotosMutation,
  useUploadPhotosMutation,
  useUpdatePhotoMutation,
  useDeletePhotoMutation,

  useLazyGetDefaultPhotosQuery,
  useUploadDefaultPhotosMutation,
  useUpdateDefaultPhotoMutation,
  useDeleteDefaultPhotoMutation,
} = galleryApi;