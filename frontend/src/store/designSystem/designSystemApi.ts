import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TDesignSystem } from "../../models/DesignSystem";

export const designSystemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDesignSystemPresets: builder.query<ApiResponse<TDesignSystem[]>, void>({
      query: () => ({
        url: "/design-systems/presets",
        method: "GET",
      }),
    }),

    getBusinessDesignSystems: builder.query<
      ApiResponse<TDesignSystem[]>,
      string
    >({
      query: (businessId) => ({
        url: `/design-systems/business/${businessId}`,
        method: "GET",
      }),
    }),

    getDesignSystem: builder.query<ApiResponse<TDesignSystem>, string>({
      query: (id) => ({
        url: `/design-systems/${id}`,
        method: "GET",
      }),
    }),

    createDesignSystem: builder.mutation<
      ApiResponse<TDesignSystem>,
      Partial<TDesignSystem> & { name: string; businessId: string }
    >({
      query: (body) => ({
        url: "/design-systems",
        method: "POST",
        body,
      }),
    }),

    duplicateDesignSystem: builder.mutation<
      ApiResponse<TDesignSystem>,
      { id: string; businessId: string }
    >({
      query: ({ id, businessId }) => ({
        url: `/design-systems/duplicate/${id}`,
        method: "POST",
        body: { businessId },
      }),
    }),

    updateDesignSystem: builder.mutation<
      ApiResponse<TDesignSystem>,
      { id: string; data: Partial<TDesignSystem> }
    >({
      query: ({ id, data }) => ({
        url: `/design-systems/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteDesignSystem: builder.mutation<
      ApiResponse<TDesignSystem>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/design-systems/${id}`,
        method: "DELETE",
      }),
    }),

    createDesignSystemFromPhoto: builder.mutation<
      ApiResponse<TDesignSystem>,
      FormData
    >({
      query: (formData) => ({
        url: "/design-systems/from-photo",
        method: "POST",
        body: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetDesignSystemPresetsQuery,
  useLazyGetBusinessDesignSystemsQuery,
  useLazyGetDesignSystemQuery,
  useCreateDesignSystemMutation,
  useDuplicateDesignSystemMutation,
  useUpdateDesignSystemMutation,
  useDeleteDesignSystemMutation,
  useCreateDesignSystemFromPhotoMutation,
} = designSystemApi;
