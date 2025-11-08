import { createAsyncThunk } from "@reduxjs/toolkit";
import { TUser, TSignUpPayload, TUserSignIn } from "../../models/User";
import { TBusiness } from "../../models/Business";
import { ApiResponse } from "../../models/ApiResponse";
import { buildError } from "../../utils/apiError";

export const signUpUser = createAsyncThunk<
  ApiResponse<TUser>,
  TSignUpPayload,
  { rejectValue: ApiResponse<null> }
>(
  'auth/signUpUser',
  async ({ user, business }: TSignUpPayload, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/auth/signUp`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user: user,
          business: business,
        }),
      });

      const data: ApiResponse<TUser> = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
);

export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async (credentials: TUserSignIn, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/auth/signIn`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/auth/signOut`, {
        method: "POST",
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(buildError(data.message, data.statusCode, data.error));
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(buildError(err.message, err.statusCode, err.error));
    }
  }
)