import { api } from "../api/api"
import {ApiResponse} from "../../models/ApiResponse";
import {TBusinessProfile, TBusinessProfileCreate} from "../../models/BusinessProfile";

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

  }),
  overrideExisting: false,
});

export const {
  useGetProfilesMutation,
  useCreateProfileMutation
} = profileApi;