import { api } from "../api/api";
import {ApiResponse} from "../../models/ApiResponse";
import {TAgency} from "../../models/Agency";

export const agencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAgencyList: builder.mutation<ApiResponse<TAgency>, void>({
      query: () => ({
        url: '/agency',
        method: "GET"
      })
    }),

    getAgency: builder.mutation<ApiResponse<TAgency>, string>({
      query: (id: string) => ({
        url: `/agency/${id}`,
        method: "GET"
      })
    }),

    getUsersByAgencyId: builder.mutation<ApiResponse<TAgency>, string>({
      query: (id: string) => ({
        url: `/agency/users/${id}`,
        method: "GET"
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useGetAgencyListMutation,
  useGetAgencyMutation,
  useGetUsersByAgencyIdMutation,
} = agencyApi;