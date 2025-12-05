import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setAccessToken, logout } from '../auth/authSlice';

type RefreshResponse = {
  data: {
    accessToken: string;
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).authModule.accessToken ?? (getState() as RootState).adminModule.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn("Access token expired, trying refresh...")

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api, extraOptions
    );

    if (refreshResult.error) {
      console.error("Failed to refresh token, logging out...");
      api.dispatch(logout());
    }

    const refreshData = refreshResult?.data as RefreshResponse;
    const token: string = refreshData?.data?.accessToken;

    // TODO: If Admin Refresh Page
    if (token) {
      api.dispatch(setAccessToken(token));
      console.log("Token refreshed, retrying request...");
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};


export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});