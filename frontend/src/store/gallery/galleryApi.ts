import { api } from "../api/api";
import { ApiResponse} from "../../models/ApiResponse";
import { TGalleryFormUpload } from "../../models/Gallery";

export const galleryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.mutation<ApiResponse<any[]>, string>({
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
          data: result.data as ApiResponse<any>
        };
      }
    }),

    getPhoto: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/gallery/${id}`,
        method: "GET",
      })
    }),

    uploadPhotos: builder.mutation<ApiResponse<any>, any>({
      query: (form: FormData) => ({
        url: `/gallery`,
        method: "POST",
        body: form,
      })
    }),

    updatePhoto: builder.mutation<ApiResponse<any>, any>({
      query: ({ id, form }) => ({
        url: `/gallery/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deletePhoto: builder.mutation<ApiResponse<any>, any>({
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