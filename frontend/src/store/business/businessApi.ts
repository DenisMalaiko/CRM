import { api } from "../api/api";
import {getBusinessList} from "./businessThunks";
import {ApiResponse} from "../../models/ApiResponse";
import {TBusiness} from "../../models/Business";
import {BaseQueryArg} from "@reduxjs/toolkit/query";

export const businessApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessList: builder.mutation<ApiResponse<TBusiness>, void>({
      query: () => ({
        url: '/business',
        method: "GET"
      })
    }),

    getBusiness: builder.mutation<ApiResponse<TBusiness>, string>({
      query: (id: string) => ({
        url: `/business/${id}`,
        method: "GET"
      })
    }),

    getUsersByBusinessId: builder.mutation<ApiResponse<TBusiness>, string>({
      query: (id: string) => ({
        url: `/business/users/${id}`,
        method: "GET"
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useGetBusinessListMutation,
  useGetBusinessMutation,
  useGetUsersByBusinessIdMutation,
} = businessApi;