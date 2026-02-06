import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TBusiness, TBusinessCreate } from "../../models/Business";
import { RootState } from "../index";
import { TUser } from "../../models/User";

export const businessesApi = api.injectEndpoints({
  endpoints: builder => ({
    getBusinesses: builder.mutation<ApiResponse<TBusiness[]>, string | void>({
      queryFn: async (agencyId, api, _extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const user: TUser | null = state.authModule.user;
        const id = user?.agencyId ?? agencyId;

        if (!id) {
          return { error: { status: 400, data: 'Missing businessId' } as any };
        }

        const result = await baseQuery({
          url: `/business/list/${id}`,
          method: 'GET',
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as ApiResponse<TBusiness[]>
        };
      }
    }),

    getBusiness: builder.mutation<ApiResponse<TBusiness>, string>({
      query: (id: string) => ({
        url: `/business/${id}`,
        method: "GET",
      })
    }),

    createBusiness: builder.mutation<ApiResponse<TBusiness>, TBusinessCreate>({
      query: (form: TBusiness) => ({
        url: `/business`,
        method: "POST",
        body: form,
      })
    }),

    updateBusiness: builder.mutation<ApiResponse<TBusiness>, { id: string, form: TBusinessCreate, }>({
      query: ({ id, form }) => ({
        url: `/business/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteBusiness: builder.mutation<ApiResponse<TBusiness>, string>({
      query: (id: string) => ({
        url: `/business/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBusinessesMutation,
  useGetBusinessMutation,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation
} = businessesApi;