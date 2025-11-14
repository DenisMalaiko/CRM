import { api } from '../api/api';
import { ApiResponse } from '../../models/ApiResponse';
import { TUser, TSignUpPayload, TUserSignIn } from '../../models/User';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signUpUser: builder.mutation<ApiResponse<TUser>, TSignUpPayload>({
      query: (body) => ({
        url: '/auth/signUp',
        method: 'POST',
        body,
      }),
    }),
    signInUser: builder.mutation<ApiResponse<any>, TUserSignIn>({
      query: (credentials) => ({
        url: '/auth/signIn',
        method: 'POST',
        body: credentials,
      }),
    }),
    signOutUser: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/signOut',
        method: 'POST',
      }),
    }),
    signInByToken: builder.mutation<ApiResponse<any>, string>({
      query: (token: string) => ({
        url: '/auth/me',
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  }),
  overrideExisting: false,
});

export const {
  useSignUpUserMutation,
  useSignInUserMutation,
  useSignOutUserMutation,
  useSignInByTokenMutation
} = authApi;