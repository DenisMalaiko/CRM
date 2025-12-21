import { api } from "../api/api";
import {TUser, TUserSignIn } from "../../models/User";
import {ApiResponse} from "../../models/ApiResponse";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signInAdmin: builder.mutation<ApiResponse<TUserSignIn>, any>({
      query: (body) => ({
        url: '/admin/signIn',
        method: 'POST',
        body,
      })
    }),
    signUpAdmin: builder.mutation<ApiResponse<TUser>, any>({
      query: (body) => ({
        url: '/admin/signUp',
        method: 'POST',
        body,
      })
    }),
    signOutAdmin: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/admin/signOut',
        method: 'POST',
      })
    })
  }),

  overrideExisting: false,
});

export const {
  useSignUpAdminMutation,
  useSignInAdminMutation,
  useSignOutAdminMutation
} = adminApi;