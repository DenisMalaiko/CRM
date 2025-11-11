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
  }),
  overrideExisting: false,
});

export const {
  useSignUpUserMutation,
  useSignInUserMutation,
  useSignOutUserMutation
} = authApi;