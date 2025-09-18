import { createAsyncThunk } from "@reduxjs/toolkit";
import { TUser } from "../../models/User";
import { TUserSignUp, TUserSignIn } from "../../models/User";
import { ApiResponse } from "../../models/ApiResponse";
import { buildError } from "../../utils/apiError";

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (credentials: TUserSignUp, { rejectWithValue }
  ) => {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      const res = await fetch(`${API_URL}/auth/signUp`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
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
  async (credentials: TUserSignIn, { rejectWithValue }
  )=> {
    const API_URL: string | undefined = process.env.REACT_APP_API;

    try {
      console.log("Credentials ", credentials);


      const res = await fetch(`${API_URL}/auth/signIn`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(credentials),
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
)