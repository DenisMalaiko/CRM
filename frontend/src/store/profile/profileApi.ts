import { api } from "../api/api"
import {ApiResponse} from "../../models/ApiResponse";
import {TBusinessProfile, TBusinessProfileCreate} from "../../models/BusinessProfile";
import {TProduct, TProductCreate} from "../../models/Product";

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfiles: builder.mutation<ApiResponse<TBusinessProfile[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/profiles/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TBusinessProfile[]>
        };
      }
    }),

    createProfile: builder.mutation<ApiResponse<TBusinessProfile>, TBusinessProfileCreate>({
      query: (form: TBusinessProfileCreate) => ({
        url: `/profiles/create`,
        method: "POST",
        body: form,
      })
    }),

    updateProfile: builder.mutation<ApiResponse<TBusinessProfile>, { id: string, form: TBusinessProfileCreate, }>({
      query: ({ id, form }) => ({
        url: `/profiles/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteProfile: builder.mutation<ApiResponse<TBusinessProfile>, string>({
      query: (id: string) => ({
        url: `/profiles/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfilesMutation,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation
} = profileApi;