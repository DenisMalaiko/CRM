import { api } from "../../api/api";
import {ApiResponse} from "../../../models/ApiResponse";

export const managerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<ApiResponse<any>, any>({
      query: (body) => ({
        url: '/ai/manager/sessions/1/messages',
        method: 'POST',
        body
      })
    })
  }),
  overrideExisting: false
});

export const {
  useSendMessageMutation
} = managerApi;

