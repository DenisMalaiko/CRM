import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate, TCompetitorPostParams, TCompetitorAdsParams, TCompetitorWithReport, TCompetitorInstagramReport, TCompetitorFacebookReport } from "../../models/Competitor";

export const competitorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompetitors: builder.mutation<ApiResponse<TCompetitorWithReport[]>, string>({
      queryFn: async (businessId, api, _extraOptions, baseQuery) => {
        if (!businessId) {
          return {
            error: { status: 400, data: "Missing businessId" } as any,
          };
        }

        const result = await baseQuery({
          url: `/competitors/list/${businessId}`,
          method: 'GET',
        });

        return {
          data: result.data as ApiResponse<TCompetitorWithReport[]>
        };
      }
    }),

    getCompetitor: builder.mutation<ApiResponse<TCompetitor>, string>({
      query: (id: string) => ({
        url: `/competitors/${id}`,
        method: "GET",
      })
    }),

    createCompetitor: builder.mutation<ApiResponse<TCompetitor>, TCompetitorCreate>({
      query: (form: TCompetitorCreate) => ({
        url: `/competitors`,
        method: "POST",
        body: form,
      })
    }),

    updateCompetitor: builder.mutation<ApiResponse<TCompetitor>, { id: string, form: TCompetitorUpdate }>({
      query: ({ id, form }) => ({
        url: `/competitors/${id}`,
        method: "PATCH",
        body: form,
      })
    }),

    deleteCompetitor: builder.mutation<ApiResponse<TCompetitor>, string>({
      query: (id: string) => ({
        url: `/competitors/${id}`,
        method: "DELETE",
      })
    }),

    fetchCompetitorInstagramReport: builder.mutation<ApiResponse<TCompetitorInstagramReport>, string>({
      query: (id: string) => ({
        url: `/competitors/instagramReport/${id}`,
        method: "POST",
      })
    }),

    fetchCompetitorFacebookReport: builder.mutation<ApiResponse<TCompetitorFacebookReport>, string>({
      query: (id: string) => ({
        url: `/competitors/facebookReport/${id}`,
        method: "POST",
      })
    }),


    // Fetch Posts
    fetchPosts: builder.mutation<ApiResponse<any>, { id: string, form: TCompetitorPostParams }>({
      query: ({ id, form }) => ({
        url: `/competitors/posts/${id}`,
        method: "POST",
        body: form,
      })
    }),

    getPosts: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/competitors/posts/${id}`,
        method: "GET",
      })
    }),


    // Instagram Posts
    fetchInstagramPosts: builder.mutation<ApiResponse<any>, { id: string, form: TCompetitorPostParams }>({
      query: ({ id, form }) => ({
        url: `/competitors/instagramPosts/${id}`,
        method: "POST",
        body: form,
      })
    }),

    getInstagramPosts: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/competitors/instagramPosts/${id}`,
        method: "GET",
      })
    }),


    // Instagram Reels
    fetchInstagramReels: builder.mutation<ApiResponse<any>, { id: string, form: TCompetitorPostParams }>({
      query: ({ id, form }) => ({
        url: `/competitors/instagramReels/${id}`,
        method: "POST",
        body: form,
      })
    }),

    getInstagramReels: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/competitors/instagramReels/${id}`,
        method: "GET",
      })
    }),


    // Fetch Ads
    fetchAds: builder.mutation<ApiResponse<any>, { id: string, form: TCompetitorAdsParams }>({
      query: ({ id, form }) => ({
        url: `/competitors/ads/${id}`,
        method: "POST",
        body: form
      })
    }),

    getAds: builder.mutation<ApiResponse<any>, string>({
      query: (id: string) => ({
        url: `/competitors/ads/${id}`,
        method: "GET",
      })
    }),


  }),
  overrideExisting: false,
});

export const {
  useGetCompetitorsMutation,
  useGetCompetitorMutation,
  useCreateCompetitorMutation,
  useUpdateCompetitorMutation,
  useDeleteCompetitorMutation,
  useFetchCompetitorInstagramReportMutation,
  useFetchCompetitorFacebookReportMutation,

  useGetPostsMutation,
  useFetchPostsMutation,

  useGetInstagramPostsMutation,
  useFetchInstagramPostsMutation,

  useGetInstagramReelsMutation,
  useFetchInstagramReelsMutation,

  useGetAdsMutation,
  useFetchAdsMutation,
} = competitorApi;