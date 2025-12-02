import { api } from "../../api/api";
import {ApiResponse} from "../../../models/ApiResponse";
import {TSession} from "../../../models/Session";

export const managerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: '/ai/manager/sessions/',
        method: 'POST'
      })
    }),

    getSessions: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: '/ai/manager/sessions/',
        method: 'GET'
      })
    }),

    getSession: builder.mutation<ApiResponse<any>, void>({
      query: (sessionId) => ({
        url: `/ai/manager/sessions/${sessionId}`,
        method: 'GET'
      })
    }),

    deleteSession: builder.mutation<ApiResponse<any>, any>({
      query: (sessionId) => ({
        url: `/ai/manager/sessions/${sessionId}`,
        method: 'DELETE'
      })
    }),

    sendMessage: builder.mutation<ApiResponse<any>, any>({
      query: (body) => ({
        url: `/ai/manager/sessions/${body.sessionId}/messages`,
        method: 'POST',
        body
      })
    }),

    getMessages: builder.mutation<ApiResponse<any>, void>({
      query: (sessionId) => ({
        url: `/ai/manager/sessions/${sessionId}/messages`,
        method: 'GET'
      })
    }),
  }),
  overrideExisting: false
});

export const {
  useSendMessageMutation,
  useCreateSessionMutation,
  useGetSessionsMutation,
  useDeleteSessionMutation,
  useGetSessionMutation,
  useGetMessagesMutation
} = managerApi;

