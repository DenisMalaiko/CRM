import { api } from "../api/api";
import { ApiResponse } from "../../models/ApiResponse";
import { TAdmin, TAdminCreate, TAdminSignIn } from "../../models/Admin";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signInAdmin: builder.mutation<ApiResponse<TAdminSignIn>, any>({
      query: (body) => ({
        url: '/admin/signIn',
        method: 'POST',
        body,
      })
    }),
    signUpAdmin: builder.mutation<ApiResponse<TAdmin>, TAdminCreate>({
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