import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {TPlatform, TPlatformCreate} from "../../models/Platform";
import {TAudience, TAudienceCreate} from "../../models/Audience";

export const platformApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatforms: builder.mutation<ApiResponse<TPlatform[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/platform/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TPlatform[]>
        };
      }
    }),

    createPlatform: builder.mutation<ApiResponse<TPlatform>, TPlatformCreate>({
      query: (form: TPlatformCreate) => ({
        url: `/platform/create`,
        method: "POST",
        body: form,
      })
    }),

    updatePlatform: builder.mutation<ApiResponse<TPlatform>, { id: string, form: TPlatformCreate, }>({
      query: ({ id, form }) => ({
        url: `/platform/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deletePlatform: builder.mutation<ApiResponse<TPlatform>, string>({
      query: (id: string) => ({
        url: `/platform/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlatformsMutation,
  useCreatePlatformMutation,
  useUpdatePlatformMutation,
  useDeletePlatformMutation
} = platformApi;