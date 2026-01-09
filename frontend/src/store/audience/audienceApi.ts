import {api} from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {TAudience, TAudienceCreate} from "../../models/Audience";

export const audienceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAudiences: builder.mutation<ApiResponse<TAudience[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/audience/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TAudience[]>
        };
      }
    }),

    createAudience: builder.mutation<ApiResponse<TAudience>, TAudienceCreate>({
      query: (form: TAudienceCreate) => ({
        url: `/audience/create`,
        method: "POST",
        body: form,
      })
    }),

    updateAudience: builder.mutation<ApiResponse<TAudience>, { id: string, form: TAudienceCreate, }>({
      query: ({ id, form }) => ({
        url: `/audience/update/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteAudience: builder.mutation<ApiResponse<TAudience>, string>({
      query: (id: string) => ({
        url: `/audience/delete/${id}`,
        method: "DELETE",
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAudiencesMutation,
  useCreateAudienceMutation,
  useUpdateAudienceMutation,
  useDeleteAudienceMutation
} = audienceApi;