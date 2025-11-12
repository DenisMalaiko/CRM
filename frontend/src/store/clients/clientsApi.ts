import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {TClient} from "../../models/Client";
import { RootState } from "../index";
import {TUser} from "../../models/User";

export const clientsApi = api.injectEndpoints({
  endpoints: builder => ({
    getClients: builder.mutation<ApiResponse<TClient>, void>({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const user: TUser | null = state.authModule.user;

        if (!user?.businessId) {
          return { error: { status: 400, data: 'Missing businessId' } as any };
        }

        const result = await baseQuery({
          url: `/clients/${user.businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TClient>
        };
      }
    }),

    createClient: builder.mutation<ApiResponse<TClient>, TClient>({
      query: (form: TClient) => ({
        url: `/clients/create`,
        method: "POST",
        body: JSON.stringify(form),
      })
    }),

    updateClient: builder.mutation<ApiResponse<TClient>, { id: string, form: TClient, }>({
      query: ({ id, form }) => ({
        url: `/clients/update/${id}`,
        method: "PATCH",
        body: JSON.stringify(form),
      })
    }),

    deleteClient: builder.mutation<ApiResponse<TClient>, string>({
      query: (id: string) => ({
        url: `/clients/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientsMutation,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation
} = clientsApi;