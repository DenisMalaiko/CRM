import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {RootState} from "../index";
import {TUser} from "../../models/User";
import {TOrder} from "../../models/Order";

export const ordersApi = api.injectEndpoints({
  endpoints: builder => ({
    getOrders: builder.mutation<ApiResponse<TOrder>, void>({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const user: TUser | null = state.authModule.user;

        if (!user?.businessId) {
          return { error: { status: 400, data: 'Missing businessId' } as any };
        }

        const result = await baseQuery({
          url: `/orders/${user.businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TOrder>
        };
      }
    }),

    createOrder: builder.mutation<ApiResponse<TOrder>, TOrder>({
      query: (form: TOrder) => ({
        url: `/orders/create`,
        method: "POST",
        body: form,
      })
    }),

    updateOrder: builder.mutation<ApiResponse<TOrder>, { id: string, form: TOrder, }>({
      query: ({ id, form }) => ({
        url: `/orders/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteOrder: builder.mutation<ApiResponse<TOrder>, string>({
      query: (id: string) => ({
        url: `/orders/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersMutation,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation
} = ordersApi;