import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {TProduct, TProductCreate} from "../../models/Product";

export const productsApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.mutation<ApiResponse<TProduct[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/products/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TProduct[]>
        };
      }
    }),

    createProduct: builder.mutation<ApiResponse<TProduct>, TProductCreate>({
      query: (form: TProductCreate) => ({
        url: `/products/create`,
        method: "POST",
        body: form,
      })
    }),

    updateProduct: builder.mutation<ApiResponse<TProduct>, { id: string, form: TProductCreate, }>({
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