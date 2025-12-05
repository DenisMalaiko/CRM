import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {RootState} from "../index";
import {TUser} from "../../models/User";
import {TProduct} from "../../models/Product";

export const productsApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.mutation<ApiResponse<TProduct>, void>({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const state = api.getState() as RootState;
        const user: TUser | null = state.authModule.user;

        if (!user?.agencyId) {
          return { error: { status: 400, data: 'Missing businessId' } as any };
        }

        const result = await baseQuery({
          url: `/products/${user.agencyId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TProduct>
        };
      }
    }),

    createProduct: builder.mutation<ApiResponse<TProduct>, TProduct>({
      query: (form: TProduct) => ({
        url: `/products/create`,
        method: "POST",
        body: form,
      })
    }),

    updateProduct: builder.mutation<ApiResponse<TProduct>, { id: string, form: TProduct, }>({
      query: ({ id, form }) => ({
        url: `/products/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteProduct: builder.mutation<ApiResponse<TProduct>, string>({
      query: (id: string) => ({
        url: `/products/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productsApi;